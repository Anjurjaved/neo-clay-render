// screens_sites — shared shell + icon set for the business-website screens.
// প্রতিটা site দুই রূপে: desktop (1024×640 viewport, tablet-এ 60 px browser bar সহ মোট 1024×700) ও
// mobile (390×843, status bar + sticky header + Safari bottom bar)। scroll = px (translateY), reveal = 0..1।
// section-এর উচ্চতা fixed (SiteDef) — তাই scene থেকে নির্দিষ্ট section-এ scroll করা যায় (`anchorOf`)।
import React from "react";
import { StatusBar } from "../../kit/Device";

export type Mode = "desktop" | "mobile";
export type SiteProps = { mode: Mode; scroll?: number; reveal?: number };
export type SectionDef = { key: string; h: { desktop: number; mobile: number } };
export type SiteDef = { url: string; header: { desktop: number; mobile: number }; sections: SectionDef[] };

/** DOM screen মাপ — Tablet screen 1024×700 (60 bar + 640 site), phone 390×843 */
export const VIEW = { desktop: { w: 1024, h: 640, bar: 60 }, mobile: { w: 390, h: 843, status: 54, bottom: 76 } };
export const FONT = "Inter, 'Sabbir Sorolota', 'Hind Siliguri', -apple-system, sans-serif";
export const BN = "Inter, 'Sabbir Sorolota', 'Hind Siliguri', sans-serif"; // বাংলা অঙ্ক Sabbir Sorolota-তে

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const viewH = (def: SiteDef, mode: Mode) => (mode === "desktop" ? VIEW.desktop.h : VIEW.mobile.h - VIEW.mobile.status - VIEW.mobile.bottom) - def.header[mode];
export const totalH = (def: SiteDef, mode: Mode) => def.sections.reduce((a, s) => a + s.h[mode], 0);
export const maxScroll = (def: SiteDef, mode: Mode) => Math.max(0, totalH(def, mode) - viewH(def, mode));
/** section-এর শুরু পর্যন্ত scroll px (maxScroll দিয়ে আটকানো) */
export const anchorOf = (def: SiteDef, mode: Mode, key: string, offset = 0) => {
  let y = 0;
  for (const s of def.sections) {
    if (s.key === key) break;
    y += s.h[mode];
  }
  return clamp(y + offset, 0, maxScroll(def, mode));
};

/** section reveal — header প্রথমে, তারপর ক্রমানুসারে */
export const revealK = (reveal: number, i: number, n: number) => clamp(reveal * (n + 1.2) - i);
const revealStyle = (k: number): React.CSSProperties => ({ opacity: k, transform: `translateY(${(1 - k) * 34}px)` });

/** পুরো site-এর খোলস: browser bar / status bar, sticky header, scroll করা section */
export const SiteShell: React.FC<{
  def: SiteDef;
  mode: Mode;
  scroll?: number;
  reveal?: number;
  bg?: string;
  headerBg?: string;
  dark?: boolean; // status bar ink
  header: React.ReactNode;
  sections: Record<string, React.ReactNode>;
  floating?: React.ReactNode; // যেমন WhatsApp/চ্যাট bubble (scroll হয় না)
}> = ({ def, mode, scroll = 0, reveal = 1, bg = "#fff", headerBg = "#fff", dark = false, header, sections, floating }) => {
  const d = mode === "desktop";
  const hh = def.header[mode];
  const sc = clamp(scroll, 0, maxScroll(def, mode));
  const n = def.sections.length;
  const hk = revealK(reveal, 0, n);
  const top = d ? VIEW.desktop.bar : VIEW.mobile.status;
  const bottom = d ? 0 : VIEW.mobile.bottom;
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, fontFamily: FONT, color: "#16202c", overflow: "hidden" }}>
      {d ? <BrowserBar url={def.url} /> : <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top, background: headerBg, zIndex: 40 }} />}
      {!d && <StatusBar dark={dark} />}
      <div style={{ position: "absolute", left: 0, right: 0, top, bottom, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: hh, transform: `translateY(${-sc}px)` }}>
          {def.sections.map((s, i) => (
            <div key={s.key} style={{ height: s.h[mode], position: "relative", overflow: "hidden", ...revealStyle(revealK(reveal, i + 1, n)) }}>
              {sections[s.key]}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: hh,
            background: headerBg,
            zIndex: 20,
            boxShadow: sc > 8 ? "0 6px 22px rgba(20,30,45,0.10)" : "0 1px 0 rgba(20,30,45,0.06)",
            ...revealStyle(hk),
            transform: `translateY(${(1 - hk) * -20}px)`,
          }}
        >
          {header}
        </div>
        {floating && <div style={{ position: "absolute", inset: 0, zIndex: 30, opacity: revealK(reveal, n, n) }}>{floating}</div>}
      </div>
      {!d && <SafariBar url={def.url} />}
    </div>
  );
};

