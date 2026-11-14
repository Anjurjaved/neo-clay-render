// Polished coin (one-piece lathe: raised rim + recessed field + boss, reeded edge by vertex displacement)
// + embossed rosette and bead ring (no currency glyph)। CoinStack: coin-by-coin perfect stack with drop + settle.
// Coin axis = y (flat, face up); radius 0.5, thickness COIN.t
import React, { useMemo } from "react";
import * as THREE from "three";
import { shapeGeo } from "../../kit/Geo";
import { springStep, wobble } from "../../kit/anim";
import { G, P, GoldMat, k01 } from "./common";

export const COIN = { r: 0.5, t: 0.1 };

const chaikin = (pts: [number, number][], it = 3) => {
  let p = pts;
  for (let k = 0; k < it; k++) {
    const q: [number, number][] = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const [a, b] = p[i],
        [c, d] = p[i + 1];
      q.push([0.75 * a + 0.25 * c, 0.75 * b + 0.25 * d], [0.25 * a + 0.75 * c, 0.25 * b + 0.75 * d]);
    }
    q.push(p[p.length - 1]);
    p = q;
  }
  return p;
};

let _coinGeo: THREE.BufferGeometry | null = null;
export const coinGeo = () => {
  if (_coinGeo) return _coinGeo;
  const h = COIN.t / 2;
  // top half profile (r, y) center → outer edge
  const top: [number, number][] = [
    [0.0, h * 0.62],
    [0.12, h * 0.62],
    [0.15, h * 0.5],
    [0.2, h * 0.36],
    [0.37, h * 0.36],
    [0.395, h * 0.62],
    [0.405, h * 0.98],
    [0.455, h * 1.0],
    [0.49, h * 0.8],
    [0.5, h * 0.42],
    [0.5, 0.0],
  ];
  const half = chaikin(top, 3);
  const full: [number, number][] = [...half.map(([r, y]) => [r, -y] as [number, number]), ...half.slice(0, -1).reverse()];
  // lathe goes bottom-center → top-center
  const pts = full.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y));
  const SEG = 360;
  const g = new THREE.LatheGeometry(pts, SEG);
  // reeded edge: outer band only
  const pa = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i),
      y = pa.getY(i),
      z = pa.getZ(i);
    const r = Math.hypot(x, z);
    if (r > 0.492 && Math.abs(y) < h * 0.6) {
      const th = Math.atan2(z, x);
      const band = 1 - Math.pow(Math.abs(y) / (h * 0.6), 4);
      const d = 0.0075 * band * (0.5 + 0.5 * Math.cos(th * 90));
      const k = (r - d) / r;
      pa.setX(i, x * k);
      pa.setZ(i, z * k);
    }
  }
  g.computeVertexNormals();
  _coinGeo = g;
  return g;
};

/** 8-petal rosette (emblem) */
const rosette = () => {
  const s = new THREE.Shape();
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr = 0.1 + 0.028 * Math.cos(a * 8);
    const x = Math.cos(a) * rr,
      y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.035, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
};

export const Coin: React.FC<P & { color?: string; detail?: boolean }> = ({ color = "#E8AE4A", detail = true, ...p }) => {
  const g = coinGeo();
  const ros = useMemo(() => shapeGeo(rosette(), 0.006, 0.006, 3), []);
  const dot = useMemo(() => new THREE.SphereGeometry(0.011, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), []);
  const h = COIN.t / 2;
  const face = (sgn: 1 | -1) => (
    <group rotation={[sgn > 0 ? 0 : Math.PI, 0, 0]}>
      <mesh geometry={ros} rotation={[-Math.PI / 2, 0, 0]} position={[0, h * 0.62 - 0.002, 0]} castShadow>
        <GoldMat color={color} rough={0.26} />
      </mesh>
      {Array.from({ length: 40 }).map((_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return (
          <mesh key={i} geometry={dot} position={[Math.cos(a) * 0.3, h * 0.36 - 0.001, Math.sin(a) * 0.3]}>
            <GoldMat color={color} rough={0.3} />
          </mesh>
        );
      })}
    </group>
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <GoldMat color={color} />
      </mesh>
      {detail && face(1)}
      {detail && face(-1)}
    </G>
  );
};

/**
 * CoinStack — `time` = সেকেন্ড (stack-এর নিজের), `n` = মোট coin, `every` = প্রতি coin-এর ব্যবধান, `start` = প্রথম coin কখন।
 * প্রতিটা coin উপর থেকে পড়ে, সামান্য কাত থেকে সোজা হয়, নামার সময় stack সামান্য চাপে (squash) ও কাঁপে।
 * coin radius = 0.5·scale; stack base = local y 0
 */
export const CoinStack: React.FC<P & { time: number; n: number; every?: number; start?: number; drop?: number; seed?: number; color?: string }> = ({
  time,
  n,
  every = 0.16,
  start = 0,
  drop = 2.4,
  seed = 1,
  color,
  ...p
}) => {
  const fall = 0.32;
  const items: React.ReactNode[] = [];
  let squash = 0;
  for (let i = 0; i < n; i++) {
    const t0 = start + i * every;
    const land = t0 + fall;
    if (time < t0) break;
    const sinceLand = time - land;
    if (sinceLand > 0) squash += wobble(sinceLand, 0.035, 5.5, 0.35);
  }
  for (let i = 0; i < n; i++) {
    const t0 = start + i * every;
    if (time < t0) break;
    const u = k01((time - t0) / fall);
    const yRest = COIN.t / 2 + i * COIN.t * 0.985;
    const y = yRest + drop * (1 - u * u);
    const sinceLand = time - (t0 + fall);
    // jitter so the stack is "perfect but real": tiny offset/rotation per coin
    const jx = Math.sin(i * 12.9898 + seed * 3.1) * 0.012,
      jz = Math.cos(i * 78.233 + seed * 1.7) * 0.012;
    const tilt = (1 - u) * 0.5 * Math.sin(i * 2.1 + seed) + (sinceLand > 0 ? wobble(sinceLand, 0.06, 6, 0.3) : 0);
    const spin = i * 0.9 + seed + (1 - u) * 2.2;
    items.push(
      <Coin key={i} position={[jx, y, jz]} rotation={[tilt, spin, tilt * 0.6]} detail={i === n - 1 || time < start + (i + 1) * every + fall} color={color} />
    );
  }
  return (
    <G {...p}>
      <group scale={[1 - squash * 0.5, 1 + squash, 1 - squash * 0.5]}>{items}</group>
    </G>
  );
};

/** single showcase coin pose: drop on edge + turntable spin settling to a 3/4 angle */
export const coinShowPose = (t: number) => {
  const drop = springStep(t - 0.1, { k: 120, c: 9 });
  const y = (1 - drop) * 3.2;
  const spin = (1 - springStep(t - 0.2, { k: 9, c: 3.2 })) * Math.PI * 4 + 0.55;
  return { y, spin, sq: wobble(t - 0.45, 0.06, 3.2, 0.25) };
};
