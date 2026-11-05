import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import type { LedgerEntry, LedgerKind } from '@ridean/shared';
import { InjectDb, type Db } from '../../db/db.module';
import { ledgerEntries, type BookingRow } from '../../db/schema';

/**
 * Supplier accounting. Convention:
 *   debit  = increases what Ridean owes the supplier
 *   credit = Ridean paid the supplier, or the supplier owes Ridean
 *   balance (sum debit − credit) > 0 → we owe the supplier; < 0 → the supplier owes us
 */
@Injectable()
export class LedgerService {
  constructor(@InjectDb() private readonly db: Db) {}

  async entries(supplierId: string, kind?: LedgerKind): Promise<LedgerEntry[]> {
    const rows = await this.db
      .select()
      .from(ledgerEntries)
      .where(kind ? and(eq(ledgerEntries.supplierId, supplierId), eq(ledgerEntries.kind, kind)) : eq(ledgerEntries.supplierId, supplierId))
      .orderBy(asc(ledgerEntries.createdAt));
    // Running balance is computed over the full history so filtered views stay correct
    const all = kind ? await this.db.select().from(ledgerEntries).where(eq(ledgerEntries.supplierId, supplierId)).orderBy(asc(ledgerEntries.createdAt)) : rows;
    const running = new Map<string, number>();
    let bal = 0;
    for (const r of all) {
      bal += r.debit - r.credit;
      running.set(r.id, bal);
    }
    return rows
      .map((r) => ({
        id: r.id,
        supplierId: r.supplierId,
        bookingId: r.bookingId ?? undefined,
        kind: r.kind,
        reference: r.reference,
        description: r.description,
        debit: r.debit,
        credit: r.credit,
        balance: running.get(r.id) ?? 0,
        currency: r.currency,
        createdAt: r.createdAt.toISOString(),
      }))
      .reverse();
  }

  /** Records the supplier side of a confirmed booking. */
  async onBookingConfirmed(b: BookingRow, settledAtBooking: boolean, tx: Db = this.db) {
    if (b.paymentFlow === 'supplier_collects') {
      await tx.insert(ledgerEntries).values({
        supplierId: b.supplierId,
        bookingId: b.id,
        kind: 'booking',
        reference: b.reference,
        description: `Supplier charged customer · commission + markup due`,
        debit: 0,
        credit: b.earnings,
        currency: b.currency,
      });
      return;
    }
    await tx.insert(ledgerEntries).values({
      supplierId: b.supplierId,
      bookingId: b.id,
      kind: 'booking',
      reference: b.reference,
      description: b.commission > 0 ? `Booking · gross minus ${b.commission / 100} commission` : 'Booking · net cost',
      debit: b.supplierPayable,
      credit: 0,
      currency: b.currency,
    });
    if (settledAtBooking) {
      await tx.insert(ledgerEntries).values({
        supplierId: b.supplierId,
        bookingId: b.id,
        kind: 'payment',
        reference: `CARD-${b.reference}`,
        description: 'Paid by corporate card at booking',
        debit: 0,
        credit: b.supplierPayable,
        currency: b.currency,
      });
    }
  }

  /** Reverses a booking's supplier entries after cancellation (less any supplier fee). */
  async onBookingCancelled(b: BookingRow, supplierFee: number) {
    if (b.paymentFlow === 'supplier_collects') {
      await this.db.insert(ledgerEntries).values({ supplierId: b.supplierId, bookingId: b.id, kind: 'refund', reference: b.reference, description: 'Cancelled · share no longer due', debit: b.earnings, credit: 0, currency: b.currency });
      return;
    }
    const reversal = Math.max(0, b.supplierPayable - supplierFee);
    await this.db.insert(ledgerEntries).values({
      supplierId: b.supplierId,
      bookingId: b.id,
      kind: 'refund',
      reference: b.reference,
      description: supplierFee ? `Cancelled · supplier fee ${supplierFee / 100} retained` : 'Cancelled · booking reversed',
      debit: 0,
      credit: reversal,
      currency: b.currency,
    });
  }

  async recordPayment(
    supplierId: string,
    input: { amount: number; direction: 'paid_to_supplier' | 'received_from_supplier'; reference: string; method: string; note?: string; currency: string },
    userId: string,
  ) {
    const paid = input.direction === 'paid_to_supplier';
    const [row] = await this.db
      .insert(ledgerEntries)
      .values({
        supplierId,
        kind: 'payment',
        reference: input.reference,
        description: `${paid ? 'Paid to supplier' : 'Received from supplier'} · ${input.method}${input.note ? ` · ${input.note}` : ''}`,
        debit: paid ? 0 : input.amount,
        credit: paid ? input.amount : 0,
        currency: input.currency,
        createdBy: userId,
      })
      .returning();
    return row;
  }

  async adjustment(supplierId: string, input: { debit: number; credit: number; reference: string; description: string; currency: string }, userId: string) {
    const [row] = await this.db.insert(ledgerEntries).values({ supplierId, kind: 'adjustment', ...input, createdBy: userId }).returning();
    return row;
  }
}
