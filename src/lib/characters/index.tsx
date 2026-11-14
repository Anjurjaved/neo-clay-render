// characters group — showcases (প্রতিটা নিজে <Stage> render করে; সময় = useCurrentFrame()/FPS)
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { Stage, Cam, FLOOR } from "../../kit/Stage";
import { toMatrix } from "../../kit/Screens";
import { Txt } from "../../kit/Clay";
import { FPS } from "../../kit/time";
import { C } from "../../kit/theme";
import { range, smoothstep, springStep, wobble, drift } from "../../kit/anim";
import { Character } from "./Character";
import { Pose } from "./rig";
import {
  stand,
  walk,
  wave,
  think,
  point,
  cheer,
  holdPhone,
  sit,
  typeAt,
  mixPose,
  withArm,
  armHoldCup,
  armRest,
  armHoldSelf,
  armWave,
  armPoint,
  armChin,
  armHug,
  armCheer,
  armOf,
  SEAT,
} from "./poses";
import { Held, Stool, Desk, Laptop, laptopScreen, Counter, Keyboard, Monitor, Bell, LAPTOP } from "./props";
import { CodeEditor } from "./screens";
import { Crowd, planCrowd } from "./Crowd";
import { SpeechBubble, ThoughtBubble } from "./Bubbles";

const useT = () => useCurrentFrame() / FPS;
const ss = (a: number, b: number, t: number) => smoothstep(a, b, t);
/** 0→1 at [a,b], 1→0 at [c,d] */
const win = (t: number, a: number, b: number, c: number, d: number) => ss(a, b, t) * (1 - ss(c, d, t));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const CAM: Cam = { pos: [0, 1.9, 13.0], target: [0, -0.22, 0], fov: 26 };
const camDrift = (c: Cam, t: number): Cam => ({ ...c, pos: [c.pos[0] + 0.18 * drift(t, 1), c.pos[1] + 0.08 * drift(t, 4), c.pos[2]] });

/** decelerating walk along x: returns world x, distance walked, intensity */
const walkIn = (t: number, x0: number, x1: number, dur: number) => {
  const u = Math.min(1, Math.max(0, t / dur));
  const e = 1 - (1 - u) * (1 - u);
  const x = x0 + (x1 - x0) * e;
  const speed = u < 1 ? (Math.abs(x1 - x0) * 2 * (1 - u)) / dur : 0;
  return { x, dist: Math.abs(x - x0), speed };
};

// ---------------- OWNER ----------------
const OwnerShow: React.FC = () => {
  const t = useT();
  const s = 3.2;
  const w = walkIn(t, 2.7, 0.15, 2.1);
  const k = Math.min(1, w.speed / 1.5);
  let p: Pose = walk(w.dist / s, k);
  p = withArm(p, "L", armHoldCup("L", 0.004 * Math.sin(t * 2)));
  const kw = win(t, 2.05, 2.4, 3.55, 3.85);
  const kp = ss(3.85, 4.25, t);
  p = withArm(p, "R", armWave("R", (t - 2.05) * 2.3 * Math.PI * 2), kw);
  p = withArm(p, "R", armPoint("R", [-1, 0.22, 0.5]), kp);
  p = { ...p, turn: lerp(p.turn, -0.42, kp), twist: lerp(p.twist, -0.1, kp), tilt: lerp(p.tilt, -0.08, kw), nod: lerp(p.nod, -0.04, kw) };
  const rotY = lerp(-0.32, -1.3, k) - 0.06 * kp;
  return (
    <Stage cam={camDrift(CAM, t)}>
      <Character pose={p} role="owner" position={[w.x, FLOOR, 0]} rotationY={rotY} scale={s} holdL={<Held kind="cup" side="L" />} />
    </Stage>
  );
};

// ---------------- DOCTOR ----------------
const DoctorShow: React.FC = () => {
  const t = useT();
  const s = 3.2;
  const fall = Math.min(1, t / 0.38);
  const y = FLOOR + (1 - fall * fall) * 1.8;
  const squash = t < 0.38 ? 1 + 0.06 * fall : 1 - wobble(t - 0.38, 0.09, 2.6, 0.32);
  let p: Pose = stand(t * 2);
  p = withArm(p, "L", armHoldSelf("L", 0.0, "clipboard"));
  p = { ...p, nod: 0.3, turn: 0.15 };
  const kt = win(t, 1.25, 1.75, 3.15, 3.5);
  const ki = ss(3.45, 3.85, t);
  p = withArm(p, "R", armChin("R"), kt);
  p = withArm(p, "R", armPoint("R", [-0.55, 0.75, 0.55]), ki);
  p = { ...p, nod: lerp(lerp(p.nod, -0.1, kt), -0.18, ki), tilt: lerp(p.tilt, 0.15, kt), turn: lerp(p.turn, 0.05, kt + ki), lean: p.lean + 0.03 * kt };
  // nod "yes" with the idea
  p = { ...p, nod: p.nod + 0.08 * Math.sin((t - 3.6) * 9) * win(t, 3.6, 3.75, 4.3, 4.6) };
  return (
    <Stage cam={camDrift(CAM, t)}>
      <Character pose={p} role="doctor" position={[0.05, y, 0]} rotationY={0.36} scale={s} squash={squash} holdL={<Held kind="clipboard" side="L" />} />
    </Stage>
  );
};

