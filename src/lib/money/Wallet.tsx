// Soft leather bi-fold wallet — the whole shell is ONE thick sheet folded around a real spine arc
// (no hinge seam): fold α = π closed … ~0.25 open. Stitching follows the deformed surface.
// Inside: card slots on the left leaf, a note pocket on the right; notes slide out (`notes` 0..1) and fan.
// Wallet stands upright, right leaf fixed in the local XY plane (x 0 … WL.leaf), spine at x = 0, bottom y = 0.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat } from "../../kit/Clay";
import { slabGeo } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { G, P, sheetGeo, useDisposable, k01, SoftMat } from "./common";
import { Banknote, NOTE } from "./Banknote";

export const WL = { leaf: 1.9, h: 1.55, t: 0.075, spine: 0.3 };

/** mid-surface of the folded shell; X = position along the unfolded sheet (0 at spine start, + = right leaf) */
export const walletFold = (alpha: number) => {
  const a = Math.max(1e-3, alpha);
  const rho = WL.spine / a;
  const dir: [number, number] = [-Math.cos(a), Math.sin(a)]; // (x, z) direction of the left leaf
  const E: [number, number] = [-rho * Math.sin(a), rho * (1 - Math.cos(a))];
  const map = (X: number): [number, number] => {
    if (X >= 0) return [X, 0];
    const s = -X;
    if (s <= WL.spine) {
      const th = (s / WL.spine) * a;
      return [-rho * Math.sin(th), rho * (1 - Math.cos(th))];
    }
    const u = s - WL.spine;
    return [E[0] + dir[0] * u, E[1] + dir[1] * u];
  };
  return { map, E, alpha: a };
};

