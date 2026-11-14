// শব্দ ধরে সময় — cue("জিন্দাবাজারে") = ওই শব্দের শুরু (s)। after দিলে ওই সময়ের পরের প্রথমটা।
import words from "./words.json";
const W = (words as any).words as { w: string; start_ms: number; end_ms: number }[];
const norm = (s: string) => s.replace(/[।,?!.\-]/g, "").toLowerCase();
export const cue = (token: string, after = 0): number => {
  const k = norm(token);
  const hit = W.find((x) => x.start_ms / 1000 >= after - 1e-6 && norm(x.w).includes(k));
  if (!hit) throw new Error(`cue not found: ${token} after ${after}`);
  return hit.start_ms / 1000;
};
export const cueEnd = (token: string, after = 0): number => {
  const k = norm(token);
  const hit = W.find((x) => x.start_ms / 1000 >= after - 1e-6 && norm(x.w).includes(k));
  if (!hit) throw new Error(`cue not found: ${token} after ${after}`);
  return hit.end_ms / 1000;
};
/** scene শুরুর সময় (alignment থেকে) */
export const SCENES = { title: 0.18, answer: 20.88, price: 45.7, stat: 79.52, compare: 99.42, points: 145.06, timeline: 183.38, faq: 213.78, cta: 231.9, end: 258.78 };
export const DURATION = 259.4;
