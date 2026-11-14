// Bar chart — নরম clay plinth-এর উপর বালিশ-কোণের column; প্রতিটা bar spring overshoot নিয়ে বাড়ে,
// মাথার সংখ্যা count-up করে bar-এর সাথে ওঠে। bevel অক্ষত থাকে (stretchGeo — scale নয়)।
import React, { useMemo } from "react";
import { slabGeo } from "../../kit/Geo";
import { ClayMat, Txt } from "../../kit/Clay";
import { RaisedBar } from "../../kit/Soft";
import { springStep } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, P, Gloss, fmt, stretchGeo } from "./common";

const H0 = 0.34;

/** bar i-এর grow (0 → overshoot → 1) — showcase/scene দুটোতেই */
export const barGrow = (t: number, i: number, start = 0.3, stagger = 0.22) => springStep(t - start - i * stagger, { k: 58, c: 6.4 });

export const Column: React.FC<P & { w: number; h: number; color: string }> = ({ w, h, color, ...p }) => {
  const base = useMemo(() => {
    const g = slabGeo(w, w, H0, w * 0.2, w * 0.16, 8);
    g.rotateX(-Math.PI / 2);
    g.translate(0, H0 / 2, 0);
    return g;
  }, [w]);
  const hh = Math.max(0.0001, h);
  const geo = useMemo(() => (hh >= H0 ? stretchGeo(base, 1, H0 / 2, hh - H0) : base), [base, hh]);
  return (
    <G {...p}>
      <mesh geometry={geo} scale={[1, hh < H0 ? hh / H0 : 1, 1]} castShadow receiveShadow>
        <Gloss color={color} />
      </mesh>
    </G>
  );
};

export const BarChart: React.FC<
  P & {
    values: number[];
    labels: string[];
    /** প্রতি bar-এর grow (0..~1.2 overshoot সহ) */
    grow: number[];
    highlight?: number;
    max?: number;
    prefix?: string;
    suffix?: string;
    /** 0..1 — plinth/back board-এর উপস্থিতি */
    base?: number;
    title?: string;
  }
> = ({ values, labels, grow, highlight = values.length - 1, max, prefix = "", suffix = "", base = 1, title, ...p }) => {
  const n = values.length;
  const gap = 0.84;
  const bw = 0.58;
  const W = n * gap + 0.5;
  const mx = max ?? Math.max(...values);
  const HMAX = 2.35;
  const plinth = useMemo(() => slabGeo(W, 0.34, 1.35, 0.17, 0.13, 8), [W]);
  const board = useMemo(() => slabGeo(W, 3.05, 0.2, 0.3, 0.08, 8), [W]);
  return (
    <G {...p}>
      <group scale={[1, Math.max(0.001, base), 1]}>
        {/* plinth */}
        <mesh geometry={plinth} rotation={[0, 0, 0]} position={[0, 0.17, 0]} castShadow receiveShadow>
          <ClayMat color="#F3ECE3" rough={0.66} />
        </mesh>
        {/* back board + grid lines */}
        <mesh geometry={board} position={[0, 0.34 + 1.48, -0.58]} castShadow receiveShadow>
          <ClayMat color="#F6F0E8" rough={0.7} />
        </mesh>
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <RaisedBar key={k} w={W - 0.5} h={0.035} d={0.02} color="#E6DCD0" position={[0, 0.34 + k * HMAX, -0.47]} />
        ))}
        {title && (
          <Txt size={0.2} color={C.navy} position={[-W / 2 + 0.3, 0.34 + 2.82, -0.46]} anchorX="left" letterSpacing={0.04}>
            {title}
          </Txt>
        )}
      </group>
      {values.map((v, i) => {
        const x = (i - (n - 1) / 2) * gap;
        const g = Math.max(0, grow[i] ?? 0);
        const h = (v / mx) * HMAX * g;
        const hl = i === highlight;
        const shown = Math.round(v * Math.min(1, g / 0.95));
        return (
          <group key={i} position={[x, 0.34, 0]}>
            {g > 0.001 && <Column w={bw} h={h} color={hl ? C.orange : i % 2 ? "#5F8DB9" : C.steel} />}
            {g > 0.05 && (
              <Txt size={hl ? 0.27 : 0.22} color={hl ? C.deepOrange : C.navy} position={[0, h + 0.24, 0.1]} opacity={Math.min(1, g * 3)}>
                {prefix + fmt(shown) + suffix}
              </Txt>
            )}
            <Txt size={0.17} color={C.navy} position={[0, -0.17, 0.71]} opacity={Math.min(1, base * 1.5)}>
              {labels[i] ?? ""}
            </Txt>
          </group>
        );
      })}
    </G>
  );
};
