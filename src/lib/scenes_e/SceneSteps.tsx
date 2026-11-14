// SceneSteps — "৩–৫টা ধাপ মেনে চলুন": নরম clay সিঁড়ি (প্রতিটা ধাপ একটা block, সামনে বড় নম্বর), একজন মানুষ প্রতিটা ধাপের
// শব্দে লাফিয়ে উপরের ধাপে ওঠে; উপরে hero zone-এ সেই ধাপের অর্থবহ object নিজের কাজ করে (ফোন বাজে, calendar উল্টায়,
// কয়েন পড়ে …), নিচে label plate। পরের ধাপ এলে object ছোট হয়ে নিজের ধাপের tread-এ গিয়ে বসে (অগ্রগতি চোখে দেখা যায়)।
// শেষে সবুজ check + মানুষ আনন্দে হাত তোলে; scene শেষে সব বেরিয়ে যায়। সব লেখা data থেকে (English 3D)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, Cam, FLOOR, FLOOR_CLIP } from "../../kit/Stage";
import { springStep, wobble, popIn, smoothstep, range, drift } from "../../kit/anim";
import { ClayMat, Txt } from "../../kit/Clay";
import { slabGeo, roundedCylGeo } from "../../kit/Geo";
import { SoftPanel } from "../../kit/Soft";
import { Tag } from "../../kit/Clock";
import { C } from "../../kit/theme";
import { ActObject, ACT_HALF } from "./objects";
import { ActKind, Cue, Industry, Life, Walker, THEMES, backIn, mixHex, resolveBeats, k01 } from "./common";

export type StepItem = {
  /** plate-এ বড় লেখা (English), যেমন "BOOK A SERIAL" */
  label: string;
  /** VO-র যে শব্দে এই ধাপ শুরু */
  cue?: string;
  /** object — না দিলে industry-র default ক্রম */
  icon?: ActKind;
  /** object-এর ভেতরের ছোট লেখা: chat message, price tag, calendar date, key tag … */
  text?: string;
  /** form object-এর লাইন */
  lines?: string[];
  /** calendar: header (যেমন "NOV") আর আগের তারিখ (উল্টানোর আগে) */
  unit?: string;
  from?: string;
};
export type StepsData = {
  industry: Industry;
  /** উপরের শিরোনাম, যেমন "4 STEPS TO YOUR SERIAL" */
  title?: string;
  steps: StepItem[]; // 3–5
  /** শেষের সবুজ check-এর লেখা + শব্দ (ঐচ্ছিক) */
  doneLabel?: string;
  doneCue?: string;
};

const CAM: Cam = { pos: [0, 3.5, 20.5], target: [0, -0.55, 0], fov: 27 };
const HERO_Z = 1.6;
const ROT = -0.36; // সিঁড়ির 3/4 কোণ
const FIG_S = 0.92;
const MOVE = 0.62;
const FLY = 0.55;

const rotY = (x: number, z: number, a: number): [number, number] => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];

