// wd004 S02 — price (45.70–79.52 s): মূল package → feature → chamber-এর page → দামের slider → add-on (SMS / ভাষা / payment)
import React from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, Cam } from "../../kit/Stage";
import { useVideoTime } from "../../kit/time";
import { springStep, wobble, popIn, tween, range, emphDecel, expoOut, drift } from "../../kit/anim";
import { Phone, phoneScreen, PHONE } from "../../kit/Device";
import { Tag } from "../../kit/Clock";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { PriceTag } from "../../web11/props";
import { cue, SCENES } from "../cues";
import { Life, backIn } from "../life";
import { GiftBox, GIFT, BlankPage, LabelPage, FeatureBadge, PriceSlider, ChatBubble, ClayCard, AddonRow, MobileSite, AddonScreen } from "../props/s02";

const cam: Cam = DEFAULT_CAM;
const S = SCENES.price;
const T = {
  mul: cue("মূল", S),
  panch: cue("পাঁচ", S),
  business: cue("business", S),
  contact: cue("contact", S),
  seo: cue("SEO", S),
  mobile: cue("mobile", S),
  chamber: cue("chamber", S),
  home: cue("home", S),
  doctor: cue("doctor", S),
  treatment: cue("treatment", S),
  khoroch: cue("খরচের", S),
  serial: cue("serial", S),
  ponero: cue("পনেরো", S),
  tirish: cue("তিরিশ", S),
  apnar: cue("আপনার", S),
  page: cue("page", cue("সেটা", S)),
  koyta: cue("কয়টা", S),
  feature: cue("feature", S),
  serial2: cue("serial", cue("feature", S)),
  neyar: cue("নেওয়ার", S),
  sms: cue("SMS", S),
  sms2: cue("SMS", cue("চাইলে", S)),
  alada: cue("আলাদা", S),
  tin: cue("তিন", cue("আলাদা", S)),
  english: cue("ইংরেজির", S),
  arekta: cue("আরেকটা", S),
  chaile2: cue("চাইলে", cue("ভাষা", S)),
  dui: cue("দুই", cue("ভাষা", S)),
  site: cue("site", cue("দুই", cue("ভাষা", S))),
  taka: cue("টাকা", cue("site", cue("দুই", cue("ভাষা", S)))),
  payment: cue("payment", S),
  gateway: cue("gateway", S),
  panch2: cue("পাঁচ", cue("gateway", S)),
};
const END = SCENES.stat - 0.45; // সব কিছু এর আগে পুরো বেরিয়ে যায়

// ---- layout ----
const BOX = atFloor(0.5, 0.75, cam);
const BOX_S = worldWidth(0.4, BOX[2], cam) / (GIFT.w + 0.24);
const boxLocal = (x: number, y: number, z: number) => new THREE.Vector3(BOX[0] + x * BOX_S, BOX[1] + y * BOX_S, BOX[2] + z * BOX_S);

// beat 3 page arc
const SLOT_X = [0.14, 0.32, 0.5, 0.68, 0.86];
const SLOT_Y = [0.27, 0.235, 0.22, 0.235, 0.27];
const SLOT_Z = 0.8;
const SLOT_S = worldWidth(0.16, SLOT_Z, cam) / 1.0;
const PAGES = ["HOME", "DOCTOR", "TREATMENT", "FEES", "SERIAL"];
const ACC = [C.steel, C.navy, C.orange, C.steel, C.navy];

