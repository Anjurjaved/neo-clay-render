// Camera presets — pure function (t → Cam)। Stage-এর `cam` prop-এ সরাসরি দিন; ScreenOverlay-ও একই Cam পায় বলে
// DOM screen ঠিক জায়গায় থাকে। সব easing মসৃণ (শুরু-শেষে velocity 0), কোনো ঝাঁকুনি নয়।
import { Cam, DEFAULT_CAM } from "../../kit/Stage";
import { cubicBezier } from "../../kit/anim";

type V3 = [number, number, number];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lv = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** cinematic in-out (দীর্ঘ মসৃণ ধীরগতি শেষে) */
export const camEase = cubicBezier(0.45, 0, 0.15, 1);
const prog = (t: number, t0: number, t1: number, fn = camEase) => fn(clamp01((t - t0) / Math.max(1e-6, t1 - t0)));

/** দুই Cam-এর মাঝে (pos/target/fov/roll সব) */
export const camBlend = (a: Cam, b: Cam, k: number): Cam => ({ pos: lv(a.pos, b.pos, k), target: lv(a.target, b.target, k), fov: lerp(a.fov, b.fov, k), roll: lerp(a.roll ?? 0, b.roll ?? 0, k) });

/**
 * Push-in: target-এর দিকে ক্যামেরা এগোয় (dolly) + fov সামান্য সরু → বিষয় বড় হয়, background একটু চাপে।
 * amount = দূরত্বের কত অংশ এগোবে (0.25–0.4 ভালো), focus দিলে target সেদিকে সরে।
 */
export const camPushIn = (t: number, t0: number, t1: number, o: { base?: Cam; amount?: number; fovTo?: number; focus?: V3 } = {}): Cam => {
  const base = o.base ?? DEFAULT_CAM;
  const k = prog(t, t0, t1);
  const target = o.focus ? lv(base.target, o.focus, k) : base.target;
  const dir = base.pos.map((v, i) => v - base.target[i]) as V3;
  const a = (o.amount ?? 0.32) * k;
  return { pos: [target[0] + dir[0] * (1 - a), target[1] + dir[1] * (1 - a), target[2] + dir[2] * (1 - a)], target, fov: lerp(base.fov, o.fovTo ?? base.fov * 0.94, k), roll: base.roll };
};

/**
 * Orbit: target ঘিরে y-অক্ষে angle রেডিয়ান ঘোরা (ধনাত্মক = ক্যামেরা ডানে যায়), সাথে সামান্য উচ্চতা বদল (lift)।
 * from = শুরুর কোণ (0 = base-এর অবস্থান)।
 */
export const camOrbit = (t: number, t0: number, t1: number, o: { base?: Cam; angle?: number; from?: number; lift?: number; center?: V3 } = {}): Cam => {
  const base = o.base ?? DEFAULT_CAM;
  const k = prog(t, t0, t1);
  const c = o.center ?? base.target;
  const a = (o.from ?? 0) + (o.angle ?? 0.55) * k;
  const dx = base.pos[0] - c[0],
    dz = base.pos[2] - c[2];
  const x = dx * Math.cos(a) + dz * Math.sin(a),
    z = -dx * Math.sin(a) + dz * Math.cos(a);
  return { pos: [c[0] + x, base.pos[1] + (o.lift ?? 0.6) * k, c[2] + z], target: c, fov: base.fov, roll: base.roll };
};

/**
 * Parallax rise: ক্যামেরা উপরে ওঠে আর সামান্য এগোয়, কিন্তু target কম ওঠে → সামনের বস্তু পেছনের চেয়ে দ্রুত নামে (গভীরতা বোঝা যায়)।
 * rise = ক্যামেরা কত ওঠে, targetRise = target কত ওঠে (rise-এর ~30%), dolly = কত এগোয়।
 */
export const camParallaxRise = (t: number, t0: number, t1: number, o: { base?: Cam; rise?: number; targetRise?: number; dolly?: number; drift?: number } = {}): Cam => {
  const base = o.base ?? DEFAULT_CAM;
  const k = prog(t, t0, t1);
  const rise = o.rise ?? 3.2;
  return {
    pos: [base.pos[0] + (o.drift ?? 0.6) * k, base.pos[1] + rise * k, base.pos[2] - (o.dolly ?? 2.2) * k],
    target: [base.target[0] + (o.drift ?? 0.6) * 0.3 * k, base.target[1] + (o.targetRise ?? rise * 0.28) * k, base.target[2]],
    fov: base.fov,
    roll: base.roll,
  };
};

/** খুব হালকা "হাতে ধরা" শ্বাস — deterministic, amp world unit (0.03–0.08) */
export const camBreath = (cam: Cam, t: number, amp = 0.05, seed = 0): Cam => {
  const n = (f: number, p: number) => Math.sin(t * f + seed * 1.7 + p) * 0.6 + Math.sin(t * f * 2.13 + seed * 3.1 + p * 1.9) * 0.4;
  return { ...cam, pos: [cam.pos[0] + n(0.7, 0) * amp, cam.pos[1] + n(0.55, 2) * amp * 0.7, cam.pos[2]], roll: (cam.roll ?? 0) + n(0.4, 4) * amp * 0.012 };
};

/**
 * কয়েকটা preset পরপর জোড়া: প্রতিটা segment আগেরটার শেষ Cam-কে base হিসেবে পায় → কোনো লাফ নেই।
 * camChain(t, [(t, base) => camPushIn(t, 0, 2, {base}), (t, base) => camOrbit(t, 2, 4, {base})], [2, 4])
 */
export const camChain = (t: number, steps: ((t: number, base: Cam) => Cam)[], ends: number[], start: Cam = DEFAULT_CAM): Cam => {
  let base = start;
  for (let i = 0; i < steps.length; i++) {
    if (t <= ends[i] || i === steps.length - 1) return steps[i](t, base);
    base = steps[i](ends[i], base);
  }
  return base;
};
