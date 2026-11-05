import { boolean, doublePrecision, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import type { GeoPoint, Passenger, PriceBreakdown, QuoteSearchRequest, Vehicle } from '@ridean/shared';

const ts = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phone: text('phone'),
    role: text('role').$type<'customer' | 'ops' | 'finance' | 'admin'>().notNull().default('customer'),
    stripeCustomerId: text('stripe_customer_id'),
    /** Notification, ride, privacy and display preferences (see UserSettings in @ridean/shared) */
    settings: jsonb('settings').$type<Record<string, unknown>>().notNull().default({}),
    deletedAt: ts('deleted_at'),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('users_email_uq').on(t.email), index('users_phone_idx').on(t.phone)],
);

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  address: text('address').notNull(),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const suppliers = pgTable(
  'suppliers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    /** Adapter key in the integration registry, e.g. curb, sixt, mozio, priceline, hertz, generic_http, manual */
    adapter: text('adapter').notNull(),
    services: text('services').array().notNull().default([]),
    active: boolean('active').notNull().default(true),
    inventoryType: text('inventory_type').$type<'net' | 'gross'>().notNull().default('net'),
    commissionPct: doublePrecision('commission_pct').notNull().default(0),
    markupType: text('markup_type').$type<'percent' | 'fixed'>().notNull().default('percent'),
    /** Percent, or minor units when markupType = fixed */
    markupValue: doublePrecision('markup_value').notNull().default(0),
    paymentFlow: text('payment_flow').$type<'corporate_card' | 'ach_debit' | 'supplier_collects'>().notNull().default('corporate_card'),
    settlementCycle: text('settlement_cycle').$type<'per_booking' | 'weekly' | 'monthly'>().notNull().default('monthly'),
    paymentTerms: text('payment_terms'),
    contactEmail: text('contact_email'),
    /** Adapter-specific settings (endpoints, field mappings, vehicle mapping…) */
    config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('suppliers_code_uq').on(t.code)],
);

export const quotes = pgTable(
  'quotes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    searchId: uuid('search_id').notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    service: text('service').notNull(),
    supplierId: uuid('supplier_id').notNull().references(() => suppliers.id),
    supplierOfferId: text('supplier_offer_id').notNull(),
    request: jsonb('request').$type<QuoteSearchRequest>().notNull(),
    vehicle: jsonb('vehicle').$type<Vehicle>().notNull(),
    price: jsonb('price').$type<PriceBreakdown>().notNull(),
    meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),
    expiresAt: ts('expires_at').notNull(),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [index('quotes_search_idx').on(t.searchId)],
);

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reference: text('reference').notNull(),
    userId: uuid('user_id').notNull().references(() => users.id),
    quoteId: uuid('quote_id').references(() => quotes.id),
    service: text('service').notNull(),
    status: text('status').notNull().default('pending_payment'),
    supplierId: uuid('supplier_id').notNull().references(() => suppliers.id),
    supplierReference: text('supplier_reference'),
    pickup: jsonb('pickup').$type<GeoPoint>().notNull(),
    dropoff: jsonb('dropoff').$type<GeoPoint>(),
    pickupAt: ts('pickup_at'),
    tripType: text('trip_type'),
    returnAt: ts('return_at'),
    flightNumber: text('flight_number'),
    passenger: jsonb('passenger').$type<Passenger>().notNull(),
    vehicle: jsonb('vehicle').$type<Vehicle>().notNull(),
    currency: text('currency').notNull(),
    supplierPrice: integer('supplier_price').notNull(),
    commission: integer('commission').notNull(),
    markup: integer('markup').notNull(),
    customerPrice: integer('customer_price').notNull(),
    earnings: integer('earnings').notNull(),
    supplierPayable: integer('supplier_payable').notNull(),
    paymentFlow: text('payment_flow').notNull(),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    paidWithWallet: boolean('paid_with_wallet').notNull().default(false),
    /** card | wallet | business | supplier */
    paymentMethod: text('payment_method').notNull().default('card'),
    businessAccountId: uuid('business_account_id'),
    passengers: integer('passengers'),
    luggage: integer('luggage'),
    /** Tip for the chauffeur (minor units), included in customer_price and owed to the supplier */
    tip: integer('tip').notNull().default(0),
    /** Promo discount (minor units), already deducted from customer_price and earnings */
    discount: integer('discount').notNull().default(0),
    promoCode: text('promo_code'),
    notes: text('notes'),
    cancelReason: text('cancel_reason'),
    supplierMeta: jsonb('supplier_meta').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: ts('created_at').notNull().defaultNow(),
    updatedAt: ts('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('bookings_reference_uq').on(t.reference),
    index('bookings_user_idx').on(t.userId),
    index('bookings_supplier_idx').on(t.supplierId),
    index('bookings_created_idx').on(t.createdAt),
  ],
);

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id),
  userId: uuid('user_id').references(() => users.id),
  provider: text('provider').notNull(),
  providerRef: text('provider_ref'),
  kind: text('kind').$type<'charge' | 'refund' | 'wallet_topup' | 'wallet_spend'>().notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const ledgerEntries = pgTable(
  'ledger_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    supplierId: uuid('supplier_id').notNull().references(() => suppliers.id),
    bookingId: uuid('booking_id').references(() => bookings.id),
    kind: text('kind').$type<'booking' | 'payment' | 'invoice' | 'adjustment' | 'refund'>().notNull(),
    reference: text('reference').notNull(),
    description: text('description').notNull(),
    debit: integer('debit').notNull().default(0),
    credit: integer('credit').notNull().default(0),
    currency: text('currency').notNull(),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [index('ledger_supplier_idx').on(t.supplierId, t.createdAt)],
);

export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  description: text('description').notNull(),
  reference: text('reference'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  type: text('type').notNull(),
  receivedAt: ts('received_at').notNull().defaultNow(),
});

export const bookingMessages = pgTable(
  'booking_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
    sender: text('sender').$type<'customer' | 'chauffeur' | 'system'>().notNull(),
    body: text('body').notNull(),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [index('booking_messages_booking_idx').on(t.bookingId, t.createdAt)],
);

export const businessAccounts = pgTable('business_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  /** Monthly spend budget in minor units (0 = no budget) */
  monthlyBudget: integer('monthly_budget').notNull().default(0),
  /** { requirePurpose, businessClassOnly, approvalOver } */
  policy: jsonb('policy').$type<{ requirePurpose?: boolean; businessClassOnly?: boolean; approvalOver?: number }>().notNull().default({}),
  billingEmail: text('billing_email'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const businessMembers = pgTable(
  'business_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id').notNull().references(() => businessAccounts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    name: text('name'),
    role: text('role').$type<'admin' | 'member'>().notNull().default('member'),
    status: text('status').$type<'active' | 'invited'>().notNull().default('invited'),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('business_members_uq').on(t.accountId, t.email)],
);

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  topic: text('topic').notNull(),
  message: text('message').notNull(),
  handled: boolean('handled').notNull().default(false),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
export type SupplierRow = typeof suppliers.$inferSelect;
export type QuoteRow = typeof quotes.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;
export type LedgerRow = typeof ledgerEntries.$inferSelect;
