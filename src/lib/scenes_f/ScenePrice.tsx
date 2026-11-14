// SCENE: price — মূল package খোলে → industry-র object ও feature icon বেরোয় → দামের slider → add-on লাইনগুলো আসল
// receipt printer-এ ছাপা হয় (money/ReceiptPrinter) → কাগজ ছেঁড়ে → ONE-TIME (PAID ONCE) বনাম EVERY YEAR (cost-split)।
// সব timing cue("শব্দ")-এ, না পেলে dur-এর ভগ্নাংশে। শুরুতে ফাঁকা stage, শেষে সব বেরিয়ে যায়।
import React from "react";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, Cam } from "../../kit/Stage";
import { springStep, wobble, popIn, tween, range, emphDecel, expoOut, drift } from "../../kit/anim";
import { Tag } from "../../kit/Clock";
import { C } from "../../kit/theme";
import { GiftBox, GIFT } from "../../wd004/props/s02";
import { Life, backIn } from "../../wd004/life";
import { ReceiptPrinter, ReceiptData, receiptLength, PR } from "../money/ReceiptPrinter";
import { PriceSlider, SL } from "../money/Slider";
import { CostSplitF } from "./CostSplitF";
import { Cue, Industry, beat, fmt, v3, Emblem } from "./common";
import { FeatBadge, FeatIcon } from "./props";

export type PriceData = {
  industry: Industry;
  /** box-এর tag ও receipt-এর মাথা, যেমন "DENTAL WEBSITE" (English, ছোট) */
  title: string;
  /** receipt-এর দ্বিতীয় লাইন, যেমন "Dr. Shirin Dental · Sylhet" */
  shop?: string;
  /** package খুললে যা বেরোয় (২–৪টা) */
  features: { label: string; icon: FeatIcon; cue?: string }[];
  /** দামের পরিসর (BDT); pick = এই business-এর জন্য বাছাই দাম */
  range: { lo: number; hi: number; pick?: number; cue?: string; pickCue?: string };
  /** add-on — receipt-এ এক এক লাইন ছাপা হয় (১–৪টা) */
  addons: { label: string; amount: number; cue?: string }[];
  /** একবার বনাম প্রতি বছর (না দিলে receipt-এই শেষ) */
  split?: { yearlyLabel: string; yearly: number; cue?: string; onceCue?: string; yearlyCue?: string };
  cues?: { open?: string; receipt?: string; total?: string };
};

const cam: Cam = DEFAULT_CAM;
const FEAT_POS: Record<number, [number, number][]> = {
  2: [
    [0.24, 0.3],
    [0.76, 0.3],
  ],
  3: [
    [0.18, 0.37],
    [0.5, 0.21],
    [0.82, 0.37],
  ],
  4: [
    [0.15, 0.41],
    [0.38, 0.23],
    [0.62, 0.23],
    [0.85, 0.41],
  ],
};
const FEAT_COL = [C.orange, C.steel, "#2E9E5B", C.deepOrange];
const tk = (n: number) => "৳" + fmt(n);

