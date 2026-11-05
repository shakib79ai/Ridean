import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import type { Supplier, SupplierCommercialTerms } from '@ridean/shared';
import { InjectDb, type Db } from '../../db/db.module';
import { ledgerEntries, suppliers, type SupplierRow } from '../../db/schema';
import { SupplierRegistry } from '../../integrations/integrations.module';

export function termsOf(s: SupplierRow): SupplierCommercialTerms {
  return {
    inventoryType: s.inventoryType,
    commissionPct: s.commissionPct,
    markupType: s.markupType,
    markupValue: s.markupValue,
    paymentFlow: s.paymentFlow,
    settlementCycle: s.settlementCycle,
    paymentTerms: s.paymentTerms ?? undefined,
  };
}

export function toSupplier(s: SupplierRow): Supplier {
  return { id: s.id, code: s.code, name: s.name, services: s.services, active: s.active, adapter: s.adapter, contactEmail: s.contactEmail ?? undefined, terms: termsOf(s) };
}

export interface SupplierInput {
  code?: string;
  name?: string;
  adapter?: string;
  services?: string[];
  active?: boolean;
  contactEmail?: string;
  config?: Record<string, unknown>;
  terms?: Partial<SupplierCommercialTerms>;
}

@Injectable()
export class SuppliersService {
  constructor(
    @InjectDb() private readonly db: Db,
    private readonly registry: SupplierRegistry,
  ) {}

  async list(): Promise<SupplierRow[]> {
    return this.db.select().from(suppliers).orderBy(asc(suppliers.name));
  }

  async activeFor(service: string): Promise<SupplierRow[]> {
    return this.db
      .select()
      .from(suppliers)
      .where(sql`${suppliers.active} = true AND ${service} = ANY(${suppliers.services})`);
  }

  async get(id: string): Promise<SupplierRow> {
    const [s] = await this.db.select().from(suppliers).where(eq(suppliers.id, id));
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async balance(id: string): Promise<number> {
    const [r] = await this.db
      .select({ bal: sql<string>`coalesce(sum(${ledgerEntries.debit} - ${ledgerEntries.credit}), 0)` })
      .from(ledgerEntries)
      .where(eq(ledgerEntries.supplierId, id));
    return Number(r?.bal ?? 0);
  }

  async create(input: SupplierInput): Promise<SupplierRow> {
    if (!input.code || !input.name || !input.adapter) throw new BadRequestException('code, name and adapter are required');
    this.registry.get(input.adapter);
    const [row] = await this.db
      .insert(suppliers)
      .values({ code: input.code.toLowerCase(), name: input.name, adapter: input.adapter, services: input.services ?? [], active: input.active ?? true, contactEmail: input.contactEmail, config: input.config ?? {}, ...this.termColumns(input.terms) })
      .returning();
    return row;
  }

  async update(id: string, input: SupplierInput): Promise<SupplierRow> {
    await this.get(id);
    if (input.adapter) this.registry.get(input.adapter);
    const [row] = await this.db
      .update(suppliers)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.adapter !== undefined && { adapter: input.adapter }),
        ...(input.services !== undefined && { services: input.services }),
        ...(input.active !== undefined && { active: input.active }),
        ...(input.contactEmail !== undefined && { contactEmail: input.contactEmail }),
        ...(input.config !== undefined && { config: input.config }),
        ...this.termColumns(input.terms),
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, id))
      .returning();
    return row;
  }

  private termColumns(t?: Partial<SupplierCommercialTerms>) {
    if (!t) return {};
    return {
      ...(t.inventoryType !== undefined && { inventoryType: t.inventoryType }),
      ...(t.commissionPct !== undefined && { commissionPct: t.commissionPct }),
      ...(t.markupType !== undefined && { markupType: t.markupType }),
      ...(t.markupValue !== undefined && { markupValue: t.markupValue }),
      ...(t.paymentFlow !== undefined && { paymentFlow: t.paymentFlow }),
      ...(t.settlementCycle !== undefined && { settlementCycle: t.settlementCycle }),
      ...(t.paymentTerms !== undefined && { paymentTerms: t.paymentTerms }),
    };
  }
}
