// Pose library — সব pure function (সময়/দূরত্ব prop হিসেবে)। mixPose দিয়ে যেকোনো দুটো pose মসৃণভাবে মেশে।
// walk: phase = হাঁটা দূরত্ব / চক্র → পা পিছলায় না (LESSONS C13)। stance foot local-এ রৈখিক পিছনে সরে (world-এ স্থির)।
import { ArmCtl, BODY, LegCtl, Pose, Side, SX } from "./rig";
import { V3, v } from "./sdf";

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpArm = (a: ArmCtl, b: ArmCtl, k: number): ArmCtl => ({
  t: v.lerp(a.t, b.t, k),
  pole: v.lerp(a.pole, b.pole, k),
  dir: v.norm(v.lerp(a.dir, b.dir, k)),
  palm: v.norm(v.lerp(a.palm, b.palm, k)),
  grip: lerp(a.grip, b.grip, k),
  index: lerp(a.index, b.index, k),
});
const lerpLeg = (a: LegCtl, b: LegCtl, k: number): LegCtl => ({ t: v.lerp(a.t, b.t, k), pole: v.lerp(a.pole, b.pole, k), toe: lerp(a.toe, b.toe, k) });

export const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  if (k <= 0) return a;
  if (k >= 1) return b;
  return {
    y: lerp(a.y, b.y, k),
    lean: lerp(a.lean, b.lean, k),
    twist: lerp(a.twist, b.twist, k),
    roll: lerp(a.roll, b.roll, k),
    nod: lerp(a.nod, b.nod, k),
    turn: lerp(a.turn, b.turn, k),
    tilt: lerp(a.tilt, b.tilt, k),
    armL: lerpArm(a.armL, b.armL, k),
    armR: lerpArm(a.armR, b.armR, k),
    legL: lerpLeg(a.legL, b.legL, k),
    legR: lerpLeg(a.legR, b.legR, k),
  };
};
/** একটা হাত বদলাও (k weight) */
export const withArm = (p: Pose, s: Side, a: ArmCtl, k = 1): Pose => (s === "L" ? { ...p, armL: lerpArm(p.armL, a, k) } : { ...p, armR: lerpArm(p.armR, a, k) });
export const armOf = (p: Pose, s: Side) => (s === "L" ? p.armL : p.armR);

// ---------- arms ----------
export const armRest = (s: Side, breathe = 0): ArmCtl => {
  const sx = SX[s];
  return { t: [sx * 0.222, -0.035 + breathe * 0.004, 0.035], pole: [sx * 0.35, 0, -1], dir: [sx * 0.12, -1, 0.12], palm: [-sx, 0, 0.05], grip: 0.28, index: 0 };
};
/** rotate a torso-frame point about the shoulder's X axis (forward swing = +a) */
const swing = (s: Side, p: V3, a: number): V3 => {
  const S: V3 = [BODY.shoulder[0] * SX[s], BODY.shoulder[1], 0];
  const d = v.sub(p, S);
  const c = Math.cos(a),
    sn = Math.sin(a);
  return v.add(S, [d[0], d[1] * c - d[2] * sn, d[1] * sn + d[2] * c]);
};
const rotX = (d: V3, a: number): V3 => [d[0], d[1] * Math.cos(a) - d[2] * Math.sin(a), d[1] * Math.sin(a) + d[2] * Math.cos(a)];
export const armSwing = (s: Side, a: number): ArmCtl => {
  const r = armRest(s);
  // a > 0 → হাত সামনে; সামনে গেলে কনুই একটু বেশি বাঁকে (follow-through)
  const bend = Math.max(0, a) * 0.05;
  const t = swing(s, v.add(r.t, [0, bend, bend * 0.6]), -a);
  return { ...r, t, dir: v.norm(rotX(r.dir, -a * 1.15)) };
};
export const armCheer = (s: Side, k = 1): ArmCtl => {
  const sx = SX[s];
  return { t: [sx * 0.28, 0.585 + 0.02 * k, 0.06], pole: [sx, -0.35, -0.3], dir: [sx * 0.25, 1, 0.12], palm: [-sx * 0.3, 0, 1], grip: 0.85, index: 0 };
};
export const armWave = (s: Side, ph: number): ArmCtl => {
  const sx = SX[s];
  const w = Math.sin(ph);
  return { t: [sx * (0.3 + 0.035 * w), 0.53, 0.09], pole: [sx, -0.7, -0.1], dir: [sx * 0.15 + 0.5 * w * sx, 1, 0.05], palm: [-sx * 0.1, 0, 1], grip: 0.04, index: 0 };
};
/** হাত চিবুকে (think) */
export const armChin = (s: Side): ArmCtl => {
  const sx = SX[s];
  return { t: [sx * 0.015, 0.315, 0.2], pole: [sx * 0.55, -1, 0.3], dir: [-sx * 0.1, 1, 0.12], palm: [0, 0, -1], grip: 0.95, index: 0 };
};
/** অন্য হাত কনুই ধরে (think-এর সঙ্গী) */
export const armHug = (s: Side): ArmCtl => {
  const sx = SX[s];
  return { t: [-sx * 0.035, 0.115, 0.205], pole: [sx, -0.4, 0], dir: [-sx, 0.05, 0.15], palm: [0, 1, 0], grip: 0.45, index: 0 };
};
/** point toward direction D (torso frame) */
export const armPoint = (s: Side, D: V3): ArmCtl => {
  const sx = SX[s];
  const d = v.norm(D);
  const S: V3 = [BODY.shoulder[0] * sx, BODY.shoulder[1], 0];
  return { t: v.add(S, v.mul(d, 0.325)), pole: [sx * 0.4, -1, -0.2], dir: d, palm: [-sx * 0.35, -1, 0], grip: 1, index: 1 };
};
/** typing on a keyboard in front (y = torso-frame wrist height), ph = typing phase */
export const armType = (s: Side, ph: number, y = 0.1, z = 0.27): ArmCtl => {
  const sx = SX[s];
  const tap = Math.max(0, Math.sin(ph * 2 + (s === "L" ? 0 : 1.9))) ** 2 * 0.018;
  const slide = Math.sin(ph * 0.7 + (s === "L" ? 0 : 2)) * 0.012;
  return { t: [sx * (0.11 + slide), y + tap, z], pole: [sx * 0.9, -1, -0.1], dir: [-sx * 0.22, -0.35, 1], palm: [0, -1, 0.15], grip: 0.38, index: 0 };
};

