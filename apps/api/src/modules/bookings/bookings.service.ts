import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import type { Booking, BookingLiveStatus, BookingMessage, BookingStatus, CreateBookingRequest, CreateBookingResponse, Paginated, UpdateBookingRequest } from '@ridean/shared';
import { promoDiscount, promoPercent } from '../../common/promo';
import { BUSINESS_CLASSES, BusinessService } from '../business/business.module';
import { bookingReference } from '../../common/reference';
import { InjectDb, type Db } from '../../db/db.module';
import { bookingMessages, bookings, payments, suppliers, walletTransactions, type BookingRow, type SupplierRow } from '../../db/schema';
import { SupplierRegistry } from '../../integrations/integrations.module';
import { LedgerService } from '../ledger/ledger.service';
import { PaymentsService } from '../payments/payments.service';
import { QuotesService } from '../quotes/quotes.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { PlatformService } from '../platform/platform.service';

const CANCELLABLE: BookingStatus[] = ['pending_payment', 'payment_authorised', 'confirmed', 'driver_assigned'];

@Injectable()
export class BookingsService {
  private readonly log = new Logger(BookingsService.name);

  constructor(
    @InjectDb() private readonly db: Db,
    private readonly quotes: QuotesService,
    private readonly suppliersSvc: SuppliersService,
    private readonly registry: SupplierRegistry,
    private readonly paymentsSvc: PaymentsService,
    private readonly ledger: LedgerService,
    private readonly business: BusinessService,
    private readonly platform: PlatformService,
  ) {}

