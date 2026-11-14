// Phone / Tablet v2 — master-এর মতো আসল ফোন: সরু কালো bezel, বড় গোল কোণ, পাতলা satin frame + lip,
// পাশে button। screen-এর UI আসে Stage-এর `screens` prop থেকে (DOM, perspective-correct):
//   const ph = { position, rotation, scale };
//   <Stage screens={[phoneScreen(ph, <MyUI/>, { kind: "iphone" })]}> <Phone {...ph} kind="iphone"/> </Stage>
// DOM canvas: phone 390×843 px (screen-এর আসল অনুপাত), tablet 1024×700 px। type বড় রাখুন (LESSONS E3)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ScreenSpec, toMatrix } from "./Screens";
import { slabGeo, roundedRectPath } from "./Geo";

export type PhoneKind = "iphone" | "android";
/** world মাপ (scale 1): w 1.0 × h 2.06 × d 0.085; lip = frame-এর সামনের কিনারা, bezel = কালো পাড় */
export const PHONE = { w: 1.0, h: 2.06, d: 0.085, lip: 0.012, bezel: 0.032, sw: 390, sh: 843 };
const R: Record<PhoneKind, number> = { iphone: 0.155, android: 0.12 };
const FRAME: Record<PhoneKind, { color: string; metal: number; rough: number }> = {
  iphone: { color: "#2E3035", metal: 0.85, rough: 0.32 },
  android: { color: "#D8CCBB", metal: 0.65, rough: 0.38 },
};
export const TABLET = { w: 2.3, h: 1.62, d: 0.09, sw: 1024, sh: 700 };

const screenSize = () => {
  const inset = PHONE.lip + PHONE.bezel;
  return { w: PHONE.w - inset * 2, h: PHONE.h - inset * 2, inset };
};
/** DOM px-এ screen-এর corner radius (body-র কোণের সাথে হুবহু সমকেন্দ্রিক) */
export const phoneScreenRadiusPx = (kind: PhoneKind = "iphone") => {
  const s = screenSize();
  return Math.max(8, ((R[kind] - s.inset) / s.w) * PHONE.sw);
};

export const phoneScreen = (
  p: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; parent?: THREE.Matrix4 },
  content: React.ReactNode,
  opts: Partial<ScreenSpec> & { kind?: PhoneKind } = {}
): ScreenSpec => {
  const s = screenSize();
  const { kind = "iphone", ...rest } = opts;
  return {
    matrix: toMatrix(p.position, p.rotation, p.scale ?? 1, p.parent).multiply(new THREE.Matrix4().makeTranslation(0, 0, PHONE.d / 2 + 0.004)),
    w: s.w,
    h: s.h,
    px: PHONE.sw,
    py: Math.round((PHONE.sw * s.h) / s.w),
    radius: phoneScreenRadiusPx(kind),
    content,
    ...rest,
  };
};

export const tabletScreen = (
  p: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; parent?: THREE.Matrix4 },
  content: React.ReactNode,
  opts: Partial<ScreenSpec> = {}
): ScreenSpec => ({
  matrix: toMatrix(p.position, p.rotation, p.scale ?? 1, p.parent).multiply(new THREE.Matrix4().makeTranslation(0, 0, TABLET.d / 2 + 0.004)),
  w: TABLET.w * 0.94,
  h: TABLET.h * 0.91,
  px: TABLET.sw,
  py: TABLET.sh,
  radius: 16,
  content,
  ...opts,
});

const Glass: React.FC = () => <meshPhysicalMaterial color="#07080a" roughness={0.06} metalness={0} clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={1.4} />;

