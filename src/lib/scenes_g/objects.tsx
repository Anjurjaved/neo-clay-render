// scenes_g objects — speech bubble (এক টুকরা, লেজসহ), ?→✓ badge, point chip, myth card (ফাটে/ভাঙে), fact card, stat card,
// pedestal আর industry-র চেনা বস্তু (molar, cloche-plate, shopping bag + parcel, graduation cap + book)
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat } from "../../kit/Clay";
import { slabGeo, pillGeo, latheGeo, roundedCylGeo, shapeGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar, CheckBadge } from "../../kit/Soft";
import { C } from "../../kit/theme";
import { G, P, V3, Txt3, fitText, Gloss, useBaked, smin, smax, sdEllipsoid, sdCapsule, clamp01, Industry, mixHex } from "./common";

const PI = Math.PI;

// ======================= Speech bubble =======================
/** rounded rect + লেজ এক outline-এ (জোড়া নেই)। tail: base-এর কেন্দ্র x (bubble-local), tip = লেজের ডগা */
const bubbleShape = (w: number, h: number, r: number, tx: number, base: number, tip: [number, number]) => {
  const s = new THREE.Shape();
  const x0 = -w / 2,
    y0 = -h / 2;
  r = Math.min(r, h / 2, w / 2);
  const bl = Math.max(x0 + r, tx - base / 2),
    br = Math.min(w / 2 - r, tx + base / 2);
  s.moveTo(br, y0);
  s.lineTo(w / 2 - r, y0);
  s.absarc(w / 2 - r, y0 + r, r, -PI / 2, 0, false);
  s.lineTo(w / 2, h / 2 - r);
  s.absarc(w / 2 - r, h / 2 - r, r, 0, PI / 2, false);
  s.lineTo(x0 + r, h / 2);
  s.absarc(x0 + r, h / 2 - r, r, PI / 2, PI, false);
  s.lineTo(x0, y0 + r);
  s.absarc(x0 + r, y0 + r, r, PI, PI * 1.5, false);
  s.lineTo(bl, y0);
  // লেজ: নরম বাঁকা — base থেকে ডগা, আবার base-এ
  const dy = tip[1] - y0;
  s.bezierCurveTo(bl + (tip[0] - bl) * 0.15, y0 + dy * 0.45, tip[0] - (tip[0] - bl) * 0.25, tip[1] + 0.02, tip[0], tip[1]);
  s.bezierCurveTo(tip[0] + (br - tip[0]) * 0.05, tip[1] - dy * 0.15, br - (br - tip[0]) * 0.2, y0 + dy * 0.55, br, y0);
  return s;
};

export type BubbleTail = { x: number; base?: number; tip: [number, number] };
/** পুরু নরম speech bubble — w×h, d পুরু; children সামনের তলে (z = d/2) */
export const SpeechBubble: React.FC<P & { w: number; h: number; d?: number; color?: string; tail: BubbleTail; children?: React.ReactNode; gloss?: boolean }> = ({
  w,
  h,
  d = 0.34,
  color = "#FBF8F3",
  tail,
  children,
  gloss = false,
  ...p
}) => {
  const b = Math.min(0.13, d * 0.42);
  const geo = useMemo(() => {
    const r = Math.min(h * 0.42, 0.62);
    const s = bubbleShape(w - b * 2, h - b * 2, r - b, tail.x, (tail.base ?? h * 0.42) - b, [tail.tip[0], tail.tip[1] + b * 0.6]);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 8, curveSegments: 40 });
    g.translate(0, 0, -(d - b * 2) / 2);
    g.computeVertexNormals();
    return g;
  }, [w, h, d, tail.x, tail.base, tail.tip[0], tail.tip[1]]);
  return (
    <G {...p}>
      <mesh geometry={geo} castShadow receiveShadow>
        {gloss ? <Gloss color={color} rough={0.5} coat={0.35} /> : <ClayMat color={color} rough={0.66} />}
      </mesh>
      <group position={[0, 0, d / 2]}>{children}</group>
    </G>
  );
};

