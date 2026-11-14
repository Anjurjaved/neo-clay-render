// scenes_h — shared: Cue type + sample-cue builder, Industry table, one-piece industry sign objects (SDF-baked / lathe /
// bevelled extrude — no visible seams), small helpers. Used by BeforeAfter.tsx and Cta.tsx.
import React, { useMemo } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { ClayMat } from "../../kit/Clay";
import { latheGeo, shapeGeo, roundedCylGeo } from "../../kit/Geo";
import { C } from "../../kit/theme";

export type V3 = [number, number, number];
export type Cue = (word: string, after?: number) => number; // scene-start seconds; NaN if not found

const norm = (s: string) => s.replace(/[।,?!.\-]/g, "").toLowerCase();
/** sample VO word list → Cue (same matching rule as wd004/cues: substring, first at/after `after`) */
export const mkCue = (words: [string, number][]): Cue => (w, after = 0) => {
  const k = norm(w);
  const hit = words.find(([x, s]) => s >= after - 1e-6 && norm(x).includes(k));
  return hit ? hit[1] : NaN;
};
/** cue with fallback (fraction of dur) */
export const at = (cue: Cue, word: string | undefined, fallback: number, after = 0) => {
  if (!word) return fallback;
  const v = cue(word, after);
  return Number.isFinite(v) ? v : fallback;
};

export type Industry = "dental" | "restaurant" | "ecommerce" | "school" | "realestate" | "clinic";

export type IndustryDef = {
  sign: string; // default shop sign
  noun: string; // "DENTAL CHAMBER" (3D, English)
  web: string; // site hero: "Websites for dental chambers"
  bnWeb: string; // Bangla line on the site (DOM)
  order: string; // notification title: "New booking"
  orderUnit: string; // stat unit: "BOOKINGS"
  who: string[]; // notification sample customer names
  what: string[]; // notification detail lines
  accent: string; // brand accent of the business
  signColor: string;
};

export const IND: Record<Industry, IndustryDef> = {
  dental: {
    sign: "SMILE DENTAL",
    noun: "DENTAL CHAMBER",
    web: "Websites for dental chambers",
    bnWeb: "রোগী নিজেই online-এ serial নেবেন",
    order: "New booking",
    orderUnit: "BOOKINGS",
    who: ["Nusrat J.", "Rafiq H.", "Tanvir A.", "Mitu S."],
    what: ["Scaling · Sat 5:30 PM", "Root canal · Sun 6 PM", "Check-up · Mon 7 PM", "Braces consult · Tue"],
    accent: "#2F80C9",
    signColor: C.navy,
  },
  restaurant: {
    sign: "SPICE HOUSE",
    noun: "RESTAURANT",
    web: "Websites for restaurants",
    bnWeb: "Menu দেখে সরাসরি order",
    order: "New order",
    orderUnit: "ORDERS / WEEK",
    who: ["Table 4 · Sabbir", "Home delivery · Riya", "Takeaway · Imran", "Table 2 · Shuvo"],
    what: ["Kacchi x2 · ৳ 760", "Beef tehari · ৳ 320", "Chicken roast x3 · ৳ 690", "Borhani x4 · ৳ 240"],
    accent: "#D85E24",
    signColor: C.deepOrange,
  },
  ecommerce: {
    sign: "TRENDY WEAR",
    noun: "ONLINE SHOP",
    web: "Websites for online shops",
    bnWeb: "রাত দুইটাতেও order আসে",
    order: "New order",
    orderUnit: "ORDERS / MONTH",
    who: ["Order #1042", "Order #1043", "Order #1044", "Order #1045"],
    what: ["Panjabi (L) · bKash paid", "Kurti x2 · Cash on delivery", "T-shirt x3 · Nagad paid", "Saree · bKash paid"],
    accent: "#7A4BD1",
    signColor: C.navy,
  },
  school: {
    sign: "BRIGHT COACHING",
    noun: "COACHING CENTRE",
    web: "Websites for schools & coaching",
    bnWeb: "ভর্তির form এখন online-এ",
    order: "New admission",
    orderUnit: "ADMISSIONS",
    who: ["Arif (Class 9)", "Sumaiya (HSC)", "Nabil (Class 8)", "Tasnim (SSC)"],
    what: ["Science batch · Form received", "Physics + Math · Paid", "English batch · Form received", "Model test · Paid"],
    accent: "#1F9D55",
    signColor: "#1F7A4A",
  },
  realestate: {
    sign: "GREEN HOMES",
    noun: "REAL ESTATE",
    web: "Websites for real estate",
    bnWeb: "Flat-এর ছবি দেখে সরাসরি visit",
    order: "New enquiry",
    orderUnit: "ENQUIRIES",
    who: ["Mr. Karim", "Mrs. Sultana", "Mr. Habib", "Ms. Ferdous"],
    what: ["1,450 sft · Mirpur 10", "Site visit · Friday", "3-bed flat · Uttara", "Price list request"],
    accent: "#1B7F6E",
    signColor: "#1B5F55",
  },
  clinic: {
    sign: "CITY CLINIC",
    noun: "CLINIC",
    web: "Websites for clinics",
    bnWeb: "Doctor-এর serial এখন online-এ",
    order: "New appointment",
    orderUnit: "APPOINTMENTS",
    who: ["Rahima B.", "Jahid K.", "Shapla R.", "Monir U."],
    what: ["Medicine · Dr. Alam · 6 PM", "Child specialist · Sat", "ECG test · Sun 10 AM", "Gynae · Mon 5 PM"],
    accent: "#D0393E",
    signColor: "#B8333A",
  },
};

