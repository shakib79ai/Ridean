import type { ServiceKey, VehicleClassKey } from './services';

/** All money is stored and sent as integer minor units (cents) plus an ISO currency. */
export interface Money {
  amount: number;
  currency: string;
}

export interface GeoPoint {
  address: string;
  lat?: number;
  lng?: number;
  /** IATA code when the place is an airport, e.g. "JFK" */
  iata?: string;
  terminal?: string;
  placeId?: string;
}

export type TripType = 'one_way' | 'return';

export interface QuoteSearchRequest {
  service: ServiceKey;
  pickup: GeoPoint;
  dropoff?: GeoPoint;
  /** ISO datetime; omitted = as soon as possible (Ride Now only) */
  pickupAt?: string;
  tripType?: TripType;
  returnAt?: string;
  flightNumber?: string;
  passengers?: number;
  luggage?: number;
  hours?: number;
  rentalPickupAt?: string;
  rentalReturnAt?: string;
  returnLocation?: GeoPoint;
  vehicleClass?: VehicleClassKey;
  currency?: string;
}

export type InventoryType = 'net' | 'gross';
export type MarkupType = 'percent' | 'fixed';
/**
 * How money moves for a supplier:
 *  - corporate_card: Ridean charges the customer, pays the supplier with the company card
 *  - ach_debit: Ridean charges the customer, supplier debits Ridean's bank account per cycle
 *  - supplier_collects: the customer's card is charged on the supplier's merchant account;
 *    the supplier then owes Ridean commission + markup
 */
export type PaymentFlow = 'corporate_card' | 'ach_debit' | 'supplier_collects';
export type SettlementCycle = 'per_booking' | 'weekly' | 'monthly';

export interface SupplierCommercialTerms {
  inventoryType: InventoryType;
  /** Percentage (0–100) the supplier pays us on gross-rate inventory. Ignored for net. */
  commissionPct: number;
  markupType: MarkupType;
  /** Percent (0–100) or fixed minor units depending on markupType */
  markupValue: number;
  paymentFlow: PaymentFlow;
  settlementCycle: SettlementCycle;
  paymentTerms?: string;
}

export interface PriceBreakdown {
  currency: string;
  /** Price the supplier gave us (net cost or gross price), minor units */
  supplierPrice: number;
  commission: number;
  markup: number;
  /** What the customer pays */
  customerPrice: number;
  /** commission + markup */
  earnings: number;
  /** What the supplier keeps: net cost, or gross minus commission */
  supplierPayable: number;
  /** Who charges the customer */
  collectedBy: 'ridean' | 'supplier';
  /** When the supplier collects, they owe us `earnings`; otherwise we owe them `supplierPayable`. */
  owedToSupplier: number;
  owedToRidean: number;
}

export interface Vehicle {
  class: VehicleClassKey;
  name: string;
  passengers: number;
  bags: number;
  imageUrl?: string;
}

export interface Quote {
  id: string;
  service: ServiceKey;
  supplierId: string;
  supplierName: string;
  vehicle: Vehicle;
  price: PriceBreakdown;
  etaMinutes?: number;
  durationMinutes?: number;
  distanceKm?: number;
  cancellation: string;
  inclusions: string[];
  expiresAt: string;
}

export type BookingStatus =
  | 'pending_payment'
  | 'payment_authorised'
  | 'confirmed'
  | 'driver_assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface Passenger {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  reference: string;
  service: ServiceKey;
  status: BookingStatus;
  supplierId: string;
  supplierName: string;
  supplierReference?: string;
  pickup: GeoPoint;
  dropoff?: GeoPoint;
  pickupAt?: string;
  tripType?: TripType;
  returnAt?: string;
  flightNumber?: string;
  passenger: Passenger;
  vehicle: Vehicle;
  price: PriceBreakdown;
  paymentFlow: PaymentFlow;
  /** How the customer paid: card, wallet, business account, or directly to the supplier */
  paymentMethod?: 'card' | 'wallet' | 'business' | 'supplier';
  passengers?: number;
  luggage?: number;
  /** Chauffeur tip included in price.customerPrice (minor units) */
  tip?: number;
  /** Promo discount already deducted from price.customerPrice (minor units) */
  discount?: number;
  promoCode?: string;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  quoteId: string;
  passenger: Passenger;
  flightNumber?: string;
  notes?: string;
  /** Stripe payment method id to charge (saved card); omit to collect with Payment Element */
  paymentMethodId?: string;
  payWithWallet?: boolean;
  /** Bill the user's Ridean Business account (monthly invoice) */
  payWithBusiness?: boolean;
  /** Required when the business travel policy asks for a trip purpose */
  tripPurpose?: string;
  promoCode?: string;
  /** Chauffeur tip in minor units (only when Ridean collects payment) */
  tip?: number;
}

