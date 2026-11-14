// Confetti — নরম bevelled কাগজের টুকরো (সামান্য বাঁকা), seeded burst → drag-সহ ভাসমান পতন + দোলা (flutter)
// → floor-এ সমতল হয়ে শুয়ে পড়ে। সব কিছু t-এর pure function (closed-form drag ballistics + bisection landing)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { FLOOR } from "../../kit/Stage";
import { slabGeo, roundedCylGeo } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { seeded, between } from "./rand";
import { smoothstep } from "../../kit/anim";

export const CONFETTI_PALETTE = [C.orange, C.deepOrange, C.navy, C.steel, "#FBF6EF", "#F2C46B"];

type Piece = {
  delay: number;
  vx: number;
  vy: number;
  vz: number;
  k: number;
  swA: number;
  swW: number;
  swP: number;
  axis: THREE.Vector3;
  w0: number;
  w1: number;
  yaw: number;
  shape: number;
  color: number;
  s: number;
  land: number;
};
const G = 9.2;
const fall = (p: Piece, u: number) => {
  const e = 1 - Math.exp(-p.k * u);
  return { x: (p.vx / p.k) * e, y: ((p.vy + G / p.k) / p.k) * e - (G * u) / p.k, z: (p.vz / p.k) * e };
};
const sway = (p: Piece, u: number) => {
  const a = p.swA * smoothstep(0.25, 1.1, u);
  return [Math.sin(p.swW * u + p.swP) * a, Math.cos(p.swW * 0.8 * u + p.swP * 1.3) * a * 0.5] as const;
};

/**
 * <Confetti t at origin /> — `at` সেকেন্ডে origin (world) থেকে ফাটে।
 * count ছোট রাখুন (40–80): premium = কম কিন্তু ধীর ও নিখুঁত। spread = অনুভূমিক জোর, lift = উপরের জোর।
 * clearAt দিলে floor-এর টুকরোগুলো ঢেউ করে ছোট হয়ে মিলিয়ে যায় (পরের scene-এর আগে)।
 */
export const Confetti: React.FC<{
  t: number;
  at: number;
  origin?: [number, number, number];
  count?: number;
  seed?: number;
  spread?: number;
  lift?: number;
  depth?: number;
  /** ক্যামেরার দিকে (+z) বাড়তি বেগ — টুকরো বস্তুর সামনে পড়ে, পেছনে লুকায় না */
  toward?: number;
  size?: number;
  palette?: string[];
  floorY?: number;
  clearAt?: number;
}> = ({ t, at, origin = [0, 0, 0], count = 60, seed = 11, spread = 1, lift = 1, depth = 0.6, toward = 0, size = 1, palette = CONFETTI_PALETTE, floorY = FLOOR, clearAt }) => {
  const geos = useMemo(() => {
    const mk = (bend: number) => {
      const g = slabGeo(0.19, 0.095, 0.016, 0.022, 0.006, 2);
      g.rotateX(-Math.PI / 2); // সমতল (normal +y) = floor-এ শোয়া অবস্থা
      const pos = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) + bend * pos.getX(i) * pos.getX(i));
      g.computeVertexNormals();
      return g;
    };
    const disc = roundedCylGeo(0.06, 0.016, 0.006, 32);
    return [mk(-2.4), mk(0.0), mk(2.6), disc];
  }, []);
  const mats = useMemo(
    () => palette.map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.48, sheen: 0.4, sheenColor: new THREE.Color("#fff0e0"), clearcoat: 0.25, clearcoatRoughness: 0.4, side: THREE.DoubleSide })),
    [palette.join()]
  );
  const pieces = useMemo(
    () =>
      seeded(seed, count, (r) => {
        const phi = r() * Math.PI * 2;
        const hz = between(r, 2.6, 7.2) * spread * (0.6 + 0.4 * Math.abs(Math.cos(phi)));
        const p: Piece = {
          delay: Math.pow(r(), 1.6) * 0.16,
          vx: Math.cos(phi) * hz,
          vy: between(r, 6.5, 10.5) * lift,
          vz: Math.sin(phi) * hz * depth + toward * between(r, 0.4, 1.4),
          k: between(r, 2.5, 3.4),
          swA: between(r, 0.14, 0.3),
          swW: between(r, 4.5, 8),
          swP: r() * 6.28,
          axis: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
          w0: between(r, 9, 16),
          w1: between(r, 2.4, 4.2),
          yaw: r() * Math.PI * 2,
          shape: r() < 0.18 ? 3 : Math.floor(r() * 3),
          color: Math.floor(r() * palette.length),
          s: between(r, 0.8, 1.15) * size,
          land: 0,
        };
        // landing time: y(u) = floor (bisection — deterministic)
        const target = floorY + 0.012 - origin[1];
        let lo = 0.15,
          hi = 14;
        for (let i = 0; i < 40; i++) {
          const m = (lo + hi) / 2;
          if (fall(p, m).y > target) lo = m;
          else hi = m;
        }
        p.land = hi;
        return p;
      }),
    [seed, count, spread, lift, depth, toward, size, floorY, origin[1], palette.length]
  );
  if (t < at) return null;
  const q = new THREE.Quaternion(),
    qf = new THREE.Quaternion(),
    e = new THREE.Euler();
  return (
    <group>
      {pieces.map((p, i) => {
        const u0 = t - at - p.delay;
        if (u0 <= 0) return null;
        const u = Math.min(u0, p.land);
        const f = fall(p, u);
        const [sx, sz] = sway(p, u);
        const landed = u0 >= p.land;
        // tumble: শুরুতে জোরে ঘোরে, পরে ধীর flutter; নামার শেষ 0.4 s-এ সমতল অবস্থায় slerp
        const ang = (p.w0 * (1 - Math.exp(-u * 1.3))) / 1.3 + p.w1 * u;
        q.setFromAxisAngle(p.axis, ang);
        qf.setFromEuler(e.set(0, p.yaw, 0));
        const kFlat = smoothstep(p.land - 0.45, p.land, u);
        q.slerp(qf, kFlat);
        let sc = p.s * (0.35 + 0.65 * smoothstep(0, 0.12, u0));
        if (clearAt !== undefined) {
          const c = (t - clearAt - (origin[0] + f.x + 3) * 0.06) / 0.35;
          if (c >= 1) return null;
          if (c > 0) sc *= 1 - c * c;
        }
        const y = landed ? floorY + 0.012 : origin[1] + f.y;
        return (
          <mesh key={i} geometry={geos[p.shape]} material={mats[p.color]} position={[origin[0] + f.x + sx, y, origin[2] + f.z + sz]} quaternion={q.clone()} scale={[sc, sc * 0.5, sc]} castShadow receiveShadow />
        );
      })}
    </group>
  );
};
