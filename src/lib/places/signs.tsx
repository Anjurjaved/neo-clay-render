// প্রতিটা দোকানের চেনার sign object — সব এক টুকরার SDF bake (MarchingCubes), polished clay।
// সব component props-চালিত (সময়-নির্ভর মান prop হিসেবে), নিজে useCurrentFrame ডাকে না।
import React, { useMemo } from "react";
import * as THREE from "three";
import { latheGeo, roundedCylGeo } from "../../kit/Geo";
import { ClayMat, SilverMat } from "../../kit/Clay";
import { PolishedClay, Satin } from "./mats";
import {
  bakeSDF,
  smin,
  smax,
  sdSphere,
  sdEllipsoid,
  sdRoundBox,
  sdRoundCone,
  sdCapsule,
  sdTorusXY,
  sdBox2,
  sdCircle2,
  rot2,
  extrudeRound,
  revolve,
  V3,
} from "./sdf";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

// =====================================================================================
// Molar — এক টুকরার fused দাঁত: চওড়া crown, ৪টা নরম cusp, মাঝে fossa, দুই root; উচ্চতা ≈ 1.05 (y 0→1.05)
// =====================================================================================
export const molarSDF = (x: number, y: number, z: number) => {
  // crown body: rounded box + bulge ellipsoid (cervical-এর উপরে একটু ফোলা)
  let d = sdRoundBox(x, y - 0.68, z, 0.24, 0.07, 0.17, 0.17);
  d = smin(d, sdEllipsoid(x, y - 0.62, z, 0.44, 0.27, 0.36), 0.08);
  // cusps
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) d = smin(d, sdSphere(x - sx * 0.19, y - 0.86, z - sz * 0.13, 0.165), 0.09);
  // central fossa + mesial-distal groove (হালকা খাঁজ)
  d = smax(d, -sdSphere(x, y - 1.04, z, 0.15), 0.07);
  d = smax(d, -sdCapsule([x, y, z], [-0.22, 1.02, 0], [0.22, 1.02, 0], 0.045), 0.05);
  // roots: সামান্য বাইরে বাঁকা দুই round cone, মসৃণ fillet
  for (const s of [-1, 1]) {
    const r1 = sdRoundCone([x, y, z], [s * 0.17, 0.5, 0], [s * 0.22, 0.2, 0.01], 0.16, 0.11);
    const r2 = sdRoundCone([x, y, z], [s * 0.22, 0.2, 0.01], [s * 0.2, 0.03, 0.02], 0.11, 0.06);
    d = smin(d, smin(r1, r2, 0.06), 0.14);
  }
  // roots-এর মাঝের খাঁজ (furcation) — মসৃণ খিলান
  d = smax(d, -sdEllipsoid(x, y - 0.12, z, 0.09, 0.2, 0.5), 0.06);
  return d;
};

export const Molar: React.FC<P & { color?: string; glow?: number }> = ({ color = "#FBF9F5", glow = 0, ...p }) => {
  const g = useMemo(() => bakeSDF("molar-v1", molarSDF, [0, 0.52, 0], 0.62, 120), []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <PolishedClay color={color} rough={0.3} coat={0.8} emissive="#bfe4ff" emissiveIntensity={glow * 0.25} />
      </mesh>
    </G>
  );
};

// =====================================================================================
// Pharmacy cross — নরম ভেতরের কোণসহ (smin fillet) এক টুকরার plus; প্রস্থ ≈ 1.0
// =====================================================================================
const crossSDF = (x: number, y: number, z: number) => {
  const d2 = smin(sdBox2(x, y, 0.16, 0.48, 0.1), sdBox2(x, y, 0.48, 0.16, 0.1), 0.09);
  return extrudeRound(d2, z, 0.11, 0.075);
};
export const PharmacyCross: React.FC<P & { color?: string; lit?: number }> = ({ color = "#1FB46E", lit = 0, ...p }) => {
  const g = useMemo(() => bakeSDF("cross-v1", crossSDF, [0, 0, 0], 0.56, 100), []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <PolishedClay color={color} rough={0.28} coat={0.85} emissive="#2CFF9A" emissiveIntensity={lit * 0.55} />
      </mesh>
    </G>
  );
};

