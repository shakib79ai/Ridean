'use client';

import './account.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Appearance, type Stripe } from '@stripe/stripe-js';
import { formatMoney, serviceLabel, type Booking, type RideanApi, type SavedCard } from '@ridean/shared';
import { C, ErrorNote } from '@/components/site/ui';
import pkg from '../../../package.json';

/** The app's real version (apps/pwa/package.json). */
export const APP_VERSION: string = pkg.version;

/* ------------------------------------------------------------------ icons */

const PATHS = {
  car: <><path d="M3 15l1.6-4.6A2 2 0 0 1 6.5 9h11a2 2 0 0 1 1.9 1.4L21 15v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M6.5 13.5h.01M17.5 13.5h.01" /></>,
  rental: <><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" /><rect x="3" y="11" width="18" height="6" rx="2" /><path d="M6 17v2M18 17v2M7 14h.01M17 14h.01" /></>,
  plane: <path d="M10.5 13.5L3 11l1.5-1.5 7.5 1L16.5 6c1-1 2.5-1.5 3-1s0 2-1 3l-4.5 4.5 1 7.5L13.5 21 11 13.5" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  card: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2.5" /><path d="M3 10h18M16 15h2" /><path d="M6 6V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M3 12h18" /></>,
  home: <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3" /></>,
  right: <path d="M9 6l6 6-6 6" />,
  left: <path d="M15 18l-6-6 6-6" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z" /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.5" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
  logout: <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.9.4-1.3 1-1.3 1.9M12 17h.01" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6l8.5 7 8.5-7" /></>,
  phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  doc: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 21h4" /></>,
  shield: <><path d="M12 3l7.5 3v6c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  pencil: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>,
  send: <path d="M4 12l16-8-6 16-2.5-6.5z" />,
};
export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, color = C.gold, style }: { name: IconName; size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, ...style }}>
      {PATHS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ styles (phone board values) */

export const S = {
  body: { display: 'flex', flexDirection: 'column', gap: 14, padding: '0 20px', minWidth: 0 } as CSSProperties,
  panel: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16 } as CSSProperties,
  list: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '2px 14px' } as CSSProperties,
  iconBox: { width: 38, height: 38, borderRadius: 11, background: C.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } as CSSProperties,
  cta: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 12, background: 'linear-gradient(180deg,#FFD43B,#F2B705)', color: '#0A1F18', fontSize: 17, fontWeight: 600, width: '100%' } as CSSProperties,
  ghost: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 12, border: `1px solid ${C.gold}`, color: C.gold, fontSize: 14.5, fontWeight: 600, background: 'transparent', cursor: 'pointer', boxSizing: 'border-box', fontFamily: 'inherit' } as CSSProperties,
  plain: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 18px', height: 50, borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 15, color: C.cream, background: 'transparent', cursor: 'pointer', boxSizing: 'border-box', fontFamily: 'inherit' } as CSSProperties,
  goldLink: { fontSize: 12.5, fontWeight: 600, color: C.gold } as CSSProperties,
  note: { fontSize: 12.5, color: C.muted, lineHeight: 1.5 } as CSSProperties,
  input: { all: 'unset', boxSizing: 'border-box', width: '100%', fontSize: 14.5, color: C.cream, marginTop: 2 } as CSSProperties,
  wordmark: { fontFamily: "'Playfair Display',serif", fontWeight: 700, letterSpacing: '-.01em', background: 'linear-gradient(180deg,#F8DD8A 0%,#E2B04A 55%,#B9842A 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontSize: 20 } as CSSProperties,
};

/* ------------------------------------------------------------------ layout pieces */

/** Full-screen page wrapper: bottom padding respects the safe area. */
export function Screen({ children }: { children: ReactNode }) {
  return <div className="pa-screen">{children}</div>;
}

/** The design's round back button + title (+ optional sub). Goes back in history, or to `fallback`. */
export function ScreenHead({ title, sub, fallback }: { title: ReactNode; sub?: ReactNode; fallback: string }) {
  const router = useRouter();
  const back = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallback);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 20px 14px' }}>
      <button type="button" onClick={back} aria-label="Back" className="pa-link no-print" style={{ width: 40, height: 40, borderRadius: 20, border: `1px solid ${C.line}`, background: C.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="left" color={C.cream} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: 24, lineHeight: 1.15, color: C.cream }}>{title}</h1>
        {sub !== undefined && sub !== null && sub !== '' && <div style={{ fontSize: 12, color: C.muted, marginTop: 2, overflowWrap: 'anywhere' }}>{sub}</div>}
      </div>
    </div>
  );
}

