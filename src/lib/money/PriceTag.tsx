// Hanging price tag: one bevelled extruded body (chamfered top, punched hole + silver eyelet),
// twine loop through the hole up to a peg; swing/lag/twist given as props (pendulum computed by caller —
// see tagSwing()). Number counts up (`count` 0..1).
import React, { useMemo } from "react";
import * as THREE from "three";
import { SilverMat, ClayMat, Txt } from "../../kit/Clay";
import { shapeGeo, roundedCylGeo } from "../../kit/Geo";
import { wobble } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, P, GlossMat } from "./common";

/** polygon with filleted corners */
export const roundedPoly = (pts: [number, number][], r: number | number[], shape: THREE.Path = new THREE.Shape()) => {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n],
      p1 = pts[i],
      p2 = pts[(i + 1) % n];
    const rr = Array.isArray(r) ? r[i] : r;
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]],
      v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(v1[0], v1[1]),
      l2 = Math.hypot(v2[0], v2[1]);
    const a = [p1[0] + (v1[0] / l1) * Math.min(rr, l1 / 2), p1[1] + (v1[1] / l1) * Math.min(rr, l1 / 2)];
    const b = [p1[0] + (v2[0] / l2) * Math.min(rr, l2 / 2), p1[1] + (v2[1] / l2) * Math.min(rr, l2 / 2)];
    if (i === 0) shape.moveTo(a[0], a[1]);
    else shape.lineTo(a[0], a[1]);
    shape.quadraticCurveTo(p1[0], p1[1], b[0], b[1]);
  }
  shape.closePath();
  return shape;
};

export const TAG = { w: 1.75, h: 2.5, top: 0.36, d: 0.17, hole: 0.11, string: 1.05 };

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

export const PriceTag: React.FC<
  P & { value: number; count?: number; currency?: string; label?: string; sub?: string; swing?: number; lag?: number; twist?: number; color?: string; ink?: string; peg?: boolean }
> = ({ value, count = 1, currency = "Tk", label = "WEBSITE", sub = "one-time", swing = 0, lag = 0, twist = 0, color = C.orange, ink = "#ffffff", peg = true, ...p }) => {
  const { w, h, top, d, hole, string: Ls } = TAG;
  const body = useMemo(() => {
    const c = 0.5;
    const s = roundedPoly(
      [
        [-w / 2, top - c],
        [-w / 2 + c, top],
        [w / 2 - c, top],
        [w / 2, top - c],
        [w / 2, top - h],
        [-w / 2, top - h],
      ],
      [0.16, 0.14, 0.14, 0.16, 0.22, 0.22]
    ) as THREE.Shape;
    const hp = new THREE.Path();
    hp.absarc(0, 0, hole, 0, Math.PI * 2, true);
    s.holes.push(hp);
    const g = shapeGeo(s, d - 0.12, 0.06, 6);
    g.translate(0, 0, -(d - 0.12) / 2);
    g.computeVertexNormals();
    return g;
  }, []);
  // twine: loop from peg down the front, through the hole, back up behind
  const twine = useMemo(() => {
    const pts = [
      new THREE.Vector3(0.0, Ls, 0.0),
      new THREE.Vector3(0.06, Ls * 0.55, 0.05),
      new THREE.Vector3(0.05, hole * 1.15, d * 0.5 + 0.02),
      new THREE.Vector3(0.0, hole * 0.45, 0.0),
      new THREE.Vector3(-0.05, hole * 1.15, -d * 0.5 - 0.02),
      new THREE.Vector3(-0.06, Ls * 0.55, -0.05),
      new THREE.Vector3(0.0, Ls, 0.0),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5), 120, 0.018, 10, false);
  }, []);
  const pegG = useMemo(() => roundedCylGeo(0.09, 0.28, 0.04, 32), []);
  const n = value * Math.max(0, Math.min(1, count));
  const num = fmt(n);
  const fs = Math.min(0.5, (w * 0.86) / (fmt(value).length * 0.6));
  return (
    <G {...p}>
      {peg && (
        <mesh geometry={pegG} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.05]} castShadow>
          <SilverMat color="#c9ced4" rough={0.55} />
        </mesh>
      )}
      <group rotation={[0, twist, swing]}>
        <group position={[0, -Ls, 0]}>
          <mesh geometry={twine} castShadow>
            <ClayMat color="#EBD9BC" rough={0.8} bump={0.6} />
          </mesh>
          <group rotation={[0, twist * 0.6, lag]}>
            <mesh geometry={body} castShadow receiveShadow>
              <GlossMat color={color} rough={0.45} />
            </mesh>
            {[1, -1].map((sg) => (
              <mesh key={sg} position={[0, 0, (sg * d) / 2]}>
                <torusGeometry args={[hole + 0.035, 0.035, 14, 48]} />
                <SilverMat color="#e4e7eb" rough={0.28} />
              </mesh>
            ))}
            <Txt size={0.17} color={ink} opacity={0.92} position={[0, -0.55, d / 2 + 0.012]} letterSpacing={0.12}>
              {label}
            </Txt>
            <Txt size={0.24} color={ink} position={[0, -0.98, d / 2 + 0.012]}>
              {currency}
            </Txt>
            <Txt size={fs} color={ink} position={[0, -1.4, d / 2 + 0.012]}>
              {num}
            </Txt>
            <Txt size={0.15} color={ink} opacity={0.88} position={[0, -1.82, d / 2 + 0.012]}>
              {sub}
            </Txt>
          </group>
        </group>
      </group>
    </G>
  );
};

/** damped pendulum (released at t0 from angle a0) with lag + twist — {swing, lag, twist} */
export const tagSwing = (t: number, t0 = 0, a0 = 0.5) => {
  const u = Math.max(0, t - t0);
  const sw = a0 * Math.exp(-0.55 * u) * Math.cos(2 * Math.PI * 0.72 * u);
  const lag = -wobble(u, a0 * 0.35, 1.2, 0.18) * 0.6 + sw * 0.18;
  const twist = 0.35 * Math.exp(-0.4 * u) * Math.sin(2 * Math.PI * 0.45 * u + 0.6);
  return { swing: sw, lag, twist };
};
