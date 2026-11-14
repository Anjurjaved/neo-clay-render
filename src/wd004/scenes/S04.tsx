// wd004 S04 — compare (99.42–145.06 s) · "কম দামের offer-এ লুকানো খরচ" → চারটা জিনিস মিলিয়ে নিন
// beat: প্রশ্ন + BDT 5,000 tag → iceberg (লুকানো খরচ) → checklist strip (উপরে থাকে) → domain চাবি/তালা →
// contract + IN WRITING stamp → developer-কে বারবার call (কয়েন উড়ে যায়) → admin panel (Friday Closed→Open) →
// template ভেঙে নতুন custom site। সময় = cue("শব্দ", after)।
import React from "react";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { useVideoTime } from "../../kit/time";
import { springStep, wobble, popIn, tween, range, emphDecel, drift, cubicPulse } from "../../kit/anim";
import { Phone, phoneScreen, PHONE, Tablet, tabletScreen, TABLET } from "../../kit/Device";
import { LogoMark } from "../../kit/Logo";
import { Tag, ClockBadge } from "../../kit/Clock";
import { Figure } from "../../kit/Figure";
import { Calendar, Coin, PriceTag, Globe, Stethoscope } from "../../web11/props";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { cue, SCENES } from "../cues";
import { Life, backIn } from "../life";
import { QBubble, Sticker, Iceberg, Checklist, Key, Padlock, Contract, Stamp, TemplateCard, CustomSite, XBadge, CallScreen, AdminScreen, jolt, v3 } from "../props/s04";

const cam: Cam = DEFAULT_CAM;
const S = SCENES.compare;
const c = (w: string, after = S) => cue(w, after);
const T = {
  q: c("প্রশ্ন"),
  kom: c("কম"),
  offer: c("offer"),
  na: c("না?"),
  kom2: c("কম", 105),
  asol: c("আসল"),
  khoroch: c("খরচটা"),
  sadharon: c("সাধারণত"),
  pore: c("পরে", 106.5),
  tai2: c("তাই", 107.5),
  deyar: c("দেওয়ার"),
  charta: c("চারটা"),
  milie: c("মিলিয়ে"),
  domain: c("domain"),
  kar: c("কার"),
  nijer: c("নিজের"),
  nahole: c("না", c("নিজের")),
  site: c("site"),
  sorate: c("সরাতে"),
  jhamela: c("ঝামেলা"),
  prothom: c("প্রথম"),
  bug: c("bug"),
  backup: c("backup"),
  seta: c("সেটা"),
  kagoje: c("কাগজে"),
  lekha: c("লেখা"),
  dekhe: c("দেখে"),
  chamber: c("chamber"),
  somoy: c("সময়"),
  chhutir: c("ছুটির"),
  dev: c("developer"),
  phone: c("ফোন"),
  protita: c("প্রতিটা"),
  badolei: c("বদলেই"),
  taka: c("টাকা", 128),
  somoy2: c("সময়", 129.5),
  javed: c("Javed"),
  business: c("business"),
  admin: c("admin"),
  chhutir2: c("ছুটির", 134),
  notun: c("নতুন", 135),
  nijei: c("নিজেই"),
  minite: c("মিনিটে"),
  bodle: c("বদলে", 137.5),
  deben: c("দেবেন"),
  design: c("design"),
  shuru: c("শুরু"),
  notun2: c("নতুন", 139.8),
  banano: c("বানানো"),
  onno2: c("অন্য", 141),
  namta: c("নামটা"),
  noy: c("নয়", 143),
};
const END = SCENES.points;
const OUT = END - 0.8; // সব বস্তু এখানে বেরোতে শুরু করে (OUT + 0.4-এর মধ্যে শেষ)
const RINGS = [T.dev + 0.25, T.protita, T.badolei];

// ---- layout (screen-% → world) ----
const CL_MID = atScreen(0.5, 0.42, 0, cam);
const CL_TOP = atScreen(0.5, 0.112, -1, cam);
const GLOBE = atScreen(0.68, 0.46, 0, cam);
const KEY0 = atScreen(0.26, 0.42, 1, cam);
const KEY1 = atScreen(0.39, 0.46, 1, cam);
const PAPER = atScreen(0.47, 0.46, 1, cam);
const PHONE_P = atScreen(0.68, 0.455, 2, cam);
const TAB = atScreen(0.4, 0.45, 1, cam);
const DOC = atFloor(0.87, 0.77, cam);
const CUSTOM = atScreen(0.4, 0.46, 1, cam);