// ---------------- CUSTOMER ----------------
const CustomerShow: React.FC = () => {
  const t = useT();
  const s = 3.2;
  const w = walkIn(t, -2.8, -0.05, 2.5);
  const k = Math.min(1, w.speed / 1.4);
  let p: Pose = walk(w.dist / s, k * 0.85);
  const hp = holdPhone(t);
  const look = 1 - ss(2.5, 2.95, t);
  p = withArm(p, "R", armHoldSelf("R", 0.004 * Math.sin(t * 1.7)));
  p = { ...p, armL: { ...p.armL, grip: 0.9, palm: [-1, 0, 0.1] }, nod: lerp(p.nod - 0.03, hp.nod, look), lean: p.lean + 0.03 * look };
  // stop → look up → phone hand drops to the side (still gripped) + a small happy bounce
  const kd = ss(3.0, 3.45, t);
  p = withArm(p, "R", { ...armRest("R"), grip: 0.5, dir: [-0.05, -1, 0.25], palm: [1, 0, 0.2] }, kd);
  const hop = Math.max(0, Math.sin((t - 3.5) * 9)) * 0.03 * win(t, 3.5, 3.6, 4.3, 4.5);
  p = { ...p, y: p.y + hop, nod: lerp(p.nod, -0.06, kd), tilt: lerp(p.tilt, 0.1, kd) };
  const rotY = lerp(0.35, 1.2, k);
  const sw = 0.25 * Math.sin((w.dist / s / 0.62) * Math.PI * 2 + 1.2) * k;
  return (
    <Stage cam={camDrift(CAM, t)}>
      <Character pose={p} role="customer" position={[w.x, FLOOR, 0]} rotationY={rotY} scale={s} holdR={<Held kind="phone" side="R" />} holdL={<Held kind="bag" side="L" bagSwing={sw} />} />
    </Stage>
  );
};

// ---------------- RECEPTIONIST ----------------
const RecCam: Cam = { pos: [0, 2.3, 12.4], target: [0, -0.55, 0], fov: 26 };
const ReceptionistShow: React.FC = () => {
  const t = useT();
  const s = 2.85;
  const gy = 0.3;
  const typing = typeAt(t, stand(t * 2), 0.17, 0.3);
  let p: Pose = { ...typing, lean: 0.07, nod: 0.24, turn: 0.42 };
  const kw = win(t, 2.35, 2.75, 3.8, 4.2);
  p = withArm(p, "R", armWave("R", (t - 2.35) * 2.2 * Math.PI * 2), kw);
  p = { ...p, turn: lerp(p.turn, -0.2, kw), nod: lerp(p.nod, -0.02, kw), tilt: lerp(0, -0.1, kw), lean: lerp(p.lean, 0.02, kw) };
  return (
    <Stage cam={camDrift(RecCam, t)}>
      <group position={[0, FLOOR, 0.3]} rotation={[0, gy, 0]} scale={s}>
        <Character pose={p} role="receptionist" position={[0, 0, -0.43]} />
        <Counter position={[0, 0, 0]} w={0.96} />
        <Keyboard position={[-0.02, 0.56, -0.13]} />
        <Monitor position={[0.3, 0.56, -0.07]} rotation={[0, Math.PI - 0.55, 0]} />
        <Bell position={[-0.36, 0.56, 0.1]} />
      </group>
    </Stage>
  );
};

// ---------------- DEVELOPER ----------------
const DevCam: Cam = { pos: [0, 2.5, 11.2], target: [0, -0.75, 0], fov: 26 };
const DeveloperShow: React.FC = () => {
  const t = useT();
  const s = 3.1;
  const gy = 2.42;
  const gp: [number, number, number] = [-0.12, FLOOR, 0.2];
  const kc = win(t, 3.35, 3.75, 4.75, 5.15);
  let p: Pose = typeAt(t, sit(t), 0.115, 0.29);
  const ch = cheer(t - 3.35, 1);
  p = mixPose(p, { ...p, lean: -0.1, nod: -0.25, armL: armCheer("L", Math.sin(t * 7.5)), armR: armCheer("R", Math.sin(t * 7.5 + 0.5)), y: p.y + Math.max(0, ch.y) * 0.4 }, kc);
  const typed = range(t, 0.2, 3.0);
  const done = range(t, 3.15, 3.5);
  const laptopLocal: [number, number, number] = [0, 0.38, 0.31];
  const parent = toMatrix(gp, [0, gy, 0], s);
  return (
    <Stage cam={camDrift(DevCam, t)} screens={[laptopScreen({ position: laptopLocal, rotation: [0, Math.PI, 0], parent }, 1, <CodeEditor typed={typed} done={done} />)]}>
      <group position={gp} rotation={[0, gy, 0]} scale={s}>
        <Character pose={p} role="developer" position={[0, 0, 0]} />
        <Stool seat={SEAT} position={[0, 0, -0.02]} />
        <Desk position={[0, 0, 0.36]} w={0.78} d={0.44} h={0.38} />
        <Laptop position={laptopLocal} rotation={[0, Math.PI, 0]} open={1} />
      </group>
    </Stage>
  );
};