// ---------- holds (hand anchor + prop transform) ----------
export type HoldKind = "phone" | "cup" | "clipboard" | "tablet" | "bag";
/** ফোন/clipboard/tablet নিজের দিকে ধরে দেখা: palm বস্তুর পিঠে, screen মাথার দিকে */
export const armHoldSelf = (s: Side, lift = 0, kind: HoldKind = "phone"): ArmCtl => {
  const sx = SX[s];
  const big = kind === "phone" ? 0 : 1;
  return {
    t: [sx * (0.085 + big * 0.02), 0.205 + lift + big * 0.02, 0.215 + big * 0.02],
    pole: [sx, -0.8, -0.2],
    dir: [-sx, 0.08, 0.1],
    palm: [0.0, 0.62, -0.78],
    grip: kind === "phone" ? 0.5 : 0.45,
    index: 0,
  };
};
export const armHoldCup = (s: Side, lift = 0): ArmCtl => {
  const sx = SX[s];
  return { t: [sx * 0.205, 0.07 + lift, 0.2], pole: [sx * 0.6, -1, -0.4], dir: [-sx * 0.15, -0.12, 1], palm: [-sx, 0, 0.1], grip: 0.62, index: 0 };
};
export const armHoldBag = (s: Side): ArmCtl => {
  const sx = SX[s];
  return { t: [sx * 0.232, -0.03, 0.03], pole: [sx * 0.3, 0, -1], dir: [sx * 0.05, -1, 0.05], palm: [-sx, 0, 0], grip: 0.9, index: 0 };
};

// ---------- legs / body ----------
export const legStand = (s: Side): LegCtl => ({ t: [SX[s] * 0.095, BODY.ankleY, 0], pole: [0, 0, 1], toe: 0 });

export const stand = (breathe = 0): Pose => ({
  y: -0.003 * (1 - Math.cos(breathe)),
  lean: 0.01,
  twist: 0,
  roll: 0,
  nod: 0.02,
  turn: 0,
  tilt: 0,
  armL: armRest("L", Math.sin(breathe)),
  armR: armRest("R", Math.sin(breathe)),
  legL: legStand("L"),
  legR: legStand("R"),
});

export const CYCLE = 0.62; // ২ কদম = 0.62 world (scale-এর আগে)
const STANCE = 0.58;
/** foot local z & lift for cycle position u (0..1) */
const footAt = (u: number, a: number, lift: number) => {
  u = ((u % 1) + 1) % 1;
  if (u < STANCE) {
    const k = u / STANCE;
    return { z: a - 2 * a * k, y: 0, toe: k > 0.75 ? ((k - 0.75) / 0.25) * 0.5 : 0 };
  }
  const k = (u - STANCE) / (1 - STANCE);
  const e = k * k * (3 - 2 * k);
  return { z: -a + 2 * a * e, y: lift * Math.sin(Math.PI * Math.min(1, k * 1.08)), toe: 0.5 * (1 - k) * (1 - k) - 0.25 * Math.sin(Math.PI * k) * k };
};

