// wd004 S05 props — tool icons (wrench, update arrows, backup cloud, security shield), ToolTile, NamePlate, MapTile, BizCard,
// আর laptop-এর DOM screen (OnlineSite, CostPage)। সব bevelled (LESSONS E1)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt, GlowMat } from "../../kit/Clay";
import { slabGeo, pillGeo, shapeGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar, Inset, CheckBadge } from "../../kit/Soft";
import { C } from "../../kit/theme";
import { Tooth } from "../../web11/props";
import { DentalSite } from "../../web11/screens";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);
const Gloss: React.FC<{ color: string }> = ({ color }) => <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.6} clearcoatRoughness={0.28} sheen={0.3} sheenColor="#ffe2c4" />;

// ---------- Wrench (bug fix) — উচ্চতা ≈ 1 ----------
export const Wrench: React.FC<P & { color?: string }> = ({ color = C.steel, ...p }) => {
  const head = useMemo(() => {
    const R = 0.3, n = 0.085;
    const phi = Math.acos(n / R);
    const s = new THREE.Shape();
    s.moveTo(n, R * Math.sin(phi));
    s.lineTo(n, 0.06);
    s.quadraticCurveTo(n, 0.0, 0.0, 0.0);
    s.quadraticCurveTo(-n, 0.0, -n, 0.06);
    s.lineTo(-n, R * Math.sin(phi));
    s.absarc(0, 0, R, Math.PI - phi, phi + Math.PI * 2, false);
    const g = shapeGeo(s, 0.12, 0.05, 5);
    g.translate(0, 0, -0.06);
    return g;
  }, []);
  const handle = useMemo(() => pillGeo(0.2, 0.78, 0.2, 0.07), []);
  return (
    <G {...p}>
      <group rotation={[0, 0, -Math.PI / 4]}>
        <mesh geometry={head} position={[0, 0.32, 0]} castShadow>
          <Gloss color={color} />
        </mesh>
        <mesh geometry={handle} position={[0, -0.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <Gloss color={color} />
        </mesh>
        <mesh position={[0, -0.48, 0.11]}>
          <sphereGeometry args={[0.04, 16, 12]} />
          <ClayMat color="#ffffff" rough={0.5} />
        </mesh>
      </group>
    </G>
  );
};

// ---------- Update arrows (দুটো বাঁকা arrow, ঘূর্ণি) ----------
const arcArrow = (R1: number, R2: number, a0: number, a1: number) => {
  const s = new THREE.Shape();
  const m = (R1 + R2) / 2, hw = (R2 - R1) * 0.95;
  s.absarc(0, 0, R2, a0, a1, false);
  const hx = Math.cos(a1), hy = Math.sin(a1);
  s.lineTo(hx * (R2 + hw * 0.55), hy * (R2 + hw * 0.55));
  s.lineTo(Math.cos(a1 + 0.62) * m, Math.sin(a1 + 0.62) * m);
  s.lineTo(hx * (R1 - hw * 0.55), hy * (R1 - hw * 0.55));
  s.absarc(0, 0, R1, a1, a0, true);
  s.closePath();
  const g = shapeGeo(s, 0.12, 0.045, 4);
  g.translate(0, 0, -0.06);
  return g;
};
export const UpdateArrows: React.FC<P & { color?: string; spin?: number }> = ({ color = C.orange, spin = 0, ...p }) => {
  const g = useMemo(() => arcArrow(0.28, 0.42, 0.35, Math.PI - 0.55), []);
  return (
    <G {...p}>
      <group rotation={[0, 0, spin]}>
        <mesh geometry={g} castShadow>
          <Gloss color={color} />
        </mesh>
        <mesh geometry={g} rotation={[0, 0, Math.PI]} castShadow>
          <Gloss color={color} />
        </mesh>
      </group>
    </G>
  );
};

// ---------- Backup cloud + উপরের দিকে arrow ----------
export const BackupCloud: React.FC<P & { color?: string; arrow?: string }> = ({ color = "#EAF1F8", arrow = C.navy, ...p }) => {
  const arr = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.2);
    s.lineTo(0.15, 0.04);
    s.lineTo(0.055, 0.04);
    s.lineTo(0.055, -0.16);
    s.lineTo(-0.055, -0.16);
    s.lineTo(-0.055, 0.04);
    s.lineTo(-0.15, 0.04);
    s.closePath();
    return shapeGeo(s, 0.05, 0.022, 3);
  }, []);
  const m = <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.4} clearcoatRoughness={0.35} sheen={0.4} sheenColor="#ffffff" />;
  return (
    <G {...p}>
      {(
        [
          [-0.25, -0.04, 0.24],
          [0.03, 0.1, 0.32],
          [0.29, -0.05, 0.22],
        ] as [number, number, number][]
      ).map(([x, y, r], i) => (
        <mesh key={i} position={[x, y, 0]} castShadow>
          <sphereGeometry args={[r, 40, 28]} />
          {m}
        </mesh>
      ))}
      <mesh position={[0.02, -0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.17, 0.52, 10, 28]} />
        {m}
      </mesh>
      <mesh geometry={arr} position={[0.03, -0.02, 0.3]}>
        <Gloss color={arrow} />
      </mesh>
    </G>
  );
};

