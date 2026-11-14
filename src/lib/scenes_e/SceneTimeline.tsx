// SceneTimeline — দিন/সপ্তাহ বা payment milestone: নরম clay রাস্তা নিচ থেকে এঁকেবেঁকে উপরে, পাশে station pedestal।
// একজন মানুষ প্রতিটা station-এর শব্দে হেঁটে পৌঁছায় → station জ্বলে, label tag ওঠে, উপরে hero zone-এ সেই ধাপের object
// কাজ করে, বামে desk calendar নতুন দিনে উল্টায়, সবার উপরে "elapsed" progress bar ভরে। payment থাকলে কয়েন station-এর
// পাশে জমে আর price tag দোলে। পরের station এলে object ছোট হয়ে আগের pedestal-এর উপরে বসে। শেষে সব বেরিয়ে যায়।
import React, { useMemo } from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { springStep, wobble, popIn, smoothstep, range, drift, pathDistance, speedAt, headingAt } from "../../kit/anim";
import { ClayMat, Txt } from "../../kit/Clay";
import { roundedCylGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar, Inset } from "../../kit/Soft";
import { Tag } from "../../kit/Clock";
import { C } from "../../kit/theme";
import { PriceTag } from "../../web11/props";
import { ActObject, ACT_HALF } from "./objects";
import { Coin as LibCoin } from "../money/Coin";
import { ActKind, Cue, Industry, Life, Walker, THEMES, backIn, mixHex, resolveBeats, k01, G, P } from "./common";

export type TimelineStation = {
  /** station-এর tag (English), যেমন "MOCKUP" */
  label: string;
  /** কোন দিনে/সপ্তাহে (calendar ও progress bar-এ) */
  at: number;
  /** VO-র যে শব্দে মানুষ এই station-এর দিকে হাঁটা শুরু করে */
  cue?: string;
  icon?: ActKind;
  /** object-এর ভেতরের লেখা (chat message, key tag …) */
  text?: string;
  lines?: string[];
  /** payment milestone, যেমন "50% ADVANCE" — কয়েন + দোলা price tag */
  pay?: string;
  payCue?: string;
};
export type TimelineData = {
  industry: Industry;
  /** "DAY" | "WEEK" | "MONTH" */
  unit: string;
  /** progress bar-এর শেষ মান (না দিলে শেষ station-এর at) */
  total?: number;
  title?: string;
  stations: TimelineStation[]; // 3–5
};

const cam: Cam = DEFAULT_CAM;
const HERO_Z = 1.5;
const WALK = 0.95;
const FLY = 0.55;
const DOC_S = 1.05;
const MINI = 0.4;

// ---------------------------------------------------------------- road (flat clay tube + orange progress)
const TUB = 240,
  RAD = 20;
const Road: React.FC<P & { curve: THREE.CatmullRomCurve3; grow: number; prog: number; accent: string; w?: number }> = ({ curve, grow, prog, accent, w = 0.36, ...p }) => {
  const base = useMemo(() => new THREE.TubeGeometry(curve, TUB, w, RAD, false), [curve, w]);
  const top = useMemo(() => new THREE.TubeGeometry(curve, TUB, w * 0.5, RAD, false), [curve, w]);
  const cap = useMemo(() => new THREE.SphereGeometry(1, 32, 16), []);
  const gN = Math.max(0, Math.min(TUB, Math.round(grow * TUB)));
  const pN = Math.max(0, Math.min(gN, Math.round(prog * TUB)));
  base.setDrawRange(0, gN * RAD * 6);
  top.setDrawRange(0, pN * RAD * 6);
  if (gN < 1) return null;
  const at = (u: number) => curve.getPointAt(k01(u));
  const roadMat = <ClayMat color="#F1E6D8" rough={0.7} />;
  const orMat = <meshPhysicalMaterial color={accent} roughness={0.42} clearcoat={0.45} clearcoatRoughness={0.3} sheen={0.35} sheenColor="#ffe0c0" />;
  return (
    <G {...p}>
      <group scale={[1, 0.14, 1]}>
        <mesh geometry={base} castShadow receiveShadow>
          {roadMat}
        </mesh>
        {[at(0), at(gN / TUB)].map((c, i) => (
          <mesh key={i} geometry={cap} position={c.toArray()} scale={w} receiveShadow>
            {roadMat}
          </mesh>
        ))}
      </group>
      {pN >= 1 && (
        <group scale={[1, 0.42, 1]}>
          <mesh geometry={top} receiveShadow>
            {orMat}
          </mesh>
          {[at(0), at(pN / TUB)].map((c, i) => (
            <mesh key={i} geometry={cap} position={c.toArray()} scale={w * 0.5}>
              {orMat}
            </mesh>
          ))}
        </group>
      )}
    </G>
  );
};