/** desktop browser chrome (Chrome-ধাঁচ, logo ছাড়া) — 60 px */
export const BrowserBar: React.FC<{ url: string }> = ({ url }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: VIEW.desktop.bar, background: "#EEF0F3", borderBottom: "1px solid #DADDE2", display: "flex", alignItems: "center", padding: "0 18px", gap: 14, zIndex: 60 }}>
    <div style={{ display: "flex", gap: 8 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
      ))}
    </div>
    <Ic d={I.chevL} s={20} c="#5f6670" w={2.4} />
    <Ic d={I.chevR} s={20} c="#b4b9c0" w={2.4} />
    <Ic d={I.refresh} s={18} c="#5f6670" w={2.4} />
    <div style={{ flex: 1, height: 38, borderRadius: 19, background: "#fff", display: "flex", alignItems: "center", padding: "0 16px", gap: 10, fontSize: 17, fontWeight: 600, color: "#2b3138", boxShadow: "inset 0 0 0 1px #E1E4E8" }}>
      <Ic d={I.lock} s={16} c="#1E8E3E" w={2.6} />
      <span style={{ color: "#8a919a" }}>https://</span>
      <span style={{ marginLeft: -10 }}>{url}</span>
      <div style={{ marginLeft: "auto" }}>
        <Ic d={I.star} s={18} c="#9aa1aa" w={2.2} />
      </div>
    </div>
    <div style={{ width: 30, height: 30, borderRadius: 15, background: "linear-gradient(135deg,#F5952B,#D85E24)", color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>J</div>
  </div>
);

/** iOS Safari bottom bar — 76 px */
export const SafariBar: React.FC<{ url: string }> = ({ url }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: VIEW.mobile.bottom, background: "rgba(246,246,248,0.97)", borderTop: "1px solid #E3E4E8", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 9 }}>
    <div style={{ width: 340, height: 40, borderRadius: 13, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 16, fontWeight: 600, color: "#1c1f24" }}>
      <Ic d={I.lock} s={13} c="#1c1f24" w={2.8} />
      {url.split("/")[0]}
    </div>
    <div style={{ position: "absolute", bottom: 7, width: 134, height: 5, borderRadius: 3, background: "#111" }} />
  </div>
);

