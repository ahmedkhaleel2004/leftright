"use client";

import { useEffect, useRef, useState } from "react";
import { LAYOUTS, type Hand, type LayoutId } from "~/lib/layouts";
import { describeRatio, type Result } from "~/lib/stats";
import { averageRatio, percentile, type Community } from "~/lib/community";
import { KeyboardHeatmap } from "./keyboard-heatmap";
import { CommunityChart } from "./community-chart";

/** Each browser adds at most one data point per layout per half hour. */
const SUBMIT_EVERY_MS = 30 * 60 * 1000;

export function Results({
  result,
  layout,
  label,
  onNext,
}: {
  result: Result;
  layout: LayoutId;
  label: string;
  onNext: () => void;
}) {
  const community = useCommunity(layout, result.ratio);
  const { left, right, ratio } = result;
  const verdict = ratio ? describeRatio(ratio) : null;

  return (
    <div className="animate-rise mx-auto w-full max-w-2xl">
      <div className="text-center">
        <p className="text-xs tracking-wide text-neutral-600">
          {LAYOUTS[layout].name} · {label}
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-balance text-neutral-100 sm:text-4xl">
          {!verdict ? (
            "not enough keystrokes to compare hands"
          ) : verdict.leader ? (
            <>
              your <HandWord hand={verdict.leader} /> hand is {verdict.pct}% faster
            </>
          ) : (
            "your hands are evenly matched"
          )}
        </h1>
        {!verdict && (
          <p className="mt-3 text-sm text-neutral-500">
            each hand needs a dozen clean keystrokes. try a longer test.
          </p>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3">
        <HandCard hand="left" stats={left} />
        <HandCard hand="right" stats={right} />
      </div>
      <SplitBar left={left.wpm} right={right.wpm} />

      <dl className="mt-6 grid grid-cols-3 text-center">
        <Stat label="overall" value={`${result.wpm} wpm`} />
        <Stat label="accuracy" value={`${Math.round(result.accuracy * 100)}%`} />
        <Stat label="time" value={`${result.seconds.toFixed(1)}s`} />
      </dl>

      <Section title="speed per key">
        <KeyboardHeatmap layout={layout} keys={result.keys} />
      </Section>

      {ratio && (
        <Section title={`everyone on ${LAYOUTS[layout].name}`}>
          <CommunitySummary community={community} ratio={ratio} layout={layout} />
        </Section>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
        <button
          onClick={onNext}
          className="rounded-lg bg-neutral-100 px-4 py-2.5 font-medium text-neutral-900 transition-colors hover:bg-white"
        >
          next test <span className="text-neutral-500">↵</span>
        </button>
        {ratio && <Share left={left.wpm} right={right.wpm} layout={layout} />}
      </div>
    </div>
  );
}

function HandWord({ hand }: { hand: Hand }) {
  return <span className={hand === "left" ? "text-lh" : "text-rh"}>{hand}</span>;
}

function HandCard({ hand, stats }: { hand: Hand; stats: Result["left"] }) {
  const color = hand === "left" ? "text-lh" : "text-rh";
  return (
    <div
      className={`rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06] sm:p-5 ${
        hand === "right" ? "text-right" : ""
      }`}
    >
      <div className={`text-xs ${color}`}>{hand} hand</div>
      <div
        className={`mt-2 flex items-baseline gap-1.5 tabular-nums ${
          hand === "right" ? "justify-end" : ""
        }`}
      >
        <span className={`text-4xl font-semibold sm:text-5xl ${color}`}>{stats.wpm || "–"}</span>
        <span className="text-sm text-neutral-500">wpm</span>
      </div>
      <div className="mt-2 text-[11px] whitespace-nowrap text-neutral-500 tabular-nums sm:text-xs">
        {Math.round(stats.accuracy * 100)}% acc · {stats.samples} keys
      </div>
    </div>
  );
}

function SplitBar({ left, right }: { left: number; right: number }) {
  const total = left + right || 1;
  return (
    <div className="mt-3 flex h-1.5 gap-1 overflow-hidden rounded-full">
      <div className="rounded-full bg-lh" style={{ width: `${(left / total) * 100}%` }} />
      <div className="rounded-full bg-rh" style={{ width: `${(right / total) * 100}%` }} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-600">{label}</dt>
      <dd className="mt-1 text-lg text-neutral-200 tabular-nums">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xs text-neutral-600">{title}</h2>
      {children}
    </section>
  );
}

function CommunitySummary({
  community,
  ratio,
  layout,
}: {
  community: Community | "error" | null;
  ratio: number;
  layout: LayoutId;
}) {
  if (community === "error")
    return <p className="text-sm text-neutral-500">couldn&apos;t load community results.</p>;
  if (!community) return <div className="h-40 animate-pulse rounded-xl bg-white/[0.03]" />;

  const p = percentile(community, ratio);
  const avg = averageRatio(community);
  const avgDesc = avg ? describeRatio(avg) : null;
  const name = LAYOUTS[layout].name;

  return (
    <div>
      <CommunityChart community={community} ratio={ratio} />
      <p className="mt-4 text-sm leading-relaxed text-pretty text-neutral-400">
        {community.count < 10 || p === null ? (
          <>
            {community.count <= 1
              ? `you're the first ${name} typist here.`
              : `you're one of the first ${community.count} ${name} typists here.`}{" "}
            the chart fills in as more people take the test.
          </>
        ) : (
          <>
            {p >= 0.5 ? (
              <>
                more <HandWord hand="right" />
                -leaning than {Math.round(p * 100)}%
              </>
            ) : (
              <>
                more <HandWord hand="left" />
                -leaning than {Math.round((1 - p) * 100)}%
              </>
            )}{" "}
            of {community.count.toLocaleString()} {name} typists.
            {avgDesc && (
              <span className="text-neutral-500">
                {" "}
                on average,{" "}
                {avgDesc.leader ? (
                  <>
                    the <HandWord hand={avgDesc.leader} /> hand is {avgDesc.pct}% faster.
                  </>
                ) : (
                  "both hands are about even."
                )}
              </span>
            )}
          </>
        )}
      </p>
    </div>
  );
}

function useCommunity(layout: LayoutId, ratio: number | null) {
  const [community, setCommunity] = useState<Community | "error" | null>(null);
  const sent = useRef(false);

  useEffect(() => {
    if (!ratio || sent.current) return;
    sent.current = true;
    const key = `leftright:submitted:${layout}`;
    const last = Number(localStorage.getItem(key) ?? 0);
    const submit = Date.now() - last > SUBMIT_EVERY_MS;
    fetch(
      `/api/community/${layout}`,
      submit
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ratio }),
          }
        : undefined,
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: Community) => {
        if (submit) localStorage.setItem(key, String(Date.now()));
        setCommunity(data);
      })
      .catch(() => setCommunity("error"));
  }, [layout, ratio]);

  return community;
}

function Share({ left, right, layout }: { left: number; right: number; layout: LayoutId }) {
  const [copied, setCopied] = useState(false);
  const url = `${location.origin}/r/${left}-${right}-${layout}`;
  const text = `my left hand types ${left} wpm, my right hand ${right} wpm. which of your hands is faster?`;

  const share = async () => {
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      await navigator.share({ text, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const btn =
    "rounded-lg px-4 py-2.5 text-neutral-300 ring-1 ring-white/10 transition-colors hover:bg-white/5 hover:text-white";
  return (
    <>
      <button onClick={share} className={btn}>
        {copied ? "copied ✓" : "copy link"}
      </button>
      <a
        className={btn}
        target="_blank"
        rel="noreferrer"
        href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
      >
        post on x
      </a>
    </>
  );
}
