// scenes_b props — ঝোলানো price tag (সুতা + grommet + pendulum দোলা), flip desk calendar, odometer counter
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, Txt } from "../../kit/Clay";
import { frameGeo, roundedCylGeo, shapeGeo, slabGeo } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { G, P } from "./common";

// ---------------- Hanging price tag ----------------
/** উপরের দুই কোণ কাটা tag (উপরে ফুটো) — কেন্দ্র (0,0), h উচ্চতা */
const tagShape = (w: number, h: number) => {
  const r = 0.14,
    n = w * 0.26,
    s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(w / 2, h / 2 - n);
  s.quadraticCurveTo(w / 2, h / 2 - n * 0.72, w / 2 - n * 0.3, h / 2 - n * 0.55);
  s.lineTo(w * 0.12, h / 2 - 0.02);
  s.quadraticCurveTo(0, h / 2 + 0.03, -w * 0.12, h / 2 - 0.02);
  s.lineTo(-w / 2 + n * 0.3, h / 2 - n * 0.55);
  s.quadraticCurveTo(-w / 2, h / 2 - n * 0.72, -w / 2, h / 2 - n);
  s.lineTo(-w / 2, -h / 2 + r);
  s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5, false);
  const hole = new THREE.Path();
  hole.absarc(0, h / 2 - 0.2, 0.075, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
};
export const TAG = { w: 2.15, h: 1.55, string: 3.6 };
/** pivot (group origin) = সুতার উপরের মাথা; tag ঝোলে নিচে। swing = দোলার কোণ (rad) */
export const HangTag: React.FC<P & { top: string; line1: string; line2?: string; swing?: number; twist?: number; color?: string; ink?: string; stringLen?: number }> = ({
  top,
  line1,
  line2,
  swing = 0,
  twist = 0,
  color = C.orange,
  ink = "#ffffff",
  stringLen = TAG.string,
  ...p
}) => {
  const { w, h } = TAG;
  const g = useMemo(() => {
    const geo = shapeGeo(tagShape(w, h), 0.12, 0.07, 7);
    geo.translate(0, 0, -0.06);
    return geo;
  }, []);
  const ring = useMemo(() => new THREE.TorusGeometry(0.085, 0.022, 14, 40), []);
  const str = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.0, -stringLen * 0.5, 0.01), new THREE.Vector3(0, -stringLen + 0.02, 0)]);
    return new THREE.TubeGeometry(c, 24, 0.014, 8, false);
  }, [stringLen]);
  const holeY = h / 2 - 0.2;
  const big = line2 ? 0.36 : 0.44;
  return (
    <G {...p}>
      <group rotation={[0, twist, swing]}>
        <mesh geometry={str} castShadow>
          <ClayMat color="#F3E9DC" rough={0.7} />
        </mesh>
        <group position={[0, -stringLen - holeY, 0]}>
          <mesh geometry={g} castShadow receiveShadow>
            <meshPhysicalMaterial color={color} roughness={0.46} clearcoat={0.35} clearcoatRoughness={0.35} sheen={0.4} sheenColor="#ffe0c0" />
          </mesh>
          {[0.075, -0.075].map((z) => (
            <mesh key={z} geometry={ring} position={[0, holeY, z]}>
              <SilverMat color="#e2e5e9" rough={0.3} />
            </mesh>
          ))}
          <Txt size={0.2} color={ink} position={[0, holeY - 0.34, 0.15]} letterSpacing={0.12} opacity={0.92}>
            {top}
          </Txt>
          <Txt size={big} color={ink} position={[0, line2 ? -0.06 : -0.22, 0.15]}>
            {line1}
          </Txt>
          {line2 && (
            <Txt size={big} color={ink} position={[0, -0.47, 0.15]}>
              {line2}
            </Txt>
          )}
        </group>
      </group>
    </G>
  );
};

