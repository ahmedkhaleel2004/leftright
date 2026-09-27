/**
 * Community distribution of hand ratios (right wpm / left wpm), stored as a
 * histogram over log2(ratio) so "twice as fast" is symmetric either way.
 */
export const BUCKETS = 40;
const LOG_RANGE = 1; // covers ratios 0.5x .. 2x
const WIDTH = (2 * LOG_RANGE) / BUCKETS;

export const MIN_RATIO = 1 / 3;
export const MAX_RATIO = 3;

export type Community = { count: number; buckets: number[] };

export function bucketFor(ratio: number) {
  const i = Math.floor((Math.log2(ratio) + LOG_RANGE) / WIDTH);
  return Math.min(BUCKETS - 1, Math.max(0, i));
}

/** Ratio at the middle of a bucket. */
export function bucketRatio(i: number) {
  return 2 ** (-LOG_RANGE + (i + 0.5) * WIDTH);
}

/** Share of people whose right hand leads by less than yours (0..1). */
export function percentile({ count, buckets }: Community, ratio: number) {
  if (!count) return null;
  const b = bucketFor(ratio);
  let below = 0;
  for (let i = 0; i < b; i++) below += buckets[i];
  return (below + buckets[b] / 2) / count;
}

/** Geometric mean ratio of everyone. */
export function averageRatio({ count, buckets }: Community) {
  if (!count) return null;
  let sum = 0;
  buckets.forEach((n, i) => (sum += n * Math.log2(bucketRatio(i))));
  return 2 ** (sum / count);
}

export function toCommunity(hash: Record<string, unknown> | null): Community {
  const buckets = Array.from({ length: BUCKETS }, (_, i) => Number(hash?.[i] ?? 0));
  return { count: buckets.reduce((a, b) => a + b, 0), buckets };
}