export function SectionHead({ title, link }: { title: ReactNode; link?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 0 -2px', gap: 12 }}>
      <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 600, color: C.cream }}>{title}</h2>
      {link}
    </div>
  );
}

const rowStyle = (last?: boolean): CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 2px', borderBottom: last ? undefined : `1px solid ${C.line}` });

/** The design's icon · title/subtitle · trailing row used in every list card. */
export function ListRow({ icon, title, sub, right, href, onClick, last, titleColor = C.cream, disabled, ariaExpanded }: {
  icon?: IconName;
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  href?: string;
  onClick?: () => void;
  last?: boolean;
  titleColor?: string;
  disabled?: boolean;
  ariaExpanded?: boolean;
}) {
  const inner = (
    <>
      {icon && <div style={S.iconBox}><Icon name={icon} /></div>}
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: titleColor, overflowWrap: 'anywhere' }}>{title}</div>
        {sub !== undefined && sub !== null && sub !== '' && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2, overflowWrap: 'anywhere' }}>{sub}</div>}
      </div>
      {right}
    </>
  );
  if (href) return <Link href={href} style={rowStyle(last)}>{inner}</Link>;
  if (onClick)
    return (
      <button type="button" className="pa-row-btn" onClick={onClick} disabled={disabled} aria-expanded={ariaExpanded} style={{ ...rowStyle(last), opacity: disabled ? 0.6 : 1 }}>
        {inner}
      </button>
    );
  return <div style={rowStyle(last)}>{inner}</div>;
}

export const RowChevron = () => <Icon name="right" color={C.muted} />;

export function ToggleRow({ title, sub, on, onChange, disabled, last }: { title: string; sub?: ReactNode; on: boolean; onChange: (v: boolean) => void; disabled?: boolean; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 2px', borderBottom: last ? undefined : `1px solid ${C.line}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: C.cream }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <button type="button" role="switch" aria-checked={on} aria-label={title} disabled={disabled} className={`dz-tg ${on ? 'on' : ''}`} onClick={() => onChange(!on)} style={disabled ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}>
        <span />
      </button>
    </div>
  );
}

/** The design's labelled input row (icon · small label · input). */
export function InputField({ icon, label, children, style }: { icon?: IconName; label: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, minHeight: 58, overflow: 'hidden', minWidth: 0, ...style }}>
      {icon ? <div style={{ width: 46, display: 'flex', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={19} color={C.cream} /></div> : <div style={{ width: 16 }} />}
      <div style={{ flex: 1, minWidth: 0, padding: '8px 8px 8px 0' }}>
        <div style={{ fontSize: 11.5, color: C.muted }}>{label}</div>
        {children}
      </div>
    </label>
  );
}

export function Muted({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...S.note, ...style }}>{children}</div>;
}

