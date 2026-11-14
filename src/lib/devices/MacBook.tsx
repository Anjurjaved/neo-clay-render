// MacBook Pro 14" (2021+ design) — real proportions: 31.26 × 22.12 × 1.55 cm (1 world unit = 10 cm).
// Flat-sided aluminium unibody, black keyboard well with full-height function row + Touch ID, speaker grilles
// either side, huge trackpad, hinge barrel, rubber feet, side ports, thumb scoop. Display: thin bezels, notch
// (drawn in DOM, see `MacNotch`), 1512×982 DOM canvas (= 14.2" "looks like" resolution, exact world aspect).
//   const mb = { position, rotation, scale, open };
//   <Stage screens={[macbookScreen(mb, <MyUI/>)]}> <MacBook {...mb} color="silver"/> </Stage>
import React, { useMemo } from "react";
import * as THREE from "three";
import { slabGeo, roundedCylGeo } from "../../kit/Geo";
import { ScreenSpec, toMatrix } from "../../kit/Screens";
import { AluMat, DisplayGlass, SoftBlack, G, Pose, V3, rrFlat, rrRing, merged, mat4, grilleTex } from "./common";

export type MacColor = "silver" | "spacegrey";
const BODY: Record<MacColor, string> = { silver: "#d9dbdd", spacegrey: "#7c7e82" };

export const MACBOOK = {
  w: 3.126,
  d: 2.212,
  baseH: 0.092,
  feet: 0.012,
  lidT: 0.052,
  lidH: 2.15,
  r: 0.105,
  U: 0.186, // key pitch
  sw: 1512,
  sh: 982,
  screenW: 3.02,
  screenCY: 1.098, // screen centre above hinge (lid local y)
};
const S_H = (MACBOOK.screenW * MACBOOK.sh) / MACBOOK.sw; // 1.9614 — exact DOM aspect (LESSONS E8)
const TOP = MACBOOK.feet + MACBOOK.baseH; // keyboard deck height
const PIVOT: V3 = [0, TOP + MACBOOK.lidT / 2 + 0.011, -MACBOOK.d / 2 + 0.036];

/** lid angle: open 0 = closed (lying on the deck), 1 = ~112° working angle */
export const macLidAngle = (open: number) => (1 - open) * (Math.PI / 2) - open * 0.39;

// ---- Apple-layout keyboard (units of U) ----
type K = [number, number?]; // width, height-fraction
const ROWS: K[][] = [
  [[1.5], ...Array(12).fill([1]), [1]], // esc, F1–F12, Touch ID
  [...Array(13).fill([1]), [1.5]],
  [[1.5], ...Array(12).fill([1]), [1]],
  [[1.75], ...Array(11).fill([1]), [1.75]],
  [[2.25], ...Array(10).fill([1]), [2.25]],
  [[1], [1], [1], [1.25], [5], [1.25], [1]], // fn ctrl opt cmd space cmd opt (+ arrows)
];

/** Apple-layout keycaps merged into one geometry, lying on y = top (local x right, z toward the user).
 *  fnHalf: half-height function row (Magic Keyboard) vs full-height (MacBook Pro). */
export const buildKeyboard = (o: { U: number; top: number; back: number; fnHalf?: boolean; gap?: number; kh?: number }) => {
  const { U, top, back, fnHalf = false, gap = 0.03, kh = 0.013 } = o;
  const KW = 14.5 * U;
  const y = top + 0.001 + kh / 2;
  const cache: Record<string, THREE.BufferGeometry> = {};
  const key = (w: number, h: number) => {
    const id = `${w.toFixed(3)}_${h.toFixed(3)}`;
    return (cache[id] ??= slabGeo(w, h, kh, Math.min(0.024, h * 0.2), 0.0055, 3));
  };
  const parts: { g: THREE.BufferGeometry; m: THREE.Matrix4 }[] = [];
  let touchId: V3 = [0, 0, 0];
  let z0 = back;
  ROWS.forEach((row, ri) => {
    const rh = ri === 0 && fnHalf ? U * 0.55 : U;
    let x = -KW / 2;
    const zc = z0 + rh / 2;
    row.forEach(([wu], ci) => {
      const w = wu * U - gap;
      const isTouch = ri === 0 && ci === row.length - 1;
      if (isTouch && !fnHalf) touchId = [x + (wu * U) / 2, y, zc];
      else parts.push({ g: key(w, rh - gap), m: mat4([x + (wu * U) / 2, y, zc], [-Math.PI / 2, 0, 0]) });
      x += wu * U;
    });
    if (ri === 5) {
      const hh = (U - gap * 1.5) / 2;
      parts.push({ g: key(U - gap, U - gap), m: mat4([x + U / 2, y, zc], [-Math.PI / 2, 0, 0]) });
      parts.push({ g: key(U - gap, hh), m: mat4([x + U * 1.5, y, zc - hh / 2 - gap / 4], [-Math.PI / 2, 0, 0]) });
      parts.push({ g: key(U - gap, hh), m: mat4([x + U * 1.5, y, zc + hh / 2 + gap / 4], [-Math.PI / 2, 0, 0]) });
      parts.push({ g: key(U - gap, U - gap), m: mat4([x + U * 2.5, y, zc], [-Math.PI / 2, 0, 0]) });
    }
    z0 += rh;
  });
  return { keys: merged(parts), KW, KD: z0 - back, back, touchId, touch: key(U - gap, U - gap) };
};
const useKeyboard = () => useMemo(() => buildKeyboard({ U: MACBOOK.U, top: TOP - 0.0005, back: -MACBOOK.d / 2 + 0.13, kh: 0.008 }), []);

