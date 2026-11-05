import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { serviceLabel, type ReportTotals, type TransactionReport } from '@ridean/shared';
import { InjectDb, type Db } from '../../db/db.module';
import { bookings, suppliers } from '../../db/schema';

/** Booking statuses that count as revenue in reports. */
const REVENUE_STATUSES = ['confirmed', 'driver_assigned', 'in_progress', 'completed'];

export interface ReportFilter {
  from: Date;
  to: Date;
  supplierId?: string;
  service?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectDb() private readonly db: Db,
    private readonly config: ConfigService,
  ) {}

  static range(from?: string, to?: string): { from: Date; to: Date } {
    const now = new Date();
    const f = from ? new Date(from) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    let t = to ? new Date(to) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    // A bare date ("2026-11-04") means "through the end of that day".
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) t = new Date(t.getTime() + 86_400_000);
    if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) throw new BadRequestException('Invalid date range');
    return { from: f, to: t };
  }

  private where(f: ReportFilter) {
    return and(
      inArray(bookings.status, REVENUE_STATUSES),
      sql`${bookings.createdAt} >= ${f.from}`,
      sql`${bookings.createdAt} < ${f.to}`,
      f.supplierId ? eq(bookings.supplierId, f.supplierId) : undefined,
      f.service ? eq(bookings.service, f.service) : undefined,
    );
  }

  /** Aggregates by supplier × service in one query. */
  private async grouped(f: ReportFilter) {
    const rows = await this.db
      .select({
        supplierId: bookings.supplierId,
        supplierName: suppliers.name,
        paymentFlow: bookings.paymentFlow,
        service: bookings.service,
        n: sql<string>`count(*)`,
        gross: sql<string>`sum(${bookings.customerPrice})`,
        sup: sql<string>`sum(${bookings.supplierPayable})`,
        comm: sql<string>`sum(${bookings.commission})`,
        mk: sql<string>`sum(${bookings.markup})`,
        earn: sql<string>`sum(${bookings.earnings})`,
      })
      .from(bookings)
      .innerJoin(suppliers, eq(bookings.supplierId, suppliers.id))
      .where(this.where(f))
      .groupBy(bookings.supplierId, suppliers.name, bookings.paymentFlow, bookings.service);

    return { rows };
  }

  async transactionReport(f: ReportFilter & { groupBy: 'supplier' | 'service' }): Promise<TransactionReport> {
    const { rows } = await this.grouped(f);
    const zero = (): ReportTotals => ({ bookings: 0, gross: 0, supplierCost: 0, commission: 0, markup: 0, earnings: 0, owedToSuppliers: 0, owedToRidean: 0 });
    const add = (t: ReportTotals, r: (typeof rows)[number]) => {
      t.bookings += Number(r.n);
      t.gross += Number(r.gross);
      t.supplierCost += Number(r.sup);
      t.commission += Number(r.comm);
      t.markup += Number(r.mk);
      t.earnings += Number(r.earn);
      // Debit/credit for the period: when the supplier charged the customer they owe us our earnings,
      // otherwise we owe them what they keep. (Outstanding balances after payments live in the ledger.)
      if (r.paymentFlow === 'supplier_collects') t.owedToRidean += Number(r.earn);
      else t.owedToSuppliers += Number(r.sup);
    };

    const groups = new Map<string, { key: string; label: string; totals: ReportTotals; children: Map<string, { key: string; label: string; totals: ReportTotals }> }>();
    const totals = zero();
    for (const r of rows) {
      const [gk, gl, ck, cl] = f.groupBy === 'supplier' ? [r.supplierId, r.supplierName, r.service, serviceLabel(r.service)] : [r.service, serviceLabel(r.service), r.supplierId, r.supplierName];
      const g = groups.get(gk) ?? { key: gk, label: gl, totals: zero(), children: new Map() };
      const c = g.children.get(ck) ?? { key: ck, label: cl, totals: zero() };
      add(g.totals, r);
      add(c.totals, r);
      add(totals, r);
      g.children.set(ck, c);
      groups.set(gk, g);
    }
    const { from, to } = f;
    return {
      currency: this.config.get<string>('DEFAULT_CURRENCY') ?? 'USD',
      from: from.toISOString(),
      to: to.toISOString(),
      groupBy: f.groupBy,
      totals,
      groups: [...groups.values()]
        .map((g) => ({ ...g, children: [...g.children.values()].sort((a, b) => b.totals.earnings - a.totals.earnings) }))
        .sort((a, b) => b.totals.earnings - a.totals.earnings),
    };
  }

  async earnings(f: ReportFilter) {
    const bySupplier = await this.transactionReport({ ...f, groupBy: 'supplier' });
    const byService = await this.transactionReport({ ...f, groupBy: 'service' });
    const t = bySupplier.totals;
    return {
      currency: bySupplier.currency,
      from: bySupplier.from,
      to: bySupplier.to,
      totals: { ...t, takeRate: t.gross ? Math.round((t.earnings / t.gross) * 1000) / 10 : 0 },
      bySupplier: bySupplier.groups.map((g) => ({ key: g.key, label: g.label, ...g.totals })),
      byService: byService.groups.map((g) => ({ key: g.key, label: g.label, ...g.totals })),
    };
  }

  async csv(f: ReportFilter): Promise<string> {
    const rows = await this.db
      .select({ b: bookings, s: suppliers.name })
      .from(bookings)
      .innerJoin(suppliers, eq(bookings.supplierId, suppliers.id))
      .where(this.where(f))
      .orderBy(bookings.createdAt);
    const head = ['date', 'reference', 'service', 'supplier', 'supplier_reference', 'payment_flow', 'supplier_price', 'commission', 'markup', 'customer_price', 'earnings', 'supplier_payable', 'owed_to_supplier', 'owed_to_ridean', 'currency', 'status'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = rows.map(({ b, s }) => {
      const sc = b.paymentFlow === 'supplier_collects';
      return [b.createdAt.toISOString(), b.reference, b.service, s, b.supplierReference, b.paymentFlow, b.supplierPrice / 100, b.commission / 100, b.markup / 100, b.customerPrice / 100, b.earnings / 100, b.supplierPayable / 100, sc ? 0 : b.supplierPayable / 100, sc ? b.earnings / 100 : 0, b.currency, b.status].map(esc).join(',');
    });
    return [head.join(','), ...lines].join('\n');
  }
}
