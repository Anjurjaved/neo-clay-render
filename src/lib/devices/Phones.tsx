// iPhone (15/16 Pro proportions 70.6 × 146.6 × 8.25 mm) and Pixel-style Android (champagne frame, camera visor).
// Phones use width = 1 (kit convention); `PHONE_REAL` = scale that matches MacBook/iPad/iMac (1 unit = 10 cm).
// DOM canvas 390×843 px (same as kit phoneScreen, so all screens_* groups fit both).
//   const ph = { position, rotation, scale };
//   <Stage screens={[iphoneScreen(ph, <UI/>)]}> <IPhone {...ph} color="natural"/> </Stage>
import React, { useMemo } from "react";
import * as THREE from "three";
import { slabGeo, roundedCylGeo } from "../../kit/Geo";
import { ScreenSpec, toMatrix } from "../../kit/Screens";
import { FrameMat, BackGlass, LensGlass, G, Pose, V3, rrFlat } from "./common";

const SW = 390,
  SH = 843;

// ======================= iPhone =======================
export type IPhoneColor = "natural" | "black" | "blue" | "desert";
const IP_COL: Record<IPhoneColor, { frame: string; back: string }> = {
  natural: { frame: "#b9b2a7", back: "#cfc9bf" },
  black: { frame: "#3b3b3d", back: "#45464a" },
  blue: { frame: "#4a5263", back: "#5b6577" },
  desert: { frame: "#c4a88c", back: "#d6bfa6" },
};
const IP_GLASS_IN = 0.012; // glass inset from body outline
const IP_BEZEL = 0.022;
const IP_SW = 1 - 2 * (IP_GLASS_IN + IP_BEZEL); // 0.932
const IP_SH = (IP_SW * SH) / SW;
export const IPHONE = { w: 1, h: IP_SH + 2 * (IP_GLASS_IN + IP_BEZEL), d: 0.117, r: 0.165, sw: SW, sh: SH };
export const PHONE_REAL = 0.706;

