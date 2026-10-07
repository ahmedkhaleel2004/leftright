import { getCloudflareContext } from "@opennextjs/cloudflare";

/** The part of Cloudflare D1 this app uses. */
type Statement = { bind(...values: unknown[]): Statement };
type Database = {
  prepare(sql: string): Statement;
  batch<T>(statements: Statement[]): Promise<{ results: T[] }[]>;
};

type Row = { bucket: number; n: number };

const db = () => (getCloudflareContext().env as unknown as { DB: Database }).DB;

const read = (layout: string) =>
  db().prepare("SELECT bucket, n FROM hist WHERE layout = ?").bind(layout);

const toHash = (rows: Row[]) => Object.fromEntries(rows.map((r) => [r.bucket, r.n]));

/** Bucket counts for a layout, keyed by bucket index. */
export async function readHistogram(layout: string) {
  const [res] = await db().batch<Row>([read(layout)]);
  return toHash(res.results);
}

/** Adds one result to a bucket and returns the updated counts (one transaction). */
export async function addToHistogram(layout: string, bucket: number) {
  const [, res] = await db().batch<Row>([
    db()
      .prepare(
        "INSERT INTO hist (layout, bucket, n) VALUES (?, ?, 1) ON CONFLICT (layout, bucket) DO UPDATE SET n = n + 1",
      )
      .bind(layout, bucket),
    read(layout),
  ]);
  return toHash(res.results);
}