// ---------------- SDF bake (one smooth mesh) ----------------
const cache = new Map<string, THREE.BufferGeometry>();
export const bakeSDF = (key: string, sdf0: (x: number, y: number, z: number) => number, half: number, res = 80, yOff = 0) => {
  const sdf = (x: number, y: number, z: number) => sdf0(x, y + yOff, z); // grid centred at y = yOff
  const hit = cache.get(key);
  if (hit) return hit;
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 160000);
  mc.isolation = 80;
  const K = 40;
  for (let z = 0; z < res; z++)
    for (let y = 0; y < res; y++)
      for (let x = 0; x < res; x++) {
        const fx = ((x - res / 2) / (res / 2)) * half;
        const fy = ((y - res / 2) / (res / 2)) * half;
        const fz = ((z - res / 2) / (res / 2)) * half;
        mc.field[res * res * z + res * y + x] = 80 - (sdf(fx, fy, fz) / half) * K * res * 0.5;
      }
  mc.update();
  const n = mc.count;
  const src = mc.geometry;
  const pa = (src.getAttribute("position").array as Float32Array).slice(0, n * 3);
  for (let i = 0; i < pa.length; i++) pa[i] *= half;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3));
  // normals from the SDF gradient (smoother than MC face normals)
  const na = new Float32Array(pa.length);
  const e = half / res;
  for (let i = 0; i < pa.length; i += 3) {
    const [x, y, z] = [pa[i], pa[i + 1], pa[i + 2]];
    const nx = sdf(x + e, y, z) - sdf(x - e, y, z);
    const ny = sdf(x, y + e, z) - sdf(x, y - e, z);
    const nz = sdf(x, y, z + e) - sdf(x, y, z - e);
    const l = Math.hypot(nx, ny, nz) || 1;
    na[i] = nx / l;
    na[i + 1] = ny / l;
    na[i + 2] = nz / l;
  }
  g.setAttribute("normal", new THREE.Float32BufferAttribute(na, 3));
  const pz = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pz.count; i++) pz.setY(i, pz.getY(i) + yOff);
  g.computeBoundingSphere();
  src.dispose();
  cache.set(key, g);
  return g;
};
const smin = (a: number, b: number, k: number) => {
  const h = Math.max(0, Math.min(1, 0.5 + (0.5 * (b - a)) / k));
  return b * (1 - h) + a * h - k * h * (1 - h);
};
const sdEll = (x: number, y: number, z: number, a: number, b: number, c: number) => {
  const k0 = Math.hypot(x / a, y / b, z / c);
  const k1 = Math.hypot(x / (a * a), y / (b * b), z / (c * c));
  return k1 < 1e-9 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
};
const sdCap = (x: number, y: number, z: number, a: V3, b: V3, r: number) => {
  const pa = [x - a[0], y - a[1], z - a[2]];
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const h = Math.max(0, Math.min(1, (pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / (ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2)));
  return Math.hypot(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - r;
};
const sdRBox = (x: number, y: number, z: number, bx: number, by: number, bz: number, r: number) => {
  const qx = Math.abs(x) - bx + r,
    qy = Math.abs(y) - by + r,
    qz = Math.abs(z) - bz + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
};
const sdTorusZ = (x: number, y: number, z: number, R: number, r: number) => Math.hypot(Math.hypot(x, y) - R, z) - r;

// ---------------- industry sign objects (≈1 world unit tall, base at y=0, front +z) ----------------
type P = { position?: V3; rotation?: V3; scale?: number | V3; glow?: number };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);
const Gloss: React.FC<{ color: string; glow?: number; rough?: number }> = ({ color, glow = 0, rough = 0.34 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.65} clearcoatRoughness={0.22} sheen={0.35} sheenColor="#ffe6cc" emissive={color} emissiveIntensity={glow * 0.55} envMapIntensity={1} />
);

/** molar: crown + 4 cusps + 2 roots fused (smooth-min) */
export const ToothSign: React.FC<P> = ({ glow = 0, ...p }) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "tooth2",
        (x, y, z) => {
          let d = sdEll(x, y - 0.62, z, 0.4, 0.27, 0.34);
          for (const [cx, cz] of [
            [-0.17, -0.14],
            [0.17, -0.14],
            [-0.17, 0.14],
            [0.17, 0.14],
          ])
            d = smin(d, Math.hypot(x - cx, y - 0.8, z - cz) - 0.17, 0.12);
          d = smin(d, sdCap(x, y, z, [-0.16, 0.5, 0], [-0.21, 0.08, 0], 0.12), 0.14);
          d = smin(d, sdCap(x, y, z, [0.16, 0.5, 0], [0.21, 0.08, 0], 0.12), 0.14);
          return d;
        },
        0.6,
        84,
        0.5
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} position={[0, -0.04, 0]} castShadow>
        <meshPhysicalMaterial color="#FBFBF8" roughness={0.28} clearcoat={0.9} clearcoatRoughness={0.12} sheen={0.3} sheenColor="#dfeeff" emissive="#cfe6ff" emissiveIntensity={glow * 0.35} />
      </mesh>
    </G>
  );
};

