// Clay phone stand / dock — one extruded side profile with big fillets (single soft piece, no joins),
// soft rubber pad in the cradle. Units = phone units (phone width 1).
// The rest leans back STAND.lean rad; use `standPhonePose(standPose, phoneH, phoneD, slide)` to seat a phone.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat } from "../../kit/Clay";
import { C } from "../../kit/theme";
import { G, V3, rrFlat } from "./common";

export const STAND = { width: 0.86, lean: 0.4, seatZ: 0.2, seatY: 0.12 };

/** rounded polygon: each corner replaced by a quadratic fillet of radius r */
const filleted = (pts: [number, number, number][]) => {
  const s = new THREE.Shape();
  const n = pts.length;
  const P = pts.map(([x, y]) => new THREE.Vector2(x, y));
  for (let i = 0; i < n; i++) {
    const prev = P[(i - 1 + n) % n],
      cur = P[i],
      next = P[(i + 1) % n];
    const r = pts[i][2];
    const a = cur.clone().add(prev.clone().sub(cur).setLength(Math.min(r, prev.distanceTo(cur) / 2)));
    const b = cur.clone().add(next.clone().sub(cur).setLength(Math.min(r, next.distanceTo(cur) / 2)));
    if (i === 0) s.moveTo(a.x, a.y);
    else s.lineTo(a.x, a.y);
    s.quadraticCurveTo(cur.x, cur.y, b.x, b.y);
  }
  s.closePath();
  return s;
};

export const PhoneStand: React.FC<{ position?: V3; rotation?: V3; scale?: number | V3; color?: string; pad?: string }> = ({ color = C.clay, pad = C.orange, ...p }) => {
  const g = useMemo(() => {
    const { lean, seatZ, seatY } = STAND;
    const up = new THREE.Vector2(-Math.sin(lean), Math.cos(lean)); // along the rest face (z, y)
    const restTop = new THREE.Vector2(seatZ - 0.02, seatY).add(up.clone().multiplyScalar(1.22));
    // side profile (x = z forward, y up), clockwise from front-bottom
    const prof: [number, number, number][] = [
      [0.62, 0, 0.12],
      [0.62, 0.175, 0.07], // front lip top (low: never covers the screen glass — DOM draws over 3D, LESSONS B14)
      [0.48, 0.175, 0.05],
      [0.47, seatY, 0.04], // cradle floor
      [seatZ - 0.02, seatY, 0.05], // foot of the rest face
      [restTop.x, restTop.y, 0.1],
      [restTop.x - 0.2 * Math.cos(lean), restTop.y - 0.2 * Math.sin(lean), 0.1],
      [-0.62, 0.0, 0.16],
    ];
    const shape = filleted(prof);
    const b = 0.06;
    const W = STAND.width;
    const geo = new THREE.ExtrudeGeometry(shape, { depth: W - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.9, bevelSegments: 8, curveSegments: 18 });
    geo.translate(0, 0, -(W - b * 2) / 2);
    geo.rotateY(-Math.PI / 2);
    geo.computeVertexNormals();
    const padG = rrFlat(W * 0.7, 0.12, 0.05);
    return { geo, padG };
  }, []);
  return (
    <G {...(p as any)}>
      <mesh geometry={g.geo} castShadow receiveShadow>
        <ClayMat color={color} rough={0.66} />
      </mesh>
      {/* rubber pad in the cradle */}
      <mesh geometry={g.padG} rotation={[-Math.PI / 2, 0, 0]} position={[0, STAND.seatY + 0.004, (STAND.seatZ + 0.46) / 2]}>
        <ClayMat color={pad} rough={0.8} bump={0.2} />
      </mesh>
    </G>
  );
};

/** phone pose in STAND space (wrap stand + phone in one group; for the DOM screen pass that group's matrix as `parent`).
 *  slide 0 = seated, >0 = lifted along the rest (drop-in). */
export const standPhonePose = (phoneH: number, phoneD: number, slide = 0, phoneScale = 1) => {
  const { lean, seatZ, seatY } = STAND;
  const up = new THREE.Vector3(0, Math.cos(lean), -Math.sin(lean));
  const fwd = new THREE.Vector3(0, Math.sin(lean), Math.cos(lean));
  const c = new THREE.Vector3(0, seatY + 0.002, seatZ - 0.01)
    .add(up.clone().multiplyScalar((phoneH * phoneScale) / 2 + slide))
    .add(fwd.clone().multiplyScalar((phoneD * phoneScale) / 2 + 0.005));
  return { position: [c.x, c.y, c.z] as V3, rotation: [-lean, 0, 0] as V3, scale: phoneScale };
};