export const IPhone: React.FC<{ position?: V3; rotation?: V3; scale?: number; color?: IPhoneColor }> = ({ color = "natural", ...p }) => {
  const { w, h, d, r } = IPHONE;
  const col = IP_COL[color];
  const g = useMemo(() => {
    const frame = slabGeo(w, h, d - 0.018, r, 0.03, 8);
    const glass = slabGeo(w - IP_GLASS_IN * 2, h - IP_GLASS_IN * 2, 0.018, r - IP_GLASS_IN, 0.007, 4);
    const bump = slabGeo(0.5, 0.5, 0.03, 0.13, 0.012, 5);
    const lensRing = roundedCylGeo(0.106, 0.05, 0.016, 64);
    const lensGlass = roundedCylGeo(0.078, 0.056, 0.01, 64);
    const lensIn = roundedCylGeo(0.042, 0.058, 0.004, 48);
    const flash = roundedCylGeo(0.036, 0.034, 0.008, 32);
    const lidar = roundedCylGeo(0.03, 0.034, 0.008, 32);
    const btnLong = slabGeo(0.03, 0.2, 0.03, 0.014, 0.01, 3);
    const btnVol = slabGeo(0.03, 0.12, 0.03, 0.014, 0.01, 3);
    const btnAct = slabGeo(0.03, 0.07, 0.03, 0.014, 0.01, 3);
    const band = rrFlat(0.012, 0.034, 0.005);
    const usb = rrFlat(0.11, 0.032, 0.015);
    const hole = new THREE.CircleGeometry(0.0085, 16);
    return { frame, glass, bump, lensRing, lensGlass, lensIn, flash, lidar, btnLong, btnVol, btnAct, band, usb, hole };
  }, []);
  const bx = w / 2 - 0.05 - 0.25,
    by = h / 2 - 0.05 - 0.25,
    bz = -d / 2 - 0.006;
  const lens: [number, number][] = [
    [-0.115, 0.113],
    [-0.115, -0.113],
    [0.112, 0],
  ];
  return (
    <G {...p}>
      <mesh geometry={g.frame} castShadow receiveShadow>
        <FrameMat color={col.frame} />
      </mesh>
      {/* front cover glass (screen DOM sits on it) */}
      <mesh geometry={g.glass} position={[0, 0, d / 2 - 0.009]}>
        <meshPhysicalMaterial color="#040506" roughness={0.06} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.3} />
      </mesh>
      {/* matte back glass */}
      <mesh geometry={g.glass} position={[0, 0, -d / 2 + 0.009]} receiveShadow>
        <BackGlass color={col.back} rough={0.5} />
      </mesh>
      {/* camera plateau (glossy, same tint) + lenses — viewed from the back it sits top-left */}
      <group position={[bx, by, bz]} rotation={[0, Math.PI, 0]}>
        <mesh geometry={g.bump} castShadow>
          <BackGlass color={col.back} rough={0.12} />
        </mesh>
        {lens.map(([x, y], i) => (
          <group key={i} position={[x, y, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={g.lensRing} castShadow>
              <FrameMat color={col.frame} rough={0.22} />
            </mesh>
            <mesh geometry={g.lensGlass}>
              <LensGlass />
            </mesh>
            <mesh geometry={g.lensIn} position={[0, 0.0012, 0]}>
              <meshPhysicalMaterial color="#141a2c" roughness={0.02} clearcoat={1} metalness={0.4} envMapIntensity={2} />
            </mesh>
          </group>
        ))}
        <mesh geometry={g.flash} position={[0.112, 0.17, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial color="#f3ead6" roughness={0.3} clearcoat={1} />
        </mesh>
        <mesh geometry={g.lidar} position={[0.112, -0.17, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial color="#121214" roughness={0.1} clearcoat={1} />
        </mesh>
      </group>
      {/* buttons: left = action + volume, right = side */}
      <mesh geometry={g.btnAct} position={[-w / 2 - 0.008, h * 0.3, 0]} castShadow>
        <FrameMat color={col.frame} />
      </mesh>
      {[0.2, 0.12].map((y, i) => (
        <mesh key={i} geometry={g.btnVol} position={[-w / 2 - 0.008, h * (y - 0.01), 0]} rotation={[0, 0, 0]} castShadow>
          <FrameMat color={col.frame} />
        </mesh>
      ))}
      <mesh geometry={g.btnLong} position={[w / 2 + 0.008, h * 0.17, 0]} castShadow>
        <FrameMat color={col.frame} />
      </mesh>
      {/* antenna bands */}
      {[
        [-1, 0.42],
        [1, 0.42],
        [-1, -0.42],
        [1, -0.42],
      ].map(([s, y], i) => (
        <mesh key={i} geometry={g.band} position={[s * (w / 2 + 0.0005), h * y, 0]} rotation={[0, (s * Math.PI) / 2, Math.PI / 2]}>
          <meshPhysicalMaterial color="#8d887f" roughness={0.5} />
        </mesh>
      ))}
      {/* bottom: USB-C + speaker holes */}
      <mesh geometry={g.usb} position={[0, -h / 2 - 0.0005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color="#070708" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map((s) =>
        [0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={`${s}${i}`} geometry={g.hole} position={[s * (0.12 + i * 0.03), -h / 2 - 0.0005, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#0a0a0b" side={THREE.DoubleSide} />
          </mesh>
        ))
      )}
    </G>
  );
};

export const iphoneScreen = (p: Pose, content: React.ReactNode, opts: Partial<ScreenSpec> = {}): ScreenSpec => ({
  matrix: toMatrix(p.position, p.rotation, p.scale ?? 1, p.parent).multiply(new THREE.Matrix4().makeTranslation(0, 0, IPHONE.d / 2 + 0.0035)),
  w: IP_SW,
  h: IP_SH,
  px: SW,
  py: SH,
  radius: ((IPHONE.r - IP_GLASS_IN - IP_BEZEL) / IP_SW) * SW,
  bg: "#000",
  content,
  ...opts,
});

// ======================= Pixel-style Android =======================
export type PixelColor = "champagne" | "obsidian" | "mint";
const PX_COL: Record<PixelColor, { frame: string; back: string; visor: string }> = {
  champagne: { frame: "#d9c8ae", back: "#ece2d2", visor: "#d4c2a6" },
  obsidian: { frame: "#2f3134", back: "#36383c", visor: "#2b2d30" },
  mint: { frame: "#b9cbbf", back: "#d5e3d9", visor: "#b2c6b8" },
};
const PX_GLASS_IN = 0.012;
const PX_BEZEL = 0.03;
const PX_SW = 1 - 2 * (PX_GLASS_IN + PX_BEZEL);
const PX_SH = (PX_SW * SH) / SW;
export const PIXEL = { w: 1, h: PX_SH + 2 * (PX_GLASS_IN + PX_BEZEL), d: 0.126, r: 0.17, sw: SW, sh: SH };

export const Pixel: React.FC<{ position?: V3; rotation?: V3; scale?: number; color?: PixelColor }> = ({ color = "champagne", ...p }) => {
  const { w, h, d, r } = PIXEL;
  const col = PX_COL[color];
  const g = useMemo(() => {
    const frame = slabGeo(w, h, d - 0.02, r, 0.045, 10); // softer, rounder rails than iPhone
    const glass = slabGeo(w - PX_GLASS_IN * 2, h - PX_GLASS_IN * 2, 0.02, r - PX_GLASS_IN, 0.009, 4);
    const visor = slabGeo(w - 0.016, 0.25, 0.056, 0.125, 0.026, 8);
    const visorGlass = slabGeo(0.5, 0.16, 0.012, 0.08, 0.005, 4);
    const lensRing = roundedCylGeo(0.062, 0.024, 0.008, 48);
    const lensGlass = roundedCylGeo(0.048, 0.028, 0.006, 48);
    const flash = roundedCylGeo(0.025, 0.02, 0.006, 32);
    const btnPow = slabGeo(0.03, 0.11, 0.03, 0.014, 0.01, 3);
    const btnVol = slabGeo(0.03, 0.24, 0.03, 0.014, 0.01, 3);
    const usb = rrFlat(0.11, 0.032, 0.015);
    return { frame, glass, visor, visorGlass, lensRing, lensGlass, flash, btnPow, btnVol, usb };
  }, []);
  const vy = h / 2 - 0.36;
  return (
    <G {...p}>
      <mesh geometry={g.frame} castShadow receiveShadow>
        <FrameMat color={col.frame} rough={0.28} />
      </mesh>
      <mesh geometry={g.glass} position={[0, 0, d / 2 - 0.01]}>
        <meshPhysicalMaterial color="#040506" roughness={0.06} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.3} />
      </mesh>
      <mesh geometry={g.glass} position={[0, 0, -d / 2 + 0.01]} receiveShadow>
        <BackGlass color={col.back} rough={0.48} />
      </mesh>
      {/* camera visor (metal, edge to edge) */}
      <group position={[0, vy, -d / 2 - 0.012]} rotation={[0, Math.PI, 0]}>
        <mesh geometry={g.visor} castShadow>
          <FrameMat color={col.visor} rough={0.3} />
        </mesh>
        <mesh geometry={g.visorGlass} position={[-0.12, 0, 0.026]}>
          <meshPhysicalMaterial color="#0b0c0f" roughness={0.05} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.5} />
        </mesh>
        {[-0.28, -0.09].map((x, i) => (
          <group key={i} position={[x + 0.035, 0, 0.034]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={g.lensRing}>
              <meshPhysicalMaterial color="#2a2c31" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh geometry={g.lensGlass}>
              <LensGlass />
            </mesh>
          </group>
        ))}
        <mesh geometry={g.flash} position={[0.25, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial color="#f3ead6" roughness={0.3} clearcoat={1} />
        </mesh>
      </group>
      <mesh geometry={g.btnPow} position={[w / 2 + 0.008, h * 0.24, 0]} castShadow>
        <FrameMat color={col.frame} rough={0.28} />
      </mesh>
      <mesh geometry={g.btnVol} position={[w / 2 + 0.008, h * 0.06, 0]} castShadow>
        <FrameMat color={col.frame} rough={0.28} />
      </mesh>
      <mesh geometry={g.usb} position={[0, -h / 2 - 0.0005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color="#070708" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </G>
  );
};

export const pixelScreen = (p: Pose, content: React.ReactNode, opts: Partial<ScreenSpec> = {}): ScreenSpec => ({
  matrix: toMatrix(p.position, p.rotation, p.scale ?? 1, p.parent).multiply(new THREE.Matrix4().makeTranslation(0, 0, PIXEL.d / 2 + 0.0035)),
  w: PX_SW,
  h: PX_SH,
  px: SW,
  py: SH,
  radius: ((PIXEL.r - PX_GLASS_IN - PX_BEZEL) / PX_SW) * SW,
  bg: "#000",
  content,
  ...opts,
});