export const S02: React.FC = () => {
  const t = useVideoTime(S);
  const screens: ScreenSpec[] = [];
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 2), cam.pos[1] + 0.04 * drift(t, 5), cam.pos[2]] };

  // ================= beat 1: package box =================
  const lidOpen = springStep(t - T.business, { k: 90, c: 11 });
  const boxSquash = wobble(t - T.panch, 0.06, 2.2, 0.2);
  const boxB = T.serial + 0.3;
  const fanRise = springStep(t - (T.business + 0.12), { k: 80, c: 12 });
  const PAGES_AT = [T.home, T.doctor, T.treatment, T.khoroch, T.serial];

  const fanCards = PAGES.map((lbl, i) => {
    if (t < T.business) return null;
    const c = i - 2;
    const local = boxLocal(c * 0.36, GIFT.h - 0.62 + fanRise * (1.3 + (2 - Math.abs(c)) * 0.09), -0.3 + i * 0.12);
    const fanRot = -c * 0.2 * fanRise;
    const at = PAGES_AT[i];
    const k = springStep(t - at, { k: 85, c: 12 });
    const slot = new THREE.Vector3(...atScreen(SLOT_X[i], SLOT_Y[i], SLOT_Z, cam));
    const p = local.clone().lerp(slot, Math.min(1, k));
    p.y += Math.sin(Math.PI * Math.min(1, k)) * 0.5;
    const sc = BOX_S * 0.82 + (SLOT_S - BOX_S * 0.82) * k;
    const rot: [number, number, number] = [0, (0.5 - SLOT_X[i]) * 0.5 * Math.min(1, k), fanRot * (1 - Math.min(1, k))];
    // beat 4 শেষে বেরোয়
    const outB = 65.15 - 0.05 * (4 - i) + (T.serial2 - 65.68);
    const out = t > outB ? Math.min(1, (t - outB) / 0.38) : 0;
    if (out >= 1) return null;
    const fs = sc * (1 - backIn(out));
    return (
      <group key={lbl} position={p.toArray()} rotation={rot} scale={fs}>
        {t >= at ? <LabelPage label={lbl} accent={ACC[i]} /> : <BlankPage accent={ACC[i]} />}
      </group>
    );
  });

  // ================= beat 2: feature badges =================
  const featOut = T.chamber - 0.15;
  const flyBadge = (at: number, px: number, py: number, z: number) => {
    const k = springStep(t - at, { k: 95, c: 12 });
    const from = boxLocal(0, GIFT.h + 0.4, 0);
    const to = new THREE.Vector3(...atScreen(px, py, z, cam));
    const p = from.clone().lerp(to, k);
    p.y += Math.sin(Math.PI * Math.min(1, k)) * 0.6;
    const out = t > featOut ? Math.min(1, (t - featOut) / 0.38) : 0;
    return { p: p.toArray() as [number, number, number], s: Math.min(1, 0.3 + k * 0.7) * (1 - backIn(out)), vis: t > at && out < 1 };
  };
  const mail = flyBadge(T.contact, 0.145, 0.33, 1.5);
  const seo = flyBadge(T.seo, 0.5, 0.15, 1.0);

  const PH2 = atScreen(0.84, 0.36, 1.5, cam);
  const ph2In = popIn(t, T.mobile, { k: 200, c: 15 }).s;
  const ph2Out = t > featOut ? Math.min(1, (t - featOut) / 0.38) : 0;
  const ph2 = {
    position: [PH2[0], PH2[1], PH2[2]] as [number, number, number],
    rotation: [0.02, -0.18 + 0.03 * Math.sin(t * 0.7), 0] as [number, number, number],
    scale: (worldWidth(0.19, PH2[2], cam) / PHONE.w) * Math.max(0.001, ph2In) * (1 - backIn(ph2Out)),
  };
  const ph2Vis = t > T.mobile && ph2Out < 1;
  if (ph2Vis) screens.push(phoneScreen(ph2, <MobileSite />, { opacity: Math.min(1, ph2In * 1.5) }));

  // ================= beat 4: price slider =================
  const b4Out = T.serial2 - 0.5;
  const span = tween(t, T.tirish, T.tirish + 0.6, 0, 1, expoOut) * (1 - tween(t, T.apnar, T.apnar + 0.5, 0, 1));
  const knobK = Math.max(0, tween(t, T.page, T.page + 0.6, 0, 0.45, emphDecel) + tween(t, T.feature, T.feature + 0.6, 0, 0.4, emphDecel) + 0.06 * Math.sin((t - T.apnar) * 5) * range(t, T.apnar, T.apnar + 0.3) * (1 - range(t, T.page - 0.4, T.page)));
  const price = Math.round((15000 + 15000 * knobK) / 1000) * 1000;
  const priceTxt = span > 0.05 && t < T.apnar + 0.25 ? "BDT 15,000 – 30,000" : `BDT ${price.toLocaleString("en-US")}`;
  const SL = atScreen(0.5, 0.585, 3, cam);
  const PT = atScreen(0.5, 0.715, 4, cam);

  // ================= beat 5: add-ons =================
  const phX = tween(t, T.alada + 0.2, T.alada + 0.7, 0.5, 0.29, emphDecel);
  const PH5 = atScreen(phX, 0.45, 4, cam);
  const ph5In = popIn(t, T.serial2, { k: 200, c: 15 }).s;
  const b5Out = END - 0.42;
  const ph5Out = t > b5Out ? Math.min(1, (t - b5Out) / 0.38) : 0;
  const ph5 = {
    position: [PH5[0], PH5[1], PH5[2]] as [number, number, number],
    rotation: [0.02, 0.1 * (1 - range(t, T.alada + 0.2, T.alada + 0.7)) + 0.16 * range(t, T.alada + 0.2, T.alada + 0.7) + 0.02 * Math.sin(t * 0.6), 0] as [number, number, number],
    scale: (worldWidth(0.33, PH5[2], cam) / PHONE.w) * Math.max(0.001, ph5In) * (1 - backIn(ph5Out)),
  };
  const ph5Vis = t > T.serial2 && ph5Out < 1;
  const mode = tween(t, T.english - 0.3, T.english, 0, 1) + tween(t, T.site - 0.3, T.site, 0, 1);
  if (ph5Vis)
    screens.push(
      phoneScreen(
        ph5,
        <AddonScreen mode={mode} booked={range(t, T.neyar, T.neyar + 0.4)} sms={springStep(t - T.sms, { k: 140, c: 16 })} bnK={range(t, T.chaile2, T.chaile2 + 0.35)} paid={range(t, T.gateway, T.gateway + 0.35)} />,
        { opacity: Math.min(1, ph5In * 1.5) }
      )
    );
  const bubbleZ = 1.5;
  const bubS = worldWidth(0.2, bubbleZ, cam) / 1.3;
  const ROW_S = worldWidth(0.42, bubbleZ, cam) / 3.1;

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== beat 1: gift box ===== */}
      <Life t={t} a={T.mul - 0.1} b={boxB} kind="rise" exit="sink" position={BOX} scale={BOX_S}>
        <group scale={[1 - boxSquash * 0.5, 1 + boxSquash, 1 - boxSquash * 0.5]}>
          <GiftBox open={lidOpen} lidOut={backIn(range(t, featOut, featOut + 0.38))} />
          {t > T.business + 0.2 && (
            <group position={[0, GIFT.h * 0.5, GIFT.d / 2 + 0.12]} scale={popIn(t, T.business + 0.2, { k: 220, c: 14 }).s}>
              <Tag text="5–10 PAGES" size={0.27} w={1.75} h={0.5} color={C.deepNavy} />
            </group>
          )}
        </group>
      </Life>
      {fanCards}

      {/* ===== beat 2: contact form / basic SEO / mobile ===== */}
      {mail.vis && (
        <group position={mail.p} scale={mail.s * (worldWidth(0.2, 1.5, cam) / 1.0)} rotation={[0, 0.12, wobble(t - T.contact - 0.5, 0.1, 1.4, 0.15)]}>
          <FeatureBadge icon="mail" color={C.orange} />
        </group>
      )}
      <Life t={t} a={T.contact + 0.35} b={featOut} kind="pop" position={atScreen(0.145, 0.415, 1.5, cam)} scale={worldWidth(0.25, 1.5, cam) / 2.3}>
        <Tag text="CONTACT FORM" size={0.24} w={2.3} h={0.48} color={C.deepNavy} />
      </Life>
      {seo.vis && (
        <group position={seo.p} scale={seo.s * (worldWidth(0.19, 1.0, cam) / 1.0)} rotation={[0, 0, wobble(t - T.seo - 0.5, 0.1, 1.4, 0.15)]}>
          <FeatureBadge icon="seo" color={C.navy} />
        </group>
      )}
      <Life t={t} a={T.seo + 0.35} b={featOut} kind="pop" position={atScreen(0.5, 0.235, 1.0, cam)} scale={worldWidth(0.24, 1.0, cam) / 1.9}>
        <Tag text="BASIC SEO" size={0.24} w={1.9} h={0.48} color={C.deepNavy} />
      </Life>
      {ph2Vis && <Phone {...ph2} />}
      <Life t={t} a={T.mobile + 0.35} b={featOut} kind="pop" position={atScreen(0.84, 0.5, 1.5, cam)} scale={worldWidth(0.27, 1.5, cam) / 2.3}>
        <Tag text="MOBILE READY" size={0.24} w={2.3} h={0.48} color={C.deepNavy} />
      </Life>

      {/* ===== beat 4: more pages + features → price slider ===== */}
      {["GALLERY", "BLOG"].map((lbl, i) => (
        <Life key={lbl} t={t} a={T.koyta + i * 0.16} b={b4Out - 0.05 * i} kind="pop" position={atScreen(0.31 + i * 0.19, 0.42, SLOT_Z, cam)} scale={SLOT_S * 0.9} rotation={[0, 0.06 - i * 0.06, 0]}>
          <LabelPage label={lbl} accent={[C.orange, C.steel][i]} />
        </Life>
      ))}
      <Life t={t} a={T.feature} b={b4Out - 0.1} kind="pop" position={atScreen(0.72, 0.4, 1.2, cam)} scale={worldWidth(0.15, 1.2, cam) / 1.0} rotation={[0, 0, wobble(t - T.feature - 0.2, 0.15, 1.2, 0.15) + (t - T.feature) * 0.4]}>
        <FeatureBadge icon="gear" color={C.orange} />
      </Life>
      <Life t={t} a={T.feature + 0.25} b={b4Out - 0.1} kind="pop" position={atScreen(0.72, 0.48, 1.2, cam)} scale={worldWidth(0.24, 1.2, cam) / 1.9}>
        <Tag text="FEATURES" size={0.24} w={1.9} h={0.48} color={C.deepNavy} />
      </Life>
      <Life t={t} a={T.ponero} b={b4Out} kind="pop" position={SL} scale={worldWidth(0.84, SL[2], cam) / 4.2}>
        <PriceSlider k={knobK} span={span} />
      </Life>
      <Life t={t} a={T.ponero + 0.15} b={b4Out} kind="pop" position={PT} scale={worldWidth(0.66, PT[2], cam) / 4.4} rotation={[0, 0, wobble(t - T.page, 0.05, 1.4, 0.15) + wobble(t - T.feature, 0.05, 1.4, 0.15)]}>
        <PriceTag text={priceTxt} w={4.4} h={1.0} />
      </Life>

      {/* ===== beat 5: add-ons ===== */}
      {ph5Vis && <Phone {...ph5} />}
      <Life t={t} a={T.sms} b={T.english - 0.35} kind="pop" position={atScreen(phX + 0.1, 0.165, bubbleZ, cam)} scale={bubS} rotation={[0, 0, wobble(t - T.sms2, 0.12, 1.6, 0.15)]}>
        <ChatBubble text="SMS" color={C.green} tail={-1} />
      </Life>
      <Life t={t} a={T.english} b={T.site - 0.35} kind="pop" position={atScreen(phX - 0.12, 0.165, bubbleZ, cam)} scale={bubS} rotation={[0, 0, 0.06]}>
        <ChatBubble text="EN" color={C.navy} tail={-1} />
      </Life>
      <Life t={t} a={T.arekta} b={T.site - 0.35} kind="pop" position={atScreen(phX + 0.12, 0.165, bubbleZ, cam)} scale={bubS} rotation={[0, 0, -0.06 + wobble(t - T.chaile2, 0.1, 1.6, 0.15)]}>
        <ChatBubble text="BN" color={C.orange} tail={1} />
      </Life>
      <Life t={t} a={T.taka} b={b5Out} kind="pop" position={atScreen(phX, 0.17, bubbleZ, cam)} scale={worldWidth(0.24, bubbleZ, cam) / 1.7} rotation={[0.15, 0.25, 0.1 + wobble(t - T.payment, 0.12, 1.5, 0.15)]}>
        <ClayCard />
      </Life>
      {[
        { at: T.tin, amount: "+3,000", label: "SMS", color: C.green },
        { at: T.dui, amount: "+2,000", label: "LANGUAGE", color: C.steel },
        { at: T.panch2, amount: "+5,000", label: "PAYMENT", color: C.deepOrange },
      ].map((r, i) => (
        <Life key={r.label} t={t} a={r.at} b={b5Out + 0.04 * i} kind="pop" position={atScreen(0.75, 0.37 + i * 0.11, bubbleZ, cam)} scale={ROW_S}>
          <AddonRow amount={r.amount} label={r.label} color={r.color} />
        </Life>
      ))}
    </Stage>
  );
};
