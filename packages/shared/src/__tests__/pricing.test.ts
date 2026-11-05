import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceQuote, takeRate } from '../pricing';

test('net-rate supplier: earnings = markup, we owe supplier the net cost', () => {
  const p = priceQuote(10000, { inventoryType: 'net', commissionPct: 0, markupType: 'percent', markupValue: 12, paymentFlow: 'corporate_card', settlementCycle: 'monthly' });
  assert.equal(p.markup, 1200);
  assert.equal(p.commission, 0);
  assert.equal(p.customerPrice, 11200);
  assert.equal(p.earnings, 1200);
  assert.equal(p.supplierPayable, 10000);
  assert.equal(p.owedToSupplier, 10000);
  assert.equal(p.owedToRidean, 0);
});

test('gross-rate supplier: earnings = commission + markup, supplier keeps gross − commission', () => {
  const p = priceQuote(7200, { inventoryType: 'gross', commissionPct: 10, markupType: 'percent', markupValue: 8, paymentFlow: 'ach_debit', settlementCycle: 'weekly' });
  assert.equal(p.commission, 720);
  assert.equal(p.markup, 576);
  assert.equal(p.customerPrice, 7776);
  assert.equal(p.earnings, 1296);
  assert.equal(p.supplierPayable, 6480);
});

test('supplier collects: supplier owes us commission + markup', () => {
  const p = priceQuote(2460, { inventoryType: 'gross', commissionPct: 7, markupType: 'fixed', markupValue: 250, paymentFlow: 'supplier_collects', settlementCycle: 'monthly' });
  assert.equal(p.collectedBy, 'supplier');
  assert.equal(p.commission, 172);
  assert.equal(p.markup, 250);
  assert.equal(p.owedToRidean, 422);
  assert.equal(p.owedToSupplier, 0);
  assert.equal(takeRate(p), 15.6);
});

test('rejects invalid prices', () => {
  assert.throws(() => priceQuote(-1, { inventoryType: 'net', commissionPct: 0, markupType: 'percent', markupValue: 0, paymentFlow: 'corporate_card', settlementCycle: 'monthly' }));
});
