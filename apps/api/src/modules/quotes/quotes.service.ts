import { BadRequestException, GoneException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { priceQuote, SERVICES, type Quote, type QuoteSearchRequest } from '@ridean/shared';
import { InjectDb, type Db } from '../../db/db.module';
import { quotes, type QuoteRow, type SupplierRow } from '../../db/schema';
import { SupplierRegistry } from '../../integrations/integrations.module';
import type { SupplierOffer } from '../../integrations/supplier-adapter';
import { SuppliersService, termsOf } from '../suppliers/suppliers.service';

export interface PricedOffer {
  supplier: SupplierRow;
  offer: SupplierOffer;
  price: ReturnType<typeof priceQuote>;
}

/** Applies each supplier's commercial terms to its offers and sorts by customer price. Pure — unit tested. */
export function priceOffers(results: { supplier: SupplierRow; offers: SupplierOffer[] }[]): PricedOffer[] {
  return results
    .flatMap(({ supplier, offers }) => offers.map((offer) => ({ supplier, offer, price: priceQuote(offer.price, termsOf(supplier), offer.currency) })))
    .sort((a, b) => a.price.customerPrice - b.price.customerPrice);
}

export function validateSearch(req: QuoteSearchRequest) {
  if (!(req.service in SERVICES) && !req.pickup) throw new BadRequestException('Unknown service');
  if ((req.service === 'ride_now' || req.service === 'luxury') && !req.dropoff) {
    throw new BadRequestException('Please enter a destination');
  }
  if (req.service === 'airport_transfer') {
    if (!req.dropoff) throw new BadRequestException('Please enter a drop-off');
    if (!req.pickupAt) throw new BadRequestException('Please choose a pickup date and time');
    if (req.tripType === 'return' && !req.returnAt) throw new BadRequestException('Please choose a return date and time');
    if (req.returnAt && req.pickupAt && Date.parse(req.returnAt) <= Date.parse(req.pickupAt)) throw new BadRequestException('Return must be after the outbound pickup');
  }
  if (req.service === 'rent') {
    if (!req.rentalPickupAt || !req.rentalReturnAt) throw new BadRequestException('Please choose pick-up and return dates');
    if (Date.parse(req.rentalReturnAt) <= Date.parse(req.rentalPickupAt)) throw new BadRequestException('Return must be after pick-up');
  }
  if (req.service === 'hourly' && (!req.hours || req.hours < 2)) throw new BadRequestException('Hourly bookings are at least 2 hours');
  if (req.pickupAt && Date.parse(req.pickupAt) < Date.now() - 5 * 60_000) throw new BadRequestException('Pickup time is in the past');
}

@Injectable()
export class QuotesService {
  private readonly log = new Logger(QuotesService.name);

  constructor(
    @InjectDb() private readonly db: Db,
    private readonly config: ConfigService,
    private readonly registry: SupplierRegistry,
    private readonly suppliers: SuppliersService,
  ) {}

  /** Fans the search out to every active supplier for the service, prices the offers and stores them as quotes. */
  async search(req: QuoteSearchRequest, userId?: string) {
    validateSearch(req);
    const currency = req.currency ?? this.config.get<string>('DEFAULT_CURRENCY') ?? 'USD';
    const candidates = (await this.suppliers.activeFor(req.service)).filter((s) => {
      try {
        return this.registry.get(s.adapter).supports.includes(req.service);
      } catch {
        return false;
      }
    });

    const errors: { supplier: string; message: string }[] = [];
    const settled = await Promise.allSettled(
      candidates.map(async (supplier) => ({ supplier, offers: await this.registry.get(supplier.adapter).search(req, this.registry.context(supplier, currency)) })),
    );
    const ok: { supplier: SupplierRow; offers: SupplierOffer[] }[] = [];
    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') ok.push(r.value);
      else {
        this.log.warn(`Supplier ${candidates[i].code} search failed: ${(r.reason as Error).message}`);
        errors.push({ supplier: candidates[i].name, message: 'Temporarily unavailable' });
      }
    });

    const priced = priceOffers(ok);
    const searchId = randomUUID();
    const expiresAt = new Date(Date.now() + (this.config.get<number>('QUOTE_TTL_MINUTES') ?? 15) * 60_000);
    if (!priced.length) return { searchId, quotes: [] as Quote[], errors };

    const rows = await this.db
      .insert(quotes)
      .values(
        priced.map((p) => ({
          searchId,
          userId,
          service: req.service,
          supplierId: p.supplier.id,
          supplierOfferId: p.offer.offerId,
          request: { ...req, currency },
          vehicle: p.offer.vehicle,
          price: p.price,
          meta: {
            offer: p.offer.meta ?? {},
            etaMinutes: p.offer.etaMinutes,
            durationMinutes: p.offer.durationMinutes,
            distanceKm: p.offer.distanceKm,
            cancellation: p.offer.cancellation,
            inclusions: p.offer.inclusions,
          },
          expiresAt,
        })),
      )
      .returning();

    const byId = new Map(candidates.map((s) => [s.id, s]));
    return { searchId, quotes: rows.map((r) => this.toQuote(r, byId.get(r.supplierId)!)), errors };
  }

  async get(id: string): Promise<{ row: QuoteRow; supplier: SupplierRow; quote: Quote }> {
    const [row] = await this.db.select().from(quotes).where(eq(quotes.id, id));
    if (!row) throw new NotFoundException('Quote not found');
    const supplier = await this.suppliers.get(row.supplierId);
    return { row, supplier, quote: this.toQuote(row, supplier) };
  }

  async getBookable(id: string) {
    const q = await this.get(id);
    if (q.row.expiresAt.getTime() < Date.now()) throw new GoneException('This price has expired. Please search again.');
    return q;
  }

  toQuote(r: QuoteRow, s: SupplierRow): Quote {
    const m = r.meta as Record<string, unknown>;
    return {
      id: r.id,
      service: r.service,
      supplierId: s.id,
      supplierName: s.name,
      vehicle: r.vehicle,
      price: r.price,
      etaMinutes: m.etaMinutes as number | undefined,
      durationMinutes: m.durationMinutes as number | undefined,
      distanceKm: m.distanceKm as number | undefined,
      cancellation: (m.cancellation as string) ?? '',
      inclusions: (m.inclusions as string[]) ?? [],
      expiresAt: r.expiresAt.toISOString(),
    };
  }
}
