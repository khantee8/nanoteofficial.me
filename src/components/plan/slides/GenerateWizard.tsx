'use client';
import { useState } from 'react';
import { THEMES, type ThemeId } from '@/lib/slides/deck';
import { estimateCost } from '@/lib/slides/estimate';
import { usePlanT } from '@/components/plan/LangContext';

export function GenerateWizard({ audience, onGenerate, busy }: { audience: string; onGenerate: (o: { theme: ThemeId; slideCount: number; extra: string }) => void; busy: boolean }) {
  const [theme, setTheme] = useState<ThemeId>('midnight');
  const [slideCount, setSlideCount] = useState(8);
  const [extra, setExtra] = useState('');
  const { t } = usePlanT();
  return (
    <div style={{ display: 'grid', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
      <label>{t('slides.wizard.theme')}
        <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeId)}>
          {THEMES.map((th) => <option key={th} value={th}>{th}</option>)}
        </select>
      </label>
      <label>{t('slides.wizard.slides')}: {slideCount}
        <input type="range" min={3} max={20} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} />
      </label>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{t('slides.wizard.audience')}: {audience || 'stakeholders'}</div>
      <textarea placeholder={t('slides.wizard.extraPlaceholder')} rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} />
      <div style={{ fontSize: 12, opacity: 0.7 }}>{t('slides.wizard.estCost')}: ${estimateCost(slideCount).toFixed(3)}</div>
      <button disabled={busy} onClick={() => onGenerate({ theme, slideCount, extra })} style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--feature-color)', color: 'var(--feature-contrast)', border: 0 }}>
        {busy ? t('slides.wizard.generating') : t('slides.wizard.generate')}
      </button>
    </div>
  );
}
