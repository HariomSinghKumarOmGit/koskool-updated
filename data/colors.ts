export const COLOR_HEX_MAP: Record<string, string> = {
  black: '#111827',
  'deep black': '#0a0a0a',
  'solid black': '#000000',
  white: '#FFFFFF',
  tan: '#D29054',
  brown: '#633B18',
  navy: '#1E3A8A',
  'navy blue': '#1E3A8A',
  blue: '#2563EB',
  'sky blue': '#38BDF8',
  teal: '#0D9488',
  olive: '#556B2F',
  grey: '#6B7280',
  gray: '#6B7280',
  'slate grey': '#64748B',
  'slate gray': '#64748B',
  'charcoal grey': '#374151',
  'charcoal gray': '#374151',
  maroon: '#800000',
  pink: '#EC4899',
  'pastel pink': '#F9A8D4',
  'dusty rose': '#FDA4AF',
  mauve: '#C084FC',
  plum: '#581C87',
  purple: '#7E22CE',
  lilac: '#C4B5FD',
  lavender: '#E9D5FF',
  red: '#DC2626',
  'red & navy': '#B91C1C',
  'yellow & blue': '#FBBF24',
  'fluorescent yellow': '#EAB308',
  camel: '#C19A6B',
  coffee: '#4A2E18',
  peach: '#FDBA74',
  rust: '#B45309',
  silver: '#D1D5DB',
  green: '#16A34A',
  neutral: '#E5E7EB',
  beige: '#E8DCCA',
  orange: '#F97316',
  yellow: '#EAB308',
  gold: '#D97706',
  cream: '#FFFDD0',
};

export function getColorHex(name: string): string {
  if (!name) return '#4B5563';
  const clean = name.trim().toLowerCase();
  return COLOR_HEX_MAP[clean] || '#4B5563';
}

export function getColorStyle(name: string): React.CSSProperties {
  if (!name) return { backgroundColor: '#4B5563' };
  const clean = name.trim().toLowerCase();
  if (clean === 'red & navy') {
    return { background: 'linear-gradient(135deg, #DC2626 50%, #1E3A8A 50%)' };
  }
  if (clean === 'yellow & blue') {
    return { background: 'linear-gradient(135deg, #FBBF24 50%, #2563EB 50%)' };
  }
  return { backgroundColor: COLOR_HEX_MAP[clean] || '#4B5563' };
}