export interface CreateBookingResponse {
  booking: Booking;
  /** Stripe PaymentIntent client secret when Ridean collects payment */
  clientSecret?: string;
  /** Hosted payment page when the supplier collects payment on their merchant account */
  supplierPaymentUrl?: string;
}

export type UserRole = 'customer' | 'ops' | 'finance' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface WalletSummary {
  currency: string;
  balance: number;
  transactions: { id: string; amount: number; description: string; createdAt: string }[];
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  services: ServiceKey[];
  active: boolean;
  terms: SupplierCommercialTerms;
  contactEmail?: string;
  /** Adapter used to talk to the supplier API, e.g. "curb", "sixt", "mozio", "generic_http" */
  adapter: string;
}

export type LedgerKind = 'booking' | 'payment' | 'invoice' | 'adjustment' | 'refund';

export interface LedgerEntry {
  id: string;
  supplierId: string;
  bookingId?: string;
  kind: LedgerKind;
  reference: string;
  description: string;
  /** Increases what we owe the supplier */
  debit: number;
  /** Payment to the supplier, or an amount the supplier owes us */
  credit: number;
  /** Running balance: > 0 we owe the supplier, < 0 the supplier owes us */
  balance: number;
  currency: string;
  createdAt: string;
}

export interface ReportTotals {
  bookings: number;
  gross: number;
  supplierCost: number;
  commission: number;
  markup: number;
  earnings: number;
  owedToSuppliers: number;
  owedToRidean: number;
}

export interface TransactionReport {
  currency: string;
  from: string;
  to: string;
  groupBy: 'supplier' | 'service';
  totals: ReportTotals;
  groups: {
    key: string;
    label: string;
    totals: ReportTotals;
    children: { key: string; label: string; totals: ReportTotals }[];
  }[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ---- Website account features

export interface UserSettings {
  notifications: { tripUpdates: boolean; flightAlerts: boolean; offers: boolean };
  ride: { quietRide: boolean; receiptsByEmail: boolean; shareStatus: boolean };
  privacy: { shareLocation: boolean; personalisedOffers: boolean; analytics: boolean };
  preferences: { language: string; currency: string; appearance: 'dark' | 'light' | 'system' };
  defaultPaymentMethod?: string;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  notifications: { tripUpdates: true, flightAlerts: true, offers: false },
  ride: { quietRide: false, receiptsByEmail: true, shareStatus: false },
  privacy: { shareLocation: true, personalisedOffers: false, analytics: false },
  preferences: { language: 'en-US', currency: 'USD', appearance: 'dark' },
};

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

export interface Driver {
  name?: string;
  phone?: string;
  vehicle?: string;
  plate?: string;
  rating?: number;
  photoUrl?: string;
}

export interface BookingLiveStatus {
  status: BookingStatus;
  driver?: Driver;
  etaMinutes?: number;
  /** Timeline of what has happened so far */
  events: { key: 'confirmed' | 'driver_assigned' | 'on_the_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'; label: string; at?: string; done: boolean }[];
  /** Whether messages can be relayed to the chauffeur for this booking */
  messaging: boolean;
}

export interface BookingMessage {
  id: string;
  sender: 'customer' | 'chauffeur' | 'system';
  body: string;
  createdAt: string;
}

export interface UpdateBookingRequest {
  pickupAt?: string;
  flightNumber?: string;
  passengers?: number;
  luggage?: number;
  notes?: string;
  passenger?: Partial<Passenger>;
}

export interface PromoResult {
  code: string;
  percentOff: number;
  discount: number;
  customerPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  bookingId: string;
  reference: string;
  issuedAt: string;
  service: ServiceKey;
  description: string;
  paidWith: string;
  currency: string;
  lines: { label: string; amount: number }[];
  total: number;
  billedTo: { name: string; email: string; company?: string };
}

export interface BusinessPolicy {
  requirePurpose: boolean;
  businessClassOnly: boolean;
  /** Bookings above this amount (minor units) need an account admin; 0 = no limit */
  approvalOver: number;
}

export interface BusinessMember {
  id: string;
  name?: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'invited';
  tripsThisMonth: number;
  spendThisMonth: number;
}

export interface BusinessAccount {
  id: string;
  name: string;
  role: 'admin' | 'member';
  monthlyBudget: number;
  spendThisMonth: number;
  tripsThisMonth: number;
  currency: string;
  policy: BusinessPolicy;
  billingEmail?: string;
  members: BusinessMember[];
}

export interface ContactRequest {
  name: string;
  email: string;
  topic: string;
  message: string;
}
