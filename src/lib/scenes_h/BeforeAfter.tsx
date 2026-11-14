// SceneBeforeAfter — one clay world, one business, transformed in place:
//  BEFORE (night, shutter half down, dark interior, phone piling up missed calls/messages, red stat)
//  → flip on the "after" word (light sweep, shutter rolls up, interior + sign light up, BEFORE pill flips to AFTER)
//  → customers walk in through the door, phone fills with new orders, 3D order tickets pop, stat flips & counts up.
// Everything enters from an empty stage and fully exits in the last ~0.5 s.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { springStep, wobble, popIn, tween, range, emphDecel, drift, pathDistance, speedAt, headingAt, smoothstep } from "../../kit/anim";
import { Shop, SHOP } from "../../kit/Shop";
import { Figure } from "../../kit/Figure";
import { Phone, phoneScreen, PHONE } from "../../kit/Device";
import { Glow, Txt } from "../../kit/Clay";
import { SoftPanel } from "../../kit/Soft";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { Life, backIn } from "../../wd004/life";
import { Cue, IND, Industry, IndustrySign, at, clamp01, V3 } from "./common";
import { BizPhone } from "./screens";

export type BeforeAfterData = {
  industry: Industry;
  /** shop sign (English, 3D) — default from industry */
  name?: string;
  /** BEFORE stat: count + what was lost ("MISSED CALLS") */
  missed: number;
  missedKind?: "call" | "message";
  /** AFTER stat: count-up target + unit (default industry unit, e.g. "ORDERS / WEEK") */
  gained: number;
  gainedUnit?: string;
  /** cue words in the VO (fallback = fraction of dur) */
  cues?: { before?: string; missed?: string; after?: string; customers?: string; orders?: string };
};

const cam: Cam = DEFAULT_CAM;
const SHOP_F = atFloor(0.37, 0.635, cam);
const SHOP_S = worldWidth(0.47, SHOP_F[2], cam) / SHOP.w;
const SHOP_ROT = 0.2;
const PH_P = atScreen(0.8, 0.455, 2.6, cam);
const PH_S = worldWidth(0.27, 2.6, cam) / PHONE.w;
const LABEL_P = atScreen(0.5, 0.115, 1.2, cam);
const LABEL_S = worldWidth(0.36, 1.2, cam) / 2.6;
const STAT_F = atFloor(0.5, 0.865, cam);
const STAT_S = worldWidth(0.74, STAT_F[2], cam) / 4.4;
const STAT_P: V3 = [STAT_F[0], FLOOR + 0.42 * STAT_S + 0.02, STAT_F[2]];

// door front (world) for customers
const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const local = (v: V3): V3 => {
  const r = rotY([v[0] * SHOP_S, v[1] * SHOP_S, v[2] * SHOP_S], SHOP_ROT);
  return [SHOP_F[0] + r[0], SHOP_F[1] + r[1], SHOP_F[2] + r[2]];
};
const DOOR_OUT = local([0, 0, SHOP.d / 2 + 0.55]);
const DOOR_IN = local([0, 0, -SHOP.d / 2 + 0.55]);
const FIG_S = (SHOP.doorH * SHOP_S * 0.7) / 1.12;

/** polyline path through points, constant speed, eased start; returns [x,z] at t */
const mkPath = (pts: [number, number][], t0: number, speed: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const L = seg.reduce((a, b) => a + b, 0);
  const T = (L / speed) * 1.25;
  const pos = (t: number): [number, number] => {
    const k = clamp01((t - t0) / T);
    let d = L * (k - Math.sin(2 * Math.PI * k) / (2 * Math.PI)); // ease in/out, feet follow distance
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) {
        const u = seg[i] > 0 ? Math.min(1, d / seg[i]) : 1;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
      }
      d -= seg[i];
    }
    return pts[pts.length - 1];
  };
  return { pos, end: t0 + T };
};