// ---------------- POSES LINEUP ----------------
const PoseCam: Cam = { pos: [0, 4.2, 17.5], target: [0, -1.25, -1.3], fov: 29 };
const PosesShow: React.FC = () => {
  const t = useT();
  const s = 1.55;
  const X = [-2.0, -0.67, 0.67, 2.0];
  const zF = 0.6,
    zB = -2.3;
  const cell = 0.0125;
  // walk on a small circle (distance-driven phase)
  const R = 0.42,
    om = 1.5;
  const ang = t * om;
  const wpos: [number, number, number] = [X[0] + Math.sin(ang) * R, FLOOR, zF + Math.cos(ang) * R - R * 0.2];
  const wHead = ang + Math.PI / 2;
  const intro = (i: number) => {
    const u = springStep(t - 0.08 * i, { k: 170, c: 13 });
    return Math.max(0.001, u);
  };
  const lab = (txt: string, x: number, z: number) => (
    <Txt size={0.15} color={C.navy} position={[x, FLOOR + 0.03, z + 0.62]} rotation={[-Math.PI / 2 + 0.35, 0, 0]}>
      {txt}
    </Txt>
  );
  return (
    <Stage cam={PoseCam}>
      <Character pose={walk(R * om * t / s, 1)} position={wpos} rotationY={wHead} scale={s * intro(0)} cell={cell} />
      <Character pose={cheer(t, 1)} position={[X[1], FLOOR, zF]} rotationY={-0.1} scale={s * intro(1)} cell={cell} />
      <Character pose={think(t)} position={[X[2], FLOOR, zF]} rotationY={-0.25} scale={s * intro(2)} cell={cell} />
      <Character pose={withArm(point(t), "L", armHoldSelf("L", 0, "tablet"))} position={[X[3], FLOOR, zF]} rotationY={-0.2} scale={s * intro(3)} cell={cell} holdL={<Held kind="tablet" side="L" />} />
      <Character pose={holdPhone(t)} position={[X[0], FLOOR, zB]} rotationY={0.35} scale={s * intro(4)} cell={cell} holdR={<Held kind="phone" side="R" />} />
      <group position={[X[1], FLOOR, zB]} rotation={[0, 0.25, 0]} scale={s * intro(5)}>
        <Character pose={typeAt(t, sit(t), 0.115, 0.29)} cell={cell} />
        <Stool seat={SEAT} position={[0, 0, -0.02]} />
        <Desk position={[0, 0, 0.36]} w={0.66} d={0.4} h={0.38} />
        <Laptop position={[0, 0.38, 0.33]} rotation={[0, Math.PI, 0]} scale={0.85} />
      </group>
      <Character pose={wave(t)} position={[X[2], FLOOR, zB]} rotationY={-0.15} scale={s * intro(6)} cell={cell} />
      <group position={[X[3], FLOOR, zB]} rotation={[0, -0.45, 0]} scale={s * intro(7)}>
        <Character pose={sit(t)} cell={cell} />
        <Stool seat={SEAT} position={[0, 0, -0.02]} color={C.steel} />
      </group>
      {lab("WALK", X[0], zF)}
      {lab("CHEER", X[1], zF)}
      {lab("THINK", X[2], zF)}
      {lab("POINT", X[3], zF)}
      {lab("HOLD PHONE", X[0], zB)}
      {lab("TYPE", X[1], zB)}
      {lab("WAVE", X[2], zB)}
      {lab("SIT", X[3], zB)}
    </Stage>
  );
};

// ---------------- CROWD ----------------
const CrowdCam: Cam = { pos: [0, 8.5, 19], target: [0, -1.9, -1.2], fov: 30 };
const MEMBERS = planCrowd(130, { center: [0, -1.0], spacing: 0.265, ring: 8.5, seed: 11 });
const CrowdShow: React.FC = () => {
  const t = useT();
  return (
    <Stage cam={camDrift(CrowdCam, t)} contact={0.45}>
      <Crowd t={t} members={MEMBERS} y={FLOOR} scale={0.58} gatherAt={0.0} gatherDur={2.5} cheerAt={3.0} disperseAt={4.1} disperseDur={2.3} faceTo={[0, 8]} />
    </Stage>
  );
};

