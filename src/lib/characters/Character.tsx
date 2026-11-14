// <Character> — faceless navy clay figure v2: দেহ, হাত, পা, মাথা সব মিলে এক টুকরার নরম mesh (SDF bake প্রতি pose-এ)।
// role অনুযায়ী পোশাক (doctor coat + stethoscope, receptionist headset + lanyard, owner collar + tie,
// customer cap, developer headphones)। holdL/holdR = হাতের anchor-এ বসানো বস্তু (palm surface, Z = palm normal)।
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { ClayMat } from "../../kit/Clay";
import { C } from "../../kit/theme";
import { Pose } from "./rig";
import { bodyOps, rigOf, Rig } from "./rig";
import { polygonize } from "./sdf";
import { Outfit, Role, outfitBodyOps } from "./outfits";

export type { Role };

const keyOf = (p: Pose) => JSON.stringify(p, (_k, val) => (typeof val === "number" ? Math.round(val * 1e4) / 1e4 : val));

/** per-pose geometry with disposal */
const useBaked = (key: string, make: () => THREE.BufferGeometry | null) => {
  const g = useMemo(make, [key]);
  useEffect(() => () => g?.dispose(), [g]);
  return g;
};

export const Character: React.FC<{
  pose: Pose;
  role?: Role;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  color?: string;
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
  /** grid cell (figure units) — ছোট = মসৃণ কিন্তু ধীর; দূরের figure-এ 0.018 */
  cell?: number;
  opacity?: number;
  /** squash/stretch (landing, pop) — y scale, volume preserving */
  squash?: number;
  onRig?: (r: Rig) => void;
}> = ({ pose, role = "plain", position = [0, 0, 0], rotationY = 0, scale = 1, color = C.figure, holdL, holdR, cell = 0.0105, opacity = 1, squash = 1 }) => {
  const key = keyOf(pose) + role + cell;
  const rig = useMemo(() => rigOf(pose), [key]);
  const body = useBaked(key, () => polygonize([...bodyOps(rig), ...outfitBodyOps(rig, role)], cell));
  const sq = 1 / Math.sqrt(Math.max(0.3, squash));
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale * sq, scale * squash, scale * sq]}>
      <mesh geometry={body!} castShadow receiveShadow>
        <ClayMat color={color} rough={0.62} bump={0.25} sheen={0.5} opacity={opacity} />
      </mesh>
      <Outfit rig={rig} role={role} cell={cell} pkey={key} />
      {holdL && (
        <group matrix={rig.handM.L} matrixAutoUpdate={false}>
          {holdL}
        </group>
      )}
      {holdR && (
        <group matrix={rig.handM.R} matrixAutoUpdate={false}>
          {holdR}
        </group>
      )}
    </group>
  );
};
