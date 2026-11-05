import type { SupplierRow } from '../../db/schema';
import { mockOffers } from '../../integrations/mock-offers';
import { priceOffers } from './quotes.service';

const supplier = (over: Partial<SupplierRow>): SupplierRow => ({
  id: over.code ?? 'id',
  code: 'x',
  name: 'X',
  adapter: 'generic_http',
  services: ['airport_transfer'],
  active: true,
  inventoryType: 'net',
  commissionPct: 0,
  markupType: 'percent',
  markupValue: 10,
  paymentFlow: 'corporate_card',
  settlementCycle: 'monthly',
  paymentTerms: null,
  contactEmail: null,
  config: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
});

describe('priceOffers', () => {
  const req = { service: 'airport_transfer', pickup: { address: 'JFK Terminal 4' }, dropoff: { address: '432 Park Ave' }, pickupAt: new Date(Date.now() + 864e5).toISOString() };

  it('applies each supplier’s terms and sorts by customer price', () => {
    const mozio = supplier({ code: 'mozio', name: 'Mozio', inventoryType: 'gross', commissionPct: 10, markupValue: 8, paymentFlow: 'ach_debit' });
    const citych = supplier({ code: 'citych', name: 'City Chauffeurs', markupValue: 18 });
    const priced = priceOffers([
      { supplier: mozio, offers: mockOffers('mozio', req, 'USD') },
      { supplier: citych, offers: mockOffers('citych', req, 'USD') },
    ]);
    expect(priced.length).toBe(10);
    for (let i = 1; i < priced.length; i++) expect(priced[i].price.customerPrice).toBeGreaterThanOrEqual(priced[i - 1].price.customerPrice);
    const m = priced.find((p) => p.supplier.code === 'mozio')!;
    expect(m.price.commission).toBe(Math.round(m.offer.price * 0.1));
    expect(m.price.earnings).toBe(m.price.commission + m.price.markup);
  });

  it('mock offers are deterministic for the same search', () => {
    expect(mockOffers('curb', { ...req, service: 'ride_now' }, 'USD')).toEqual(mockOffers('curb', { ...req, service: 'ride_now' }, 'USD'));
  });
});