  /**
   * Booking flow
   *  1. Ridean collects (corporate_card / ach_debit): authorise the card (or spend wallet), book with the
   *     supplier once the authorisation succeeds (webhook or simulated), capture, write the ledger.
   *  2. Supplier collects: book with the supplier straight away; the supplier charges the customer
   *     (optionally via its hosted payment page) and owes Ridean commission + markup.
   */
  async create(userId: string, input: CreateBookingRequest, opts: { byStaff?: boolean; invoice?: boolean } = {}): Promise<CreateBookingResponse> {
    await this.platform.assertTakingBookings();
    const { row: quote, supplier } = await this.quotes.getBookable(input.quoteId);
    // Operations staff book on behalf of a customer with a quote they searched themselves.
    if (!opts.byStaff && quote.userId && quote.userId !== userId) throw new ForbiddenException('This quote belongs to another account');
    const already = await this.db.select({ id: bookings.id }).from(bookings).where(and(eq(bookings.quoteId, quote.id), eq(bookings.userId, userId)));
    if (already.length) throw new ConflictException('This quote has already been booked');

    const req = quote.request;
    const p = quote.price;
    const ridenCollects = supplier.paymentFlow !== 'supplier_collects';

    // Promo and tip only apply when Ridean takes the payment (we can't change what a supplier charges).
    const pct = ridenCollects ? promoPercent(input.promoCode) : 0;
    if (input.promoCode && ridenCollects && !pct) throw new BadRequestException('That promo code is not valid');
    const discount = promoDiscount(p.customerPrice, p.earnings, pct);
    const tip = ridenCollects ? Math.max(0, Math.min(input.tip ?? 0, Math.round(p.customerPrice * 0.5))) : 0;
    const customerPrice = p.customerPrice - discount + tip;

    let businessAccountId: string | undefined;
    let notes = input.notes?.trim() || undefined;
    if (input.payWithBusiness) {
      if (!ridenCollects) throw new BadRequestException('This partner takes payment directly, so it cannot be billed to a business account');
      const mem = await this.business.membership(userId);
      if (!mem) throw new BadRequestException('You are not a member of a Ridean Business account');
      if (mem.policy.requirePurpose && !input.tripPurpose?.trim()) throw new BadRequestException('Your company asks for a trip purpose on business bookings');
      if (mem.policy.businessClassOnly && !BUSINESS_CLASSES.includes(quote.vehicle.class)) throw new BadRequestException('Your company policy allows Business class and above only');
      if (mem.policy.approvalOver > 0 && customerPrice > mem.policy.approvalOver && mem.role !== 'admin') {
        throw new BadRequestException(`Trips over ${(mem.policy.approvalOver / 100).toFixed(2)} ${p.currency} need an account admin — ask them to book it for you`);
      }
      businessAccountId = mem.accountId;
      if (input.tripPurpose?.trim()) notes = [notes, `Trip purpose: ${input.tripPurpose.trim()}`].filter(Boolean).join('\n');
    }

    const invoice = !!opts.invoice && ridenCollects;
    const paymentMethod = !ridenCollects ? 'supplier' : invoice ? 'invoice' : input.payWithBusiness ? 'business' : input.payWithWallet ? 'wallet' : 'card';
    const [b] = await this.db
      .insert(bookings)
      .values({
        reference: bookingReference(),
        userId,
        quoteId: quote.id,
        service: quote.service,
        status: 'pending_payment',
        supplierId: supplier.id,
        pickup: req.pickup,
        dropoff: req.dropoff ?? req.returnLocation,
        pickupAt: req.pickupAt ? new Date(req.pickupAt) : req.rentalPickupAt ? new Date(req.rentalPickupAt) : null,
        tripType: req.tripType,
        returnAt: req.returnAt ? new Date(req.returnAt) : req.rentalReturnAt ? new Date(req.rentalReturnAt) : null,
        flightNumber: input.flightNumber ?? req.flightNumber,
        passengers: req.passengers,
        luggage: req.luggage,
        passenger: input.passenger,
        vehicle: quote.vehicle,
        currency: p.currency,
        supplierPrice: p.supplierPrice,
        commission: p.commission,
        markup: p.markup,
        customerPrice,
        earnings: p.earnings - discount,
        supplierPayable: p.supplierPayable + tip,
        tip,
        discount,
        promoCode: discount ? input.promoCode!.trim().toUpperCase() : null,
        paymentFlow: supplier.paymentFlow,
        paymentMethod,
        businessAccountId,
        notes,
      })
      .returning();

    if (supplier.paymentFlow === 'supplier_collects') {
      const result = await this.bookWithSupplier(b, supplier);
      return { booking: this.toBooking(result.booking, supplier), supplierPaymentUrl: result.paymentUrl };
    }

    if (invoice) {
      // Booked by operations; the customer is invoiced outside the app, so the payment stays pending until finance marks it paid.
      await this.db.insert(payments).values({ bookingId: b.id, userId, provider: 'invoice', kind: 'charge', amount: customerPrice, currency: p.currency, status: 'pending' });
      await this.db.update(bookings).set({ status: 'payment_authorised' }).where(eq(bookings.id, b.id));
      const done = await this.bookWithSupplier({ ...b, status: 'payment_authorised' }, supplier);
      return { booking: this.toBooking(done.booking, supplier) };
    }

    if (businessAccountId) {
      // Billed to the company on its monthly invoice
      await this.db.insert(payments).values({ bookingId: b.id, userId, provider: 'business_invoice', kind: 'charge', amount: customerPrice, currency: p.currency, status: 'succeeded' });
      await this.db.update(bookings).set({ status: 'payment_authorised' }).where(eq(bookings.id, b.id));
      const done = await this.bookWithSupplier({ ...b, status: 'payment_authorised' }, supplier);
      return { booking: this.toBooking(done.booking, supplier) };
    }

    if (input.payWithWallet) {
      const balance = await this.walletBalance(userId);
      if (balance < customerPrice) {
        await this.db.delete(bookings).where(eq(bookings.id, b.id));
        throw new BadRequestException('Not enough wallet balance');
      }
      await this.db.insert(walletTransactions).values({ userId, amount: -customerPrice, currency: p.currency, description: `Booking ${b.reference}`, reference: b.reference });
      await this.db.insert(payments).values({ bookingId: b.id, userId, provider: 'wallet', kind: 'wallet_spend', amount: customerPrice, currency: p.currency, status: 'succeeded' });
      await this.db.update(bookings).set({ paidWithWallet: true, status: 'payment_authorised' }).where(eq(bookings.id, b.id));
      const done = await this.bookWithSupplier({ ...b, paidWithWallet: true }, supplier);
      return { booking: this.toBooking(done.booking, supplier) };
    }

    const intent = await this.paymentsSvc.authorise({ userId, amount: customerPrice, currency: p.currency, bookingId: b.id, reference: b.reference, paymentMethodId: input.paymentMethodId });
    await this.db.update(bookings).set({ stripePaymentIntentId: intent.id }).where(eq(bookings.id, b.id));
    await this.db.insert(payments).values({ bookingId: b.id, userId, provider: this.paymentsSvc.simulated ? 'simulated' : 'stripe', providerRef: intent.id, kind: 'charge', amount: customerPrice, currency: p.currency, status: intent.status });

    // Simulated payments, or a saved card that needed no 3-D Secure, are already authorised
    if (intent.status === 'requires_capture') {
      const done = await this.onPaymentAuthorised(b.id);
      return { booking: done, clientSecret: this.paymentsSvc.simulated ? undefined : intent.clientSecret };
    }
    return { booking: this.toBooking({ ...b, stripePaymentIntentId: intent.id }, supplier), clientSecret: intent.clientSecret };
  }

