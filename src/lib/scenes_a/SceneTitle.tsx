// Scene template: TITLE (opening hook) — একটা business-এর আসল পরিস্থিতি তার clay জগতে:
// দোকান ওঠে → জায়গার pin/tag → owner হেঁটে আসে, ফোনে জমতে থাকা alert (missed call / unread order …) গোনে →
// customer-রা দোকান ছেড়ে চলে যায় → hook প্রশ্নের board ঝুলে নামে → সব বেরিয়ে যায়।
import React from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { springStep, wobble, tween, range, smoothstep, emphDecel, drift, pathDistance, speedAt, headingAt } from "../../kit/anim";
import { Shop, SHOP } from "../../kit/Shop";
import { Figure } from "../../kit/Figure";
import { Phone, phoneScreen, PHONE } from "../../kit/Device";
import { Tag } from "../../kit/Clock";
import { Txt } from "../../kit/Clay";
import { SoftPanel } from "../../kit/Soft";
import { MapPin } from "../../web11/props";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { Cue, cueOr, Life, lifeScale, V3 } from "./common";
import { Industry, LOOK, OwnerAcc } from "./industry";
import { AlertScreen, Alert, AlertKind } from "./screens";
import { CountBadge } from "./objects";

export type TitleData = {
  industry: Industry;
  /** দোকানের signboard (English, 3D) — না দিলে industry default */
  business?: string;
  /** জায়গা tag (English, 3D) — যেমন "ZINDABAZAR, SYLHET" */
  place?: string;
  /** ফোনের lock screen */
  phone: { day: string; time: string; kind: AlertKind; summary: string; count: number; alerts: Alert[] };
  /** কতজন customer দোকান ছেড়ে চলে যায় (0 = এই beat নেই) */
  lost?: number;
  /** hook board (English, 3D) — "\n" দিয়ে ২ লাইন */
  title: string;
  sub?: string;
  /** দোকানের shutter কতটা খোলা (0–1) */
  open?: number;
  /** cue শব্দ (VO-তে যে শব্দে beat আসবে) */
  cues?: { place?: string; problem?: string; count?: string; lost?: string; hook?: string };
};

const cam: Cam = DEFAULT_CAM;
const v3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** ঝোলানো title board — পুরু navy panel, দুই সুতা frame-এর বাইরে থেকে */
const TitleBoard: React.FC<{ lines: string[]; sub?: string; w: number; h: number; swing: number }> = ({ lines, sub, w, h, swing }) => {
  const longest = Math.max(...lines.map((l) => l.length));
  const fs = Math.min(0.5, (w * 0.86) / (longest * 0.64));
  const lh = fs * 1.12;
  const top = sub ? lh * (lines.length - 1) * 0.5 + h * 0.08 : lh * (lines.length - 1) * 0.5;
  return (
    <group rotation={[0, 0, swing]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * w * 0.32, h / 2 + 4, -0.02]}>
          <cylinderGeometry args={[0.018, 0.018, 8, 8]} />
          <meshStandardMaterial color="#7a6a5c" roughness={0.8} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={"r" + s} position={[s * w * 0.32, h / 2 - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.07, 0.025, 10, 24]} />
          <meshPhysicalMaterial color="#c9ced3" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <SoftPanel w={w} h={h} thick={0.34} color={C.deepNavy} rough={0.55}>
        {lines.map((l, i) => (
          <Txt key={i} size={fs} color="#ffffff" position={[0, top - i * lh, 0.02]} letterSpacing={0.01}>
            {l}
          </Txt>
        ))}
        {sub && (
          <Txt size={Math.min(0.22, fs * 0.5)} color={C.orange} position={[0, -h / 2 + h * 0.2, 0.02]} letterSpacing={0.08}>
            {sub}
          </Txt>
        )}
      </SoftPanel>
    </group>
  );
};