// ---------- Security shield + tick ----------
export const Shield: React.FC<P & { color?: string }> = ({ color = C.navy, ...p }) => {
  const g = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.44);
    s.quadraticCurveTo(0.18, 0.34, 0.36, 0.33);
    s.lineTo(0.36, 0.02);
    s.quadraticCurveTo(0.33, -0.28, 0, -0.46);
    s.quadraticCurveTo(-0.33, -0.28, -0.36, 0.02);
    s.lineTo(-0.36, 0.33);
    s.quadraticCurveTo(-0.18, 0.34, 0, 0.44);
    const geo = shapeGeo(s, 0.12, 0.06, 6);
    geo.translate(0, 0, -0.06);
    return geo;
  }, []);
  const tk = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.2, 0.0);
    s.lineTo(-0.07, -0.13);
    s.lineTo(0.21, 0.15);
    s.lineTo(0.16, 0.2);
    s.lineTo(-0.07, -0.03);
    s.lineTo(-0.15, -0.05);
    s.closePath();
    return shapeGeo(s, 0.03, 0.018, 3);
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <Gloss color={color} />
      </mesh>
      <mesh geometry={tk} position={[0, 0.0, 0.09]} scale={[1.05, 1.05, 1]}>
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </mesh>
    </G>
  );
};

// ---------- Tool tile (পুরু বালিশ card + icon + label) — w 1.3 × h 1.45 ----------
export const ToolTile: React.FC<P & { label: string; icon: React.ReactNode; glow?: number }> = ({ label, icon, glow = 0, ...p }) => {
  const fs = Math.min(0.2, (1.3 * 0.82) / (label.length * 0.66));
  const col = "#" + new THREE.Color("#F6F1EA").lerp(new THREE.Color("#FFE6C8"), glow).getHexString();
  return (
    <SoftPanel w={1.3} h={1.45} thick={0.3} color={col} {...p}>
      <Inset position={[0, 0.17, 0]} w={1.0} h={0.86} color="#EDE5DA" />
      <group position={[0, 0.17, 0.12]}>{icon}</group>
      <Txt size={fs} color={C.deepNavy} position={[0, -0.5, 0.012]}>
        {label}
      </Txt>
    </SoftPanel>
  );
};

// ---------- Name plate (desk nameplate, "YOUR NAME") ----------
export const NamePlate: React.FC<P & { text: string }> = ({ text, ...p }) => {
  const base = useMemo(() => slabGeo(2.9, 0.5, 0.16, 0.12, 0.06, 6), []);
  return (
    <G {...p}>
      <mesh geometry={base} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} castShadow receiveShadow>
        <ClayMat color={C.clay} />
      </mesh>
      <SoftPanel position={[0, 0.5, 0]} rotation={[-0.12, 0, 0]} w={2.7} h={0.78} thick={0.2} color={C.navy}>
        <Txt size={0.32} color="#ffffff" position={[0, -0.01, 0.012]}>
          {text}
        </Txt>
      </SoftPanel>
    </G>
  );
};

