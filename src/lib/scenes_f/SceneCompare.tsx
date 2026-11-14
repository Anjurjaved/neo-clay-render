// SCENE: compare — A (সস্তা offer / template / ads) বনাম B (proper build / custom / SEO)।
// দুই card পাশাপাশি → দাঁড়িপাল্লা ওঠে, দুই pan-এ দামের coin (A হালকা) → A-র লুকানো খরচ card-এর পিছন থেকে বেরিয়ে
// A-র pan-এ পড়ে, পাল্লা উল্টে যায়, A-র মোট দাম বাড়ে → B-র ভেতরে যা আছে check হয় → রায় (A-তে X, B-তে check)।
import React from "react";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, Cam } from "../../kit/Stage";
import { springStep, wobble, popIn, tween, range, emphDecel, drift } from "../../kit/anim";
import { Tag } from "../../kit/Clock";
import { CheckBadge, SoftPanel } from "../../kit/Soft";
import { Txt } from "../../kit/Clay";
import { C } from "../../kit/theme";
import { XBadge } from "../../wd004/props/s04";
import { Life, backIn } from "../../wd004/life";
import { Cue, Industry, beat, fmt, Emblem } from "./common";
import { Balance, BAL, panTop, WeightBlock, BLOCK, CompareCard, CheckRow } from "./props";
import { CoinStack, COIN } from "../money/Coin";

export type CompareData = {
  industry: Industry;
  /** বাম দিক — যেটা প্রথমে সস্তা দেখায় */
  a: { title: string; price: number; unit?: string; sub?: string; cue?: string; hidden: { label: string; amount?: number; cue?: string }[] };
  /** ডান দিক — যেটা আসলে ঠিক */
  b: { title: string; price: number; unit?: string; sub?: string; cue?: string; included: { label: string; cue?: string }[] };
  verdict: { text: string; cue?: string };
  cues?: { scale?: string };
};

const cam: Cam = DEFAULT_CAM;
const HIDDEN_COL = ["#D9453B", "#C9572E", "#B84A3A", "#D9453B"];

