// Scene template: CHECKLIST — নরম clay clipboard (silver clip, cream কাগজ, header-এ title); প্রতিটা item নিজের শব্দে:
// উপরে তার অর্থবহ 3D বস্তু pop করে → pencil ঘরে tick টানে → চকচকে CheckBadge → বস্তু উড়ে row-এর icon-ঘরে বসে।
// শেষে (ঐচ্ছিক) industry emblem + "done" tag; তারপর সব বেরিয়ে যায়।
import React, { useMemo } from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, toScreen, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { springStep, wobble, popIn, range, emphDecel, expoOut, drift, clamp, tween } from "../../kit/anim";
import { ClayMat, SilverMat, Txt } from "../../kit/Clay";
import { Inset, CheckBadge, RaisedBar, SoftPanel } from "../../kit/Soft";
import { slabGeo, roundedCylGeo, latheGeo } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { Cue, Industry, IconKey, PROFILES, at, backIn, Life, Gloss, fitSize, k01 } from "./common";
import { Icon3D } from "./icons";

export type CheckItem = {
  label: string; // English 3D, e.g. "DOMAIN IN YOUR NAME"
  word: string; // এই শব্দে tick
  icon?: IconKey; // না দিলে industry default
  text?: string; // বস্তুর নিজের লেখা (calendar সংখ্যা ইত্যাদি)
};
export type ChecklistData = { industry: Industry; title: string; titleWord?: string; items: CheckItem[]; done?: string; doneWord?: string };

const cam: Cam = DEFAULT_CAM;
type V3 = [number, number, number];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// clipboard মাপ (local units)
const BW = 4.6;
const HEAD = 1.1;
const FOOT = 0.42;
const rowH = (n: number) => (n >= 5 ? 0.7 : 0.8);
const boardH = (n: number) => HEAD + n * rowH(n) + FOOT;
const PAPER_Z = 0.15; // কাগজের সামনের তল (board-এর কেন্দ্র থেকে)
const ICON_X = -BW / 2 + 0.78;
const LABEL_X = -BW / 2 + 1.25;
const CHECK_X = BW / 2 - 0.62;
const rowY = (n: number, r: number) => boardH(n) / 2 - HEAD - (r + 0.5) * rowH(n); // board কেন্দ্র থেকে

// ---------- pencil (lathe: কাঠের ডগা, কমলা দেহ, ধাতব band, গোলাপি eraser) — ডগা origin-এ, দেহ +y ----------
const Pencil: React.FC = () => {
  const tip = useMemo(() => latheGeo([[0.0, 0.0], [0.02, 0.012], [0.05, 0.07], [0.075, 0.16], [0.09, 0.24], [0.0, 0.24]], 32), []);
  const lead = useMemo(() => latheGeo([[0.0, 0.0], [0.016, 0.01], [0.026, 0.045], [0.0, 0.05]], 20), []);
  const body = useMemo(() => roundedCylGeo(0.09, 1.1, 0.02, 32), []);
  const band = useMemo(() => roundedCylGeo(0.095, 0.12, 0.025, 32), []);
  return (
    <group>
      <mesh geometry={tip} castShadow>
        <ClayMat color="#F1D2AA" rough={0.65} />
      </mesh>
      <mesh geometry={lead}>
        <ClayMat color={C.deepNavy} rough={0.5} />
      </mesh>
      <mesh geometry={body} position={[0, 0.24 + 0.55, 0]} castShadow>
        <Gloss color={C.orange} rough={0.45} coat={0.4} />
      </mesh>
      <mesh geometry={band} position={[0, 1.39, 0]} castShadow>
        <SilverMat color="#d7dbe0" rough={0.4} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <capsuleGeometry args={[0.088, 0.06, 8, 16]} />
        <ClayMat color="#E98A86" rough={0.6} />
      </mesh>
    </group>
  );
};

