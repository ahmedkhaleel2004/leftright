import { bucketFor, bucketRatio, type Community } from "~/lib/community";

/** Histogram of everyone's right/left ratio, with your bar highlighted. */
export function CommunityChart({ community, ratio }: { community: Community; ratio: number }) {
  const mine = bucketFor(ratio);
  const max = Math.max(1, ...community.buckets);

  return (
    <div>
      <div className="relative flex h-32 items-end gap-[2px]" role="img" aria-label="distribution of hand speed ratios">
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
        {community.buckets.map((n, i) => {
          const isMine = i === mine;
          const leftSide = bucketRatio(i) < 1;
          return (
            <div key={i} className="relative flex h-full flex-1 items-end">
              {isMine && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full text-[10px] whitespace-nowrap text-neutral-100">
                  you
                </span>
              )}
              <div
                className={`w-full rounded-t-[2px] ${
                  isMine ? "bg-neutral-100" : leftSide ? "bg-lh/50" : "bg-rh/50"
                }`}
                style={{ height: `${Math.max(isMine ? 6 : 2, (n / max) * 100)}%` }}
                title={`${n} ${n === 1 ? "person" : "people"}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-3 text-[11px] text-neutral-600">
        <span>
          <span className="text-lh">left</span> 2× faster
        </span>
        <span className="text-center">even</span>
        <span className="text-right">
          <span className="text-rh">right</span> 2× faster
        </span>
      </div>
    </div>
  );
}
