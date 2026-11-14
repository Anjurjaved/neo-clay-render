// devices group — showcases (each renders its own Stage; time from useCurrentFrame()/FPS)
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { Stage, Cam, atFloor, worldWidth, FLOOR } from "../../kit/Stage";
import { FPS } from "../../kit/time";
import { springStep, tween, range, expoOut, emphDecel, wobble, drift } from "../../kit/anim";
import { MacBook, macbookScreen, macbookSpan } from "./MacBook";
import { MacDesktop, IOSLock, AndroidHome, IPadBooking, IMacDash } from "./screens";
import { IPhone, iphoneScreen, IPHONE, Pixel, pixelScreen, PIXEL } from "./Phones";
import { IPad, ipadScreen, IPAD } from "./IPad";
import { IMac, imacScreen, IMAC, MagicKeyboard, MagicMouse } from "./IMac";
import { PhoneStand, standPhonePose } from "./Stand";
import { atScreen, toScreen } from "../../kit/Stage";
import { toMatrix } from "../../kit/Screens";
import { popIn } from "../../kit/anim";

const useT = () => useCurrentFrame() / FPS;

// ---------------- MacBook Pro ----------------
const MB_CAM: Cam = { pos: [0, 6.2, 19.5], target: [0, -0.9, 0], fov: 26 };
const MacBookShow: React.FC = () => {
  const t = useT();
  const cam: Cam = { ...MB_CAM, pos: [MB_CAM.pos[0] + 0.25 * drift(t, 2), MB_CAM.pos[1] + 0.12 * drift(t, 5), MB_CAM.pos[2]] };
  const yaw = -0.5 + 0.16 * tween(t, 2.2, 5.5, 0, 1, emphDecel);
  const P = atFloor(0.46, 0.64, MB_CAM);
  const sc = worldWidth(0.8, P[2], MB_CAM) / macbookSpan(-0.5);
  const drop = springStep(t - 0.05, { k: 140, c: 15 });
  const land = wobble(t - 0.45, 0.035, 2.4, 0.3);
  // hinge: damped spring with a whisper of overshoot (real MBP hinge is friction-damped)
  const open = t < 0.75 ? 0 : springStep(t - 0.75, { k: 22, c: 7.4 });
  const power = range(t, 1.55, 2.15);
  const pose = { position: [P[0], P[1] + (1 - drop) * 2.2, P[2]] as [number, number, number], rotation: [land, yaw, 0] as [number, number, number], scale: sc };
  return (
    <Stage cam={cam} screens={open > 0.12 ? [macbookScreen({ ...pose, open }, <MacDesktop power={power} reveal={range(t, 2.0, 3.6)} />)] : []}>
      <MacBook {...pose} open={open} color="silver" />
    </Stage>
  );
};

// ---------------- iPhone ----------------
const PhoneShow: React.FC<{ kind: "iphone" | "android" }> = ({ kind }) => {
  const t = useT();
  const ip = kind === "iphone";
  const D = ip ? IPHONE : PIXEL;
  const cam: Cam = { pos: [0.2 * drift(t, 1), 2.6 + 0.1 * drift(t, 4), 21], target: [0, -0.5, 0], fov: 27 };
  const sc = worldWidth(0.42, 0) / D.w;
  // float above the floor: bottom edge 0.35 above FLOOR (screen devices never touch/enter the floor — LESSONS D6/D9)
  const C0 = [0, FLOOR + 0.35 + (sc * D.h) / 2, 0];
  const pi = popIn(t, 0.05, { k: 170, c: 14 });
  // spin: back (camera) → front, damped with a little overshoot
  const spin = springStep(t - 0.7, { k: 26, c: 6.5 });
  const yaw = (ip ? Math.PI + 0.55 : Math.PI - 0.55) * (1 - spin) + (ip ? -0.32 : 0.32);
  const bob = 0.05 * Math.sin(t * 1.6);
  const pose = {
    position: [C0[0], C0[1] + bob + (1 - pi.s) * -0.4, C0[2]] as [number, number, number],
    rotation: [0.05 + 0.04 * Math.sin(t * 1.1), yaw, (ip ? -0.04 : 0.04) * (1 - spin)] as [number, number, number],
    scale: sc * Math.max(0.001, pi.s),
  };
  const power = range(t, 2.0, 2.5);
  const ui = ip ? <IOSLock power={power} notes={range(t, 2.5, 3.9)} /> : <AndroidHome power={power} reveal={range(t, 2.3, 3.4)} />;
  return (
    <Stage cam={cam} screens={[ip ? iphoneScreen(pose, ui) : pixelScreen(pose, ui)]}>
      {ip ? <IPhone {...pose} color="natural" /> : <Pixel {...pose} color="champagne" />}
    </Stage>
  );
};