// ======================= ? → ✓ badge (lens dome, উল্টে যায়) =======================
const lensGeo = () =>
  latheGeo(
    [
      [0.0, -0.17],
      [0.3, -0.15],
      [0.45, -0.09],
      [0.5, 0.0],
      [0.45, 0.09],
      [0.3, 0.15],
      [0.0, 0.17],
    ],
    64,
    72
  );
const tickGeo = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.2, 0.0);
  s.lineTo(-0.07, -0.13);
  s.lineTo(0.21, 0.15);
  s.lineTo(0.16, 0.2);
  s.lineTo(-0.07, -0.03);
  s.lineTo(-0.15, -0.05);
  s.closePath();
  return shapeGeo(s, 0.03, 0.018, 3);
};
/** ব্যাস 1। flip 0 = কমলা "?", 1 = সবুজ tick (y-অক্ষে উল্টে) */
export const AskBadge: React.FC<P & { flip: number; color?: string; done?: string }> = ({ flip, color = C.orange, done = C.green, ...p }) => {
  const lens = useMemo(lensGeo, []);
  const tk = useMemo(tickGeo, []);
  const f = clamp01(flip);
  const col = mixHex(color, done, f > 0.5 ? 1 : 0);
  return (
    <G {...p}>
      <group rotation={[0, f * PI, 0]}>
        <mesh geometry={lens} rotation={[PI / 2, 0, 0]} castShadow>
          <meshPhysicalMaterial color={col} roughness={0.36} clearcoat={0.75} clearcoatRoughness={0.22} sheen={0.3} sheenColor="#ffe2c4" />
        </mesh>
        {f < 0.5 && <Txt3 size={0.56} color="#ffffff" position={[0.01, 0.0, 0.175]}>?</Txt3>}
        {f >= 0.5 && <mesh geometry={tk} position={[0, 0, -0.17]} rotation={[0, PI, 0]} scale={[1.25, 1.25, 1]}><meshStandardMaterial color="#ffffff" roughness={0.35} /></mesh>}
      </group>
    </G>
  );
};

const Socket: React.FC<{ r: number }> = ({ r }) => {
  const g = useMemo(() => roundedCylGeo(r, 0.05, 0.02, 64), [r]);
  return (
    <mesh geometry={g} rotation={[PI / 2, 0, 0]} position={[0, 0, -0.015]}>
      <ClayMat color="#E6DDD0" rough={0.8} bump={0.1} />
    </mesh>
  );
};

// ======================= point chip (tick সহ) =======================
/** w×h নরম chip; বাম দিকে check badge (check 0..1), লেখা বামে-সাজানো */
export const PointChip: React.FC<P & { text: string; check: number; w?: number; h?: number; color?: string; ink?: string; tick?: string }> = ({
  text,
  check,
  w = 4.2,
  h = 0.92,
  color = "#FBF8F3",
  ink = C.deepNavy,
  tick = C.green,
  ...p
}) => {
  const tw = w - h * 1.25;
  const fs = fitText(text, tw, h * 0.7, 2, 0.34);
  return (
    <SoftPanel w={w} h={h} thick={h * 0.34} color={color} {...p}>
      <group position={[-w / 2 + h * 0.55, 0, 0.0]}>
        <Socket r={h * 0.34} />
        {check > 0.001 && <CheckBadge color={tick} scale={h * 0.66 * check} position={[0, 0, 0.0]} />}
      </group>
      <Txt3 size={fs} color={ink} anchorX="left" textAlign="left" maxWidth={tw} position={[-w / 2 + h * 1.05, 0, 0.03]}>
        {text}
      </Txt3>
    </SoftPanel>
  );
};

