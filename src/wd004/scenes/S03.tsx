// wd004 S03 stat (79.52–99.42 s) — সময় = খরচ · রোগীর একটাই রাস্তা (ফোন) · 7–14 দিনে live · mockup approve · ৪ ধাপ
import React from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { useVideoTime } from "../../kit/time";
import { typed } from "../../kit/time";
import { springStep, wobble, popIn, tween, range, expoOut, drift } from "../../kit/anim";
import { Figure } from "../../kit/Figure";
import { Phone, phoneScreen, PHONE, Tablet, tabletScreen, TABLET } from "../../kit/Device";
import { LogoMark } from "../../kit/Logo";
import { Tag } from "../../kit/Clock";
import { Txt } from "../../kit/Clay";
import { CheckBadge } from "../../kit/Soft";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { Coin, Calendar, Laptop, laptopScreenMatrix, LAPTOP, BrowserWin, Stethoscope } from "../../web11/props";
import { cue, SCENES } from "../cues";
import { Life, backIn } from "../life";
import { Hourglass, HOURGLASS_H, RoadStrip, Handset, XBadge, SignBoard, CallScreen, MockupScreen, StepsPage } from "../props/s03";

const cam: Cam = DEFAULT_CAM;
const S0 = SCENES.stat;
const END = SCENES.compare;

const T = {
  hishab: cue("হিসাবটাও", S0),
  kintu: cue("কিন্তু", S0),
  khoroch: cue("খরচ", S0),
  karon: cue("কারণ", S0),
  joto: cue("যত", S0),
  site: cue("site", S0),
  nei: cue("নেই", S0),
  tato: cue("তত", S0),
  rogir: cue("রোগীর", S0),
  rasta: cue("রাস্তা", S0),
  ektai: cue("একটাই", S0),
  phone: cue("ফোন", S0),
  number: cue("নম্বর", S0),
  business: cue("business", S0),
  sat: cue("সাত", S0),
  choddo: cue("চোদ্দ", S0),
  live: cue("live", S0),
  majhe: cue("মাঝে", S0),
  design: cue("design", S0),
  mockup: cue("mockup", S0),
  approve: cue("approve", S0),
  kajer: cue("কাজের", S0),
  dhap: cue("ধাপ", S0),
  jit: cue("javeditsolution", S0),
  dot: cue("dot", S0),
  com: cue("com", S0),
  web: cue("website", cue("com", S0)),
  page: cue("page", cue("com", S0)),
  porishkar: cue("পরিষ্কার", S0),
  lekha: cue("লেখা", S0),
};
const B1_OUT = T.karon - 0.05; // hourglass beat শেষ
const B2_OUT = T.business - 0.42;
const B3_OUT = T.majhe - 0.4;
const B4_OUT = T.kajer - 0.4;
const B5_OUT = END - 0.85;

// ---------- layout (default cam) ----------
const HGP = atFloor(0.33, 0.7, cam);
const HG_S = (worldWidth(1, HGP[2], cam) * (1920 / 1080) * 0.36) / HOURGLASS_H;
const COINP = atFloor(0.75, 0.76, cam);
const COIN_S = worldWidth(0.19, COINP[2], cam) / 0.72;

const PAT = atFloor(0.25, 0.87, cam);
const PAT_S = (worldWidth(1, PAT[2], cam) * (1920 / 1080) * 0.26) / 1.12;
const J = atFloor(0.42, 0.72, cam);
const MID = atFloor(0.52, 0.57, cam);
const LFT = atFloor(0.19, 0.635, cam);
const RGT = atFloor(0.81, 0.64, cam);
const xz = (p: [number, number, number]): [number, number] => [p[0], p[2]];

const DOC = atFloor(0.19, 0.87, cam);
const DOC_S = (worldWidth(1, DOC[2], cam) * (1920 / 1080) * 0.29) / 1.12;
const TAB = atScreen(0.6, 0.47, 3, cam);
const TAB_S = worldWidth(0.52, 3, cam) / TABLET.w;

const LAP = atFloor(0.5, 0.635, cam);
const LAP_S = worldWidth(0.78, LAP[2], cam) / LAPTOP.w;

const ROAD = "#ECE4DA";
const GREY = "#C9CED5";
const mixC = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, k))).getHexString();
const exitK = (t: number, b: number, d = 0.38) => (t > b ? Math.min(1, (t - b) / d) : 0);

