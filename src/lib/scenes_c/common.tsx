// scenes_c — shared: cue helpers, industry table, SDF-baked one-piece emblems, owner accessories
import React, { useMemo } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { clayNoise, ClayMat, SilverMat, Txt } from "../../kit/Clay";
import { latheGeo, roundedCylGeo, shapeGeo, slabGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar } from "../../kit/Soft";
import { C } from "../../kit/theme";
import { Stethoscope } from "../../web11/props";

// ---------------------------------------------------------------- timing
/** scene-শুরু থেকে সেকেন্ড; না পেলে NaN */
export type Cue = (word: string, after?: number) => number;
const norm = (s: string) => s.replace(/[।,?!.\-'"]/g, "").toLowerCase();
/** sample VO word list → Cue */
export const mkCue =
  (list: [string, number][]): Cue =>
  (w, after = 0) => {
    const k = norm(w);
    const hit = list.find(([x, s]) => s >= after - 1e-6 && norm(x).includes(k));
    return hit ? hit[1] : NaN;
  };
/** cue পেলে সেটা, না পেলে fallback */
export const when = (cue: Cue, word: string | undefined, fallback: number, after = 0) => {
  if (!word) return fallback;
  const v = cue(word, after);
  return Number.isFinite(v) ? v : fallback;
};

// ---------------------------------------------------------------- industries
export type Industry = "dental" | "restaurant" | "ecommerce" | "school" | "realestate";
export type IndustrySpec = {
  sign: string; // signboard রং
  clay: string; // দোকানের দেহ
  emblem: EmblemKind;
  coat?: string; // owner-এর জামা
  body: string; // owner figure রং
  acc: "stetho" | "chef" | "parcel" | "book" | "tie";
};
export type EmblemKind = "tooth" | "cloche" | "bag" | "cap" | "house";
export const INDUSTRY: Record<Industry, IndustrySpec> = {
  dental: { sign: C.navy, clay: C.clay, emblem: "tooth", coat: "#F6F4F0", body: C.figure, acc: "stetho" },
  restaurant: { sign: C.deepOrange, clay: "#F1E4D2", emblem: "cloche", coat: "#F6F4F0", body: C.figure, acc: "chef" },
  ecommerce: { sign: C.orange, clay: "#EFE3D6", emblem: "bag", coat: "#E7893A", body: C.figure, acc: "parcel" },
  school: { sign: C.steel, clay: "#ECE3D8", emblem: "cap", coat: C.steel, body: C.figure, acc: "book" },
  realestate: { sign: "#24395A", clay: "#EEE4D8", emblem: "house", coat: "#24395A", body: C.figure, acc: "tie" },
};

// ---------------------------------------------------------------- SDF bake (এক টুকরার মসৃণ mesh, vertex colour সহ)
type V3 = [number, number, number];
type SDF = (x: number, y: number, z: number) => number;
const cl = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const smin = (a: number, b: number, k: number) => {
  const h = cl(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
};
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
const sph = (x: number, y: number, z: number, r: number) => Math.hypot(x, y, z) - r;
const ell = (x: number, y: number, z: number, a: number, b: number, c: number) => {
  const k0 = Math.hypot(x / a, y / b, z / c);
  const k1 = Math.hypot(x / (a * a), y / (b * b), z / (c * c));
  return k1 === 0 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
};
const rbox = (x: number, y: number, z: number, bx: number, by: number, bz: number, r: number) => {
  const qx = Math.abs(x) - bx,
    qy = Math.abs(y) - by,
    qz = Math.abs(z) - bz;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
};
const rcone = (p: V3, a: V3, b: V3, ra: number, rb: number) => {
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const pa = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const h = cl((pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / (ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2), 0, 1);
  return Math.hypot(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - (ra + (rb - ra) * h);
};
const box2 = (x: number, y: number, bx: number, by: number, r: number) => {
  const qx = Math.abs(x) - bx + r,
    qy = Math.abs(y) - by + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
const extr = (d2: number, z: number, h: number, r: number) => {
  const wx = d2 + r,
    wy = Math.abs(z) - h + r;
  return Math.min(Math.max(wx, wy), 0) + Math.hypot(Math.max(wx, 0), Math.max(wy, 0)) - r;
};

const CACHE = new Map<string, THREE.BufferGeometry>();
const bake = (key: string, sdf: SDF, colour: ((x: number, y: number, z: number) => string) | null, center: V3, extent: number, res = 100) => {
  const hit = CACHE.get(key);
  if (hit) return hit;
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 500000) as any;
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
  const P: Float32Array = mc.positionArray,
    N: Float32Array = mc.normalArray;
  const pos = new Float32Array(cnt * 3),
    nor = new Float32Array(cnt * 3),
    uv = new Float32Array(cnt * 2),
    col = new Float32Array(cnt * 3);
  const cc = new THREE.Color();
  const memo = new Map<string, THREE.Color>();
  for (let i = 0; i < cnt; i++) {
    const o = i * 3;
    const x = center[0] + P[o] * extent,
      y = center[1] + P[o + 1] * extent,
      z = center[2] + P[o + 2] * extent;
    pos[o] = x;
    pos[o + 1] = y;
    pos[o + 2] = z;
    const l = Math.hypot(N[o], N[o + 1], N[o + 2]) || 1;
    nor[o] = N[o] / l;
    nor[o + 1] = N[o + 1] / l;
    nor[o + 2] = N[o + 2] / l;
    const ax = Math.abs(nor[o]),
      ay = Math.abs(nor[o + 1]),
      az = Math.abs(nor[o + 2]);
    const [a, b] = ax > ay && ax > az ? [z, y] : ay > az ? [x, z] : [x, y];
    uv[i * 2] = a * 1.5;
    uv[i * 2 + 1] = b * 1.5;
    if (colour) {
      const h = colour(x, y, z);
      let c = memo.get(h);
      if (!c) memo.set(h, (c = new THREE.Color(h)));
      cc.copy(c);
      col[o] = cc.r;
      col[o + 1] = cc.g;
      col[o + 2] = cc.b;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  if (colour) g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeBoundingSphere();
  mc.geometry.dispose();
  CACHE.set(key, g);
  return g;
};

/** polished glaze clay (vertex colour বা এক রং) */
export const Glaze: React.FC<{ color?: string; vc?: boolean; rough?: number }> = ({ color = "#ffffff", vc = false, rough = 0.36 }) => (
  <meshPhysicalMaterial
    color={vc ? "#ffffff" : color}
    vertexColors={vc}
    roughness={rough}
    clearcoat={0.6}
    clearcoatRoughness={0.2}
    sheen={0.35}
    sheenRoughness={0.6}
    sheenColor="#ffe6d2"
    bumpMap={clayNoise()}
    bumpScale={0.035}
    envMapIntensity={1.0}
  />
);

// ---- emblem geometry (base y=0, height ≈ 1) ----
const toothSDF: SDF = (x, y, z) => {
  let d = ell(x, y - 0.62, z, 0.37, 0.25, 0.33);
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) d = smin(d, sph(x - 0.15 * sx, y - 0.8, z - 0.13 * sz, 0.15), 0.07);
  d = smax(d, -sph(x, y - 1.0, z, 0.11), 0.06); // occlusal dip
  for (const s of [-1, 1]) d = smin(d, rcone([x, y, z], [0.15 * s, 0.52, 0], [0.21 * s, 0.05, 0.02], 0.15, 0.065), 0.11);
  return d;
};
const clocheSDF: SDF = (x, y, z) => {
  let d = smax(sph(x, y - 0.04, z, 0.5), -(y - 0.06), 0.03);
  d = smin(d, Math.hypot(Math.hypot(x, z) - 0.5, y - 0.07) - 0.04, 0.03); // rim
  d = smin(d, rcone([x, y, z], [0, 0.5, 0], [0, 0.64, 0], 0.045, 0.03), 0.04);
  d = smin(d, sph(x, y - 0.68, z, 0.075), 0.03);
  return d;
};
const bagSDF: SDF = (x, y, z) => {
  // সামান্য taper (নিচে চওড়া)
  const k = 1 + (0.4 - y) * 0.12;
  let d = rbox(x * k, y - 0.38, z, 0.29, 0.31, 0.12, 0.08);
  d = smin(d, Math.hypot(Math.hypot(x, y - 0.74) - 0.17, z) - 0.036, 0.03);
  return d;
};
const bagCol = (x: number, y: number, _z: number) => (y > 0.79 ? C.navy : C.orange);
const capSDF: SDF = (x, y, z) => {
  const c = Math.SQRT1_2;
  const rx = x * c - z * c,
    rz = x * c + z * c;
  let d = rbox(rx, y - 0.5, rz, 0.4, 0.022, 0.4, 0.025);
  d = smin(d, box2(Math.hypot(x, z), y - 0.33, 0.27, 0.15, 0.06), 0.04);
  d = smin(d, sph(x, y - 0.545, z, 0.045), 0.015);
  d = smin(d, rcone([x, y, z], [0, 0.55, 0], [0, 0.535, 0.55], 0.022, 0.022), 0.012);
  d = smin(d, rcone([x, y, z], [0, 0.53, 0.57], [0, 0.33, 0.6], 0.03, 0.055), 0.02);
  return d;
};
const capCol = (x: number, y: number, z: number) => ((Math.hypot(x, z) < 0.07 && y > 0.52) || (z > 0.2 && y > 0.53 && Math.abs(x) < 0.05) || z > 0.53 ? C.orange : C.navy);
const roof2 = (x: number, y: number) => {
  const n = Math.hypot(0.44, 0.54);
  return Math.max((Math.abs(x) * 0.44 + (y - 1.0) * 0.54) / n, 0.56 - y);
};
const doorD = (x: number, y: number, z: number) => rbox(x, y - 0.15, z - 0.36, 0.06, 0.15, 0.08, 0.03);
const winD = (x: number, y: number, z: number) => Math.min(rbox(x - 0.215, y - 0.4, z - 0.36, 0.045, 0.045, 0.08, 0.025), rbox(x + 0.215, y - 0.4, z - 0.36, 0.045, 0.045, 0.08, 0.025));
const houseSDF: SDF = (x, y, z) => {
  let d = rbox(x, y - 0.3, z, 0.34, 0.27, 0.28, 0.05);
  d = smin(d, extr(roof2(x, y) + 0.04, z, 0.36, 0.04) - 0.0, 0.035);
  d = smin(d, rbox(x - 0.22, y - 0.86, z + 0.05, 0.055, 0.14, 0.055, 0.025), 0.03);
  d = smax(d, -doorD(x, y, z), 0.02);
  d = smax(d, -winD(x, y, z), 0.02);
  return d;
};
const houseCol = (x: number, y: number, z: number) => {
  if (doorD(x, y, z) < 0.008 || winD(x, y, z) < 0.008) return C.navy;
  if (y > 0.6 && Math.abs(x - 0.22) < 0.09 && z < 0.02 && y > 0.75) return "#F3EDE5";
  if (y > 0.585) return C.deepOrange;
  return "#F6F0E8";
};

export const emblemGeo = (k: EmblemKind) => {
  switch (k) {
    case "tooth":
      return bake("tooth", toothSDF, null, [0, 0.52, 0], 0.58, 100);
    case "cloche":
      return bake("cloche", clocheSDF, null, [0, 0.36, 0], 0.6, 96);
    case "bag":
      return bake("bag", bagSDF, bagCol, [0, 0.47, 0], 0.5, 100);
    case "cap":
      return bake("cap", capSDF, capCol, [0, 0.42, 0.04], 0.64, 128);
    case "house":
      return bake("house", houseSDF, houseCol, [0, 0.52, 0], 0.6, 110);
  }
};

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
/** industry চেনানোর এক টুকরার polished emblem — base y=0, উচ্চতা ≈1, প্রস্থ ≈1 */
export const Emblem: React.FC<P & { kind: EmblemKind }> = ({ kind, ...p }) => {
  const g = useMemo(() => emblemGeo(kind), [kind]);
  const plate = useMemo(() => roundedCylGeo(0.66, 0.07, 0.03), []);
  const vc = kind === "bag" || kind === "cap" || kind === "house";
  return (
    <group position={p.position} rotation={p.rotation as any} scale={p.scale as any}>
      {kind === "cloche" ? (
        <>
          <mesh geometry={plate} position={[0, 0.035, 0]} castShadow receiveShadow>
            <Glaze color="#FBFAF7" rough={0.32} />
          </mesh>
          <mesh geometry={g} position={[0, 0.07, 0]} castShadow>
            <meshPhysicalMaterial color="#D7DCE1" metalness={0.85} roughness={0.3} clearcoat={0.4} clearcoatRoughness={0.25} envMapIntensity={1.15} />
          </mesh>
        </>
      ) : (
        <mesh geometry={g} castShadow receiveShadow>
          <Glaze vc={vc} color={kind === "tooth" ? "#FBFAF7" : C.navy} rough={kind === "tooth" ? 0.3 : 0.38} />
        </mesh>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- owner accessories (Figure body-local)
const chefHat = () =>
  latheGeo(
    [
      [0.0, 0.0],
      [0.155, 0.0],
      [0.165, 0.05],
      [0.158, 0.12],
      [0.2, 0.17],
      [0.245, 0.25],
      [0.235, 0.33],
      [0.15, 0.385],
      [0.0, 0.395],
    ],
    56
  );
const tieShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.03, 0.11);
  s.lineTo(0.03, 0.11);
  s.lineTo(0.018, 0.07);
  s.lineTo(0.05, -0.08);
  s.lineTo(0, -0.13);
  s.lineTo(-0.05, -0.08);
  s.lineTo(-0.018, 0.07);
  s.closePath();
  return s;
};
export const Accessory: React.FC<{ kind: IndustrySpec["acc"] }> = ({ kind }) => {
  const hat = useMemo(() => chefHat(), []);
  const tie = useMemo(() => shapeGeo(tieShape(), 0.025, 0.012, 3), []);
  const book = useMemo(() => slabGeo(0.3, 0.38, 0.08, 0.03, 0.02, 3), []);
  const parcel = useMemo(() => slabGeo(0.36, 0.26, 0.3, 0.04, 0.025, 3), []);
  if (kind === "stetho") return <Stethoscope position={[0, 0, 0.1]} />;
  if (kind === "chef")
    return (
      <mesh geometry={hat} position={[0, 1.09, 0]} castShadow>
        <ClayMat color="#FBFAF7" rough={0.62} />
      </mesh>
    );
  if (kind === "tie")
    return (
      <mesh geometry={tie} position={[0, 0.63, 0.178]} rotation={[-0.33, 0, 0]} castShadow>
        <Glaze color={C.orange} />
      </mesh>
    );
  if (kind === "book")
    return (
      <group position={[0.235, 0.53, 0.04]} rotation={[0, Math.PI / 2, 0.08]}>
        <mesh geometry={book} castShadow>
          <Glaze color={C.deepOrange} rough={0.45} />
        </mesh>
      </group>
    );
  return (
    <group position={[0, 0.6, 0.34]}>
      <mesh geometry={parcel} castShadow>
        <ClayMat color="#D9A86C" rough={0.7} />
      </mesh>
      <RaisedBar position={[0, 0, 0.15]} w={0.07} h={0.27} d={0.012} radius={0.01} color="#B9824A" />
    </group>
  );
};

// ---------------------------------------------------------------- name plate (desk nameplate, floor-এ দাঁড়ানো)
/** name plate-এর world প্রস্থ (scale হিসাবের জন্য) */
export const nameStandW = (name: string, role: string) => Math.max(2.6, name.length * 0.34 * 0.68 + 0.9, role.length * 0.12 * 0.7 + 0.6);
/** নরম navy plate + বড় নাম + কমলা role line; base y=0; প্রস্থ লেখা থেকে */
export const NameStand: React.FC<P & { name: string; role: string; accent?: string }> = ({ name, role, accent = C.orange, ...p }) => {
  const fs = 0.34;
  const w = nameStandW(name, role);
  const foot = useMemo(() => slabGeo(w * 0.9, 0.34, 0.16, 0.1, 0.06, 5), [w]);
  return (
    <group position={p.position} rotation={p.rotation as any} scale={p.scale as any}>
      <mesh geometry={foot} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} castShadow receiveShadow>
        <ClayMat color={C.clay} />
      </mesh>
      <SoftPanel position={[0, 0.66, 0]} rotation={[-0.1, 0, 0]} w={w} h={1.02} thick={0.22} color={C.deepNavy} rough={0.55}>
        <Txt size={fs} color="#ffffff" position={[0, 0.17, 0.02]} letterSpacing={0.01}>
          {name}
        </Txt>
        <Txt size={Math.min(0.17, (w - 0.5) / (role.length * 0.7))} color={accent} position={[0, -0.23, 0.02]} letterSpacing={0.04}>
          {role}
        </Txt>
      </SoftPanel>
    </group>
  );
};

/** ClockBadge-এর কাঁটার কোণ "2:07" থেকে */
export const clockAngles = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map((v) => parseInt(v, 10) || 0);
  const minA = (m / 60) * Math.PI * 2;
  const hourA = (((h % 12) + m / 60) / 12) * Math.PI * 2;
  return { hourA, minA };
};

export { SilverMat };

// ================================================================ wave-1 lib components (places / characters)
import { Storefront, STORE, RoofPlinth } from "../places/Storefront";
import { Molar, Cloche } from "../places/signs";
import { DentalInterior, RestaurantInterior, ClothingInterior } from "../places/interiors";
import { Character, Role } from "../characters/Character";
import { Held } from "../characters/props";
import { rigOf, Pose } from "../characters/rig";
import { stand, walk, wave, think, point, cheer, holdPhone, mixPose, withArm, armHoldSelf, armHoldBag } from "../characters/poses";
import { popIn as _popIn } from "../../kit/anim";

export { STORE };
const PLACE: Record<Industry, { awning?: [string, string]; h?: number; plinth: number; interior?: React.FC }> = {
  dental: { plinth: 0.78, interior: DentalInterior },
  restaurant: { awning: ["#E9573F", "#FBF5EE"], h: 2.95, plinth: 1.2, interior: RestaurantInterior },
  ecommerce: { awning: [C.orange, "#FBF5EE"], h: 2.95, plinth: 0.8, interior: ClothingInterior },
  school: { plinth: 0.8 },
  realestate: { plinth: 0.86 },
};
/** industry-র দোকান/চেম্বার — places Storefront + roof-এ চেনানোর বস্তু (emblemAt থেকে pop) */
export const Place: React.FC<{
  industry: Industry;
  label: string;
  open: number;
  light: number;
  t: number;
  emblemAt: number;
  bounce?: number; // emblem-এর আনন্দ-লাফ 0..1
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  children?: React.ReactNode;
}> = ({ industry, label, open, light, t, emblemAt, bounce = 0, position, rotationY = 0, scale = 1, children }) => {
  const ind = INDUSTRY[industry];
  const pl = PLACE[industry];
  const pop = _popIn(t, emblemAt, { k: 220, c: 12 });
  const spin = 0.4 + Math.sin(t * 0.9) * 0.16;
  const b = 1 + 0.14 * Math.sin(Math.PI * bounce);
  const Int = pl.interior;
  const roof =
    t > emblemAt - 0.02 ? (
      <>
        <RoofPlinth w={pl.plinth} />
        <group position={[0, 0.1, 0.05]} scale={[pop.s * pop.sx * b, pop.s * pop.sy * b, pop.s * b]}>
          {ind.emblem === "tooth" ? (
            <Molar scale={0.92} rotation={[0.06, spin, 0]} glow={light * 0.6} />
          ) : ind.emblem === "cloche" ? (
            <Cloche scale={0.95} rotation={[0, 0.35, 0]} lift={0} steam={0.8} time={t} />
          ) : (
            <Emblem kind={ind.emblem} scale={0.9} rotation={[0, spin, 0]} />
          )}
        </group>
      </>
    ) : null;
  return (
    <Storefront
      label={label}
      signColor={ind.sign}
      clay={ind.clay}
      open={open}
      light={light}
      awning={pl.awning}
      awningFlutter={t}
      dims={pl.h ? { h: pl.h } : undefined}
      interior={Int && light > 0.02 ? <Int /> : undefined}
      position={position}
      rotationY={rotationY}
      scale={scale}
      roof={roof}
    >
      {children}
    </Storefront>
  );
};

/** owner role ও হাতে কী — industry থেকে */
export const OWNER_ROLE: Record<Industry, { role: Role; hold?: "clipboard" | "bag"; hat?: boolean }> = {
  dental: { role: "doctor" },
  restaurant: { role: "plain", hat: true },
  ecommerce: { role: "owner", hold: "bag" },
  school: { role: "plain", hold: "clipboard" },
  realestate: { role: "owner" },
};

/** chef-এর টুপি — head frame-এ বসে (মাথা ঘুরলে সাথে ঘোরে) */
export const ChefHat: React.FC = () => {
  const hat = useMemo(() => chefHat(), []);
  return (
    <mesh geometry={hat} position={[0, 0.1, 0]} scale={1.08} castShadow>
      <ClayMat color="#FBFAF7" rough={0.62} />
    </mesh>
  );
};

/** owner figure: হাঁটা → wave → (point / think) — সব pose mix */
export const Owner: React.FC<{
  industry: Industry;
  t: number;
  dist: number; // figure units
  walkK: number;
  arrived: number;
  waveK: number;
  pointK: number;
  pointDir?: V3;
  worryK: number;
  position: [number, number, number];
  rotationY: number;
  scale: number;
}> = ({ industry, t, dist, walkK, arrived, waveK, pointK, pointDir = [-1, 0.3, 0.4], worryK, position, rotationY, scale }) => {
  const o = OWNER_ROLE[industry];
  let p: Pose = mixPose(walk(dist, walkK), stand(t * 2), arrived);
  p = mixPose(p, wave(t), waveK);
  p = mixPose(p, point(t, pointDir), pointK);
  p = mixPose(p, think(t), worryK);
  if (o.hold === "clipboard") p = withArm(p, "L", armHoldSelf("L", 0, "clipboard"));
  if (o.hold === "bag") p = withArm(p, "L", armHoldBag("L"));
  const rig = o.hat ? rigOf(p) : null;
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <Character pose={p} role={o.role} holdL={o.hold ? <Held kind={o.hold} side="L" /> : undefined} />
      {rig && (
        <group matrix={rig.headM} matrixAutoUpdate={false}>
          <ChefHat />
        </group>
      )}
    </group>
  );
};

/** customer figure (cap) — হাঁটে/দাঁড়ায়/ফোন দেখে/খুশি */
export const Customer: React.FC<{
  t: number;
  dist: number;
  walkK: number;
  phone?: number; // 0..1 ফোন হাতে দেখা
  cheerK?: number;
  color?: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  cell?: number;
}> = ({ t, dist, walkK, phone = 0, cheerK = 0, color, position, rotationY, scale, cell }) => {
  let p: Pose = mixPose(stand(t * 2 + position[0]), walk(dist, walkK), Math.min(1, walkK * 3));
  if (phone > 0) p = mixPose(p, holdPhone(t), phone);
  if (cheerK > 0) p = mixPose(p, cheer(t, 1), cheerK);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <Character pose={p} role="customer" color={color} cell={cell} holdR={phone > 0.3 && cheerK < 0.5 ? <Held kind="phone" side="R" /> : undefined} />
    </group>
  );
};
