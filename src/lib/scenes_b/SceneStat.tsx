// SceneStat — একটা মূল সংখ্যা বস্তু হয়ে ওঠে। data অনুযায়ী visual: counter (odometer wheel), bars (তুলনা),
// calendar (দিন উল্টায়), hourglass (ঘণ্টা)। উপরে English caption card, নিচে industry-র subject (counter-এ subject-এর গাদা জমে)।
import React from "react";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { springStep, popIn, tween, range, emphDecel, drift, wobble } from "../../kit/anim";
import { Tag } from "../../kit/Clock";
import { Txt } from "../../kit/Clay";
import { SoftPanel } from "../../kit/Soft";
import { C } from "../../kit/theme";
import { BarChart, barGrow } from "../dataviz/Bars";
import { Hourglass, HOURGLASS_H } from "../../wd004/props/s03";
import { Cue, Industry, Life, beat, fmt, clamp01 } from "./common";
import { THEME, Subject, Pedestal } from "./industry";
import { Odometer, odoWidth, DeskCalendar, CAL } from "./props";

type W = string | string[];
export type StatVisual = "counter" | "bars" | "calendar" | "hourglass";
export type StatData = {
  industry: Industry;
  value: number;
  /** English, 3D: যেমন "ORDERS EVERY MONTH" */
  label: string;
  sub?: string;
  unit?: string; // "DAYS", "HOURS", "ORDERS" …
  prefix?: string;
  suffix?: string; // "+", "%"
  visual?: StatVisual | "auto";
  /** bars-এর জন্য: আগে/পরে বা তুলনা (শেষটা highlight) */
  compare?: { label: string; value: number }[];
  cues?: { label?: W; value?: W; sub?: W; compare?: W[] };
};

/** data থেকে visual বাছাই */
export const pickVisual = (d: StatData): StatVisual => {
  if (d.visual && d.visual !== "auto") return d.visual;
  if (d.compare && d.compare.length >= 2) return "bars";
  const u = (d.unit ?? "").toLowerCase();
  if (/day|week|month/.test(u)) return "calendar";
  if (/hour|hr|min|24/.test(u)) return "hourglass";
  return "counter";
};

const cam: Cam = { pos: [0, 2.9, 21], target: [0, -0.5, 0], fov: 27 };
const CARD = atScreen(0.5, 0.15, -0.5, cam);
const CARD_W = worldWidth(0.84, -0.5, cam);
const MID = atScreen(0.5, 0.44, 0, cam);
const SUBP = atFloor(0.2, 0.84, cam);
const SUB_S = worldWidth(0.22, SUBP[2], cam) / 1.4;
const TAGP = atFloor(0.7, 0.86, cam);

