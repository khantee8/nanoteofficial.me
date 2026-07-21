import Anthropic from '@anthropic-ai/sdk';

// Lazy client — constructing eagerly at module scope would throw when
// ANTHROPIC_API_KEY is unset, which must never fail the build or any
// unrelated page (same invariant `src/lib/db/index.ts` keeps for DATABASE_URL).
let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

function textOf(msg: Anthropic.Messages.Message): string {
  return msg.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

export interface CompleteOpts {
  system: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
}

export interface CompleteResult {
  text: string;
  stopReason: string | null;
  usage: { input: number; output: number };
  model: string;
}

/** One streamed request with transient-error retry (429/5xx). Streaming avoids
 *  HTTP timeouts on the deck-generation `max_tokens` sizes. */
async function streamOnce(params: Anthropic.Messages.MessageStreamParams): Promise<Anthropic.Messages.Message> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const stream = client().messages.stream(params);
      return (await stream.finalMessage()) as Anthropic.Messages.Message;
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      if (status && status < 500 && status !== 429) throw err;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw lastErr;
}

export async function completeRaw(opts: CompleteOpts): Promise<CompleteResult> {
  const { system, prompt, model, maxTokens = 1500 } = opts;
  const msg = await streamOnce({
    model: model!,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  });
  return {
    text: textOf(msg),
    stopReason: msg.stop_reason,
    usage: { input: msg.usage.input_tokens, output: msg.usage.output_tokens },
    model: msg.model,
  };
}
