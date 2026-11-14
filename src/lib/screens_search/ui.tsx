// screens_search — shared: icons (inline SVG), rich text with streaming, Bangla numerals, device showcase rig
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage, Cam } from "../../kit/Stage";
import { Phone, phoneScreen, Tablet, tabletScreen, TABLET, PhoneKind } from "../../kit/Device";
import { popIn, springStep, wobble, drift } from "../../kit/anim";
import { FPS } from "../../kit/time";

// regular weights matter for realism: Inter is loaded only at 700/800, so body text uses system faces
export const SANS = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
export const GSANS = "Arial, 'Helvetica Neue', Helvetica, sans-serif"; // Google renders in Arial/Roboto
export const BN = "'Hind Siliguri', Inter, sans-serif";
export const NUM = "'Sabbir Sorolota', 'Hind Siliguri', sans-serif";
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const rng = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const k = clamp01(x);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};

/* ---------- typing with human cadence (stable per char) ---------- */
export const typeN = (text: string, t: number, t0: number, t1: number) => {
  if (t <= t0) return 0;
  if (t >= t1) return text.length;
  const ws = [...text].map((ch, i) => {
    const h = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return (ch === " " ? 1.7 : 1) * (0.65 + (h - Math.floor(h)) * 0.7);
  });
  const tot = ws.reduce((a, b) => a + b, 0);
  const k = (t - t0) / (t1 - t0);
  let acc = 0,
    n = 0;
  for (const w of ws) {
    acc += w;
    if (acc / tot <= k) n++;
    else break;
  }
  return n;
};
export const caretOn = (t: number) => Math.floor(t * 2.4) % 2 === 0;

/* ---------- Rich text: segments + char budget (streaming) ---------- */
export type Seg = { t: string; b?: boolean; mark?: boolean; num?: boolean; c?: string; bn?: boolean };
export const segLen = (s: Seg[]) => s.reduce((a, x) => a + [...x.t].length, 0);
/** Bengali digits (০-৯) automatically get Sabbir Sorolota */
const splitNums = (s: string) => s.split(/([০-৯][০-৯,.]*)/g).filter(Boolean);
export const Rich: React.FC<{ segs: Seg[]; budget?: number; markK?: number; markColor?: string; cursor?: boolean }> = ({ segs, budget = 1e9, markK = 1, markColor = "rgba(245,149,43,0.32)", cursor }) => {
  let left = budget;
  const out: React.ReactNode[] = [];
  segs.forEach((s, i) => {
    if (left <= 0) return;
    const chars = [...s.t];
    const txt = chars.slice(0, Math.max(0, left)).join("");
    left -= chars.length;
    const st: React.CSSProperties = { fontWeight: s.b ? 700 : undefined, color: s.c };
    if (s.mark)
      Object.assign(st, {
        backgroundImage: `linear-gradient(${markColor}, ${markColor})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${markK * 100}% 100%`,
        borderRadius: 4,
        padding: "0 2px",
        margin: "0 -2px",
      });
    out.push(
      <span key={i} style={st}>
        {splitNums(txt).map((p, j) =>
          /^[০-৯]/.test(p) ? (
            <span key={j} style={{ fontFamily: NUM, fontWeight: 400 }}>
              {p}
            </span>
          ) : (
            <React.Fragment key={j}>{p}</React.Fragment>
          )
        )}
      </span>
    );
  });
  if (cursor && budget < segLen(segs))
    out.push(<span key="cur" style={{ display: "inline-block", width: 13, height: 13, borderRadius: 7, background: "#0d0d0d", marginLeft: 4, verticalAlign: "middle" }} />);
  return <>{out}</>;
};
/** plain string with Bengali numerals in Sabbir Sorolota */
export const Bn: React.FC<{ children: string }> = ({ children }) => <Rich segs={[{ t: children }]} />;

