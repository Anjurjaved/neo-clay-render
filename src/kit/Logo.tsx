// JIT logo — আসল logo PNG (alpha) layer-stack করে সত্যিকারের পুরুত্ব (ঘোরালে পাশ দেখা যায়)
import React, { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { staticFile } from "remotion";
import * as THREE from "three";

export const LOGO_SRC = "ref/jit-logo-alpha.png";

/** size = world width; depth = পুরুত্ব; layers বেশি = মসৃণ পাশ */
export const LogoMark: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; size?: number; depth?: number; layers?: number; opacity?: number; glow?: number }> = ({
  position,
  rotation,
  scale = 1,
  size = 2,
  depth = 0.16,
  layers = 14,
  opacity = 1,
  glow = 0,
}) => {
  const tex = useTexture(staticFile(LOGO_SRC));
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);
  const aspect = 1138 / 1144;
  return (
    <group position={position} rotation={rotation as any} scale={scale}>
      {Array.from({ length: layers }).map((_, i) => {
        const k = i / (layers - 1); // 0 = পিছন, 1 = সামনে
        const front = i === layers - 1;
        const shade = front ? 1 : 0.55 + 0.3 * k;
        return (
          <mesh key={i} position={[0, 0, -depth / 2 + k * depth]} castShadow={i === 0}>
            <planeGeometry args={[size, size * aspect]} />
            <meshStandardMaterial
              map={tex}
              transparent={opacity < 1}
              opacity={opacity}
              alphaTest={0.5}
              color={new THREE.Color(shade, shade, shade)}
              roughness={front ? 0.35 : 0.6}
              metalness={front ? 0.15 : 0.05}
              emissive={glow > 0 ? "#F5952B" : "#000000"}
              emissiveIntensity={front ? glow * 0.25 : 0}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};