  /** Called by the Stripe webhook (amount_capturable_updated) or directly when already authorised. */
  async onPaymentAuthorised(bookingId: string): Promise<Booking> {
    const b = await this.row(bookingId);
    const supplier = await this.suppliersSvc.get(b.supplierId);
    if (b.status !== 'pending_payment') return this.toBooking(b, supplier); // idempotent
    await this.db.update(bookings).set({ status: 'payment_authorised', updatedAt: new Date() }).where(eq(bookings.id, b.id));
    const res = await this.bookWithSupplier({ ...b, status: 'payment_authorised' }, supplier);
    return this.toBooking(res.booking, supplier);
  }

  private async bookWithSupplier(b: BookingRow, supplier: SupplierRow): Promise<{ booking: BookingRow; paymentUrl?: string }> {
    const quote = b.quoteId ? (await this.quotes.get(b.quoteId)).row : undefined;
    try {
      const result = await this.registry.get(supplier.adapter).book(
        {
          offerId: quote?.supplierOfferId ?? '',
          offerMeta: ((quote?.meta as Record<string, unknown>)?.offer as Record<string, unknown>) ?? {},
          request: quote!.request,
          passenger: b.passenger,
          flightNumber: b.flightNumber ?? undefined,
          notes: b.notes ?? undefined,
          ourReference: b.reference,
          expectedPrice: b.supplierPrice,
          currency: b.currency,
        },
        this.registry.context(supplier, b.currency),
      );

      if (result.finalPrice !== undefined && result.finalPrice > b.supplierPrice * 1.02) {
        // Supplier price rose by more than 2% — do not charge the customer more than they agreed to.
        this.log.warn(`Price change on ${b.reference}: ${b.supplierPrice} → ${result.finalPrice}`);
      }

      const status: BookingStatus = result.status === 'pending_payment' ? 'pending_payment' : result.status;
      const [updated] = await this.db
        .update(bookings)
        .set({ status, supplierReference: result.supplierReference, supplierMeta: result.meta ?? {}, updatedAt: new Date() })
        .where(eq(bookings.id, b.id))
        .returning();

      if (b.stripePaymentIntentId) await this.paymentsSvc.capture(b.stripePaymentIntentId);
      if (b.stripePaymentIntentId) await this.db.update(payments).set({ status: 'succeeded' }).where(eq(payments.providerRef, b.stripePaymentIntentId));
      const settledAtBooking = supplier.paymentFlow === 'corporate_card' && supplier.settlementCycle === 'per_booking';
      await this.ledger.onBookingConfirmed(updated, settledAtBooking);
      return { booking: updated, paymentUrl: result.paymentUrl };
    } catch (e) {
      this.log.error(`Supplier booking failed for ${b.reference}: ${(e as Error).message}`);
      if (b.stripePaymentIntentId) await this.paymentsSvc.cancelAuthorisation(b.stripePaymentIntentId).catch(() => undefined);
      if (b.paidWithWallet) {
        await this.db.insert(walletTransactions).values({ userId: b.userId, amount: b.customerPrice, currency: b.currency, description: `Refund · ${b.reference} could not be confirmed`, reference: b.reference });
      }
      const [failed] = await this.db.update(bookings).set({ status: 'failed', updatedAt: new Date() }).where(eq(bookings.id, b.id)).returning();
      return { booking: failed };
    }
  }

