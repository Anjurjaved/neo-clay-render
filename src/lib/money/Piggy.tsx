// Piggy bank — ONE seamless mesh: body, snout, legs, ears, curly tail fused by smooth-min SDF and baked
// once with MarchingCubes; coin slot + nostrils carved by smooth subtraction. Only the eyes are inlays.
// Pig faces +x; feet at local y = 0; slot along x on top (y ≈ PIG.slotY).
import React from "react";
import * as THREE from "three";
import { bakeSDF, sdEllipsoid, sdCapsule, sdRoundBox, sdSphere, smin, smax, G, P } from "./common";

export const PIG = { slotY: 1.6, footY: 0.0, len: 2.6 };

const OFF = 0.8; // body centre height above feet

const pigSDF = (x: number, y0: number, z: number) => {
  const y = y0;
  let d = sdEllipsoid(x, y, z, 1.02, 0.8, 0.82);
  // snout (rounded cylinder along x)
  {
    const px = x - 1.0,
      py = y + 0.06;
    const rr = Math.hypot(py, z);
    const dx = Math.abs(px) - 0.16,
      dr = rr - 0.3;
    const cyl = Math.min(Math.max(dx, dr), 0) + Math.hypot(Math.max(dx, 0), Math.max(dr, 0)) - 0.06;
    d = smin(d, cyl, 0.18);
  }
  // legs
  for (const [lx, lz] of [
    [0.52, 0.42],
    [0.52, -0.42],
    [-0.5, 0.42],
    [-0.5, -0.42],
  ] as [number, number][]) {
    d = smin(d, sdCapsule(x, y, z, [lx, -0.45, lz], [lx * 1.02, -0.8, lz * 1.04], 0.19), 0.16);
  }
  // ears (flattened, tilted forward)
  for (const s of [1, -1]) {
    const ex = x - 0.42,
      ey = y - 0.72,
      ez = z - s * 0.4;
    const ca = Math.cos(0.5),
      sa = Math.sin(0.5);
    const rx = ex * ca - ey * sa,
      ry = ex * sa + ey * ca;
    d = smin(d, sdEllipsoid(rx, ry, ez, 0.08, 0.22, 0.17), 0.1);
  }
  // curly tail (torus arc behind)
  {
    const tx = x + 1.04,
      ty = y - 0.18,
      tz = z;
    const q = Math.hypot(tx, ty) - 0.12;
    const tor = Math.hypot(q, tz) - 0.045;
    d = smin(d, tor, 0.06);
  }
  // coin slot (smooth carve)
  d = smax(d, -sdRoundBox(x + 0.05, y - 0.8, z, 0.27, 0.16, 0.04, 0.035), 0.05);
  // nostrils
  for (const s of [1, -1]) d = smax(d, -sdSphere(x - 1.22, y + 0.06, z - s * 0.1, 0.06), 0.03);
  // flatten feet bottoms
  d = smax(d, -(y + 0.8 - 0.0) , 0.04);
  return d;
};

let _pig: THREE.BufferGeometry | null = null;
export const piggyGeo = () => {
  if (_pig) return _pig;
  _pig = bakeSDF(pigSDF, 1.45, 128, 250000);
  return _pig;
};

export const Piggy: React.FC<P & { color?: string; squash?: number }> = ({ color = "#F3A6B6", squash = 0, ...p }) => {
  const g = piggyGeo();
  const eye = (s: number) => (
    <mesh position={[0.74, 0.3 + OFF, s * 0.45]} scale={[0.7, 1, 0.6]}>
      <sphereGeometry args={[0.075, 24, 16]} />
      <meshPhysicalMaterial color="#1a2433" roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} />
    </mesh>
  );
  return (
    <G {...p}>
      <group scale={[1 + squash * 0.5, 1 - squash, 1 + squash * 0.5]}>
        <mesh geometry={g} position={[0, OFF - 0.0, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.45} clearcoatRoughness={0.3} sheen={0.5} sheenColor="#ffe0e6" />
        </mesh>
        {eye(1)}
        {eye(-1)}
      </group>
    </G>
  );
};
export const PIG_SLOT: [number, number, number] = [-0.05, OFF + 0.8, 0];
