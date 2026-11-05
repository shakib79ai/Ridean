import type { QuoteSearchRequest } from '@ridean/shared';

/** Encodes a search into a URL-safe string so results pages can be shared and reloaded. */
export function encodeSearch(req: QuoteSearchRequest): string {
  const json = JSON.stringify(req);
  const b64 = typeof window === 'undefined' ? Buffer.from(json, 'utf8').toString('base64') : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeSearch(s: string | null | undefined): QuoteSearchRequest | null {
  if (!s) return null;
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof window === 'undefined' ? Buffer.from(b64, 'base64').toString('utf8') : decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as QuoteSearchRequest;
  } catch {
    return null;
  }
}

/** Converts a value from <input type="datetime-local"> to an ISO string with the browser's offset. */
export function localToIso(v: string): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Default value for datetime-local inputs: today + offset hours, rounded to 15 minutes. */
export function defaultLocal(hoursAhead = 24): string {
  const d = new Date(Date.now() + hoursAhead * 3_600_000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
