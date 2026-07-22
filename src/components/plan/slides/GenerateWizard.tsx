'use client';
import { useState } from 'react';
import { THEME_DEFS } from '@/lib/slides/themes';
import type { ThemeId } from '@/lib/slides/deck';
import { estimateCost } from '@/lib/slides/estimate';
import { usePlanT } from '@/components/plan/LangContext';
import { inputCls, btnPrimary } from '@/components/plan/ui';

const AUDIENCES = [
  { key: 'exec', value: 'executives' }, { key: 'investor', value: 'investors' },
  { key: 'team', value: 'the internal team' }, { key: 'client', value: 'the client' },
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- audience prop kept for call-site compatibility; the wizard derives its own audience from the persona picker
export function GenerateWizard({ audience: _seed, onGenerate, busy }: {
  audience: string; onGenerate: (o: { theme: ThemeId; slideCount: number; extra: string; audience: string }) => void; busy: boolean;
}) {
  const { t } = usePlanT();
  const [theme, setTheme] = useState<ThemeId>('keynote');
  const [slideCount, setSlideCount] = useState(8);
  const [extra, setExtra] = useState('');
  const [audKey, setAudKey] = useState<string>('exec');
  const [custom, setCustom] = useState('');
  const audience = audKey === 'custom' ? custom : (AUDIENCES.find((a) => a.key === audKey)?.value ?? 'executives');

  return (
    <div style={{ display: 'grid', gap: 14, border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div>
        <div className="slide-kicker" style={{ marginBottom: 8 }}>{t('slides.wizard.theme')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {THEME_DEFS.map((td) => (
            <button key={td.id} type="button" onClick={() => setTheme(td.id)}
              style={{ border: theme === td.id ? '2px solid var(--feature-color)' : '1px solid var(--border)', borderRadius: 8, padding: 0, overflow: 'hidden', cursor: 'pointer', background: 'transparent' }}>
              <div style={{ height: 44, background: `#${td.swatch.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: `#${td.swatch.accent}`, fontWeight: 800, fontSize: 18 }}>Aa</span>
              </div>
              <div style={{ fontSize: 11, padding: '4px 0' }}>{td.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="slide-kicker" style={{ marginBottom: 8 }}>{t('slides.wizard.audienceLabel')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[...AUDIENCES, { key: 'custom', value: '' }].map((a) => (
            <button key={a.key} type="button" onClick={() => setAudKey(a.key)}
              style={{ padding: '5px 10px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                border: audKey === a.key ? '1px solid var(--feature-color)' : '1px solid var(--border)',
                background: audKey === a.key ? 'color-mix(in srgb, var(--feature-color) 12%, transparent)' : 'transparent', color: 'inherit' }}>
              {t(`slides.wizard.audience.${a.key}` as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
        {audKey === 'custom' && (
          <input className={inputCls} style={{ marginTop: 8 }} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={t('slides.wizard.audience.custom')} />
        )}
      </div>

      <label style={{ fontSize: 13 }}>{t('slides.wizard.slides')}: {slideCount}
        <input type="range" min={3} max={20} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} style={{ width: '100%' }} />
      </label>

      <textarea className={inputCls} placeholder={t('slides.wizard.extraPlaceholder')} rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} />
      <div style={{ fontSize: 12, opacity: 0.6 }}>{t('slides.wizard.notesInfo')}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{t('slides.wizard.estCost')}: ${estimateCost(slideCount).toFixed(3)}</div>
      <button disabled={busy} onClick={() => onGenerate({ theme, slideCount, extra, audience })} className={btnPrimary}>
        {busy ? t('slides.wizard.generating') : t('slides.wizard.generate')}
      </button>
    </div>
  );
}
