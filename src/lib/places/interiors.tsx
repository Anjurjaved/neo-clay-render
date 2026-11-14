// দোকানের ভেতরের ছোট জিনিস — shutter উঠলে কাচের ভেতর দিয়ে দেখা যায় (local origin = ভেতরের মেঝে, পেছনের দেয়ালের কাছে)
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat } from "../../kit/Clay";
import { slabGeo, latheGeo, roundedCylGeo } from "../../kit/Geo";
import { PolishedClay } from "./mats";
import { PottedPlant, Tee, Molar } from "./signs";

const Counter: React.FC<{ w: number; position: [number, number, number]; color?: string; top?: string }> = ({ w, position, color = "#FBF7F1", top = "#E7C9A6" }) => {
  const body = useMemo(() => slabGeo(w, 0.62, 0.36, 0.08, 0.05, 4), [w]);
  const lid = useMemo(() => slabGeo(w + 0.06, 0.06, 0.42, 0.03, 0.025, 3), [w]);
  return (
    <group position={position}>
      <mesh geometry={body} position={[0, 0.31, 0]} castShadow receiveShadow>
        <ClayMat color={color} />
      </mesh>
      <mesh geometry={lid} position={[0, 0.65, 0]} castShadow receiveShadow>
        <ClayMat color={top} />
      </mesh>
    </group>
  );
};

/** দেয়ালের ছোট ফ্রেম (ছবি/চার্ট) */
const WallFrame: React.FC<{ position: [number, number, number]; w?: number; h?: number; color?: string; children?: React.ReactNode }> = ({ position, w = 0.42, h = 0.5, color = "#FFFFFF", children }) => {
  const g = useMemo(() => slabGeo(w, h, 0.05, 0.05, 0.02, 3), [w, h]);
  return (
    <group position={position}>
      <mesh geometry={g} castShadow>
        <ClayMat color={color} />
      </mesh>
      <group position={[0, 0, 0.03]}>{children}</group>
    </group>
  );
};

export const DentalInterior: React.FC = () => (
  <>
    <Counter w={0.62} position={[0.28, 0, 0.18]} />
    <PottedPlant position={[-0.48, 0, 0.05]} scale={1.05} />
    <WallFrame position={[-0.12, 1.0, -0.2]} w={0.46} h={0.52}>
      <Molar scale={0.32} position={[0, -0.17, 0.02]} rotation={[0, 0.4, 0]} />
    </WallFrame>
  </>
);

const Table: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const top = useMemo(() => roundedCylGeo(0.24, 0.05, 0.022), []);
  const leg = useMemo(() => latheGeo([[0, 0], [0.1, 0], [0.09, 0.02], [0.03, 0.06], [0.025, 0.4], [0.0, 0.42]], 24), []);
  const stool = useMemo(() => roundedCylGeo(0.1, 0.06, 0.025), []);
  return (
    <group position={position}>
      <mesh geometry={leg} castShadow>
        <ClayMat color="#7A5236" />
      </mesh>
      <mesh geometry={top} position={[0, 0.44, 0]} castShadow receiveShadow>
        <ClayMat color="#FBF7F1" />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.34, 0, 0.04]}>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.022, 0.03, 0.26, 12]} />
            <ClayMat color="#7A5236" />
          </mesh>
          <mesh geometry={stool} position={[0, 0.28, 0]} castShadow>
            <ClayMat color="#E9573F" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
const Pendant: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const shade = useMemo(() => latheGeo([[0.0, 0.0], [0.13, 0.0], [0.12, 0.03], [0.07, 0.1], [0.025, 0.13], [0.0, 0.135]], 32), []);
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.5, 6]} />
        <meshStandardMaterial color="#3a3530" />
      </mesh>
      <mesh geometry={shade} castShadow>
        <PolishedClay color="#2B2F36" />
      </mesh>
      <mesh position={[0, -0.005, 0]}>
        <sphereGeometry args={[0.05, 20, 12]} />
        <meshStandardMaterial color="#FFD49A" emissive="#FFB050" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
};
export const RestaurantInterior: React.FC = () => (
  <>
    <Table position={[-0.2, 0, 0.2]} />
    <Pendant position={[-0.2, 1.15, 0.2]} />
    <PottedPlant position={[0.5, 0, -0.05]} scale={0.9} />
  </>
);

const COLORS = ["#E9573F", "#2F9C95", "#F5D04C", "#3E6E9E"];
export const ClothingInterior: React.FC = () => {
  const rail = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.6, 0, 0), new THREE.Vector3(-0.6, 1.2, 0), new THREE.Vector3(-0.55, 1.25, 0), new THREE.Vector3(0.55, 1.25, 0), new THREE.Vector3(0.6, 1.2, 0), new THREE.Vector3(0.6, 0, 0)], false, "catmullrom", 0.1);
    return new THREE.TubeGeometry(c, 80, 0.02, 10, false);
  }, []);
  return (
    <group position={[0, 0, 0.05]}>
      <mesh geometry={rail} castShadow>
        <meshPhysicalMaterial color="#cfd4d8" metalness={0.85} roughness={0.3} />
      </mesh>
      {COLORS.map((c, i) => (
        <Tee key={i} color={c} scale={0.46} position={[-0.39 + i * 0.26, 0.98, 0.02 - i * 0.04]} rotation={[0, 0.5, 0]} />
      ))}
    </group>
  );
};

const BOX_COL = ["#3E6E9E", "#F5952B", "#2DBE60", "#E9573F", "#F7F2EC", "#7FB3E0"];
export const PharmacyInterior: React.FC = () => {
  const shelf = useMemo(() => slabGeo(1.25, 0.05, 0.3, 0.025, 0.018, 2), []);
  const box = useMemo(() => slabGeo(0.13, 0.17, 0.1, 0.025, 0.015, 2), []);
  const bottle = useMemo(() => latheGeo([[0, 0], [0.045, 0], [0.05, 0.02], [0.05, 0.11], [0.03, 0.14], [0.03, 0.17], [0.0, 0.17]], 24), []);
  return (
    <group position={[0, 0, -0.12]}>
      {[0.42, 0.82, 1.22].map((y, r) => (
        <group key={r} position={[0, y, 0]}>
          <mesh geometry={shelf} castShadow receiveShadow>
            <ClayMat color="#FBF7F1" />
          </mesh>
          {Array.from({ length: 7 }).map((_, i) => {
            const x = -0.5 + i * 0.165;
            const isB = (i + r) % 3 === 1;
            return isB ? (
              <mesh key={i} geometry={bottle} position={[x, 0.025, 0.02]} castShadow>
                <PolishedClay color={r === 1 ? "#C8792F" : "#FFFFFF"} rough={0.25} />
              </mesh>
            ) : (
              <mesh key={i} geometry={box} position={[x, 0.11, 0.02]} castShadow>
                <ClayMat color={BOX_COL[(i * 2 + r) % BOX_COL.length]} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};
