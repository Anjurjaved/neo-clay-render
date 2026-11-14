// devices group — shared helpers: group wrapper, metal/glass materials, merged geometry, grille texture
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { roundedRectPath } from "../../kit/Geo";

export type V3 = [number, number, number];
export type Pose = { position?: V3; rotation?: V3; scale?: number; parent?: THREE.Matrix4 };

export const G: React.FC<{ position?: V3; rotation?: V3; scale?: number | V3; children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

/** bead-blasted anodised aluminium — rough ≥0.45 so large faces never bloom (LESSONS E6) */
export const AluMat: React.FC<{ color: string; rough?: number; aniso?: number }> = ({ color, rough = 0.46, aniso = 0.35 }) => (
  <meshPhysicalMaterial color={color} metalness={0.88} roughness={rough} anisotropy={aniso} envMapIntensity={1.15} clearcoat={0.12} clearcoatRoughness={0.5} sheen={0.25} sheenColor="#ffffff" sheenRoughness={0.7} />
);
/** brushed / polished titanium or stainless frame */
export const FrameMat: React.FC<{ color: string; rough?: number }> = ({ color, rough = 0.34 }) => (
  <meshPhysicalMaterial color={color} metalness={0.92} roughness={rough} anisotropy={0.6} envMapIntensity={1.15} clearcoat={0.3} clearcoatRoughness={0.25} />
);
/** black cover glass (display off / bezel) */
export const DisplayGlass: React.FC<{ color?: string }> = ({ color = "#050607" }) => (
  <meshPhysicalMaterial color={color} roughness={0.07} metalness={0} clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={1.3} />
);
/** frosted / matte back glass */
export const BackGlass: React.FC<{ color: string; rough?: number }> = ({ color, rough = 0.42 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} metalness={0.05} clearcoat={0.6} clearcoatRoughness={0.35} envMapIntensity={1.0} />
);
/** soft-touch black (keys, rubber feet) */
export const SoftBlack: React.FC<{ color?: string; rough?: number }> = ({ color = "#16171a", rough = 0.6 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} metalness={0} sheen={0.4} sheenColor="#5a5c62" sheenRoughness={0.6} envMapIntensity={0.7} />
);
/** camera lens: dark glass with a coloured coating tint */
export const LensGlass: React.FC = () => (
  <meshPhysicalMaterial color="#0a0c12" roughness={0.03} metalness={0.2} clearcoat={1} clearcoatRoughness={0.02} iridescence={0.6} iridescenceIOR={1.6} envMapIntensity={1.8} />
);

/** flat rounded-rect (lying in local XY, facing +z) — for glass faces, insets */
export const rrFlat = (w: number, h: number, r: number, seg = 32) => new THREE.ShapeGeometry(roundedRectPath(w, h, r) as THREE.Shape, seg);

/** rounded-rect ring (outline), flat in XY */
export const rrRing = (w: number, h: number, r: number, t: number) => {
  const s = roundedRectPath(w, h, r) as THREE.Shape;
  s.holes.push(roundedRectPath(w - t * 2, h - t * 2, Math.max(0.001, r - t), new THREE.Path()));
  return new THREE.ShapeGeometry(s, 32);
};

/** many transformed copies of geometries → one mesh (keys etc.) */
export const merged = (parts: { g: THREE.BufferGeometry; m: THREE.Matrix4 }[]) => {
  const gs = parts.map(({ g, m }) => {
    const c = g.index ? g.toNonIndexed() : g.clone();
    c.applyMatrix4(m);
    return c;
  });
  const out = mergeGeometries(gs, false)!;
  out.computeVertexNormals();
  return out;
};
export const mat4 = (pos: V3, rot: V3 = [0, 0, 0], s: V3 = [1, 1, 1]) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...s));

/** perforated speaker grille alpha map (dots) */
const _grille: Record<string, THREE.CanvasTexture> = {};
export const grilleTex = (cols: number, rows: number) => {
  const key = `${cols}x${rows}`;
  if (_grille[key]) return _grille[key];
  const cell = 12;
  const c = document.createElement("canvas");
  c.width = cols * cell;
  c.height = rows * cell;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#fff";
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      g.beginPath();
      g.arc(x * cell + cell / 2 + (y % 2 ? cell / 2 : 0) * 0, y * cell + cell / 2, cell * 0.28, 0, Math.PI * 2);
      g.fill();
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8;
  _grille[key] = t;
  return t;
};

export const useGeo = <T,>(f: () => T, deps: any[] = []) => useMemo(f, deps);
