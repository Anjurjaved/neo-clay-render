// wd004 S05 points (145.06–183.38 s) — "প্রতি বছর আর পরে কী কী খরচ"
import React from "react";
import * as THREE from "three";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM, FLOOR, Cam } from "../../kit/Stage";
import { useVideoTime } from "../../kit/time";
import { springStep, wobble, popIn, tween, range, emphDecel, expoOut, drift } from "../../kit/anim";
import { Figure } from "../../kit/Figure";
import { Tag } from "../../kit/Clock";
import { CheckBadge } from "../../kit/Soft";
import { LogoMark } from "../../kit/Logo";
import { ScreenSpec } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { Calendar, Coin, PriceTag, Jar, Laptop, laptopScreenMatrix, Globe, Server, MapPin, Stethoscope } from "../../web11/props";
import { cue, SCENES } from "../cues";
import { Life, backIn } from "../life";
import { Wrench, UpdateArrows, BackupCloud, Shield, ToolTile, NamePlate, MapTile, BizCard, OnlineSite, CostPage } from "../props/s05";

const cam: Cam = DEFAULT_CAM;
const S0 = SCENES.points;
const END = SCENES.timeline;

const T = {
  ebar: cue("এবার", S0 - 0.01),
  proti: cue("প্রতি", S0),
  pore: cue("পরে", S0),
  domain: cue("domain", S0),
  hosting: cue("hosting", S0),
  apnar: cue("আপনার", S0),
  setup: cue("setup", S0),
  bina: cue("বিনা", S0),
  prothom: cue("প্রথম", S0),
  ek: cue("এক", cue("প্রথম", S0)),
  maint: cue("maintenance", S0),
  free: cue("ফ্রি", S0),
  tarpor: cue("তারপর", S0),
  mashe: cue("মাসে", S0),
  panch: cue("পাঁচ", S0),
  bug: cue("bug", S0),
  update: cue("update", S0),
  backup: cue("backup", S0),
  security: cue("security", S0),
  maint2: cue("maintenance", cue("security", S0)),
  site: cue("site", cue("security", S0)),
  shudhu: cue("শুধু", cue("security", S0)),
  update2: cue("update", cue("security", S0)),
  backup2: cue("backup", cue("security", S0)),
  dayitto: cue("দায়িত্বটা", S0),
  ar3: cue("আর", cue("দায়িত্বটা", S0)),
  taka: cue("টাকাও", S0),
  google: cue("Google", S0),
  chobi: cue("ছবি", S0),
  somoy: cue("সময়", cue("ছবি", S0)),
  phone: cue("ফোন", cue("ছবি", S0)),
  khoroch: cue("খরচের", cue("ছবি", S0)),
  ei: cue("এই", cue("খরচের", cue("ছবি", S0))),
  jit: cue("javeditsolution", S0),
  dot: cue("dot", S0),
  web: cue("website", cue("javeditsolution", S0)),
  page: cue("page", cue("javeditsolution", S0)),
  miliye: cue("মিলিয়ে", S0),
};
const OUT = END - 0.48; // সব কিছু এখান থেকে বেরোয় (0.38 s exit)

// ---------- tool tiles: grid (beat 3) → top row (beat 4a) → ডাক্তারের পাশে (beat 4b) ----------
const TOOLS = [
  { label: "BUG FIX", at: T.bug, go: T.shudhu + 0.1 },
  { label: "UPDATE", at: T.update, go: T.update2 },
  { label: "BACKUP", at: T.backup, go: T.backup2 },
  { label: "SECURITY", at: T.security, go: T.dayitto },
];
const TILE_Z = 5;
const tileGrid = (i: number) => atScreen(0.3 + (i % 2) * 0.4, 0.43 + Math.floor(i / 2) * 0.205, TILE_Z, cam);
const tileRow = (i: number) => atScreen(0.14 + i * 0.24, 0.11, TILE_Z, cam);
const tileDoc = (i: number) => atScreen(0.74 + (i % 2) * 0.17, 0.25 + Math.floor(i / 2) * 0.097, TILE_Z, cam);
const TILE_W0 = worldWidth(0.3, TILE_Z, cam) / 1.3;
const TILE_W1 = worldWidth(0.2, TILE_Z, cam) / 1.3;
const TILE_W2 = worldWidth(0.14, TILE_Z, cam) / 1.3;