// ---------- Map tile (মেঝেতে শোয়ানো clay মানচিত্র) — w 3.4 × d 2.4 ----------
export const MapTile: React.FC<P> = (p) => {
  const park = useMemo(() => slabGeo(0.9, 0.62, 0.07, 0.28, 0.03, 4, false), []);
  const river = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.75, 0.55);
    s.bezierCurveTo(-0.9, 0.95, -0.4, 0.1, 0.4, 0.55);
    s.bezierCurveTo(0.9, 0.85, 1.3, 0.7, 1.75, 0.95);
    s.lineTo(1.75, 1.13);
    s.bezierCurveTo(1.3, 0.9, 0.9, 1.04, 0.4, 0.74);
    s.bezierCurveTo(-0.4, 0.3, -0.9, 1.14, -1.75, 0.74);
    s.closePath();
    return shapeGeo(s, 0.02, 0.012, 3);
  }, []);
  return (
    <G {...p}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <SoftPanel w={3.6} h={2.6} thick={0.22} color="#EEF1E6">
          <mesh geometry={river} position={[0, -0.12, 0.0]} scale={[0.96, 0.9, 1]}>
            <ClayMat color="#A9CBE6" rough={0.45} />
          </mesh>
          {/* roads */}
          <RaisedBar position={[0, -0.25, 0]} w={3.3} h={0.16} d={0.035} color="#FFFFFF" />
          <RaisedBar position={[-0.6, -0.1, 0]} rotation={[0, 0, Math.PI / 2]} w={2.3} h={0.14} d={0.035} color="#FFFFFF" />
          <RaisedBar position={[0.85, -0.05, 0]} rotation={[0, 0, Math.PI / 2 - 0.25]} w={2.3} h={0.12} d={0.035} color="#FFFFFF" />
          <RaisedBar position={[0.15, -0.85, 0]} w={3.0} h={0.1} d={0.03} color="#FFFFFF" />
          <RaisedBar position={[0, -0.25, 0.022]} w={3.0} h={0.035} d={0.02} color={C.orange} />
          <mesh geometry={park} position={[-1.15, -0.62, 0]} castShadow>
            <ClayMat color="#9FD39A" rough={0.6} />
          </mesh>
          {/* ছোট বাড়ি-block */}
          {(
            [
              [0.15, -0.55, 0.36, 0.3, 0.16],
              [0.5, -0.55, 0.26, 0.3, 0.22],
              [1.35, -0.55, 0.42, 0.34, 0.14],
              [-0.15, 0.08, 0.36, 0.26, 0.12],
              [1.35, 0.05, 0.38, 0.3, 0.18],
              [-1.25, 0.1, 0.4, 0.3, 0.13],
            ] as [number, number, number, number, number][]
          ).map(([x, y, w, h, d], i) => (
            <SoftPanel key={i} position={[x, y, d / 2]} w={w} h={h} thick={d} color={i % 2 ? "#F7EFE4" : "#E9E2D8"} />
          ))}
        </SoftPanel>
      </group>
    </G>
  );
};

// ---------- Business card (Google Maps listing) — w 2.8 × h 1.6 ----------
export const BizCard: React.FC<P & { photo?: number; time?: number; phone?: number }> = ({ photo = 1, time = 0, phone = 0, ...p }) => {
  const k = (x: number) => Math.max(0, Math.min(1, x));
  return (
    <SoftPanel w={2.8} h={1.6} thick={0.28} color="#FBF8F4" {...p}>
      {/* chamber-এর ছবি */}
      <group position={[-0.86, 0.0, 0]} scale={0.4 + 0.6 * k(photo)}>
        <SoftPanel w={0.86} h={1.22} thick={0.08} color="#CFE0EF">
          <RaisedBar position={[0, -0.42, 0]} w={0.74} h={0.26} d={0.04} color="#9FC0DC" />
          <Tooth position={[0, -0.36, 0.06]} scale={0.62} />
        </SoftPanel>
      </group>
      <Txt size={0.17} color={C.deepNavy} anchorX="left" position={[-0.3, 0.5, 0.012]}>
        Dr. Shirin Dental
      </Txt>
      <RaisedBar position={[0.28, 0.27, 0]} w={1.16} h={0.05} d={0.015} color="#E1D8CC" />
      {time > 0 && (
        <group position={[-0.22, 0.0, 0.0]} scale={k(time)}>
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.065, 20, 14]} />
            <ClayMat color={C.orange} rough={0.45} />
          </mesh>
          <Txt size={0.15} color={C.deepNavy} anchorX="left" position={[0.12, 0, 0.012]}>
            {"Sat–Thu  5–9 PM"}
          </Txt>
        </group>
      )}
      {phone > 0 && (
        <group position={[-0.22, -0.4, 0.0]} scale={k(phone)}>
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.065, 20, 14]} />
            <GlowMat color="#22B35E" intensity={1.2} />
          </mesh>
          <Txt size={0.17} color={C.deepNavy} anchorX="left" position={[0.12, 0, 0.012]}>
            01616-901396
          </Txt>
        </group>
      )}
    </SoftPanel>
  );
};

