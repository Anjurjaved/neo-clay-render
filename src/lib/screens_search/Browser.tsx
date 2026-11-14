// Browser chrome — desktop Chrome (1024×700: tab strip, omnibox typing, suggestions, loading bar, page) and
// mobile Chrome (390×843). Any site goes inside via `page`; `newTab` shows the New Tab page instead.
// Also ships a sample business site (Dr. Shirin Dental Chamber) in desktop + mobile forms with reveal + scroll.
import React from "react";
import { StatusBar } from "../../kit/Device";
import { GWord } from "../../kit/ui/Google";
import { SANS, BN, NUM, IcBack, IcFwd, IcReload, IcX, IcDots, IcLock, IcTune, IcStarO, IcPlus, IcHome, IcSearch, IcMic, IcLens, IcPhone, HomeBar, clamp01, Rich } from "./ui";
import { PhotoTile } from "./GoogleMaps";

export type Tab = { title: string; fav: [string, string] };
export type BrowserProps = {
  tabs?: Tab[];
  active?: number;
  url: string; // what the omnibox shows (typed or loaded)
  caret?: boolean;
  focus?: number; // 0..1 omnibox focused (suggestion dropdown)
  suggestion?: string; // first suggestion row text
  loading?: number; // 0..1 progress; <0 hidden
  newTab?: boolean;
  page?: React.ReactNode;
  secure?: boolean;
};

const FavDot: React.FC<{ f: [string, string]; s?: number }> = ({ f, s = 16 }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.28, background: f[0], color: "#fff", fontSize: s * 0.62, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", fontFamily: SANS }}>{f[1]}</div>
);
const Spinner: React.FC<{ s?: number; a: number }> = ({ s = 16, a }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ flex: "none", transform: `rotate(${a}deg)` }}>
    <circle cx="12" cy="12" r="9" stroke="#C8D7F5" strokeWidth="3" fill="none" />
    <path d="M12 3a9 9 0 0 1 9 9" stroke="#1A73E8" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

