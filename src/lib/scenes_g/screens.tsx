// scenes_g DOM screen — industry app page (phone 390 px): header + kicker/title + optional big number + row cards + note
import React from "react";
import { StatusBar } from "../../kit/Device";
import { Industry, clamp01 } from "./common";

export type ScreenRow = { label: string; value: string; sub?: string };
export type ScreenData = { kicker: string; title: string; rows: ScreenRow[]; focus?: number; note?: string; big?: { value: string; label: string } };

export const IND: Record<Industry, { accent: string; hi: string; soft: string; bg: string; obj: string }> = {
  dental: { accent: "#1B4470", hi: "#D85E24", soft: "#FFF1E2", bg: "#FBF8F4", obj: "#F1E8DC" },
  restaurant: { accent: "#8E2F17", hi: "#E08A1E", soft: "#FFF0DC", bg: "#FFFAF3", obj: "#F1E4D4" },
  ecommerce: { accent: "#24507E", hi: "#E2552B", soft: "#FFEDE4", bg: "#F8F9FB", obj: "#EDE6DD" },
  school: { accent: "#1F5C4A", hi: "#D99A1C", soft: "#FFF6DF", bg: "#F8FAF7", obj: "#EAE6DA" },
};

const ui = "Inter, 'Hind Siliguri', -apple-system, 'Helvetica Neue', Arial, sans-serif";

export const IndIcon: React.FC<{ ind: Industry; size?: number; color?: string }> = ({ ind, size = 24, color = "#fff" }) => {
  const s = { width: size, height: size };
  if (ind === "dental")
    return (
      <svg {...s} viewBox="0 0 24 24" fill={color}>
        <path d="M7.5 2.5c-2.6 0-4.5 2-4.5 4.8 0 2.2.8 3.5 1.5 5.2.6 1.6.9 3.6 1.3 6 .3 2 1 3 2 3s1.5-1.2 1.8-3c.3-1.6.8-2.8 2.4-2.8s2.1 1.2 2.4 2.8c.3 1.8.8 3 1.8 3s1.7-1 2-3c.4-2.4.7-4.4 1.3-6 .7-1.7 1.5-3 1.5-5.2 0-2.8-1.9-4.8-4.5-4.8-1.8 0-2.8 1-4.5 1s-2.7-1-4.5-1Z" />
      </svg>
    );
  if (ind === "restaurant")
    return (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2v8a2 2 0 0 0 2 2v10M10 2v8a2 2 0 0 1-2 2M8 2v6" />
        <path d="M17 22V2c-2.2 1.2-3.5 3.8-3.5 7v4h3.5" />
      </svg>
    );
  if (ind === "ecommerce")
    return (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 7h14l-1.2 13.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z" />
        <path d="M9 10V6a3 3 0 0 1 6 0v4" />
      </svg>
    );
  return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l10-5 10 5-10 5Z" />
      <path d="M6 11.2V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.8M22 9v6" />
    </svg>
  );
};

/** reveal 0..1 = row-গুলো একে একে; focus 0..1 = data.focus row-এ জোর; note 0..1; big 0..1 = বড় সংখ্যা card */
export const AppScreen: React.FC<{ ind: Industry; brand: string; data: ScreenData; reveal: number; focus?: number; note?: number; big?: number; bigText?: string }> = ({
  ind,
  brand,
  data,
  reveal,
  focus = 0,
  note = 0,
  big = 0,
  bigText,
}) => {
  const P = IND[ind];
  const n = data.rows.length;
  const hasBig = !!data.big;
  return (
    <div style={{ position: "absolute", inset: 0, background: P.bg, fontFamily: ui, color: "#13253C" }}>
      <StatusBar />
      <div style={{ position: "absolute", top: 62, left: 0, right: 0, height: 64, display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: P.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IndIcon ind={ind} />
        </div>
        <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: -0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{brand}</div>
        <svg width="26" height="26" viewBox="0 0 24 24" style={{ marginLeft: "auto" }} fill="none" stroke="#13253C" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: 142, left: 22, right: 22 }}>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1.4, color: P.hi, textTransform: "uppercase" }}>{data.kicker}</div>
        <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.12, marginTop: 6, letterSpacing: -0.5 }}>{data.title}</div>
      </div>
      {hasBig && (
        <div
          style={{
            position: "absolute",
            top: 252,
            left: 16,
            right: 16,
            height: 128,
            borderRadius: 24,
            background: P.accent,
            color: "#fff",
            padding: "18px 22px",
            opacity: clamp01(big * 1.5),
            transform: `translateY(${(1 - clamp01(big)) * 20}px)`,
            boxShadow: "0 10px 24px rgba(20,40,70,0.18)",
          }}
        >
          <div style={{ fontSize: 21, fontWeight: 700, opacity: 0.9 }}>{data.big!.label}</div>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginTop: 4, letterSpacing: -1 }}>{bigText ?? data.big!.value}</div>
        </div>
      )}
      <div style={{ position: "absolute", top: hasBig ? 398 : 256, left: 16, right: 16 }}>
        {data.rows.map((r, i) => {
          const k = clamp01(reveal * n - i);
          const fo = i === data.focus ? clamp01(focus) : 0;
          return (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 22,
                padding: hasBig ? "14px 20px" : "18px 20px",
                marginBottom: hasBig ? 12 : 16,
                opacity: k,
                transform: `translateY(${(1 - k) * 26}px) scale(${1 + fo * 0.03})`,
                boxShadow: `0 6px 18px rgba(30,50,80,0.08), 0 0 0 ${fo * 3}px ${P.hi}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div style={{ fontSize: hasBig ? 25 : 28, fontWeight: 800, lineHeight: 1.15, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</div>
                  {hasBig && <div style={{ fontSize: 25, fontWeight: 800, color: P.hi, whiteSpace: "nowrap" }}>{r.value}</div>}
                </div>
                {!hasBig && <div style={{ fontSize: 27, fontWeight: 800, color: P.hi, marginTop: 4, letterSpacing: -0.3 }}>{r.value}</div>}
                {r.sub && <div style={{ fontSize: 20, fontWeight: 600, color: "#5D6B7C", marginTop: 3 }}>{r.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {data.note && (
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 40,
            background: P.soft,
            borderRadius: 18,
            padding: "14px 18px",
            fontSize: 21,
            fontWeight: 800,
            color: "#7A4412",
            opacity: clamp01(note),
            transform: `translateY(${(1 - clamp01(note)) * 18}px)`,
          }}
        >
          {data.note}
        </div>
      )}
    </div>
  );
};
