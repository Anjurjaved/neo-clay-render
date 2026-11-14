// wd004 S06 — timeline (183.38–213.78 s) · "টাকা কখন দেবেন" — clay রাস্তা, ৪টা station, ডাক্তার হেঁটে এগোন
import React from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { useVideoTime } from "../../kit/time";
import { springStep, wobble, popIn, tween, range, smoothstep, emphDecel, drift, pathDistance, speedAt, headingAt } from "../../kit/anim";
import { Figure } from "../../kit/Figure";
import { Phone, phoneScreen, PHONE, Tablet, tabletScreen, TABLET } from "../../kit/Device";
import { Tag } from "../../kit/Clock";
import { CheckBadge } from "../../kit/Soft";
import { Coin, PriceTag, Stethoscope } from "../../web11/props";
import { DentalSite } from "../../web11/screens";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { cue, SCENES } from "../cues";
import { Life, backIn } from "../life";
import { Road, Station, STATION_TOP, Bubble, ProgressCard, TestCard, LiveBadge, PayChip, PayChatScreen } from "../props/s06";

const cam: Cam = DEFAULT_CAM;
const A = SCENES.timeline - 0.1;

// ---- word cues ----
const T = (() => {
  const dhap = cue("ধাপের", A);
  const shurute = cue("শুরুতে", A);
  const alochona = cue("আলোচনা", A);
  const planning = cue("planning", A);
  const ordhek = cue("অর্ধেক", A);
  const taka2 = cue("টাকা", ordhek);
  const tarpor = cue("তারপর", A);
  const design = cue("design", tarpor);
  const mockup = cue("mockup", tarpor);
  const pochondo = cue("পছন্দ", tarpor);
  const dev = cue("development", tarpor);
  const dev2 = cue("development", dev + 0.1);
  const nijei = cue("নিজেই", dev2);
  const sheshe = cue("শেষে", dev2);
  const testing = cue("testing", sheshe);
  const live = cue("live", testing);
  const baki = cue("বাকি", live);
  const ordhek2 = cue("অর্ধেক", baki);
  const bkash = cue("bKash", baki);
  const nagad = cue("Nagad", baki);
  const bank = cue("bank", baki);
  const adv2 = cue("advance", bank);
  const whatsapp = cue("WhatsApp", adv2);
  return { dhap, shurute, alochona, planning, ordhek, taka2, tarpor, design, mockup, pochondo, dev, dev2, nijei, sheshe, testing, live, baki, ordhek2, bkash, nagad, bank, adv2, whatsapp };
})();
const END = SCENES.faq;
const CLEAR = T.adv2 - 0.5; // রাস্তার জগৎ বেরোয়
// ফোন নম্বর: শূন্য এক ছয় এক ছয়, নয় শূন্য এক, তিন নয় ছয়
const DIGITS: [string, number][] = (() => {
  const seq: [string, string][] = [
    ["শূন্য", "0"], ["এক", "1"], ["ছয়", "6"], ["এক", "1"], ["ছয়", "6"], ["নয়", "9"], ["শূন্য", "0"], ["এক", "1"], ["তিন", "3"], ["নয়", "9"], ["ছয়", "6"],
  ];
  let t = cue("শূন্য", T.adv2) - 0.01;
  const out: [string, number][] = [];
  seq.forEach(([w, d], i) => {
    t = cue(w, t + 0.01);
    out.push([d, t]);
    if (i === 4) out.push(["-", t + 0.16]);
  });
  return out;
})();