// ---------------- iPad ----------------
const IPadShow: React.FC = () => {
  const t = useT();
  const cam: Cam = { pos: [0.2 * drift(t, 3), 2.6 + 0.1 * drift(t, 6), 21], target: [0, -0.5, 0], fov: 27 };
  const C0 = atScreen(0.5, 0.45, 0);
  const sc = worldWidth(0.74, 0) / IPAD.w;
  const pi = popIn(t, 0.05, { k: 170, c: 14 });
  const turn = springStep(t - 1.5, { k: 40, c: 8.5 });
  const pose = {
    position: [C0[0], C0[1] + 0.04 * Math.sin(t * 1.4), C0[2]] as [number, number, number],
    rotation: [-0.16, -0.46 + 0.08 * Math.sin(t * 0.7), 0] as [number, number, number],
    scale: sc * Math.max(0.001, pi.s),
    turn,
  };
  const swap = range(turn, 0.62, 0.92);
  const power = range(t, 0.45, 0.9);
  const screens = [];
  if (swap < 1) screens.push(ipadScreen(pose, <IPadBooking layout="portrait" power={power} />, { layout: "portrait", opacity: 1 - swap }));
  if (swap > 0) screens.push(ipadScreen(pose, <IPadBooking layout="landscape" confirm={range(t, 3.4, 4.0)} />, { layout: "landscape", opacity: swap }));
  return (
    <Stage cam={cam} screens={screens}>
      <IPad {...pose} color="spacegrey" />
    </Stage>
  );
};

// ---------------- iMac + keyboard + mouse ----------------
const IM_CAM: Cam = { pos: [0, 5.2, 21], target: [0, -0.6, 0], fov: 27 };
const IMacShow: React.FC = () => {
  const t = useT();
  const cam: Cam = { ...IM_CAM, pos: [IM_CAM.pos[0] + 0.3 * drift(t, 2), IM_CAM.pos[1] + 0.1 * drift(t, 7), IM_CAM.pos[2]] };
  const F = atFloor(0.44, 0.66, IM_CAM);
  const sc = worldWidth(0.76, F[2], IM_CAM) / IMAC.w;
  const pi = popIn(t, 0.05, { k: 150, c: 14 });
  const yaw = -0.28 + 0.1 * tween(t, 1.8, 5.2, 0, 1, emphDecel);
  const base = { position: [F[0], F[1], F[2] - 0.6 * sc] as [number, number, number], rotation: [0, yaw, 0] as [number, number, number], scale: sc * Math.max(0.001, pi.s) };
  const parent = toMatrix(base.position, base.rotation, base.scale);
  const kIn = springStep(t - 0.55, { k: 120, c: 14 });
  const mIn = springStep(t - 0.8, { k: 120, c: 13 });
  const power = range(t, 1.2, 1.8);
  return (
    <Stage cam={cam} screens={[imacScreen(base, <IMacDash power={power} grow={range(t, 1.7, 3.4)} />)]}>
      <group position={base.position} rotation={base.rotation} scale={base.scale}>
        <IMac color="blue" />
        <MagicKeyboard color="blue" position={[-0.35, 0, 1.95 + (1 - kIn) * 1.6]} rotation={[0, 0.02, 0]} />
        <MagicMouse position={[1.85 + (1 - mIn) * 0.6, 0, 1.95 + (1 - mIn) * 1.2]} rotation={[0, -0.08 + (1 - mIn) * 0.6, 0]} />
      </group>
    </Stage>
  );
};