// ======================= Myth card (whole → crack → two halves) =======================
export const MYTH = { w: 4.6, h: 2.5, d: 0.44, r: 0.5 };
const ZIG: [number, number][] = [
  [0.16, 1],
  [-0.1, 0.62],
  [0.18, 0.22],
  [-0.14, -0.16],
  [0.12, -0.56],
  [-0.06, -1],
];
const zigPts = (h: number, shift = 0) => ZIG.map(([x, y]) => [x + shift, (y * h) / 2] as [number, number]);
const halfShape = (side: -1 | 1, w: number, h: number, r: number, shift: number) => {
  const s = new THREE.Shape();
  const z = zigPts(h, shift);
  if (side < 0) {
    s.moveTo(z[0][0], h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.absarc(-w / 2 + r, h / 2 - r, r, PI / 2, PI, false);
    s.lineTo(-w / 2, -h / 2 + r);
    s.absarc(-w / 2 + r, -h / 2 + r, r, PI, PI * 1.5, false);
    for (let i = z.length - 1; i >= 0; i--) s.lineTo(z[i][0], z[i][1]);
  } else {
    s.moveTo(z[z.length - 1][0], -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.absarc(w / 2 - r, -h / 2 + r, r, -PI / 2, 0, false);
    s.lineTo(w / 2, h / 2 - r);
    s.absarc(w / 2 - r, h / 2 - r, r, 0, PI / 2, false);
    for (let i = 0; i < z.length; i++) s.lineTo(z[i][0], z[i][1]);
  }
  return s;
};

export type MythCardProps = P & {
  text: string;
  crack: number; // 0..1 ফাটল রেখা বাড়ে
  split: number; // 0 = জোড়া; >0 = সেকেন্ড (ভাঙার পর থেকে) — অর্ধেক দুটো পড়ে যায়
  stamp: number; // 0..1 MYTH stamp বসা (spring)
  label?: string;
  color?: string;
};
/** belief card — বড় লেখা + লাল MYTH stamp; crack রেখা গজায়, তারপর দুই টুকরা ঘুরে পড়ে যায় (shards সহ) */
export const MythCard: React.FC<MythCardProps> = ({ text, crack, split, stamp, label = "MYTH", color = "#F4EEE6", ...p }) => {
  const { w, h, d, r } = MYTH;
  const b = 0.16;
  const whole = useMemo(() => slabGeo(w, h, d, r, b, 8), []);
  const halves = useMemo(
    () =>
      ([-1, 1] as const).map((sd) => {
        const g = new THREE.ExtrudeGeometry(halfShape(sd, w - b * 2, h - b * 2, r - b, sd * 0.05), {
          depth: d - b * 2,
          bevelEnabled: true,
          bevelThickness: b,
          bevelSize: b * 0.8,
          bevelSegments: 6,
          curveSegments: 24,
        });
        g.translate(0, 0, -(d - b * 2) / 2);
        g.computeVertexNormals();
        return g;
      }),
    []
  );
  const crackGeo = useMemo(() => {
    const pts = zigPts(h - 0.1).map(([x, y]) => new THREE.Vector3(x, y, 0));
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.02);
    return new THREE.TubeGeometry(curve, 120, 0.035, 8, false);
  }, []);
  if (crackGeo.index) crackGeo.setDrawRange(0, Math.floor(crackGeo.index.count * clamp01(crack) / 6) * 6);

  const fs = fitText(text, w * 0.82, h * 0.52, 3, 0.42);
  const ink = "#3B2A26";
  const textY = -0.12;
  const stampEl = stamp > 0.001 && (
    <group position={[-w / 2 + 1.05, h / 2 - 0.12, d / 2 + 0.06]} rotation={[0, 0, 0.1]} scale={Math.max(0.001, 1.9 - 0.9 * stamp)}>
      <Stamp label={label} opacity={clamp01(stamp * 3)} />
    </group>
  );

  if (split <= 0) {
    return (
      <G {...p}>
        <mesh geometry={whole} castShadow receiveShadow>
          <ClayMat color={color} rough={0.66} />
        </mesh>
        <Txt3 size={fs} color={ink} maxWidth={w * 0.84} position={[0, textY, d / 2 + 0.02]}>
          {text}
        </Txt3>
        {crack > 0.001 && (
          <mesh geometry={crackGeo} position={[0, 0, d / 2 + 0.005]}>
            <meshStandardMaterial color="#3a2420" roughness={0.9} />
          </mesh>
        )}
        {stampEl}
      </G>
    );
  }
  // ভাঙার পর: প্রতিটা অর্ধেক নিজের pivot (নিচের কোণ) ঘিরে ঘোরে আর মাধ্যাকর্ষণে পড়ে
  const u = split;
  const fall = (sd: -1 | 1) => {
    const vx = sd * 1.5,
      vy = 1.3,
      g = 9.5;
    const x = vx * u + sd * 0.06;
    const y = vy * u - 0.5 * g * u * u;
    const rz = sd * -(1.1 * u + 0.6 * u * u);
    const ry = sd * 0.5 * u;
    const s = Math.max(0, 1 - Math.max(0, u - 0.35) * 1.6);
    return { x, y, rz, ry, s };
  };
  return (
    <G {...p}>
      {([-1, 1] as const).map((sd, i) => {
        const f = fall(sd);
        if (f.s <= 0.001) return null;
        return (
          <group key={sd} position={[f.x, f.y, 0]} rotation={[0, f.ry, f.rz]} scale={f.s}>
            <mesh geometry={halves[i]} castShadow receiveShadow>
              <ClayMat color={color} rough={0.66} />
            </mesh>
            <Txt3 size={fs} color={ink} maxWidth={w * 0.84} position={[0, textY, d / 2 + 0.02]} clipRect={sd < 0 ? [-10, -10, 0.0, 10] : [0.0, -10, 10, 10]}>
              {text}
            </Txt3>
            {sd < 0 && stampEl}
          </group>
        );
      })}
      <Shards u={u} />
    </G>
  );
};

/** ফাটল থেকে ছিটকে পড়া ছোট নরম টুকরা */
const SHARDS = [
  [0.1, 0.9, -1.2, 2.4, 0.16],
  [-0.05, 0.4, 1.4, 2.0, 0.12],
  [0.15, 0.0, -1.6, 1.6, 0.14],
  [-0.1, -0.4, 1.7, 1.9, 0.11],
  [0.05, -0.8, -1.0, 2.6, 0.13],
  [0.0, 0.6, 0.6, 3.0, 0.09],
  [0.08, -0.2, -0.5, 3.2, 0.1],
];
const Shards: React.FC<{ u: number }> = ({ u }) => {
  const geo = useMemo(() => slabGeo(1, 0.8, 0.6, 0.22, 0.18, 4), []);
  if (u > 1.1) return null;
  return (
    <>
      {SHARDS.map(([x0, y0, vx, vy, s], i) => {
        const y = y0 + vy * u - 0.5 * 11 * u * u;
        const sc = s * Math.max(0, 1 - u / 1.1);
        return (
          <mesh key={i} geometry={geo} position={[x0 + vx * u, y, 0.3 + 0.8 * u * ((i % 3) - 0.5)]} rotation={[u * (3 + i), u * (2 + i * 0.7), u * 4]} scale={Math.max(0.001, sc)} castShadow>
            <ClayMat color="#EDE3D6" rough={0.7} />
          </mesh>
        );
      })}
    </>
  );
};

/** রবার-stamp ধাঁচের লাল label (pill slab, সামান্য চকচকে) */
export const Stamp: React.FC<P & { label: string; color?: string; opacity?: number; w?: number }> = ({ label, color = "#D9453B", opacity = 1, w, ...p }) => {
  const ww = w ?? Math.max(1.5, 0.36 * label.length + 0.6);
  const geo = useMemo(() => pillGeo(ww, 0.62, 0.18, 0.07), [ww]);
  return (
    <G {...p}>
      <mesh geometry={geo} castShadow>
        <Gloss color={color} rough={0.4} coat={0.6} opacity={opacity} />
      </mesh>
      <Txt3 size={0.34} color="#ffffff" letterSpacing={0.06} position={[0, -0.005, 0.11]} opacity={opacity}>
        {label}
      </Txt3>
    </G>
  );
};

// ======================= Fact card =======================
export const FACT = { w: 4.6, h: 2.35 };
export const FactCard: React.FC<P & { text: string; tag: number; check: number; label?: string; color?: string; accent?: string }> = ({
  text,
  tag,
  check,
  label = "FACT",
  color = "#FBF8F3",
  accent = "#22A45A",
  ...p
}) => {
  const { w, h } = FACT;
  const fs = fitText(text, w * 0.8, h * 0.52, 3, 0.42);
  return (
    <SoftPanel w={w} h={h} thick={0.44} color={color} {...p}>
      {tag > 0.001 && (
        <group position={[-w / 2 + 1.0, h / 2 - 0.12, 0.06]} rotation={[0, 0, -0.04]} scale={Math.max(0.001, tag)}>
          <Stamp label={label} color={accent} />
        </group>
      )}
      {check > 0.001 && <CheckBadge color={accent} position={[w / 2 - 0.42, h / 2 - 0.4, 0.05]} scale={0.7 * check} />}
      <Txt3 size={fs} color={C.deepNavy} maxWidth={w * 0.84} position={[0, -0.14, 0.03]}>
        {text}
      </Txt3>
    </SoftPanel>
  );
};

// ======================= Stat card (count-up + বাড়ন্ত bar) =======================
/** "2x", "+45%", "120", "৳ নয়" — সংখ্যা অংশ count-up হয় (k 0..1) */
export const countText = (s: string, k: number) => {
  const m = s.match(/^([^0-9]*)([0-9][0-9,]*\.?[0-9]*)(.*)$/);
  if (!m) return s;
  const raw = parseFloat(m[2].replace(/,/g, ""));
  const dec = (m[2].split(".")[1] || "").length;
  const v = raw * clamp01(k);
  const txt = dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US");
  return m[1] + txt + m[3];
};
export const StatCard: React.FC<P & { value: string; label: string; k: number; bars: number; accent?: string }> = ({ value, label, k, bars, accent = C.orange, ...p }) => {
  const w = 2.4,
    h = 2.5;
  const H = [0.28, 0.5, 0.78];
  return (
    <SoftPanel w={w} h={h} thick={0.42} color="#FBF8F3" {...p}>
      <Txt3 size={value.length > 4 ? 0.62 : 0.78} color={accent} position={[0, 0.66, 0.03]}>
        {countText(value, k)}
      </Txt3>
      <Txt3 size={fitText(label, w * 0.82, 0.5, 2, 0.22)} color={C.deepNavy} maxWidth={w * 0.84} position={[0, 0.1, 0.03]}>
        {label}
      </Txt3>
      {H.map((hh, i) => {
        const g = clamp01(bars * 3 - i);
        const bh = Math.max(0.08, hh * g);
        return <RaisedBar key={i} position={[-0.55 + i * 0.55, -1.06 + bh / 2, 0]} w={0.34} h={bh} d={0.12} radius={0.1} color={i === 2 ? accent : "#D9DFE6"} />;
      })}
    </SoftPanel>
  );
};

// ======================= Pedestal =======================
export const Pedestal: React.FC<P & { r?: number; h?: number; color?: string }> = ({ r = 1.0, h = 0.34, color = "#F1E8DC", ...p }) => {
  const g = useMemo(() => roundedCylGeo(r, h, 0.13), [r, h]);
  return (
    <G {...p}>
      <mesh geometry={g} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ClayMat color={color} rough={0.7} />
      </mesh>
    </G>
  );
};
export const PEDESTAL_H = 0.34;

// ======================= Industry objects (প্রতিটার উচ্চতা ≈ 1.3–1.6, পায়ের তলা y = 0) =======================
/** এক টুকরার মসৃণ molar — SDF smooth-union, MarchingCubes bake (জোড়া নেই) */
const molarSDF = (x: number, y: number, z: number) => {
  let d = sdEllipsoid(x, y - 0.95, z, 0.56, 0.36, 0.5);
  const cusps: V3[] = [
    [-0.24, 1.2, -0.2],
    [0.24, 1.2, -0.2],
    [-0.24, 1.2, 0.2],
    [0.24, 1.2, 0.2],
  ];
  for (const c of cusps) d = smin(d, Math.hypot(x - c[0], y - c[1], z - c[2]) - 0.22, 0.16);
  // fissure (মাঝের খাঁজ)
  d = smax(d, -(Math.hypot(x, (y - 1.46) * 1.1, z * 0.6) - 0.2), 0.1);
  // দুটো বাঁকা root
  for (const s of [-1, 1]) {
    const r1 = sdCapsule([x, y, z], [s * 0.24, 0.8, 0], [s * 0.27, 0.38, 0.02], 0.22, 0.16);
    const r2 = sdCapsule([x, y, z], [s * 0.27, 0.38, 0.02], [s * 0.2, 0.06, 0.0], 0.16, 0.09);
    d = smin(d, Math.min(r1, r2), 0.2);
  }
  return d;
};
export const Molar: React.FC<P & { color?: string }> = ({ color = "#FBFAF6", ...p }) => {
  const g = useBaked("scenes-g-molar", molarSDF, [0, 0.78, 0], 0.86, 104);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} roughness={0.32} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.4} sheenColor="#fff0e0" />
      </mesh>
    </G>
  );
};