// =====================================================================================
// T-shirt — 2D silhouette (body + কাঁধ + হাতা, smin) বালিশের মতো extrude, গলায় উঁচু collar rib; উচ্চতা ≈ 0.9
// =====================================================================================
const teeD2 = (x: number, y: number) => {
  let d = sdBox2(x, y + 0.12, 0.3, 0.4, 0.08);
  d = smin(d, sdBox2(x, y - 0.2, 0.34, 0.08, 0.07), 0.06);
  for (const s of [-1, 1]) {
    const [u, v] = rot2(x - s * 0.4, y - 0.12, s * 0.62);
    d = smin(d, sdBox2(u, v, 0.15, 0.115, 0.05), 0.06);
  }
  d = smax(d, -sdCircle2(x, y - 0.33, 0.125), 0.035);
  return d;
};
const teeSDF = (x: number, y: number, z: number) => {
  let d = extrudeRound(teeD2(x, y), z, 0.055, 0.05);
  // collar rib: গলার চারপাশে নরম উঁচু আংটি (শুধু জামার ভেতরে)
  const ring = Math.max(Math.abs(sdCircle2(x, y - 0.33, 0.15)) - 0.024, teeD2(x, y) - 0.005);
  d = smin(d, extrudeRound(ring, z, 0.07, 0.03), 0.02);
  // hem: নিচের কিনারায় হালকা ভাঁজ-রেখা
  d = smax(d, -extrudeRound(sdBox2(x, y + 0.45, 0.4, 0.006, 0.004), z - 0.06, 0.012, 0.006), 0.01);
  return d;
};
export const Tee: React.FC<P & { color?: string }> = ({ color = "#2F9C95", ...p }) => {
  const g = useMemo(() => bakeSDF("tee-v1", teeSDF, [0, -0.05, 0], 0.62, 104), []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <PolishedClay color={color} rough={0.42} coat={0.45} />
      </mesh>
    </G>
  );
};
/** জামা + clay hanger (গলায় দেখা যায়) + satin hook। origin = hook-এর ডগা (ঝোলার বিন্দু); swing = rad */
export const TeeOnHanger: React.FC<P & { color?: string; swing?: number; twist?: number }> = ({ color, swing = 0, twist = 0, ...p }) => {
  const hook = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.36, 0),
      new THREE.Vector3(0, -0.22, 0),
      new THREE.Vector3(0.0, -0.1, 0),
      new THREE.Vector3(0.06, -0.02, 0),
      new THREE.Vector3(0.0, 0.03, 0),
      new THREE.Vector3(-0.07, -0.02, 0),
      new THREE.Vector3(-0.06, -0.08, 0),
    ]);
    return new THREE.TubeGeometry(c, 64, 0.016, 12, false);
  }, []);
  const bar = useMemo(
    () =>
      bakeSDF(
        "hanger-v1",
        (x, y, z) => smin(sdCapsule([x, y, z], [-0.34, -0.52, 0], [0, -0.38, 0], 0.03), sdCapsule([x, y, z], [0.34, -0.52, 0], [0, -0.38, 0], 0.03), 0.03),
        [0, -0.45, 0],
        0.42,
        72
      ),
    []
  );
  return (
    <G {...p}>
      <group rotation={[0, twist, swing]}>
        <mesh geometry={hook} castShadow>
          <Satin color="#d4d8dc" rough={0.28} />
        </mesh>
        <mesh geometry={bar} castShadow>
          <ClayMat color="#C98F5A" rough={0.5} />
        </mesh>
        <Tee color={color} position={[0, -0.84, 0]} />
      </group>
    </G>
  );
};

