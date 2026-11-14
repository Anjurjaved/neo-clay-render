// wd004 S07 — faq (213.78–231.90 s): "treatment-এর দাম কি site-এ দেওয়া উচিত?"
// B1 phone-এ fee page (নির্দিষ্ট দাম কাটা → range) · B2 বড় ROOT CANAL card + "Final after check-up"
// B3 রোগী নিশ্চিন্তে চেম্বারে, missed-call badge 30 → 6 · B4 JIT logo + TREATMENTS / SERIAL FORM card ✓
import React from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { useVideoTime } from "../../kit/time";
import { springStep, popIn, tween, range, smoothstep, emphDecel, drift, pathDistance, speedAt, headingAt } from "../../kit/anim";
import { Shop, SHOP } from "../../kit/Shop";
import { Figure } from "../../kit/Figure";
import { Phone, phoneScreen, PHONE } from "../../kit/Device";
import { LogoMark } from "../../kit/Logo";
import { Tag } from "../../kit/Clock";
import { Tooth, BrowserWin } from "../../web11/props";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { cue, SCENES } from "../cues";
import { Life, backIn } from "../life";
import { TreatmentFeesScreen, FeeCard, TreatmentsCard, SerialFormCard, CallBadge } from "../props/s07";

const cam: Cam = DEFAULT_CAM;
const S0 = SCENES.faq;
const END = SCENES.cta;

const T = {
  treat: cue("treatment-এর", S0),
  site: cue("site-এ", S0),
  na: cue("না", cue("নির্দিষ্ট", S0)),
  andaj: cue("আন্দাজের", S0),
  range: cue("range", S0),
  likhun: cue("লিখুন", S0),
  checkup: cue("check-up", S0),
  ete: cue("এতে", S0),
  rogi: cue("রোগী", S0),
  prostut: cue("প্রস্তুত", S0),
  ar: cue("আর", cue("আসেন", S0)),
  fon: cue("ফোনও", S0),
  kome: cue("কমে", S0),
  javed: cue("Javed", S0),
  chamber: cue("chamber-এর", cue("Javed", S0)),
  treat2: cue("treatment", cue("Javed", S0)),
  serial: cue("serial", S0),
  duto: cue("দুটোই", S0),
};
const OUT = END - 0.55; // সব বস্তু এখানে বেরোতে শুরু (outDur 0.38 → END-এর ≥0.15 s আগে শেষ)

// ---- layout ----
const PH_BIG = atScreen(0.5, 0.42, 3, cam);
const PH_SMALL = atScreen(0.25, 0.25, 3, cam);
const SC_BIG = worldWidth(0.44, 3, cam) / PHONE.w;
const SC_SMALL = worldWidth(0.3, 3, cam) / PHONE.w;
const CARD = atScreen(0.55, 0.6, 4, cam);
const SHOP_P = atFloor(0.63, 0.6, cam);
const SHOP_S = worldWidth(0.44, SHOP_P[2], cam) / SHOP.w;
const BADGE = atScreen(0.2, 0.25, 2, cam);
const LOGO = atScreen(0.5, 0.17, 0, cam);
const WIN = atScreen(0.5, 0.5, 3, cam);
const PC_L = atScreen(0.29, 0.56, 4, cam);
const PC_R = atScreen(0.71, 0.56, 4, cam);

