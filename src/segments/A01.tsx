// A01 · 0.00–5.12 — রাত বারোটা আপনার বিজনেস বন্ধ কিন্তু আপনার কম্পিটিটরের বিজনেস চলছেই।
// choreography = owner-অনুমোদিত master (প্রতি 0.25 s মেপে), bible-এর সাথে পার্থক্য থাকলে master।
import React from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR } from "../kit/Stage";
import { useVideoTime } from "../kit/time";
import { springStep, wobble, popIn, tween, range, smoothstep, expoOut, emphDecel, pathDistance, speedAt, headingAt, drift } from "../kit/anim";
import { ClockBadge, Tag, NotifyCard } from "../kit/Clock";
import { Shop, HangSign, SHOP } from "../kit/Shop";
import { Figure } from "../kit/Figure";
import { C } from "../kit/theme";

export const A01_START = 0;
const cam = DEFAULT_CAM;

// --- layout (master frame-percentage থেকে) ---
const CLOCK_C = atScreen(0.232, 0.165, -2, cam);
const CLOCK_S = worldWidth(0.27, -2, cam) / 2.2; // ব্যাস (bezel সহ ≈2.2)
const LABEL_C = atScreen(0.232, 0.27, -2, cam);
const LABEL_W = worldWidth(0.19, -2, cam);

const YS_A = atFloor(0.5, 0.667, cam); // উঠে আসার জায়গা (মাঝখানে)
const YS_B = atFloor(0.262, 0.638, cam); // বাম তৃতীয়াংশ, একটু পিছনে
const YS_SA = worldWidth(0.4, YS_A[2], cam) / SHOP.w;
const YS_SB = worldWidth(0.36, YS_B[2], cam) / SHOP.w;

const CP = atFloor(0.765, 0.672, cam);
const CP_S = worldWidth(0.46, CP[2], cam) / SHOP.w;
const CP_ROT = -0.42;

// competitor-local → world
const cpMatrix = new THREE.Matrix4().compose(
  new THREE.Vector3(...CP),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, CP_ROT, 0)),
  new THREE.Vector3(CP_S, CP_S, CP_S)
);
const cpLocal = (x: number, z: number): [number, number] => {
  const v = new THREE.Vector3(x, 0, z).applyMatrix4(cpMatrix);
  return [v.x, v.z];
};

// --- দুই figure-এর পথ (x,z on floor) — ডান কিনারা থেকে দরজার সামনে, তারপর ভেতরে ---
const START_R = atFloor(1.12, 0.735, cam);
const figPath = (i: number) => (t: number): [number, number] => {
  const off = i === 0 ? -0.2 : 0.2;
  const s0: [number, number] = [START_R[0] + i * 0.55, START_R[2] + 0.25 - i * 0.1];
  const door = cpLocal(off, SHOP.d / 2 + 0.55);
  const inside = cpLocal(off * 0.95, SHOP.d / 2 - 0.42);
  const t0 = 3.68 + i * 0.1;
  const t1 = 4.62 + i * 0.04;
  const t2 = 5.12;
  if (t <= t1) {
    const k = smoothstep(t0, t1, t) * 0.25 + range(t, t0, t1) * 0.75;
    return [s0[0] + (door[0] - s0[0]) * k, s0[1] + (door[1] - s0[1]) * k];
  }
  const k = smoothstep(t1, t2, t);
  return [door[0] + (inside[0] - door[0]) * k, door[1] + (inside[1] - door[1]) * k];
};

// New Order card stack (newest নিচে, পুরনোগুলো উপরে ঠেলে ওঠে)
const SLOTS = [atScreen(0.787, 0.274, 0.8, cam), atScreen(0.832, 0.233, 0.8, cam), atScreen(0.877, 0.192, 0.8, cam)];
const CARD_T = [4.12, 4.36, 4.6];
const CARD_S = worldWidth(0.185, 0.8, cam) / 1.3;

