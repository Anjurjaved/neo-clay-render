// scenes_d meaningful objects — প্রতিটা ~1 unit উঁচু, origin-এ কেন্দ্র, মুখ +z। সব bevelled / lathe / SDF-baked এক টুকরা।
// `t` = বস্তুটা আসার পর থেকে সময় (সেকেন্ড) — নিজের ছোট idle motion (চাকা ঘোরে, ঘণ্টা দোলে, dot লাফায়) এর থেকে।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, GlassMat, Txt } from "../../kit/Clay";
import { slabGeo, pillGeo, roundedCylGeo, latheGeo, shapeGeo} from "../../kit/Geo";
import { ClockBadge } from "../../kit/Clock";
import { springStep, wobble, clamp } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, Gloss, IconKey, P } from "./common";
import { bakeSDF, smin, smax, sdSphere, sdEllipsoid, sdCone } from "./sdf";

type IP = P & { t?: number; accent?: string; accent2?: string; text?: string };

/** গোল-কোণের polygon → Shape (প্রতিটা কোণ quadratic দিয়ে নরম) */
export const roundPoly = (pts: [number, number][], r: number, shape: THREE.Path = new THREE.Shape()) => {
  const n = pts.length;
  const pt = (i: number) => pts[(i + n) % n];
  const towards = (a: [number, number], b: [number, number], d: number): [number, number] => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = Math.min(d, L / 2) / L;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  for (let i = 0; i < n; i++) {
    const p = pt(i);
    const a = towards(p, pt(i - 1), r);
    const b = towards(p, pt(i + 1), r);
    if (i === 0) shape.moveTo(a[0], a[1]);
    else shape.lineTo(a[0], a[1]);
    shape.quadraticCurveTo(p[0], p[1], b[0], b[1]);
  }
  shape.closePath();
  return shape;
};
const centered = (g: THREE.BufferGeometry, depth: number) => {
  g.translate(0, 0, -depth / 2);
  return g;
};
const ext = (s: THREE.Shape, depth: number, bevel: number, seg = 6) => centered(shapeGeo(s, depth - 2 * bevel, bevel, seg), depth - 2 * bevel);

// ---------------- tooth (SDF fused molar) ----------------
const toothSDF = (x: number, y: number, z: number) => {
  let d = sdEllipsoid(x, y - 0.12, z, 0.36, 0.25, 0.3);
  for (const [cx, cz] of [[-0.14, -0.11], [0.14, -0.11], [-0.14, 0.11], [0.14, 0.11]]) d = smin(d, sdSphere(x - cx, y - 0.27, z - cz, 0.15), 0.1);
  d = smax(d, -sdSphere(x, y - 0.5, z, 0.13), 0.06); // কেন্দ্রের খাঁজ
  for (const s of [-1, 1]) d = smin(d, sdCone(x, y, z, [0.15 * s, 0.02, 0], [0.21 * s, -0.42, 0.02], 0.14, 0.055), 0.12);
  return d;
};
export const Tooth3D: React.FC<IP> = ({ t = 0, ...p }) => {
  const g = useMemo(() => bakeSDF("sd-tooth", toothSDF, [0, 0, 0], 0.62, 80), []);
  return (
    <G {...p}>
      <group position={[0, 0.02, 0]} rotation={[0.1, 0.35 * Math.sin(t * 0.8), 0]}>
        <mesh geometry={g} castShadow receiveShadow>
          <meshPhysicalMaterial color="#FBF9F4" roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.18} sheen={0.4} sheenColor="#fff2e0" />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- calendar ----------------
export const Calendar3D: React.FC<IP & { top?: string }> = ({ t = 0, accent = C.orange, text = "7", top = "DAYS", ...p }) => {
  const body = useMemo(() => slabGeo(0.96, 0.98, 0.22, 0.17, 0.08, 8), []);
  const head = useMemo(() => slabGeo(0.97, 0.3, 0.25, 0.13, 0.08, 8), []);
  const fs = Math.min(0.46, 0.8 / Math.max(1, text.length * 0.62));
  return (
    <G {...p}>
      <mesh geometry={body} position={[0, -0.04, 0]} castShadow receiveShadow>
        <ClayMat color="#FBF8F3" rough={0.6} />
      </mesh>
      <mesh geometry={head} position={[0, 0.34, 0.015]} castShadow>
        <Gloss color={accent} />
      </mesh>
      {[-0.26, 0.26].map((x) => (
        <mesh key={x} position={[x, 0.5, 0.03]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.075, 0.026, 14, 40]} />
          <SilverMat color="#e2e6ea" rough={0.35} />
        </mesh>
      ))}
      <Txt size={0.11} color="#ffffff" position={[0, 0.33, 0.145]}>{top}</Txt>
      <Txt size={fs} color={C.deepNavy} position={[0, -0.14, 0.125]}>{text}</Txt>
    </G>
  );
};

// ---------------- clock ----------------
export const Clock3D: React.FC<IP> = ({ t = 0, ...p }) => (
  <G {...p}>
    <ClockBadge scale={0.5} hourA={1.2 + t * 0.35} minA={0.2 + t * 3.2} moon={false} />
  </G>
);

