// SDF → one smooth mesh. MarchingCubes polygonises the implicit field once (cached per icon+resolution);
// normals come from the analytic SDF gradient (not the voxel grid) so the clay reads perfectly smooth,
// and paint weights (accent / ink) are evaluated per vertex → colour zones are painted on ONE fused body.
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import type { SDF } from "./sdf";

export type Paint = (x: number, y: number, z: number, o: Record<string, number>) => [number, number];
export type IconDef = {
  key: string;
  sdf: SDF;
  /** returns [accentWeight, inkWeight] 0..1 */
  paint?: Paint;
  color: string;
  accent: string;
  ink: string;
  /** half-size of the bake cube (world units, icon authored to fit |x|,|y|,|z| < E·0.95) */
  E?: number;
  /** extra clearcoat for enamel / glossy icons */
  gloss?: number;
};

const mcs = new Map<number, MarchingCubes>();
const getMC = (res: number) => {
  let mc = mcs.get(res);
  if (!mc) {
    mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 700000);
    mc.isolation = 0;
    mcs.set(res, mc);
  }
  return mc;
};

const cache = new Map<string, THREE.BufferGeometry>();

/** bake (or fetch) the fused mesh of an icon */
export const bakeIcon = (def: IconDef, res = 112): THREE.BufferGeometry => {
  const id = def.key + "@" + res;
  const hit = cache.get(id);
  if (hit) return hit;
  const E = def.E ?? 1.2;
  const mc = getMC(res);
  const N = res;
  const field = mc.field as Float32Array;
  (mc.normal_cache as Float32Array).fill(0);
  const half = N / 2;
  const vox = E / half;
  const f = def.sdf;
  // narrow band: one probe per 4³ block; far blocks get a constant (sign is all MC needs there)
  const B = 4;
  const far = vox * B * 0.87 * 1.7 + vox * 2;
  for (let bz = 0; bz < N; bz += B)
    for (let by = 0; by < N; by += B)
      for (let bx = 0; bx < N; bx += B) {
        const cx = ((bx + B / 2 - 0.5 - half) / half) * E,
          cy = ((by + B / 2 - 0.5 - half) / half) * E,
          cz = ((bz + B / 2 - 0.5 - half) / half) * E;
        const dc = f(cx, cy, cz);
        const exact = Math.abs(dc) < far;
        for (let z = bz; z < Math.min(N, bz + B); z++)
          for (let y = by; y < Math.min(N, by + B); y++)
            for (let x = bx; x < Math.min(N, bx + B); x++) {
              const q = z * N * N + y * N + x;
              field[q] = exact ? -f(((x - half) / half) * E, ((y - half) / half) * E, ((z - half) / half) * E) : -dc;
            }
      }
  mc.update();
  const n = mc.count;
  const src = mc.positionArray as Float32Array;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  const uv = new Float32Array(n * 2);
  const e = vox * 0.35;
  for (let i = 0; i < n; i++) {
    const x = src[i * 3] * E,
      y = src[i * 3 + 1] * E,
      z = src[i * 3 + 2] * E;
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    let gx = f(x + e, y, z) - f(x - e, y, z),
      gy = f(x, y + e, z) - f(x, y - e, z),
      gz = f(x, y, z + e) - f(x, y, z - e);
    const l = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
    nor[i * 3] = gx / l;
    nor[i * 3 + 1] = gy / l;
    nor[i * 3 + 2] = gz / l;
    uv[i * 2] = x * 0.55 + z * 0.3;
    uv[i * 2 + 1] = y * 0.55;
  }
  // MC winding follows its field gradient; ours is the same convention (inside > isolation)
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  cache.set(id, g);
  return g;
};

const tmpA = new THREE.Color(),
  tmpB = new THREE.Color(),
  tmpC = new THREE.Color();
/** per-instance geometry (shares position/normal/uv) with its own colour attribute */
export const paintIcon = (base: THREE.BufferGeometry, def: IconDef, color: string, accent: string, ink: string, o: Record<string, number> = {}) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", base.getAttribute("position"));
  g.setAttribute("normal", base.getAttribute("normal"));
  g.setAttribute("uv", base.getAttribute("uv"));
  g.boundingSphere = base.boundingSphere;
  g.boundingBox = base.boundingBox;
  const p = base.getAttribute("position").array as Float32Array;
  const n = p.length / 3;
  const col = new Float32Array(n * 3);
  tmpA.set(color);
  tmpB.set(accent);
  tmpC.set(ink);
  for (let i = 0; i < n; i++) {
    let r = tmpA.r,
      gg = tmpA.g,
      b = tmpA.b;
    if (def.paint) {
      const [wa, wi] = def.paint(p[i * 3], p[i * 3 + 1], p[i * 3 + 2], o);
      if (wa > 0) {
        r += (tmpB.r - r) * wa;
        gg += (tmpB.g - gg) * wa;
        b += (tmpB.b - b) * wa;
      }
      if (wi > 0) {
        r += (tmpC.r - r) * wi;
        gg += (tmpC.g - gg) * wi;
        b += (tmpC.b - b) * wi;
      }
    }
    col[i * 3] = r;
    col[i * 3 + 1] = gg;
    col[i * 3 + 2] = b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
};
