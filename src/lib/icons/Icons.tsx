// Clay icon components — one fused SDF mesh per icon (bake.ts), one shared glossy-clay material.
// Usage: <MapPin position={…} scale={0.6} color="#F5952B" accent="#F6EFE6" />. Icons are ~2 world units tall at scale 1.
import React, { useMemo } from "react";
import * as THREE from "three";
import { clayNoise } from "../../kit/Clay";
import { bakeIcon, paintIcon } from "./bake";
import { DEFS, PAL } from "./defs";

export type IconProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  /** main clay colour */
  color?: string;
  /** painted accent zone (tick, seal, LED …) */
  accent?: string;
  /** third painted zone (slots, keyhole, door …) */
  ink?: string;
  /** marching-cubes resolution (128 hero, 72 for small grid use) */
  res?: number;
  opacity?: number;
};

/** glossy clay: soft-touch base with a light clearcoat sheen */
export const IconMat: React.FC<{ gloss?: number; opacity?: number }> = ({ gloss = 0, opacity = 1 }) => (
  <meshPhysicalMaterial
    vertexColors
    roughness={0.46 - gloss * 0.14}
    metalness={0}
    clearcoat={0.42 + gloss * 0.45}
    clearcoatRoughness={0.3 - gloss * 0.12}
    sheen={0.4}
    sheenRoughness={0.8}
    sheenColor="#ffe0cc"
    bumpMap={clayNoise()}
    bumpScale={0.06}
    envMapIntensity={0.95}
    transparent={opacity < 1}
    opacity={opacity}
  />
);

/** generic clay icon by key (see ICON_KEYS) */
export const ClayIcon: React.FC<IconProps & { name: string; params?: Record<string, number>; children?: React.ReactNode }> = ({
  name,
  position,
  rotation,
  scale = 1,
  color,
  accent,
  ink,
  res = 128,
  opacity = 1,
  params,
  children,
}) => {
  const def = DEFS[name];
  const base = useMemo(() => bakeIcon(def, res), [def, res]);
  const pkey = params ? JSON.stringify(params) : "";
  const geo = useMemo(
    () => paintIcon(base, def, color ?? def.color, accent ?? def.accent, ink ?? def.ink, params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, def, color, accent, ink, pkey]
  );
  return (
    <group position={position} rotation={rotation as any} scale={scale as any}>
      <mesh geometry={geo} castShadow receiveShadow>
        <IconMat gloss={def.gloss} opacity={opacity} />
      </mesh>
      {children}
    </group>
  );
};

const mk = (name: string) => {
  const C: React.FC<IconProps> = (p) => <ClayIcon name={name} {...p} />;
  C.displayName = name;
  return C;
};

export const Tooth = mk("tooth");
export const MapPin = mk("map-pin");
export const ShieldCheck = mk("shield-check");
export const Padlock = mk("padlock");
export const Key = mk("key");
export const Globe = mk("globe");
export const Server = mk("server");
export const Cloud = mk("cloud");
/** spin = rotation (rad) about the gear axle */
export const Gear: React.FC<IconProps & { spin?: number }> = ({ spin = 0, position, rotation, scale = 1, ...p }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    <ClayIcon name="gear" rotation={[0, 0, spin]} {...p} />
  </group>
);
export const Wrench = mk("wrench");
export const Magnifier = mk("magnifier");
export const Envelope = mk("envelope");
/** swing = pendulum angle (rad) about the top loop */
export const Bell: React.FC<IconProps & { swing?: number }> = ({ swing = 0, position, rotation, scale = 1, ...p }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    <group position={[0, 0.8, 0]} rotation={[0, 0, swing]}>
      <ClayIcon name="bell" position={[0, -0.8, 0]} {...p} />
    </group>
  </group>
);
export const ChartUp = mk("chart-up");
export const Star = mk("star");
export const Calendar = mk("calendar");

/** analogue clock: hours = 0..12 float (10.25 = 10:15); hands pivot on the centre boss */
export const Clock: React.FC<IconProps & { hours?: number; handColor?: string }> = ({ hours = 10.15, handColor = PAL.navy, ...p }) => {
  const hourG = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.055, 0.34, 8, 24);
    g.translate(0, 0.17, 0);
    return g;
  }, []);
  const minG = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.04, 0.52, 8, 24);
    g.translate(0, 0.26, 0);
    return g;
  }, []);
  const hA = -((hours % 12) / 12) * Math.PI * 2;
  const mA = -(((hours * 60) % 60) / 60) * Math.PI * 2;
  const handMat = (
    <meshPhysicalMaterial color={handColor} roughness={0.4} clearcoat={0.5} clearcoatRoughness={0.25} sheen={0.3} sheenColor="#ffe0cc" />
  );
  return (
    <ClayIcon name="clock" {...p}>
      <mesh geometry={hourG} position={[0, 0, 0.13]} rotation={[0, 0, hA]} scale={[1, 1, 0.6]} castShadow>
        {handMat}
      </mesh>
      <mesh geometry={minG} position={[0, 0, 0.18]} rotation={[0, 0, mA]} scale={[1, 1, 0.6]} castShadow>
        {handMat}
      </mesh>
      <mesh position={[0, 0, 0.2]} scale={[1, 1, 0.55]} castShadow>
        <sphereGeometry args={[0.085, 32, 20]} />
        <meshPhysicalMaterial color={p.accent ?? PAL.orange} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
    </ClayIcon>
  );
};

/** sand = 0 (all on top) … 1 (all fallen) */
export const Hourglass: React.FC<IconProps & { sand?: number }> = ({ sand = 0.35, ...p }) => <ClayIcon name="hourglass" params={{ sand: Math.round(sand * 60) / 60 }} {...p} />;
export const Megaphone = mk("megaphone");
export const Cart = mk("cart");
export const ShoppingBag = mk("shopping-bag");
export const DocumentIcon = mk("document");
export const Stamp = mk("stamp");
export const PhoneHandset = mk("phone-handset");
export const ChatBubble = mk("chat-bubble");
export const Rocket = mk("rocket");
export const Lightning = mk("lightning");
export const Heart = mk("heart");
export const Home = mk("home");
export const Users = mk("users");
