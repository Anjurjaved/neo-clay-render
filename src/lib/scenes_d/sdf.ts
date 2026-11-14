// SDF → এক টুকরার মসৃণ mesh (MarchingCubes, একবার bake, module cache) — দাঁত, হৃদয় ইত্যাদি জৈব আকৃতির জন্য
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";

export type SDF = (x: number, y: number, z: number) => number;
const cl = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const smin = (a: number, b: number, k: number) => {
  const h = cl(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
};
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
export const sdSphere = (x: number, y: number, z: number, r: number) => Math.hypot(x, y, z) - r;
export const sdEllipsoid = (x: number, y: number, z: number, a: number, b: number, c: number) => {
  const k0 = Math.hypot(x / a, y / b, z / c);
  const k1 = Math.hypot(x / (a * a), y / (b * b), z / (c * c));
  return k1 === 0 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
};
/** capsule a→b, ব্যাসার্ধ ra→rb (ছোট taper-এ যথেষ্ট নিখুঁত) */
export const sdCone = (x: number, y: number, z: number, a: [number, number, number], b: [number, number, number], ra: number, rb: number) => {
  const bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2];
  const px = x - a[0], py = y - a[1], pz = z - a[2];
  const h = cl((px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz), 0, 1);
  return Math.hypot(px - bx * h, py - by * h, pz - bz * h) - (ra + (rb - ra) * h);
};

const CACHE = new Map<string, THREE.BufferGeometry>();
export const bakeSDF = (key: string, sdf: SDF, center: [number, number, number], extent: number, res = 84): THREE.BufferGeometry => {
  const hit = CACHE.get(key);
  if (hit) return hit;
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 300000) as any;
  mc.isolation = 0;
  const n: number = mc.size, hs: number = mc.halfsize, field: Float32Array = mc.field;
  const K = 100 / extent;
  for (let z = 0; z < n; z++) {
    const wz = center[2] + ((z - hs) / hs) * extent;
    for (let y = 0; y < n; y++) {
      const wy = center[1] + ((y - hs) / hs) * extent;
      const row = z * n * n + y * n;
      for (let x = 0; x < n; x++) field[row + x] = -sdf(center[0] + ((x - hs) / hs) * extent, wy, wz) * K;
    }
  }
  mc.update();
  const cnt: number = mc.count;
  const pos = new Float32Array(cnt * 3), nor = new Float32Array(cnt * 3), uv = new Float32Array(cnt * 2);
  const Pa: Float32Array = mc.positionArray, Na: Float32Array = mc.normalArray;
  for (let i = 0; i < cnt; i++) {
    const o = i * 3;
    pos[o] = center[0] + Pa[o] * extent;
    pos[o + 1] = center[1] + Pa[o + 1] * extent;
    pos[o + 2] = center[2] + Pa[o + 2] * extent;
    const l = Math.hypot(Na[o], Na[o + 1], Na[o + 2]) || 1;
    nor[o] = Na[o] / l;
    nor[o + 1] = Na[o + 1] / l;
    nor[o + 2] = Na[o + 2] / l;
    uv[i * 2] = (pos[o] + pos[o + 2]) * 1.5;
    uv[i * 2 + 1] = pos[o + 1] * 1.5;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.computeBoundingSphere();
  mc.geometry.dispose();
  CACHE.set(key, g);
  return g;
};
