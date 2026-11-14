// screens_business-এর ভাগ করা DOM উপাদান: font, icon (inline SVG, Lucide-ধাঁচ), touch/cursor indicator, toggle, ৳ format।
// সব component বিশুদ্ধ — সময় নিজে পড়ে না, সব মান prop।
import React from "react";

/** body/UI font = SF Pro (আসল iOS/macOS app-এর মতো, 400–800 সব weight আছে); বাংলা আলাদা span-এ (Bn) */
export const UI = "-apple-system, 'SF Pro Text', system-ui, 'Helvetica Neue', sans-serif";
export const BN = "'Sabbir Sorolota', 'Hind Siliguri', sans-serif";
export const INK = "#14213D";
export const SUB = "#5E6B7E";
export const LINE = "#E7EAF0";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toBn = (s: string) => s.replace(/[0-9]/g, (d) => BN_DIGITS[+d]);
/** ৳ টাকা, দেশি comma (1,00,000) */
export const taka = (n: number) => "৳" + Math.round(n).toLocaleString("en-IN");
/** টাকার চিহ্ন Hind-এ, সংখ্যা UI font-এ */
export const Tk: React.FC<{ n: number | string; style?: React.CSSProperties }> = ({ n, style }) => (
  <span style={style}>
    <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 700, marginRight: "0.06em" }}>৳</span>
    {typeof n === "number" ? Math.round(n).toLocaleString("en-IN") : n}
  </span>
);
/** বাংলা লেখা (সংখ্যা Sabbir Sorolota) */
export const Bn: React.FC<{ children: string; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontFamily: BN, fontWeight: 600, ...style }}>{toBn(children)}</span>
);

// ---------- icons ----------
type IconName =
  | "home" | "chart" | "box" | "calendar" | "sliders" | "users" | "bell" | "search" | "right" | "left" | "down" | "check"
  | "star" | "phone" | "chat" | "eye" | "card" | "lock" | "clock" | "pin" | "download" | "send" | "file" | "globe" | "trend"
  | "bag" | "truck" | "tag" | "more" | "shield" | "back" | "user" | "pencil" | "image" | "cash" | "tooth" | "basket" | "info" | "x" | "share";
const P: Record<IconName, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  chart: <><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>,
  box: <><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>,
  sliders: <><path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M1 14h6" /><path d="M9 8h6" /><path d="M17 16h6" /></>,
  users: <><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M22 21v-2a4 4 0 0 0-3-3.85" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  search: <><circle cx="11" cy="11" r="7.5" /><path d="m21 21-4.3-4.3" /></>,
  right: <path d="m9 18 6-6-6-6" />,
  left: <path d="m15 18-6-6 6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  star: <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.4l-5.8 3.05 1.1-6.45-4.7-4.6 6.5-.95z" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  chat: <><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /><path d="M6 15h4" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  clock: <><circle cx="12" cy="12" r="9.5" /><path d="M12 6.5V12l3.5 2" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>,
  send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></>,
  globe: <><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19" /><path d="M12 2.5a14.5 14.5 0 0 1 0 19 14.5 14.5 0 0 1 0-19z" /></>,
  trend: <><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></>,
  bag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
  truck: <><path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.3a4 4 0 0 0-1.2-2.9L19 9h-5v8h1" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>,
  tag: <><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
  more: <><circle cx="12" cy="5" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="12" cy="19" r="1.3" /></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
  back: <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
  user: <><circle cx="12" cy="8" r="4.5" /><path d="M20 21a8 8 0 0 0-16 0" /></>,
  pencil: <><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2.5" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></>,
  cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>,
  tooth: <path d="M7.5 3C5 3 3.5 5 3.5 7.6c0 2.4 1 3.6 1.5 5.8.6 2.7.8 7.6 2.7 7.6 1.7 0 1.6-4.6 4.3-4.6s2.6 4.6 4.3 4.6c1.9 0 2.1-4.9 2.7-7.6.5-2.2 1.5-3.4 1.5-5.8C20.5 5 19 3 16.5 3c-1.9 0-2.9 1-4.5 1S9.4 3 7.5 3Z" />,
  basket: <><path d="m5 11 4-7" /><path d="m19 11-4-7" /><path d="M2 11h20" /><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4" /><path d="M9 15v2M15 15v2M12 15v2" /></>,
  info: <><circle cx="12" cy="12" r="9.5" /><path d="M12 16v-4.5" /><path d="M12 8h.01" /></>,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></>,
};
export const Icon: React.FC<{ n: IconName; s?: number; c?: string; w?: number; fill?: string; style?: React.CSSProperties }> = ({ n, s = 22, c = "currentColor", w = 2, fill = "none", style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "block", ...style }}>
    {P[n]}
  </svg>
);

