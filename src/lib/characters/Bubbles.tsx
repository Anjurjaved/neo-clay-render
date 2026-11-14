// Speech / thought bubble — প্রতিটা এক টুকরার নরম clay (SDF bake: বালিশ-আকৃতির body + লেজ smooth-union)।
// সব সময়-নির্ভর মান prop: pop (0..1+ spring), dots (typing phase, সেকেন্ড), text + textIn (0..1)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "../../kit/Clay";
import { C } from "../../kit/theme";
import { IDB, Op, polygonize } from "./sdf";

const CACHE = new Map<string, THREE.BufferGeometry>();
const bake = (key: string, ops: () => Op[], cell: number) => {
  let g = CACHE.get(key);
  if (!g) {
    g = polygonize(ops(), cell);
    CACHE.set(key, g);
  }
  return g;
};

/** w×h world, tail দিক: "left" | "right" (নিচের কোণে) */
export const speechGeo = (w: number, h: number, tail: "left" | "right" = "left") =>
  bake(
    `sp${w}_${h}_${tail}`,
    () => {
      const sx = tail === "left" ? -1 : 1;
      const d = Math.min(w, h) * 0.17;
      const r = Math.min(w, h) * 0.3;
      const tb: [number, number, number] = [sx * w * 0.22, -h * 0.36, 0];
      const tip: [number, number, number] = [sx * w * 0.36, -h * 0.5 - h * 0.34, 0];
      return [
        { t: "box", c: [0, 0, 0], B: IDB, h: [w / 2 - r, h / 2 - r, 0.001], r: r, op: "u" },
        // pillow depth: intersect with a flattened ellipsoid-ish slab
        { t: "ell", c: [0, 0, 0], B: IDB, r: [w * 0.62, h * 0.72, d], op: "i", k: d * 0.9 },
        { t: "cone", a: tb, b: tip, ra: h * 0.17, rb: h * 0.035, k: h * 0.14 },
        { t: "box", c: [0, 0, 0], B: IDB, h: [w * 2, h * 2, d * 0.9], r: 0, op: "i", k: d * 0.7 },
      ] as Op[];
    },
    Math.min(w, h) / 70
  );

export const thoughtGeo = (w: number, h: number) =>
  bake(
    `th${w}_${h}`,
    () => {
      const d = Math.min(w, h) * 0.2;
      const ops: Op[] = [{ t: "ell", c: [0, 0, 0], B: IDB, r: [w * 0.4, h * 0.36, d] }];
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.2;
        const rr = (0.19 + 0.05 * Math.sin(i * 2.3)) * Math.min(w, h) * 1.05;
        ops.push({ t: "ell", c: [Math.cos(a) * w * 0.36, Math.sin(a) * h * 0.3, 0], B: IDB, r: [rr, rr, d * 0.95], k: Math.min(w, h) * 0.1 });
      }
      return ops;
    },
    Math.min(w, h) / 70
  );
const puffGeo = (r: number) => bake(`pf${r}`, () => [{ t: "ell", c: [0, 0, 0], B: IDB, r: [r, r * 0.92, r * 0.62] }], r / 14);

/** ভেতরের typing dots: তিনটা বিন্দু পরপর লাফায় (phase = সেকেন্ড) */
export const TypingDots: React.FC<{ phase: number; size?: number; color?: string; position?: [number, number, number]; opacity?: number }> = ({ phase, size = 0.06, color = "#8792A2", position, opacity = 1 }) => (
  <group position={position}>
    {[-1, 0, 1].map((i) => {
      const u = (phase * 1.6 - (i + 1) * 0.16) % 1;
      const b = u > 0 && u < 0.4 ? Math.sin((u / 0.4) * Math.PI) : 0;
      return (
        <mesh key={i} position={[i * size * 2.6, b * size * 1.1, 0]} scale={[1, 1 + b * 0.12, 1]}>
          <sphereGeometry args={[size, 28, 20]} />
          <meshPhysicalMaterial color={b > 0.3 ? C.navy : color} roughness={0.4} clearcoat={0.5} transparent={opacity < 1} opacity={opacity} />
        </mesh>
      );
    })}
  </group>
);

