// scenes_d shared — Cue contract, beat timing, enter/exit wrapper, polished materials, industry profiles
import React from "react";
import * as THREE from "three";
import { springStep, wobble, popIn, cubicBezier, clamp } from "../../kit/anim";
import { FLOOR } from "../../kit/Stage";
import { C } from "../../kit/theme";

/** scene-শুরু থেকে সেকেন্ড; না পেলে NaN */
export type Cue = (word: string, after?: number) => number;
export type Industry = "dental" | "restaurant" | "ecommerce" | "school" | "realestate" | "clinic" | "travel" | "shop";

export type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
export const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

/** polished clay — নরম sheen + হালকা clearcoat (চকচকে, plastic নয়) */
export const Gloss: React.FC<{ color: string; rough?: number; coat?: number; metal?: number; opacity?: number }> = ({ color, rough = 0.42, coat = 0.55, metal = 0, opacity = 1 }) => (
  <meshPhysicalMaterial
    color={color}
    roughness={rough}
    metalness={metal}
    clearcoat={coat}
    clearcoatRoughness={0.3}
    sheen={0.35}
    sheenColor="#ffe2c4"
    sheenRoughness={0.8}
    transparent={opacity < 1}
    opacity={opacity}
  />
);

/** sample VO-র শব্দ-সময় তালিকা থেকে Cue (showcase-এর জন্য) — substring মিল, after-এর পরের প্রথমটা */
export const makeCue = (list: [string, number][]): Cue => (word, after = -1) => {
  const k = word.toLowerCase();
  const hit = list.find(([w, s]) => s >= after - 1e-6 && w.toLowerCase().includes(k));
  return hit ? hit[1] : NaN;
};

/** cue → সময়; না পেলে fallback (সেকেন্ড) */
export const at = (cue: Cue, word: string | undefined, fallback: number, after?: number) => {
  if (!word) return fallback;
  const v = cue(word, after);
  return Number.isFinite(v) ? v : fallback;
};

export const backIn = cubicBezier(0.36, 0, 0.66, -0.56);
export const k01 = (x: number) => clamp(x, 0, 1);

/** enter (pop/drop/rise) + exit (shrink/sink) — সব বস্তু এর ভেতর দিয়ে, যাতে বেরোনো পুরো হয় (D8) */
export const Life: React.FC<{
  t: number;
  a: number;
  b?: number;
  kind?: "pop" | "rise" | "drop";
  exit?: "shrink" | "sink";
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  outDur?: number;
  children: React.ReactNode;
}> = ({ t, a, b = 1e9, kind = "pop", exit = "shrink", position, scale = 1, rotation, outDur = 0.38, children }) => {
  if (t < a - 0.001 || t > b + outDur + 0.02) return null;
  let [x, y, z] = position;
  let sx = scale,
    sy = scale,
    sz = scale;
  if (kind === "pop") {
    const p = popIn(t, a, { k: 230, c: 15 });
    sx *= p.s * p.sx;
    sy *= p.s * p.sy;
    sz *= p.s;
  } else if (kind === "rise") {
    const k = springStep(t - a, { k: 120, c: 14 });
    y = y - (1 - k) * 4 * scale;
  } else {
    const k = springStep(t - a, { k: 150, c: 12 });
    y = y + (1 - k) * 6;
    const sq = 1 + wobble(t - a - 0.18, 0.12, 3, 0.25);
    sy *= sq;
    sx /= Math.sqrt(sq);
    sz /= Math.sqrt(sq);
  }
  if (t > b) {
    const e = Math.min(1, (t - b) / outDur);
    if (exit === "shrink") {
      const s = Math.max(0, 1 - backIn(e));
      sx *= s;
      sy *= s;
      sz *= s;
    } else {
      y -= e * e * 5 * scale;
      if (e >= 1) return null;
    }
  }
  if (sx < 1e-4 || sy < 1e-4) return null;
  return (
    <group position={[x, y, z]} scale={[sx, sy, sz]} rotation={rotation as any}>
      {children}
    </group>
  );
};

/** floor-এর নিচের অংশ কাটা (rise/sink-এর জন্য) */
export const FLOOR_PLANE = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR)];

/** industry profile — রং আর পরিচয়-বস্তু (emblem); প্রতিটা industry-র point/check-এর default object */
export type IconKey =
  | "tooth"
  | "calendar"
  | "clock"
  | "phone"
  | "pin"
  | "star"
  | "cart"
  | "bag"
  | "truck"
  | "cloche"
  | "cap"
  | "house"
  | "key"
  | "shield"
  | "chat"
  | "search"
  | "card"
  | "chart"
  | "heart"
  | "bolt"
  | "bell"
  | "photo"
  | "coins"
  | "cross"
  | "book"
  | "globe"
  | "plane";

export type Profile = { accent: string; accent2: string; ink: string; board: string; emblem: IconKey; name: string; defaults: IconKey[] };
export const PROFILES: Record<Industry, Profile> = {
  dental: { accent: C.steel, accent2: C.orange, ink: C.deepNavy, board: C.navy, emblem: "tooth", name: "DENTAL", defaults: ["tooth", "calendar", "pin", "star", "phone"] },
  clinic: { accent: "#2E8F83", accent2: C.orange, ink: C.deepNavy, board: "#1E5E64", emblem: "cross", name: "CLINIC", defaults: ["cross", "calendar", "phone", "pin", "shield"] },
  restaurant: { accent: C.deepOrange, accent2: "#F2B63D", ink: "#4A2414", board: "#7A3B1F", emblem: "cloche", name: "RESTAURANT", defaults: ["cloche", "truck", "star", "clock", "chat"] },
  ecommerce: { accent: "#E0457B", accent2: C.orange, ink: C.deepNavy, board: C.deepNavy, emblem: "bag", name: "ONLINE SHOP", defaults: ["bag", "cart", "card", "truck", "chat"] },
  shop: { accent: C.orange, accent2: C.steel, ink: C.deepNavy, board: C.navy, emblem: "bag", name: "SHOP", defaults: ["bag", "pin", "clock", "star", "phone"] },
  school: { accent: "#3D6FD1", accent2: "#F2B63D", ink: C.deepNavy, board: "#23407A", emblem: "cap", name: "SCHOOL", defaults: ["cap", "book", "calendar", "chat", "chart"] },
  realestate: { accent: "#1F9D72", accent2: C.orange, ink: C.deepNavy, board: "#1A4E45", emblem: "house", name: "REAL ESTATE", defaults: ["house", "photo", "pin", "key", "phone"] },
  travel: { accent: "#1B8FC4", accent2: C.orange, ink: C.deepNavy, board: "#145A80", emblem: "plane", name: "TRAVEL", defaults: ["plane", "calendar", "card", "pin", "chat"] },
};

/** লম্বা label-এ font size ছোট (C6) */
export const fitSize = (text: string, maxW: number, max: number, per = 0.64) => Math.min(max, maxW / Math.max(1, text.length * per));
