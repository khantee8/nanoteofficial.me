export type ThemeId = 'midnight' | 'editorial' | 'grid' | 'keynote' | 'mono' | 'sunrise';

export interface ThemeDef {
  id: ThemeId;
  label: string;
  /** hex without '#'; drives the wizard swatch preview and the PPTX color map. */
  swatch: { bg: string; fg: string; accent: string };
  /** small categorical ramp (hex without '#') for multi-series charts. */
  ramp: string[];
  /** CSS var names emitted by next/font (see fonts.ts). */
  displayVar: string;
  bodyVar: string;
}

export const THEME_DEFS: ThemeDef[] = [
  { id: 'midnight',  label: 'Midnight',  swatch: { bg: '0b0e14', fg: 'eef1f6', accent: '5cc8ff' }, ramp: ['5cc8ff', '9b8cff', '4fd1a1', 'ffb454'], displayVar: '--font-space-grotesk', bodyVar: '--font-inter' },
  { id: 'editorial', label: 'Editorial', swatch: { bg: 'f7f6f2', fg: '17140f', accent: 'c8452d' }, ramp: ['c8452d', '3d7a6b', 'c79a2d', '4a4a8a'], displayVar: '--font-fraunces', bodyVar: '--font-inter' },
  { id: 'grid',      label: 'Grid',      swatch: { bg: '111111', fg: 'ffffff', accent: 'e8ff00' }, ramp: ['e8ff00', '00e0ff', 'ff5c7a', '9b8cff'], displayVar: '--font-archivo', bodyVar: '--font-jetbrains' },
  { id: 'keynote',   label: 'Keynote',   swatch: { bg: 'ffffff', fg: '141821', accent: '3b4fbf' }, ramp: ['3b4fbf', '2f9e7d', 'd08b12', 'b0416a'], displayVar: '--font-inter-tight', bodyVar: '--font-inter' },
  { id: 'mono',      label: 'Mono',      swatch: { bg: '0a0a0a', fg: 'fafafa', accent: 'fafafa' }, ramp: ['fafafa', 'a3a3a3', '737373', 'd4d4d4'], displayVar: '--font-archivo-black', bodyVar: '--font-inter' },
  { id: 'sunrise',   label: 'Sunrise',   swatch: { bg: 'fff8f0', fg: '231a12', accent: 'e8622a' }, ramp: ['e8622a', 'd8a521', '4a8fb0', '9c5bb8'], displayVar: '--font-fraunces', bodyVar: '--font-inter' },
];

export const THEMES: ThemeId[] = THEME_DEFS.map((t) => t.id);

const BY_ID = new Map(THEME_DEFS.map((t) => [t.id, t]));
export function themeDef(id: ThemeId): ThemeDef {
  return BY_ID.get(id) ?? THEME_DEFS[0];
}