export const SceneBeforeAfter: React.FC<{ t: number; dur: number; cue: Cue; data: BeforeAfterData }> = ({ t, dur, cue, data }) => {
  const ind = IND[data.industry];
  const name = data.name ?? ind.sign;
  const kind = data.missedKind ?? "call";
  const cu = data.cues ?? {};
  const T0 = at(cue, cu.before, 0.04 * dur);
  const TM = at(cue, cu.missed, 0.16 * dur);
  const TA = at(cue, cu.after, 0.47 * dur);
  const TC = at(cue, cu.customers, TA + 0.1 * dur, TA);
  const TO = at(cue, cu.orders, TA + 0.2 * dur, TA);
  const OUT = dur - 0.55;

  // ---- before: missed rows ----
  const nRows = 6;
  const missedAt = Array.from({ length: nRows }, (_, i) => TM + 0.1 + i * Math.min(0.42, (TA - TM - 0.3) / nRows));
  const rows = missedAt.filter((x) => t >= x).length;
  const missedCount = Math.round(data.missed * clamp01(rows / nRows));
  const lastRing = rows > 0 ? missedAt[rows - 1] : -9;

  // ---- after ----
  const flip = tween(t, TA - 0.05, TA + 0.7, 0, 1, emphDecel);
  const after = smoothstep(TA - 0.05, TA + 0.55, t);
  const night = 1 - after;
  const shutter = 0.5 + 0.5 * tween(t, TA + 0.05, TA + 0.95, 0, 1, emphDecel);
  const nOrd = 4;
  const ordersAt = Array.from({ length: nOrd }, (_, i) => TO + i * Math.min(0.5, (OUT - TO - 0.4) / nOrd));
  const orders = ordersAt.filter((x) => t >= x).length;
  // phone notifications start right after the switch (the website is live), 3D tickets + stat on the "orders" word
  const nPh = 5;
  const phAt = Array.from({ length: nPh }, (_, i) => TA + 0.7 + i * Math.min(0.75, (OUT - TA - 1.2) / nPh));
  const phOrders = phAt.filter((x) => t >= x).length;
  const flip2 = tween(t, TO - 0.35, TO + 0.3, 0, 1, emphDecel);
  const gainedK = tween(t, TO + 0.1, Math.min(OUT - 0.3, TO + 1.6), 0, 1, emphDecel);
  const gainedCount = Math.round(data.gained * gainedK);

  // ---- phone ----
  const phIn = popIn(t, TM - 0.12, { k: 210, c: 15 }).s;
  const phOut = range(t, OUT, OUT + 0.4);
  const buzz = wobble(t - lastRing, 0.07, 9, 0.18) * (1 - after);
  const ph = {
    position: [PH_P[0] + buzz * 0.12, PH_P[1], PH_P[2]] as V3,
    rotation: [0.02, -0.2 + 0.03 * drift(t, 4), buzz] as V3,
    scale: PH_S * Math.max(0.001, phIn) * (1 - backIn(phOut)),
  };
  const phVis = t > TM - 0.12 && phOut < 1;
  const screens: ScreenSpec[] = [];
  if (phVis)
    screens.push(
      phoneScreen(ph, <BizPhone industry={data.industry} name={name} missed={missedCount} missedKind={kind} after={after} orders={phOrders} now={t} missedAt={missedAt} ordersAt={phAt} />, {
        kind: "iphone",
        opacity: clamp01(phIn * 1.5),
      })
    );

  // ---- customers ----
  const ox = DOOR_OUT,
    ix = DOOR_IN;
  const paths = useMemo(() => {
    const L = atFloor(-0.12, 0.74, cam),
      R = atFloor(1.12, 0.9, cam),
      L2 = atFloor(-0.1, 0.8, cam);
    const side = (s: number): [number, number] => [ox[0] + s * 0.32, ox[2]];
    return [
      { p: mkPath([[L[0], L[2]], [ox[0] - 0.9, ox[2] + 0.5], side(-0.1), [ix[0] - 0.42, ix[2] + 0.05]], TC, 2.6), col: C.figure, dt: 0 },
      { p: mkPath([[R[0], R[2]], [ox[0] + 1.1, ox[2] + 1.6], side(0.1), [ix[0] + 0.45, ix[2] + 0.2]], TC + 0.35, 2.9), col: "#3E6E9E", dt: 0.35 },
      { p: mkPath([[L2[0], L2[2]], [ox[0] - 1.0, ox[2] + 1.0], side(0), [ix[0] + 0.0, ix[2] + 0.75]], TC + 0.85, 2.7), col: "#2B4C7E", dt: 0.85 },
    ];
  }, [TC]);

  // ---- camera: slow push-in, settles ----
  const push = tween(t, 0, dur, 0, 1, (x) => x);
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.06 * drift(t, 2), cam.pos[1] + 0.05 * drift(t, 6), cam.pos[2] - 0.7 * push] };

  // ---- overlay: night tint + light sweep ----
  const sweep = range(t, TA - 0.05, TA + 0.75);
  const overlay = (
    <>
      {night > 0.01 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 40% 45%, #31476e 0%, #1a2742 100%)", mixBlendMode: "multiply", opacity: 0.5 * night }} />}
      {sweep > 0 && sweep < 1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, rgba(255,240,220,0) ${sweep * 160 - 40}%, rgba(255,240,220,0.55) ${sweep * 160 - 20}%, rgba(255,240,220,0) ${sweep * 160}%)`,
            mixBlendMode: "screen",
          }}
        />
      )}
    </>
  );

  // label flip colour
  const labCol = "#" + new THREE.Color("#55657C").lerp(new THREE.Color(C.orange), smoothstep(0.42, 0.58, flip)).getHexString();
  const statCol = "#" + new THREE.Color("#FFF4EF").lerp(new THREE.Color("#F2FBF5"), smoothstep(0.42, 0.58, flip2)).getHexString();
  const sx = (s: number) => Math.max(0.001, s);

  return (
    <Stage cam={camLive} screens={screens} overlay={overlay} dim={1 - 0.3 * night}>
      {/* ===== shop (the business) ===== */}
      <Life t={t} a={T0} b={OUT} kind="rise" exit="shrink" position={SHOP_F} scale={1}>
        <Shop label={name} signColor={ind.signColor} open={shutter} light={after} rotationY={SHOP_ROT} scale={SHOP_S}>
          {/* industry sign object on the roof */}
          <group position={[0, SHOP.h + 0.04, 0.1]} scale={0.82 * sx(springStep(t - T0 - 0.35, { k: 220, c: 13 }))}>
            <IndustrySign industry={data.industry} glow={after} rotation={[0, -SHOP_ROT * 0.6 + 0.12 * Math.sin(t * 0.8), 0]} />
            {after > 0.02 && <Glow position={[0, 0.45, -0.6]} size={2.6} opacity={0.22 * after} color="#FFB061" />}
          </group>
        </Shop>
      </Life>

      {/* ===== BEFORE → AFTER pill (flips around Y) ===== */}
      <Life t={t} a={T0 + 0.15} b={OUT} kind="pop" position={LABEL_P} scale={LABEL_S}>
        <group rotation={[0, Math.PI * flip + 0.06 * Math.sin(t * 0.9), 0]}>
          <SoftPanel w={2.6} h={0.78} thick={0.3} color={labCol} radius={0.36}>
            {flip < 0.5 && (
              <Txt size={0.36} color="#ffffff" position={[0, -0.01, 0.03]} letterSpacing={0.08}>
                BEFORE
              </Txt>
            )}
          </SoftPanel>
          {flip >= 0.5 && (
            <Txt size={0.36} color="#ffffff" position={[0, -0.01, -0.18]} rotation={[0, Math.PI, 0]} letterSpacing={0.08}>
              AFTER
            </Txt>
          )}
        </group>
      </Life>

      {/* ===== phone ===== */}
      {phVis && <Phone {...ph} kind="iphone" />}

      {/* ===== customers walk in ===== */}
      {t > TC - 0.05 &&
        paths.map(({ p, col, dt }, i) => {
          const [x, z] = p.pos(t);
          const dist = pathDistance(p.pos, TC - 0.1, t, 1 / 90);
          const sp = speedAt(p.pos, t);
          const head = headingAt(p.pos, t, Math.PI);
          const appear = clamp01((t - TC - dt) / 0.25);
          const out = 1 - backIn(range(t, OUT, OUT + 0.35));
          return (
            <Figure key={i} position={[x, FLOOR, z]} rotationY={head} scale={FIG_S * sx(Math.min(appear, out))} color={col} pose={{ dist: dist / FIG_S, walk: Math.min(1, sp / 1.2) }} />
          );
        })}

      {/* ===== order tickets (pop out of the phone top, stack) ===== */}
      {ordersAt.map((oa, i) => {
        if (t < oa) return null;
        const newer = orders - 1 - i; // 0 = newest
        if (newer > 1 && t > ordersAt[i + 2] + 0.35) return null;
        const k = springStep(t - oa, { k: 200, c: 14 });
        const shift = [0, 1, 2].reduce((acc, j) => acc + (ordersAt[i + 1 + j] !== undefined ? springStep(t - ordersAt[i + 1 + j], { k: 200, c: 16 }) : 0), 0);
        const from = atScreen(0.78, 0.31, 2.2, cam);
        const to = atScreen(0.775, 0.262 - 0.06 * Math.min(shift, 2.2), 2.2, cam);
        const pos = new THREE.Vector3(...from).lerp(new THREE.Vector3(...to), k).toArray() as V3;
        const fade = 1 - clamp01(shift - 1);
        const out = 1 - backIn(range(t, OUT, OUT + 0.35));
        return (
          <group key={i} position={pos} rotation={[0, -0.16, wobble(t - oa - 0.1, 0.06, 1.8, 0.2)]} scale={(worldWidth(0.3, 2.2, cam) / 2.3) * sx(Math.min(k, fade, out))}>
            <OrderTicket title={ind.order.toUpperCase()} no={`#${1040 + i}`} />
          </group>
        );
      })}

      {/* ===== stat (flips around X: missed → gained) ===== */}
      <Life t={t} a={TM + 0.2} b={OUT} kind="pop" position={STAT_P} scale={STAT_S}>
        <group rotation={[-Math.PI * flip2, 0, 0]}>
          <SoftPanel w={4.4} h={0.84} thick={0.3} color={statCol} radius={0.38}>
            {flip2 < 0.5 && (
              <>
                <Txt size={0.4} color={C.deepOrange} position={[-1.42, -0.01, 0.03]} anchorX="right">
                  {String(missedCount)}
                </Txt>
                <Txt size={0.3} color="#3A4250" position={[-1.22, -0.01, 0.03]} anchorX="left" letterSpacing={0.04}>
                  {kind === "call" ? "MISSED CALLS" : "MISSED MESSAGES"}
                </Txt>
              </>
            )}
          </SoftPanel>
          {flip2 >= 0.5 && (
            <group rotation={[Math.PI, 0, 0]} position={[0, 0, -0.16]}>
              <Txt size={0.42} color="#1F9D55" position={[-1.12, -0.01, 0]} anchorX="right">
                {`+${gainedCount}`}
              </Txt>
              <Txt size={0.29} color="#3A4250" position={[-0.92, -0.01, 0]} anchorX="left" letterSpacing={0.03}>
                {data.gainedUnit ?? ind.orderUnit}
              </Txt>
            </group>
          )}
        </group>
      </Life>
    </Stage>
  );
};

/** order ticket: white pillow card, green dot, title + number (fits its text) */
const OrderTicket: React.FC<{ title: string; no: string }> = ({ title, no }) => {
  const fs = Math.min(0.2, 1.5 / ((title.length + no.length + 1) * 0.62));
  return (
    <SoftPanel w={2.3} h={0.5} thick={0.16} color="#FCFBF8" radius={0.16}>
      <mesh position={[-0.93, 0, 0.02]}>
        <sphereGeometry args={[0.07, 24, 16]} />
        <meshPhysicalMaterial color="#22B35E" roughness={0.35} clearcoat={0.6} emissive="#22B35E" emissiveIntensity={0.25} />
      </mesh>
      <Txt size={fs} color="#2A3442" position={[-0.76, -0.005, 0.02]} anchorX="left">
        {title}
      </Txt>
      <Txt size={fs} color="#1F9D55" position={[0.98, -0.005, 0.02]} anchorX="right">
        {no}
      </Txt>
    </SoftPanel>
  );
};
