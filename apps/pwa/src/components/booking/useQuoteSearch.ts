'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VEHICLE_CLASSES, formatMoney, type CoreServiceKey, type GeoPoint, type Quote, type QuoteSearchRequest, type SavedCard } from '@ridean/shared';
import { decodeSearch, defaultLocal, encodeSearch, localToIso, useRidean } from '@ridean/web-core';
import { useToast } from '@/components/site/ui';
import { updateDraft } from '@/components/checkout/draft';

export type SupplierError = { supplier: string; message: string };

export interface QuoteSearchState {
  /** null = no search has run yet */
  quotes: Quote[] | null;
  errors: SupplierError[];
  error: string;
  loading: boolean;
  selected: Quote | null;
  select: (id: string) => void;
  /** Runs a search and keeps ?s= in sync so the result is shareable / survives a reload */
  search: (req: QuoteSearchRequest) => void;
  /** The search decoded from ?s= on first render (only when it is for this service) */
  initial: QuoteSearchRequest | null;
  /** The last search that was run */
  last: QuoteSearchRequest | null;
  /** Saves the trip (and optional notes) for checkout and opens /checkout/<quoteId> */
  confirm: (quote?: Quote | null, extra?: { notes?: string }) => void;
}

/**
 * One search + quotes engine for every booking screen (ported from the website). Screens own their
 * form fields and call `search(request)`; this hook calls the API, tracks loading / supplier errors /
 * selection, keeps ?s= in sync, auto-runs the search from ?s= and sends the user to checkout.
 */
export function useQuoteSearch(service: CoreServiceKey): QuoteSearchState {
  const { api } = useRidean();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const s = params.get('s');
  const initial = useMemo(() => {
    const req = decodeSearch(s);
    return req && req.service === service && req.pickup?.address ? req : null;
    // Only the first ?s= pre-fills the form; later URL changes come from our own searches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [errors, setErrors] = useState<SupplierError[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [last, setLast] = useState<QuoteSearchRequest | null>(null);
  const seq = useRef(0);

  const search = useCallback(
    (req: QuoteSearchRequest) => {
      const id = ++seq.current;
      setLast(req);
      setLoading(true);
      setError('');
      setErrors([]);
      router.replace(`${pathname}?s=${encodeSearch(req)}`, { scroll: false });
      api
        .searchQuotes(req)
        .then((r) => {
          if (id !== seq.current) return;
          setQuotes(r.quotes);
          setErrors(r.errors ?? []);
          setSelectedId(r.quotes[0]?.id ?? null);
        })
        .catch((e: Error) => {
          if (id !== seq.current) return;
          setQuotes([]);
          setSelectedId(null);
          setError(e.message || 'We could not load prices. Please try again.');
        })
        .finally(() => id === seq.current && setLoading(false));
    },
    [api, pathname, router],
  );

  // Run the shared search once on load.
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current || !initial) return;
    ran.current = true;
    search(initial);
  }, [initial, search]);

  const selected = quotes?.find((q) => q.id === selectedId) ?? null;

  const confirm = useCallback(
    (quote?: Quote | null, extra?: { notes?: string }) => {
      const q = quote ?? selected;
      if (!q) return;
      const notes = extra?.notes?.trim();
      updateDraft(q.id, {
        ...(last ? { search: last } : {}),
        ...(last?.flightNumber ? { flightNumber: last.flightNumber } : {}),
        ...(notes ? { notes } : {}),
      });
      router.push(`/checkout/${q.id}`);
    },
    [router, selected, last],
  );

  return { quotes, errors, error, loading, selected, select: setSelectedId, search, initial, last, confirm };
}

// ---------------------------------------------------------------- places & geolocation

export interface Place {
  address: string;
  lat?: number;
  lng?: number;
}

export const emptyPlace: Place = { address: '' };
export const placeFrom = (g?: GeoPoint | null): Place => (g ? { address: g.address, lat: g.lat, lng: g.lng } : emptyPlace);

/** Picks up a 3-letter airport code typed in brackets, e.g. "Heathrow (LHR)". */
function airportCode(s: string): { iata?: string } {
  const m = s.match(/\(([A-Z]{3})\)/) ?? s.match(/^([A-Z]{3})\b/);
  return m ? { iata: m[1] } : {};
}

export function toGeo(p: Place): GeoPoint {
  const g: GeoPoint = { address: p.address.trim(), ...airportCode(p.address) };
  if (p.lat !== undefined && p.lng !== undefined) {
    g.lat = p.lat;
    g.lng = p.lng;
  }
  return g;
}

/** Validation shared by the forms: the API needs at least 2 characters per address. */
export const validAddress = (p: Place) => p.address.trim().length >= 2;

/** Fills a place with the device location ("Current location (lat, lng)"), with a toast when it fails. */
export function useLocate(onPlace: (p: Place) => void) {
  const toast = useToast();
  const [locating, setLocating] = useState(false);
  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast('Location is not available on this device');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        onPlace({ address: `Current location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, lat, lng });
        setLocating(false);
      },
      () => {
        toast('Location access was denied — please type your pickup');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [onPlace, toast]);
  return { locate, locating };
}

// ---------------------------------------------------------------- dates

const pad = (n: number) => String(n).padStart(2, '0');

/** Splits defaultLocal() into separate date and time input values. */
export function defaultDateTime(hoursAhead = 24): { date: string; time: string } {
  const [date, time] = defaultLocal(hoursAhead).split('T');
  return { date, time };
}

/** ISO string → local date and time input values. */
export function isoToDateTime(iso?: string): { date: string; time: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

/** Local date + time input values → ISO string (device time zone). */
export const dateTimeToIso = (date: string, time: string) => (date ? localToIso(`${date}T${time || '00:00'}`) : undefined);

// ---------------------------------------------------------------- vehicles & payment

const CLASS_THUMB: Record<string, string> = {
  sedan: '/img/design/cls-sedan.jpg',
  extra_comfort: '/img/design/cls-comfort.jpg',
  xl: '/img/design/cls-xl.jpg',
  business: '/img/design/business.png',
  black: '/img/design/cls-black.jpg',
};
export const classThumb = (q: Quote) => q.vehicle.imageUrl || CLASS_THUMB[q.vehicle.class] || '/img/design/business.png';
export const classLabel = (cls: string) => VEHICLE_CLASSES.find((v) => v.key === cls)?.label ?? cls.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
export const price = (q: Quote) => formatMoney(q.price.customerPrice, q.price.currency);

/** Default saved card for the "Visa •••• 4242 · Change" hint; never invents a card. */
export function useDefaultCard(): { card: SavedCard | null; loading: boolean; signedIn: boolean } {
  const { api, user, ready } = useRidean();
  const [card, setCard] = useState<SavedCard | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!user) {
      setCard(null);
      return;
    }
    let alive = true;
    setLoading(true);
    api
      .paymentMethods()
      .then((cards) => alive && setCard(cards.find((c) => c.isDefault) ?? null))
      .catch(() => alive && setCard(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [api, user]);
  return { card, loading: !ready || loading, signedIn: !!user };
}
