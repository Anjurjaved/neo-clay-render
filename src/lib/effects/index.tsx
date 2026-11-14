// effects group — showcase-গুলো। প্রতিটা effect একটা সরল polished বস্তুর উপর দেখানো।
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage, FLOOR, DEFAULT_CAM } from "../../kit/Stage";
import { FPS } from "../../kit/time";
import { popIn, springStep, wobble, smoothstep } from "../../kit/anim";
import { CheckBadge } from "../../kit/Soft";
import { C } from "../../kit/theme";
import { LibItem } from "../types";
import { Confetti } from "./Confetti";
import { SparkleBurst } from "./SparkleBurst";
import { GlowRing } from "./GlowRing";
import { FloorRipple, RippleSource } from "./FloorRipple";
import { LightSweep, sweepProgress } from "./LightSweep";
import { CoinBurst, coinGeo, COIN_T } from "./CoinBurst";
import { Handoff, handoffRipples } from "./handoff";
import { camChain, camPushIn, camOrbit, camParallaxRise, camBreath } from "./camera";
import { BadgeOnPedestal, Pedestal, GlossBall, LabelCard, G } from "./showpieces";

const useT = () => useCurrentFrame() / FPS;
/** hero বস্তুর গভীরতা — ক্যামেরার কাছে, যাতে frame-এর নিচের অংশও ভরে (LESSONS D13) */
const Z = 2;
/** clay pop wrapper (floor থেকে স্কেল) */
const Pop: React.FC<{ t: number; at: number; position: [number, number, number]; scale?: number; rotation?: [number, number, number]; children: React.ReactNode }> = ({ t, at, position, scale = 1, rotation, children }) => {
  if (t < at) return null;
  const p = popIn(t, at, { k: 230, c: 15 });
  return (
    <group position={position} rotation={rotation as any} scale={[scale * p.s * p.sx, scale * p.s * p.sy, scale * p.s]}>
      {children}
    </group>
  );
};

// ---------- 1. confetti ----------
const ConfettiShow: React.FC = () => {
  const t = useT();
  return (
    <Stage>
      <Pop t={t} at={0.1} position={[0, FLOOR, Z]} scale={1.35} rotation={[0, -0.32, 0]}>
        <BadgeOnPedestal />
      </Pop>
      <Confetti t={t} at={0.55} origin={[0, FLOOR + 3.0, Z + 0.2]} count={64} seed={21} size={1.5} spread={1.35} lift={0.85} toward={1.0} depth={0.5} />
    </Stage>
  );
};

// ---------- 2. sparkle burst ----------
const SparkleShow: React.FC = () => {
  const t = useT();
  const s = 1.35;
  return (
    <Stage>
      <Pop t={t} at={0.1} position={[0, FLOOR, Z]} scale={s} rotation={[0, -0.32, 0]}>
        <BadgeOnPedestal color={C.navy} />
      </Pop>
      <SparkleBurst t={t} at={0.55} origin={[0, FLOOR + 1.36 * s, Z + 0.3]} radius={1.6} count={12} dots={18} duration={2.2} seed={8} size={1.45} />
    </Stage>
  );
};

// ---------- 3. glow ring ----------
const GlowShow: React.FC = () => {
  const t = useT();
  const land = springStep(t - 0.15, { k: 120, c: 11 });
  return (
    <Stage>
      <GlowRing t={t} at={0.6} radius={2.3} position={[0, FLOOR, Z]} period={1.3} intensity={1.15}>
        <Pop t={t} at={0.05} position={[0, FLOOR, Z]} scale={1.35} rotation={[0, -0.3, 0]}>
          <Pedestal />
          <GlossBall r={0.78} position={[0, 0.49 + 0.78 + (1 - land) * 2.2, 0]} />
        </Pop>
      </GlowRing>
    </Stage>
  );
};

// ---------- 4. floor ripple ----------
const BALL = { r: 1.05, h0: 4.6, g: 14 };
const ballY = (u: number) => {
  // ড্রপ + দুটো ছোট bounce (closed form)
  const rest = FLOOR + BALL.r;
  const drop = BALL.h0 - rest;
  const t1 = Math.sqrt((2 * drop) / BALL.g);
  if (u < t1) return { y: BALL.h0 - (BALL.g * u * u) / 2, hit: [t1] };
  let v = BALL.g * t1 * 0.36;
  let s = t1;
  const hits = [t1];
  for (let i = 0; i < 3; i++) {
    const tb = (2 * v) / BALL.g;
    hits.push(s + tb);
    if (u < s + tb) {
      const w = u - s;
      return { y: rest + v * w - (BALL.g * w * w) / 2, hit: hits };
    }
    s += tb;
    v *= 0.38;
  }
  return { y: rest, hit: hits };
};
const RippleShow: React.FC = () => {
  const t = useT();
  const u = t - 0.25;
  const b = u > 0 ? ballY(u) : { y: BALL.h0, hit: [] as number[] };
  const all = ballY(99).hit;
  const lastHit = all.filter((h) => h <= u).pop();
  const sq = lastHit !== undefined ? wobble(u - lastHit, 0.22 * Math.pow(0.4, all.indexOf(lastHit)), 3.2, 0.3) : 0;
  const sources: RippleSource[] = all.slice(0, 3).map((h, i) => ({ x: 0, z: Z, at: 0.25 + h, amp: [0.11, 0.045, 0.018][i] }));
  return (
    <Stage>
      <FloorRipple t={t} sources={sources} center={[0, Z]} />
      {u > 0 && (
        <group position={[0, Math.max(FLOOR, b.y - BALL.r), Z]} scale={[1 + sq * 0.5, 1 - sq, 1 + sq * 0.5]}>
          <GlossBall r={BALL.r} position={[0, BALL.r, 0]} />
        </group>
      )}
    </Stage>
  );
};

