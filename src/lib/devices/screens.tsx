// devices group — demo DOM screens for the showcases (real, already-built apps; Bangladeshi businesses).
// All are pure props → markup (no useCurrentFrame). Bangla numerals use Sabbir Sorolota.
import React from "react";
import { MacNotch } from "./MacBook";

export const BN = "'Sabbir Sorolota', 'Hind Siliguri', sans-serif";
export const UI = "-apple-system, 'SF Pro Text', Inter, 'Hind Siliguri', sans-serif";
const cl = (x: number) => Math.max(0, Math.min(1, x));

/** black → on: the panel backlight fades up (use with p 0..1) */
export const PowerVeil: React.FC<{ p: number }> = ({ p }) =>
  p >= 1 ? null : <div style={{ position: "absolute", inset: 0, background: "#000", opacity: 1 - cl(p), zIndex: 998 }} />;

const Ico = {
  lock: (c = "#5d6168", s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round">
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  chevL: (c = "#6b6f76", s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  chevR: (c = "#b7bac0", s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  ),
  reload: (c = "#6b6f76", s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round">
      <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" />
    </svg>
  ),
  phone: (c = "#fff", s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
    </svg>
  ),
  star: (c = "#F5A623", s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8Z" />
    </svg>
  ),
  bag: (c = "#fff", s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1.2 12H6.2Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  ),
  wifi: (c = "#111", s = 18) => (
    <svg width={s} height={s * 0.76} viewBox="0 0 17 13">
      <path d="M8.5 12.2 6 9.4a3.6 3.6 0 0 1 5 0Zm-4.4-4.9 1.2 1.3a4.6 4.6 0 0 1 6.4 0l1.2-1.3a6.4 6.4 0 0 0-8.8 0ZM1 4.2l1.2 1.3a9 9 0 0 1 12.6 0L16 4.2a10.8 10.8 0 0 0-15 0Z" fill={c} />
    </svg>
  ),
  battery: (c = "#111", w = 26) => (
    <div style={{ width: w, height: w * 0.5, borderRadius: 4, border: `1.6px solid ${c}`, padding: 1.6, opacity: 0.9, display: "flex" }}>
      <div style={{ width: "82%", height: "100%", background: c, borderRadius: 2 }} />
    </div>
  ),
};
export { Ico };

// ---------- sweets illustrations (CSS only) ----------
const Bowl: React.FC<{ kind: "rosogolla" | "doi" | "kalojam" | "sandesh"; s?: number }> = ({ kind, s = 150 }) => {
  if (kind === "doi")
    return (
      <div style={{ position: "relative", width: s, height: s * 0.8 }}>
        <div style={{ position: "absolute", left: s * 0.08, right: s * 0.08, bottom: 0, height: s * 0.62, borderRadius: `${s * 0.12}px ${s * 0.12}px ${s * 0.36}px ${s * 0.36}px`, background: "radial-gradient(120% 90% at 35% 25%, #C7743E 0%, #9A4E24 55%, #6E3315 100%)" }} />
        <div style={{ position: "absolute", left: s * 0.05, right: s * 0.05, top: s * 0.1, height: s * 0.2, borderRadius: "50%", background: "radial-gradient(80% 90% at 40% 40%, #FFF6E6 0%, #F2DDBB 70%, #D9B98B 100%)", boxShadow: "inset 0 -4px 0 #B9703E" }} />
      </div>
    );
  const ball = kind === "rosogolla" ? ["#FFFDF7", "#F1E6CF"] : kind === "kalojam" ? ["#7A3A1E", "#3E160A"] : ["#FFE7B8", "#E9B96A"];
  return (
    <div style={{ position: "relative", width: s, height: s * 0.8 }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: s * 0.42, borderRadius: `0 0 ${s / 2}px ${s / 2}px`, background: "linear-gradient(180deg, #E9EEF3 0%, #C5CED8 100%)" }} />
      {[
        [0.16, 0.3],
        [0.46, 0.26],
        [0.31, 0.06],
      ].map(([x, y], i) =>
        kind === "sandesh" ? (
          <div key={i} style={{ position: "absolute", left: s * x, top: s * (y + 0.06), width: s * 0.34, height: s * 0.24, borderRadius: s * 0.06, transform: "rotate(-8deg)", background: `radial-gradient(90% 90% at 35% 30%, ${ball[0]} 0%, ${ball[1]} 100%)`, boxShadow: "0 3px 6px rgba(120,70,20,0.25)" }} />
        ) : (
          <div key={i} style={{ position: "absolute", left: s * x, top: s * y, width: s * 0.36, height: s * 0.36, borderRadius: "50%", background: `radial-gradient(70% 70% at 35% 30%, ${ball[0]} 0%, ${ball[1]} 100%)`, boxShadow: "0 3px 7px rgba(90,60,30,0.22)" }} />
        )
      )}
    </div>
  );
};

// ---------- macOS desktop + Safari: Shapla Sweets (Mirpur) online order site ----------
export const MacDesktop: React.FC<{ power?: number; reveal?: number; time?: string }> = ({ power = 1, reveal = 1, time = "Fri 14 Nov  9:41" }) => {
  const r = cl(reveal);
  const items: [Parameters<typeof Bowl>[0]["kind"], string, string][] = [
    ["rosogolla", "রসগোল্লা", "৳ ৩৬০ / কেজি"],
    ["doi", "মিষ্টি দই", "৳ ২২০ / হাঁড়ি"],
    ["kalojam", "কালোজাম", "৳ ৪০০ / কেজি"],
    ["sandesh", "সন্দেশ", "৳ ৬৫০ / কেজি"],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: UI, background: "radial-gradient(120% 90% at 20% 10%, #FFD9B8 0%, #F6B9A6 38%, #B9A6D6 75%, #8C9BD1 100%)" }}>
      {/* menu bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 38, background: "rgba(255,255,255,0.42)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", padding: "0 22px", gap: 26, fontSize: 17, color: "#1d1d1f" }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: "#1d1d1f", opacity: 0.85 }} />
        <b>Safari</b>
        {["File", "Edit", "View", "History", "Bookmarks"].map((m) => (
          <span key={m}>{m}</span>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
          {Ico.battery("#1d1d1f", 28)}
          {Ico.wifi("#1d1d1f", 19)}
          <span style={{ fontWeight: 600 }}>{time}</span>
        </div>
      </div>
      {/* Safari window */}
      <div style={{ position: "absolute", left: 44, right: 44, top: 56, bottom: 30, borderRadius: 16, overflow: "hidden", background: "#FFFBF5", boxShadow: "0 24px 60px rgba(40,20,60,0.35), 0 0 0 1px rgba(0,0,0,0.12)" }}>
        <div style={{ height: 66, background: "#F3F0EC", borderBottom: "1px solid #E0DBD4", display: "flex", alignItems: "center", padding: "0 22px", gap: 14 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.2)" }} />
          ))}
          <div style={{ marginLeft: 18, display: "flex", gap: 8 }}>
            {Ico.chevL()}
            {Ico.chevR()}
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 620, height: 42, borderRadius: 11, background: "#E6E2DD", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 21, fontWeight: 600, color: "#2b2d31" }}>
              {Ico.lock("#5d6168", 17)} shaplasweets.com.bd
            </div>
          </div>
          {Ico.reload()}
        </div>
        {/* page-load progress */}
        <div style={{ height: 3, width: `${Math.min(100, r * 160)}%`, background: "#0A84FF", opacity: r < 0.62 ? 1 : 0 }} />
        {/* site */}
        <div style={{ position: "relative", padding: "22px 46px 0", fontFamily: "'Hind Siliguri', sans-serif", color: "#2A1A12", opacity: cl(r * 2), transform: `translateY(${(1 - cl(r * 1.4)) * 16}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(140deg, #F5952B, #D85E24)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 30, fontWeight: 700 }}>শ</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 30, letterSpacing: -0.5 }}>Shapla Sweets</div>
            </div>
            <div style={{ display: "flex", gap: 30, fontSize: 24, fontWeight: 600, color: "#5a463b", marginLeft: 20 }}>
              <span style={{ color: "#D85E24" }}>মিষ্টি</span>
              <span>দই</span>
              <span>অর্ডার</span>
              <span>যোগাযোগ</span>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, background: "#1F9D55", color: "#fff", borderRadius: 30, padding: "10px 24px", fontSize: 24, fontWeight: 700, fontFamily: BN }}>
              {Ico.phone("#fff", 22)} ০১৭১১-৪৮২৫৯০
            </div>
          </div>
          <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
            <div style={{ flex: "0 0 560px" }}>
              <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.12, letterSpacing: -0.5 }}>
                মিরপুরের খাঁটি মিষ্টি, <span style={{ color: "#D85E24" }}>এখন ঘরে বসে</span>
              </div>
              <div style={{ fontSize: 27, color: "#6c574b", marginTop: 18, lineHeight: 1.45, fontFamily: BN }}>সকাল ৮টা – রাত ১১টা · ঢাকার ভেতরে ২ ঘণ্টায় ডেলিভারি · bKash / Nagad</div>
              <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#D85E24", color: "#fff", borderRadius: 18, padding: "18px 32px", fontSize: 30, fontWeight: 700, boxShadow: "0 10px 24px rgba(216,94,36,0.35)" }}>
                  {Ico.bag("#fff", 28)} অর্ডার করুন
                </div>
                <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "2px solid #EADFD3", borderRadius: 18, padding: "18px 30px", fontSize: 30, fontWeight: 700 }}>মেনু দেখুন</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 34, fontSize: 25, fontWeight: 600, fontFamily: BN, color: "#5a463b" }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i}>{Ico.star("#F5A623", 26)}</span>
                ))}
                <span style={{ marginLeft: 8 }}>৪.৮ · ১,২৪০ জনের রিভিউ</span>
              </div>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {items.map(([k, n, pr], i) => {
                const kk = cl(r * 4 - i * 0.5 - 0.6);
                return (
                  <div key={n} style={{ background: "#fff", borderRadius: 24, padding: "16px 20px 18px", boxShadow: "0 8px 22px rgba(120,70,30,0.10)", display: "flex", flexDirection: "column", alignItems: "center", opacity: kk, transform: `translateY(${(1 - kk) * 24}px)` }}>
                    <div style={{ background: "#FFF3E6", borderRadius: 18, width: "100%", display: "flex", justifyContent: "center", padding: "10px 0" }}>
                      <Bowl kind={k} s={150} />
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 700, marginTop: 10 }}>{n}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "#D85E24", fontFamily: BN }}>{pr}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <MacNotch />
      <PowerVeil p={power} />
    </div>
  );
};

// ---------- shared phone status bar (iPhone: Dynamic Island, Android: punch-hole) ----------
export const PhoneStatus: React.FC<{ kind: "iphone" | "android"; dark?: boolean; time?: string; battery?: number }> = ({ kind, dark = true, time = "9:41", battery = 0.82 }) => {
  const ink = dark ? "#fff" : "#111";
  const ip = kind === "iphone";
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 58, zIndex: 50, fontFamily: UI }}>
      {ip ? (
        <div style={{ position: "absolute", top: 11, left: "50%", width: 124, height: 36, marginLeft: -62, borderRadius: 20, background: "#000" }} />
      ) : (
        <div style={{ position: "absolute", top: 14, left: "50%", width: 20, height: 20, marginLeft: -10, borderRadius: 10, background: "#000", boxShadow: "0 0 0 2px rgba(0,0,0,0.35)" }} />
      )}
      <div style={{ position: "absolute", top: ip ? 19 : 15, left: ip ? 46 : 24, fontSize: ip ? 18 : 17, fontWeight: 700, color: ink, letterSpacing: 0.2 }}>{time}</div>
      <div style={{ position: "absolute", top: ip ? 21 : 17, right: ip ? 30 : 22, display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 2.5, alignItems: "flex-end", height: 13 }}>
          {[5, 8, 10.5, 13].map((hh, i) => (
            <div key={i} style={{ width: 3.6, height: hh, borderRadius: 1, background: ink }} />
          ))}
        </div>
        {Ico.wifi(ink, 18)}
        <div style={{ width: 27, height: 13, borderRadius: 4.5, border: `1.5px solid ${ink}`, padding: 1.5, opacity: 0.95, display: "flex" }}>
          <div style={{ width: `${battery * 100}%`, height: "100%", background: battery > 0.2 ? ink : "#ff453a", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
};

// ---------- iPhone lock screen: order notifications for a Dhaka shop ----------
export const IOSLock: React.FC<{ power?: number; notes?: number; charging?: number; time?: string }> = ({ power = 1, notes = 1, charging = 0, time = "9:41" }) => {
  const n = [
    { app: "Shapla Sweets", c: "#D85E24", t: "এইমাত্র", title: "নতুন অর্ডার #১০২৪", body: "২ কেজি রসগোল্লা · ৳ ৭২০ · মিরপুর ১০" },
    { app: "bKash", c: "#E2136E", t: "১ মিনিট আগে", title: "পেমেন্ট পেয়েছেন", body: "৳ ৭২০ · অর্ডার #১০২৪-এর জন্য" },
    { app: "Phone", c: "#30D158", t: "৫ মিনিট আগে", title: "Missed call", body: "রফিক ভাই (০১৮১৯-২২৭৪০৫)" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: UI, color: "#fff", background: "radial-gradient(130% 80% at 20% 0%, #FFB27A 0%, #E9735A 34%, #8D4B8E 70%, #3B2C63 100%)" }}>
      <div style={{ position: "absolute", left: -120, bottom: -160, width: 520, height: 420, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,214,170,0.55), rgba(255,214,170,0))" }} />
      <PhoneStatus kind="iphone" time="" />
      <div style={{ position: "absolute", top: 18, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <svg width="16" height="20" viewBox="0 0 24 30" fill="none" stroke="#fff" strokeWidth="3" style={{ marginTop: 44 }}>
          <rect x="3" y="13" width="18" height="15" rx="3.5" fill="#fff" stroke="none" />
          <path d="M7 13V9a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: 98, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.92, fontFamily: BN }}>শুক্রবার, ১৪ নভেম্বর</div>
        <div style={{ fontSize: 112, fontWeight: 700, lineHeight: 1, letterSpacing: -3, marginTop: 2, fontFamily: "Inter, sans-serif" }}>{time}</div>
      </div>
      {charging > 0 && (
        <div style={{ position: "absolute", top: 262, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: charging }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.25)", borderRadius: 22, padding: "8px 18px", fontSize: 20, fontWeight: 700 }}>
            <svg width="16" height="22" viewBox="0 0 16 22" fill="#5BE37D">
              <path d="M9.5 0 1 12.5h5.5L5 22l9.5-13H8.7Z" />
            </svg>
            <span style={{ fontFamily: BN }}>চার্জ হচ্ছে · ৮৬%</span>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 128, display: "flex", flexDirection: "column", gap: 10 }}>
        {n.map((x, i) => {
          const k = cl(notes * 3 - (2 - i));
          return (
            <div key={i} style={{ background: "rgba(250,245,240,0.82)", color: "#1c1c1e", borderRadius: 24, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", opacity: k, transform: `translateY(${(1 - k) * 40}px) scale(${0.94 + 0.06 * k})` }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: x.c, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "Inter, sans-serif" }}>
                {x.app === "Phone" ? Ico.phone("#fff", 24) : x.app[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", fontSize: 15, fontWeight: 700, color: "#6d6d72", fontFamily: BN }}>
                  <span style={{ fontFamily: UI }}>{x.app.toUpperCase()}</span>
                  <span style={{ marginLeft: "auto", fontWeight: 600 }}>{x.t}</span>
                </div>
                <div style={{ fontSize: 21, fontWeight: 700, fontFamily: BN, lineHeight: 1.25 }}>{x.title}</div>
                <div style={{ fontSize: 18, fontWeight: 600, fontFamily: BN, color: "#3a3a3c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.body}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* flashlight + camera */}
      {[0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", bottom: 46, [i ? "right" : "left"]: 46, width: 54, height: 54, borderRadius: 27, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties}>
          {i === 0 ? (
            <svg width="22" height="26" viewBox="0 0 24 28" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round">
              <path d="M6 2h12v5l-3 4v15H9V11L6 7Z" />
              <path d="M12 15v3" />
            </svg>
          ) : (
            <svg width="26" height="22" viewBox="0 0 28 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round">
              <path d="M3 7h5l2-3h8l2 3h5v14H3Z" />
              <circle cx="14" cy="13.5" r="4.5" />
            </svg>
          )}
        </div>
      ))}
      <div style={{ position: "absolute", bottom: 9, left: "50%", width: 140, height: 5, marginLeft: -70, borderRadius: 3, background: "#fff" }} />
      <PowerVeil p={power} />
    </div>
  );
};

// ---------- Android home (Pixel): clock widget, weather, apps, search pill ----------
const AppIcon: React.FC<{ bg: string; glyph: React.ReactNode; label: string }> = ({ bg, glyph, label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: 80 }}>
    <div style={{ width: 64, height: 64, borderRadius: 32, background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.18)" }}>{glyph}</div>
    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.35)", fontFamily: UI }}>{label}</div>
  </div>
);
const gl = {
  phone: Ico.phone("#1E6B3A", 30),
  msg: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="#1B4E9B">
      <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 1-2Z" />
    </svg>
  ),
  cam: (
    <svg width="30" height="28" viewBox="0 0 28 24" fill="none" stroke="#3B3B3B" strokeWidth="2.6" strokeLinejoin="round">
      <path d="M3 7h5l2-3h8l2 3h5v14H3Z" />
      <circle cx="14" cy="13.5" r="4.5" />
    </svg>
  ),
  cal: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9A3B12" strokeWidth="2.4">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  ),
  photo: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7A2C82" strokeWidth="2.4" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
    </svg>
  ),
  gear: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2F4F5F" strokeWidth="2.4">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" strokeLinecap="round" />
    </svg>
  ),
  shop: Ico.bag("#fff", 30),
  pay: <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "Inter, sans-serif" }}>৳</div>,
};
export const AndroidHome: React.FC<{ power?: number; time?: string; reveal?: number }> = ({ power = 1, time = "10:24", reveal = 1 }) => {
  const r = cl(reveal);
  const apps: [string, React.ReactNode, string][] = [
    ["#C7F0D2", gl.phone, "Phone"],
    ["#D3E3FD", gl.msg, "Messages"],
    ["#ECECEC", gl.cam, "Camera"],
    ["#FFD9C7", gl.cal, "Calendar"],
    ["#F1D7F5", gl.photo, "Photos"],
    ["#D5E7EE", gl.gear, "Settings"],
    ["#D85E24", gl.shop, "Shapla"],
    ["#E2136E", gl.pay, "bKash"],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: UI, background: "linear-gradient(170deg, #F7D9B8 0%, #E7B49B 30%, #B98AA6 62%, #6F6A9E 100%)" }}>
      <div style={{ position: "absolute", right: -100, top: 210, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,236,210,0.6), rgba(255,236,210,0))" }} />
      <PhoneStatus kind="android" time={time} />
      <div style={{ position: "absolute", top: 96, left: 30, color: "#fff", opacity: r, transform: `translateY(${(1 - r) * 20}px)` }}>
        <div style={{ fontSize: 96, fontWeight: 300, lineHeight: 0.95, letterSpacing: -2, fontFamily: "Inter, sans-serif" }}>
          {time.split(":")[0]}
          <br />
          {time.split(":")[1]}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          Fri, Nov 14
          <svg width="22" height="22" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" fill="#FFD24A" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="#FFD24A" strokeWidth="2" strokeLinecap="round" />
          </svg>
          29°C Dhaka
        </div>
      </div>
      <div style={{ position: "absolute", left: 22, right: 22, bottom: 128, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", rowGap: 22, justifyItems: "center" }}>
        {apps.map(([bg, g, l], i) => {
          const k = cl(r * 3 - i * 0.18);
          return (
            <div key={l} style={{ opacity: k, transform: `scale(${0.7 + 0.3 * k})` }}>
              <AppIcon bg={bg} glyph={g} label={l} />
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 22, right: 22, bottom: 40, height: 62, borderRadius: 31, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", padding: "0 22px", gap: 14, color: "#4a4a50", fontSize: 21, fontWeight: 600 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a4a50" strokeWidth="2.6" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5 21 21" />
        </svg>
        Search
        <svg width="20" height="24" viewBox="0 0 20 26" fill="#4a4a50" style={{ marginLeft: "auto" }}>
          <rect x="6" y="1" width="8" height="15" rx="4" />
          <path d="M2 12a8 8 0 0 0 16 0" stroke="#4a4a50" strokeWidth="2.4" fill="none" />
          <path d="M10 20v4" stroke="#4a4a50" strokeWidth="2.4" />
        </svg>
      </div>
      <div style={{ position: "absolute", bottom: 12, left: "50%", width: 108, height: 5, marginLeft: -54, borderRadius: 3, background: "rgba(255,255,255,0.9)" }} />
      <PowerVeil p={power} />
    </div>
  );
};

// ---------- iPad: dental appointment book (portrait + landscape layouts) ----------
const APPTS: [string, string, string, string][] = [
  ["১০:০০", "নুসরাত জাহান", "দাঁত পরিষ্কার (Scaling)", "#3E6E9E"],
  ["১১:৩০", "আরিফ হোসেন", "রুট ক্যানেল · ২য় সেশন", "#D85E24"],
  ["১২:১৫", "সাবরিনা আক্তার", "ব্রেস চেক-আপ", "#2DBE60"],
  ["০৩:০০", "মাহবুব রহমান", "দাঁত তোলা", "#8E5BB5"],
  ["০৪:৩০", "ফারহানা ইয়াসমিন", "ফিলিং (Composite)", "#3E6E9E"],
];
export const IPadBooking: React.FC<{ layout: "portrait" | "landscape"; confirm?: number; power?: number }> = ({ layout, confirm = 0, power = 1 }) => {
  const land = layout === "landscape";
  const c = cl(confirm);
  const days = ["শনি ৮", "রবি ৯", "সোম ১০", "মঙ্গল ১১", "বুধ ১২", "বৃহঃ ১৩", "শুক্র ১৪"];
  const list = (
    <div style={{ display: "flex", flexDirection: "column", gap: land ? 16 : 12 }}>
      {APPTS.map(([tm, nm, tr, col], i) => {
        const hi = i === 2;
        return (
          <div key={nm} style={{ display: "flex", alignItems: "center", gap: 16, background: hi ? `rgba(45,190,96,${0.08 + 0.1 * c})` : "#fff", borderRadius: 20, padding: land ? "19px 20px" : "14px 18px", boxShadow: "0 4px 14px rgba(40,30,20,0.07)", border: hi && c > 0.5 ? "2px solid #2DBE60" : "2px solid transparent" }}>
            <div style={{ width: 8, alignSelf: "stretch", borderRadius: 4, background: col }} />
            <div style={{ width: 86, fontSize: 26, fontWeight: 700, fontFamily: BN, color: "#13253C" }}>{tm}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 27, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", color: "#13253C", lineHeight: 1.2 }}>{nm}</div>
              <div style={{ fontSize: 21, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif", color: "#6b7280" }}>{tr}</div>
            </div>
            {hi ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: c > 0.5 ? "#2DBE60" : "#F5952B", color: "#fff", borderRadius: 16, padding: "8px 16px", fontSize: 21, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", transform: `scale(${1 + 0.12 * Math.sin(Math.PI * cl(c * 1.6))})` }}>
                {c > 0.5 && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                )}
                {c > 0.5 ? "কনফার্মড" : "অপেক্ষায়"}
              </div>
            ) : (
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2DBE60", fontFamily: "'Hind Siliguri', sans-serif" }}>কনফার্মড</div>
            )}
          </div>
        );
      })}
    </div>
  );
  const header = (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: "linear-gradient(140deg,#3E6E9E,#1B4470)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
          <path d="M7 3c-2.6 0-4 2-4 4.6 0 2.5 1 4.2 1.7 6.6.6 2.2.8 6.8 2.6 6.8 1.6 0 1.6-4.6 2.6-5.8.4-.5 1.8-.5 2.2 0 1 1.2 1 5.8 2.6 5.8 1.8 0 2-4.6 2.6-6.8C18 11.8 19 10.1 19 7.6 19 5 17.6 3 15 3c-1.6 0-2.4.9-4 .9S8.6 3 7 3Z" transform="translate(1 0)" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "Inter, sans-serif", color: "#13253C", letterSpacing: -0.4 }}>Smile Care Dental</div>
        <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif", color: "#6b7280" }}>জিন্দাবাজার, সিলেট · আজকের সিরিয়াল</div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F6F2EC", fontFamily: UI, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 34, display: "flex", alignItems: "center", padding: "0 26px", fontSize: 17, fontWeight: 700, color: "#111" }}>
        9:41 <span style={{ marginLeft: 10, fontWeight: 600, color: "#555" }}>Fri 14 Nov</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {Ico.wifi("#111", 18)}
          {Ico.battery("#111", 26)}
        </div>
      </div>
      {land ? (
        <div style={{ position: "absolute", top: 44, left: 0, right: 0, bottom: 0, display: "flex" }}>
          <div style={{ width: 300, padding: "18px 22px", borderRight: "1px solid #E5DED4", background: "#FBF8F4" }}>
            {header}
            <div style={{ marginTop: 26, fontSize: 21, fontWeight: 700, color: "#8a8f98" }}>NOVEMBER 2026</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginTop: 10, fontFamily: BN }}>
              {Array.from({ length: 30 }).map((_, i) => {
                const dd = i + 1;
                const on = dd === 14;
                return (
                  <div key={i} style={{ height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, background: on ? "#D85E24" : "transparent", color: on ? "#fff" : "#3b4250" }}>
                    {"০১২৩৪৫৬৭৮৯"[Math.floor(dd / 10)] === "০" ? "" : "০১২৩৪৫৬৭৮৯"[Math.floor(dd / 10)]}
                    {"০১২৩৪৫৬৭৮৯"[dd % 10]}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 24, background: "#fff", borderRadius: 20, padding: 18, boxShadow: "0 4px 14px rgba(40,30,20,0.07)" }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#8a8f98", fontFamily: "'Hind Siliguri', sans-serif" }}>আজ মোট</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: "#13253C", fontFamily: BN }}>৫ জন</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#2DBE60", fontFamily: BN }}>আয় ৳ ১৮,৫০০</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: "22px 30px" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              {days.map((d, i) => (
                <div key={d} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 16, background: i === 6 ? "#13253C" : "#fff", color: i === 6 ? "#fff" : "#3b4250", fontSize: 19, fontWeight: 700, fontFamily: BN }}>
                  {d}
                </div>
              ))}
            </div>
            {list}
          </div>
        </div>
      ) : (
        <div style={{ position: "absolute", top: 48, left: 28, right: 28, bottom: 0 }}>
          {header}
          <div style={{ display: "flex", gap: 8, margin: "26px 0 20px" }}>
            {days.slice(2).map((d, i) => (
              <div key={d} style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRadius: 16, background: i === 4 ? "#13253C" : "#fff", color: i === 4 ? "#fff" : "#3b4250", fontSize: 20, fontWeight: 700, fontFamily: BN }}>
                {d}
              </div>
            ))}
          </div>
          {list}
          <div style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#D85E24", color: "#fff", borderRadius: 22, padding: "18px 0", fontSize: 27, fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif" }}>+ নতুন সিরিয়াল</div>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 8, left: "50%", width: 180, height: 5, marginLeft: -90, borderRadius: 3, background: "#1c1c1e", opacity: 0.8 }} />
      <PowerVeil p={power} />
    </div>
  );
};

// ---------- iMac: shop analytics dashboard ----------
export const IMacDash: React.FC<{ power?: number; grow?: number }> = ({ power = 1, grow = 1 }) => {
  const g = cl(grow);
  const bars = [42, 55, 48, 66, 72, 61, 88, 79, 94, 86, 100, 97];
  const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const kpi: [string, string, string, string][] = [
    ["আজকের অর্ডার", "১২৮", "+১৮%", "#D85E24"],
    ["আজকের বিক্রি", "৳ ৪৬,২৮০", "+১২%", "#2DBE60"],
    ["Website ভিজিটর", "৩,৪১২", "+২৬%", "#3E6E9E"],
    ["ফোন কল", "৪৬", "+৯%", "#8E5BB5"],
  ];
  const orders: [string, string, string, string][] = [
    ["#১০২৪", "তানভীর আহমেদ · মিরপুর ১০", "৳ ৭২০", "bKash"],
    ["#১০২৩", "রুমানা ইসলাম · ধানমন্ডি", "৳ ১,৪৫০", "Nagad"],
    ["#১০২২", "কামরুল হাসান · উত্তরা", "৳ ৫৬০", "Cash"],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F7F3EE", fontFamily: UI, color: "#13253C", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 30, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", padding: "0 18px", gap: 22, fontSize: 15, color: "#1d1d1f" }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: "#1d1d1f", opacity: 0.85 }} />
        <b>Shapla Admin</b>
        <span>File</span>
        <span>View</span>
        <span>Window</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, alignItems: "center" }}>
          {Ico.wifi("#1d1d1f", 16)}
          <span style={{ fontWeight: 600 }}>Fri 14 Nov 9:41</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 30, left: 0, bottom: 0, width: 230, background: "#13253C", color: "#cfd8e3", padding: "28px 22px", fontFamily: "'Hind Siliguri', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 22 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(140deg,#F5952B,#D85E24)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Hind Siliguri', sans-serif", fontSize: 22 }}>শ</div>
          Shapla Sweets
        </div>
        {["ড্যাশবোর্ড", "অর্ডার", "প্রোডাক্ট", "কাস্টমার", "রিপোর্ট", "সেটিংস"].map((m, i) => (
          <div key={m} style={{ marginTop: i ? 8 : 34, padding: "12px 14px", borderRadius: 12, fontSize: 20, fontWeight: 700, background: i === 0 ? "rgba(245,149,43,0.18)" : "transparent", color: i === 0 ? "#F5952B" : "#cfd8e3" }}>
            {m}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 30, left: 230, right: 0, bottom: 0, padding: "26px 32px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div style={{ fontSize: 38, fontWeight: 800, fontFamily: "'Hind Siliguri', sans-serif" }}>আজকের হিসাব</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#6b7280", fontFamily: BN }}>শুক্রবার, ১৪ নভেম্বর</div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 700, color: "#2DBE60" }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#2DBE60" }} /> Website online
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 20 }}>
          {kpi.map(([l, v, d, col]) => (
            <div key={l} style={{ background: "#fff", borderRadius: 20, padding: "16px 20px", boxShadow: "0 6px 18px rgba(40,30,20,0.07)" }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#6b7280", fontFamily: "'Hind Siliguri', sans-serif" }}>{l}</div>
              <div style={{ fontSize: 42, fontWeight: 800, fontFamily: BN, color: "#13253C", lineHeight: 1.15 }}>{v}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: col, fontFamily: BN }}>{d} গত সপ্তাহের চেয়ে</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
          <div style={{ flex: 1.5, background: "#fff", borderRadius: 20, padding: "16px 22px", boxShadow: "0 6px 18px rgba(40,30,20,0.07)" }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Hind Siliguri', sans-serif" }}>মাসিক বিক্রি (৳ লাখ)</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 300, marginTop: 14 }}>
              {bars.map((b, i) => {
                const k = cl(g * 1.6 - i * 0.05);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", height: `${b * k * 0.86}%`, borderRadius: "10px 10px 4px 4px", background: i === 11 ? "linear-gradient(180deg,#F5952B,#D85E24)" : "linear-gradient(180deg,#5D8BB8,#3E6E9E)" }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#8a8f98" }}>{months[i]}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: 20, padding: "16px 22px", boxShadow: "0 6px 18px rgba(40,30,20,0.07)" }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Hind Siliguri', sans-serif" }}>সর্বশেষ অর্ডার</div>
            {orders.map(([id, who, amt, pay], i) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderBottom: i < 2 ? "1px solid #EEE8E0" : "none" }}>
                <div style={{ fontSize: 19, fontWeight: 800, fontFamily: BN, color: "#D85E24", width: 70 }}>{id}</div>
                <div style={{ flex: 1, fontSize: 19, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{who}</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 21, fontWeight: 800, fontFamily: BN }}>{amt}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: pay === "bKash" ? "#E2136E" : pay === "Nagad" ? "#F26B21" : "#6b7280" }}>{pay}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PowerVeil p={power} />
    </div>
  );
};
