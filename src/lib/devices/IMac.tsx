// iMac-style desktop (1 unit = 10 cm): 24"-class 16:9 panel in a thin aluminium body with uniform bezel (no chin),
// bent-sheet aluminium stand (one extruded profile), Magic Keyboard (half-height F-row) and Magic Mouse (one lathe).
//   <Stage screens={[imacScreen(pose, <UI/>)]}> <IMac {...pose}/> <MagicKeyboard .../> <MagicMouse .../> </Stage>
// pose.position = the point on the desk under the stand foot centre.
import React, { useMemo } from "react";
import * as THREE from "three";
import { slabGeo, latheGeo } from "../../kit/Geo";
import { ScreenSpec, toMatrix } from "../../kit/Screens";
import { AluMat, G, Pose, V3, rrFlat } from "./common";
import { buildKeyboard } from "./MacBook";

export type IMacColor = "silver" | "blue" | "orange" | "green";
const BACK: Record<IMacColor, string> = { silver: "#d6d8db", blue: "#8fa7c4", orange: "#e7a27c", green: "#9fbfa6" };
const BEZEL: Record<IMacColor, string> = { silver: "#ececee", blue: "#e6ebf1", orange: "#f3ebe5", green: "#e8eee9" };

export const IMAC = { w: 5.47, h: 3.2, d: 0.115, sw: 1600, sh: 900, bez: 0.13, standH: 1.42, tilt: -0.07 };
const S_W = IMAC.w - 2 * IMAC.bez;
const S_H = (S_W * IMAC.sh) / IMAC.sw;
const PANEL_Y = IMAC.standH + IMAC.h / 2; // display centre above desk
// stand: bent aluminium sheet — foot on the desk, bend at the back, leg leaning forward up to the panel hinge
const ST = { t: 0.075, R: 0.3, cx: -0.4, lean: 0.16, foot: 0.62, hingeY: -0.5, hingeD: 0.12 };
const ST_C = new THREE.Vector2(ST.cx, ST.t / 2 + ST.R);
const ST_E = new THREE.Vector2(ST_C.x - ST.R * Math.cos(ST.lean), ST_C.y + ST.R * Math.sin(ST.lean));
const ST_TOPY = PANEL_Y + ST.hingeY;
const ST_TOP = new THREE.Vector2(ST_E.x + Math.tan(ST.lean) * (ST_TOPY - ST_E.y), ST_TOPY);
const PANEL_Z = ST_TOP.x + ST.t / 2 + ST.hingeD + IMAC.d / 2;

const standGeo = (width: number) => {
  const { t, R } = ST;
  const pts: THREE.Vector2[] = [new THREE.Vector2(ST.foot, t / 2), new THREE.Vector2(ST_C.x, t / 2)];
  const a0 = -Math.PI / 2,
    a1 = -Math.PI - ST.lean;
  for (let i = 1; i <= 16; i++) {
    const a = a0 + ((a1 - a0) * i) / 16;
    pts.push(new THREE.Vector2(ST_C.x + Math.cos(a) * R, ST_C.y + Math.sin(a) * R));
  }
  pts.push(ST_TOP.clone());
  const nrm = (i: number) => {
    const a = pts[Math.max(0, i - 1)],
      b = pts[Math.min(pts.length - 1, i + 1)];
    const d = b.clone().sub(a).normalize();
    return new THREE.Vector2(-d.y, d.x);
  };
  const L = pts.map((q, i) => q.clone().add(nrm(i).multiplyScalar(t / 2)));
  const Rr = pts.map((q, i) => q.clone().sub(nrm(i).multiplyScalar(t / 2)));
  const s = new THREE.Shape();
  s.moveTo(L[0].x, L[0].y);
  L.slice(1).forEach((q) => s.lineTo(q.x, q.y));
  [...Rr].reverse().forEach((q) => s.lineTo(q.x, q.y));
  s.closePath();
  const b = 0.022;
  const g = new THREE.ExtrudeGeometry(s, { depth: width - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.9, bevelSegments: 5, curveSegments: 8 });
  g.translate(0, 0, -(width - b * 2) / 2);
  g.rotateY(-Math.PI / 2); // shape x → world z, extrude → world x
  g.computeVertexNormals();
  return g;
};