// ---- layout: রাস্তা নিচ-মাঝ থেকে এঁকেবেঁকে উপরে, station বাঁকের বাইরের দিকে ----
const R = [atFloor(0.42, 0.895, cam), atFloor(0.58, 0.815, cam), atFloor(0.42, 0.74, cam), atFloor(0.58, 0.685, cam)];
const ST = [atFloor(0.2, 0.88, cam), atFloor(0.8, 0.8, cam), atFloor(0.21, 0.715, cam), atFloor(0.79, 0.668, cam)];
const SIDE = [-1, 1, -1, 1];
const START = atFloor(0.5, 0.94, cam);
const CURVE = new THREE.CatmullRomCurve3(
  [START, R[0], R[1], R[2], R[3], atFloor(0.53, 0.665, cam)].map((p) => new THREE.Vector3(p[0], 0, p[2])),
  false,
  "centripetal"
);
const U = R.map((r) => {
  let best = 0,
    bd = 1e9;
  for (let i = 0; i <= 600; i++) {
    const p = CURVE.getPointAt(i / 600);
    const d = Math.hypot(p.x - r[0], p.z - r[2]);
    if (d < bd) {
      bd = d;
      best = i / 600;
    }
  }
  return best;
});
const HERO_Z = 1.5;
const HW = worldWidth(1, HERO_Z, cam);
const HERO = atScreen(0.5, 0.34, HERO_Z, cam);
const DOC_S = 1.15;
const COIN_S = 0.78;

// ডাক্তারের হাঁটা: [শুরু, শেষ, u থেকে, u পর্যন্ত]
const WALKS: [number, number, number, number][] = [
  [T.shurute - 0.45, T.alochona + 0.1, 0, U[0]],
  [T.tarpor, T.mockup, U[0], U[1]],
  [T.dev, T.dev + 0.95, U[1], U[2]],
  [T.sheshe, T.sheshe + 0.95, U[2], U[3]],
];
const docU = (t: number) => {
  let u = 0;
  for (const [a, b, u0, u1] of WALKS) {
    if (t >= a) u = u0 + (u1 - u0) * smoothstep(a, b, t);
  }
  return u;
};
const docXZ = (t: number): [number, number] => {
  const p = CURVE.getPointAt(Math.max(0, Math.min(1, docU(t))));
  return [p.x, p.z];
};
const stopIdx = (t: number) => {
  let k = -1;
  WALKS.forEach(([, b], i) => {
    if (t >= b - 0.05) k = i;
  });
  return k;
};

