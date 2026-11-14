// SceneAnswer — সরাসরি উত্তর: Javed IT Solution logo → business-এর subject → MacBook খুলে নতুন site তৈরি হয় →
// দামের tag সুতায় নেমে দোলে (min → max count-up) → calendar দিন গুনে উল্টায় → দিন শেষে site LIVE। শেষে সব বেরিয়ে যায়।
import React from "react";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { springStep, popIn, tween, range, expoOut, emphDecel, drift, wobble } from "../../kit/anim";
import { LogoMark } from "../../kit/Logo";
import { Tag } from "../../kit/Clock";
import { Txt, Glow } from "../../kit/Clay";
import { CheckBadge } from "../../kit/Soft";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { Cue, Industry, Life, backIn, beat, fmt, clamp01 } from "./common";
import { THEME, Subject, Pedestal } from "./industry";
import { MacBook, macScreen, MB } from "./MacBook";
import { SiteDesk } from "./SiteDesk";
import { HangTag, TAG, DeskCalendar } from "./props";

type W = string | string[];
export type AnswerData = {
  industry: Industry;
  priceMin: number; // BDT
  priceMax: number;
  daysMin: number;
  daysMax: number;
  finish?: "silver" | "grey";
  /** VO-র কোন শব্দে কোন beat — না দিলে default শব্দ, না পেলে dur-এর ভগ্নাংশ */
  cues?: Partial<Record<"logo" | "industry" | "site" | "priceMin" | "priceMax" | "days" | "daysMin" | "daysMax", W>>;
};

const IND_WORDS: Record<Industry, string[]> = {
  dental: ["dental", "ডেন্টাল", "chamber", "চেম্বার"],
  restaurant: ["restaurant", "রেস্টুরেন্ট", "রেস্তোরাঁ"],
  ecommerce: ["shop", "শপ", "online", "e-commerce"],
  school: ["coaching", "কোচিং", "school", "স্কুল"],
  realestate: ["real estate", "flat", "ফ্ল্যাট", "property"],
};

const cam: Cam = DEFAULT_CAM;
// ---- layout (9:16, default cam) ----
const LOGO = atScreen(0.5, 0.115, -1, cam);
const LOGO_S = worldWidth(0.2, -1, cam) / 2;
const TAGP = atScreen(0.27, -0.02, 0.5, cam); // সুতার মাথা (frame-এর উপরে)
const TAG_S = worldWidth(0.32, 0.5, cam) / TAG.w;
const CALP = atScreen(0.73, 0.305, 0.5, cam);
const CAL_S = worldWidth(0.24, 0.5, cam) / 1.7;
const MACP = atFloor(0.575, 0.77, cam);
const MAC_S = worldWidth(0.64, MACP[2], cam) / MB.w;
const SUBP = atFloor(0.15, 0.835, cam);
const SUB_S = worldWidth(0.21, SUBP[2], cam) / 1.4;

