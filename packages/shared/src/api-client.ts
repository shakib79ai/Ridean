import type {
  AuthResponse,
  Booking,
  CreateBookingRequest,
  CreateBookingResponse,
  LedgerEntry,
  Paginated,
  Quote,
  QuoteSearchRequest,
  SavedAddress,
  Supplier,
  SupplierCommercialTerms,
  TransactionReport,
  User,
  WalletSummary,
  UpdateBookingRequest,
  BookingLiveStatus,
  BookingMessage,
  PromoResult,
  Invoice,
  UserSettings,
  SavedCard,
  BusinessAccount,
  BusinessPolicy,
  ContactRequest,
  AdminCreateBookingRequest,
  AdminDashboard,
  AdminDriver,
  AdminUsersResponse,
  PlatformSettings,
  StaffRole,
  TeamMember,
} from './types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => string | null | undefined;
  onUnauthorized?: () => void;
  fetchImpl?: typeof fetch;
}

/** Typed client for the Ridean REST API, used by the website, PWA and admin. */
export class RideanApi {
  constructor(private opts: ApiClientOptions) {}

  async request<T>(method: string, path: string, body?: unknown, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(path.replace(/^\//, ''), this.opts.baseUrl.endsWith('/') ? this.opts.baseUrl : this.opts.baseUrl + '/');
    if (query) for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = this.opts.getToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await (this.opts.fetchImpl ?? fetch)(url.toString(), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 401) this.opts.onUnauthorized?.();
    const text = await res.text();
    const data = text ? safeJson(text) : undefined;
    if (!res.ok) {
      const msg = (data as { message?: string | string[] } | undefined)?.message;
      throw new ApiError(res.status, Array.isArray(msg) ? msg.join(', ') : msg || res.statusText, data);
    }
    return data as T;
  }

  // ---- auth
  register(input: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    return this.request<AuthResponse>('POST', '/auth/register', input);
  }
  login(email: string, password: string) {
    return this.request<AuthResponse>('POST', '/auth/login', { email, password });
  }
  loginWithPhone(phone: string, password: string) {
    return this.request<AuthResponse>('POST', '/auth/login', { phone, password });
  }
  me() {
    return this.request<User>('GET', '/me');
  }
  updateMe(input: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>) {
    return this.request<User>('PATCH', '/me', input);
  }

  // ---- catalogue & quotes
  services() {
    return this.request<{ key: string; label: string; slug: string }[]>('GET', '/services');
  }
  searchQuotes(input: QuoteSearchRequest) {
    return this.request<{ searchId: string; quotes: Quote[]; errors: { supplier: string; message: string }[] }>('POST', '/quotes/search', input);
  }
  getQuote(id: string) {
    return this.request<Quote>('GET', `/quotes/${id}`);
  }

  // ---- bookings
  createBooking(input: CreateBookingRequest) {
    return this.request<CreateBookingResponse>('POST', '/bookings', input);
  }
  myBookings(params: { status?: string; page?: number } = {}) {
    return this.request<Paginated<Booking>>('GET', '/bookings', undefined, params);
  }
  getBooking(id: string) {
    return this.request<Booking>('GET', `/bookings/${id}`);
  }
  cancelBooking(id: string, reason?: string) {
    return this.request<Booking>('POST', `/bookings/${id}/cancel`, { reason });
  }

  // ---- account
  addresses() {
    return this.request<SavedAddress[]>('GET', '/me/addresses');
  }
  addAddress(input: Omit<SavedAddress, 'id'>) {
    return this.request<SavedAddress>('POST', '/me/addresses', input);
  }
  deleteAddress(id: string) {
    return this.request<void>('DELETE', `/me/addresses/${id}`);
  }
  paymentMethods() {
    return this.request<SavedCard[]>('GET', '/payments/methods');
  }
  createSetupIntent() {
    return this.request<{ clientSecret: string }>('POST', '/payments/setup-intent');
  }
  removePaymentMethod(id: string) {
    return this.request<void>('DELETE', `/payments/methods/${id}`);
  }
  wallet() {
    return this.request<WalletSummary>('GET', '/wallet');
  }
  topUpWallet(amount: number) {
    return this.request<{ clientSecret: string }>('POST', '/wallet/top-up', { amount });
  }

  // ---- admin
  /** GET a non-JSON resource (e.g. CSV) with auth. */
  async text(path: string, query?: Record<string, string | number | undefined>): Promise<string> {
    const url = new URL(path.replace(/^\//, ''), this.opts.baseUrl.endsWith('/') ? this.opts.baseUrl : this.opts.baseUrl + '/');
    if (query) for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    const token = this.opts.getToken?.();
    const res = await (this.opts.fetchImpl ?? fetch)(url.toString(), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (res.status === 401) this.opts.onUnauthorized?.();
    if (!res.ok) throw new ApiError(res.status, res.statusText);
    return res.text();
  }

  // ---- booking extras
  updateBooking(id: string, input: UpdateBookingRequest) {
    return this.request<Booking>('PATCH', `/bookings/${id}`, input);
  }
  bookingStatus(id: string) {
    return this.request<BookingLiveStatus>('GET', `/bookings/${id}/status`);
  }
  bookingMessages(id: string) {
    return this.request<BookingMessage[]>('GET', `/bookings/${id}/messages`);
  }
  sendBookingMessage(id: string, body: string) {
    return this.request<BookingMessage>('POST', `/bookings/${id}/messages`, { body });
  }
  applyPromo(quoteId: string, code: string) {
    return this.request<PromoResult>('POST', `/quotes/${quoteId}/promo`, { code });
  }

  // ---- invoices
  invoices(params: { month?: string } = {}) {
    return this.request<Invoice[]>('GET', '/invoices', undefined, params);
  }
  invoice(bookingId: string) {
    return this.request<Invoice>('GET', `/invoices/${bookingId}`);
  }

  // ---- settings & account
  settings() {
    return this.request<UserSettings>('GET', '/me/settings');
  }
  updateSettings(input: Partial<UserSettings>) {
    return this.request<UserSettings>('PATCH', '/me/settings', input);
  }
  changePassword(currentPassword: string, newPassword: string) {
    return this.request<void>('POST', '/me/password', { currentPassword, newPassword });
  }
  exportData() {
    return this.request<Record<string, unknown>>('GET', '/me/export');
  }
  deleteAccount(password: string) {
    return this.request<void>('POST', '/me/delete', { password });
  }
  setDefaultPaymentMethod(id: string) {
    return this.request<void>('POST', `/payments/methods/${id}/default`);
  }
  /** Development only (PAYMENTS_MODE=simulated): store a test card without Stripe. */
  addSimulatedCard(input: { number: string; expMonth: number; expYear: number; makeDefault?: boolean }) {
    return this.request<SavedCard>('POST', '/payments/methods/simulated', input);
  }

  // ---- business
  business() {
    return this.request<BusinessAccount | null>('GET', '/business');
  }
  createBusiness(input: { name: string; monthlyBudget?: number; billingEmail?: string }) {
    return this.request<BusinessAccount>('POST', '/business', input);
  }
  updateBusiness(input: { name?: string; monthlyBudget?: number; billingEmail?: string; policy?: Partial<BusinessPolicy> }) {
    return this.request<BusinessAccount>('PATCH', '/business', input);
  }
  inviteBusinessMember(input: { email: string; name?: string; role?: 'admin' | 'member' }) {
    return this.request<BusinessAccount>('POST', '/business/members', input);
  }
  removeBusinessMember(id: string) {
    return this.request<BusinessAccount>('DELETE', `/business/members/${id}`);
  }

  // ---- public
  contact(input: ContactRequest) {
    return this.request<{ ok: true }>('POST', '/contact', input);
  }

  admin = {
    dashboard: () => this.request<AdminDashboard>('GET', '/admin/dashboard'),
    createBooking: (input: AdminCreateBookingRequest) => this.request<Booking>('POST', '/admin/bookings', input),
    drivers: () => this.request<AdminDriver[]>('GET', '/admin/drivers'),
    bookingStatus: (id: string) => this.request<BookingLiveStatus>('GET', `/admin/bookings/${id}/status`),
    settings: () => this.request<PlatformSettings>('GET', '/admin/settings'),
    updateSettings: (patch: Partial<Omit<PlatformSettings, 'updatedAt'>>) => this.request<PlatformSettings>('PATCH', '/admin/settings', patch),
    team: () => this.request<TeamMember[]>('GET', '/admin/team'),
    setTeamRole: (input: { email: string; role: StaffRole | 'customer' }) => this.request<TeamMember[]>('PATCH', '/admin/team', input),
    bookings: (params: { status?: string; service?: string; supplierId?: string; q?: string; page?: number; pageSize?: number; from?: string; to?: string; userId?: string } = {}) =>
      this.request<Paginated<Booking>>('GET', '/admin/bookings', undefined, params),
    booking: (id: string) => this.request<Booking>('GET', `/admin/bookings/${id}`),
    updateBookingStatus: (id: string, status: string) => this.request<Booking>('PATCH', `/admin/bookings/${id}/status`, { status }),
    users: (params: { q?: string; page?: number; filter?: 'active' | 'new' | 'deleted' } = {}) => this.request<AdminUsersResponse>('GET', '/admin/users', undefined, params),
    suppliers: () => this.request<Supplier[]>('GET', '/admin/suppliers'),
    supplier: (id: string) => this.request<Supplier & { balance: number }>('GET', `/admin/suppliers/${id}`),
    createSupplier: (input: Omit<Supplier, 'id'>) => this.request<Supplier>('POST', '/admin/suppliers', input),
    updateSupplier: (id: string, input: Partial<Omit<Supplier, 'id' | 'terms'>> & { terms?: Partial<SupplierCommercialTerms> }) =>
      this.request<Supplier>('PATCH', `/admin/suppliers/${id}`, input),
    ledger: (supplierId: string, params: { kind?: string } = {}) =>
      this.request<LedgerEntry[]>('GET', `/admin/suppliers/${supplierId}/ledger`, undefined, params),
    recordPayment: (supplierId: string, input: { amount: number; direction: 'paid_to_supplier' | 'received_from_supplier'; reference: string; method: string; note?: string }) =>
      this.request<LedgerEntry>('POST', `/admin/suppliers/${supplierId}/ledger/payments`, input),
    adjustment: (supplierId: string, input: { debit: number; credit: number; reference: string; description: string }) =>
      this.request<LedgerEntry>('POST', `/admin/suppliers/${supplierId}/ledger/adjustments`, input),
    /** Downloads the transactions CSV with the caller's token (returns the raw text). */
    transactionsCsv: (params: { from?: string; to?: string; supplierId?: string; service?: string } = {}) => this.text('/admin/reports/transactions.csv', params),
    earnings: (params: { from?: string; to?: string } = {}) => this.request<Record<string, unknown>>('GET', '/admin/reports/earnings', undefined, params),
    transactionReport: (params: { from?: string; to?: string; groupBy?: 'supplier' | 'service'; supplierId?: string; service?: string } = {}) =>
      this.request<TransactionReport>('GET', '/admin/reports/transactions', undefined, params),
    bookingMessages: (id: string) => this.request<BookingMessage[]>('GET', `/admin/bookings/${id}/messages`),
    contactMessages: (params: { handled?: 'true' | 'false' } = {}) =>
      this.request<{ id: string; name: string; email: string; topic: string; message: string; handled: boolean; userId: string | null; createdAt: string }[]>('GET', '/admin/contact-messages', undefined, params),
    markContactMessage: (id: string, handled: boolean) => this.request<unknown>('PATCH', `/admin/contact-messages/${id}`, { handled }),
    transactions: (params: { from?: string; to?: string; supplierId?: string; service?: string; page?: number } = {}) =>
      this.request<Paginated<Booking>>('GET', '/admin/reports/transactions/rows', undefined, params),
  };
}

function safeJson(t: string): unknown {
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}