// =====================================================================================
// Briefcase — rounded body + fused arch handle + lid groove, satin clasps; প্রস্থ ≈ 0.96
// =====================================================================================
const caseSDF = (x: number, y: number, z: number) => {
  const body = sdRoundBox(x, y, z, 0.4, 0.23, 0.08, 0.08);
  let d = body;
  const handle = Math.max(sdTorusXY(x, y - 0.34, z, 0.14, 0.038), -(y - 0.3));
  d = smin(d, handle, 0.035);
  // ঢাকনার খাঁজ চারপাশে
  const groove = Math.max(Math.abs(y - 0.12) - 0.008, -(body + 0.02));
  d = smax(d, -groove, 0.008);
  return d;
};
export const Briefcase: React.FC<P & { color?: string }> = ({ color = "#8A5236", ...p }) => {
  const g = useMemo(() => bakeSDF("case-v1", caseSDF, [0, 0.06, 0], 0.56, 104), []);
  const clasp = useMemo(() => bakeSDF("clasp-v1", (x, y, z) => sdRoundBox(x, y, z, 0.04, 0.03, 0.02, 0.016), [0, 0, 0], 0.1, 32), []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <PolishedClay color={color} rough={0.4} coat={0.55} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={clasp} position={[s * 0.24, 0.12, 0.165]} castShadow>
          <Satin color="#e3c58a" rough={0.25} />
        </mesh>
      ))}
    </G>
  );
};

// =====================================================================================
// Cloche (restaurant) — সাদা tray + চকচকে dome (knob fused) যা উঠে যায়; ভেতরে biryani-র থালা; ভাপের clay puff
// =====================================================================================
const trayD2 = (r: number, y: number) => smin(sdBox2(r, y - 0.035, 0.6, 0.035, 0.03), sdCircle2(r - 0.6, y - 0.06, 0.032), 0.02);
const domeD2 = (r: number, y: number) => {
  let d = Math.max((Math.hypot(r / 0.48, y / 0.42) - 1) * 0.42, -y);
  d = smin(d, sdCircle2(r - 0.48, y - 0.018, 0.024), 0.02);
  d = smin(d, sdBox2(r, y - 0.44, 0.032, 0.05, 0.015), 0.03);
  d = smin(d, sdEllipsoid(r, y - 0.5, 0, 0.085, 0.06, 1), 0.03);
  return d;
};
const dishD2 = (r: number, y: number) => {
  const plate = smax(sdBox2(r, y - 0.03, 0.36, 0.03, 0.025), -sdCircle2(r, y - 0.26, 0.2), 0.02);
  return plate;
};
const riceD2 = (r: number, y: number) => (Math.hypot(r / 0.27, (y - 0.05) / 0.17) - 1) * 0.17;
export const Cloche: React.FC<P & { lift?: number; steam?: number; time?: number }> = ({ lift = 0, steam = 0, time = 0, ...p }) => {
  const tray = useMemo(() => bakeSDF("tray-v1", (x, y, z) => revolve(x, y, z, trayD2), [0, 0.05, 0], 0.66, 96), []);
  const dome = useMemo(() => bakeSDF("dome-v1", (x, y, z) => revolve(x, y, z, domeD2), [0, 0.28, 0], 0.54, 100), []);
  const dish = useMemo(() => bakeSDF("dish-v1", (x, y, z) => revolve(x, y, z, dishD2), [0, 0.04, 0], 0.4, 72), []);
  const rice = useMemo(() => bakeSDF("rice-v1", (x, y, z) => revolve(x, y, z, riceD2) + Math.sin(x * 40) * Math.sin(z * 40) * Math.sin(y * 40) * 0.004, [0, 0.1, 0], 0.3, 72), []);
  const L = Math.max(0, lift);
  return (
    <G {...p}>
      <mesh geometry={tray} castShadow receiveShadow>
        <PolishedClay color="#F7F3EE" rough={0.3} coat={0.7} />
      </mesh>
      <group position={[0, 0.07, 0]}>
        <mesh geometry={dish} castShadow receiveShadow>
          <PolishedClay color="#FFFFFF" rough={0.25} coat={0.8} />
        </mesh>
        <mesh geometry={rice} position={[0, 0.03, 0]} castShadow>
          <ClayMat color="#F2B347" rough={0.62} />
        </mesh>
        {/* ডিম আর সবুজ মরিচ — biryani চেনানো */}
        <mesh position={[0.07, 0.2, 0.1]} scale={[1, 0.82, 1]} castShadow>
          <sphereGeometry args={[0.062, 32, 20]} />
          <PolishedClay color="#FFFDF7" rough={0.3} />
        </mesh>
        <mesh position={[-0.1, 0.19, 0.06]} rotation={[0.3, 0.4, 1.2]} castShadow>
          <capsuleGeometry args={[0.018, 0.12, 6, 12]} />
          <ClayMat color="#3FA34D" rough={0.5} />
        </mesh>
      </group>
      {/* dome: উঠে, পেছনে কাত হয় */}
      <group position={[0, 0.07 + L * 0.55, -L * 0.18]} rotation={[-L * 0.42, 0, 0]}>
        <mesh geometry={dome} castShadow>
          <meshPhysicalMaterial color="#e4e8ec" metalness={1} roughness={0.2} envMapIntensity={1.25} clearcoat={0.5} clearcoatRoughness={0.1} />
        </mesh>
      </group>
      {steam > 0 && <Steam k={steam} time={time} y={0.32} />}
    </G>
  );
};

