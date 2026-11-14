// Lead funnel — প্রতিটা স্তর এক টুকরার lathe band (capsule cross-section → নরম rim, ভেতর-বাইরে মসৃণ),
// উপর থেকে spring দিয়ে পড়ে স্তূপ হয়; গায়ে বাঁকা (curveRadius) সংখ্যা count-up। lead-বল উপর থেকে পড়ে মুখে ঢোকে,
// অল্প কয়েকটা spout দিয়ে বেরিয়ে floor-এ লাফিয়ে গড়িয়ে সারি বাঁধে (অনেক ঢোকে, কম বেরোয়)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { springStep } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, P, Gloss, CTxt, fmt, rand } from "./common";

/** shell band: (rb,y0)→(rt,y1) slant বরাবর capsule cross-section (wall পুরু) lathe */
export const bandGeo = (rb: number, rt: number, h: number, wall: number, seg = 96) => {
  const a = new THREE.Vector2(rb, 0),
    b = new THREE.Vector2(rt, h);
  const dir = b.clone().sub(a).normalize();
  const nrm = new THREE.Vector2(dir.y, -dir.x); // বাইরের দিকে
  const r = wall / 2;
  const pts: THREE.Vector2[] = [];
  const N = 14;
  // outer line a→b (offset +r), b-তে অর্ধবৃত্ত, inner b→a, a-তে অর্ধবৃত্ত
  const ang0 = Math.atan2(nrm.y, nrm.x);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(a.clone().lerp(b, t).add(nrm.clone().multiplyScalar(r)));
  }
  for (let i = 1; i < N; i++) {
    const th = ang0 + (Math.PI * i) / N;
    pts.push(new THREE.Vector2(b.x + Math.cos(th) * r, b.y + Math.sin(th) * r));
  }
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(b.clone().lerp(a, t).add(nrm.clone().multiplyScalar(-r)));
  }
  for (let i = 1; i <= N; i++) {
    const th = ang0 + Math.PI + (Math.PI * i) / N;
    pts.push(new THREE.Vector2(a.x + Math.cos(th) * r, a.y + Math.sin(th) * r));
  }
  // capsule loop ঘড়ির-কাঁটার উল্টো (বাইরে উপরে ওঠা) → lathe-এর normal বাইরে
  const g = new THREE.LatheGeometry(pts, seg);
  g.computeVertexNormals();
  return g;
};

export type Tier = { label: string; value: number; color: string; ink?: string };

const TH = 0.62,
  GAP = 0.08,
  WALL = 0.2;
const RADII: [number, number][] = [
  [1.18, 1.62],
  [0.84, 1.14],
  [0.56, 0.8],
  [0.32, 0.52],
];

const Band: React.FC<{ rb: number; rt: number; color: string }> = ({ rb, rt, color }) => {
  const g = useMemo(() => bandGeo(rb, rt, TH, WALL), [rb, rt]);
  return (
    <mesh geometry={g} castShadow receiveShadow>
      <Gloss color={color} rough={0.45} coat={0.45} />
    </mesh>
  );
};

const BALL_R = 0.12;
/** একটা বলের world অবস্থান (funnel local) ও scale — deterministic */
const ballState = (age: number, i: number, exits: boolean, topY: number, spoutY: number, slot: number) => {
  const fallT = 0.5;
  const x0 = (rand(i) - 0.5) * 1.6,
    z0 = (rand(i + 9) - 0.5) * 0.8;
  if (age < fallT) {
    const k = age / fallT;
    return { p: [x0 * (1 - k * 0.3), topY + 2.2 - 2.2 * k * k, z0 * (1 - k * 0.3)] as [number, number, number], s: 1 };
  }
  const inT = 0.9;
  const u = age - fallT;
  if (u < inT) {
    // ভেতরে ঘুরে নামা
    const k = u / inT;
    const y = topY - (topY - spoutY) * k;
    const rr = (0.9 - 0.75 * k) * (0.7 + 0.3 * rand(i + 3));
    const a = rand(i + 5) * 6.28 + k * 7;
    return { p: [Math.cos(a) * rr, y, Math.sin(a) * rr] as [number, number, number], s: exits ? 1 : Math.max(0, 1 - k * 1.6) };
  }
  if (!exits) return null;
  const v = u - inT;
  // spout থেকে পড়া → bounce → গড়িয়ে slot-এ
  const gA = 12;
  const y0 = spoutY - 0.15;
  const tHit = Math.sqrt((2 * (y0 - BALL_R)) / gA);
  let y = y0;
  if (v < tHit) y = y0 - 0.5 * gA * v * v;
  else {
    const vy0 = gA * tHit * 0.42;
    const w = v - tHit;
    const t2 = (2 * vy0) / gA;
    if (w < t2) y = BALL_R + vy0 * w - 0.5 * gA * w * w;
    else {
      const vy1 = vy0 * 0.4,
        w2 = w - t2,
        t3 = (2 * vy1) / gA;
      y = BALL_R + (w2 < t3 ? vy1 * w2 - 0.5 * gA * w2 * w2 : 0);
    }
  }
  const tx = 0.95 + slot * 0.27;
  const roll = 1 - Math.exp(-Math.max(0, v - 0.05) * 3.2);
  return { p: [tx * roll, Math.max(BALL_R, y), 0.55 * roll] as [number, number, number], s: 1, spin: tx * roll / BALL_R };
};