export const S06: React.FC = () => {
  const t = useVideoTime(SCENES.timeline);
  useCurrentFrame();
  const screens: ScreenSpec[] = [];

  // road
  const grow = tween(t, SCENES.timeline + 0.3, T.dhap + 0.2, 0, 1, emphDecel);
  const prog = docU(t);
  const roadOut = t > CLEAR ? Math.min(1, (t - CLEAR) / 0.4) : 0;

  // doctor
  const [dx, dz] = docXZ(t);
  const walkK = Math.min(1, speedAt(docXZ, t) / 0.9);
  const dist = pathDistance(docXZ, WALKS[0][0], t, 1 / 60);
  const si = stopIdx(t);
  const stopFace = si >= 0 ? SIDE[si] * 0.55 : 0;
  const head = headingAt(docXZ, t, stopFace);
  const face = stopFace + (head - stopFace) * Math.min(1, walkK * 1.5);
  const cheer = range(t, T.live, T.live + 0.25) * (1 - range(t, T.baki - 0.2, T.baki + 0.2));

  // station lit
  const lit = [
    range(t, T.alochona, T.alochona + 0.3),
    range(t, T.mockup, T.mockup + 0.3),
    range(t, T.dev + 0.6, T.dev + 0.9),
    range(t, T.testing, T.testing + 0.3),
  ];
  const live = range(t, T.live, T.live + 0.3);
  const labels: [string, number, string][] = [
    ["PLANNING", T.planning, C.navy],
    ["MOCKUP", T.mockup, C.navy],
    ["DEVELOPMENT", T.dev + 0.7, C.navy],
    [t < T.live ? "TESTING" : "LIVE", T.testing, t < T.live ? C.navy : "#1F9D55"],
  ];

  // tablet (mockup)
  const tabA = T.design,
    tabB = T.dev + 0.25;
  const tabPop = popIn(t, tabA, { k: 220, c: 15 });
  const tabOut = t > tabB ? Math.min(1, (t - tabB) / 0.38) : 0;
  const tabP = atScreen(0.5, 0.33, HERO_Z, cam);
  const tab = {
    position: [tabP[0], tabP[1], tabP[2]] as [number, number, number],
    rotation: [0.02, 0.06 * Math.sin(t * 0.7), 0] as [number, number, number],
    scale: ((HW * 0.78) / TABLET.w) * Math.max(0.001, tabPop.s) * (1 - backIn(tabOut)),
  };
  const tabVis = t > tabA - 0.02 && tabOut < 1;
  if (tabVis) screens.push(tabletScreen(tab, <DentalSite reveal={range(t, T.design + 0.1, T.pochondo - 0.1)} />, { opacity: range(tabPop.s, 0.3, 0.8) }));

  // chat phone
  const phA = T.adv2,
    phB = END - 0.55;
  const phPop = popIn(t, phA, { k: 200, c: 15 });
  const phOut = t > phB ? Math.min(1, (t - phB) / 0.38) : 0;
  const phP = atScreen(0.5, 0.43, 2.5, cam);
  const ph = {
    position: [phP[0], phP[1] + 0.03 * Math.sin(t * 1.1), phP[2]] as [number, number, number],
    rotation: [0.03, 0.1 * Math.sin(t * 0.5), 0] as [number, number, number],
    scale: (worldWidth(0.42, phP[2], cam) / PHONE.w) * Math.max(0.001, phPop.s) * (1 - backIn(phOut)),
  };
  const phVis = t > phA - 0.02 && phOut < 1;
  const typedNum = DIGITS.filter(([, at]) => t >= at).map(([d]) => d).join("");
  if (phVis) screens.push(phoneScreen(ph, <PayChatScreen typed={typedNum} caret={Math.floor(t * 2.4) % 2 === 0} sent={range(t, T.whatsapp + 0.15, T.whatsapp + 0.5)} />, { opacity: range(phPop.s, 0.3, 0.8) }));

  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 2), cam.pos[1] + 0.04 * drift(t, 5), cam.pos[2]] };

  const coinStack = (st: number, at: number, key: string) =>
    [0, 1, 2, 3, 4].map((i) => (
      <Life key={key + i} t={t} a={at + i * 0.09} b={CLEAR + i * 0.02} kind="drop" position={[ST[st][0], FLOOR + STATION_TOP + 0.06 * COIN_S + i * 0.118 * COIN_S, ST[st][2]]} scale={COIN_S} rotation={[0, i * 0.5, 0]}>
        <Coin />
      </Life>
    ));

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== road + stations ===== */}
      {roadOut < 1 && <Road curve={CURVE} grow={grow} prog={prog} position={[0, FLOOR - roadOut * roadOut * 0.4, 0]} scale={[1, 1 - roadOut, 1]} />}
      {ST.map((p, i) => (
        <Life key={i} t={t} a={T.dhap + i * 0.17} b={CLEAR + i * 0.04} kind="pop" exit="shrink" position={p}>
          <Station n={i + 1} lit={lit[i]} live={i === 3 ? live : 0} />
        </Life>
      ))}
      {labels.map(([txt, at, col], i) => (
        <Life key={i} t={t} a={at} b={CLEAR + i * 0.04} kind="pop" position={[ST[i][0], FLOOR + 0.2, ST[i][2] + 0.62]}>
          <group rotation={[0, 0, wobble(t - at - 0.1, 0.06, 1.4, 0.15)]}>
            <Tag text={txt} size={0.18} color={col} />
          </group>
        </Life>
      ))}
      {/* ছেড়ে আসা station-এ ছোট tick */}
      {[0, 1, 2].map((i) => (
        <Life key={i} t={t} a={WALKS[i + 1][0] + 0.25} b={CLEAR + i * 0.04} kind="pop" position={[ST[i][0] - SIDE[i] * [0.85, 0.72, 1.02][i], FLOOR + 0.2, ST[i][2] + 0.7]} scale={0.36}>
          <CheckBadge color={C.green} />
        </Life>
      ))}
      {coinStack(0, T.ordhek, "a")}
      {coinStack(3, T.ordhek2, "b")}

      {/* ===== doctor ===== */}
      <Life t={t} a={WALKS[0][0]} b={CLEAR} kind="pop" exit="shrink" position={[dx, FLOOR, dz]} scale={DOC_S}>
        <Figure rotationY={face} coat="#F6F4F0" pose={{ dist: dist, walk: walkK, cheer }}>
          <Stethoscope />
        </Figure>
      </Life>

      {/* ===== beat 1: আলোচনা + 50% advance ===== */}
      <Life t={t} a={T.alochona} b={T.ordhek - 0.35} kind="pop" position={atScreen(0.37, 0.3, HERO_Z, cam)} rotation={[0, 0, wobble(t - T.alochona, 0.08, 1.2, 0.2)]}>
        <Bubble color={C.navy} dot="#ffffff" w={1.6} h={0.9} tail={-1} phase={t} />
      </Life>
      <Life t={t} a={T.planning - 0.15} b={T.ordhek - 0.3} kind="pop" position={atScreen(0.63, 0.39, HERO_Z, cam)} rotation={[0, 0, wobble(t - T.planning, 0.08, 1.2, 0.2)]}>
        <Bubble color="#F7F2EB" dot={C.orange} w={1.6} h={0.9} tail={1} phase={t + 1.3} />
      </Life>
      <Life t={t} a={T.taka2 - 0.1} b={T.tarpor + 0.3} kind="pop" position={HERO} scale={(HW * 0.66) / 3.0} rotation={[0, 0, wobble(t - T.taka2, 0.06, 1.3, 0.12)]}>
        <PriceTag text="50%" sub="ADVANCE" w={3.0} h={1.25} />
      </Life>

      {/* ===== beat 2: mockup tablet ===== */}
      {tabVis && <Tablet {...tab} />}
      <Life t={t} a={T.pochondo} b={tabB} kind="pop" position={[tabP[0] + HW * 0.36, tabP[1] + HW * 0.24, tabP[2] + 0.3]} scale={0.75}>
        <CheckBadge />
      </Life>

      {/* ===== beat 3: development progress ===== */}
      <Life t={t} a={tabB + 0.3} b={T.testing - 0.1} kind="pop" position={HERO} scale={(HW * 0.8) / 3.6}>
        <ProgressCard p={range(t, T.dev2, T.sheshe - 0.15)} />
      </Life>
      <Life t={t} a={T.nijei} b={T.testing - 0.12} kind="pop" position={atScreen(0.5, 0.45, HERO_Z, cam)}>
        <Tag text="WATCH IT GROW" size={0.19} color={C.steel} />
      </Life>

      {/* ===== beat 4: testing → LIVE ===== */}
      <Life t={t} a={T.testing + 0.3} b={T.live - 0.4} kind="pop" position={HERO} scale={(HW * 0.74) / 3.3}>
        <TestCard rows={["MOBILE VIEW", "SERIAL FORM", "PAGE SPEED"]} ticks={[0, 1, 2].map((i) => springStep(t - (T.testing + 0.9 + i * 0.75), { k: 260, c: 14 }) * (t > T.testing + 0.9 + i * 0.75 ? 1 : 0))} />
      </Life>
      <Life t={t} a={T.live} b={T.baki - 0.15} kind="pop" position={HERO} scale={(HW * 0.6) / 2.5}>
        <LiveBadge pulse={0.5 + 0.5 * Math.sin(t * 6)} />
      </Life>

      {/* ===== beat 5: বাকি 50% + payment chips ===== */}
      <Life t={t} a={T.ordhek2 - 0.1} b={CLEAR} kind="pop" position={atScreen(0.5, 0.3, HERO_Z, cam)} scale={(HW * 0.66) / 3.0} rotation={[0, 0, wobble(t - T.ordhek2, 0.06, 1.3, 0.12)]}>
        <PriceTag text="50%" sub="AFTER LIVE" w={3.0} h={1.25} color={C.navy} />
      </Life>
      {(
        [
          ["bKash", "#E2136E", T.bkash],
          ["Nagad", "#F6921E", T.nagad],
          ["BANK", C.navy, T.bank],
        ] as [string, string, number][]
      ).map(([lbl, col, at], i) => (
        <Life key={lbl} t={t} a={at} b={CLEAR + i * 0.05} kind="pop" position={atScreen(0.22 + i * 0.28, 0.46, HERO_Z, cam)} scale={(HW * 0.25) / 1.35}>
          <PayChip label={lbl} color={col} />
        </Life>
      ))}

      {/* ===== beat 6: WhatsApp chat phone ===== */}
      {phVis && <Phone {...ph} />}
    </Stage>
  );
};
