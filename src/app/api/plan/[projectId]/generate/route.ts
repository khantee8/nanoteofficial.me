import { auth } from '@/auth';
import { getProject, listTasks } from '@/lib/plan/queries';
import { buildProjectBrief, addDeckVersion } from '@/lib/plan/decks';
import { generateDeck } from '@/lib/slides/pipeline';
import { THEMES, type ThemeId } from '@/lib/slides/deck';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response('unauthorized', { status: 401 });
  if (session.user.role !== 'admin' && session.user.role !== 'editor') {
    return new Response('forbidden', { status: 403 });
  }
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) return new Response('not found', { status: 404 });

  const body = await req.json().catch(() => ({}));
  const theme: ThemeId = THEMES.includes(body.theme) ? body.theme : 'midnight';
  const slideCount = Math.min(Math.max(Number(body.slideCount) || 8, 3), 20);
  // Recomputed fresh (not passed from the page load) so the brief reflects
  // the project's current tasks, not a stale snapshot from when the page rendered.
  const tasks = await listTasks(projectId);
  const brief = buildProjectBrief(project, tasks);

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
      try {
        const result = await generateDeck(
          { theme, slideCount, audience: body.audience ?? '', brief, extra: body.extra },
          undefined,
          (n) => send({ type: 'step', ...n }),
        );
        const version = await addDeckVersion(projectId, result.deck, result.meta, session.user.id ?? null);
        send({ type: 'done', versionNo: version.versionNo, deck: result.deck, meta: result.meta });
      } catch (e) {
        send({ type: 'error', message: e instanceof Error ? e.message : 'generation failed' });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' } });
}
