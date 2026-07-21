'use client';
import type { StepNote } from '@/lib/slides/pipeline';
import { usePlanT } from '@/components/plan/LangContext';
import type { PlanKey } from '@/lib/plan/i18n';

const LABEL_KEY: Record<string, PlanKey> = {
  outline: 'slides.thinking.outline', draft: 'slides.thinking.draft',
  lint: 'slides.thinking.lint', critic: 'slides.thinking.critic',
};

export function ThinkingPane({ steps, done }: { steps: StepNote[]; done: boolean }) {
  const { t } = usePlanT();
  return (
    <div style={{ display: 'grid', gap: 12, gridAutoRows: 'min-content' }}>
      <div className="slide-kicker">{t('slides.thinking.title')}</div>
      {steps.map((s, i) => (
        <div key={i} style={{ borderLeft: '2px solid var(--feature-color)', paddingLeft: 12 }}>
          <div style={{ fontWeight: 600 }}>{LABEL_KEY[s.step] ? t(LABEL_KEY[s.step]) : s.step}</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>{s.note}</div>
          {s.step === 'lint' && Array.isArray(s.data) && (s.data as unknown[]).length > 0 && (
            <ul style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
              {(s.data as { slideIndex: number; rule: string }[]).map((it, j) => <li key={j}>slide {it.slideIndex}: {it.rule}</li>)}
            </ul>
          )}
        </div>
      ))}
      {!done && steps.length > 0 && <div style={{ fontSize: 12, opacity: 0.5 }}>{t('slides.thinking.working')}</div>}
    </div>
  );
}