// ================= DOM screens (laptop 1024×590) =================
const ui = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";

/** চেম্বারের site চলছেই — উপরে বড় সবুজ "Online" pill */
export const OnlineSite: React.FC<{ pulse: number }> = ({ pulse }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <DentalSite reveal={1} />
    <div
      style={{
        position: "absolute",
        right: 34,
        bottom: 34,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#ffffff",
        borderRadius: 40,
        padding: "16px 28px 16px 22px",
        boxShadow: "0 8px 24px rgba(20,40,70,0.16)",
        fontFamily: ui,
        fontWeight: 800,
        fontSize: 34,
        color: "#13253C",
      }}
    >
      <div style={{ width: 26, height: 26, borderRadius: 13, background: "#22B35E", boxShadow: `0 0 0 ${8 * pulse}px rgba(34,179,94,${0.35 * (1 - pulse)})` }} />
      Site online
    </div>
  </div>
);

/** javeditsolution.com — খরচের পুরো list */
export const CostPage: React.FC<{ url: string; caret: boolean; rows: number; checks: number }> = ({ url, caret, rows, checks }) => {
  const R: [string, string][] = [
    ["Domain + hosting setup", "FREE"],
    ["Maintenance, year 1", "FREE"],
    ["Maintenance after", "BDT 2,000–5,000/mo"],
    ["Google Maps listing", "BDT 0"],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FBF8F4", fontFamily: ui, color: "#13253C" }}>
      <div style={{ height: 78, background: "#EFE8DE", display: "flex", alignItems: "center", padding: "0 22px", gap: 10 }}>
        {["#D85E24", "#F5952B", "#3E6E9E"].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
        ))}
        <div style={{ marginLeft: 14, flex: 1, height: 52, borderRadius: 26, background: "#fff", display: "flex", alignItems: "center", padding: "0 22px", fontSize: 31, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden" }}>
          {url}
          <span style={{ opacity: caret ? 1 : 0, color: "#F5952B" }}>|</span>
        </div>
      </div>
      <div style={{ padding: "18px 30px 0" }}>
        <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: -0.5 }}>Website costs, in full</div>
        <div style={{ marginTop: 12 }}>
          {R.map(([a, b], i) => {
            const v = Math.max(0, Math.min(1, rows * 4 - i));
            const c = Math.max(0, Math.min(1, checks * 4 - i));
            return (
              <div
                key={a}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  background: "#fff",
                  borderRadius: 18,
                  padding: "13px 22px",
                  marginBottom: 12,
                  boxShadow: "0 4px 14px rgba(20,40,70,0.06)",
                  opacity: v,
                  transform: `translateY(${(1 - v) * 20}px)`,
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 20, background: c > 0 ? "#F5952B" : "#E8E1D7", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.7 + 0.3 * c})` }}>
                  {c > 0 && (
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </div>
                <div style={{ fontSize: 36, fontWeight: 700 }}>{a}</div>
                <div style={{ marginLeft: "auto", fontSize: 36, fontWeight: 800, color: b.startsWith("FREE") || b === "BDT 0" ? "#1F9D55" : "#D85E24" }}>{b}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
