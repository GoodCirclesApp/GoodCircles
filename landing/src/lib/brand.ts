export const BRAND = {
  purple:   '#7851A9',
  lavender: '#CA9CE1',
  gold:     '#C2A76F',
  crimson:  '#A20021',
  emerald:  '#059669',
  navy:     '#1e3a5f',
  darkGold: '#9a7d3a',
} as const;

export type Role = 'NEIGHBOR' | 'MERCHANT' | 'NONPROFIT' | 'CDFI' | 'MUNICIPAL';

export const ROLE_CONFIG: Record<Role, {
  label:   string;
  color:   string;
  inputRing: string;
  statement: string;
  tagline:   string;
}> = {
  NEIGHBOR: {
    label:     'Neighbor',
    color:     BRAND.emerald,
    inputRing: 'focus:ring-emerald-400/40',
    statement: 'I want to shop local without paying more for it.',
    tagline:   'Save 10% on every purchase. Fund causes you love automatically.',
  },
  MERCHANT: {
    label:     'Merchant',
    color:     BRAND.gold,
    inputRing: 'focus:ring-amber-400/40',
    statement: "I run a business and I'm tired of giving 30% to platforms that don't care about my city.",
    tagline:   'Keep 89% of your net profit. Build a loyal local customer base.',
  },
  NONPROFIT: {
    label:     'Nonprofit',
    color:     BRAND.crimson,
    inputRing: 'focus:ring-red-400/40',
    statement: 'I run a nonprofit and I want recurring funding without writing one more grant.',
    tagline:   'Receive 10% of local merchant profit automatically — no fundraising required.',
  },
  CDFI: {
    label:     'CDFI Partner',
    color:     BRAND.darkGold,
    inputRing: 'focus:ring-yellow-600/40',
    statement: 'I fund small businesses in underserved communities and want to back the ones that are already empowering their communities.',
    tagline:   'Find and support mission-aligned businesses already building roots in their community.',
  },
  MUNICIPAL: {
    label:     'Municipal Partner',
    color:     BRAND.navy,
    inputRing: 'focus:ring-blue-900/40',
    statement: 'I work in city government and want to keep economic activity inside my district.',
    tagline:   'Track local spend retention and support small business without new programs.',
  },
};

export function fadeUp(delay = 0) {
  return {
    initial:   { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport:  { once: true },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  } as const;
}

export function fadeIn(delay = 0) {
  return {
    initial:   { opacity: 0 },
    animate:   { opacity: 1 },
    transition: { duration: 0.4, delay },
  } as const;
}
