// scenes_c — CHAT template: customer ↔ business কথোপকথন, আসল ফোনের chat screen-এ (WhatsApp-ধাঁচ রং, logo নয়)।
// 3D জগৎ সাড়া দেয়: রাতের ঘড়ি (চাঁদসহ), বন্ধ দোকান; customer টাইপ করে → message যায়; business-এর reply আসার মুহূর্তে
// দোকান থেকে সবুজ bubble উড়ে customer-এর কাছে যায়, দোকানে "AUTO-REPLY" tag জ্বলে; শেষে outcome ✓ (ORDER CONFIRMED…)।
import React from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { popIn, range, tween, drift, springStep, emphDecel } from "../../kit/anim";
import { StatusBar } from "../../kit/Device";
import { IPhone, iphoneScreen, IPHONE } from "../devices/Phones";
import { ClockBadge, Tag } from "../../kit/Clock";
import { CheckBadge } from "../../kit/Soft";
import { GlowMat } from "../../kit/Clay";
import { ScreenSpec } from "../../kit/Screens";
import { typed } from "../../kit/time";
import { C } from "../../kit/theme";
import { Life, backIn } from "../../wd004/life";
import { Bubble } from "../../wd004/props/s06";
import { Cue, Industry, INDUSTRY, when, clockAngles, Place, Customer, STORE } from "./common";

export type ChatMsg = {
  from: "customer" | "business";
  /** DOM — বাংলা/English যা খুশি */
  text: string;
  /** bubble-এর সময় "2:07 AM" */
  time: string;
  /** এই message পর্দায় আসার cue শব্দ */
  cue?: string;
};
export type ChatData = {
  industry: Industry;
  /** chat header-এর নাম (DOM) */
  business: string;
  /** 3D signboard (English) */
  sign: string;
  /** header avatar-এর অক্ষর, যেমন "RF" */
  initials?: string;
  /** "2:07" — 3D ঘড়ি + status bar */
  clock: string;
  night?: boolean;
  messages: ChatMsg[];
  /** প্রথম business reply এলে দোকানে যে tag জ্বলে */
  replyTag?: string;
  outcome: { label: string; cue?: string };
};

const cam: Cam = DEFAULT_CAM;
const PH_P = atScreen(0.37, 0.375, 3, cam);
const PH_S = worldWidth(0.5, 3, cam) / IPHONE.w;
const SHOP_P = atFloor(0.81, 0.655, cam);
const SHOP_S = worldWidth(0.33, SHOP_P[2], cam) / STORE.w;
const CLOCK_P = atScreen(0.81, 0.15, 0.5, cam);
const CUST_P = atFloor(0.25, 0.9, cam);
const CUST_S = worldWidth(0.15, CUST_P[2], cam) / 0.42;

// ------------------------------------------------------------ DOM chat screen
const ui = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
const BN = "'Sabbir Sorolota', 'Hind Siliguri', -apple-system, 'Helvetica Neue', Arial, sans-serif";
type Theme = { head: string; headInk: string; bg: string; dots: string; out: string; inn: string; ink: string; meta: string; bar: string; field: string; fieldInk: string; send: string; chip: string; chipInk: string; dark: boolean };
const LIGHT: Theme = { head: "#F7F8F7", headInk: "#111B21", bg: "#EFE7DD", dots: "rgba(120,100,80,0.07)", out: "#D9FDD3", inn: "#FFFFFF", ink: "#111B21", meta: "#667781", bar: "#F0F2F0", field: "#FFFFFF", fieldInk: "#111B21", send: "#1DAA61", chip: "#FFFFFFE6", chipInk: "#54656F", dark: false };
const DARK: Theme = { head: "#1F2C34", headInk: "#E9EDEF", bg: "#0B141A", dots: "rgba(255,255,255,0.035)", out: "#005C4B", inn: "#202C33", ink: "#E9EDEF", meta: "#8696A0", bar: "#0B141A", field: "#202C33", fieldInk: "#E9EDEF", send: "#21C063", chip: "#182229", chipInk: "#8696A0", dark: true };

