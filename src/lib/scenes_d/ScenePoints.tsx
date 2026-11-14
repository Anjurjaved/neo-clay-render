// Scene template: POINTS — ৩–৫টা key point, প্রত্যেকটা নিজের অর্থবহ 3D বস্তু হয়ে নিজের শব্দে মঞ্চের pedestal-এ নামে,
// label দেখায়, পরের point এলে উড়ে উপরের shelf-এ নিজের নম্বর-ঘরে বসে; শেষে সব একসাথে recap grid-এ, তারপর সব বেরিয়ে যায়।
import React, { useMemo } from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, Cam } from "../../kit/Stage";
import { springStep, wobble, popIn, range, emphDecel, drift, clamp } from "../../kit/anim";
import { ClayMat, Txt } from "../../kit/Clay";
import { SoftPanel, Inset } from "../../kit/Soft";
import { roundedCylGeo, slabGeo } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { Cue, Industry, IconKey, PROFILES, at, backIn, Life, Gloss, fitSize } from "./common";
import { Icon3D } from "./icons";

export type PointItem = {
  label: string; // English 3D label, e.g. "ONLINE BOOKING"
  word: string; // এই শব্দে বস্তুটা আসে
  icon?: IconKey; // না দিলে industry default
  short?: string; // shelf/recap-এ ছোট label (না দিলে label)
  text?: string; // বস্তুর নিজের লেখা (calendar-এর সংখ্যা ইত্যাদি)
};
export type PointsData = { industry: Industry; title: string; titleWord?: string; points: PointItem[] };

const cam: Cam = DEFAULT_CAM;
type V3 = [number, number, number];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** title plate: industry emblem + English title (scene-এর পুরো সময় উপরে) */
const TitlePlate: React.FC<{ title: string; accent: string; emblem: IconKey; t: number; a2: string }> = ({ title, accent, emblem, t, a2 }) => {
  const fs = 0.36;
  const tw = Math.min(5.2, title.length * fs * 0.64);
  const W = tw + 1.45;
  return (
    <SoftPanel w={W} h={1.0} thick={0.26} color={accent}>
      <Inset position={[-W / 2 + 0.6, 0, 0]} w={0.78} h={0.78} color="#FBF8F3" />
      <group position={[-W / 2 + 0.6, 0, 0.16]}>
        <Icon3D kind={emblem} t={t} scale={0.58} accent={accent} accent2={a2} />
      </group>
      <Txt size={fitSize(title, 5.2, fs)} color="#ffffff" position={[0.55, -0.01, 0.02]}>
        {title}
      </Txt>
    </SoftPanel>
  );
};

