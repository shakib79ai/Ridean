const TIER_COLORS: Record<string, string> = {
  sedan: "#F4B000",
  xl: "#D68A00",
  comfort: "#93A8D6",
  business: "#1F4A8C",
  black: "#161616",
  c1: "#F4B000",
  c2: "#D68A00",
  c3: "#1F4A8C",
  l1: "#1F4A8C",
  l2: "#D68A00",
  l3: "#93A8D6",
};

export function tierColor(id: string): string {
  return TIER_COLORS[id] || "#0A1F44";
}

export function TierCarIcon({ id, size = 40 }: { id: string; size?: number }) {
  const color = tierColor(id);
  return (
    <svg width={size} height={size * 0.4} viewBox="0 0 160 60" aria-hidden="true" className="shrink-0">
      <path
        d="M6 44c0-6 4-9 12-10l20-3c8-11 19-17 35-17h24c14 0 25 9 32 18l17 3c5 1 8 4 8 9v4H6z"
        fill={color}
      />
      <path d="M52 31l9-12h20v12z" fill="#EEF4FC" />
      <path d="M87 31V19h9c9 0 16 6 21 12z" fill="#EEF4FC" />
      <circle cx="38" cy="48" r="10" fill={color} stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="124" cy="48" r="10" fill={color} stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="38" cy="48" r="3.5" fill="#8FA6C8" />
      <circle cx="124" cy="48" r="3.5" fill="#8FA6C8" />
    </svg>
  );
}
