// Analytics dashboard (tablet 1024×700): KPI count-up, visitors line chart আঁকা হয়, traffic source bar বাড়ে, hover tooltip, range switch
import React from "react";
import { UI, INK, SUB, LINE, Icon, Cursor, Pointer, k01 } from "./ui";

const BLUE = "#2F6FDE";
const ORANGE = "#F5952B";

// ৩০ দিনের visitors — deterministic, ঊর্ধ্বমুখী, শুক্রবারে ঢেউ
export const VISITS = Array.from({ length: 30 }, (_, i) => {
  const base = 250 + i * 9.5;
  const wave = Math.sin(i * 0.9) * 34 + Math.sin(i * 2.3 + 1) * 18;
  const fri = i % 7 === 4 ? 70 : 0;
  return Math.round(base + wave + fri + (i === 27 ? 90 : 0));
});
const DATES = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9, 16 + i));
  return `${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${d.getUTCDate()}`;
});

export type AnalyticsProps = {
  range: number; // 0 = 7 days, 1 = 30 days (active pill slides)
  draw: number; // 0→1 line chart আঁকা
  count: number; // 0→1 KPI count-up
  bars: number; // 0→1 source bars
  hover?: number; // data index (-1 = নেই)
  hoverK?: number; // tooltip 0→1
  cursor?: Pointer;
};

const KPIS = [
  { label: "Website visitors", v: 12480, d: "+38%", icon: "eye", c: BLUE, bg: "#E8F0FD" },
  { label: "Phone calls", v: 214, d: "+22%", icon: "phone", c: "#1FAF5A", bg: "#E5F6EC" },
  { label: "WhatsApp chats", v: 386, d: "+41%", icon: "chat", c: "#0E9C63", bg: "#E3F5EE" },
  { label: "Orders", v: 97, d: "+17%", icon: "bag", c: ORANGE, bg: "#FFF1E2" },
] as const;
const SOURCES = [
  ["Google Search", 58, BLUE],
  ["Google Maps", 22, "#1FAF5A"],
  ["Facebook", 13, "#5B6BF0"],
  ["Direct", 7, "#9AA4B2"],
] as const;

// chart geometry (card-এর ভেতরের svg)
const CW = 560, CH = 250, PL = 44, PR = 12, PT = 14, PB = 30;
const YMAX = 700;
const px = (i: number) => PL + (i / 29) * (CW - PL - PR);
const py = (v: number) => PT + (1 - v / YMAX) * (CH - PT - PB);
/** dashboard-এর ভেতরে data index-এর বিন্দু (screen px) — cursor ঠিক জায়গায় নিতে */
export const analyticsPoint = (i: number) => ({ x: 92 + 26 + 18 + px(i), y: 362 + py(VISITS[i]) });

const smoothPath = (pts: [number, number][]) => {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
};

