// myth scene template — প্রচলিত ভুল ধারণা একটা পুরু clay card-এ, লাল MYTH stamp ধপ করে বসে, মালিক চরিত্র মাথা কাত করে ভাবে →
// "ঠিক নয়"-এ card-এ ফাটল গজায়, camera কেঁপে card দুই টুকরা হয়ে ঘুরে পড়ে (ছোট টুকরা ছিটকে) → নিচ থেকে সবুজ FACT card ওঠে,
// প্রমাণ: ফোনে আসল app screen (count-up) + stat card (সংখ্যা গোনে, bar বাড়ে) → মালিক খুশি → সব বেরোয়।
import React from "react";
import { Stage, Cam, DEFAULT_CAM } from "../../kit/Stage";
import { springStep, popIn, range, drift, wobble } from "../../kit/anim";
import { Figure } from "../../kit/Figure";
import { Phone, phoneScreen, PHONE } from "../../kit/Device";
import { Cue, Industry, beat, Life, atScreen, atFloor, worldWidth, frameH, backIn, clamp01, FLOOR, V3 } from "./common";
import { MythCard, MYTH, FactCard, FACT, StatCard, Pedestal, PEDESTAL_H, IndustryObject, countText } from "./objects";
import { AppScreen, ScreenData, IND } from "./screens";

export type MythData = {
  industry: Industry;
  brand: string; // ফোনের app header (DOM)
  myth: string; // ভুল ধারণা — 3D English, ≤ 48 অক্ষর
  fact: string; // আসল সত্য — 3D English, ≤ 48 অক্ষর
  proof: { stat: string; label: string; screen: ScreenData }; // stat যেমন "2x", "+45%", "120"
  mythLabel?: string; // default "MYTH"
  factLabel?: string; // default "FACT"
  cues?: { myth?: string; crack?: string; fact?: string; proof?: string; stat?: string };
};

const cam0: Cam = DEFAULT_CAM;

