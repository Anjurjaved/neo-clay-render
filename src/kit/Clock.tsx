// Clock badge — master-এর মতো: পুরু গোল রুপালি bezel (torus), হালকা ধূসর face (সামান্য অবতল),
// ১২টা সমান সরু গোল tick, গোল-মাথার navy কাঁটা, navy কেন্দ্র-বিন্দু, ১-২টার কাছে ছোট navy চাঁদ।
// hourA/minA = radians, 0 = ১২টা, ঘড়ির কাঁটার দিকে +।  ব্যাস ≈ 2.0 world (scale দিয়ে বদলান)
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, Txt } from "./Clay";
import { roundedCylGeo, shapeGeo, slabGeo } from "./Geo";
import { C } from "./theme";

// কাস্তে চাঁদ: বড় বৃত্ত A থেকে সরানো বৃত্ত B বাদ — দুই arc দিয়ে সরাসরি outline (hole নয়)
const moon = () => {
  const rA = 0.1, bx = 0.042, by = 0.034, rB = 0.088;
  // দুই বৃত্তের ছেদবিন্দু
  const d = Math.hypot(bx, by);
  const a = (rA * rA - rB * rB + d * d) / (2 * d);
  const hh = Math.sqrt(Math.max(0, rA * rA - a * a));
  const ux = bx / d, uy = by / d;
  const px = a * ux, py = a * uy;
  const p1 = [px - hh * uy, py + hh * ux], p2 = [px + hh * uy, py - hh * ux];
  const ang = (p: number[], cx = 0, cy = 0) => Math.atan2(p[1] - cy, p[0] - cx);
  const s = new THREE.Shape();
  s.moveTo(p1[0], p1[1]);
  // A-র উপর p1 → p2, B-র বিপরীত দিক ঘুরে (বাইরের দিক)
  s.absarc(0, 0, rA, ang(p1), ang(p2) + (ang(p2) < ang(p1) ? Math.PI * 2 : 0), false);
  s.absarc(bx, by, rB, ang(p2, bx, by), ang(p1, bx, by) + (ang(p1, bx, by) > ang(p2, bx, by) ? -Math.PI * 2 : 0), true);
  return s;
};

const Hand: React.FC<{ len: number; w: number; a: number; z: number }> = ({ len, w, a, z }) => {
  const g = useMemo(() => slabGeo(w, len + w, 0.035, w / 2, 0.012, 3), [len, w]);
  return (
    <group rotation={[0, 0, -a]} position={[0, 0, z]}>
      <mesh geometry={g} position={[0, len / 2 - w * 0.4, 0]} castShadow>
        <meshPhysicalMaterial color={C.deepNavy} roughness={0.45} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
    </group>
  );
};

export const ClockBadge: React.FC<{ position?: [number, number, number]; scale?: number | [number, number, number]; hourA: number; minA: number; moon?: boolean }> = ({
  position,
  scale = 1,
  hourA,
  minA,
  moon: showMoon = true,
}) => {
  const back = useMemo(() => roundedCylGeo(1.0, 0.2, 0.09), []);
  const face = useMemo(() => roundedCylGeo(0.84, 0.06, 0.02), []);
  const tick = useMemo(() => slabGeo(0.035, 0.13, 0.02, 0.017, 0.006, 2), []);
  const moonGeo = useMemo(() => shapeGeo(moon(), 0.02, 0.008, 3), []);
  const cap = useMemo(() => roundedCylGeo(0.06, 0.05, 0.02, 32), []);
  return (
    <group position={position} scale={scale as any}>
      {/* back body (silver) */}
      <mesh geometry={back} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.12]} castShadow>
        <SilverMat color="#e3e6ea" rough={0.38} />
      </mesh>
      {/* thick rounded bezel */}
      <mesh position={[0, 0, 0.02]} castShadow>
        <torusGeometry args={[0.905, 0.1, 40, 128]} />
        <SilverMat color="#eceef1" rough={0.3} />
      </mesh>
      {/* face */}
      <mesh geometry={face} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0]}>
        <meshPhysicalMaterial color="#F3F4F6" roughness={0.65} />
      </mesh>
      {/* ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} geometry={tick} position={[Math.sin(a) * 0.66, Math.cos(a) * 0.66, 0.04]} rotation={[0, 0, -a]}>
            <meshStandardMaterial color="#8B95A1" roughness={0.6} />
          </mesh>
        );
      })}
      {showMoon && (
        <mesh geometry={moonGeo} position={[0.36, 0.5, 0.035]} rotation={[0, 0, -0.35]} scale={0.95}>
          <meshPhysicalMaterial color={C.deepNavy} roughness={0.45} clearcoat={0.3} />
        </mesh>
      )}
      <Hand len={0.4} w={0.075} a={hourA} z={0.05} />
      <Hand len={0.58} w={0.058} a={minA} z={0.08} />
      <mesh geometry={cap} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.11]}>
        <meshPhysicalMaterial color={C.deepNavy} roughness={0.4} clearcoat={0.4} />
      </mesh>
    </group>
  );
};

/** ছোট navy tag (গোল-কোণের আয়তক্ষেত্র) — "12:00 AM", "PAGE 7" … */
export const Tag: React.FC<{ text: string; position?: [number, number, number]; scale?: number | [number, number, number]; color?: string; textColor?: string; size?: number; w?: number; h?: number }> = ({
  text,
  position,
  scale = 1,
  color = "#24395A",
  textColor = "#ffffff",
  size = 0.2,
  w,
  h,
}) => {
  const W = w ?? text.length * size * 0.66 + size * 1.1;
  const Hh = h ?? size * 1.65;
  const g = useMemo(() => slabGeo(W, Hh, 0.08, Hh * 0.22, 0.025, 3), [W, Hh]);
  return (
    <group position={position} scale={scale as any}>
      <mesh geometry={g} castShadow>
        <ClayMat color={color} rough={0.55} bump={0.15} sheen={0.25} />
      </mesh>
      <Txt size={size} color={textColor} position={[0, -size * 0.02, 0.045]}>
        {text}
      </Txt>
    </group>
  );
};

/** সাদা notification card — সবুজ dot + লেখা (master-এর "New Order") */
export const NotifyCard: React.FC<{ text: string; position?: [number, number, number]; scale?: number | [number, number, number]; rotation?: [number, number, number]; dot?: string }> = ({
  text,
  position,
  scale = 1,
  rotation,
  dot = "#22B35E",
}) => {
  const g = useMemo(() => slabGeo(1.3, 0.38, 0.09, 0.085, 0.03, 4), []);
  return (
    <group position={position} scale={scale as any} rotation={rotation as any}>
      <mesh geometry={g} castShadow>
        <ClayMat color="#FBFBFA" rough={0.6} bump={0.12} sheen={0.3} />
      </mesh>
      <mesh position={[-0.45, 0, 0.05]}>
        <sphereGeometry args={[0.042, 20, 14]} />
        <meshStandardMaterial color={dot} roughness={0.4} emissive={dot} emissiveIntensity={0.25} />
      </mesh>
      <Txt size={0.125} color="#2A3442" bold={false} position={[0.07, -0.003, 0.05]}>
        {text}
      </Txt>
    </group>
  );
};
