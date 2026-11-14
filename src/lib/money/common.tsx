// money group — shared helpers: group wrapper, materials, deformable thick sheet (paper/note/leather),
// SDF → MarchingCubes bake (one-piece organic mesh), canvas print texture.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { clayNoise } from "../../kit/Clay";

export type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
export const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);
export const k01 = (x: number) => Math.max(0, Math.min(1, x));
export const mixHex = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), k01(k)).getHexString();

/** polished gold (coin) — satin metal + clearcoat, highlight bloom threshold-এর নিচে থাকে */
export const GoldMat: React.FC<{ color?: string; rough?: number }> = ({ color = "#E8AE4A", rough = 0.3 }) => (
  <meshPhysicalMaterial color={color} metalness={0.82} roughness={rough} clearcoat={0.55} clearcoatRoughness={0.22} envMapIntensity={1.05} />
);
/** glossy clay (price tag, knob) */
export const GlossMat: React.FC<{ color: string; rough?: number; emissive?: string; ei?: number }> = ({ color, rough = 0.4, emissive, ei = 0 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.6} clearcoatRoughness={0.28} sheen={0.35} sheenColor="#ffe2c4" emissive={emissive ?? "#000000"} emissiveIntensity={ei} />
);

/** ClayMat-equivalent that can be attached into a material array slot (leather / clay faces of a sheet) */
export const SoftMat: React.FC<{ attach?: string; color: string; rough?: number; sheen?: number; bump?: number; clearcoat?: number }> = ({ attach, color, rough = 0.6, sheen = 0.6, bump = 0.45, clearcoat = 0.06 }) => {
  const n = clayNoise();
  return (
    <meshPhysicalMaterial
      attach={attach}
      color={color}
      roughness={rough}
      sheen={sheen}
      sheenRoughness={0.8}
      sheenColor="#ffd9c4"
      clearcoat={clearcoat}
      clearcoatRoughness={0.5}
      bumpMap={n}
      bumpScale={bump}
      roughnessMap={n}
      envMapIntensity={0.85}
    />
  );
};

