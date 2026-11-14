// CoinBurst — polished সোনালি coin (উঁচু রিম, ভেতরে নিচু face, মাঝে উঁচু বৃত্ত) এক বিন্দু থেকে ফোয়ারার মতো ওঠে,
// নিজের অক্ষে উল্টাতে উল্টাতে বাঁকা পথে পড়ে, floor-এ ছোট্ট bounce, গড়িয়ে থামে আর Euler-disk-এর মতো কেঁপে সমতল হয়।
import React, { useMemo } from "react";
import * as THREE from "three";
import { FLOOR } from "../../kit/Stage";
import { latheGeo } from "../../kit/Geo";
import { seeded, between, residualToFlat } from "./rand";
import { smoothstep } from "../../kit/anim";

export const COIN_R = 0.3;
export const COIN_T = 0.075;
/** coin geometry (axis y, কেন্দ্র 0): রিম উঁচু, face নিচু, মাঝে উঁচু boss — এক lathe profile, seam নেই */
export const coinGeo = (r = COIN_R, th = COIN_T) => {
  const h = th / 2;
  // উপরের অর্ধেক profile (বাইরে → ভেতরে নয়, কেন্দ্র → কিনারা), প্রতিটা ধাপের কোণে ছোট গোলাই (দুই কাছাকাছি বিন্দু)
  // যাতে smoothing শুধু কোণে থাকে — না হলে পুরো face বাটির মতো বাঁকা shade হয়
  const c = 0.006;
  const top: [number, number][] = [
    [0.0001, h * 0.86],
    [r * 0.3 - c, h * 0.86],
    [r * 0.3, h * 0.86 - c * 0.5],
    [r * 0.3 + c, h * 0.78],
    [r * 0.74 - c, h * 0.78],
    [r * 0.74, h * 0.78 + c * 0.5],
    [r * 0.76, h - c * 0.6],
    [r * 0.78, h],
    [r - c * 1.6, h],
    [r - c * 0.4, h - c * 0.6],
    [r, h - c * 2],
  ];
  const pts = [...top.map(([x, y]) => new THREE.Vector2(x, -y)), ...top.slice().reverse().map(([x, y]) => new THREE.Vector2(x, y))];
  const g = new THREE.LatheGeometry(pts, 96);
  g.computeVertexNormals();
  return g;
};
export const GoldMat: React.FC<{ color?: string }> = ({ color = "#E7B04B" }) => (
  <meshPhysicalMaterial color={color} metalness={1} roughness={0.3} clearcoat={0.3} clearcoatRoughness={0.25} envMapIntensity={1.25} />
);

type Coin = { delay: number; vx: number; vy: number; vz: number; spin: number; yaw: number; tiltAxis: number; tLand: number; e: number; s: number };
const G = 15;

/**
 * <CoinBurst t at origin /> — at সেকেন্ডে origin থেকে coin ফোয়ারা। count 10–18 (কম = দামি)।
 * floorY = যেখানে coin থামবে। clearAt দিলে coin-গুলো একে একে ছোট হয়ে মিলায়।
 */
export const CoinBurst: React.FC<{ t: number; at: number; origin?: [number, number, number]; count?: number; seed?: number; spread?: number; lift?: number; depth?: number; size?: number; floorY?: number; clearAt?: number; color?: string; clearRadius?: number }> = ({
  t,
  at,
  origin = [0, 0, 0],
  count = 14,
  seed = 3,
  spread = 1,
  lift = 1,
  depth = 0.55,
  size = 1,
  floorY = FLOOR,
  clearAt,
  color,
  clearRadius = 0,
}) => {
  const geo = useMemo(() => coinGeo(), []);
  const rest = floorY + (COIN_T / 2) * size;
  const coins = useMemo(
    () =>
      seeded(seed, count, (r, i): Coin => {
        const phi = (i / count) * Math.PI * 2 + r() * 0.6;
        let hz = between(r, 1.1, 2.4) * spread;
        const vy = between(r, 6.5, 9) * lift;
        const y0 = origin[1] - rest;
        // y0 + vy u - G u²/2 = 0
        const tLand = (vy + Math.sqrt(vy * vy + 2 * G * y0)) / G;
        // clearRadius: উৎসের বস্তুর (pedestal) ভেতরে যেন না নামে — নামার দূরত্ব অন্তত এতটা
        const dirLen = Math.hypot(Math.cos(phi), Math.sin(phi) * depth);
        if (clearRadius > 0) hz = Math.max(hz, (clearRadius * between(r, 1.0, 1.18)) / (dirLen * tLand));
        // spin এমনভাবে মেলানো যাতে নামার মুহূর্তে coin প্রায় সমতল (ছোট residual) — landing-এ কোণ লাফায় না
        const raw = between(r, 11, 17) * (r() < 0.5 ? -1 : 1);
        const n = Math.round((raw * tLand) / Math.PI);
        const spin = (n * Math.PI + between(r, -0.38, 0.38)) / tLand;
        return { delay: i * 0.035 + r() * 0.03, vx: Math.cos(phi) * hz, vy, vz: Math.sin(phi) * hz * depth, spin, yaw: r() * Math.PI * 2, tiltAxis: r() * Math.PI * 2, tLand, e: between(r, 0.25, 0.36), s: between(r, 0.88, 1.08) * size };
      }),
    [seed, count, spread, lift, depth, size, origin[1], rest, clearRadius]
  );
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: color ?? "#E7B04B", metalness: 1, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.15 }), [color]);
  if (t < at) return null;
  return (
    <group>
      {coins.map((c, i) => {
        const u = t - at - c.delay;
        if (u <= 0) return null;
        let x: number, y: number, z: number, rx: number, rz = 0;
        if (u < c.tLand) {
          x = c.vx * u;
          z = c.vz * u;
          y = origin[1] + c.vy * u - (G * u * u) / 2;
          rx = c.spin * u;
        } else {
          // landing: ছোট bounce (restitution e), অনুভূমিক গতি ঘর্ষণে কমে, কোণ নিকটতম সমতলে কেঁপে থামে
          const v = u - c.tLand;
          const vyL = c.e * (G * c.tLand - c.vy);
          const tb = (2 * vyL) / G;
          const hop = v < tb ? vyL * v - (G * v * v) / 2 : 0;
          const fr = 3.2;
          const slide = (1 - Math.exp(-fr * v)) / fr;
          x = c.vx * (c.tLand + slide * 0.5);
          z = c.vz * (c.tLand + slide * 0.5);
          y = rest + Math.max(0, hop);
          const land = c.spin * c.tLand;
          const res = residualToFlat(land);
          const base = land - res;
          // Euler disk: কাত কমতে থাকে, কাঁপার হার বাড়ে (v=0-তে rx = land → continuous)
          const dec = Math.exp(-v * 3.1);
          const ph = 9 * v + 6 * v * v;
          rx = base + res * dec * Math.cos(ph);
          rz = Math.abs(res) * 0.8 * dec * Math.sin(ph);
        }
        let sc = c.s * (0.4 + 0.6 * smoothstep(0, 0.1, u));
        if (clearAt !== undefined) {
          const k = (t - clearAt - i * 0.03) / 0.3;
          if (k >= 1) return null;
          if (k > 0) sc *= 1 - k * k;
        }
        return (
          <group key={i} position={[origin[0] + x, y, origin[2] + z]} rotation={[0, c.yaw, 0]}>
            <mesh geometry={geo} material={mat} rotation={[rx, 0, rz]} scale={sc} castShadow receiveShadow />
          </group>
        );
      })}
    </group>
  );
};