// ---------------- phone (smartphone + call / chat glyph) ----------------
const handsetSDF = (x: number, y: number, z: number) => {
  // বাঁকা হাতল: বৃত্তচাপ বরাবর capsule chain, দুই মাথায় চ্যাপ্টা ear/mouth
  let d = 1e9;
  const R = 0.3, N = 8;
  for (let i = 0; i < N; i++) {
    const a0 = Math.PI * 0.62 + (i / N) * Math.PI * 0.76, a1 = Math.PI * 0.62 + ((i + 1) / N) * Math.PI * 0.76;
    d = Math.min(d, sdCone(x, y, z, [Math.cos(a0) * R + 0.12, Math.sin(a0) * R - 0.0, 0], [Math.cos(a1) * R + 0.12, Math.sin(a1) * R, 0], 0.075, 0.075));
  }
  for (const a of [Math.PI * 0.62, Math.PI * 1.38]) d = smin(d, sdEllipsoid(x - (Math.cos(a) * R + 0.12 + 0.06), y - Math.sin(a) * R * 1.08, z, 0.13, 0.1, 0.08), 0.06);
  return d;
};
export const Handset3D: React.FC<IP & { color?: string }> = ({ color = "#ffffff", ...p }) => {
  const g = useMemo(() => bakeSDF("sd-handset", handsetSDF, [0, 0, 0], 0.5, 64), []);
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[0, 0, -0.6]} castShadow>
        <Gloss color={color} rough={0.35} />
      </mesh>
    </G>
  );
};
export const Phone3D: React.FC<IP & { glyph?: "call" | "chat" }> = ({ t = 0, accent = C.green, glyph = "call", ...p }) => {
  const body = useMemo(() => slabGeo(0.56, 1.06, 0.09, 0.11, 0.035, 6), []);
  const scr = useMemo(() => slabGeo(0.5, 0.99, 0.02, 0.085, 0.008, 3), []);
  const ring = 1 + 0.06 * Math.max(0, Math.sin(t * 9)) * (Math.sin(t * 1.6) > 0 ? 1 : 0);
  return (
    <G {...p}>
      <group rotation={[0, 0, wobble(t - 0.2, 0.05, 6, 0.3)]}>
        <mesh geometry={body} castShadow>
          <meshPhysicalMaterial color="#2B3444" roughness={0.35} metalness={0.4} clearcoat={0.6} />
        </mesh>
        <mesh geometry={scr} position={[0, 0, 0.045]}>
          <meshPhysicalMaterial color={accent} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} emissive={accent} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0.43, 0.058]}>
          <capsuleGeometry args={[0.022, 0.09, 6, 12]} />
          <meshStandardMaterial color="#10141b" roughness={0.3} />
        </mesh>
        <group position={[0, 0.04, 0.075]} scale={ring}>
          {glyph === "call" ? <Handset3D scale={0.62} /> : <Chat3D scale={0.5} t={t} accent="#ffffff" accent2={accent} />}
        </group>
        <mesh position={[0, -0.36, 0.06]}>
          <capsuleGeometry args={[0.012, 0.12, 4, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} transparent opacity={0.8} />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- map pin ----------------
export const Pin3D: React.FC<IP> = ({ t = 0, accent = C.deepOrange, ...p }) => {
  const body = useMemo(() => latheGeo([[0.0, -0.5], [0.05, -0.38], [0.17, -0.14], [0.28, 0.08], [0.32, 0.27], [0.28, 0.44], [0.15, 0.53], [0.0, 0.555]], 64), []);
  const hole = useMemo(() => roundedCylGeo(0.12, 0.08, 0.035, 48), []);
  return (
    <G {...p}>
      <group position={[0, 0.04 * Math.sin(t * 2.2), 0]} rotation={[0, t * 0.6, 0]}>
        <mesh geometry={body} castShadow>
          <Gloss color={accent} />
        </mesh>
        <mesh geometry={hole} position={[0, 0.27, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <ClayMat color="#FFFFFF" rough={0.5} />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- star ----------------
export const Star3D: React.FC<IP> = ({ t = 0, accent = "#F5B731", ...p }) => {
  const g = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.24 : 0.52;
      pts.push([Math.cos(a) * r, Math.sin(a) * r - 0.03]);
    }
    return ext(roundPoly(pts, 0.07) as THREE.Shape, 0.24, 0.085, 7);
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[0, 0.5 * Math.sin(t * 1.1), 0.08 * Math.sin(t * 0.7)]} castShadow>
        <Gloss color={accent} rough={0.34} coat={0.8} />
      </mesh>
    </G>
  );
};

// ---------------- shopping cart ----------------
export const Cart3D: React.FC<IP> = ({ t = 0, accent = C.orange, accent2 = C.deepNavy, ...p }) => {
  const basket = useMemo(() => {
    const s = roundPoly([[-0.42, 0.24], [0.44, 0.24], [0.34, -0.16], [-0.32, -0.16]], 0.06) as THREE.Shape;
    for (let i = 0; i < 3; i++) {
      const h = new THREE.Path();
      const x0 = -0.27 + i * 0.22;
      roundPoly([[x0, 0.15], [x0 + 0.16, 0.15], [x0 + 0.14, -0.08], [x0 + 0.01, -0.08]].map(([x, y]) => [x * (1 - 0.0), y]) as [number, number][], 0.03, h);
      s.holes.push(h);
    }
    return ext(s, 0.2, 0.05, 5);
  }, []);
  const wheel = useMemo(() => roundedCylGeo(0.085, 0.07, 0.03, 40), []);
  return (
    <G {...p}>
      <group position={[0, 0.05, 0]}>
        <mesh geometry={basket} castShadow>
          <Gloss color={accent} />
        </mesh>
        {/* handle: পিছনের দিকে বাঁকা রড + গ্রিপ */}
        <mesh position={[-0.5, 0.32, 0]} rotation={[0, 0, -0.45]} castShadow>
          <capsuleGeometry args={[0.035, 0.2, 8, 16]} />
          <Gloss color={accent2} />
        </mesh>
        <mesh position={[-0.6, 0.43, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.045, 0.12, 8, 16]} />
          <Gloss color={accent2} />
        </mesh>
        <mesh position={[0.02, -0.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.028, 0.62, 6, 16]} />
          <Gloss color={accent2} />
        </mesh>
        {[-0.24, 0.26].map((x) => (
          <group key={x} position={[x, -0.33, 0.02]} rotation={[Math.PI / 2, -t * 4, 0]}>
            <mesh geometry={wheel} castShadow>
              <Gloss color={accent2} />
            </mesh>
            <mesh position={[0.04, 0.04, 0]}>
              <sphereGeometry args={[0.018, 10, 8]} />
              <SilverMat />
            </mesh>
          </group>
        ))}
      </group>
    </G>
  );
};

// ---------------- shopping bag ----------------
export const Bag3D: React.FC<IP> = ({ t = 0, accent = "#E0457B", accent2 = "#FBF8F3", ...p }) => {
  const body = useMemo(() => {
    const s = roundPoly([[-0.38, -0.42], [0.38, -0.42], [0.34, 0.3], [-0.34, 0.3]], 0.09) as THREE.Shape;
    return ext(s, 0.36, 0.09, 7);
  }, []);
  const band = useMemo(() => slabGeo(0.66, 0.1, 0.04, 0.05, 0.015, 3), []);
  return (
    <G {...p}>
      <group rotation={[0, 0, wobble(t - 0.1, 0.06, 1.8, 0.2)]} position={[0, -0.02, 0]}>
        <mesh geometry={body} castShadow receiveShadow>
          <Gloss color={accent} rough={0.5} coat={0.3} />
        </mesh>
        <mesh geometry={band} position={[0, 0.18, 0.18]}>
          <ClayMat color={accent2} rough={0.6} />
        </mesh>
        {[-0.07, 0.07].map((z) => (
          <mesh key={z} position={[0, 0.3, z]} castShadow>
            <torusGeometry args={[0.17, 0.03, 14, 48, Math.PI]} />
            <Gloss color={C.deepNavy} />
          </mesh>
        ))}
        <mesh position={[0, -0.08, 0.185]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.1, 0.022, 12, 40, Math.PI]} />
          <ClayMat color={accent2} rough={0.6} />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- delivery truck ----------------
export const Truck3D: React.FC<IP> = ({ t = 0, accent = C.orange, accent2 = "#FBF8F3", ...p }) => {
  const cargo = useMemo(() => slabGeo(0.66, 0.5, 0.48, 0.09, 0.07, 6), []);
  const cab = useMemo(() => {
    const s = roundPoly([[-0.17, -0.2], [0.2, -0.2], [0.2, 0.02], [0.08, 0.2], [-0.17, 0.2]], 0.05) as THREE.Shape;
    return ext(s, 0.46, 0.06, 5);
  }, []);
  const win = useMemo(() => {
    const s = roundPoly([[-0.1, 0.0], [0.07, 0.0], [0.13, 0.0], [0.05, 0.13], [-0.1, 0.13]], 0.025) as THREE.Shape;
    return ext(s, 0.03, 0.01, 2);
  }, []);
  const wheel = useMemo(() => roundedCylGeo(0.13, 0.1, 0.045, 48), []);
  const hub = useMemo(() => roundedCylGeo(0.055, 0.12, 0.02, 32), []);
  const bounce = 0.012 * Math.sin(t * 14);
  return (
    <G {...p}>
      <group position={[0, bounce, 0]}>
        <mesh geometry={cargo} position={[-0.15, 0.06, 0]} castShadow receiveShadow>
          <ClayMat color={accent2} rough={0.55} />
        </mesh>
        <mesh geometry={cab} position={[0.36, -0.03, 0]} castShadow>
          <Gloss color={accent} />
        </mesh>
        <mesh geometry={win} position={[0.38, 0.0, 0.235]}>
          <GlassMat color="#2d4a66" />
        </mesh>
        <mesh position={[-0.15, 0.06, 0.245]}>
          <torusGeometry args={[0.1, 0.022, 10, 36]} />
          <Gloss color={accent} />
        </mesh>
      </group>
      {[-0.3, 0.34].map((x) => (
        <group key={x} position={[x, -0.24, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
          <group rotation={[0, -t * 6, 0]}>
            <mesh geometry={wheel} castShadow>
              <ClayMat color="#2B3444" rough={0.6} />
            </mesh>
            <mesh geometry={hub}>
              <SilverMat color="#e3e6ea" rough={0.35} />
            </mesh>
          </group>
        </group>
      ))}
    </G>
  );
};

// ---------------- cloche (restaurant dish) — ঢাকনা উঠে খাবার দেখায় ----------------
export const Cloche3D: React.FC<IP> = ({ t = 0, accent = C.deepOrange, ...p }) => {
  const plate = useMemo(() => latheGeo([[0.0, -0.36], [0.4, -0.36], [0.55, -0.31], [0.6, -0.26], [0.52, -0.27], [0.36, -0.3], [0.0, -0.3]], 72), []);
  const dome = useMemo(() => latheGeo([[0.47, -0.3], [0.48, -0.25], [0.46, -0.1], [0.4, 0.04], [0.28, 0.15], [0.14, 0.2], [0.0, 0.215]], 72), []);
  const knob = useMemo(() => latheGeo([[0.0, 0.2], [0.035, 0.21], [0.03, 0.25], [0.07, 0.28], [0.06, 0.32], [0.0, 0.33]], 32), []);
  // ঢাকনা: 0.35–0.85 s উঠে পিছনে হেলে, 1.6 s-এ নামে
  const lift = springStep(t - 0.35, { k: 90, c: 11 }) - springStep(t - 1.7, { k: 120, c: 13 });
  return (
    <G {...p}>
      <group position={[0, 0.06, 0]}>
        <mesh geometry={plate} castShadow receiveShadow>
          <ClayMat color="#FBFAF7" rough={0.35} />
        </mesh>
        {/* খাবার: ভাত + মাংস টুকরা (নরম গোল) */}
        <mesh position={[-0.08, -0.25, 0.02]} scale={[1.3, 0.5, 1]} castShadow>
          <sphereGeometry args={[0.16, 32, 20]} />
          <ClayMat color="#FFF6E4" rough={0.7} />
        </mesh>
        <mesh position={[0.14, -0.23, 0.06]} scale={[1, 0.62, 0.9]} castShadow>
          <sphereGeometry args={[0.11, 32, 20]} />
          <Gloss color={accent} rough={0.5} />
        </mesh>
        <group position={[0, 0.34 * lift, -0.12 * lift]} rotation={[-0.5 * lift, 0, 0]}>
          <mesh geometry={dome} castShadow>
            <SilverMat color="#e6e9ec" rough={0.28} />
          </mesh>
          <mesh geometry={knob} castShadow>
            <SilverMat color="#d5dade" rough={0.3} />
          </mesh>
        </group>
      </group>
    </G>
  );
};

// ---------------- graduation cap ----------------
export const Cap3D: React.FC<IP> = ({ t = 0, accent = C.deepNavy, accent2 = "#F2B63D", ...p }) => {
  const board = useMemo(() => slabGeo(0.92, 0.92, 0.07, 0.07, 0.03, 4), []);
  const skull = useMemo(() => latheGeo([[0.0, -0.3], [0.28, -0.29], [0.33, -0.18], [0.34, -0.05], [0.3, 0.02], [0.0, 0.02]], 56), []);
  const sw = 0.25 * Math.sin(t * 2.6) * Math.exp(-t * 0.5) + 0.06 * Math.sin(t * 1.3);
  return (
    <G {...p}>
      <group rotation={[0.42, 0.5, 0]} position={[0, 0.1, 0]}>
        <mesh geometry={skull} position={[0, -0.02, 0]} castShadow>
          <Gloss color={accent} rough={0.55} coat={0.2} />
        </mesh>
        <mesh geometry={board} rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.03, 0]} castShadow>
          <Gloss color={accent} rough={0.5} coat={0.25} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.05, 20, 14]} />
          <Gloss color={accent2} />
        </mesh>
        {/* tassel: বোতাম থেকে কিনারা হয়ে ঝোলে, দোলে */}
        <group position={[0, 0.08, 0]} rotation={[0, -0.5 + Math.PI / 4 + 0.6, 0]}>
          <mesh position={[0.26, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.016, 0.5, 4, 8]} />
            <Gloss color={accent2} />
          </mesh>
          <group position={[0.52, 0, 0]} rotation={[sw, 0, 0]}>
            <mesh position={[0, -0.17, 0]}>
              <capsuleGeometry args={[0.018, 0.28, 4, 8]} />
              <Gloss color={accent2} />
            </mesh>
            <mesh position={[0, -0.36, 0]}>
              <capsuleGeometry args={[0.045, 0.1, 6, 12]} />
              <Gloss color={accent2} rough={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    </G>
  );
};

// ---------------- house ----------------
export const House3D: React.FC<IP> = ({ t = 0, accent = "#1F9D72", accent2 = C.orange, ...p }) => {
  const walls = useMemo(() => ext(roundPoly([[-0.36, -0.46], [0.36, -0.46], [0.36, 0.06], [0.0, 0.36], [-0.36, 0.06]], 0.05) as THREE.Shape, 0.56, 0.07), []);
  const roof = useMemo(() => {
    const s = roundPoly([[-0.52, 0.0], [0.0, 0.46], [0.52, 0.0], [0.42, -0.08], [0.0, 0.3], [-0.42, -0.08]], 0.05) as THREE.Shape;
    return ext(s, 0.66, 0.06);
  }, []);
  const door = useMemo(() => slabGeo(0.2, 0.32, 0.05, 0.08, 0.02, 4), []);
  const win = useMemo(() => slabGeo(0.17, 0.15, 0.04, 0.04, 0.015, 3), []);
  const chim = useMemo(() => slabGeo(0.11, 0.2, 0.12, 0.03, 0.02, 3), []);
  const glow = 0.35 + 0.25 * clamp(t - 0.5, 0, 1);
  return (
    <G {...p}>
      <mesh geometry={chim} position={[0.24, 0.32, -0.08]} castShadow>
        <ClayMat color="#E9E2D8" rough={0.6} />
      </mesh>
      <mesh geometry={walls} castShadow receiveShadow>
        <ClayMat color="#FBF8F3" rough={0.6} />
      </mesh>
      <mesh geometry={roof} position={[0, 0.06, 0]} castShadow>
        <Gloss color={accent} />
      </mesh>
      <mesh geometry={door} position={[0.12, -0.3, 0.285]} castShadow>
        <Gloss color={C.deepNavy} />
      </mesh>
      <mesh position={[0.18, -0.3, 0.315]}>
        <sphereGeometry args={[0.018, 10, 8]} />
        <Gloss color={accent2} />
      </mesh>
      <mesh geometry={win} position={[-0.18, -0.18, 0.285]}>
        <meshPhysicalMaterial color="#FFD58A" emissive="#FFB347" emissiveIntensity={glow} roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh geometry={win} position={[0.0, 0.08, 0.285]} scale={0.8}>
        <meshPhysicalMaterial color="#FFD58A" emissive="#FFB347" emissiveIntensity={glow} roughness={0.2} clearcoat={1} />
      </mesh>
    </G>
  );
};

// ---------------- key (এক টুকরা outline + bow-র ফুটো) ----------------
export const Key3D: React.FC<IP> = ({ t = 0, accent = "#F2B63D", ...p }) => {
  const g = useMemo(() => {
    const R = 0.24, cx = -0.3, sh = 0.07;
    const a = Math.asin(sh / R);
    const s = new THREE.Shape();
    s.moveTo(cx + R * Math.cos(a), sh);
    s.lineTo(0.5, sh);
    s.quadraticCurveTo(0.54, sh, 0.54, sh - 0.04);
    s.lineTo(0.54, -0.2);
    s.lineTo(0.44, -0.2);
    s.lineTo(0.44, -0.12);
    s.lineTo(0.36, -0.12);
    s.lineTo(0.36, -0.22);
    s.lineTo(0.26, -0.22);
    s.lineTo(0.26, -sh);
    s.lineTo(cx + R * Math.cos(a), -sh);
    s.absarc(cx, 0, R, -a, a - Math.PI * 2, true);
    const h = new THREE.Path();
    h.absarc(cx - 0.03, 0, 0.1, 0, Math.PI * 2, true);
    s.holes.push(h);
    return ext(s, 0.12, 0.035, 5);
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[0.25, 0.4 * Math.sin(t * 1.3), -0.5 + 0.08 * Math.sin(t * 2)]} castShadow>
        <Gloss color={accent} rough={0.3} coat={0.8} metal={0.3} />
      </mesh>
    </G>
  );
};

// ---------------- shield + tick ----------------
const tickGeo = () => ext(roundPoly([[-0.2, 0.0], [-0.07, -0.14], [0.22, 0.16], [0.16, 0.21], [-0.07, -0.03], [-0.15, -0.05]], 0.015) as THREE.Shape, 0.07, 0.02, 3);
export const Shield3D: React.FC<IP> = ({ t = 0, accent = C.navy, ...p }) => {
  const g = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.5);
    s.quadraticCurveTo(0.2, 0.38, 0.4, 0.37);
    s.lineTo(0.4, 0.02);
    s.quadraticCurveTo(0.37, -0.3, 0, -0.5);
    s.quadraticCurveTo(-0.37, -0.3, -0.4, 0.02);
    s.lineTo(-0.4, 0.37);
    s.quadraticCurveTo(-0.2, 0.38, 0, 0.5);
    return ext(s, 0.22, 0.08, 7);
  }, []);
  const tk = useMemo(tickGeo, []);
  const k = springStep(t - 0.35, { k: 220, c: 12 });
  return (
    <G {...p}>
      <group rotation={[0, 0.3 * Math.sin(t * 0.9), 0]}>
        <mesh geometry={g} castShadow>
          <Gloss color={accent} />
        </mesh>
        <mesh geometry={tk} position={[0, 0.0, 0.12]} scale={[1.3 * k, 1.3 * k, 1]}>
          <Gloss color="#ffffff" rough={0.35} />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- chat bubble + typing dots ----------------
export const Chat3D: React.FC<IP> = ({ t = 0, accent = C.green, accent2 = "#ffffff", ...p }) => {
  const g = useMemo(() => {
    const w = 0.92, h = 0.66, r = 0.24;
    const x = -w / 2, y = -h / 2 + 0.06;
    const s = new THREE.Shape();
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r);
    s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h);
    s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y - 0.02, x - 0.04, y - 0.12);
    s.quadraticCurveTo(x + 0.14, y - 0.08, x + r + 0.02, y);
    return ext(s, 0.24, 0.085, 7);
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <Gloss color={accent} />
      </mesh>
      {[-0.22, 0, 0.22].map((x, i) => (
        <mesh key={i} position={[x, 0.09 + 0.05 * Math.max(0, Math.sin(t * 7 - i * 0.9)), 0.13]}>
          <sphereGeometry args={[0.065, 24, 16]} />
          <Gloss color={accent2} rough={0.35} />
        </mesh>
      ))}
    </G>
  );
};

