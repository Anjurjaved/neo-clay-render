// Storefront v2 — kit Shop-এর চেয়ে নিখুঁত: এক টুকরার frame, ভেতরে bevelled ঘর (plane নেই), রুপালি rolling shutter,
// তার পেছনে satin-frame কাচের double door (slide খোলে), সামনে নরম step, পুরু pill signboard, ঐচ্ছিক scalloped awning।
// local origin = floor-এর উপর, facade-এর কেন্দ্র-বরাবর box-এর কেন্দ্র; সামনে +z। roof slot = y = h।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, Txt } from "../../kit/Clay";
import { frameGeo, pillGeo, slabGeo, roundedRectPath } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { ShopGlass, Satin, PolishedClay } from "./mats";

export type StoreDims = { w: number; h: number; d: number; doorW: number; doorH: number; sill: number };
export const STORE: StoreDims = { w: 2.1, h: 2.55, d: 1.8, doorW: 1.44, doorH: 1.58, sill: 0.1 };

let _spill: THREE.CanvasTexture | null = null;
const spillTex = () => {
  if (_spill) return _spill;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 40, 4, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,0.9)");
  gr.addColorStop(0.5, "rgba(255,255,255,0.35)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  _spill = new THREE.CanvasTexture(c);
  _spill.colorSpace = THREE.SRGBColorSpace;
  return _spill;
};

