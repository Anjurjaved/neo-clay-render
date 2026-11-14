// wd004 S01 — title + answer (0.18–45.7 s) · web11-এর গল্প, সময় = full audio-র cue
import React from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { FPS } from "../../kit/time";
import { springStep, wobble, popIn, tween, range, smoothstep, expoOut, emphDecel, standard, drift, pathDistance, speedAt, headingAt, cubicBezier } from "../../kit/anim";
import { Shop, SHOP } from "../../kit/Shop";
import { Figure } from "../../kit/Figure";
import { Phone, phoneScreen, PHONE } from "../../kit/Device";
import { LogoMark } from "../../kit/Logo";
import { Tag } from "../../kit/Clock";
import { Txt } from "../../kit/Clay";
import { Pedestal } from "../../web11/pedestal";
import { Tooth, MapPin, Calendar, Desk, Chair, StandSign, Coin, PriceTag, Jar, ReceiptPrinter, Laptop, laptopScreenMatrix, BrowserWin, Globe, Server, PageCard, Stethoscope } from "../../web11/props";
import { roundedCylGeo } from "../../kit/Geo";
import { MissedCalls, DentalSite, ChatScreen } from "../../web11/screens";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { cue } from "../cues";
import { Life, backIn } from "../life";

const cam: Cam = DEFAULT_CAM;
const BADGE_GEO = roundedCylGeo(0.5, 0.26, 0.11);

// ---- key word times (audio/words.json) ----
const A = 20.0; // answer scene-এর আশেপাশে
const T = {
  sylhet: cue("Sylhet"), zinda: cue("জিন্দাবাজারে"), chamber: cue("chamber"), friday: cue("শুক্রবার"), recep: cue("receptionist"), leave: cue("ছুটিতে"),
  ar: cue("আর", cue("ছুটিতে")), phone: cue("ফোন"), khule: cue("খুলে"), thirty: cue("তিরিশটা"), missed: cue("missed"),
  doctor: cue("ডাক্তার"), thik: cue("ঠিক"), website: cue("website"), kintu: cue("কিন্তু"), prothom: cue("প্রথম"), khoroch: cue("খরচটা"), koto: cue("কত"),
  aj: cue("আজ"), protita: cue("প্রতিটা"), hishab: cue("হিসাব"), ekbar: cue("একবারই"), protiBochor: cue("প্রতি", cue("একবারই")),
  sylhet2: cue("Sylhet", A), javed: cue("Javed", A), business: cue("business", A), cost: cue("খরচ", cue("business", A)), ponero: cue("পনেরো", A),
  tirish: cue("তিরিশ", cue("পনেরো", A)), taka: cue("টাকা", cue("তিরিশ", cue("পনেরো", A))), sat: cue("সাত", A), choddo: cue("চোদ্দ", A), shesh: cue("শেষ", A),
  er: cue("এর", cue("শেষ", A)), bochor2: cue("বছর", cue("শেষ", A)), domain: cue("domain", A), hosting: cue("hosting", A), dui: cue("দুই", A), panch: cue("পাঁচ", A),
  apnar: cue("আপনার", A), page: cue("page", A), konta: cue("কোনটা", cue("page", A)), bad: cue("বাদ", A), cholbe: cue("চলে", cue("বাদ", A)), jante: cue("জানতে", A), whatsapp: cue("WhatsApp", A),
};
const ZW = cue("zero", A);
const DIGITS: [string, number][] = (() => {
  const seq = ["zero", "one", "six", "one", "six", "nine", "zero", "one", "three", "nine", "six"];
  const map: Record<string, string> = { zero: "0", one: "1", six: "6", nine: "9", three: "3" };
  let t = ZW - 0.01;
  const out: [string, number][] = [];
  seq.forEach((w, i) => {
    t = cue(w, t + 0.01);
    out.push([map[w], t]);
    if (i === 4) out.push(["-", t + 0.2]);
  });
  return out;
})();

// ---- layout ----
const CH_A = atFloor(0.42, 0.64, cam);
const CH_B = atFloor(0.27, 0.52, cam);
const CH_SA = worldWidth(0.5, CH_A[2], cam) / SHOP.w;
const CH_SB = worldWidth(0.34, CH_B[2], cam) / SHOP.w;
const PIN = atFloor(0.83, 0.6, cam);
const DESK = atFloor(0.6, 0.74, cam);
const CAL = atScreen(0.76, 0.27, 0, cam);

