// Scene template: QUOTE — business owner-এর নিজের কথা/অভিযোগ: নিজের দোকানের সামনে দাঁড়িয়ে বলেন, মাথার উপরে
// পুরু clay speech bubble-এ বাংলা কথা শব্দে শব্দে আসে (VO-র সাথে), আর সমস্যাটা চোখের সামনে ঘটে:
//   pile — একই জিনিস (call / প্রশ্ন / message) চারপাশে জমতে থাকে, owner হিমশিম
//   leak — order/customer বাম থেকে দোকানে আসে, বেশিরভাগ দরজায় ধাক্কা খেয়ে পড়ে যায়, অল্প কয়টা ঢোকে
import React from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { springStep, wobble, tween, range, smoothstep, drift, popIn } from "../../kit/anim";
import { Shop, SHOP } from "../../kit/Shop";
import { Figure } from "../../kit/Figure";
import { Tag } from "../../kit/Clock";
import { ScreenSpec, toMatrix } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { Cue, cueOr, Life, hash, V3, backIn } from "./common";
import { Industry, LOOK, OwnerAcc } from "./industry";
import { QuoteFace } from "./screens";
import { SpeechBubble, BUBBLE_D, Handset, RingArcs, CountBadge, ChatBlob, QuestionBlob, Parcel, Cart } from "./objects";

export type ItemKind = "call" | "chat" | "messenger" | "question" | "parcel" | "cart";
export type QuoteData = {
  industry: Industry;
  business?: string;
  /** owner-এর নিজের কথা (বাংলা, VO-তে যেমন বলা হয়) */
  quote: string;
  /** যে শব্দগুলো কমলা highlight হবে (substring) */
  emphasis?: string[];
  /** bubble-এর নিচে attribution — "Dr. Shirin, Dentist" */
  speaker: string;
  problem: {
    kind: "pile" | "leak";
    item: ItemKind;
    n: number; // কতগুলো বস্তু (pile ≤ 12, leak ≤ 10)
    kept?: number; // leak: কয়টা দোকানে ঢোকে
    /** counter tag (English) — pile: "{n} CALLS / DAY" ; leak: "{kept} OF {n} ORDER" */
    label: string;
    count?: number; // {n}-এর শেষ সংখ্যা (না দিলে n) — যেমন 10টা বস্তু দেখিয়ে "50"
    keptCount?: number; // {kept}-এর শেষ সংখ্যা (না দিলে kept)
    at?: string; // cue শব্দ
  };
  cues?: { end?: string };
};

