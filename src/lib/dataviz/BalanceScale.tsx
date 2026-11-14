// Balance scale — clay দাঁড়িপাল্লা: lathe foot + সরু column, pivot-এ beam ঘোরে; পাল্লা (lathe bowl) সবসময় খাড়া
// ঝোলে কিন্তু beam নড়লে pendulum-এর মতো দোলে (follow-through)। block উপর থেকে পড়ে (gravity), পাল্লায় পড়ে
// squash করে, beam ঝুঁকে damped দোলায় থামে। angle/swing বাইরে থেকে (scaleAngle helper)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, Txt } from "../../kit/Clay";
import { latheGeo, pillGeo, slabGeo, roundedCylGeo } from "../../kit/Geo";
import { springStep, wobble } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, P, Gloss } from "./common";

const HALF = 1.65; // beam অর্ধেক
const STR = 1.4; // সুতার দৈর্ঘ্য
const TOP = 3.2; // pivot উচ্চতা
const DROP_H = 2.4;
const T_LAND = 0.42;

export type ScaleBlock = { label: string; color: string; side: -1 | 1; at: number };

/** beam angle(t): প্রতিটা block landing-এ নতুন target, underdamped spring — +ve = বাম নিচে */
export const scaleAngle = (t: number, blocks: ScaleBlock[], per = 0.11, maxA = 0.3) => {
  const ev = [...blocks].map((b) => ({ t: b.at + T_LAND, s: b.side })).sort((a, b) => a.t - b.t);
  let a = 0;
  let prevTarget = 0;
  let L = 0,
    R = 0;
  for (const e of ev) {
    if (e.s < 0) L++;
    else R++;
    const target = Math.max(-maxA, Math.min(maxA, (L - R) * per * (L + R > 1 ? 1.25 : 1.6)));
    a += (target - prevTarget) * springStep(t - e.t, { k: 34, c: 2.6 }, 1.2);
    prevTarget = target;
  }
  return a;
};
/** পাল্লার দোলা: beam-এর angular acceleration-এর উল্টো (inertia) */
export const scaleSwing = (t: number, blocks: ScaleBlock[]) => {
  const h = 1 / 30;
  const acc = (scaleAngle(t + h, blocks) - 2 * scaleAngle(t, blocks) + scaleAngle(t - h, blocks)) / (h * h);
  const lag = scaleAngle(t - 0.1, blocks) - scaleAngle(t, blocks);
  return Math.max(-0.35, Math.min(0.35, lag * 1.4 - acc * 0.004));
};

const Block: React.FC<{ label: string; color: string; age: number; pos: [number, number] }> = ({ label, color, age, pos }) => {
  const g = useMemo(() => slabGeo(0.56, 0.5, 0.5, 0.12, 0.09, 6), []);
  if (age < 0) return null;
  const gAcc = (2 * DROP_H) / (T_LAND * T_LAND);
  const fall = age < T_LAND ? DROP_H - 0.5 * gAcc * age * age : 0;
  const sq = age >= T_LAND ? wobble(age - T_LAND, 0.2, 3.4, 0.28) : age > T_LAND - 0.1 ? 0 : -0.06; // পড়ার সময় একটু লম্বা
  const fade = Math.min(1, age * 8);
  return (
    <group position={[pos[0], pos[1] + fall, 0]} scale={[(1 + sq * 0.5) * fade, (1 - sq) * fade, (1 + sq * 0.5) * fade]}>
      <mesh geometry={g} position={[0, 0.25, 0]} castShadow receiveShadow>
        <Gloss color={color} rough={0.5} coat={0.35} />
      </mesh>
      <Txt size={label.length > 5 ? 0.09 : 0.11} color="#ffffff" position={[0, 0.25, 0.28]} letterSpacing={0.03}>
        {label}
      </Txt>
    </group>
  );
};

