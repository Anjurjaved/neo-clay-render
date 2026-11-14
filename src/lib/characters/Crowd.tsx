// Instanced crowd — ১০০+ figure, প্রতিটা একই এক-টুকরার clay দেহ (walk cycle-এর ১২টা phase + দাঁড়ানো, একবার bake)।
// প্রতি frame-এ প্রতিটা সদস্য তার হাঁটা দূরত্ব অনুযায়ী phase bucket-এ যায় (পা পিছলায় না), instanceColor-এ রঙের বৈচিত্র্য।
// সময়-নির্ভর সব কিছু prop `t`-এ; পথ (from → to → away) seed থেকে deterministic।
import React, { useMemo } from "react";
import * as THREE from "three";
import { clayNoise } from "../../kit/Clay";
import { C } from "../../kit/theme";
import { rigOf, bodyOps } from "./rig";
import { walk, stand, cheer, CYCLE } from "./poses";
import { polygonize } from "./sdf";

const PHASES = 12;
let _geos: THREE.BufferGeometry[] | null = null;
/** [0..PHASES-1] = walk phases, PHASES = stand, PHASES+1 = cheer (hands up) */
export const crowdGeos = () => {
  if (_geos) return _geos;
  const cell = 0.02;
  const out: THREE.BufferGeometry[] = [];
  for (let i = 0; i < PHASES; i++) out.push(polygonize(bodyOps(rigOf(walk((i / PHASES) * CYCLE, 1)), { hands: "mitten" }), cell, { project: 1 }));
  out.push(polygonize(bodyOps(rigOf(stand(0)), { hands: "mitten" }), cell, { project: 1 }));
  out.push(polygonize(bodyOps(rigOf(cheer(0.21, 1)), { hands: "mitten" }), cell, { project: 1 }));
  _geos = out;
  return out;
};

const rnd = (seed: number) => {
  let s = (seed * 9301 + 49297) % 233280;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};

export type CrowdMember = { from: [number, number]; to: [number, number]; away: [number, number]; delay: number; color: string; speed: number };

/** sunflower packing around (cx,cz) → gathered spots; start/away on a wide ring */
export const planCrowd = (n: number, o: { center?: [number, number]; spacing?: number; ring?: number; seed?: number; palette?: string[] } = {}): CrowdMember[] => {
  const { center = [0, 0], spacing = 0.42, ring = 9, seed = 3 } = o;
  const palette = o.palette ?? [C.figure, C.figure, C.figure, "#1E3558", C.steel, "#2F4F7E", C.figure, C.orange];
  const R = rnd(seed);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out: CrowdMember[] = [];
  for (let i = 0; i < n; i++) {
    const r = spacing * Math.sqrt(i + 0.6) * 0.95;
    const a = i * golden;
    const to: [number, number] = [center[0] + Math.cos(a) * r * 1.12, center[1] + Math.sin(a) * r * 0.9];
    const fa = a + (R() - 0.5) * 0.5;
    const rr = ring * (0.75 + R() * 0.5);
    const from: [number, number] = [center[0] + Math.cos(fa) * rr * 1.2, center[1] + Math.sin(fa) * rr * 0.75 - 1];
    const aa = fa + (R() - 0.5) * 1.2;
    const ra = ring * (0.8 + R() * 0.5);
    const away: [number, number] = [center[0] + Math.cos(aa) * ra * 1.2, center[1] + Math.sin(aa) * ra * 0.75 - 1];
    out.push({ from, to, away, delay: R() * 0.5 + (r / (spacing * Math.sqrt(n))) * 0.4, color: palette[Math.floor(R() * palette.length)], speed: 0.9 + R() * 0.25 });
  }
  return out;
};

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

/**
 * t = সময় (s)। gatherAt..gatherAt+dur জড়ো, disperseAt থেকে ছড়ায়। scale = figure scale।
 * জড়ো অবস্থায় cheerAt দিলে সবাই হাত তোলে (staggered)।
 */
