// SceneCta — call to action, 4 beats in one clay world:
//  1 FREE QUOTE: industry sign object on a floor pedestal + big orange FREE QUOTE tag ("FOR YOUR <NOUN> WEBSITE"), check pops
//  2 CALL / WHATSAPP: real iPhone dialer — 01616-901396 typed key by key on each spoken digit; CALL + WHATSAPP chips
//  3 WEBSITE: MacBook opens, javeditsolution.com typed in the browser, page loads (industry hero, ৳15,000, call button)
//  4 END CARD: standing clay board — JIT LogoMark, "Javed IT Solution", pin + "Mirpur 1, Dhaka", number pill;
//    CALL / WHATSAPP chips on the floor. Camera settles; the last frame is a clean still end card (no exit).
import React from "react";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { springStep, wobble, popIn, tween, range, emphDecel, drift } from "../../kit/anim";
import { Phone, phoneScreen, PHONE } from "../../kit/Device";
import { Txt } from "../../kit/Clay";
import { LogoMark } from "../../kit/Logo";
import { CheckBadge, SoftPanel } from "../../kit/Soft";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { PriceTag, MapPin } from "../../web11/props";
import { ActionChip } from "../../wd004/props/s08";
import { Life, backIn } from "../../wd004/life";
import { MacBook, macbookScreen, MACBOOK } from "../devices/MacBook";
import { Cue, IND, Industry, IndustrySign, Puck, at, clamp01, V3 } from "./common";
import { Dialer, JitSite } from "./screens";

export type CtaData = {
  industry: Industry;
  /** noun in the quote tag ("DENTAL CHAMBER") — default from industry */
  noun?: string;
  phone?: string; // "01616-901396"
  url?: string; // "javeditsolution.com"
  path?: string; // "/website"
  address?: string; // "Mirpur 1, Dhaka"
  /** spoken word for each digit, in order (default Bangla ১১ অঙ্ক) */
  digitWords?: string[];
  /** Bangla line on the website hero (DOM) */
  bnWeb?: string;
  cues?: { quote?: string; free?: string; call?: string; whatsapp?: string; number?: string; url?: string; dot?: string; brand?: string; address?: string };
};

const BN_DIGITS: Record<string, string> = { "0": "শূন্য", "1": "এক", "2": "দুই", "3": "তিন", "4": "চার", "5": "পাঁচ", "6": "ছয়", "7": "সাত", "8": "আট", "9": "নয়" };

const cam: Cam = DEFAULT_CAM;
// beat 1
const TAG_P = atScreen(0.5, 0.31, 2.2, cam);
const TAG_S = worldWidth(0.8, 2.2, cam) / 4.6;
const PED_F = atFloor(0.5, 0.76, cam);
const PED_S = worldWidth(0.42, PED_F[2], cam) / 1.3;
// beat 2
const PH_P = atScreen(0.5, 0.475, 2.6, cam);
const PH_S = worldWidth(0.335, 2.6, cam) / PHONE.w;
const CHIP_Z = 2.2;
// beat 3
const LAP = atFloor(0.5, 0.675, cam);
const LAP_S = worldWidth(0.86, LAP[2], cam) / MACBOOK.w;
const URL_P = atScreen(0.5, 0.17, 2, cam);
// beat 4
const CARD_W = 4,
  CARD_H = 4.8;
const CARD_S = worldWidth(0.74, 0, cam) / CARD_W;
const CARD_P: V3 = [0, FLOOR + (CARD_H / 2) * CARD_S, -0.2];
const FCHIP_F = (x: number) => atFloor(x, 0.815, cam);

