// scenes_e shared — Cue contract, industry theme, beat resolver, enter/exit wrapper, polished clay material
import React from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { clayNoise } from "../../kit/Clay";
import { FLOOR } from "../../kit/Stage";
import { springStep, wobble, popIn, cubicBezier } from "../../kit/anim";
import { FPS } from "../../kit/time";
import { C } from "../../kit/theme";

/** scene-শুরু থেকে সেকেন্ড; না পেলে NaN */
export type Cue = (word: string, after?: number) => number;
export type Industry = "dental" | "restaurant" | "ecommerce" | "school" | "realestate";
/** step/station-এর অর্থবহ object — প্রতিটা নিজের কাজ করে (act 0→1) */
export type ActKind = "phone" | "chat" | "search" | "calendar" | "pay" | "form" | "tooth" | "cloche" | "bag" | "box" | "book" | "house" | "key" | "check";

export type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
export const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

export const useT = () => useCurrentFrame() / FPS;
export const k01 = (x: number) => Math.max(0, Math.min(1, x));
export const mixHex = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), k01(k)).getHexString();
export const backIn = cubicBezier(0.36, 0, 0.66, -0.56);

/** industry → রং, landmark object, default step icon-ক্রম, চরিত্রের রং */
export type Theme = { accent: string; pad: string; landmark: ActKind; icons: ActKind[]; figure: string; coat?: string; name: string };
export const THEMES: Record<Industry, Theme> = {
  dental: { accent: "#2FA7B8", pad: "#5CC3CF", landmark: "tooth", icons: ["phone", "calendar", "tooth", "pay", "check"], figure: C.figure, name: "DENTAL" },
  restaurant: { accent: "#E0553A", pad: "#F07A55", landmark: "cloche", icons: ["search", "chat", "pay", "cloche", "check"], figure: C.figure, name: "RESTAURANT" },
  ecommerce: { accent: C.orange, pad: "#F7A94E", landmark: "bag", icons: ["search", "bag", "pay", "box", "check"], figure: C.figure, name: "SHOP" },
  school: { accent: "#3E6E9E", pad: "#6E98C4", landmark: "book", icons: ["form", "pay", "calendar", "book", "check"], figure: C.figure, name: "SCHOOL" },
  realestate: { accent: "#2E9E62", pad: "#58B985", landmark: "house", icons: ["search", "house", "form", "key", "check"], figure: C.figure, name: "PROPERTY" },
};

/** sample VO শব্দ-সময় তালিকা → Cue (showcase-এর জন্য) */
export const makeCue = (words: [string, number][]): Cue => (w, after = 0) => {
  const k = w.toLowerCase();
  const hit = words.find(([x, s]) => s >= after - 1e-6 && x.toLowerCase().includes(k));
  return hit ? hit[1] : NaN;
};

/**
 * beat সময় বের করা: প্রতিটা শব্দ cue-তে খোঁজা (আগের beat-এর পরে), না পেলে / খুব কাছে হলে fallback =
 * [t0, t1]-এ সমান ভাগ। ফল সবসময় বাড়ন্ত, মাঝে অন্তত minGap।
 */
export const resolveBeats = (cue: Cue, words: (string | undefined)[], t0: number, t1: number, minGap = 0.8) => {
  const n = words.length;
  const out: number[] = [];
  let prev = t0 - minGap;
  words.forEach((w, i) => {
    const fb = n === 1 ? t0 : t0 + ((t1 - t0) * i) / (n - 1);
    let v = w ? cue(w, prev + 0.05) : NaN;
    if (!isFinite(v) || v > t1 + 0.6) v = fb;
    v = Math.max(v, prev + minGap, t0);
    out.push(v);
    prev = v;
  });
  return out;
};

