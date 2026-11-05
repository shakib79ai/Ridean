import { Body, Controller, Get, Header, Module, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { count, desc, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { BookingStatus } from '@ridean/shared';
import { CurrentUser, Roles, type AuthUser } from '../../common/auth';
import { ZodPipe } from '../../common/zod.pipe';
import { InjectDb, type Db } from '../../db/db.module';
import { bookings, users } from '../../db/schema';
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
  ) {}

  private currency() {
    return this.config.get<string>('DEFAULT_CURRENCY') ?? 'USD';
  }

  // ---- dashboard
  @Get('dashboard')
  async dashboard() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const [t] = await this.db
      .select({
        today: sql<string>`count(*) filter (where ${bookings.createdAt} >= ${today})`,
        active: sql<string>`count(*) filter (where ${bookings.status} in ('confirmed','driver_assigned','in_progress'))`,
        revenueToday: sql<string>`coalesce(sum(${bookings.customerPrice}) filter (where ${bookings.createdAt} >= ${today} and ${bookings.status} not in ('cancelled','failed','pending_payment')),0)`,
        earningsToday: sql<string>`coalesce(sum(${bookings.earnings}) filter (where ${bookings.createdAt} >= ${today} and ${bookings.status} not in ('cancelled','failed','pending_payment')),0)`,
      })
      .from(bookings);
    const recent = await this.bookingsSvc.list({ pageSize: 8 });
    const month = await this.reports.earnings(ReportsService.range());
    return {
      currency: this.currency(),
      bookingsToday: Number(t.today),
      activeTrips: Number(t.active),
      revenueToday: Number(t.revenueToday),
      earningsToday: Number(t.earningsToday),
      month: month.totals,
      byService: month.byService,
      recent: recent.items,
    };
  }

  // ---- bookings
  @Get('bookings')
  bookings(@Query() q: Record<string, string>) {
    return this.bookingsSvc.list({ status: q.status, service: q.service, supplierId: q.supplierId, q: q.q, page: q.page ? Number(q.page) : 1, pageSize: q.pageSize ? Number(q.pageSize) : 20 });
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

  // ---- users
  @Get('users')
  async users(@Query('q') q?: string, @Query('page') page = '1') {
    const p = Math.max(1, Number(page));
    const where = q ? or(ilike(users.email, `%${q}%`), ilike(users.lastName, `%${q}%`), ilike(users.firstName, `%${q}%`)) : undefined;
    const [{ total }] = await this.db.select({ total: count() }).from(users).where(where);
    const rows = await this.db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(25).offset((p - 1) * 25);
    return { items: rows.map(toUser), total: Number(total), page: p, pageSize: 25 };
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
    return toSupplier(await this.suppliersSvc.create(body));
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
