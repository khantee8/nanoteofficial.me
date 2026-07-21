// USD per 1,000,000 tokens. Verified via the claude-api skill 2026-07-19.
// claude-sonnet-5: $3.00 input / $15.00 output standard rate (intro pricing
// $2.00/$10.00 runs through 2026-08-31 — we ledger at standard, fail-safe
// direction: slightly overstates cost during the intro window, never understates).
export const PLAN_MODEL = 'claude-sonnet-5';

export interface ModelPrice { input: number; output: number }
export const PRICING: Record<string, ModelPrice> = {
  'claude-sonnet-5': { input: 3, output: 15 },
};

export function costOf(model: string, usage: { input: number; output: number }): number {
  const price = PRICING[model] ?? PRICING[PLAN_MODEL];
  return (usage.input / 1_000_000) * price.input + (usage.output / 1_000_000) * price.output;
}