/* ---------- icons ---------- */
type IP = { s?: number; c?: string; w?: number };
export const IcSearch: React.FC<IP> = ({ s = 22, c = "#5f6368", w = 2.2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <circle cx="10.2" cy="10.2" r="6.4" stroke={c} strokeWidth={w} />
    <path d="M15 15l5.2 5.2" stroke={c} strokeWidth={w} strokeLinecap="round" />
  </svg>
);
export const IcMic: React.FC<{ s?: number; mono?: string }> = ({ s = 22, mono }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <rect x="8.6" y="2.6" width="6.8" height="11.6" rx="3.4" fill={mono ?? "#4285F4"} />
    <path d="M5.4 11a6.6 6.6 0 0 0 13.2 0" stroke={mono ?? "#34A853"} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 17.6v3.6" stroke={mono ?? "#FBBC04"} strokeWidth="2" strokeLinecap="round" />
    {!mono && <path d="M5.4 11a6.6 6.6 0 0 0 3.2 5.6" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />}
  </svg>
);
export const IcLens: React.FC<{ s?: number }> = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d="M3.5 9V6.5a3 3 0 0 1 3-3H9" stroke="#4285F4" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M15 3.5h2.5a3 3 0 0 1 3 3V9" stroke="#EA4335" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M3.5 15v2.5a3 3 0 0 0 3 3H9" stroke="#34A853" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3.6" fill="#4285F4" />
    <circle cx="18" cy="18" r="2.2" fill="#FBBC04" />
  </svg>
);
export const IcX: React.FC<IP> = ({ s = 20, c = "#5f6368", w = 2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth={w} strokeLinecap="round" />
  </svg>
);
export const IcBack: React.FC<IP> = ({ s = 24, c = "#1f1f1f", w = 2.2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d="M20 12H5m6-7-7 7 7 7" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IcFwd: React.FC<IP> = ({ s = 24, c = "#1f1f1f", w = 2.2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d="M4 12h15m-6-7 7 7-7 7" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IcReload: React.FC<IP> = ({ s = 22, c = "#474747", w = 2.2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" stroke={c} strokeWidth={w} strokeLinecap="round" />
    <path d="M19.8 3.8v4.6h-4.6" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IcDots: React.FC<IP & { h?: boolean }> = ({ s = 22, c = "#5f6368", h }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    {(h ? [[5, 12], [12, 12], [19, 12]] : [[12, 5], [12, 12], [12, 19]]).map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="2" />
    ))}
  </svg>
);
export const IcMenu: React.FC<IP> = ({ s = 24, c = "#444746", w = 2.2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" stroke={c} strokeWidth={w} strokeLinecap="round" />
  </svg>
);
export const IcApps: React.FC<IP> = ({ s = 22, c = "#5f6368" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    {[5, 12, 19].flatMap((x) => [5, 12, 19].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.1" />))}
  </svg>
);
const STAR = "M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5L2.6 9.4l6.5-.8z";
/** partial star without SVG ids (gradients with ids break under repeated DOM) */
export const IcStar: React.FC<{ s?: number; fill?: number; c?: string }> = ({ s = 14, fill = 1, c = "#FBBC04" }) => (
  <span style={{ position: "relative", display: "inline-block", width: s, height: s }}>
    <svg width={s} height={s} viewBox="0 0 24 24" style={{ position: "absolute", left: 0, top: 0 }}>
      <path d={STAR} fill="#dadce0" />
    </svg>
    <span style={{ position: "absolute", left: 0, top: 0, width: s * fill, height: s, overflow: "hidden" }}>
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d={STAR} fill={c} />
      </svg>
    </span>
  </span>
);
export const Stars: React.FC<{ v: number; s?: number; gap?: number }> = ({ v, s = 14, gap = 1 }) => (
  <span style={{ display: "inline-flex", gap, verticalAlign: "-2px" }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <IcStar key={i} s={s} fill={clamp01(v - i)} />
    ))}
  </span>
);
export const IcPhone: React.FC<IP> = ({ s = 20, c = "#0B57D0" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
  </svg>
);
export const IcDirections: React.FC<IP> = ({ s = 20, c = "#fff" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M12.7 2.3l9 9a1 1 0 0 1 0 1.4l-9 9a1 1 0 0 1-1.4 0l-9-9a1 1 0 0 1 0-1.4l9-9a1 1 0 0 1 1.4 0z" fill={c} />
    <path d="M9 15.5v-3a1.5 1.5 0 0 1 1.5-1.5H15m-2-2.4L15.5 11 13 13.4" stroke={c === "#fff" ? "#0B57D0" : "#fff"} strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IcGlobe: React.FC<IP> = ({ s = 20, c = "#0B57D0", w = 1.9 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" />
  </svg>
);
export const IcBookmark: React.FC<IP> = ({ s = 20, c = "#0B57D0", w = 1.9 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round">
    <path d="M6.5 3.5h11v17L12 16.6l-5.5 3.9z" />
  </svg>
);
export const IcShare: React.FC<IP> = ({ s = 20, c = "#0B57D0", w = 1.9 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
    <circle cx="18" cy="5.5" r="2.6" />
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="18" cy="18.5" r="2.6" />
    <path d="M8.4 10.8l7.3-4M8.4 13.2l7.3 4" />
  </svg>
);
export const IcPin: React.FC<IP> = ({ s = 20, c = "#0B57D0" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9">
    <path d="M12 21.5s-6.8-6.4-6.8-11.6a6.8 6.8 0 0 1 13.6 0C18.8 15.1 12 21.5 12 21.5z" />
    <circle cx="12" cy="9.9" r="2.5" />
  </svg>
);
export const IcClock: React.FC<IP> = ({ s = 20, c = "#0B57D0" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.4 2" />
  </svg>
);
export const IcLock: React.FC<IP> = ({ s = 16, c = "#474747" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2">
    <rect x="5" y="10.5" width="14" height="10" rx="2.4" />
    <path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" />
  </svg>
);
export const IcTune: React.FC<IP> = ({ s = 18, c = "#474747" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.1" strokeLinecap="round">
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="9" cy="17" r="2.2" />
  </svg>
);
export const IcStarO: React.FC<IP> = ({ s = 20, c = "#474747" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinejoin="round">
    <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
  </svg>
);
export const IcPlus: React.FC<IP> = ({ s = 20, c = "#474747", w = 2.2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke={c} strokeWidth={w} strokeLinecap="round" />
  </svg>
);
export const IcHome: React.FC<IP> = ({ s = 22, c = "#444746" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round">
    <path d="M4 10.5L12 4l8 6.5V20h-5.2v-5.6H9.2V20H4z" />
  </svg>
);
export const IcSend: React.FC<IP> = ({ s = 20, c = "#fff" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5m-6 6 6-6 6 6" />
  </svg>
);
export const IcEdit: React.FC<IP> = ({ s = 22, c = "#0d0d0d" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    <path d="M17.6 3.6a2 2 0 0 1 2.8 2.8L12 14.8l-3.6.8.8-3.6z" />
  </svg>
);
export const IcCopy: React.FC<IP> = ({ s = 18, c = "#5d5d5d" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round">
    <rect x="8" y="8" width="12" height="12" rx="2.4" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
);
export const IcThumb: React.FC<IP & { down?: boolean }> = ({ s = 18, c = "#5d5d5d", down }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" style={down ? { transform: "rotate(180deg)" } : undefined}>
    <path d="M7 10.5v9.5H4.5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1zM7 10.5l4-7.2a2.2 2.2 0 0 1 2.9 2.7L13 9.5h5.8a2 2 0 0 1 2 2.4l-1.4 6.5A2 2 0 0 1 17.4 20H7" />
  </svg>
);
export const IcGear: React.FC<IP> = ({ s = 22, c = "#5f6368" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M5.5 18.5l1.9-1.9M16.6 7.4l1.9-1.9" strokeLinecap="round" />
  </svg>
);
export const IcSparkle: React.FC<IP> = ({ s = 18, c = "#5d5d5d" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5zM19 15.5c.3 2 1.3 3 3.3 3.3-2 .3-3 1.3-3.3 3.3-.3-2-1.3-3-3.3-3.3 2-.3 3-1.3 3.3-3.3z" />
  </svg>
);

/** favicon: letter disc in a brand-free colour */
export const Fav: React.FC<{ bg: string; ch: string; s?: number; fg?: string }> = ({ bg, ch, s = 28, fg = "#fff" }) => (
  <div style={{ width: s, height: s, borderRadius: s / 2, background: "#fff", border: "1px solid #dadce0", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
    <div style={{ width: s * 0.66, height: s * 0.66, borderRadius: s * 0.18, background: bg, color: fg, fontSize: s * 0.42, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>{ch}</div>
  </div>
);

/** iPhone home indicator */
export const HomeBar: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div style={{ position: "absolute", bottom: 9, left: "50%", transform: "translateX(-50%)", width: 136, height: 5, borderRadius: 3, background: dark ? "#fff" : "#111", zIndex: 60 }} />
);

/* ---------- showcase rig: one device floating 3/4, pop in, settle, idle ---------- */
export const SHOW_CAM: Cam = { pos: [0, 2.3, 21], target: [0, 0.75, 0], fov: 27 };
export const useT = () => useCurrentFrame() / FPS;

export const PhoneShow: React.FC<{ t: number; ui: React.ReactNode; kind?: PhoneKind; side?: 1 | -1 }> = ({ t, ui, kind = "iphone", side = 1 }) => {
  const p = popIn(t, 0.02, { k: 190, c: 15 });
  const turn = springStep(t - 0.05, { k: 70, c: 11 }); // swings from wide angle into 3/4 and settles (follow-through)
  const rotY = side * (-0.62 + 0.36 * turn) + 0.018 * Math.sin(t * 0.9);
  const lift = (1 - springStep(t - 0.02, { k: 120, c: 13 })) * -0.6;
  const S = 3.3;
  const ph = {
    position: [0.0, 1.22 + lift + 0.05 * drift(t, 1), 0] as [number, number, number],
    rotation: [-0.06 + 0.012 * drift(t, 3) + wobble(t - 0.3, 0.02, 1.6, 0.3), rotY, side * 0.02] as [number, number, number],
    scale: S * p.s,
  };
  return (
    <Stage cam={SHOW_CAM} screens={ph.scale > 0.01 ? [phoneScreen(ph, ui, { kind, opacity: clamp01(p.s * 1.6) })] : []} contact={0.42}>
      {ph.scale > 0.01 && <Phone {...ph} kind={kind} />}
    </Stage>
  );
};

/** landscape tablet (desktop-sized DOM 1024×700) */
export const TabletShow: React.FC<{ t: number; ui: React.ReactNode }> = ({ t, ui }) => {
  const p = popIn(t, 0.02, { k: 190, c: 15 });
  const turn = springStep(t - 0.05, { k: 70, c: 11 });
  const lift = (1 - springStep(t - 0.02, { k: 120, c: 13 })) * -0.5;
  const S = 2.2;
  const tb = {
    position: [0.0, 0.85 + lift + 0.04 * drift(t, 1), 0] as [number, number, number],
    rotation: [-0.1 + 0.01 * drift(t, 3) + wobble(t - 0.3, 0.015, 1.4, 0.3), -0.56 + 0.3 * turn + 0.012 * Math.sin(t * 0.9), 0.0] as [number, number, number],
    scale: S * p.s,
  };
  return (
    <Stage cam={SHOW_CAM} screens={tb.scale > 0.01 ? [tabletScreen(tb, ui, { opacity: clamp01(p.s * 1.6) })] : []} contact={0.42}>
      {tb.scale > 0.01 && <Tablet {...tb} />}
    </Stage>
  );
};
export const TAB_PX = { w: TABLET.sw, h: TABLET.sh };
