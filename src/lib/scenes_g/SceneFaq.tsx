// faq scene template — গ্রাহক চরিত্রের নরম speech bubble-এ প্রশ্ন (? badge) → bubble উপরে সরে, business-এর ফোনে
// আসল app screen দিয়ে উত্তর দেখানো + কমলা reply bubble + tick-ওয়ালা point chip → ? উল্টে সবুজ tick, গ্রাহক খুশি → সব বেরোয়।
// সব লেখা data থেকে (3D = English, DOM screen-এ বাংলা চলবে); সময় = cue("শব্দ"), না পেলে dur-এর ভগ্নাংশ।
import React from "react";
import { Stage, Cam, DEFAULT_CAM } from "../../kit/Stage";
import { springStep, popIn, tween, range, emphDecel, drift } from "../../kit/anim";
import { Figure } from "../../kit/Figure";
import { Phone, phoneScreen, PHONE } from "../../kit/Device";
import { C } from "../../kit/theme";
import { Cue, Industry, beat, Life, atScreen, atFloor, worldWidth, frameH, backIn, clamp01, fitText, Txt3, FLOOR, V3 } from "./common";
import { SpeechBubble, AskBadge, PointChip, Pedestal, PEDESTAL_H, IndustryObject } from "./objects";
import { AppScreen, ScreenData, IND } from "./screens";

export type FaqData = {
  industry: Industry;
  brand: string; // ফোনের app header (DOM)
  question: string; // গ্রাহকের প্রশ্ন — 3D English, ≤ 44 অক্ষর
  answer: string; // reply bubble — 3D English, ≤ 28 অক্ষর
  points: string[]; // 2–3টা, প্রতিটা ≤ 24 অক্ষর
  screen: ScreenData; // ফোনে উত্তরের প্রমাণ (DOM, বাংলা চলবে)
  cues?: { question?: string; answer?: string; screen?: string; points?: string[]; done?: string };
};

const cam0: Cam = DEFAULT_CAM;
const BW = 5.2; // প্রশ্ন bubble local প্রস্থ
const RW = 4.2; // reply bubble / chip local প্রস্থ

