// wd004 S03 prop — hourglass, clay road strip, sign board, handset icon, X badge, DOM screens (tablet mockup, laptop 4-steps, call)
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat } from "../../kit/Clay";
import { slabGeo, roundedCylGeo, latheGeo } from "../../kit/Geo";
import { SoftPanel } from "../../kit/Soft";
import { StatusBar } from "../../kit/Device";
import { C } from "../../kit/theme";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);
const q = (x: number, n = 40) => Math.round(Math.max(0, Math.min(1, x)) * n) / n;

// ---------- Hourglass (cream posts, navy caps, glass bulbs, orange sand) — height ≈ 2.2, base y = 0 ----------
const HG = { half: 0.9, capH: 0.18, capR: 0.66 };
/** bulb-এর ভেতরের radius (|y| ≤ half) */
const bulbR = (y: number) => {
  const u = Math.min(1, Math.abs(y) / HG.half);
  return 0.07 + 0.43 * Math.sin(Math.PI * Math.min(1, u * 0.86 + 0.04));
};
const SAND = "#F08A2A";
export const Hourglass: React.FC<P & { top: number; bottom: number; stream?: boolean }> = ({ top, bottom, stream = true, ...p }) => {
  const cap = useMemo(() => roundedCylGeo(HG.capR, HG.capH, 0.08), []);
  const glass = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const y = -HG.half + (i / 24) * HG.half * 2;
      pts.push([bulbR(y) + 0.035, y]);
    }
    return latheGeo(pts, 64, 96);
  }, []);
  const tq = q(top),
    bq = q(bottom);
  // উপরের বালি: গলা থেকে level পর্যন্ত, উপরের তল সামান্য ডুবানো
  const topGeo = useMemo(() => {
    if (tq < 0.02) return null;
    const lvl = 0.05 + tq * (HG.half * 0.78);
    const pts: [number, number][] = [[0.0001, 0.05]];
    for (let i = 0; i <= 10; i++) {
      const y = 0.05 + (i / 10) * (lvl - 0.05);
      pts.push([bulbR(y) * 0.93, y]);
    }
    pts.push([bulbR(lvl) * 0.5, lvl - 0.03]);
    pts.push([0.0001, lvl - 0.06]);
    return latheGeo(pts, 48, 48);
  }, [tq]);
  // নিচের বালি: স্তূপ (cone-এর মতো নরম চূড়া)
  const botGeo = useMemo(() => {
    if (bq < 0.02) return null;
    const base = -HG.half + 0.02;
    const lvl = base + bq * (HG.half * 0.55);
    const pts: [number, number][] = [[0.0001, base]];
    for (let i = 0; i <= 8; i++) {
      const y = base + (i / 8) * (lvl - base);
      pts.push([bulbR(y) * 0.93, y]);
    }
    pts.push([bulbR(lvl) * 0.55, lvl + 0.08 + bq * 0.1]);
    pts.push([0.0001, lvl + 0.14 + bq * 0.14]);
    return latheGeo(pts, 48, 48);
  }, [bq]);
  const yMid = HG.capH + HG.half;
  const pileTop = -HG.half + 0.02 + bq * (HG.half * 0.55) + 0.14 + bq * 0.14;
  const sandMat = <meshPhysicalMaterial color={SAND} roughness={0.62} sheen={0.4} sheenColor="#ffd7a8" />;
  return (
    <G {...p}>
      <mesh geometry={cap} position={[0, HG.capH / 2, 0]} castShadow receiveShadow>
        <ClayMat color={C.navy} rough={0.55} />
      </mesh>
      <mesh geometry={cap} position={[0, HG.capH * 1.5 + HG.half * 2, 0]} castShadow receiveShadow>
        <ClayMat color={C.navy} rough={0.55} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.56, yMid, Math.sin(a) * 0.56]} castShadow>
            <capsuleGeometry args={[0.055, HG.half * 2 - 0.02, 8, 20]} />
            <ClayMat color={C.clay} rough={0.6} />
          </mesh>
        );
      })}
      <group position={[0, yMid, 0]}>
        {topGeo && (
          <mesh geometry={topGeo} castShadow>
            {sandMat}
          </mesh>
        )}
        {botGeo && (
          <mesh geometry={botGeo} castShadow>
            {sandMat}
          </mesh>
        )}
        {stream && tq > 0.03 && (
          <mesh position={[0, (0.05 + pileTop) / 2, 0]}>
            <cylinderGeometry args={[0.018, 0.018, Math.max(0.01, 0.05 - pileTop), 12]} />
            {sandMat}
          </mesh>
        )}
        <mesh geometry={glass} renderOrder={5}>
          <meshPhysicalMaterial color="#f4f8ff" roughness={0.06} metalness={0} clearcoat={1} clearcoatRoughness={0.05} transparent opacity={0.26} depthWrite={false} envMapIntensity={1.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </G>
  );
};
export const HOURGLASS_H = HG.capH * 2 + HG.half * 2;

