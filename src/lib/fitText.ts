/**
 * Fitting labels into fixed-width diagram boxes.
 *
 * SVG text does not wrap and does not clip to its parent, so a label longer
 * than its node simply spills across the diagram. There is no way to measure
 * text during a server render, so these estimate the advance width instead and
 * deliberately over-estimate: predicting text slightly wider than it really is
 * costs a little whitespace, while under-estimating puts text back outside the
 * box, which is the bug being fixed.
 */

/** Advance width per character relative to font size, measured against the UI font. */
const CHAR_RATIO = 0.58;

export function estWidth(text: string, size: number): number {
  return text.length * CHAR_RATIO * size;
}

/** Greedy word wrap. Never returns more than `maxLines`; the tail is folded in. */
export function wrapLabel(
  text: string,
  avail: number,
  size: number,
  maxLines = 2,
): string[] {
  if (estWidth(text, size) <= avail) return [text];

  const lines: string[] = [];
  let cur = "";
  for (const word of text.split(/\s+/)) {
    const test = cur ? `${cur} ${word}` : word;
    if (!cur || estWidth(test, size) <= avail) {
      cur = test;
    } else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);

  if (lines.length <= maxLines) return lines;
  const head = lines.slice(0, maxLines - 1);
  head.push(lines.slice(maxLines - 1).join(" "));
  return head;
}

/**
 * Shrinks the font until the longest line fits, down to a floor.
 *
 * The floor exists because a label small enough to fit any width is a label
 * nobody can read — past that point, wrapping has already done its job and a
 * couple of pixels of overhang beats illegibility.
 */
export function fitSize(
  lines: string[],
  avail: number,
  base: number,
  floor = 9.5,
): number {
  const longest = lines.reduce((a, b) => (a.length > b.length ? a : b), "");
  if (!longest || estWidth(longest, base) <= avail) return base;
  return Math.max(floor, avail / estWidth(longest, 1));
}

export type FittedLabel = { lines: string[]; size: number };

export function fitLabel(text: string, avail: number, base: number): FittedLabel {
  const lines = wrapLabel(text, avail, base);
  return { lines, size: fitSize(lines, avail, base) };
}
