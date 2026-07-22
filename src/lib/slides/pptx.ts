import PptxGenJS from 'pptxgenjs';
import type { Deck, Slide } from './deck';
import { themeDef, type ThemeId } from './themes';

function colorsFor(theme: string) {
  const d = themeDef(theme as ThemeId);
  return { bg: d.swatch.bg, fg: d.swatch.fg, accent: d.swatch.accent, ramp: d.ramp };
}

export function countPptxSlides(deck: Deck): number { return deck.slides.length; }

function addSlide(pptx: PptxGenJS, s: Slide, c: { bg: string; fg: string; accent: string; ramp: string[] }) {
  const slide = pptx.addSlide();
  slide.background = { color: c.bg };
  const body = (text: string, y: number, opts: object = {}) => slide.addText(text, { x: 0.6, y, w: 9, color: c.fg, fontSize: 18, ...opts });
  switch (s.layout) {
    case 'title': body(s.title, 2.2, { fontSize: 40, bold: true }); if (s.subtitle) body(s.subtitle, 3.4, { color: c.accent }); break;
    case 'section': body(s.kicker ?? '', 2.0, { color: c.accent, fontSize: 12 }); body(s.title, 2.6, { fontSize: 34, bold: true }); break;
    case 'agenda': body(s.heading, 0.6, { color: c.accent, fontSize: 12 }); slide.addText(s.items.map((t) => ({ text: t, options: { bullet: true } })), { x: 0.6, y: 1.4, w: 9, color: c.fg, fontSize: 18 }); break;
    case 'bulletsVisual': body(s.heading, 0.6, { fontSize: 26, bold: true }); slide.addText(s.bullets.map((t) => ({ text: t, options: { bullet: true } })), { x: 0.6, y: 1.6, w: 9, color: c.fg, fontSize: 18 }); if (s.note) body(s.note, 4.6, { fontSize: 12 }); break;
    case 'quote': body(`"${s.quote}"`, 2.0, { fontSize: 28, italic: true }); if (s.attribution) body(s.attribution, 3.6, { color: c.accent }); break;
    case 'data': body(s.heading, 0.8, { color: c.accent, fontSize: 12 }); body(s.stat, 1.6, { fontSize: 72, bold: true, color: c.accent }); if (s.caption) body(s.caption, 3.8); break;
    case 'comparison': body(s.heading, 0.6, { fontSize: 24, bold: true }); slide.addText(s.left.title, { x: 0.6, y: 1.3, w: 4.2, color: c.accent, fontSize: 16, bold: true }); slide.addText(s.right.title, { x: 5.2, y: 1.3, w: 4.2, color: c.accent, fontSize: 16, bold: true }); slide.addText(s.left.points.map((t) => ({ text: t, options: { bullet: true } })), { x: 0.6, y: 1.9, w: 4.2, color: c.fg }); slide.addText(s.right.points.map((t) => ({ text: t, options: { bullet: true } })), { x: 5.2, y: 1.9, w: 4.2, color: c.fg }); break;
    case 'closing': body(s.title, 2.4, { fontSize: 36, bold: true }); if (s.cta) body(s.cta, 3.8, { color: c.accent }); break;
    case 'kpi': {
      body(s.heading, 0.6, { fontSize: 22, bold: true });
      const n = s.kpis.length, w = 9 / n;
      s.kpis.forEach((k, i) => {
        slide.addText(k.value, { x: 0.6 + i * w, y: 1.8, w, h: 1.2, color: c.accent, fontSize: 40, bold: true, align: 'center' });
        slide.addText(k.label, { x: 0.6 + i * w, y: 3.0, w, color: c.fg, fontSize: 14, align: 'center' });
      });
      break;
    }
    case 'barChart':
    case 'lineChart': {
      body(s.heading, 0.5, { fontSize: 22, bold: true });
      const type = s.layout === 'barChart' ? pptx.ChartType.bar : pptx.ChartType.line;
      const data = s.series.map((ser) => ({ name: ser.name, labels: s.categories, values: ser.values }));
      slide.addChart(type, data, {
        x: 0.6, y: 1.3, w: 8.8, h: 3.6, showLegend: s.series.length > 1, legendPos: 'b',
        chartColors: s.series.length > 1 ? c.ramp : [c.accent],
        catAxisLabelColor: c.fg, valAxisLabelColor: c.fg, showValue: false,
      });
      break;
    }
    case 'donutChart': {
      body(s.heading, 0.5, { fontSize: 22, bold: true });
      slide.addChart(pptx.ChartType.doughnut, [{ name: s.heading, labels: s.segments.map((x) => x.label), values: s.segments.map((x) => x.value) }], {
        x: 0.6, y: 1.3, w: 8.8, h: 3.6, showLegend: true, legendPos: 'r', chartColors: c.ramp, holeSize: 55,
      });
      break;
    }
  }
  if (s.notes) slide.addNotes(s.notes);
}

export async function deckToPptx(deck: Deck): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'W', width: 10, height: 5.63 });
  pptx.layout = 'W';
  const c = colorsFor(deck.theme);
  for (const s of deck.slides) addSlide(pptx, s, c);
  return (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
}
