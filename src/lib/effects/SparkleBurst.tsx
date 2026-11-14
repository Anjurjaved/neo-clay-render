// SparkleBurst — কয়েকটা নরম bevelled ৪-কোণা তারা (concave বাহু) + ছোট আলোর বিন্দু; প্রতিটা নিজের seeded সময়ে
// ফুটে ওঠে (spring overshoot + ঘোরা) আর গলে যায়। emissive সামান্য bloom threshold পার করে → নরম আভা, sprite spam নয়।
import React, { useMemo } from "react";
import * as THREE from "three";
import { shapeGeo } from "../../kit/Geo";
import { springStep, smoothstep } from "../../kit/anim";
import { seeded, between } from "./rand";

/** ৪-কোণা তারা: বাহুগুলো quadratic curve দিয়ে ভেতরে বাঁকা (glint আকৃতি), ব্যাস ≈ 1 */
export const starShape = (pinch = 0.16) => {
  const s = new THREE.Shape();
  const R = 0.5;
  s.moveTo(0, R);
  for (let i = 1; i <= 4; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 2;
    const m = a - Math.PI / 4;
    s.quadraticCurveTo(Math.cos(m) * pinch, Math.sin(m) * pinch, Math.cos(a) * R, Math.sin(a) * R);
  }
  return s;
};

type Spark = { pos: [number, number, number]; at: number; life: number; s: number; spin: number; warm: number };
type Dot = { dir: THREE.Vector3; at: number; life: number; s: number; dist: number };

/**
 * <SparkleBurst t at origin radius /> — origin ঘিরে (radius-এর খোলসে, ক্যামেরার দিকে সামান্য সামনে) তারা ফোটে।
 * duration = কত সময় ধরে নতুন তারা ফুটবে; count ছোট (6–12) রাখুন।
 */
export const SparkleBurst: React.FC<{
  t: number;
  at: number;
  origin?: [number, number, number];
  radius?: number;
  count?: number;
  dots?: number;
  duration?: number;
  seed?: number;
  size?: number;
  color?: string;
  warmColor?: string;
  intensity?: number;
}> = ({ t, at, origin = [0, 0, 0], radius = 1.4, count = 9, dots = 14, duration = 1.4, seed = 5, size = 1, color = "#FFF6EA", warmColor = "#FFC98E", intensity = 2.0 }) => {
  const geo = useMemo(() => {
    const g = shapeGeo(starShape(0.13), 0.02, 0.018, 3);
    g.center();
    return g;
  }, []);
  const sparks = useMemo(
    () =>
      seeded(seed, count, (r, i): Spark => {
        // খোলসের উপর সমান ছড়ানো কোণ (golden angle) — জটলা নয়
        const a = i * 2.39996 + r() * 0.5;
        const rr = radius * between(r, 0.72, 1.08);
        return {
          pos: [Math.cos(a) * rr, Math.sin(a) * rr * 0.92 + radius * 0.1, between(r, 0.2, 0.6) * radius],
          at: (i / Math.max(1, count - 1)) * duration * 0.7 + r() * 0.12,
          life: between(r, 0.55, 0.85),
          s: between(r, 0.18, 0.36) * size * (i % 3 === 0 ? 1.35 : 1),
          spin: between(r, -1.4, 1.4),
          warm: r(),
        };
      }),
    [seed, count, radius, duration, size]
  );
  const dotList = useMemo(
    () =>
      seeded(seed + 101, dots, (r): Dot => {
        const a = r() * Math.PI * 2;
        return {
          dir: new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.9 + 0.15, between(r, 0.1, 0.5)).normalize(),
          at: r() * duration * 0.8,
          life: between(r, 0.6, 1.0),
          s: between(r, 0.022, 0.04) * size,
          dist: radius * between(r, 0.5, 1.25),
        };
      }),
    [seed, dots, radius, duration, size]
  );
  const mats = useMemo(() => {
    const mk = (c: string) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: intensity, roughness: 0.3, toneMapped: false });
    return [mk(color), mk(warmColor)];
  }, [color, warmColor, intensity]);
  if (t < at) return null;
  const u = t - at;
  return (
    <group position={origin}>
      {sparks.map((s, i) => {
        const v = u - s.at;
        if (v <= 0 || v > s.life) return null;
        // ফোটা: spring overshoot; গলা: শেষ 45%-এ মসৃণ ছোট হওয়া
        const grow = springStep(v, { k: 320, c: 16 });
        const fade = 1 - smoothstep(s.life * 0.45, s.life, v);
        const sc = s.s * grow * fade;
        if (sc < 0.002) return null;
        return <mesh key={i} geometry={geo} material={mats[s.warm < 0.35 ? 1 : 0]} position={s.pos} rotation={[0, 0, s.spin * v + (i % 2) * 0.4]} scale={[sc, sc, sc * 0.6]} />;
      })}
      {dotList.map((d, i) => {
        const v = u - d.at;
        if (v <= 0 || v > d.life) return null;
        const k = v / d.life;
        const r = d.dist * (0.55 + 0.45 * (1 - Math.pow(1 - k, 3)));
        const sc = d.s * Math.sin(Math.PI * Math.min(1, k * 1.15));
        if (sc < 0.002) return null;
        return (
          <mesh key={"d" + i} material={mats[i % 3 === 0 ? 1 : 0]} position={[d.dir.x * r, d.dir.y * r, d.dir.z * r]} scale={sc}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        );
      })}
    </group>
  );
};
