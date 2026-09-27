import { LAYOUTS, type LayoutId } from "~/lib/layouts";
import type { KeyStat } from "~/lib/stats";

/** Row stagger, in key widths, like a real keyboard. */
const STAGGER = [0, 0.25, 0.75];

export function KeyboardHeatmap({
  layout,
  keys,
}: {
  layout: LayoutId;
  keys: Record<string, KeyStat>;
}) {
  const times = Object.values(keys).map((k) => k.ms);
  const fast = Math.min(...times);
  const slow = Math.max(...times);
  const ranked = Object.entries(keys)
    .filter(([, k]) => k.n >= 2)
    .sort((a, b) => a[1].ms - b[1].ms);

  // Faster keys glow brighter.
  const strength = (ms: number) => (slow === fast ? 0.6 : 0.15 + 0.75 * ((slow - ms) / (slow - fast)));

  return (
    <div>
      <div className="flex flex-col gap-1 sm:gap-1.5">
        {LAYOUTS[layout].rows.map((row, r) => (
          <div key={r} className="flex justify-center" style={{ paddingLeft: `${STAGGER[r] * 7}%` }}>
            {[...row].map((key, i) => {
              const stat = keys[key];
              const left = i < 5;
              const color = left ? "92 184 255" : "255 180 77";
              return (
                <div
                  key={key}
                  title={stat ? `${key}: ${stat.ms}ms avg (${stat.n}×)` : `${key}: not typed`}
                  className={`flex aspect-square w-[9%] max-w-12 flex-col items-center justify-center rounded-md text-sm sm:rounded-lg sm:text-base ${
                    i === 4 ? "mr-[3%]" : "mr-1 sm:mr-1.5"
                  } ${stat ? "text-neutral-950" : "text-neutral-700 ring-1 ring-white/[0.06]"}`}
                  style={
                    stat
                      ? { background: `rgb(${color} / ${strength(stat.ms)})`, color: strength(stat.ms) < 0.45 ? "#e5e5e5" : undefined }
                      : undefined
                  }
                >
                  <span className="leading-none">{key}</span>
                  {stat && (
                    <span className="mt-0.5 hidden text-[10px] leading-none opacity-70 tabular-nums sm:block">
                      {stat.ms}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {ranked.length >= 2 && (
        <p className="mt-4 text-center text-xs text-neutral-500">
          fastest <Key>{ranked[0][0]}</Key> {ranked[0][1].ms}ms · slowest{" "}
          <Key>{ranked.at(-1)![0]}</Key> {ranked.at(-1)![1].ms}ms
          <span className="hidden sm:inline"> · average time before each key</span>
        </p>
      )}
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-neutral-200">{children}</kbd>
  );
}
