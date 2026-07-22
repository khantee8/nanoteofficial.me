import type { Deck } from '@/lib/slides/deck';
import { SlideView } from './SlideView';

export function DeckRenderer({ deck, project }: { deck: Deck; project?: string }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {deck.slides.map((s, i) => (
        <SlideView key={i} slide={s} theme={deck.theme}
          footer={project ? { index: i + 1, total: deck.slides.length, project } : undefined} />
      ))}
    </div>
  );
}