export const ScenePrice: React.FC<{ t: number; dur: number; cue: Cue; data: PriceData }> = ({ t, dur, cue, data }) => {
  const D = data;
  const b = (w: string | undefined, f: number, after = 0) => beat(cue, dur, w, f, after);
  const nF = Math.max(2, Math.min(4, D.features.length));
  const feats = D.features.slice(0, nF);
  const adds = D.addons.slice(0, 4);
  const pick = D.range.pick ?? Math.round((D.range.lo + D.range.hi) / 2 / 1000) * 1000;
  const total = pick + adds.reduce((a, x) => a + x.amount, 0);
  const END = dur - 0.5;

  // ---------- timing ----------
  const T0 = Math.max(0.12, b(D.cues?.open, 0.02) - 0.6);
  const tOpen = Math.max(T0 + 0.55, b(D.cues?.open, 0.06));
  const tF = feats.map((f, i) => Math.max(tOpen + 0.35 + i * 0.3, b(f.cue, 0.13 + 0.045 * i)));
  const tRange = Math.max(tF[nF - 1] + 0.6, b(D.range.cue, 0.32));
  const tPick = Math.max(tRange + 0.6, b(D.range.pickCue, 0.4));
  const tRec = Math.max(tPick + 0.9, b(D.cues?.receipt, 0.5));
  const tRow0 = tRec + 0.75;
  const tAdd = adds.map((a, i) => Math.max(tRow0 + 0.4 + i * 0.35, b(a.cue, 0.56 + 0.055 * i)));
  const tTotal = Math.max((tAdd[adds.length - 1] ?? tRow0) + 0.4, b(D.cues?.total, 0.56 + 0.055 * adds.length + 0.02));
  const hasSplit = !!D.split;
  const tSplit = hasSplit ? Math.max(tTotal + 0.75, b(D.split!.cue, 0.74)) : END;
  const tOnce = hasSplit ? Math.max(tSplit + 1.35, b(D.split!.onceCue, 0.8)) : END;
  const tYear = hasSplit ? Math.max(tOnce - 0.5, b(D.split!.yearlyCue, 0.84)) : END;

  // ---------- beat 1: package box ----------
  const BOX = atFloor(0.5, 0.79, cam);
  const BOX_S = worldWidth(0.42, BOX[2], cam) / (GIFT.w + 0.24);
  const lid = springStep(t - tOpen, { k: 90, c: 11 });
  const squash = wobble(t - tOpen, 0.05, 2.2, 0.2) + wobble(t - T0 - 0.35, 0.05, 2.4, 0.22);
  const boxOut = tRange - 0.35;
  const boxTop = (lift: number): [number, number, number] => [BOX[0], BOX[1] + (GIFT.h + lift) * BOX_S, BOX[2]];
  const emb = springStep(t - (tOpen + 0.12), { k: 70, c: 10 });
  const embOut = range(t, boxOut, boxOut + 0.38);
  const titleFs = Math.min(0.24, 1.9 / (D.title.length * 0.66));

  // ---------- beat 2: features (icon) ----------
  const fPos = FEAT_POS[nF];
  const rowK = tween(t, tRange - 0.35, tRange + 0.25, 0, 1, emphDecel);
  const featOut = tRec - 0.35;
  const featNodes = feats.map((f, i) => {
    const at = tF[i];
    if (t < at || t > featOut + 0.5) return null;
    const k = springStep(t - at, { k: 95, c: 12 });
    const from = boxTop(0.3);
    const arc = atScreen(fPos[i][0], fPos[i][1], 1.2, cam);
    const rowX = 0.5 + (i - (nF - 1) / 2) * 0.2;
    const row = atScreen(rowX, 0.14, 1.2, cam);
    let p = v3(from, arc, Math.min(1, k));
    p[1] += Math.sin(Math.PI * Math.min(1, k)) * 0.7;
    p = v3(p, row, rowK);
    const out = t > featOut + i * 0.04 ? Math.min(1, (t - featOut - i * 0.04) / 0.38) : 0;
    const sc = (worldWidth(0.25 - 0.1 * rowK, 1.2, cam) / 1.0) * Math.min(1, 0.25 + 0.75 * k) * (1 - backIn(out));
    if (sc <= 0.001) return null;
    const lblK = range(t, at + 0.3, at + 0.5) * (1 - range(t, tRange - 0.45, tRange - 0.2));
    return (
      <group key={f.label}>
        <group position={p} scale={sc} rotation={[0, 0.25 * Math.sin(t * 0.8 + i * 1.7), wobble(t - at - 0.45, 0.1, 1.4, 0.15)]}>
          <FeatBadge icon={f.icon} color={FEAT_COL[i]} spin={t * 0.8} />
        </group>
        {lblK > 0.01 && (
          <group position={atScreen(fPos[i][0], fPos[i][1] + 0.085, 1.6, cam)} scale={(worldWidth(0.3, 1.6, cam) / 2.4) * Math.min(1, lblK * 1.6) * popIn(t, at + 0.3, { k: 230, c: 15 }).s}>
            <Tag text={f.label} size={0.24} w={Math.min(2.6, f.label.length * 0.165 + 0.36)} h={0.5} color={C.deepNavy} />
          </group>
        )}
      </group>
    );
  });

  // ---------- beat 3: slider ----------
  const sliderOut = tRec - 0.45;
  const kPick = (pick - D.range.lo) / Math.max(1, D.range.hi - D.range.lo);
  // ঢুকে knob min→max পুরো পথ ঘুরে দেখায় (পরিসর), তারপর বাছাই দামে থামে (spring)
  const sweep = tween(t, tRange + 0.2, tRange + 0.75, 0, 1, emphDecel);
  const back = springStep(t - tPick, { k: 34, c: 7 });
  const value = Math.max(0, sweep * (1 - back) + kPick * back);
  const press = range(t, tRange + 0.1, tRange + 0.25) * (1 - range(t, tPick + 0.7, tPick + 0.9));
  const SLP = atScreen(0.5, 0.5, 2.2, cam);

  // ---------- beat 4: receipt printer ----------
  const receipt: ReceiptData = {
    title: D.title,
    sub: D.shop,
    rows: [{ label: "Base package", amount: tk(pick) }, ...adds.map((a) => ({ label: a.label, amount: "+" + tk(a.amount) }))],
    total: tk(total),
    footer: hasSplit ? "" : "Thank you",
  };
  const Lf = receiptLength(receipt);
  const rowY = (i: number) => 0.91 + 0.26 * i + 0.12;
  const printT = [tRow0, ...tAdd];
  const yTot = 1.03 + 0.26 * receipt.rows.length + 0.14;
  let fed = 0.62 * tween(t, tRec + 0.35, tRow0 - 0.05, 0, 1, emphDecel);
  printT.forEach((pt, i) => (fed = Math.max(fed, (i === 0 ? 0.62 : rowY(i - 1)) + (rowY(i) - (i === 0 ? 0.62 : rowY(i - 1))) * tween(t, pt - 0.12, pt + 0.2, 0, 1, emphDecel))));
  fed = Math.max(fed, rowY(printT.length - 1) + (yTot - rowY(printT.length - 1)) * tween(t, tTotal - 0.12, tTotal + 0.2, 0, 1, emphDecel));
  fed = Math.max(fed, yTot + (Lf - yTot) * tween(t, tTotal + 0.35, tTotal + 0.9, 0, 1, emphDecel));
  const jerk = [...printT, tTotal, tTotal + 0.9].reduce((a, pt) => a + (t > pt + 0.2 ? Math.exp(-(t - pt - 0.2) * 9) * Math.sin((t - pt - 0.2) * 38) : 0), 0);
  const tear = hasSplit ? tween(t, tSplit, tSplit + 0.6, 0, 1, expoOut) + (t > tSplit ? wobble(t - tSplit, 0.05, 2.2, 0.3) : 0) : 0;
  const PRP = atFloor(0.5, 0.8, cam);
  const PS = worldWidth(0.58, PRP[2], cam) / PR.w;
  const prnOut = hasSplit ? tSplit + 0.55 : END;

  // ---------- beat 5: one-time vs every year ----------
  const SPL = atFloor(0.5, 0.83, cam);
  const SS = worldWidth(0.96, SPL[2], cam) / 5.6;
  const splitBase = tOnce - 1.0; // CostSplit-এর নিজের সময় 1.0-এ stamp পড়ে
  const tc = t - splitBase;
  const period = 1.25;
  const start = Math.max(0.3, tYear - splitBase - 0.4);
  const years = Math.max(1, Math.min(3, Math.floor((END - 0.35 - (splitBase + start + 1.0)) / period) + 1));

  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 2), cam.pos[1] + 0.04 * drift(t, 5), cam.pos[2] - 0.2 * Math.sin((Math.PI * Math.min(t, dur)) / dur)] };

  return (
    <Stage cam={camLive}>
      {/* ===== package box ===== */}
      <Life t={t} a={T0} b={boxOut} kind="rise" exit="shrink" position={BOX} scale={BOX_S}>
        <group scale={[1 - squash * 0.5, 1 + squash, 1 - squash * 0.5]}>
          <GiftBox open={lid} lidOut={backIn(range(t, tOpen + 0.9, tOpen + 1.3))} />
          <group position={[0, GIFT.h * 0.5, GIFT.d / 2 + 0.1]} scale={popIn(t, T0 + 0.35, { k: 220, c: 14 }).s}>
            <Tag text={D.title} size={titleFs} w={Math.min(2.1, D.title.length * titleFs * 0.66 + 0.3)} h={0.5} color={C.deepNavy} />
          </group>
        </group>
      </Life>
      {/* industry object — খোলা বাক্স থেকে ওঠে */}
      {t > tOpen + 0.12 && embOut < 1 && (
        <group
          position={v3(boxTop(-0.6), boxTop(0.5), Math.min(1.08, emb))}
          scale={BOX_S * 1.3 * Math.min(1, emb * 1.4) * (1 - backIn(embOut))}
          rotation={[0.08, -0.45 + 0.35 * Math.sin(t * 0.9), wobble(t - tOpen - 0.5, 0.06, 1.2, 0.15)]}
        >
          <Emblem industry={D.industry} />
        </group>
      )}
      {featNodes}

      {/* ===== slider ===== */}
      <Life t={t} a={tRange} b={sliderOut} kind="pop" position={SLP} scale={worldWidth(0.72, SLP[2], cam) / (SL.len + 0.7)} rotation={[-0.06, 0, wobble(t - tPick, 0.025, 1.4, 0.15)]}>
        <PriceSlider value={value} min={D.range.lo} max={D.range.hi} press={press} currency="BDT" step={500} />
      </Life>

      {/* ===== receipt printer ===== */}
      <Life t={t} a={tRec} b={prnOut} kind="pop" exit="shrink" position={PRP} scale={PS} rotation={[0, -0.3, 0]}>
        <ReceiptPrinter fed={fed} time={t} jerk={Math.max(-1, Math.min(1, jerk))} tear={tear} data={receipt} />
      </Life>

      {/* ===== one-time vs every year ===== */}
      {hasSplit && (
        <Life t={t} a={splitBase - 0.02} b={END - 0.02} kind="pop" exit="shrink" position={SPL} scale={SS} outDur={0.42}>
          <CostSplitF
            time={tc}
            receipt={receipt}
            start={start}
            period={period}
            years={years}
            oneTime={"BDT " + fmt(total)}
            yearly={`BDT ${fmt(D.split!.yearly)} / yr`}
          />
          {tc > 0.45 && (
            <group position={[1.38, 3.82, 0.1]} scale={popIn(tc, 0.45, { k: 230, c: 15 }).s}>
              <Tag text={D.split!.yearlyLabel} size={0.15} w={Math.max(1.6, D.split!.yearlyLabel.length * 0.105 + 0.3)} h={0.34} color={C.deepNavy} />
            </group>
          )}
        </Life>
      )}
    </Stage>
  );
};
