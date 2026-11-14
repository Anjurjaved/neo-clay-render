// scenes_c — PERSONA template: একজন business owner + তাঁর জায়গা (দোকান/চেম্বার + industry emblem) + name plate +
// রোজকার সমস্যার একটা খুঁটিনাটি (missed calls / লাইন / বন্ধের পরে / unread message)।
// beat: place (দোকান ওঠে) → name (owner হেঁটে আসে, name plate) → problem (সমস্যা দেখা দেয়) → peak (সমস্যা চরমে, owner চিন্তিত) → সব বেরোয়
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "../../kit/Clay";
import { slabGeo } from "../../kit/Geo";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { popIn, range, smoothstep, tween, emphDecel, drift, pathDistance, speedAt, headingAt, springStep } from "../../kit/anim";
import { HangSign } from "../../kit/Shop";
import { StatusBar } from "../../kit/Device";
import { IPhone, iphoneScreen, IPHONE } from "../devices/Phones";
import { ClockBadge, Tag, NotifyCard } from "../../kit/Clock";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { Life, backIn } from "../../wd004/life";
import { CallBadge } from "../../wd004/props/s07";
import { Cue, Industry, INDUSTRY, NameStand, nameStandW, when, clockAngles, Place, Owner, Customer, STORE } from "./common";

export type ProblemKind = "missed-calls" | "queue" | "after-hours" | "unread";
export type PersonaData = {
  industry: Industry;
  /** 3D (English) — name plate-এর বড় লেখা, যেমন "DR. SHIRIN" */
  name: string;
  /** 3D — role line, যেমন "DENTIST · SYLHET" */
  role: string;
  /** 3D — signboard, যেমন "SHIRIN DENTAL" */
  business: string;
  problem: {
    kind: ProblemKind;
    /** 3D tag, যেমন "12 MISSED CALLS A DAY" */
    label: string;
    /** missed calls / unread সংখ্যা, queue-তে মানুষের সংখ্যা (≤5) */
    count?: number;
    /** after-hours / queue ঘড়ি "10:30" */
    clock?: string;
    /** unread card-গুলোর লেখা (English, ≤14 অক্ষর) */
    items?: string[];
    /** missed-calls lock screen-এর দিন/সময় (DOM) */
    day?: string;
  };
  /** cue শব্দ — না দিলে/না পেলে dur-এর ভগ্নাংশ */
  cues?: { place?: string; name?: string; problem?: string; peak?: string };
};

const cam: Cam = DEFAULT_CAM;
const SHOP_P = atFloor(0.68, 0.6, cam);
const SHOP_S = worldWidth(0.46, SHOP_P[2], cam) / STORE.w;
const OWNER_A = atFloor(-0.12, 0.78, cam);
const OWNER_B = atFloor(0.22, 0.73, cam);
const OWNER_S = worldWidth(0.19, OWNER_B[2], cam) / 0.42;
const NAME_P = atFloor(0.6, 0.9, cam);
const NAME_W = worldWidth(0.56, NAME_P[2], cam);
const PH_P = atScreen(0.24, 0.215, 3, cam);
const PH_S = worldWidth(0.27, 3, cam) / IPHONE.w;
const TOPL = atScreen(0.27, 0.23, 1.5, cam);
const LABEL_P = atScreen(0.71, 0.075, 1.5, cam);
const BADGE_P = atScreen(0.475, 0.07, 2.6, cam);

