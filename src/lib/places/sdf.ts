// SDF → এক টুকরার মসৃণ mesh (MarchingCubes দিয়ে একবার bake, module-level cache)।
// জৈব আকৃতি (দাঁত, গাছ, জামা, ক্রস) এখানে smooth-union (smin) দিয়ে fuse হয় — জোড়ার দাগ থাকে না।
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";

export type V3 = [number, number, number];
export type SDF = (x: number, y: number, z: number) => number;

// ---------- scalar helpers ----------
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
/** polynomial smooth min (iq) — k = fillet radius */
export const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return Math.min(a, b);
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
};
/** smooth max (subtract: smax(d, -cut, k)) */
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

// ---------- 3D primitives ----------
export const sdSphere = (x: number, y: number, z: number, r: number) => Math.hypot(x, y, z) - r;
/** ellipsoid (iq approx, যথেষ্ট ভালো) */
export const sdEllipsoid = (x: number, y: number, z: number, a: number, b: number, c: number) => {
  const k0 = Math.hypot(x / a, y / b, z / c);
  const k1 = Math.hypot(x / (a * a), y / (b * b), z / (c * c));
  return k1 === 0 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
};
/** rounded box — b = ভেতরের half-extent, বাইরের মাপ = b + r */
export const sdRoundBox = (x: number, y: number, z: number, bx: number, by: number, bz: number, r: number) => {
  const qx = Math.abs(x) - bx,
    qy = Math.abs(y) - by,
    qz = Math.abs(z) - bz;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
};
/** round cone: a→b, ব্যাসার্ধ ra→rb */
export const sdRoundCone = (p: V3, a: V3, b: V3, ra: number, rb: number) => {
  // সরল: segment বরাবর t-তে interpolate করা ব্যাসার্ধের capsule (ছোট taper-এ নিখুঁত)
  const bax = b[0] - a[0],
    bay = b[1] - a[1],
    baz = b[2] - a[2];
  const pax = p[0] - a[0],
    pay = p[1] - a[1],
    paz = p[2] - a[2];
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - (ra + (rb - ra) * h);
};
export const sdCapsule = (p: V3, a: V3, b: V3, r: number) => sdRoundCone(p, a, b, r, r);
/** torus in the XY plane (ring মুখ +z দিকে) */
export const sdTorusXY = (x: number, y: number, z: number, R: number, r: number) => Math.hypot(Math.hypot(x, y) - R, z) - r;

// ---------- 2D primitives (extrude/revolve-এর জন্য) ----------
export const sdBox2 = (x: number, y: number, bx: number, by: number, r = 0) => {
  const qx = Math.abs(x) - bx + r,
    qy = Math.abs(y) - by + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
export const sdCircle2 = (x: number, y: number, r: number) => Math.hypot(x, y) - r;
export const rot2 = (x: number, y: number, a: number): [number, number] => [x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a)];
/** 2D shape → z বরাবর পুরু, চারদিক গোল (বালিশ-কিনারা) — halfDepth h, edge round r */
export const extrudeRound = (d2: number, z: number, h: number, r: number) => {
  const wx = d2 + r,
    wy = Math.abs(z) - h + r;
  return Math.min(Math.max(wx, wy), 0) + Math.hypot(Math.max(wx, 0), Math.max(wy, 0)) - r;
};
/** (r, y) profile-এর 2D SDF → y-অক্ষ ঘিরে ঘোরানো */
export const revolve = (x: number, y: number, z: number, d2: (r: number, y: number) => number) => d2(Math.hypot(x, z), y);

// ---------- bake ----------
const CACHE = new Map<string, THREE.BufferGeometry>();

/**
 * sdf-কে MarchingCubes grid-এ বসিয়ে surface বের করি। center/extent = bounding cube (world unit), res = grid ভাগ।
 * field = -sdf (ভেতরে ধনাত্মক), isolation 0 → surface ঠিক sdf=0-তে; normal = field gradient (মসৃণ)।
 */
export const bakeSDF = (key: string, sdf: SDF, center: V3, extent: number, res = 104): THREE.BufferGeometry => {
  const hit = CACHE.get(key);
  if (hit) return hit;
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 400000) as any;
  mc.isolation = 0;
  const n: number = mc.size,
    hs: number = mc.halfsize,
    field: Float32Array = mc.field;
  const K = 100 / extent; // field-এর ঢাল (gradient normal-এর জন্য যথেষ্ট)
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
  const P: Float32Array = mc.positionArray,
    N: Float32Array = mc.normalArray;
  for (let i = 0; i < cnt; i++) {
    const o = i * 3;
    pos[o] = center[0] + P[o] * extent;
    pos[o + 1] = center[1] + P[o + 1] * extent;
    pos[o + 2] = center[2] + P[o + 2] * extent;
    const l = Math.hypot(N[o], N[o + 1], N[o + 2]) || 1;
    nor[o] = N[o] / l;
    nor[o + 1] = N[o + 1] / l;
    nor[o + 2] = N[o + 2] / l;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  // triplanar-ish uv (bump/noise map-এর জন্য): বড় অক্ষ বাদ দিয়ে project
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
  g.computeBoundingSphere();
  g.computeBoundingBox();
  mc.geometry.dispose();
  CACHE.set(key, g);
  return g;
};