/** রুপালি cloche + থালা + biryani — lift 0..1 হলে ঢাকনা উঠে কাত হয় */
export const ClochePlate: React.FC<P & { lift: number }> = ({ lift, ...p }) => {
  const plate = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.62, 0.0],
          [0.78, 0.04],
          [1.08, 0.1],
          [1.24, 0.16],
          [1.28, 0.19],
          [1.22, 0.2],
          [1.0, 0.15],
          [0.7, 0.1],
          [0.0, 0.1],
        ],
        72,
        96
      ),
    []
  );
  const dome = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 1.02],
          [0.11, 1.03],
          [0.14, 1.09],
          [0.1, 1.15],
          [0.0, 1.16],
        ] as [number, number][],
        48,
        40
      ),
    []
  );
  const shell = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.94],
          [0.36, 0.9],
          [0.66, 0.76],
          [0.88, 0.5],
          [1.0, 0.2],
          [1.04, 0.05],
          [1.08, 0.0],
          [1.02, 0.0],
          [0.97, 0.12],
          [0.86, 0.42],
          [0.62, 0.68],
          [0.33, 0.82],
          [0.0, 0.86],
        ].reverse() as [number, number][],
        72,
        120
      ),
    []
  );
  const food = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.62, 6);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = Math.sin(v.x * 23.1 + v.z * 7.3) * Math.sin(v.y * 19.7 + v.x * 5.1) * Math.sin(v.z * 21.3 + v.y * 3.7);
      v.multiplyScalar(1 + 0.035 * n);
      v.y = Math.max(-0.05, v.y) * 0.52;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const l = clamp01(lift);
  return (
    <G {...p}>
      <mesh geometry={plate} castShadow receiveShadow>
        <Gloss color="#FBF8F2" rough={0.25} coat={0.8} />
      </mesh>
      <mesh geometry={food} position={[0, 0.12, 0]} castShadow>
        <ClayMat color="#E7A445" rough={0.75} />
      </mesh>
      {[
        [0.22, 0.34, 0.12, "#B8642C"],
        [-0.2, 0.3, 0.2, "#B8642C"],
        [0.02, 0.4, -0.18, "#F4F1EA"],
      ].map(([x, y, z, c], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]} scale={[1, 0.75, 1]} castShadow>
          <sphereGeometry args={[i === 2 ? 0.15 : 0.17, 32, 20]} />
          <ClayMat color={c as string} rough={0.6} />
        </mesh>
      ))}
      <group position={[0.75 * l, 0.12 + 1.0 * l, 0.15 * l]} rotation={[0.2 * l, 0, -0.75 * l]}>
        <mesh geometry={shell} castShadow>
          <SilverMat rough={0.42} />
        </mesh>
        <mesh geometry={dome} castShadow>
          <SilverMat rough={0.38} />
        </mesh>
      </group>
    </G>
  );
};

