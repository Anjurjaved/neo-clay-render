// App store listing (phone 390×843, android): icon, নাম, rating/downloads, Install → download progress → Open; screenshot carousel।
// কোনো store-এর logo নেই — generic store layout।
import React from "react";
import { StatusBar } from "../../kit/Device";
import { UI, INK, SUB, LINE, Icon, Touch, Pointer, k01, Tk } from "./ui";

const GREEN = "#0B8A5F";

export type AppStoreProps = {
  progress?: number; // 0→1 download (0 = Install অবস্থা)
  downloading?: boolean;
  installed?: number; // 0→1 → Open
  installPress?: number;
  shotsX?: number; // carousel px offset
  touch?: Pointer;
};

/** app-এর নিজের icon: সবুজ gradient + সাদা ঝুড়ি (নিজস্ব নকশা) */
export const FreshMartIcon: React.FC<{ s?: number }> = ({ s = 96 }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.24, background: "linear-gradient(150deg,#2FD07F 0%,#0E9C63 55%,#077A55 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 -4px 10px rgba(0,0,0,0.12), 0 6px 14px rgba(11,138,95,0.25)", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", width: s * 0.9, height: s * 0.9, borderRadius: "50%", background: "rgba(255,255,255,0.12)", top: -s * 0.42, left: -s * 0.18 }} />
    <svg width={s * 0.62} height={s * 0.62} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 11 4-7" />
      <path d="m19 11-4-7" />
      <path d="M2 11h20" fill="#fff" />
      <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4z" fill="rgba(255,255,255,0.95)" />
      <path d="M9 14.5v3M15 14.5v3M12 14.5v3" stroke="#0E9C63" />
    </svg>
  </div>
);

const fruit = (c: string, leaf = true) => (
  <div style={{ width: 34, height: 34, borderRadius: 17, background: `radial-gradient(circle at 35% 30%, #ffffffaa, ${c} 45%)`, position: "relative" }}>
    {leaf && <div style={{ position: "absolute", top: -4, left: 17, width: 10, height: 6, borderRadius: "6px 0", background: "#3BA55C" }} />}
  </div>
);

