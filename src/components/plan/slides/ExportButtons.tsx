'use client';
import { usePlanT } from '@/components/plan/LangContext';

export function ExportButtons({ projectId, versionNo }: { projectId: string; versionNo: number }) {
  const { t } = usePlanT();
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <a href={`/api/plan/${projectId}/export?fmt=pptx&v=${versionNo}`} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6 }}>{t('slides.export.pptx')}</a>
      <button onClick={() => window.print()} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'inherit' }}>{t('slides.export.pdf')}</button>
    </div>
  );
}
