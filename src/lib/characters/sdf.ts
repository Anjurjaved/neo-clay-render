// Character SDF engine — primitive list → এক টুকরার মসৃণ mesh (MarchingCubes + Newton projection + analytic normal)।
// প্রতিটা primitive আগের জমা field-এর সাথে smooth-union হয়; blend k জায়গা-নির্ভর হতে পারে (কাঁধে নরম fillet,
// কোমরের পাশে হাত লাগলে প্রায় ধারালো ভাঁজ — তাই হাত-দেহের মাঝে "জাল" তৈরি হয় না)।
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type V3 = [number, number, number];
/** 3×3 basis (column vectors X,Y,Z) — local = Bᵀ(p-c) */
export type Basis = [V3, V3, V3];

export type Prim =
  | { t: "sph"; c: V3; r: number }
  | { t: "cone"; a: V3; b: V3; ra: number; rb: number }
  | { t: "ell"; c: V3; B: Basis; r: V3 }
  | { t: "box"; c: V3; B: Basis; h: V3; r: number }
  | { t: "tor"; c: V3; B: Basis; R: number; r: number }; // ring in local XZ plane (axis = local Y)

export type Op = Prim & {
  op?: "u" | "s" | "i"; // union (default) | subtract | intersect (whole field)
  k?: number; // blend radius
  /** k শুধু এই কেন্দ্রের কাছে পূর্ণ (kr0 পর্যন্ত), kr1-এ গিয়ে kMin */
  kc?: V3;
  kr0?: number;
  kr1?: number;
  kMin?: number;
  /** non-uniform squash in local frame of the whole field? — z scale for torso depth */
  zs?: number;
};

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
export const smin = (a: number, b: number, k: number) => {
  if (k <= 1e-5) return a < b ? a : b;
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
};
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

// ---------- vector helpers ----------
export const v = {
  add: (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a: V3) => Math.hypot(a[0], a[1], a[2]),
  norm: (a: V3): V3 => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  },
  lerp: (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k],
  /** point in basis frame → world */
  inB: (c: V3, B: Basis, l: V3): V3 => [
    c[0] + B[0][0] * l[0] + B[1][0] * l[1] + B[2][0] * l[2],
    c[1] + B[0][1] * l[0] + B[1][1] * l[1] + B[2][1] * l[2],
    c[2] + B[0][2] * l[0] + B[1][2] * l[1] + B[2][2] * l[2],
  ],
};
export const IDB: Basis = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

