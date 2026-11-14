// Office tower — এক টুকরার facade (একটাই extrude, জানালাগুলো নরম bevel-এর গর্ত), ভেতরে core block তাই জানালা গভীর দেখায়।
// lights 0..1 → নিচ থেকে উপরে তলা ধরে জানালা জ্বলে; doors 0..1 → lobby-র কাচের দরজা slide; roof-এ briefcase sign।
// local origin = floor, footprint-এর কেন্দ্র; সামনে +z।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "../../kit/Clay";
import { slabGeo, pillGeo, roundedRectPath, frameGeo } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { PolishedClay, ShopGlass, Satin } from "./mats";
import { Briefcase } from "./signs";
import { RoofPlinth } from "./Storefront";

export const TOWER = { w: 2.3, h: 5.1, d: 1.9 };
const COLS = [-0.78, -0.26, 0.26, 0.78];
const ROWS = Array.from({ length: 8 }, (_, i) => 1.5 + i * 0.4);
const WIN = { w: 0.32, h: 0.25, r: 0.06 };
const LOBBY = { w: 1.0, h: 1.0, y0: 0.16 }; // hole outer boundary ছোঁবে না (earcut)

const holeAt = (cx: number, cy: number, w: number, h: number, r: number) => {
  // path ঘড়ির কাঁটার উল্টো দিকে নয় — hole-এর জন্য বিপরীত winding
  const p = new THREE.Path();
  const x = cx - w / 2,
    y = cy - h / 2;
  p.moveTo(x + r, y);
  p.absarc(x + r, y + r, r, Math.PI * 1.5, Math.PI, true);
  p.lineTo(x, y + h - r);
  p.absarc(x + r, y + h - r, r, Math.PI, Math.PI / 2, true);
  p.lineTo(x + w - r, y + h);
  p.absarc(x + w - r, y + h - r, r, Math.PI / 2, 0, true);
  p.lineTo(x + w, y + r);
  p.absarc(x + w - r, y + r, r, 0, -Math.PI / 2, true);
  p.lineTo(x + r, y);
  return p;
};

// seeded: কিছু জানালা দেরিতে/বন্ধ — বাস্তব অফিসের মতো
const lateness = (r: number, c: number) => {
  const h = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
  return h - Math.floor(h);
};

