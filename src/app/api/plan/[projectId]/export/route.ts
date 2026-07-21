import { auth } from '@/auth';
import { getDeckVersion } from '@/lib/plan/decks';
import { deckToPptx } from '@/lib/slides/pptx';
import { validateDeck } from '@/lib/slides/deck';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response('unauthorized', { status: 401 });
  const { projectId } = await params;
  const url = new URL(req.url);
  const v = Number(url.searchParams.get('v'));
  const ver = await getDeckVersion(projectId, v);
  if (!ver) return new Response('not found', { status: 404 });
  const parsed = validateDeck(ver.deckJson);
  if (!parsed.ok) return new Response('bad deck', { status: 422 });
  try {
    const buf = await deckToPptx(parsed.deck);
    return new Response(new Uint8Array(buf), {
      headers: {
        'content-type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'content-disposition': `attachment; filename="project-${projectId}-v${v}.pptx"`,
      },
    });
  } catch {
    return new Response('export failed', { status: 500 });
  }
}
