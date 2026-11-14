// Progress bar — পুরু clay card-এ খোদাই করা খাঁজ (trough), ভেতরে চকচকে কমলা fill যা spring নিয়ে এগোয়;
// ১০০% ছাড়িয়ে গেলে fill থেমে ফুলে ওঠে (squash), milestone dot জ্বলে, শেষে check badge pop।
import React, { useMemo } from "react";
import { Txt } from "../../kit/Clay";
import { pillGeo, slabGeo } from "../../kit/Geo";
import { SoftPanel, CheckBadge } from "../../kit/Soft";
import { ClayMat } from "../../kit/Clay";
import { C } from "../../kit/theme";
import { G, P, Gloss, stretchGeo } from "./common";

export const ProgressBar: React.FC<
  P & {
    /** 0..1+ — 1-এর বেশি হলে fill থামে, ফুলে ওঠে (overshoot squash) */
    value: number;
    title?: string;
    steps?: string[];
    /** 0..1 check badge */
    done?: number;
    w?: number;
  }
> = ({ value, title = "WEBSITE BUILD", steps = [], done = 0, w = 4.6, ...p }) => {
  const h = 2.05;
  const tw = w - 0.6; // trough
  const th = 0.5;
  const fh = 0.38;
  const k = Math.max(0, Math.min(1, value));
  const over = Math.max(0, value - 1);
  const trough = useMemo(() => slabGeo(tw, th, 0.06, th / 2, 0.025, 4, false), [tw]);
  const base = useMemo(() => {
    const g = pillGeo(fh, fh, 0.22, 0.09);
    g.translate(fh / 2, 0, 0);
    return g;
  }, []);
  const L = fh + (tw - 0.12 - fh) * k;
  const geo = useMemo(() => stretchGeo(base, 0, fh / 2, L - fh), [base, L]);
  const pct = Math.round(k * 100);
  const bulge = 1 + Math.min(0.25, over * 2.2);
  return (
    <G {...p}>
      <SoftPanel w={w} h={h} thick={0.36} color="#F5EFE7">
        <Txt size={0.21} color={C.navy} anchorX="left" position={[-w / 2 + 0.34, h / 2 - 0.42, 0.03]} letterSpacing={0.05}>
          {title}
        </Txt>
        <Txt size={0.42} color={k >= 1 ? C.deepOrange : C.deepNavy} anchorX="right" position={[w / 2 - 0.36, h / 2 - 0.46, 0.03]}>
          {pct + "%"}
        </Txt>
        {done > 0.01 && <CheckBadge scale={0.62 * done} position={[w / 2 - 0.08, h / 2 - 0.06, 0.04]} rotation={[0, 0, -0.15 * (1 - done)]} />}
        {/* খাঁজ: সামনের তল থেকে সামান্য পিছনে (গভীর) */}
        <mesh geometry={trough} position={[0, -0.12, -0.035]} receiveShadow>
          <ClayMat color="#DCD0C2" rough={0.8} bump={0.12} />
        </mesh>
        {k > 0.001 && (
          <mesh geometry={geo} position={[-tw / 2 + 0.06, -0.12, 0.08]} scale={[1, bulge, 1 + (bulge - 1) * 0.6]} castShadow>
            <Gloss color={C.orange} rough={0.32} coat={0.75} />
          </mesh>
        )}
        {steps.map((s, i) => {
          const f = steps.length === 1 ? 1 : (i + 1) / steps.length;
          const x = -tw / 2 + 0.06 + (tw - 0.12) * f - 0.2;
          const on = k >= f - 0.02;
          return (
            <group key={i} position={[x, -0.68, 0.03]}>
              <Txt size={0.15} color={on ? C.deepOrange : "#8b97a6"} anchorX="center" letterSpacing={0.04}>
                {s}
              </Txt>
            </group>
          );
        })}
      </SoftPanel>
    </G>
  );
};