export const MacBook: React.FC<{ position?: V3; rotation?: V3; scale?: number; open: number; color?: MacColor }> = ({ open, color = "silver", ...p }) => {
  const { w, d, baseH, feet, lidT, lidH, r, U } = MACBOOK;
  const body = BODY[color];
  const kb = useKeyboard();
  const g = useMemo(() => {
    const base = slabGeo(w, d, baseH, r, 0.022, 6);
    const lid = slabGeo(w, lidH, lidT, r, 0.011, 5);
    const glass = rrFlat(w - 0.028, lidH - 0.028, r - 0.014, 40);
    const well = rrFlat(kb.KW + 0.035, kb.KD + 0.03, 0.03);
    const tp = rrFlat(1.36, 0.82, 0.055);
    const tpRing = rrRing(1.372, 0.832, 0.06, 0.008);
    const grille = rrFlat(0.13, kb.KD - 0.03, 0.02);
    const hinge = roundedCylGeo(0.036, w * 0.86, 0.02, 40);
    const foot = roundedCylGeo(0.085, feet + 0.004, 0.006, 32);
    const scoop = rrFlat(0.36, 0.028, 0.014);
    const port = (pw: number, ph: number) => rrFlat(pw, ph, ph * 0.48);
    const ring = rrRing(0.1, 0.1, 0.05, 0.007);
    return { base, lid, glass, well, tp, tpRing, grille, hinge, foot, scoop, mag: port(0.1, 0.022), tb: port(0.085, 0.026), hdmi: port(0.13, 0.04), sd: port(0.2, 0.014), jack: port(0.03, 0.03), ring };
  }, [kb]);
  const gtex = useMemo(() => grilleTex(9, 78), []);
  const ang = macLidAngle(open);
  const sideY = feet + baseH * 0.52;
  return (
    <G {...p}>
      {/* rubber feet */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} geometry={g.foot} position={[sx * (w / 2 - 0.22), (feet + 0.004) / 2, sz * (d / 2 - 0.22)]}>
          <SoftBlack color="#1a1a1c" rough={0.8} />
        </mesh>
      ))}
      {/* unibody base */}
      <mesh geometry={g.base} rotation={[-Math.PI / 2, 0, 0]} position={[0, feet + baseH / 2, 0]} castShadow receiveShadow>
        <AluMat color={body} />
      </mesh>
      {/* keyboard well + keys + Touch ID */}
      <mesh geometry={g.well} rotation={[-Math.PI / 2, 0, 0]} position={[0, TOP + 0.0008, kb.back + kb.KD / 2]}>
        <meshPhysicalMaterial color="#09090a" roughness={0.75} metalness={0} />
      </mesh>
      <mesh geometry={kb.keys} castShadow receiveShadow>
        <SoftBlack color="#141517" rough={0.55} />
      </mesh>
      <mesh geometry={kb.touch} rotation={[-Math.PI / 2, 0, 0]} position={kb.touchId}>
        <meshPhysicalMaterial color="#121315" roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.2} />
      </mesh>
      <mesh geometry={g.ring} rotation={[-Math.PI / 2, 0, 0]} position={[kb.touchId[0], kb.touchId[1] + 0.0045, kb.touchId[2]]} scale={[(U - 0.03) * 9.4, (U - 0.03) * 9.4, 1]}>
        <AluMat color={color === "silver" ? "#4a4d52" : "#3c3e42"} rough={0.35} />
      </mesh>
      {/* speaker grilles */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={g.grille} rotation={[-Math.PI / 2, 0, 0]} position={[s * (kb.KW / 2 + 0.107), TOP + 0.0009, kb.back + kb.KD / 2]}>
          <meshPhysicalMaterial color="#0d0d0f" roughness={0.6} transparent alphaMap={gtex} alphaTest={0.5} />
        </mesh>
      ))}
      {/* trackpad (glass-smooth aluminium) + hairline gap */}
      <mesh geometry={g.tp} rotation={[-Math.PI / 2, 0, 0]} position={[0, TOP + 0.0012, 0.635]} receiveShadow>
        <AluMat color={color === "silver" ? "#d3d6d9" : "#76787c"} rough={0.36} aniso={0} />
      </mesh>
      <mesh geometry={g.tpRing} rotation={[-Math.PI / 2, 0, 0]} position={[0, TOP + 0.0016, 0.635]}>
        <meshBasicMaterial color={color === "silver" ? "#8d9196" : "#4a4c50"} transparent opacity={0.55} />
      </mesh>
      {/* front thumb scoop */}
      <mesh geometry={g.scoop} position={[0, feet + baseH * 0.62, d / 2 + 0.0015]}>
        <AluMat color={color === "silver" ? "#a9adb1" : "#55575b"} rough={0.6} />
      </mesh>
      {/* ports — left: MagSafe, 2× TB, jack | right: SDXC, TB, HDMI */}
      {(
        [
          [-1, -0.62, "mag"],
          [-1, -0.42, "tb"],
          [-1, -0.27, "tb"],
          [-1, 0.72, "jack"],
          [1, -0.15, "sd"],
          [1, 0.18, "tb"],
          [1, 0.42, "hdmi"],
        ] as [number, number, keyof typeof g][]
      ).map(([sx, z, k], i) => (
        <mesh key={i} geometry={g[k] as THREE.BufferGeometry} position={[sx * (w / 2 + 0.0015), sideY, z]} rotation={[0, (sx * Math.PI) / 2, 0]}>
          <meshPhysicalMaterial color="#060607" roughness={0.5} />
        </mesh>
      ))}
      {/* hinge barrel */}
      <mesh geometry={g.hinge} rotation={[0, 0, Math.PI / 2]} position={[0, TOP + 0.01, PIVOT[2] - 0.004]} castShadow>
        <meshPhysicalMaterial color={color === "silver" ? "#3a3c40" : "#2a2b2e"} metalness={0.7} roughness={0.42} />
      </mesh>
      {/* lid */}
      <group position={PIVOT} rotation={[ang, 0, 0]}>
        <mesh geometry={g.lid} position={[0, lidH / 2, 0]} castShadow receiveShadow>
          <AluMat color={body} />
        </mesh>
        <mesh geometry={g.glass} position={[0, lidH / 2, lidT / 2 + 0.0015]}>
          <DisplayGlass />
        </mesh>
      </group>
    </G>
  );
};