  async cancel(userId: string | null, id: string, reason?: string): Promise<Booking> {
    const b = await this.row(id);
    if (userId && b.userId !== userId) throw new NotFoundException('Booking not found');
    if (!CANCELLABLE.includes(b.status as BookingStatus)) throw new BadRequestException('This booking can no longer be cancelled');
    const supplier = await this.suppliersSvc.get(b.supplierId);
    let fee = 0;
    if (b.supplierReference) {
      const r = await this.registry.get(supplier.adapter).cancel(b.supplierReference, this.registry.context(supplier, b.currency));
      if (!r.cancelled) throw new BadRequestException('The supplier could not cancel this booking. Please contact support.');
      fee = r.fee ?? 0;
    }
    const refundable = Math.max(0, b.customerPrice - fee);
    if (b.stripePaymentIntentId) {
      if (b.status === 'pending_payment' || b.status === 'payment_authorised') await this.paymentsSvc.cancelAuthorisation(b.stripePaymentIntentId).catch(() => undefined);
      else await this.paymentsSvc.refund(b.stripePaymentIntentId, refundable);
      await this.db.insert(payments).values({ bookingId: b.id, userId: b.userId, provider: 'stripe', providerRef: b.stripePaymentIntentId, kind: 'refund', amount: refundable, currency: b.currency, status: 'succeeded' });
    } else if (b.paymentMethod === 'business') {
      await this.db.insert(payments).values({ bookingId: b.id, userId: b.userId, provider: 'business_invoice', kind: 'refund', amount: refundable, currency: b.currency, status: 'succeeded' });
    } else if (b.paidWithWallet) {
      await this.db.insert(walletTransactions).values({ userId: b.userId, amount: refundable, currency: b.currency, description: `Refund · ${b.reference} cancelled`, reference: b.reference });
    }
    if (b.supplierReference) await this.ledger.onBookingCancelled(b, fee);
    const [updated] = await this.db.update(bookings).set({ status: 'cancelled', cancelReason: reason, updatedAt: new Date() }).where(eq(bookings.id, b.id)).returning();
    return this.toBooking(updated, supplier);
  }

  /**
   * Change time, flight, passengers, notes or passenger contact. Allowed up to 1 hour before pickup.
   * Route changes are not supported: the price depends on the route, so the customer rebooks.
   */
  async update(userId: string, id: string, input: UpdateBookingRequest): Promise<Booking> {
    const b = await this.row(id);
    if (b.userId !== userId) throw new NotFoundException('Booking not found');
    if (!['confirmed', 'driver_assigned'].includes(b.status)) throw new BadRequestException('This booking can no longer be changed');
    if (b.pickupAt && b.pickupAt.getTime() - Date.now() < 60 * 60_000) throw new BadRequestException('Changes close 1 hour before pickup — please contact support');
    if (input.pickupAt && new Date(input.pickupAt).getTime() < Date.now() + 60 * 60_000) throw new BadRequestException('Choose a pickup time at least 1 hour from now');
    const supplier = await this.suppliersSvc.get(b.supplierId);
    if (b.supplierReference) {
      const r = await this.registry.get(supplier.adapter).amend?.(b.supplierReference, input, this.registry.context(supplier, b.currency));
      if (r && !r.amended) throw new BadRequestException('The partner could not make this change. Please contact support.');
    }
    const [updated] = await this.db
      .update(bookings)
      .set({
        pickupAt: input.pickupAt ? new Date(input.pickupAt) : b.pickupAt,
        flightNumber: input.flightNumber !== undefined ? input.flightNumber || null : b.flightNumber,
        passengers: input.passengers ?? b.passengers,
        luggage: input.luggage ?? b.luggage,
        notes: input.notes !== undefined ? input.notes || null : b.notes,
        passenger: input.passenger ? { ...b.passenger, ...input.passenger } : b.passenger,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, b.id))
      .returning();
    return this.toBooking(updated, supplier);
  }

