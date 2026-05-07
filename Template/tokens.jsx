// Sistema de diseño - 3 direcciones visuales para El Contactico
// A. Civic directory · B. Friendly marketplace · C. Premium verified

window.THEMES = {
  // A — Modern civic directory
  // Verde institucional moderno con personalidad. Display fuerte, color con presencia.
  A: {
    name: 'Civic',
    bg: '#F5F3EC',
    surface: '#FFFFFF',
    surfaceAlt: '#EBE8DD',
    surfaceDark: '#0E1F18',
    ink: '#0A0F0C',
    ink2: '#3D453F',
    ink3: '#7E857F',
    rule: '#DDD9CC',
    ruleSoft: '#E8E5D9',
    brand: '#0E5A3F',
    brandInk: '#063B28',
    brandSoft: '#DCE8DF',
    brandBright: '#16C97A',
    accent: '#E8542A',
    accentSoft: '#FBE5DC',
    yellow: '#F5C242',
    yellowSoft: '#FBEBC4',
    wa: '#16A34A',
    star: '#E8A317',
    radius: 10,
    radiusLg: 18,
    radiusXl: 28,
    font: '"Inter", -apple-system, system-ui, sans-serif',
    fontDisplay: '"Instrument Serif", "Times New Roman", Georgia, serif',
    fontBody: '"Inter", -apple-system, system-ui, sans-serif',
    fontMono: '"Inter", system-ui, sans-serif',
    shadow: '0 1px 2px rgba(15,20,16,.04)',
    shadowLg: '0 12px 32px rgba(15,20,16,.08), 0 1px 2px rgba(15,20,16,.04)',
    cardBorder: '1px solid #DDD9CC',
    metaCase: 'none',
    metaSpacing: '0',
  },
  // B — Friendly neighborhood marketplace
  // Verde cálido + clay accent. Más espacio, esquinas suaves, foto protagonista.
  // Sensación de "marketplace amistoso del barrio", pero sin caer en touristy.
  B: {
    name: 'Friendly',
    bg: '#F7F5F0',
    surface: '#FFFFFF',
    surfaceAlt: '#FBF9F4',
    ink: '#23241F',
    ink2: '#54564E',
    ink3: '#8A8C82',
    rule: '#E5E2D9',
    ruleSoft: '#EFEDE5',
    brand: '#3F6E54',
    brandInk: '#274736',
    brandSoft: '#E8EFE9',
    accent: '#C9614A',
    accentSoft: '#F5E5DF',
    wa: '#16A34A',
    star: '#D4861E',
    radius: 8,
    radiusLg: 12,
    font: '"Instrument Sans", "Inter", system-ui, sans-serif',
    fontMono: '"Instrument Sans", system-ui, sans-serif',
    shadow: '0 1px 2px rgba(20,30,20,.04), 0 0 0 1px rgba(20,30,20,.04)',
    shadowLg: '0 4px 16px rgba(20,30,20,.06), 0 0 0 1px rgba(20,30,20,.04)',
    cardBorder: '1px solid #E5E2D9',
    metaCase: 'none',
    metaSpacing: '0',
  },
  // C — Premium verified
  // Casi monocromo + verde oscuro como acento, generosa tipografía display.
  // Sensación elevada / curatoría, "verificación" como propuesta de valor central.
  C: {
    name: 'Premium',
    bg: '#FAFAF7',
    surface: '#FFFFFF',
    surfaceAlt: '#F4F4EF',
    ink: '#0F1410',
    ink2: '#404640',
    ink3: '#76796F',
    rule: '#E1E1DB',
    ruleSoft: '#EDEDE6',
    brand: '#1B3A2A',
    brandInk: '#0B1F15',
    brandSoft: '#E5EBE5',
    accent: '#9C4A36',
    accentSoft: '#F0E2DC',
    wa: '#0F8E3F',
    star: '#A87618',
    radius: 4,
    radiusLg: 6,
    font: '"Fraunces", "Inter", serif',
    fontDisplay: '"Fraunces", Georgia, serif',
    fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"Inter", system-ui, sans-serif',
    shadow: '0 1px 2px rgba(0,0,0,.04)',
    shadowLg: '0 8px 24px rgba(0,0,0,.06)',
    cardBorder: '1px solid #E1E1DB',
    metaCase: 'none',
    metaSpacing: '0',
  },
};

// Photo placeholder swatches — no SVG ilustrado, sólo gradientes tonales con label mono
window.photoSwatch = function (k, theme, opts = {}) {
  const palettes = {
    rafa: ['#3A4A3E', '#6E8270'],
    electro: ['#2D3E50', '#5A7494'],
    limpieza: ['#5C6B5A', '#A6B4A2'],
    jardin: ['#2F4A2F', '#6B8A65'],
    reparaciones: ['#4A3A2E', '#8C7660'],
    emerg: ['#5C2A1E', '#A6664E'],
  };
  const [a, b] = palettes[k] || ['#888', '#bbb'];
  return {
    background: `linear-gradient(135deg, ${a}, ${b})`,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,.45)',
    fontFamily: theme.fontMono || theme.font,
    fontSize: opts.big ? 11 : 9,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    borderRadius: opts.round ? '50%' : (theme.radius || 0) + 'px',
    flexShrink: 0,
  };
};