export const IMac: React.FC<{ position?: V3; rotation?: V3; scale?: number; color?: IMacColor }> = ({ color = "silver", ...p }) => {
  const { w, h, d, bez, tilt } = IMAC;
  const g = useMemo(() => {
    const body = slabGeo(w, h, d, 0.12, 0.03, 6);
    const front = rrFlat(w - 0.03, h - 0.03, 0.105, 40);
    const stand = standGeo(1.36);
    const hinge = slabGeo(1.2, 0.5, ST.hingeD + 0.02, 0.08, 0.04, 5);
    const panel = rrFlat(S_W + 0.02, S_H + 0.02, 0.012);
    return { body, front, stand, hinge, panel };
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g.stand} castShadow receiveShadow>
        <AluMat color={BACK[color]} rough={0.48} />
      </mesh>
      <group position={[0, PANEL_Y, PANEL_Z]} rotation={[tilt, 0, 0]}>
        <mesh geometry={g.body} castShadow receiveShadow>
          <AluMat color={BACK[color]} rough={0.48} />
        </mesh>
        {/* light bezel glass + black panel area (DOM covers the panel) */}
        <mesh geometry={g.front} position={[0, 0, d / 2 + 0.0015]}>
          <meshPhysicalMaterial color={BEZEL[color]} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.0} />
        </mesh>
        <mesh geometry={g.panel} position={[0, 0, d / 2 + 0.0025]}>
          <meshPhysicalMaterial color="#060708" roughness={0.08} clearcoat={1} />
        </mesh>
        {/* stand hinge block on the back */}
        <mesh geometry={g.hinge} position={[0, ST.hingeY, -d / 2 - ST.hingeD / 2 + 0.01]} castShadow>
          <AluMat color={BACK[color]} rough={0.44} />
        </mesh>
      </group>
    </G>
  );
};

export const imacScreen = (p: Pose, content: React.ReactNode, opts: Partial<ScreenSpec> = {}): ScreenSpec => ({
  matrix: toMatrix(p.position, p.rotation, p.scale ?? 1, p.parent)
    .multiply(new THREE.Matrix4().makeTranslation(0, PANEL_Y, PANEL_Z))
    .multiply(new THREE.Matrix4().makeRotationX(IMAC.tilt))
    .multiply(new THREE.Matrix4().makeTranslation(0, 0, IMAC.d / 2 + 0.004)),
  w: S_W,
  h: S_H,
  px: IMAC.sw,
  py: IMAC.sh,
  radius: 6,
  bg: "#000",
  content,
  ...opts,
});

// ---------- Magic Keyboard (27.9 × 11.5 cm, wedge) ----------
export const MAGIC_KB = { w: 2.79, d: 1.15 };
export const MagicKeyboard: React.FC<{ position?: V3; rotation?: V3; scale?: number; color?: IMacColor }> = ({ color = "silver", ...p }) => {
  const g = useMemo(() => {
    const base = slabGeo(MAGIC_KB.w, MAGIC_KB.d, 0.06, 0.07, 0.02, 5);
    const kb = buildKeyboard({ U: 0.19, top: 0.03, back: -MAGIC_KB.d / 2 + 0.06, fnHalf: true, gap: 0.032, kh: 0.016 });
    return { base, kb };
  }, []);
  // wedge: the slab tilts up toward the back
  return (
    <G {...p}>
      <group rotation={[0.045, 0, 0]} position={[0, 0.03, 0]}>
        <mesh geometry={g.base} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <AluMat color={BACK[color]} rough={0.48} />
        </mesh>
        <mesh geometry={g.kb.keys} castShadow receiveShadow>
          <meshPhysicalMaterial color="#f7f7f5" roughness={0.55} sheen={0.3} sheenColor="#ffffff" envMapIntensity={0.8} />
        </mesh>
      </group>
    </G>
  );
};

// ---------- Magic Mouse (11.35 × 5.71 × 2.16 cm) — one smooth lathe, elongated ----------
export const MagicMouse: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = (p) => {
  const g = useMemo(() => {
    const top = latheGeo(
      [
        [0.0001, 0.012],
        [0.2, 0.012],
        [0.272, 0.03],
        [0.283, 0.06],
        [0.25, 0.105],
        [0.18, 0.15],
        [0.09, 0.172],
        [0.0001, 0.178],
      ],
      96,
      80
    );
    top.scale(1, 1, 1.99);
    const foot = latheGeo(
      [
        [0.0001, 0],
        [0.24, 0],
        [0.262, 0.008],
        [0.266, 0.02],
        [0.0001, 0.02],
      ],
      96,
      20
    );
    foot.scale(1, 1, 1.99);
    return { top, foot };
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g.top} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f2f2f0" roughness={0.38} clearcoat={0.5} clearcoatRoughness={0.3} sheen={0.3} sheenColor="#ffffff" envMapIntensity={0.9} />
      </mesh>
      <mesh geometry={g.foot}>
        <AluMat color="#cfd2d6" rough={0.4} />
      </mesh>
    </G>
  );
};
