// scenes_a shared — Cue contract, sample-cue builder, Life (enter/exit wrapper), SDF bake (one-piece mesh + vertex colour)
import React from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { FLOOR } from "../../kit/Stage";
import { springStep, wobble, popIn, cubicBezier } from "../../kit/anim";

export type V3 = [number, number, number];
export type P = { position?: V3; rotation?: V3; scale?: number | V3 };
export const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

/** scene-শুরু থেকে সেকেন্ড; না পেলে NaN */
export type Cue = (word: string, after?: number) => number;

const norm = (s: string) => s.replace(/[।,?!.\-—'"“”‘’:;]/g, "").toLowerCase();
/** sample VO-র আনুমানিক শব্দ-সময় তালিকা → Cue (substring match, after-এর পরের প্রথমটা) */
export const makeCue = (words: [string, number][]): Cue => (w, after = 0) => {
  const k = norm(w);
  if (!k) return NaN;
  const hit = words.find(([x, t]) => t >= after - 1e-6 && norm(x).includes(k));
  return hit ? hit[1] : NaN;
};
/** cue বা fallback — word না থাকলে / না পেলে fallback সেকেন্ড */
export const cueOr = (cue: Cue, word: string | undefined, fallback: number, after = 0) => {
  if (!word) return fallback;
  const v = cue(word, after);
  return Number.isFinite(v) ? v : fallback;
};

export const backIn = cubicBezier(0.36, 0, 0.66, -0.56);
export const k01 = (x: number) => Math.max(0, Math.min(1, x));

/** appear (pop/rise/drop) + exit (shrink/sink/up) — পুরো বেরিয়ে unmount */
export const Life: React.FC<{
  t: number;
  a: number;
  b?: number;
  kind?: "pop" | "rise" | "drop";
  exit?: "shrink" | "sink" | "up";
  position: V3;
  scale?: number;
  rotation?: V3;
  outDur?: number;
  children: React.ReactNode;
}> = ({ t, a, b = 999, kind = "pop", exit = "shrink", position, scale = 1, rotation, outDur = 0.38, children }) => {
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
    y = FLOOR + (y - FLOOR) - (1 - k) * 4 * scale;
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
    } else if (exit === "sink") {
      y -= e * e * 5 * scale;
      if (e >= 1) return null;
    } else {
      y += e * e * 8;
      const s = 1 - e;
      sx *= s;
      sy *= s;
      sz *= s;
    }
  }
  if (sx <= 1e-4) return null;
  return (
    <group position={[x, y, z]} scale={[sx, sy, sz]} rotation={rotation as any}>
      {children}
    </group>
  );
};

/** enter/exit scale only (screen-ওয়ালা device-এর জন্য — floor থেকে নয়, LESSONS D2) */
export const lifeScale = (t: number, a: number, b: number, outDur = 0.35) => {
  if (t < a) return 0;
  const p = popIn(t, a, { k: 200, c: 15 }).s;
  const e = t > b ? Math.min(1, (t - b) / outDur) : 0;
  return Math.max(0, p * (1 - backIn(e)));
};

// ---------------- SDF helpers ----------------
export type SDF = (x: number, y: number, z: number) => number;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return Math.min(a, b);
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
};
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
export const sdSphere = (x: number, y: number, z: number, r: number) => Math.hypot(x, y, z) - r;
export const sdEllipsoid = (x: number, y: number, z: number, a: number, b: number, c: number) => {
  const k0 = Math.hypot(x / a, y / b, z / c);
  const k1 = Math.hypot(x / (a * a), y / (b * b), z / (c * c));
  return k1 === 0 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
};
export const sdRoundBox = (x: number, y: number, z: number, bx: number, by: number, bz: number, r: number) => {
  const qx = Math.abs(x) - bx,
    qy = Math.abs(y) - by,
    qz = Math.abs(z) - bz;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
};
export const sdCapsule = (p: V3, a: V3, b: V3, ra: number, rb = ra) => {
  const bax = b[0] - a[0],
    bay = b[1] - a[1],
    baz = b[2] - a[2];
  const pax = p[0] - a[0],
    pay = p[1] - a[1],
    paz = p[2] - a[2];
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - (ra + (rb - ra) * h);
};
export const sdTorusXY = (x: number, y: number, z: number, R: number, r: number) => Math.hypot(Math.hypot(x, y) - R, z) - r;
export const rot2 = (x: number, y: number, a: number): [number, number] => [x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a)];