const popScale = (pop: number) => {
  const s = Math.max(0, pop);
  return s;
};

export const SpeechBubble: React.FC<{
  w?: number;
  h?: number;
  tail?: "left" | "right";
  color?: string;
  pop?: number; // spring value 0→1 (overshoot allowed)
  jiggle?: number; // non-uniform wobble
  dots?: number | null; // typing phase or null
  text?: string;
  textIn?: number;
  textColor?: string;
  textSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ w = 1.2, h = 0.7, tail = "left", color = C.white, pop = 1, jiggle = 0, dots = null, text, textIn = 1, textColor = C.deepNavy, textSize, position, rotation }) => {
  const g = speechGeo(w, h, tail);
  const s = popScale(pop);
  const d = Math.min(w, h) * 0.17;
  const sx = tail === "left" ? -1 : 1;
  const fs = textSize ?? Math.min(h * 0.3, (w * 0.82) / Math.max(1, (text ?? "").length * 0.58));
  return (
    <group position={position} rotation={rotation as any}>
      {/* origin = tail tip, so the pop grows out of the speaker */}
      <group position={[sx * w * 0.36, -h * 0.84, 0]} scale={[s * (1 + jiggle), s * (1 - jiggle), s]}>
        <group position={[-sx * w * 0.36, h * 0.84, 0]}>
          <mesh geometry={g} castShadow receiveShadow>
            <ClayMat color={color} rough={0.5} bump={0.12} sheen={0.4} />
          </mesh>
          {dots !== null && <TypingDots phase={dots} size={h * 0.075} position={[0, 0, d + 0.02]} opacity={1 - textIn} />}
          {text && textIn > 0 && (
            <group scale={0.6 + 0.4 * textIn} position={[0, (1 - textIn) * -0.05, d + 0.02]}>
              <Txt size={fs} color={textColor} opacity={textIn}>
                {text}
              </Txt>
            </group>
          )}
        </group>
      </group>
    </group>
  );
};

export const ThoughtBubble: React.FC<{
  w?: number;
  h?: number;
  color?: string;
  pop?: number;
  puffs?: number; // 0..1 ছোট puff দুটো ক্রমে আসে
  side?: "left" | "right";
  dots?: number | null;
  text?: string;
  textIn?: number;
  textColor?: string;
  textSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ w = 1.3, h = 0.85, color = C.white, pop = 1, puffs = 1, side = "left", dots = null, text, textIn = 1, textColor = C.deepNavy, textSize, position, rotation }) => {
  const g = thoughtGeo(w, h);
  const sx = side === "left" ? -1 : 1;
  const d = Math.min(w, h) * 0.2;
  const p1 = Math.min(1, puffs * 2),
    p2 = Math.max(0, Math.min(1, puffs * 2 - 1));
  const s = Math.max(0, pop);
  const fs = textSize ?? Math.min(h * 0.36, (w * 0.7) / Math.max(1, (text ?? "").length * 0.6));
  const r1 = Math.min(w, h) * 0.09,
    r2 = Math.min(w, h) * 0.06;
  return (
    <group position={position} rotation={rotation as any}>
      <mesh geometry={puffGeo(r2)} position={[sx * w * 0.42, -h * 0.98, 0]} scale={p1} castShadow>
        <ClayMat color={color} rough={0.5} bump={0.1} />
      </mesh>
      <mesh geometry={puffGeo(r1)} position={[sx * w * 0.3, -h * 0.7, 0]} scale={p2} castShadow>
        <ClayMat color={color} rough={0.5} bump={0.1} />
      </mesh>
      <group scale={s}>
        <mesh geometry={g} castShadow receiveShadow>
          <ClayMat color={color} rough={0.5} bump={0.12} sheen={0.4} />
        </mesh>
        {dots !== null && <TypingDots phase={dots} size={h * 0.07} position={[0, 0, d + 0.03]} opacity={1 - textIn} />}
        {text && textIn > 0 && (
          <group scale={0.6 + 0.4 * textIn} position={[0, 0, d + 0.03]}>
            <Txt size={fs} color={textColor} opacity={textIn}>
              {text}
            </Txt>
          </group>
        )}
      </group>
    </group>
  );
};
