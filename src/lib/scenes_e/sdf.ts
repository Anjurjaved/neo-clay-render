// scenes_e — SDF → এক টুকরার মসৃণ mesh (MarchingCubes, একবার bake, module cache)।
// কয়েকটা "part" smooth-union (smin) হয়ে fuse হয় → জোড়ার দাগ নেই; প্রতিটা vertex-এর রং আসে সবচেয়ে কাছের
// part থেকে (soft-min weight, তাই রঙের সীমানাও নরম) → এক mesh-এই কয়েক রং (দেয়াল + ছাদ, পাতা + মলাট)।
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";

export type V3 = [number, number, number];
export type SDF = (x: number, y: number, z: number) => number;
export type Part = { d: SDF; color: string };

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
/** rounded box — b = ভেতরের half-extent, বাইরের half = b + r */
export const sdRoundBox = (x: number, y: number, z: number, bx: number, by: number, bz: number, r: number) => {
  const qx = Math.abs(x) - bx,
    qy = Math.abs(y) - by,
    qz = Math.abs(z) - bz;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
};
/** a→b segment, ব্যাসার্ধ ra→rb */
export const sdRoundCone = (x: number, y: number, z: number, a: V3, b: V3, ra: number, rb: number) => {
  const bax = b[0] - a[0],
    bay = b[1] - a[1],
    baz = b[2] - a[2];
  const pax = x - a[0],
    pay = y - a[1],
    paz = z - a[2];
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - (ra + (rb - ra) * h);
};
/** XY-তলে torus (মুখ +z) */
export const sdTorusXY = (x: number, y: number, z: number, R: number, r: number) => Math.hypot(Math.hypot(x, y) - R, z) - r;
/** XY-তলে arc (কেন্দ্র 0, ব্যাসার্ধ R, কোণ a0→a1) থেকে 2D দূরত্ব */
export const dArc2 = (x: number, y: number, R: number, a0: number, a1: number) => {
  let a = Math.atan2(y, x);
  while (a < a0) a += Math.PI * 2;
  if (a <= a1) return Math.abs(Math.hypot(x, y) - R);
  const e0 = [Math.cos(a0) * R, Math.sin(a0) * R],
    e1 = [Math.cos(a1) * R, Math.sin(a1) * R];
  return Math.min(Math.hypot(x - e0[0], y - e0[1]), Math.hypot(x - e1[0], y - e1[1]));
};
/** 2D isosceles triangle (iq) — ডগা উপরে (0, h), ভিত্তি y = 0, অর্ধ-প্রস্থ w */
export const sdTri2 = (px: number, py: number, w: number, h: number) => {
  // iq sdTriangleIsosceles: ডগা origin-এ, নিচে খোলে → y উল্টে নিই
  const qx = w,
    qy = h;
  let x = Math.abs(px);
  let y = h - py;
  const t1 = clamp((x * qx + y * qy) / (qx * qx + qy * qy), 0, 1);
  const ax = x - qx * t1,
    ay = y - qy * t1;
  const t2 = clamp(x / qx, 0, 1);
  const bx = x - qx * t2,
    by = y - qy;
  const k = Math.sign(qy);
  const d = Math.min(ax * ax + ay * ay, bx * bx + by * by);
  const s = Math.max(k * (x * qy - y * qx), k * (y - qy));
  return -Math.sqrt(d) * Math.sign(s);
};
/** 2D দূরত্ব → z বরাবর পুরু (half h), কিনারা গোল r */
export const extrudeRound = (d2: number, z: number, h: number, r: number) => {
  const wx = d2 + r,
    wy = Math.abs(z) - h + r;
  return Math.min(Math.max(wx, wy), 0) + Math.hypot(Math.max(wx, 0), Math.max(wy, 0)) - r;
};

const CACHE = new Map<string, THREE.BufferGeometry>();

/**
 * parts → smooth-union → MarchingCubes surface; vertex color = part-গুলোর soft-min weight।
 * center/extent = bounding cube (half-size), res = grid ভাগ।
 */
export const bakeParts = (key: string, parts: Part[], k: number, center: V3, extent: number, res = 96, colorSoft = 0.012): THREE.BufferGeometry => {
  const hit = CACHE.get(key);
  if (hit) return hit;
  const sdf: SDF = (x, y, z) => {
    let d = parts[0].d(x, y, z);
    for (let i = 1; i < parts.length; i++) d = smin(d, parts[i].d(x, y, z), k);
    return d;
  };
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
  const col = new Float32Array(cnt * 3);
  const uv = new Float32Array(cnt * 2);
  const P: Float32Array = mc.positionArray,
    N: Float32Array = mc.normalArray;
  const cols = parts.map((p) => new THREE.Color(p.color)); // linear
  for (let i = 0; i < cnt; i++) {
    const o = i * 3;
    const x = center[0] + P[o] * extent,
      y = center[1] + P[o + 1] * extent,
      z = center[2] + P[o + 2] * extent;
    pos[o] = x;
    pos[o + 1] = y;
    pos[o + 2] = z;
    const l = Math.hypot(N[o], N[o + 1], N[o + 2]) || 1;
    nor[o] = N[o] / l;
    nor[o + 1] = N[o + 1] / l;
    nor[o + 2] = N[o + 2] / l;
    // soft-min colour
    let wsum = 0,
      r = 0,
      g = 0,
      b = 0;
    const ds = parts.map((p) => p.d(x, y, z));
    const dmin = Math.min(...ds);
    ds.forEach((d, j) => {
      const w = Math.exp(-(d - dmin) / colorSoft);
      wsum += w;
      r += cols[j].r * w;
      g += cols[j].g * w;
      b += cols[j].b * w;
    });
    col[o] = r / wsum;
    col[o + 1] = g / wsum;
    col[o + 2] = b / wsum;
    const nx = Math.abs(nor[o]),
      ny = Math.abs(nor[o + 1]),
      nz = Math.abs(nor[o + 2]);
    const [ua, ub] = nx > ny && nx > nz ? [z, y] : ny > nz ? [x, z] : [x, y];
    uv[i * 2] = ua * 1.5;
    uv[i * 2 + 1] = ub * 1.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.computeBoundingSphere();
  geo.computeBoundingBox();
  mc.geometry.dispose();
  CACHE.set(key, geo);
  return geo;
};