export const SceneStat: React.FC<{ t: number; dur: number; cue: Cue; data: StatData }> = ({ t, dur, cue, data }) => {
  const th = THEME[data.industry];
  const vis = pickVisual(data);
  const cw = data.cues ?? {};
  const T = {
    label: Math.max(0.3, beat(cue, cw.label, dur, 0.05)),
    value: beat(cue, cw.value, dur, 0.4),
    sub: beat(cue, cw.sub, dur, 0.62),
  };
  T.value = Math.max(T.label + 0.5, T.value);
  const OUT = dur - 0.62;
  const unitTxt = data.unit ?? "";
  const big = `${data.prefix ?? ""}${fmt(data.value)}${data.suffix ?? ""}`;

  // ---- caption card ----
  const lines = [data.label, data.sub].filter(Boolean) as string[];
  const cardH = data.sub ? 1.5 : 1.0;
  const fs = Math.min(0.36, (CARD_W * 0.86) / Math.max(4, data.label.length * 0.66));
  const fs2 = data.sub ? Math.min(0.24, (CARD_W * 0.84) / Math.max(4, data.sub.length * 0.64)) : 0;
  const subK = range(t, T.sub, T.sub + 0.35);

  // ---- main visual timing ----
  const settle = vis === "counter" ? T.value + 0.4 + 0.14 * String(Math.round(data.value)).length : T.value + 1.3;
  const pulse = wobble(t - settle, 0.06, 2.4, 0.2);
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.06 * drift(t, 1), cam.pos[1] + 0.04 * drift(t, 3), cam.pos[2] - 0.7 * range(t, 0, dur)] };

  let main: React.ReactNode = null;
  if (vis === "counter") {
    const n = String(Math.round(data.value)).length;
    const spin = Array.from({ length: n }, (_, i) => springStep(t - T.value - 0.12 * (n - 1 - i) - 0.05, { k: 38, c: 7.2 }));
    const ow = odoWidth(data.value, data.suffix, data.prefix);
    const s = Math.min(worldWidth(0.84, 0, cam) / ow, (worldWidth(1, 0, cam) * (1920 / 1080) * 0.3) / 2.71);
    main = (
      <Life t={t} a={T.label + 0.25} b={OUT} position={MID} scale={s * (1 + pulse)} rotation={[0.04, -0.16 + 0.03 * drift(t, 5), 0]}>
        <Odometer value={data.value} spin={spin} suffix={data.suffix} prefix={data.prefix} accent={C.orange} />
        {unitTxt && (
          <Tag text={unitTxt} size={0.26} color={th.accent} position={[0, -0.9, 0.3]} />
        )}
      </Life>
    );
  } else if (vis === "calendar") {
    const n = tween(t, T.value, T.value + Math.min(1.6, 0.25 + data.value * 0.09), 1, data.value, emphDecel);
    const s = worldWidth(0.58, 0, cam) / CAL.w;
    main = (
      <Life t={t} a={T.label + 0.25} b={OUT} position={[MID[0], MID[1] - 0.45, MID[2]]} scale={s * (1 + pulse)} rotation={[0.05, -0.28 + 0.03 * drift(t, 5), 0]}>
        <DeskCalendar n={n} top={unitTxt || "DAYS"} header={th.accent} unit={unitTxt || "DAYS"} />
      </Life>
    );
  } else if (vis === "bars") {
    const cmp = data.compare ?? [];
    const starts = cmp.map((_, i) => beat(cue, cw.compare?.[i], dur, 0.3 + i * 0.12));
    if (cw.compare?.[cmp.length - 1] === undefined) starts[cmp.length - 1] = T.value;
    const grow = cmp.map((_, i) => barGrow(t, 0, starts[i], 0));
    const s = Math.min(worldWidth(0.7, 0, cam) / (cmp.length * 0.84 + 0.5), (worldWidth(1, 0, cam) * (1920 / 1080) * 0.4) / 3.4);
    const bp = atScreen(0.5, 0.7, 0, cam);
    const baseK = springStep(t - T.label - 0.2, { k: 120, c: 13 });
    main = (
      <Life t={t} a={T.label + 0.2} b={OUT} position={bp} scale={s} rotation={[0, -0.3 + 0.03 * drift(t, 5), 0]}>
        <BarChart values={cmp.map((c) => c.value)} labels={cmp.map(() => "")} grow={grow} base={baseK} suffix={data.suffix ?? ""} />
        {cmp.map((c, i) => (
          <Txt key={i} size={0.2} color={C.navy} position={[(i - (cmp.length - 1) / 2) * 0.84, 0.17, 0.75]} opacity={Math.min(1, baseK * 1.5)} letterSpacing={0.05}>
            {c.label}
          </Txt>
        ))}
      </Life>
    );
  } else {
    // hourglass: উল্টে যায়, বালি ঝরে; পাশে ঘণ্টা গোনা panel
    const flip = tween(t, T.value - 0.1, T.value + 0.55, 0, Math.PI, emphDecel);
    const flow = range(t, T.value + 0.5, OUT);
    const hp = atScreen(0.33, 0.63, 0, cam);
    const hs = (worldWidth(1, 0, cam) * (1920 / 1080) * 0.27) / HOURGLASS_H;
    const cnt = Math.round(tween(t, T.value + 0.1, T.value + 1.2, 0, data.value, emphDecel));
    const pp = atScreen(0.71, 0.48, 0.5, cam);
    const ps = worldWidth(0.4, 0.5, cam) / 2.2;
    main = (
      <>
        <Life t={t} a={T.label + 0.25} b={OUT} position={hp} scale={hs}>
          {/* state(top a, bottom b) θ-তে ঘোরানো == state(top b, bottom a) θ−π-তে — তাই অর্ধেক পেরোলে swap, শেষে rotation 0 */}
          <group position={[0, HOURGLASS_H / 2, 0]} rotation={[0, 0.4 * t, flip <= Math.PI / 2 ? flip : flip - Math.PI]}>
            <group position={[0, -HOURGLASS_H / 2, 0]}>
              <Hourglass top={flip <= Math.PI / 2 ? 0.25 : 0.75 * (1 - flow) + 0.04} bottom={flip <= Math.PI / 2 ? 0.75 : 0.25 + 0.65 * flow} stream={flip > Math.PI * 0.97 && flow < 0.98} />
            </group>
          </group>
        </Life>
        <Life t={t} a={T.value} b={OUT} position={pp} scale={ps * (1 + pulse)} rotation={[0, -0.25, 0]}>
          <SoftPanel w={2.2} h={2.0} color="#FBF7F1">
            <Txt size={0.95} color={C.deepNavy} position={[0, 0.22, 0.03]}>
              {`${data.prefix ?? ""}${cnt}${data.suffix ?? ""}`}
            </Txt>
            <Txt size={0.26} color={th.accent} position={[0, -0.6, 0.03]} letterSpacing={0.1}>
              {unitTxt || "HOURS"}
            </Txt>
          </SoftPanel>
        </Life>
      </>
    );
  }

  // counter: subject-এর গাদা — প্রতিটা digit থামার সময় একটা করে পড়ে
  const pile = vis === "counter" ? [0, 1, 2] : [];
  const pileP = atFloor(0.78, 0.82, cam);

  return (
    <Stage cam={camLive}>
      {/* caption */}
      <Life t={t} a={T.label} b={OUT + 0.1} position={CARD} scale={1}>
        <SoftPanel w={CARD_W} h={cardH} color="#FBF7F1" rotation={[0.04, 0, 0]}>
          <Txt size={fs} color={C.deepNavy} position={[0, data.sub ? 0.27 * subK : 0, 0.03]} letterSpacing={0.03}>
            {lines[0]}
          </Txt>
          {data.sub && subK > 0 && (
            <Txt size={fs2} color={th.accent} position={[0, -0.3 - (1 - subK) * 0.15, 0.03]} opacity={subK} letterSpacing={0.05}>
              {data.sub}
            </Txt>
          )}
        </SoftPanel>
      </Life>

      {main}

      {/* industry subject */}
      <Life t={t} a={0.3} b={OUT} position={SUBP} scale={SUB_S} rotation={[0, 0.4, 0]}>
        <Pedestal r={0.7} h={0.28} />
        <group position={[0, 0.28, 0]} rotation={[0, 0.3 * Math.sin(t * 0.7), 0]}>
          <Subject industry={data.industry} t={t} scale={1.05} />
        </group>
      </Life>
      {pile.map((i) => (
        <Life
          key={i}
          t={t}
          a={settle - 0.3 + i * 0.22}
          b={OUT + i * 0.04}
          kind="drop"
          position={[pileP[0] + [-0.35, 0.4, 0.02][i] * SUB_S, FLOOR + (i === 2 ? 0.95 : 0) * SUB_S * 0.8, pileP[2] + [0.1, -0.15, 0][i] * SUB_S]}
          scale={SUB_S * 0.8}
          rotation={[0, [0.5, -0.4, 0.15][i], i === 2 ? 0.12 : 0]}
        >
          <Subject industry={data.industry} t={t} />
        </Life>
      ))}
      {vis !== "counter" && (
        <Life t={t} a={settle} b={OUT} position={[TAGP[0], FLOOR + 0.35, TAGP[2]]} scale={worldWidth(0.36, TAGP[2], cam) / Math.max(1.6, (big.length + (unitTxt.length <= 10 ? unitTxt.length + 1 : 0)) * 0.2 + 0.33)}>
          <Tag text={`${big} ${unitTxt.length <= 10 ? unitTxt : ""}`.trim()} size={0.3} color={C.deepNavy} />
        </Life>
      )}
    </Stage>
  );
};