export const Funnel: React.FC<
  P & {
    tiers: Tier[];
    /** প্রতিটা স্তরের ঢোকা spring (0..1+) */
    tierIn: number[];
    /** 0..1 সংখ্যা count-up */
    count: number;
    /** বল প্রবাহ শুরুর পর সেকেন্ড (ঋণাত্মক = নেই) */
    flow?: number;
    balls?: number;
    /** প্রতি কয়টা বলে একটা বেরোয় */
    exitEvery?: number;
    /** floor থেকে funnel-এর তলা (spout) কত উঁচু */
    lift?: number;
  }
> = ({ tiers, tierIn, count, flow = -1, balls = 16, exitEvery = 4, lift = 0.95, ...p }) => {
  const n = Math.min(tiers.length, RADII.length);
  const spout = useMemo(() => bandGeo(0.2, 0.27, 0.32, 0.12), []);
  const spoutY = lift; // spout-এর নিচ
  const base = spoutY + 0.36;
  const tierY = (i: number) => base + (n - 1 - i) * (TH + GAP); // i=0 সবচেয়ে উপরে
  const topY = tierY(0) + TH;
  const ballMat = useMemo(() => [C.orange, C.navy, C.steel], []);
  return (
    <G {...p}>
      <group position={[0, spoutY, 0]} scale={Math.max(0.001, Math.min(1.2, tierIn[n - 1] ?? 0))}>
        <mesh geometry={spout} castShadow>
          <Gloss color={tiers[n - 1].color} rough={0.45} coat={0.45} />
        </mesh>
      </group>
      {tiers.slice(0, n).map((tr, i) => {
        const k = tierIn[i] ?? 0;
        if (k <= 0.001) return null;
        const [rb, rt] = RADII[i];
        const drop = (1 - k) * 1.8;
        const sq = Math.max(-0.12, Math.min(0.12, (k - 1) * 0.8));
        const slant = Math.atan2(rt - rb, TH);
        // slant করা তলের বাইরের পিঠ: অনুভূমিক দূরত্ব = (wall/2)/cos(slant) — শুধু wall/2 নিলে লেখা তলের ভেতরে ঢুকে যায়
        const midR = (rb + rt) / 2 + WALL / 2 / Math.cos(slant) + 0.035;
        const shown = Math.round(tr.value * Math.max(0, Math.min(1, count)));
        return (
          <group key={i} position={[0, tierY(i) + drop, 0]} scale={[1 - sq * 0.5, 1 + sq, 1 - sq * 0.5]}>
            <Band rb={rb} rt={rt} color={tr.color} />
            <group position={[0, TH / 2, 0]}>
              <group rotation={[0, 0, 0]}>
                <group position={[0, 0, midR]} rotation={[slant, 0, 0]}>
                  <CTxt size={i === 0 ? 0.22 : 0.19} curve={-midR} color={tr.ink ?? "#ffffff"} position={[0, 0.07, 0]}>
                    {fmt(shown)}
                  </CTxt>
                  <CTxt size={i === 0 ? 0.105 : 0.095} curve={-midR} color={tr.ink ?? "#ffffff"} position={[0, -0.13, 0]} letterSpacing={0.08} semi>
                    {tr.label}
                  </CTxt>
                </group>
              </group>
            </group>
          </group>
        );
      })}
      {flow >= 0 &&
        Array.from({ length: balls }, (_, i) => {
          const age = flow - i * 0.22;
          if (age < 0) return null;
          const exits = i % exitEvery === 1;
          const st = ballState(age, i, exits, topY, spoutY, Math.floor(i / exitEvery));
          if (!st || st.s <= 0.01) return null;
          return (
            <mesh key={i} position={st.p} rotation={[0, 0, -(st as any).spin || 0]} scale={st.s} castShadow>
              <sphereGeometry args={[BALL_R, 28, 20]} />
              <Gloss color={exits ? C.orange : ballMat[i % 3]} rough={0.3} coat={0.8} />
            </mesh>
          );
        })}
    </G>
  );
};
