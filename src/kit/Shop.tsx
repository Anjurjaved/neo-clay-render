// Storefront — master-এর মতো: এক টুকরার গোল-কিনারার clay frame, গভীর box, facade-এ বড় pill signboard,
// ভেতরে বসানো রুপালি rolling shutter (গোল rib), নিচে handle-bar, ভেতরে উষ্ণ কমলা ঘর।
// local origin = floor-এর উপর, box-এর কেন্দ্র; সামনে +z।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, Txt, Glow } from "./Clay";
import { frameGeo, pillGeo, slabGeo } from "./Geo";
import { C } from "./theme";

export const SHOP = { w: 2.0, h: 2.45, d: 1.75, doorW: 1.4, doorH: 1.6, sill: 0.1 };

export const Shop: React.FC<{
  label: string;
  signColor?: string;
  open: number; // 0 = shutter পুরো নামানো, 1 = পুরো ওঠানো
  light: number; // 0..1 ভেতরের কমলা আলো
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  clay?: string;
  children?: React.ReactNode; // facade-এ ঝোলানো sign ইত্যাদি (local coords)
}> = ({ label, signColor = C.navy, open, light, position, rotationY = 0, scale = 1, clay = C.clay, children }) => {
  const { w, h, d, doorW, doorH, sill } = SHOP;
  const doorBottom = sill;
  const doorTop = doorBottom + doorH;
  const doorCy = doorBottom + doorH / 2 - h / 2; // frame-local (frame কেন্দ্র h/2-এ)
  const frame = useMemo(() => frameGeo({ w, h, depth: d, r: 0.22, doorW, doorH, doorR: 0.07, doorCy, bevel: 0.075 }), []);
  const signW = Math.min(w * 0.88, Math.max(1.35, label.length * 0.135 + 0.5));
  const sign = useMemo(() => pillGeo(signW, 0.44, 0.17, 0.06), [signW]);
  const slatH = 0.118;
  const slat = useMemo(() => slabGeo(doorW - 0.03, slatH * 0.985, 0.05, slatH * 0.3, 0.02, 4), []);
  const bar = useMemo(() => slabGeo(doorW - 0.02, 0.07, 0.08, 0.03, 0.02, 3), []);
  const nSlats = Math.ceil(doorH / slatH) + 1;
  // shutter-এর নিচের কিনারা কোথায়
  const bottomY = doorBottom + doorH * Math.max(0, Math.min(1, open));
  const shutterZ = d / 2 - 0.2;
  const warm = light;
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* frame */}
      <mesh geometry={frame} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ClayMat color={clay} />
      </mesh>
      {/* back wall + interior floor */}
      <mesh position={[0, doorBottom + doorH / 2, -d / 2 + 0.09]} receiveShadow>
        <planeGeometry args={[doorW + 0.02, doorH + 0.02]} />
        <meshStandardMaterial color={warm > 0 ? "#F4A866" : "#D9D2C9"} emissive="#F2873A" emissiveIntensity={0.42 * warm} roughness={0.95} />
      </mesh>
      <mesh position={[0, doorBottom + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[doorW + 0.02, d - 0.12]} />
        <meshStandardMaterial color={warm > 0 ? "#F6B57C" : "#DDD6CD"} emissive="#F2873A" emissiveIntensity={0.3 * warm} roughness={0.95} />
      </mesh>
      {warm > 0.01 && (
        <>
          <pointLight position={[0, doorBottom + doorH * 0.75, -0.1]} intensity={4 * warm} distance={3.4} decay={2} color="#FF8A3A" />
          <pointLight position={[0, doorBottom + 0.35, -0.2]} intensity={1.0 * warm} distance={1.8} decay={2} color="#FF9E55" />
          <Glow position={[0, doorBottom + doorH * 0.45, -d / 2 + 0.3]} size={2.0} opacity={0.14 * warm} color="#FFA347" />
          {/* floor spill */}
          <mesh position={[0, 0.006, d / 2 + 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[doorW * 1.15, 0.95]} />
            <meshBasicMaterial color="#FFB46A" transparent opacity={0.22 * warm} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      )}
      {/* shutter: slats উপরে উঠলে lintel-এর ভেতরে লুকায় */}
      {open < 0.999 &&
        Array.from({ length: nSlats }).map((_, i) => {
          const yc = bottomY + 0.06 + slatH * (i + 0.5);
          if (yc - slatH / 2 > doorTop - 0.01) return null;
          return (
            <mesh key={i} geometry={slat} position={[0, yc, shutterZ]} castShadow receiveShadow>
              <meshPhysicalMaterial color="#D2D6DA" metalness={0.45} roughness={0.42} envMapIntensity={0.95} clearcoat={0.2} clearcoatRoughness={0.5} />
            </mesh>
          );
        })}
      {open < 0.999 && (
        <mesh position={[0, (bottomY + doorTop) / 2, shutterZ - 0.03]}>
          <planeGeometry args={[doorW - 0.03, Math.max(0.001, doorTop - bottomY)]} />
          <meshStandardMaterial color="#B4BAC0" roughness={0.6} />
        </mesh>
      )}
      {open < 0.999 && (
        <group position={[0, bottomY + 0.035, shutterZ + 0.01]}>
          <mesh geometry={bar} castShadow>
            <SilverMat color="#B5BBC1" rough={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.22, 0.03, 0.03]} />
            <SilverMat color="#9EA5AC" rough={0.25} />
          </mesh>
        </group>
      )}
      {/* signboard */}
      <group position={[0, doorTop + (h - doorTop) / 2 + 0.02, d / 2 + 0.05]}>
        <mesh geometry={sign} castShadow>
          <ClayMat color={signColor} rough={0.62} />
        </mesh>
        <Txt size={Math.min(0.2, (signW * 0.84) / (label.length * 0.66))} color="#ffffff" position={[0, -0.005, 0.095]} letterSpacing={0.01}>
          {label}
        </Txt>
      </group>
      {children}
    </group>
  );
};

