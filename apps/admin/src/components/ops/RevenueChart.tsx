'use client';

import { useId } from 'react';

const W = 760;
const H = 230;
const X0 = 50;
const X1 = 730;
const Y0 = 200; // baseline
const Y1 = 30; // top gridline

/** Round a step up to 1, 2, 2.5 or 5 × 10^n. */
function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

/** Daily revenue area chart (gold line + gradient fill), drawn from the dashboard's revenueSeries. */
export function RevenueChart({ series, currency }: { series: { date: string; revenue: number }[]; currency: string }) {
  const gid = useId().replace(/:/g, '');
  const compact = new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 });
  const fmt = (minor: number) => compact.format(minor / 100);
  const n = series.length;
  if (!n) return null;
  const max = Math.max(...series.map((s) => s.revenue));
  const step = niceStep(Math.max(max, 10000) / 3); // at least a $100 scale when there is no revenue yet
  const top = step * Math.max(1, Math.ceil(max / step));
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const x = (i: number) => (n === 1 ? X1 : X0 + (i * (X1 - X0)) / (n - 1));
  const y = (v: number) => Y0 - (v / top) * (Y0 - Y1);
  const pts = series.map((s, i) => `${x(i).toFixed(1)},${y(s.revenue).toFixed(1)}`);
  const area = `M${X0},${Y0} L${pts.join(' L')} L${x(n - 1).toFixed(1)},${Y0} Z`;
  const last = series[n - 1]!;
  const lx = x(n - 1);
  const ly = y(last.revenue);
  const dateLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const labelIdx = Array.from(new Set([0, Math.round((n - 1) * 0.25), Math.round((n - 1) * 0.5), Math.round((n - 1) * 0.75), n - 1]));
  const first = series[0]!;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Daily revenue from ${dateLabel(first.date)} to ${dateLabel(last.date)}; ${fmt(last.revenue)} today, peak ${fmt(max)}.`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9A94F" stopOpacity=".35" />
          <stop offset="1" stopColor="#D9A94F" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X0} x2={X1} y1={y(t)} y2={y(t)} stroke="#1F4537" strokeWidth="1" />
          <text x={X0 - 10} y={y(t) + 4} fill="#9FB2A6" fontSize="11" textAnchor="end" fontFamily="Inter">{fmt(t)}</text>
        </g>
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <polyline points={pts.join(' ')} fill="none" stroke="#D9A94F" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="5" fill="#F6C428" stroke="#071A14" strokeWidth="2" />
      <text x={lx - 8} y={Math.max(14, ly - 12)} fill="#F3EEDF" fontSize="12" fontWeight="600" textAnchor="end" fontFamily="Inter">{fmt(last.revenue)} today</text>
      {labelIdx.map((i) => (
        <text key={i} x={x(i)} y="222" fill="#9FB2A6" fontSize="11" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontFamily="Inter">{dateLabel(series[i]!.date)}</text>
      ))}
    </svg>
  );
}