// ---------- clipboard (board + paper + clip) — origin = board কেন্দ্র ----------
const Clipboard: React.FC<{
  n: number;
  title: string;
  labels: string[];
  board: string;
  accent: string;
  rowIn: number[];
  tick: number[];
  flutter: number;
}> = ({ n, title, labels, board, accent, rowIn, tick, flutter }) => {
  const H = boardH(n);
  const rh = rowH(n);
  const bodyG = useMemo(() => slabGeo(BW, H, 0.2, 0.3, 0.08, 8), [H]);
  const paperG = useMemo(() => slabGeo(BW - 0.34, H - 0.42, 0.05, 0.12, 0.02, 4), [H]);
  const clipG = useMemo(() => slabGeo(1.7, 0.56, 0.16, 0.18, 0.06, 6), []);
  const leverG = useMemo(() => slabGeo(1.2, 0.2, 0.1, 0.09, 0.04, 4), []);
  const PH = H - 0.42;
  const muted = new THREE.Color("#8F99A6"), ink = new THREE.Color(C.deepNavy);
  return (
    <group>
      <mesh geometry={bodyG} castShadow receiveShadow>
        <Gloss color={board} rough={0.55} coat={0.25} />
      </mesh>
      {/* কাগজ: উপরের কিনারা থেকে হালকা দোলে (tick-এর ধাক্কায়) */}
      <group position={[0, H / 2 - 0.21, 0.125]} rotation={[flutter, 0, 0]}>
        <mesh geometry={paperG} position={[0, -PH / 2, 0]} receiveShadow castShadow>
          <ClayMat color="#FCFAF6" rough={0.75} bump={0.12} />
        </mesh>
        {/* content: board-কেন্দ্রিক y, কাগজের সামনের তলে */}
        <group position={[0, -(H / 2 - 0.21), 0.025]}>
          <Txt size={fitSize(title, BW - 1.0, 0.36, 0.66)} color={C.deepNavy} position={[0, H / 2 - HEAD * 0.52 - 0.05, 0.03]}>
            {title}
          </Txt>
          <RaisedBar position={[0, H / 2 - HEAD + 0.12, 0.0]} w={BW - 0.9} h={0.05} d={0.02} color={accent} />
          {labels.map((l, r) => {
            const y = rowY(n, r);
            const ri = k01(rowIn[r] ?? 0);
            const tk = k01(tick[r] ?? 0);
            if (ri <= 0.001) return null;
            const col = "#" + muted.clone().lerp(ink, tk).getHexString();
            return (
              <group key={r} position={[0, y, 0]}>
                {/* row highlight বাঁ থেকে ভরে */}
                {tk > 0.01 && (
                  <group position={[-(BW - 0.6) / 2, 0, 0.004]} scale={[tk, 1, 1]}>
                    <RaisedBar position={[(BW - 0.6) / 2, 0, 0]} w={BW - 0.6} h={rh - 0.14} d={0.014} radius={0.16} color="#F3E9DA" />
                  </group>
                )}
                {r > 0 && <RaisedBar position={[0.2, rh / 2, 0.0]} w={BW - 1.1} h={0.022} d={0.012} color="#E8E0D4" />}
                <group scale={ri}>
                  <Inset position={[ICON_X, 0, 0.03]} w={0.62} h={0.62} color="#EFE8DE" />
                  <Inset position={[CHECK_X, 0, 0.03]} w={0.54} h={0.54} color="#E9E1D6" />
                </group>
                <group position={[LABEL_X, 0, 0.05]} scale={0.7 + 0.3 * ri}>
                  <Txt size={fitSize(l, CHECK_X - LABEL_X - 0.45, 0.27, 0.64)} color={col} anchorX="left" opacity={ri} position={[0, -0.01, 0]}>
                    {l}
                  </Txt>
                </group>
                {tk > 0.001 && <CheckBadge position={[CHECK_X, 0, 0.03]} scale={0.58 * tk} color={C.orange} />}
              </group>
            );
          })}
        </group>
      </group>
      {/* clip (paper-এর উপরে, board-এর উপরের কিনারা কামড়ে) */}
      <mesh geometry={clipG} position={[0, H / 2 - 0.12, 0.2]} castShadow>
        <SilverMat color="#e2e6ea" rough={0.34} />
      </mesh>
      <mesh geometry={leverG} position={[0, H / 2 + 0.08, 0.3]} rotation={[-0.25, 0, 0]} castShadow>
        <SilverMat color="#d4d9de" rough={0.3} />
      </mesh>
      <mesh position={[0, H / 2 + 0.2, 0.18]} castShadow>
        <torusGeometry args={[0.16, 0.045, 14, 40]} />
        <SilverMat color="#dfe3e7" rough={0.32} />
      </mesh>
    </group>
  );
};