const ui = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
const PhoneGlyph: React.FC<{ c?: string; s?: number }> = ({ c = "#E5484D", s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
  </svg>
);
const CALLERS = ["+880 1711-48••••", "+880 1819-20••••", "+880 1912-77••••", "+880 1556-31••••", "+880 1678-95••••", "+880 1303-62••••"];
const AGO = ["now", "4m ago", "11m ago", "18m ago", "26m ago", "35m ago"];

/** lock screen — missed call stack বাড়ে (count) */
const MissedScreen: React.FC<{ count: number; time: string; day: string }> = ({ count, time, day }) => {
  const n = Math.max(0, Math.round(count));
  const rows = Math.min(4, n);
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(168deg,#E7EDF4 0%,#D9E2ED 55%,#CBD7E6 100%)", fontFamily: ui }}>
      <StatusBar time="" />
      <div style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center", color: "#1B2A3D" }}>
        <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.72 }}>{day}</div>
        <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -3, lineHeight: 1.0 }}>{time}</div>
      </div>
      <div style={{ position: "absolute", top: 278, left: 16, right: 16 }}>
        {n > 0 && (
          <div style={{ background: "rgba(255,255,255,0.94)", borderRadius: 24, padding: "16px 18px", boxShadow: "0 8px 22px rgba(30,50,80,0.13)", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 50, height: 50, borderRadius: 13, background: "#34C759", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhoneGlyph c="#fff" s={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, color: "#6b7785", fontWeight: 600 }}>Phone · {AGO[0]}</div>
              <div style={{ fontSize: 30, color: "#B4232A", fontWeight: 800 }}>{n} Missed call{n === 1 ? "" : "s"}</div>
            </div>
          </div>
        )}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={n - i}
            style={{ background: "rgba(255,255,255,0.8)", borderRadius: 18, padding: "13px 16px", marginBottom: 9, display: "flex", alignItems: "center", gap: 12, transform: `scale(${1 - i * 0.035})`, opacity: 1 - i * 0.14 }}
          >
            <PhoneGlyph s={20} />
            <div>
              <div style={{ fontSize: 20, color: "#22303f", fontWeight: 700 }}>{CALLERS[(n - i) % CALLERS.length]}</div>
              <div style={{ fontSize: 16, color: "#7a8694", fontWeight: 600 }}>Missed call · {AGO[Math.min(i + 1, AGO.length - 1)]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const v3 = (a: number[], b: number[], k: number) => new THREE.Vector3(a[0], a[1], a[2]).lerp(new THREE.Vector3(b[0], b[1], b[2]), k);
const QCOL = [C.steel, C.deepOrange, "#6E7F99", "#B9654A", "#3E8E7E"];

export const ScenePersona: React.FC<{ t: number; dur: number; cue: Cue; data: PersonaData }> = ({ t, dur, cue, data }) => {
  const ind = INDUSTRY[data.industry];
  const pr = data.problem;
  const c = data.cues ?? {};
  const T0 = Math.max(0.3, when(cue, c.place, dur * 0.04));
  const TN = Math.max(T0 + 0.9, when(cue, c.name, dur * 0.2));
  const TP = Math.max(TN + 0.8, when(cue, c.problem, dur * 0.42));
  const TK = Math.max(TP + 0.8, when(cue, c.peak, dur * 0.64));
  const OUT = dur - 0.62;
  const screens: ScreenSpec[] = [];

  // ---- owner walks in, stops in front-left
  const wA = Math.max(T0 + 0.15, TN - 1.15),
    wB = TN + 0.25;
  const path = (u: number): [number, number] => {
    const k = smoothstep(wA, wB, u);
    return [OWNER_A[0] + (OWNER_B[0] - OWNER_A[0]) * k, OWNER_A[2] + (OWNER_B[2] - OWNER_A[2]) * k];
  };
  const [ox, oz] = path(t);
  const oWalk = Math.min(1, speedAt(path, t) / 1.0);
  const oDist = pathDistance(path, wA, t);
  const arrived = range(t, wB - 0.15, wB + 0.45);
  // সমস্যা দেখা দিলে সেদিকে ঘোরে: queue/after-hours → দোকানের দিকে, বাকিগুলো → উপরে ফোন/card-এর দিকে
  const lookShop = pr.kind === "queue" || pr.kind === "after-hours";
  const faceWalk = headingAt(path, Math.min(t, wB - 0.05), Math.PI / 2);
  const turnK = range(t, TP, TP + 0.6);
  const face = faceWalk * (1 - arrived) + (0.35 + (lookShop ? 0.75 : -0.25) * turnK) * arrived;
  const worryK = lookShop ? 0 : range(t, TK - 0.1, TK + 0.5) * (1 - range(t, OUT - 0.3, OUT));
  const waveK = Math.sin(Math.PI * range(t, TN + 0.05, TN + 1.1));
  const pointK = lookShop ? range(t, TK - 0.1, TK + 0.4) * (1 - range(t, OUT - 0.3, OUT)) : 0;

  // ---- problem props
  const n = pr.count ?? 12;
  const climb = (x: number) => Math.round(tween(t, TP + 0.2, TK + 0.4, 0, x, (u) => u));
  const clock = clockAngles(pr.clock ?? "10:30");

  // missed-calls phone
  const phIn = popIn(t, TP, { k: 200, c: 15 });
  const phOut = t > OUT ? Math.min(1, (t - OUT) / 0.38) : 0;
  const nCalls = climb(n);
  const ring = nCalls > 0 && t < TK + 0.6 ? Math.sin(t * 60) * 0.025 * Math.max(0, 1 - ((t - TP) % 0.9) * 2.2) : 0;
  const ph = {
    position: [PH_P[0] + 0.03 * drift(t, 2), PH_P[1] + 0.03 * Math.sin(t * 1.1), PH_P[2]] as [number, number, number],
    rotation: [0.04, 0.2 + 0.03 * drift(t, 4), ring] as [number, number, number],
    scale: Math.max(0.001, PH_S * phIn.s * (1 - backIn(phOut))),
  };
  const showPhone = pr.kind === "missed-calls" && t > TP - 0.02 && phOut < 1;
  if (showPhone) screens.push(iphoneScreen(ph, <MissedScreen count={nCalls} time={pr.clock ?? "11:40"} day={pr.day ?? "Saturday"} />, { opacity: Math.min(1, phIn.s * 1.3) }));

  // after-hours: shutter নামে, আলো নেভে
  const closeK = pr.kind === "after-hours" ? range(t, TP + 0.1, TP + 1.2) : 0;
  const shopOpen = 0.68 * (1 - closeK);
  const shopLight = 1 - closeK;

  // queue / after-hours visitor figures
  const qN = pr.kind === "queue" ? Math.min(5, Math.max(2, pr.count ?? 4)) : pr.kind === "after-hours" ? 1 : 0;
  const QSLOT = [atFloor(0.6, 0.655, cam), atFloor(0.695, 0.675, cam), atFloor(0.79, 0.695, cam), atFloor(0.885, 0.715, cam), atFloor(0.97, 0.735, cam)];
  const QSTART = atFloor(1.22, 0.78, cam);

  // camera: হালকা drift + ধীর push-in
  const camLive: Cam = {
    ...cam,
    pos: [cam.pos[0] + 0.05 * drift(t, 1), cam.pos[1] + 0.04 * drift(t, 3), cam.pos[2] - 0.35 * range(t, 0, dur)],
  };

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== place ===== */}
      <Life t={t} a={T0} b={OUT} kind="rise" exit="sink" position={SHOP_P} scale={SHOP_S}>
        <Place industry={data.industry} label={data.business} open={shopOpen} light={shopLight} t={t} emblemAt={T0 + 0.35} rotationY={-0.18}>
          {pr.kind === "after-hours" && t > TP + 1.1 && <HangSign text="CLOSED" position={[0, 1.5, STORE.d / 2 - 0.1]} drop={springStep(t - TP - 1.1, { k: 140, c: 9 })} angle={0.25 * Math.exp(-(t - TP - 1.1) * 2.5) * Math.sin((t - TP - 1.1) * 9)} w={0.62} textColor={C.deepOrange} />}
        </Place>
      </Life>

      {/* ===== owner ===== */}
      {t > wA - 0.02 && (
        <Life t={t} a={wA} b={OUT} kind="pop" exit="shrink" position={[ox, FLOOR, oz]} scale={OWNER_S}>
          <Owner industry={data.industry} t={t} dist={oDist / OWNER_S} walkK={oWalk} arrived={arrived} waveK={waveK} pointK={pointK} pointDir={[0.15, 0.3, 1]} worryK={worryK} position={[0, 0, 0]} rotationY={face} scale={1} />
        </Life>
      )}

      {/* ===== name plate ===== */}
      <Life t={t} a={TN} b={OUT - 0.1} kind="pop" position={NAME_P} scale={NAME_W / nameStandW(data.name, data.role)} rotation={[0, -0.05 + 0.02 * drift(t, 7), 0]}>
        <NameStand name={data.name} role={data.role} />
      </Life>

      {/* ===== problem: missed calls ===== */}
      {showPhone && <IPhone {...ph} color="natural" />}
      {pr.kind === "missed-calls" && (
        <Life t={t} a={TK} b={OUT} kind="pop" position={BADGE_P} scale={worldWidth(0.1, 2.6, cam) / 1.0}>
          <CallBadge n={nCalls} calm={0} />
        </Life>
      )}

      {/* ===== problem: unread messages pile up ===== */}
      {pr.kind === "unread" &&
        (pr.items ?? ["Price?", "Size M?", "Delivery?", "Available?"]).slice(0, 4).map((txt, i, arr) => {
          const a = TP + i * Math.min(0.42, (TK - TP) / arr.length);
          const k = springStep(t - a, { k: 170, c: 13 });
          const pos = atScreen(0.235 + (i % 2 ? 0.03 : -0.03), 0.12 + 0.075 * Math.min(i, 3), 1.2 + i * 0.25, cam);
          return (
            <Life key={i} t={t} a={a} b={OUT - 0.04 * i} kind="pop" position={[pos[0], pos[1] + (1 - k) * 0.8, pos[2]]} scale={worldWidth(0.32, pos[2], cam) / 1.3} rotation={[0, 0.18, (i % 2 ? -1 : 1) * 0.035]}>
              <NotifyCard text={txt} dot={i === arr.length - 1 ? "#E5484D" : "#22B35E"} />
            </Life>
          );
        })}
      {pr.kind === "unread" && (
        <Life t={t} a={TK} b={OUT} kind="pop" position={BADGE_P} scale={worldWidth(0.1, 2.6, cam) / 1.0}>
          <CallBadge n={climb(n)} calm={0} />
        </Life>
      )}

      {/* ===== problem: clock (queue / after-hours) ===== */}
      {(pr.kind === "queue" || pr.kind === "after-hours") && (
        <Life t={t} a={TP} b={OUT} kind="pop" position={TOPL} scale={worldWidth(0.24, TOPL[2], cam) / 2.0}>
          <ClockBadge
            hourA={clock.hourA + (pr.kind === "queue" ? range(t, TP, TK + 0.8) * 0.6 : 0)}
            minA={clock.minA + (pr.kind === "queue" ? range(t, TP, TK + 0.8) * Math.PI * 2.2 : 0)}
            moon={pr.kind === "after-hours"}
          />
        </Life>
      )}

      {/* queue figures walk in and wait; after-hours visitor arrives, finds it closed, turns back */}
      {Array.from({ length: qN }).map((_, i) => {
        const ah = pr.kind === "after-hours";
        const a = ah ? Math.max(TP + 1.3, TK - 1.5) : TP + 0.15 + i * 0.32;
        const slot = QSLOT[i];
        const back = ah ? TK + 0.35 : 999;
        const qp = (u: number): [number, number] => {
          const k = smoothstep(a, a + 1.25, u) * (1 - smoothstep(back, back + 1.6, u));
          return [QSTART[0] + (slot[0] - QSTART[0]) * k, QSTART[2] + (slot[2] - QSTART[2]) * k];
        };
        const [qx, qz] = qp(t);
        if (t < a - 0.02) return null;
        const sp = speedAt(qp, t);
        const QS = worldWidth(0.13, qz, cam) / 0.42;
        const fb = Math.atan2(SHOP_P[0] - qx, SHOP_P[2] - 0.0 - qz);
        const hd = sp > 0.05 ? headingAt(qp, t, fb) : fb + Math.sin(t * 1.7 + i) * 0.12;
        return (
          <Life key={i} t={t} a={a} b={Math.min(OUT, back + 1.4)} kind="pop" exit="shrink" position={[qx, FLOOR, qz]} scale={QS}>
            <Customer t={t + i * 0.7} dist={pathDistance(qp, a, t) / QS} walkK={Math.min(1, sp / 0.9)} phone={sp < 0.05 && pr.kind === "queue" && i % 2 === 1 ? 1 : 0} color={QCOL[i % QCOL.length]} position={[0, 0, 0]} rotationY={hd} scale={1} cell={0.016} />
          </Life>
        );
      })}

      {/* ===== problem label (উপরের ফাঁকা পট্টিতে, কিছুর উপর পড়ে না) ===== */}
      <Life t={t} a={TK + 0.15} b={OUT} kind="pop" position={LABEL_P} scale={1}>
        <ProblemTag text={pr.label} maxW={worldWidth(0.4, 1.5, cam)} />
      </Life>
    </Stage>
  );
};

