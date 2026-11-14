import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage, FLOOR, Cam } from "../../kit/Stage";
import { FPS } from "../../kit/time";
import { LibItem } from "../types";
import { Coin, CoinStack, coinShowPose } from "./Coin";
import { Banknote, NoteBundle } from "./Banknote";
import { ReceiptPrinter, feedCurve, receiptLength, DEFAULT_RECEIPT } from "./ReceiptPrinter";
import { popIn, springStep, wobble, tween, expoOut, smoothstep } from "../../kit/anim";
import { Wallet } from "./Wallet";
import { PriceTag, tagSwing, TAG } from "./PriceTag";
import { CostSplit } from "./CostSplit";
import { Piggy, PIG_SLOT } from "./Piggy";
import { PriceSlider } from "./Slider";

const useT = () => useCurrentFrame() / FPS;
const CAM: Cam = { pos: [0, 3.2, 21], target: [0, -0.5, 0], fov: 27 };

const CoinShow: React.FC = () => {
  const t = useT();
  const { y, spin, sq } = coinShowPose(t);
  const S = 3.5;
  return (
    <Stage cam={CAM}>
      <group position={[0, FLOOR + 0.5 * S + y, 0]} rotation={[0, spin, 0.0]} scale={[S * (1 - sq * 0.4), S * (1 + sq), S]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <Coin />
        </group>
      </group>
    </Stage>
  );
};

const StackShow: React.FC = () => {
  const t = useT();
  const S = 1.6;
  return (
    <Stage cam={{ pos: [0, 5.0, 20], target: [0, -0.9, 0], fov: 27 }}>
      <CoinStack time={t} n={5} start={0.2} every={0.17} drop={1.6} position={[-1.7, FLOOR, 1.0]} scale={S} seed={1} />
      <CoinStack time={t} n={9} start={0.5} every={0.17} drop={1.6} position={[0, FLOOR, 0]} scale={S} seed={2} />
      <CoinStack time={t} n={14} start={0.8} every={0.17} drop={1.6} position={[1.7, FLOOR, -1.0]} scale={S} seed={3} />
    </Stage>
  );
};

const NoteShow: React.FC = () => {
  const t = useT();
  const pin = popIn(t, 0.05);
  // top note lifts off the bundle, curls, flutters in the air
  const lift = springStep(t - 0.8, { k: 30, c: 7 });
  const phase = t * 5.2;
  const fl = 0.09 + 0.05 * lift;
  return (
    <Stage cam={{ pos: [0, 5.2, 20], target: [0, -0.4, 0], fov: 27 }}>
      <group position={[0, FLOOR, 0.6]} rotation={[0, -0.35, 0]} scale={[1.3 * pin.s * pin.sx, 1.3 * pin.s * pin.sy, 1.3 * pin.s * pin.sx]}>
        <NoteBundle count={16} style="green" />
      </group>
      <group position={[0.1 + lift * 0.1, FLOOR + 0.43 + lift * 2.8 + Math.sin(t * 2.1) * 0.08 * lift, 0.6 - lift * 0.3]} rotation={[-Math.PI / 2 + lift * 1.0, -0.35 + lift * 0.45, lift * 0.16 + Math.sin(t * 1.7) * 0.05 * lift]} scale={1.3}>
        <Banknote style="green" bend={lift * 1.1} flutter={fl * lift} phase={phase} lift={0.25 * lift} />
      </group>
    </Stage>
  );
};

const PrinterShow: React.FC = () => {
  const t = useT();
  const pin = popIn(t, 0.05, { k: 200, c: 14 });
  const Lf = receiptLength(DEFAULT_RECEIPT);
  const { fed, jerk } = feedCurve(t, 0.8, 4.1, Lf, 16);
  const tear = tween(t, 4.6, 5.3, 0, 1, expoOut) + (t > 4.6 ? wobble(t - 4.6, 0.05, 2.2, 0.3) : 0);
  const S = 1.5;
  return (
    <Stage cam={{ pos: [2.2, 6.0, 19.5], target: [0, -0.1, 0], fov: 27 }}>
      <group position={[-0.1, FLOOR, 0]} rotation={[0, -0.42, 0]} scale={[S * pin.s * pin.sx, S * pin.s * pin.sy, S * pin.s * pin.sx]}>
        <ReceiptPrinter fed={fed} time={t} jerk={jerk} tear={tear} />
      </group>
    </Stage>
  );
};

const WalletShow: React.FC = () => {
  const t = useT();
  const pin = popIn(t, 0.05);
  const open = springStep(t - 0.7, { k: 55, c: 8.5 });
  const notes = springStep(t - 1.7, { k: 22, c: 6.5 });
  const x = -0.95 + (0.25 + 0.95) * Math.min(1, open);
  return (
    <Stage cam={{ pos: [0, 3.4, 20], target: [0, -0.6, 0], fov: 27 }}>
      <group position={[x, FLOOR + 0.28 + Math.sin(t * 1.6) * 0.03, 0]} rotation={[-0.1, 0.32, 0]} scale={[1.15 * pin.s * pin.sx, 1.15 * pin.s * pin.sy, 1.15 * pin.s]}>
        <Wallet open={Math.max(0, open)} notes={notes} />
      </group>
    </Stage>
  );
};

const TagShow: React.FC = () => {
  const t = useT();
  const S = 1.4;
  const drop = springStep(t - 0.05, { k: 90, c: 9 });
  const sw = tagSwing(t, 0.25, 0.42);
  const count = smoothstep(1.0, 2.8, t);
  return (
    <Stage cam={{ pos: [0, 2.4, 21], target: [0, -0.2, 0], fov: 27 }}>
      <group position={[0, 2.85 + (1 - drop) * 4, 0]} rotation={[0, -0.32, 0]} scale={S}>
        <PriceTag value={15000} count={count} swing={sw.swing} lag={sw.lag} twist={sw.twist} />
      </group>
    </Stage>
  );
};

const CostShow: React.FC = () => {
  const t = useT();
  return (
    <Stage cam={{ pos: [0, 3.0, 21], target: [0, 0.1, 0], fov: 27 }}>
      <CostSplit time={t} position={[0, FLOOR, 0]} />
    </Stage>
  );
};

const PiggyShow: React.FC = () => {
  const t = useT();
  const pin = popIn(t, 0.05, { k: 200, c: 12 });
  const drops = [1.0, 2.0, 3.0];
  let squash = 0,
    hop = 0;
  const coins: React.ReactNode[] = [];
  drops.forEach((d, i) => {
    const fall = 0.36;
    const u = (t - (d - fall)) / fall;
    if (u > 0 && u < 1.25) {
      const y = PIG_SLOT[1] + 1.5 * (1 - Math.min(1, u) * Math.min(1, u)) - Math.max(0, u - 1) * 2.0;
      coins.push(
        <group key={i} position={[PIG_SLOT[0], y + 0.25, 0]} rotation={[Math.PI / 2, 0, 0.0]} scale={0.48}>
          <Coin />
        </group>
      );
    }
    const s = t - d;
    if (s > 0) {
      squash += wobble(s, 0.07, 3.4, 0.28);
      hop += Math.max(0, Math.sin(Math.min(Math.PI, s * 7))) * 0.12 * (s < 0.45 ? 1 : 0);
    }
  });
  const S = 1.7;
  return (
    <Stage cam={{ pos: [0, 6.5, 19.5], target: [0, -0.6, 0], fov: 27 }}>
      <group position={[0.05, FLOOR + hop * S, 0]} rotation={[0, -0.62, 0]} scale={[S * pin.s * pin.sx, S * pin.s * pin.sy, S * pin.s * pin.sx]}>
        <Piggy squash={squash} />
        {coins}
      </group>
    </Stage>
  );
};

const SliderShow: React.FC = () => {
  const t = useT();
  const pin = popIn(t, 0.05);
  // drag right → overshoot back → settle (spring on target changes)
  const v1 = springStep(t - 0.6, { k: 30, c: 8 }) * 0.82;
  const v2 = springStep(t - 1.9, { k: 34, c: 7 }) * -0.34;
  const value = Math.max(0, v1 + v2);
  const press = smoothstep(0.4, 0.6, t) * (1 - smoothstep(2.9, 3.2, t));
  return (
    <Stage cam={{ pos: [0, 2.6, 21], target: [0, -0.4, 0], fov: 27 }}>
      <group position={[0.05, -0.7, 0]} rotation={[-0.42, -0.2, 0]} scale={0.92 * pin.s}>
        <PriceSlider value={value} press={press} />
      </group>
    </Stage>
  );
};

export const ITEMS: LibItem[] = [
  { id: "money-coin", name: "Polished coin", nameBn: "চকচকে কয়েন", group: "money", kind: "component", duration: 4, still: 3.2, tags: ["price", "stat", "cta"], note: "<Coin /> radius 0.5, flat on y; coinGeo() shared", Comp: CoinShow },
  { id: "money-banknote", name: "Banknote + bundle", nameBn: "টাকার নোট ও গোছা", group: "money", kind: "component", duration: 4.5, still: 3.0, tags: ["price", "stat", "before_after"], note: "<Banknote bend flutter phase lift style /> · <NoteBundle count />", Comp: NoteShow },
  { id: "money-receipt-printer", name: "Receipt printer (live paper)", nameBn: "রসিদ প্রিন্টার (চলমান কাগজ)", group: "money", kind: "component", duration: 6, still: 4.2, tags: ["price", "checklist", "cta"], note: "<ReceiptPrinter fed time jerk tear data /> · feedCurve() · receiptLength()", Comp: PrinterShow },
  { id: "money-wallet", name: "Leather wallet (opens)", nameBn: "চামড়ার wallet (খোলে, নোট বেরোয়)", group: "money", kind: "component", duration: 4.5, still: 3.8, tags: ["price", "persona", "before_after"], note: "<Wallet open notes /> — one folded sheet, open 0 closed → 1", Comp: WalletShow },
  { id: "money-price-tag", name: "Swinging price tag", nameBn: "দোলা price tag (count-up)", group: "money", kind: "component", duration: 4.5, still: 3.6, tags: ["price", "cta", "compare"], note: "<PriceTag value count swing lag twist /> · tagSwing(t,t0,a0)", Comp: TagShow },
  { id: "money-cost-split", name: "One-time vs every year", nameBn: "একবারের খরচ বনাম প্রতি বছরের খরচ", group: "money", kind: "scene", duration: 6.2, still: 5.6, tags: ["price", "compare", "faq", "myth"], note: "<CostSplit time oneTime yearly period years />", Comp: CostShow },
  { id: "money-piggy", name: "Piggy bank (saving)", nameBn: "piggy bank (সঞ্চয়)", group: "money", kind: "component", duration: 4.2, still: 3.5, tags: ["price", "stat", "before_after"], note: "<Piggy squash /> one SDF mesh · PIG_SLOT for coin drops", Comp: PiggyShow },
  { id: "money-slider", name: "Price range slider", nameBn: "দামের slider", group: "money", kind: "component", duration: 4, still: 3.6, tags: ["price", "compare"], note: "<PriceSlider value min max press />", Comp: SliderShow },
  { id: "money-coin-stack", name: "Coin stack (grows)", nameBn: "কয়েনের স্তূপ (উঁচু হয়)", group: "money", kind: "component", duration: 4.5, still: 4.0, tags: ["price", "stat", "compare"], note: "<CoinStack time n every start />", Comp: StackShow },
];
