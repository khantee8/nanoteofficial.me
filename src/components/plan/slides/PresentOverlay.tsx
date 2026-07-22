'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Deck } from '@/lib/slides/deck';
import { SlideView } from './SlideView';
import { usePlanT } from '@/components/plan/LangContext';

export function PresentOverlay({ deck, project, onClose }: { deck: Deck; project: string; onClose: () => void }) {
  const { t } = usePlanT();
  const [i, setI] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = deck.slides.length;
  const next = useCallback(() => setI((v) => Math.min(v + 1, total - 1)), [total]);
  const prev = useCallback(() => setI((v) => Math.max(v - 1, 0)), []);

  useEffect(() => {
    ref.current?.requestFullscreen?.().catch(() => {});
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') { /* fullscreenchange handler closes */ if (!document.fullscreenElement) onClose(); }
      else if (e.key.toLowerCase() === 's') setNotesOpen((v) => !v);
      else if (e.key.toLowerCase() === 'f') { document.fullscreenElement ? document.exitFullscreen() : ref.current?.requestFullscreen?.(); }
    };
    const onFsChange = () => { if (!document.fullscreenElement) onClose(); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFsChange); };
  }, [next, prev, onClose]);

  const current = deck.slides[i];
  return (
    <div ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: 'min(100%, 177.78vh)', aspectRatio: '16/9' }}
          onClick={(e) => (e.clientX < window.innerWidth / 2 ? prev() : next())}>
          <SlideView slide={current} theme={deck.theme} footer={{ index: i + 1, total, project }} />
        </div>
      </div>
      {notesOpen && (
        <div style={{ maxHeight: '22vh', overflow: 'auto', padding: '12px 24px', background: '#111', color: '#eee', fontSize: 15, lineHeight: 1.5 }}>
          <div style={{ opacity: 0.5, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{t('slides.present.notes')}</div>
          {current.notes || t('slides.present.noNotes')}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: '#000', color: '#888', fontSize: 12 }}>
        <span>{t('slides.present.exitHint')}</span>
        <span>{t('slides.present.counter', { cur: i + 1, total })}</span>
      </div>
      <div style={{ height: 3, background: '#222' }}><div style={{ height: '100%', width: `${((i + 1) / total) * 100}%`, background: 'var(--feature-color)' }} /></div>
    </div>
  );
}
