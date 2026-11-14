// wd004 S08 — cta (231.90–259.4 s): pages→FREE QUOTE · CALL/WHATSAPP + chat phone · receptionist notepad ·
// laptop URL · map Dhaka→Sylhet + logo + phone pill (শেষ frame স্থির end card)
import React from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { useVideoTime } from "../../kit/time";
import { springStep, wobble, popIn, tween, range, emphDecel, drift } from "../../kit/anim";
import { Figure } from "../../kit/Figure";
import { Phone, phoneScreen, PHONE } from "../../kit/Device";
import { LogoMark } from "../../kit/Logo";
import { Tag } from "../../kit/Clock";
import { CheckBadge, SoftPanel, RaisedBar } from "../../kit/Soft";
import { Desk, PriceTag, Laptop, laptopScreenMatrix, PageCard, LAPTOP } from "../../web11/props";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { cue, SCENES } from "../cues";
import { Life, backIn } from "../life";
import { ActionChip, Notepad, NOTE, noteSlotX, Pencil, MapTile, MAP, CtaSite, CtaChat } from "../props/s08";

const cam: Cam = DEFAULT_CAM;
const S0 = SCENES.cta;

const T = {
  chamber: cue("chamber", S0),
  page: cue("page", S0),
  quote: cue("quote", S0),
  free: cue("ফ্রি", S0),
  phone: cue("ফোন", S0),
  whatsapp: cue("WhatsApp", S0),
  number: cue("নম্বর", S0),
  recep: cue("receptionist", S0),
  likhe: cue("লিখে", S0),
  khoroch: cue("খরচের", S0),
  bhag: cue("ভাগ", S0),
  jit: cue("javeditsolution", S0),
  dot: cue("dot", S0),
  com: cue("com", cue("dot", S0)),
  khule: cue("খুলে", S0),
  website: cue("website", S0),
  dev: cue("development", S0),
  jao: cue("যান", S0),
  javed: cue("Javed", cue("যান", S0)),
  mirpur: cue("মিরপুর", S0),
  dhaka: cue("ঢাকা", S0),
  theke: cue("থেকে", cue("ঢাকা", S0)),
  sylhet: cue("Sylhet", S0),
  sara: cue("সারা", S0),
  kaj: cue("কাজ", S0),
};

const NUM = "01616-901396";
/** শব্দ ধরে অঙ্ক — "-" পঞ্চম অঙ্কের পরে */
const digitTimes = (seq: string[], from: number): number[] => {
  let t = from - 0.01;
  const out: number[] = [];
  seq.forEach((w, i) => {
    t = cue(w, t + 0.01);
    out.push(t);
    if (i === 4) out.push(t + 0.22);
  });
  return out;
};
const EN = digitTimes(["zero", "one", "six", "one", "six", "nine", "zero", "one", "three", "nine", "six"], T.number);
const BN = digitTimes(["শূন্য", "এক", "ছয়", "এক", "ছয়", "নয়", "শূন্য", "এক", "তিন", "নয়", "ছয়"], T.likhe);

// ---- layout ----
const CARD_Z = 1.5;
const CHIP_Z = 2;
const PH_P = atScreen(0.5, 0.49, 2.5, cam); // নিচের কিনারা ≈0.685 < floor 0.705
const PH_S = worldWidth(0.34, 2.5, cam) / PHONE.w;
const DESK = atFloor(0.5, 0.78, cam);
const DESK_S = worldWidth(0.6, DESK[2], cam) / 2.4;
const NOTE_P = atScreen(0.5, 0.3, 1, cam);
const NOTE_S = worldWidth(0.78, 1, cam) / NOTE.w;
const LAP = atFloor(0.5, 0.66, cam);
const LAP_S = worldWidth(0.84, LAP[2], cam) / LAPTOP.w;
const LOGO_P = atScreen(0.5, 0.16, 0, cam);
const MAP_P = atScreen(0.5, 0.49, 0.5, cam);
const MAP_S = worldWidth(0.7, 0.5, cam) / MAP.w;
const PILL_F = atFloor(0.5, 0.8, cam);
const PILL_S = worldWidth(0.62, PILL_F[2], cam) / 3.6;
const PILL_P: [number, number, number] = [PILL_F[0], FLOOR + 0.42 * PILL_S, PILL_F[2]];

