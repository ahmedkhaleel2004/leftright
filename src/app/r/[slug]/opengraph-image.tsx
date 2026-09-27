import { ogSize, renderOg } from "~/lib/og";
import { parseSlug } from "~/lib/share";

export const alt = "left and right hand typing speed";
export const size = ogSize;
export const contentType = "image/png";

// Rendered once per result, then served from the CDN.
export function generateStaticParams() {
  return [];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderOg(parseSlug(slug));
}