/** restaurant cloche on a plate — one lathe profile */
export const ClocheSign: React.FC<P> = ({ glow = 0, ...p }) => {
  const body = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.55, 0.0],
          [0.66, 0.04],
          [0.7, 0.08],
          [0.6, 0.1],
          [0.5, 0.13],
          [0.49, 0.26],
          [0.43, 0.48],
          [0.3, 0.65],
          [0.12, 0.74],
          [0.07, 0.77],
          [0.09, 0.84],
          [0.07, 0.9],
          [0.0, 0.91],
        ],
        72,
        120
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={body} castShadow>
        <meshPhysicalMaterial color="#E2E6EA" metalness={0.85} roughness={0.3} clearcoat={0.4} envMapIntensity={1.15} emissive="#ffb070" emissiveIntensity={glow * 0.12} />
      </mesh>
    </G>
  );
};

/** shopping bag with handle — fused */
export const BagSign: React.FC<P & { color?: string }> = ({ glow = 0, color = "#7A4BD1", ...p }) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "bag2",
        (x, y, z) => {
          const taper = 1 - (y - 0.33) * 0.12;
          const d = sdRBox(x / taper, y - 0.33, z, 0.34, 0.31, 0.15, 0.09);
          const h = sdTorusZ(x, y - 0.66, z, 0.15, 0.035);
          return smin(Math.max(h, -(y - 0.6)), d, 0.05);
        },
        0.55,
        84,
        0.45
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <Gloss color={color} glow={glow} rough={0.42} />
      </mesh>
    </G>
  );
};

/** graduation cap: skull + square board + tassel fused */
export const CapSign: React.FC<P & { color?: string }> = ({ glow = 0, color = "#1F3B63", ...p }) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "cap2",
        (x, y, z) => {
          const skull = Math.max(sdEll(x, y - 0.36, z, 0.33, 0.3, 0.33), -(y - 0.22));
          // board rotated 45° around y (diamond seen from front)
          const c = Math.SQRT1_2;
          const rx = c * x - c * z,
            rz = c * x + c * z;
          const board = sdRBox(rx, y - 0.6, rz, 0.44, 0.035, 0.44, 0.03);
          let d = smin(skull, board, 0.08);
          d = smin(d, Math.hypot(x, y - 0.65, z) - 0.06, 0.03);
          d = smin(d, sdCap(x, y, z, [0.0, 0.64, 0.0], [0.42, 0.6, 0.18], 0.022), 0.02);
          d = smin(d, sdCap(x, y, z, [0.42, 0.6, 0.18], [0.44, 0.28, 0.2], 0.022), 0.02);
          d = smin(d, sdEll(x - 0.44, y - 0.24, z - 0.2, 0.05, 0.09, 0.05), 0.03);
          return d;
        },
        0.62,
        90,
        0.38
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <Gloss color={color} glow={glow} rough={0.45} />
      </mesh>
    </G>
  );
};

