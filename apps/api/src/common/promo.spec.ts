import { promoDiscount, promoPercent } from './promo';
import { publicPrice } from './redact';

describe('promo codes', () => {
  it('matches codes case-insensitively from the env list', () => {
    expect(promoPercent('ridean10', 'RIDEAN10:10,WELCOME15:15')).toBe(10);
    expect(promoPercent(' welcome15 ', 'RIDEAN10:10,WELCOME15:15')).toBe(15);
    expect(promoPercent('NOPE', 'RIDEAN10:10')).toBe(0);
    expect(promoPercent(undefined, 'RIDEAN10:10')).toBe(0);
  });

  it('ignores malformed percentages', () => {
    expect(promoPercent('BAD', 'BAD:abc')).toBe(0);
    expect(promoPercent('BIG', 'BIG:150')).toBe(0);
  });

  it('never discounts more than Ridean earns on the booking', () => {
    expect(promoDiscount(10_000, 2_000, 10)).toBe(1_000);
    expect(promoDiscount(10_000, 500, 10)).toBe(500);
    expect(promoDiscount(10_000, 2_000, 0)).toBe(0);
  });
});

describe('customer price redaction', () => {
  it('keeps only what the customer pays', () => {
    const p = publicPrice({ currency: 'USD', supplierPrice: 8000, commission: 0, markup: 1200, customerPrice: 9200, earnings: 1200, supplierPayable: 8000, collectedBy: 'ridean', owedToSupplier: 8000, owedToRidean: 0 });
    expect(p.customerPrice).toBe(9200);
    expect(p.collectedBy).toBe('ridean');
    expect([p.supplierPrice, p.markup, p.earnings, p.supplierPayable, p.owedToSupplier]).toEqual([0, 0, 0, 0, 0]);
  });
});
