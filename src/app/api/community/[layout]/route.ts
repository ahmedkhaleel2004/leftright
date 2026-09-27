import { Redis } from "@upstash/redis";
import { isLayoutId } from "~/lib/layouts";
import { bucketFor, MAX_RATIO, MIN_RATIO, toCommunity } from "~/lib/community";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const key = (layout: string) => `hist:${layout}`;

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/community/[layout]">,
) {
  const { layout } = await ctx.params;
  if (!isLayoutId(layout)) return Response.json({ error: "bad layout" }, { status: 404 });

  const hash = await redis.hgetall<Record<string, number>>(key(layout));
  return Response.json(toCommunity(hash), {
    // Served from Vercel's CDN; Redis is read at most about once a minute.
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400" },
  });
}

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/community/[layout]">,
) {
  const { layout } = await ctx.params;
  if (!isLayoutId(layout)) return Response.json({ error: "bad layout" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { ratio?: unknown } | null;
  const ratio = body?.ratio;
  if (typeof ratio !== "number" || !(ratio >= MIN_RATIO && ratio <= MAX_RATIO)) {
    return Response.json({ error: "bad ratio" }, { status: 400 });
  }

  const [, hash] = await redis
    .pipeline()
    .hincrby(key(layout), String(bucketFor(ratio)), 1)
    .hgetall<Record<string, number>>(key(layout))
    .exec<[number, Record<string, number> | null]>();

  return Response.json(toCommunity(hash), {
    headers: { "Cache-Control": "no-store" },
  });
}