export const Phone: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  kind?: PhoneKind;
}> = ({ position, rotation, scale = 1, kind = "iphone" }) => {
  const { w, h, d, lip } = PHONE;
  const r = R[kind];
  const f = FRAME[kind];
  const body = useMemo(() => slabGeo(w, h, d, r, 0.03, 8), [r]);
  const front = useMemo(() => {
    const g = new THREE.ShapeGeometry(roundedRectPath(w - lip * 2, h - lip * 2, r - lip) as THREE.Shape, 48);
    return g;
  }, [r]);
  const btn = useMemo(() => slabGeo(0.022, 0.16, 0.03, 0.011, 0.008, 2), []);
  const btnL = useMemo(() => slabGeo(0.022, 0.1, 0.03, 0.011, 0.008, 2), []);
  return (
    <group position={position} rotation={rotation as any} scale={scale}>
      {/* satin metal frame body */}
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color={f.color} metalness={f.metal} roughness={f.rough} clearcoat={0.4} clearcoatRoughness={0.3} envMapIntensity={1.1} />
      </mesh>
      {/* front black glass (lip ভেতরে) */}
      <mesh geometry={front} position={[0, 0, d / 2 + 0.002]}>
        <Glass />
      </mesh>
      {/* back glass */}
      <mesh geometry={front} position={[0, 0, -d / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial color={kind === "iphone" ? "#3a3d43" : "#E9E2D6"} roughness={0.25} clearcoat={0.8} />
      </mesh>
      {/* side buttons */}
      <mesh geometry={btn} position={[w / 2 + 0.006, h * 0.18, 0]} castShadow>
        <meshPhysicalMaterial color={f.color} metalness={f.metal} roughness={f.rough} />
      </mesh>
      {kind === "iphone" &&
        [0.28, 0.16].map((y, i) => (
          <mesh key={i} geometry={btnL} position={[-w / 2 - 0.006, h * y, 0]} castShadow>
            <meshPhysicalMaterial color={f.color} metalness={f.metal} roughness={f.rough} />
          </mesh>
        ))}
    </group>
  );
};

export const Tablet: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({ position, rotation, scale = 1 }) => {
  const { w, h, d } = TABLET;
  const body = useMemo(() => slabGeo(w, h, d, 0.1, 0.03, 8), []);
  const front = useMemo(() => new THREE.ShapeGeometry(roundedRectPath(w - 0.02, h - 0.02, 0.09) as THREE.Shape, 48), []);
  return (
    <group position={position} rotation={rotation as any} scale={scale}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color="#2E3035" metalness={0.8} roughness={0.34} clearcoat={0.4} />
      </mesh>
      <mesh geometry={front} position={[0, 0, d / 2 + 0.002]}>
        <Glass />
      </mesh>
    </group>
  );
};

/** DOM status bar — iPhone: dynamic island; android: punch-hole। time দেখানো master-এর মতো ঐচ্ছিক */
export const StatusBar: React.FC<{ dark?: boolean; time?: string; kind?: PhoneKind }> = ({ dark = false, time = "9:41", kind = "iphone" }) => {
  const ink = dark ? "#fff" : "#111";
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 56, zIndex: 50, fontFamily: "-apple-system, 'SF Pro Text', Inter, sans-serif" }}>
      {kind === "iphone" ? (
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 118, height: 34, borderRadius: 20, background: "#000" }} />
      ) : (
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", width: 18, height: 18, borderRadius: 9, background: "#000" }} />
      )}
      {time && <div style={{ position: "absolute", top: kind === "iphone" ? 19 : 15, left: kind === "iphone" ? 40 : 26, fontSize: 17, fontWeight: 600, color: ink }}>{time}</div>}
      <div style={{ position: "absolute", top: kind === "iphone" ? 21 : 17, right: kind === "iphone" ? 30 : 22, display: "flex", gap: 6, alignItems: "flex-end" }}>
        {[5, 8, 11, 14].map((hh, i) => (
          <div key={i} style={{ width: 3.5, height: hh, borderRadius: 1, background: ink }} />
        ))}
        <svg width="17" height="13" viewBox="0 0 17 13" style={{ marginLeft: 3 }}>
          <path d="M8.5 12.2 6 9.4a3.6 3.6 0 0 1 5 0Zm-4.4-4.9 1.2 1.3a4.6 4.6 0 0 1 6.4 0l1.2-1.3a6.4 6.4 0 0 0-8.8 0ZM1 4.2l1.2 1.3a9 9 0 0 1 12.6 0L16 4.2a10.8 10.8 0 0 0-15 0Z" fill={ink} />
        </svg>
        <div style={{ width: 26, height: 13, borderRadius: 4, border: `1.5px solid ${ink}`, padding: 1.5, marginLeft: 3, opacity: 0.9 }}>
          <div style={{ width: "78%", height: "100%", background: ink, borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
};
