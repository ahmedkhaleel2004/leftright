"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { handFor, LAYOUT_IDS, LAYOUTS, isLayoutId, type LayoutId } from "~/lib/layouts";
import { randomWords } from "~/lib/words";
import { computeResult, liveHands, type Keystroke, type Result } from "~/lib/stats";
import { Results } from "./results";

type Mode = "words" | "time";
const AMOUNTS: Record<Mode, number[]> = { words: [15, 30, 60], time: [15, 30, 60] };

type Settings = { layout: LayoutId; mode: Mode; amount: number; tint: boolean };
const DEFAULT_SETTINGS: Settings = { layout: "qwerty", mode: "words", amount: 30, tint: true };
const SETTINGS_KEY = "leftright:settings";

/** Wrong characters allowed in a row before input is blocked. */
const MAX_WRONG_STREAK = 5;
const TIME_MODE_WORDS = 80;

function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
    const s = { ...DEFAULT_SETTINGS, ...saved };
    if (!isLayoutId(s.layout)) s.layout = DEFAULT_SETTINGS.layout;
    if (!(s.mode in AMOUNTS)) s.mode = DEFAULT_SETTINGS.mode;
    if (!AMOUNTS[s.mode as Mode].includes(s.amount)) s.amount = AMOUNTS[s.mode as Mode][1];
    return s;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function makeWords({ mode, amount }: Settings) {
  return randomWords(mode === "words" ? amount : TIME_MODE_WORDS);
}

