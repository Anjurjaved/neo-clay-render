// iPad Air 11" — 247.6 × 178.5 × 6.1 mm (1 unit = 10 cm), flat aluminium rails, uniform slim bezel,
// front camera on the long (landscape-top) edge, single rear lens. Geometry is landscape; `turn` 0 = portrait, 1 = landscape.
// DOM: landscape 1180×820, portrait 820×1180 (exact world aspect).
//   <Stage screens={[ipadScreen({...pose, turn}, <UI/>, { layout: "landscape" })]}> <IPad {...pose} turn={turn}/> </Stage>
import React, { useMemo } from "react";
import * as THREE from "three";
import { slabGeo, roundedCylGeo } from "../../kit/Geo";
import { ScreenSpec, toMatrix } from "../../kit/Screens";
import { AluMat, LensGlass, G, Pose, V3 } from "./common";

export type IPadColor = "spacegrey" | "starlight" | "blue";
const COL: Record<IPadColor, string> = { spacegrey: "#86888c", starlight: "#e2dbcf", blue: "#a8b8c9" };
const IN = 0.01; // glass inset
const BEZ = 0.0955;
export const IPAD = { w: 2.476, h: 1.785, d: 0.061, r: 0.18, sw: 1180, sh: 820 };
const S_W = IPAD.w - 2 * (IN + BEZ);
const S_H = (S_W * IPAD.sh) / IPAD.sw;

export const IPad: React.FC<{ position?: V3; rotation?: V3; scale?: number; turn?: number; color?: IPadColor }> = ({ turn = 1, color = "spacegrey", ...p }) => {
  const { w, h, d, r } = IPAD;
  const g = useMemo(() => {
    const body = slabGeo(w, h, d - 0.012, r, 0.012, 5); // flat rails, tight radius (iPad Air)
    const glass = slabGeo(w - IN * 2, h - IN * 2, 0.012, r - IN, 0.005, 3);
    const cam = roundedCylGeo(0.012, 0.004, 0.0015, 24);
    const rearRing = roundedCylGeo(0.06, 0.02, 0.008, 48);
    const rearGlass = roundedCylGeo(0.044, 0.024, 0.005, 48);
    const btn = slabGeo(0.16, 0.024, 0.024, 0.012, 0.008, 3);
    const vol = slabGeo(0.12, 0.024, 0.024, 0.012, 0.008, 3);
    return { body, glass, cam, rearRing, rearGlass, btn, vol };
  }, []);
  const rz = (1 - turn) * (Math.PI / 2);
  return (
    <G {...p}>
      <group rotation={[0, 0, rz]}>
        <mesh geometry={g.body} castShadow receiveShadow>
          <AluMat color={COL[color]} rough={0.5} />
        </mesh>
        <mesh geometry={g.glass} position={[0, 0, d / 2 - 0.006]}>
          <meshPhysicalMaterial color="#050607" roughness={0.06} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.3} />
        </mesh>
        {/* front camera on the landscape top bezel */}
        <mesh geometry={g.cam} position={[0, h / 2 - IN - BEZ / 2, d / 2 + 0.0005]} rotation={[Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial color="#10141e" roughness={0.05} clearcoat={1} />
        </mesh>
        {/* rear: aluminium back is the body itself; single lens top-left as seen from behind */}
        <group position={[w / 2 - 0.16, h / 2 - 0.16, -d / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={g.rearRing} castShadow>
            <AluMat color={COL[color]} rough={0.3} />
          </mesh>
          <mesh geometry={g.rearGlass}>
            <LensGlass />
          </mesh>
        </group>
        {/* top button (landscape top-left corner rail) + volume on the right rail */}
        <mesh geometry={g.btn} position={[-w / 2 + 0.32, h / 2 + 0.007, 0]} castShadow>
          <AluMat color={COL[color]} rough={0.4} />
        </mesh>
        {[0.42, 0.6].map((x, i) => (
          <mesh key={i} geometry={g.vol} position={[w / 2 - x, h / 2 + 0.007, 0]} castShadow>
            <AluMat color={COL[color]} rough={0.4} />
          </mesh>
        ))}
      </group>
    </G>
  );
};

/** layout = which DOM layout is drawn; during a turn the layout rotates with the glass (iPadOS reflows after) */
export const ipadScreen = (p: Pose & { turn?: number }, content: React.ReactNode, opts: Partial<ScreenSpec> & { layout?: "landscape" | "portrait" } = {}): ScreenSpec => {
  const { layout = "landscape", ...rest } = opts;
  const rz = (1 - (p.turn ?? 1)) * (Math.PI / 2) - (layout === "portrait" ? Math.PI / 2 : 0);
  const land = layout === "landscape";
  return {
    matrix: toMatrix(p.position, p.rotation, p.scale ?? 1, p.parent)
      .multiply(new THREE.Matrix4().makeRotationZ(rz))
      .multiply(new THREE.Matrix4().makeTranslation(0, 0, IPAD.d / 2 + 0.003)),
    w: land ? S_W : S_H,
    h: land ? S_H : S_W,
    px: land ? IPAD.sw : IPAD.sh,
    py: land ? IPAD.sh : IPAD.sw,
    radius: 26,
    bg: "#000",
    content,
    ...rest,
  };
};
