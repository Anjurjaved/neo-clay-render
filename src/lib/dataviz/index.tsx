// dataviz showcases — প্রতিটা item নিজের Stage-এ: ঢোকা → কাজ → স্থির। component-গুলো সব props-চালিত
// (values/labels/progress/age) — scene-এ script data দিয়ে ভরা যায়; সময়-নির্ভর মান শুধু এখানে হিসাব হয়।
import React from "react";
import { LibItem } from "../types";
import { Stage, Cam } from "../../kit/Stage";
import { toMatrix } from "../../kit/Screens";
import { springStep, expoOut, drift, range, wobble } from "../../kit/anim";
import { C } from "../../kit/theme";
import { useT } from "./common";
import { BarChart, barGrow } from "./Bars";
import { DonutChart, DonutCradle } from "./Donut";
import { ProgressBar } from "./Progress";
import { RoadTimeline, roadSchedule } from "./RoadTimeline";
import { StepsStairs, stairsSchedule } from "./Stairs";
import { Checklist, checklistAges } from "./Checklist";
import { BalanceScale, scaleAngle, scaleSwing, ScaleBlock } from "./BalanceScale";
import { BeforeAfterFrame, beforeAfterScreen, BA } from "./BeforeAfter";
import { Odometer } from "./Counter";
import { Iceberg } from "./Iceberg";
import { Funnel } from "./Funnel";

const camUp: Cam = { pos: [0, 3.4, 19.5], target: [0, -0.5, 0], fov: 27 };
const camRoad: Cam = { pos: [0, 10.5, 15.5], target: [0, -2.05, -0.3], fov: 27 };
const camSea: Cam = { pos: [0, 4.6, 19.5], target: [0, -0.4, 0], fov: 27 };
const FL = -2.2;

/** showcase ঢোকা: spring scale (overshoot সহ) */
const enter = (t: number, at = 0) => springStep(t - at, { k: 120, c: 13 });

const BarsShow: React.FC = () => {
  const t = useT();
  const e = enter(t, 0);
  const vals = [1840, 3260, 5120, 8450];
  return (
    <Stage cam={camUp}>
      <group position={[0, FL, 0]} rotation={[0, -0.32 + drift(t, 1) * 0.03, 0]} scale={0.66 + 0.4 * e}>
        <BarChart values={vals} labels={["2023", "2024", "2025", "2026"]} grow={vals.map((_, i) => barGrow(t, i, 0.55, 0.26))} base={e} title="MONTHLY VISITORS" />
      </group>
    </Stage>
  );
};

const DonutShow: React.FC = () => {
  const t = useT();
  const e = enter(t, 0);
  const sweep = expoOut(range(t, 0.45, 2.15));
  const pop = springStep(t - 2.3, { k: 140, c: 7 });
  return (
    <Stage cam={camUp}>
      <group position={[0, FL, 0]} rotation={[0, -0.3 + drift(t, 2) * 0.03, 0]} scale={(0.55 + 0.45 * e) * 0.86}>
        <DonutCradle />
        <group position={[0, 1.94, 0]} rotation={[-0.08, 0, (1 - e) * 0.6]}>
          <DonutChart
            slices={[
              { value: 52, label: "GOOGLE", color: C.orange },
              { value: 26, label: "FACEBOOK", color: C.steel },
              { value: 14, label: "DIRECT", color: C.navy },
              { value: 8, label: "OTHERS", color: "#E4CBB0" },
            ]}
            sweep={sweep}
            pop={pop}
            centerLabel="FROM GOOGLE"
            legend={springStep(t - 2.0, { k: 160, c: 14 })}
          />
        </group>
      </group>
    </Stage>
  );
};

const ProgressShow: React.FC = () => {
  const t = useT();
  const e = enter(t, 0);
  const s = { k: 70, c: 8 };
  const v = 0.38 * springStep(t - 0.6, s) + 0.34 * springStep(t - 1.5, s) + 0.28 * springStep(t - 2.4, { k: 90, c: 6 });
  return (
    <Stage cam={camUp}>
      <group position={[0, -0.6, 0]} rotation={[-0.06, -0.3 + drift(t, 3) * 0.03, 0]} scale={0.5 + 0.38 * e}>
        <ProgressBar value={v} title="WEBSITE BUILD" steps={["DESIGN", "BUILD", "SEO", "LIVE"]} done={springStep(t - 2.75, { k: 220, c: 12 })} />
      </group>
    </Stage>
  );
};

const ROAD_STOPS = [0.13, 0.4, 0.66, 0.93];
const RoadShow: React.FC = () => {
  const t = useT();
  const draw = expoOut(range(t, 0.0, 0.7));
  const sc = roadSchedule(t, ROAD_STOPS, 0.7, 0.27, 0.32);
  return (
    <Stage cam={camRoad}>
      <group position={[0, FL, 0]} rotation={[0, drift(t, 4) * 0.02, 0]}>
        <RoadTimeline stations={["PLAN", "DESIGN", "BUILD", "LAUNCH"]} stops={ROAD_STOPS} progress={sc.progress} walk={sc.walk} ages={sc.ages} draw={draw} />
      </group>
    </Stage>
  );
};