export function TypingTest() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [words, setWords] = useState<string[] | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [now, setNow] = useState(0);
  const [focused, setFocused] = useState(true);
  const [blocked, setBlocked] = useState(0);
  const [touch, setTouch] = useState(false);

  const [events, setEvents] = useState<Keystroke[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 0 });
  const [scroll, setScroll] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const [resized, setResized] = useState(0);
  // Latest typing state for the time-mode clock, which runs outside render.
  const latest = useRef({ events, input });
  useEffect(() => {
    latest.current = { events, input };
  }, [events, input]);

  const text = useMemo(() => words?.join(" ") ?? "", [words]);
  const { layout, mode, amount, tint } = settings;

  const focus = useCallback(() => inputRef.current?.focus({ preventScroll: true }), []);

  const restart = useCallback(
    (next: Settings, freshWords = true) => {
      setEvents([]);
      if (freshWords) setWords(makeWords(next));
      setInput("");
      setStatus("idle");
      setResult(null);
      setScroll(0);
      requestAnimationFrame(focus);
    },
    [focus],
  );

  // Random words and saved settings only exist in the browser.
  useEffect(() => {
    const s = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only initial state
    setSettings(s);
    setWords(makeWords(s));
    setTouch(matchMedia("(pointer: coarse)").matches);
  }, []);

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    if (patch.mode && patch.mode !== settings.mode) next.amount = AMOUNTS[patch.mode][1];
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    // Layout and colors don't change the words, so keep them unless mid-test.
    const needsWords = patch.mode !== undefined || patch.amount !== undefined;
    restart(next, needsWords || status !== "idle");
  };

  const finish = useCallback(
    (end: number, finalEvents: Keystroke[], finalInput: string) => {
      setResult(computeResult(finalEvents, text, finalInput, layout, end));
      setStatus("done");
    },
    [text, layout],
  );

  // Time mode clock.
  useEffect(() => {
    if (status !== "running" || mode !== "time") return;
    const id = setInterval(() => {
      const t = performance.now();
      setNow(t);
      const { events, input } = latest.current;
      const start = events[0]?.t ?? t;
      if (t - start >= amount * 1000) finish(start + amount * 1000, events, input);
    }, 100);
    return () => clearInterval(id);
  }, [status, mode, amount, finish]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === "done" || !words) return;
    const value = e.target.value.slice(0, text.length);
    const t = performance.now();

    let common = 0;
    while (common < value.length && common < input.length && value[common] === input[common])
      common++;
    const added = value.slice(common);

    // Block runaway typing after several misses in a row.
    if (added.length === 1 && value.length > input.length && added !== text[common]) {
      let streak = 0;
      for (let i = input.length - 1; i >= 0 && input[i] !== text[i]; i--) streak++;
      if (streak >= MAX_WRONG_STREAK) {
        setBlocked((b) => b + 1);
        return;
      }
    }

    const nextEvents = [...events];
    for (let i = input.length; i > common; i--) nextEvents.push({ t, kind: "delete" });
    [...added].forEach((char, k) => {
      const index = common + k;
      nextEvents.push({ t, kind: "type", index, correct: char === text[index] });
    });
    setEvents(nextEvents);

    if (status === "idle" && value.length > 0) {
      setStatus("running");
      setNow(t);
    }
    setInput(value);

    if (mode === "words" && value.length === text.length) finish(t, nextEvents, value);
    if (mode === "time" && text.length - value.length < 80) {
      setWords((w) => (w ? [...w, ...randomWords(40)] : w));
    }
  };

  // Keyboard shortcuts: tab / esc restart, enter on results, any key focuses.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key === "Escape") {
        e.preventDefault();
        restart(settings);
      } else if (e.key === "Enter" && status === "done") {
        e.preventDefault();
        restart(settings);
      } else if (
        document.activeElement !== inputRef.current &&
        status !== "done" &&
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [restart, settings, status, focus]);

  // Move the caret and scroll so the current line stays second from the top.
  useLayoutEffect(() => {
    const box = textRef.current;
    if (!box || !text) return;
    const lh = parseFloat(getComputedStyle(box).lineHeight);
    setLineHeight(lh);
    const at = Math.min(input.length, text.length - 1);
    const el = box.querySelector<HTMLElement>(`[data-i="${at}"]`);
    if (!el) return;
    const past = input.length > at;
    const x = el.offsetLeft + (past ? el.offsetWidth : 0);
    const y = el.offsetTop;
    setCaret({ x, y, h: el.offsetHeight });
    const line = Math.round(y / lh);
    setScroll(Math.max(0, line - 1) * lh);
  }, [input, text, resized]);

  // Re-measure on resize (line wrapping changes).
  useEffect(() => {
    const onResize = () => setResized((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const live = status === "running" ? liveHands(events, text, layout) : null;
  const elapsed = status === "running" && events[0] ? now - events[0].t : 0;
  const typedWords = input.split(" ").length - (input.endsWith(" ") || !input ? 1 : 0);

  return (
    <div className="flex flex-1 flex-col">
      <Controls settings={settings} onChange={update} />

      <div className="flex flex-1 flex-col justify-center py-8 sm:py-12">
        {status === "done" && result ? (
          <Results
            result={result}
            layout={layout}
            label={`${amount} ${mode === "words" ? "words" : "seconds"}`}
            onNext={() => restart(settings)}
          />
        ) : (
          <div>
            <h1
              className={`mb-2 text-center font-sans text-lg text-balance text-neutral-400 transition-opacity duration-300 sm:text-xl ${
                status === "idle" ? "" : "opacity-0"
              }`}
            >
              which hand types faster, your <span className="text-lh">left</span> or your{" "}
              <span className="text-rh">right</span>?
            </h1>
            <div className="mb-5 flex h-7 items-end justify-between text-sm tabular-nums">
              <span className="text-lh">
                {live ? (
                  <>
                    L <span className="text-lg">{live.left || "–"}</span>
                  </>
                ) : null}
              </span>
              <span className="text-neutral-500">
                {status === "running"
                  ? mode === "time"
                    ? Math.max(0, Math.ceil(amount - elapsed / 1000))
                    : `${typedWords}/${amount}`
                  : null}
              </span>
              <span className="text-rh">
                {live ? (
                  <>
                    <span className="text-lg">{live.right || "–"}</span> R
                  </>
                ) : null}
              </span>
            </div>

            <div
              className="relative cursor-text overflow-hidden"
              style={{ height: lineHeight ? lineHeight * 3 : undefined }}
              onClick={focus}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSelect={(e) => {
                  // Keep the cursor at the end; editing mid-text isn't allowed.
                  const el = e.currentTarget;
                  el.setSelectionRange(el.value.length, el.value.length);
                }}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Type the text shown"
                className="absolute inset-0 z-10 h-full w-full cursor-text text-base opacity-0"
              />
              <div
                ref={textRef}
                key={blocked}
                className={`relative text-[1.35rem] leading-[2.4rem] transition-transform duration-150 ease-out select-none sm:text-[1.65rem] sm:leading-[2.9rem] ${
                  blocked ? "animate-shake" : ""
                } ${focused ? "" : "blur-[3px]"}`}
                style={{ transform: `translateY(${-scroll}px)` }}
              >
                {words ? (
                  <Text text={text} input={input} layout={layout} tint={tint} />
                ) : (
                  <span className="text-neutral-700">loading words…</span>
                )}
                {words && focused && (
                  <span
                    aria-hidden
                    className={`absolute top-0 left-0 w-[2px] rounded-full bg-neutral-100 transition-transform duration-75 ease-out ${
                      status === "idle" ? "animate-blink" : ""
                    }`}
                    style={{
                      height: caret.h * 0.72,
                      transform: `translate(${caret.x - 1}px, ${caret.y + caret.h * 0.14}px)`,
                    }}
                  />
                )}
              </div>
              {!focused && words && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-sm text-neutral-400">
                  click here or press any key to focus
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 text-xs text-neutral-600">
              <button
                onClick={() => restart(settings)}
                className="rounded-md px-3 py-2 text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-200"
              >
                ↻ new text
              </button>
              {/* Hidden rather than removed once typing starts, so nothing shifts. */}
              <p
                className={`max-w-md text-center leading-relaxed transition-opacity duration-300 ${
                  status === "idle" ? "" : "invisible opacity-0"
                }`}
              >
                  {tint ? (
                    <>
                      letters are colored by the hand that types them:{" "}
                      <span className="text-lh">left</span> and{" "}
                      <span className="text-rh">right</span>.{" "}
                    </>
                  ) : null}
                  {touch
                    ? "this test needs a physical keyboard. on a phone you're timing thumbs, not hands."
                    : "tab or esc for new text."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Text({
  text,
  input,
  layout,
  tint,
}: {
  text: string;
  input: string;
  layout: LayoutId;
  tint: boolean;
}) {
  // Words are inline-block so lines only break between words.
  const words: React.ReactNode[] = [];
  let i = 0;
  for (const word of text.split(" ")) {
    const start = i;
    // Each word carries its trailing space, so no line starts with one.
    const chars = [...(i + word.length < text.length ? `${word} ` : word)].map((char) => {
      const idx = i++;
      return <Char key={idx} idx={idx} char={char} typed={input[idx]} layout={layout} tint={tint} />;
    });
    words.push(
      <span key={`w${start}`} className="inline-block whitespace-nowrap">
        {chars}
      </span>,
    );
  }
  return <>{words}</>;
}

function Char({
  idx,
  char,
  typed,
  layout,
  tint,
}: {
  idx: number;
  char: string;
  typed: string | undefined;
  layout: LayoutId;
  tint: boolean;
}) {
  let cls: string;
  if (typed === undefined) {
    const hand = tint ? handFor(layout, char) : null;
    cls = hand === "left" ? "text-lh/45" : hand === "right" ? "text-rh/45" : "text-neutral-600";
  } else if (typed === char) {
    cls = "text-neutral-100";
  } else {
    cls = "rounded-[3px] bg-red-500/15 text-red-400";
  }
  return (
    <span data-i={idx} className={cls}>
      {char === " " ? "\u00a0" : char}
    </span>
  );
}

function Controls({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-4 text-xs sm:text-[13px]">
      <Group className="hidden md:flex">
        {LAYOUT_IDS.map((id) => (
          <Pill key={id} active={settings.layout === id} onClick={() => onChange({ layout: id })}>
            {LAYOUTS[id].name}
          </Pill>
        ))}
      </Group>
      <Group className="md:hidden">
        <label className="relative flex items-center">
          <span className="sr-only">keyboard layout</span>
          <select
            value={settings.layout}
            onChange={(e) => onChange({ layout: e.target.value as LayoutId })}
            className="appearance-none rounded-md bg-white/10 py-0.5 pr-7 pl-2.5 text-base text-neutral-100 outline-none"
          >
            {LAYOUT_IDS.map((id) => (
              <option key={id} value={id}>
                {LAYOUTS[id].name}
              </option>
            ))}
          </select>
          <span aria-hidden className="pointer-events-none absolute right-2.5 text-[10px] text-neutral-400">
            ▼
          </span>
        </label>
      </Group>
      <Group>
        {(["words", "time"] as const).map((m) => (
          <Pill key={m} active={settings.mode === m} onClick={() => onChange({ mode: m })}>
            {m}
          </Pill>
        ))}
        <span className="mx-1 h-4 w-px bg-neutral-800" />
        {AMOUNTS[settings.mode].map((n) => (
          <Pill key={n} active={settings.amount === n} onClick={() => onChange({ amount: n })}>
            {n}
            {settings.mode === "time" ? "s" : ""}
          </Pill>
        ))}
      </Group>
      <Group>
        <Pill active={settings.tint} onClick={() => onChange({ tint: !settings.tint })}>
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5">
              <span className={`size-1.5 rounded-full ${settings.tint ? "bg-lh" : "bg-neutral-600"}`} />
              <span className={`size-1.5 rounded-full ${settings.tint ? "bg-rh" : "bg-neutral-600"}`} />
            </span>
            colors
          </span>
        </Pill>
      </Group>
    </div>
  );
}

function Group({ children, className = "flex" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`items-center rounded-lg bg-white/[0.03] p-1 ring-1 ring-white/[0.06] ${className}`}>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      className={`rounded-md px-2.5 py-1.5 whitespace-nowrap transition-colors ${
        active ? "bg-white/10 text-neutral-100" : "text-neutral-500 hover:text-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}