const Ticks: React.FC<{ read: boolean; th: Theme }> = ({ read, th }) => (
  <svg width="20" height="12" viewBox="0 0 20 12" style={{ marginLeft: 4 }}>
    <path d="M1 6.5 4.6 10 11.5 2.5M7.5 10 8.6 10.9 15.5 2.5" fill="none" stroke={read ? "#53BDEB" : th.meta} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Icon = {
  back: (c: string) => (
    <svg width="26" height="26" viewBox="0 0 24 24"><path d="M15 5 8 12l7 7" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  video: (c: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24"><rect x="2.5" y="6" width="13" height="12" rx="3" fill="none" stroke={c} strokeWidth="2" /><path d="m15.5 10.5 5-3v9l-5-3" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" /></svg>
  ),
  call: (c: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="none" stroke={c} strokeWidth="1.9" strokeLinejoin="round" /></svg>
  ),
  plus: (c: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2.2" strokeLinecap="round" /></svg>
  ),
  mic: () => (
    <svg width="24" height="24" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" /><path d="M6 11a6 6 0 0 0 12 0M12 17v3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
  ),
  send: () => (
    <svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 12 20 4l-4 16-4-6.5L4 12Z" fill="#fff" /></svg>
  ),
};

export const ChatScreen: React.FC<{
  data: ChatData;
  appear: number[]; // প্রতিটা message 0..1
  typingBiz: number; // 0..1 typing dots (business)
  draft: string; // customer input-এ টাইপ হচ্ছে
  read: boolean[];
  phase: number; // typing dots-এর সময়
}> = ({ data, appear, typingBiz, draft, read, phase }) => {
  const th = data.night ? DARK : LIGHT;
  const status = typingBiz > 0.05 ? "typing…" : "online";
  return (
    <div style={{ position: "absolute", inset: 0, background: th.bg, fontFamily: ui, overflow: "hidden" }}>
      {/* wallpaper doodle dots */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${th.dots} 2.2px, transparent 2.6px), radial-gradient(${th.dots} 1.6px, transparent 2px)`, backgroundSize: "38px 38px, 26px 26px", backgroundPosition: "0 0, 13px 19px" }} />
      {/* header */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 152, background: th.head, boxShadow: th.dark ? "none" : "0 1px 0 rgba(0,0,0,0.06)", zIndex: 5 }}>
        <StatusBar dark={th.dark} time={data.clock} />
        <div style={{ position: "absolute", top: 70, left: 10, right: 16, display: "flex", alignItems: "center", gap: 10 }}>
          {Icon.back(th.headInk)}
          <div style={{ width: 56, height: 56, borderRadius: 28, background: INDUSTRY[data.industry].sign, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 21, letterSpacing: 0.5 }}>
            {data.initials ?? data.sign.slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 24, color: th.headInk, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: BN }}>{data.business}</div>
            <div style={{ fontSize: 17, color: typingBiz > 0.05 ? th.send : th.meta, fontWeight: 600 }}>{status}</div>
          </div>
          <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
            {Icon.video(th.headInk)}
            {Icon.call(th.headInk)}
          </div>
        </div>
      </div>
      {/* thread — উপর থেকে, নতুন message নিচে যোগ হয় */}
      <div style={{ position: "absolute", top: 152, left: 0, right: 0, bottom: 100, display: "flex", flexDirection: "column", justifyContent: "flex-start", padding: "18px 12px 12px", gap: 0 }}>
        <div style={{ alignSelf: "center", background: th.chip, color: th.chipInk, fontSize: 18, fontWeight: 700, padding: "7px 16px", borderRadius: 10, margin: "0 0 8px", letterSpacing: 0.4 }}>TODAY</div>
        {data.messages.map((m, i) => {
          const k = appear[i] ?? 0;
          if (k <= 0) return null;
          const out = m.from === "customer";
          const e = emphDecel(Math.min(1, k));
          return (
            <div key={i} style={{ maxHeight: e * 320, overflow: "visible", display: "flex", justifyContent: out ? "flex-end" : "flex-start", marginTop: 10 * e }}>
              <div
                style={{
                  maxWidth: 318,
                  background: out ? th.out : th.inn,
                  color: th.ink,
                  borderRadius: out ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                  padding: "11px 14px 8px",
                  boxShadow: "0 1.5px 1px rgba(0,0,0,0.10)",
                  transform: `translateY(${(1 - e) * 26}px) scale(${0.92 + 0.08 * e})`,
                  transformOrigin: out ? "100% 100%" : "0% 100%",
                  opacity: Math.min(1, k * 2),
                }}
              >
                <div style={{ fontSize: 30, lineHeight: 1.3, fontFamily: BN, fontWeight: 600 }}>{m.text}</div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize: 16, color: th.meta, marginTop: 2, fontWeight: 600 }}>
                  {m.time}
                  {out && <Ticks read={read[i]} th={th} />}
                </div>
              </div>
            </div>
          );
        })}
        {typingBiz > 0.01 && (
          <div style={{ maxHeight: typingBiz * 70, overflow: "hidden", marginTop: 10 * typingBiz }}>
            <div style={{ display: "inline-flex", gap: 7, background: th.inn, borderRadius: "4px 18px 18px 18px", padding: "17px 18px", boxShadow: "0 1.5px 1px rgba(0,0,0,0.10)", opacity: typingBiz }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{ width: 10, height: 10, borderRadius: 5, background: th.meta, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(phase * 8 - d * 0.95)) }} />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* input bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 100, background: th.bar, display: "flex", alignItems: "flex-start", padding: "12px 10px 0", gap: 8 }}>
        <div style={{ paddingTop: 10 }}>{Icon.plus(th.meta)}</div>
        <div style={{ flex: 1, minHeight: 50, background: th.field, borderRadius: 25, padding: "0 18px", display: "flex", alignItems: "center", fontSize: 26, color: draft ? th.fieldInk : th.meta, fontFamily: BN, fontWeight: draft ? 600 : 500, whiteSpace: "nowrap", overflow: "hidden" }}>
          <span>{draft ? (draft.length > 17 ? "…" + draft.slice(-16) : draft) : "Message"}</span>
          {draft && <span style={{ display: "inline-block", width: 2, height: 26, background: th.send, marginLeft: 2 }} />}
        </div>
        <div style={{ width: 50, height: 50, borderRadius: 25, background: th.send, display: "flex", alignItems: "center", justifyContent: "center" }}>{draft ? Icon.send() : Icon.mic()}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------ scene
const lerp3 = (a: number[], b: number[], k: number): [number, number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

export const SceneChat: React.FC<{ t: number; dur: number; cue: Cue; data: ChatData }> = ({ t, dur, cue, data }) => {
  const ind = INDUSTRY[data.industry];
  const M = data.messages;
  const OUT = dur - 0.62;
  // প্রতিটা message-এর সময়: cue → না পেলে 0.16..0.66·dur সমান ভাগে
  const at: number[] = [];
  M.forEach((m, i) => {
    const fb = dur * (0.16 + (0.5 * i) / Math.max(1, M.length - 1));
    const prev = i ? at[i - 1] : 0.9;
    at.push(Math.max(prev + (i ? 0.95 : 0), when(cue, m.cue, fb, i ? at[i - 1] : 0)));
  });
  const lastMsg = at[at.length - 1] ?? dur * 0.6;
  const TO = Math.max(lastMsg + 0.6, when(cue, data.outcome.cue, dur * 0.76, lastMsg));
  const TPH = Math.max(0.3, Math.min(0.5, at[0] - 1.6));

  const appear = M.map((_, i) => range(t, at[i], at[i] + 0.4));
  // business typing dots: আগের message +0.25 থেকে নিজের সময় পর্যন্ত
  let typingBiz = 0;
  M.forEach((m, i) => {
    if (m.from !== "business") return;
    const s = Math.max(i ? at[i - 1] + 0.3 : at[i] - 1.0, at[i] - 1.1);
    typingBiz = Math.max(typingBiz, Math.min(range(t, s, s + 0.2), 1 - range(t, at[i] - 0.05, at[i])));
  });
  // customer draft typing
  let draft = "";
  let typingCust = 0;
  M.forEach((m, i) => {
    if (m.from !== "customer") return;
    const s = Math.max(i ? at[i - 1] + 0.25 : TPH + 0.3, at[i] - 1.25);
    const e = at[i] - 0.12;
    if (t >= s && t < at[i]) {
      draft = typed(m.text, t, s, e);
      typingCust = 1;
    }
  });
  const read = M.map((m, i) => m.from === "customer" && M.some((n, j) => j > i && n.from === "business" && t >= at[j] - 0.4));
  const firstBiz = M.findIndex((m) => m.from === "business");
  const TB = firstBiz >= 0 ? at[firstBiz] : 999;

  // phone
  const phIn = popIn(t, TPH, { k: 190, c: 15 });
  const phOut = t > OUT ? Math.min(1, (t - OUT) / 0.38) : 0;
  const buzz = t > TB && t < TB + 0.45 ? Math.sin((t - TB) * 70) * 0.03 * (1 - (t - TB) / 0.45) : 0;
  const ph = {
    position: [PH_P[0] + 0.03 * drift(t, 2), PH_P[1] + 0.03 * Math.sin(t * 1.05), PH_P[2]] as [number, number, number],
    rotation: [0.03, 0.15 + 0.03 * drift(t, 5), buzz] as [number, number, number],
    scale: Math.max(0.001, PH_S * phIn.s * (1 - backIn(phOut))),
  };
  const screens: ScreenSpec[] = [];
  const phoneVis = t > TPH - 0.02 && phOut < 1;
  if (phoneVis) screens.push(iphoneScreen(ph, <ChatScreen data={data} appear={appear} typingBiz={typingBiz} draft={draft} read={read} phase={t} />, { opacity: Math.min(1, phIn.s * 1.3), bg: data.night ? "#0B141A" : "#EFE7DD" }));

  // clock → outcome
  const ang = clockAngles(data.clock);
  const night = data.night ?? false;
  // reply মুহূর্তে দোকানে জ্বলা আলো (রাতে দরজা বন্ধ, কিন্তু reply যায়)
  const replied = range(t, TB, TB + 0.5);
  // bubble flight shop → customer
  const flyA = TB + 0.05,
    flyB = TB + 1.05;
  const fk = range(t, flyA, flyB);
  const shopTop = [SHOP_P[0] - 0.2, FLOOR + 1.0 * SHOP_S, SHOP_P[2] + STORE.d * SHOP_S * 0.6];
  const custHead = [CUST_P[0] + 0.45 * CUST_S, FLOOR + 1.25 * CUST_S, CUST_P[2]];
  const fl = lerp3(shopTop, custHead, emphDecel(fk));
  fl[1] -= Math.sin(Math.PI * fk) * 0.5; // নিচ দিয়ে — ফোনের DOM screen-এর পিছনে লুকায় না
  const cheer = Math.sin(Math.PI * range(t, TO + 0.05, TO + 1.2)) * 0.95;

  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 1), cam.pos[1] + 0.04 * drift(t, 3), cam.pos[2] - 0.3 * range(t, 0, dur)] };

  return (
    <Stage cam={camLive} screens={screens} dim={night ? tween(t, TB - 0.2, TB + 0.6, 0.82, 0.95) : 1}>
      {phoneVis && <IPhone {...ph} color="black" />}

      {/* night clock — outcome এলে বেরিয়ে যায় */}
      <Life t={t} a={TPH + 0.25} b={TO - 0.35} kind="pop" position={CLOCK_P} scale={worldWidth(0.24, CLOCK_P[2], cam) / 2.0}>
        <ClockBadge hourA={ang.hourA} minA={ang.minA + range(t, TPH, TO) * 0.25} moon={night} />
      </Life>
      <Life t={t} a={TPH + 0.45} b={TO - 0.35} kind="pop" position={atScreen(0.81, 0.27, 0.5, cam)} scale={worldWidth(0.2, 0.5, cam) / 1.9}>
        <Tag text={`${data.clock} ${(M[0]?.time.match(/[AP]M/i)?.[0] ?? "").toUpperCase()}`.trim()} size={0.3} w={1.9} h={0.56} color={C.deepNavy} />
      </Life>

      {/* the business */}
      <Life t={t} a={TPH + 0.4} b={OUT} kind="rise" exit="sink" position={SHOP_P} scale={SHOP_S}>
        <Place industry={data.industry} label={data.sign} open={night ? 0 : 0.65} light={night ? 0 : 1} t={t} emblemAt={TPH + 0.7} bounce={range(t, TO, TO + 0.5)} rotationY={-0.2}>
          {replied > 0 && (
            <group position={[0, 1.0, STORE.d / 2 + 0.1]} scale={springStep(t - TB, { k: 220, c: 13 })}>
              <ReplyTag text={data.replyTag ?? "AUTO-REPLY"} />
              <mesh position={[0, 0.34, 0.02]}>
                <sphereGeometry args={[0.07, 20, 14]} />
                <GlowMat color="#7CF3A6" intensity={2.2 + 1.2 * Math.sin(t * 6)} />
              </mesh>
            </group>
          )}
        </Place>
      </Life>

      {/* reply bubble flies from the shop to the customer */}
      {t > flyA && t < flyB + 0.3 && (
        <group position={fl} scale={worldWidth(0.12, fl[2], cam) / 1.5 * (fk < 1 ? Math.min(1, fk * 5) : Math.max(0, 1 - (t - flyB) / 0.3))}>
          <Bubble color="#2DBE60" dot="#ffffff" phase={t} tail={-1} />
        </group>
      )}

      {/* the customer, typing on their phone */}
      <Life t={t} a={TPH + 0.55} b={OUT} kind="pop" exit="shrink" position={CUST_P} scale={CUST_S}>
        <Customer t={t} dist={0} walkK={0} phone={1 - Math.max(0, cheer)} cheerK={Math.max(0, cheer)} color={C.steel} position={[0, 0, 0]} rotationY={0.5} scale={1} />
      </Life>

      {/* outcome */}
      <Life t={t} a={TO} b={OUT} kind="pop" position={atScreen(0.8, 0.13, 0.5, cam)} scale={worldWidth(0.16, 0.5, cam) / 1.0}>
        <CheckBadge color="#22A45A" rotation={[0.12, -0.25, 0]} />
      </Life>
      <Life t={t} a={TO + 0.18} b={OUT} kind="pop" position={atScreen(0.8, 0.245, 0.5, cam)} scale={1}>
        <OutcomeTag text={data.outcome.label} maxW={worldWidth(0.34, 0.5, cam)} />
      </Life>
    </Stage>
  );
};

const OutcomeTag: React.FC<{ text: string; maxW: number }> = ({ text, maxW }) => {
  const size = Math.min(0.3, maxW / (text.length * 0.68 + 1.4));
  const w = text.length * size * 0.68 + size * 1.4;
  return <Tag text={text} size={size} w={w} h={size * 2.0} color={C.deepNavy} />;
};

/** দোকানের সামনের সবুজ reply tag — দোকানের প্রস্থের (2.0) ভেতরে থাকে */
const ReplyTag: React.FC<{ text: string }> = ({ text }) => {
  const size = Math.min(0.17, 1.7 / (text.length * 0.66 + 1.3));
  return <Tag text={text} size={size} w={text.length * size * 0.66 + size * 1.3} h={Math.max(0.36, size * 2.3)} color="#1F9D55" />;
};