export function EmptyCard({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div style={{ ...S.panel, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <p style={{ margin: 0, fontSize: 14.5, color: C.soft, lineHeight: 1.5 }}>{text}</p>
      {action}
    </div>
  );
}

/** In-page confirmation strip (used instead of window.confirm). */
export function ConfirmStrip({ text, confirmLabel, busyLabel, busy, onCancel, onConfirm, label }: { text: ReactNode; confirmLabel: string; busyLabel: string; busy: boolean; onCancel: () => void; onConfirm: () => void; label: string }) {
  return (
    <div role="alertdialog" aria-label={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 2px 14px', flexWrap: 'wrap' }}>
      <span style={{ flex: 1, minWidth: 140, fontSize: 14, color: C.soft }}>{text}</span>
      <button type="button" className="pa-link" onClick={onCancel} style={{ fontSize: 14, color: C.muted }}>Keep</button>
      <button type="button" className="pa-link" disabled={busy} onClick={onConfirm} style={{ fontSize: 14, fontWeight: 600, color: C.bad }}>{busy ? busyLabel : confirmLabel}</button>
    </div>
  );
}

export { ErrorNote };

/* ------------------------------------------------------------------ formatting */

export const money = (minor: number, currency = 'USD') => formatMoney(minor, currency || 'USD');

export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export const brandName = (b: string) => {
  const k = (b || '').toLowerCase();
  const map: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', american_express: 'Amex', discover: 'Discover', diners: 'Diners', jcb: 'JCB', unionpay: 'UnionPay' };
  return map[k] ?? (k ? k[0].toUpperCase() + k.slice(1) : 'Card');
};
export const cardLabel = (c: SavedCard) => `${brandName(c.brand)} •••• ${c.last4}`;
export const cardExpiry = (c: SavedCard) => `${String(c.expMonth).padStart(2, '0')}/${String(c.expYear).slice(-2)}`;

export const errMsg = (e: unknown, fallback = 'Something went wrong. Please try again.') => (e instanceof Error && e.message ? e.message : fallback);

export const LANGUAGES: { value: string; label: string; short: string }[] = [
  { value: 'en-US', label: 'English (US)', short: 'EN' },
  { value: 'en-GB', label: 'English (UK)', short: 'EN' },
  { value: 'es', label: 'Español', short: 'ES' },
  { value: 'fr', label: 'Français', short: 'FR' },
  { value: 'de', label: 'Deutsch', short: 'DE' },
  { value: 'bn', label: 'বাংলা', short: 'BN' },
];
export const CURRENCIES: { value: string; label: string }[] = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British Pound' },
  { value: 'CAD', label: 'Canadian Dollar' },
];
export const languageLabel = (v?: string) => LANGUAGES.find((l) => l.value === v)?.label ?? v ?? '';
export const currencyLabel = (v?: string) => CURRENCIES.find((c) => c.value === v)?.label ?? v ?? '';

const SERVICE_ICON: Record<string, IconName> = { ride_now: 'car', airport_transfer: 'plane', rent: 'rental', hourly: 'clock', luxury: 'star' };
export const serviceMeta = (key: string) => ({ label: key === 'ride_now' ? 'Ride' : serviceLabel(key), icon: SERVICE_ICON[key] ?? 'car' });

export const isCancelled = (b: Booking) => b.status === 'cancelled' || b.status === 'failed';

/** Loads every page of the signed-in user's bookings. */
export async function fetchAllBookings(api: RideanApi): Promise<Booking[]> {
  const first = await api.myBookings({ page: 1 });
  const all = [...first.items];
  const pages = Math.min(20, Math.ceil(first.total / Math.max(1, first.pageSize || first.items.length || 1)));
  for (let p = 2; p <= pages && all.length < first.total; p++) {
    const r = await api.myBookings({ page: p });
    if (!r.items.length) break;
    all.push(...r.items);
  }
  return all;
}

/* ------------------------------------------------------------------ data hook */

/** Small async loader with loading / error / reload. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const reload = useCallback(async () => {
    setError('');
    try {
      setData(await fnRef.current());
    } catch (e) {
      setError(errMsg(e, 'We couldn’t load this right now.'));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    setLoading(true);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, setData, error, loading, reload };
}

/* ------------------------------------------------------------------ downloads */

export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------------ Stripe */

const stripeCache = new Map<string, Promise<Stripe | null>>();
function getStripe(key: string) {
  let p = stripeCache.get(key);
  if (!p) {
    p = loadStripe(key);
    stripeCache.set(key, p);
  }
  return p;
}

const stripeAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#F6C428',
    colorBackground: '#071A14',
    colorText: '#F3EEDF',
    colorTextSecondary: '#9FB2A6',
    colorDanger: '#E5645A',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  rules: {
    '.Input': { border: '1px solid #1F4537', boxShadow: 'none' },
    '.Input:focus': { border: '1px solid #D9A94F', boxShadow: 'none' },
    '.Label': { color: '#9FB2A6' },
  },
};

/** Stripe Payment Element form confirming a SetupIntent (saving a card). */
export function StripeSetup({ stripeKey, clientSecret, submitLabel, onDone, children, footer }: {
  stripeKey: string;
  clientSecret: string;
  submitLabel: string;
  onDone: (r: { paymentMethodId?: string }) => void;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Elements stripe={getStripe(stripeKey)} options={{ clientSecret, appearance: stripeAppearance }}>
      <StripeSetupForm submitLabel={submitLabel} onDone={onDone} footer={footer}>{children}</StripeSetupForm>
    </Elements>
  );
}

function StripeSetupForm({ submitLabel, onDone, children, footer }: { submitLabel: string; onDone: (r: { paymentMethodId?: string }) => void; children?: ReactNode; footer?: ReactNode }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    const r = await stripe.confirmSetup({ elements, redirect: 'if_required', confirmParams: { return_url: window.location.href } });
    setBusy(false);
    if (r.error) return setError(r.error.message ?? 'Your card could not be saved.');
    const pm = r.setupIntent?.payment_method;
    onDone({ paymentMethodId: typeof pm === 'string' ? pm : pm?.id });
  }
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      <div style={{ ...S.panel, padding: 16 }}>
        <PaymentElement />
      </div>
      {children}
      {error && <ErrorNote>{error}</ErrorNote>}
      <button type="submit" className="dz-cta" disabled={busy || !stripe} style={S.cta}><span>{busy ? 'Please wait…' : submitLabel}</span></button>
      {footer}
    </form>
  );
}
