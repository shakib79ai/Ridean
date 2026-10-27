// Reusable per-tier car illustration, adapted from the Ridean design system.
// `tier` selects the body color; a lighter inset variant can be requested
// with `dim` for an unavailable/disabled state.
const TIER_COLORS: Record<string, string> = {
  sedan: "var(--tier-sedan)",
  xl: "var(--tier-xl)",
  comfort: "var(--tier-comfort)",
  business: "var(--tier-business)",
  black: "var(--tier-black)",
  c1: "var(--tier-sedan)",
  c2: "var(--tier-xl)",
  c3: "var(--tier-business)",
  l1: "var(--tier-business)",
  l2: "var(--tier-comfort)",
  l3: "var(--tier-black)",
};

export function VehicleArt({
  tier,
  width = 84,
  height = 32,
  dim = false,
}: {
  tier: string;
  width?: number;
  height?: number;
  dim?: boolean;
}) {
  const fill = TIER_COLORS[tier] ?? "var(--tier-sedan)";
  return (
    <svg
      viewBox="0 0 160 60"
      width={width}
      height={height}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0, opacity: dim ? 0.55 : 1 }}
    >
      <path
        d="M6 44c0-6 4-9 12-10l20-3c8-11 19-17 35-17h24c14 0 25 9 32 18l17 3c5 1 8 4 8 9v4H6z"
        fill={fill}
      />
      <path d="M52 31l9-12h20v12z" fill="#EEF4FC" />
      <path d="M87 31V19h9c9 0 16 6 21 12z" fill="#EEF4FC" />
      <circle cx="38" cy="48" r="10" fill={fill} stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="124" cy="48" r="10" fill={fill} stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="38" cy="48" r="3.5" fill="#8FA6C8" />
      <circle cx="124" cy="48" r="3.5" fill="#8FA6C8" />
    </svg>
  );
}