const cam: Cam = DEFAULT_CAM;
const nrm = (s: string) => s.replace(/[।,?!.\-—'"“”‘’:;]/g, "").toLowerCase();

const Item: React.FC<{ kind: ItemKind; t: number; i: number }> = ({ kind, t, i }) => {
  switch (kind) {
    case "call":
      return (
        <group>
          <CountBadge n="" color="#FBF8F3" scale={1.15} />
          <Handset rotation={[0, 0, -0.35]} position={[0.02, -0.02, 0.2]} scale={0.66} color="#E4483A" />
          <RingArcs position={[0.38, 0.36, 0.05]} k={(t * 1.6 + i * 0.37) % 1} scale={0.75} />
        </group>
      );
    case "chat":
      return <ChatBlob color="#25C16F" phase={t + i} flip={i % 2 === 1} />;
    case "messenger":
      return <ChatBlob color="#6A4CF5" phase={t + i} flip={i % 2 === 1} />;
    case "question":
      return <QuestionBlob />;
    case "parcel":
      return <Parcel scale={1.1} />;
    case "cart":
      return <Cart scale={1.0} />;
  }
};

export const SceneQuote: React.FC<{ t: number; dur: number; cue: Cue; data: QuoteData }> = ({ t, dur, cue, data }) => {
  const L = LOOK[data.industry];
  const pr = data.problem;
  const T0 = 0.15;
  const E = dur - 0.62;
  const screens: ScreenSpec[] = [];

  // ---------- word timing ----------
  const words = data.quote.split(/\s+/).filter(Boolean);
  const qA = cueOr(cue, words[0], 0.75);
  const qB = cueOr(cue, data.cues?.end, Math.max(qA + 1.5, dur * 0.72));
  const wt: number[] = [];
  let prev = qA - 0.01;
  words.forEach((w, i) => {
    const fb = qA + ((qB - qA) * i) / Math.max(1, words.length);
    let v = cue(w, prev + 0.01);
    if (!Number.isFinite(v) || v > qB + 2) v = Math.max(fb, prev + 0.05);
    wt.push(v);
    prev = v;
  });
  const emph = words.map((w) => (data.emphasis ?? []).some((e) => nrm(w).includes(nrm(e))));
  const wk = wt.map((a) => springStep(t - a + 0.04, { k: 260, c: 20 }));
  const tProb = cueOr(cue, pr.at, qA + (qB - qA) * 0.35, qA);

  // ---------- layout ----------
  const SP = atFloor(0.23, 0.6, cam);
  const sS = worldWidth(0.32, SP[2], cam) / SHOP.w;
  const OP = atFloor(0.76, 0.8, cam);
  const oS = worldWidth(0.18, OP[2], cam) / 0.42;

  // bubble size from text length (DOM px → world)
  const chars = data.quote.length;
  const fs = chars <= 44 ? 62 : chars <= 80 ? 54 : chars <= 120 ? 47 : 42;
  const PXW = 960;
  const cpl = (PXW - 150) / (fs * 0.52);
  const lines = Math.max(1, Math.ceil((chars * 1.04) / cpl));
  const PXH = Math.round(40 + lines * fs * 1.38 + fs * 0.62 * 1.5 + 56);
  const BW = 4.4;
  const BH = (BW * PXH) / PXW;
  const BP = atScreen(0.5, 0.2, 1.2, cam);
  // উপরের কিনারা frame-এর y≈0.055-এ, প্রস্থ frame-এর 90%
  const bScale = worldWidth(0.9, BP[2], cam) / BW;
  const bubbleTop = atScreen(0.5, 0.055, BP[2], cam)[1];
  const bubbleY = bubbleTop - (BH / 2) * bScale;
  const tailX = BW * 0.22; // owner-এর দিকে (ডানে)
  const bIn = popIn(t, qA - 0.3, { k: 200, c: 15 });
  const bOut = t > E - 0.05 ? Math.min(1, (t - E + 0.05) / 0.35) : 0;
  const bK = Math.max(0, bIn.s * (1 - backIn(bOut)));
  const bubblePos: V3 = [BP[0] + 0.02 * drift(t, 4), bubbleY + 0.03 * drift(t, 7), BP[2]];
  const bubbleRot: V3 = [0.02, -0.03 + 0.02 * drift(t, 2), 0];
  if (bK > 0.001) {
    const m = toMatrix(bubblePos, bubbleRot, [bScale * bK * bIn.sx, bScale * bK * bIn.sy, bScale * bK]).multiply(new THREE.Matrix4().makeTranslation(0, 0, BUBBLE_D / 2 + 0.006));
    screens.push({
      matrix: m,
      w: BW - 0.06,
      h: BH - 0.06,
      px: PXW,
      py: Math.round((PXW * (BH - 0.06)) / (BW - 0.06)),
      radius: 0,
      bg: "transparent",
      glare: false,
      content: <QuoteFace words={words} k={wk} emph={emph} fs={fs} speaker={data.speaker} speakerK={range(t, wt[wt.length - 1] + 0.2, wt[wt.length - 1] + 0.7)} mark={springStep(t - qA + 0.15, { k: 180, c: 12 })} />,
    });
  }

  // ---------- owner animation: কথা বলার সময় হাত নাড়ে, সমস্যার সময় হিমশিম ----------
  const talking = t > qA && t < wt[wt.length - 1] + 0.4;
  const gest = talking ? 0.35 + 0.3 * Math.sin(t * 3.1) * Math.sin(t * 1.3 + 0.5) : 0;
  const over = springStep(t - (tProb + 0.9), { k: 70, c: 9 }) * (1 - range(t, E - 0.3, E));
  const headTilt = (talking ? 0.06 * Math.sin(t * 4.2) : 0) + over * 0.12 * Math.sin(t * 6.5);

  // ---------- problem items ----------
  const nP = Math.max(1, Math.min(pr.kind === "pile" ? 12 : 10, pr.n));
  const itemS = worldWidth(pr.kind === "pile" ? 0.105 : 0.13, OP[2], cam);
  const stagger = Math.min(0.3, Math.max(0.12, (E - 0.8 - tProb) / (nP + 2)));
  const items: React.ReactNode[] = [];
  let arrived = 0,
    keptNow = 0;
  const keptN = Math.max(0, Math.min(nP, pr.kept ?? 0));
  const keepIdx = new Set(Array.from({ length: keptN }, (_, j) => Math.round(((j + 0.5) * nP) / keptN - 0.5)));

  if (pr.kind === "pile") {
    // owner-এর মাথা ঘিরে বাম-উপর অর্ধবৃত্তে স্তরে স্তরে (screen-space ring)
    // owner-এর মাথার উপর-বামে দুই সারি arc (দোকান আর bubble-এর মাঝের ফাঁকা জায়গায়)
    const [hx, hy] = [0.74, 0.53];
    const inner = Math.min(4, Math.ceil(nP / 3));
    for (let i = 0; i < nP; i++) {
      const ring = i < inner ? 0 : 1;
      const j = ring ? i - inner : i;
      const per = ring ? Math.max(1, nP - inner) : inner;
      const ang = 72 + (122 * (j + 0.5)) / per + (hash(i, 3) - 0.5) * 6;
      const rad = (ring ? 0.33 : 0.2) + (hash(i, 5) - 0.5) * 0.02;
      const a = (ang * Math.PI) / 180;
      const sx = hx + Math.cos(a) * rad,
        sy = hy - Math.sin(a) * rad * 0.5625;
      const p = atScreen(sx, sy, OP[2] - 0.6 - hash(i, 9) * 0.8, cam);
      const at = tProb + i * stagger;
      if (t < at) continue;
      arrived++;
      const pop = popIn(t, at, { k: 240, c: 13 });
      const out = t > E ? Math.min(1, (t - E - i * 0.015) / 0.35) : 0;
      const s = itemS * pop.s * Math.max(0, 1 - backIn(out));
      if (s < 1e-4) continue;
      const buzz = pr.item === "call" ? Math.sin(t * 46 + i * 2.1) * 0.09 * (0.5 + 0.5 * Math.sin(t * 7 + i)) : 0.05 * Math.sin(t * 2.2 + i);
      items.push(
        <group key={i} position={[p[0], p[1] + 0.06 * Math.sin(t * 1.7 + i * 1.3), p[2]]} rotation={[0, (sx - 0.5) * -0.6, buzz]} scale={[s * pop.sx, s * pop.sy, s]}>
          <Item kind={pr.item} t={t} i={i} />
        </group>
      );
    }
  } else {
    // leak: বাম থেকে উড়ে দরজায়; kept → ঢুকে যায়, বাকিরা ধাক্কা খেয়ে floor-এ পড়ে ডুবে যায়
    const door = new THREE.Vector3(SP[0], FLOOR + (SHOP.sill + SHOP.doorH * 0.42) * sS, SP[2] + (SHOP.d / 2) * sS);
    for (let i = 0; i < nP; i++) {
      const at = tProb + i * stagger * 1.25;
      if (t < at) continue;
      const fly = 0.85;
      const u = (t - at) / fly;
      const keep = keepIdx.has(i);
      if (u >= 1) arrived++;
      const start = new THREE.Vector3(...atScreen(-0.1, 0.36 + hash(i, 2) * 0.1, door.z, cam));
      let pos: THREE.Vector3,
        sc = itemS,
        rotZ = 0;
      if (u < 1) {
        const k = smoothstep(0, 1, u);
        pos = start.clone().lerp(door, k);
        pos.y += Math.sin(Math.PI * k) * 1.1 * sS;
        rotZ = (1 - k) * 0.6;
        sc *= 0.7 + 0.3 * Math.min(1, u * 3);
      } else if (keep) {
        // দরজা দিয়ে ভেতরে ঢুকে যায়
        const e = Math.min(1, (u - 1) * 3.5);
        if (e >= 1) {
          keptNow++;
          continue;
        }
        pos = door.clone().add(new THREE.Vector3(0, 0, -e * 0.6 * sS));
        sc *= 1 - e;
      } else {
        // দরজায় ধাক্কা → সামনে-ডানে ছিটকে floor-এ পড়ে, লাফায়, তারপর ডুবে যায়
        const tb = (u - 1) * fly;
        const vx = (0.9 + hash(i, 7) * 1.5) * itemS,
          vz = (2.2 + hash(i, 4) * 1.4) * itemS,
          vy = 2.6 * itemS;
        const g = 11 * itemS;
        const restY = FLOOR + itemS * 0.38;
        const tLand = (vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, door.y - restY))) / g;
        const tt = Math.min(tb, tLand);
        let y = Math.max(restY, door.y + vy * tb - 0.5 * g * tb * tb);
        if (tb > tLand) y = restY + Math.abs(Math.sin((tb - tLand) * 7)) * 0.35 * itemS * Math.exp(-(tb - tLand) * 5);
        pos = new THREE.Vector3(door.x + vx * tt, y, door.z + vz * tt);
        rotZ = -tt * 4;
        const sink = range(tb, tLand + 0.9, tLand + 1.5);
        if (sink >= 1) continue;
        pos.y -= sink * sink * itemS * 1.2;
      }
      const out = t > E ? Math.min(1, (t - E) / 0.35) : 0;
      sc *= Math.max(0, 1 - backIn(out));
      if (sc < 1e-4) continue;
      items.push(
        <group key={i} position={pos.toArray()} rotation={[0, 0.2, rotZ]} scale={sc}>
          <Item kind={pr.item} t={t} i={i} />
        </group>
      );
    }
  }
  const nShown = Math.round((Math.min(arrived, nP) / nP) * (pr.count ?? nP));
  const keptShown = keptN ? Math.round((keptNow / keptN) * (pr.keptCount ?? keptN)) : 0;
  const label = pr.label.replace("{n}", String(nShown)).replace("{kept}", String(keptShown));
  const tagW = Math.max(2.6, label.length * 0.2 + 0.7);
  const tagFrac = Math.min(0.86, 0.08 + label.length * 0.026);
  const TP = atFloor(Math.max(0.34, 0.5 - (0.86 - tagFrac) * 0.6), 0.885, cam);
  const tagS = worldWidth(tagFrac, TP[2], cam) / tagW;

  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 1), cam.pos[1] + 0.04 * drift(t, 3), cam.pos[2] - 0.55 * smoothstep(0, dur, t)] };

  return (
    <Stage cam={camLive} screens={screens}>
      {/* the place */}
      <Life t={t} a={T0} b={E} kind="rise" exit="sink" position={SP} scale={sS}>
        <Shop label={data.business ?? L.sign} signColor={L.signColor} clay={L.clay} open={tween(t, T0 + 0.4, T0 + 1.1, 0, 0.72)} light={range(t, T0 + 0.5, T0 + 1.1)} rotationY={0.18}>
          <group position={[0, SHOP.h - 0.02, 0.05]} scale={0.95 * L.markScale * springStep(t - T0 - 0.35, { k: 160, c: 9 })} rotation={[0, 0.35 + 0.08 * Math.sin(t * 0.9), 0]}>
            <L.Mark />
          </group>
        </Shop>
      </Life>

      {/* the owner */}
      <Life t={t} a={T0 + 0.3} b={E + 0.05} kind="pop" position={OP} scale={oS}>
        <Figure
          rotationY={-0.38 + 0.06 * Math.sin(t * 0.8)}
          color={L.owner.color}
          coat={L.owner.coat}
          headTilt={headTilt}
          pose={{ cheer: over * 0.38, armOut: [gest * (1 - over), 0.15 * gest * (1 - over)], lean: -0.04 * over }}
        >
          <OwnerAcc acc={L.owner.acc} />
        </Figure>
      </Life>

      {/* speech bubble body (DOM face = overlay) */}
      {bK > 0.001 && (
        <group position={bubblePos} rotation={bubbleRot} scale={[bScale * bK * bIn.sx, bScale * bK * bIn.sy, bScale * bK]}>
          <SpeechBubble w={BW} h={BH} tailX={tailX} tailLen={0.62} tailDir={1} />
        </group>
      )}

      {/* problem */}
      {items}
      <Life t={t} a={tProb + 0.25} b={E} kind="pop" position={[TP[0], FLOOR + 0.3 * tagS, TP[2]]} scale={tagS} rotation={[0, 0, wobble(t - tProb - 0.25, 0.06, 1.4, 0.15)]}>
        <Tag text={label} size={0.24} w={tagW} h={0.56} color={pr.kind === "leak" ? "#C8443A" : C.deepNavy} />
      </Life>
    </Stage>
  );
};