export const Wallet: React.FC<P & { open: number; notes?: number; color?: string; inner?: string; noteStyle?: string }> = ({
  open,
  notes = 0,
  color = "#A8603A",
  inner = "#C98A5E",
  noteStyle = "green",
  ...p
}) => {
  const alpha = Math.PI - (Math.PI - 0.8) * open; // closed = π
  const fold = walletFold(alpha);
  const total = WL.leaf * 2 + WL.spine;
  const shell = useDisposable(
    () =>
      sheetGeo({
        w: total,
        h: WL.h,
        t: WL.t,
        r: 0.16,
        nx: 70,
        ny: 10,
        edge: 6,
        deform: (x, y) => {
          const X = x + total / 2 - WL.spine - WL.leaf; // left edge X = -(spine+leaf)
          const [px, pz] = fold.map(X);
          return [px, y + WL.h / 2, pz];
        },
      }),
    [alpha]
  );
  // stitching: tiny capsules along an inset loop of the OUTER (back) face
  const stitchGeo = useMemo(() => new THREE.CapsuleGeometry(0.009, 0.05, 3, 6), []);
  const stitches = useMemo(() => {
    const out: { p: THREE.Vector3; q: THREE.Quaternion }[] = [];
    const ins = 0.09;
    const X0 = -(WL.spine + WL.leaf) + ins,
      X1 = WL.leaf - ins;
    const y0 = ins,
      y1 = WL.h - ins;
    const pts: [number, number][] = [];
    const step = 0.085;
    for (let X = X0; X <= X1; X += step) pts.push([X, y0]);
    for (let y = y0; y <= y1; y += step) pts.push([X1, y]);
    for (let X = X1; X >= X0; X -= step) pts.push([X, y1]);
    for (let y = y1; y >= y0; y -= step) pts.push([X0, y]);
    const surf = (X: number, y: number) => {
      const [x, z] = fold.map(X);
      return new THREE.Vector3(x, y, z);
    };
    for (let i = 0; i < pts.length; i++) {
      const [X, y] = pts[i];
      const [X2, y2] = pts[(i + 1) % pts.length];
      const a = surf(X, y),
        b = surf((X + X2) / 2, (y + y2) / 2);
      const tng = b.clone().sub(a);
      if (tng.length() < 1e-4) continue;
      // outward (back face) normal = -(dP/dX × ŷ)… use finite difference
      const dX = surf(X + 0.01, y).sub(surf(X - 0.01, y));
      const n = new THREE.Vector3().crossVectors(dX, new THREE.Vector3(0, 1, 0)).normalize(); // front (inner) normal
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tng.normalize());
      for (const sg of [1, -1]) out.push({ p: a.clone().addScaledVector(n, sg * (WL.t / 2 + 0.002)), q });
    }
    return out;
  }, [alpha]);
  // left-leaf rigid frame (for card slots)
  const leftFrame = { pos: [fold.E[0], 0, fold.E[1]] as [number, number, number], rotY: fold.alpha };
  const slotG = useMemo(() => slabGeo(1.6, 0.34, 0.035, 0.06, 0.016, 4), []);
  const cardG = useMemo(() => slabGeo(1.45, 0.5, 0.022, 0.07, 0.009, 3), []);
  const pocketG = useMemo(() => slabGeo(1.72, 0.62, 0.04, 0.08, 0.018, 4), []);
  const chipG = useMemo(() => slabGeo(0.16, 0.1, 0.012, 0.025, 0.005, 2), []);
  const nk = k01(notes);
  return (
    <G {...p}>
      <mesh geometry={shell} castShadow receiveShadow>
        <SoftMat attach="material-0" color={inner} rough={0.58} sheen={0.6} />
        <SoftMat attach="material-1" color={color} rough={0.48} sheen={0.7} clearcoat={0.15} />
        <SoftMat attach="material-2" color={color} rough={0.48} sheen={0.7} clearcoat={0.15} />
      </mesh>
      {stitches.map((s, i) => (
        <mesh key={i} geometry={stitchGeo} position={s.p} quaternion={s.q}>
          <meshStandardMaterial color="#F3E2C6" roughness={0.7} />
        </mesh>
      ))}
      {/* left leaf inside: card slots with cards peeking */}
      {open > 0.3 && (
        <group position={leftFrame.pos} rotation={[0, leftFrame.rotY, 0]}>
          {[0, 1, 2].map((i) => {
            const y = 0.42 + i * 0.34;
            const cols = [C.orange, C.navy, "#2DBE60"];
            return (
              <group key={i}>
                <mesh geometry={cardG} position={[-WL.leaf / 2 - 0.02, y + 0.02, WL.t / 2 + 0.02 + i * 0.012]}>
                  <meshPhysicalMaterial color={cols[i]} roughness={0.35} clearcoat={0.7} clearcoatRoughness={0.2} />
                </mesh>
                {i === 2 && (
                  <mesh geometry={chipG} position={[-WL.leaf / 2 - 0.45, y + 0.2, WL.t / 2 + 0.04 + i * 0.012]}>
                    <SilverMat color="#e7c77a" rough={0.3} />
                  </mesh>
                )}
                <mesh geometry={slotG} position={[-WL.leaf / 2, y, WL.t / 2 + 0.035 + i * 0.012]} castShadow>
                  <ClayMat color={inner} rough={0.55} sheen={0.6} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}
      {/* right leaf: notes behind pocket */}
      {open > 0.3 && (
        <group>
          {[0, 1, 2].map((i) => {
            const k = k01(nk * 1.4 - i * 0.2);
            const rise = k * (0.55 + i * 0.12);
            const fan = (i - 1) * 0.16 * k;
            return (
              <group key={i} position={[WL.leaf / 2 + 0.02 + fan * 0.6, 0.78 + rise, WL.t / 2 + 0.03 + i * 0.014]} rotation={[0, 0, fan]} scale={0.56}>
                <Banknote style={noteStyle} bend={0.08} flutter={0.012 * k} phase={i * 1.3 + nk * 6} />
              </group>
            );
          })}
          <mesh geometry={pocketG} position={[WL.leaf / 2, 0.42, WL.t / 2 + 0.085]} castShadow>
            <ClayMat color={inner} rough={0.55} sheen={0.6} />
          </mesh>
        </group>
      )}
    </G>
  );
};
export const WALLET_NOTE_W = NOTE.w * 0.56;