export const S07: React.FC = () => {
  const t = useVideoTime(S0);
  const screens: ScreenSpec[] = [];

  // ---------- B1/B2 phone ----------
  const phA = T.treat + 0.3;
  const phB = T.ete - 0.15; // বেরোনো শুরু
  const small = tween(t, T.andaj - 0.1, T.andaj + 0.5, 0, 1, emphDecel);
  const phP = new THREE.Vector3(...PH_BIG).lerp(new THREE.Vector3(...PH_SMALL), small);
  const phIn = popIn(t, phA, { k: 200, c: 15 });
  const phOut = t > phB ? Math.min(1, (t - phB) / 0.38) : 0;
  const phSc = (SC_BIG + (SC_SMALL - SC_BIG) * small) * phIn.s * (1 - backIn(phOut));
  const ph = {
    position: [phP.x + 0.04 * drift(t, 2), phP.y + 0.03 * Math.sin(t * 1.1), phP.z] as [number, number, number],
    rotation: [0.03, -0.12 + 0.2 * small + 0.03 * drift(t, 5), 0] as [number, number, number],
    scale: Math.max(0.001, phSc),
  };
  const phoneVis = t > phA - 0.02 && phOut < 1;
  if (phoneVis) {
    screens.push(
      phoneScreen(
        ph,
        <TreatmentFeesScreen
          rows={range(t, T.site - 0.1, T.site + 0.6)}
          strike={range(t, T.na, T.na + 0.35)}
          ranged={range(t, T.range, T.range + 0.35)}
          focus={range(t, T.range + 0.2, T.range + 0.6)}
          note={range(t, T.likhun, T.likhun + 0.4)}
        />,
        { opacity: Math.min(1, phIn.s * 1.3) }
      )
    );
  }

  // ---------- B3 patient ----------
  const walkA = T.rogi - 0.1;
  const walkB = T.prostut + 0.05;
  const pPath = (u: number): [number, number] => {
    const a = atFloor(-0.12, 0.74, cam),
      b = atFloor(0.36, 0.72, cam);
    const k = smoothstep(walkA, walkB, u);
    return [a[0] + (b[0] - a[0]) * k, a[2] + (b[2] - a[2]) * k];
  };
  const [px, pz] = pPath(t);
  const pWalk = Math.min(1, speedAt(pPath, t) / 1.0);
  const pDist = pathDistance(pPath, walkA, t);
  const pScale = worldWidth(0.2, pz, cam) / 0.42;
  const arrived = range(t, walkB - 0.1, walkB + 0.4);
  const pFace = headingAt(pPath, Math.min(t, walkB - 0.05), Math.PI / 2) * (1 - arrived) + 0.35 * arrived;
  const cheer = Math.sin(Math.PI * range(t, T.prostut + 0.2, T.ar + 0.6)) * 0.9;

  // ---------- badge count ----------
  const n = Math.round(tween(t, T.fon + 0.1, T.kome + 0.45, 30, 6, (x) => x * x * (3 - 2 * x)));
  const calm = range(t, T.kome, T.kome + 0.5);

  // camera: হালকা drift
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 1), cam.pos[1] + 0.04 * drift(t, 3), cam.pos[2] - 0.25 * Math.sin(Math.PI * range(t, S0, END))] };

  const b3Out = T.javed - 0.3;

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== B1/B2: phone body ===== */}
      {phoneVis && <Phone {...ph} />}

      {/* ===== B2: fee card ===== */}
      <Life t={t} a={T.range} b={phB} kind="pop" position={CARD} scale={worldWidth(0.78, CARD[2], cam) / 4.0}>
        <FeeCard note={range(t, T.likhun, T.likhun + 0.45)} rotation={[0, -0.06 + 0.02 * drift(t, 7), 0]} />
      </Life>

      {/* ===== B3: chamber + calm patient + missed-call badge ===== */}
      <Life t={t} a={phB + 0.36} b={b3Out} kind="rise" exit="sink" position={SHOP_P} scale={SHOP_S}>
        <Shop label="DENTAL CHAMBER" signColor={C.navy} open={0.62} light={1}>
          <Tooth position={[0, SHOP.h + 0.02, 0.1]} scale={0.9} rotation={[0, 0.3, 0]} />
        </Shop>
      </Life>
      {t > walkA && t < b3Out + 0.42 && (
        <Life t={t} a={walkA} b={b3Out} kind="pop" exit="shrink" position={[px, FLOOR, pz]} scale={pScale}>
          <Figure rotationY={pFace} pose={{ dist: pDist, walk: pWalk, cheer: Math.max(0, cheer) }} />
        </Life>
      )}
      <Life t={t} a={T.ar} b={b3Out} kind="pop" position={BADGE} scale={worldWidth(0.2, BADGE[2], cam) / 1.0}>
        <CallBadge n={n} calm={calm} />
      </Life>
      <Life t={t} a={T.ar + 0.2} b={b3Out} kind="pop" position={atScreen(0.2, 0.345, 2, cam)} scale={worldWidth(0.3, 2, cam) / 2.4}>
        <Tag text="PRICE-ONLY CALLS" size={0.2} w={2.4} h={0.42} color={C.deepNavy} />
      </Life>

      {/* ===== B4: JIT logo + site + two page cards ===== */}
      <Life t={t} a={T.javed} b={OUT} kind="pop" exit="up" position={LOGO} scale={worldWidth(0.3, LOGO[2], cam) / 2}>
        <LogoMark size={2} />
      </Life>
      <Life t={t} a={T.javed + 0.35} b={T.treat2 - 0.1} kind="pop" position={WIN} scale={worldWidth(0.66, WIN[2], cam) / 2.2}>
        <BrowserWin build={range(t, T.javed + 0.5, T.treat2 - 0.2)} />
      </Life>
      <Life t={t} a={T.treat2} b={OUT} kind="pop" position={PC_L} scale={worldWidth(0.36, PC_L[2], cam) / 1.5} rotation={[0, 0.12, 0]}>
        <TreatmentsCard check={t > T.duto ? springStep(t - T.duto, { k: 260, c: 14 }) : 0} />
      </Life>
      <Life t={t} a={T.serial} b={OUT} kind="pop" position={PC_R} scale={worldWidth(0.36, PC_R[2], cam) / 1.5} rotation={[0, -0.12, 0]}>
        <SerialFormCard check={t > T.duto + 0.18 ? springStep(t - T.duto - 0.18, { k: 260, c: 14 }) : 0} />
      </Life>
    </Stage>
  );
};
