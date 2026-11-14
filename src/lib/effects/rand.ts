// deterministic randomness — সব effect seeded; একই seed = প্রতিটা frame/tab-এ হুবহু এক
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
/** seed থেকে n টা item-এর জন্য স্থির random list */
export const seeded = <T,>(seed: number, n: number, make: (r: () => number, i: number) => T): T[] => {
  const r = mulberry32(seed);
  return Array.from({ length: n }, (_, i) => make(r, i));
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** r() → [a,b] */
export const between = (r: () => number, a: number, b: number) => a + (b - a) * r();
/** angle-কে [-π, π]-এ আনা */
export const wrapPi = (a: number) => a - Math.round(a / (2 * Math.PI)) * 2 * Math.PI;
/** সবচেয়ে কাছের π-গুণিতক থেকে বাকি কোণ (coin/কাগজ সমতল হয়ে পড়ার জন্য) */
export const residualToFlat = (a: number) => a - Math.round(a / Math.PI) * Math.PI;
