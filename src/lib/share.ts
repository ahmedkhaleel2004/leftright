import { isLayoutId, type LayoutId } from "./layouts";

export type Shared = { left: number; right: number; layout: LayoutId };

/** Parses "72-81-qwerty" from a share link. */
export function parseSlug(slug: string): Shared | null {
  const m = /^(\d{1,3})-(\d{1,3})-([a-z]+)$/.exec(slug);
  if (!m) return null;
  const left = Number(m[1]);
  const right = Number(m[2]);
  if (!isLayoutId(m[3]) || !left || !right || left > 300 || right > 300) return null;
  return { left, right, layout: m[3] };
}