/** scalloped awning shape (নিচের কিনারা ঢেউ) */
const awningShape = (w: number, h: number, n: number) => {
  const s = new THREE.Shape();
  const r = w / n / 2;
  s.moveTo(-w / 2, h);
  s.lineTo(w / 2, h);
  s.lineTo(w / 2, r);
  for (let i = n - 1; i >= 0; i--) {
    const cx = -w / 2 + r * (2 * i + 1);
    s.absarc(cx, r, r, 0, -Math.PI, true);
  }
  s.lineTo(-w / 2, h);
  return s;
};
const stripeTex = (a: string, b: string, n: number) => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 8;
  const g = c.getContext("2d")!;
  for (let i = 0; i < n * 2; i++) {
    g.fillStyle = i % 2 ? b : a;
    g.fillRect((i * 256) / (n * 2), 0, 256 / (n * 2) + 1, 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** নরম striped awning — বাঁকানো (vertex bend), scallop কিনারা; flutter = ছোট ঢেউ phase */
export const Awning: React.FC<{ w: number; colors?: [string, string]; n?: number; drop?: number; depth?: number; flutter?: number; position?: [number, number, number] }> = ({
  w,
  colors = ["#E9573F", "#FBF5EE"],
  n = 7,
  drop = 0.42,
  depth = 0.55,
  flutter = 0,
  position,
}) => {
  const tex = useMemo(() => stripeTex(colors[0], colors[1], n), [colors[0], colors[1], n]);
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(awningShape(w, drop, n), { depth: 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 16, steps: 1 });
    // সামনের তলে x অনুযায়ী uv (stripe)
    const pos = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, 0.5);
    return g;
  }, [w, drop, n]);
  // bend: উপরের কিনারা দেয়ালে (z=0), নিচে সামনে বেরোয় — বাঁকা ক্যানভাস
  const bent = useMemo(() => {
    const g = geo.clone();
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i);
      const k = 1 - y / drop; // 0 উপরে → 1 নিচে
      const out = depth * Math.sin((k * Math.PI) / 2);
      const wave = flutter * 0.025 * Math.sin(x * 9 + flutter * 0) * k * k;
      pos.setXYZ(i, x, drop - (drop * 0.78) * k - 0.0, z + out + wave);
    }
    g.computeVertexNormals();
    return g;
  }, [geo, flutter]);
  return (
    <group position={position}>
      <mesh geometry={bent} castShadow receiveShadow>
        <meshPhysicalMaterial map={tex} roughness={0.55} sheen={0.5} sheenColor="#fff0e2" clearcoat={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export const Storefront: React.FC<{
  label: string;
  signColor?: string;
  signInk?: string;
  open: number; // shutter 0 = নামানো, 1 = ওঠানো
  light: number; // ভেতরের আলো 0..1
  doors?: number; // কাচের দরজা 0 = বন্ধ, 1 = খোলা (slide)
  dims?: Partial<StoreDims>;
  clay?: string;
  interiorWall?: string;
  awning?: [string, string];
  awningFlutter?: number;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number | [number, number, number];
  roof?: React.ReactNode; // roof-এর উপর (local y = h)
  interior?: React.ReactNode; // ঘরের ভেতর (local origin = ভেতরের মেঝের কেন্দ্র)
  children?: React.ReactNode; // facade-local
}> = ({ label, signColor = C.navy, signInk = "#ffffff", open, light, doors = 0, dims, clay = C.clay, interiorWall = "#F4A866", awning, awningFlutter = 0, position, rotationY = 0, scale = 1, roof, interior, children }) => {
  const D = { ...STORE, ...dims };
  const { w, h, d, doorW, doorH, sill } = D;
  const doorTop = sill + doorH;
  const doorCy = sill + doorH / 2 - h / 2;
  const frame = useMemo(() => frameGeo({ w, h, depth: d, r: 0.24, doorW, doorH, doorR: 0.08, doorCy, bevel: 0.08 }), [w, h, d, doorW, doorH]);
  const back = useMemo(() => slabGeo(doorW + 0.06, doorH + 0.06, 0.06, 0.06, 0.02, 2), [doorW, doorH]);
  const floorG = useMemo(() => slabGeo(doorW + 0.04, d - 0.2, 0.04, 0.04, 0.015, 2), [doorW, d]);
  const step = useMemo(() => slabGeo(doorW + 0.3, 0.1, 0.4, 0.05, 0.04, 4), [doorW]);
  const signH = awning ? 0.4 : 0.46;
  const signW = Math.min(w * 0.9, Math.max(1.3, label.length * 0.125 + 0.5));
  const sign = useMemo(() => pillGeo(signW, signH, 0.18, 0.07), [signW, signH]);
  // shutter
  const slatH = 0.112;
  const slat = useMemo(() => slabGeo(doorW - 0.03, slatH * 0.97, 0.05, slatH * 0.32, 0.02, 4), [doorW]);
  const bar = useMemo(() => slabGeo(doorW - 0.02, 0.075, 0.09, 0.034, 0.024, 3), [doorW]);
  const handle = useMemo(() => pillGeo(0.24, 0.045, 0.045, 0.018), []);
  const nSlats = Math.ceil(doorH / slatH) + 1;
  const o = Math.max(0, Math.min(1, open));
  const bottomY = sill + doorH * o;
  const shutterZ = d / 2 - 0.16;
  const backingH = Math.max(0.001, doorTop - bottomY);
  const backing = useMemo(() => slabGeo(doorW - 0.03, 1, 0.02, 0.005, 0.004, 1), [doorW]);
  // glass doors
  const leafW = doorW / 2 - 0.02;
  const leafH = doorH - 0.04;
  const leafFrame = useMemo(() => frameGeo({ w: leafW, h: leafH, depth: 0.05, r: 0.035, doorW: leafW - 0.09, doorH: leafH - 0.09, doorR: 0.02, doorCy: 0, bevel: 0.012 }), [leafW, leafH]);
  const pane = useMemo(() => slabGeo(leafW - 0.08, leafH - 0.08, 0.016, 0.02, 0.006, 2), [leafW, leafH]);
  const pull = useMemo(() => pillGeo(0.035, 0.42, 0.035, 0.014), []);
  const doorZ = shutterZ - 0.2;
  // leaf দেয়ালের pocket-এ ঢোকে — frame-এর বাইরে বেরোয় না
  const slide = Math.max(0, Math.min(1, doors)) * Math.min(leafW * 0.92, (w - doorW) / 2 - 0.05);
  const warm = Math.max(0, Math.min(1, light));
  const wallCol = new THREE.Color("#D9D2C9").lerp(new THREE.Color(interiorWall), warm);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale as any}>
      <mesh geometry={frame} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ClayMat color={clay} />
      </mesh>
      {/* front step */}
      <mesh geometry={step} position={[0, 0.05, d / 2 + 0.12]} castShadow receiveShadow>
        <ClayMat color="#E6DCCF" />
      </mesh>
      {/* interior: পেছনের দেয়াল + মেঝে (bevelled slab) */}
      <mesh geometry={back} position={[0, sill + doorH / 2, -d / 2 + 0.1]} receiveShadow>
        <meshStandardMaterial color={wallCol} emissive="#F2873A" emissiveIntensity={0.38 * warm} roughness={0.92} />
      </mesh>
      <mesh geometry={floorG} position={[0, sill - 0.012, 0.02]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color={warm > 0 ? "#F3C59A" : "#DDD6CD"} emissive="#F2873A" emissiveIntensity={0.18 * warm} roughness={0.9} />
      </mesh>
      <group position={[0, sill + 0.01, -d / 2 + 0.55]}>{interior}</group>
      {warm > 0.01 && (
        <>
          <pointLight position={[0, sill + doorH * 0.82, -0.2]} intensity={3.6 * warm} distance={3.4} decay={2} color="#FF9A4A" />
          <pointLight position={[0, sill + 0.5, d / 2 - 0.5]} intensity={0.9 * warm} distance={2} decay={2} color="#FFB070" />
          <mesh position={[0, 0.008, d / 2 + 0.75]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.95, 48]} />
            <meshBasicMaterial map={spillTex()} color="#FFB46A" transparent opacity={0.3 * warm} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      )}
      {/* glass double door */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (leafW / 2 + 0.01 + slide), sill + leafH / 2 + 0.01, doorZ]}>
          <mesh geometry={leafFrame} castShadow>
            <Satin color="#cfd4d8" rough={0.32} />
          </mesh>
          <mesh geometry={pane}>
            <ShopGlass />
          </mesh>
          <mesh geometry={pull} position={[-s * (leafW / 2 - 0.1), 0, 0.05]}>
            <Satin color="#e6e9ec" rough={0.22} />
          </mesh>
        </group>
      ))}
      {/* rolling shutter — উঠলে lintel-এর ভেতরে লুকায় */}
      {o < 0.999 && (
        <>
          {Array.from({ length: nSlats }).map((_, i) => {
            const yc = bottomY + 0.07 + slatH * (i + 0.5);
            if (yc - slatH / 2 > doorTop - 0.01) return null;
            return (
              <mesh key={i} geometry={slat} position={[0, yc, shutterZ]} castShadow receiveShadow>
                <meshPhysicalMaterial color="#D3D7DB" metalness={0.45} roughness={0.42} envMapIntensity={0.95} clearcoat={0.2} clearcoatRoughness={0.5} />
              </mesh>
            );
          })}
          <mesh geometry={backing} position={[0, (bottomY + doorTop) / 2, shutterZ - 0.035]} scale={[1, backingH, 1]}>
            <meshStandardMaterial color="#B4BAC0" roughness={0.6} />
          </mesh>
          <group position={[0, bottomY + 0.038, shutterZ + 0.012]}>
            <mesh geometry={bar} castShadow>
              <SilverMat color="#B5BBC1" rough={0.32} />
            </mesh>
            <mesh geometry={handle} position={[0, 0, 0.055]}>
              <SilverMat color="#9EA5AC" rough={0.25} />
            </mesh>
          </group>
        </>
      )}
      {/* awning — দরজার ঠিক উপরে */}
      {awning && <Awning w={doorW + 0.34} colors={awning} drop={0.4} depth={0.5} flutter={awningFlutter} position={[0, doorTop + 0.02, d / 2 - 0.02]} />}
      {/* signboard */}
      <group position={[0, awning ? h - 0.3 : doorTop + (h - doorTop) / 2 + 0.02, d / 2 + 0.06]}>
        <mesh geometry={sign} castShadow>
          <PolishedClay color={signColor} rough={0.5} coat={0.35} />
        </mesh>
        <Txt size={Math.min(0.19, (signW * 0.84) / (label.length * 0.66))} color={signInk} position={[0, -0.005, 0.1]} letterSpacing={0.02}>
          {label}
        </Txt>
      </group>
      <group position={[0, h, 0]}>{roof}</group>
      {children}
    </group>
  );
};

/** roof-এ sign object বসানোর নরম clay plinth (pedestal) — জিনিসটা ভাসে না, দাঁড়ায় */
export const RoofPlinth: React.FC<{ w?: number; color?: string; position?: [number, number, number] }> = ({ w = 0.7, color = "#F1E8DC", position }) => {
  const g = useMemo(() => {
    const s = roundedRectPath(w, w * 0.62, w * 0.28) as THREE.Shape;
    const e = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 5, curveSegments: 24 });
    e.rotateX(-Math.PI / 2);
    e.computeVertexNormals();
    return e;
  }, [w]);
  return (
    <mesh geometry={g} position={position} castShadow receiveShadow>
      <ClayMat color={color} />
    </mesh>
  );
};