// ---------------- Desk calendar (flip) ----------------
export const CAL = { w: 1.7, h: 1.85 };
/** n = দেখানো সংখ্যা (float — ভগ্নাংশ = পাতা উল্টানো চলছে)। পাতা উপরের binding ঘুরে পিছনে যায়, header ঢাকে না */
export const DeskCalendar: React.FC<P & { n: number; top: string; header?: string; unit?: string }> = ({ n, top, header = C.navy, unit, ...p }) => {
  const { w, h } = CAL;
  const body = useMemo(() => slabGeo(w, h, 0.34, 0.24, 0.13, 8), []);
  const head = useMemo(() => slabGeo(w * 0.995, h * 0.27, 0.36, 0.22, 0.13, 8), []);
  const page = useMemo(() => slabGeo(w * 0.84, h * 0.56, 0.035, 0.1, 0.014, 3), []);
  const ring = useMemo(() => new THREE.TorusGeometry(0.075, 0.026, 14, 36), []);
  const cur = Math.floor(n + 1e-6);
  const frac = n - cur;
  const flipping = frac > 0.001;
  const a = flipping ? -Math.PI * (1 - Math.pow(1 - frac, 2)) : 0;
  const ph = h * 0.56;
  const pivotY = h * 0.13;
  const num = (v: number) => String(Math.max(0, v));
  const fs = (s: string) => (s.length >= 3 ? 0.5 : 0.66);
  return (
    <G {...p}>
      <mesh geometry={body} castShadow receiveShadow>
        <ClayMat color="#F7F2EC" />
      </mesh>
      <mesh geometry={head} position={[0, h * 0.365, 0.01]} castShadow>
        <ClayMat color={header} rough={0.55} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={ring} position={[w * 0.27 * s, h * 0.5, 0.05]} rotation={[0, Math.PI / 2, 0]}>
          <SilverMat color="#dfe2e6" rough={0.3} />
        </mesh>
      ))}
      <Txt size={0.2} color="#ffffff" position={[0, h * 0.365, 0.2]} letterSpacing={0.1}>
        {top}
      </Txt>
      {/* নিচের (পরের) পাতা */}
      <mesh geometry={page} position={[0, pivotY - ph / 2, 0.19]}>
        <ClayMat color="#FCFAF6" rough={0.7} />
      </mesh>
      <Txt size={fs(num(flipping ? cur + 1 : cur))} color={C.deepNavy} position={[0, pivotY - ph / 2 + (unit ? 0.08 : 0), 0.215]}>
        {num(flipping ? cur + 1 : cur)}
      </Txt>
      {unit && (
        <Txt size={0.15} color={C.steel} position={[0, pivotY - ph + 0.13, 0.215]} letterSpacing={0.1}>
          {unit}
        </Txt>
      )}
      {/* উল্টানো পাতা */}
      {flipping && a > -Math.PI * 0.92 && (
        <group position={[0, pivotY, 0.235]} rotation={[a, 0, 0]}>
          <mesh geometry={page} position={[0, -ph / 2, 0]}>
            <ClayMat color="#FCFAF6" rough={0.7} />
          </mesh>
          {a > -Math.PI / 2 && (
            <Txt size={fs(num(cur))} color={C.deepNavy} position={[0, -ph / 2 + (unit ? 0.08 : 0), 0.025]}>
              {num(cur)}
            </Txt>
          )}
        </group>
      )}
    </G>
  );
};

// ---------------- Odometer counter ----------------
const WHEEL = { r: 1.08, w: 0.6, pitch: 0.7 };
/** একটা digit wheel — pos = digit position (float, 0..10 ঘোরে); x-অক্ষে ঘোরে, পরের সংখ্যা নিচ থেকে ওঠে */
const Wheel: React.FC<P & { pos: number; color?: string; ink?: string; size?: number }> = ({ pos, color = "#FBF8F3", ink = C.deepNavy, size = 0.6, ...p }) => {
  const g = useMemo(() => roundedCylGeo(WHEEL.r, WHEEL.w, 0.07, 96), []);
  const step = (Math.PI * 2) / 10;
  return (
    <G {...p}>
      <group rotation={[-pos * step, 0, 0]}>
        <mesh geometry={g} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <ClayMat color={color} rough={0.6} />
        </mesh>
        {Array.from({ length: 10 }).map((_, d) => (
          <group key={d} rotation={[d * step, 0, 0]}>
            <Txt size={size} color={ink} position={[0, -0.02, WHEEL.r + 0.004]}>
              {String(d)}
            </Txt>
          </group>
        ))}
      </group>
    </G>
  );
};