/** walk: dist = হাঁটা দূরত্ব (figure units), k = তীব্রতা 0..1 */
export const walk = (dist: number, k = 1): Pose => {
  const u = dist / CYCLE;
  const a = CYCLE * STANCE * 0.5 * k;
  const fL = footAt(u, a, 0.052 * k);
  const fR = footAt(u + 0.5, a, 0.052 * k);
  const ph = u * Math.PI * 2;
  const base = stand();
  return {
    ...base,
    y: -0.006 * k + 0.006 * k * Math.cos(ph * 2),
    lean: 0.07 * k,
    twist: 0.1 * k * Math.sin(ph),
    roll: 0.03 * k * Math.cos(ph),
    nod: 0.02 - 0.03 * k,
    armL: armSwing("L", (fR.z / Math.max(1e-4, a)) * 0.5 * k),
    armR: armSwing("R", (fL.z / Math.max(1e-4, a)) * 0.5 * k),
    legL: { t: [0.092, BODY.ankleY + fL.y, fL.z], pole: [0, 0.1, 1], toe: fL.toe * k },
    legR: { t: [-0.092, BODY.ankleY + fR.y, fR.z], pole: [0, 0.1, 1], toe: fR.toe * k },
  };
};

export const cheer = (t: number, k = 1): Pose => {
  const hop = Math.max(0, Math.sin(t * 7.5)) * 0.05 * k;
  return {
    ...stand(),
    y: hop - 0.01 * k,
    lean: -0.06 * k,
    nod: -0.15 * k,
    armL: armCheer("L", Math.sin(t * 7.5)),
    armR: armCheer("R", Math.sin(t * 7.5 + 0.5)),
    legL: { t: [0.11, BODY.ankleY + hop, 0], pole: [0.2, 0, 1], toe: hop * 4 },
    legR: { t: [-0.11, BODY.ankleY + hop, 0], pole: [-0.2, 0, 1], toe: hop * 4 },
  };
};

export const think = (t: number): Pose => ({
  ...stand(t * 2),
  lean: 0.03,
  roll: 0.03,
  nod: -0.12 + 0.03 * Math.sin(t * 1.3),
  tilt: 0.16 + 0.03 * Math.sin(t * 0.9),
  turn: 0.1,
  armR: armChin("R"),
  armL: armHug("L"),
});

export const point = (t: number, D: V3 = [-1, 0.15, 0.5]): Pose => ({
  ...stand(t * 2),
  twist: -0.12,
  lean: 0.02,
  turn: -0.35,
  nod: -0.05,
  armR: armPoint("R", D),
});

export const wave = (t: number, hz = 2.2): Pose => ({
  ...stand(t * 2),
  roll: -0.03,
  tilt: -0.08,
  armR: armWave("R", t * hz * Math.PI * 2),
});

export const holdPhone = (t: number): Pose => ({
  ...stand(t * 2),
  lean: 0.04,
  nod: 0.34 + 0.02 * Math.sin(t * 1.1),
  armR: armHoldSelf("R", 0.004 * Math.sin(t * 1.7)),
});

/** বসা: seat = বসার তলের উচ্চতা (figure units) */
export const SEAT = 0.165;
export const sit = (t = 0): Pose => ({
  ...stand(t * 2),
  y: SEAT + 0.14 - BODY.pelvisY,
  lean: 0.06,
  legL: { t: [0.11, BODY.ankleY, 0.235], pole: [0.1, 1, 1], toe: 0 },
  legR: { t: [-0.11, BODY.ankleY, 0.235], pole: [-0.1, 1, 1], toe: 0 },
  armL: { ...armRest("L"), t: [0.17, -0.02, 0.2], dir: [0.1, -0.6, 1], palm: [0, -1, 0], pole: [0.5, 0, -1] },
  armR: { ...armRest("R"), t: [-0.17, -0.02, 0.2], dir: [-0.1, -0.6, 1], palm: [0, -1, 0], pole: [-0.5, 0, -1] },
});

export const typeAt = (t: number, base: Pose = sit(t), y = 0.1, z = 0.27): Pose => ({
  ...base,
  lean: base.lean + 0.06,
  nod: 0.16 + 0.02 * Math.sin(t * 0.8),
  armL: armType("L", t * 9, y, z),
  armR: armType("R", t * 9, y, z),
});
