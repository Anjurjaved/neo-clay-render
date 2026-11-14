// সময় ও animation helper — সব কিছু "ভিডিওর absolute সেকেন্ড" (t) দিয়ে চলে,
// যাতে shot bible-এর টেবিলের সময় হুবহু code-এ বসানো যায়।
import { useCurrentFrame, spring } from "remotion";
import words from "../data/words.json";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const TOTAL_SEC = 120.7;

/** segment-এর ভেতরে: absolute video second (Sequence-এর local frame + segment start) */
export const useVideoTime = (segStart: number) => useCurrentFrame() / FPS + segStart;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const mix3 = (a: number[], b: number[], k: number) => a.map((v, i) => lerp(v, b[i], k)) as [number, number, number];

export const ease = {
  linear: (x: number) => x,
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  inCubic: (x: number) => x * x * x,
  inOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuint: (x: number) => 1 - Math.pow(1 - x, 5),
  inOutSine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x: number, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
};

/** a→b সময়ে 0→1 progress, easing সহ */
export const prog = (t: number, a: number, b: number, fn: (x: number) => number = ease.inOutCubic) =>
  fn(clamp01((t - a) / Math.max(1e-6, b - a)));

/** soft-body spring 0→1 (overshoot সহ), t0-তে শুরু */
export const spr = (t: number, t0: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  t < t0
    ? 0
    : spring({
        frame: (t - t0) * FPS,
        fps: FPS,
        config: { damping: cfg.damping ?? 12, stiffness: cfg.stiffness ?? 170, mass: cfg.mass ?? 0.7 },
      });

/** clay "pop" — scale 0 → ~1.08 → 1 */
export const pop = (t: number, t0: number, dur = 0.4) => spr(t, t0, { damping: 11, stiffness: 120 / (dur * dur * 2.4), mass: 0.6 });

/** damped swing (sign দোলা) — t0 থেকে angle(rad) */
export const swing = (t: number, t0: number, amp = 0.5, freq = 2.2, decay = 3.2) =>
  t < t0 ? 0 : amp * Math.exp(-(t - t0) * decay) * Math.sin((t - t0) * freq * Math.PI * 2);

/** squash-stretch on landing: progress k (0..1 spring) → [sx, sy] */
export const squash = (k: number, amt = 0.12) => {
  const d = (k - 1) * 4; // overshoot অংশ
  const s = Math.max(-1, Math.min(1, d)) * amt;
  return [1 - s * 0.5, 1 + s] as [number, number];
};

/** খুব হালকা idle float (bible: "barely visible idle float") */
export const idle = (t: number, seed = 0, amp = 0.025) => Math.sin(t * 1.3 + seed * 1.7) * amp;

/** word index → absolute সেকেন্ড (start) */
export const wordStart = (i: number) => (words as any).words[i].start_ms / 1000;
export const wordEnd = (i: number) => (words as any).words[i].end_ms / 1000;

/** typing: t0 থেকে cps গতিতে text টাইপ (মানুষের মতো অসম cadence) */
export const typed = (text: string, t: number, t0: number, t1: number) => {
  if (t <= t0) return "";
  if (t >= t1) return text;
  const k = (t - t0) / (t1 - t0);
  // hash-jitter: প্রতিটা অক্ষরের নিজের delay
  let acc = 0;
  const weights = [...text].map((ch, i) => {
    const h = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const j = 0.7 + (h - Math.floor(h)) * 0.6;
    return ch === " " ? j * 1.6 : j;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let n = 0;
  for (const w of weights) {
    acc += w;
    if (acc / total <= k) n++;
    else break;
  }
  return text.slice(0, n);
};

/** caret blink */
export const caretOn = (t: number) => Math.floor(t * 2.2) % 2 === 0;
