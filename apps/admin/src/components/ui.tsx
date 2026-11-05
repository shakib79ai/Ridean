'use client';

// Ridean Admin design kit — the building blocks of every page (see globals.css for the az-* styles).
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { BookingStatus } from '@ridean/shared';

// ---------------------------------------------------------------------------
// Icons (line icons from the design boards, 24px grid, stroke = currentColor)

const PATHS: Record<string, ReactNode> = {
  dashboard: (<><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  car: (<><path d="M3 15l1.6-4.6A2 2 0 0 1 6.5 9h11a2 2 0 0 1 1.9 1.4L21 15v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M6.5 13.5h.01M17.5 13.5h.01" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>),
  bank: <path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  report: (<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>),
  ledger: (<><path d="M5 3.5h11l3 3v14H5z" /><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4.5" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M4.4 4.4l2.1 2.1M17.5 17.5l2.1 2.1M2.5 12h3M18.5 12h3M4.4 19.6l2.1-2.1M17.5 6.5l2.1-2.1" /></>),
  help: (<><circle cx="12" cy="12" r="9" /><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.9.4-1.3 1-1.3 1.9M12 17h.01" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>),
  bell: (<><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
  logout: (<><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><path d="M10 16l-4-4 4-4M6 12h10" /></>),
  plane: <path d="M10.5 13.5L3 11l1.5-1.5 7.5 1L16.5 6c1-1 2.5-1.5 3-1s0 2-1 3l-4.5 4.5 1 7.5L13.5 21 11 13.5" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z" />,
  rent: (<><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" /><rect x="3" y="11" width="18" height="6" rx="2" /><path d="M6 17v2M18 17v2M7 14h.01M17 14h.01" /></>),
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  checkCircle: (<><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></>),
  download: (<><path d="M12 4v11M7 10l5 5 5-5" /><path d="M4 19h16" /></>),
  alert: (<><path d="M12 3.5L2.5 20h19z" /><path d="M12 10v4.5M12 17.5h.01" /></>),
  file: (<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></>),
  card: (<><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></>),
  swap: <path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />,
  tag: (<><path d="M3.5 12.5V4.5h8l9 9-8 8z" /><circle cx="8" cy="9" r="1.4" /></>),
  wallet: (<><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 14.5h2" /></>),
  pin: (<><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></>),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></>),
  send: <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  filter: <path d="M4 5h16l-6 7.5V19l-4 1.5v-8z" />,
  lock: (<><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>),
  shield: (<><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.3-7.5 9.5-4.3-1.2-7.5-5-7.5-9.5V6z" /><path d="M9 12l2 2 4-4" /></>),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  book: (<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" /></>),
  inbox: (<><path d="M3 13l3-8h12l3 8v6H3z" /><path d="M3 13h5l1.5 2.5h5L16 13h5" /></>),
  pause: (<><circle cx="12" cy="12" r="9" /><path d="M10 9v6M14 9v6" /></>),
  edit: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  refresh: (<><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></>),
  external: (<><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={{ flexShrink: 0, ...style }}>
      {PATHS[name] ?? PATHS.file}
    </svg>
  );
}

/** Icon for a service key (ride_now, airport_transfer, hourly, luxury, rent). */
export function serviceIcon(service: string): string {
  return ({ ride_now: 'car', airport_transfer: 'plane', hourly: 'clock', luxury: 'star', rent: 'rent' } as Record<string, string>)[service] ?? 'car';
}

// ---------------------------------------------------------------------------
// Page header (rendered in the sticky top bar by <Shell>)

type HeadState = { title: string; sub?: string; actions?: ReactNode; searchPlaceholder?: string };
const HeadCtx = createContext<{ set: (h: HeadState) => void } | null>(null);
export const HeadProvider = HeadCtx.Provider;

/** Declare the page title, subtitle and top-bar actions. Renders nothing in place. */
export function PageHead({ title, sub, actions, searchPlaceholder }: HeadState) {
  const ctx = useContext(HeadCtx);
  useEffect(() => {
    ctx?.set({ title, sub, actions, searchPlaceholder });
    document.title = `${title} · Ridean Admin`;
  });
  return null;
}

// ---------------------------------------------------------------------------
// Surfaces

export function Card({ title, desc, action, children, className = '', pad = true, id }: { title?: ReactNode; desc?: ReactNode; action?: ReactNode; children?: ReactNode; className?: string; pad?: boolean; id?: string }) {
  return (
    <section className={`az-card ${pad ? '' : 'p0'} ${className}`} id={id}>
      {(title || action) && (
        <div className="az-card-head" style={pad ? undefined : { padding: '20px 22px 0' }}>
          <div>
            {title && <h2>{title}</h2>}
            {desc && <p className="desc">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, sub, tone, icon }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'up' | 'down' | 'gold' | 'info'; icon?: string }) {
  return (
    <div className="az-kpi">
      <div className="top">
        <div className="l">{label}</div>
        {icon && <div className="az-ic"><Icon name={icon} size={18} /></div>}
      </div>
      <div className="v">{value}</div>
      {sub != null && <div className={`s ${tone ?? ''}`}>{sub}</div>}
    </div>
  );
}

/** "▲ 8.2% vs yesterday" — null when there is nothing to compare against. */
export function Delta({ now, before, label = 'vs yesterday' }: { now: number; before: number; label?: string }) {
  if (!before) return <span className="az-muted">No data {label.replace('vs ', 'for ')}</span>;
  const pct = ((now - before) / before) * 100;
  const up = pct >= 0;
  return <span className={up ? 'az-ok' : 'az-bad'}>{up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}% {label}</span>;
}

export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '•';
  return <div className="az-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">{initials}</div>;
}

/** Square tile with a letter (supplier logos in the design). */
export function LetterTile({ name, size = 42 }: { name: string; size?: number }) {
  return (
    <div className="az-ic" style={{ width: size, height: size, borderRadius: size * 0.26, fontFamily: 'var(--serif)', fontWeight: 700, fontSize: size * 0.42 }} aria-hidden="true">
      {(name.trim()[0] ?? '•').toUpperCase()}
    </div>
  );
}

export function Bar({ value, max, green = false }: { value: number; max: number; green?: boolean }) {
  const w = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return <div className={`az-bar ${green ? 'green' : ''}`}><i style={{ width: `${w}%` }} /></div>;
}

// ---------------------------------------------------------------------------
// Controls

export function Btn({ kind = 'o', size, icon, children, block, ...rest }: { kind?: 'y' | 'o' | 'g' | 'danger'; size?: 'sm'; icon?: string; block?: boolean; children?: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} className={`az-btn ${kind} ${size ?? ''} ${block ? 'block' : ''} ${rest.className ?? ''}`}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
}

export function Chips<T extends string>({ options, value, onChange, label }: { options: readonly (readonly [T, string])[]; value: T; onChange: (v: T) => void; label?: string }) {
  return (
    <div className="az-chips" role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} type="button" className="az-chip" aria-pressed={v === value} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

export function Seg<T extends string>({ options, value, onChange, label, style }: { options: readonly (readonly [T, string])[]; value: T; onChange: (v: T) => void; label?: string; style?: React.CSSProperties }) {
  return (
    <div className="az-seg" role="group" aria-label={label} style={style}>
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="az-tg" disabled={disabled} onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

export function ToggleRow({ title, desc, checked, onChange, disabled }: { title: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="az-tgrow">
      <div>
        <div className="t">{title}</div>
        {desc && <div className="d">{desc}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} disabled={disabled} />
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`az-field ${className ?? ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

/** Input with a leading icon and a small label inside (New booking form). */
export function IconField({ icon, label, ...rest }: { icon: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="az-iconfield">
      <div className="ic"><Icon name={icon} size={19} /></div>
      <div className="bd">
        <div className="lb">{label}</div>
        <input {...rest} />
      </div>
    </label>
  );
}

export function Stepper({ label, value, onChange, min = 0, max = 12 }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="az-between">
      <span style={{ fontSize: 14.5 }}>{label}</span>
      <div className="az-row" style={{ gap: 14 }}>
        <button type="button" className="az-step" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 600 }} aria-live="polite">{value}</span>
        <button type="button" className="az-step" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

export function Pager({ page, pageSize, total, onPage, noun = 'items' }: { page: number; pageSize: number; total: number; onPage: (p: number) => void; noun?: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(total, page * pageSize);
  const list: (number | '…')[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) list.push(p);
    else if (list[list.length - 1] !== '…') list.push('…');
  }
  return (
    <div className="az-pager">
      <span>Showing {from}–{to} of {total.toLocaleString()} {noun}</span>
      {pages > 1 && (
        <nav className="az-pages" aria-label="Pages">
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><Icon name="chevronLeft" size={16} /></button>
          {list.map((p, i) => (p === '…' ? <button key={`e${i}`} type="button" disabled>…</button> : <button key={p} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)}>{p}</button>))}
          <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><Icon name="chevronRight" size={16} /></button>
        </nav>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status

const STATUS: Record<BookingStatus, [string, 'ok' | 'warn' | 'bad' | 'info' | 'mut']> = {
  pending_payment: ['Pending payment', 'warn'],
  payment_authorised: ['Confirming', 'warn'],
  confirmed: ['Scheduled', 'warn'],
  driver_assigned: ['En route', 'info'],
  in_progress: ['In progress', 'warn'],
  completed: ['Completed', 'ok'],
  cancelled: ['Cancelled', 'mut'],
  failed: ['Failed', 'bad'],
};

export function StatusPill({ status }: { status: string }) {
  const [label, tone] = STATUS[status as BookingStatus] ?? [status, 'mut'];
  return <span className={`az-pill ${tone}`}>{label}</span>;
}

export function Pill({ tone, children, dot = true }: { tone: 'ok' | 'warn' | 'bad' | 'info' | 'mut'; children: ReactNode; dot?: boolean }) {
  return <span className={`az-pill ${tone} ${dot ? '' : 'nodot'}`}>{children}</span>;
}

/** Net / Gross inventory tag. */
export function RateTag({ type }: { type: 'net' | 'gross' | string }) {
  return <span className={`az-tag ${type === 'gross' ? 'gross' : 'net'}`}>{type === 'gross' ? 'Gross' : 'Net'}</span>;
}

// ---------------------------------------------------------------------------
// States

export function Loading({ error, height = 220, onRetry }: { error?: string | null; height?: number; onRetry?: () => void }) {
  if (error)
    return (
      <div className="az-alert" role="alert">
        {error} {onRetry && <button type="button" className="az-a" onClick={onRetry} style={{ marginLeft: 8 }}>Try again</button>}
      </div>
    );
  return <div className="az-skel" style={{ height }} aria-busy="true" aria-label="Loading" />;
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="az-empty">
      <strong>{title}</strong>
      {children}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return children ? <div className="az-alert" role="alert">{children}</div> : null;
}

// ---------------------------------------------------------------------------
// Toast + modal

const ToastCtx = createContext<(msg: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="az-toast" role="status" aria-live="polite">{msg}</div>}
    </ToastCtx.Provider>
  );
}
/** `const toast = useToast(); toast('Saved')` */
export const useToast = () => useContext(ToastCtx);

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="az-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="az-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="az-between">
          <h2>{title}</h2>
          <button type="button" className="az-bell" style={{ width: 36, height: 36 }} aria-label="Close" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
