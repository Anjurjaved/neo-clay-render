// scenes_g shared — Cue, Industry, timing helpers, Life wrapper, clipped 3D text, SDF bake
import React, { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { FONT_BOLD, C } from "../../kit/theme";
import { FLOOR, Cam, atScreen, atFloor, worldWidth } from "../../kit/Stage";
import { springStep, wobble, popIn, cubicBezier } from "../../kit/anim";

export type V3 = [number, number, number];
export type P = { position?: V3; rotation?: V3; scale?: number | V3 };
export const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

/** scene-শুরু থেকে সেকেন্ড; না পেলে NaN */
export type Cue = (word: string, after?: number) => number;
export type Industry = "dental" | "restaurant" | "ecommerce" | "school";

/** sample VO word list → Cue (word substring match, start ≥ after) */
export const makeCue =
  (words: [string, number][]): Cue =>
  (w, after = 0) => {
    const hit = words.find(([x, s]) => s >= after - 1e-6 && x.toLowerCase().includes(w.toLowerCase()));
    return hit ? hit[1] : NaN;
  };

/** cue থেকে সময়, না পেলে (বা ক্রম ভাঙলে) fallback; [lo, hi] এ clamp */
export const beat = (cue: Cue, word: string | undefined, fallback: number, after = 0, lo = 0, hi = 1e9) => {
  const v = word ? cue(word, after) : NaN;
  const x = Number.isFinite(v) ? v : fallback;
  return Math.min(hi, Math.max(lo, x));
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const backIn = cubicBezier(0.36, 0, 0.66, -0.56);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const mixHex = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(k)).getHexString();

/** frame-% layout helpers */
export const frameH = (frac: number, z: number, cam: Cam) => worldWidth(frac * (16 / 9), z, cam);
export { atScreen, atFloor, worldWidth, FLOOR };

/** enter (pop/rise/drop) + full exit (shrink/sink/up) — বস্তু শুধু নিজের সময়ে mount */
export const Life: React.FC<{
  t: number;
  a: number;
  b?: number;
  kind?: "pop" | "rise" | "drop";
  exit?: "shrink" | "sink" | "up";
  position: V3;
  scale?: number;
  rotation?: V3;
  outDur?: number;
  children: React.ReactNode;
}> = ({ t, a, b = 999, kind = "pop", exit = "shrink", position, scale = 1, rotation, outDur = 0.38, children }) => {
  if (t < a - 0.02 || t > b + outDur + 0.02) return null;
  let [x, y, z] = position;
  let sx = scale,
    sy = scale,
    sz = scale;
  if (kind === "pop") {
    const p = popIn(t, a, { k: 230, c: 15 });
    sx *= p.s * p.sx;
    sy *= p.s * p.sy;
    sz *= p.s;
  } else if (kind === "rise") {
    const k = springStep(t - a, { k: 120, c: 14 });
    y = y - (1 - k) * 4 * scale;
  } else {
    const k = springStep(t - a, { k: 150, c: 12 });
    y = y + (1 - k) * 6;
    const sq = 1 + wobble(t - a - 0.18, 0.12, 3, 0.25);
    sy *= sq;
    sx /= Math.sqrt(sq);
    sz /= Math.sqrt(sq);
  }
  if (t > b) {
    const e = Math.min(1, (t - b) / outDur);
    if (exit === "shrink") {
      const s = Math.max(0, 1 - backIn(e));
      sx *= s;
      sy *= s;
      sz *= s;
    } else if (exit === "sink") {
      y -= e * e * 5 * scale;
    } else {
      y += e * e * 8;
      const s = 1 - e;
      sx *= s;
      sy *= s;
      sz *= s;
    }
  }
  return (
    <group position={[x, y, z]} scale={[Math.max(1e-4, sx), Math.max(1e-4, sy), Math.max(1e-4, sz)]} rotation={rotation as any}>
      {children}
    </group>
  );
};

/** 3D লেখা (English/সংখ্যা) — kit Txt-এর মতো render-sync, সাথে clipRect (ভাঙা card-এর অর্ধেকে লেখা কাটার জন্য) */
export const Txt3: React.FC<{
  children: string;
  size?: number;
  color?: string;
  position?: V3;
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "middle" | "bottom";
  maxWidth?: number;
  opacity?: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  clipRect?: [number, number, number, number];
  letterSpacing?: number;
}> = ({ children, size = 0.3, color = C.text, position, anchorX = "center", anchorY = "middle", maxWidth, opacity = 1, lineHeight = 1.08, textAlign = "center", clipRect, letterSpacing = 0 }) => {
  const hRef = React.useRef<number | null>(null);
  const advance = useThree((st) => st.advance);
  const release = () => {
    if (hRef.current !== null) {
      continueRender(hRef.current);
      hRef.current = null;
    }
  };
  React.useLayoutEffect(() => {
    hRef.current = delayRender("txt3-sync");
    const to = setTimeout(() => release(), 6000);
    return () => {
      clearTimeout(to);
      release();
    };
  }, [children]);
  return (
    <Text
      font={staticFile(FONT_BOLD)}
      fontSize={size}
      color={color}
      position={position}
      anchorX={anchorX}
      anchorY={anchorY}
      maxWidth={maxWidth}
      lineHeight={lineHeight}
      textAlign={textAlign}
      fillOpacity={opacity}
      clipRect={clipRect}
      letterSpacing={letterSpacing}
      onSync={() => {
        advance(performance.now());
        requestAnimationFrame(() => release());
      }}
    >
      {children}
    </Text>
  );
};

/** লেখা box-এ ধরানোর font size: লাইন সংখ্যা ≤ maxLines, উচ্চতা ≤ boxH (Inter 800 uppercase ≈ 0.66 em/char) */
export const fitText = (text: string, boxW: number, boxH: number, maxLines = 3, maxSize = 0.5) => {
  const n = Math.max(4, text.length);
  let best = 0.08;
  for (let lines = 1; lines <= maxLines; lines++) {
    const s = Math.min(maxSize, (boxW * lines * 0.9) / (n * 0.66), boxH / (lines * 1.12));
    // শব্দ ভাঙার অপচয় ধরে নিয়ে — এক লাইনের বেশি হলে একটু ছোট
    const s2 = lines === 1 ? s : s * 0.94;
    if (s2 > best) best = s2;
  }
  return best;
};

/** polished clay — নরম sheen + হালকা clearcoat */
export const Gloss: React.FC<{ color: string; rough?: number; coat?: number; side?: THREE.Side; opacity?: number }> = ({ color, rough = 0.42, coat = 0.5, side, opacity = 1 }) => (
  <meshPhysicalMaterial
    color={color}
    roughness={rough}
    clearcoat={coat}
    clearcoatRoughness={0.3}
    sheen={0.35}
    sheenColor="#ffe2c4"
    sheenRoughness={0.8}
    side={side}
    transparent={opacity < 1}
    opacity={opacity}
  />
);

// ---------------- SDF bake (এক টুকরার জৈব আকৃতি) ----------------
export type SDF = (x: number, y: number, z: number) => number;
const clampN = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const smin = (a: number, b: number, k: number) => {
  const h = clampN(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
};
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
export const sdEllipsoid = (x: number, y: number, z: number, a: number, b: number, c: number) => {
  const k0 = Math.hypot(x / a, y / b, z / c);
  const k1 = Math.hypot(x / (a * a), y / (b * b), z / (c * c));
  return k1 === 0 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
};
export const sdCapsule = (p: V3, a: V3, b: V3, ra: number, rb = ra) => {
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const pa = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const h = clampN((pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / (ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2), 0, 1);
  return Math.hypot(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - (ra + (rb - ra) * h);
};
const BAKED = new Map<string, THREE.BufferGeometry>();
export const bakeSDF = (key: string, sdf: SDF, center: V3, extent: number, res = 96) => {
  const hit = BAKED.get(key);
  if (hit) return hit;
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 400000) as any;
  mc.isolation = 0;
  const n: number = mc.size,
    hs: number = mc.halfsize,
    field: Float32Array = mc.field;
  const K = 100 / extent;
  for (let z = 0; z < n; z++) {
    const wz = center[2] + ((z - hs) / hs) * extent;
    for (let y = 0; y < n; y++) {
      const wy = center[1] + ((y - hs) / hs) * extent;
      const row = z * n * n + y * n;
      for (let x = 0; x < n; x++) field[row + x] = -sdf(center[0] + ((x - hs) / hs) * extent, wy, wz) * K;
    }
  }
  mc.update();
  const cnt: number = mc.count;
  const pos = new Float32Array(cnt * 3),
    nor = new Float32Array(cnt * 3),
    uv = new Float32Array(cnt * 2);
  const Pp: Float32Array = mc.positionArray,
    Nn: Float32Array = mc.normalArray;
  for (let i = 0; i < cnt; i++) {
    const o = i * 3;
    pos[o] = center[0] + Pp[o] * extent;
    pos[o + 1] = center[1] + Pp[o + 1] * extent;
    pos[o + 2] = center[2] + Pp[o + 2] * extent;
    const l = Math.hypot(Nn[o], Nn[o + 1], Nn[o + 2]) || 1;
    nor[o] = Nn[o] / l;
    nor[o + 1] = Nn[o + 1] / l;
    nor[o + 2] = Nn[o + 2] / l;
    uv[i * 2] = (pos[o] + pos[o + 2]) * 1.5;
    uv[i * 2 + 1] = pos[o + 1] * 1.5;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.computeBoundingSphere();
  mc.geometry.dispose();
  BAKED.set(key, g);
  return g;
};
export const useBaked = (key: string, sdf: SDF, center: V3, extent: number, res = 96) => useMemo(() => bakeSDF(key, sdf, center, extent, res), [key]);
