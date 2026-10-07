import { isLayoutId } from "~/lib/layouts";
import { bucketFor, MAX_RATIO, MIN_RATIO, toCommunity } from "~/lib/community";
import { addToHistogram, readHistogram } from "~/lib/store";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/community/[layout]">,
) {
  const { layout } = await ctx.params;
  if (!isLayoutId(layout)) return Response.json({ error: "bad layout" }, { status: 404 });

  return Response.json(toCommunity(await readHistogram(layout)), {
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

  return Response.json(toCommunity(await addToHistogram(layout, bucketFor(ratio))), {
    headers: { "Cache-Control": "no-store" },
  });
}
