'use client';
import { useState } from 'react';
import type { ThemeId, Deck } from '@/lib/slides/deck';
import type { StepNote } from '@/lib/slides/pipeline';
import { GenerateWizard } from './GenerateWizard';
import { ThinkingPane } from './ThinkingPane';
import { DeckRenderer } from './DeckRenderer';
import { VersionSwitcher } from './VersionSwitcher';
import { ExportButtons } from './ExportButtons';
import { PresentOverlay } from './PresentOverlay';
import { usePlanT } from '@/components/plan/LangContext';

type Version = { versionNo: number; deck: Deck; meta: { costUsd: number; lintFixed: number } };

/** The Manus-split generation UI for one project's slide decks. Unlike the
 *  ported source (which self-fetched plan + versions on mount), this reads
 *  its initial state from the server page (which already loaded the project)
 *  and updates locally from the SSE `done` event — no separate list-refresh
 *  route needed; the stream already carries everything a new version adds. */
export function SlidesPanel({
  projectId, projectName, canGenerate, initialVersions,
}: {
  projectId: string;
  projectName: string;
  audience: string;
  canGenerate: boolean;
  initialVersions: Version[];
}) {
  const [versions, setVersions] = useState<Version[]>(initialVersions);
  const [shown, setShown] = useState<Deck | null>(initialVersions[0]?.deck ?? null);
  const [shownVersionNo, setShownVersionNo] = useState<number | null>(initialVersions[0]?.versionNo ?? null);
  const [steps, setSteps] = useState<StepNote[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [presenting, setPresenting] = useState(false);
  const { t } = usePlanT();

  async function generate(opts: { theme: ThemeId; slideCount: number; extra: string; audience: string }) {
    setBusy(true); setErr(''); setSteps([]); setShown(null);
    try {
      const res = await fetch(`/api/plan/${projectId}/generate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(opts) });
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split('\n\n'); buf = parts.pop() ?? '';
        for (const p of parts) {
          const line = p.replace(/^data: /, '').trim();
          if (!line) continue;
          try {
            const ev = JSON.parse(line);
            if (ev.type === 'step') setSteps((s) => [...s, ev]);
            else if (ev.type === 'done') {
              setShown(ev.deck); setShownVersionNo(ev.versionNo);
              setVersions((vs) => [{ versionNo: ev.versionNo, deck: ev.deck, meta: ev.meta }, ...vs]);
            }
            else if (ev.type === 'error') setErr(ev.message);
          } catch {
            continue;
          }
        }
      }
    } catch {
      setErr(t('slides.streamFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: 20, alignItems: 'start' }}>
        <section style={{ display: 'grid', gap: 16 }}>
          {canGenerate
            ? <GenerateWizard onGenerate={generate} busy={busy} />
            : <p style={{ fontSize: 13, opacity: 0.7 }}>{t('slides.viewerNotice')}</p>}
          {steps.length > 0 && <ThinkingPane steps={steps} done={!busy} />}
          {err && <p style={{ color: '#ff6b6b' }}>{err}</p>}
          {versions.length > 0 && <VersionSwitcher versions={versions} disabled={busy} onPick={(d, versionNo) => { setShown(d); setShownVersionNo(versionNo); }} />}
        </section>
        <section>
          {shown ? (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <ExportButtons projectId={projectId} versionNo={shownVersionNo ?? versions[0]?.versionNo ?? 1} />
                <button onClick={() => setPresenting(true)} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'inherit', marginBottom: 12 }}>
                  {t('slides.present.button')}
                </button>
              </div>
              <div className="print-root"><DeckRenderer deck={shown} project={projectName} /></div>
            </>
          ) : <p style={{ opacity: 0.5 }}>{t('slides.emptyDeck')}</p>}
        </section>
      </div>
      {presenting && shown && <PresentOverlay deck={shown} project={projectName} onClose={() => setPresenting(false)} />}
    </>
  );
}
