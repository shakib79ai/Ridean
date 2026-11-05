import { Controller, Get, Injectable, Module, NotFoundException, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { serviceLabel, type Invoice } from '@ridean/shared';
import { CurrentUser, type AuthUser } from '../../common/auth';
import { InjectDb, type Db } from '../../db/db.module';
import { businessAccounts, bookings, users, type BookingRow } from '../../db/schema';

/** Bookings that were paid (or billed) and not cancelled produce a receipt/invoice. */
const INVOICED = ['payment_authorised', 'confirmed', 'driver_assigned', 'in_progress', 'completed'];
const PAID_WITH: Record<string, string> = { card: 'Card', wallet: 'Ridean Wallet', business: 'Business account (monthly invoice)', supplier: 'Paid to partner' };

@Injectable()
export class InvoicesService {
  constructor(@InjectDb() private readonly db: Db) {}

  async list(userId: string, month?: string): Promise<Invoice[]> {
    const conds = [eq(bookings.userId, userId), inArray(bookings.status, INVOICED)];
    if (month && /^\d{4}-\d{2}$/.test(month)) conds.push(sql`to_char(${bookings.createdAt}, 'YYYY-MM') = ${month}`);
    const rows = await this.db.select().from(bookings).where(and(...conds)).orderBy(desc(bookings.createdAt)).limit(200);
    const [u] = await this.db.select().from(users).where(eq(users.id, userId));
    return rows.map((b) => this.toInvoice(b, u));
  }

  async get(userId: string, bookingId: string): Promise<Invoice> {
    const [b] = await this.db.select().from(bookings).where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId), inArray(bookings.status, INVOICED)));
    if (!b) throw new NotFoundException('Invoice not found');
    const [u] = await this.db.select().from(users).where(eq(users.id, userId));
    let company: string | undefined;
    if (b.businessAccountId) [{ name: company }] = await this.db.select({ name: businessAccounts.name }).from(businessAccounts).where(eq(businessAccounts.id, b.businessAccountId));
    return this.toInvoice(b, u, company);
  }

  private toInvoice(b: BookingRow, u: typeof users.$inferSelect, company?: string): Invoice {
    const fare = b.customerPrice - b.tip + b.discount;
    const lines = [{ label: `${serviceLabel(b.service)} fare (taxes and fees included)`, amount: fare }];
    if (b.discount) lines.push({ label: `Promo ${b.promoCode ?? ''}`.trim(), amount: -b.discount });
    if (b.tip) lines.push({ label: 'Chauffeur tip', amount: b.tip });
    const route = [b.pickup.address, b.dropoff?.address].filter(Boolean).join(' → ');
    return {
      id: b.id,
      number: `INV-${b.reference.replace(/^RD-/, '')}`,
      bookingId: b.id,
      reference: b.reference,
      issuedAt: b.createdAt.toISOString(),
      service: b.service,
      description: `${serviceLabel(b.service)} · ${route} · ${b.vehicle.name}`,
      paidWith: PAID_WITH[b.paymentMethod] ?? 'Card',
      currency: b.currency,
      lines,
      total: b.customerPrice,
      billedTo: { name: `${b.passenger.firstName} ${b.passenger.lastName}`, email: u?.email ?? b.passenger.email, company },
    };
  }
}

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly svc: InvoicesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('month') month?: string) {
    return this.svc.list(user.id, month);
  }

  @Get(':bookingId')
  get(@CurrentUser() user: AuthUser, @Param('bookingId', ParseUUIDPipe) id: string) {
    return this.svc.get(user.id, id);
  }
}

@Module({ controllers: [InvoicesController], providers: [InvoicesService] })
export class InvoicesModule {}
