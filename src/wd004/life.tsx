// সব scene-এর common enter/exit wrapper — pop/rise/drop দিয়ে ঢোকে, shrink/sink/up দিয়ে পুরো বেরোয়
import React from "react";
import { FLOOR } from "../kit/Stage";
import { springStep, wobble, popIn, cubicBezier } from "../kit/anim";

export const backIn = cubicBezier(0.36, 0, 0.66, -0.56);

/** appear (pop/rise) + exit (shrink বা sink) — একটা wrapper */
export const Life: React.FC<{
  t: number;
  a: number; // ঢোকার সময়
  b?: number; // বেরোনোর সময়
  kind?: "pop" | "rise" | "drop";
  exit?: "shrink" | "sink" | "up";
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  outDur?: number;
  children: React.ReactNode;
}> = ({ t, a, b = 999, kind = "pop", exit = "shrink", position, scale = 1, rotation, outDur = 0.38, children }) => {
  if (t < a - 0.02 || t > b + outDur + 0.02) return null;
  let [x, y, z] = position;
  let sx = scale,
    sy = scale,
    sz = scale;
  if (kind === "pop") {
    const p = popIn(t, a, { k: 230, c: 15 });
    sx *= p.s * p.sx;
    sy *= p.s * p.sy;
    sz *= p.s;
  } else if (kind === "rise") {
    const k = springStep(t - a, { k: 120, c: 14 });
    y = FLOOR + (y - FLOOR) - (1 - k) * 4 * scale;
  } else if (kind === "drop") {
    const k = springStep(t - a, { k: 150, c: 12 });
    y = y + (1 - k) * 6;
    const sq = 1 + wobble(t - a - 0.18, 0.12, 3, 0.25);
    sy *= sq;
    sx /= Math.sqrt(sq);
    sz /= Math.sqrt(sq);
  }
  if (t > b) {
    const e = Math.min(1, (t - b) / outDur);
    if (exit === "shrink") {
      const s = Math.max(0, 1 - backIn(e));
      sx *= s;
      sy *= s;
      sz *= s;
    } else if (exit === "sink") {
      y -= e * e * 5 * scale;
    } else {
      y += e * e * 8;
      const s = 1 - e;
      sx *= s;
      sy *= s;
      sz *= s;
    }
  }
  return (
    <group position={[x, y, z]} scale={[sx, sy, sz]} rotation={rotation as any}>
      {children}
    </group>
  );
};

