// Role outfits — প্রতিটা পোশাক নিজেও এক টুকরার SDF mesh, দেহের তলের উপর বসানো (surface projection)।
// pose-নির্ভর (doctor coat — হাতা হাতের সাথে নড়ে) প্রতি pose-এ bake; বাকিগুলো torso/head frame-এ একবার bake (cache)।
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat } from "../../kit/Clay";
import { roundedCylGeo } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { Rig, Side, TORSO } from "./rig";
import { IDB, Op, V3, basisFromQuat, basisYZ, polygonize, sdfOf, v } from "./sdf";

export type Role = "plain" | "owner" | "doctor" | "customer" | "receptionist" | "developer";

export const COAT = "#F7F5F0";
export const CAP = C.orange;
export const TIE = "#D85E24";
export const GEAR = "#2B2F36";

/** রং/পোশাক যা দেহের ভেতরে fuse হবে (এখন নেই — পোশাক আলাদা কাপড়ের মতো) */
export const outfitBodyOps = (_r: Rig, _role: Role): Op[] => [];

// ---------- torso surface (torso frame) ----------
const TSDF = sdfOf([
  { t: "cone", a: TORSO.a, b: TORSO.b, ra: TORSO.ra, rb: TORSO.rb },
  { t: "ell", c: TORSO.bc, B: IDB, r: TORSO.br, k: 0.08 },
  { t: "ell", c: [0, 0.562, 0], B: IDB, r: [0.172, 0.178, 0.168], k: 0.085, kc: [0, 0.4, 0], kr0: 0.05, kr1: 0.16, kMin: 0.01 },
]);
const grad = (f: (x: number, y: number, z: number) => number, p: V3): V3 => {
  const e = 0.002;
  return v.norm([f(p[0] + e, p[1], p[2]) - f(p[0] - e, p[1], p[2]), f(p[0], p[1] + e, p[2]) - f(p[0], p[1] - e, p[2]), f(p[0], p[1], p[2] + e) - f(p[0], p[1], p[2] - e)]);
};
/** p → torso surface + off (along normal) */
export const onTorso = (p: V3, off: number): { p: V3; n: V3 } => {
  let q = p;
  for (let i = 0; i < 8; i++) {
    const d = TSDF(...q);
    const n = grad(TSDF, q);
    q = v.sub(q, v.mul(n, d - off));
  }
  return { p: q, n: grad(TSDF, q) };
};

const CACHE = new Map<string, THREE.BufferGeometry>();
const baked = (key: string, make: () => THREE.BufferGeometry) => {
  let g = CACHE.get(key);
  if (!g) {
    g = make();
    CACHE.set(key, g);
  }
  return g;
};
const tubeGeo = (pts: V3[], r: number, seg = 120) => {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.5);
  return new THREE.TubeGeometry(curve, seg, r, 14, false);
};

// ---------- doctor coat (pose dependent) ----------
export const coatOps = (r: Rig): Op[] => {
  const T = r.T;
  const B = basisFromQuat(r.torsoQ);
  const ops: Op[] = [
    { t: "cone", a: T([0, -0.165, 0]), b: T([0, 0.04, 0]), ra: TORSO.ra + 0.024, rb: TORSO.ra + 0.016 },
    { t: "cone", a: T(TORSO.a), b: T(TORSO.b), ra: TORSO.ra + 0.016, rb: TORSO.rb + 0.017, k: 0.06 },
    { t: "ell", c: T(TORSO.bc), B, r: v.add(TORSO.br, [0.016, 0.016, 0.016]), k: 0.08 },
    // collar roll
    { t: "tor", c: T([0, 0.36, 0.0]), B: basisYZ(r.Td([0, 1, 0.35]), r.Td([0, 0, 1])), R: 0.105, r: 0.03, k: 0.03 },
  ];
  (["L", "R"] as Side[]).forEach((s) => {
    const S = r.shoulder[s],
      E = r.elbow[s],
      W = r.wrist[s];
    const fd = v.norm(v.sub(W, E));
    const cuff = v.sub(W, v.mul(fd, 0.04));
    ops.push({ t: "cone", a: S, b: E, ra: 0.08, rb: 0.072, k: 0.08, kc: S, kr0: 0.04, kr1: 0.13, kMin: 0.004 });
    ops.push({ t: "cone", a: E, b: cuff, ra: 0.072, rb: 0.064, k: 0.03, kc: E, kr0: 0.015, kr1: 0.07, kMin: 0.003 });
  });
  // open V at the chest (navy shirt shows) + hem
  // V-neck: tapered cone just in front of the coat surface (groove deeper than the coat → shirt shows)
  const vb = onTorso([0, 0.16, 0.2], 0.05).p,
    vt = onTorso([0, 0.43, 0.15], 0.075).p;
  ops.push({ t: "cone", a: T(vb), b: T(vt), ra: 0.004, rb: 0.105, op: "s", k: 0.012 });
  ops.push({ t: "box", c: T([0, -0.165 - 0.5, 0]), B, h: [0.7, 0.5, 0.7], r: 0, op: "s", k: 0.016 });
  return ops;
};