/** carousel-এর ছোট screenshot — আসল app screen-এর মতো (home / product / cart / tracking) */
const Shot: React.FC<{ kind: number }> = ({ kind }) => {
  const W = 156, H = 300;
  const head = (title: string) => (
    <div style={{ background: GREEN, color: "#fff", padding: "16px 12px 10px", fontSize: 13, fontWeight: 800 }}>
      {title}
      <div style={{ marginTop: 8, background: "rgba(255,255,255,0.95)", borderRadius: 8, height: 22, display: "flex", alignItems: "center", gap: 5, padding: "0 7px", color: SUB, fontSize: 9.5, fontWeight: 600 }}>
        <Icon n="search" s={11} c={SUB} w={2.4} /> Search fish, rice, oil
      </div>
    </div>
  );
  const prods: [string, string, number, string][] = [
    ["Rui fish", "1 kg", 380, "#7A8FA6"],
    ["Tomato", "1 kg", 60, "#E5533D"],
    ["Mango", "1 kg", 140, "#F2A93B"],
    ["Lemon", "4 pcs", 30, "#B9D34A"],
  ];
  return (
    <div style={{ width: W, height: H, borderRadius: 18, overflow: "hidden", background: "#F5F7F6", flexShrink: 0, boxShadow: "0 4px 12px rgba(20,33,61,0.12)", border: "1px solid #E6ECE9", fontFamily: UI, color: INK }}>
      {kind === 0 && (
        <>
          {head("Fresh Mart · Sylhet")}
          <div style={{ margin: "8px 8px 0", borderRadius: 10, background: "linear-gradient(120deg,#FFE3B8,#FFC98A)", padding: "9px 10px", fontSize: 11, fontWeight: 800, color: "#8A4A0F" }}>
            60-minute delivery
            <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2 }}>Free above ৳999</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: 8 }}>
            {prods.map(([n, u, p, c]) => (
              <div key={n} style={{ background: "#fff", borderRadius: 10, padding: "8px 6px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {fruit(c, n !== "Rui fish")}
                <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4 }}>{n}</div>
                <div style={{ fontSize: 9.5, color: GREEN, fontWeight: 800 }}>
                  <Tk n={p} /> <span style={{ color: SUB, fontWeight: 600 }}>/{u}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {kind === 1 && (
        <>
          <div style={{ height: 130, background: "linear-gradient(160deg,#FFF0D6,#FFD9A0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: "scale(2.2)" }}>{fruit("#F2A93B")}</div>
          </div>
          <div style={{ padding: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Himsagar Mango</div>
            <div style={{ fontSize: 10, color: SUB, marginTop: 2 }}>Rajshahi · 1 kg</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: GREEN, marginTop: 6 }}>
              <Tk n={140} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              {["−", "2", "+"].map((x, i) => (
                <div key={i} style={{ width: 26, height: 26, borderRadius: 8, background: i === 1 ? "transparent" : "#E4F3EC", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: GREEN }}>{x}</div>
              ))}
            </div>
            <div style={{ marginTop: 12, height: 32, borderRadius: 10, background: GREEN, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>Add to bag</div>
          </div>
        </>
      )}
      {kind === 2 && (
        <>
          {head("My bag")}
          <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {prods.slice(0, 3).map(([n, u, p, c]) => (
              <div key={n} style={{ background: "#fff", borderRadius: 10, padding: 7, display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ transform: "scale(0.8)" }}>{fruit(c, false)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700 }}>{n}</div>
                  <div style={{ fontSize: 9, color: SUB }}>{u}</div>
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 800 }}>
                  <Tk n={p} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: SUB }}>Pay with</div>
            <div style={{ display: "flex", gap: 5 }}>
              {[["bKash", "#E2136E"], ["Nagad", "#EE4023"], ["Cash", "#3E8E5A"]].map(([n, c]) => (
                <div key={n} style={{ flex: 1, height: 22, borderRadius: 6, background: c, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
              ))}
            </div>
            <div style={{ marginTop: 6, height: 30, borderRadius: 10, background: GREEN, color: "#fff", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Checkout · <Tk n={580} />
            </div>
          </div>
        </>
      )}
      {kind === 3 && (
        <>
          <div style={{ height: 168, background: "linear-gradient(180deg,#E6EFE9,#D8E6DD)", position: "relative", overflow: "hidden" }}>
            {[30, 78, 126].map((y) => (
              <div key={y} style={{ position: "absolute", left: 0, right: 0, top: y, height: 10, background: "#F7FAF8" }} />
            ))}
            {[40, 104].map((x) => (
              <div key={x} style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 10, background: "#F7FAF8" }} />
            ))}
            <svg width="156" height="168" style={{ position: "absolute", inset: 0 }}>
              <path d="M28 150 C 45 120, 45 90, 45 83 S 100 83, 109 60 L 120 30" fill="none" stroke={GREEN} strokeWidth="4" strokeLinecap="round" strokeDasharray="1 7" />
            </svg>
            <div style={{ position: "absolute", left: 96, top: 46, width: 28, height: 28, borderRadius: 14, background: GREEN, border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="truck" s={14} c="#fff" w={2.4} />
            </div>
          </div>
          <div style={{ padding: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Arriving in 18 min</div>
            <div style={{ fontSize: 10, color: SUB, marginTop: 3 }}>Rider: Karim · Ambarkhana</div>
            <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
              {[1, 1, 1, 0].map((k, i) => (
                <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: k ? GREEN : "#DDE3E0" }} />
              ))}
            </div>
            <div style={{ marginTop: 12, height: 30, borderRadius: 10, border: `1.5px solid ${GREEN}`, color: GREEN, fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Icon n="phone" s={12} c={GREEN} w={2.4} /> Call rider
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const AppStoreScreen: React.FC<AppStoreProps> = ({ progress = 0, downloading = false, installed = 0, installPress = 0, shotsX = 0, touch }) => {
  const R = 58; // progress ring radius (icon-এর চারপাশে)
  const circ = 2 * Math.PI * R;
  const ringOn = downloading && installed < 1;
  const mb = (18 * k01(progress)).toFixed(1);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: UI, color: INK }}>
      <StatusBar kind="android" />
      <div style={{ position: "absolute", top: 56, left: 0, right: 0, height: 56, display: "flex", alignItems: "center", padding: "0 18px", gap: 22 }}>
        <Icon n="back" s={26} c={INK} w={2.3} />
        <div style={{ marginLeft: "auto" }} />
        <Icon n="search" s={24} c={INK} w={2.3} />
        <Icon n="more" s={24} c={INK} w={2.6} />
      </div>
      {/* header */}
      <div style={{ position: "absolute", top: 122, left: 22, right: 18, display: "flex", gap: 18, alignItems: "center" }}>
        <div style={{ position: "relative", width: 128, height: 128, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {ringOn && (
            <svg width="128" height="128" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx="64" cy="64" r={R} fill="none" stroke="#E2EFE9" strokeWidth="5" />
              <circle cx="64" cy="64" r={R} fill="none" stroke={GREEN} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - k01(progress))} />
            </svg>
          )}
          <div style={{ transform: `scale(${ringOn ? 0.84 : 1})` }}>
            <FreshMartIcon s={104} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.12, letterSpacing: -0.4 }}>Sylhet Fresh Mart</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: GREEN, marginTop: 6 }}>Fresh Mart Ltd.</div>
          <div style={{ fontSize: 14, color: SUB, marginTop: 4 }}>{ringOn ? `${Math.round(k01(progress) * 100)}% of 18 MB · ${mb} MB` : installed > 0.5 ? "Installed" : "Groceries · In-app purchases"}</div>
        </div>
      </div>
      {/* stats */}
      <div style={{ position: "absolute", top: 278, left: 14, right: 14, display: "flex", alignItems: "center" }}>
        {[
          ["4.8", "12K reviews", true],
          ["100K+", "Downloads", false],
          ["3+", "Rated for 3+", false],
          ["18 MB", "Size", false],
        ].map(([a, b, star], i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ width: 1, height: 30, background: LINE }} />}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                {a as string}
                {star && <Icon n="star" s={15} c={INK} fill={INK} w={1} />}
              </div>
              <div style={{ fontSize: 12.5, color: SUB, marginTop: 3 }}>{b as string}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
      {/* install / cancel+open */}
      <div style={{ position: "absolute", top: 346, left: 22, right: 22, height: 52, display: "flex", gap: 12 }}>
        {!downloading && installed <= 0 ? (
          <div style={{ flex: 1, borderRadius: 26, background: GREEN, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, transform: `scale(${1 - 0.05 * installPress})`, boxShadow: "0 6px 14px rgba(11,138,95,0.28)" }}>Install</div>
        ) : (
          <>
            <div style={{ flex: 1, borderRadius: 26, border: `1.5px solid ${installed > 0.5 ? "#C9D2CE" : GREEN}`, color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>{installed > 0.5 ? "Uninstall" : "Cancel"}</div>
            <div style={{ flex: 1, borderRadius: 26, background: installed > 0 ? GREEN : "#E4E8E7", color: installed > 0 ? "#fff" : "#9AA4A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, transform: `scale(${1 + 0.06 * Math.sin(Math.PI * k01(installed))})` }}>Open</div>
          </>
        )}
      </div>
      {/* screenshots */}
      <div style={{ position: "absolute", top: 424, left: 0, right: 0, height: 310, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 12, paddingLeft: 22, transform: `translateX(${-shotsX}px)` }}>
          {[0, 1, 2, 3].map((k) => (
            <Shot key={k} kind={k} />
          ))}
        </div>
      </div>
      {/* about */}
      <div style={{ position: "absolute", top: 744, left: 22, right: 22 }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 19, fontWeight: 700 }}>
          About this app <Icon n="right" s={22} c={INK} style={{ marginLeft: "auto" }} />
        </div>
        <div style={{ fontSize: 14.5, color: SUB, marginTop: 6, lineHeight: 1.4 }}>Fish, vegetables and groceries at your door in 60 minutes. Pay with bKash, Nagad or cash.</div>
      </div>
      {touch && <Touch {...touch} />}
    </div>
  );
};