export const SceneTitle: React.FC<{ t: number; dur: number; cue: Cue; data: TitleData }> = ({ t, dur, cue, data }) => {
  const L = LOOK[data.industry];
  const c = data.cues ?? {};
  // ---------- beats ----------
  const T0 = 0.15;
  const tPlace = cueOr(cue, c.place, dur * 0.1);
  const tProb = cueOr(cue, c.problem, dur * 0.27, tPlace);
  const tCount = cueOr(cue, c.count, tProb + 1.3, tProb);
  const tLost = data.lost ? cueOr(cue, c.lost, dur * 0.5, tCount) : tCount + 0.6;
  const tHook = cueOr(cue, c.hook, dur * 0.68, tLost);
  const E = dur - 0.62; // exit শুরু
  const screens: ScreenSpec[] = [];

  // ---------- shop: center → বাম-পিছনে (ফোনের জন্য জায়গা) → hook-এ মাঝখানে নিচে ----------
  const SA = atFloor(0.5, 0.64, cam),
    SB = atFloor(0.27, 0.55, cam),
    SC = atFloor(0.42, 0.75, cam);
  const sA = worldWidth(0.5, SA[2], cam) / SHOP.w,
    sB = worldWidth(0.42, SB[2], cam) / SHOP.w,
    sC = worldWidth(0.4, SC[2], cam) / SHOP.w;
  const g1 = tween(t, tProb - 0.1, tProb + 0.55, 0, 1, emphDecel);
  const g2 = tween(t, tHook - 0.05, tHook + 0.6, 0, 1, emphDecel);
  const shopPos = v3(v3(SA, SB, g1), SC, g2);
  const shopScale = g2 > 0 ? sB + (sC - sB) * g2 : sA + (sB - sA) * g1;
  const open = data.open ?? 0.62;
  const shutter = tween(t, T0 + 0.5, T0 + 1.3, 0, open, emphDecel);
  const markPop = springStep(t - (T0 + 0.35), { k: 160, c: 9 });

  // ---------- owner: বাম থেকে হেঁটে আসে, hook-এ ডানে সরে ----------
  const OA = atFloor(-0.14, 0.8, cam),
    OB = atFloor(0.42, 0.8, cam),
    OC = atFloor(0.79, 0.8, cam);
  const tWalk = tProb + 0.15;
  const ownerPath = (u: number): [number, number] => {
    const k1 = smoothstep(tWalk, tWalk + 1.25, u);
    const k2 = smoothstep(tHook + 0.1, tHook + 1.0, u);
    const x = OA[0] + (OB[0] - OA[0]) * k1 + (OC[0] - OB[0]) * k2;
    const z = OA[2] + (OB[2] - OA[2]) * k1 + (OC[2] - OB[2]) * k2;
    return [x, z];
  };
  const [ox, oz] = ownerPath(t);
  const oWalk = Math.min(1, speedAt(ownerPath, t) / 0.9);
  const oDist = pathDistance(ownerPath, tWalk, t);
  const oScale = worldWidth(0.19, oz, cam) / 0.42;
  // মুখ: হাঁটার দিক, থামলে ফোনের দিকে (ডানে-সামনে), customer চলে গেলে বামে তাকায়, hook-এ board-এর দিকে
  const face0 = headingAt(ownerPath, t, 0.55);
  const lookLost = data.lost ? tween(t, tLost + 0.2, tLost + 0.6, 0, 1) * (1 - tween(t, tHook - 0.2, tHook + 0.1, 0, 1)) : 0;
  const ownerFace = oWalk > 0.15 ? face0 : 0.55 * (1 - lookLost) + -0.9 * lookLost;
  const worry = range(t, tProb + 1.2, tCount + 0.4) * (1 - range(t, tHook, tHook + 0.4));
  const headTilt = worry * (0.16 + 0.05 * Math.sin(t * 5.5)) + wobble(t - tCount - 0.35, 0.12, 2.2, 0.15);
  const shrug = springStep(t - (tCount + 0.3), { k: 90, c: 8 }) * (1 - range(t, tLost + 0.2, tLost + 0.6));
  const thinkK = springStep(t - (tHook + 1.0), { k: 80, c: 10 });

  // ---------- phone (screen-ওয়ালা — floor থেকে নয়, pop) ----------
  const PP = atScreen(0.71, 0.43, 2.6, cam);
  const pS = (worldWidth(0.36, PP[2], cam) / PHONE.w) * lifeScale(t, tProb + 0.1, tHook - 0.15);
  const counting = t > tProb + 0.35 && t < tCount + 0.45;
  const buzz = counting ? Math.sin(t * 70) * 0.035 * (0.6 + 0.4 * Math.sin(t * 9)) : 0;
  const ph = {
    position: [PP[0] + buzz * 0.4, PP[1] + 0.05 * drift(t, 2), PP[2]] as V3,
    rotation: [0.03, -0.24 + 0.03 * drift(t, 5), buzz * 1.4] as V3,
    scale: pS,
  };
  const count = tween(t, tProb + 0.35, tCount + 0.35, 0, data.phone.count, (x) => x * x * (3 - 2 * x));
  if (pS > 0.001) screens.push(phoneScreen(ph, <AlertScreen {...data.phone} count={count} />));
  // badge: ফোনের উপর-ডান কোণের বাইরে (DOM screen-এর সামনে 3D নয় — LESSONS B14)
  const badgeW = new THREE.Vector3(-0.62, 1.24, 0.1).applyEuler(new THREE.Euler(...ph.rotation)).multiplyScalar(pS).add(new THREE.Vector3(...ph.position));

  // ---------- lost customers ----------
  const nLost = Math.max(0, Math.min(5, data.lost ?? 0));

  // ---------- title board ----------
  const lines = data.title.split("\n");
  const BW = 4.6,
    BH = lines.length > 1 ? 2.0 : 1.45;
  const BP = atScreen(0.5, lines.length > 1 ? 0.16 : 0.14, 0.6, cam);
  const bS = worldWidth(0.86, BP[2], cam) / BW;
  const drop = springStep(t - tHook, { k: 70, c: 7 });
  const swing = wobble(t - tHook - 0.25, 0.07, 0.9, 0.12) + 0.012 * Math.sin(t * 1.3);
  const boardOut = range(t, E + 0.1, E + 0.55);

  // camera: ধীর push + জীবন্ত drift
  const push = 0.7 * smoothstep(0, dur, t);
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 1), cam.pos[1] + 0.04 * drift(t, 3), cam.pos[2] - push] };

  return (
    <Stage cam={camLive} screens={screens}>
      {/* shop + industry mark */}
      <Life t={t} a={T0} b={E} kind="rise" exit="sink" position={shopPos} scale={shopScale}>
        <Shop label={data.business ?? L.sign} signColor={L.signColor} clay={L.clay} open={shutter} light={range(t, T0 + 0.6, T0 + 1.2)}>
          {markPop > 0.001 && (
            <group position={[0, SHOP.h - 0.02, 0.05]} scale={0.95 * L.markScale * markPop} rotation={[0, 0.35 + 0.08 * Math.sin(t * 0.9), wobble(t - T0 - 0.35, 0.1, 1.6, 0.2)]}>
              <L.Mark />
            </group>
          )}
        </Shop>
      </Life>

      {/* place: pin + tag */}
      {data.place && (
        <>
          <Life t={t} a={tPlace} b={tProb - 0.1} kind="drop" exit="shrink" position={atScreen(0.13, 0.115, 1.2, cam)} scale={worldWidth(0.08, 1.2, cam) / 0.6}>
            <MapPin />
          </Life>
          <Life t={t} a={tPlace + 0.18} b={tProb - 0.1} kind="pop" position={atScreen(0.54, 0.11, 1.2, cam)} scale={worldWidth(0.7, 1.2, cam) / 3.6}>
            <Tag text={data.place} size={Math.min(0.3, 3.2 / (data.place.length * 0.66))} w={3.6} h={0.62} color={C.deepNavy} />
          </Life>
        </>
      )}

      {/* owner */}
      {t > tWalk - 0.05 && (
        <Life t={t} a={tWalk - 0.05} b={E + 0.05} kind="pop" exit="shrink" position={[ox, FLOOR, oz]} scale={oScale}>
          <Figure
            rotationY={ownerFace}
            color={L.owner.color}
            coat={L.owner.coat}
            headTilt={headTilt + thinkK * 0.14}
            pose={{ dist: oDist, walk: oWalk, cheer: shrug * 0.32, lean: -0.05 * shrug, armOut: [thinkK * 0.9, 0] }}
          >
            <OwnerAcc acc={L.owner.acc} />
          </Figure>
        </Life>
      )}

      {/* phone body (screen = overlay) */}
      {pS > 0.001 && <Phone {...ph} />}
      {pS > 0.001 && count >= 1 && (
        <group position={badgeW.toArray()} rotation={ph.rotation} scale={pS * 0.5 * springStep(t - tProb - 0.5, { k: 260, c: 12 }) * (1 + wobble(t - tCount - 0.35, 0.18, 3, 0.2))}>
          <CountBadge n={String(Math.max(1, Math.round(count)))} />
        </group>
      )}

      {/* customers leave the shop */}
      {Array.from({ length: nLost }).map((_, i) => {
        const a = tLost + i * 0.42;
        if (t < a || t > a + 2.6) return null;
        const door = atFloor(0.27, 0.6, cam),
          away = atFloor(-0.16, 0.6 + (i % 2) * 0.05, cam);
        const path = (u: number): [number, number] => {
          const k = smoothstep(a, a + 2.4, u);
          return [door[0] + (away[0] - door[0]) * k, door[2] + 0.2 + (away[2] - door[2] - 0.2) * k];
        };
        const [cx, cz] = path(t);
        const pop = springStep(t - a, { k: 220, c: 14 });
        return (
          <group key={i} position={[cx, FLOOR, cz]} scale={(worldWidth(0.1, cz, cam) / 0.42) * pop}>
            <Figure rotationY={headingAt(path, t, -1.4)} color={["#5B86B5", "#7E9CC0", "#4E73A0", "#6C8FB8", "#88A6C8"][i]} pose={{ dist: pathDistance(path, a, t), walk: Math.min(1, speedAt(path, t) / 0.6) }} />
          </group>
        );
      })}

      {/* hook board */}
      {t > tHook && boardOut < 1 && (
        <group position={[BP[0], BP[1] + (1 - drop) * 6 + boardOut * boardOut * 9, BP[2]]} scale={bS}>
          <TitleBoard lines={lines} sub={data.sub} w={BW} h={BH} swing={swing} />
        </group>
      )}
    </Stage>
  );
};
