// হাতে ধরা বস্তু ও আসবাব — সব bevelled/lathe, ClayMat/Silver। `Held` = hand anchor-এর ভেতরে বস্তুটা ঠিক জায়গায় বসায়
// (anchor frame: origin palm-এর তলে, Y = আঙুলের দিক, Z = palm normal, X = Y×Z = ডান হাতে বুড়ো আঙুলের দিক)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat } from "../../kit/Clay";
import { Phone, Tablet, PHONE, TABLET } from "../../kit/Device";
import { latheGeo, roundedCylGeo, slabGeo, roundedRectPath } from "../../kit/Geo";
import { ScreenSpec, toMatrix } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { Side } from "./rig";
import { HoldKind } from "./poses";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number };

// ---------- coffee cup ----------
export const CoffeeCup: React.FC<P & { sleeve?: string }> = ({ sleeve = "#C98A52", ...p }) => {
  const body = useMemo(() => latheGeo([[0.0001, 0], [0.03, 0.0], [0.033, 0.004], [0.036, 0.04], [0.04, 0.09], [0.043, 0.122], [0.0001, 0.122]], 64), []);
  const band = useMemo(() => latheGeo([[0.0365, 0.042], [0.0395, 0.044], [0.0418, 0.06], [0.0428, 0.083], [0.0412, 0.088], [0.039, 0.088]], 64), []);
  const lid = useMemo(() => latheGeo([[0.0001, 0.142], [0.022, 0.142], [0.034, 0.137], [0.041, 0.131], [0.047, 0.126], [0.048, 0.121], [0.046, 0.117], [0.0001, 0.117]], 64), []);
  return (
    <group {...p}>
      <mesh geometry={body} castShadow receiveShadow>
        <ClayMat color="#FBF8F2" rough={0.5} bump={0.08} />
      </mesh>
      <mesh geometry={band} castShadow>
        <ClayMat color={sleeve} rough={0.75} bump={0.4} />
      </mesh>
      <mesh geometry={lid} castShadow>
        <meshPhysicalMaterial color="#F4F1EA" roughness={0.32} clearcoat={0.5} />
      </mesh>
    </group>
  );
};