/** কমলা-লাল সমস্যা tag — লেখার দৈর্ঘ্য থেকে মাপ, maxW-এর মধ্যে */
const ProblemTag: React.FC<{ text: string; maxW: number }> = ({ text, maxW }) => {
  const words = text.split(" ");
  // দুই লাইনে ভাঙা যদি লম্বা হয়
  let lines = [text];
  if (text.length > 13) {
    let best = 1,
      bd = 1e9;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ").length,
        b = words.slice(i).join(" ").length;
      if (Math.abs(a - b) < bd) {
        bd = Math.abs(a - b);
        best = i;
      }
    }
    lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }
  const L = Math.max(...lines.map((l) => l.length));
  const size = Math.min(0.24, (maxW * 0.86) / (L * 0.68));
  const w = Math.min(maxW, L * size * 0.68 + size * 1.6);
  const h = size * (lines.length * 1.25 + 0.9);
  const g = useMemo(() => slabGeo(w, h, 0.1, h * 0.24, 0.035, 4), [w, h]);
  return (
    <group>
      <mesh geometry={g} castShadow>
        <ClayMat color="#D9453B" rough={0.5} bump={0.12} sheen={0.3} />
      </mesh>
      {lines.map((l, i) => (
        <TxtLine key={i} text={l} size={size} y={(lines.length - 1) * size * 0.62 - i * size * 1.25} />
      ))}
    </group>
  );
};
const TxtLine: React.FC<{ text: string; size: number; y: number }> = ({ text, size, y }) => (
  <Txt size={size} color="#ffffff" position={[0, y - size * 0.03, 0.065]}>
    {text}
  </Txt>
);