const houseShape = () => {
  const s = new THREE.Shape();
  const r = 0.06;
  s.moveTo(-0.38 + r, 0);
  s.lineTo(0.38 - r, 0);
  s.quadraticCurveTo(0.38, 0, 0.38, r);
  s.lineTo(0.38, 0.5);
  s.lineTo(0.47, 0.5);
  s.quadraticCurveTo(0.53, 0.52, 0.49, 0.57);
  s.lineTo(0.05, 0.95);
  s.quadraticCurveTo(0, 0.99, -0.05, 0.95);
  s.lineTo(-0.49, 0.57);
  s.quadraticCurveTo(-0.53, 0.52, -0.47, 0.5);
  s.lineTo(-0.38, 0.5);
  s.lineTo(-0.38, r);
  s.quadraticCurveTo(-0.38, 0, -0.38 + r, 0);
  const door = new THREE.Path();
  door.moveTo(-0.1, 0.0001 + 0.06);
  door.lineTo(0.1, 0.06);
  door.lineTo(0.1, 0.32);
  door.absarc(0, 0.32, 0.1, 0, Math.PI, false);
  door.lineTo(-0.1, 0.06);
  s.holes.push(door);
  return s;
};
/** house (real estate) — one bevelled extrude, arched door cut-out */
export const HouseSign: React.FC<P & { color?: string; roof?: string }> = ({ glow = 0, color = "#1B7F6E", ...p }) => {
  const g = useMemo(() => {
    const geo = shapeGeo(houseShape(), 0.2, 0.06, 6);
    geo.translate(0, 0, -0.1);
    return geo;
  }, []);
  const chimney = useMemo(() => roundedCylGeo(0.06, 0.24, 0.03, 32), []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <Gloss color={color} glow={glow} rough={0.42} />
      </mesh>
      <mesh geometry={chimney} position={[0.25, 0.78, -0.02]} castShadow>
        <Gloss color={color} glow={glow} rough={0.42} />
      </mesh>
    </G>
  );
};

const crossShape = () => {
  const s = new THREE.Shape();
  const a = 0.15,
    b = 0.45,
    r = 0.07;
  const pts: [number, number][] = [
    [-a, -b],
    [a, -b],
    [a, -a],
    [b, -a],
    [b, a],
    [a, a],
    [a, b],
    [-a, b],
    [-a, a],
    [-b, a],
    [-b, -a],
    [-a, -a],
  ];
  // rounded outer corners (inner corners get a small fillet too)
  const n = pts.length;
  pts.forEach((p0, i) => {
    const pPrev = pts[(i - 1 + n) % n],
      pNext = pts[(i + 1) % n];
    const d1 = [pPrev[0] - p0[0], pPrev[1] - p0[1]],
      d2 = [pNext[0] - p0[0], pNext[1] - p0[1]];
    const l1 = Math.hypot(d1[0], d1[1]),
      l2 = Math.hypot(d2[0], d2[1]);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a1: [number, number] = [p0[0] + (d1[0] / l1) * rr, p0[1] + (d1[1] / l1) * rr];
    const a2: [number, number] = [p0[0] + (d2[0] / l2) * rr, p0[1] + (d2[1] / l2) * rr];
    if (i === 0) s.moveTo(...a1);
    else s.lineTo(...a1);
    s.quadraticCurveTo(p0[0], p0[1], a2[0], a2[1]);
  });
  s.closePath();
  return s;
};
/** medical cross (clinic) */
export const CrossSign: React.FC<P & { color?: string }> = ({ glow = 0, color = "#D0393E", ...p }) => {
  const g = useMemo(() => {
    const geo = shapeGeo(crossShape(), 0.16, 0.07, 6);
    geo.translate(0, 0.5, -0.08);
    return geo;
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <Gloss color={color} glow={glow} rough={0.36} />
      </mesh>
    </G>
  );
};

/** industry → sign object */
export const IndustrySign: React.FC<P & { industry: Industry }> = ({ industry, ...p }) => {
  switch (industry) {
    case "dental":
      return <ToothSign {...p} />;
    case "restaurant":
      return <ClocheSign {...p} />;
    case "ecommerce":
      return <BagSign {...p} color={IND.ecommerce.accent} />;
    case "school":
      return <CapSign {...p} />;
    case "realestate":
      return <HouseSign {...p} />;
    case "clinic":
      return <CrossSign {...p} />;
  }
};

/** soft round disc pedestal (what a sign object sits on in mid-air) */
export const Puck: React.FC<P & { r?: number; color?: string }> = ({ r = 0.55, color = "#F4EEE6", ...p }) => {
  const g = useMemo(() => roundedCylGeo(r, 0.16, 0.07, 72), [r]);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <ClayMat color={color} />
      </mesh>
    </G>
  );
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
