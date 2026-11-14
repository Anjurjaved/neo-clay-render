// faceless navy clay figure — master-এর মতো: বড় গোল মাথা, gumdrop দেহ (নিচে চওড়া), লম্বাটে হাত,
// মোটা আলাদা পা গোল পায়ের পাতাসহ। উচ্চতা ≈ 1.12 (পায়ের তলা y=0)।
// walk: phase = দূরত্ব / চক্র (পা পিছলায় না), bob 2×, hip roll, হাত-পা উল্টো দোলে।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat } from "./Clay";
import { latheGeo } from "./Geo";
import { C } from "./theme";

export type FigurePose = {
  /** walk দূরত্ব (world units, scale-এর আগে) — phase এর থেকে আসে */
  dist?: number;
  /** 0..1 — চলার তীব্রতা (থামা/শুরু easing) */
  walk?: number;
  cheer?: number; // 0..1 দুই হাত উপরে
  type?: number; // 0..1 টাইপ করা ভঙ্গি
  typePhase?: number;
  lean?: number; // সামনে ঝোঁকা (rad)
  armOut?: [number, number]; // [left,right] হাত বাইরে/সামনে অতিরিক্ত (rad, x-axis) — হাত ধরাধরি
};

const CYCLE = 0.62; // এক চক্র (২ কদম) কত দূরত্ব

export const Figure: React.FC<{
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  color?: string;
  pose?: FigurePose;
  opacity?: number;
  coat?: string; // দেহের রং আলাদা (যেমন ডাক্তারের সাদা coat)
  headTilt?: number; // মাথা কাত (rad, z)
  children?: React.ReactNode; // দেহে লাগানো অতিরিক্ত (stethoscope ইত্যাদি) — body-local
}> = ({ position = [0, 0, 0], rotationY = 0, scale = 1, color = C.figure, pose = {}, opacity = 1, coat, headTilt = 0, children }) => {
  const body = useMemo(
    () =>
      latheGeo([
        [0.0, 0.36],
        [0.15, 0.37],
        [0.205, 0.43],
        [0.21, 0.52],
        [0.19, 0.64],
        [0.155, 0.74],
        [0.1, 0.8],
        [0.0, 0.825],
      ]),
    []
  );
  const k = Math.max(0, Math.min(1, pose.walk ?? 0));
  const ph = ((pose.dist ?? 0) / CYCLE) * Math.PI * 2;
  const legSwing = 0.62 * k;
  const legL = Math.sin(ph) * legSwing;
  const legR = -legL;
  const bob = 0.022 * k * Math.abs(Math.cos(ph));
  const roll = 0.07 * k * Math.sin(ph);
  const armL = -Math.sin(ph) * 0.55 * k;
  const armR = -armL;
  const cheer = pose.cheer ?? 0;
  const typ = pose.type ?? 0;
  const tp = pose.typePhase ?? 0;
  const lean = (pose.lean ?? 0) + 0.06 * k;
  const out = pose.armOut ?? [0, 0];
  const m = <ClayMat color={color} rough={0.6} opacity={opacity} />;

  const Leg: React.FC<{ s: number; a: number }> = ({ s, a }) => (
    <group position={[0.088 * s, 0.4, 0]} rotation={[a, 0, 0]}>
      {/* thigh+shin capsule */}
      <mesh position={[0, -0.17, 0]} castShadow>
        <capsuleGeometry args={[0.078, 0.2, 8, 20]} />
        {m}
      </mesh>
      {/* foot: সামনে একটু লম্বা গোল পাতা */}
      <mesh position={[0, -0.355, 0.03]} scale={[1, 0.62, 1.32]} castShadow>
        <sphereGeometry args={[0.082, 24, 16]} />
        {m}
      </mesh>
    </group>
  );
  const Arm: React.FC<{ s: number; swing: number; extra: number }> = ({ s, swing, extra }) => {
    const up = cheer * 2.7;
    const typeA = typ * (1.15 + Math.sin(tp * 9 + s) * 0.06);
    return (
      <group position={[0.165 * s, 0.735, 0]} rotation={[-swing - typeA - extra, 0, s * (0.16 + up)]}>
        <mesh position={[0, -0.16, 0]} castShadow>
          <capsuleGeometry args={[0.058, 0.22, 8, 18]} />
          {coat ? <ClayMat color={coat} rough={0.62} opacity={opacity} /> : m}
        </mesh>
      </group>
    );
  };
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <group position={[0, bob, 0]} rotation={[lean, 0, roll * 0.5]}>
        <Leg s={-1} a={legL} />
        <Leg s={1} a={legR} />
        <group rotation={[0, 0, roll * 0.5]}>
          <mesh geometry={body} castShadow receiveShadow>
            {coat ? <ClayMat color={coat} rough={0.62} opacity={opacity} /> : m}
          </mesh>
          {children}
          <Arm s={-1} swing={armL} extra={out[0]} />
          <Arm s={1} swing={armR} extra={out[1]} />
          {/* head: lags bob a little */}
          <mesh position={[0, 1.0 + 0.008 * k * Math.cos(ph * 2 - 0.6), 0]} rotation={[0, 0, headTilt]} castShadow>
            <sphereGeometry args={[0.17, 40, 28]} />
            {m}
          </mesh>
        </group>
      </group>
    </group>
  );
};
