// MacBook Pro 14 (scenes_b নিজস্ব — lib/devices-macbook তৈরি হলে সেটা দিয়ে বদলানো যায়)
// bead-blasted aluminium unibody, কালো keyboard well-এ নরম key (merged), বড় trackpad, speaker grille,
// কালো hinge, পাতলা bezel display। `open` 0 (বন্ধ) → 1 (≈104° খোলা)। base-এর তলা y = 0, কেন্দ্র x/z = 0।
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { roundedRectPath, slabGeo, roundedCylGeo } from "../../kit/Geo";
import { ScreenSpec, toMatrix } from "../../kit/Screens";

export const MB = { w: 3.0, d: 2.08, t: 0.1, lidH: 2.03, lidT: 0.045, sw: 2.9, sh: 1.884, bottom: 0.096, px: 1024, py: 665 };
const ALU: Record<"silver" | "grey", string> = { silver: "#CED2D6", grey: "#7E8186" };

export const lidAngle = (open: number) => (1 - open) * (Math.PI / 2) - 0.25 * open;

const Alu: React.FC<{ color: string; rough?: number }> = ({ color, rough = 0.52 }) => (
  <meshPhysicalMaterial color={color} metalness={0.92} roughness={rough} anisotropy={0.3} envMapIntensity={1.05} clearcoat={0.12} clearcoatRoughness={0.5} />
);
const flat = (w: number, h: number, r: number) => new THREE.ShapeGeometry(roundedRectPath(w, h, r) as THREE.Shape, 24);

// key layout (u = 0.165): প্রতিটা সারি = [width-u তালিকা], fn সারি অর্ধেক উচ্চতা
const U = 0.165;
const ROWS: { h: number; keys: number[] }[] = [
  { h: 0.5, keys: Array(14).fill(14.5 / 14) },
  { h: 1, keys: [...Array(13).fill(1), 1.5] },
  { h: 1, keys: [1.5, ...Array(13).fill(1)] },
  { h: 1, keys: [1.8, ...Array(11).fill(1), 1.7] },
  { h: 1, keys: [2.3, ...Array(10).fill(1), 2.2] },
  { h: 1, keys: [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1, 1] },
];
const KB_W = 14.5 * U;
const KB_D = 5.5 * U;
const KB_Z = -MB.d / 2 + 0.13 + KB_D / 2; // keyboard কেন্দ্র

const keysGeo = () => {
  const parts: THREE.BufferGeometry[] = [];
  const base = new Map<string, THREE.BufferGeometry>();
  const key = (w: number, d: number) => {
    const k = `${w.toFixed(3)}_${d.toFixed(3)}`;
    if (!base.has(k)) {
      const g = slabGeo(w, d, 0.024, Math.min(w, d) * 0.2, 0.009, 2);
      g.rotateX(-Math.PI / 2);
      base.set(k, g);
    }
    return base.get(k)!;
  };
  let z = KB_Z - KB_D / 2;
  ROWS.forEach((row) => {
    const d = row.h * U;
    let x = -KB_W / 2;
    row.keys.forEach((wu, i) => {
      const w = wu * U;
      const last = ROWS.indexOf(row) === 5 && i >= 7; // arrow cluster: up/down অর্ধেক
      if (last && i === 8) {
        for (const dz of [-d / 4, d / 4]) {
          const g = key(w - 0.022, d / 2 - 0.016).clone();
          g.translate(x + w / 2, 0, z + d / 2 + dz);
          parts.push(g.index ? g.toNonIndexed() : g);
        }
      } else {
        const g = key(w - 0.022, (last ? d / 2 : d) - 0.022).clone();
        g.translate(x + w / 2, 0, z + d / 2 + (last ? d / 4 : 0));
        parts.push(g.index ? g.toNonIndexed() : g);
      }
      x += w;
    });
    z += d;
  });
  const m = mergeGeometries(parts, false)!;
  m.computeVertexNormals();
  return m;
};

let _grille: THREE.CanvasTexture | null = null;
const grille = () => {
  if (_grille) return _grille;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 384;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 64, 384);
  g.fillStyle = "#fff";
  for (let y = 0; y < 48; y++) for (let x = 0; x < 8; x++) {
    g.beginPath();
    g.arc(4 + x * 8 + (y % 2) * 4, 4 + y * 8, 1.7, 0, Math.PI * 2);
    g.fill();
  }
  _grille = new THREE.CanvasTexture(c);
  _grille.colorSpace = THREE.NoColorSpace;
  _grille.anisotropy = 8;
  return _grille;
};