// ---------------------------------------------------------------------------------------------
// Thick deformable sheet: grid mid-surface → front + back faces + half-round edge, ONE indexed mesh
// (seam নেই)। deform(x,y) = mid-surface point; x∈[-w/2,w/2], y∈[-h/2,h/2] (flat = [x,y,0])।
// groups: 0 = front (+N, uv 0..1), 1 = back, 2 = edge
// ---------------------------------------------------------------------------------------------
export type Deform = (x: number, y: number) => [number, number, number];
export const sheetGeo = (o: {
  w: number;
  h: number;
  t: number;
  r?: number;
  nx?: number;
  ny?: number;
  edge?: number;
  deform?: Deform;
  uv?: (u: number, v: number) => [number, number];
}) => {
  const { w, h, t, nx = 24, ny = 24, edge = 6 } = o;
  const W2 = w - t,
    H2 = h - t;
  const r = Math.max(0.0005, Math.min((o.r ?? t) - t / 2, W2 / 2 - 1e-4, H2 / 2 - 1e-4));
  const f: Deform = o.deform ?? ((x, y) => [x, y, 0]);
  const hx = W2 / 2 - r,
    hy = H2 / 2 - r;
  const flat = (u: number, v: number): [number, number] => {
    const x0 = (u - 0.5) * W2,
      y0 = (v - 0.5) * H2;
    let ax = Math.abs(x0) - hx,
      ay = Math.abs(y0) - hy;
    if (ax > 0 && ay > 0) {
      const m = Math.max(ax, ay),
        l = Math.hypot(ax, ay);
      ax *= m / l;
      ay *= m / l;
      return [Math.sign(x0) * (hx + ax), Math.sign(y0) * (hy + ay)];
    }
    return [x0, y0];
  };
  const NX = nx + 1,
    NY = ny + 1,
    NV = NX * NY;
  const mid: THREE.Vector3[] = [];
  const nrm: THREE.Vector3[] = [];
  const uvs: [number, number][] = [];
  const e = 1e-3;
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3(),
    d = new THREE.Vector3();
  for (let j = 0; j < NY; j++)
    for (let i = 0; i < NX; i++) {
      const u = i / nx,
        v = j / ny;
      const [x, y] = flat(u, v);
      const p = new THREE.Vector3(...f(x, y));
      a.set(...f(x + e, y));
      b.set(...f(x - e, y));
      c.set(...f(x, y + e));
      d.set(...f(x, y - e));
      const n = new THREE.Vector3().crossVectors(a.sub(b), c.sub(d)).normalize();
      mid.push(p);
      nrm.push(n);
      uvs.push(o.uv ? o.uv(x / w + 0.5, y / h + 0.5) : [x / w + 0.5, y / h + 0.5]);
    }
  // boundary loop (CCW from +z)
  const loop: number[] = [];
  for (let i = 0; i < nx; i++) loop.push(i);
  for (let j = 0; j < ny; j++) loop.push(j * NX + nx);
  for (let i = nx; i > 0; i--) loop.push(ny * NX + i);
  for (let j = ny; j > 0; j--) loop.push(j * NX);
  const K = loop.length;
  const pos: number[] = [];
  const uv: number[] = [];
  const half = t / 2;
  for (let k = 0; k < NV; k++) {
    const p = mid[k].clone().addScaledVector(nrm[k], half);
    pos.push(p.x, p.y, p.z);
    uv.push(uvs[k][0], uvs[k][1]);
  }
  for (let k = 0; k < NV; k++) {
    const p = mid[k].clone().addScaledVector(nrm[k], -half);
    pos.push(p.x, p.y, p.z);
    uv.push(1 - uvs[k][0], uvs[k][1]);
  }
  const ringBase = 2 * NV;
  const ringIdx = (k: number, m: number) => (m === 0 ? loop[k] : m === edge ? NV + loop[k] : ringBase + k * (edge - 1) + (m - 1));
  for (let k = 0; k < K; k++) {
    const vi = loop[k];
    const T = mid[loop[(k + 1) % K]].clone().sub(mid[loop[(k - 1 + K) % K]]);
    const B = new THREE.Vector3().crossVectors(T, nrm[vi]).normalize();
    for (let m = 1; m < edge; m++) {
      const th = (m / edge) * Math.PI;
      const p = mid[vi].clone().addScaledVector(nrm[vi], half * Math.cos(th)).addScaledVector(B, half * Math.sin(th));
      pos.push(p.x, p.y, p.z);
      uv.push(uvs[vi][0], uvs[vi][1]);
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const A = j * NX + i,
        Bq = A + 1,
        Cq = A + NX + 1,
        Dq = A + NX;
      idx.push(A, Bq, Cq, A, Cq, Dq);
    }
  const frontCount = idx.length;
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const A = NV + j * NX + i,
        Bq = A + 1,
        Cq = A + NX + 1,
        Dq = A + NX;
      idx.push(A, Cq, Bq, A, Dq, Cq);
    }
  const backCount = idx.length - frontCount;
  for (let k = 0; k < K; k++) {
    const k2 = (k + 1) % K;
    for (let m = 0; m < edge; m++) {
      const p0 = ringIdx(k, m),
        p1 = ringIdx(k2, m),
        p2 = ringIdx(k2, m + 1),
        p3 = ringIdx(k, m + 1);
      idx.push(p0, p2, p1, p0, p3, p2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.addGroup(0, frontCount, 0);
  g.addGroup(frontCount, backCount, 1);
  g.addGroup(frontCount + backCount, idx.length - frontCount - backCount, 2);
  g.computeVertexNormals();
  return g;
};

/** প্রতি frame নতুন geometry হলে পুরোনোটা ছাড়া */
export const useDisposable = <T extends { dispose: () => void }>(make: () => T, deps: React.DependencyList): T => {
  const v = useMemo(make, deps);
  useEffect(() => () => v.dispose(), [v]);
  return v;
};

// ---------------------------------------------------------------------------------------------
// SDF bake: sdf(x,y,z) (world unit, <0 ভেতরে) → MarchingCubes → এক টুকরার মসৃণ BufferGeometry
// bounds = half-extent (cube); res = grid
// ---------------------------------------------------------------------------------------------
export const bakeSDF = (sdf: (x: number, y: number, z: number) => number, half: number, res = 96, maxPoly = 120000) => {
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, maxPoly);
  const K = 40; // field gain
  mc.isolation = 80;
  const size = res;
  for (let z = 0; z < size; z++)
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const fx = ((x - size / 2) / (size / 2)) * half;
        const fy = ((y - size / 2) / (size / 2)) * half;
        const fz = ((z - size / 2) / (size / 2)) * half;
        const dd = sdf(fx, fy, fz) / half; // normalised
        mc.field[size * size * z + size * y + x] = 80 - dd * K * size * 0.5;
      }
  mc.update();
  const n = mc.count;
  const src = mc.geometry;
  const g = new THREE.BufferGeometry();
  const pa = (src.getAttribute("position").array as Float32Array).slice(0, n * 3);
  const na = (src.getAttribute("normal").array as Float32Array).slice(0, n * 3);
  for (let i = 0; i < pa.length; i++) pa[i] *= half;
  for (let i = 0; i < na.length; i += 3) {
    const l = Math.hypot(na[i], na[i + 1], na[i + 2]) || 1;
    na[i] /= l; na[i + 1] /= l; na[i + 2] /= l;
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(na, 3));
  g.computeBoundingSphere();
  src.dispose();
  return g;
};
// SDF primitives
export const sdSphere = (x: number, y: number, z: number, r: number) => Math.hypot(x, y, z) - r;
export const sdEllipsoid = (x: number, y: number, z: number, a: number, b: number, c: number) => {
  const k0 = Math.hypot(x / a, y / b, z / c);
  const k1 = Math.hypot(x / (a * a), y / (b * b), z / (c * c));
  return k1 < 1e-9 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
};
export const sdCapsule = (x: number, y: number, z: number, a: [number, number, number], b: [number, number, number], r: number) => {
  const pax = x - a[0], pay = y - a[1], paz = z - a[2];
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const hh = Math.max(0, Math.min(1, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)));
  return Math.hypot(pax - bax * hh, pay - bay * hh, paz - baz * hh) - r;
};
export const sdRoundBox = (x: number, y: number, z: number, bx: number, by: number, bz: number, r: number) => {
  const qx = Math.abs(x) - bx + r, qy = Math.abs(y) - by + r, qz = Math.abs(z) - bz + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, Math.max(qy, qz)), 0) - r;
};
export const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

// ---------------------------------------------------------------------------------------------
// canvas print texture (receipt/banknote) — DOM font engine (Inter + Hind Siliguri fallback, ৳ সহ)
// ---------------------------------------------------------------------------------------------
export const canvasTex = (wpx: number, hpx: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = wpx;
  c.height = hpx;
  const g = c.getContext("2d")!;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
};
export const FONT = (wt: number, px: number) => `${wt} ${px}px Inter, 'Hind Siliguri', sans-serif`;