export const SceneChecklist: React.FC<{ t: number; dur: number; cue: Cue; data: ChecklistData }> = ({ t, dur, cue, data }) => {
  const pr = PROFILES[data.industry];
  const items = data.items.slice(0, 5);
  const n = items.length;

  // ---------- timing ----------
  const tClip = Math.min(at(cue, data.titleWord, 0.2), dur * 0.15);
  const tp: number[] = [];
  items.forEach((it, i) => {
    const fb = dur * (0.2 + (0.55 * i) / Math.max(1, n - 1));
    let v = at(cue, it.word, fb, i ? tp[i - 1] + 0.05 : 0);
    v = Math.max(v, i ? tp[i - 1] + 1.2 : tClip + 0.9);
    tp.push(v);
  });
  const OUT = dur - 0.5;
  const tDone = data.done ? clamp(at(cue, data.doneWord, tp[n - 1] + 1.3, tp[n - 1]), tp[n - 1] + 1.1, OUT - 0.9) : 1e9;
  const tickAt = (i: number) => tp[i] + 0.12;

  // ---------- layout ----------
  const H = boardH(n);
  const BASE = atFloor(0.5, 0.905, cam); // কাছে (z≈7.7) — নিচের floor অংশ ভরে, উপরে hero zone বড় (D13) // board-এর নিচের কিনারা floor-এ
  const s = worldWidth(0.86, BASE[2], cam) / BW;
  const LEAN = -0.1;
  const toWorld = (lx: number, ly: number, lz: number): V3 => {
    const v = new THREE.Vector3(lx, ly + H / 2, lz).multiplyScalar(s).applyEuler(new THREE.Euler(LEAN, 0, 0));
    return [BASE[0] + v.x, FLOOR + 0.04 + v.y, BASE[2] + v.z];
  };
  const topScr = toScreen(toWorld(0, H / 2 + 0.35, 0.2), cam)[1];
  const heroY = Math.max(0.09, topScr * 0.47);
  const heroFrac = Math.min(0.4, (topScr - 0.06) * 1.05);
  const HZ = 2;
  const heroPos: V3 = atScreen(0.5, heroY, HZ, cam);
  const heroW = worldWidth(heroFrac, HZ, cam);
  const slotW = 0.5 * s;
  const slotPos = (r: number) => toWorld(ICON_X, rowY(n, r), PAPER_Z + 0.32);

  // row-গুলো শুরুতে একে একে
  const rowIn = items.map((_, r) => springStep(t - (tClip + 0.35 + r * 0.12), { k: 220, c: 16 }));
  const tick = items.map((_, r) => springStep(t - tickAt(r), { k: 260, c: 13 }));
  const flutter = items.reduce((a, _, r) => a + wobble(t - tickAt(r), 0.02, 2.6, 0.22), 0);

  // ---------- pencil: row-এর check ঘরে গিয়ে tick টানে ----------
  const pencil = (() => {
    const first = tp[0] - 0.55, gone = (data.done ? tDone : tp[n - 1] + 1.0) - 0.1;
    if (t < first || t > gone + 0.55) return null;
    const enter = emphDecel(range(t, first, first + 0.45));
    const leave = range(t, gone, gone + 0.5);
    // কোন row-এর দিকে: পরের tick-এর 0.45 s আগে সরা শুরু
    let r = 0;
    for (let i = 0; i < n; i++) if (t > tickAt(i) - 0.5) r = i;
    const prevY = rowY(n, Math.max(0, r - 1));
    const mv = emphDecel(range(t, tickAt(r) - 0.5, tickAt(r) - 0.12));
    const ly = r === 0 ? rowY(n, 0) : prevY + (rowY(n, r) - prevY) * mv;
    // tick stroke: নিচে-বামে ছোট, তারপর উপরে-ডানে লম্বা
    const u = range(t, tickAt(r) - 0.12, tickAt(r) + 0.18);
    let dx = 0, dy = 0, lift = 0.14;
    if (u > 0 && u < 1) {
      lift = 0.0;
      if (u < 0.38) {
        const k = u / 0.38;
        dx = -0.12 + 0.12 * k;
        dy = 0.04 - 0.14 * k;
      } else {
        const k = (u - 0.38) / 0.62;
        dx = 0.24 * k;
        dy = -0.1 + 0.3 * k;
      }
    } else if (u >= 1) lift = 0.14 * range(t, tickAt(r) + 0.18, tickAt(r) + 0.35);
    const off = (1 - enter) * 3 + leave * leave * 4;
    const p = toWorld(CHECK_X + dx + off, ly + dy + off * 0.5, PAPER_Z + 0.05 + lift);
    return { p, o: 1 - leave };
  })();

  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.06 * drift(t, 3), cam.pos[1] + 0.05 * drift(t, 6), cam.pos[2] - 0.3 * range(t, 0, dur)] };
  const outK = (tt: number) => (tt > OUT ? Math.max(0, 1 - backIn(Math.min(1, (tt - OUT) / 0.38))) : 1);

  return (
    <Stage cam={camLive}>
      {/* clipboard: floor থেকে উঠে, শেষে নামে */}
      <Life t={t} a={tClip} b={OUT} kind="pop" position={[BASE[0], FLOOR + 0.04, BASE[2]]} scale={s} rotation={[LEAN, 0, 0]}>
        <group position={[0, H / 2, 0]}>
          <Clipboard n={n} title={data.title} labels={items.map((x) => x.label)} board={pr.board} accent={pr.accent} rowIn={rowIn} tick={tick} flutter={flutter} />
        </group>
      </Life>

      {/* বস্তু: hero zone-এ pop → row-এর icon ঘরে */}
      {items.map((it, i) => {
        if (t < tp[i]) return null;
        const kind = it.icon ?? pr.defaults[i % pr.defaults.length];
        const lt = t - tp[i];
        const p = popIn(t, tp[i], { k: 240, c: 14 });
        const fa = tp[i] + 0.62;
        const fk = emphDecel(range(t, fa, fa + 0.6));
        const pos = lerp3(heroPos, slotPos(i), fk);
        pos[1] += Math.sin(Math.PI * fk) * 0.5;
        const sc = (heroW + (slotW - heroW) * fk) * p.s * outK(t - i * 0.03);
        if (sc <= 1e-4) return null;
        return (
          <group key={i} position={pos} scale={[sc * p.sx, sc * p.sy, sc]} rotation={[LEAN * fk, Math.sin(Math.PI * fk) * 0.8, 0]}>
            <Icon3D kind={kind} t={lt} accent={pr.accent} accent2={pr.accent2} text={it.text} />
          </group>
        );
      })}

      {/* pencil */}
      {pencil && pencil.o > 0.01 && (
        <group position={pencil.p} rotation={[0.75, -0.25, -0.42]} scale={s * 0.72}>
          <Pencil />
        </group>
      )}

      {/* done: emblem + tag */}
      {data.done && (
        <>
          <Life t={t} a={tDone} b={OUT} kind="pop" position={[heroPos[0], heroPos[1] + heroW * 0.14, heroPos[2]]} scale={heroW * 0.72}>
            <Icon3D kind={pr.emblem} t={t - tDone} accent={pr.accent} accent2={pr.accent2} />
          </Life>
          <Life t={t} a={tDone + 0.12} b={OUT} kind="pop" position={[heroPos[0], heroPos[1] - heroW * 0.36, heroPos[2] + 0.6]} scale={worldWidth(Math.min(0.5, data.done.length * 0.03 + 0.08), HZ, cam) / (data.done.length * 0.3 * 0.66 + 0.6)} rotation={[0, 0, -0.06 + wobble(t - tDone - 0.15, 0.08, 1.6, 0.15)]}>
            <SoftPanel w={data.done.length * 0.3 * 0.66 + 0.6} h={0.78} thick={0.22} color="#1F9D55">
              <Txt size={0.3} color="#ffffff" position={[0, -0.01, 0.02]}>
                {data.done}
              </Txt>
            </SoftPanel>
          </Life>
        </>
      )}
    </Stage>
  );
};