/** digit-এর সংখ্যা ও কমা-অবস্থান থেকে layout */
export const odoLayout = (value: number) => {
  const s = Math.round(value).toString();
  const n = s.length;
  const items: { kind: "d" | ","; x: number; i?: number }[] = [];
  let x = 0;
  for (let k = 0; k < n; k++) {
    if (k > 0 && (n - k) % 3 === 0) {
      items.push({ kind: ",", x: x - WHEEL.pitch / 2 + 0.11 });
      x += 0.22;
    }
    items.push({ kind: "d", x, i: n - 1 - k });
    x += WHEEL.pitch;
  }
  const width = x - WHEEL.pitch + WHEEL.w;
  return { s, n, items, width };
};

/**
 * Odometer: নরম clay housing-এর জানালায় digit wheel। spin[i] = 0..~1 (spring) — wheel i (ডান থেকে, 0 = একক) ঘুরে নিজের digit-এ থামে,
 * নিচের ঘরের wheel বেশি পাক খায়। suffix (যেমন "+", "%") housing-এর ডানে।
 */
export const Odometer: React.FC<P & { value: number; spin: number[]; suffix?: string; prefix?: string; accent?: string }> = ({ value, spin, suffix, prefix, accent = C.orange, ...p }) => {
  const L = odoLayout(value);
  const sufW = suffix ? 0.62 * Math.max(1, suffix.length) : 0;
  const preW = prefix ? 0.3 * prefix.length + 0.25 : 0;
  const winW = L.width + 0.26;
  const W = winW + 0.6 + sufW + preW;
  const H = WHEEL.r * 2 + 0.55;
  const frame = useMemo(
    () => frameGeo({ w: W, h: H, depth: 0.5, r: 0.42, doorW: winW, doorH: 0.92, doorR: 0.16, doorCy: 0, bevel: 0.12 }),
    [W, winW]
  );
  const back = useMemo(() => slabGeo(winW + 0.2, H - 0.2, 0.12, 0.2, 0.05, 4), [winW]);
  const x0 = -W / 2 + 0.3 + preW + 0.13 + WHEEL.w / 2; // প্রথম wheel-এর কেন্দ্র
  return (
    <G {...p}>
      {/* জানালার পিছনের গাঢ় plate */}
      <mesh geometry={back} position={[x0 - WHEEL.w / 2 - 0.13 + winW / 2, 0, -WHEEL.r - 0.15]}>
        <ClayMat color="#1E3350" rough={0.6} />
      </mesh>
      {L.items.map((it, k) =>
        it.kind === "d" ? (
          <Wheel key={k} position={[x0 + it.x, 0, -WHEEL.r + 0.2]} pos={(spin[it.i!] ?? 0) * (Number(L.s[L.n - 1 - it.i!]) + 10 * (L.n - it.i!))} />
        ) : (
          <Txt key={k} size={0.62} color="#F4EEE6" position={[x0 + it.x, -0.2, 0.2]}>
            ,
          </Txt>
        )
      )}
      <mesh geometry={frame} position={[0, 0, 0.0]} castShadow receiveShadow>
        <ClayMat color="#F4EEE6" rough={0.62} />
      </mesh>
      {prefix && (
        <Txt size={0.3} color={C.navy} position={[-W / 2 + 0.3 + preW / 2, 0, 0.27]}>
          {prefix}
        </Txt>
      )}
      {suffix && (
        <Txt size={0.72} color={accent} position={[W / 2 - 0.3 - sufW / 2 + 0.04, 0.0, 0.27]}>
          {suffix}
        </Txt>
      )}
    </G>
  );
};
export const odoWidth = (value: number, suffix?: string, prefix?: string) => {
  const L = odoLayout(value);
  return L.width + 0.26 + 0.6 + (suffix ? 0.62 * Math.max(1, suffix.length) : 0) + (prefix ? 0.3 * prefix.length + 0.25 : 0);
};
