// Reception — উঁচু সামনের ledge-সহ desk (নিচু কাজের টেবিল পেছনে), RECEPTION লেখা, service bell, ছোট monitor (পিঠ ক্যামেরার দিকে),
// গদির office chair, টবের গাছ; person 0..1 → receptionist (kit Figure) pop করে আসে, wave 0..1 → হাত নাড়ে।
// local origin = floor, desk-এর কেন্দ্র; সামনে +z। প্রস্থ ≈ 2.6।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "../../kit/Clay";
import { slabGeo, latheGeo, roundedCylGeo, pillGeo } from "../../kit/Geo";
import { Figure } from "../../kit/Figure";
import { C } from "../../kit/theme";
import { PolishedClay, Satin } from "./mats";
import { ServiceBell, PottedPlant } from "./signs";
import { bakeSDF, sdRoundBox, smin, sdCapsule } from "./sdf";

export const DESK = { w: 2.4, frontH: 1.08, workH: 0.74, depth: 0.9 };

/** গদি-আসন office chair — seat ও back একটাই SDF (মসৃণ বাঁক), পাঁচ-পা base */
export const OfficeChair: React.FC<{ position?: [number, number, number]; rotationY?: number; color?: string }> = ({ position, rotationY = 0, color = C.navy }) => {
  const shell = useMemo(
    () =>
      bakeSDF(
        "chair-shell-v1",
        (x, y, z) => {
          const seat = sdRoundBox(x, y - 0.5, z, 0.2, 0.025, 0.18, 0.06);
          const back = sdRoundBox(x, y - 0.86, z + 0.24, 0.19, 0.2, 0.015, 0.06);
          const spine = sdCapsule([x, y, z], [0, 0.5, -0.17], [0, 0.72, -0.25], 0.05);
          return smin(smin(seat, back, 0.08), spine, 0.06);
        },
        [0, 0.72, -0.05],
        0.42,
        80
      ),
    []
  );
  const post = useMemo(() => latheGeo([[0, 0.08], [0.03, 0.08], [0.028, 0.3], [0.035, 0.44], [0.0, 0.46]], 20), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={shell} castShadow receiveShadow>
        <PolishedClay color={color} rough={0.55} coat={0.25} />
      </mesh>
      <mesh geometry={post} castShadow>
        <Satin />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <mesh position={[0.15, 0.085, 0]} rotation={[0, 0, Math.PI / 2 + 0.12]} castShadow>
            <capsuleGeometry args={[0.025, 0.26, 6, 12]} />
            <Satin color="#b8bec4" />
          </mesh>
          <mesh position={[0.29, 0.035, 0]}>
            <sphereGeometry args={[0.035, 16, 10]} />
            <meshStandardMaterial color="#2a2f36" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** ছোট all-in-one monitor — পাতলা rounded body, সরু gooseneck stand; পেছন থেকে দেখা যায় (screen −z দিকে) */
export const DeskMonitor: React.FC<{ position?: [number, number, number]; rotationY?: number; on?: number }> = ({ position, rotationY = 0, on = 0 }) => {
  const body = useMemo(() => slabGeo(0.62, 0.42, 0.05, 0.05, 0.02, 4), []);
  const bezel = useMemo(() => slabGeo(0.57, 0.36, 0.012, 0.03, 0.004, 2), []);
  const stand = useMemo(() => latheGeo([[0, 0], [0.12, 0], [0.12, 0.012], [0.03, 0.02], [0.02, 0.2], [0.0, 0.21]], 32), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={stand} castShadow>
        <Satin color="#d3d7db" />
      </mesh>
      <group position={[0, 0.38, 0]} rotation={[0.08, 0, 0]}>
        <mesh geometry={body} castShadow>
          <PolishedClay color="#F7F4EF" rough={0.35} coat={0.6} />
        </mesh>
        {/* screen −z দিকে: receptionist দেখে; উল্টো দিকে নীল আভা */}
        <mesh geometry={bezel} position={[0, 0, -0.03]}>
          <meshStandardMaterial color="#9fd0ff" emissive="#6fb7ff" emissiveIntensity={on * 1.2} roughness={0.2} />
        </mesh>
        {on > 0.01 && <pointLight position={[0, 0, -0.35]} intensity={0.9 * on} distance={1.4} decay={2} color="#9cc9ff" />}
      </group>
    </group>
  );
};

export const Reception: React.FC<{
  person?: number; // 0 = কেউ নেই, 1 = receptionist পুরো দৃশ্যমান
  wave?: number;
  time?: number;
  bellPress?: number;
  bellRing?: number;
  screenOn?: number;
  label?: string;
  accent?: string;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number | [number, number, number];
}> = ({ person = 0, wave = 0, time = 0, bellPress = 0, bellRing = 0, screenOn = 0, label = "RECEPTION", accent = C.orange, position, rotationY = 0, scale = 1 }) => {
  const { w, frontH, workH, depth } = DESK;
  const front = useMemo(() => slabGeo(w, frontH, 0.3, 0.16, 0.1, 7), []);
  const ledge = useMemo(() => slabGeo(w + 0.08, 0.07, 0.46, 0.035, 0.03, 4), []);
  const work = useMemo(() => slabGeo(w - 0.12, 0.07, depth - 0.2, 0.035, 0.03, 4), []);
  const leg = useMemo(() => slabGeo(0.08, workH - 0.04, depth - 0.3, 0.035, 0.025, 3), []);
  const stripe = useMemo(() => pillGeo(w * 0.8, 0.07, 0.04, 0.015), []);
  const plaque = useMemo(() => slabGeo(1.15, 0.26, 0.05, 0.12, 0.02, 4), []);
  const p = Math.max(0, person);
  const waveA = wave > 0 ? Math.sin(time * 9) * 0.28 * Math.sin(Math.min(1, wave) * Math.PI) : 0;
  const raise = Math.sin(Math.min(1, wave) * Math.PI);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale as any}>
      {/* front panel + ledge */}
      <mesh geometry={front} position={[0, frontH / 2, 0.3]} castShadow receiveShadow>
        <ClayMat color="#F6F0E8" />
      </mesh>
      <mesh geometry={stripe} position={[0, 0.26, 0.47]} castShadow>
        <PolishedClay color={accent} rough={0.4} coat={0.5} />
      </mesh>
      <mesh geometry={plaque} position={[0, 0.66, 0.47]} castShadow>
        <PolishedClay color={C.navy} rough={0.45} coat={0.4} />
      </mesh>
      <Txt size={0.12} color="#ffffff" position={[0, 0.655, 0.5]} letterSpacing={0.08}>
        {label}
      </Txt>
      <mesh geometry={ledge} position={[0, frontH + 0.035, 0.26]} castShadow receiveShadow>
        <ClayMat color="#E8C9A2" />
      </mesh>
      {/* পেছনের কাজের টেবিল */}
      <mesh geometry={work} position={[0, workH, -0.12]} castShadow receiveShadow>
        <ClayMat color="#EFE5D8" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={leg} position={[s * (w / 2 - 0.15), (workH - 0.04) / 2, -0.12]} castShadow>
          <ClayMat color="#E3D9CC" />
        </mesh>
      ))}
      <DeskMonitor position={[-0.55, workH + 0.035, -0.12]} rotationY={0.35} on={screenOn} />
      {/* ledge-এর উপর bell, গাছ */}
      <ServiceBell position={[0.88, frontH + 0.07, 0.3]} scale={0.9} press={bellPress} ring={bellRing} />
      <PottedPlant position={[-0.95, frontH + 0.07, 0.24]} scale={0.7} />
      {/* receptionist + chair */}
      <OfficeChair position={[0.05, 0, -1.05]} rotationY={0.1} />
      {p > 0.001 && (
        <group position={[0.05, 0.42, -0.78]} scale={[p, p, p]}>
          <Figure scale={1.32} rotationY={0} coat="#F5F2EC" color={C.figure} pose={{ armOut: [0.55, 0.55 + raise * 2.1 + waveA] }} headTilt={Math.sin(time * 1.4) * 0.05} />
        </group>
      )}
    </group>
  );
};
