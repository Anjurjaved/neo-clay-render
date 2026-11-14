// DOM screens — lock screen notification stack (title hook), speech-bubble face (quote)
import React from "react";
import { StatusBar } from "../../kit/Device";

const ui = "Inter, -apple-system, 'Hind Siliguri', 'Helvetica Neue', Arial, sans-serif";
const bn = "'Hind Siliguri', Inter, sans-serif";

export type AlertKind = "call" | "chat" | "messenger" | "cart" | "mail" | "sms";
export type Alert = { kind: AlertKind; app: string; text: string; time?: string };

const APP: Record<AlertKind, { bg: string; fg: string }> = {
  call: { bg: "#FDE7E5", fg: "#E5484D" },
  chat: { bg: "#DDF6E6", fg: "#1DAA55" },
  messenger: { bg: "#E9E6FF", fg: "#6A4CF5" },
  cart: { bg: "#FFEBD9", fg: "#E8781F" },
  mail: { bg: "#E3EEFC", fg: "#2F6FD1" },
  sms: { bg: "#E2F3FF", fg: "#1689D6" },
};

const Icon: React.FC<{ kind: AlertKind; s?: number }> = ({ kind, s = 26 }) => {
  const c = APP[kind].fg;
  if (kind === "call")
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
      </svg>
    );
  if (kind === "cart")
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="20" r="1.4" fill={c} />
        <circle cx="18" cy="20" r="1.4" fill={c} />
        <path d="M2.5 3.5h3l2.4 11.2h10.6l2-8H6.6" />
      </svg>
    );
  if (kind === "mail")
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  // chat / messenger / sms — bubble
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M12 3C6.8 3 2.8 6.6 2.8 11.1c0 2.4 1.1 4.5 3 6L5 21l4.3-2.2c.9.2 1.8.3 2.7.3 5.2 0 9.2-3.6 9.2-8.1S17.2 3 12 3Z" />
    </svg>
  );
};

/** lock screen: বড় summary card (count) + notification সারি — count অনুযায়ী সারি জমে */
export const AlertScreen: React.FC<{ day: string; time: string; summary: string; count: number; alerts: Alert[]; kind: AlertKind }> = ({ day, time, summary, count, alerts, kind }) => {
  const n = Math.max(0, Math.round(count));
  const shown = alerts.slice(0, Math.min(alerts.length, Math.max(0, Math.ceil(n / 3))));
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(172deg,#26364F 0%,#3B5274 48%,#6E86A6 100%)", fontFamily: ui, color: "#fff" }}>
      <StatusBar dark time="" />
      <div style={{ position: "absolute", top: 96, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.85 }}>{day}</div>
        <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -3, lineHeight: 1.0 }}>{time}</div>
      </div>
      <div style={{ position: "absolute", top: 268, left: 16, right: 16 }}>
        {n > 0 && (
          <div style={{ background: "rgba(255,255,255,0.94)", borderRadius: 26, padding: "18px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 12, color: "#152338" }}>
            <div style={{ width: 54, height: 54, borderRadius: 15, background: APP[kind].bg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icon kind={kind} s={30} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, color: "#6b7785", fontWeight: 700 }}>{alerts[0]?.app ?? "Phone"}</div>
              <div style={{ fontSize: 31, fontWeight: 800, letterSpacing: -0.5, fontFamily: ui }}>
                <span style={{ color: APP[kind].fg }}>{n}</span> {summary}
              </div>
            </div>
          </div>
        )}
        {shown.map((a, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.86)",
              borderRadius: 22,
              padding: "13px 16px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#1E2B3D",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 11, background: APP[a.kind].bg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icon kind={a.kind} s={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "#5f6b7a" }}>
                <span>{a.app}</span>
                <span style={{ fontWeight: 600 }}>{a.time ?? "now"}</span>
              </div>
              <div style={{ fontSize: 21, fontWeight: 600, fontFamily: bn, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.35 }}>{a.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** speech bubble-এর সামনের DOM — শব্দ শব্দ করে আসে (k[i] 0..1), emphasis শব্দ কমলা highlight */
export const QuoteFace: React.FC<{ words: string[]; k: number[]; emph: boolean[]; fs: number; speaker: string; speakerK: number; mark: number }> = ({ words, k, emph, fs, speaker, speakerK, mark }) => (
  <div style={{ position: "absolute", inset: 0, background: "#FCFAF6", fontFamily: bn, color: "#13253C", padding: "34px 44px 0 44px", boxSizing: "border-box" }}>
    <div style={{ position: "absolute", left: 30, top: 6, fontSize: 150, lineHeight: 1, fontFamily: "Georgia, serif", color: "#F5952B", opacity: 0.9 * mark, transform: `scale(${0.6 + 0.4 * mark})`, transformOrigin: "20% 60%" }}>“</div>
    <div style={{ fontSize: fs, fontWeight: 700, lineHeight: 1.38, paddingLeft: 58, paddingTop: 6 }}>
      {words.map((w, i) => {
        const kk = Math.max(0, Math.min(1, k[i]));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: fs * 0.26,
              opacity: kk,
              transform: `translateY(${(1 - kk) * fs * 0.35}px) scale(${0.92 + 0.08 * kk})`,
              color: emph[i] ? "#D85E24" : "#13253C",
              backgroundImage: emph[i] ? "linear-gradient(transparent 62%, rgba(245,149,43,0.28) 62%)" : undefined,
              backgroundSize: `${Math.max(0, Math.min(1, (kk - 0.4) / 0.6)) * 100}% 100%`,
              backgroundRepeat: "no-repeat",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
    <div style={{ position: "absolute", left: 102, bottom: 30, fontSize: fs * 0.62, fontWeight: 700, color: "#3E4C5E", opacity: speakerK, transform: `translateX(${(1 - speakerK) * -20}px)`, fontFamily: ui }}>
      — {speaker}
    </div>
  </div>
);
