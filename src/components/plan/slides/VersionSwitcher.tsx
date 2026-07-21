'use client';
import type { Deck } from '@/lib/slides/deck';
import { usePlanT } from '@/components/plan/LangContext';

type Version = { versionNo: number; deck: Deck; meta: { costUsd: number; lintFixed: number } };

export function VersionSwitcher({ versions, onPick, disabled }: { versions: Version[]; onPick: (d: Deck, versionNo: number) => void; disabled?: boolean }) {
  const { t } = usePlanT();
  return (
    <div>
      <div className="slide-kicker" style={{ marginBottom: 6 }}>{t('slides.versions.title')}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {versions.map((v) => (
          <button key={v.versionNo} disabled={disabled} onClick={() => onPick(v.deck, v.versionNo)}
            style={{ textAlign: 'left', padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'inherit' }}>
            v{v.versionNo} · ${v.meta.costUsd?.toFixed(3)} · {v.meta.lintFixed ?? 0} fixed
          </button>
        ))}
      </div>
    </div>
  );
}