export const MacBook: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; open: number; finish?: "silver" | "grey" }> = ({
  position,
  rotation,
  scale = 1,
  open,
  finish = "silver",
}) => {
  const col = ALU[finish];
  const base = useMemo(() => {
    const g = slabGeo(MB.w, MB.d, MB.t, 0.14, 0.032, 6);
    g.rotateX(-Math.PI / 2);
    g.translate(0, MB.t / 2, 0);
    return g;
  }, []);
  const lid = useMemo(() => {
    const g = slabGeo(MB.w, MB.lidH, MB.lidT, 0.14, 0.018, 5);
    g.translate(0, MB.lidH / 2, -MB.lidT / 2);
    return g;
  }, []);
  const glass = useMemo(() => flat(MB.w - 0.03, MB.lidH - 0.03, 0.125), []);
  const well = useMemo(() => {
    const g = flat(KB_W + 0.07, KB_D + 0.07, 0.05);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const keys = useMemo(keysGeo, []);
  const pad = useMemo(() => {
    const g = slabGeo(1.32, 0.82, 0.006, 0.05, 0.002, 2, false);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const padRing = useMemo(() => {
    const s = roundedRectPath(1.34, 0.84, 0.055) as THREE.Shape;
    s.holes.push(roundedRectPath(1.322, 0.822, 0.05, new THREE.Path()));
    const g = new THREE.ShapeGeometry(s, 24);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const spk = useMemo(() => {
    const g = flat(0.2, 0.9, 0.03);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const hinge = useMemo(() => roundedCylGeo(0.05, 2.5, 0.02, 48), []);
  const th = lidAngle(open);
  const top = MB.t + 0.001;
  return (
    <group position={position} rotation={rotation as any} scale={scale}>
      <mesh geometry={base} castShadow receiveShadow>
        <Alu color={col} />
      </mesh>
      {/* keyboard well + keys */}
      <mesh geometry={well} position={[0, top + 0.0015, KB_Z]}>
        <meshPhysicalMaterial color="#0d0e10" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh geometry={keys} position={[0, top + 0.004, 0]} castShadow>
        <meshPhysicalMaterial color="#141518" roughness={0.42} sheen={0.5} sheenColor="#62666e" sheenRoughness={0.5} clearcoat={0.15} clearcoatRoughness={0.6} />
      </mesh>
      {/* speaker grilles */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={spk} position={[s * (KB_W / 2 + 0.2), top + 0.0012, KB_Z]}>
          <meshStandardMaterial color="#2a2c30" alphaMap={grille()} transparent depthWrite={false} roughness={0.6} />
        </mesh>
      ))}
      {/* trackpad */}
      <mesh geometry={pad} position={[0, top, KB_Z + KB_D / 2 + 0.12 + 0.41]}>
        <Alu color={col} rough={0.5} />
      </mesh>
      <mesh geometry={padRing} position={[0, top + 0.007, KB_Z + KB_D / 2 + 0.12 + 0.41]}>
        <meshStandardMaterial color="#8d9096" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* hinge */}
      <mesh geometry={hinge} rotation={[0, 0, Math.PI / 2]} position={[0, MB.t + 0.012, -MB.d / 2 + 0.05]} castShadow>
        <meshPhysicalMaterial color="#1a1b1e" roughness={0.45} metalness={0.5} />
      </mesh>
      {/* lid */}
      <group position={[0, MB.t + 0.012, -MB.d / 2 + 0.05]} rotation={[th, 0, 0]}>
        <mesh geometry={lid} castShadow receiveShadow>
          <Alu color={col} />
        </mesh>
        <mesh geometry={glass} position={[0, MB.lidH / 2, 0.0015]}>
          <meshPhysicalMaterial color="#060708" roughness={0.06} clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={1.3} />
        </mesh>
      </group>
    </group>
  );
};

/** display-এর ScreenSpec (DOM 1024×665) — একই position/rotation/scale/open দিন */
export const macScreen = (
  p: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number },
  open: number,
  content: React.ReactNode,
  opts: Partial<ScreenSpec> = {}
): ScreenSpec => {
  const m = toMatrix(p.position, p.rotation, p.scale ?? 1)
    .multiply(new THREE.Matrix4().makeTranslation(0, MB.t + 0.012, -MB.d / 2 + 0.05))
    .multiply(new THREE.Matrix4().makeRotationX(lidAngle(open)))
    .multiply(new THREE.Matrix4().makeTranslation(0, MB.bottom + MB.sh / 2, 0.004));
  return { matrix: m, w: MB.sw, h: MB.sh, px: MB.px, py: MB.py, radius: 12, content, ...opts };
};