export const Crowd: React.FC<{
  t: number;
  members: CrowdMember[];
  y?: number;
  scale?: number;
  gatherAt?: number;
  gatherDur?: number;
  disperseAt?: number;
  disperseDur?: number;
  cheerAt?: number | null;
  faceTo?: [number, number]; // জড়ো হয়ে কোন দিকে মুখ (world xz point) — default ক্যামেরা (+z)
}> = ({ t, members, y = 0, scale = 1, gatherAt = 0.2, gatherDur = 2.4, disperseAt = 4, disperseDur = 2.2, cheerAt = null, faceTo }) => {
  const geos = crowdGeos();
  const n = members.length;
  const colors = useMemo(() => members.map((m) => new THREE.Color(m.color)), [members]);
  // own InstancedMesh objects — updated synchronously during render (frame-exact, no effect timing)
  const meshes = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.62, metalness: 0, sheen: 0.5, sheenRoughness: 0.85, sheenColor: new THREE.Color("#ffd9c4"), clearcoat: 0.04, clearcoatRoughness: 0.6, envMapIntensity: 0.85 });
    mat.bumpMap = clayNoise();
    mat.bumpScale = 0.2;
    mat.roughnessMap = clayNoise();
    return geos.map((g) => {
      const m = new THREE.InstancedMesh(g, mat, n);
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
      m.setColorAt(0, new THREE.Color("#ffffff"));
      return m;
    });
  }, [geos, n]);
  {
    const o = new THREE.Object3D();
    const counts = new Array(geos.length).fill(0);
    const seg = (A: [number, number], B: [number, number], u: number) => {
      const e = ease(u);
      const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
      return { x: A[0] + (B[0] - A[0]) * e, z: A[1] + (B[1] - A[1]) * e, dist: L * e, sp: u > 0 && u < 1 ? 6 * u * (1 - u) : 0, hx: B[0] - A[0], hz: B[1] - A[1] };
    };
    members.forEach((m, i) => {
      const g0 = gatherAt + m.delay,
        g1 = g0 + gatherDur * m.speed;
      const d0 = disperseAt + m.delay * 0.6,
        d1 = d0 + disperseDur * m.speed;
      const out = t >= d0;
      const sg = out ? seg(m.to, m.away, (t - d0) / (d1 - d0)) : seg(m.from, m.to, (t - g0) / (g1 - g0));
      const dist = (out ? Math.hypot(m.to[0] - m.from[0], m.to[1] - m.from[1]) : 0) + sg.dist;
      const walkK = Math.min(1, sg.sp * 1.4);
      const heading = Math.atan2(sg.hx, sg.hz);
      const ft = faceTo ? Math.atan2(faceTo[0] - sg.x, faceTo[1] - sg.z) : 0;
      let rotY = heading;
      if (!out && t > g1) {
        let dh = ft - heading;
        dh = Math.atan2(Math.sin(dh), Math.cos(dh));
        rotY = heading + dh * ease((t - g1) / 0.6);
      }
      const cheering = cheerAt !== null && !out && t > cheerAt + m.delay * 0.5 && t < d0 - 0.15 && walkK < 0.05;
      const gi = walkK > 0.1 ? Math.floor(((dist / scale / CYCLE) * PHASES) % PHASES) : cheering ? PHASES + 1 : PHASES;
      const hop = cheering ? Math.max(0, Math.sin((t - cheerAt! - m.delay * 0.5) * 8)) * 0.06 * scale : 0;
      o.position.set(sg.x, y + hop, sg.z);
      o.rotation.set(0, rotY, 0);
      o.scale.setScalar(scale);
      o.updateMatrix();
      const mesh = meshes[gi];
      const k = counts[gi]++;
      mesh.setMatrixAt(k, o.matrix);
      mesh.setColorAt(k, colors[i]);
    });
    meshes.forEach((mesh, gi) => {
      mesh.count = counts[gi];
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }
  return (
    <>
      {meshes.map((m, gi) => (
        <primitive key={gi} object={m} />
      ))}
    </>
  );
};
