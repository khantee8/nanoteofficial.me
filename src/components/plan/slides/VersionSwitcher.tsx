'use client';
import type { Deck } from '@/lib/slides/deck';
import { SlideView } from './SlideView';
import { usePlanT } from '@/components/plan/LangContext';

type Version = { versionNo: number; deck: Deck; meta: { costUsd: number; lintFixed: number }; createdAt: string };

function useRel() {
  const { t } = usePlanT();
  return (iso: string) => {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return t('slides.versions.justNow');
    if (mins < 60) return t('slides.versions.minsAgo', { n: mins });
    if (mins < 1440) return t('slides.versions.hrsAgo', { n: Math.round(mins / 60) });
    return t('slides.versions.daysAgo', { n: Math.round(mins / 1440) });
  };
}

export function VersionSwitcher({ versions, onPick, disabled, activeVersionNo }: {
  versions: Version[]; onPick: (d: Deck, versionNo: number) => void; disabled?: boolean; activeVersionNo: number | null;
}) {
  const { t } = usePlanT();
  const rel = useRel();
  return (
    <div>
      <div className="slide-kicker" style={{ marginBottom: 8 }}>{t('slides.versions.title')}</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {versions.map((v) => (
          <button key={v.versionNo} disabled={disabled} onClick={() => onPick(v.deck, v.versionNo)}
            style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 10, alignItems: 'center', textAlign: 'left', padding: 6,
              border: activeVersionNo === v.versionNo ? '1px solid var(--feature-color)' : '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'inherit', cursor: 'pointer' }}>
            <div style={{ width: 96, aspectRatio: '16/9', overflow: 'hidden', borderRadius: 4, pointerEvents: 'none' }}>
              <div style={{ width: 480, transform: 'scale(0.2)', transformOrigin: 'top left' }}>
                <SlideView slide={v.deck.slides[0]} theme={v.deck.theme} />
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>v{v.versionNo} {activeVersionNo === v.versionNo && <span style={{ fontSize: 11, opacity: 0.6 }}>· {t('slides.versions.current')}</span>}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{rel(v.createdAt)}</div>
              <div style={{ fontSize: 11, opacity: 0.45 }}>{t('slides.versions.cost', { cost: v.meta.costUsd?.toFixed(3) ?? '—', fixed: v.meta.lintFixed ?? 0 })}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