/** label plate (নিচে, বড় পড়ার মতো) */
const LabelPlate: React.FC<{ text: string; n: number; accent: string }> = ({ text, n, accent }) => {
  const fs = 0.34;
  const tw = text.length * fs * 0.66;
  const W = tw + 1.3;
  const disc = useMemo(() => roundedCylGeo(0.34, 0.14, 0.06, 48), []);
  return (
    <SoftPanel w={W} h={0.92} thick={0.24} color="#FBF8F3">
      <mesh geometry={disc} position={[-W / 2 + 0.55, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <Gloss color={accent} />
      </mesh>
      <Txt size={0.3} color="#ffffff" position={[-W / 2 + 0.55, -0.01, 0.105]}>
        {String(n)}
      </Txt>
      <Txt size={fs} color={C.deepNavy} anchorX="left" position={[-W / 2 + 1.08, -0.01, 0.02]}>
        {text}
      </Txt>
    </SoftPanel>
  );
};

/** নম্বর-disc (shelf/recap-এ বস্তুর পাশে) */
const NumDisc: React.FC<{ n: number; color: string }> = ({ n, color }) => {
  const g = useMemo(() => roundedCylGeo(0.2, 0.1, 0.045, 40), []);
  return (
    <group>
      <mesh geometry={g} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <Gloss color={color} />
      </mesh>
      <Txt size={0.2} color="#ffffff" position={[0, -0.005, 0.07]}>
        {String(n)}
      </Txt>
    </group>
  );
};

/** মঞ্চের pedestal (cream clay, accent রিং) — উপরের তল y = 0 */
const Pedestal: React.FC<{ accent: string; squash: number }> = ({ accent, squash }) => {
  const body = useMemo(() => roundedCylGeo(0.95, 0.42, 0.14, 96), []);
  const top = useMemo(() => roundedCylGeo(0.8, 0.06, 0.03, 96), []);
  return (
    <group scale={[1 + squash * 0.5, 1 - squash, 1 + squash * 0.5]}>
      <mesh geometry={body} position={[0, -0.21, 0]} castShadow receiveShadow>
        <ClayMat color="#F6F0E8" rough={0.62} />
      </mesh>
      <mesh geometry={top} position={[0, 0.015, 0]} receiveShadow>
        <Gloss color={accent} rough={0.5} coat={0.3} />
      </mesh>
    </group>
  );
};

export const ScenePoints: React.FC<{ t: number; dur: number; cue: Cue; data: PointsData }> = ({ t, dur, cue, data }) => {
  const pr = PROFILES[data.industry];
  const pts = data.points.slice(0, 5);
  const n = pts.length;

  // ---------- timing (cue → fallback ভগ্নাংশ) ----------
  const tTitle = Math.min(at(cue, data.titleWord, 0.2), 0.3); // title = intro, ফাঁকা stage নয় (D3)
  const tp: number[] = [];
  pts.forEach((p, i) => {
    const fb = dur * (0.14 + (0.6 * i) / Math.max(1, n - 1));
    let v = at(cue, p.word, fb, i ? tp[i - 1] + 0.05 : 0);
    if (i) v = Math.max(v, tp[i - 1] + 0.7);
    tp.push(v);
  });
  const OUT = dur - 0.5;
  const tSum = clamp(tp[n - 1] + 1.8, tp[n - 1] + 0.9, OUT - 1.3);
  const dock = (i: number) => (i < n - 1 ? tp[i + 1] - 0.32 : tSum);

  // ---------- layout ----------
  const PED = atFloor(0.5, 0.715, cam);
  const pedS = worldWidth(0.5, PED[2], cam) / 1.9;
  const heroW = worldWidth(0.44, PED[2], cam);
  const pedTop = PED[1] + 0.42 * pedS;
  const heroPos: V3 = [PED[0], pedTop + heroW * 0.52, PED[2]];
  const SZ = 1.0;
  const gap = Math.min(0.27, 0.92 / n);
  const shelfW = worldWidth(gap * 0.6, SZ, cam);
  const shelfPos = (i: number): V3 => atScreen(0.5 + (i - (n - 1) / 2) * gap, 0.205, SZ, cam);
  // recap grid
  const rows = n <= 3 ? [n] : n === 4 ? [2, 2] : [3, 2];
  const rowOf = (i: number) => (i < rows[0] ? 0 : 1);
  const colOf = (i: number) => (i < rows[0] ? i : i - rows[0]);
  const rgap = rows.length === 1 ? 0.31 : rows[0] === 2 ? 0.4 : 0.3;
  const recapFrac = rgap * 0.62;
  const recapW = worldWidth(recapFrac, SZ, cam);
  const recapY = (r: number) => (rows.length === 1 ? 0.42 : r === 0 ? 0.3 : 0.52); // নিচের row-এর label floor রেখার (z1 → 0.667) উপরে
  const recapPos = (i: number): V3 => {
    const r = rowOf(i), c = colOf(i);
    return atScreen(0.5 + (c - (rows[r] - 1) / 2) * rgap, recapY(r), SZ, cam);
  };

  // pedestal: শুরুতে ওঠে, recap-এ নামে; প্রতিটা নামার সময় squash
  const land = tp.reduce((s, v) => s + Math.max(0, wobble(t - v - 0.22, 0.07, 3.2, 0.25)), 0);
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.06 * drift(t, 1), cam.pos[1] + 0.05 * drift(t, 4), cam.pos[2] - 0.35 * range(t, 0, dur)] };

  const outK = (tt: number) => (tt > OUT ? Math.max(0, 1 - backIn(Math.min(1, (tt - OUT) / 0.38))) : 1);

  return (
    <Stage cam={camLive}>
      {/* title */}
      <Life t={t} a={tTitle} b={OUT} kind="pop" position={atScreen(0.5, 0.075, 2, cam)} scale={worldWidth(0.8, 2, cam) / (Math.min(5.2, data.title.length * 0.36 * 0.64) + 1.45)}>
        <TitlePlate title={data.title} accent={pr.board} emblem={pr.emblem} t={t - tTitle} a2={pr.accent2} />
      </Life>

      {/* pedestal */}
      <Life t={t} a={Math.min(tTitle + 0.15, tp[0] - 0.3)} b={tSum - 0.1} kind="rise" exit="sink" position={[PED[0], pedTop, PED[2]]} scale={pedS}>
        <Pedestal accent={pr.accent} squash={land} />
      </Life>

      {/* hero labels */}
      {pts.map((p, i) => {
        const L = atScreen(0.5, 0.84, 8, cam); // floor রেখা z8-এ 0.92 — label floor-এ কাটে না (D9)
        const fs = 0.34;
        const W = p.label.length * fs * 0.66 + 1.3;
        const s = worldWidth(Math.min(0.88, 0.05 * p.label.length + 0.2), 8, cam) / W;
        return (
          <Life key={"l" + i} t={t} a={tp[i] + 0.15} b={dock(i) - 0.05} kind="pop" position={L} scale={s} outDur={0.3}>
            <LabelPlate text={p.label} n={i + 1} accent={pr.accent} />
          </Life>
        );
      })}

      {/* objects: hero → shelf → recap */}
      {pts.map((p, i) => {
        if (t < tp[i]) return null;
        const kind = p.icon ?? pr.defaults[i % pr.defaults.length];
        const lt = t - tp[i];
        const td = dock(i);
        const last = i === n - 1;
        // hero drop (উপর থেকে নেমে pedestal-এ squash)
        const drop = springStep(lt, { k: 150, c: 13 });
        const pop = popIn(t, tp[i], { k: 240, c: 15 });
        let pos: V3 = [heroPos[0], heroPos[1] + (1 - drop) * 3.2, heroPos[2]];
        let s = heroW * Math.max(0.001, Math.min(1.15, 0.35 + 0.65 * pop.s));
        let sy = 1 - wobble(lt - 0.2, 0.1, 3, 0.25);
        let spin = 0;
        // flight → shelf (বা শেষেরটা সরাসরি recap)
        const fk = emphDecel(range(t, td, td + 0.7));
        if (fk > 0) {
          const target = last ? recapPos(i) : shelfPos(i);
          const tw = last ? recapW : shelfW;
          pos = lerp3(pos, target, fk);
          pos[1] += Math.sin(Math.PI * fk) * 0.9;
          s = s + (tw - s) * fk;
          spin = Math.sin(Math.PI * fk) * 0.6;
          sy = 1;
        }
        // shelf → recap
        if (!last) {
          const rk = emphDecel(range(t, tSum + 0.05 * i, tSum + 0.75 + 0.05 * i));
          if (rk > 0) {
            pos = lerp3(shelfPos(i), recapPos(i), rk);
            pos[1] += Math.sin(Math.PI * rk) * 0.35;
            s = shelfW + (recapW - shelfW) * rk;
          }
        }
        const docked = t > td + 0.7;
        if (docked) pos = [pos[0], pos[1] + 0.05 * Math.sin(t * 1.6 + i * 1.3), pos[2]];
        const o = outK(t - i * 0.025);
        if (o <= 0.001) return null;
        return (
          <group key={"o" + i} position={pos} scale={[s * o, s * o * sy, s * o]} rotation={[0, spin + (docked ? 0.12 * Math.sin(t * 0.9 + i) : 0), 0]}>
            <Icon3D kind={kind} t={lt} accent={pr.accent} accent2={pr.accent2} text={p.text} />
          </group>
        );
      })}

      {/* shelf/recap number discs + short labels */}
      {pts.map((p, i) => {
        const last = i === n - 1;
        const td = dock(i);
        const a = td + 0.55;
        if (t < a) return null;
        const rk = last ? 1 : emphDecel(range(t, tSum + 0.05 * i, tSum + 0.75 + 0.05 * i));
        const base = last ? recapPos(i) : lerp3(shelfPos(i), recapPos(i), rk);
        const frac = last ? recapFrac : gap * 0.6 + (recapFrac - gap * 0.6) * rk;
        const w = worldWidth(frac, SZ, cam);
        const label = p.short ?? p.label;
        const slot = last ? rgap : gap + (rgap - gap) * rk;
        const lw = worldWidth(Math.min(slot * 0.95, label.length * 0.04 + 0.07), SZ, cam);
        const fs = 0.3;
        const W = label.length * fs * 0.64 + 0.5;
        return (
          <React.Fragment key={"d" + i}>
            <Life t={t} a={a} b={OUT} kind="pop" position={[base[0] - w * 0.56, base[1] + w * 0.46, base[2] + 0.4]} scale={w * 0.85}>
              <NumDisc n={i + 1} color={pr.accent} />
            </Life>
            <Life t={t} a={a + 0.08} b={OUT} kind="pop" position={[base[0], base[1] - w * 0.68, base[2] + 0.2]} scale={lw / W}>
              <SoftPanel w={W} h={0.62} thick={0.16} color="#FBF8F3">
                <Txt size={fs} color={C.deepNavy} position={[0, -0.01, 0.015]}>
                  {label}
                </Txt>
              </SoftPanel>
            </Life>
          </React.Fragment>
        );
      })}
    </Stage>
  );
};