const StairsShow: React.FC = () => {
  const t = useT();
  const steps = ["PLAN", "DESIGN", "BUILD", "LAUNCH"];
  const sc = stairsSchedule(t, steps.length, 0.2, 0.16, 1.2, 0.42, 0.16);
  return (
    <Stage cam={camUp}>
      <group position={[0.25, FL, 0]} rotation={[0, -0.38 + drift(t, 5) * 0.02, 0]} scale={0.88}>
        <StepsStairs steps={steps} rise={sc.rise} climb={sc.climb} land={sc.land} cheer={sc.cheer} doneAge={sc.doneAge} />
      </group>
    </Stage>
  );
};

const ChecklistShow: React.FC = () => {
  const t = useT();
  const e = enter(t, 0);
  const items = ["Domain & hosting", "Mobile-first design", "Google Maps listing", "SEO setup", "Fast loading"];
  return (
    <Stage cam={camUp}>
      <group position={[0, FL + 2.0 * 0.8, 0]} rotation={[-0.1, -0.3 + drift(t, 6) * 0.03, (1 - e) * 0.15]} scale={(0.6 + 0.4 * e) * 0.8}>
        <Checklist items={items} ages={checklistAges(t, items.length, 0.8, 0.5)} />
      </group>
    </Stage>
  );
};

const SCALE_BLOCKS: ScaleBlock[] = [
  { label: "7 DAYS", color: C.navy, side: -1, at: 0.5 },
  { label: "24/7", color: C.orange, side: 1, at: 1.45 },
  { label: "SEO", color: C.orange, side: 1, at: 1.9 },
  { label: "LEADS", color: C.deepOrange, side: 1, at: 2.35 },
];
const BalanceShow: React.FC = () => {
  const t = useT();
  const e = enter(t, 0);
  return (
    <Stage cam={camUp}>
      <group position={[0, FL, 0]} rotation={[0, -0.28 + drift(t, 7) * 0.02, 0]} scale={(0.6 + 0.4 * e) * 0.86}>
        <BalanceScale blocks={SCALE_BLOCKS} t={t} angle={scaleAngle(t, SCALE_BLOCKS)} swing={scaleSwing(t, SCALE_BLOCKS)} leftTitle="AD BOOST" rightTitle="WEBSITE" />
      </group>
    </Stage>
  );
};

const BeforeAfterShow: React.FC = () => {
  const t = useT();
  const e = enter(t, 0);
  // পুরো BEFORE → AFTER-এর দিকে টান (overshoot) → মাঝখানে থিতু
  const split = 1 - 0.86 * springStep(t - 0.9, { k: 40, c: 5 }) + 0.36 * springStep(t - 2.4, { k: 60, c: 6.5 });
  const s = (0.6 + 0.4 * e) * 0.95;
  const pos: [number, number, number] = [0, FL + (BA.fh / 2 + 0.26) * s, 0];
  const rot: [number, number, number] = [0, -0.26 + drift(t, 8) * 0.02, 0];
  const m = toMatrix(pos, rot, s);
  return (
    <Stage cam={camUp} screens={[beforeAfterScreen(m, split)]}>
      <group position={pos} rotation={rot} scale={s}>
        <BeforeAfterFrame split={split} />
      </group>
    </Stage>
  );
};

const CounterShow: React.FC = () => {
  const t = useT();
  const e = enter(t, 0);
  const T1 = 3.0;
  const v = 12480 * expoOut(range(t, 0.45, T1));
  const jig = [0, 1, 2, 3, 4].map((i) => wobble(t - T1 + 0.25 - i * 0.07, 0.1, 2.6, 0.22));
  return (
    <Stage cam={camUp}>
      <group position={[0, -0.2, 0]} rotation={[-0.05, -0.3 + drift(t, 9) * 0.03, 0]} scale={(0.6 + 0.4 * e) * 0.82}>
        <Odometer value={v} digits={5} jiggle={jig} label="WEBSITE VISITORS" />
      </group>
    </Stage>
  );
};

const IcebergShow: React.FC = () => {
  const t = useT();
  const rise = -1.6 * (1 - springStep(t - 0.15, { k: 26, c: 3.2 }));
  const below = ["SEO", "SPEED", "SECURITY", "HOSTING", "BACKUP"];
  return (
    <Stage cam={camSea} floor={false}>
      <group position={[0, 1.15, 0]} rotation={[0, -0.22 + drift(t, 10) * 0.02, 0]} scale={0.86}>
        <Iceberg time={t + 4} rise={rise} splash={t - 0.55} above="DESIGN" aboveAge={t - 1.3} below={below} belowAges={below.map((_, i) => t - 1.8 - i * 0.32)} />
      </group>
    </Stage>
  );
};