// ---------- static accessories ----------
const stethoscope = () =>
  baked("steth", () => {
    const raw: V3[] = [
      [0.07, 0.11, 0.2],
      [0.085, 0.2, 0.2],
      [0.095, 0.29, 0.17],
      [0.1, 0.36, 0.08],
      [0.07, 0.395, -0.06],
      [0, 0.405, -0.1],
      [-0.07, 0.395, -0.06],
      [-0.1, 0.36, 0.08],
      [-0.095, 0.29, 0.17],
      [-0.075, 0.2, 0.2],
      [-0.055, 0.1, 0.21],
    ];
    const pts = raw.map((p) => onTorso(p, 0.034).p);
    return tubeGeo(pts, 0.0105);
  });

const tieGeo = () =>
  baked("tie", () => {
    // one continuous bevelled tie: knot + blade outline extruded, every vertex laid onto the chest surface
    const s = new THREE.Shape();
    const top = 0.338,
      wTop = 0.017,
      wLow = 0.033,
      yLow = 0.1,
      tip = 0.058;
    s.moveTo(-wTop, top);
    s.bezierCurveTo(-wTop * 1.2, top - 0.06, -wLow, yLow + 0.06, -wLow, yLow);
    s.lineTo(0, tip);
    s.lineTo(wLow, yLow);
    s.bezierCurveTo(wLow, yLow + 0.06, wTop * 1.2, top - 0.06, wTop, top);
    s.lineTo(-wTop, top);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.0035, bevelSize: 0.004, bevelSegments: 4, curveSegments: 20 });
    // knot (soft trapezoid via scaled sphere) merged as a second geometry
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i);
      const q = onTorso([x, y, 0.22], 0.006 + z);
      pos.setXYZ(i, q.p[0], q.p[1], q.p[2]);
    }
    g.computeVertexNormals();
    return g;
  });
const knotPose = () => onTorso([0, 0.36, 0.2], 0.016);
const collarGeo = () =>
  baked("collar", () => {
    const ops: Op[] = [];
    [-1, 1].forEach((sx) => {
      const s = onTorso([sx * 0.045, 0.37, 0.18], 0.006);
      const B = basisYZ([sx * -0.55, 1, 0], s.n);
      ops.push({ t: "box", c: s.p, B, h: [0.032, 0.022, 0.001], r: 0.008, k: 0.01 });
    });
    const back = { t: "tor" as const, c: [0, 0.385, -0.01] as V3, B: basisYZ([0, 1, 0.25], [0, 0, 1]), R: 0.088, r: 0.016, k: 0.02 };
    ops.push(back);
    return polygonize(ops, 0.004);
  });

export const capGeo = () =>
  baked("cap", () => {
    const ops: Op[] = [
      { t: "ell", c: [0, 0.012, 0], B: IDB, r: [0.188, 0.19, 0.182] },
      { t: "box", c: [0, -0.5 + 0.035, 0], B: IDB, h: [0.6, 0.5, 0.6], r: 0, op: "s", k: 0.012 },
      // brim (soft, slightly drooping)
      { t: "ell", c: [0, 0.04, 0.17], B: basisYZ([0, 1, 0.32], [0, -0.32, 1]), r: [0.135, 0.016, 0.11], k: 0.03 },
      { t: "sph", c: [0, 0.2, -0.005], r: 0.018, k: 0.012 },
    ];
    return polygonize(ops, 0.005);
  });