/** ভাপ: নরম clay puff — উঠতে উঠতে বড় হয়, মিলিয়ে যায়; k = তীব্রতা 0..1 */
export const Steam: React.FC<{ k: number; time: number; y?: number; spread?: number }> = ({ k, time, y = 0, spread = 0.14 }) => (
  <group position={[0, y, 0]}>
    {[-1, 0, 1].map((col) =>
      [0, 1, 2, 3].map((i) => {
        const ph = (time * 0.55 + i / 4 + col * 0.13 + 1) % 1;
        const s = Math.sin(ph * Math.PI) * (0.05 + ph * 0.07);
        const x = col * spread + Math.sin(ph * 6 + col * 2) * 0.05;
        return (
          <mesh key={col + "_" + i} position={[x, ph * 0.7, col * 0.03]} scale={s * k}>
            <sphereGeometry args={[1, 24, 16]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.6} transparent opacity={0.75 * (1 - ph) * k} depthWrite={false} sheen={0.4} sheenColor="#ffffff" />
          </mesh>
        );
      })
    )}
  </group>
);

// =====================================================================================
// Tree — metaball crown (এক টুকরা মেঘ-আকৃতি) + lathe trunk; উচ্চতা ≈ 1.6
// =====================================================================================
const crownSDF = (x: number, y: number, z: number) => {
  const balls: [number, number, number, number][] = [
    [0, 1.1, 0, 0.36],
    [-0.24, 0.98, 0.06, 0.26],
    [0.25, 0.96, -0.02, 0.27],
    [0.06, 1.34, 0.02, 0.26],
    [0.02, 0.98, 0.24, 0.24],
    [-0.04, 1.0, -0.22, 0.24],
  ];
  let d = 1e9;
  for (const [bx, by, bz, r] of balls) d = smin(d, sdSphere(x - bx, y - by, z - bz, r), 0.14);
  return d;
};
export const Tree: React.FC<P & { color?: string; sway?: number }> = ({ color = "#6DBE73", sway = 0, ...p }) => {
  const crown = useMemo(() => bakeSDF("crown-v1", crownSDF, [0, 1.12, 0], 0.62, 80), []);
  const trunk = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.09, 0.0],
          [0.075, 0.08],
          [0.06, 0.4],
          [0.055, 0.85],
          [0.0, 0.9],
        ],
        24
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={trunk} castShadow>
        <ClayMat color="#A9774E" rough={0.6} />
      </mesh>
      <group rotation={[0, 0, sway]}>
        <mesh geometry={crown} castShadow receiveShadow>
          <PolishedClay color={color} rough={0.5} coat={0.3} />
        </mesh>
      </group>
    </G>
  );
};

