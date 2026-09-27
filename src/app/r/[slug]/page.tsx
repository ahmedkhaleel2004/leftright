import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "~/components/shell";
import { TypingTest } from "~/components/typing-test";
import { LAYOUTS } from "~/lib/layouts";
import { parseSlug } from "~/lib/share";
import { describeRatio } from "~/lib/stats";

// Share pages render once on first visit, then are served from the CDN.
export const revalidate = 3600;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/r/[slug]">): Promise<Metadata> {
  const shared = parseSlug((await props.params).slug);
  if (!shared) return {};
  const title = `left ${shared.left} wpm · right ${shared.right} wpm — which hand types faster?`;
  const description = "A typing test that times each hand separately. Is your left or right hand faster?";
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedResult(props: PageProps<"/r/[slug]">) {
  const shared = parseSlug((await props.params).slug);
  if (!shared) notFound();
  const { leader, pct } = describeRatio(shared.right / shared.left);

  return (
    <Shell>
      <div className="mx-auto mt-4 max-w-xl rounded-xl bg-white/[0.03] px-4 py-3 text-center text-sm text-neutral-400 ring-1 ring-white/[0.06]">
        someone typed <span className="text-lh">{shared.left} wpm</span> with their left hand and{" "}
        <span className="text-rh">{shared.right} wpm</span> with their right on{" "}
        {LAYOUTS[shared.layout].name}
        {leader ? (
          <>
            {" "}
            (<span className={leader === "left" ? "text-lh" : "text-rh"}>{leader}</span> {pct}% faster)
          </>
        ) : null}
        . how about you?
      </div>
      <TypingTest />
    </Shell>
  );
}