// ---------- নরম clay রাস্তা: floor-এ শোয়ানো pill strip (a → b, xz) ----------
export const RoadStrip: React.FC<{ a: [number, number]; b: [number, number]; y: number; w?: number; color?: string; k?: number; lift?: number }> = ({ a, b, y, w = 0.9, color = "#E9E2D8", k = 1, lift = 0 }) => {
  const dx = b[0] - a[0],
    dz = b[1] - a[1];
  const full = Math.hypot(dx, dz);
  const L = Math.max(w, full * q(k, 60));
  const geo = useMemo(() => slabGeo(w, L, 0.1, w / 2, 0.04, 5), [w, L]);
  if (k <= 0.001) return null;
  const yaw = Math.atan2(dx, dz); // +z দিকে 0
  const ux = dx / full,
    uz = dz / full;
  const c: [number, number, number] = [a[0] + ux * (L / 2 - w / 2), y + 0.05 + lift, a[1] + uz * (L / 2 - w / 2)];
  return (
    <group position={c} rotation={[0, yaw, 0]}>
      <mesh geometry={geo} rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <ClayMat color={color} rough={0.66} bump={0.2} />
      </mesh>
    </group>
  );
};

// ---------- টেলিফোন handset (torus arc + দুই মাথা) — প্রস্থ ≈ 1 ----------
export const Handset: React.FC<P & { color?: string }> = ({ color = "#ffffff", ...p }) => {
  const m = <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.5} clearcoatRoughness={0.3} />;
  // classic icon: earpiece উপর-বামে, mouthpiece নিচ-ডানে, বাঁক নিচ-বামে
  const R = 0.44, a0 = (160 / 180) * Math.PI, a1 = (290 / 180) * Math.PI;
  return (
    <G {...p}>
      <group position={[0.2, 0.2, 0]}>
        <mesh rotation={[0, 0, a0]} castShadow>
          <torusGeometry args={[R, 0.1, 20, 48, a1 - a0]} />
          {m}
        </mesh>
        {[a0 + 0.12, a1 - 0.12].map((ang, i) => (
          <mesh key={i} position={[Math.cos(ang) * (R - 0.04), Math.sin(ang) * (R - 0.04), 0]} rotation={[0, 0, ang - Math.PI / 2]} scale={[1.25, 1, 0.75]} castShadow>
            <capsuleGeometry args={[0.13, 0.12, 8, 20]} />
            {m}
          </mesh>
        ))}
      </group>
    </G>
  );
};

// ---------- গোল X badge (বন্ধ পথ) — ব্যাস 1 ----------
export const XBadge: React.FC<P & { color?: string }> = ({ color = "#8D97A3", ...p }) => {
  const g = useMemo(() => roundedCylGeo(0.5, 0.22, 0.1), []);
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.3} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0, 0.12]} rotation={[0, 0, (s * Math.PI) / 4]}>
          <capsuleGeometry args={[0.05, 0.44, 8, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
      ))}
    </G>
  );
};

// ---------- খুঁটির উপর board (post + পুরু SoftPanel) — base y = 0 ----------
export const SignBoard: React.FC<P & { w: number; h: number; post: number; color?: string; children?: React.ReactNode }> = ({ w, h, post, color = "#F6F1EA", children, ...p }) => {
  const foot = useMemo(() => roundedCylGeo(0.34, 0.12, 0.05), []);
  return (
    <G {...p}>
      <mesh geometry={foot} position={[0, 0.06, 0]} castShadow receiveShadow>
        <ClayMat color={C.clayShade} />
      </mesh>
      <mesh position={[0, post / 2 + 0.05, -0.05]} castShadow>
        <capsuleGeometry args={[0.08, post, 8, 16]} />
        <SilverMat color="#d7dbe0" rough={0.5} />
      </mesh>
      <SoftPanel position={[0, post + h / 2, 0]} w={w} h={h} color={color}>
        {children}
      </SoftPanel>
    </G>
  );
};

// =================== DOM screens ===================
const ui = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";