export const S08: React.FC = () => {
  const t = useVideoTime(S0);
  const screens: ScreenSpec[] = [];

  // ---------------- B1: page cards → stack + FREE QUOTE ----------------
  const gather = tween(t, T.quote - 0.15, T.quote + 0.55, 0, 1, emphDecel);
  const cardsShown = [0, 1, 2, 3, 4, 5].filter((i) => t >= T.chamber + 0.05 + i * 0.22).length;
  const CARDS = ["HOME", "ABOUT", "SERVICES", "FEES", "BOOKING", "CONTACT"];

  // ---------------- B2: chat phone ----------------
  const phIn = popIn(t, T.number - 0.05, { k: 200, c: 15 }).s;
  const phOut = range(t, T.recep - 0.3, T.recep + 0.08);
  const ph = {
    position: [PH_P[0], PH_P[1], PH_P[2]] as [number, number, number],
    rotation: [0.03, 0.06 * Math.sin(t * 0.7), 0] as [number, number, number],
    scale: PH_S * Math.max(0.001, phIn) * (1 - backIn(phOut)),
  };
  const phVis = t > T.number - 0.05 && phOut < 1;
  const typed = EN.filter((at) => t >= at).length;
  if (phVis) screens.push(phoneScreen(ph, <CtaChat typed={NUM.slice(0, typed)} caret={Math.floor(t * 2.4) % 2 === 0} />));

  // ---------------- B3: notepad digits + pencil ----------------
  const shown = NUM.split("").map((_, i) => (t >= BN[i] ? Math.min(1.12, springStep(t - BN[i], { k: 300, c: 16 })) : 0));
  const nWritten = BN.filter((at) => t >= at).length;
  const cw = 0.5 * 0.66;
  const lastAt = nWritten > 0 ? BN[nWritten - 1] : T.likhe;
  const slot = (i: number) => noteSlotX(Math.min(NUM.length - 1, Math.max(0, i)), NUM.length, cw);
  const fromX = nWritten > 1 ? slot(nWritten - 2) : slot(0) - cw;
  const toX = nWritten > 0 ? slot(nWritten - 1) : slot(0) - cw;
  const pencilX = fromX + (toX - fromX) * springStep(t - lastAt, { k: 260, c: 20 }) + cw * 0.5;
  const scribble = t - lastAt < 0.25 && nWritten > 0 ? Math.sin((t - lastAt) * 70) * 0.04 : 0;

  // ---------------- B4: laptop ----------------
  const lapA = T.bhag - 0.1;
  const lapOpen = tween(t, lapA + 0.1, lapA + 0.8, 0, 1, emphDecel);
  const lapIn = popIn(t, lapA, { k: 200, c: 15 }).s;
  const lapOut = range(t, T.jao + 0.1, T.jao + 0.48);
  const lapSc = LAP_S * Math.max(0.001, lapIn) * (1 - backIn(lapOut));
  const lapVis = t > lapA && lapOut < 1;
  const URL1 = "javeditsolution";
  const urlLen =
    t < T.jit
      ? 0
      : t < T.dot
      ? Math.round(URL1.length * range(t, T.jit, T.dot - 0.1))
      : t < T.website
      ? URL1.length + Math.round(4 * range(t, T.dot, T.com + 0.15))
      : URL1.length + 4 + Math.round("/services/website-development".length * range(t, T.website, T.dev + 0.4));
  const url = "javeditsolution.com/services/website-development".slice(0, urlLen);
  if (lapVis && lapOpen > 0.25) {
    screens.push({
      matrix: laptopScreenMatrix([LAP[0], LAP[1], LAP[2]], 0, lapSc, lapOpen),
      w: LAPTOP.w * 0.94,
      h: LAPTOP.lidH * 0.9,
      px: 760,
      py: 438,
      radius: 10,
      content: <CtaSite url={url} caret={Math.floor(t * 2.4) % 2 === 0} load={range(t, T.khule, T.khule + 0.5) * (t < T.dev ? 1 : 0) + range(t, T.dev, T.dev + 0.5)} reveal={range(t, T.khule + 0.35, T.website + 0.5)} />,
      opacity: range(lapOpen, 0.25, 0.6),
    });
  }

  // ---------------- camera: হালকা drift, শেষে পুরো স্থির ----------------
  const settle = 1 - range(t, T.kaj - 0.4, T.kaj + 0.6);
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 2) * settle, cam.pos[1] + 0.04 * drift(t, 5) * settle, cam.pos[2]] };

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== B1: page cards (counted) → gathered stack ===== */}
      {CARDS.map((lbl, i) => {
        const col = i % 3,
          row = Math.floor(i / 3);
        const grid = atScreen(0.22 + col * 0.28, 0.32 + row * 0.24, CARD_Z, cam);
        const stack = atScreen(0.5 + (i - 2.5) * 0.035, 0.3 - (i - 2.5) * 0.006, CARD_Z - 0.4 + i * 0.12, cam);
        const p = new THREE.Vector3(...grid).lerp(new THREE.Vector3(...stack), gather);
        const at = T.chamber + 0.05 + i * 0.22;
        return (
          <Life key={lbl} t={t} a={at} b={T.free + 0.05 + i * 0.02} kind="pop" position={p.toArray() as [number, number, number]} scale={(worldWidth(0.22 - 0.03 * gather, CARD_Z, cam) / 1.0)} rotation={[0, 0, gather * (i - 2.5) * 0.07]}>
            <PageCard label={lbl} check={t > at + 0.25 ? springStep(t - at - 0.25, { k: 260, c: 14 }) : 0} accent={[C.steel, C.navy, C.orange][i % 3]} />
          </Life>
        );
      })}
      <Life t={t} a={T.chamber + 0.1} b={T.free + 0.1} kind="pop" position={new THREE.Vector3(...atScreen(0.5, 0.7, 4, cam)).lerp(new THREE.Vector3(...atScreen(0.5, 0.47, 2.5, cam)), gather).toArray() as [number, number, number]} scale={worldWidth(0.36, 4 - 1.5 * gather, cam) / 2.4}>
        <Tag text={`${Math.max(1, cardsShown)} PAGE${cardsShown > 1 ? "S" : ""}`} size={0.36} w={2.4} h={0.66} color={C.deepNavy} />
      </Life>
      <Life t={t} a={T.quote} b={T.number - 0.5} kind="pop" position={atScreen(0.53, 0.64, 3, cam)} scale={worldWidth(0.78, 3, cam) / 4.4} rotation={[0, 0, wobble(t - T.free, 0.07, 1.4, 0.14)]}>
        <PriceTag text="FREE QUOTE" sub="FOR YOUR PAGES" w={4.4} h={1.2} />
        {t > T.free && <CheckBadge position={[2.05, 0.52, 0.12]} scale={0.62 * Math.min(1.1, springStep(t - T.free, { k: 280, c: 13 }))} color={C.navy} />}
      </Life>

      {/* ===== B2: CALL / WHATSAPP chips + chat phone ===== */}
      <Life t={t} a={T.phone} b={T.recep - 0.3} kind="pop" position={atScreen(0.28, 0.17, CHIP_Z, cam)} scale={worldWidth(0.4, CHIP_Z, cam) / 2.4}>
        <ActionChip label="CALL" color={C.navy} icon="phone" />
      </Life>
      <Life t={t} a={T.whatsapp} b={T.recep - 0.26} kind="pop" position={atScreen(0.72, 0.17, CHIP_Z, cam)} scale={worldWidth(0.4, CHIP_Z, cam) / 2.4}>
        <ActionChip label="WHATSAPP" color="#1F9D55" icon="chat" />
      </Life>
      {phVis && <Phone {...ph} />}

      {/* ===== B3: reception desk + receptionist + notepad ===== */}
      <Life t={t} a={T.recep} b={T.bhag - 0.35} kind="rise" exit="sink" position={DESK} scale={DESK_S}>
        <Figure position={[0, 0, -0.7]} scale={1.85} pose={{ type: nWritten > 0 && t - lastAt < 0.4 ? 1 : 0.75, typePhase: t, lean: 0.12 }} headTilt={0.06 * Math.sin(t * 1.3)} />
        <Desk w={2.2} />
        <SoftPanel position={[0.1, 1.1, 0.05]} rotation={[-Math.PI / 2, 0, 0.15]} w={0.62} h={0.44} thick={0.06} color="#FBF7F0">
          <RaisedBar position={[0, 0.15, 0]} w={0.56} h={0.08} d={0.02} color={C.orange} />
        </SoftPanel>
      </Life>
      <Life t={t} a={T.likhe - 0.1} b={T.bhag - 0.3} kind="pop" position={NOTE_P} scale={NOTE_S} rotation={[-0.08, 0, 0]}>
        <Notepad chars={NUM.split("")} shown={shown} />
        {t > T.likhe + 0.2 && (
          <group position={[pencilX + scribble, -NOTE.h * 0.06 - 0.34 + Math.abs(scribble) * 2, 0.45]} rotation={[0.35, 0, -0.55]} scale={Math.max(0.001, Math.min(1, springStep(t - T.likhe - 0.2, { k: 220, c: 15 })) * (1 - backIn(range(t, BN[BN.length - 1] + 0.4, BN[BN.length - 1] + 0.75))))}>
            <Pencil />
          </group>
        )}
      </Life>

      {/* ===== B4: laptop (pop, floor-এর উপরে) ===== */}
      {lapVis && <Laptop position={[LAP[0], LAP[1], LAP[2]]} scale={lapSc} open={lapOpen} />}

      {/* ===== B5: logo + map + phone pill — end card ===== */}
      <Life t={t} a={T.javed} kind="pop" position={LOGO_P} scale={worldWidth(0.3, 0, cam) / 2}>
        <LogoMark size={2} />
      </Life>
      <Life t={t} a={T.mirpur - 0.15} kind="pop" position={MAP_P} scale={MAP_S}>
        <MapTile t={t} dhakaAt={T.mirpur + 0.1} dhakaTagAt={T.dhaka} arc={range(t, T.theke, T.sylhet + 0.3)} sylhetAt={T.sylhet} sylhetTagAt={T.sylhet + 0.25} />
      </Life>
      <Life t={t} a={T.kaj - 0.1} kind="pop" position={PILL_P} scale={PILL_S}>
        <ActionChip label="01616-901396" color={C.orange} icon="phone" w={3.6} h={0.8} size={0.34} />
      </Life>
    </Stage>
  );
};