// ---------- interaction indicators ----------
export type Pointer = { x: number; y: number; down?: number; ripple?: number; show?: number };
/** আঙুলের ছোঁয়া (phone): নরম ছায়া-বৃত্ত, চাপে ছোট হয়, ছাড়লে ঢেউ */
export const Touch: React.FC<Pointer> = ({ x, y, down = 0, ripple = 0, show = 1 }) =>
  show <= 0.001 ? null : (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex: 200, pointerEvents: "none" }}>
      {ripple > 0 && ripple < 1 && (
        <div style={{ position: "absolute", left: -30, top: -30, width: 60, height: 60, borderRadius: 30, border: "3px solid rgba(255,255,255,0.9)", boxShadow: "0 0 0 2px rgba(20,33,61,0.18)", transform: `scale(${0.7 + ripple * 1.5})`, opacity: (1 - ripple) * 0.9 * show }} />
      )}
      <div
        style={{
          position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: 26,
          background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.55), rgba(120,135,160,0.38) 60%, rgba(60,75,100,0.42))",
          border: "2px solid rgba(255,255,255,0.85)", boxShadow: "0 6px 16px rgba(20,33,61,0.28)",
          transform: `scale(${(1 - 0.18 * down) * (0.6 + 0.4 * show)})`, opacity: show,
        }}
      />
    </div>
  );
/** mouse cursor (tablet/desktop): macOS-ধাঁচ কালো তীর + সাদা পাড়; click-এ ছোট হয় ও ঢেউ */
export const Cursor: React.FC<Pointer> = ({ x, y, down = 0, ripple = 0, show = 1 }) =>
  show <= 0.001 ? null : (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex: 200, pointerEvents: "none", opacity: show }}>
      {ripple > 0 && ripple < 1 && (
        <div style={{ position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: 22, background: "rgba(245,149,43,0.28)", border: "2px solid rgba(245,149,43,0.7)", transform: `scale(${0.4 + ripple * 1.2})`, opacity: 1 - ripple }} />
      )}
      <svg width="34" height="34" viewBox="0 0 24 24" style={{ position: "absolute", left: -4, top: -2, transform: `scale(${1 - 0.14 * down})`, transformOrigin: "4px 2px", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.3))" }}>
        <path d="M4.5 2.5v16.2l4.1-3.9 2.6 6 3-1.3-2.6-5.9h5.7z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );

/** iOS-ধাঁচ toggle — k 0 (off) → 1 (on) */
export const Toggle: React.FC<{ k: number; on?: string; w?: number }> = ({ k, on = "#2DBE60", w = 54 }) => {
  const h = w * 0.6;
  const kk = Math.max(0, Math.min(1, k));
  return (
    <div style={{ width: w, height: h, borderRadius: h / 2, background: mixHex("#D5DAE1", on, kk), position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2.5, left: 2.5 + (w - h) * kk, width: h - 5, height: h - 5, borderRadius: h, background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.22)" }} />
    </div>
  );
};

export const mixHex = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const m = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * Math.max(0, Math.min(1, k)));
  return `rgb(${m(16)},${m(8)},${m(0)})`;
};
export const k01 = (x: number) => Math.max(0, Math.min(1, x));
/** ঘুরন্ত spinner (deg prop) */
export const Spinner: React.FC<{ deg: number; s?: number; c?: string }> = ({ deg, s = 44, c = "#E2136E" }) => (
  <svg width={s} height={s} viewBox="0 0 44 44" style={{ transform: `rotate(${deg}deg)` }}>
    <circle cx="22" cy="22" r="18" fill="none" stroke="#EEF0F4" strokeWidth="5" />
    <path d="M22 4a18 18 0 0 1 18 18" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
  </svg>
);
/** আঁকা হতে থাকা সবুজ tick-বৃত্ত (k 0→1) */
export const SuccessMark: React.FC<{ k: number; s?: number; c?: string }> = ({ k, s = 110, c = "#1FAF5A" }) => {
  const ring = k01(k * 1.6);
  const tick = k01((k - 0.45) / 0.55);
  return (
    <svg width={s} height={s} viewBox="0 0 110 110">
      <circle cx="55" cy="55" r="52" fill={c} opacity={0.12 * ring} />
      <circle cx="55" cy="55" r="40" fill={c} transform={`translate(55 55) scale(${0.6 + 0.4 * ring}) translate(-55 -55)`} opacity={ring} />
      <path d="M36 56 49 69 75 42" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={60 * (1 - tick)} />
    </svg>
  );
};