// ---------- primitive distance ----------
const primD = (P: Prim, x: number, y: number, z: number): number => {
  switch (P.t) {
    case "sph":
      return Math.hypot(x - P.c[0], y - P.c[1], z - P.c[2]) - P.r;
    case "cone": {
      // iq exact round cone
      const a = P.a,
        b = P.b;
      const bax = b[0] - a[0],
        bay = b[1] - a[1],
        baz = b[2] - a[2];
      const l2 = bax * bax + bay * bay + baz * baz;
      const rr = P.ra - P.rb;
      const a2 = l2 - rr * rr;
      const il2 = 1 / l2;
      const pax = x - a[0],
        pay = y - a[1],
        paz = z - a[2];
      const yy = pax * bax + pay * bay + paz * baz;
      const zz = yy - l2;
      const qx = pax * l2 - bax * yy,
        qy = pay * l2 - bay * yy,
        qz = paz * l2 - baz * yy;
      const x2 = qx * qx + qy * qy + qz * qz;
      const y2 = yy * yy * l2;
      const z2 = zz * zz * l2;
      const k = Math.sign(rr) * rr * rr * x2;
      if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - P.rb;
      if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - P.ra;
      return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - P.ra;
    }
    case "ell": {
      const dx = x - P.c[0],
        dy = y - P.c[1],
        dz = z - P.c[2];
      const B = P.B;
      const lx = (B[0][0] * dx + B[0][1] * dy + B[0][2] * dz) / P.r[0];
      const ly = (B[1][0] * dx + B[1][1] * dy + B[1][2] * dz) / P.r[1];
      const lz = (B[2][0] * dx + B[2][1] * dy + B[2][2] * dz) / P.r[2];
      const k0 = Math.hypot(lx, ly, lz);
      const k1 = Math.hypot(lx / P.r[0], ly / P.r[1], lz / P.r[2]);
      return k1 < 1e-9 ? -Math.min(P.r[0], P.r[1], P.r[2]) : (k0 * (k0 - 1)) / k1;
    }
    case "box": {
      const dx = x - P.c[0],
        dy = y - P.c[1],
        dz = z - P.c[2];
      const B = P.B;
      const qx = Math.abs(B[0][0] * dx + B[0][1] * dy + B[0][2] * dz) - P.h[0];
      const qy = Math.abs(B[1][0] * dx + B[1][1] * dy + B[1][2] * dz) - P.h[1];
      const qz = Math.abs(B[2][0] * dx + B[2][1] * dy + B[2][2] * dz) - P.h[2];
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - P.r;
    }
    case "tor": {
      const dx = x - P.c[0],
        dy = y - P.c[1],
        dz = z - P.c[2];
      const B = P.B;
      const lx = B[0][0] * dx + B[0][1] * dy + B[0][2] * dz;
      const ly = B[1][0] * dx + B[1][1] * dy + B[1][2] * dz;
      const lz = B[2][0] * dx + B[2][1] * dy + B[2][2] * dz;
      return Math.hypot(Math.hypot(lx, lz) - P.R, ly) - P.r;
    }
  }
};

const primBox = (P: Prim): [V3, V3] => {
  switch (P.t) {
    case "sph":
      return [v.sub(P.c, [P.r, P.r, P.r]), v.add(P.c, [P.r, P.r, P.r])];
    case "cone": {
      const r = Math.max(P.ra, P.rb);
      return [
        [Math.min(P.a[0], P.b[0]) - r, Math.min(P.a[1], P.b[1]) - r, Math.min(P.a[2], P.b[2]) - r],
        [Math.max(P.a[0], P.b[0]) + r, Math.max(P.a[1], P.b[1]) + r, Math.max(P.a[2], P.b[2]) + r],
      ];
    }
    case "ell": {
      const r = Math.max(...P.r);
      return [v.sub(P.c, [r, r, r]), v.add(P.c, [r, r, r])];
    }
    case "box": {
      const r = Math.hypot(...P.h) + P.r;
      return [v.sub(P.c, [r, r, r]), v.add(P.c, [r, r, r])];
    }
    case "tor": {
      const r = P.R + P.r;
      return [v.sub(P.c, [r, r, r]), v.add(P.c, [r, r, r])];
    }
  }
};

type Compiled = { o: Op; lo: V3; hi: V3; kk: number };
const compile = (ops: Op[], pad: number): Compiled[] =>
  ops.map((o) => {
    const [lo, hi] = primBox(o);
    const kk = (o.k ?? 0) + pad;
    return { o, lo: v.sub(lo, [kk, kk, kk]), hi: v.add(hi, [kk, kk, kk]), kk };
  });

const kAt = (o: Op, x: number, y: number, z: number) => {
  const k = o.k ?? 0;
  if (!o.kc) return k;
  const d = Math.hypot(x - o.kc[0], y - o.kc[1], z - o.kc[2]);
  const r0 = o.kr0 ?? 0,
    r1 = o.kr1 ?? r0 + 0.1;
  const f = clamp((d - r0) / (r1 - r0), 0, 1);
  const s = f * f * (3 - 2 * f);
  return k + ((o.kMin ?? 0.004) - k) * s;
};

