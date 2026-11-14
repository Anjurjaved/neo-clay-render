// Scene hand-off — পরের scene-এ যাওয়ার পরিষ্কার উপায়: stage-এর সব বস্তু বাম→ডান (বা কেন্দ্র থেকে বাইরে) একটা নরম ঢেউয়ে
// প্রথমে সামান্য দম নেয় (squash + ছোট লাফ), তারপর লম্বা হয়ে floor-এ ডুবে যায়; ডোবার জায়গায় floor ঢেউ খেলে।
// শেষে stage সম্পূর্ণ ফাঁকা → পরের scene শূন্য থেকে শুরু। সব pure function of t।
import React from "react";
import { FLOOR } from "../../kit/Stage";
import { smoothstep } from "../../kit/anim";
import { RippleSource } from "./FloorRipple";

export type HandoffOpts = {
  /** ঢেউয়ের উৎস (world x) — বা "center" দিলে originX থেকে দুই দিকে */
  originX?: number;
  /** প্রতি world unit দূরত্বে কত সেকেন্ড দেরি */
  perUnit?: number;
  /** দম নেওয়া (anticipation) সময় */
  pre?: number;
  /** ডোবার সময় */
  dur?: number;
  /** বস্তুর উচ্চতা (world, scale-সহ) — পুরোটা floor-এর নিচে যেতে কতটা নামতে হবে */
  height?: number;
  /** "sink" = floor-এ ডোবা; "shrink" = DOM screen-ওয়ালা device-এর জন্য (floor ভেদ করা নিষেধ, LESSONS D2) */
  mode?: "sink" | "shrink";
};
const D = { originX: -3.2, perUnit: 0.085, pre: 0.2, dur: 0.55, height: 3, mode: "sink" as const };

/** বস্তুটা কখন ডোবা শুরু করবে (anticipation শেষে, floor ছোঁয়ার মুহূর্ত) */
export const handoffStart = (t0: number, x: number, o: HandoffOpts = {}) => {
  const { originX, perUnit } = { ...D, ...o };
  return t0 + Math.abs(x - originX) * perUnit;
};
/** সব কিছু শেষ কখন (এর পরে unmount) */
export const handoffEnd = (t0: number, x: number, o: HandoffOpts = {}) => {
  const { pre, dur } = { ...D, ...o };
  return handoffStart(t0, x, o) + pre + dur;
};

/** pure: এই মুহূর্তে বস্তুর y-offset ও non-uniform scale (null = আর দেখা যায় না) */
export const handoff = (t: number, t0: number, x: number, o: HandoffOpts = {}) => {
  const { pre, dur, height, mode } = { ...D, ...o };
  const s0 = handoffStart(t0, x, o);
  const u = t - s0;
  if (u <= 0) return { dy: 0, sx: 1, sy: 1, gone: false };
  if (u >= pre + dur) return { dy: 0, sx: 0, sy: 0, gone: true };
  if (u < pre) {
    // দম: নিচে squash → ছোট লাফ
    const k = u / pre;
    const sq = Math.sin(Math.PI * Math.min(1, k * 1.6)) * (k < 0.62 ? 1 : 0);
    const lift = Math.sin(Math.PI * k) * 0.07 * height * smoothstep(0.35, 1, k);
    return { dy: lift, sx: 1 + 0.06 * sq, sy: 1 - 0.08 * sq, gone: false };
  }
  const k = (u - pre) / dur;
  if (mode === "shrink") {
    const s = 1 - smoothstep(0, 1, k);
    return { dy: -k * k * 0.25 * height, sx: s, sy: s, gone: s < 0.002 };
  }
  // ডোবা: easeIn (মাধ্যাকর্ষণ), নামতে নামতে লম্বা-সরু (stretch), শেষে floor-এর নিচে পুরোটা
  const e = k * k * (1.4 - 0.4 * k);
  const st = Math.sin(Math.PI * Math.min(1, k * 1.2)) * 0.1;
  return { dy: -e * (height * 1.15 + 0.3), sx: 1 - st * 0.6, sy: 1 + st, gone: false };
};

/** ঢেউয়ের সাথে floor ripple উৎস — FloorRipple-এ দিন */
export const handoffRipples = (t0: number, items: { x: number; z: number; amp?: number }[], o: HandoffOpts = {}): RippleSource[] =>
  items.map((it) => ({ x: it.x, z: it.z, at: handoffStart(t0, it.x, o) + ({ ...D, ...o }.pre) + 0.08, amp: it.amp ?? 0.05 }));

/**
 * <Handoff t at x>{object}</Handoff> — বস্তুর নিজের group-এর ভেতরে (base = floor-বিন্দু) রাখুন।
 * x = বস্তুর world x (ঢেউয়ের দেরি হিসাবের জন্য)। base স্কেল floor থেকে হয়, তাই squash floor-এ বসে থাকে।
 */
export const Handoff: React.FC<{ t: number; at: number; x: number; children: React.ReactNode } & HandoffOpts> = ({ t, at, x, children, ...o }) => {
  const h = handoff(t, at, x, o);
  if (h.gone) return null;
  return (
    <group position={[0, h.dy, 0]} scale={[h.sx, h.sy, h.sx]}>
      {children}
    </group>
  );
};
export const HANDOFF_FLOOR = FLOOR;
