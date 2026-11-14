// scenes_b — shared: Cue contract, industry list, beat timing helper, sample-cue builder
import React from "react";
import { useCurrentFrame } from "remotion";
import { FPS } from "../../kit/time";
export { Life, backIn } from "../../wd004/life";

/** scene-শুরু থেকে সেকেন্ড; শব্দ না পেলে NaN */
export type Cue = (word: string, after?: number) => number;
export type Industry = "dental" | "restaurant" | "ecommerce" | "school" | "realestate";
export const INDUSTRIES: Industry[] = ["dental", "restaurant", "ecommerce", "school", "realestate"];

export type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
export const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

/** cue word (বা শব্দ-তালিকা — প্রথম যেটা পাওয়া যায়) → সময়; না পেলে dur-এর ভগ্নাংশ। after = scene-সেকেন্ড */
export const beat = (cue: Cue, words: string | string[] | undefined, dur: number, frac: number, after = 0) => {
  const list = words === undefined ? [] : Array.isArray(words) ? words : [words];
  for (const w of list) {
    const v = cue(w, after);
    if (Number.isFinite(v)) return v;
  }
  return Math.max(after, dur * frac);
};

/** showcase-এর জন্য: [শব্দ, সেকেন্ড] তালিকা থেকে Cue (substring, case-insensitive, after-এর পরের প্রথমটা) */
export const mkCue = (list: [string, number][]): Cue => {
  const norm = (s: string) => s.replace(/[।,?!.\-]/g, "").toLowerCase();
  return (word, after = 0) => {
    const k = norm(word);
    const hit = list.find(([w, s]) => s >= after - 1e-6 && norm(w).includes(k));
    return hit ? hit[1] : NaN;
  };
};

/** showcase time (0 থেকে) */
export const useT = () => useCurrentFrame() / FPS;

/** 12480 → "12,480" */
export const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