export const S05: React.FC = () => {
  const t = useVideoTime(S0);
  const screens: ScreenSpec[] = [];

  // ===== laptop A (beat 4: site চলছেই) =====
  const LA = atFloor(0.31, 0.7, cam);
  const laS0 = worldWidth(0.6, LA[2], cam) / 2.6;
  const laA = T.site - 0.1, laB = T.ar3 - 0.25;
  const laPop = popIn(t, laA, { k: 200, c: 16 }).s;
  const laOut = t > laB ? Math.min(1, (t - laB) / 0.38) : 0;
  const laOpen = tween(t, laA + 0.1, laA + 0.8, 0, 1, expoOut);
  const laS = laS0 * Math.max(0.001, laPop) * (1 - backIn(laOut));
  const laRot = 0.22;
  if (t > laA && laOut < 1 && laOpen > 0.3) {
    screens.push({
      matrix: laptopScreenMatrix(LA, laRot, laS, laOpen),
      w: 2.6 * 0.94,
      h: 1.7 * 0.9,
      px: 1024,
      py: 590,
      radius: 10,
      content: <OnlineSite pulse={(t * 1.1) % 1} />,
      opacity: range(laOpen, 0.3, 0.6),
    });
  }

  // ===== laptop B (beat 6: javeditsolution.com cost list) =====
  const LB = atFloor(0.5, 0.66, cam);
  const lbS0 = worldWidth(0.86, LB[2], cam) / 2.6;
  const lbA = T.ei;
  const lbPop = popIn(t, lbA, { k: 200, c: 16 }).s;
  const lbOut = t > OUT ? Math.min(1, (t - OUT) / 0.38) : 0;
  const lbOpen = tween(t, lbA + 0.1, lbA + 0.8, 0, 1, expoOut);
  const lbS = lbS0 * Math.max(0.001, lbPop) * (1 - backIn(lbOut));
  if (t > lbA && lbOut < 1 && lbOpen > 0.3) {
    const full = "javeditsolution.com/website-development";
    const n1 = "javeditsolution".length,
      n2 = "javeditsolution.com".length;
    let n = 0;
    if (t > T.jit) n = Math.round(n1 * range(t, T.jit, T.dot - 0.15));
    if (t > T.dot) n = n1 + Math.round((n2 - n1) * range(t, T.dot, T.web - 0.1));
    if (t > T.web) n = n2 + Math.round((full.length - n2) * range(t, T.web, T.page + 0.2));
    screens.push({
      matrix: laptopScreenMatrix(LB, 0, lbS, lbOpen),
      w: 2.6 * 0.94,
      h: 1.7 * 0.9,
      px: 1024,
      py: 590,
      radius: 10,
      content: <CostPage url={full.slice(0, n)} caret={Math.floor(t * 2.4) % 2 === 0} rows={range(t, T.jit - 0.2, T.jit + 0.9)} checks={range(t, T.miliye, T.miliye + 0.9)} />,
      opacity: range(lbOpen, 0.3, 0.6),
    });
  }

  // ===== doctor (beat 4) =====
  const DOC = atFloor(0.83, 0.72, cam);
  const docS = worldWidth(0.22, DOC[2], cam) / 0.42;

  // camera: হালকা drift
  const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.05 * drift(t, 2), cam.pos[1] + 0.04 * drift(t, 5), cam.pos[2] - 0.25 * Math.sin(Math.PI * range(t, S0, END))] };

  // ---- beat 1 layout ----
  const GL = atScreen(0.3, 0.42, 0.5, cam);
  const SV = atFloor(0.7, 0.6, cam);
  const svS = worldWidth(0.3, SV[2], cam) / 1.0;
  const NP = atFloor(0.5, 0.78, cam);

  // ---- beat 5 layout ----
  const MP = atFloor(0.5, 0.7, cam);
  const mapS = worldWidth(0.8, MP[2], cam) / 3.6;
  const PIN = atFloor(0.3, 0.68, cam);

  return (
    <Stage cam={camLive} screens={screens}>
      {/* ===== intro: "কোন খরচগুলো প্রতি বছর বা পরে আসে" ===== */}
      <Life t={t} a={T.ebar + 0.3} b={T.domain - 0.45} kind="pop" position={atFloor(0.5, 0.66, cam)} scale={worldWidth(0.42, atFloor(0.5, 0.66, cam)[2], cam) / 1.25}>
        <Jar label="EVERY YEAR" color={C.orange} loop fill={0.35 * range(t, T.proti + 0.2, T.proti + 0.9)} />
      </Life>
      {[0, 1, 2].map((i) => {
        const at = T.proti + i * 0.15;
        if (t < at || t > T.proti + 1.0) return null;
        const k = range(t, at, at + 0.5);
        const J = atFloor(0.5, 0.66, cam);
        const from = new THREE.Vector3(...atScreen(0.5 + (i - 1) * 0.12, 0.2, 2, cam));
        const to = new THREE.Vector3(J[0], J[1] + 2.0, J[2]);
        const p = from.lerp(to, k * k);
        return (
          <group key={i} position={p.toArray()} scale={(worldWidth(0.1, 2, cam) / 0.72) * (1 - 0.45 * k)} rotation={[k * 5, 0, k * 2]}>
            <Coin />
          </group>
        );
      })}
      <Life t={t} a={T.pore} b={T.domain - 0.45} kind="pop" position={atScreen(0.5, 0.25, 2, cam)} scale={worldWidth(0.5, 2, cam) / 2.6}>
        <Tag text="+ LATER COSTS" size={0.28} w={2.6} h={0.56} color={C.deepNavy} />
      </Life>

      {/* ===== beat 1: domain + hosting, YOUR NAME, SETUP FREE ===== */}
      <Life t={t} a={T.domain} b={T.prothom - 0.35} kind="pop" position={[GL[0], GL[1] + 0.08 * Math.sin(t * 1.6), GL[2]]} scale={worldWidth(0.3, GL[2], cam) / 1.0}>
        <group rotation={[0.2, t * 0.5, 0]}>
          <Globe />
        </group>
        {t > T.setup && <CheckBadge position={[0.38, 0.38, 0.45]} scale={0.42 * springStep(t - T.setup, { k: 260, c: 14 })} />}
      </Life>
      <Life t={t} a={T.domain + 0.12} b={T.prothom - 0.35} kind="pop" position={atScreen(0.3, 0.27, 0.5, cam)} scale={worldWidth(0.24, 0.5, cam) / 2}>
        <Tag text="DOMAIN" size={0.32} w={2} h={0.56} color={C.steel} />
      </Life>
      <Life t={t} a={T.hosting} b={T.prothom - 0.35} kind="pop" position={SV} scale={svS}>
        <group rotation={[0, -0.3, 0]}>
          <Server />
        </group>
        {t > T.setup + 0.12 && <CheckBadge position={[0.36, 1.12, 0.3]} scale={0.42 * springStep(t - T.setup - 0.12, { k: 260, c: 14 })} />}
      </Life>
      <Life t={t} a={T.hosting + 0.12} b={T.prothom - 0.35} kind="pop" position={atScreen(0.7, 0.27, 0.5, cam)} scale={worldWidth(0.26, 0.5, cam) / 2.2}>
        <Tag text="HOSTING" size={0.32} w={2.2} h={0.56} color={C.navy} />
      </Life>
      <Life t={t} a={T.apnar} b={T.prothom - 0.35} kind="pop" exit="sink" position={NP} scale={worldWidth(0.52, NP[2], cam) / 2.9}>
        <NamePlate text="YOUR NAME" />
      </Life>
      <Life
        t={t}
        a={T.bina}
        b={T.prothom - 0.35}
        kind="pop"
        position={atScreen(0.5, 0.13, 2, cam)}
        scale={worldWidth(0.7, 2, cam) / 3.8}
        rotation={[0, 0, wobble(t - T.bina - 0.2, 0.07, 1.4, 0.14)]}
      >
        <PriceTag text="SETUP FREE" w={3.8} h={1.0} color="#1F9D55" />
      </Life>

      {/* ===== beat 2: প্রথম এক বছর maintenance ফ্রি ===== */}
      <Life t={t} a={T.prothom} b={T.mashe - 0.3} kind="pop" position={atScreen(0.5, 0.44, 1, cam)} scale={worldWidth(0.44, 1, cam) / 1.2} rotation={[0, wobble(t - T.prothom, 0.12, 0.9, 0.2), 0]}>
        <Calendar top="MONTHS" big={String(Math.max(1, Math.min(12, Math.round(1 + 11 * range(t, T.ek, T.maint + 0.4)))))} header={C.navy} />
      </Life>
      <Life t={t} a={T.maint} b={T.tarpor + 0.2} kind="pop" position={atScreen(0.5, 0.24, 1, cam)} scale={worldWidth(0.56, 1, cam) / 3}>
        <Tag text="MAINTENANCE" size={0.32} w={3} h={0.6} color={C.steel} />
      </Life>
      <Life t={t} a={T.free} b={T.tarpor + 0.2} kind="pop" position={atScreen(0.5, 0.63, 2.5, cam)} scale={worldWidth(0.66, 2.5, cam) / 3.2} rotation={[0, 0, -0.07]}>
        <Tag text="1 YEAR FREE" size={0.4} w={3.2} h={0.74} color="#1F9D55" />
      </Life>

      {/* ===== beat 3: BDT 2,000–5,000 / MONTH ===== */}
      <Life t={t} a={T.mashe} b={T.maint2 - 0.1} kind="pop" position={atScreen(0.5, 0.25, 2, cam)} scale={worldWidth(0.84, 2, cam) / 4.4} rotation={[0, 0, wobble(t - T.mashe - 0.2, 0.06, 1.3, 0.12)]}>
        <PriceTag text={t < T.panch ? "BDT 2,000" : "BDT 2,000 – 5,000"} sub="PER MONTH" w={4.4} h={1.15} color={C.orange} />
      </Life>

      {/* ===== beat 3–4: tool tiles ===== */}
      {TOOLS.map((o, i) => {
        if (t < o.at - 0.02) return null;
        const toRow = tween(t, T.maint2, T.maint2 + 0.6, 0, 1, emphDecel);
        const toDoc = tween(t, o.go, o.go + 0.65, 0, 1, emphDecel);
        const p = new THREE.Vector3(...tileGrid(i)).lerp(new THREE.Vector3(...tileRow(i)), toRow).lerp(new THREE.Vector3(...tileDoc(i)), toDoc);
        p.y += Math.sin(Math.PI * toDoc) * 0.5 + 0.05 * Math.sin(t * 1.4 + i * 1.3);
        const s = TILE_W0 + (TILE_W1 - TILE_W0) * toRow + (TILE_W2 - TILE_W1) * toDoc;
        const icon =
          i === 0 ? <Wrench scale={0.78} /> : i === 1 ? <UpdateArrows scale={0.9} spin={-tween(t, o.at, o.at + 1.2, 0, Math.PI * 2, expoOut) - 2 * Math.PI * range(t, o.go, o.go + 1.0)} /> : i === 2 ? <BackupCloud scale={0.92} /> : <Shield scale={0.86} />;
        return (
          <Life key={o.label} t={t} a={o.at} b={T.ar3 - 0.2 + i * 0.04} kind="pop" position={p.toArray() as [number, number, number]} scale={s} rotation={[0, 0.16 * Math.sin(t * 0.9 + i * 1.6) * (1 - toDoc), 0]}>
            <ToolTile label={o.label} icon={icon} glow={i === 0 ? 0 : 0} />
          </Life>
        );
      })}

      {/* ===== beat 4: laptop (site চলছেই) + ONLINE + doctor ===== */}
      {t > laA && laOut < 1 && <Laptop position={LA} rotation={[0, laRot, 0]} scale={laS} open={laOpen} />}
      <Life t={t} a={T.site + 0.35} b={laB} kind="pop" position={atScreen(0.3, 0.36, 1.5, cam)} scale={worldWidth(0.32, 1.5, cam) / 2}>
        <Tag text="ONLINE" size={0.36} w={2} h={0.62} color="#1F9D55" />
      </Life>
      <Life t={t} a={T.shudhu - 0.1} b={T.ar3 - 0.1} kind="pop" position={DOC} scale={docS}>
        <Figure rotationY={-0.35} coat="#F6F4F0" headTilt={0.16 * springStep(t - T.dayitto, { k: 90, c: 9 })} pose={{ cheer: 0.25 * range(t, T.dayitto, T.dayitto + 0.4) }}>
          <Stethoscope />
        </Figure>
      </Life>

      {/* ===== beat 5: Google Maps listing — BDT 0 ===== */}
      <Life t={t} a={T.ar3 + 0.15} b={T.khoroch - 0.1} kind="pop" exit="sink" position={MP} scale={mapS}>
        <MapTile />
      </Life>
      <Life t={t} a={T.taka} b={T.khoroch - 0.1} kind="pop" position={atScreen(0.5, 0.14, 2, cam)} scale={worldWidth(0.6, 2, cam) / 3.0} rotation={[0, 0, wobble(t - T.taka - 0.2, 0.07, 1.4, 0.14)]}>
        <PriceTag text="BDT 0" sub="NO COST" w={3.0} h={1.1} color="#1F9D55" />
      </Life>
      <Life t={t} a={T.google} b={T.khoroch - 0.1} kind="drop" position={PIN} scale={worldWidth(0.15, PIN[2], cam) / 0.6}>
        <MapPin />
      </Life>
      <Life t={t} a={T.google + 0.25} b={T.khoroch - 0.1} kind="pop" position={atScreen(0.3, 0.54, 2, cam)} scale={worldWidth(0.4, 2, cam) / 2.6}>
        <Tag text="GOOGLE MAPS" size={0.28} w={2.6} h={0.54} color={C.deepNavy} />
      </Life>
      <Life t={t} a={T.chobi} b={T.khoroch - 0.1} kind="pop" position={atScreen(0.6, 0.37, 2, cam)} scale={worldWidth(0.7, 2, cam) / 2.8} rotation={[0, -0.12, 0]}>
        <BizCard photo={springStep(t - T.chobi - 0.1, { k: 200, c: 14 })} time={springStep(t - T.somoy, { k: 220, c: 14 })} phone={springStep(t - T.phone, { k: 220, c: 14 })} />
      </Life>

      {/* ===== beat 6: javeditsolution.com — পুরো list ===== */}
      {t > lbA && lbOut < 1 && <Laptop position={LB} scale={lbS} open={lbOpen} />}
      <Life t={t} a={T.jit} b={OUT} kind="pop" position={atScreen(0.5, 0.2, 0, cam)} scale={worldWidth(0.3, 0, cam) / 2}>
        <LogoMark size={2} />
      </Life>
    </Stage>
  );
};
