// Steps stairs — বালিশ-কোণের clay ধাপ যা spring দিয়ে floor থেকে ফুলে ওঠে (squash-stretch, volume রক্ষা),
// figure লাফিয়ে ধাপে ধাপে ওঠে (parabolic hop, landing squash), যে ধাপে পা পড়ে সেটা কমলা হয়; শেষে cheer।
import React, { useMemo } from "react";
import * as THREE from "three";
import { Txt } from "../../kit/Clay";
import { slabGeo } from "../../kit/Geo";
import { Figure } from "../../kit/Figure";
import { CheckBadge } from "../../kit/Soft";
import { springStep, wobble, smoothstep } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, P, Gloss } from "./common";

const SW = 0.98,
  SD = 1.25,
  SH = 0.5,
  SH0 = 0.72;

/** helper: ধাপগুলো ওঠা + figure-এর লাফ সময়সূচি */
export const stairsSchedule = (t: number, n: number, riseAt = 0.25, riseGap = 0.16, climbAt = 1.35, hop = 0.42, pause = 0.18) => {
  const rise = Array.from({ length: n }, (_, i) => springStep(t - riseAt - i * riseGap, { k: 150, c: 9 }));
  let climb = -1;
  let land = -1;
  let time = climbAt;
  for (let i = 0; i < n; i++) {
    if (t < time) break;
    if (t < time + hop) {
      const f = (t - time) / hop;
      climb = i - 1 + f;
      break;
    }
    climb = i;
    land = t - (time + hop);
    time += hop + pause;
  }
  const doneAt = climbAt + n * (hop + pause) - pause;
  return { rise, climb, land, cheer: smoothstep(doneAt, doneAt + 0.35, t), doneAge: t - doneAt };
};

const Step: React.FC<{ i: number; label: string; rise: number; lit: number }> = ({ i, label, rise, lit }) => {
  const h = SH0 + SH * i;
  const geo = useMemo(() => {
    const g = slabGeo(SW, h, SD, 0.16, 0.12, 8);
    g.translate(0, h / 2, 0);
    return g;
  }, [h]);
  const sy = Math.max(0.001, rise);
  const sxz = Math.min(1, sy * 2.2) / Math.sqrt(Math.max(0.6, sy)); // ছোট থেকে ফোলে; লম্বা হলে সরু (volume)
  const tOp = Math.max(0, Math.min(1, (sy - 0.55) * 3));
  const col = new THREE.Color("#F2EBE2").lerp(new THREE.Color(C.orange), lit);
  const ink = new THREE.Color(C.deepNavy).lerp(new THREE.Color("#ffffff"), lit);
  return (
    <group position={[i * SW * 1.04, 0, 0]} scale={[sxz, sy, sxz]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <Gloss color={"#" + col.getHexString()} rough={0.55} coat={0.3} />
      </mesh>
      {tOp > 0 && <group position={[0, h - 0.34, SD / 2 + 0.03]} scale={[1, 1 / sy, 1]}>
        <Txt size={0.34} color={lit > 0.5 ? "#ffffff" : C.orange} opacity={tOp}>
          {String(i + 1)}
        </Txt>
        <Txt size={0.12} color={"#" + ink.getHexString()} position={[0, -0.27, 0]} letterSpacing={0.04} opacity={tOp}>
          {label}
        </Txt>
      </group>}
    </group>
  );
};

export const StepsStairs: React.FC<
  P & {
    steps: string[];
    rise: number[];
    /** figure: -1 = floor-এ (প্রথম ধাপের আগে), i = ধাপ i-এ, ভগ্নাংশ = লাফের মাঝে */
    climb: number;
    /** শেষ landing-এর পর সেকেন্ড (squash) */
    land?: number;
    cheer?: number;
    doneAge?: number;
    figure?: boolean;
  }
> = ({ steps, rise, climb, land = -1, cheer = 0, doneAge = -1, figure = true, ...p }) => {
  const n = steps.length;
  const x0 = -((n - 1) * SW * 1.04) / 2;
  const ci = Math.floor(climb);
  const f = climb - ci;
  const xAt = (i: number) => (i < 0 ? -SW * 1.15 : i * SW * 1.04);
  const yAt = (i: number) => (i < 0 ? 0 : SH0 + SH * i);
  const fx = xAt(ci) + (xAt(ci + 1) - xAt(ci)) * (f > 0 ? smoothstep(0, 1, f) : 0);
  const fy = f > 0 ? yAt(ci) + (yAt(ci + 1) - yAt(ci)) * f + Math.sin(Math.PI * f) * 0.5 : yAt(ci);
  const sq = land >= 0 && f === 0 ? wobble(land, 0.16, 3.2, 0.3) : f > 0 ? -0.08 * Math.sin(Math.PI * f) : 0;
  return (
    <G {...p}>
      <group position={[x0, 0, 0]}>
        {steps.map((s, i) => (
          <Step key={i} i={i} label={s} rise={rise[i] ?? 0} lit={ci > i ? 1 : ci === i ? (f > 0 ? 1 : land >= 0 ? smoothstep(0, 0.2, land) : 1) : 0} />
        ))}
        {figure && (rise[0] ?? 0) > 0.5 && (
          <group position={[fx, fy, 0.1]}>
            <group scale={[1 + sq * 0.5, 1 - sq, 1 + sq * 0.5]}>
              <Figure rotationY={f > 0 || climb < n - 1 ? Math.PI / 2 - 0.5 : 0.25} scale={0.82} pose={{ cheer, lean: f > 0 ? 0.15 : 0, armOut: f > 0 ? [-0.6, -0.6] : [0, 0] }} />
            </group>
          </group>
        )}
        {doneAge > 0 && <CheckBadge scale={0.55 * springStep(doneAge, { k: 200, c: 10 })} position={[xAt(n - 1) + 0.35, yAt(n - 1) + 1.45, 0.2]} />}
      </group>
    </G>
  );
};