export const SceneCompare: React.FC<{ t: number; dur: number; cue: Cue; data: CompareData }> = ({ t, dur, cue, data }) => {
  const D = data;
  const b = (w: string | undefined, f: number, after = 0) => beat(cue, dur, w, f, after);
  const hid = D.a.hidden.slice(0, 3);
  const inc = D.b.included.slice(0, 3);
  const END = dur - 0.5;

  // ---------- timing ----------
  const tA = Math.max(0.15, b(D.a.cue, 0.03));
  const tB = Math.max(tA + 0.35, b(D.b.cue, 0.1));
  const tScale = Math.max(tB + 0.5, b(D.cues?.scale, 0.2));
  const tCoinA = tScale + 0.45;
  const tCoinB = tScale + 0.7;
  const tHid = hid.map((h, i) => Math.max(tCoinB + 0.7 + i * 0.55, b(h.cue, 0.33 + 0.1 * i)));
  const tLand = tHid.map((x) => x + 0.62);
  const tInc = inc.map((h, i) => Math.max((tLand[hid.length - 1] ?? tCoinB) + 0.2 + i * 0.35, b(h.cue, 0.64 + 0.06 * i)));
  const tVer = Math.max((tInc[inc.length - 1] ?? tCoinB) + 0.45, b(D.verdict.cue, 0.82));

  // ---------- weights ----------
  const hAmt = hid.map((h) => h.amount ?? Math.round(D.a.price * 0.6));
  const totA = D.a.price + hAmt.reduce((a, x) => a + x, 0);
  const W = Math.max(totA, D.b.price, 1);
  const sp = (at: number) => (t < at ? 0 : springStep(t - at, { k: 55, c: 4.2 }));
  const wA = D.a.price * sp(tCoinA + 0.35) + hAmt.reduce((a, x, i) => a + x * sp(tLand[i]), 0);
  const wB = D.b.price * sp(tCoinB + 0.35);
  const tilt = Math.max(-0.26, Math.min(0.26, (0.32 * (wA - wB)) / W));
  const runA = D.a.price + hAmt.reduce((a, x, i) => a + x * tween(t, tLand[i], tLand[i] + 0.45, 0, 1), 0);

  const nCoinA = Math.max(1, Math.min(4, Math.round(D.a.price / 3000)));
  const nCoinB = Math.max(2, Math.min(6, Math.round(D.b.price / 4000)));

  // ---------- layout ----------
  const CA = atScreen(0.255, 0.135, 1, cam);
  const CB = atScreen(0.745, 0.135, 1, cam);
  const CS = worldWidth(0.405, 1, cam) / 2.5;
  const BALP = atFloor(0.5, 0.83, cam);
  const BS = worldWidth(0.94, BALP[2], cam) / (BAL.span * 2 + BAL.panR * 2 + 0.1);
  const ver = range(t, tVer, tVer + 0.35);
  const VF = atFloor(0.5, 0.93, cam);
  const VER: [number, number, number] = [VF[0], VF[1] + 0.42, VF[2]];
  const out = END - 0.1;

  // A pan-এর উপর জিনিসের উচ্চতা (balance-local)
  const coinTopA = nCoinA * COIN.t * 0.985 * 0.74 + 0.01;
  const hiddenNodes = hid.map((h, i) => {
    const at = tHid[i];
    if (t < at) return null;
    const [px, py] = panTop(tilt, -1);
    const restY = py + coinTopA + i * (BLOCK.h + 0.02);
    // card-এর পিছন থেকে নিচে নেমে আসে, তারপর পড়ে
    const startY = (CA[1] - BALP[1]) / BS - 0.4;
    const startX = (CA[0] - BALP[0]) / BS;
    const slide = tween(t, at, at + 0.3, 0, 1, emphDecel);
    const fall = range(t, at + 0.3, tLand[i]);
    const yy = startY - 0.9 * slide - (startY - 0.9 - restY) * fall * fall;
    const x = startX + (px - startX) * emphDecel(fall);
    const landed = t >= tLand[i];
    const y = landed ? restY : yy;
    const sq = landed ? wobble(t - tLand[i], 0.12, 3, 0.25) : 0;
    const s = Math.min(1, 0.55 + slide * 0.45);
    return (
      <group key={i} position={[landed ? px : x, y, 0.05 - (1 - slide) * 0.6]} scale={[s * (1 + sq * 0.5), s * (1 - sq), s]} rotation={[0, 0.12, landed ? 0 : 0.25 * Math.sin(Math.PI * fall)]}>
        <WeightBlock label={h.label} amount={h.amount !== undefined ? "+" + fmt(h.amount) : undefined} color={HIDDEN_COL[i]} />
      </group>
    );
  });

  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 3), cam.pos[1] + 0.04 * drift(t, 7), cam.pos[2] - 0.2 * Math.sin((Math.PI * Math.min(t, dur)) / dur)] };
  const unitA = D.a.unit ? " " + D.a.unit : "";
  const unitB = D.b.unit ? " " + D.b.unit : "";

  return (
    <Stage cam={camLive}>
      {/* ===== দুই card ===== */}
      <Life t={t} a={tA} b={out} position={CA} scale={CS} rotation={[0, 0.06, wobble(t - tLand[0], 0.03, 1.4, 0.15) + wobble(t - (tLand[1] ?? 99), 0.03, 1.4, 0.15)]}>
        <CompareCard title={D.a.title} price={`BDT ${fmt(Math.round(runA / 100) * 100)}${unitA}`} sub={D.a.sub} tone="bad" glow={range(t, tLand[0] ?? 99, (tLand[0] ?? 99) + 0.4) * 0.8} emblem={<Emblem industry={D.industry} scale={0.55} />} />
        {ver > 0 && <XBadge position={[0.98, 0.5, 0.3]} scale={0.62 * popIn(t, tVer, { k: 240, c: 13 }).s} />}
      </Life>
      <Life t={t} a={tB} b={out + 0.04} position={CB} scale={CS} rotation={[0, -0.06, wobble(t - tVer, 0.04, 1.4, 0.15)]}>
        <CompareCard title={D.b.title} price={`BDT ${fmt(D.b.price)}${unitB}`} sub={D.b.sub} tone="good" glow={ver} emblem={<Emblem industry={D.industry} scale={0.55} />} />
        {ver > 0 && <CheckBadge position={[0.98, 0.5, 0.3]} scale={0.62 * popIn(t, tVer, { k: 240, c: 13 }).s} color="#22B35E" />}
      </Life>
      <Life t={t} a={(tA + tB) / 2} b={tHid[0] ?? out} position={atScreen(0.5, 0.25, 2.5, cam)} scale={worldWidth(0.12, 2.5, cam) / 0.8}>
        <SoftPanel w={0.8} h={0.8} thick={0.26} radius={0.4} color={C.deepNavy}>
          <Txt size={0.3} color="#ffffff" position={[0, -0.01, 0.02]}>
            VS
          </Txt>
        </SoftPanel>
      </Life>

      {/* ===== দাঁড়িপাল্লা + pan-এর জিনিস ===== */}
      <Life t={t} a={tScale} b={out} kind="rise" exit="sink" position={BALP} scale={BS}>
        <Balance tilt={tilt} />
        {t > tCoinA && (
          <group position={panTop(tilt, -1)}>
            <CoinStack time={t} n={nCoinA} start={tCoinA} every={0.1} drop={1.8} scale={0.74} seed={2} />
          </group>
        )}
        {t > tCoinB && (
          <group position={panTop(tilt, 1)}>
            <CoinStack time={t} n={nCoinB} start={tCoinB} every={0.08} drop={1.8} scale={0.74} seed={5} />
          </group>
        )}
        {hiddenNodes}
      </Life>

      {/* ===== B-তে যা আছে ===== */}
      {inc.map((h, i) => (
        <Life key={h.label} t={t} a={tInc[i]} b={out - 0.05 * (2 - i)} position={atScreen(0.735, 0.27 + i * 0.07, 2.0, cam)} scale={worldWidth(0.4, 2.0, cam) / 2.3} rotation={[0, -0.1, 0]}>
          <CheckRow label={h.label} tick={springStep(t - tInc[i] - 0.15, { k: 260, c: 13 })} />
        </Life>
      ))}

      {/* ===== রায় ===== */}
      <Life t={t} a={tVer + 0.15} b={out + 0.06} position={VER} scale={worldWidth(0.8, VER[2], cam) / 4.6} rotation={[-0.1, 0, wobble(t - tVer - 0.2, 0.04, 1.3, 0.14)]}>
        <Tag text={D.verdict.text} size={0.3} w={4.6} h={0.66} color="#1F9D55" />
      </Life>
    </Stage>
  );
};