// ---------------- magnifier (search) ----------------
export const Search3D: React.FC<IP> = ({ t = 0, accent = C.deepNavy, ...p }) => {
  const handle = useMemo(() => pillGeo(0.42, 0.15, 0.15, 0.06), []);
  return (
    <G {...p}>
      <group rotation={[0, 0.3 * Math.sin(t * 1.2), 0]} position={[0.05 + 0.03 * Math.sin(t * 2), 0.03, 0]}>
        <mesh position={[-0.1, 0.1, 0]} castShadow>
          <torusGeometry args={[0.27, 0.075, 28, 72]} />
          <Gloss color={accent} />
        </mesh>
        <mesh position={[-0.1, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.03, 48]} />
          <meshPhysicalMaterial color="#cfe6f7" roughness={0.05} clearcoat={1} transparent opacity={0.55} envMapIntensity={1.4} />
        </mesh>
        <mesh geometry={handle} position={[0.24, -0.24, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <Gloss color={C.orange} />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- payment card ----------------
export const Card3D: React.FC<IP> = ({ t = 0, accent = "#E0457B", accent2 = C.deepNavy, ...p }) => {
  const card = useMemo(() => slabGeo(0.98, 0.62, 0.07, 0.08, 0.028, 5), []);
  const chip = useMemo(() => slabGeo(0.17, 0.13, 0.03, 0.03, 0.01, 3), []);
  const back = useMemo(() => slabGeo(0.98, 0.62, 0.07, 0.08, 0.028, 5), []);
  return (
    <G {...p}>
      <mesh geometry={back} position={[0.1, 0.12, -0.12]} rotation={[0, 0, 0.12]} castShadow>
        <Gloss color={accent2} />
      </mesh>
      <group rotation={[0, 0.25 * Math.sin(t * 1.0), -0.08]}>
        <mesh geometry={card} castShadow>
          <Gloss color={accent} />
        </mesh>
        <mesh geometry={chip} position={[-0.28, 0.06, 0.04]}>
          <Gloss color="#F2C45A" rough={0.3} metal={0.5} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.28, 0.08, 0.04]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.05 + i * 0.045, 0.012, 8, 24, Math.PI / 2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[-0.1, -0.16, 0.04]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.028, 0.5, 4, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} transparent opacity={0.85} />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- growth chart ----------------
export const Chart3D: React.FC<IP> = ({ t = 0, accent = C.green, accent2 = C.orange, ...p }) => {
  const base = useMemo(() => slabGeo(0.96, 0.12, 0.42, 0.05, 0.04, 4), []);
  const arrow = useMemo(() => ext(roundPoly([[-0.4, -0.1], [-0.12, 0.12], [0.06, -0.02], [0.26, 0.2], [0.18, 0.27], [0.44, 0.34], [0.38, 0.08], [0.32, 0.14], [0.06, -0.14], [-0.12, 0.0], [-0.34, -0.18]], 0.02) as THREE.Shape, 0.09, 0.03, 4), []);
  const hs = [0.28, 0.46, 0.68];
  return (
    <G {...p}>
      <mesh geometry={base} rotation={[0, 0, 0]} position={[0, -0.42, 0]} castShadow receiveShadow>
        <ClayMat color="#FBF8F3" rough={0.6} />
      </mesh>
      {hs.map((h, i) => {
        const k = springStep(t - 0.1 - i * 0.12, { k: 140, c: 12 });
        const hh = Math.max(0.02, h * k);
        return (
          <mesh key={i} position={[-0.27 + i * 0.27, -0.36 + hh / 2, 0]} scale={[1, hh / 0.5, 1]} castShadow>
            <capsuleGeometry args={[0.09, 0.5 - 0.18, 8, 24]} />
            <Gloss color={i === 2 ? accent : C.steel} />
          </mesh>
        );
      })}
      <group scale={springStep(t - 0.45, { k: 200, c: 13 })} position={[0, 0.12, 0.16]}>
        <mesh geometry={arrow} castShadow>
          <Gloss color={accent2} />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- heart ----------------
export const Heart3D: React.FC<IP> = ({ t = 0, accent = "#E2503A", ...p }) => {
  const g = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.42);
    s.bezierCurveTo(-0.08, -0.3, -0.48, -0.08, -0.48, 0.16);
    s.bezierCurveTo(-0.48, 0.36, -0.32, 0.44, -0.22, 0.44);
    s.bezierCurveTo(-0.1, 0.44, -0.02, 0.36, 0, 0.27);
    s.bezierCurveTo(0.02, 0.36, 0.1, 0.44, 0.22, 0.44);
    s.bezierCurveTo(0.32, 0.44, 0.48, 0.36, 0.48, 0.16);
    s.bezierCurveTo(0.48, -0.08, 0.08, -0.3, 0, -0.42);
    return ext(s, 0.3, 0.12, 8);
  }, []);
  const beat = 1 + 0.06 * Math.pow(Math.max(0, Math.sin(t * 5)), 6);
  return (
    <G {...p}>
      <mesh geometry={g} scale={beat} rotation={[0, 0.3 * Math.sin(t * 0.8), 0]} castShadow>
        <Gloss color={accent} rough={0.36} coat={0.7} />
      </mesh>
    </G>
  );
};

// ---------------- lightning (fast) ----------------
export const Bolt3D: React.FC<IP> = ({ t = 0, accent = "#F5B731", ...p }) => {
  const g = useMemo(() => ext(roundPoly([[0.08, 0.52], [-0.3, -0.02], [-0.04, -0.02], [-0.14, -0.52], [0.3, 0.08], [0.04, 0.08]], 0.035) as THREE.Shape, 0.2, 0.07, 6), []);
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[0, 0.35 * Math.sin(t * 1.4), 0.1]} castShadow>
        <Gloss color={accent} rough={0.32} coat={0.8} />
      </mesh>
    </G>
  );
};

// ---------------- bell ----------------
export const Bell3D: React.FC<IP> = ({ t = 0, accent = "#F5B731", ...p }) => {
  const g = useMemo(() => latheGeo([[0.0, -0.3], [0.38, -0.3], [0.42, -0.26], [0.36, -0.18], [0.3, 0.02], [0.27, 0.2], [0.18, 0.32], [0.0, 0.35]], 64), []);
  const sw = wobble(t - 0.15, 0.35, 1.6, 0.12);
  return (
    <G {...p}>
      <group position={[0, 0.42, 0]} rotation={[0, 0, sw]}>
        <group position={[0, -0.42, 0]}>
          <mesh geometry={g} castShadow>
            <Gloss color={accent} rough={0.3} coat={0.8} metal={0.25} />
          </mesh>
          <mesh position={[0, 0.39, 0]}>
            <torusGeometry args={[0.06, 0.022, 10, 28]} />
            <Gloss color={accent} />
          </mesh>
          <mesh position={[-sw * 0.25, -0.36, 0]}>
            <sphereGeometry args={[0.075, 24, 16]} />
            <Gloss color={C.deepNavy} />
          </mesh>
        </group>
      </group>
    </G>
  );
};

// ---------------- photo (gallery) ----------------
export const Photo3D: React.FC<IP> = ({ t = 0, accent = "#1F9D72", accent2 = C.orange, ...p }) => {
  const frame = useMemo(() => slabGeo(0.98, 0.78, 0.1, 0.1, 0.04, 5), []);
  const inner = useMemo(() => slabGeo(0.82, 0.62, 0.02, 0.06, 0.008, 3), []);
  const m1 = useMemo(() => ext(roundPoly([[-0.38, -0.27], [-0.12, 0.08], [0.12, -0.27]], 0.04) as THREE.Shape, 0.05, 0.015, 3), []);
  const m2 = useMemo(() => ext(roundPoly([[-0.1, -0.27], [0.16, 0.14], [0.39, -0.27]], 0.04) as THREE.Shape, 0.05, 0.015, 3), []);
  return (
    <G {...p}>
      <group rotation={[0, 0.25 * Math.sin(t * 0.9), 0.05]}>
        <mesh geometry={frame} castShadow>
          <ClayMat color="#FBF8F3" rough={0.55} />
        </mesh>
        <mesh geometry={inner} position={[0, 0, 0.05]}>
          <ClayMat color="#DDEBF4" rough={0.6} />
        </mesh>
        <mesh geometry={m2} position={[0, 0, 0.075]}>
          <Gloss color={C.steel} />
        </mesh>
        <mesh geometry={m1} position={[0, 0, 0.09]}>
          <Gloss color={accent} />
        </mesh>
        <mesh position={[0.24, 0.16, 0.08]} scale={[1, 1, 0.5]}>
          <sphereGeometry args={[0.075, 24, 16]} />
          <Gloss color={accent2} />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- coin stack ----------------
export const Coins3D: React.FC<IP> = ({ t = 0, accent = "#F2A640", ...p }) => {
  const coin = useMemo(() => roundedCylGeo(0.3, 0.1, 0.04, 64), []);
  const n = 4;
  return (
    <G {...p}>
      {Array.from({ length: n }).map((_, i) => {
        const k = springStep(t - i * 0.1, { k: 180, c: 12 });
        return (
          <mesh key={i} geometry={coin} position={[-0.14 + (i % 2) * 0.012, -0.42 + i * 0.105 + (1 - k) * 0.6, 0]} rotation={[0, i, 0]} scale={k > 0.01 ? 1 : 0.001} castShadow receiveShadow>
            <Gloss color={accent} rough={0.32} coat={0.7} metal={0.25} />
          </mesh>
        );
      })}
      <group position={[0.24, -0.08, 0.12]} rotation={[Math.PI / 2 - 0.25, 0, 0.35 + t * 0.0]}>
        <mesh geometry={coin} castShadow>
          <Gloss color={accent} rough={0.32} coat={0.7} metal={0.25} />
        </mesh>
        <mesh position={[0, 0.055, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.21, 0.014, 8, 48]} />
          <Gloss color="#DB8B2E" />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- medical cross ----------------
export const Cross3D: React.FC<IP> = ({ t = 0, accent = "#2E8F83", ...p }) => {
  const a = 0.15, b = 0.45;
  const g = useMemo(() => ext(roundPoly([[-a, b], [a, b], [a, a], [b, a], [b, -a], [a, -a], [a, -b], [-a, -b], [-a, -a], [-b, -a], [-b, a], [-a, a]], 0.06) as THREE.Shape, 0.26, 0.09, 7), []);
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[0, 0.4 * Math.sin(t * 0.9), 0]} castShadow>
        <Gloss color={accent} />
      </mesh>
    </G>
  );
};

// ---------------- book ----------------
export const Book3D: React.FC<IP> = ({ t = 0, accent = "#3D6FD1", accent2 = "#F2B63D", ...p }) => {
  const cover = useMemo(() => slabGeo(0.74, 0.92, 0.2, 0.06, 0.04, 4), []);
  const pages = useMemo(() => slabGeo(0.7, 0.86, 0.16, 0.03, 0.02, 3), []);
  const label = useMemo(() => slabGeo(0.44, 0.16, 0.03, 0.04, 0.012, 3), []);
  return (
    <G {...p}>
      <group rotation={[0.05, -0.5 + 0.2 * Math.sin(t * 0.8), 0.06]}>
        <mesh geometry={pages} position={[0.03, 0, 0]} castShadow>
          <ClayMat color="#FFF8EC" rough={0.75} />
        </mesh>
        <mesh geometry={cover} position={[0, 0, 0]} scale={[1, 1, 0.55]} castShadow>
          <Gloss color={accent} rough={0.5} coat={0.3} />
        </mesh>
        <mesh geometry={label} position={[0.0, 0.2, 0.06]}>
          <ClayMat color="#FBF8F3" rough={0.6} />
        </mesh>
        <mesh position={[0.2, -0.5, 0.0]}>
          <capsuleGeometry args={[0.03, 0.16, 4, 8]} />
          <Gloss color={accent2} />
        </mesh>
      </group>
    </G>
  );
};

// ---------------- globe ----------------
export const Globe3D: React.FC<IP> = ({ t = 0, accent = C.steel, ...p }) => (
  <G {...p}>
    <group rotation={[0.3, t * 0.6, 0.2]}>
      <mesh castShadow>
        <sphereGeometry args={[0.45, 64, 40]} />
        <Gloss color={accent} rough={0.45} />
      </mesh>
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a, i) => (
        <mesh key={i} rotation={[0, a, 0]}>
          <torusGeometry args={[0.455, 0.016, 10, 72]} />
          <ClayMat color="#e3ebf3" rough={0.5} />
        </mesh>
      ))}
      {[-0.22, 0, 0.22].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[Math.sqrt(0.455 * 0.455 - y * y), 0.016, 10, 72]} />
          <ClayMat color="#e3ebf3" rough={0.5} />
        </mesh>
      ))}
    </group>
  </G>
);

