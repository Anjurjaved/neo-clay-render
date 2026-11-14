// dataviz shared helpers — group wrapper, glossy clay, curved 3D text, stretchable bevelled geometry
import React from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { FONT_BOLD, C } from "../../kit/theme";
import { FPS } from "../../kit/time";

export type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
export const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

/** showcase-এর সময় (সেকেন্ড, 0 থেকে) */
export const useT = () => useCurrentFrame() / FPS;

/** polished clay — clay-র নরম sheen + হালকা clearcoat (চকচকে কিন্তু plastic নয়) */
export const Gloss: React.FC<{ color: string; rough?: number; coat?: number; opacity?: number; emissive?: string; emissiveIntensity?: number }> = ({
  color,
  rough = 0.42,
  coat = 0.55,
  opacity = 1,
  emissive,
  emissiveIntensity = 0,
}) => (
  <meshPhysicalMaterial
    color={color}
    roughness={rough}
    clearcoat={coat}
    clearcoatRoughness={0.3}
    sheen={0.35}
    sheenColor="#ffe2c4"
    sheenRoughness={0.8}
    transparent={opacity < 1}
    opacity={opacity}
    emissive={emissive ?? "#000000"}
    emissiveIntensity={emissiveIntensity}
    envMapIntensity={0.9}
  />
);

/** palette (theme C থেকে) — chart series */
export const SERIES = [C.steel, C.navy, "#7FA6CC", C.orange, "#E9C9A8"];

/** 12480 → "12,480" */
export const fmt = (n: number, dec = 0) => {
  const s = Math.abs(n).toFixed(dec);
  const [a, b] = s.split(".");
  const w = a.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (n < 0 ? "-" : "") + w + (b ? "." + b : "");
};

/**
 * stretch: base geometry-র নির্দিষ্ট axis-এ `cut`-এর উপরের সব vertex `delta` সরে যায় — bevel/কোণ অক্ষত থাকে
 * (scale করলে bevel চ্যাপ্টা হয়ে যেত)। base geometry একবার বানিয়ে প্রতি frame নতুন position।
 */
export const stretchGeo = (base: THREE.BufferGeometry, axis: 0 | 1 | 2, cut: number, delta: number) => {
  const g = base.clone();
  const a = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < a.count; i++) {
    const v = a.getComponent(i, axis);
    if (v > cut) a.setComponent(i, axis, v + delta);
  }
  a.needsUpdate = true;
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
};

/** Txt-এর মতো (delayRender sync) কিন্তু curveRadius সহ — বাঁকা তলে লেখা (funnel band) */
export const CTxt: React.FC<{
  children: string;
  size?: number;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "middle" | "bottom";
  curve?: number;
  opacity?: number;
  letterSpacing?: number;
  semi?: boolean;
}> = ({ children, size = 0.3, color = C.text, position, rotation, anchorX = "center", anchorY = "middle", curve = 0, opacity = 1, letterSpacing = 0, semi }) => {
  const hRef = React.useRef<number | null>(null);
  const advance = useThree((st) => st.advance);
  const release = () => {
    if (hRef.current !== null) {
      continueRender(hRef.current);
      hRef.current = null;
    }
  };
  React.useLayoutEffect(() => {
    hRef.current = delayRender("ctxt-sync");
    const to = setTimeout(() => release(), 6000);
    return () => {
      clearTimeout(to);
      release();
    };
  }, [children]);
  return (
    <Text
      font={staticFile(semi ? "fonts/Inter-700.ttf" : FONT_BOLD)}
      fontSize={size}
      color={color}
      position={position}
      rotation={rotation as any}
      anchorX={anchorX}
      anchorY={anchorY}
      {...({ curveRadius: curve, glyphGeometryDetail: curve ? 4 : 1 } as any)}
      letterSpacing={letterSpacing}
      fillOpacity={opacity}
      onSync={() => {
        advance(performance.now());
        requestAnimationFrame(() => release());
      }}
    >
      {children}
    </Text>
  );
};

/** seeded random (deterministic) */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