export const OfficeTower: React.FC<{
  label?: string;
  lights: number;
  doors?: number;
  signPop?: number;
  time?: number;
  clay?: string;
  accent?: string;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number | [number, number, number];
}> = ({ label = "CORPORATE OFFICE", lights, doors = 0, signPop = 1, time = 0, clay = "#F1E9DE", accent = C.navy, position, rotationY = 0, scale = 1 }) => {
  const { w, h, d } = TOWER;
  const shell = useMemo(() => {
    const b = 0.055; // hole + 2b পাশের hole-এ লাগলে earcut ভেঙে ত্রিভুজ-দাগ হয় — ফাঁক রাখা জরুরি
    const s = roundedRectPath(w - b * 2, h - b * 2, 0.3 - b) as THREE.Shape;
    for (const y of ROWS) for (const x of COLS) s.holes.push(holeAt(x, y - h / 2, WIN.w + b * 2, WIN.h + b * 2, WIN.r + b));
    s.holes.push(holeAt(0, LOBBY.y0 + LOBBY.h / 2 - h / 2 + 0.02, LOBBY.w + b * 2, LOBBY.h + b * 2, 0.09 + b));
    const g = new THREE.ExtrudeGeometry(s, { depth: d - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.9, bevelSegments: 6, curveSegments: 10 });
    g.translate(0, h / 2, -(d - b * 2) / 2);
    g.computeVertexNormals();
    return g;
  }, []);
  // core: জানালার পেছনে (সামনের তল থেকে 0.16 ভেতরে), lobby-র উপরে
  const coreTop = h - 0.25,
    coreBot = 1.2;
  const core = useMemo(() => slabGeo(w - 0.3, coreTop - coreBot, d - 0.34, 0.08, 0.03, 2), []);
  const pane = useMemo(() => slabGeo(WIN.w + 0.06, WIN.h + 0.06, 0.02, 0.05, 0.008, 2), []);
  const lobbyBack = useMemo(() => slabGeo(LOBBY.w + 0.1, LOBBY.h + 0.1, 0.05, 0.05, 0.02, 2), []);
  const canopy = useMemo(() => slabGeo(1.5, 0.09, 0.62, 0.04, 0.035, 4), []);
  const sign = useMemo(() => pillGeo(1.7, 0.36, 0.16, 0.06), []);
  const leafW = LOBBY.w / 2 - 0.02,
    leafH = LOBBY.h - 0.04;
  const leafFrame = useMemo(() => frameGeo({ w: leafW, h: leafH, depth: 0.045, r: 0.03, doorW: leafW - 0.08, doorH: leafH - 0.08, doorR: 0.02, doorCy: 0, bevel: 0.012 }), []);
  const leafPane = useMemo(() => slabGeo(leafW - 0.07, leafH - 0.07, 0.014, 0.02, 0.005, 2), []);
  const slide = Math.max(0, Math.min(1, doors)) * leafW * 0.9;
  const glassOff = new THREE.Color("#5F86A8");
  const warm = new THREE.Color("#FFD38A");
  const winZ = d / 2 - 0.17 + 0.012;
  const lobbyOn = Math.min(1, lights * 3);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale as any}>
      <mesh geometry={shell} castShadow receiveShadow>
        <ClayMat color={clay} />
      </mesh>
      <mesh geometry={core} position={[0, (coreTop + coreBot) / 2, 0]}>
        <ClayMat color="#CFC6BA" />
      </mesh>
      {/* জানালার কাচ: তলা ধরে জ্বলে */}
      {ROWS.map((y, r) =>
        COLS.map((x, c) => {
          const at = r / ROWS.length + lateness(r, c) * 0.08;
          const on = Math.max(0, Math.min(1, (lights - at) * 10)) * (lateness(c, r + 3) > 0.12 ? 1 : 0);
          const col = glassOff.clone().lerp(warm, on);
          return (
            <mesh key={r + "_" + c} geometry={pane} position={[x, y, winZ]}>
              <meshPhysicalMaterial color={col} roughness={0.08} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.4} emissive="#FFB65A" emissiveIntensity={on * 0.9} />
            </mesh>
          );
        })
      )}
      {/* lobby */}
      <mesh geometry={lobbyBack} position={[0, LOBBY.y0 + LOBBY.h / 2, 0.1]}>
        <meshStandardMaterial color={new THREE.Color("#D9D2C9").lerp(new THREE.Color("#F4A866"), lobbyOn)} emissive="#F2873A" emissiveIntensity={0.35 * lobbyOn} roughness={0.9} />
      </mesh>
      {lobbyOn > 0.01 && <pointLight position={[0, LOBBY.y0 + 0.8, 0.5]} intensity={2.2 * lobbyOn} distance={2.6} decay={2} color="#FF9A4A" />}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (leafW / 2 + 0.01 + slide), LOBBY.y0 + 0.02 + leafH / 2, d / 2 - 0.2]}>
          <mesh geometry={leafFrame} castShadow>
            <Satin color="#cfd4d8" rough={0.3} />
          </mesh>
          <mesh geometry={leafPane}>
            <ShopGlass />
          </mesh>
        </group>
      ))}
      {/* canopy */}
      <mesh geometry={canopy} position={[0, LOBBY.y0 + LOBBY.h + 0.12, d / 2 + 0.22]} castShadow receiveShadow>
        <PolishedClay color={accent} rough={0.45} coat={0.35} />
      </mesh>
      {/* facade sign (উপরের band) */}
      <group position={[0, h - 0.27, d / 2 + 0.04]}>
        <mesh geometry={sign} castShadow>
          <PolishedClay color={accent} rough={0.5} coat={0.35} />
        </mesh>
        <Txt size={Math.min(0.17, (1.7 * 0.84) / (label.length * 0.66))} color="#ffffff" position={[0, -0.004, 0.09]} letterSpacing={0.02}>
          {label}
        </Txt>
      </group>
      {/* roof: plinth + briefcase */}
      <group position={[0, h, 0]}>
        <RoofPlinth w={0.9} />
        {signPop > 0.001 && (
          <group position={[0, 0.37 + (1 - signPop) * 0.6, 0]} scale={Math.max(0, signPop)} rotation={[0, 0.3 + Math.sin(time * 0.8) * 0.15, 0]}>
            <Briefcase scale={0.9} />
          </group>
        )}
      </group>
    </group>
  );
};