/** Lucide-ধাঁচ stroke icon (explicit size) */
export const Ic: React.FC<{ d: string | string[]; s?: number; c?: string; w?: number; fill?: string; style?: React.CSSProperties }> = ({ d, s = 22, c = "currentColor", w = 2, fill = "none", style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", display: "block", ...style }}>
    {(Array.isArray(d) ? d : [d]).map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

export const I = {
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z",
  chat: "M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2-5.4A8.4 8.4 0 1 1 21 11.5Z",
  pin: ["M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  clock: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 6v6l4 2"],
  cal: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"],
  user: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M22 21v-2a4 4 0 0 0-3-3.9", "M16 3.1a4 4 0 0 1 0 7.8"],
  check: "M20 6 9 17l-5-5",
  checkC: ["M22 11.1V12a10 10 0 1 1-5.9-9.1", "M22 4 12 14l-3-3"],
  arrowR: ["M5 12h14", "M12 5l7 7-7 7"],
  chevL: "M15 18l-6-6 6-6",
  chevR: "M9 18l6-6-6-6",
  chevD: "M6 9l6 6 6-6",
  refresh: ["M21 12a9 9 0 1 1-3-6.7L21 8", "M21 3v5h-5"],
  lock: ["M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z", "M7 11V7a5 5 0 0 1 10 0v4"],
  star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z",
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M21 21l-4.3-4.3"],
  cart: ["M8 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", "M19 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", "M2 2h3l2.7 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"],
  bag: ["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
  heart: "M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z",
  truck: ["M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", "M15 18H9", "M19 18h2a1 1 0 0 0 1-1v-3.6a1 1 0 0 0-.2-.6l-3.5-4.4A1 1 0 0 0 17.5 8H14", "M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  shield: ["M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z", "M9 12l2 2 4-4"],
  sparkle: ["M12 3l1.9 5.8L20 10.7l-6.1 1.9L12 18.5l-1.9-5.9L4 10.7l6.1-1.9Z", "M19 3v4", "M21 5h-4"],
  tooth: "M7.5 2.5c-2.6 0-4.5 2.1-4.5 5 0 2.3.8 3.6 1.4 5.3.6 1.8.8 4 1.3 6.2.4 1.8 1 3 2.1 3 1.3 0 1.6-1.6 2-3.5.3-1.6.8-3.2 2.2-3.2s1.9 1.6 2.2 3.2c.4 1.9.7 3.5 2 3.5 1.1 0 1.7-1.2 2.1-3 .5-2.2.7-4.4 1.3-6.2.6-1.7 1.4-3 1.4-5.3 0-2.9-1.9-5-4.5-5-1.7 0-2.8 1-4.5 1s-2.8-1-4.5-1Z",
  award: ["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z", "M8.2 13.9 7 23l5-3 5 3-1.2-9.1"],
  utensils: ["M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2", "M7 2v20", "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"],
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.4.3 1.3 1.3 2.9 2.5 2.9Z",
  leaf: ["M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z", "M2 21c0-3 1.9-5.4 5.1-6"],
  minus: "M5 12h14",
  plus: ["M5 12h14", "M12 5v14"],
  book: ["M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"],
  cap: ["M22 10 12 5 2 10l10 5 10-5Z", "M6 12v5c3 3 9 3 12 0v-5"],
  play: "M6 3l14 9-14 9Z",
  bed: ["M2 4v16", "M2 8h18a2 2 0 0 1 2 2v10", "M2 17h20", "M6 8v9"],
  bath: ["M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5", "M10 5 8 7", "M2 12h20", "M7 19v2", "M17 19v2"],
  ruler: ["M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z", "M14.5 12.5l2-2", "M11.5 9.5l2-2", "M8.5 6.5l2-2", "M17.5 15.5l2-2"],
  car: ["M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2", "M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M9 17h6"],
  building: ["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", "M10 6h4", "M10 10h4", "M10 14h4", "M10 18h4"],
  lift: ["M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", "M9 10l-2-2-2 2", "M12 3v18", "M15 14l2 2 2-2"],
  mail: ["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z", "M22 7l-10 6L2 7"],
  monitor: ["M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", "M8 21h8", "M12 17v4"],
  pen: ["M12 19l7-7 3 3-7 7-3-3Z", "M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z", "M2 2l7.6 7.6", "M11 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  code: ["M16 18l6-6-6-6", "M8 6l-6 6 6 6"],
  rocket: ["M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z", "M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2Z", "M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0", "M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"],
  discuss: ["M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2Z", "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"],
  globe: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"],
  wifi: ["M5 12.6a10 10 0 0 1 14 0", "M8.5 16.4a5 5 0 0 1 7 0", "M12 20h.01", "M2 8.8a15 15 0 0 1 20 0"],
  zap: "M13 2 3 14h9l-1 8 10-12h-9Z",
  card: ["M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z", "M2 10h20"],
  cash: ["M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M6 12h.01", "M18 12h.01"],
  filter: "M22 3H2l8 9.5V19l4 2v-8.5Z",
  x: ["M18 6 6 18", "M6 6l12 12"],
  tag: ["M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z", "M7.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"],
  return: ["M9 14 4 9l5-5", "M4 9h10.5a5.5 5.5 0 0 1 0 11H11"],
  trophy: ["M6 9H4.5a2.5 2.5 0 0 1 0-5H6", "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", "M4 22h16", "M10 14.7V17c0 .6-.5 1-1 1.2-1.2.5-2 2-2 3.8", "M14 14.7V17c0 .6.5 1 1 1.2 1.2.5 2 2 2 3.8", "M18 2H6v7a6 6 0 0 0 12 0Z"],
  video: ["M16 13l5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11", "M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"],
};

/** রঙিন গোল/চৌকো icon tile */
export const IconTile: React.FC<{ d: string | string[]; bg: string; c: string; s?: number; r?: number; icon?: number }> = ({ d, bg, c, s = 52, r = 16, icon }) => (
  <div style={{ width: s, height: s, borderRadius: r, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
    <Ic d={d} s={icon ?? Math.round(s * 0.48)} c={c} w={2.2} />
  </div>
);

export const Stars: React.FC<{ n?: number; s?: number; c?: string }> = ({ n = 5, s = 16, c = "#F5A524" }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Ic key={i} d={I.star} s={s} c={c} fill={i < n ? c : "none"} w={1.6} />
    ))}
  </div>
);

/** button (real site CTA) */
export const Btn: React.FC<{ children: React.ReactNode; bg: string; c?: string; h?: number; px?: number; fs?: number; outline?: boolean; icon?: string | string[]; r?: number; full?: boolean; style?: React.CSSProperties }> = ({
  children,
  bg,
  c = "#fff",
  h = 50,
  px = 24,
  fs = 18,
  outline,
  icon,
  r,
  full,
  style,
}) => (
  <div
    style={{
      height: h,
      padding: `0 ${px}px`,
      borderRadius: r ?? h / 2,
      background: outline ? "transparent" : bg,
      color: outline ? bg : c,
      boxShadow: outline ? `inset 0 0 0 2px ${bg}` : `0 8px 18px ${bg}40`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      fontSize: fs,
      fontWeight: 700,
      whiteSpace: "nowrap",
      width: full ? "100%" : undefined,
      boxSizing: "border-box",
      ...style,
    }}
  >
    {icon && <Ic d={icon} s={fs + 2} c={outline ? bg : c} w={2.4} />}
    {children}
  </div>
);

/** form field (label + boxed value) */
export const Field: React.FC<{ label: string; value?: string; ph?: string; icon?: string | string[]; h?: number; fs?: number; select?: boolean; accent?: string }> = ({ label, value, ph, icon, h = 48, fs = 16, select, accent = "#16202c" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ fontSize: fs - 3, fontWeight: 700, color: "#5b6675" }}>{label}</div>
    <div style={{ height: h, borderRadius: 12, background: "#fff", boxShadow: "inset 0 0 0 1.5px #DCE1E7", display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontSize: fs, fontWeight: 600, color: value ? accent : "#9aa3ad" }}>
      {icon && <Ic d={icon} s={fs + 2} c="#8b95a1" />}
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{value || ph}</span>
      {select && <Ic d={I.chevD} s={fs + 2} c="#8b95a1" />}
    </div>
  </div>
);

/** footer credit line (সব site-এ) */
export const Credit: React.FC<{ c?: string; fs?: number }> = ({ c = "#8b95a1", fs = 13 }) => (
  <div style={{ fontSize: fs, color: c, fontWeight: 600 }}>
    Developed by <span style={{ fontWeight: 800 }}>Javed IT Solution</span>
  </div>
);

/** ছোট tag/label text (pill নয় — শুধু রঙিন লেখা) */
export const Kicker: React.FC<{ children: React.ReactNode; c: string; fs?: number }> = ({ children, c, fs = 15 }) => (
  <div style={{ fontSize: fs, fontWeight: 800, letterSpacing: 1.6, color: c, textTransform: "uppercase" }}>{children}</div>
);