/** shopping bag (handle সহ) + পাশে tape-মোড়া parcel; hop 0..1 = ব্যাগ লাফায় */
export const BagParcel: React.FC<P & { hop?: number; color?: string }> = ({ hop = 0, color = "#E2552B", ...p }) => {
  const bag = useMemo(() => slabGeo(1.15, 1.35, 0.6, 0.12, 0.08, 6), []);
  const fold = useMemo(() => slabGeo(1.17, 0.16, 0.62, 0.06, 0.05, 4), []);
  const handle = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.28, 0.6, 0), new THREE.Vector3(-0.26, 0.98, 0), new THREE.Vector3(0, 1.08, 0), new THREE.Vector3(0.26, 0.98, 0), new THREE.Vector3(0.28, 0.6, 0)]);
    return new THREE.TubeGeometry(c, 48, 0.045, 12, false);
  }, []);
  const box = useMemo(() => slabGeo(1.0, 0.72, 0.9, 0.08, 0.06, 5), []);
  const tape = useMemo(() => slabGeo(0.24, 0.73, 0.92, 0.03, 0.02, 3), []);
  const y = Math.sin(PI * clamp01(hop)) * 0.35;
  const sq = 1 - 0.08 * Math.sin(PI * clamp01(hop * 2));
  return (
    <G {...p}>
      <group position={[-0.42, y, 0]} scale={[1 / Math.sqrt(sq), sq, 1]}>
        <group position={[0, 0.675, 0]}>
          <mesh geometry={bag} castShadow receiveShadow>
            <Gloss color={color} rough={0.55} coat={0.25} />
          </mesh>
          <mesh geometry={fold} position={[0, 0.6, 0]} castShadow>
            <ClayMat color={mixHex(color, "#7a2a10", 0.25)} rough={0.6} />
          </mesh>
        </group>
        {[0.2, -0.2].map((z) => (
          <mesh key={z} geometry={handle} position={[0, 0.72, z]} castShadow>
            <ClayMat color={C.deepNavy} rough={0.5} />
          </mesh>
        ))}
      </group>
      <group position={[0.72, 0.36, 0.2]} rotation={[0, -0.35, 0]}>
        <mesh geometry={box} castShadow receiveShadow>
          <ClayMat color="#D9B48A" rough={0.72} />
        </mesh>
        <mesh geometry={tape}>
          <ClayMat color="#C79B6C" rough={0.5} />
        </mesh>
      </group>
    </G>
  );
};

