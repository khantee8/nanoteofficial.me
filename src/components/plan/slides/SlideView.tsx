import type { Slide } from '@/lib/slides/deck';
import { themeDef, type ThemeId } from '@/lib/slides/themes';
import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { DonutChart } from './charts/DonutChart';
import './deck-themes.css';

export function SlideView({ slide, theme, footer }: {
  slide: Slide; theme: string; footer?: { index: number; total: number; project: string };
}) {
  const showFooter = footer && slide.layout !== 'title' && slide.layout !== 'closing';
  const frame = (children: React.ReactNode) => (
    <div className="slide" data-theme={theme}>
      {children}
      {showFooter && (
        <div className="slide-footer"><span>{footer!.project}</span><span>{footer!.index} / {footer!.total}</span></div>
      )}
    </div>
  );
  const td = themeDef(theme as ThemeId);
  const accent = td.swatch.accent, ramp = td.ramp;
  switch (slide.layout) {
    case 'title': return frame(<><div /><div><div className="slide-title">{slide.title}</div>{slide.subtitle && <p className="slide-sub">{slide.subtitle}</p>}</div><div /></>);
    case 'section': return frame(<><span className="slide-kicker">{slide.kicker}</span><div className="slide-title">{slide.title}</div><div /></>);
    case 'agenda': return frame(<><span className="slide-kicker">{slide.heading}</span><ul className="slide-bullets">{slide.items.map((x, i) => <li key={i}>{x}</li>)}</ul><div /></>);
    case 'bulletsVisual': return frame(<><h2 className="slide-heading">{slide.heading}</h2><ul className="slide-bullets">{slide.bullets.map((x, i) => <li key={i}>{x}</li>)}</ul>{slide.note && <p className="slide-note">{slide.note}</p>}</>);
    case 'quote': return frame(<><div /><blockquote className="slide-quote">&ldquo;{slide.quote}&rdquo;</blockquote><cite className="slide-cite">{slide.attribution}</cite></>);
    case 'data': return frame(<><span className="slide-kicker">{slide.heading}</span><div className="slide-stat">{slide.stat}</div><p className="slide-note" style={{ opacity: 0.7 }}>{slide.caption}</p></>);
    case 'comparison': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-compare">{[slide.left, slide.right].map((c, i) => <div key={i}><h3>{c.title}</h3><ul className="slide-bullets">{c.points.map((p, j) => <li key={j}>{p}</li>)}</ul></div>)}</div><div /></>);
    case 'closing': return frame(<><div /><div className="slide-title">{slide.title}</div><p style={{ color: 'var(--accent)' }}>{slide.cta}</p></>);
    case 'kpi': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-kpis">{slide.kpis.map((k, i) => <div key={i}><div className="slide-kpi-value">{k.value}</div><div className="slide-kpi-label">{k.label}</div></div>)}</div><div /></>);
    case 'barChart': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-chart-wrap"><BarChart categories={slide.categories} series={slide.series} accent={accent} ramp={ramp} /></div>{slide.note && <p className="slide-note">{slide.note}</p>}</>);
    case 'lineChart': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-chart-wrap"><LineChart categories={slide.categories} series={slide.series} accent={accent} ramp={ramp} /></div>{slide.note && <p className="slide-note">{slide.note}</p>}</>);
    case 'donutChart': return frame(<><h2 className="slide-heading">{slide.heading}</h2><div className="slide-chart-wrap"><DonutChart segments={slide.segments} accent={accent} ramp={ramp} /></div>{slide.note && <p className="slide-note">{slide.note}</p>}</>);
    default: return null;
  }
}