export const SceneCta: React.FC<{ t: number; dur: number; cue: Cue; data: CtaData }> = ({ t, dur, cue, data }) => {
  const ind = IND[data.industry];
  const phone = data.phone ?? "01616-901396";
  const url = data.url ?? "javeditsolution.com";
  const path = data.path ?? "/website";
  const address = data.address ?? "Mirpur 1, Dhaka";
  const cu = data.cues ?? {};

  const TQ = at(cue, cu.quote, 0.06 * dur);
  const TF = at(cue, cu.free, TQ + 0.4);
  const TCALL = at(cue, cu.call, 0.3 * dur, TQ);
  const TW = at(cue, cu.whatsapp, TCALL + 0.4, TCALL);
  const TN = at(cue, cu.number, TW + 0.5, TW);
  // digits: each spoken digit word in order, after TN
  const digits = phone.replace(/\D/g, "").split("");
  const words = data.digitWords ?? digits.map((d) => BN_DIGITS[d]);
  const span = 0.24 * dur;
  const dAt: number[] = [];
  {
    let prev = TN - 0.02;
    digits.forEach((_, i) => {
      const v = cue(words[i] ?? "", prev + 0.02);
      const fb = TN + (span * i) / digits.length;
      const ok = Number.isFinite(v) && v - prev < 1.5;
      prev = ok ? v : Math.max(prev + 0.05, fb);
      dAt.push(prev);
    });
  }
  const TDONE = dAt[dAt.length - 1];
  const TU = at(cue, cu.url, Math.max(TDONE + 0.5, 0.66 * dur), TDONE);
  const TDOT = at(cue, cu.dot, TU + 0.7, TU);
  const TB = at(cue, cu.brand, Math.max(TDOT + 0.8, 0.8 * dur), TDOT);
  const TADR = at(cue, cu.address, TB + 0.6, TB);

  // ---------- beat 1 ----------
  const b1Out = TCALL - 0.25;

  // ---------- beat 2: phone ----------
  const phIn = popIn(t, TCALL - 0.1, { k: 200, c: 15 }).s;
  const phOutT = TU - 0.6;
  const phOut = range(t, phOutT, phOutT + 0.38);
  const ph = {
    position: [PH_P[0], PH_P[1] + 0.04 * drift(t, 3), PH_P[2]] as V3,
    rotation: [0.02, 0.07 * Math.sin(t * 0.6), 0] as V3,
    scale: PH_S * Math.max(0.001, phIn) * (1 - backIn(phOut)),
  };
  const phVis = t > TCALL - 0.1 && phOut < 1;
  const nTyped = dAt.filter((x) => t >= x).length;
  let typed = "";
  {
    let c = 0;
    for (const ch of phone) {
      if (/\d/.test(ch)) {
        if (c >= nTyped) break;
        c++;
        typed += ch;
      } else if (c > 0 && c < nTyped) typed += ch;
    }
  }
  const lastAt = nTyped > 0 ? dAt[nTyped - 1] : -9;
  const press = nTyped > 0 ? digits[nTyped - 1] : null;
  const pressK = clamp01(1 - (t - lastAt) / 0.22);
  const done = range(t, TDONE + 0.15, TDONE + 0.5);
  const wa = range(t, TW, TW + 0.3);

  // ---------- beat 3: MacBook ----------
  const lapA = TU - 0.12;
  const lapIn = popIn(t, lapA, { k: 190, c: 15 }).s;
  const lapOpen = tween(t, lapA + 0.12, lapA + 0.85, 0, 1, emphDecel);
  const lapOut = range(t, TB - 0.3, TB + 0.08);
  const lapSc = LAP_S * Math.max(0.001, lapIn) * (1 - backIn(lapOut));
  const lapVis = t > lapA && lapOut < 1;
  const tUrlEnd = Math.min(TDOT + 0.2, TU + 0.8);
  const nUrl = Math.round(url.length * range(t, TU, tUrlEnd)) + Math.round(path.length * range(t, tUrlEnd + 0.02, tUrlEnd + 0.25));
  const urlTyped = (url + path).slice(0, nUrl);
  const load = range(t, tUrlEnd + 0.1, tUrlEnd + 0.4);
  const reveal = range(t, tUrlEnd + 0.25, tUrlEnd + 0.9);
  const mb = { position: [LAP[0], LAP[1], LAP[2]] as V3, rotation: [0, 0.04 * Math.sin(t * 0.5), 0] as V3, scale: lapSc, open: lapOpen };

  const screens: ScreenSpec[] = [];
  if (phVis) screens.push(phoneScreen(ph, <Dialer typed={typed} press={press} pressK={pressK} done={done} wa={wa} />, { kind: "iphone", opacity: clamp01(phIn * 1.6) }));
  if (lapVis && lapOpen > 0.3)
    screens.push(
      macbookScreen(mb, <JitSite industry={data.industry} url={urlTyped} caret={Math.floor(t * 2.4) % 2 === 0 && load < 1} load={load} reveal={reveal} phone={phone} bnWeb={data.bnWeb} />, {
        opacity: range(lapOpen, 0.3, 0.65),
      })
    );

  // ---------- camera: drift, fully settled on the end card ----------
  const settle = 1 - range(t, TB, TB + 1.0);
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.06 * drift(t, 2) * settle, cam.pos[1] + 0.05 * drift(t, 5) * settle, cam.pos[2]] };
  const sx = (s: number) => Math.max(0.001, s);

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== beat 1: FREE QUOTE ===== */}
      <Life t={t} a={TQ} b={b1Out} kind="pop" position={TAG_P} scale={TAG_S} rotation={[0, 0, wobble(t - TQ - 0.1, 0.06, 1.3, 0.14) + wobble(t - TF, 0.05, 1.6, 0.16)]}>
        <PriceTag text="FREE QUOTE" sub={`FOR YOUR ${(data.noun ?? ind.noun).toUpperCase()} WEBSITE`} w={4.6} h={1.3} />
        {t > TF && <CheckBadge position={[2.15, 0.6, 0.12]} scale={0.7 * sx(Math.min(1.1, springStep(t - TF, { k: 280, c: 13 })))} color={C.navy} />}
      </Life>
      <Life t={t} a={TQ - 0.15} b={b1Out + 0.05} kind="rise" exit="sink" position={[PED_F[0], FLOOR, PED_F[2]]} scale={PED_S}>
        <Puck r={0.65} position={[0, 0.08, 0]} />
        <group position={[0, 0.16, 0]} rotation={[0.18, 0, 0]} scale={1.25 * sx(springStep(t - TQ - 0.25, { k: 230, c: 12 }))}>
          <IndustrySign industry={data.industry} rotation={[0, -0.35 + 0.25 * Math.sin(t * 0.9), 0]} />
        </group>
      </Life>

      {/* ===== beat 2: CALL / WHATSAPP + dialer ===== */}
      <Life t={t} a={TCALL} b={phOutT} kind="pop" position={atScreen(0.27, 0.15, CHIP_Z, cam)} scale={worldWidth(0.4, CHIP_Z, cam) / 2.4}>
        <ActionChip label="CALL" color={C.navy} icon="phone" />
      </Life>
      <Life t={t} a={TW} b={phOutT + 0.04} kind="pop" position={atScreen(0.73, 0.15, CHIP_Z, cam)} scale={worldWidth(0.4, CHIP_Z, cam) / 2.4} rotation={[0, 0, wobble(t - TW - 0.1, 0.05, 1.5, 0.15)]}>
        <ActionChip label="WHATSAPP" color="#1F9D55" icon="chat" />
      </Life>
      {phVis && <Phone {...ph} kind="iphone" />}

      {/* ===== beat 3: MacBook + URL tag ===== */}
      {lapVis && <MacBook {...mb} color="silver" />}
      <Life t={t} a={TU + 0.1} b={TB - 0.3} kind="pop" position={URL_P} scale={worldWidth(0.66, 2, cam) / 4.2}>
        <SoftPanel w={4.2} h={0.7} thick={0.26} color="#FBF7F0" radius={0.33}>
          <Txt size={0.3} color={C.deepNavy} position={[0, -0.01, 0.03]} letterSpacing={0.02}>
            {url}
          </Txt>
        </SoftPanel>
      </Life>

      {/* ===== beat 4: end card (rises from the floor, never exits) ===== */}
      <Life t={t} a={TB - 0.1} kind="rise" position={CARD_P} scale={CARD_S}>
        <SoftPanel w={CARD_W} h={CARD_H} thick={0.5} color="#FBF7F0" radius={0.7}>
          <group position={[0, 1.5, 0.08]} scale={sx(springStep(t - TB - 0.15, { k: 220, c: 14 }))}>
            <LogoMark size={1.35} depth={0.14} />
          </group>
          <group position={[0, 0.3, 0.03]} scale={sx(springStep(t - TB - 0.3, { k: 240, c: 15 }))}>
            <Txt size={0.44} color={C.deepNavy}>
              Javed IT Solution
            </Txt>
          </group>
          <group position={[0, -0.36, 0.03]} scale={sx(springStep(t - TADR, { k: 240, c: 15 }))}>
            <MapPin position={[-1.3, -0.2, 0.05]} scale={0.36} color={C.orange} />
            <Txt size={0.3} color="#4A5A6C" position={[-1.08, -0.01, 0]} anchorX="left">
              {address}
            </Txt>
          </group>
          <group position={[0, -1.3, 0.12]} scale={sx(Math.min(1.08, springStep(t - TADR - 0.25, { k: 230, c: 13 })))}>
            <ActionChip label={phone} color={C.orange} icon="phone" w={3.55} h={0.84} size={0.31} />
          </group>
          <Txt size={0.22} color="#7A8694" position={[0, -2.0, 0.03]} opacity={range(t, TADR + 0.4, TADR + 0.8)} letterSpacing={0.03}>
            {url}
          </Txt>
        </SoftPanel>
      </Life>
      {[0.3, 0.7].map((x, i) => {
        const f = FCHIP_F(x);
        const s = worldWidth(0.36, f[2], cam) / 2.4;
        return (
          <Life key={i} t={t} a={TADR + 0.45 + i * 0.15} kind="pop" position={[f[0], FLOOR + 0.37 * s + 0.01, f[2]]} scale={s} rotation={[-0.12, (0.5 - x) * 0.25, 0]}>
            <ActionChip label={i ? "WHATSAPP" : "CALL"} color={i ? "#1F9D55" : C.navy} icon={i ? "chat" : "phone"} />
          </Life>
        );
      })}
    </Stage>
  );
};