/** DOM screen spec for the MacBook display (1512×982 px, notch drawn by content via <MacNotch/>) */
export const macbookScreen = (p: Pose & { open: number }, content: React.ReactNode, opts: Partial<ScreenSpec> = {}): ScreenSpec => {
  const m = toMatrix(p.position, p.rotation, p.scale ?? 1, p.parent)
    .multiply(new THREE.Matrix4().makeTranslation(...PIVOT))
    .multiply(new THREE.Matrix4().makeRotationX(macLidAngle(p.open)))
    .multiply(new THREE.Matrix4().makeTranslation(0, MACBOOK.screenCY, MACBOOK.lidT / 2 + 0.0035));
  return { matrix: m, w: MACBOOK.screenW, h: S_H, px: MACBOOK.sw, py: MACBOOK.sh, radius: 14, bg: "#000", content, ...opts };
};

/** the camera housing notch (top-centre of the display) — put inside the DOM content, above everything */
export const MacNotch: React.FC = () => (
  <div style={{ position: "absolute", top: 0, left: "50%", width: 196, height: 38, marginLeft: -98, background: "#000", borderRadius: "0 0 13px 13px", zIndex: 999 }}>
    <div style={{ position: "absolute", left: "50%", top: 13, width: 11, height: 11, marginLeft: -5.5, borderRadius: 6, background: "radial-gradient(circle at 40% 40%, #2b3a55 0%, #0b0f18 60%)" }} />
  </div>
);

/** MacBook footprint helpers for layout */
export const macbookSpan = (yaw: number) => MACBOOK.w * Math.abs(Math.cos(yaw)) + MACBOOK.d * Math.abs(Math.sin(yaw));