// ---------------------------------------------------------------- station pedestal
const ST = { r: 0.5, h: 0.34 };
const ST_TOP = ST.h + 0.05;
const Station: React.FC<P & { lit: number; done: number; accent: string }> = ({ lit, done, accent, ...p }) => {
  const body = useMemo(() => roundedCylGeo(ST.r, ST.h, 0.1), []);
  const disc = useMemo(() => roundedCylGeo(ST.r * 0.8, 0.07, 0.03), []);
  const top = mixHex(mixHex("#E4DACD", accent, lit), C.green, done);
  return (
    <G {...p}>
      <mesh geometry={body} position={[0, ST.h / 2, 0]} castShadow receiveShadow>
        <ClayMat color={C.clay} />
      </mesh>
      <mesh geometry={disc} position={[0, ST.h + 0.01, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={top} roughness={0.4} clearcoat={0.5} clearcoatRoughness={0.3} sheen={0.3} sheenColor="#ffe2c4" emissive={top} emissiveIntensity={0.07 * lit} />
      </mesh>
    </G>
  );
};

// ---------------------------------------------------------------- elapsed progress card
const ProgressStrip: React.FC<P & { w: number; k: number; left: string; right: string; now: string; accent: string }> = ({ w, k, left, right, now, accent, ...p }) => {
  const tw = w - 0.7,
    th = 0.24;
  const kk = k01(k);
  const fw = Math.max(th, tw * kk);
  return (
    <SoftPanel w={w} h={0.92} thick={0.24} color="#FFFDF8" {...p}>
      <Txt size={0.16} color={C.steel} anchorX="left" position={[-tw / 2, 0.22, 0.012]}>
        {left}
      </Txt>
      <Txt size={0.16} color={C.steel} anchorX="right" position={[tw / 2, 0.22, 0.012]}>
        {right}
      </Txt>
      <Txt size={0.2} color={kk >= 0.999 ? "#1F8A52" : C.deepNavy} position={[0, 0.22, 0.012]}>
        {now}
      </Txt>
      <Inset position={[0, -0.15, 0]} w={tw + 0.08} h={th + 0.08} color="#E9E1D6" />
      <RaisedBar position={[-tw / 2 + fw / 2, -0.15, -0.004]} w={fw} h={th} d={0.06} radius={th / 2} color={kk >= 0.999 ? C.green : accent} />
    </SoftPanel>
  );
};

export const SceneTimeline: React.FC<{ t: number; dur: number; cue: Cue; data: TimelineData }> = ({ t, dur, cue, data }) => {
  const th = THEMES[data.industry];
  const st = data.stations.slice(0, 5);
  const N = st.length;
  // calendar আগেই বামে আছে — station object-এ দ্বিতীয় calendar নয়
  const kinds = st.map((s, i): ActKind => {
    const k = s.icon ?? (s.pay ? "pay" : th.icons[i % th.icons.length]);
    return k === "calendar" ? (s.pay ? "pay" : "check") : k;
  });
  const total = data.total ?? st[N - 1].at;
  const OUT = dur - 0.6;

  // ---- timing: beat = হাঁটা শুরু, arrive = পৌঁছানো ----
  const beats = useMemo(() => resolveBeats(cue, st.map((s) => s.cue), Math.max(0.9, dur * 0.07), dur * 0.74, WALK + 0.35), [cue, dur, N]);
  const arrive = beats.map((b) => b + WALK);
  const payT = useMemo(() => st.map((s, i) => (s.pay ? (() => { const v = s.payCue ? cue(s.payCue, beats[i]) : NaN; return isFinite(v) && v < (beats[i + 1] ?? OUT) - 0.4 ? Math.max(v, arrive[i] - 0.2) : arrive[i] + 0.45; })() : NaN)), [cue, beats]);

  // ---- layout: রাস্তা নিচ-মাঝ থেকে এঁকেবেঁকে উপরে, station বাঁকের বাইরের দিকে ----
  const L = useMemo(() => {
    const py = (i: number) => 0.89 - (i * 0.215) / Math.max(1, N - 1);
    const side = (i: number) => (i % 2 === 0 ? -1 : 1);
    const R = st.map((_, i) => atFloor(0.5 + side(i) * 0.085, py(i), cam));
    const S = st.map((_, i) => atFloor(0.5 + side(i) * 0.3, py(i) - 0.008, cam));
    const start = atFloor(0.5, 0.945, cam);
    const end = atFloor(0.5 - side(N - 1) * 0.04, py(N - 1) - 0.02, cam);
    const curve = new THREE.CatmullRomCurve3([start, ...R, end].map((p) => new THREE.Vector3(p[0], 0, p[2])), false, "centripetal");
    const U = R.map((r) => {
      let best = 0,
        bd = 1e9;
      for (let i = 0; i <= 600; i++) {
        const p = curve.getPointAt(i / 600);
        const d = Math.hypot(p.x - r[0], p.z - r[2]);
        if (d < bd) {
          bd = d;
          best = i / 600;
        }
      }
      return best;
    });
    return { R, S, curve, U, side: st.map((_, i) => side(i)) };
  }, [N]);

  const walks: [number, number, number, number][] = beats.map((b, i) => [b, b + WALK, i === 0 ? 0 : L.U[i - 1], L.U[i]]);
  const docU = (tt: number) => {
    let u = 0;
    for (const [a, b, u0, u1] of walks) if (tt >= a) u = u0 + (u1 - u0) * smoothstep(a, b, tt);
    return u;
  };
  const docXZ = (tt: number): [number, number] => {
    const p = L.curve.getPointAt(k01(docU(tt)));
    return [p.x, p.z];
  };
  let cur = -1;
  arrive.forEach((a, i) => {
    if (t >= a - 0.05) cur = i;
  });
  let heading = -1;
  beats.forEach((b, i) => {
    if (t >= b) heading = i;
  });

  // ---- road ----
  const grow = smoothstep(0.15, Math.max(0.9, beats[0] - 0.1), t);
  const prog = docU(t);
  const roadOut = t > OUT ? k01((t - OUT) / 0.4) : 0;

  // ---- figure ----
  const t0 = Math.max(0.35, beats[0] - 0.5);
  const [dx, dz] = docXZ(t);
  const walkK = Math.min(1, speedAt(docXZ, t) / 0.9);
  const dist = pathDistance(docXZ, t0, t, 1 / 60);
  const stopFace = cur >= 0 ? L.side[cur] * 0.6 : 0;
  const head = headingAt(docXZ, t, stopFace);
  const face = stopFace + (head - stopFace) * Math.min(1, walkK * 1.5);
  const cheer = range(t, arrive[N - 1] + 0.35, arrive[N - 1] + 0.65) * (1 - range(t, OUT - 0.35, OUT - 0.05));

  // ---- elapsed ----
  const atVal = (i: number) => (i < 0 ? 0 : st[i].at);
  const nowVal = heading < 0 ? 0 : atVal(heading - 1) + (atVal(heading) - atVal(heading - 1)) * smoothstep(beats[heading], arrive[heading], t);
  const unit = data.unit.toUpperCase();

  // ---- hero zone ----
  const HW = worldWidth(1, HERO_Z, cam);
  const HERO = atScreen(0.665, 0.275, HERO_Z, cam);
  const HS = (HW * 0.36) / 1.4;
  const CALP = atScreen(0.255, 0.285, HERO_Z, cam);
  const CALS = (HW * 0.27) / 1.24;
  const calIdx = cur;
  const calAct = calIdx >= 0 ? range(t, arrive[calIdx] - 0.25, arrive[calIdx] + 0.6) : 0;

  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 2), cam.pos[1] + 0.04 * drift(t, 5), cam.pos[2]] };

  const objs: React.ReactNode[] = [];
  st.forEach((s, i) => {
    const a0 = arrive[i] - 0.15;
    const leave = i < N - 1 ? arrive[i + 1] - 0.25 : 999;
    if (t < a0 || t > OUT + 0.5) return;
    const act = range(t, a0 + 0.2, a0 + 0.2 + Math.min(1.7, ((i < N - 1 ? arrive[i + 1] : OUT) - a0) * 0.7));
    const pin = popIn(t, a0, { k: 220, c: 14 });
    const sp = L.S[i];
    const mini = MINI * Math.min(1, 0.55 / ACT_HALF[kinds[i]]);
    const dock: [number, number, number] = [sp[0], FLOOR + ST_TOP + ACT_HALF[kinds[i]] * mini, sp[2]];
    const fk = smoothstep(0, 1, k01((t - leave) / FLY));
    let pos: [number, number, number] = [HERO[0], HERO[1] + 0.04 * Math.sin(t * 1.3 + i), HERO[2]];
    let sc = HS * Math.max(0.0001, pin.s);
    let sx = pin.sx,
      sy = pin.sy;
    if (t > leave) {
      pos = [pos[0] + (dock[0] - pos[0]) * fk, pos[1] + (dock[1] - pos[1]) * fk + Math.sin(Math.PI * fk) * 0.6, pos[2] + (dock[2] - pos[2]) * fk];
      sc = HS + (mini - HS) * fk;
      const sq = fk >= 1 ? wobble(t - leave - FLY, 0.14, 2.6, 0.25) : 0;
      sx = 1 - sq * 0.5;
      sy = 1 + sq;
    }
    if (t > OUT) sc *= Math.max(0.0001, 1 - backIn(k01((t - OUT - i * 0.04) / 0.36)));
    objs.push(
      <group key={i} position={pos} scale={[sc * sx, sc * sy, sc]} rotation={[0, t > leave ? -L.side[i] * 0.3 * fk : 0.12 * Math.sin(t * 0.6 + i), 0]}>
        <ActObject kind={kinds[i]} act={act} t={t} accent={th.accent} text={kinds[i] === "pay" ? undefined : s.text} lines={s.lines} unit={unit} from={String(atVal(i - 1))} to={String(s.at)} />
      </group>
    );
  });

  return (
    <Stage cam={camLive}>
      {/* ===== elapsed bar ===== */}
      <Life t={t} a={0.2} b={OUT} kind="pop" position={atScreen(0.5, 0.085, HERO_Z, cam)}>
        <ProgressStrip w={HW * 0.84} k={nowVal / Math.max(1, total)} left={`${unit} 0`} right={`${unit} ${total}`} now={data.title && heading < 0 ? data.title : `${unit} ${Math.round(nowVal)}`} accent={th.accent} />
      </Life>

      {/* ===== calendar ===== */}
      <Life t={t} a={Math.max(0.4, beats[0] - 0.2)} b={OUT} kind="pop" position={CALP} scale={CALS} rotation={[0, 0.22, wobble(t - arrive[Math.max(0, calIdx)], 0.05, 1.4, 0.2)]}>
        <ActObject kind="calendar" act={calAct} t={t} accent={th.accent} unit={unit} from={String(atVal(calIdx - 1))} to={String(atVal(calIdx))} />
      </Life>

      {/* ===== road + stations ===== */}
      {roadOut < 1 && <Road curve={L.curve} grow={grow} prog={prog} accent={th.accent} position={[0, FLOOR - roadOut * roadOut * 0.4, 0]} scale={[1, Math.max(0.001, 1 - roadOut), 1]} />}
      {st.map((s, i) => {
        const lit = range(t, arrive[i] - 0.2, arrive[i] + 0.15);
        const done = i === N - 1 ? range(t, arrive[i] + 0.3, arrive[i] + 0.6) : range(t, arrive[i + 1] - 0.3, arrive[i + 1]);
        const sp = L.S[i];
        return (
          <React.Fragment key={i}>
            <Life t={t} a={0.35 + i * 0.12} b={OUT + i * 0.04} kind="pop" position={sp}>
              <Station lit={lit} done={done} accent={th.accent} />
            </Life>
            <Life t={t} a={arrive[i] - 0.1} b={OUT + i * 0.04} kind="pop" position={[sp[0], FLOOR + 0.2, sp[2] + 0.66]}>
              <group rotation={[0, 0, wobble(t - arrive[i], 0.06, 1.4, 0.15)]}>
                <Tag text={s.label} size={0.17} color={i === N - 1 && done > 0.5 ? "#1F9D55" : C.navy} />
              </group>
            </Life>
            {s.pay && kinds[i] !== "pay" &&
              [0, 1, 2].map((j) => (
                <Life key={j} t={t} a={payT[i] + 0.15 + j * 0.1} b={OUT + j * 0.02} kind="drop" dropH={1.4} position={[sp[0] - L.side[i] * 0.7, FLOOR + 0.03 + j * 0.054, sp[2] - 0.25]} scale={0.62} rotation={[0, j * 0.6, 0]}>
                  <LibCoin scale={0.84} detail={false} />
                </Life>
              ))}
          </React.Fragment>
        );
      })}

      {/* ===== walker ===== */}
      <Life t={t} a={t0} b={OUT} kind="pop" exit="shrink" position={[dx, FLOOR, dz]} scale={DOC_S}>
        <Walker t={t} dist={dist} walk={walkK} cheer={cheer} rotationY={face} />
      </Life>

      {/* ===== station objects ===== */}
      {objs}

      {/* ===== payment tags ===== */}
      {st.map((s, i) =>
        s.pay ? (
          <Life key={i} t={t} a={payT[i]} b={Math.min(OUT, (arrive[i + 1] ?? OUT + 0.5) - 0.45)} kind="pop" position={atScreen(0.5, 0.46, HERO_Z, cam)} scale={(HW * 0.5) / Math.max(2.4, s.pay.length * 0.2 + 0.9)} rotation={[0, 0, wobble(t - payT[i], 0.07, 1.3, 0.12)]}>
            <PriceTag text={s.pay} w={Math.max(2.4, s.pay.length * 0.2 + 0.9)} h={1.0} color={i === N - 1 ? C.navy : th.accent} />
          </Life>
        ) : null
      )}

    </Stage>
  );
};