export const SceneFaq: React.FC<{ t: number; dur: number; cue: Cue; data: FaqData }> = ({ t, dur, cue, data }) => {
  const c = data.cues ?? {};
  const pts = data.points.slice(0, 3);
  const n = pts.length;
  const OUT = dur - 0.6;

  // ---------- timing ----------
  const tQ = beat(cue, c.question, 0.05 * dur, 0, 0.3, dur * 0.3);
  const tA = beat(cue, c.answer, 0.36 * dur, tQ + 1.0, tQ + 1.0, dur * 0.62);
  const tS = beat(cue, c.screen, tA + 0.45, tA, tA + 0.2, dur * 0.75);
  const tp: number[] = [];
  const span = Math.max(0.5, (0.8 * dur - (tA + 0.9)) / Math.max(1, n));
  for (let i = 0; i < n; i++) {
    const prev = i === 0 ? tA + 0.35 : tp[i - 1] + 0.35;
    tp.push(beat(cue, c.points?.[i], tA + 0.9 + i * span, prev, prev, dur - 1.5));
  }
  const last = n ? tp[n - 1] : tA + 0.8;
  const tD = beat(cue, c.done, 0.85 * dur, last + 0.45, last + 0.45, dur - 0.95);

  // ---------- layout (frame-%) ----------
  const FIG = atFloor(0.8, 0.9, cam0);
  const figS = frameH(0.17, FIG[2], cam0) / 1.12;
  const PED = atFloor(0.3, 0.905, cam0);
  const pedS = frameH(0.128, PED[2], cam0) / (PEDESTAL_H + 1.5);
  const BQ = atScreen(0.47, 0.395, 2, cam0);
  const BA = atScreen(0.5, 0.122, 2, cam0);
  const sQ = worldWidth(0.84, 2, cam0) / BW;
  const sA = worldWidth(0.66, 2, cam0) / BW;
  const PH = atScreen(0.32, 0.478, 4, cam0);
  const phS = worldWidth(0.42, 4, cam0) / PHONE.w;
  const colS = worldWidth(0.42, 3, cam0) / RW;
  const RB = atScreen(0.765, 0.3, 3, cam0);
  const CH = pts.map((_, i) => atScreen(0.765, 0.425 + i * 0.1, 3, cam0));

  // ---------- question bubble ----------
  const qFs = fitText(data.question, BW - 1.95, 1.4, 3, 0.4);
  const qLines = Math.max(1, Math.ceil((data.question.length * qFs * 0.66) / ((BW - 1.95) * 0.92)));
  const BH = Math.max(1.7, qLines * qFs * 1.12 + 0.9);
  const mv = tween(t, tA - 0.15, tA + 0.5, 0, 1, emphDecel);
  const bPos: V3 = [BQ[0] + (BA[0] - BQ[0]) * mv + 0.03 * drift(t, 3), BQ[1] + (BA[1] - BQ[1]) * mv + 0.03 * Math.sin(t * 1.2), 2];
  const bS = sQ + (sA - sQ) * mv;
  // লেজ: গ্রাহকের মাথার দিকে (bubble-local)
  const head = atScreen(0.74, 0.64, 2, cam0);
  const tipQ: [number, number] = [(head[0] - BQ[0]) / sQ, (head[1] - BQ[1]) / sQ];
  const tipA: [number, number] = [BW * 0.22, -BH / 2 - 0.42];
  const tip: [number, number] = [tipQ[0] + (tipA[0] - tipQ[0]) * mv, tipQ[1] + (tipA[1] - tipQ[1]) * mv];
  const clampTip: [number, number] = [Math.min(BW / 2 + 0.2, Math.max(-BW / 2, tip[0])), Math.max(-BH / 2 - 1.05, Math.min(-BH / 2 - 0.35, tip[1]))];
  const flip = tween(t, tD, tD + 0.5, 0, 1, (x) => x * x * (3 - 2 * x));

  // ---------- phone ----------
  const phA = tA - 0.05;
  const phIn = popIn(t, phA, { k: 200, c: 15 });
  const phOut = t > OUT ? backIn(clamp01((t - OUT) / 0.38)) : 0;
  const ph = {
    position: [PH[0] + 0.04 * drift(t, 2), PH[1] + 0.03 * Math.sin(t * 1.1), PH[2]] as V3,
    rotation: [0.02, 0.16 + 0.03 * drift(t, 5), 0] as V3,
    scale: Math.max(0.001, phS * phIn.s * (1 - phOut)),
  };
  const phoneVis = t > phA - 0.02 && t < OUT + 0.4;
  const screens = phoneVis
    ? [
        phoneScreen(
          ph,
          <AppScreen
            ind={data.industry}
            brand={data.brand}
            data={data.screen}
            reveal={range(t, tS, tS + 0.35 * data.screen.rows.length + 0.3)}
            focus={range(t, tp[0] ?? tS + 1, (tp[0] ?? tS + 1) + 0.45)}
            note={range(t, tp[Math.min(1, n - 1)] ?? tS + 1.4, (tp[Math.min(1, n - 1)] ?? tS + 1.4) + 0.45)}
          />,
          { opacity: Math.min(1, phIn.s * 1.3) }
        ),
      ]
    : [];

  // ---------- customer ----------
  const ask = range(t, tQ, tQ + 0.5) * (1 - range(t, tA, tA + 0.6));
  const cheer = Math.max(0, Math.sin(Math.PI * range(t, tD + 0.1, tD + 1.1))) * 0.85;
  const figA = Math.max(0.25, tQ - 0.3);

  // object-এর নিজের কাজ (cloche ওঠে, ব্যাগ লাফায়, tassel দোলে)
  const act =
    data.industry === "restaurant" ? springStep(t - tS, { k: 70, c: 11 }) : data.industry === "ecommerce" ? range(t, tD, tD + 0.6) : data.industry === "school" ? range(t, tD, tD + 0.9) : 0;

  // camera: হালকা drift + ধীরে push-in
  const cam: Cam = { ...cam0, pos: [cam0.pos[0] + 0.05 * drift(t, 1), cam0.pos[1] + 0.04 * drift(t, 3), cam0.pos[2] - 0.35 * range(t, 0, dur)] };
  const P = IND[data.industry];

  return (
    <Stage cam={cam} screens={screens}>
      {/* গ্রাহক */}
      <Life t={t} a={figA} b={OUT + 0.05} kind="pop" position={[FIG[0], FLOOR, FIG[2]]} scale={figS}>
        <Figure rotationY={-0.55} headTilt={0.16 * ask - 0.05 * cheer} pose={{ cheer, armOut: [0, 1.25 * ask], lean: -0.04 * ask }} />
      </Life>

      {/* industry বস্তু pedestal-এ */}
      <Life t={t} a={tQ + 0.45} b={OUT} kind="rise" exit="sink" position={[PED[0], FLOOR, PED[2]]} scale={pedS}>
        <Pedestal r={1.05} color={P.obj} />
        <group position={[0, PEDESTAL_H, 0]}>
          <IndustryObject industry={data.industry} t={t} act={act} />
        </group>
      </Life>

      {/* প্রশ্ন bubble */}
      <Life t={t} a={tQ} b={OUT - 0.05} kind="pop" position={bPos} scale={bS}>
        <SpeechBubble w={BW} h={BH} tail={{ x: Math.min(BW / 2 - 0.9, Math.max(-BW / 2 + 0.9, clampTip[0] * 0.55)), base: 0.95, tip: clampTip }} rotation={[0, -0.05 + 0.02 * drift(t, 7), 0]}>
          {t > tQ + 0.2 && (
            <AskBadge flip={flip} position={[-BW / 2 + 0.78, 0, 0.12]} scale={0.95 * springStep(t - tQ - 0.2, { k: 220, c: 11 })} />
          )}
          <Txt3 size={qFs} color={C.deepNavy} anchorX="left" textAlign="left" maxWidth={BW - 1.95} position={[-BW / 2 + 1.5, 0, 0.03]}>
            {data.question}
          </Txt3>
        </SpeechBubble>
      </Life>

      {/* phone body */}
      {phoneVis && <Phone {...ph} />}

      {/* উত্তর: কমলা reply bubble (লেজ ফোনের দিকে) */}
      <Life t={t} a={tA + 0.3} b={OUT - 0.1} kind="pop" position={RB} scale={colS}>
        <SpeechBubble w={RW} h={1.5} d={0.32} color={C.orange} gloss tail={{ x: -RW / 2 + 0.85, base: 0.7, tip: [-RW / 2 - 0.25, -1.3] }} rotation={[0, -0.12, 0]}>
          <Txt3 size={fitText(data.answer, RW * 0.84, 1.05, 2, 0.4)} color="#ffffff" maxWidth={RW * 0.86} position={[0, 0, 0.03]}>
            {data.answer}
          </Txt3>
        </SpeechBubble>
      </Life>

      {/* point chips */}
      {pts.map((p, i) => (
        <Life key={i} t={t} a={tp[i]} b={OUT - 0.15 + i * 0.04} kind="pop" position={CH[i]} scale={colS}>
          <PointChip text={p} w={RW} h={1.0} check={t > tp[i] + 0.25 ? springStep(t - tp[i] - 0.25, { k: 260, c: 13 }) : 0} rotation={[0, -0.12, 0]} />
        </Life>
      ))}
    </Stage>
  );
};