const combine = (o: Op, acc: number, d: number, x: number, y: number, z: number) => {
  const k = kAt(o, x, y, z);
  if (o.op === "s") return smax(acc, -d, k);
  if (o.op === "i") return smax(acc, d, k);
  return smin(acc, d, k);
};

const FAR = 1.0;
/** full point evaluation (Newton projection / normals) — grid-এর সাথে হুবহু এক নিয়ম (bbox culling সহ) */
const evalAt = (C: Compiled[], x: number, y: number, z: number) => {
  let acc = FAR;
  for (let i = 0; i < C.length; i++) {
    const c = C[i];
    if (c.o.op !== "i" && (x < c.lo[0] || y < c.lo[1] || z < c.lo[2] || x > c.hi[0] || y > c.hi[1] || z > c.hi[2])) continue;
    acc = combine(c.o, acc, primD(c.o, x, y, z), x, y, z);
  }
  return acc;
};
export const sdfOf = (ops: Op[], pad = 0.03) => {
  const C = compile(ops, pad);
  return (x: number, y: number, z: number) => evalAt(C, x, y, z);
};

// MarchingCubes instances reused per grid size (বড় buffer — বারবার allocate নয়)
const MC = new Map<number, any>();
const getMC = (n: number) => {
  let m = MC.get(n);
  if (!m) {
    m = new MarchingCubes(n, new THREE.MeshBasicMaterial(), false, false, 260000);
    m.isolation = 0;
    MC.set(n, m);
  }
  return m;
};

/**
 * ops → BufferGeometry (indexed, smooth normals)। cell = grid cell size (world)। bounds নিজে থেকে হিসাব।
 * fixed `bounds` দিলে (crowd bake) grid সেই cube-এ।
 */