export const S01: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const screens: ScreenSpec[] = [];

  // ---------------- S1 chamber ----------------
  const chGlide = tween(t, T.friday, T.friday + 0.6, 0, 1, emphDecel);
  const chPos: [number, number, number] = [CH_A[0] + (CH_B[0] - CH_A[0]) * chGlide, CH_A[1], CH_A[2] + (CH_B[2] - CH_A[2]) * chGlide];
  const chS = CH_SA + (CH_SB - CH_SA) * chGlide;

  // ---------------- S3 phone ----------------
  // desk-এ শুয়ে থাকা → দাঁড়িয়ে ক্যামেরার দিকে, তারপর S4-এ ডানে সরে
  const stand = springStep(t - T.phone, { k: 120, c: 13 });
  const toRight = tween(t, T.doctor, T.doctor + 0.7, 0, 1, emphDecel);
  const phLying = new THREE.Vector3(DESK[0] - 0.3, FLOOR + 1.05 * (worldWidth(0.42, DESK[2], cam) / 2.4) + 0.06, DESK[2] + 0.1);
  const phUp = new THREE.Vector3(...atScreen(0.6, 0.43, 3, cam));
  const phRight = new THREE.Vector3(...atScreen(0.7, 0.45, 2, cam));
  const phP = phLying.clone().lerp(phUp, stand).lerp(phRight, toRight);
  const shake = t > T.thirty + 0.14 && t < T.thirty + 0.84 ? Math.sin(t * 90) * 0.04 * (1 - range(t, T.thirty + 0.14, T.thirty + 0.84)) : 0;
  const ph = {
    position: [phP.x + shake, phP.y, phP.z] as [number, number, number],
    rotation: [(-Math.PI / 2 + 0.05) * (1 - stand) + 0.04 * stand, -0.25 * toRight, shake * 2] as [number, number, number],
    scale: (0.55 + 0.75 * stand) * (1 - 0.3 * toRight),
  };
  const phoneVis = t > T.ar - 0.1 && t < T.kintu + 0.5;
  const phoneOut = t > T.kintu ? Math.min(1, (t - T.kintu) / 0.4) : 0;
  const missed = tween(t, T.khule, T.thirty + 0.15, 0, 30, (x) => x * x * (3 - 2 * x));
  if (phoneVis && phoneOut < 1) {
    screens.push(phoneScreen({ ...ph, scale: ph.scale * (1 - backIn(phoneOut)) }, <MissedCalls count={missed} t={t} />, { opacity: Math.min(1, stand * 1.4) }));
  }

  // ---------------- S4 doctor ----------------
  const docPath = (u: number): [number, number] => {
    const a = atFloor(-0.15, 0.7, cam),
      b = atFloor(0.36, 0.7, cam);
    const k = smoothstep(T.doctor, T.doctor + 1.0, u);
    return [a[0] + (b[0] - a[0]) * k, a[2] + (b[2] - a[2]) * k];
  };
  const [dx, dz] = docPath(t);
  const docWalk = Math.min(1, speedAt(docPath, t) / 1.0);
  const docDist = pathDistance(docPath, T.doctor, t);
  const docScale = worldWidth(0.2, dz, cam) / 0.42;
  const docTilt = springStep(t - T.prothom, { k: 90, c: 9 }) * 0.22 * (1 - range(t, T.aj - 0.3, T.aj));
  const docFace = headingAt(docPath, t, 0.35);

  // ---------------- S7 laptop ----------------
  const LAP = atFloor(0.5, 0.6, cam);
  const lapS = worldWidth(0.66, LAP[2], cam) / 2.6;
  const lapOpen = tween(t, T.business, T.business + 0.8, 0, 1, expoOut);
  const lapRaise = tween(t, T.ponero - 0.1, T.ponero + 0.5, 0, 1, emphDecel); // price tag-এর জন্য পিছনে সরে
  const lapLeft = tween(t, T.sat - 0.1, T.sat + 0.5, 0, 1, emphDecel);
  const lapPos: [number, number, number] = [LAP[0] - lapLeft * 1.1, LAP[1], LAP[2] - lapRaise * 3.5];
  const lapOut = t > T.er ? Math.min(1, (t - T.er) / 0.4) : 0;
  const lapIn = springStep(t - (T.business - 0.25), { k: 120, c: 14 });
  const lapSc = lapS * (1 - backIn(lapOut));
  if (t > T.business - 0.25 && lapOut < 1 && lapOpen > 0.25) {
    const lapY = FLOOR - (1 - lapIn) * 3;
    screens.push({
      matrix: laptopScreenMatrix([lapPos[0], lapY, lapPos[2]], 0, lapSc, lapOpen),
      w: 2.6 * 0.94,
      h: 1.7 * 0.9,
      px: 1024,
      py: 590,
      radius: 10,
      content: <DentalSite reveal={range(t, T.business + 0.3, T.cost + 0.6)} />,
      opacity: range(lapOpen, 0.25, 0.6),
    });
  }

  // ---------------- S11 chat phone ----------------
  const chatIn = springStep(t - T.jante, { k: 110, c: 13 });
  const chatP = atScreen(0.5, 0.47, 2.5, cam);
  const chat = {
    position: [chatP[0], chatP[1] - (1 - chatIn) * 0.6, chatP[2]] as [number, number, number],
    rotation: [0.03, 0.12 * Math.sin(t * 0.6) * 0.3, 0] as [number, number, number],
    scale: (worldWidth(0.38, chatP[2], cam) / PHONE.w) * Math.max(0.001, popIn(t, T.jante, { k: 200, c: 15 }).s),
  };
  const typedNum = DIGITS.filter(([, at]) => t >= at).map(([d]) => d).join("");
  const chatOut = range(t, 45.1, 45.55);
  chat.scale *= 1 - backIn(chatOut);
  if (t > T.jante - 0.05 && chatOut < 1) screens.push(phoneScreen(chat, <ChatScreen typed={typedNum} caret={Math.floor(t * 2.4) % 2 === 0} sent={range(t, T.whatsapp + 0.2, T.whatsapp + 0.6)} />));

  // camera: সামান্য জীবন্ত drift + beat-এ ধীর push
  const push = 0.6 * Math.sin(Math.PI * range(t, 0, 45.6));
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 1), cam.pos[1] + 0.04 * drift(t, 3), cam.pos[2] - push] };

  // coin jars
  const JAR_L = atFloor(0.25, 0.74, cam);
  const JAR_R = atFloor(0.75, 0.74, cam);
  const jarS = worldWidth(0.3, JAR_L[2], cam) / 1.7;
  const jarSlide = tween(t, T.sylhet2, T.sylhet2 + 0.6, 0, 1, emphDecel); // S7-এ কোণে ছোট হয়ে যায়
  const jarFocusR = tween(t, T.er, T.er + 0.6, 0, 1, emphDecel); // S9-এ EVERY YEAR মাঝখানে বড়
  const JL_corner = atFloor(0.17, 0.87, cam),
    JR_corner = atFloor(0.83, 0.87, cam),
    JR_center = atFloor(0.5, 0.74, cam);
  const JL_back = atFloor(0.2, 0.8, cam);
  const jl = new THREE.Vector3(...JL_back);
  const jr = new THREE.Vector3(...JAR_R).lerp(new THREE.Vector3(...JR_corner), jarSlide).lerp(new THREE.Vector3(...JR_center), jarFocusR);
  const jlFill = 0.25 * range(t, T.taka, T.taka + 0.8) + 0.2 * range(t, T.ekbar + 0.3, T.ekbar + 0.9);
  const jrFill = 0.15 * range(t, T.protiBochor + 0.3, T.protiBochor + 0.9) + 0.3 * range(t, T.hosting + 0.3, T.dui);

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== S1: dental chamber + map pin ===== */}
      <Life t={t} a={0.12} b={T.doctor - 0.1} kind="rise" exit="sink" position={chPos} scale={chS}>
        <Shop label="DENTAL CHAMBER" signColor={C.navy} open={0} light={0}>
          <Tooth position={[0, SHOP.h + 0.02, 0.1]} scale={0.9} rotation={[0, 0.3, 0]} />
        </Shop>
      </Life>
      <Life t={t} a={T.zinda} b={T.friday - 0.05} kind="drop" exit="shrink" position={PIN} scale={worldWidth(0.12, PIN[2], cam) / 0.6}>
        <MapPin />
      </Life>
      <Life t={t} a={T.zinda + 0.35} b={T.friday - 0.05} kind="pop" position={atScreen(0.78, 0.66, 2.5, cam)} scale={worldWidth(0.34, 2.5, cam) / 2.4}>
        <Tag text="Zindabazar, Sylhet" size={0.2} w={2.4} h={0.38} color={C.deepNavy} />
      </Life>

      {/* ===== S2: reception desk, empty chair, FRIDAY ===== */}
      <Life t={t} a={T.friday} b={T.doctor - 0.15} kind="rise" exit="sink" position={DESK} scale={worldWidth(0.42, DESK[2], cam) / 2.4}>
        <group rotation={[0, -0.55, 0]}>
          <Chair position={[0.3, 0, -1.0]} scale={1.15} spin={0.9 * wobble(t - T.recep, 1, 0.8, 0.16)} />
          <Desk w={2.0} />
          {t > T.leave && <StandSign text="ON LEAVE" position={[-0.35, 1.25 + Math.max(0, 1 - springStep(t - T.leave, { k: 260, c: 12 })) * 2.5, 0.25]} rotation={[-0.15, 0.2, wobble(t - T.leave - 0.15, 0.25, 1.8, 0.15)]} />}
        </group>
      </Life>
      <Life t={t} a={T.friday} b={T.ar + 0.1} kind="pop" position={CAL} scale={worldWidth(0.24, 0, cam) / 1.2}>
        <Calendar top="FRIDAY" big="OFF" />
      </Life>

      {/* ===== S3: phone (body; screen = overlay) + "30" badge ===== */}
      {phoneVis && phoneOut < 1 && <Phone {...ph} scale={ph.scale * (1 - backIn(phoneOut))} />}
      <Life t={t} a={T.thirty} b={T.doctor} kind="pop" position={atScreen(0.68, 0.24, 3.2, cam)} scale={worldWidth(0.16, 3.2, cam) / 1.0}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]} geometry={BADGE_GEO}>
          <meshPhysicalMaterial color={C.deepOrange} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.4} sheenColor="#ffd0b0" />
        </mesh>
        <Txt size={0.44} color="#ffffff" position={[0, -0.01, 0.14]}>
          {String(Math.min(30, Math.max(1, Math.round(missed))))}
        </Txt>
      </Life>

      {/* ===== S4: doctor + browser window from phone ===== */}
      {t > T.doctor && t < T.aj + 0.5 && (
        <Life t={t} a={T.doctor} b={T.aj} kind="pop" exit="shrink" position={[dx, FLOOR, dz]} scale={docScale}>
          <Figure rotationY={docFace} coat="#F6F4F0" headTilt={docTilt} pose={{ dist: docDist, walk: docWalk }}>
            <Stethoscope />
          </Figure>
        </Life>
      )}
      <Life t={t} a={T.website} b={T.aj} kind="pop" position={atScreen(0.5, 0.25, 0, cam)} scale={worldWidth(0.6, 0, cam) / 2.2}>
        <BrowserWin build={range(t, T.website + 0.15, T.kintu - 0.1)} />
      </Life>

      {/* ===== S5: coins + "BDT ?" ===== */}
      {[0, 1, 2, 3, 4].map((i) => {
        const at = T.khoroch + i * 0.09;
        const base = atFloor(0.68, 0.72, cam);
        const s = worldWidth(0.2, base[2], cam) / 0.72;
        return (
          <Life key={i} t={t} a={at} b={T.aj} kind="drop" position={[base[0], FLOOR + 0.06 * s + i * 0.115 * s, base[2]]} scale={s} rotation={[0, i * 0.4, 0]}>
            <Coin />
          </Life>
        );
      })}
      <Life t={t} a={T.khoroch + 0.25} b={T.aj} kind="pop" position={atScreen(0.66, 0.5, 1, cam)} scale={worldWidth(0.4, 1, cam) / 2.8} rotation={[0, 0, wobble(t - T.koto, 0.12, 1.4, 0.12)]}>
        <PriceTag text="BDT ?" w={2.8} h={1.0} />
      </Life>

      {/* ===== S6: receipt printer + jars ===== */}
      <Life t={t} a={T.aj + 0.1} b={T.sylhet2} kind="rise" exit="sink" position={atFloor(0.5, 0.64, cam)} scale={worldWidth(0.36, atFloor(0.5, 0.64, cam)[2], cam) / 1.5}>
        <ReceiptPrinter out={range(t, T.protita, T.ekbar - 0.1)} rows={["Design", "Pages", "Domain", "Hosting", "SSL", "Support"]} />
      </Life>
      <Life t={t} a={T.ekbar} b={T.sylhet2} kind="pop" position={JAR_L} scale={jarS}>
        <Jar label="ONE-TIME" color={C.navy} fill={jlFill} />
      </Life>
      <Life t={t} a={T.ponero + 0.4} b={T.er} kind="pop" position={JL_back} scale={jarS * 0.8}>
        <Jar label="ONE-TIME" color={C.navy} fill={jlFill} />
      </Life>
      <Life t={t} a={T.protiBochor} b={T.sylhet2} kind="pop" position={JAR_R} scale={jarS}>
        <Jar label="EVERY YEAR" color={C.orange} loop fill={jrFill} />
      </Life>
      <Life t={t} a={T.er + 0.05} b={T.apnar - 0.1} kind="pop" position={JR_center} scale={jarS * 1.2}>
        <Jar label="EVERY YEAR" color={C.orange} loop fill={jrFill} />
      </Life>

      {/* ===== S7: চেম্বার আবার ("Sylhet বা ঢাকার একটা dental chamber-এর জন্য"), তারপর JIT logo + laptop ===== */}
      <Life t={t} a={T.sylhet2 + 0.1} b={T.javed - 0.25} kind="rise" exit="sink" position={atFloor(0.5, 0.62, cam)} scale={worldWidth(0.42, atFloor(0.5, 0.62, cam)[2], cam) / SHOP.w}>
        <Shop label="DENTAL CHAMBER" signColor={C.navy} open={tween(t, T.sylhet2 + 0.5, T.sylhet2 + 1.1, 0, 0.62, expoOut)} light={tween(t, T.sylhet2 + 0.5, T.sylhet2 + 1.0, 0, 1, expoOut)}>
          <Tooth position={[0, SHOP.h + 0.02, 0.1]} scale={0.9} rotation={[0, 0.3, 0]} />
        </Shop>
      </Life>
      <Life t={t} a={T.javed - 0.15} b={T.business} kind="rise" exit="sink" position={atFloor(0.5, 0.62, cam)} scale={worldWidth(0.44, atFloor(0.5, 0.62, cam)[2], cam) / 2.8}>
        <Pedestal />
      </Life>
      <Life t={t} a={T.javed} b={T.er} kind="pop" exit="up" position={new THREE.Vector3(...atScreen(0.5, 0.43, 0, cam)).lerp(new THREE.Vector3(...atScreen(0.5, 0.13, -1, cam)), tween(t, T.business, T.business + 0.6, 0, 1, emphDecel)).toArray() as [number, number, number]} scale={worldWidth(0.42 - 0.2 * tween(t, T.business, T.business + 0.6, 0, 1, emphDecel), 0, cam) / 2}>
        <LogoMark size={2} />
      </Life>
      {t > T.business - 0.25 && lapOut < 1 && <Laptop position={[lapPos[0], FLOOR - (1 - lapIn) * 3, lapPos[2]]} scale={lapSc} open={lapOpen} />}

      {/* ===== S8: price + delivery calendar + LIVE ===== */}
      <Life t={t} a={T.ponero} b={T.sat} kind="pop" position={atScreen(0.5, 0.58, 3, cam)} scale={worldWidth(0.8, 3, cam) / 4.2} rotation={[0, 0, wobble(t - T.ponero - 0.2, 0.06, 1.3, 0.12)]}>
        <PriceTag text={t < T.tirish ? "BDT 15,000" : "BDT 15,000 – 30,000"} sub="ONE-TIME" w={4.2} h={1.15} />
      </Life>
      {[0, 1, 2].map((i) => {
        const at = T.taka + i * 0.14;
        if (t < at || t > T.taka + 1.2) return null;
        const k = range(t, at, at + 0.55);
        const from = new THREE.Vector3(...atScreen(0.16, 0.6, 3, cam));
        const to = new THREE.Vector3(jl.x, jl.y + 1.2 * jarS, jl.z);
        const p = from.clone().lerp(to, k);
        p.y += Math.sin(Math.PI * k) * 1.2;
        const s = worldWidth(0.09, 2, cam) / 0.72 * (1 - k * 0.5);
        return (
          <group key={i} position={p.toArray()} scale={s} rotation={[k * 6, 0, k * 2]}>
            <Coin />
          </group>
        );
      })}
      <Life t={t} a={T.sat} b={T.er} kind="pop" position={atScreen(0.72, 0.6, 3.5, cam)} scale={worldWidth(0.3, 3.5, cam) / 1.2} rotation={[0, -0.25, 0]}>
        <Calendar top="DELIVERY" big="7" nextBig="14" flip={range(t, T.choddo, T.choddo + 0.4)} header={C.navy} />
      </Life>
      <Life t={t} a={T.choddo + 0.3} b={T.er} kind="pop" position={atScreen(0.72, 0.76, 3.5, cam)} scale={worldWidth(0.3, 3.5, cam) / 2}>
        <Tag text="7 – 14 DAYS" size={0.3} w={2} h={0.52} color={C.deepNavy} />
      </Life>
      <Life t={t} a={T.shesh} b={T.er} kind="pop" position={atScreen(0.26, 0.31, 1.5, cam)} scale={worldWidth(0.2, 1.5, cam) / 1.6}>
        <Tag text="LIVE" size={0.42} w={1.6} h={0.7} color="#1F9D55" />
      </Life>

      {/* ===== S9: domain + hosting into EVERY YEAR ===== */}
      {[
        { at: T.domain, el: <Globe />, off: -0.22, s: 1.0 },
        { at: T.hosting, el: <Server />, off: 0.22, s: 0.9 },
      ].map((o, i) => {
        if (t < o.at || t > T.apnar + 0.25) return null;
        const land = new THREE.Vector3(JR_center[0] + Math.sign(o.off) * worldWidth(0.12, JR_center[2], cam), FLOOR + 1.02 * jarS * 1.2 * 0.95, JR_center[2]);
        const k = springStep(t - o.at, { k: 70, c: 11 });
        const p = land.clone().add(new THREE.Vector3(0, (1 - k) * 7, 0));
        const lbl = ["DOMAIN", "HOSTING"][i];
        const outK = t > T.apnar - 0.1 ? Math.min(1, (t - T.apnar + 0.1) / 0.3) : 0;
        const sc = worldWidth(0.2, JR_center[2], cam) * o.s * (1 - backIn(outK));
        return (
          <group key={i} position={p.toArray()}>
            <group scale={sc}>{o.el}</group>
            {k > 0.6 && (
              <group position={[0, 1.15 * sc + 0.2 + i * 0.5, 0.4]} scale={(range(k, 0.6, 1) * worldWidth(0.22, JR_center[2], cam)) / 2.1 * (1 - outK)}>
                <Tag text={lbl} size={0.3} w={2.1} h={0.55} color={i ? C.navy : C.steel} />
              </group>
            )}
          </group>
        );
      })}
      <Life t={t} a={T.dui} b={T.apnar - 0.3} kind="pop" position={atScreen(0.5, 0.33, 1.5, cam)} scale={worldWidth(0.82, 1.5, cam) / 4.2}>
        <PriceTag text={t < T.panch ? "BDT 2,000" : "BDT 2,000 – 5,000"} sub="PER YEAR" w={4.2} h={1.15} color={C.orange} />
      </Life>

      {/* ===== S10: page cards ===== */}
      {["HOME", "DOCTOR", "TREATMENTS", "FEES", "BOOKING", "GALLERY"].map((lbl, i) => {
        const col = i % 3,
          row = Math.floor(i / 3);
        const p = atScreen(0.22 + col * 0.28, 0.36 + row * 0.24, 1.5, cam);
        const at = T.apnar + 0.22 + 0.06 * i;
        const isDrop = lbl === "GALLERY";
        const dropK = isDrop ? range(t, T.bad, T.bad + 0.6) : 0;
        const checkAt = T.page + 0.12 * i;
        const ck = isDrop ? 0 : springStep(t - checkAt, { k: 260, c: 14 });
        return (
          <Life key={lbl} t={t} a={at} b={T.jante - 0.42 + i * 0.02} kind="pop" position={[p[0] + dropK * 0.6, p[1] - dropK * dropK * 5, p[2]]} scale={worldWidth(0.24, 1.5, cam) / 1.0} rotation={[0, 0, isDrop ? -dropK * 0.6 : 0]}>
            <PageCard label={lbl} check={t > checkAt ? ck : 0} dim={dropK} accent={[C.steel, C.navy, C.orange, C.steel, C.navy, C.orange][i]} />
          </Life>
        );
      })}

      {/* ===== S11: chat phone + logo ===== */}
      {t > T.jante - 0.05 && chatOut < 1 && <Phone {...chat} />}
      <Life t={t} a={T.whatsapp + 0.2} b={45.15} kind="pop" position={atScreen(0.5, 0.12, -1, cam)} scale={worldWidth(0.24, -1, cam) / 2}>
        <LogoMark size={2} />
      </Life>
    </Stage>
  );
};