// =====================================================================================
// Service bell — কালো clay base + চকচকে dome + plunger; press 0..1 (নিচে নামে), ring = wobble rad
// =====================================================================================
export const ServiceBell: React.FC<P & { press?: number; ring?: number }> = ({ press = 0, ring = 0, ...p }) => {
  const base = useMemo(() => roundedCylGeo(0.3, 0.07, 0.03), []);
  const dome = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.26, 0.0],
          [0.255, 0.04],
          [0.23, 0.12],
          [0.17, 0.2],
          [0.08, 0.245],
          [0.0, 0.255],
        ],
        64
      ),
    []
  );
  const plunger = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.018, 0.0],
          [0.018, 0.06],
          [0.05, 0.075],
          [0.052, 0.095],
          [0.0, 0.105],
        ],
        32
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={base} position={[0, 0.035, 0]} castShadow receiveShadow>
        <PolishedClay color="#2B2F36" rough={0.35} coat={0.6} />
      </mesh>
      <group position={[0, 0.07, 0]} rotation={[ring * 0.6, 0, ring]}>
        <mesh geometry={dome} castShadow>
          <meshPhysicalMaterial color="#f0d9a8" metalness={1} roughness={0.16} envMapIntensity={1.3} clearcoat={0.6} clearcoatRoughness={0.08} />
        </mesh>
        <mesh geometry={plunger} position={[0, 0.235 - press * 0.035, 0]} castShadow>
          <meshPhysicalMaterial color="#e8ecef" metalness={1} roughness={0.22} envMapIntensity={1.2} />
        </mesh>
      </group>
    </G>
  );
};

/** ছোট টবের গাছ (interior/reception) — metaball পাতা */
export const PottedPlant: React.FC<P & { color?: string }> = ({ color = "#5FB36A", ...p }) => {
  const pot = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.14, 0.0],
          [0.17, 0.05],
          [0.2, 0.28],
          [0.215, 0.3],
          [0.19, 0.31],
          [0.0, 0.3],
        ],
        40
      ),
    []
  );
  const leaves = useMemo(
    () =>
      bakeSDF(
        "plant-v1",
        (x, y, z) => {
          let d = 1e9;
          const L: [V3, V3, number][] = [
            [[0, 0.28, 0], [-0.2, 0.62, 0.05], 0.07],
            [[0, 0.28, 0], [0.22, 0.6, -0.02], 0.07],
            [[0, 0.28, 0], [0.04, 0.72, 0.02], 0.075],
            [[0, 0.28, 0], [-0.06, 0.58, 0.2], 0.065],
            [[0, 0.28, 0], [0.08, 0.56, -0.2], 0.065],
          ];
          for (const [a, b, r] of L) d = smin(d, sdRoundCone([x, y, z], a, b, r * 0.5, r * 1.25), 0.06);
          return d;
        },
        [0, 0.5, 0],
        0.36,
        72
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={pot} castShadow receiveShadow>
        <PolishedClay color="#E9875A" rough={0.45} coat={0.4} />
      </mesh>
      <mesh geometry={leaves} castShadow>
        <PolishedClay color={color} rough={0.5} coat={0.3} />
      </mesh>
    </G>
  );
};

/** roof-এর satin L-খুঁটি — ডগা (0.12, 1.3, 0)-এ hanger ঝোলে; TeeOnHanger-কে y≈1.26, scale≈0.82-এ রাখুন */
export const HangerStand: React.FC<{ x?: number }> = ({ x = -0.55 }) => {
  const geo = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0.05, 0),
      new THREE.Vector3(x, 1.0, 0),
      new THREE.Vector3(x + 0.06, 1.22, 0),
      new THREE.Vector3(x + 0.25, 1.3, 0),
      new THREE.Vector3(0.12, 1.3, 0),
    ]);
    return new THREE.TubeGeometry(c, 80, 0.035, 16, false);
  }, [x]);
  return (
    <mesh geometry={geo} castShadow>
      <Satin color="#cfd4d8" rough={0.3} />
    </mesh>
  );
};

export { SilverMat };
