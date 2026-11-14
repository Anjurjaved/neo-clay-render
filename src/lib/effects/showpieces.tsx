// showcase-এর জন্য সরল কিন্তু polished বস্তু (effect দেখানোর বিষয়) — scene-এ যেকোনো বস্তু দিয়ে বদলানো যায়
import React, { useMemo } from "react";
import { ClayMat, Txt } from "../../kit/Clay";
import { roundedCylGeo, slabGeo } from "../../kit/Geo";
import { CheckBadge, SoftPanel } from "../../kit/Soft";
import { C } from "../../kit/theme";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
export const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

/** নরম clay pedestal — base y = 0, উপরের তল y = h */
export const Pedestal: React.FC<P & { r?: number; h?: number; color?: string }> = ({ r = 1.25, h = 0.42, color = "#F3ECE3", ...p }) => {
  const g = useMemo(() => roundedCylGeo(r, h, Math.min(0.16, h * 0.4)), [r, h]);
  const lip = useMemo(() => roundedCylGeo(r * 0.86, 0.08, 0.035), [r]);
  return (
    <G {...p}>
      <mesh geometry={g} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ClayMat color={color} />
      </mesh>
      <mesh geometry={lip} position={[0, h + 0.035, 0]} castShadow receiveShadow>
        <ClayMat color="#F8F3EC" />
      </mesh>
    </G>
  );
};

/** চকচকে clay বল (clearcoat) — r ব্যাসার্ধ, কেন্দ্র 0 */
export const GlossBall: React.FC<P & { r?: number; color?: string }> = ({ r = 0.6, color = C.orange, ...p }) => (
  <G {...p}>
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[r, 96, 64]} />
      <meshPhysicalMaterial color={color} roughness={0.36} clearcoat={0.8} clearcoatRoughness={0.18} sheen={0.35} sheenColor="#ffe2c4" />
    </mesh>
  </G>
);

/** pedestal-এর উপর দাঁড়ানো বড় check badge (ক্যামেরার দিকে মুখ) — মোট উচ্চতা ≈ 0.5 + 1.1·s */
export const BadgeOnPedestal: React.FC<P & { badge?: number; tick?: number; color?: string }> = ({ badge = 1, tick = 1, color, ...p }) => (
  <G {...p}>
    <Pedestal />
    <group position={[0, 0.5 + 0.86 * badge, 0]} scale={1.7 * badge}>
      <CheckBadge tick={tick} color={color} />
    </group>
  </G>
);

/** পুরু নরম card + লেখা (sweep/camera দেখানোর জন্য) */
export const LabelCard: React.FC<P & { w?: number; h?: number; title?: string; sub?: string; accent?: string }> = ({ w = 3, h = 1.9, title = "PREMIUM", sub = "WEBSITE", accent = C.orange, ...p }) => {
  const bar = useMemo(() => slabGeo(w * 0.36, 0.13, 0.06, 0.065, 0.026, 4, false), [w]);
  return (
    <G {...p}>
      <SoftPanel w={w} h={h} color="#F5EFE7">
        <Txt size={h * 0.2} color={C.deepNavy} position={[0, h * 0.13, 0.03]}>
          {title}
        </Txt>
        <Txt size={h * 0.095} color={C.steel} position={[0, -h * 0.08, 0.03]} letterSpacing={0.12}>
          {sub}
        </Txt>
        <mesh geometry={bar} position={[0, -h * 0.28, 0]} castShadow>
          <ClayMat color={accent} rough={0.5} />
        </mesh>
      </SoftPanel>
    </G>
  );
};
