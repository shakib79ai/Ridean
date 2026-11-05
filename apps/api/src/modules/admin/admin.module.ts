import { BadRequestException, Body, Controller, Get, Header, Module, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { and, count, desc, eq, ilike, inArray, isNull, ne, or, sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import type { AdminCreateBookingRequest, AdminDashboard, AdminDriver, AdminUsersResponse, BookingStatus, PlatformSettings, TeamMember } from '@ridean/shared';
import { CurrentUser, Roles, type AuthUser } from '../../common/auth';
import { ZodPipe } from '../../common/zod.pipe';
import { InjectDb, type Db } from '../../db/db.module';
import { bookingMessages, bookings, contactMessages, suppliers, users, walletTransactions } from '../../db/schema';
import { PlatformService } from '../platform/platform.service';
import { toUser } from '../auth/auth.module';
import { BookingsModule } from '../bookings/bookings.module';
import { BookingsService } from '../bookings/bookings.service';
import { LedgerService } from '../ledger/ledger.service';
import { ReportsService } from '../reports/reports.service';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { SuppliersService, toSupplier } from '../suppliers/suppliers.service';

const Terms = z.object({
  inventoryType: z.enum(['net', 'gross']),
  commissionPct: z.number().min(0).max(100),
  markupType: z.enum(['percent', 'fixed']),
  markupValue: z.number().min(0),
  paymentFlow: z.enum(['corporate_card', 'ach_debit', 'supplier_collects']),
  settlementCycle: z.enum(['per_booking', 'weekly', 'monthly']),
  paymentTerms: z.string().max(100).optional(),
});
const SupplierSchema = z.object({
  code: z.string().regex(/^[a-z0-9_]{2,30}$/).optional(),
  name: z.string().min(1).max(120).optional(),
  adapter: z.string().min(2).max(40).optional(),
  services: z.array(z.string().min(2).max(40)).optional(),
  active: z.boolean().optional(),
  contactEmail: z.string().email().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  terms: Terms.partial().optional(),
});
const PaymentSchema = z.object({
  amount: z.number().int().positive(),
  direction: z.enum(['paid_to_supplier', 'received_from_supplier']),
  reference: z.string().min(1).max(60),
  method: z.string().min(1).max(60),
  note: z.string().max(200).optional(),
});
const AdjustmentSchema = z.object({ debit: z.number().int().min(0), credit: z.number().int().min(0), reference: z.string().min(1).max(60), description: z.string().min(1).max(200) });
const CreateForCustomerSchema = z.object({
  quoteId: z.string().uuid(),
  customer: z.object({ firstName: z.string().min(1).max(80), lastName: z.string().min(1).max(80), email: z.string().email(), phone: z.string().min(5).max(32) }),
  flightNumber: z.string().max(12).optional(),
  notes: z.string().max(500).optional(),
  payment: z.enum(['card', 'invoice']),
});
const SettingsSchema = z.object({
  general: z.object({ platformName: z.string().min(1).max(60), company: z.string().min(1).max(120), supportEmail: z.string().email(), market: z.string().min(1).max(120) }).partial().optional(),
  supplierDefaults: z
    .object({ inventoryType: z.enum(['net', 'gross']), commissionPct: z.number().min(0).max(100), markupType: z.enum(['percent', 'fixed']), markupValue: z.number().min(0).max(100_000) })
    .partial()
    .optional(),
  bookingsPaused: z.boolean().optional(),
});
const TeamSchema = z.object({ email: z.string().email(), role: z.enum(['ops', 'finance', 'admin', 'customer']) });
const StatusSchema = z.object({ status: z.enum(['confirmed', 'driver_assigned', 'in_progress', 'completed', 'cancelled', 'failed']) });

@ApiTags('admin')
@ApiBearerAuth()
@Roles('ops', 'finance')
@Controller('admin')
export class AdminController {
  constructor(
    @InjectDb() private readonly db: Db,
    private readonly bookingsSvc: BookingsService,
    private readonly suppliersSvc: SuppliersService,
    private readonly ledger: LedgerService,
    private readonly reports: ReportsService,
    private readonly config: ConfigService,
    private readonly platform: PlatformService,
  ) {}

  private currency() {
    return this.config.get<string>('DEFAULT_CURRENCY') ?? 'USD';
  }

  // ---- dashboard
  @Get('dashboard')
  async dashboard(): Promise<AdminDashboard> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 864e5);
    const since30 = new Date(today.getTime() - 29 * 864e5);
    const paid = sql`${bookings.status} not in ('cancelled','failed','pending_payment')`;
    const [t] = await this.db
      .select({
        today: sql<string>`count(*) filter (where ${bookings.createdAt} >= ${today})`,
        yesterday: sql<string>`count(*) filter (where ${bookings.createdAt} >= ${yesterday} and ${bookings.createdAt} < ${today})`,
        active: sql<string>`count(*) filter (where ${bookings.status} in ('confirmed','driver_assigned','in_progress'))`,
        revenueToday: sql<string>`coalesce(sum(${bookings.customerPrice}) filter (where ${bookings.createdAt} >= ${today} and ${paid}),0)`,
        revenueYesterday: sql<string>`coalesce(sum(${bookings.customerPrice}) filter (where ${bookings.createdAt} >= ${yesterday} and ${bookings.createdAt} < ${today} and ${paid}),0)`,
        earningsToday: sql<string>`coalesce(sum(${bookings.earnings}) filter (where ${bookings.createdAt} >= ${today} and ${paid}),0)`,
        failed: sql<string>`count(*) filter (where ${bookings.status} = 'failed' and ${bookings.createdAt} >= ${new Date(today.getTime() - 7 * 864e5)})`,
      })
      .from(bookings);
    const day = sql<string>`to_char(date_trunc('day', ${bookings.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`;
    const series = await this.db
      .select({ day, revenue: sql<string>`coalesce(sum(${bookings.customerPrice}) filter (where ${paid}),0)`, n: count() })
      .from(bookings)
      .where(sql`${bookings.createdAt} >= ${since30}`)
      .groupBy(day);
    const byDay = new Map(series.map((r) => [r.day, r]));
    const revenueSeries = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(since30.getTime() + i * 864e5).toISOString().slice(0, 10);
      const r = byDay.get(d);
      return { date: d, revenue: Number(r?.revenue ?? 0), bookings: Number(r?.n ?? 0) };
    });
    const monthRange = ReportsService.range();
    const vClass = sql<string>`${bookings.vehicle}->>'class'`;
    const vehicles = await this.db
      .select({ vehicleClass: vClass, service: bookings.service, n: count() })
      .from(bookings)
      .where(and(sql`${bookings.createdAt} >= ${monthRange.from}`, paid))
      .groupBy(vClass, bookings.service)
      .orderBy(desc(count()))
      .limit(5);
    const vTotal = vehicles.reduce((a, v) => a + Number(v.n), 0);
    const [{ open }] = await this.db.select({ open: count() }).from(contactMessages).where(eq(contactMessages.handled, false));
    const supplierRows = await this.suppliersSvc.list();
    const balances = await Promise.all(supplierRows.map((x) => this.suppliersSvc.balance(x.id)));
    const recent = await this.bookingsSvc.list({ pageSize: 8 });
    const month = await this.reports.earnings(monthRange);
    return {
      currency: this.currency(),
      bookingsToday: Number(t.today),
      bookingsYesterday: Number(t.yesterday),
      activeTrips: Number(t.active),
      revenueToday: Number(t.revenueToday),
      revenueYesterday: Number(t.revenueYesterday),
      earningsToday: Number(t.earningsToday),
      activeSuppliers: supplierRows.filter((x) => x.active).length,
      month: month.totals,
      byService: month.byService,
      revenueSeries,
      topVehicles: vehicles.map((v) => ({ vehicleClass: v.vehicleClass ?? 'standard', service: v.service, bookings: Number(v.n), share: vTotal ? Math.round((Number(v.n) / vTotal) * 100) : 0 })),
      attention: {
        openMessages: Number(open),
        failedBookings: Number(t.failed),
        payableToSuppliers: balances.filter((x) => x > 0).reduce((a, x) => a + x, 0),
        suppliersOwed: balances.filter((x) => x > 0).length,
      },
      recent: recent.items,
    };
  }

  // ---- bookings
  @Get('bookings')
  bookings(@Query() q: Record<string, string>) {
    return this.bookingsSvc.list({
      status: q.status,
      service: q.service,
      supplierId: q.supplierId,
      userId: q.userId,
      q: q.q,
      from: q.from ? new Date(q.from) : undefined,
      to: q.to ? new Date(q.to) : undefined,
      page: q.page ? Number(q.page) : 1,
      pageSize: q.pageSize ? Number(q.pageSize) : 20,
    });
  }

  /** New booking on behalf of a customer (found by email, or created as a customer account). */
  @Roles('ops')
  @Post('bookings')
  async createForCustomer(@Body(new ZodPipe(CreateForCustomerSchema)) body: AdminCreateBookingRequest) {
    const email = body.customer.email.trim().toLowerCase();
    let [u] = await this.db.select().from(users).where(eq(users.email, email));
    if (!u) {
      // The customer can set a password later through support; until then the account only holds their trips.
      const hash = await bcrypt.hash(randomBytes(24).toString('hex'), 10);
      [u] = await this.db.insert(users).values({ email, passwordHash: hash, firstName: body.customer.firstName, lastName: body.customer.lastName, phone: body.customer.phone }).returning();
    }
    if (u.deletedAt) throw new BadRequestException('That customer account was deleted');
    let paymentMethodId: string | undefined;
    if (body.payment === 'card') {
      const settings = (u.settings ?? {}) as { defaultPaymentMethod?: string };
      paymentMethodId = settings.defaultPaymentMethod;
      if (!paymentMethodId) throw new BadRequestException('This customer has no saved card — choose "Invoice the customer" instead');
    }
    const res = await this.bookingsSvc.create(
      u.id,
      { quoteId: body.quoteId, passenger: body.customer, flightNumber: body.flightNumber, notes: body.notes, paymentMethodId },
      { byStaff: true, invoice: body.payment === 'invoice' },
    );
    return res.booking;
  }

  @Get('bookings/:id/status')
  bookingStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsSvc.liveStatus(null, id);
  }

  @Get('bookings/:id')
  booking(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsSvc.getForUser(null, id);
  }

  @Patch('bookings/:id/status')
  status(@Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(StatusSchema)) body: { status: BookingStatus }) {
    if (body.status === 'cancelled') return this.bookingsSvc.cancel(null, id, 'Cancelled by operations');
    return this.bookingsSvc.setStatus(id, body.status);
  }

  @Get('bookings/:id/messages')
  async bookingMessages(@Param('id', ParseUUIDPipe) id: string) {
    const rows = await this.db.select().from(bookingMessages).where(eq(bookingMessages.bookingId, id)).orderBy(bookingMessages.createdAt);
    return rows.map((m) => ({ id: m.id, sender: m.sender, body: m.body, createdAt: m.createdAt.toISOString() }));
  }

  // ---- contact form inbox
  @Get('contact-messages')
  async contactMessages(@Query('handled') handled?: string) {
    const where = handled === 'true' ? eq(contactMessages.handled, true) : handled === 'false' ? eq(contactMessages.handled, false) : undefined;
    const rows = await this.db.select().from(contactMessages).where(where).orderBy(desc(contactMessages.createdAt)).limit(200);
    return rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));
  }

  @Patch('contact-messages/:id')
  async markContact(@Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(z.object({ handled: z.boolean() }))) body: { handled: boolean }) {
    const [m] = await this.db.update(contactMessages).set({ handled: body.handled }).where(eq(contactMessages.id, id)).returning();
    return { ...m, createdAt: m.createdAt.toISOString() };
  }

  // ---- users
  @Get('users')
  async users(@Query('q') q?: string, @Query('page') page = '1', @Query('filter') filter?: string): Promise<AdminUsersResponse> {
    const p = Math.max(1, Number(page));
    const weekAgo = new Date(Date.now() - 7 * 864e5);
    const conds = [
      eq(users.role, 'customer'),
      q ? or(ilike(users.email, `%${q}%`), ilike(users.lastName, `%${q}%`), ilike(users.firstName, `%${q}%`)) : undefined,
      filter === 'deleted' ? sql`${users.deletedAt} is not null` : filter === 'active' || filter === 'new' ? isNull(users.deletedAt) : undefined,
      filter === 'new' ? sql`${users.createdAt} >= ${weekAgo}` : undefined,
    ].filter(Boolean);
    const where = and(...(conds as ReturnType<typeof eq>[]));
    const [{ total }] = await this.db.select({ total: count() }).from(users).where(where);
    const rows = await this.db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(25).offset((p - 1) * 25);
    const ids = rows.map((r) => r.id);
    const trips = ids.length
      ? await this.db
          .select({ userId: bookings.userId, n: count() })
          .from(bookings)
          .where(and(inArray(bookings.userId, ids), sql`${bookings.status} not in ('cancelled','failed','pending_payment')`))
          .groupBy(bookings.userId)
      : [];
    const wallets = ids.length
      ? await this.db.select({ userId: walletTransactions.userId, b: sql<string>`coalesce(sum(${walletTransactions.amount}),0)` }).from(walletTransactions).where(inArray(walletTransactions.userId, ids)).groupBy(walletTransactions.userId)
      : [];
    const tripMap = new Map(trips.map((t) => [t.userId, Number(t.n)]));
    const walletMap = new Map(wallets.map((w) => [w.userId, Number(w.b)]));
    const twoWeeksAgo = new Date(Date.now() - 14 * 864e5);
    const [st] = await this.db
      .select({
        total: count(),
        newThisWeek: sql<string>`count(*) filter (where ${users.createdAt} >= ${weekAgo})`,
        newLastWeek: sql<string>`count(*) filter (where ${users.createdAt} >= ${twoWeeksAgo} and ${users.createdAt} < ${weekAgo})`,
      })
      .from(users)
      .where(and(eq(users.role, 'customer'), isNull(users.deletedAt)));
    const [{ withTrips }] = await this.db
      .select({ withTrips: sql<string>`count(distinct ${bookings.userId})` })
      .from(bookings)
      .where(sql`${bookings.status} not in ('cancelled','failed','pending_payment')`);
    return {
      items: rows.map((r) => ({ ...toUser(r), trips: tripMap.get(r.id) ?? 0, walletBalance: walletMap.get(r.id) ?? 0, deleted: !!r.deletedAt })),
      total: Number(total),
      page: p,
      pageSize: 25,
      stats: { total: Number(st.total), newThisWeek: Number(st.newThisWeek), newLastWeek: Number(st.newLastWeek), withTrips: Number(withTrips) },
    };
  }

  // ---- drivers (chauffeurs reported by suppliers on assigned bookings)
  @Get('drivers')
  async drivers(): Promise<AdminDriver[]> {
    const rows = await this.db
      .select({ b: bookings, supplierName: suppliers.name })
      .from(bookings)
      .innerJoin(suppliers, eq(bookings.supplierId, suppliers.id))
      .where(sql`${bookings.supplierMeta}->'driver' is not null`)
      .orderBy(desc(bookings.createdAt))
      .limit(2000);
    const map = new Map<string, AdminDriver>();
    for (const { b, supplierName } of rows) {
      const d = (b.supplierMeta as { driver?: { name?: string; phone?: string; vehicle?: string; plate?: string; rating?: number } }).driver;
      if (!d?.name) continue;
      const key = `${b.supplierId}:${d.name.toLowerCase()}:${(d.plate ?? '').toLowerCase()}`;
      const cur =
        map.get(key) ??
        ({ key, name: d.name, phone: d.phone, vehicle: d.vehicle, plate: d.plate, rating: d.rating, supplierId: b.supplierId, supplierName, trips: 0, completedTrips: 0, onTrip: false, lastBookingId: b.id, lastSeenAt: b.updatedAt.toISOString() } as AdminDriver);
      cur.trips += 1;
      if (b.status === 'completed') cur.completedTrips += 1;
      if (['confirmed', 'driver_assigned', 'in_progress'].includes(b.status)) cur.onTrip = true;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => Number(b.onTrip) - Number(a.onTrip) || b.trips - a.trips);
  }

  // ---- platform settings & team
  @Get('settings')
  settings(): Promise<PlatformSettings> {
    return this.platform.get();
  }

  @Roles('admin')
  @Patch('settings')
  updateSettings(@CurrentUser() user: AuthUser, @Body(new ZodPipe(SettingsSchema)) body: z.infer<typeof SettingsSchema>) {
    return this.platform.update(body as Partial<PlatformSettings>, user.id);
  }

  @Get('team')
  async team(): Promise<TeamMember[]> {
    const rows = await this.db.select().from(users).where(and(ne(users.role, 'customer'), isNull(users.deletedAt))).orderBy(users.createdAt);
    return rows.map((r) => ({ id: r.id, email: r.email, firstName: r.firstName, lastName: r.lastName, role: r.role as TeamMember['role'], createdAt: r.createdAt.toISOString() }));
  }

  /** Give an existing Ridean account a staff role, change it, or remove access (role = customer). */
  @Roles('admin')
  @Patch('team')
  async setTeamRole(@CurrentUser() me: AuthUser, @Body(new ZodPipe(TeamSchema)) body: z.infer<typeof TeamSchema>) {
    const [u] = await this.db.select().from(users).where(eq(users.email, body.email.trim().toLowerCase()));
    if (!u || u.deletedAt) throw new NotFoundException('No Ridean account uses that email — ask them to create one first');
    if (u.id === me.id && body.role !== 'admin') throw new BadRequestException('You can’t remove your own admin access');
    await this.db.update(users).set({ role: body.role }).where(eq(users.id, u.id));
    return this.team();
  }

  // ---- suppliers
  @Get('suppliers')
  async suppliers() {
    const rows = await this.suppliersSvc.list();
    return Promise.all(rows.map(async (s) => ({ ...toSupplier(s), balance: await this.suppliersSvc.balance(s.id) })));
  }

  @Get('suppliers/:id')
  async supplier(@Param('id', ParseUUIDPipe) id: string) {
    const s = await this.suppliersSvc.get(id);
    return { ...toSupplier(s), config: s.config, balance: await this.suppliersSvc.balance(id) };
  }

  @Roles('admin')
  @Post('suppliers')
  async createSupplier(@Body(new ZodPipe(SupplierSchema)) body: z.infer<typeof SupplierSchema>) {
    const d = (await this.platform.get()).supplierDefaults;
    return toSupplier(await this.suppliersSvc.create({ ...body, terms: { ...d, ...(body.terms ?? {}) } }));
  }

  @Roles('admin', 'finance')
  @Patch('suppliers/:id')
  async updateSupplier(@Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(SupplierSchema)) body: z.infer<typeof SupplierSchema>) {
    return toSupplier(await this.suppliersSvc.update(id, body));
  }

  @Get('suppliers/:id/ledger')
  ledgerEntries(@Param('id', ParseUUIDPipe) id: string, @Query('kind') kind?: 'booking' | 'payment' | 'invoice' | 'adjustment' | 'refund') {
    return this.ledger.entries(id, kind);
  }

  @Roles('finance')
  @Post('suppliers/:id/ledger/payments')
  recordPayment(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(PaymentSchema)) body: z.infer<typeof PaymentSchema>) {
    return this.ledger.recordPayment(id, { ...body, currency: this.currency() }, user.id);
  }

  @Roles('finance')
  @Post('suppliers/:id/ledger/adjustments')
  adjust(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(AdjustmentSchema)) body: z.infer<typeof AdjustmentSchema>) {
    return this.ledger.adjustment(id, { ...body, currency: this.currency() }, user.id);
  }

  // ---- reports
  @Get('reports/earnings')
  earnings(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.earnings(ReportsService.range(from, to));
  }

  @Get('reports/transactions')
  transactions(@Query() q: Record<string, string>) {
    return this.reports.transactionReport({ ...ReportsService.range(q.from, q.to), groupBy: q.groupBy === 'service' ? 'service' : 'supplier', supplierId: q.supplierId, service: q.service });
  }

  @Get('reports/transactions/rows')
  transactionRows(@Query() q: Record<string, string>) {
    const { from, to } = ReportsService.range(q.from, q.to);
    return this.bookingsSvc.list({ from, to, supplierId: q.supplierId, service: q.service, page: q.page ? Number(q.page) : 1, pageSize: 50 });
  }

  @Get('reports/transactions.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="ridean-transactions.csv"')
  csv(@Query() q: Record<string, string>) {
    return this.reports.csv({ ...ReportsService.range(q.from, q.to), supplierId: q.supplierId, service: q.service });
  }
}

@Module({ imports: [BookingsModule, SuppliersModule], controllers: [AdminController], providers: [ReportsService] })
export class AdminModule {}