export const SceneAnswer: React.FC<{ t: number; dur: number; cue: Cue; data: AnswerData }> = ({ t, dur, cue, data }) => {
  const th = THEME[data.industry];
  const cw = data.cues ?? {};
  const T = {
    logo: beat(cue, cw.logo ?? ["javed", "জাভেদ"], dur, 0.06),
    ind: beat(cue, cw.industry ?? IND_WORDS[data.industry], dur, 0.22),
    site: beat(cue, cw.site ?? ["website", "ওয়েবসাইট", "site"], dur, 0.32),
    pMin: beat(cue, cw.priceMin, dur, 0.42),
    pMax: beat(cue, cw.priceMax, dur, 0.48),
    days: beat(cue, cw.days ?? ["তৈরি", "সময়", "লাগে"], dur, 0.6),
    dMin: beat(cue, cw.daysMin, dur, 0.7),
    dMax: beat(cue, cw.daysMax, dur, 0.76),
  };
  T.logo = Math.max(0.3, T.logo);
  const OUT = dur - 0.62; // সব বেরোনো শুরু
  const LIVE = Math.min(T.dMax + 0.55, OUT - 0.7);
  const screens: ScreenSpec[] = [];

  // ---- MacBook: pop + lid spring open; site তৈরি হয় দিন গোনার সাথে ----
  const macIn = T.site - 0.35;
  const macPop = popIn(t, macIn, { k: 200, c: 16 });
  const macOut = t > OUT ? backIn(clamp01((t - OUT) / 0.42)) : 0;
  const macS = MAC_S * macPop.s * (1 - macOut);
  const open = clamp01(springStep(t - (macIn + 0.25), { k: 70, c: 10 }));
  const openRaw = springStep(t - (macIn + 0.25), { k: 70, c: 10 });
  const mac = {
    position: [MACP[0], FLOOR, MACP[2]] as [number, number, number],
    rotation: [0, -0.2 + 0.03 * drift(t, 4), 0] as [number, number, number],
    scale: Math.max(0.0001, macS),
  };
  const build = tween(t, macIn + 0.8, T.dMax + 0.3, 0, 1, (x) => x);
  const live = range(t, LIVE, LIVE + 0.5);
  if (t > macIn && macOut < 1 && open > 0.55)
    screens.push(macScreen(mac, Math.min(1.04, openRaw), <SiteDesk industry={data.industry} build={build} live={live} />, { opacity: range(open, 0.55, 0.85) }));

  // ---- price tag: সুতায় নেমে আসে, pendulum দোলা, min → max ----
  const tagDrop = springStep(t - T.pMin, { k: 120, c: 9 });
  const swing = wobble(t - T.pMin - 0.25, 0.22, 0.9, 0.12) + wobble(t - T.pMax, 0.1, 1.1, 0.15) + 0.012 * drift(t, 2);
  const priceK = tween(t, T.pMax, T.pMax + 0.7, 0, 1, expoOut);
  const priceShown = Math.round((data.priceMin + (data.priceMax - data.priceMin) * priceK) / 500) * 500;
  const tagOut = t > OUT ? clamp01((t - OUT - 0.05) / 0.45) : 0;
  const tagY = TAGP[1] + (1 - tagDrop) * 5 + tagOut * tagOut * 7;

  // ---- calendar: দিন গোনা 0 → min → max ----
  const nDays =
    t < T.dMin ? tween(t, T.days + 0.3, T.dMin + 0.1, 0, Math.max(1, Math.round(data.daysMin * 0.4)), emphDecel) : tween(t, T.dMin, T.dMin + 0.75, Math.round(data.daysMin * 0.4), data.daysMin, emphDecel);
  const n2 = t < T.dMax ? nDays : tween(t, T.dMax, T.dMax + 0.8, data.daysMin, data.daysMax, emphDecel);

  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.06 * drift(t, 1), cam.pos[1] + 0.04 * drift(t, 3), cam.pos[2] - 0.6 * range(t, 0, dur)] };

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ---- logo + wordmark ---- */}
      <Life t={t} a={T.logo} b={OUT + 0.15} position={LOGO} scale={LOGO_S}>
        <group rotation={[0, 0.18 * Math.sin(t * 0.9) * Math.exp(-(t - T.logo) * 0.6) + 0.06, 0]}>
          <Glow color="#FFD2A0" size={4.4} position={[0, 0, -0.6]} opacity={0.35} />
          <LogoMark size={2} depth={0.2} position={[0, 0.25, 0]} />
        </group>
        <Txt size={0.36} color={C.deepNavy} position={[0, -1.12, 0.05]} letterSpacing={0.06}>
          JAVED IT SOLUTION
        </Txt>
      </Life>

      {/* ---- business subject on pedestal ---- */}
      <Life t={t} a={T.ind} b={OUT} position={SUBP} scale={SUB_S} rotation={[0, 0.35, 0]}>
        <Pedestal r={0.7} h={0.28} />
        <group position={[0, 0.28 + 0.06 * Math.max(0, Math.sin((t - T.ind) * 2.2)) * Math.exp(-(t - T.ind) * 0.8), 0]} rotation={[0, 0.25 * Math.sin(t * 0.7), 0]}>
          <Subject industry={data.industry} t={t} scale={1.05} />
        </group>
      </Life>
      <Life t={t} a={T.ind + 0.2} b={OUT} position={[SUBP[0] + 0.05, FLOOR + 0.07, SUBP[2] + 0.9 * SUB_S]} scale={SUB_S * 0.8}>
        <Tag text={th.label} size={0.2} color={th.accent} />
      </Life>

      {/* ---- MacBook ---- */}
      {t > macIn && macOut < 1 && <MacBook {...mac} open={Math.min(1.04, openRaw)} finish={data.finish} />}

      {/* ---- price tag ---- */}
      {t > T.pMin - 0.02 && tagOut < 1 && (
        <HangTag
          position={[TAGP[0], tagY, TAGP[2]]}
          scale={TAG_S}
          swing={swing}
          twist={0.25 + 0.06 * Math.sin(t * 1.3)}
          top="BDT · ONE-TIME"
          line1={t < T.pMax ? fmt(data.priceMin) : `${fmt(data.priceMin)} –`}
          line2={t < T.pMax ? undefined : fmt(priceShown)}
        />
      )}

      {/* ---- calendar ---- */}
      <Life t={t} a={T.days} b={OUT} position={CALP} scale={CAL_S} rotation={[0.05, -0.32, 0]}>
        <DeskCalendar n={n2} top="DAYS" header={C.navy} unit={t > T.dMax + 0.8 ? `${data.daysMin}–${data.daysMax} DAYS` : "DAYS"} />
      </Life>
      <Life t={t} a={LIVE} b={OUT} position={[CALP[0] - 0.05, CALP[1] - 1.22 * CAL_S, CALP[2] + 0.3]} scale={CAL_S}>
        <Tag text="LIVE" size={0.34} w={1.25} h={0.56} color="#1F9D55" />
      </Life>
      <Life t={t} a={LIVE + 0.12} b={OUT} position={[CALP[0] + 0.8 * CAL_S, CALP[1] + 0.82 * CAL_S, CALP[2] + 0.5]} scale={CAL_S * 0.62}>
        <CheckBadge color="#22A35A" />
      </Life>
    </Stage>
  );
};