// ---------------- plane (travel) ----------------
export const Plane3D: React.FC<IP> = ({ t = 0, accent = "#1B8FC4", ...p }) => {
  const g = useMemo(
    () =>
      ext(
        roundPoly(
          [[0.0, 0.52], [0.06, 0.4], [0.06, 0.12], [0.46, -0.08], [0.46, -0.16], [0.06, -0.06], [0.05, -0.32], [0.17, -0.42], [0.17, -0.48], [0.0, -0.44], [-0.17, -0.48], [-0.17, -0.42], [-0.05, -0.32], [-0.06, -0.06], [-0.46, -0.16], [-0.46, -0.08], [-0.06, 0.12], [-0.06, 0.4]],
          0.04
        ) as THREE.Shape,
        0.14,
        0.05,
        5
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[0.5, 0.2 * Math.sin(t), -0.6 + 0.1 * Math.sin(t * 1.5)]} castShadow>
        <Gloss color={accent} />
      </mesh>
    </G>
  );
};

/** key → বস্তু (accent/accent2 industry profile থেকে) */
export const Icon3D: React.FC<IP & { kind: IconKey }> = ({ kind, ...p }) => {
  switch (kind) {
    case "tooth": return <Tooth3D {...p} />;
    case "calendar": return <Calendar3D {...p} />;
    case "clock": return <Clock3D {...p} />;
    case "phone": return <Phone3D {...p} accent={C.green} />;
    case "pin": return <Pin3D {...p} accent={p.accent2 ?? C.deepOrange} />;
    case "star": return <Star3D {...p} accent="#F5B731" />;
    case "cart": return <Cart3D {...p} />;
    case "bag": return <Bag3D {...p} />;
    case "truck": return <Truck3D {...p} />;
    case "cloche": return <Cloche3D {...p} />;
    case "cap": return <Cap3D {...p} accent={C.deepNavy} />;
    case "house": return <House3D {...p} />;
    case "key": return <Key3D {...p} accent="#F2B63D" />;
    case "shield": return <Shield3D {...p} />;
    case "chat": return <Chat3D {...p} accent={C.green} accent2="#ffffff" />;
    case "search": return <Search3D {...p} accent={C.deepNavy} />;
    case "card": return <Card3D {...p} />;
    case "chart": return <Chart3D {...p} accent={C.green} accent2={C.orange} />;
    case "heart": return <Heart3D {...p} accent="#E2503A" />;
    case "bolt": return <Bolt3D {...p} accent="#F5B731" />;
    case "bell": return <Bell3D {...p} accent="#F5B731" />;
    case "photo": return <Photo3D {...p} />;
    case "coins": return <Coins3D {...p} accent="#F2A640" />;
    case "cross": return <Cross3D {...p} />;
    case "book": return <Book3D {...p} />;
    case "globe": return <Globe3D {...p} accent={C.steel} />;
    case "plane": return <Plane3D {...p} />;
  }
  return null;
};
export const ICON_KEYS: IconKey[] = ["tooth", "calendar", "clock", "phone", "pin", "star", "cart", "bag", "truck", "cloche", "cap", "house", "key", "shield", "chat", "search", "card", "chart", "heart", "bolt", "bell", "photo", "coins", "cross", "book", "globe", "plane"];