export const AnalyticsScreen: React.FC<AnalyticsProps> = ({ range, draw, count, bars, hover = -1, hoverK = 0, cursor }) => {
  const pts = VISITS.map((v, i) => [px(i), py(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = `${line} L${px(29)},${py(0)} L${px(0)},${py(0)} Z`;
  const clipW = PL + k01(draw) * (CW - PL - PR + 6);
  const ease = (x: number) => 1 - Math.pow(1 - k01(x), 3);
  const rk = k01(range);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F4F6FA", fontFamily: UI, color: INK, overflow: "hidden" }}>
      {/* icon rail */}
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 92, background: "#fff", borderRight: `1px solid ${LINE}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18, gap: 10 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(145deg,#E58EA6,#C8627F)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: "#fff", fontWeight: 800, fontSize: 17 }}>TW</div>
        {(["home", "chart", "bag", "users", "chat", "sliders"] as const).map((n, i) => (
          <div key={n} style={{ width: 50, height: 50, borderRadius: 15, background: i === 1 ? "#E8F0FD" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon n={n} s={23} c={i === 1 ? BLUE : "#7A8494"} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 0, left: 92, right: 0, height: 62, display: "flex", alignItems: "center", padding: "0 26px", borderBottom: `1px solid ${LINE}`, background: "#fff" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: SUB }}>Trendy Wear · Dhanmondi, Dhaka</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: SUB }}>
          <Icon n="calendar" s={17} c={SUB} /> {rk > 0.5 ? "16 Oct – 14 Nov 2026" : "8 – 14 Nov 2026"}
        </div>
        <Icon n="download" s={20} c={SUB} style={{ marginLeft: 20 }} />
      </div>
      <div style={{ position: "absolute", top: 62, left: 92, right: 0, bottom: 0, padding: "20px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", height: 50 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.6 }}>Overview</div>
          {/* range control */}
          <div style={{ marginLeft: "auto", position: "relative", display: "flex", background: "#E9ECF2", borderRadius: 13, padding: 4 }}>
            <div style={{ position: "absolute", top: 4, left: 4 + rk * 98, width: 98, height: 38, borderRadius: 10, background: "#fff", boxShadow: "0 2px 6px rgba(20,33,61,0.12)" }} />
            {["7 days", "30 days", "90 days"].map((x, i) => (
              <div key={x} style={{ position: "relative", width: 98, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: (i === 0 && rk < 0.5) || (i === 1 && rk >= 0.5) ? INK : SUB }}>{x}</div>
            ))}
          </div>
        </div>
        {/* KPI row */}
        <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
          {KPIS.map((k) => {
            const scale = rk > 0.5 ? 1 : 0.24;
            const val = Math.round(k.v * scale * ease(count));
            return (
              <div key={k.label} style={{ flex: 1, height: 108, background: "#fff", borderRadius: 18, padding: "14px 16px", border: `1px solid ${LINE}`, boxShadow: "0 2px 10px rgba(20,33,61,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon n={k.icon} s={18} c={k.c} w={2.2} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: SUB }}>{k.label}</div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.8, fontVariantNumeric: "tabular-nums" }}>{val.toLocaleString("en-US")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 14, fontWeight: 800, color: "#1FAF5A", opacity: k01(count * 2 - 1) }}>
                    <Icon n="trend" s={15} c="#1FAF5A" w={2.6} /> {k.d}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* charts */}
        <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
          <div style={{ width: CW + 36, background: "#fff", borderRadius: 18, padding: "16px 18px", border: `1px solid ${LINE}`, boxShadow: "0 2px 10px rgba(20,33,61,0.04)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", height: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Visitors per day</div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: SUB }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: BLUE }} /> This month
              </div>
            </div>
            <svg width={CW} height={CH} style={{ display: "block", overflow: "visible" }}>

              {[0, 200, 400, 600].map((v) => (
                <g key={v}>
                  <line x1={PL} x2={CW - PR} y1={py(v)} y2={py(v)} stroke="#EDF0F4" strokeWidth="1.5" />
                  <text x={PL - 10} y={py(v) + 4} textAnchor="end" fontSize="12.5" fontWeight="600" fill="#8A94A3" fontFamily={UI}>{v}</text>
                </g>
              ))}
              {[0, 7, 14, 21, 28].map((i) => (
                <text key={i} x={px(i)} y={CH - 8} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#8A94A3" fontFamily={UI}>{DATES[i]}</text>
              ))}

            </svg>
            {/* data layer: div-mask দিয়ে বাম থেকে আঁকা (SVG clipPath/gradient matrix3d-এ ভরসাযোগ্য নয়) */}
            <div style={{ position: "absolute", left: 18, top: 56, width: clipW, height: CH, overflow: "hidden" }}>
              <svg width={CW} height={CH} style={{ display: "block" }}>
                <path d={area} fill={BLUE} fillOpacity={0.1} />
                <path d={line} fill="none" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>
            <svg width={CW} height={CH} style={{ position: "absolute", left: 18, top: 56, overflow: "visible" }}>
              {draw > 0 && draw < 1 && (() => {
                const i = Math.min(29, Math.floor(k01(draw) * 29.999));
                return <circle cx={px(i)} cy={py(VISITS[i])} r="5" fill={BLUE} stroke="#fff" strokeWidth="2.5" />;
              })()}
              {hover >= 0 && hoverK > 0 && (
                <g opacity={k01(hoverK)}>
                  <line x1={px(hover)} x2={px(hover)} y1={PT} y2={py(0)} stroke={BLUE} strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle cx={px(hover)} cy={py(VISITS[hover])} r={7 + 2 * Math.sin(Math.PI * k01(hoverK))} fill={BLUE} stroke="#fff" strokeWidth="3" />
                </g>
              )}
            </svg>
            {hover >= 0 && hoverK > 0 && (
              <div style={{ position: "absolute", left: 18 + px(hover) - 150, top: 56 + py(VISITS[hover]) - 6, width: 136, background: INK, color: "#fff", borderRadius: 12, padding: "9px 12px", opacity: k01(hoverK), transform: `translateY(${(1 - k01(hoverK)) * 8}px)`, boxShadow: "0 8px 20px rgba(14,22,40,0.25)" }}>
                <div style={{ fontSize: 12.5, opacity: 0.75, fontWeight: 600 }}>{DATES[hover]}</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{VISITS[hover]} visitors</div>
                <div style={{ fontSize: 12.5, color: "#7DE3A6", fontWeight: 700 }}>9 calls · 14 chats</div>
              </div>
            )}
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: 18, padding: "16px 18px", border: `1px solid ${LINE}`, boxShadow: "0 2px 10px rgba(20,33,61,0.04)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Where visitors come from</div>
            {SOURCES.map(([n, v, c], i) => {
              const k = ease(bars * 1.6 - i * 0.18);
              return (
                <div key={n} style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", fontSize: 14.5, fontWeight: 600 }}>
                    {n}
                    <span style={{ marginLeft: "auto", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{Math.round(v * k)}%</span>
                  </div>
                  <div style={{ height: 12, borderRadius: 6, background: "#EEF1F5", marginTop: 7, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${v * k * 1.55}%`, borderRadius: 6, background: c }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 22, borderRadius: 14, background: "#F2F7FF", padding: "11px 13px", fontSize: 13.5, lineHeight: 1.4, color: "#2A4A7F", fontWeight: 600, display: "flex", gap: 8 }}>
              <Icon n="trend" s={18} c={BLUE} w={2.4} />
              Google brings 4 out of 5 new customers
            </div>
          </div>
        </div>
      </div>
      {cursor && <Cursor {...cursor} />}
    </div>
  );
};