// ---------- clipboard ----------
export const Clipboard: React.FC<P> = (p) => {
  const board = useMemo(() => slabGeo(0.2, 0.27, 0.012, 0.016, 0.005, 4), []);
  const paper = useMemo(() => slabGeo(0.172, 0.21, 0.003, 0.006, 0.0012, 2), []);
  const clip = useMemo(() => slabGeo(0.08, 0.032, 0.012, 0.01, 0.004, 3), []);
  const lines = [0.05, 0.025, 0.0, -0.025, -0.05, -0.075];
  return (
    <group {...p}>
      <mesh geometry={board} castShadow receiveShadow>
        <ClayMat color="#C79A6A" rough={0.6} bump={0.3} />
      </mesh>
      <mesh geometry={paper} position={[0, -0.02, 0.0085]} castShadow>
        <ClayMat color="#FFFFFF" rough={0.7} bump={0.06} />
      </mesh>
      {lines.map((y, i) => (
        <mesh key={i} position={[i % 3 === 0 ? -0.012 : 0, y - 0.01, 0.0106]}>
          <primitive object={lineGeo(i % 3 === 0 ? 0.11 : 0.135)} attach="geometry" />
          <meshStandardMaterial color={i === 0 ? C.navy : "#b9c2cc"} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[-0.05, -0.075, 0.0108]}>
        <primitive object={tickGeo()} attach="geometry" />
        <meshStandardMaterial color={C.green} roughness={0.6} />
      </mesh>
      <mesh geometry={clip} position={[0, 0.123, 0.012]} castShadow>
        <SilverMat rough={0.32} />
      </mesh>
    </group>
  );
};
const _lines = new Map<number, THREE.BufferGeometry>();
const lineGeo = (w: number) => {
  let g = _lines.get(w);
  if (!g) {
    g = slabGeo(w, 0.007, 0.0015, 0.0035, 0.0006, 1);
    _lines.set(w, g);
  }
  return g;
};
let _tick: THREE.BufferGeometry | null = null;
const tickGeo = () => (_tick ??= roundedCylGeo(0.009, 0.002, 0.0008, 24).rotateX(Math.PI / 2));

// ---------- shopping bag ----------
export const ShoppingBag: React.FC<P & { color?: string }> = ({ color = C.orange, ...p }) => {
  const body = useMemo(() => slabGeo(0.2, 0.2, 0.085, 0.016, 0.01, 4), []);
  const fold = useMemo(() => slabGeo(0.202, 0.025, 0.087, 0.006, 0.006, 3), []);
  const handle = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.045, 0, 0), new THREE.Vector3(-0.04, 0.06, 0), new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0.04, 0.06, 0), new THREE.Vector3(0.045, 0, 0)]);
    return new THREE.TubeGeometry(c, 40, 0.006, 10, false);
  }, []);
  return (
    <group {...p}>
      <mesh geometry={body} position={[0, -0.1, 0]} castShadow receiveShadow>
        <ClayMat color={color} rough={0.66} bump={0.35} />
      </mesh>
      <mesh geometry={fold} position={[0, -0.0125, 0]} castShadow>
        <ClayMat color="#FFF4E6" rough={0.7} bump={0.25} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={handle} position={[0, 0, s * 0.02]} castShadow>
          <ClayMat color="#FFF4E6" rough={0.6} bump={0.1} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- held phone ----------
export const HELD_PHONE_SCALE = 0.12;

/** anchor-local transform per held kind */
export const holdXf = (kind: HoldKind, side: Side): { position: [number, number, number]; rotation: [number, number, number] } => {
  const rz = side === "R" ? -Math.PI / 2 : Math.PI / 2;
  switch (kind) {
    case "phone":
      return { position: [0, 0.0, (PHONE.d * HELD_PHONE_SCALE) / 2 + 0.001], rotation: [0, 0, rz] };
    case "clipboard":
      return { position: [0, 0.075, 0.008], rotation: [0, 0, rz] };
    case "tablet":
      return { position: [0, 0.11, (TABLET.d * 0.12) / 2 + 0.002], rotation: [0, 0, rz] };
    case "cup":
      return { position: [0, 0.012, 0.044], rotation: [0, 0, side === "R" ? -Math.PI / 2 : Math.PI / 2] };
    case "bag":
      return { position: [0, 0.04, -0.03], rotation: [0, 0, 0] };
  }
};

/** বস্তু + হাতের anchor-এর সাথে সঠিক বসানো */
export const Held: React.FC<{ kind: HoldKind; side: Side; children?: React.ReactNode; bagSwing?: number }> = ({ kind, side, children, bagSwing = 0 }) => {
  const xf = holdXf(kind, side);
  if (kind === "bag") {
    // bag: y → −Y (নিচে), সামনের মুখ world-সামনে; anchor-এর Z = palm (ভেতরের দিকে)
    const m = new THREE.Matrix4();
    const X = new THREE.Vector3(1, 0, 0),
      Y = new THREE.Vector3(0, 1, 0),
      Z = new THREE.Vector3(0, 0, 1);
    if (side === "R") m.makeBasis(Z.clone(), Y.clone().negate(), X.clone());
    else m.makeBasis(Z.clone().negate(), Y.clone().negate(), X.clone().negate());
    const q = new THREE.Quaternion().setFromRotationMatrix(m);
    return (
      <group position={[0, 0.03, -0.022]} quaternion={q}>
        <group rotation={[bagSwing, 0, 0]}>{children ?? <ShoppingBag position={[0, -0.03, 0]} />}</group>
      </group>
    );
  }
  return (
    <group position={xf.position} rotation={xf.rotation}>
      {children ??
        (kind === "phone" ? (
          <Phone scale={HELD_PHONE_SCALE} kind="iphone" />
        ) : kind === "tablet" ? (
          <Tablet scale={0.12} rotation={[0, 0, Math.PI / 2]} />
        ) : kind === "clipboard" ? (
          <Clipboard />
        ) : (
          <CoffeeCup position={[0, -0.07, 0]} />
        ))}
    </group>
  );
};

// ---------- furniture ----------
export const Stool: React.FC<P & { seat?: number; color?: string }> = ({ seat = 0.165, color = C.orange, ...p }) => {
  const cushion = useMemo(() => roundedCylGeo(0.16, 0.06, 0.028, 64), []);
  const stem = useMemo(() => latheGeo([[0.0001, 0], [0.11, 0.0], [0.12, 0.01], [0.105, 0.02], [0.04, 0.034], [0.03, 0.06], [0.03, seat - 0.05], [0.0001, seat - 0.05]], 48), [seat]);
  return (
    <group {...p}>
      <mesh geometry={stem} scale={[1, 1, 1]} castShadow receiveShadow>
        <ClayMat color={C.clay} rough={0.6} />
      </mesh>
      <mesh position={[0, seat - 0.03, 0]} geometry={cushion} castShadow receiveShadow>
        <ClayMat color={color} rough={0.6} bump={0.3} />
      </mesh>
    </group>
  );
};
export const Desk: React.FC<P & { w?: number; d?: number; h?: number; color?: string }> = ({ w = 0.8, d = 0.46, h = 0.38, color = C.white, ...p }) => {
  const top = useMemo(() => slabGeo(w, 0.045, d, 0.06, 0.018, 5), [w, d]);
  const leg = useMemo(() => latheGeo([[0.0001, 0], [0.026, 0], [0.03, 0.012], [0.022, 0.06], [0.019, h - 0.03], [0.024, h - 0.022], [0.0001, h - 0.022]], 32), [h]);
  return (
    <group {...p}>
      <mesh geometry={top} position={[0, h - 0.0225, 0]} castShadow receiveShadow>
        <ClayMat color={color} rough={0.6} />
      </mesh>
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} geometry={leg} position={[sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06)]} castShadow>
          <ClayMat color={C.clayShade} rough={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- laptop (character-scale MacBook-like) ----------
export const LAPTOP = { w: 0.44, d: 0.3, base: 0.016, lid: 0.008 };
const LID_MAX = 1.92;
const lidMatrix = (open: number) =>
  new THREE.Matrix4()
    .makeTranslation(0, LAPTOP.base, -LAPTOP.d / 2)
    .multiply(new THREE.Matrix4().makeRotationX(-open * LID_MAX))
    .multiply(new THREE.Matrix4().makeTranslation(0, 0, LAPTOP.d / 2));
export const laptopScreen = (p: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; parent?: THREE.Matrix4 }, open: number, content: React.ReactNode): ScreenSpec => {
  const m = toMatrix(p.position, p.rotation, p.scale ?? 1, p.parent)
    .multiply(lidMatrix(open))
    .multiply(new THREE.Matrix4().makeTranslation(0, -0.0016, 0.004))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  const sw = LAPTOP.w - 0.03,
    sh = LAPTOP.d - 0.036;
  return { matrix: m, w: sw, h: sh, px: 1024, py: Math.round((1024 * sh) / sw), radius: 8, content, bg: "#0f1218", glare: false };
};
export const Laptop: React.FC<P & { open?: number }> = ({ open = 1, ...p }) => {
  const { w, d, base, lid } = LAPTOP;
  const baseG = useMemo(() => slabGeo(w, d, base, 0.022, 0.006, 4).rotateX(-Math.PI / 2), []);
  const lidG = useMemo(() => slabGeo(w, d, lid, 0.022, 0.0035, 3).rotateX(-Math.PI / 2), []);
  const glass = useMemo(() => new THREE.ShapeGeometry(roundedRectPath(w - 0.01, d - 0.01, 0.018) as THREE.Shape, 24).rotateX(Math.PI / 2), []);
  const well = useMemo(() => slabGeo(w * 0.88, d * 0.42, 0.003, 0.012, 0.001, 2).rotateX(-Math.PI / 2), []);
  const pad = useMemo(() => slabGeo(w * 0.36, d * 0.26, 0.002, 0.012, 0.0008, 2).rotateX(-Math.PI / 2), []);
  const keyMesh = useMemo(() => {
    const key = slabGeo(0.022, 0.02, 0.004, 0.004, 0.0014, 2).rotateX(-Math.PI / 2);
    const m = new THREE.InstancedMesh(key, new THREE.MeshPhysicalMaterial({ color: "#1d2026", roughness: 0.5 }), 70);
    const o = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 14; c++) {
        o.position.set(-0.1705 + c * 0.0262, base + 0.0022, -d * 0.12 - 0.047 + r * 0.0235);
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    m.castShadow = false;
    return m;
  }, []);
  const lm = useMemo(() => lidMatrix(open), [open]);
  return (
    <group {...p}>
      <mesh geometry={baseG} position={[0, base / 2, 0]} castShadow receiveShadow>
        <SilverMat color="#cfd4da" rough={0.5} />
      </mesh>
      <mesh geometry={well} position={[0, base + 0.0002, -d * 0.12]}>
        <meshPhysicalMaterial color="#121419" roughness={0.6} />
      </mesh>
      <primitive object={keyMesh} />
      <mesh geometry={pad} position={[0, base + 0.0004, d * 0.26]}>
        <SilverMat color="#c4c9cf" rough={0.35} />
      </mesh>
      <group matrix={lm} matrixAutoUpdate={false}>
        <mesh geometry={lidG} position={[0, lid / 2 + 0.0008, 0]} castShadow>
          <SilverMat color="#cfd4da" rough={0.5} />
        </mesh>
        <mesh geometry={glass} position={[0, -0.0006, 0]}>
          <meshPhysicalMaterial color="#07080a" roughness={0.08} clearcoat={1} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- reception counter ----------
export const Counter: React.FC<P & { w?: number; h?: number; d?: number }> = ({ w = 1.25, h = 0.52, d = 0.36, ...p }) => {
  const body = useMemo(() => slabGeo(w, h, d, 0.08, 0.04, 6), [w, h, d]);
  const top = useMemo(() => slabGeo(w + 0.06, 0.04, d + 0.08, 0.04, 0.016, 4), [w, d]);
  const stripe = useMemo(() => slabGeo(w * 0.96, 0.05, 0.02, 0.025, 0.009, 3), [w]);
  return (
    <group {...p}>
      <mesh geometry={body} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ClayMat color={C.white} rough={0.62} />
      </mesh>
      <mesh geometry={stripe} position={[0, h * 0.72, d / 2 + 0.004]} castShadow>
        <ClayMat color={C.orange} rough={0.5} />
      </mesh>
      <mesh geometry={top} position={[0, h + 0.02, 0.02]} castShadow receiveShadow>
        <ClayMat color={C.clay} rough={0.55} />
      </mesh>
    </group>
  );
};
export const Keyboard: React.FC<P> = (p) => {
  const g = useMemo(() => slabGeo(0.28, 0.1, 0.014, 0.018, 0.005, 3).rotateX(-Math.PI / 2), []);
  const key = useMemo(() => slabGeo(0.016, 0.016, 0.006, 0.004, 0.0018, 2).rotateX(-Math.PI / 2), []);
  const keys = useMemo(() => {
    const m = new THREE.InstancedMesh(key, new THREE.MeshPhysicalMaterial({ color: "#f3f1ec", roughness: 0.45, clearcoat: 0.3 }), 45);
    const o = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 15; c++) {
        o.position.set(-0.126 + c * 0.018, 0.009, -0.027 + r * 0.025);
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    return m;
  }, []);
  return (
    <group {...p}>
      <mesh geometry={g} position={[0, 0.007, 0]} castShadow receiveShadow>
        <SilverMat color="#d7dbe0" rough={0.45} />
      </mesh>
      <primitive object={keys} />
    </group>
  );
};
export const Monitor: React.FC<P> = (p) => {
  const shell = useMemo(() => slabGeo(0.36, 0.24, 0.018, 0.02, 0.006, 4), []);
  const glass = useMemo(() => new THREE.ShapeGeometry(roundedRectPath(0.34, 0.22, 0.012) as THREE.Shape, 16), []);
  const neck = useMemo(() => slabGeo(0.05, 0.16, 0.014, 0.007, 0.004, 3), []);
  const foot = useMemo(() => roundedCylGeo(0.07, 0.012, 0.005, 48), []);
  return (
    <group {...p}>
      <mesh geometry={foot} position={[0, 0.006, 0]} castShadow>
        <SilverMat color="#cfd4da" rough={0.4} />
      </mesh>
      <mesh geometry={neck} position={[0, 0.09, -0.02]} rotation={[-0.12, 0, 0]} castShadow>
        <SilverMat color="#cfd4da" rough={0.4} />
      </mesh>
      <group position={[0, 0.25, 0]} rotation={[-0.06, 0, 0]}>
        <mesh geometry={shell} castShadow>
          <SilverMat color="#cfd4da" rough={0.45} />
        </mesh>
        <mesh geometry={glass} position={[0, 0, 0.0095]}>
          <meshPhysicalMaterial color="#07080a" roughness={0.08} clearcoat={1} />
        </mesh>
      </group>
    </group>
  );
};
export const Bell: React.FC<P> = (p) => {
  const dome = useMemo(() => latheGeo([[0.0001, 0.06], [0.012, 0.058], [0.03, 0.045], [0.04, 0.02], [0.043, 0.008], [0.0001, 0.008]], 48), []);
  const base = useMemo(() => roundedCylGeo(0.05, 0.012, 0.005, 48), []);
  return (
    <group {...p}>
      <mesh geometry={base} position={[0, 0.006, 0]} castShadow>
        <ClayMat color={C.navy} rough={0.5} />
      </mesh>
      <mesh geometry={dome} castShadow>
        <meshPhysicalMaterial color="#e8c37a" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.066, 0]} castShadow>
        <sphereGeometry args={[0.008, 16, 12]} />
        <meshPhysicalMaterial color="#e8c37a" metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
};