const headsetGeo = () =>
  baked("headset", () => {
    const ops: Op[] = [
      { t: "tor", c: [0, 0.0, 0.0], B: [[1, 0, 0], [0, 0, -1], [0, 1, 0]], R: 0.19, r: 0.012 },
      { t: "box", c: [0, -0.5 - 0.01, 0], B: IDB, h: [0.6, 0.5, 0.6], r: 0, op: "s", k: 0.006 },
    ];
    [-1, 1].forEach((sx) => ops.push({ t: "ell", c: [sx * 0.178, -0.015, 0.0], B: IDB, r: [0.03, 0.052, 0.048], k: 0.02 }));
    // mic boom (left / +x cup) → toward the mouth
    ops.push({ t: "cone", a: [0.18, -0.05, 0.03], b: [0.1, -0.11, 0.15], ra: 0.008, rb: 0.007, k: 0.01 });
    ops.push({ t: "sph", c: [0.085, -0.115, 0.16], r: 0.017, k: 0.01 });
    return polygonize(ops, 0.004);
  });

const lanyardGeo = () =>
  baked("lanyard", () => {
    const raw: V3[] = [
      [0.035, 0.14, 0.21],
      [0.06, 0.25, 0.2],
      [0.085, 0.34, 0.12],
      [0.07, 0.39, -0.04],
      [0, 0.4, -0.09],
      [-0.07, 0.39, -0.04],
      [-0.085, 0.34, 0.12],
      [-0.06, 0.25, 0.2],
      [-0.035, 0.14, 0.21],
    ];
    return tubeGeo(raw.map((p) => onTorso(p, 0.009).p), 0.006);
  });
const cardPose = () => onTorso([0, 0.085, 0.23], 0.016);

const headphonesGeo = () =>
  baked("phones", () => {
    const ops: Op[] = [{ t: "tor", c: [0, 0.37, 0.0], B: basisYZ([0, 1, 0.55], [0, 0, 1]), R: 0.118, r: 0.014 }];
    [-1, 1].forEach((sx) => ops.push({ t: "ell", c: [sx * 0.112, 0.322, 0.1], B: basisYZ([0, 1, 0.5], [sx * 0.3, 0, 1]), r: [0.05, 0.056, 0.03], k: 0.02 }));
    return polygonize(ops, 0.004);
  });

const PoseCoat: React.FC<{ rig: Rig; cell: number; pkey: string }> = ({ rig, cell, pkey }) => {
  const g = useMemo(() => polygonize(coatOps(rig), cell), [pkey]);
  useEffect(() => () => g.dispose(), [g]);
  const buttons = [0.02, -0.08].map((y) => onTorso([0, y, 0.25], 0.03));
  return (
    <>
      <mesh geometry={g} castShadow receiveShadow>
        <ClayMat color={COAT} rough={0.66} bump={0.2} sheen={0.35} />
      </mesh>
      <group matrix={rig.torsoM} matrixAutoUpdate={false}>
        {buttons.map((b, i) => (
          <mesh key={i} position={b.p} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...b.n))}>
            <primitive object={buttonGeo()} attach="geometry" />
            <meshPhysicalMaterial color="#d9d4cc" roughness={0.3} clearcoat={0.6} />
          </mesh>
        ))}
      </group>
    </>
  );
};
let _btn: THREE.BufferGeometry | null = null;
const buttonGeo = () => (_btn ??= roundedCylGeo(0.016, 0.008, 0.004, 32));
let _chest: THREE.BufferGeometry | null = null;
const chestGeo = () => (_chest ??= roundedCylGeo(0.03, 0.016, 0.007, 48));