export const A01: React.FC = () => {
  const t = useVideoTime(A01_START);

  // clock: pop, কাঁটা ১০:১০ → ১২:১০ (master-এর শেষ অবস্থা), তারপর স্থির
  const cp = popIn(t, 0.08, { k: 190, c: 12 });
  const sweep = springStep(t - 0.15, { k: 34, c: 10.5 });
  const minA = (2 / 12) * Math.PI * 2 + sweep * Math.PI * 4;
  const hourA = ((10 + 10 / 60) / 12) * Math.PI * 2 + sweep * (Math.PI * 2 * (2 / 12));
  const lp = popIn(t, 0.72, { k: 260, c: 16 });

  // YOUR SHOP
  const rise = springStep(t - 1.1, { k: 70, c: 12 });
  const glide = tween(t, 2.52, 3.06, 0, 1, emphDecel);
  const ysPos: [number, number, number] = [
    YS_A[0] + (YS_B[0] - YS_A[0]) * glide,
    FLOOR - (1 - rise) * SHOP.h * 1.15,
    YS_A[2] + (YS_B[2] - YS_A[2]) * glide,
  ];
  const ysS = YS_SA + (YS_SB - YS_SA) * glide;
  const ysSquash = 1 + wobble(t - 1.45, 0.025, 2.6, 0.3);
  const signDrop = springStep(t - 1.98, { k: 320, c: 14 });
  const signAng = wobble(t - 2.05, 0.38, 1.6, 0.12) + wobble(t - 2.6, 0.06, 2.2, 0.2);

  // COMPETITOR
  const crise = springStep(t - 2.84, { k: 110, c: 13.5 });
  const copen = tween(t, 3.1, 3.55, 0, 0.6, expoOut);
  const clight = tween(t, 3.08, 3.45, 0, 1, expoOut);
  const openAng = wobble(t - 3.3, 0.28, 1.5, 0.12);

  const figs = [0, 1].map((i) => {
    const P = figPath(i);
    const [x, z] = P(t);
    const sp = speedAt(P, t);
    const dist = pathDistance(P, 3.6, t);
    const walk = Math.min(1, sp / 1.2);
    const head = headingAt(P, t, CP_ROT + Math.PI);
    return { x, z, dist, walk, head };
  });
  const figScale = CP_S * 0.84;

  const camLive = { ...cam, pos: [cam.pos[0] + 0.03 * drift(t, 1), cam.pos[1] + 0.02 * drift(t, 4), cam.pos[2]] as [number, number, number] };

  return (
    <Stage cam={camLive}>
      {t > 0.08 && (
        <group position={CLOCK_C} scale={[CLOCK_S * cp.s * cp.sx, CLOCK_S * cp.s * cp.sy, CLOCK_S * cp.s]}>
          <ClockBadge hourA={hourA} minA={minA} />
        </group>
      )}
      {t > 0.72 && (
        <group position={LABEL_C} scale={[lp.s * lp.sx, lp.s * lp.sy, lp.s]}>
          <Tag text="12:00 AM" size={LABEL_W * 0.185} w={LABEL_W} h={LABEL_W * 0.3} />
        </group>
      )}

      {t > 0.9 && (
        <group position={ysPos} rotation={[0, -0.08, 0]} scale={[ysS / ysSquash ** 0.5, ysS * ysSquash, ysS / ysSquash ** 0.5]}>
          <Shop label="YOUR SHOP" open={0} light={0}>
            {t > 1.98 && <HangSign text="CLOSED" w={0.6} position={[0.05, SHOP.sill + SHOP.doorH * 0.72, SHOP.d / 2 - 0.12]} angle={signAng} drop={signDrop} tilt={0.22} />}
          </Shop>
        </group>
      )}

      {t > 2.82 && (
        <group position={[CP[0], FLOOR - (1 - crise) * SHOP.h * 1.2, CP[2]]} rotation={[0, CP_ROT, 0]} scale={[CP_S, CP_S * 1.07, CP_S]}>
          <Shop label="COMPETITOR" signColor={C.orange} open={copen} light={clight}>
            <HangSign text="OPEN" position={[-0.05, SHOP.sill + SHOP.doorH * 0.46, -SHOP.d / 2 + 0.2]} angle={openAng} textColor="#C65A1E" w={0.6} />
          </Shop>
        </group>
      )}

      {t > 3.6 &&
        figs.map((f, i) => (
          <Figure key={i} position={[f.x, FLOOR, f.z]} rotationY={f.head} scale={figScale} pose={{ dist: f.dist, walk: f.walk, armOut: i === 0 ? [0, 0.35] : [0.35, 0] }} />
        ))}

      {CARD_T.map((ct, i) => {
        if (t < ct) return null;
        const roof = new THREE.Vector3(CP[0] - 0.2, FLOOR + SHOP.h * CP_S, CP[2] + 0.4);
        const k0 = springStep(t - ct, { k: 200, c: 16 });
        let pos = roof.clone().lerp(new THREE.Vector3(...SLOTS[0]), k0);
        for (let j = i + 1; j < 3; j++) {
          if (t >= CARD_T[j]) {
            const kj = springStep(t - CARD_T[j], { k: 200, c: 17 });
            const from = new THREE.Vector3(...SLOTS[Math.min(2, j - 1 - i)]);
            const to = new THREE.Vector3(...SLOTS[Math.min(2, j - i)]);
            pos = pos.clone().add(to.sub(from).multiplyScalar(kj));
          }
        }
        const pp = popIn(t, ct, { k: 260, c: 15 });
        return (
          <NotifyCard
            key={i}
            text="New Order"
            position={[pos.x, pos.y + 0.012 * Math.sin(t * 2 + i), pos.z]}
            scale={[CARD_S * pp.s * pp.sx, CARD_S * pp.s * pp.sy, CARD_S * pp.s]}
            rotation={[0, -0.12, 0]}
          />
        );
      })}
    </Stage>
  );
};