// ---------------- phone stand / dock ----------------
const StandShow: React.FC = () => {
  const t = useT();
  const cam: Cam = { pos: [0.2 * drift(t, 5), 3.4 + 0.1 * drift(t, 2), 21], target: [0, -0.6, 0], fov: 27 };
  const F = atFloor(0.5, 0.68, cam);
  const sc = worldWidth(0.36, F[2], cam) / IPHONE.w;
  const sp = popIn(t, 0.05, { k: 200, c: 12 });
  const yaw = -0.52 + 0.14 * tween(t, 1.8, 5, 0, 1, emphDecel);
  const group = { position: F, rotation: [0, yaw, 0] as [number, number, number], scale: sc };
  const parent = toMatrix(group.position, group.rotation, group.scale);
  // phone drops in along the rest, lands, settles
  const fall = springStep(t - 0.75, { k: 70, c: 9 });
  const slide = (1 - fall) * 2.6;
  const ph = standPhonePose(IPHONE.h, IPHONE.d, Math.max(-0.01, slide));
  const settle = wobble(t - 1.25, 0.03, 3, 0.25);
  const phPose = { ...ph, rotation: [ph.rotation[0] + settle, 0, 0] as [number, number, number] };
  const showPhone = t > 0.7;
  return (
    <Stage cam={cam} screens={showPhone ? [iphoneScreen({ ...phPose, parent }, <IOSLock power={range(t, 1.5, 2.0)} notes={range(t, 2.4, 3.6)} charging={range(t, 1.7, 2.1)} />)] : []}>
      <group position={group.position} rotation={group.rotation} scale={group.scale}>
        <PhoneStand scale={[sp.sx * sp.s, sp.sy * sp.s, sp.sx * sp.s]} />
        {showPhone && <IPhone {...phPose} color="black" />}
      </group>
    </Stage>
  );
};

export const ITEMS: LibItem[] = [
  {
    id: "devices-macbook",
    name: "MacBook Pro 14",
    nameBn: "ম্যাকবুক প্রো ১৪",
    group: "devices",
    kind: "component",
    duration: 5.5,
    still: 4.2,
    tags: ["title", "answer", "steps", "cta", "before_after", "compare"],
    note: "<MacBook open color='silver'|'spacegrey'/> + macbookScreen({position,rotation,scale,open}, ui) — DOM 1512×982, put <MacNotch/> in ui",
    Comp: MacBookShow,
  },
  {
    id: "devices-iphone",
    name: "iPhone Pro",
    nameBn: "আইফোন প্রো",
    group: "devices",
    kind: "component",
    duration: 4.5,
    still: 3.9,
    tags: ["chat", "persona", "answer", "cta", "stat"],
    note: "<IPhone color='natural'|'black'|'blue'|'desert'/> + iphoneScreen(pose, ui) — DOM 390×843; width 1 (PHONE_REAL = true scale vs MacBook)",
    Comp: () => <PhoneShow kind="iphone" />,
  },
  {
    id: "devices-android",
    name: "Android phone (Pixel style)",
    nameBn: "অ্যান্ড্রয়েড ফোন",
    group: "devices",
    kind: "component",
    duration: 4.5,
    still: 3.8,
    tags: ["chat", "persona", "answer", "cta"],
    note: "<Pixel color='champagne'|'obsidian'|'mint'/> + pixelScreen(pose, ui) — DOM 390×843, punch-hole via <PhoneStatus kind='android'/>",
    Comp: () => <PhoneShow kind="android" />,
  },
  {
    id: "devices-ipad",
    name: "iPad Air",
    nameBn: "আইপ্যাড",
    group: "devices",
    kind: "component",
    duration: 5,
    still: 4.4,
    tags: ["steps", "answer", "checklist", "timeline"],
    note: "<IPad turn={0 portrait..1 landscape}/> + ipadScreen({...pose, turn}, ui, {layout}) — DOM 1180×820 / 820×1180",
    Comp: IPadShow,
  },
  {
    id: "devices-imac",
    name: "iMac desktop + keyboard + mouse",
    nameBn: "আইম্যাক ডেস্কটপ",
    group: "devices",
    kind: "component",
    duration: 5.5,
    still: 4.4,
    tags: ["stat", "answer", "steps", "compare"],
    note: "<IMac color/> <MagicKeyboard/> <MagicMouse/> + imacScreen(pose, ui) — DOM 1600×900; pose.position = desk point under the stand",
    Comp: IMacShow,
  },
  {
    id: "devices-phone-in-hand-stand",
    name: "Phone stand / dock",
    nameBn: "ফোন স্ট্যান্ড",
    group: "devices",
    kind: "component",
    duration: 5,
    still: 4.2,
    tags: ["chat", "cta", "persona"],
    note: "<PhoneStand/> + standPhonePose(h, d, slide) in stand space; screen parent = stand group matrix",
    Comp: StandShow,
  },
];