// ---------- 5. light sweep ----------
const SweepShow: React.FC = () => {
  const t = useT();
  const p = t < 2.2 ? sweepProgress(t, 0.6, 1.2) : sweepProgress(t, 2.6, 1.2);
  const bob = Math.sin(t * 1.4) * 0.04;
  return (
    <Stage>
      <Pop t={t} at={0.1} position={[0, -0.75 + bob, Z]} rotation={[0.05, -0.36, 0]}>
        <LightSweep progress={p} intensity={1.0}>
          <LabelCard w={3.5} h={2.2} />
          <CheckBadge position={[1.42, 0.82, 0.24]} scale={0.62} />
        </LightSweep>
      </Pop>
    </Stage>
  );
};

// ---------- 6. coin burst ----------
const CoinShow: React.FC = () => {
  const t = useT();
  const s = 1.2;
  // বোতাম চাপ: 0.45-এ নামে, spring দিয়ে ফেরে
  const press = t < 0.42 ? 0 : t < 0.52 ? smoothstep(0.42, 0.52, t) : 1 - springStep(t - 0.52, { k: 260, c: 9 });
  return (
    <Stage>
      <Pop t={t} at={0.05} position={[0, FLOOR, Z]} scale={s} rotation={[0, -0.3, 0]}>
        <Pedestal />
        <group position={[0, 0.5, 0]} scale={[1, 1 - press * 0.45, 1]}>
          <CheckBadge rotation={[-Math.PI / 2, 0, 0]} scale={1.5} tick={0} />
        </group>
      </Pop>
      <CoinBurst t={t} at={0.55} origin={[0, FLOOR + 0.95 * s, Z]} count={15} seed={4} size={1.1} clearRadius={1.25 * s + 0.12} lift={0.95} spread={0.8} depth={1.1} />
    </Stage>
  );
};

// ---------- 7. scene hand-off ----------
const HANDOFF_AT = 1.55;
const SINKERS: { x: number; z: number; h: number; pop: number }[] = [
  { x: -1.4, z: 1.0, h: 1.8, pop: 0.05 },
  { x: -0.2, z: 2.0, h: 1.1, pop: 0.15 },
  { x: 0.85, z: 1.1, h: 1.4, pop: 0.25 },
  { x: 1.6, z: 2.4, h: 0.5, pop: 0.35 },
];
const HandoffShow: React.FC = () => {
  const t = useT();
  const ho = { originX: -2.6, perUnit: 0.11 };
  const rip = handoffRipples(HANDOFF_AT, SINKERS.map((s) => ({ x: s.x, z: s.z, amp: 0.025 + s.h * 0.012 })), ho);
  const stack = React.useMemo(() => coinGeo(), []);
  return (
    <Stage cam={{ pos: [0, 2.2, 18.5], target: [0, -0.9, 1.5], fov: 27 }}>
      <FloorRipple t={t} sources={rip} center={[0, 1.5]} />
      <Pop t={t} at={SINKERS[0].pop} position={[SINKERS[0].x, FLOOR, SINKERS[0].z]} scale={0.62} rotation={[0, -0.3, 0]}>
        <Handoff t={t} at={HANDOFF_AT} x={SINKERS[0].x} height={SINKERS[0].h} {...ho}>
          <BadgeOnPedestal />
        </Handoff>
      </Pop>
      <Pop t={t} at={SINKERS[1].pop} position={[SINKERS[1].x, FLOOR, SINKERS[1].z]}>
        <Handoff t={t} at={HANDOFF_AT} x={SINKERS[1].x} height={SINKERS[1].h} {...ho}>
          <GlossBall r={0.52} position={[0, 0.52, 0]} color={C.navy} />
        </Handoff>
      </Pop>
      <Pop t={t} at={SINKERS[2].pop} position={[SINKERS[2].x, FLOOR, SINKERS[2].z]} rotation={[0, -0.4, 0]}>
        <Handoff t={t} at={HANDOFF_AT} x={SINKERS[2].x} height={SINKERS[2].h} {...ho}>
          <LabelCard w={1.3} h={1.3} title="SEO" sub="RANK" position={[0, 0.67, 0]} />
        </Handoff>
      </Pop>
      <Pop t={t} at={SINKERS[3].pop} position={[SINKERS[3].x, FLOOR, SINKERS[3].z]}>
        <Handoff t={t} at={HANDOFF_AT} x={SINKERS[3].x} height={SINKERS[3].h} {...ho}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} geometry={stack} position={[Math.sin(i * 2.1) * 0.015, COIN_T * (i + 0.5) * 1.15, 0]} rotation={[0, i * 0.7, 0]} scale={1.15} castShadow receiveShadow>
              <meshPhysicalMaterial color="#E7B04B" metalness={1} roughness={0.3} clearcoat={0.3} />
            </mesh>
          ))}
        </Handoff>
      </Pop>
      {/* পরের scene: ফাঁকা stage-এ নতুন বিষয় */}
      <Pop t={t} at={3.75} position={[0, FLOOR, 1.8]} scale={1.25} rotation={[0, -0.3, 0]}>
        <BadgeOnPedestal />
      </Pop>
    </Stage>
  );
};

