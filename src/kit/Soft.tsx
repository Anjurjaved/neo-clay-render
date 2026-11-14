// Soft neumorphic primitives — master-এর মতো পুরু বালিশ-আকৃতি। সব card/tile/chip/badge এখান থেকে।
// নিয়ম (LESSONS E1): দৃশ্যমান কোনো অংশে boxGeometry/planeGeometry নয়; সব bevelled।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "./Clay";
import { slabGeo, latheGeo, shapeGeo } from "./Geo";
import { C } from "./theme";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

/** পুরুত্ব, কোণ ও bevel — উচ্চতা থেকে আনুপাতিক (বালিশের মতো নরম) */
export const softDims = (w: number, h: number, thick?: number) => {
  const m = Math.min(w, h);
  const d = thick ?? Math.max(0.07, Math.min(0.32, 0.2 * m));
  const r = Math.min(m / 2, 0.24 * m);
  const bevel = Math.min(d * 0.42, r * 0.85);
  return { d, r, bevel };
};

/** পুরু নরম panel/card — children সামনের তলে (z = d/2) বসানো হয় */
export const SoftPanel: React.FC<P & { w: number; h: number; thick?: number; color?: string; rough?: number; children?: React.ReactNode; radius?: number }> = ({
  w,
  h,
  thick,
  color = "#F4EEE6",
  rough = 0.68,
  radius,
  children,
  ...p
}) => {
  const { d, r, bevel } = softDims(w, h, thick);
  const g = useMemo(() => slabGeo(w, h, d, radius ?? r, bevel, 8), [w, h, d, r, bevel, radius]);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <ClayMat color={color} rough={rough} />
      </mesh>
      <group position={[0, 0, d / 2]}>{children}</group>
    </G>
  );
};

/** উঁচু নরম bar/block (card-এর ভেতরের লাইন, ছবি-জায়গা ইত্যাদি) — box-এর বদলে */
export const RaisedBar: React.FC<P & { w: number; h: number; d?: number; color?: string; rough?: number; radius?: number }> = ({ w, h, d, color = "#DCE3EA", rough = 0.6, radius, ...p }) => {
  const dd = d ?? Math.min(0.05, Math.min(w, h) * 0.35);
  const g = useMemo(() => slabGeo(w, h, dd, radius ?? Math.min(w, h) * 0.5, dd * 0.45, 4, false), [w, h, dd, radius]);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <ClayMat color={color} rough={rough} bump={0.15} />
      </mesh>
    </G>
  );
};

/** নরম চৌকো key/chip (WEBSITE / APP …) — active হলে কমলা */
export const Chip: React.FC<P & { label: string; w?: number; h?: number; active?: number; size?: number; icon?: React.ReactNode }> = ({ label, w = 1.2, h = 0.9, active = 0, size, icon, ...p }) => {
  const col = new THREE.Color("#F3EDE5").lerp(new THREE.Color(C.orange), active);
  const ink = new THREE.Color(C.deepNavy).lerp(new THREE.Color("#ffffff"), active);
  const fs = size ?? Math.min(h * 0.3, (w * 0.8) / Math.max(2, label.length * 0.62));
  return (
    <SoftPanel w={w} h={h} thick={h * 0.36} color={"#" + col.getHexString()} {...p}>
      {icon && <group position={[0, h * 0.14, 0.01]}>{icon}</group>}
      <Txt size={fs} color={"#" + ink.getHexString()} position={[0, icon ? -h * 0.2 : -fs * 0.03, 0.012]}>
        {label}
      </Txt>
    </SoftPanel>
  );
};

/** গম্বুজ-আকৃতির চকচকে বোতাম + সাদা tick (check badge) — ব্যাস 1 */
export const CheckBadge: React.FC<P & { color?: string; tick?: number }> = ({ color = C.orange, tick = 1, ...p }) => {
  const dome = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.38, 0.0],
          [0.47, 0.04],
          [0.5, 0.12],
          [0.48, 0.21],
          [0.4, 0.27],
          [0.22, 0.3],
          [0.0, 0.305],
        ],
        64
      ),
    []
  );
  const tk = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.2, 0.0);
    s.lineTo(-0.07, -0.13);
    s.lineTo(0.21, 0.15);
    s.lineTo(0.16, 0.2);
    s.lineTo(-0.07, -0.03);
    s.lineTo(-0.15, -0.05);
    s.closePath();
    return shapeGeo(s, 0.03, 0.018, 3);
  }, []);
  return (
    <G {...p}>
      <mesh geometry={dome} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.25} sheen={0.3} sheenColor="#ffe2c4" />
      </mesh>
      {tick > 0 && (
        <mesh geometry={tk} position={[0, 0, 0.29]} scale={[tick, tick, 1]}>
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
      )}
    </G>
  );
};

/** card-এর উপর হালকা খোদাই (debossed) জায়গা — screen/ছবির ফ্রেম */
export const Inset: React.FC<P & { w: number; h: number; color?: string }> = ({ w, h, color = "#E8E1D7", ...p }) => {
  const g = useMemo(() => slabGeo(w, h, 0.02, Math.min(w, h) * 0.18, 0.009, 3, false), [w, h]);
  return (
    <G {...p}>
      <mesh geometry={g} position={[0, 0, -0.012]} receiveShadow>
        <ClayMat color={color} rough={0.75} bump={0.1} />
      </mesh>
    </G>
  );
};