/** polished clay glaze — vertex colour (SDF bake) বা একক রং */
export const Glaze: React.FC<{ color?: string; vc?: boolean; rough?: number; coat?: number; emissive?: string; emissiveIntensity?: number; clip?: THREE.Plane[]; opacity?: number; bump?: number }> = ({
  color = "#ffffff",
  vc,
  rough = 0.4,
  coat = 0.55,
  emissive,
  emissiveIntensity = 0,
  clip,
  opacity = 1,
  bump = 0.05,
}) => (
  <meshPhysicalMaterial
    color={color}
    vertexColors={!!vc}
    roughness={rough}
    metalness={0}
    clearcoat={coat}
    clearcoatRoughness={0.22}
    sheen={0.35}
    sheenRoughness={0.7}
    sheenColor="#ffe4cf"
    bumpMap={clayNoise()}
    bumpScale={bump}
    emissive={emissive ?? "#000000"}
    emissiveIntensity={emissive ? emissiveIntensity : 0}
    envMapIntensity={0.95}
    clippingPlanes={clip}
    transparent={opacity < 1}
    opacity={opacity}
  />
);
export const Metal: React.FC<{ color?: string; rough?: number }> = ({ color = "#d6dade", rough = 0.32 }) => (
  <meshPhysicalMaterial color={color} metalness={0.9} roughness={rough} clearcoat={0.3} clearcoatRoughness={0.3} envMapIntensity={1.1} />
);

/** appear (pop/rise/drop) + exit (shrink/sink/up) wrapper — scene-এর সব বস্তু এর ভেতরে */
export const Life: React.FC<{
  t: number;
  a: number;
  b?: number;
  kind?: "pop" | "rise" | "drop";
  exit?: "shrink" | "sink" | "up";
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  outDur?: number;
  dropH?: number;
  children: React.ReactNode;
}> = ({ t, a, b = 999, kind = "pop", exit = "shrink", position, scale = 1, rotation, outDur = 0.38, dropH = 5, children }) => {
  if (t < a - 0.02 || t > b + outDur + 0.02) return null;
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
    y = y + (1 - k) * dropH;
    const sq = 1 + wobble(t - a - 0.18, 0.12, 3, 0.25);
    sy *= sq;
    sx /= Math.sqrt(sq);
    sz /= Math.sqrt(sq);
  }
  if (t > b) {
    const e = Math.min(1, (t - b) / outDur);
    if (exit === "shrink") {
      const s = Math.max(0.0001, 1 - backIn(e));
      sx *= s;
      sy *= s;
      sz *= s;
    } else if (exit === "sink") {
      y -= e * e * 5 * scale;
    } else {
      y += e * e * 8;
      const s = Math.max(0.0001, 1 - e);
      sx *= s;
      sy *= s;
      sz *= s;
    }
  }
  return (
    <group position={[x, y, z]} scale={[Math.max(1e-4, sx), Math.max(1e-4, sy), Math.max(1e-4, sz)]} rotation={rotation as any}>
      {children}
    </group>
  );
};

export const FLOOR_Y = FLOOR;

// ---------------------------------------------------------------- walker (wave-1 lib Character — এক টুকরার clay figure)
import { Character, Role } from "../characters/Character";
import { walk as walkPose, cheer as cheerPose, mixPose } from "../characters/poses";
/** dist = world হাঁটা দূরত্ব, walk = তীব্রতা 0..1, cheer 0..1, squash = landing */
export const Walker: React.FC<{ t: number; dist: number; walk: number; cheer?: number; role?: Role; color?: string; rotationY?: number; scale?: number; squash?: number; lean?: number }> = ({
  t,
  dist,
  walk,
  cheer = 0,
  role = "customer",
  color,
  rotationY = 0,
  scale = 1,
  squash = 1,
  lean = 0,
}) => {
  let p = walkPose(dist / scale, k01(walk));
  if (cheer > 0) p = mixPose(p, cheerPose(t, 1), k01(cheer));
  if (lean) p = { ...p, lean: p.lean + lean };
  return <Character pose={p} role={role} color={color} rotationY={rotationY} scale={scale} squash={squash} cell={0.016} />;
};