const Steth: React.FC = () => {
  const end = onTorso([-0.055, 0.1, 0.21], 0.034);
  const cp = onTorso([-0.05, 0.035, 0.22], 0.03);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...cp.n));
  const ear = onTorso([0.07, 0.11, 0.2], 0.036);
  const drop = tubeGeoCached("steth-drop", [end.p, v.lerp(end.p, cp.p, 0.5), cp.p], 0.0095);
  return (
    <>
      <mesh geometry={stethoscope()} castShadow>
        <meshPhysicalMaterial color="#2a2e36" roughness={0.38} clearcoat={0.5} clearcoatRoughness={0.3} />
      </mesh>
      <mesh geometry={drop} castShadow>
        <meshPhysicalMaterial color="#2a2e36" roughness={0.38} clearcoat={0.5} clearcoatRoughness={0.3} />
      </mesh>
      <mesh geometry={chestGeo()} position={cp.p} quaternion={q} castShadow>
        <SilverMat color="#e6eaee" rough={0.42} />
      </mesh>
      <mesh position={ear.p} castShadow>
        <sphereGeometry args={[0.016, 24, 16]} />
        <SilverMat color="#e6eaee" rough={0.42} />
      </mesh>
    </>
  );
};
const tubeGeoCached = (key: string, pts: V3[], r: number) => baked(key, () => tubeGeo(pts, r, 24));

export const Outfit: React.FC<{ rig: Rig; role: Role; cell: number; pkey: string }> = ({ rig, role, cell, pkey }) => {
  if (role === "plain") return null;
  const torso = (children: React.ReactNode) => (
    <group matrix={rig.torsoM} matrixAutoUpdate={false}>
      {children}
    </group>
  );
  const head = (children: React.ReactNode) => (
    <group matrix={rig.headM} matrixAutoUpdate={false}>
      {children}
    </group>
  );
  if (role === "doctor")
    return (
      <>
        <PoseCoat rig={rig} cell={cell * 1.05} pkey={pkey} />
        {torso(<Steth />)}
      </>
    );
  if (role === "owner")
    return torso(
      <>
        <mesh geometry={collarGeo()} castShadow>
          <ClayMat color={COAT} rough={0.6} bump={0.15} />
        </mesh>
        <mesh geometry={tieGeo()} castShadow>
          <meshPhysicalMaterial color={TIE} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} sheen={0.4} sheenColor="#ffc9a0" />
        </mesh>
        <mesh position={knotPose().p} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...knotPose().n))} scale={[0.024, 0.021, 0.014]} castShadow>
          <sphereGeometry args={[1, 32, 20]} />
          <meshPhysicalMaterial color={TIE} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} sheen={0.4} sheenColor="#ffc9a0" />
        </mesh>
      </>
    );
  if (role === "customer")
    return head(
      <mesh geometry={capGeo()} castShadow>
        <ClayMat color={CAP} rough={0.55} bump={0.2} sheen={0.4} />
      </mesh>
    );
  if (role === "receptionist") {
    const c = cardPose();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...c.n));
    return (
      <>
        {head(
          <mesh geometry={headsetGeo()} castShadow>
            <meshPhysicalMaterial color={GEAR} roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.35} />
          </mesh>
        )}
        {torso(
          <>
            <mesh geometry={lanyardGeo()} castShadow>
              <ClayMat color={C.orange} rough={0.5} bump={0.1} />
            </mesh>
            <group position={c.p} quaternion={q}>
              <IdCard />
            </group>
          </>
        )}
      </>
    );
  }
  if (role === "developer")
    return torso(
      <mesh geometry={headphonesGeo()} castShadow>
        <meshPhysicalMaterial color={GEAR} roughness={0.4} clearcoat={0.45} clearcoatRoughness={0.3} />
      </mesh>
    );
  return null;
};

let _card: THREE.BufferGeometry | null = null;
let _band: THREE.BufferGeometry | null = null;
const IdCard: React.FC = () => {
  const card = useMemo(() => (_card ??= polygonize([{ t: "box", c: [0, 0, 0], B: IDB, h: [0.036, 0.05, 0.001], r: 0.006 }], 0.0025)), []);
  const band = useMemo(() => (_band ??= polygonize([{ t: "box", c: [0, 0, 0], B: IDB, h: [0.034, 0.012, 0.001], r: 0.004 }], 0.002)), []);
  return (
    <>
      <mesh geometry={card} castShadow>
        <ClayMat color="#FCFBF8" rough={0.5} bump={0.05} />
      </mesh>
      <mesh geometry={band} position={[0, 0.034, 0.0045]}>
        <ClayMat color={C.navy} rough={0.5} bump={0.05} />
      </mesh>
      <mesh position={[0, -0.006, 0.006]}>
        <sphereGeometry args={[0.013, 24, 16]} />
        <ClayMat color={C.orange} rough={0.5} bump={0.05} />
      </mesh>
    </>
  );
};