// ---------- 8. camera presets ----------
const CameraShow: React.FC = () => {
  const t = useT();
  const cam = camBreath(
    camChain(
      t,
      [
        (u, base) => camPushIn(u, 0.2, 1.9, { base, amount: 0.3 }),
        (u, base) => camOrbit(u, 1.9, 3.9, { base, angle: 0.62, lift: 0.4 }),
        (u, base) => camParallaxRise(u, 3.9, 5.8, { base, rise: 3.4, dolly: 1.6, drift: -0.5 }),
      ],
      [1.9, 3.9, 5.8],
      DEFAULT_CAM
    ),
    t,
    0.035
  );
  const stack = React.useMemo(() => coinGeo(), []);
  return (
    <Stage cam={cam}>
      <G position={[-1.05, FLOOR + 1.1, -4.5]} rotation={[0, 0.25, 0]}>
        <LabelCard w={2.6} h={2.2} title="24/7" sub="ONLINE" />
      </G>
      <G position={[0.2, FLOOR, 0]} rotation={[0, -0.3, 0]} scale={1.05}>
        <BadgeOnPedestal />
      </G>
      <G position={[1.0, FLOOR, 3.2]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} geometry={stack} position={[Math.sin(i * 2.1) * 0.012, COIN_T * (i + 0.5) * 1.1, 0]} rotation={[0, i * 0.7, 0]} scale={1.1} castShadow receiveShadow>
            <meshPhysicalMaterial color="#E7B04B" metalness={1} roughness={0.3} clearcoat={0.3} />
          </mesh>
        ))}
      </G>
    </Stage>
  );
};

const E = (id: string, name: string, nameBn: string, duration: number, still: number, Comp: React.FC, tags: string[], note: string): LibItem => ({ id, name, nameBn, group: "effects", kind: "component", duration, still, tags, note, Comp });

export const ITEMS: LibItem[] = [
  E("effects-confetti", "Confetti burst", "কনফেটি বিস্ফোরণ", 5, 1.5, ConfettiShow, ["cta", "stat", "checklist", "before_after"], "<Confetti t at origin count seed spread lift clearAt/> — seeded drag-ballistics, flutter, lands flat"),
  E("effects-sparkle-burst", "Sparkle burst", "ঝিকিমিকি তারা", 4, 1.4, SparkleShow, ["answer", "title", "cta", "stat"], "<SparkleBurst t at origin radius count dots duration/> — soft bevelled 4-point glints"),
  E("effects-glow-ring", "Floor glow halo", "নিচে আলোর আভা", 4.5, 2.2, GlowShow, ["answer", "persona", "compare", "price"], "<GlowRing t at radius position period until out>{obj}</GlowRing> — soft floor pool + light waves"),
  E("effects-floor-ripple", "Floor ripple", "floor-এ ঢেউ", 4.5, 1.4, RippleShow, ["title", "stat", "cta"], "<FloorRipple t sources=[{x,z,at,amp}]/> — floor itself waves (seamless stage shader)"),
  E("effects-light-sweep", "Light sweep", "আলোর ঝলক", 4, 1.15, SweepShow, ["title", "price", "cta", "answer"], "<LightSweep progress={sweepProgress(t,t0,dur)}>{obj}</LightSweep> — sheen band over any object"),
  E("effects-coin-burst", "Coin burst", "কয়েন ফোয়ারা", 4.5, 1.0, CoinShow, ["price", "stat", "compare"], "<CoinBurst t at origin count seed clearAt/> — flip, bounce, Euler-disk settle"),
  E("effects-scene-handoff", "Scene hand-off sink wave", "scene বদল — ঢেউয়ে ডোবা", 5, 2.1, HandoffShow, ["title", "points", "steps", "timeline", "cta"], "<Handoff t at x height originX>{obj}</Handoff> + handoffRipples() → FloorRipple; mode='shrink' for DOM devices"),
  E("effects-camera-presets", "Camera presets", "ক্যামেরা চলন", 6, 3.0, CameraShow, ["title", "persona", "compare", "cta"], "camPushIn / camOrbit / camParallaxRise / camBlend / camBreath / camChain → Cam"),
];