const CACHE = new Map<string, THREE.BufferGeometry>();
/**
 * SDF → এক টুকরার মসৃণ mesh (MarchingCubes, module cache)। color(x,y,z) দিলে vertex colour (একই mesh-এ একাধিক রং,
 * কোনো জোড়া ছাড়া)। center/extent = bounding cube half-size।
 */
export const bakeSDF = (key: string, sdf: SDF, center: V3, extent: number, res = 96, color?: (x: number, y: number, z: number) => string): THREE.BufferGeometry => {
  const hit = CACHE.get(key);
  if (hit) return hit;
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 500000) as any;
  mc.isolation = 0;
  const n: number = mc.size,
    hs: number = mc.halfsize,
    field: Float32Array = mc.field;
  const K = 100 / extent;
  for (let z = 0; z < n; z++) {
    const wz = center[2] + ((z - hs) / hs) * extent;
    for (let y = 0; y < n; y++) {
      const wy = center[1] + ((y - hs) / hs) * extent;
      const row = z * n * n + y * n;
      for (let x = 0; x < n; x++) {
        const wx = center[0] + ((x - hs) / hs) * extent;
        field[row + x] = -sdf(wx, wy, wz) * K;
      }
    }
  }
  mc.update();
  const cnt: number = mc.count;
  const pos = new Float32Array(cnt * 3);
  const nor = new Float32Array(cnt * 3);
  const PA: Float32Array = mc.positionArray,
    NA: Float32Array = mc.normalArray;
  for (let i = 0; i < cnt; i++) {
    const o = i * 3;
    pos[o] = center[0] + PA[o] * extent;
    pos[o + 1] = center[1] + PA[o + 1] * extent;
    pos[o + 2] = center[2] + PA[o + 2] * extent;
    const l = Math.hypot(NA[o], NA[o + 1], NA[o + 2]) || 1;
    nor[o] = NA[o] / l;
    nor[o + 1] = NA[o + 1] / l;
    nor[o + 2] = NA[o + 2] / l;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  const uv = new Float32Array(cnt * 2);
  for (let i = 0; i < cnt; i++) {
    const nx = Math.abs(nor[i * 3]),
      ny = Math.abs(nor[i * 3 + 1]),
      nz = Math.abs(nor[i * 3 + 2]);
    const [a, b] = nx > ny && nx > nz ? [pos[i * 3 + 2], pos[i * 3 + 1]] : ny > nz ? [pos[i * 3], pos[i * 3 + 2]] : [pos[i * 3], pos[i * 3 + 1]];
    uv[i * 2] = a * 1.5;
    uv[i * 2 + 1] = b * 1.5;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  if (color) {
    const col = new Float32Array(cnt * 3);
    const c = new THREE.Color();
    const memo = new Map<string, THREE.Color>();
    for (let i = 0; i < cnt; i++) {
      const hex = color(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      let cc = memo.get(hex);
      if (!cc) {
        cc = c.clone().set(hex); // sRGB hex → linear (ColorManagement)
        memo.set(hex, cc);
      }
      col[i * 3] = cc.r;
      col[i * 3 + 1] = cc.g;
      col[i * 3 + 2] = cc.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  g.computeBoundingSphere();
  g.computeBoundingBox();
  mc.geometry.dispose();
  CACHE.set(key, g);
  return g;
};

/** deterministic pseudo-random */
export const hash = (i: number, s = 0) => {
  const h = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return h - Math.floor(h);
};