export const SceneMyth: React.FC<{ t: number; dur: number; cue: Cue; data: MythData }> = ({ t, dur, cue, data }) => {
  const c = data.cues ?? {};
  const OUT = dur - 0.6;

  // ---------- timing ----------
  const tM = beat(cue, c.myth, 0.05 * dur, 0, 0.3, dur * 0.3);
  const tC = beat(cue, c.crack, 0.34 * dur, tM + 1.3, tM + 1.3, dur * 0.55);
  const tF = beat(cue, c.fact, tC + 0.7, tC + 0.45, tC + 0.45, dur * 0.7);
  const tP = beat(cue, c.proof, tF + 1.1, tF + 0.6, tF + 0.6, dur - 2.6);
  const tS = beat(cue, c.stat, tP + 0.8, tP + 0.4, tP + 0.4, dur - 2.0);
  const split = t - tC;

  // ---------- layout ----------
  const FIG = atFloor(0.8, 0.915, cam0);
  const figS = frameH(0.155, FIG[2], cam0) / 1.12;
  const PED = atFloor(0.27, 0.915, cam0);
  const pedS = frameH(0.135, PED[2], cam0) / (PEDESTAL_H + 1.5);
  const MC = atScreen(0.5, 0.375, 2, cam0);
  const mcS = worldWidth(0.86, 2, cam0) / MYTH.w;
  const FC = atScreen(0.5, 0.3, 2, cam0);
  const fcS = worldWidth(0.86, 2, cam0) / FACT.w;
  const PH = atScreen(0.29, 0.62, 6, cam0);
  const phS = worldWidth(0.335, 6, cam0) / PHONE.w;
  const ST = atScreen(0.725, 0.565, 4, cam0);
  const stS = worldWidth(0.38, 4, cam0) / 2.4;

  // ---------- myth card ----------
  const stamp = t > tM + 0.5 ? springStep(t - tM - 0.5, { k: 320, c: 16 }) : 0;
  const stampHit = wobble(t - tM - 0.56, 0.05, 4, 0.3); // stamp-এর ধাক্কায় card কাঁপে
  const crack = range(t, tC - 0.45, tC - 0.04);
  const mythVis = t > tM - 0.02 && split < 1.1;

  // ---------- proof ----------
  const phA = tP;
  const phIn = popIn(t, phA, { k: 200, c: 15 });
  const phOut = t > OUT ? backIn(clamp01((t - OUT) / 0.38)) : 0;
  const ph = {
    position: [PH[0] + 0.03 * drift(t, 2), PH[1] + 0.025 * Math.sin(t * 1.1), PH[2]] as V3,
    rotation: [0.02, 0.2 + 0.03 * drift(t, 5), 0] as V3,
    scale: Math.max(0.001, phS * phIn.s * (1 - phOut)),
  };
  const phoneVis = t > phA - 0.02 && t < OUT + 0.4;
  const count = range(t, tS, tS + 1.1);
  const big = data.proof.screen.big;
  const screens = phoneVis
    ? [
        phoneScreen(
          ph,
          <AppScreen
            ind={data.industry}
            brand={data.brand}
            data={data.proof.screen}
            big={range(t, tP + 0.15, tP + 0.6)}
            bigText={big ? countText(big.value, range(t, tP + 0.2, tS + 1.0)) : undefined}
            reveal={range(t, tP + 0.4, tP + 0.4 + 0.3 * data.proof.screen.rows.length + 0.3)}
            focus={range(t, tS, tS + 0.4)}
            note={range(t, tS + 0.5, tS + 0.9)}
          />,
          { opacity: Math.min(1, phIn.s * 1.3) }
        ),
      ]
    : [];

  // ---------- owner ----------
  const think = range(t, tM + 0.3, tM + 0.8) * (1 - range(t, tC - 0.1, tC + 0.2));
  const jolt = t > tC ? wobble(t - tC, 0.35, 3.2, 0.25) : 0;
  const cheer = Math.max(0, Math.sin(Math.PI * range(t, tS + 0.2, tS + 1.3))) * 0.9;
  const act = data.industry === "restaurant" ? springStep(t - tC - 0.3, { k: 70, c: 11 }) : data.industry === "ecommerce" ? range(t, tF + 0.2, tF + 0.8) : data.industry === "school" ? range(t, tF, tF + 0.9) : 0;

  // camera: drift + ভাঙার মুহূর্তে ঝাঁকুনি
  const shake = t > tC ? wobble(t - tC, 0.12, 7, 0.18) : 0;
  const cam: Cam = {
    ...cam0,
    pos: [cam0.pos[0] + 0.05 * drift(t, 1) + shake, cam0.pos[1] + 0.04 * drift(t, 3) + shake * 0.5, cam0.pos[2] - 0.35 * range(t, 0, dur)],
  };
  const P = IND[data.industry];

  return (
    <Stage cam={cam} screens={screens}>
      {/* মালিক */}
      <Life t={t} a={Math.max(0.25, tM - 0.25)} b={OUT + 0.05} kind="pop" position={[FIG[0], FLOOR, FIG[2]]} scale={figS}>
        <Figure
          rotationY={-0.5 + 0.25 * jolt}
          headTilt={0.22 * think * (0.75 + 0.25 * Math.sin(t * 2.4)) - 0.1 * jolt}
          pose={{ cheer, armOut: [0.95 * think, 0], lean: -0.05 * jolt }}
        />
      </Life>

      {/* industry বস্তু — প্রমাণ আসার আগে সরে যায় (ফোনের জায়গা) */}
      <Life t={t} a={tM + 0.4} b={tP - 0.45} kind="rise" exit="sink" position={[PED[0], FLOOR, PED[2]]} scale={pedS}>
        <Pedestal r={1.05} color={P.obj} />
        <group position={[0, PEDESTAL_H, 0]}>
          <IndustryObject industry={data.industry} t={t} act={act} />
        </group>
      </Life>

      {/* MYTH card → ফাটল → ভাঙা */}
      {mythVis && (
        <Life t={t} a={tM} kind="pop" position={[MC[0] + 0.03 * drift(t, 4), MC[1] + 0.03 * Math.sin(t * 1.3) - stampHit * 0.4, MC[2]]} scale={mcS}>
          <MythCard text={data.myth} crack={crack} split={split > 0 ? split : 0} stamp={stamp} label={data.mythLabel} rotation={[0.03, -0.06 + 0.02 * drift(t, 7), crack * 0.015 * Math.sin(t * 40)]} />
        </Life>
      )}

      {/* FACT card নিচ থেকে ওঠে */}
      <Life t={t} a={tF} b={OUT - 0.05} kind="rise" exit="up" position={[FC[0], FC[1] + 0.03 * Math.sin(t * 1.2), FC[2]]} scale={fcS}>
        <FactCard
          text={data.fact}
          label={data.factLabel}
          tag={t > tF + 0.35 ? springStep(t - tF - 0.35, { k: 260, c: 12 }) : 0}
          check={t > tS + 0.2 ? springStep(t - tS - 0.2, { k: 240, c: 12 }) : 0}
          rotation={[0.03, 0.05 * Math.sin(t * 0.7), 0]}
        />
      </Life>

      {/* প্রমাণ: phone + stat card */}
      {phoneVis && <Phone {...ph} />}
      <Life t={t} a={tS - 0.15} b={OUT - 0.1} kind="pop" position={ST} scale={stS}>
        <StatCard value={data.proof.stat} label={data.proof.label} k={count} bars={range(t, tS, tS + 1.0)} accent={P.hi} rotation={[0, -0.16, 0]} />
      </Life>
    </Stage>
  );
};
