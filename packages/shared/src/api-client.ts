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
    return this.request<{ id: string; brand: string; last4: string; expMonth: number; expYear: number }[]>('GET', '/payments/methods');
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

  admin = {
    dashboard: () => this.request<Record<string, unknown>>('GET', '/admin/dashboard'),
    bookings: (params: { status?: string; service?: string; supplierId?: string; q?: string; page?: number } = {}) =>
      this.request<Paginated<Booking>>('GET', '/admin/bookings', undefined, params),
    booking: (id: string) => this.request<Booking>('GET', `/admin/bookings/${id}`),
    updateBookingStatus: (id: string, status: string) => this.request<Booking>('PATCH', `/admin/bookings/${id}/status`, { status }),
    users: (params: { q?: string; page?: number } = {}) => this.request<Paginated<User>>('GET', '/admin/users', undefined, params),
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
