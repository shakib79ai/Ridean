import { Logger } from '@nestjs/common';

export interface HttpRequest {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  timeoutMs?: number;
  /** Retries on network errors and 5xx/429 (idempotent calls only) */
  retries?: number;
}

export interface HttpResponse<T = unknown> {
  status: number;
  data: T;
  headers: Headers;
}

/** Small fetch wrapper with timeouts, retries and logging, shared by all supplier adapters. */
export class HttpClient {
  private readonly log = new Logger('SupplierHttp');
  constructor(private readonly defaultTimeoutMs: number) {}

  async request<T = unknown>(req: HttpRequest): Promise<HttpResponse<T>> {
    const url = new URL(req.url);
    for (const [k, v] of Object.entries(req.query ?? {})) if (v !== undefined) url.searchParams.set(k, String(v));
    const attempts = (req.retries ?? 0) + 1;
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), req.timeoutMs ?? this.defaultTimeoutMs);
      const started = Date.now();
      try {
        const res = await fetch(url, {
          method: req.method ?? 'GET',
          headers: { Accept: 'application/json', ...(req.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...req.headers },
          body: req.body === undefined ? undefined : JSON.stringify(req.body),
          signal: ctrl.signal,
        });
        const text = await res.text();
        let data: unknown = text;
        try {
          data = text ? JSON.parse(text) : undefined;
        } catch {
          /* keep raw text */
        }
        this.log.debug(`${req.method ?? 'GET'} ${url.host}${url.pathname} → ${res.status} in ${Date.now() - started}ms`);
        if ((res.status >= 500 || res.status === 429) && i < attempts - 1) {
          await sleep(300 * 2 ** i);
          continue;
        }
        return { status: res.status, data: data as T, headers: res.headers };
      } catch (e) {
        lastErr = e;
        if (i < attempts - 1) await sleep(300 * 2 ** i);
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
