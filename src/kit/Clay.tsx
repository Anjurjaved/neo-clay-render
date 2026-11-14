// matte soft-touch clay material + bevelled primitive + 3D text
import React, { useEffect, useMemo, useState } from "react";
import { RoundedBox, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { C, FONT_BOLD } from "./theme";

type MatProps = { color?: string; emissive?: string; emissiveIntensity?: number; opacity?: number; clip?: THREE.Plane[] };

// seeded micro-noise (সব tab, সব frame-এ হুবহু এক) — velvety clay surface
let _noise: THREE.CanvasTexture | null = null;
export const clayNoise = () => {
  if (_noise) return _noise;
  const size = 512;
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + rnd() * 20;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  g.filter = "blur(0.7px)";
  g.drawImage(c, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  t.colorSpace = THREE.NoColorSpace;
  _noise = t;
  return t;
};

/** soft-touch clay: high roughness + উষ্ণ sheen (velvet edge) + micro-noise bump + সামান্য warmth */
export const ClayMat: React.FC<MatProps & { rough?: number; bump?: number; sheen?: number }> = ({
  color = C.clay,
  emissive,
  emissiveIntensity,
  opacity = 1,
  rough = 0.7,
  bump = 0.45,
  sheen = 0.55,
  clip,
}) => {
  const n = clayNoise();
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={rough}
      metalness={0}
      sheen={sheen}
      sheenRoughness={0.85}
      sheenColor="#ffd9c4"
      clearcoat={0.04}
      clearcoatRoughness={0.6}
      bumpMap={n}
      bumpScale={bump}
      roughnessMap={n}
      emissive={emissive ?? "#3a1e12"}
      emissiveIntensity={emissive ? emissiveIntensity ?? 0 : 0.05}
      transparent={opacity < 1}
      opacity={opacity}
      envMapIntensity={0.85}
      clippingPlanes={clip}
    />
  );
};

/** brushed silver (anisotropic) */
export const SilverMat: React.FC<{ color?: string; rough?: number; opacity?: number; clip?: THREE.Plane[] }> = ({ color = "#d9dde2", rough = 0.3, opacity = 1, clip }) => (
  <meshPhysicalMaterial color={color} metalness={1} roughness={rough} anisotropy={0.7} envMapIntensity={1.1} transparent={opacity < 1} opacity={opacity} clippingPlanes={clip} />
);

/** glossy glass/screen black */
export const GlassMat: React.FC<{ color?: string; clip?: THREE.Plane[] }> = ({ color = "#0c0e12", clip }) => (
  <meshPhysicalMaterial color={color} roughness={0.05} metalness={0} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.6} clippingPlanes={clip} />
);

/** emissive glow material (bloom ধরে) */
export const GlowMat: React.FC<{ color?: string; intensity?: number }> = ({ color = "#ff7a2e", intensity = 4 }) => (
  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
);

/** bevelled clay box — w,h,d world unit, radius = bevel */
export const CBox: React.FC<
  { size: [number, number, number]; r?: number; color?: string; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number]; emissive?: string; emissiveIntensity?: number; opacity?: number; cast?: boolean; children?: React.ReactNode; silver?: boolean }
> = ({ size, r, color, position, rotation, scale, emissive, emissiveIntensity, opacity, cast = true, children, silver }) => (
  <RoundedBox
    args={size}
    radius={r ?? Math.min(...size) * 0.22}
    smoothness={5}
    position={position}
    rotation={rotation as any}
    scale={scale as any}
    castShadow={cast}
    receiveShadow
  >
    {silver ? <SilverMat /> : <ClayMat color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} opacity={opacity} />}
    {children}
  </RoundedBox>
);

/** rounded pill/badge: সামনে সমতল, চারপাশ গোল (capsule-ish slab) */
export const Pill: React.FC<{ w: number; h: number; d?: number; color?: string; position?: [number, number, number]; scale?: number | [number, number, number]; rotation?: [number, number, number]; emissive?: string; emissiveIntensity?: number }> = ({
  w,
  h,
  d = 0.18,
  color = C.white,
  position,
  scale,
  rotation,
  emissive,
  emissiveIntensity,
}) => <CBox size={[w, h, d]} r={Math.min(h / 2, d / 2) * 0.98} color={color} position={position} scale={scale} rotation={rotation} emissive={emissive} emissiveIntensity={emissiveIntensity} />;

/** 3D text (Latin/digit only — troika বাংলা shape করে না; বাংলা লাগলে DOM ব্যবহার করুন) */
export const Txt: React.FC<{
  children: string;
  size?: number;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "middle" | "bottom";
  bold?: boolean;
  maxWidth?: number;
  opacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
}> = ({ children, size = 0.3, color = C.text, position, rotation, anchorX = "center", anchorY = "middle", bold = true, maxWidth, opacity = 1, letterSpacing = 0, lineHeight = 1.1, textAlign = "center" }) => {
  // delayRender commit-এর পরে (suspend হলে handle leak হয় না); glyph sync হলে ছাড়ি
  const hRef = React.useRef<number | null>(null);
  const advance = useThree((st) => st.advance);
  React.useLayoutEffect(() => {
    hRef.current = delayRender("txt-sync");
    const to = setTimeout(() => release(), 6000);
    return () => {
      clearTimeout(to);
      release();
    };
  }, [children]);
  const release = () => {
    if (hRef.current !== null) {
      continueRender(hRef.current);
      hRef.current = null;
    }
  };
  return (
    <Text
      font={staticFile(bold ? FONT_BOLD : "fonts/Inter-700.ttf")}
      fontSize={size}
      color={color}
      position={position}
      rotation={rotation as any}
      anchorX={anchorX}
      anchorY={anchorY}
      maxWidth={maxWidth}
      letterSpacing={letterSpacing}
      lineHeight={lineHeight}
      textAlign={textAlign}
      fillOpacity={opacity}
      onSync={() => {
        // frameloop চলে না — glyph তৈরি হলে নিজে একবার render করি, তারপর ছাড়ি
        advance(performance.now()); // composer সহ পুরো frame আবার (শুধু gl.render নয়)
        requestAnimationFrame(() => release());
      }}
    >
      {children}
    </Text>
  );
};

/** soft glow sprite (orange bloom-এর জন্য — postprocessing ছাড়াই) */
export const Glow: React.FC<{ color?: string; size?: number; position?: [number, number, number]; opacity?: number }> = ({ color = C.orange, size = 2, position, opacity = 0.6 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.35, "rgba(255,255,255,0.45)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  );
};