/** graduation cap বইয়ের উপর — t দিয়ে tassel দোলে */
export const CapBooks: React.FC<P & { t: number; swing?: number }> = ({ t, swing = 0, ...p }) => {
  const board = useMemo(() => slabGeo(1.5, 1.5, 0.1, 0.07, 0.04, 4), []);
  const skull = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.5, 0.0],
          [0.6, 0.04],
          [0.62, 0.2],
          [0.6, 0.36],
          [0.0, 0.38],
        ],
        64,
        64
      ),
    []
  );
  const bookA = useMemo(() => slabGeo(1.7, 1.2, 0.3, 0.06, 0.05, 4), []);
  const pagesA = useMemo(() => slabGeo(1.6, 1.12, 0.24, 0.03, 0.02, 3), []);
  const bookB = useMemo(() => slabGeo(1.55, 1.1, 0.26, 0.06, 0.05, 4), []);
  const pagesB = useMemo(() => slabGeo(1.45, 1.02, 0.2, 0.03, 0.02, 3), []);
  const sw = 0.25 * Math.sin(t * 3.1) * 0.4 + swing;
  return (
    <G {...p}>
      {/* দুটো বই (cover + পাতা) */}
      <group position={[0, 0.15, 0]} rotation={[-PI / 2, 0, 0.12]}>
        <mesh geometry={bookA} castShadow receiveShadow>
          <ClayMat color="#1F5C4A" rough={0.6} />
        </mesh>
        <mesh geometry={pagesA} position={[0.06, 0, 0]}>
          <ClayMat color="#F7F1E6" rough={0.8} />
        </mesh>
      </group>
      <group position={[0.05, 0.43, 0]} rotation={[-PI / 2, 0, -0.18]}>
        <mesh geometry={bookB} castShadow receiveShadow>
          <ClayMat color="#C0462E" rough={0.6} />
        </mesh>
        <mesh geometry={pagesB} position={[0.06, 0, 0]}>
          <ClayMat color="#F7F1E6" rough={0.8} />
        </mesh>
      </group>
      {/* cap */}
      <group position={[0, 0.56, 0]} rotation={[0, 0.6, 0]}>
        <mesh geometry={skull} castShadow>
          <ClayMat color="#1E2A3C" rough={0.55} />
        </mesh>
        <mesh geometry={board} position={[0, 0.42, 0]} rotation={[-PI / 2, 0, PI / 4]} castShadow>
          <ClayMat color="#223049" rough={0.5} />
        </mesh>
        <mesh position={[0, 0.49, 0]}>
          <sphereGeometry args={[0.07, 24, 16]} />
          <Gloss color="#E0A021" rough={0.35} coat={0.6} />
        </mesh>
        {/* cord কোণ পর্যন্ত, তারপর ঝোলে */}
        <group position={[0, 0.49, 0]}>
          <mesh position={[0.37, 0, 0]} rotation={[0, 0, PI / 2]}>
            <capsuleGeometry args={[0.022, 0.72, 6, 12]} />
            <Gloss color="#E0A021" rough={0.4} coat={0.5} />
          </mesh>
          <group position={[0.74, 0, 0]} rotation={[sw * 0.6, 0, sw]}>
            <mesh position={[0, -0.22, 0]}>
              <capsuleGeometry args={[0.022, 0.4, 6, 12]} />
              <Gloss color="#E0A021" rough={0.4} coat={0.5} />
            </mesh>
            <mesh position={[0, -0.5, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.2, 8, 16]} />
              <ClayMat color="#E0A021" rough={0.55} />
            </mesh>
          </group>
        </group>
      </group>
    </G>
  );
};

/** industry → চেনা বস্তু (pedestal-এর উপর বসানোর জন্য, উচ্চতা ≈ 1.3–1.6) */
export const IndustryObject: React.FC<P & { industry: Industry; t: number; act: number }> = ({ industry, t, act, ...p }) => {
  if (industry === "dental") return <Molar {...p} rotation={[0.1, 0.5 + 0.08 * Math.sin(t * 0.9), 0.05]} />;
  if (industry === "restaurant") return <ClochePlate {...p} lift={act} />;
  if (industry === "ecommerce") return <BagParcel {...p} hop={act} />;
  return <CapBooks {...p} t={t} swing={0.3 * Math.sin(PI * act)} />;
};