  /** Live trip status: our booking state plus chauffeur details from the supplier when available. */
  async liveStatus(userId: string | null, id: string): Promise<BookingLiveStatus> {
    const b = await this.row(id);
    if (userId && b.userId !== userId) throw new NotFoundException('Booking not found');
    const supplier = await this.suppliersSvc.get(b.supplierId);
    const adapter = this.registry.get(supplier.adapter);
    const ctx = this.registry.context(supplier, b.currency);
    let status = b.status as BookingStatus;
    let driver: BookingLiveStatus['driver'];
    let etaMinutes: number | undefined;
    if (b.supplierReference && ['confirmed', 'driver_assigned', 'in_progress'].includes(status)) {
      try {
        const s = await adapter.status!(b.supplierReference, ctx);
        if (['driver_assigned', 'in_progress', 'completed'].includes(s.status)) status = s.status;
        if (s.driver) {
          driver = { name: s.driver.name, phone: s.driver.phone, vehicle: s.driver.vehicle, plate: s.driver.plate, rating: s.driver.rating };
          // Remember the chauffeur so operations can see who drove which trip.
          const known = (b.supplierMeta as { driver?: { name?: string; plate?: string } }).driver;
          if (!known || known.name !== driver.name || known.plate !== driver.plate) {
            await this.db.update(bookings).set({ supplierMeta: { ...b.supplierMeta, driver } }).where(eq(bookings.id, b.id));
          }
        }
        etaMinutes = s.etaMinutes;
        if (status !== b.status) await this.db.update(bookings).set({ status, updatedAt: new Date() }).where(eq(bookings.id, b.id));
      } catch (e) {
        this.log.warn(`Status check failed for ${b.reference}: ${(e as Error).message}`);
      }
    }
    const order = ['confirmed', 'driver_assigned', 'in_progress', 'completed'];
    const at = order.indexOf(status);
    const events: BookingLiveStatus['events'] =
      status === 'cancelled' || status === 'failed'
        ? [{ key: 'cancelled', label: status === 'failed' ? 'Booking could not be confirmed' : 'Booking cancelled', at: b.updatedAt.toISOString(), done: true }]
        : [
            { key: 'confirmed', label: 'Booking confirmed', at: at >= 0 ? b.createdAt.toISOString() : undefined, done: at >= 0 },
            { key: 'driver_assigned', label: 'Chauffeur assigned', done: at >= 1 },
            { key: 'in_progress', label: 'On the way', done: at >= 2 },
            { key: 'completed', label: 'Trip complete', done: at >= 3 },
          ];
    return { status, driver, etaMinutes, events, messaging: !!b.supplierReference && !!adapter.supportsMessaging?.(ctx) };
  }

  async messages(userId: string, id: string): Promise<BookingMessage[]> {
    const b = await this.row(id);
    if (b.userId !== userId) throw new NotFoundException('Booking not found');
    const rows = await this.db.select().from(bookingMessages).where(eq(bookingMessages.bookingId, id)).orderBy(bookingMessages.createdAt);
    return rows.map((m) => ({ id: m.id, sender: m.sender, body: m.body, createdAt: m.createdAt.toISOString() }));
  }

  async sendMessage(userId: string, id: string, body: string): Promise<BookingMessage> {
    const b = await this.row(id);
    if (b.userId !== userId) throw new NotFoundException('Booking not found');
    if (!['confirmed', 'driver_assigned', 'in_progress'].includes(b.status) || !b.supplierReference) throw new BadRequestException('Messaging is only available for upcoming trips');
    const supplier = await this.suppliersSvc.get(b.supplierId);
    const r = await this.registry.get(supplier.adapter).message!(b.supplierReference, body, this.registry.context(supplier, b.currency));
    if (!r.delivered) throw new BadRequestException('Messaging is not available for this trip — please call your chauffeur');
    const [m] = await this.db.insert(bookingMessages).values({ bookingId: id, sender: 'customer', body }).returning();
    return { id: m.id, sender: m.sender, body: m.body, createdAt: m.createdAt.toISOString() };
  }

  async listForUser(userId: string, opts: { status?: string; page?: number }): Promise<Paginated<Booking>> {
    return this.list({ userId, status: opts.status, page: opts.page });
  }

