import { handFor, type Hand, type LayoutId } from "./layouts";

/** One change to the typed text: a character typed at `index`, or a backspace. */
export type Keystroke =
  | { t: number; kind: "type"; index: number; correct: boolean }
  | { t: number; kind: "delete" };

/** Gaps longer than this are pauses, not typing speed. */
const PAUSE_MS = 1000;
/** Minimum clean keystrokes per hand before we trust its speed. */
export const MIN_SAMPLES = 12;

export type HandStats = {
  wpm: number;
  accuracy: number;
  samples: number;
};

export type KeyStat = { ms: number; n: number };

export type Result = {
  wpm: number;
  accuracy: number;
  seconds: number;
  left: HandStats;
  right: HandStats;
  /** right wpm / left wpm, or null when either hand has too little data. */
  ratio: number | null;
  keys: Record<string, KeyStat>;
};

const msToWpm = (ms: number) => (ms > 0 ? 12000 / ms : 0); // 5 chars per word

/**
 * Hand speed = average gap before each clean keystroke of that hand.
 * A keystroke counts when it and the one before it were both correct and
 * nothing was deleted in between, so corrections and pauses don't leak in.
 */
export function computeResult(
  events: Keystroke[],
  text: string,
  input: string,
  layout: LayoutId,
  endTime: number,
): Result {
  const gaps: Record<Hand, number[]> = { left: [], right: [] };
  const hits: Record<Hand, [correct: number, total: number]> = {
    left: [0, 0],
    right: [0, 0],
  };
  const keyGaps: Record<string, number[]> = {};
  let typed = 0;
  let typedCorrect = 0;

  events = events.filter((e) => e.t <= endTime);
  events.forEach((e, i) => {
    if (e.kind !== "type") return;
    typed++;
    if (e.correct) typedCorrect++;
    const char = text[e.index];
    const hand = handFor(layout, char);
    if (!hand) return;
    hits[hand][1]++;
    if (e.correct) hits[hand][0]++;

    const prev = events[i - 1];
    if (!e.correct || !prev || prev.kind !== "type" || !prev.correct) return;
    const gap = e.t - prev.t;
    if (gap <= 0 || gap > PAUSE_MS) return;
    gaps[hand].push(gap);
    (keyGaps[char] ??= []).push(gap);
  });

  const handStats = (hand: Hand): HandStats => {
    const g = gaps[hand];
    const [correct, total] = hits[hand];
    return {
      wpm: g.length ? Math.round(msToWpm(mean(g))) : 0,
      accuracy: total ? correct / total : 1,
      samples: g.length,
    };
  };
  const left = handStats("left");
  const right = handStats("right");

  const start = events[0]?.t ?? endTime;
  const seconds = Math.max((endTime - start) / 1000, 0.001);
  let correctChars = 0;
  for (let i = 0; i < input.length; i++) if (input[i] === text[i]) correctChars++;

  const keys: Record<string, KeyStat> = {};
  for (const [char, g] of Object.entries(keyGaps)) {
    keys[char] = { ms: Math.round(mean(g)), n: g.length };
  }

  const enough =
    left.samples >= MIN_SAMPLES && right.samples >= MIN_SAMPLES && left.wpm > 0;

  return {
    wpm: Math.round(correctChars / 5 / (seconds / 60)),
    accuracy: typed ? typedCorrect / typed : 1,
    seconds,
    left,
    right,
    ratio: enough ? right.wpm / left.wpm : null,
    keys,
  };
}

/** Live per-hand wpm while typing (cheap enough to run every keystroke). */
export function liveHands(events: Keystroke[], text: string, layout: LayoutId) {
  const sum = { left: 0, right: 0 };
  const n = { left: 0, right: 0 };
  for (let i = 1; i < events.length; i++) {
    const e = events[i];
    const prev = events[i - 1];
    if (e.kind !== "type" || !e.correct || prev.kind !== "type" || !prev.correct)
      continue;
    const hand = handFor(layout, text[e.index]);
    const gap = e.t - prev.t;
    if (!hand || gap <= 0 || gap > PAUSE_MS) continue;
    sum[hand] += gap;
    n[hand]++;
  }
  return {
    left: n.left ? Math.round(msToWpm(sum.left / n.left)) : 0,
    right: n.right ? Math.round(msToWpm(sum.right / n.right)) : 0,
  };
}

function mean(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** How much faster the leading hand is, e.g. { leader: "right", pct: 14 }. */
export function describeRatio(ratio: number): { leader: Hand | null; pct: number } {
  const leader: Hand = ratio >= 1 ? "right" : "left";
  const pct = Math.round((Math.max(ratio, 1 / ratio) - 1) * 100);
  return { leader: pct < 3 ? null : leader, pct };
}
