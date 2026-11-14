// scenes_h DOM screens: BizPhone (lock screen: missed calls → new orders), Dialer (number typed key by key),
// JitSite (MacBook browser: javeditsolution.com typed, page loads with industry hero)
import React from "react";
import { Img, staticFile } from "remotion";
import { StatusBar } from "../../kit/Device";
import { LOGO_SRC } from "../../kit/Logo";
import { MacNotch } from "../devices/MacBook";
import { IND, Industry, clamp01 } from "./common";

const SANS = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Inter, Arial, sans-serif";
const BN = "'Hind Siliguri', Inter, sans-serif";
const NUMF = "'Sabbir Sorolota', 'Hind Siliguri', sans-serif";

const IcPhone: React.FC<{ c: string; s?: number }> = ({ c, s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z" fill={c} />
  </svg>
);
const IcMissed: React.FC<{ c: string }> = ({ c }) => (
  <svg width="26" height="26" viewBox="0 0 24 24">
    <path d="M3 8.5 9 14.5l4-4 6 6" stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 16.5H19v-4.5" stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcChat: React.FC<{ c: string }> = ({ c }) => (
  <svg width="26" height="26" viewBox="0 0 24 24">
    <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4.5 3.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" fill={c} />
  </svg>
);
const IcBag: React.FC<{ c: string }> = ({ c }) => (
  <svg width="26" height="26" viewBox="0 0 24 24">
    <path d="M5 8h14l-1 12H6Z" fill={c} />
    <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke={c} strokeWidth="2" fill="none" />
  </svg>
);

/* ---------------- BizPhone: lock screen ---------------- */
export const BizPhone: React.FC<{
  industry: Industry;
  name: string; // business name
  missed: number; // how many missed rows shown
  missedKind: "call" | "message";
  after: number; // 0..1 cross-fade to the "after" state
  orders: number; // how many order notifications shown
  now: number; // scene time (for item spring-in)
  missedAt: number[];
  ordersAt: number[];
}> = ({ industry, name, missed, missedKind, after, orders, now, missedAt, ordersAt }) => {
  const d = IND[industry];
  const rowIn = (t0: number) => {
    const k = clamp01((now - t0) / 0.28);
    const e = 1 - Math.pow(1 - k, 3);
    return { opacity: e, transform: `translateY(${(1 - e) * -26}px) scale(${0.94 + 0.06 * e})` };
  };
  const nums = ["01711-4", "01819-2", "01552-7", "01915-3", "01678-0", "01733-9"];
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: SANS, color: "#fff", overflow: "hidden" }}>
      {/* night wallpaper → warm day */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, #1d2a44 0%, #2c3550 55%, #3b3346 100%)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: after, background: "linear-gradient(170deg, #ffb877 0%, #f58f4e 45%, #c9576f 100%)" }} />
      <StatusBar dark time="" />
      <div style={{ position: "absolute", top: 86, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 600, opacity: 0.85 }}>{after > 0.5 ? "Saturday, 2:14 AM" : "Saturday, 9:41 PM"}</div>
        <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{after > 0.5 ? "2:14" : "9:41"}</div>
      </div>
      {/* missed list */}
      <div style={{ position: "absolute", left: 16, right: 16, top: 262, opacity: 1 - after, display: "flex", flexDirection: "column", gap: 10 }}>
        {missed > 0 && (
          <div style={{ fontSize: 24, fontWeight: 800, opacity: 0.9, paddingLeft: 8 }}>
            {missed} missed {missedKind === "call" ? "calls" : "messages"}
          </div>
        )}
        {Array.from({ length: Math.min(missed, 4) }).map((_, j) => {
          const i = missed - 1 - j; // newest on top
          return (
            <div key={i} style={{ ...rowIn(missedAt[i] ?? 0), background: "rgba(255,255,255,0.16)", borderRadius: 22, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, flex: "none", background: missedKind === "call" ? "#E5484D" : "#3E6E9E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {missedKind === "call" ? <IcMissed c="#fff" /> : <IcChat c="#fff" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 25, fontWeight: 700 }}>{missedKind === "call" ? "Missed call" : "Unread message"}</div>
                <div style={{ fontSize: 22, opacity: 0.8, whiteSpace: "nowrap" }}>{missedKind === "call" ? `${nums[i % nums.length]}${(i * 37) % 10}${(i * 53) % 10}${(i * 71) % 10}${(i * 13) % 10}` : "Price koto? Delivery hobe?"}</div>
              </div>
              <div style={{ fontSize: 16, opacity: 0.7 }}>{`${9 - Math.floor(i / 3)}:${String(41 - i * 4).padStart(2, "0")}`}</div>
            </div>
          );
        })}
      </div>
      {/* orders */}
      <div style={{ position: "absolute", left: 16, right: 16, top: 262, opacity: after, display: "flex", flexDirection: "column", gap: 10 }}>
        {orders > 0 && <div style={{ fontSize: 24, fontWeight: 800, opacity: 0.95, paddingLeft: 8 }}>{name}</div>}
        {Array.from({ length: Math.min(orders, 3) }).map((_, j) => {
          const i = orders - 1 - j;
          return (
            <div key={i} style={{ ...rowIn(ordersAt[i] ?? 0), background: "rgba(255,255,255,0.92)", color: "#13253C", borderRadius: 22, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center", boxShadow: "0 6px 16px rgba(60,20,10,0.18)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, flex: "none", background: "#1F9D55", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcBag c="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 24, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {d.order}
                </div>
                <div style={{ fontSize: 21, fontWeight: 600, color: "#33445a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.who[i % d.who.length]}</div>
                <div style={{ fontSize: 20, color: "#5a6a7c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: `${SANS}, ${BN}` }}>{d.what[i % d.what.length]}</div>
              </div>
              <div style={{ fontSize: 17, color: "#7a8694", alignSelf: "flex-start" }}>now</div>
            </div>
          );
        })}
      </div>
      {/* home bar */}
      <div style={{ position: "absolute", bottom: 14, left: "50%", width: 140, height: 5, marginLeft: -70, borderRadius: 3, background: "rgba(255,255,255,0.85)" }} />
    </div>
  );
};

/* ---------------- Dialer ---------------- */
const KEYS: [string, string][] = [
  ["1", ""],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["*", ""],
  ["0", "+"],
  ["#", ""],
];
export const Dialer: React.FC<{ typed: string; press: string | null; pressK: number; done: number; wa: number }> = ({ typed, press, pressK, done, wa }) => (
  <div style={{ position: "absolute", inset: 0, background: "#FBFAF8", fontFamily: SANS, color: "#13253C" }}>
    <StatusBar time="9:41" />
    <div style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ height: 66, fontSize: typed.length > 10 ? 50 : 56, fontWeight: 600, letterSpacing: 1, whiteSpace: "nowrap" }}>{typed || " "}</div>
      <div style={{ height: 34, marginTop: 6, opacity: done, transform: `translateY(${(1 - done) * 10}px)`, display: "flex", justifyContent: "center", gap: 10, alignItems: "center" }}>
        <Img src={staticFile(LOGO_SRC)} style={{ width: 30, height: 30 }} />
        <span style={{ fontSize: 22, fontWeight: 700, color: "#1B4470" }}>Javed IT Solution</span>
      </div>
    </div>
    <div style={{ position: "absolute", top: 230, left: 34, right: 34, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 18, justifyItems: "center" }}>
      {KEYS.map(([k, sub]) => {
        const on = press === k ? pressK : 0;
        return (
          <div key={k} style={{ width: 92, height: 92, borderRadius: 46, background: on > 0 ? `rgba(245,149,43,${0.25 + 0.6 * on})` : "#ECE8E2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.06 * on})` }}>
            <div style={{ fontSize: 40, fontWeight: 500, lineHeight: 1 }}>{k}</div>
            {sub && <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, opacity: 0.6, marginTop: 2 }}>{sub}</div>}
          </div>
        );
      })}
    </div>
    <div style={{ position: "absolute", bottom: 66, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34, alignItems: "center" }}>
      <div style={{ width: 92, height: 92, borderRadius: 46, background: "#2DBE60", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.08 * done})`, boxShadow: done > 0 ? `0 0 0 ${10 * done}px rgba(45,190,96,0.18)` : "none" }}>
        <IcPhone c="#fff" s={40} />
      </div>
      <div style={{ width: 92, height: 92, borderRadius: 46, background: `rgba(31,157,85,${0.12 + 0.88 * wa})`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.08 * wa})` }}>
        <IcChat c={wa > 0.5 ? "#fff" : "#1F9D55"} />
      </div>
    </div>
    <div style={{ position: "absolute", bottom: 14, left: "50%", width: 140, height: 5, marginLeft: -70, borderRadius: 3, background: "#111" }} />
  </div>
);

/* ---------------- JitSite (MacBook 1512×982) ---------------- */
export const JitSite: React.FC<{ industry: Industry; url: string; caret: boolean; load: number; reveal: number; phone: string; bnWeb?: string }> = ({ industry, url, caret, load, reveal, phone, bnWeb }) => {
  const d = IND[industry];
  const sec = (i: number) => {
    const k = clamp01(reveal * 4 - i);
    const e = 1 - Math.pow(1 - k, 3);
    return { opacity: e, transform: `translateY(${(1 - e) * 30}px)` };
  };
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FBF8F4", fontFamily: SANS, color: "#13253C" }}>
      <MacNotch />
      {/* Safari-like toolbar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "#EFE9E1", display: "flex", alignItems: "center", padding: "26px 30px 0", gap: 22, boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 11 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 17, height: 17, borderRadius: 9, background: c }} />
          ))}
        </div>
        <div style={{ marginLeft: 150, width: 980, height: 66, background: "#fff", borderRadius: 16, display: "flex", alignItems: "center", padding: "0 26px", fontSize: 36, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <svg width="20" height="22" viewBox="0 0 20 22" style={{ marginRight: 12, flex: "none" }}>
            <rect x="2" y="9" width="16" height="12" rx="3" fill="#5b6672" />
            <path d="M5.5 9V6.5a4.5 4.5 0 0 1 9 0V9" stroke="#5b6672" strokeWidth="2.4" fill="none" />
          </svg>
          {url ? url : <span style={{ color: "#9aa5b1" }}>Search or enter website name</span>}
          <span style={{ opacity: caret ? 1 : 0, color: "#2F80ED", marginLeft: 1, fontWeight: 400 }}>|</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 120, left: 0, height: 6, width: `${load * 100}%`, background: "#2F80ED", opacity: load > 0 && load < 1 ? 1 : 0 }} />
      {reveal > 0 && (
        <div style={{ position: "absolute", top: 126, left: 0, right: 0, bottom: 0 }}>
          <div style={{ height: 96, display: "flex", alignItems: "center", padding: "0 64px", borderBottom: "1px solid #EEE6DC", ...sec(0) }}>
            <Img src={staticFile(LOGO_SRC)} style={{ width: 58, height: 58, marginRight: 16 }} />
            <div style={{ fontWeight: 800, fontSize: 32 }}>Javed IT Solution</div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 40, fontSize: 24, fontWeight: 700, color: "#4a5a6c", alignItems: "center" }}>
              <span>Services</span>
              <span style={{ color: "#D85E24" }}>Website</span>
              <span>Pricing</span>
              <span style={{ background: "#13253C", color: "#fff", padding: "12px 24px", borderRadius: 14 }}>Free quote</span>
            </div>
          </div>
          <div style={{ display: "flex", padding: "54px 64px 0", gap: 50 }}>
            <div style={{ flex: 1.15 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#D85E24", letterSpacing: 2, ...sec(1) }}>WEBSITE DEVELOPMENT</div>
              <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.04, marginTop: 12, letterSpacing: -1, ...sec(1) }}>{d.web}</div>
              <div style={{ fontSize: 32, fontFamily: BN, fontWeight: 600, color: "#4a5a6c", marginTop: 18, ...sec(2) }}>{bnWeb ?? d.bnWeb}</div>
              <div style={{ display: "flex", gap: 18, marginTop: 40, ...sec(3) }}>
                <div style={{ background: "#F5952B", color: "#fff", fontSize: 28, fontWeight: 800, padding: "22px 34px", borderRadius: 18, display: "flex", gap: 12, alignItems: "center" }}>
                  <IcPhone c="#fff" s={28} /> {phone}
                </div>
                <div style={{ background: "#1F9D55", color: "#fff", fontSize: 28, fontWeight: 800, padding: "22px 34px", borderRadius: 18 }}>WhatsApp</div>
              </div>
            </div>
            <div style={{ flex: 0.85, ...sec(2) }}>
              <div style={{ background: "#fff", borderRadius: 26, padding: 30, boxShadow: "0 14px 40px rgba(20,40,70,0.12)" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#7a8694", letterSpacing: 1.5 }}>PACKAGES FROM</div>
                <div style={{ fontSize: 60, fontWeight: 800, marginTop: 6, fontFamily: `${SANS}` }}>
                  <span style={{ fontFamily: NUMF }}>৳</span> 15,000
                </div>
                {["Design approved before build", "Mobile-first, fast pages", "Domain & hosting setup"].map((x, i) => (
                  <div key={x} style={{ display: "flex", gap: 14, alignItems: "center", marginTop: i ? 14 : 22, fontSize: 24, fontWeight: 700 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 16, background: d.accent, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="m5 12.5 4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {x}
                  </div>
                ))}
                <div style={{ marginTop: 24, background: "#F6F1EA", borderRadius: 16, padding: "16px 20px", fontSize: 22, fontWeight: 700, color: "#4a5a6c" }}>Mirpur 1, Dhaka · all over Bangladesh</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
