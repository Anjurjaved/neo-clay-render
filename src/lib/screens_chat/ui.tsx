// screens_chat shared DOM helpers — font stack, বাংলা সংখ্যা (Sabbir Sorolota), inline SVG icon, avatar
import React from "react";

/** Latin = system (SF), বাংলা অক্ষর = Hind Siliguri (per-glyph fallback) */
export const UI = "-apple-system, 'SF Pro Text', 'Helvetica Neue', 'Hind Siliguri', sans-serif";
export const BN = "'Hind Siliguri', -apple-system, sans-serif";
const NUM = "'Sabbir Sorolota', 'Hind Siliguri', sans-serif";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-6, b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
/** DOM-এর জন্য সাধারণ spring 0→1 (overshoot সহ) */
export const sprK = (u: number, k = 180, c = 14) => {
  if (u <= 0) return 0;
  const w0 = Math.sqrt(k),
    z = c / (2 * Math.sqrt(k));
  const wd = w0 * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w0 * u) * (Math.cos(wd * u) + ((z * w0) / wd) * Math.sin(wd * u));
};

/** বাংলা লেখার ভেতরের বাংলা সংখ্যা আলাদা span-এ Sabbir Sorolota font-এ */
export const Bn: React.FC<{ children: string; style?: React.CSSProperties }> = ({ children, style }) => {
  const parts = children.split(/([০-৯]+(?:[:.,][০-৯]+)*)/);
  return (
    <span style={{ fontFamily: BN, ...style }}>
      {parts.map((p, i) =>
        /^[০-৯]/.test(p) ? (
          <span key={i} style={{ fontFamily: NUM }}>
            {p}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </span>
  );
};

type IP = { size?: number; color?: string; style?: React.CSSProperties; stroke?: number };
const S: React.FC<IP & { children: React.ReactNode; fill?: boolean }> = ({ size = 24, color = "#000", style, stroke = 2, children, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "none", display: "block", ...style }} fill={fill ? color : "none"} stroke={fill ? "none" : color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const I = {
  back: (p: IP) => (
    <S {...p}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </S>
  ),
  chevL: (p: IP) => (
    <S {...p}>
      <path d="M15 4l-8 8 8 8" />
    </S>
  ),
  video: (p: IP) => (
    <S {...p}>
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="M15.5 10.5l6-3.5v10l-6-3.5" />
    </S>
  ),
  phone: (p: IP) => (
    <S {...p} fill>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </S>
  ),
  more: (p: IP) => (
    <S {...p} fill>
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </S>
  ),
  smile: (p: IP) => (
    <S {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14.5c1 1.3 2.3 2 4 2s3-.7 4-2" />
      <circle cx="9" cy="9.8" r=".6" fill={p.color} />
      <circle cx="15" cy="9.8" r=".6" fill={p.color} />
    </S>
  ),
  clip: (p: IP) => (
    <S {...p}>
      <path d="M20.5 11.5l-8.2 8.2a5 5 0 0 1-7-7l8.8-8.8a3.3 3.3 0 0 1 4.7 4.7l-8.8 8.8a1.7 1.7 0 0 1-2.4-2.4l8-8" />
    </S>
  ),
  camera: (p: IP) => (
    <S {...p}>
      <path d="M4 8h3l1.6-2.4h6.8L17 8h3a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9.5A1.5 1.5 0 0 1 4 8z" />
      <circle cx="12" cy="13.3" r="3.6" />
    </S>
  ),
  mic: (p: IP) => (
    <S {...p} fill>
      <path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V5.5a3.5 3.5 0 0 0-7 0V11a3.5 3.5 0 0 0 3.5 3.5zm6-3.5a.9.9 0 0 0-1.8 0 4.2 4.2 0 0 1-8.4 0 .9.9 0 0 0-1.8 0 6 6 0 0 0 5.1 5.9V20H9a.9.9 0 0 0 0 1.8h6a.9.9 0 0 0 0-1.8h-2.1v-3.1A6 6 0 0 0 18 11z" />
    </S>
  ),
  send: (p: IP) => (
    <S {...p} fill>
      <path d="M3.4 20.4l17.5-7.5a1 1 0 0 0 0-1.8L3.4 3.6a.8.8 0 0 0-1.1.9L4 10.6l9 1.4-9 1.4-1.7 6.1a.8.8 0 0 0 1.1.9z" />
    </S>
  ),
  play: (p: IP) => (
    <S {...p} fill>
      <path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" />
    </S>
  ),
  pause: (p: IP) => (
    <S {...p} fill>
      <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
    </S>
  ),
  search: (p: IP) => (
    <S {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </S>
  ),
  menu: (p: IP) => (
    <S {...p}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
    </S>
  ),
  star: (p: IP & { on?: boolean }) => (
    <S {...p} fill={p.on}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" />
    </S>
  ),
  pencil: (p: IP) => (
    <S {...p}>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3zM14.5 7.5l2 2" />
    </S>
  ),
  archive: (p: IP) => (
    <S {...p}>
      <rect x="3" y="4" width="18" height="5" rx="1.2" />
      <path d="M5 9v9.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4" />
    </S>
  ),
  trash: (p: IP) => (
    <S {...p}>
      <path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13M10 11v5M14 11v5" />
    </S>
  ),
  mail: (p: IP) => (
    <S {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5L12 13l8.5-6.5" />
    </S>
  ),
  reply: (p: IP) => (
    <S {...p}>
      <path d="M9.5 6L4 11.5 9.5 17M4.5 11.5H14a6 6 0 0 1 6 6V19" />
    </S>
  ),
  forward: (p: IP) => (
    <S {...p}>
      <path d="M14.5 6l5.5 5.5-5.5 5.5M19.5 11.5H10a6 6 0 0 0-6 6V19" />
    </S>
  ),
  plusCircle: (p: IP) => (
    <S {...p} fill>
      <path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm4.5 10.4h-3.6v3.6a.9.9 0 0 1-1.8 0v-3.6H7.5a.9.9 0 0 1 0-1.8h3.6V7.5a.9.9 0 0 1 1.8 0v3.6h3.6a.9.9 0 0 1 0 1.8z" />
    </S>
  ),
  image: (p: IP) => (
    <S {...p}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="9.5" r="1.8" />
      <path d="M3.5 17l5-5 4 4 2.5-2.5L20.5 19" />
    </S>
  ),
  thumb: (p: IP) => (
    <S {...p} fill>
      <path d="M2.5 10.5h3v10h-3zM7.5 20.5V10.3l4.3-7a1.6 1.6 0 0 1 2.9 1.2L13.6 9H19a2 2 0 0 1 2 2.3l-1.2 7.4a2.2 2.2 0 0 1-2.2 1.8z" />
    </S>
  ),
  backspace: (p: IP) => (
    <S {...p}>
      <path d="M8 5h12a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 20 19H8l-6-7z" />
      <path d="M11.5 9.5l5 5M16.5 9.5l-5 5" />
    </S>
  ),
  micOff: (p: IP) => (
    <S {...p}>
      <path d="M3 3l18 18M9 9v2a3 3 0 0 0 5 2.2M15 10V5.5a3 3 0 0 0-5.8-1M18 11a6 6 0 0 1-1 3.2M6 11a6 6 0 0 0 9.5 4.9M12 17v3.5" />
    </S>
  ),
  dialpad: (p: IP) => (
    <S {...p} fill>
      {[5, 12, 19].map((x) => [4.5, 10, 15.5].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.9" />))}
      <circle cx="12" cy="21" r="1.9" />
    </S>
  ),
  speaker: (p: IP) => (
    <S {...p}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </S>
  ),
  addUser: (p: IP) => (
    <S {...p}>
      <circle cx="9.5" cy="8" r="3.8" />
      <path d="M2.5 20a7 7 0 0 1 14 0M19 8v6M16 11h6" />
    </S>
  ),
  holdPause: (p: IP) => (
    <S {...p}>
      <path d="M9 5.5v13M15 5.5v13" />
    </S>
  ),
  clock: (p: IP) => (
    <S {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </S>
  ),
  star2: (p: IP) => (
    <S {...p}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" />
    </S>
  ),
  users: (p: IP) => (
    <S {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.2a6.5 6.5 0 0 1 3 5.3" />
    </S>
  ),
  lock: (p: IP) => (
    <S {...p}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </S>
  ),
  flash: (p: IP) => (
    <S {...p}>
      <path d="M8 2.5h8v4l-2 3v11.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9.5l-2-3z" />
      <path d="M12 13v2.5" />
    </S>
  ),
  bag: (p: IP) => (
    <S {...p}>
      <path d="M5 8h14l-1 12.5H6z" />
      <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
    </S>
  ),
  chat: (p: IP) => (
    <S {...p} fill>
      <path d="M12 3C6.8 3 2.7 6.7 2.7 11.2c0 2.6 1.3 4.8 3.4 6.3L5.4 21l3.9-2.1c.9.2 1.8.4 2.7.4 5.2 0 9.3-3.7 9.3-8.1S17.2 3 12 3z" />
    </S>
  ),
  missed: (p: IP) => (
    <S {...p}>
      <path d="M3 7l6 6 4-4 6 6M19 10v5h-5" />
    </S>
  ),
  pdf: (p: IP) => (
    <S {...p}>
      <path d="M6 2.5h8.5L19 7v14.5H6z" />
      <path d="M14 2.5V7.5h5" />
    </S>
  ),
  check: (p: IP) => (
    <S {...p}>
      <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />
    </S>
  ),
  shield: (p: IP) => (
    <S {...p}>
      <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z" />
    </S>
  ),
};

/** message tick: 0 = clock (pending), 1 = single grey, 2 = double grey, 3 = double blue */
export const Ticks: React.FC<{ state: number; blue?: string; grey?: string; size?: number }> = ({ state, blue = "#53BDEB", grey = "#8696A0", size = 18 }) => {
  if (state <= 0)
    return (
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 16 16" style={{ display: "block" }}>
        <circle cx="8" cy="8" r="6" fill="none" stroke={grey} strokeWidth="1.6" />
        <path d="M8 4.6V8l2.2 1.4" fill="none" stroke={grey} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  const c = state >= 3 ? blue : grey;
  return (
    <svg width={size * 1.1} height={size * 0.75} viewBox="0 0 22 15" style={{ display: "block" }}>
      {state >= 2 && <path d="M7.2 8.2l3.6 3.6L20 2.6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      <path d={state >= 2 ? "M1.6 8.2l3.6 3.6 1.4-1.4M14.6 2.6l-4 4" : "M4 8.2l3.6 3.6L16.8 2.6"} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** initials avatar (gradient disc) — আসল app-এর letter avatar */
export const Avatar: React.FC<{ size: number; text: string; bg: string; bg2?: string; color?: string; style?: React.CSSProperties; fontSize?: number }> = ({ size, text, bg, bg2, color = "#fff", style, fontSize }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      flex: "none",
      background: bg2 ? `linear-gradient(145deg, ${bg} 0%, ${bg2} 100%)` : bg,
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: fontSize ?? size * 0.4,
      fontFamily: UI,
      letterSpacing: 0.2,
      ...style,
    }}
  >
    {text}
  </div>
);

/** typing dots (clock = seconds, শুধু phase-এর জন্য) */
export const Dots: React.FC<{ clock: number; color?: string; size?: number; gap?: number }> = ({ clock, color = "#8696A0", size = 9, gap = 5 }) => (
  <div style={{ display: "flex", gap, alignItems: "center", height: size * 2.2 }}>
    {[0, 1, 2].map((i) => {
      const ph = (clock * 2.6 - i * 0.18) % 1;
      const k = ph < 0 ? 0 : Math.max(0, Math.sin(Math.min(1, ph / 0.55) * Math.PI));
      return <div key={i} style={{ width: size, height: size, borderRadius: size, background: color, opacity: 0.45 + 0.55 * k, transform: `translateY(${-k * size * 0.45}px)` }} />;
    })}
  </div>
);

/** Android gesture bar / iOS home indicator */
export const HomeBar: React.FC<{ dark?: boolean; bottom?: number }> = ({ dark = false, bottom = 9 }) => (
  <div style={{ position: "absolute", bottom, left: "50%", transform: "translateX(-50%)", width: 134, height: 5, borderRadius: 3, background: dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.82)", zIndex: 60 }} />
);

/** message appear wrapper: k 0→1 উচ্চতা খোলে (পুরোনোগুলো উপরে ঠেলে) + bubble pop */
export const Arrive: React.FC<{ k: number; from: "left" | "right" | "center"; maxH?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ k, from, maxH = 260, children, style }) => {
  if (k <= 0) return null;
  const h = easeOut(Math.min(1, k * 1.6));
  const pop = sprK(k * 0.9, 200, 15);
  const origin = from === "left" ? "0% 100%" : from === "right" ? "100% 100%" : "50% 50%";
  return (
    <div style={{ maxHeight: k >= 1 ? undefined : h * maxH, overflow: k >= 1 ? undefined : "hidden", flex: "none", ...style }}>
      <div style={{ transform: `scale(${0.6 + 0.4 * pop})`, transformOrigin: origin, opacity: Math.min(1, k * 3) }}>{children}</div>
    </div>
  );
};