export const S04: React.FC = () => {
  const t = useVideoTime(S);
  const screens: ScreenSpec[] = [];

  // ---------- checklist strip ----------
  const clUp = tween(t, T.milie + 0.25, T.milie + 0.85, 0, 1, emphDecel);
  const clPos = v3(CL_MID, CL_TOP, clUp);
  const clS = worldWidth(0.9, clPos[2], cam) / 5.3;
  const sp = (at: number, k = 230, cc = 15) => (t < at ? 0 : springStep(t - at, { k, c: cc }));
  const ticks = [T.nijer + 0.3, T.dekhe, T.deben, T.banano];

  // ---------- beat 4: domain ----------
  const keyIn = tween(t, T.nijer, T.nijer + 0.5, 0, 1, emphDecel);
  const keyAway = range(t, T.nahole + 0.3, T.nahole + 0.9);
  const keyP = v3(KEY0, KEY1, keyIn);
  keyP[0] -= keyAway * keyAway * 6;
  keyP[1] += keyAway * 0.8;
  const keyLabel = t < T.nijer ? "NAME: ?" : t < T.nahole ? "YOUR NAME" : "SOMEONE ELSE";
  const globeTry = 0.32 * Math.sin(Math.PI * range(t, T.sorate, T.sorate + 0.42));
  const globeShake = jolt(t, T.jhamela, 0.12, 14, 5);
  const gS = worldWidth(0.38, GLOBE[2], cam);
  const gP: [number, number, number] = [GLOBE[0] + globeTry + globeShake, GLOBE[1], GLOBE[2]];

  // ---------- beat 5: contract + stamp ----------
  const pS = worldWidth(0.56, PAPER[2], cam) / 2.6;
  const imprint: [number, number, number] = [PAPER[0] + 0.55 * pS, PAPER[1] - 1.08 * pS, PAPER[2] + 0.3];
  const stHover: [number, number, number] = [imprint[0], imprint[1] + 0.25, imprint[2] + 1.6];
  const stStart = atScreen(0.82, 0.3, 2.5, cam);
  const stMove = tween(t, T.seta, T.kagoje + 0.1, 0, 1, emphDecel);
  const press = range(t, T.kagoje + 0.12, T.kagoje + 0.3) * (1 - range(t, T.lekha, T.lekha + 0.25));
  const stBack = range(t, T.lekha + 0.15, T.lekha + 0.55);
  const stP = v3(v3(v3(stStart, stHover, stMove), [imprint[0], imprint[1] + 0.12, imprint[2] + 0.25], press), stStart, emphDecel(stBack));

  // ---------- beat 6a: phone calls ----------
  const phS = worldWidth(0.38, PHONE_P[2], cam) / PHONE.w;
  const phOut = range(t, T.javed - 0.45, T.javed - 0.07);
  const phPop = popIn(t, T.dev, { k: 200, c: 15 }).s;
  const ring = RINGS.reduce((a, r) => a + jolt(t, r, 1, 16, 4.5), 0);
  const ph = {
    position: [PHONE_P[0] + ring * 0.06, PHONE_P[1], PHONE_P[2]] as [number, number, number],
    rotation: [0.02, -0.12, ring * 0.06] as [number, number, number],
    scale: phS * Math.max(0.001, phPop) * (1 - backIn(phOut)),
  };
  const callN = 1 + RINGS.filter((r, i) => i > 0 && t >= r).length;
  const pulse = (t * 1.6) % 1;
  const phoneVis = t > T.dev - 0.02 && phOut < 1;
  if (phoneVis) screens.push(phoneScreen(ph, <CallScreen n={callN} pulse={pulse} />, { opacity: Math.min(1, phPop * 1.5) }));
  const coinTimes = [...RINGS, T.taka, T.taka + 0.16];

  // ---------- beat 6b: admin tablet ----------
  const tS = worldWidth(0.7, TAB[2], cam) / TABLET.w;
  const tPop = popIn(t, T.admin, { k: 200, c: 15 }).s;
  const tOut = range(t, T.design - 0.45, T.design - 0.07);
  const tab = { position: TAB, rotation: [0.0, 0.1, 0] as [number, number, number], scale: tS * Math.max(0.001, tPop) * (1 - backIn(tOut)) };
  const tabVis = t > T.admin - 0.02 && tOut < 1;
  const noticeFull = "Closed 16 Dec";
  const nChars = Math.round(noticeFull.length * range(t, T.chhutir2, T.chhutir2 + 0.85));
  const P0: [number, number] = [600, 620],
    P1: [number, number] = [660, 200],
    P2: [number, number] = [690, 336],
    P3: [number, number] = [842, 468];
  const lerp2 = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  let cur = lerp2(P0, P1, tween(t, T.chhutir2 - 0.4, T.chhutir2, 0, 1));
  cur = lerp2(cur, P2, tween(t, T.notun - 0.3, T.notun, 0, 1));
  cur = lerp2(cur, P3, tween(t, T.nijei, T.nijei + 0.55, 0, 1));
  const clickP = cubicPulse(T.minite + 0.08, 0.12, t);
  if (tabVis)
    screens.push(
      tabletScreen(
        tab,
        <AdminScreen
          notice={noticeFull.slice(0, nChars)}
          caret={t > T.chhutir2 - 0.1 && t < T.notun - 0.2 && Math.floor(t * 2.4) % 2 === 0}
          timeNew={range(t, T.notun, T.notun + 0.35)}
          cursor={cur}
          press={clickP}
          open={range(t, T.minite + 0.1, T.minite + 0.3)}
          saved={range(t, T.bodle, T.bodle + 0.3)}
          reveal={range(t, T.admin, T.admin + 0.8)}
        />,
        { opacity: Math.min(1, tPop * 1.5) }
      )
    );

  // ---------- beat 7: templates → custom ----------
  const tplPos = [0, 1, 2].map((i) => atScreen(0.2 + 0.3 * i, 0.46, 1, cam));
  const tplS = worldWidth(0.26, 1, cam) / 1.0;

  // camera: হালকা জীবন্ত drift
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 2), cam.pos[1] + 0.04 * drift(t, 5), cam.pos[2] - 0.25 * Math.sin(Math.PI * range(t, S, END))] };

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== beat 1: প্রশ্ন + সস্তা offer ===== */}
      {(() => {
        const k = tween(t, T.kom - 0.1, T.kom + 0.5, 0, 1, emphDecel);
        const pos = v3(atScreen(0.5, 0.36, 0, cam), atScreen(0.17, 0.17, 0, cam), k);
        return (
          <Life t={t} a={T.q} b={T.kom2 - 0.15} position={pos} scale={worldWidth(0.36 - 0.17 * k, 0, cam) / 1.9} rotation={[0, 0, wobble(t - T.q - 0.1, 0.08, 1.2, 0.15)]}>
            <QBubble />
          </Life>
        );
      })()}
      <Life t={t} a={T.kom} b={T.tai2} position={atScreen(0.52, 0.33, 1, cam)} scale={worldWidth(0.56, 1, cam) / 3.2} rotation={[0, 0, wobble(t - T.kom - 0.2, 0.07, 1.1, 0.1)]}>
        <PriceTag text="BDT 5,000" w={3.2} h={1.1} />
      </Life>
      <Life t={t} a={T.offer} b={T.tai2 - 0.05} position={atScreen(0.8, 0.255, 1.6, cam)} scale={worldWidth(0.2, 1.6, cam) / 1.1} rotation={[0, 0, -0.25 + wobble(t - T.offer - 0.1, 0.12, 1.6, 0.14)]}>
        <Sticker top="CHEAP" bottom="OFFER" />
      </Life>

      {/* ===== beat 2: iceberg — আসল খরচ পানির নিচে ===== */}
      <Life t={t} a={T.kom2} b={T.tai2 + 0.05} kind="rise" exit="sink" position={atFloor(0.5, 0.645, cam)} scale={1.0}>
        <Iceberg labels={["DOMAIN?", "BUGS", "BACKUP", "CHANGES"]} show={[T.asol, T.khoroch, T.sadharon, T.pore].map((a) => sp(a + 0.05, 260, 14))} />
      </Life>

      {/* ===== beat 3+: checklist strip (শেষ পর্যন্ত উপরে থাকে) ===== */}
      <Life t={t} a={T.deyar} b={OUT + 0.04} position={clPos} scale={clS}>
        <Checklist
          labels={["DOMAIN", "IN WRITING", "ADMIN PANEL", "CUSTOM"]}
          slot={[0, 1, 2, 3].map((i) => sp(T.charta + 0.1 * i, 260, 14))}
          label={[T.domain, T.prothom, T.chamber, T.design].map((a) => range(t, a, a + 0.35))}
          tick={ticks.map((a) => sp(a, 280, 13))}
        />
      </Life>

      {/* ===== beat 4: domain কার নামে ===== */}
      <Life t={t} a={T.domain} b={T.jhamela + 0.42} position={gP} scale={gS} rotation={[0.2, t * 0.5, 0]}>
        <Globe />
      </Life>
      {t < T.nahole + 0.95 && (
        <Life t={t} a={T.kar} b={T.nahole + 0.95} kind="drop" position={keyP} scale={worldWidth(0.34, 1, cam) / 1.9} rotation={[0, 0, -0.12 + wobble(t - T.kar - 0.2, 0.15, 1.3, 0.12) + 0.6 * keyAway]}>
          <Key label={keyLabel} labelPop={range(t, T.nijer, T.nijer + 0.35) + range(t, T.nahole, T.nahole + 0.35)} />
        </Life>
      )}
      <Life t={t} a={T.site} b={T.jhamela + 0.42} kind="drop" position={[gP[0], gP[1] - 0.25 * gS, GLOBE[2] + 0.62 * gS]} scale={worldWidth(0.17, GLOBE[2] + 1, cam) / 0.95} rotation={[0, 0, jolt(t, T.jhamela, 0.25, 12, 4.5) + jolt(t, T.sorate + 0.2, 0.15, 12, 6)]}>
        <Padlock />
      </Life>
      <Life t={t} a={T.jhamela} b={T.jhamela + 0.4} position={atScreen(0.68, 0.64, 2, cam)} scale={worldWidth(0.3, 2, cam) / 1.9}>
        <Tag text="LOCKED" size={0.3} w={1.9} h={0.55} color="#D9453B" />
      </Life>

      {/* ===== beat 5: contract — কাগজে লেখা ===== */}
      <Life t={t} a={T.prothom} b={T.chamber - 0.42} position={PAPER} scale={pS} rotation={[-0.06, 0.05, wobble(t - T.prothom - 0.1, 0.05, 1.2, 0.15)]}>
        <Contract rows={[T.prothom + 0.15, T.bug, T.backup].map((a) => sp(a, 240, 14))} sign={range(t, T.seta, T.seta + 0.35)} stamped={range(t, T.lekha, T.lekha + 0.12)} />
      </Life>
      <Life t={t} a={T.seta} b={T.dekhe} position={stP} scale={worldWidth(0.2, 2, cam) / 1.15} rotation={[1.15 - 0.15 * press, -0.15, -0.15]}>
        <Stamp />
      </Life>

      {/* ===== beat 6a: সময়/ছুটি বদলাতে developer-কে ফোন ===== */}
      <Life t={t} a={T.chhutir} b={T.javed - 0.45} position={atScreen(0.25, 0.34, 1, cam)} scale={worldWidth(0.3, 1, cam) / 1.2} rotation={[0, 0.2, 0]}>
        <Calendar top="FRIDAY" big="OFF" />
      </Life>
      <Life t={t} a={T.somoy} b={T.javed - 0.45} position={atScreen(0.25, 0.575, 1, cam)} scale={worldWidth(0.24, 1, cam) / 2} rotation={[0, 0.2, 0]}>
        <ClockBadge hourA={(9 / 12) * Math.PI * 2 + 0.4 * range(t, T.somoy2, T.somoy2 + 0.8)} minA={Math.PI * 2 * 4 * Math.pow(range(t, T.somoy2, T.somoy2 + 0.8), 0.7)} moon={false} />
      </Life>
      {phoneVis && <Phone {...ph} />}
      {coinTimes.map((at, i) => {
        if (t < at || t > at + 0.75) return null;
        const k = range(t, at, at + 0.75);
        const from = atScreen(0.85, 0.3, 2.4, cam);
        const to = atScreen(1.15, 0.27 + 0.04 * (i % 2), 2.4, cam);
        const p = v3(from, to, k);
        p[1] += Math.sin(Math.PI * k) * 0.5;
        const s = (worldWidth(0.1, 2.4, cam) / 0.72) * Math.min(1, k * 6);
        return (
          <group key={i} position={p} scale={s} rotation={[1.2 + k * 5, 0, k * 3]}>
            <Coin />
          </group>
        );
      })}

      {/* ===== beat 6b: JIT business website → admin panel ===== */}
      <Life t={t} a={T.javed} b={T.admin - 0.45} position={atScreen(0.5, 0.39, 0, cam)} scale={worldWidth(0.4, 0, cam) / 2} rotation={[0, 0.3 * Math.sin(t * 0.9), 0]}>
        <LogoMark size={2} />
      </Life>
      <Life t={t} a={T.business} b={T.admin - 0.45} position={atScreen(0.5, 0.585, 1.5, cam)} scale={worldWidth(0.6, 1.5, cam) / 3.4}>
        <Tag text="BUSINESS WEBSITE" size={0.26} w={3.4} h={0.56} color={C.navy} />
      </Life>
      {tabVis && <Tablet {...tab} />}
      <Life t={t} a={T.admin + 0.25} b={T.design - 0.45} position={DOC} scale={worldWidth(0.17, DOC[2], cam) / 0.42}>
        <Figure rotationY={-0.55} coat="#F6F4F0" headTilt={0.12 * range(t, T.nijei - 0.2, T.nijei + 0.3)} pose={{ armOut: [0, 1.1 * range(t, T.nijei, T.nijei + 0.4) * (1 - range(t, T.bodle + 0.2, T.bodle + 0.6))] }}>
          <Stethoscope />
        </Figure>
      </Life>

      {/* ===== beat 7: template ভেঙে নতুন custom design ===== */}
      {[0, 1, 2].map((i) => {
        const brk = T.shuru + 0.06 * i;
        if (t < brk)
          return (
            <Life key={i} t={t} a={T.design + 0.07 * i} position={tplPos[i]} scale={tplS} rotation={[0, 0, jolt(t, brk - 0.18, 0.08, 18, 6)]}>
              <TemplateCard />
            </Life>
          );
        const k = range(t, brk, brk + 0.6);
        if (k >= 1) return null;
        return (
          <group key={i} position={tplPos[i]} scale={tplS * (1 - backIn(k) * 0.9)}>
            {([-1, 1] as const).map((s) => (
              <group key={s} position={[s * (0.25 + k * 0.7), -k * k * 2.6, 0]} rotation={[0, 0, -s * k * 1.4]}>
                <TemplateCard half={s} />
              </group>
            ))}
          </group>
        );
      })}
      <Life t={t} a={T.notun2} b={OUT} kind="rise" exit="shrink" position={CUSTOM} scale={worldWidth(0.56, 1, cam) / 2.9}>
        <CustomSite build={range(t, T.notun2 + 0.15, T.banano + 0.7)} />
      </Life>
      <Life t={t} a={T.banano} b={OUT + 0.02} position={atScreen(0.4, 0.635, 2, cam)} scale={worldWidth(0.44, 2, cam) / 2.8}>
        <Tag text="100% CUSTOM" size={0.3} w={2.8} h={0.6} color={C.deepOrange} />
      </Life>
      <Life t={t} a={T.onno2} b={OUT + 0.05} position={atScreen(0.835, 0.47, 1, cam)} scale={worldWidth(0.24, 1, cam) / 1.0} rotation={[0, -0.2, 0]}>
        <TemplateCard label={t < T.namta + 0.1 ? "CLINIC NAME" : "DR. SHIRIN"} />
      </Life>
      <Life t={t} a={T.noy} b={OUT + 0.05} position={atScreen(0.835, 0.45, 2.5, cam)} scale={worldWidth(0.13, 2.5, cam)}>
        <XBadge />
      </Life>
    </Stage>
  );
};