/** দরজায় ঝোলানো cream card — পেরেক + ত্রিভুজ সুতা; angle দোলে; drop 0→1 উপর থেকে পড়ে */
export const HangSign: React.FC<{ text: string; position?: [number, number, number]; angle?: number; drop?: number; textColor?: string; tilt?: number; w?: number }> = ({
  text,
  position,
  angle = 0,
  drop = 1,
  textColor = "#3A4250",
  tilt = 0,
  w = 0.5,
}) => {
  const card = useMemo(() => slabGeo(w, w * 0.4, 0.035, 0.03, 0.012, 3), [w]);
  const hang = 0.13;
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.01]}>
        <sphereGeometry args={[0.014, 12, 8]} />
        <SilverMat color="#8d939a" />
      </mesh>
      <group rotation={[0, 0, angle + tilt]} position={[0, (1 - drop) * 0.9, 0]}>
        {/* string triangle */}
        {[-1, 1].map((s) => {
          const dx = s * w * 0.32;
          const len = Math.hypot(dx, hang);
          return (
            <mesh key={s} position={[dx / 2, -hang / 2, 0.012]} rotation={[0, 0, Math.atan2(dx, hang)]}>
              <cylinderGeometry args={[0.004, 0.004, len, 5]} />
              <meshStandardMaterial color="#6e655c" roughness={0.8} />
            </mesh>
          );
        })}
        <group position={[0, -hang - w * 0.2, 0.02]}>
          <mesh geometry={card} castShadow>
            <ClayMat color="#F3EEE7" rough={0.7} />
          </mesh>
          <Txt size={w * 0.19} color={textColor} position={[0, -0.003, 0.02]}>
            {text}
          </Txt>
        </group>
      </group>
    </group>
  );
};