const Pan: React.FC<{ swing: number; blocks: { b: ScaleBlock; age: number; slot: number }[]; title?: string; titleColor?: string }> = ({ swing, blocks, title, titleColor = C.navy }) => {
  const bowl = useMemo(
    () =>
      latheGeo(
        [
          [0.0, -0.13],
          [0.32, -0.13],
          [0.55, -0.08],
          [0.68, 0.02],
          [0.72, 0.08],
          [0.69, 0.12],
          [0.6, 0.06],
          [0.3, 0.01],
          [0.0, 0.0],
        ],
        72,
        90
      ),
    []
  );
  const hook = useMemo(() => {
    const g = new THREE.TorusGeometry(0.07, 0.025, 12, 24);
    return g;
  }, []);
  // সুতা: hook থেকে rim-এর ৩ বিন্দু
  // সামনে (ক্যামেরার দিকে) কোনো সুতা নয় — block ঢাকবে না
  const rimPts = [0, Math.PI, -Math.PI / 2].map((a) => new THREE.Vector3(Math.cos(a) * 0.66, -STR + 0.1, Math.sin(a) * 0.66));
  const slots: [number, number][] = [
    [-0.3, 0.02],
    [0.3, 0.02],
    [0, 0.52],
  ];
  return (
    <group rotation={[0, 0, swing]}>
      <mesh geometry={hook} rotation={[0, Math.PI / 2, 0]}>
        <SilverMat rough={0.35} />
      </mesh>
      {rimPts.map((r, i) => {
        const len = r.length();
        const mid = r.clone().multiplyScalar(0.5);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), r.clone().normalize());
        return (
          <mesh key={i} position={mid.toArray() as any} quaternion={q}>
            <cylinderGeometry args={[0.012, 0.012, len, 8]} />
            <SilverMat rough={0.4} />
          </mesh>
        );
      })}
      <group position={[0, -STR, 0]}>
        <mesh geometry={bowl} castShadow receiveShadow>
          <Gloss color="#F3EDE6" rough={0.4} coat={0.5} />
        </mesh>
        {blocks.map(({ b, age, slot }, i) => (
          <Block key={i} label={b.label} color={b.color} age={age} pos={slots[slot % 3]} />
        ))}
        {title && (
          <Txt size={0.16} color={titleColor} position={[0, -0.36, 0.2]} letterSpacing={0.05}>
            {title}
          </Txt>
        )}
      </group>
    </group>
  );
};

export const BalanceScale: React.FC<
  P & {
    blocks: ScaleBlock[];
    /** এখনকার সময় (block পড়ার age হিসাবের জন্য) */
    t: number;
    angle: number;
    swing?: number;
    leftTitle?: string;
    rightTitle?: string;
  }
> = ({ blocks, t, angle, swing = 0, leftTitle, rightTitle, ...p }) => {
  const foot = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.82, 0.0],
          [0.95, 0.06],
          [0.9, 0.18],
          [0.55, 0.3],
          [0.2, 0.4],
          [0.13, 0.5],
          [0.0, 0.52],
        ],
        72
      ),
    []
  );
  const col = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.4],
          [0.14, 0.45],
          [0.11, 0.9],
          [0.09, 2.0],
          [0.1, TOP - 0.22],
          [0.17, TOP - 0.1],
          [0.0, TOP - 0.04],
        ],
        48
      ),
    []
  );
  const beam = useMemo(() => pillGeo(HALF * 2 + 0.26, 0.17, 0.17, 0.07), []);
  const knob = useMemo(() => roundedCylGeo(0.17, 0.16, 0.07, 48), []);
  const tip = useMemo(() => latheGeo([[0, 0], [0.09, 0.02], [0.1, 0.12], [0.05, 0.24], [0, 0.27]], 32), []);
  const side = (s: -1 | 1) =>
    blocks
      .filter((b) => b.side === s)
      .map((b, i) => ({ b, age: t - b.at, slot: i }));
  const ends = [-1, 1].map((s) => [Math.cos(angle) * HALF * s, Math.sin(angle) * HALF * s] as [number, number]);
  return (
    <G {...p}>
      <mesh geometry={foot} castShadow receiveShadow>
        <ClayMat color="#EFE5D8" />
      </mesh>
      <mesh geometry={col} castShadow receiveShadow>
        <Gloss color="#F1E8DD" rough={0.5} coat={0.3} />
      </mesh>
      <group position={[0, TOP, 0]}>
        <group rotation={[0, 0, angle]}>
          <mesh geometry={beam} castShadow>
            <Gloss color={C.navy} rough={0.4} coat={0.5} />
          </mesh>
        </group>
        <mesh geometry={knob} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow>
          <Gloss color={C.orange} rough={0.35} coat={0.7} />
        </mesh>
        {/* pointer — beam-এর সাথে ঘোরে, উপরের দিকে */}
        <group rotation={[0, 0, angle]}>
          <mesh geometry={tip} position={[0, 0.08, 0]}>
            <Gloss color={C.orange} rough={0.35} coat={0.7} />
          </mesh>
        </group>
        {ends.map(([x, y], i) => (
          <group key={i} position={[x, y - 0.1, 0]}>
            <Pan swing={swing * (i === 0 ? 1 : 1)} blocks={side(i === 0 ? -1 : 1)} title={i === 0 ? leftTitle : rightTitle} titleColor={i === 0 ? C.navy : C.deepOrange} />
          </group>
        ))}
      </group>
    </G>
  );
};
