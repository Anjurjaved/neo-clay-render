// scenes_f shared — Cue contract, beat timing, SDF bake, industry emblems (এক টুকরার মসৃণ clay object)
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat } from "../../kit/Clay";
import { slabGeo, latheGeo } from "../../kit/Geo";
import { Tooth, ShoppingBag, Home } from "../icons/Icons";
import { C } from "../../kit/theme";

export type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
export const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

/** scene-শুরু থেকে সেকেন্ড; না পেলে NaN */
export type Cue = (word: string, after?: number) => number;
export type Industry = "dental" | "restaurant" | "ecommerce" | "school" | "realestate";

/** শব্দ পেলে সেই সময়, না পেলে dur-এর ভগ্নাংশ */
export const beat = (cue: Cue, dur: number, word: string | undefined, frac: number, after = 0) => {
  if (word) {
    const v = cue(word, after);
    if (Number.isFinite(v)) return v;
  }
  return frac * dur;
};

/** showcase-এর sample cue: [শব্দ, সেকেন্ড] তালিকা থেকে */
export const mkCue =
  (list: [string, number][]): Cue =>
  (word, after = 0) => {
    const k = word.toLowerCase();
    const hit = list.find(([w, s]) => s >= after - 1e-6 && w.toLowerCase().includes(k));
    return hit ? hit[1] : NaN;
  };

export const k01 = (x: number) => Math.max(0, Math.min(1, x));
export const v3 = (a: [number, number, number], b: [number, number, number], k: number): [number, number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
export const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** polished clay-gloss */
export const Gloss: React.FC<{ color: string; rough?: number; coat?: number }> = ({ color, rough = 0.4, coat = 0.6 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={coat} clearcoatRoughness={0.28} sheen={0.35} sheenColor="#ffe2c4" sheenRoughness={0.8} envMapIntensity={0.9} />
);

// ================= Industry emblems — প্রতিটা ≈ 1 world উঁচু, origin = নিচের মাঝখান =================
// dental/e-commerce/real estate = icons group-এর এক টুকরার SDF icon (≈2 উঁচু, কেন্দ্রে origin → 0.5 scale, +0.5 y)
/** restaurant: থালা + রুপালি cloche (এক lathe profile-এ গম্বুজ + গলা + knob) */
export const Cloche: React.FC<P> = (p) => {
  const plate = useMemo(() => latheGeo([[0, 0], [0.3, 0.0], [0.42, 0.03], [0.56, 0.08], [0.6, 0.1], [0.56, 0.115], [0.3, 0.07], [0.0, 0.07]], 72), []);
  const dome = useMemo(
    () => latheGeo([[0.0, 0.84], [0.06, 0.84], [0.085, 0.8], [0.05, 0.75], [0.07, 0.7], [0.22, 0.64], [0.38, 0.5], [0.46, 0.32], [0.5, 0.12], [0.52, 0.09], [0.5, 0.08]], 72, 96),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={plate} castShadow receiveShadow>
        <ClayMat color="#FBF8F3" rough={0.5} />
      </mesh>
      <mesh geometry={dome} castShadow>
        <SilverMat color="#e6e9ed" rough={0.26} />
      </mesh>
    </G>
  );
};

/** school: graduation cap (lathe skull + পুরু board + tassel) */
export const GradCap: React.FC<P> = (p) => {
  const skull = useMemo(() => latheGeo([[0.0, 0.0], [0.33, 0.0], [0.35, 0.05], [0.34, 0.22], [0.3, 0.34], [0.0, 0.36]], 64), []);
  const board = useMemo(() => slabGeo(0.95, 0.95, 0.08, 0.06, 0.03, 4), []);
  return (
    <G {...p}>
      <mesh geometry={skull} castShadow>
        <Gloss color={C.deepNavy} rough={0.5} coat={0.3} />
      </mesh>
      <mesh geometry={board} position={[0, 0.39, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} castShadow>
        <Gloss color={C.navy} rough={0.5} coat={0.3} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.055, 20, 14]} />
        <Gloss color={C.orange} />
      </mesh>
      <mesh position={[0.29, 0.43, 0.29]} rotation={[0, -Math.PI / 4, 0]}>
        <capsuleGeometry args={[0.02, 0.4, 6, 10]} />
        <Gloss color={C.orange} />
      </mesh>
      <mesh position={[0.5, 0.2, 0.5]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.12, 8, 16]} />
        <Gloss color={C.orange} />
      </mesh>
    </G>
  );
};

export const Emblem: React.FC<P & { industry: Industry }> = ({ industry, ...p }) => (
  <G {...p}>
    {industry === "dental" && <Tooth position={[0, 0.5, 0]} scale={0.5} res={96} />}
    {industry === "restaurant" && <Cloche />}
    {industry === "ecommerce" && <ShoppingBag position={[0, 0.5, 0]} scale={0.5} res={96} />}
    {industry === "school" && <GradCap position={[0, 0.2, 0]} />}
    {industry === "realestate" && <Home position={[0, 0.5, 0]} scale={0.5} res={96} />}
  </G>
);

/** industry অনুযায়ী রং/নাম */
export const IND: Record<Industry, { accent: string; label: string }> = {
  dental: { accent: C.steel, label: "DENTAL" },
  restaurant: { accent: C.deepOrange, label: "RESTAURANT" },
  ecommerce: { accent: C.orange, label: "ONLINE SHOP" },
  school: { accent: C.navy, label: "SCHOOL" },
  realestate: { accent: "#3E8E6A", label: "REAL ESTATE" },
};

