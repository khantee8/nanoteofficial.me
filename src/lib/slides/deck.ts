export type { ThemeId } from './themes';
export { THEMES } from './themes';
import type { ThemeId } from './themes';
import { THEMES } from './themes';

export interface ChartSeries { name: string; values: number[] }
export interface Segment { label: string; value: number }
export interface Kpi { value: string; label: string }

type SlideBody =
  | { layout: 'title'; title: string; subtitle?: string }
  | { layout: 'agenda'; heading: string; items: string[] }
  | { layout: 'section'; title: string; kicker?: string }
  | { layout: 'bulletsVisual'; heading: string; bullets: string[]; note?: string }
  | { layout: 'quote'; quote: string; attribution?: string }
  | { layout: 'data'; heading: string; stat: string; caption?: string }
  | { layout: 'comparison'; heading: string; left: { title: string; points: string[] }; right: { title: string; points: string[] } }
  | { layout: 'closing'; title: string; cta?: string }
  | { layout: 'kpi'; heading: string; kpis: Kpi[] }
  | { layout: 'barChart'; heading: string; categories: string[]; series: ChartSeries[]; note?: string }
  | { layout: 'lineChart'; heading: string; categories: string[]; series: ChartSeries[]; note?: string }
  | { layout: 'donutChart'; heading: string; segments: Segment[]; note?: string };

export type Slide = SlideBody & { notes?: string };
export type SlideLayout = SlideBody['layout'];

export interface Deck { theme: ThemeId; slides: Slide[] }

const LAYOUTS = new Set<SlideLayout>(['title','agenda','section','bulletsVisual','quote','data','comparison','closing','kpi','barChart','lineChart','donutChart']);

function isStr(v: unknown): v is string {
  return typeof v === 'string';
}

function isStrArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isStr);
}

function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isNumArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.every(isNum);
}

function isKpi(v: unknown): v is Kpi {
  if (!v || typeof v !== 'object') return false;
  const k = v as Record<string, unknown>;
  return isStr(k.value) && isStr(k.label);
}

function isSegment(v: unknown): v is Segment {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return isStr(s.label) && isNum(s.value);
}

function isSeries(categories: number, v: unknown): v is ChartSeries {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return isStr(s.name) && isNumArray(s.values) && (s.values as number[]).length === categories;
}

function optStr(v: unknown): boolean {
  return v === undefined || isStr(v);
}

function isPanel(v: unknown): v is { title: string; points: string[] } {
  if (!v || typeof v !== 'object') return false;
  const p = v as Record<string, unknown>;
  return isStr(p.title) && isStrArray(p.points);
}

/**
 * Per-layout required-field checks. Each entry validates the fields specific
 * to that layout; optional fields (subtitle, kicker, note, attribution,
 * caption, cta) are checked for type only when present, at the call site.
 */
function validateSlideFields(s: Record<string, unknown>): string | null {
  switch (s.layout as SlideLayout) {
    case 'title':
      if (!isStr(s.title)) return 'missing/invalid title';
      if (!optStr(s.subtitle)) return 'missing/invalid subtitle';
      return null;
    case 'agenda':
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!isStrArray(s.items)) return 'missing/invalid items';
      return null;
    case 'section':
      if (!isStr(s.title)) return 'missing/invalid title';
      if (!optStr(s.kicker)) return 'missing/invalid kicker';
      return null;
    case 'bulletsVisual':
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!isStrArray(s.bullets)) return 'missing/invalid bullets';
      if (!optStr(s.note)) return 'missing/invalid note';
      return null;
    case 'quote':
      if (!isStr(s.quote)) return 'missing/invalid quote';
      if (!optStr(s.attribution)) return 'missing/invalid attribution';
      return null;
    case 'data':
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!isStr(s.stat)) return 'missing/invalid stat';
      if (!optStr(s.caption)) return 'missing/invalid caption';
      return null;
    case 'comparison':
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!isPanel(s.left)) return 'missing/invalid left';
      if (!isPanel(s.right)) return 'missing/invalid right';
      return null;
    case 'closing':
      if (!isStr(s.title)) return 'missing/invalid title';
      if (!optStr(s.cta)) return 'missing/invalid cta';
      return null;
    case 'kpi':
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!Array.isArray(s.kpis) || s.kpis.length < 2 || s.kpis.length > 4 || !s.kpis.every(isKpi)) return 'kpi needs 2–4 {value,label}';
      return null;
    case 'barChart':
    case 'lineChart': {
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!isStrArray(s.categories) || s.categories.length < 1) return 'missing/invalid categories';
      if (!optStr(s.note)) return 'missing/invalid note';
      const n = (s.categories as string[]).length;
      if (!Array.isArray(s.series) || s.series.length < 1 || !s.series.every((x) => isSeries(n, x))) return 'series must match categories length';
      return null;
    }
    case 'donutChart':
      if (!isStr(s.heading)) return 'missing/invalid heading';
      if (!optStr(s.note)) return 'missing/invalid note';
      if (!Array.isArray(s.segments) || s.segments.length < 1 || !s.segments.every(isSegment)) return 'missing/invalid segments';
      return null;
    default:
      return 'bad layout';
  }
}

export function validateDeck(x: unknown): { ok: true; deck: Deck } | { ok: false; error: string } {
  if (!x || typeof x !== 'object') return { ok: false, error: 'not an object' };
  const d = x as Record<string, unknown>;
  if (!THEMES.includes(d.theme as ThemeId)) return { ok: false, error: `bad theme: ${String(d.theme)}` };
  if (!Array.isArray(d.slides)) return { ok: false, error: 'slides must be an array' };
  for (const [i, s] of d.slides.entries()) {
    if (!s || typeof s !== 'object') {
      return { ok: false, error: `slide ${i}: not an object` };
    }
    const rec = s as Record<string, unknown>;
    if (!LAYOUTS.has(rec.layout as SlideLayout)) {
      return { ok: false, error: `slide ${i}: bad layout` };
    }
    const fieldError = validateSlideFields(rec);
    if (fieldError) {
      return { ok: false, error: `slide ${i}: ${fieldError}` };
    }
    if (rec.notes !== undefined && !isStr(rec.notes)) {
      return { ok: false, error: `slide ${i}: invalid notes` };
    }
  }
  return { ok: true, deck: x as Deck };
}