const FunnelShow: React.FC = () => {
  const t = useT();
  const tiers = [
    { label: "VISITORS", value: 12480, color: "#F2E8DC", ink: C.navy },
    { label: "CLICKS", value: 3120, color: "#8FB0D2" },
    { label: "CALLS", value: 640, color: C.steel },
    { label: "CUSTOMERS", value: 180, color: C.orange },
  ];
  const tierIn = tiers.map((_, i) => springStep(t - 0.15 - (tiers.length - 1 - i) * 0.17, { k: 150, c: 9 }));
  return (
    <Stage cam={camUp}>
      <group position={[-0.35, FL, 0]} rotation={[0, drift(t, 11) * 0.02, 0]} scale={0.95}>
        <Funnel tiers={tiers} tierIn={tierIn} count={expoOut(range(t, 1.0, 2.4))} flow={t - 1.3} balls={18} exitEvery={4} />
      </group>
    </Stage>
  );
};

const base = { group: "dataviz", kind: "component" as const };
export const ITEMS: LibItem[] = [
  { ...base, id: "dataviz-bars", name: "Bar chart (growing)", nameBn: "বার চার্ট — বাড়তে থাকা", duration: 4, still: 3.4, tags: ["stat", "before_after", "points"], note: "<BarChart values labels grow={values.map((_,i)=>barGrow(t,i))} highlight title/> — bevel-safe stretch, count-up", Comp: BarsShow },
  { ...base, id: "dataviz-donut", name: "Donut chart (clay)", nameBn: "ডোনাট চার্ট — clay", duration: 4, still: 3.4, tags: ["stat", "compare", "points"], note: "<DonutChart slices={[{value,label,color}]} sweep={0..1} highlight pop centerLabel legend/> + <DonutCradle/>", Comp: DonutShow },
  { ...base, id: "dataviz-progress", name: "Progress bar + percent", nameBn: "প্রগ্রেস বার + শতাংশ", duration: 4, still: 3.5, tags: ["steps", "timeline", "stat"], note: "<ProgressBar value={0..1 (+overshoot = squash)} title steps done/>", Comp: ProgressShow },
  { ...base, id: "dataviz-road-timeline", name: "Road timeline (figure walks)", nameBn: "রাস্তা টাইমলাইন — figure হাঁটে", duration: 6.5, still: 6.2, tags: ["timeline", "steps"], note: "<RoadTimeline stations stops progress walk ages draw path?/>; roadSchedule(t, stops) gives progress/walk/ages", Comp: RoadShow },
  { ...base, id: "dataviz-steps-stairs", name: "Steps stairs (figure climbs)", nameBn: "সিঁড়ি-ধাপ — figure ওঠে", duration: 4.5, still: 4.2, tags: ["steps", "timeline"], note: "<StepsStairs steps rise climb land cheer doneAge/>; stairsSchedule(t, n)", Comp: StairsShow },
  { ...base, id: "dataviz-checklist", name: "Checklist (ticks pop)", nameBn: "চেকলিস্ট — টিক পড়ে", duration: 4.5, still: 4.0, tags: ["checklist", "points"], note: "<Checklist items ages={checklistAges(t,n)} title/> — English labels (3D text)", Comp: ChecklistShow },
  { ...base, id: "dataviz-balance-scale", name: "Balance scale (compare)", nameBn: "দাঁড়িপাল্লা — তুলনা", duration: 5, still: 4.6, tags: ["compare", "myth", "price"], note: "<BalanceScale blocks={[{label,color,side,at}]} t angle={scaleAngle(t,blocks)} swing={scaleSwing(t,blocks)} leftTitle rightTitle/>", Comp: BalanceShow },
  { ...base, id: "dataviz-before-after", name: "Before / after slider", nameBn: "আগে / পরে — slider", kind: "screen", duration: 4.5, still: 4.2, tags: ["before_after", "compare"], note: "<BeforeAfterFrame split/> + Stage screens={[beforeAfterScreen(frameMatrix, split, before?, after?)]}", Comp: BeforeAfterShow },
  { ...base, id: "dataviz-counter", name: "3D odometer counter", nameBn: "৩D odometer কাউন্টার", duration: 4.2, still: 3.9, tags: ["stat", "title"], note: "<Odometer value digits jiggle label commas/> — real carry logic (odoDigit)", Comp: CounterShow },
  { ...base, id: "dataviz-iceberg", name: "Iceberg (seen vs hidden)", nameBn: "আইসবার্গ — দেখা বনাম লুকানো", duration: 5, still: 4.6, tags: ["myth", "points", "price"], note: "<Iceberg time rise splash above aboveAge below belowAges/> — use Stage floor={false}", Comp: IcebergShow },
  { ...base, id: "dataviz-funnel", name: "Lead funnel", nameBn: "লিড ফানেল", duration: 5.5, still: 5.2, tags: ["stat", "steps", "points"], note: "<Funnel tiers={[{label,value,color,ink?}]} tierIn count flow balls exitEvery/>", Comp: FunnelShow },
];
