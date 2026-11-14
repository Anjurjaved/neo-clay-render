// MacBook display DOM (1024×665): macOS menu bar + notch, Safari window, industry-র business website
// build 0..1 = section গুলো ক্রমে তৈরি হয় (URL bar-এ loading), live 0..1 = "Live" dot + publish toast
import React from "react";
import { Industry, clamp01 } from "./common";
import { THEME, SiteItem } from "./industry";

const FONT = "Inter, -apple-system, 'Hind Siliguri', sans-serif";
const BN = "'Hind Siliguri', Inter, sans-serif";

const ICON: Record<SiteItem["icon"], string> = {
  tooth: "M7 3c-2.2 0-4 1.8-4 4.2 0 2.3 1 3.6 1.6 5.5.6 2.1.9 5.3 2.4 7.6.7 1 1.9.6 2.1-.6l.6-3.2c.2-1 .8-1.6 1.3-1.6s1.1.6 1.3 1.6l.6 3.2c.2 1.2 1.4 1.6 2.1.6 1.5-2.3 1.8-5.5 2.4-7.6.6-1.9 1.6-3.2 1.6-5.5C21 4.8 19.2 3 17 3c-1.9 0-2.8 1-5 1s-3.1-1-5-1Z",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8",
  smile: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  bowl: "M3 11h18a9 9 0 0 1-18 0ZM7 7c0-1 1-1.5 1-2.5M12 7c0-1 1-1.5 1-2.5M17 7c0-1 1-1.5 1-2.5M8 20h8",
  cup: "M6 3h12l-1.5 17a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8L6 3ZM6.5 8h11",
  flame: "M12 22c4 0 7-2.7 7-6.6 0-4.4-3.5-6.4-4.4-10.4-2.2 1.6-3.1 3.6-3.1 5.6-1.3-.8-2-2.2-2-3.6C7.4 8.6 5 11.4 5 15.4 5 19.3 8 22 12 22Z",
  shirt: "M8 3 3 6l2 5 2-1v11h10V10l2 1 2-5-5-3a4 4 0 0 1-8 0Z",
  bag: "M5 7h14l-1 14H6L5 7ZM9 10V6a3 3 0 0 1 6 0v4",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z",
  book: "M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17ZM4 19.5A2.5 2.5 0 0 1 6.5 17H20",
  flask: "M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10",
  pen: "M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z",
  home: "M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3V10.5Z",
  key: "M15.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM12 11v10M12 17h3M12 14h2",
  map: "M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
};
export const Icon: React.FC<{ k: SiteItem["icon"]; size?: number; color?: string; sw?: number }> = ({ k, size = 24, color = "#111", sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
    <path d={ICON[k]} />
  </svg>
);
const HERO_ICON: Record<Industry, SiteItem["icon"]> = { dental: "tooth", restaurant: "bowl", ecommerce: "bag", school: "book", realestate: "home" };

const rv = (k: number): React.CSSProperties => ({ opacity: k, transform: `translateY(${(1 - k) * 26}px)` });

export const SiteDesk: React.FC<{ industry: Industry; build: number; live?: number; time?: string }> = ({ industry, build, live = 0, time = "Sat 10:24" }) => {
  const th = THEME[industry];
  const a = th.accent;
  const k = (i: number, n = 6) => clamp01(build * (n + 1.4) - i);
  const load = clamp01(build * 1.15);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#ECEEF2", fontFamily: FONT, color: "#16202c" }}>
      {/* macOS menu bar + notch */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 24, background: "rgba(246,247,250,0.96)", display: "flex", alignItems: "center", fontSize: 12.5, fontWeight: 600, color: "#1d1f23", padding: "0 14px", gap: 16 }}>
        <span style={{ fontWeight: 700 }}>Safari</span>
        <span style={{ fontWeight: 500 }}>File</span>
        <span style={{ fontWeight: 500 }}>Edit</span>
        <span style={{ fontWeight: 500 }}>View</span>
        <span style={{ fontWeight: 500 }}>History</span>
        <div style={{ flex: 1 }} />
        <svg width="16" height="12" viewBox="0 0 17 13">
          <path d="M8.5 12.2 6 9.4a3.6 3.6 0 0 1 5 0Zm-4.4-4.9 1.2 1.3a4.6 4.6 0 0 1 6.4 0l1.2-1.3a6.4 6.4 0 0 0-8.8 0ZM1 4.2l1.2 1.3a9 9 0 0 1 12.6 0L16 4.2a10.8 10.8 0 0 0-15 0Z" fill="#1d1f23" />
        </svg>
        <div style={{ width: 22, height: 11, borderRadius: 3, border: "1.4px solid #1d1f23", padding: 1 }}>
          <div style={{ width: "80%", height: "100%", background: "#1d1f23", borderRadius: 1.5 }} />
        </div>
        <span style={{ fontWeight: 500 }}>{time}</span>
      </div>
      <div style={{ position: "absolute", left: "50%", top: 0, width: 128, height: 26, marginLeft: -64, background: "#000", borderRadius: "0 0 12px 12px", zIndex: 5 }} />
      {/* Safari window */}
      <div style={{ position: "absolute", left: 10, right: 10, top: 32, bottom: 8, borderRadius: 11, overflow: "hidden", background: "#fff", boxShadow: "0 8px 28px rgba(20,30,50,0.22), 0 0 0 1px rgba(0,0,0,0.08)" }}>
        <div style={{ height: 46, background: "#F6F6F8", borderBottom: "1px solid #E1E3E8", display: "flex", alignItems: "center", padding: "0 14px", gap: 8, position: "relative" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
          ))}
          <div style={{ marginLeft: 18, display: "flex", gap: 14, color: "#8a8f98" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8f98" strokeWidth="2.4" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4c8cf" strokeWidth="2.4" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
          </div>
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 440, height: 30, borderRadius: 8, background: "#E9EAEE", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14.5, fontWeight: 500, color: "#2b2f36", overflow: "hidden" }}>
            {live > 0.02 ? (
              <div style={{ width: 9, height: 9, borderRadius: 5, background: "#22B35E", opacity: live, boxShadow: `0 0 0 ${3 * live}px rgba(34,179,94,0.18)` }} />
            ) : (
              <svg width="12" height="14" viewBox="0 0 12 14"><rect x="1" y="6" width="10" height="7.5" rx="2" fill="#5f646d" /><path d="M3.3 6V4.3a2.7 2.7 0 0 1 5.4 0V6" stroke="#5f646d" strokeWidth="1.6" fill="none" /></svg>
            )}
            {th.url}
            {load < 1 && <div style={{ position: "absolute", left: 0, bottom: 0, height: 3, width: `${load * 100}%`, background: "#2F7CF6", borderRadius: 2 }} />}
          </div>
        </div>
        {/* page */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 46, bottom: 0, background: "#fff", overflow: "hidden" }}>
          {/* header */}
          <div style={{ ...rv(k(0)), height: 58, display: "flex", alignItems: "center", padding: "0 30px", gap: 12, borderBottom: "1px solid #EEF0F3" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: a, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon k={HERO_ICON[industry]} size={20} color="#fff" sw={2.2} />
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.3 }}>{th.brand}</div>
            <div style={{ flex: 1 }} />
            {th.nav.map((n, i) => (
              <div key={n} style={{ fontSize: 14.5, fontWeight: 600, color: i === 0 ? a : "#4a5260", marginLeft: 18 }}>
                {n}
              </div>
            ))}
            <div style={{ marginLeft: 22, background: a, color: th.accentInk, fontFamily: BN, fontSize: 15, fontWeight: 700, padding: "8px 16px", borderRadius: 9 }}>{th.ctaBn}</div>
          </div>
          {/* hero */}
          <div style={{ display: "flex", padding: "26px 30px 0", gap: 26, height: 290 }}>
            <div style={{ flex: 1.15, ...rv(k(1)) }}>
              <div style={{ fontFamily: BN, fontSize: 40, lineHeight: 1.22, fontWeight: 700, color: "#121a26", letterSpacing: -0.2 }}>{th.heroBn}</div>
              <div style={{ fontFamily: BN, fontSize: 17, color: "#5a6372", marginTop: 14, lineHeight: 1.5 }}>{th.subBn}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
                <div style={{ background: a, color: th.accentInk, fontFamily: BN, fontWeight: 700, fontSize: 17, padding: "12px 22px", borderRadius: 11 }}>{th.ctaBn}</div>
                <div style={{ border: `2px solid ${a}`, color: a, fontFamily: BN, fontWeight: 700, fontSize: 17, padding: "10px 20px", borderRadius: 11 }}>{th.cta2Bn}</div>
              </div>
              <div style={{ display: "flex", gap: 22, marginTop: 22 }}>
                {th.meta.map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#8a93a2", letterSpacing: 0.6, textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#1b2330", marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, ...rv(k(2)), borderRadius: 18, background: `linear-gradient(150deg, ${th.soft} 0%, #ffffff 55%, ${th.soft} 100%)`, border: "1px solid #EDF0F4", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -40, top: -40, width: 230, height: 230, borderRadius: 115, background: a, opacity: 0.1 }} />
              <div style={{ position: "absolute", left: 26, top: 24, width: 74, height: 74, borderRadius: 20, background: a, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 24px ${a}55` }}>
                <Icon k={HERO_ICON[industry]} size={42} color="#fff" sw={2} />
              </div>
              <div style={{ position: "absolute", left: 26, top: 116, right: 22 }}>
                {th.items.slice(0, 3).map((it, i) => (
                  <div key={it.name} style={{ display: "flex", alignItems: "center", padding: "9px 0", borderTop: i ? "1px solid #E7EBF0" : "none", opacity: clamp01(build * 8 - 3.2 - i * 0.5) }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1b2330", flex: 1 }}>{it.name}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: a }}>{it.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* cards */}
          <div style={{ display: "flex", gap: 16, padding: "18px 30px 0" }}>
            {th.items.map((it, i) => (
              <div key={it.name} style={{ flex: 1, ...rv(k(3 + i)), borderRadius: 14, border: "1px solid #E9ECF1", padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", background: "#fff", boxShadow: "0 4px 14px rgba(20,30,50,0.06)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: th.soft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon k={it.icon} size={24} color={a} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, whiteSpace: "nowrap" }}>{it.name}</div>
                  <div style={{ fontFamily: BN, fontSize: 14, color: "#6a7383" }}>{it.sub}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: a, whiteSpace: "nowrap" }}>{it.price}</div>
              </div>
            ))}
          </div>
          {/* publish toast */}
          {live > 0.01 && (
            <div style={{ position: "absolute", right: 24, bottom: 20, opacity: clamp01(live * 1.6), transform: `translateY(${(1 - clamp01(live * 1.3)) * 30}px)`, background: "#10261A", color: "#fff", borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 12px 30px rgba(10,30,20,0.35)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: "#22B35E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17l9-10" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Website is live</div>
                <div style={{ fontSize: 13, color: "#a9c9b6", fontWeight: 600 }}>Built by Javed IT Solution</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