export const polygonize = (ops: Op[], cell = 0.012, opts: { project?: number } = {}): THREE.BufferGeometry => {
  const pad = cell * 3;
  const C = compile(ops, pad);
  // union bounds
  const lo: V3 = [1e9, 1e9, 1e9],
    hi: V3 = [-1e9, -1e9, -1e9];
  for (const c of C)
    if (c.o.op !== "s" && c.o.op !== "i")
      for (let a = 0; a < 3; a++) {
        lo[a] = Math.min(lo[a], c.lo[a]);
        hi[a] = Math.max(hi[a], c.hi[a]);
      }
  const center: V3 = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  const ext = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
  let n = Math.ceil(ext / cell) + 6;
  n = Math.min(176, Math.ceil(n / 8) * 8);
  const cs = ext / (n - 6); // প্রকৃত cell
  const mc = getMC(n);
  const half = n / 2;
  const S = n,
    S2 = n * n;
  const field = new Float32Array(n * n * n).fill(FAR);
  const coord = (i: number, a: number) => center[a] + (i - half) * cs;
  const idx = (val: number, a: number) => Math.round((val - center[a]) / cs + half);
  for (const c of C) {
    const o = c.o;
    let x0 = 0,
      x1 = n - 1,
      y0 = 0,
      y1 = n - 1,
      z0 = 0,
      z1 = n - 1;
    if (o.op !== "i") {
      x0 = Math.max(0, idx(c.lo[0], 0) - 1);
      x1 = Math.min(n - 1, idx(c.hi[0], 0) + 1);
      y0 = Math.max(0, idx(c.lo[1], 1) - 1);
      y1 = Math.min(n - 1, idx(c.hi[1], 1) + 1);
      z0 = Math.max(0, idx(c.lo[2], 2) - 1);
      z1 = Math.min(n - 1, idx(c.hi[2], 2) + 1);
    }
    for (let k = z0; k <= z1; k++) {
      const z = coord(k, 2);
      for (let j = y0; j <= y1; j++) {
        const y = coord(j, 1);
        const row = k * S2 + j * S;
        for (let i = x0; i <= x1; i++) {
          const x = coord(i, 0);
          if (o.op !== "i" && (x < c.lo[0] || y < c.lo[1] || z < c.lo[2] || x > c.hi[0] || y > c.hi[1] || z > c.hi[2])) continue;
          const q = row + i;
          field[q] = combine(o, field[q], primD(o, x, y, z), x, y, z);
        }
      }
    }
  }
  const f = mc.field as Float32Array;
  for (let i = 0; i < field.length; i++) f[i] = -field[i];
  (mc.normal_cache as Float32Array).fill(0);
  mc.update();
  const cnt: number = mc.count;
  const pos = new Float32Array(cnt * 3);
  const src = mc.positionArray as Float32Array;
  // MC space [-1,1) → world: center + f*half*cs
  const sc = half * cs;
  for (let i = 0; i < cnt; i++) {
    pos[i * 3] = center[0] + src[i * 3] * sc;
    pos[i * 3 + 1] = center[1] + src[i * 3 + 1] * sc;
    pos[i * 3 + 2] = center[2] + src[i * 3 + 2] * sc;
  }
  let g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g = mergeVertices(g, cs * 0.02);
  // Newton projection onto sdf=0 + analytic normals
  const P = g.getAttribute("position") as THREE.BufferAttribute;
  const arr = P.array as Float32Array;
  const nrm = new Float32Array(arr.length);
  const e = cs * 0.35;
  const iters = opts.project ?? 2;
  for (let i = 0; i < P.count; i++) {
    let x = arr[i * 3],
      y = arr[i * 3 + 1],
      z = arr[i * 3 + 2];
    let gx = 0,
      gy = 0,
      gz = 1;
    for (let it = 0; it <= iters; it++) {
      const d = evalAt(C, x, y, z);
      gx = evalAt(C, x + e, y, z) - evalAt(C, x - e, y, z);
      gy = evalAt(C, x, y + e, z) - evalAt(C, x, y - e, z);
      gz = evalAt(C, x, y, z + e) - evalAt(C, x, y, z - e);
      const l = Math.hypot(gx, gy, gz) || 1;
      gx /= l;
      gy /= l;
      gz /= l;
      if (it < iters && Math.abs(d) < cs) {
        x -= gx * d;
        y -= gy * d;
        z -= gz * d;
      }
    }
    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
    nrm[i * 3] = gx;
    nrm[i * 3 + 1] = gy;
    nrm[i * 3 + 2] = gz;
  }
  g.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  // simple spherical-ish UVs for bump noise (clay micro texture)
  const uv = new Float32Array(P.count * 2);
  for (let i = 0; i < P.count; i++) {
    uv[i * 2] = arr[i * 3] * 1.6 + arr[i * 3 + 2] * 1.1;
    uv[i * 2 + 1] = arr[i * 3 + 1] * 1.6;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
};

// ---------- basis helpers ----------
/** Y axis = dir, Z ≈ hint (orthogonalised) */
export const basisYZ = (dir: V3, zHint: V3): Basis => {
  const Y = v.norm(dir);
  let Z = v.sub(zHint, v.mul(Y, v.dot(zHint, Y)));
  if (v.len(Z) < 1e-5) Z = Math.abs(Y[0]) < 0.9 ? v.cross([1, 0, 0], Y) : v.cross([0, 0, 1], Y);
  Z = v.norm(Z);
  const X = v.cross(Y, Z);
  return [X, Y, Z];
};
export const basisFromQuat = (q: THREE.Quaternion): Basis => {
  const m = new THREE.Matrix4().makeRotationFromQuaternion(q).elements;
  return [
    [m[0], m[1], m[2]],
    [m[4], m[5], m[6]],
    [m[8], m[9], m[10]],
  ];
};
export const basisMatrix = (c: V3, B: Basis) =>
  new THREE.Matrix4().set(B[0][0], B[1][0], B[2][0], c[0], B[0][1], B[1][1], B[2][1], c[1], B[0][2], B[1][2], B[2][2], c[2], 0, 0, 0, 1);