export const S03: React.FC = () => {
  const t = useVideoTime(S0);
  const screens: ScreenSpec[] = [];

  // ================= beat 1: hourglass + coins =================
  const flow = range(t, S0 + 0.3, B1_OUT + 0.3);
  const hgSpin = 0.5 * (t - S0) + wobble(t - (S0 + 0.3), 0.12, 1.2, 0.18);

  // ================= beat 2: patient + one road =================
  const roadOut = exitK(t, B2_OUT);
  const roadS = 1 - range(roadOut, 0, 0.85); // রাস্তা গুটিয়ে নিজের শুরুতে ফেরে
  const segA = range(t, T.joto + 0.05, T.joto + 0.45);
  const segL = range(t, T.site, T.site + 0.35);
  const segR = range(t, T.tato, T.tato + 0.35);
  const segM = range(t, T.rasta, T.ektai + 0.05);
  const deadL = range(t, T.nei, T.nei + 0.3);
  const deadR = range(t, T.tato + 0.45, T.tato + 0.75);
  const midOrange = range(t, T.rasta, T.rasta + 0.3);
  const ring = t > T.phone ? Math.sin((t - T.phone) * 38) * 0.09 * Math.exp(-(t - T.phone) * 2.2) : 0;

  // patient-এর হাতে ফোন (screen DOM overlay) — figure-এর local থেকে world
  const patPop = popIn(t, T.joto, { k: 230, c: 15 });
  const patScale = PAT_S * patPop.s * (1 - backIn(roadOut));
  const armUp = springStep(t - T.rogir, { k: 110, c: 12 });
  const phPop = popIn(t, T.rogir + 0.05, { k: 220, c: 14 }).s;
  const phLocal = new THREE.Vector3(0.2, 0.74 + 0.05 * armUp, 0.42);
  const ph = {
    position: [PAT[0] + phLocal.x * patScale, FLOOR + phLocal.y * patScale, PAT[2] + phLocal.z * patScale] as [number, number, number],
    rotation: [-0.08, -0.25, ring * 0.6] as [number, number, number],
    scale: ((0.4 * PAT_S) / PHONE.h) * phPop * (1 - backIn(roadOut)),
  };
  const phoneOn = t > T.rogir && roadOut < 1 && ph.scale > 0.001;
  if (phoneOn) screens.push(phoneScreen(ph, <CallScreen secs={t} />, { kind: "iphone", opacity: Math.min(1, phPop * 1.5) }));

  // ================= beat 4: tablet =================
  const tabPop = popIn(t, T.design - 0.05, { k: 200, c: 15 }).s;
  const tabOut = exitK(t, B4_OUT);
  const tab = {
    position: [TAB[0], TAB[1] + 0.04 * drift(t, 2), TAB[2]] as [number, number, number],
    rotation: [0.02, -0.14, 0] as [number, number, number],
    scale: TAB_S * tabPop * (1 - backIn(tabOut)),
  };
  const approved = range(t, T.approve, T.approve + 0.35);
  if (t > T.design - 0.05 && tabOut < 1 && tab.scale > 0.001)
    screens.push(tabletScreen(tab, <MockupScreen reveal={range(t, T.design + 0.1, T.mockup + 0.4)} approved={approved} />, { opacity: Math.min(1, tabPop * 1.4) }));

  // ================= beat 5: laptop =================
  const lapPop = springStep(t - T.kajer, { k: 170, c: 16 });
  const lapOut = exitK(t, B5_OUT, 0.4);
  const lapSc = LAP_S * Math.max(0.0001, lapPop) * (1 - backIn(lapOut));
  const lapOpen = tween(t, T.kajer + 0.15, T.kajer + 0.75, 0, 1, expoOut);
  const url =
    typed("javeditsolution", t, T.jit, T.dot - 0.12) +
    (t >= T.dot ? "." : "") +
    typed("com", t, T.com, T.com + 0.25) +
    typed("/services/website-development", t, T.web, T.page + 0.1);
  const lit = [0, 1, 2, 3].map((i) => range(t, T.dhap - 0.1 + i * 0.2, T.dhap + 0.08 + i * 0.2));
  const tick = [0, 1, 2, 3].map((i) => springStep(t - (T.porishkar + i * 0.14), { k: 260, c: 14 }));
  if (t > T.kajer && lapOut < 1 && lapOpen > 0.25) {
    screens.push({
      matrix: laptopScreenMatrix([LAP[0], LAP[1], LAP[2]], 0, lapSc, lapOpen),
      w: LAPTOP.w * 0.94,
      h: LAPTOP.lidH * 0.9,
      px: 1024,
      py: 641,
      radius: 10,
      content: <StepsPage url={url} caret={Math.floor(t * 2.4) % 2 === 0} lit={lit} tick={tick} reveal={range(t, T.kajer + 0.45, T.kajer + 0.8)} />,
      opacity: range(lapOpen, 0.25, 0.6),
    });
  }

  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 1), cam.pos[1] + 0.04 * drift(t, 3), cam.pos[2] - 0.25 * Math.sin(Math.PI * range(t, S0, END))] };

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== beat 1: "সময়ের হিসাবটাও কিন্তু খরচ" ===== */}
      <Life t={t} a={S0 + 0.3} b={B1_OUT} kind="pop" position={HGP} scale={HG_S} rotation={[0, hgSpin, 0]}>
        <Hourglass top={1 - 0.6 * flow} bottom={0.3 + 0.6 * flow} />
      </Life>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Life key={i} t={t} a={T.khoroch - 0.1 + i * 0.08} b={B1_OUT + 0.02 * i} kind="drop" position={[COINP[0], FLOOR + 0.06 * COIN_S + i * 0.118 * COIN_S, COINP[2]]} scale={COIN_S} rotation={[0, i * 0.5, 0]}>
          <Coin />
        </Life>
      ))}
      <Life t={t} a={T.khoroch + 0.2} b={B1_OUT} kind="pop" position={atScreen(0.75, 0.52, 3, cam)} scale={worldWidth(0.36, 3, cam) / 2.6}>
        <Tag text="TIME = MONEY" size={0.28} w={2.6} h={0.56} color={C.deepNavy} />
      </Life>

      {/* ===== beat 2: "যত দিন site নেই … রাস্তা একটাই, ওই ফোন নম্বর" ===== */}
      {t > T.joto && roadOut < 1 && (
        <group>
          <RoadStrip a={[PAT[0] + 0.15, PAT[2] - 0.2]} b={xz(J)} y={FLOOR} k={segA * roadS} color={mixC(ROAD, C.orange, midOrange)} />
          <RoadStrip a={xz(J)} b={xz(LFT)} y={FLOOR} k={segL * roadS} w={0.75} color={mixC(ROAD, GREY, deadL)} lift={-0.012} />
          <RoadStrip a={xz(J)} b={xz(RGT)} y={FLOOR} k={segR * roadS} w={0.75} color={mixC(ROAD, GREY, deadR)} lift={-0.012} />
          <RoadStrip a={xz(J)} b={xz(MID)} y={FLOOR} k={segM * roadS} color={C.orange} lift={0.014} />
        </group>
      )}
      <Life t={t} a={T.site + 0.25} b={B2_OUT} kind="pop" position={LFT} scale={1}>
        <SignBoard w={1.6} h={0.95} post={1.0} color={mixC("#F6F1EA", "#E3E1DE", deadL)}>
          <Txt size={0.24} color={mixC(C.steel, "#9AA3AD", deadL)} position={[0, 0, 0.01]}>
            WEBSITE
          </Txt>
          {t > T.nei && <XBadge position={[0.68, 0.42, 0.06]} scale={0.55 * popIn(t, T.nei, { k: 260, c: 13 }).s} />}
        </SignBoard>
      </Life>
      <Life t={t} a={T.tato + 0.25} b={B2_OUT} kind="pop" position={RGT} scale={1}>
        <SignBoard w={1.6} h={0.95} post={1.0} color={mixC("#F6F1EA", "#E3E1DE", deadR)}>
          <Txt size={0.21} color={mixC(C.steel, "#9AA3AD", deadR)} position={[0, 0, 0.01]}>
            BOOK ONLINE
          </Txt>
          {t > T.tato + 0.45 && <XBadge position={[-0.68, 0.42, 0.06]} scale={0.55 * popIn(t, T.tato + 0.45, { k: 260, c: 13 }).s} />}
        </SignBoard>
      </Life>
      <Life t={t} a={T.ektai} b={B2_OUT} kind="pop" position={MID} scale={1.15} rotation={[0, 0, ring * 0.4]}>
        <SignBoard w={1.9} h={1.9} post={1.15} color="#1F9D55">
          <Handset position={[0, 0.2, 0.05]} scale={1.05} rotation={[0, 0, ring * 2]} />
          <Txt size={0.3} color="#ffffff" position={[0, -0.6, 0.02]}>
            CALL ONLY
          </Txt>
        </SignBoard>
      </Life>
      {t > T.joto - 0.02 && roadOut < 1 && (
        <group position={[PAT[0], FLOOR, PAT[2]]} scale={[patScale * patPop.sx, patScale * patPop.sy, patScale]}>
          <Figure rotationY={0.1} pose={{ armOut: [0, 1.25 * armUp] }} headTilt={-0.12 * armUp} />
        </group>
      )}
      {phoneOn && <Phone {...ph} kind="iphone" />}

      {/* ===== beat 3: "business website … সাত থেকে চোদ্দ দিনে live" ===== */}
      <Life t={t} a={T.business} b={B3_OUT} kind="pop" position={atScreen(0.4, 0.4, 0, cam)} scale={worldWidth(0.58, 0, cam) / 2.2}>
        <BrowserWin build={range(t, T.business + 0.15, T.sat + 0.1)} />
      </Life>
      <Life t={t} a={T.sat - 0.05} b={B3_OUT} kind="pop" position={atScreen(0.76, 0.6, 4, cam)} scale={worldWidth(0.28, 4, cam) / 1.2} rotation={[0, -0.22, 0]}>
        {range(t, T.choddo, T.choddo + 0.4) < 1 ? (
          <Calendar top="DAYS" big="7" nextBig="14" flip={range(t, T.choddo, T.choddo + 0.4)} header={C.navy} />
        ) : (
          <Calendar top="DAYS" big="14" header={C.navy} />
        )}
      </Life>
      <Life t={t} a={T.choddo + 0.3} b={B3_OUT} kind="pop" position={atScreen(0.76, 0.74, 5, cam)} scale={worldWidth(0.3, 5, cam) / 2}>
        <Tag text="7 – 14 DAYS" size={0.3} w={2} h={0.52} color={C.deepNavy} />
      </Life>
      <Life t={t} a={T.live} b={B3_OUT} kind="pop" position={atScreen(0.27, 0.61, 3, cam)} scale={worldWidth(0.22, 3, cam) / 1.6}>
        <Tag text="LIVE" size={0.42} w={1.6} h={0.7} color="#1F9D55" />
      </Life>

      {/* ===== beat 4: "design-এর mockup দেখে approve" ===== */}
      <Life t={t} a={T.majhe} b={B4_OUT} kind="pop" position={[DOC[0], FLOOR, DOC[2]]} scale={DOC_S}>
        <Figure rotationY={0.35} coat="#F6F4F0" pose={{ armOut: [0, 1.1 * springStep(t - T.design, { k: 100, c: 12 })] }} headTilt={0.1 * springStep(t - T.mockup, { k: 90, c: 9 })}>
          <Stethoscope />
        </Figure>
      </Life>
      {t > T.design - 0.05 && tabOut < 1 && tab.scale > 0.001 && <Tablet {...tab} />}
      <Life t={t} a={T.approve} b={B4_OUT} kind="pop" position={atScreen(0.8, 0.29, 3, cam)} scale={worldWidth(0.14, 3, cam)}>
        <CheckBadge />
      </Life>
      <Life t={t} a={T.approve + 0.15} b={B4_OUT} kind="pop" position={atScreen(0.6, 0.66, 4, cam)} scale={worldWidth(0.4, 4, cam) / 2.6}>
        <Tag text="APPROVED" size={0.34} w={2.6} h={0.62} color="#1F9D55" />
      </Life>

      {/* ===== beat 5: "কাজের চারটা ধাপ … javeditsolution dot com … page-এ পরিষ্কার লেখা আছে" ===== */}
      {t > T.kajer && lapOut < 1 && <Laptop position={LAP} scale={lapSc} open={lapOpen} />}
      <Life t={t} a={T.jit} b={B5_OUT} kind="pop" position={atScreen(0.5, 0.16, -1, cam)} scale={worldWidth(0.2, -1, cam) / 2}>
        <LogoMark size={2} />
      </Life>
      <Life t={t} a={T.lekha} b={B5_OUT} kind="pop" position={atScreen(0.82, 0.17, -1, cam)} scale={worldWidth(0.12, -1, cam)}>
        <CheckBadge />
      </Life>
    </Stage>
  );
};