/* ---------------- New Tab page ---------------- */
const SHORTCUTS: [string, string, string][] = [
  ["Gmail", "#C5221F", "M"],
  ["YouTube", "#D93025", "Y"],
  ["Daraz", "#F36F21", "D"],
  ["Prothom Alo", "#2A6CB0", "P"],
  ["bKash", "#D12053", "b"],
  ["Facebook", "#1877F2", "f"],
];
const NewTabPage: React.FC<{ mobile?: boolean }> = ({ mobile }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: mobile ? 90 : 110 }}>
    <GWord size={mobile ? 52 : 72} />
    <div style={{ marginTop: mobile ? 26 : 30, width: mobile ? 350 : 560, height: mobile ? 52 : 48, borderRadius: 26, border: "1px solid #dfe1e5", boxShadow: "0 1px 4px rgba(32,33,36,.16)", display: "flex", alignItems: "center", gap: 14, padding: "0 18px", fontSize: mobile ? 17 : 16, color: "#70757a" }}>
      <IcSearch s={20} />
      <div style={{ flex: 1 }}>Search Google or type a URL</div>
      <IcMic s={20} />
      <IcLens s={20} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(4, 76px)" : "repeat(6, 96px)", gap: mobile ? "18px 8px" : 12, marginTop: mobile ? 34 : 40 }}>
      {SHORTCUTS.slice(0, mobile ? 4 : 6).map(([n, c, ch]) => (
        <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: "#F1F3F4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FavDot f={[c, ch]} s={26} />
          </div>
          <div style={{ fontSize: 13, color: "#202124", fontFamily: SANS }}>{n}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ======================= DESKTOP ======================= */
export const BrowserDesktop: React.FC<BrowserProps & { spin?: number }> = ({ tabs = [{ title: "New Tab", fav: ["#5F6368", "N"] }], active = 0, url, caret, focus = 0, suggestion, loading = -1, newTab, page, secure = true, spin = 0 }) => {
  const isLoading = loading >= 0 && loading < 1;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS, color: "#1f1f1f" }}>
      {/* tab strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, background: "#DFE3E8", display: "flex", alignItems: "flex-end", paddingLeft: 86 }}>
        <div style={{ position: "absolute", left: 18, top: 16, display: "flex", gap: 8 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
          ))}
        </div>
        {tabs.map((tb, i) => {
          const on = i === active;
          return (
            <div key={i} style={{ position: "relative", width: 230, height: 36, borderRadius: "10px 10px 0 0", background: on ? "#fff" : "transparent", display: "flex", alignItems: "center", gap: 9, padding: "0 12px", fontSize: 13.5, color: on ? "#1f1f1f" : "#474747" }}>
              {on && isLoading ? <Spinner a={spin} /> : <FavDot f={tb.fav} />}
              <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tb.title}</div>
              <IcX s={15} c="#474747" />
              {!on && i !== active - 1 && <div style={{ position: "absolute", right: 0, top: 10, width: 1, height: 16, background: "#A9AEB4" }} />}
            </div>
          );
        })}
        <div style={{ width: 34, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IcPlus s={18} />
        </div>
      </div>
      {/* toolbar */}
      <div style={{ position: "absolute", top: 44, left: 0, right: 0, height: 50, display: "flex", alignItems: "center", gap: 14, padding: "0 14px", borderBottom: "1px solid #E3E3E3" }}>
        <IcBack s={20} c="#474747" />
        <IcFwd s={20} c="#B5B5B5" />
        {isLoading ? <IcX s={20} c="#474747" /> : <IcReload s={19} />}
        <div style={{ flex: 1, height: 36, borderRadius: focus > 0.01 ? "18px 18px 0 0" : 18, background: focus > 0.01 ? "#fff" : "#EEF1F4", boxShadow: focus > 0.01 ? `0 0 0 2px rgba(11,87,208,${focus})` : undefined, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", position: "relative", zIndex: 30 }}>
          {focus > 0.5 ? <IcSearch s={16} c="#474747" /> : secure && !newTab ? <IcTune s={17} /> : <IcSearch s={16} c="#474747" />}
          <div style={{ flex: 1, fontSize: 15.5, whiteSpace: "nowrap", overflow: "hidden" }}>
            {url || <span style={{ color: "#5f6368" }}>Search Google or type a URL</span>}
            <span style={{ display: "inline-block", width: 1.6, height: 18, background: "#1f1f1f", verticalAlign: "-3px", marginLeft: 1, opacity: caret ? 1 : 0 }} />
          </div>
          <IcStarO s={18} />
          {focus > 0.01 && suggestion && (
            <div style={{ position: "absolute", top: 36, left: -2, right: -2, background: "#fff", borderRadius: "0 0 18px 18px", boxShadow: "0 6px 12px rgba(0,0,0,.16), 0 0 0 2px rgba(11,87,208,.9)", clipPath: "inset(0 -20px -20px -20px)", opacity: focus, padding: "6px 0 10px" }}>
              {[
                [suggestion, "drshirindental.com — Dr. Shirin Dental Chamber", true],
                [`${url} serial`, "", false],
                [`${url} sylhet`, "", false],
              ].map(([a, b, globe], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 16px", background: i === 0 ? "#E8F0FE" : undefined, fontSize: 15 }}>
                  {globe ? <FavDot f={["#F5952B", "S"]} /> : <IcSearch s={16} c="#5f6368" />}
                  <span>
                    <b>{a as string}</b>
                    {b && <span style={{ color: "#5f6368" }}> — {(b as string).split(" — ")[1]}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: "#7B5E57", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>R</div>
        <IcDots s={20} c="#474747" />
      </div>
      {isLoading && <div style={{ position: "absolute", top: 93, left: 0, height: 3, width: `${loading * 100}%`, background: "#1A73E8", zIndex: 25, boxShadow: "0 0 6px rgba(26,115,232,.5)" }} />}
      {/* viewport */}
      <div style={{ position: "absolute", top: 95, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>{newTab ? <NewTabPage /> : page}</div>
    </div>
  );
};

/* ======================= MOBILE ======================= */
export const BrowserMobile: React.FC<BrowserProps & { tabCount?: number }> = ({ url, caret, focus = 0, suggestion, loading = -1, newTab, page, secure = true, tabCount = 3 }) => {
  const isLoading = loading >= 0 && loading < 1;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS, color: "#1f1f1f" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 118, background: "#fff", zIndex: 20, borderBottom: "1px solid #ECECEC" }}>
        <StatusBar />
        <div style={{ position: "absolute", top: 60, left: 12, right: 12, height: 48, display: "flex", alignItems: "center", gap: 12 }}>
          {focus > 0.5 ? <IcBack s={24} c="#444746" /> : <IcHome s={24} />}
          <div style={{ flex: 1, height: 46, borderRadius: 23, background: "#EDF0F3", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", boxShadow: focus > 0.01 ? `0 0 0 2px rgba(11,87,208,${focus})` : undefined }}>
            {secure && !newTab && focus < 0.5 ? <IcTune s={18} /> : <IcSearch s={18} c="#444746" />}
            <div style={{ flex: 1, fontSize: 17, whiteSpace: "nowrap", overflow: "hidden" }}>
              {url || <span style={{ color: "#5f6368" }}>Search or type URL</span>}
              <span style={{ display: "inline-block", width: 2, height: 20, background: "#0B57D0", verticalAlign: "-4px", marginLeft: 1, opacity: caret ? 1 : 0 }} />
            </div>
            {focus > 0.5 && url && <IcX s={18} c="#444746" />}
          </div>
          <div style={{ width: 24, height: 24, borderRadius: 6, border: "2.2px solid #444746", fontSize: 12.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", color: "#444746" }}>{tabCount}</div>
          <IcDots s={22} c="#444746" />
        </div>
        {isLoading && <div style={{ position: "absolute", bottom: -2, left: 0, height: 3, width: `${loading * 100}%`, background: "#0B57D0" }} />}
      </div>
      <div style={{ position: "absolute", top: 118, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>{newTab ? <NewTabPage mobile /> : page}</div>
      {focus > 0.01 && suggestion && (
        <div style={{ position: "absolute", top: 118, left: 0, right: 0, bottom: 0, background: "#fff", opacity: focus, zIndex: 15 }}>
          {[
            [suggestion, "Dr. Shirin Dental Chamber", true],
            [`${url} serial`, "", false],
            [`${url} sylhet`, "", false],
          ].map(([a, b, g], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 20px" }}>
              {g ? <FavDot f={["#F5952B", "S"]} s={24} /> : <IcSearch s={22} c="#5f6368" />}
              <div>
                <div style={{ fontSize: 17 }}>{a as string}</div>
                {b && <div style={{ fontSize: 14, color: "#5f6368", marginTop: 2 }}>{b as string}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <HomeBar />
    </div>
  );
};

/* ======================= sample site: Dr. Shirin Dental Chamber ======================= */
const NAVY = "#12355B";
const ORANGE = "#F07F1B";
const TREAT: [string, string, string][] = [
  ["স্কেলিং ও পলিশ", "৳১,৫০০ – ২,৫০০", "৩০ মিনিট"],
  ["রুট ক্যানেল", "৳৬,০০০ – ১০,০০০", "২ সিটিং"],
  ["দাঁত ফিলিং", "৳১,২০০ – ৩,০০০", "৪০ মিনিট"],
  ["ব্রেস (অর্থোডন্টিক)", "৳৪৫,০০০ থেকে", "১২–১৮ মাস"],
];
const ToothMark: React.FC<{ s: number; c?: string }> = ({ s, c = "#fff" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M7.2 3.2c1.6 0 2.9.8 4.8.8s3.2-.8 4.8-.8c2.6 0 4.2 2.2 4.2 5 0 2.4-1 4-1.7 6.2-.8 2.6-1 6.4-3 6.4-1.8 0-1.8-4.6-4.3-4.6s-2.5 4.6-4.3 4.6c-2 0-2.2-3.8-3-6.4C4 12.2 3 10.6 3 8.2c0-2.8 1.6-5 4.2-5z" />
  </svg>
);
const sec = (reveal: number, i: number, n: number): React.CSSProperties => {
  const k = clamp01(reveal * n - i);
  return { opacity: k, transform: `translateY(${(1 - k) * 26}px)` };
};

export const DentalSiteDesktop: React.FC<{ reveal?: number; scroll?: number }> = ({ reveal = 1, scroll = 0 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: -scroll, background: "#FBF8F4", fontFamily: BN, color: NAVY }}>
    {/* nav */}
    <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 40px", background: "#fff", borderBottom: "1px solid #EFE7DD", ...sec(reveal, 0, 6) }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <ToothMark s={22} />
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 19 }}>Dr. Shirin Dental Chamber</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 26, fontSize: 16, fontWeight: 600, color: "#40546B" }}>
        <span>চিকিৎসা</span>
        <span>ডাক্তার</span>
        <span>ফি</span>
        <span>যোগাযোগ</span>
      </div>
      <div style={{ marginLeft: 26, background: ORANGE, color: "#fff", fontWeight: 700, fontSize: 15, padding: "9px 18px", borderRadius: 10 }}>সিরিয়াল নিন</div>
    </div>
    {/* hero */}
    <div style={{ display: "flex", gap: 34, padding: "40px 40px 0" }}>
      <div style={{ flex: 1.05, ...sec(reveal, 1, 6) }}>
        <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ORANGE, letterSpacing: 1.5 }}>ZINDABAZAR, SYLHET</div>
        <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.22, marginTop: 10 }}>হাসিমুখে দাঁতের যত্ন, সিরিয়াল দিন এক মিনিটে</div>
        <div style={{ fontSize: 17.5, lineHeight: 1.6, color: "#4E6075", marginTop: 12, fontWeight: 600 }}>
          <Rich segs={[{ t: "রুট ক্যানেল, স্কেলিং, ব্রেস। প্রতিদিন বিকেল ৪টা – রাত ৯টা, শুক্রবার বন্ধ।" }]} />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
          <div style={{ background: ORANGE, color: "#fff", fontWeight: 700, fontSize: 17, padding: "13px 24px", borderRadius: 12, boxShadow: "0 6px 14px rgba(240,127,27,.3)" }}>অনলাইনে সিরিয়াল</div>
          <div style={{ border: `2px solid ${NAVY}`, fontWeight: 700, fontSize: 17, padding: "11px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <IcPhone s={18} c={NAVY} /> কল করুন
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 24, fontFamily: SANS, fontSize: 14, color: "#4E6075", fontWeight: 700 }}>
          <span>★ 4.8 Google (126)</span>
          <span>Zindabazar Rd, Sylhet</span>
        </div>
      </div>
      <div style={{ flex: 0.95, ...sec(reveal, 2, 6) }}>
        <PhotoTile kind={1} w={430} h={300} r={22} />
      </div>
    </div>
    {/* treatments */}
    <div style={{ padding: "40px 40px 0", ...sec(reveal, 3, 6) }}>
      <div style={{ fontSize: 28, fontWeight: 700 }}>চিকিৎসা ও খরচ</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 16 }}>
        {TREAT.map(([n, p, d], i) => (
          <div key={n} style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", boxShadow: "0 4px 14px rgba(18,53,91,.07)", border: "1px solid #F0E9DF", ...sec(reveal, 3 + i * 0.3, 6) }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: i % 2 ? "#FFF0E1" : "#E6EFF8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ToothMark s={22} c={i % 2 ? ORANGE : NAVY} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>{n}</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: ORANGE, marginTop: 4 }}>
              <Rich segs={[{ t: p }]} />
            </div>
            <div style={{ fontSize: 14.5, color: "#6A7B8E", marginTop: 2, fontWeight: 600 }}>
              <Rich segs={[{ t: d }]} />
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* serial form + map */}
    <div style={{ display: "flex", gap: 20, padding: "36px 40px 40px", ...sec(reveal, 5, 6) }}>
      <div style={{ flex: 1, background: NAVY, borderRadius: 20, padding: 24, color: "#fff" }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>সিরিয়াল ফর্ম</div>
        {["নাম — রাশেদ আহমেদ", "মোবাইল — 01712-345 678", "তারিখ — শনিবার, ৪টা ৩০"].map((x) => (
          <div key={x} style={{ marginTop: 12, background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "11px 14px", fontSize: 16, fontWeight: 600 }}>
            <Rich segs={[{ t: x }]} />
          </div>
        ))}
        <div style={{ marginTop: 14, background: ORANGE, borderRadius: 10, padding: "12px", textAlign: "center", fontWeight: 700, fontSize: 17 }}>confirm করুন</div>
      </div>
      <div style={{ flex: 1, borderRadius: 20, overflow: "hidden", border: "1px solid #EFE7DD" }}>
        <PhotoTile kind={0} w={452} h={286} r={0} />
      </div>
    </div>
  </div>
);

export const DentalSiteMobile: React.FC<{ reveal?: number; scroll?: number }> = ({ reveal = 1, scroll = 0 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: -scroll, background: "#FBF8F4", fontFamily: BN, color: NAVY }}>
    <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 18px", background: "#fff", borderBottom: "1px solid #EFE7DD", ...sec(reveal, 0, 5) }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
        <ToothMark s={20} />
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 17 }}>Dr. Shirin Dental</div>
      <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 22, height: 2.6, borderRadius: 2, background: NAVY }} />
        ))}
      </div>
    </div>
    <div style={{ padding: "22px 18px 0", ...sec(reveal, 1, 5) }}>
      <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: ORANGE, letterSpacing: 1.4 }}>ZINDABAZAR, SYLHET</div>
      <div style={{ fontSize: 33, fontWeight: 700, lineHeight: 1.25, marginTop: 8 }}>হাসিমুখে দাঁতের যত্ন, সিরিয়াল দিন এক মিনিটে</div>
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <div style={{ flex: 1, background: ORANGE, color: "#fff", fontWeight: 700, fontSize: 17, padding: "13px 0", borderRadius: 12, textAlign: "center" }}>সিরিয়াল নিন</div>
        <div style={{ flex: 1, border: `2px solid ${NAVY}`, fontWeight: 700, fontSize: 17, padding: "11px 0", borderRadius: 12, textAlign: "center" }}>কল করুন</div>
      </div>
    </div>
    <div style={{ padding: "20px 18px 0", ...sec(reveal, 2, 5) }}>
      <PhotoTile kind={1} w={354} h={210} r={18} />
    </div>
    <div style={{ padding: "26px 18px 0", ...sec(reveal, 3, 5) }}>
      <div style={{ fontSize: 24, fontWeight: 700 }}>চিকিৎসা ও খরচ</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 12 }}>
        {TREAT.map(([n, p]) => (
          <div key={n} style={{ background: "#fff", borderRadius: 14, padding: "14px 12px", boxShadow: "0 3px 10px rgba(18,53,91,.07)", border: "1px solid #F0E9DF" }}>
            <div style={{ fontSize: 16.5, fontWeight: 700 }}>{n}</div>
            <div style={{ fontSize: 16.5, fontWeight: 700, color: ORANGE, marginTop: 4, fontFamily: NUM }}>
              <Rich segs={[{ t: p }]} />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ padding: "22px 18px 40px", ...sec(reveal, 4, 5) }}>
      <div style={{ background: NAVY, borderRadius: 18, padding: 18, color: "#fff" }}>
        <div style={{ fontSize: 21, fontWeight: 700 }}>সিরিয়াল ফর্ম</div>
        {["নাম", "মোবাইল নম্বর"].map((x) => (
          <div key={x} style={{ marginTop: 10, background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "11px 14px", fontSize: 15.5, fontWeight: 600, color: "rgba(255,255,255,.75)" }}>
            {x}
          </div>
        ))}
        <div style={{ marginTop: 12, background: ORANGE, borderRadius: 10, padding: "12px", textAlign: "center", fontWeight: 700, fontSize: 16.5 }}>confirm করুন</div>
      </div>
    </div>
  </div>
);
