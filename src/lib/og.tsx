import { ImageResponse } from "next/og";
import { describeRatio } from "./stats";
import type { Shared } from "./share";

export const ogSize = { width: 1200, height: 630 };

const LH = "#5cb8ff";
const RH = "#ffb44d";

async function loadFont(text: string) {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Geist+Mono:wght@500&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = /src: url\((.+?)\) format/.exec(css)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export async function renderOg(shared: Shared | null) {
  const verdict = shared ? describeRatio(shared.right / shared.left) : null;
  const headline = !verdict
    ? "which hand types faster?"
    : verdict.leader
      ? `my ${verdict.leader} hand is ${verdict.pct}% faster`
      : "my hands are evenly matched";
  const leftValue = shared ? String(shared.left) : "?";
  const rightValue = shared ? String(shared.right) : "?";
  const footer = shared ? `wpm on ${shared.layout} · test yours at leftrighthand.pages.dev` : "a typing test that times each hand · leftrighthand.pages.dev";

  const font = await loadFont(`left/right${headline}${leftValue}${rightValue}${footer}handwpm ?`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0c0c0d",
          color: "#e5e5e5",
          padding: "64px 72px",
          fontFamily: font ? "Geist Mono" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32 }}>
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{ width: 14, height: 30, borderRadius: 3, background: LH }} />
            <div style={{ width: 14, height: 30, borderRadius: 3, background: RH }} />
          </div>
          <span style={{ color: LH }}>left</span>
          <span style={{ color: "#555" }}>/</span>
          <span style={{ color: RH }}>right</span>
        </div>
        <div style={{ display: "flex", marginTop: 64, fontSize: 60, color: "#f5f5f5", letterSpacing: -1 }}>
          {headline}
        </div>
        <div style={{ display: "flex", gap: 32, marginTop: 48 }}>
          {[
            { label: "left hand", value: leftValue, color: LH },
            { label: "right hand", value: rightValue, color: RH },
          ].map((h) => (
            <div
              key={h.label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "28px 36px",
                borderRadius: 24,
                background: "#161618",
                border: "1px solid #232326",
              }}
            >
              <span style={{ fontSize: 28, color: h.color }}>{h.label}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 8 }}>
                <span style={{ fontSize: 110, color: h.color, lineHeight: 1 }}>{h.value}</span>
                <span style={{ fontSize: 32, color: "#777" }}>wpm</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 26, color: "#777" }}>{footer}</div>
      </div>
    ),
    {
      ...ogSize,
      fonts: font ? [{ name: "Geist Mono", data: font, weight: 500, style: "normal" }] : undefined,
    },
  );
}