export const SceneSteps: React.FC<{ t: number; dur: number; cue: Cue; data: StepsData }> = ({ t, dur, cue, data }) => {
  const th = THEMES[data.industry];
  const steps = data.steps.slice(0, 5);
  const N = steps.length;
  const kinds = steps.map((s, i) => s.icon ?? th.icons[i % th.icons.length]);

  // ---- timing ----
  const OUT = dur - 0.6;
  const beats = useMemo(() => resolveBeats(cue, steps.map((s) => s.cue), Math.max(0.95, dur * 0.08), dur * (N >= 5 ? 0.76 : 0.72), 1.05), [cue, dur, N]);
  const lastIsCheck = kinds[N - 1] === "check";
  const doneAt = useMemo(() => {
    if (lastIsCheck) return NaN;
    let d = data.doneCue ? cue(data.doneCue, beats[N - 1] + 0.6) : NaN;
    if (!isFinite(d)) d = Math.min(beats[N - 1] + 1.9, OUT - 1.1);
    return d >= beats[N - 1] + 0.9 && d <= OUT - 0.7 ? d : NaN;
  }, [cue, beats, OUT]);
  const hasDone = isFinite(doneAt);

  // ---- layout ----
  const SW = N >= 5 ? 0.74 : N === 4 ? 0.86 : 1.0;
  const GAP = 0.05;
  const RISE = Math.min(0.5, 2.0 / N);
  const SD = 1.25;
  const base = atFloor(0.5, 0.83, CAM);
  const GX = base[0] + 0.17,
    GZ = base[2];
  const xi = (i: number) => (i - (N - 1) / 2) * (SW + GAP);
  const hi = (i: number) => (i + 1) * RISE;
  const toWorld = (lx: number, ly: number, lz: number): [number, number, number] => {
    const [x, z] = rotY(lx, lz, ROT);
    return [GX + x, FLOOR + ly, GZ + z];
  };

  const HW = worldWidth(1, HERO_Z, CAM);
  const HERO = atScreen(0.5, 0.29, HERO_Z, CAM);
  const HS = (HW * 0.44) / 1.4;
  const MINI = 0.36;
  const PLATE = atScreen(0.5, 0.485, HERO_Z, CAM);
  const PW = HW * 0.7;

  // ---- figure ----
  const startL: [number, number, number] = [xi(0) - SW * 0.2, 0, SD * 0.95];
  const standL = (i: number): [number, number, number] => (i < 0 ? startL : [xi(i), hi(i), SD * 0.08]);
  let cur = -1;
  beats.forEach((b, i) => {
    if (t >= b) cur = i;
  });
  const mvK = cur >= 0 ? smoothstep(0, 1, k01((t - beats[cur]) / MOVE)) : 1;
  const A = standL(cur - 1),
    B = standL(cur);
  const fl: [number, number, number] =
    cur < 0 ? startL : [A[0] + (B[0] - A[0]) * mvK, A[1] + (B[1] - A[1]) * mvK + Math.sin(Math.PI * mvK) * (0.42 + RISE * 0.4), A[2] + (B[2] - A[2]) * mvK];
  const moving = cur >= 0 && mvK > 0 && mvK < 1;
  const walk = moving ? Math.sin(Math.PI * mvK) : 0;
  const land = cur >= 0 ? wobble(t - beats[cur] - MOVE, 0.12, 2.6, 0.3) : 0;
  const dist = cur >= 0 ? (cur + mvK) * SW * 1.2 : 0;
  const cheerAt = hasDone ? doneAt : beats[N - 1] + 1.2;
  const cheer = range(t, cheerAt, cheerAt + 0.3) * (1 - range(t, OUT - 0.4, OUT - 0.1));
  const face = moving ? Math.PI / 2 - 0.15 : 0.22 + 0.06 * Math.sin(t * 0.8);
  const figW = toWorld(fl[0], fl[1], fl[2]);

  // ---- geo ----
  const blocks = useMemo(() => steps.map((_, i) => slabGeo(SW, hi(i), SD, 0.16, 0.1, 7)), [N]);
  const pad = useMemo(() => slabGeo(SW * 0.78, 0.07, SD * 0.74, 0.12, 0.03, 4), [N]);
  const disc = useMemo(() => roundedCylGeo(0.24, 0.12, 0.05), []);

  const camLive: Cam = { ...CAM, pos: [CAM.pos[0] + 0.06 * drift(t, 3), CAM.pos[1] + 0.05 * drift(t, 7), CAM.pos[2]] };

  // plate text swap
  const plateIdx = hasDone && t >= doneAt ? N : cur;
  const swapAt = plateIdx >= N ? doneAt : plateIdx >= 0 ? beats[plateIdx] : -9;
  const flipSY = Math.abs(t - swapAt) < 0.14 ? Math.abs(t - swapAt) / 0.14 : 1;
  const plateLabel = plateIdx >= N ? data.doneLabel ?? "DONE" : plateIdx >= 0 ? steps[plateIdx].label : "";
  const plateNum = plateIdx >= N ? "" : String(plateIdx + 1);
  const lfs = Math.min(0.3, (PW - (plateNum ? 1.05 : 0.5)) / Math.max(4, plateLabel.length * 0.64));

  const objs: React.ReactNode[] = [];
  steps.forEach((s, i) => {
    const b = beats[i];
    const leave = i < N - 1 ? beats[i + 1] - 0.05 : 999;
    // শেষ ধাপের object tread-এ নামে না (মানুষ ওখানে দাঁড়িয়ে) — done এলে ছোট হয়ে বেরোয়
    const lastOut = i === N - 1 && hasDone ? doneAt - 0.1 : 999;
    if (t < b + 0.06 || t > OUT + 0.5 || t > lastOut + 0.4) return;
    const act = range(t, b + 0.18, b + 0.18 + Math.min(1.7, ((i < N - 1 ? beats[i + 1] : OUT) - b) * 0.75));
    const pin = popIn(t, b + 0.1, { k: 220, c: 14 });
    const dockL: [number, number, number] = [xi(i), hi(i) + 0.075 + ACT_HALF[kinds[i]] * MINI, -SD * 0.2];
    const dock = toWorld(...dockL);
    const fk = smoothstep(0, 1, k01((t - leave) / FLY));
    let pos: [number, number, number] = [HERO[0], HERO[1] + 0.04 * Math.sin(t * 1.3 + i), HERO[2]];
    let sc = HS * Math.max(0.0001, pin.s);
    let sx = pin.sx,
      sy = pin.sy;
    if (t > leave) {
      pos = [pos[0] + (dock[0] - pos[0]) * fk, pos[1] + (dock[1] - pos[1]) * fk + Math.sin(Math.PI * fk) * 0.5, pos[2] + (dock[2] - pos[2]) * fk];
      sc = HS + (MINI - HS) * fk;
      const sq = fk >= 1 ? wobble(t - leave - FLY, 0.14, 2.6, 0.25) : 0;
      sx = 1 - sq * 0.5;
      sy = 1 + sq;
    }
    if (t > Math.min(OUT, lastOut)) {
      const e = k01((t - Math.min(OUT, lastOut) - i * 0.04) / 0.36);
      sc *= Math.max(0.0001, 1 - backIn(e));
    }
    const ry = t > leave ? ROT * fk + 0.25 * (1 - fk) * Math.sin(t * 0.5) : 0.12 * Math.sin(t * 0.6 + i);
    objs.push(
      <group key={i} position={pos} scale={[sc * sx, sc * sy, sc]} rotation={[0, ry, 0]}>
        <ActObject kind={kinds[i]} act={act} t={t} accent={th.accent} text={s.text} lines={s.lines} unit={s.unit} from={s.from} to={s.text} />
      </group>
    );
  });

  return (
    <Stage cam={camLive}>
      {/* ===== title ===== */}
      {data.title && (
        <Life t={t} a={0.25} b={OUT} kind="pop" position={atScreen(0.5, 0.085, HERO_Z, CAM)}>
          <Tag text={data.title} size={Math.min(0.24, (HW * 0.82) / Math.max(6, data.title.length * 0.7))} color={C.navy} />
        </Life>
      )}

      {/* ===== stairs ===== */}
      <group position={[GX, FLOOR, GZ]} rotation={[0, ROT, 0]}>
        {steps.map((_, i) => {
          const a = 0.12 + i * 0.1;
          const up = springStep(t - a, { k: 120, c: 13 });
          const down = t > OUT ? k01((t - OUT - (N - 1 - i) * 0.05) / 0.4) : 0;
          const y = -(1 - up) * (hi(i) + 0.3) - down * down * (hi(i) + 0.3);
          if (t < a || down >= 1) return null;
          const litK = range(t, beats[i] + MOVE * 0.8, beats[i] + MOVE + 0.15);
          const padCol = mixHex("#E5DACB", th.pad, litK);
          return (
            <group key={i} position={[xi(i), y, 0]}>
              <mesh geometry={blocks[i]} position={[0, hi(i) / 2, 0]} castShadow receiveShadow>
                <ClayMat color={i % 2 ? "#EFE4D6" : "#F4EBDF"} clip={FLOOR_CLIP} />
              </mesh>
              <mesh geometry={pad} position={[0, hi(i) + 0.035, 0]} receiveShadow castShadow>
                <meshPhysicalMaterial color={padCol} roughness={0.4} clearcoat={0.5} clearcoatRoughness={0.3} sheen={0.3} sheenColor="#ffe2c4" emissive={padCol} emissiveIntensity={0.06 * litK} clippingPlanes={FLOOR_CLIP} />
              </mesh>
              <Txt size={Math.min(0.36, hi(i) * 0.62)} color={litK > 0.5 ? th.accent : C.navy} position={[0, Math.max(hi(i) * 0.5, 0.2), SD / 2 + 0.012]}>
                {String(i + 1)}
              </Txt>
            </group>
          );
        })}
      </group>

      {/* ===== climber ===== */}
      <Life t={t} a={0.5} b={OUT + 0.1} kind="pop" position={figW} scale={FIG_S}>
        <Walker t={t} dist={dist} walk={walk} cheer={cheer} lean={moving ? 0.1 : 0} rotationY={ROT + face} squash={1 + land} />
      </Life>

      {/* ===== hero objects (current + docked) ===== */}
      {objs}

      {/* ===== done ===== */}
      {hasDone && (
        <Life t={t} a={doneAt + 0.32} b={OUT} kind="pop" position={HERO} scale={HS * 0.95}>
          <ActObject kind="check" act={range(t, doneAt + 0.4, doneAt + 1.2)} t={t} accent={th.accent} />
        </Life>
      )}

      {/* ===== label plate ===== */}
      {plateIdx >= 0 && (
        <Life t={t} a={beats[0] + 0.05} b={OUT} kind="pop" position={PLATE}>
          <group scale={[1, Math.max(0.001, flipSY) * (1 + wobble(t - swapAt - 0.14, 0.08, 2.2, 0.25)), 1]}>
            <SoftPanel w={PW} h={0.66} thick={0.22} color="#FFFDF8">
              {plateNum && (
                <group position={[-PW / 2 + 0.42, 0, 0.0]}>
                  <mesh geometry={disc} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <meshPhysicalMaterial color={th.accent} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} />
                  </mesh>
                  <Txt size={0.24} color="#ffffff" position={[0, -0.005, 0.075]}>
                    {plateNum}
                  </Txt>
                </group>
              )}
              <Txt size={lfs} color={plateIdx >= N ? "#1F8A52" : C.deepNavy} anchorX={plateNum ? "left" : "center"} position={[plateNum ? -PW / 2 + 0.8 : 0, -0.01, 0.012]}>
                {plateLabel}
              </Txt>
            </SoftPanel>
          </group>
        </Life>
      )}
    </Stage>
  );
};