/** ছোট ফোনে outgoing call — বড় type, সবুজ call button */
export const CallScreen: React.FC<{ secs: number }> = ({ secs }) => (
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(175deg,#2B3F5C 0%,#1B2A40 100%)", fontFamily: ui, color: "#fff" }}>
    <StatusBar dark time="" />
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ width: 150, height: 150, borderRadius: 75, background: "#3E6E9E", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 800 }}>DS</div>
      <div style={{ fontSize: 44, fontWeight: 800, marginTop: 30, lineHeight: 1.1 }}>Dental Chamber</div>
      <div style={{ fontSize: 32, opacity: 0.8, marginTop: 14 }}>calling{".".repeat(1 + (Math.floor(secs * 2) % 3))}</div>
    </div>
    <div style={{ position: "absolute", bottom: 110, left: "50%", transform: "translateX(-50%)", width: 120, height: 120, borderRadius: 60, background: "#E5484D", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="58" height="58" viewBox="0 0 24 24" fill="#fff" style={{ transform: "rotate(135deg)" }}>
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
      </svg>
    </div>
  </div>
);

/** tablet (1024×700) — চেম্বারের site-এর design mockup; approved হলে সবুজ banner */
export const MockupScreen: React.FC<{ reveal: number; approved: number }> = ({ reveal, approved }) => {
  const r = Math.max(0, Math.min(1, reveal));
  const sec = (i: number) => {
    const k = Math.max(0, Math.min(1, r * 4 - i));
    return { opacity: k, transform: `translateY(${(1 - k) * 26}px)` };
  };
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FBF8F4", fontFamily: ui, color: "#13253C" }}>
      <div style={{ height: 92, display: "flex", alignItems: "center", padding: "0 44px", borderBottom: "2px solid #EEE6DC", ...sec(0) }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "#1B4470", marginRight: 16 }} />
        <div style={{ fontWeight: 800, fontSize: 34 }}>Dr. Shirin Dental</div>
        <div style={{ marginLeft: "auto", fontSize: 26, fontWeight: 700, color: "#D85E24" }}>DESIGN MOCKUP</div>
      </div>
      <div style={{ display: "flex", padding: "44px 44px 0", gap: 36 }}>
        <div style={{ flex: 1.15, ...sec(1) }}>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.05 }}>Gentle dental care in Sylhet</div>
          <div style={{ display: "inline-block", marginTop: 34, background: "#F5952B", color: "#fff", fontWeight: 800, fontSize: 30, padding: "18px 34px", borderRadius: 18 }}>Book Serial</div>
        </div>
        <div style={{ flex: 0.85, height: 290, borderRadius: 28, background: "linear-gradient(150deg,#DCE8F3,#BFD3E6)", position: "relative", ...sec(2) }}>
          <div style={{ position: "absolute", left: 46, top: 50, width: 160, height: 160, borderRadius: 80, background: "#fff", opacity: 0.85 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, padding: "38px 44px 0", ...sec(3) }}>
        {["Treatments", "Fees", "Serial"].map((x) => (
          <div key={x} style={{ flex: 1, background: "#fff", borderRadius: 20, padding: "22px 24px", fontWeight: 800, fontSize: 30, boxShadow: "0 4px 14px rgba(20,40,70,0.07)" }}>
            {x}
          </div>
        ))}
      </div>
      {approved > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 96, background: "#1F9D55", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontSize: 40, fontWeight: 800, transform: `translateY(${(1 - approved) * 100}%)` }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
          Design approved
        </div>
      )}
    </div>
  );
};

/** laptop (1024×641) — javeditsolution.com/services/website-development: 4 steps */
export const StepsPage: React.FC<{ url: string; caret: boolean; lit: number[]; tick: number[]; reveal: number }> = ({ url, caret, lit, tick, reveal }) => {
  const steps = ["Discuss", "Design", "Develop", "Launch"];
  const r = Math.max(0, Math.min(1, reveal));
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FBF8F4", fontFamily: ui, color: "#13253C" }}>
      {/* browser bar */}
      <div style={{ height: 96, background: "#EEE7DD", display: "flex", alignItems: "center", padding: "0 26px", gap: 12 }}>
        {[C.deepOrange, C.orange, C.steel].map((c) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
        ))}
        <div style={{ flex: 1, marginLeft: 14, height: 62, borderRadius: 31, background: "#fff", display: "flex", alignItems: "center", padding: "0 26px", fontSize: 29, fontWeight: 700, color: "#1B2A3D", whiteSpace: "nowrap", overflow: "hidden" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F9D55" strokeWidth="2.6" style={{ marginRight: 12, flex: "none" }}>
            <rect x="5" y="11" width="14" height="10" rx="2.5" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          {url}
          <span style={{ opacity: caret ? 1 : 0, color: C.orange, marginLeft: 2 }}>|</span>
        </div>
      </div>
      <div style={{ padding: "34px 44px 0", opacity: r, transform: `translateY(${(1 - r) * 20}px)` }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.deepOrange, letterSpacing: 1.5 }}>WEBSITE DEVELOPMENT</div>
        <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.05, marginTop: 8 }}>How we work: 4 steps</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 30 }}>
          {steps.map((s, i) => {
            const k = Math.max(0, Math.min(1, lit[i] ?? 0));
            const bg = `rgba(245,149,43,${0.08 + 0.92 * k})`;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 20, background: k > 0.02 ? bg : "#F1ECE5", borderRadius: 24, padding: "20px 24px", transform: `scale(${0.96 + 0.04 * k})`, boxShadow: k > 0.5 ? "0 8px 22px rgba(216,94,36,0.22)" : "none" }}>
                <div style={{ width: 72, height: 72, borderRadius: 36, background: k > 0.5 ? "#fff" : "#1B4470", color: k > 0.5 ? C.deepOrange : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800, flex: "none" }}>{i + 1}</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: k > 0.5 ? "#fff" : "#13253C" }}>{s}</div>
                {(tick[i] ?? 0) > 0 && (
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto", transform: `scale(${tick[i]})` }}>
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