  async list(f: { userId?: string; status?: string; service?: string; supplierId?: string; q?: string; from?: Date; to?: Date; page?: number; pageSize?: number }): Promise<Paginated<Booking>> {
    const page = Math.max(1, f.page ?? 1);
    const pageSize = Math.min(100, f.pageSize ?? 20);
    const conds = [
      f.userId ? eq(bookings.userId, f.userId) : undefined,
      f.status ? eq(bookings.status, f.status) : undefined,
      f.service ? eq(bookings.service, f.service) : undefined,
      f.supplierId ? eq(bookings.supplierId, f.supplierId) : undefined,
      f.from ? sql`${bookings.createdAt} >= ${f.from}` : undefined,
      f.to ? sql`${bookings.createdAt} < ${f.to}` : undefined,
      f.q ? sql`(${bookings.reference} ILIKE ${'%' + f.q + '%'} OR ${bookings.passenger}->>'lastName' ILIKE ${'%' + f.q + '%'} OR ${bookings.passenger}->>'email' ILIKE ${'%' + f.q + '%'})` : undefined,
    ].filter(Boolean);
    const where = conds.length ? and(...(conds as ReturnType<typeof eq>[])) : undefined;
    const [{ total }] = await this.db.select({ total: count() }).from(bookings).where(where);
    const rows = await this.db
      .select({ b: bookings, s: suppliers })
      .from(bookings)
      .innerJoin(suppliers, eq(bookings.supplierId, suppliers.id))
      .where(where)
      .orderBy(desc(bookings.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    return { items: rows.map((r) => this.toBooking(r.b, r.s)), total: Number(total), page, pageSize };
  }

  async getForUser(userId: string | null, id: string): Promise<Booking> {
    const b = await this.row(id);
    if (userId && b.userId !== userId) throw new NotFoundException('Booking not found');
    return this.toBooking(b, await this.suppliersSvc.get(b.supplierId));
  }

  async setStatus(id: string, status: BookingStatus): Promise<Booking> {
    const [b] = await this.db.update(bookings).set({ status, updatedAt: new Date() }).where(eq(bookings.id, id)).returning();
    if (!b) throw new NotFoundException('Booking not found');
    return this.toBooking(b, await this.suppliersSvc.get(b.supplierId));
  }

  async findByPaymentIntent(piId: string): Promise<BookingRow | undefined> {
    const [b] = await this.db.select().from(bookings).where(eq(bookings.stripePaymentIntentId, piId));
    return b;
  }

  async markFailed(id: string) {
    await this.db.update(bookings).set({ status: 'failed', updatedAt: new Date() }).where(eq(bookings.id, id));
  }

  private async walletBalance(userId: string): Promise<number> {
    const [r] = await this.db.select({ v: sql<string>`coalesce(sum(${walletTransactions.amount}),0)` }).from(walletTransactions).where(eq(walletTransactions.userId, userId));
    return Number(r?.v ?? 0);
  }

  private async row(id: string): Promise<BookingRow> {
    const [b] = await this.db.select().from(bookings).where(eq(bookings.id, id));
    if (!b) throw new NotFoundException('Booking not found');
    return b;
  }

  toBooking(b: BookingRow, s: SupplierRow): Booking {
    return {
      id: b.id,
      reference: b.reference,
      service: b.service,
      status: b.status as BookingStatus,
      supplierId: s.id,
      supplierName: s.name,
      supplierReference: b.supplierReference ?? undefined,
      pickup: b.pickup,
      dropoff: b.dropoff ?? undefined,
      pickupAt: b.pickupAt?.toISOString(),
      tripType: (b.tripType as Booking['tripType']) ?? undefined,
      returnAt: b.returnAt?.toISOString(),
      flightNumber: b.flightNumber ?? undefined,
      passenger: b.passenger,
      vehicle: b.vehicle,
      paymentFlow: b.paymentFlow as Booking['paymentFlow'],
      paymentMethod: b.paymentMethod as Booking['paymentMethod'],
      passengers: b.passengers ?? undefined,
      luggage: b.luggage ?? undefined,
      tip: b.tip,
      discount: b.discount,
      promoCode: b.promoCode ?? undefined,
      notes: b.notes ?? undefined,
      cancelReason: b.cancelReason ?? undefined,
      price: {
        currency: b.currency,
        supplierPrice: b.supplierPrice,
        commission: b.commission,
        markup: b.markup,
        customerPrice: b.customerPrice,
        earnings: b.earnings,
        supplierPayable: b.supplierPayable,
        collectedBy: b.paymentFlow === 'supplier_collects' ? 'supplier' : 'ridean',
        owedToSupplier: b.paymentFlow === 'supplier_collects' ? 0 : b.supplierPayable,
        owedToRidean: b.paymentFlow === 'supplier_collects' ? b.earnings : 0,
      },
      createdAt: b.createdAt.toISOString(),
    };
  }
}
