// soft-body motion helpers (pure functions of t) — research/motion থেকে
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smoothstep = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
export const range = (t: number, t0: number, t1: number) => clamp((t - t0) / (t1 - t0));
export const cubicPulse = (c: number, w: number, x: number) => {
  x = Math.abs(x - c);
  if (x > w) return 0;
  x /= w;
  return 1 - x * x * (3 - 2 * x);
};
export const vel = (f: (t: number) => number, t: number, h = 1 / 240) => (f(t + h) - f(t - h)) / (2 * h);

export type Spring = { k?: number; c?: number; m?: number };
/** closed-form damped spring step 0→1 (frame-exact) */
export const springStep = (t: number, s: Spring = {}, v0 = 0) => {
  if (t <= 0) return 0;
  const { k = 100, c = 10, m = 1 } = s;
  const w0 = Math.sqrt(k / m),
    z = c / (2 * Math.sqrt(k * m));
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0 - v0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + (w0 - v0) * t);
};
/** impulse wobble — 0-তে বিশ্রাম, ধাক্কার পর কাঁপে ও থামে */
export const wobble = (t: number, amp: number, freqHz: number, zeta: number) =>
  t <= 0 ? 0 : amp * Math.exp(-zeta * 2 * Math.PI * freqHz * t) * Math.sin(2 * Math.PI * freqHz * Math.sqrt(1 - zeta * zeta) * t);

/** clay pop: anticipation → jelly overshoot → settle; non-uniform jiggle */
export const popIn = (t: number, t0: number, s: Spring = { k: 260, c: 13 }) => {
  const u = t - t0;
  if (u <= 0) return { s: 0, sx: 1, sy: 1 };
  const sc = springStep(u, s);
  const jig = wobble(u - 0.05, 0.07, 3.0, 0.22);
  return { s: Math.max(0, sc), sx: 1 + jig, sy: 1 - jig };
};

export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  let u = x;
  for (let i = 0; i < 8; i++) {
    const bx = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3 - x;
    const d = 3 * (1 - u) ** 2 * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(d) < 1e-6) break;
    u = clamp(u - bx / d);
  }
  return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3;
};
/** Material emphasized-decelerate, premium expo-out */
export const emphDecel = cubicBezier(0.05, 0.7, 0.1, 1);
export const expoOut = cubicBezier(0.16, 1, 0.3, 1);
export const standard = cubicBezier(0.2, 0, 0, 1);

/** দুই সময়ের মধ্যে value — easing fn সহ */
export const tween = (t: number, t0: number, t1: number, a: number, b: number, fn: (x: number) => number = standard) => a + (b - a) * fn(range(t, t0, t1));

/**
 * walk: path(t) → x,z position; ফেজ = দূরত্ব/চক্র দৈর্ঘ্য → পা পিছলায় না।
 * dist(t) সংখ্যাগতভাবে integrate করা হয় (fixed dt, deterministic)।
 */
export const pathDistance = (pos: (t: number) => [number, number], t0: number, t: number, dt = 1 / 120) => {
  let d = 0;
  let [px, pz] = pos(t0);
  for (let u = t0 + dt; u <= t; u += dt) {
    const [x, z] = pos(u);
    d += Math.hypot(x - px, z - pz);
    px = x;
    pz = z;
  }
  return d;
};
export const speedAt = (pos: (t: number) => [number, number], t: number) => {
  const h = 1 / 120;
  const [a, b] = pos(t - h),
    [c, d] = pos(t + h);
  return Math.hypot(c - a, d - b) / (2 * h);
};
/** heading (rotation.y) যাতে figure চলার দিকে মুখ করে (model সামনে +z) */
export const headingAt = (pos: (t: number) => [number, number], t: number, fallback = 0) => {
  const h = 1 / 60;
  const [a, b] = pos(t - h),
    [c, d] = pos(t + h);
  const dx = c - a,
    dz = d - b;
  if (Math.hypot(dx, dz) < 1e-4) return fallback;
  return Math.atan2(dx, dz);
};

/** deterministic smooth drift (camera ইত্যাদি) */
export const drift = (t: number, seed = 0) => Math.sin(t * 0.31 + seed) * 0.5 + Math.sin(t * 0.73 + seed * 2.1) * 0.3 + Math.sin(t * 1.37 + seed * 3.7) * 0.2;