// ---------------- BUBBLES ----------------
const BubCam: Cam = { pos: [0, 1.1, 13.6], target: [0, -0.35, 0], fov: 26 };
const BubblesShow: React.FC = () => {
  const t = useT();
  const s = 2.25;
  const pop1 = springStep(t - 0.3, { k: 190, c: 11 });
  const jig1 = wobble(t - 0.3, 0.08, 3.2, 0.22);
  const pop2 = springStep(t - 2.4, { k: 150, c: 10 });
  const puffs = range(t, 2.15, 2.45);
  return (
    <Stage cam={camDrift(BubCam, t)}>
      <Character pose={holdPhone(t)} role="customer" position={[-1.05, FLOOR, 0.2]} rotationY={0.42} scale={s} holdR={<Held kind="phone" side="R" />} />
      <Character pose={think(t)} role="doctor" position={[1.1, FLOOR, -0.2]} rotationY={-0.45} scale={s} />
      {t > 0.3 && <SpeechBubble w={1.75} h={0.95} tail="left" pop={pop1} jiggle={jig1} dots={t} text="Open today?" textIn={range(t, 1.75, 2.05)} position={[-0.25, 1.05, 0.4]} rotation={[0, 0.12, 0]} />}
      {t > 2.15 && <ThoughtBubble w={1.6} h={1.05} side="right" pop={pop2} puffs={puffs} dots={t} text="4-9 PM" textIn={range(t, 3.6, 3.9)} position={[0.55, 2.05, -0.3]} rotation={[0, -0.12, 0]} />}
    </Stage>
  );
};

export const ITEMS: LibItem[] = [
  { id: "characters-owner", name: "Business owner", nameBn: "ব্যবসার মালিক", group: "characters", kind: "component", duration: 5.6, still: 2.9, tags: ["persona", "title", "answer", "cta", "steps"], note: "<Character role='owner' pose={walk|wave|point…} holdL={<Held kind='cup' side='L'/>}/> — collar + tie, coffee cup in hand", Comp: OwnerShow },
  { id: "characters-doctor", name: "Doctor", nameBn: "ডাক্তার", group: "characters", kind: "component", duration: 5.2, still: 2.4, tags: ["persona", "answer", "faq", "quote"], note: "role='doctor' — fused lab coat (sleeves follow arms) + stethoscope; holdL clipboard; think/point poses", Comp: DoctorShow },
  { id: "characters-customer", name: "Customer", nameBn: "কাস্টমার", group: "characters", kind: "component", duration: 5, still: 1.5, tags: ["persona", "chat", "before_after", "cta"], note: "role='customer' — cap; walk while holding a phone (holdR phone) + shopping bag (holdL bag)", Comp: CustomerShow },
  { id: "characters-receptionist", name: "Receptionist", nameBn: "রিসেপশনিস্ট", group: "characters", kind: "component", duration: 5, still: 3.0, tags: ["persona", "steps", "chat", "answer"], note: "role='receptionist' — headset + lanyard ID; typeAt(t, stand, 0.17, 0.3) behind a counter, hands visible", Comp: ReceptionistShow },
  { id: "characters-developer", name: "Developer", nameBn: "ডেভেলপার", group: "characters", kind: "component", duration: 5.5, still: 2.2, tags: ["persona", "steps", "timeline", "answer"], note: "role='developer' — headphones; sit + typeAt on a laptop (laptopScreen DOM code editor), cheer on deploy", Comp: DeveloperShow },
  { id: "characters-poses", name: "Pose set", nameBn: "সব ভঙ্গি", group: "characters", kind: "component", duration: 5, still: 2.6, tags: ["persona", "steps"], note: "poses.ts: walk(dist,k) cheer think point(D) holdPhone type(typeAt) wave sit — mixPose/withArm blend them", Comp: PosesShow },
  { id: "characters-crowd", name: "Crowd (instanced)", nameBn: "ভিড় (১৩০ জন)", group: "characters", kind: "component", duration: 6, still: 3.4, tags: ["stat", "title", "cta", "compare"], note: "<Crowd t members={planCrowd(n)} gatherAt disperseAt cheerAt/> — 14 baked one-piece meshes, instanced", Comp: CrowdShow },
  { id: "characters-bubbles", name: "Speech & thought bubbles", nameBn: "কথা ও ভাবনার বাবল", group: "characters", kind: "component", duration: 5.5, still: 4.6, tags: ["chat", "faq", "quote", "myth"], note: "<SpeechBubble pop dots text textIn tail/> <ThoughtBubble pop puffs dots text/> — one-piece soft clay", Comp: BubblesShow },
];