// Iconos — set único, line-style, geométricos
window.Icon = {
  search: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6">
      <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" strokeLinecap="round" />
    </svg>
  ),
  pin: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6">
      <path d="M8 14s5-4.5 5-8a5 5 0 10-10 0c0 3.5 5 8 5 8z" /><circle cx="8" cy="6" r="1.8" />
    </svg>
  ),
  check: (s = 12, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 12 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 6.5l2.5 2.5L10 3" />
    </svg>
  ),
  shield: (s = 12, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 12 12" fill={c}>
      <path d="M6 .5L1.5 2.2v3.3c0 2.7 1.9 5.2 4.5 6 2.6-.8 4.5-3.3 4.5-6V2.2L6 .5zm-.7 7.8L3.2 6.2l.9-1 1.2 1.2L8 4l.9.9-3.6 3.4z" />
    </svg>
  ),
  phone: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3.5C3 8.7 7.3 13 12.5 13l1.5-2.5-3-1.5-1.5 1.5C8 9.5 6.5 8 5.5 6.5L7 5 5.5 2 3 3.5z" />
    </svg>
  ),
  wa: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill={c}>
      <path d="M8 1a7 7 0 00-6 10.5L1 15l3.6-1A7 7 0 108 1zm3.7 9.6c-.2.4-.9.8-1.2.8-.3 0-.7.1-2.4-.6-2-.8-3.3-2.8-3.4-2.9-.1-.1-.8-1-.8-2 0-.9.5-1.4.6-1.6.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .5.4l.7 1.6c0 .2 0 .3-.1.4l-.3.4c-.1.1-.2.2-.1.4l.6 1c.5.7 1 1 1.6 1.3.2.1.3.1.4-.1l.5-.6c.1-.2.3-.1.4-.1l1.4.7c.2.1.3.2.4.3v.8z" />
    </svg>
  ),
  star: (s = 12, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 12 12" fill={c}>
      <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8.5 3 10.1l.6-3.3L1.2 4.5l3.3-.5L6 1z" />
    </svg>
  ),
  arrow: (s = 12, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 12 12" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 6h6m-2.5-2.5L9 6 6.5 8.5" />
    </svg>
  ),
  chevron: (s = 10, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 10 10" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 2l3 3-3 3" />
    </svg>
  ),
  chevronDown: (s = 10, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 10 10" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 4l3 3 3-3" />
    </svg>
  ),
  filter: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 4h12M4 8h8M6 12h4" />
    </svg>
  ),
  clock: (s = 12, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 12 12" fill="none" stroke={c} strokeWidth="1.5">
      <circle cx="6" cy="6" r="4.5" /><path d="M6 3.5V6l1.5 1" strokeLinecap="round" />
    </svg>
  ),
  menu: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 5h12M3 9h12M3 13h12" />
    </svg>
  ),
  close: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4l10 10M14 4L4 14" />
    </svg>
  ),
  globe: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" /><path d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13" />
    </svg>
  ),
  drop: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill={c}>
      <path d="M8 1.5C5 5 3.5 7.5 3.5 9.5a4.5 4.5 0 009 0c0-2-1.5-4.5-4.5-8z" />
    </svg>
  ),
  bolt: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill={c}>
      <path d="M9 1L2 9h4l-1 6 7-8H8l1-6z" />
    </svg>
  ),
  spray: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4">
      <rect x="5" y="6" width="6" height="8" rx="1" /><rect x="6.5" y="3" width="3" height="3" /><circle cx="2" cy="3" r=".5" fill={c}/><circle cx="2.5" cy="5" r=".5" fill={c}/><circle cx="2" cy="7" r=".5" fill={c}/>
    </svg>
  ),
  leaf: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill={c}>
      <path d="M14 2C7 2 3 6 3 11c0 1.5.5 2.5.5 2.5L2 15l1 .5L4.5 14s1 .5 2.5.5c5 0 9-4 9-11 0-.5-.5-1-2-1z" />
    </svg>
  ),
  wrench: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4">
      <path d="M11 2a3 3 0 00-3 4L2 12l2 2 6-6a3 3 0 004-3l-2 2-2-1-1-2 2-2z" />
    </svg>
  ),
};

window.catIcon = (slug, s = 14, c) => {
  const map = {
    fontaneria: window.Icon.drop,
    electricidad: window.Icon.bolt,
    limpieza: window.Icon.spray,
    jardineria: window.Icon.leaf,
    reparaciones: window.Icon.wrench,
  };
  return (map[slug] || window.Icon.wrench)(s, c);
};
