/** Emerald & Pure Gold design tokens, shared by the website, PWA, admin and (mirrored) the Flutter theme. */
export const tokens = {
  color: {
    bg: '#071A14',
    bgDeep: '#000B0C',
    surface: '#0E2A22',
    surface2: '#12352B',
    line: '#1F4537',
    gold: '#D9A94F',
    cream: '#F3EEDF',
    muted: '#9FB2A6',
    yellow: '#F6C428',
    active: '#1E5442',
    ok: '#4CC38A',
    bad: '#E5645A',
    info: '#7FB3FF',
  },
  gradient: {
    logo: 'linear-gradient(180deg,#F8DD8A 0%,#E2B04A 55%,#B9842A 100%)',
    button: 'linear-gradient(180deg,#FFD43B,#F2B705)',
  },
  font: {
    display: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  radius: { sm: 10, md: 12, lg: 16, xl: 22 },
} as const;
