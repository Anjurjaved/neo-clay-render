// showcase-এর 3D rig: device ঢোকা (spring + ঘুরে থামা), tap/click-এ হালকা ধাক্কা (wobble), idle drift; pointer path।
import React from "react";
import * as THREE from "three";
import { Phone, phoneScreen, Tablet, tabletScreen, TABLET, PhoneKind } from "../../kit/Device";
import { Stage, Cam, DEFAULT_CAM } from "../../kit/Stage";
import { ScreenSpec, toMatrix } from "../../kit/Screens";
import { CheckBadge } from "../../kit/Soft";
import { springStep, wobble, drift, cubicPulse, range, standard, popIn } from "../../kit/anim";

export type Pose = { position: [number, number, number]; rotation: [number, number, number]; scale: number };
export type DeviceKind = "iphone" | "android" | "tablet" | "tablet-portrait";

/** pointer keyframes [সময়, x, y] → বর্তমান অবস্থান (মানুষের হাতের মতো ease-in-out, সামান্য বাঁকা পথ) */
export const track = (t: number, keys: [number, number, number][]) => {
  if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2] };
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, x0, y0] = keys[i], [t1, x1, y1] = keys[i + 1];
    if (t <= t1) {
      const k = standard(range(t, t0, t1));
      const arc = Math.sin(Math.PI * k) * Math.min(40, Math.hypot(x1 - x0, y1 - y0) * 0.12);
      return { x: x0 + (x1 - x0) * k + arc * 0.4, y: y0 + (y1 - y0) * k - arc };
    }
  }
  const l = keys[keys.length - 1];
  return { x: l[1], y: l[2] };
};
/** click/tap চাপ: down (0→1→0), ripple (0→1) */
export const press = (t: number, tc: number) => ({ down: cubicPulse(tc, 0.11, t), ripple: t > tc ? range(t, tc, tc + 0.5) : 0 });
/** একাধিক click-এর মধ্যে চলতি মান */
export const presses = (t: number, times: number[]) => {
  let down = 0, ripple = 0;
  for (const tc of times) {
    const p = press(t, tc);
    down = Math.max(down, p.down);
    if (p.ripple > 0 && p.ripple < 1) ripple = p.ripple;
  }
  return { down, ripple };
};

/** device-এর চলতি pose: enter spring, tap-ধাক্কা, idle drift */
export const devicePose = (t: number, base: Pose, opts: { enter?: number; taps?: number[]; seed?: number } = {}): Pose => {
  const { enter = 0.05, taps = [], seed = 1 } = opts;
  const p = springStep(t - enter, { k: 120, c: 13 });
  const pop = popIn(t, enter, { k: 170, c: 15 }).s;
  let rx = 0, z = 0;
  for (const tp of taps) {
    rx += wobble(t - tp, 0.028, 2.3, 0.3);
    z -= 0.06 * cubicPulse(tp + 0.04, 0.12, t);
  }
  const [x, y, zz] = base.position;
  return {
    position: [x + 0.03 * drift(t, seed), y + 0.05 * Math.sin(t * 1.1 + seed) - (1 - p) * 0.5, zz + z],
    rotation: [base.rotation[0] + rx + 0.015 * drift(t, seed + 2), base.rotation[1] + (1 - p) * 0.75 + 0.035 * drift(t, seed + 4), base.rotation[2] + (1 - p) * 0.12],
    scale: base.scale * Math.max(0.0001, pop),
  };
};

/** portrait tablet: mesh z-এ ৯০° ঘোরানো, DOM 700×1024 */
export const tabletPortraitScreen = (p: Pose, content: React.ReactNode, opts: Partial<ScreenSpec> = {}): ScreenSpec => ({
  matrix: toMatrix(p.position, p.rotation, p.scale).multiply(new THREE.Matrix4().makeTranslation(0, 0, TABLET.d / 2 + 0.004)),
  w: TABLET.h * 0.91,
  h: TABLET.w * 0.94,
  px: 700,
  py: 1024,
  radius: 16,
  content,
  ...opts,
});

export const DeviceMesh: React.FC<{ kind: DeviceKind; pose: Pose }> = ({ kind, pose }) => {
  if (kind === "tablet") return <Tablet {...pose} />;
  if (kind === "tablet-portrait")
    return (
      <group position={pose.position} rotation={pose.rotation} scale={pose.scale}>
        <Tablet rotation={[0, 0, Math.PI / 2]} />
      </group>
    );
  return <Phone {...pose} kind={kind as PhoneKind} />;
};

export const screenFor = (kind: DeviceKind, pose: Pose, content: React.ReactNode, opacity = 1): ScreenSpec => {
  if (kind === "tablet") return tabletScreen(pose, content, { opacity });
  if (kind === "tablet-portrait") return tabletPortraitScreen(pose, content, { opacity });
  return phoneScreen(pose, content, { kind: kind as PhoneKind, opacity });
};

/** পুরো showcase: Stage + device + screen + (ঐচ্ছিক) সাফল্যের 3D check badge পাশে */
export const DeviceShowcase: React.FC<{
  t: number;
  kind: DeviceKind;
  base: Pose;
  taps?: number[];
  ui: React.ReactNode;
  badgeAt?: number; // সাফল্যের সময় (s)
  badgePos?: [number, number, number];
  badgeScale?: number;
  dur: number;
}> = ({ t, kind, base, taps = [], ui, badgeAt, badgePos, badgeScale = 0.9, dur }) => {
  const pose = devicePose(t, base, { taps });
  const vis = pose.scale > 0.001;
  const op = Math.min(1, range(t, 0.08, 0.4) * 1.2);
  // camera device-এর কেন্দ্রের দিকে তাকায় → device frame-এর মাঝখানে, নিচে অল্প floor (D13)
  const cam: Cam = {
    ...DEFAULT_CAM,
    pos: [DEFAULT_CAM.pos[0] + 0.12 * drift(t, 5), DEFAULT_CAM.pos[1] + 0.06 * drift(t, 7), DEFAULT_CAM.pos[2] - 0.7 * standard(range(t, 0, dur))],
    target: [base.position[0] * 0.3, base.position[1] - 0.05, base.position[2]],
  };
  const b = badgeAt !== undefined && t > badgeAt ? popIn(t, badgeAt, { k: 260, c: 12 }) : null;
  return (
    <Stage cam={cam} screens={vis ? [screenFor(kind, pose, ui, op)] : []}>
      {vis && <DeviceMesh kind={kind} pose={pose} />}
      {b && badgePos && (
        <group position={[badgePos[0], badgePos[1] + 0.04 * Math.sin(t * 2), badgePos[2]]} scale={[badgeScale * b.s * b.sx, badgeScale * b.s * b.sy, badgeScale * b.s]} rotation={[0.1, -0.35 + 0.15 * Math.sin(t * 1.3), 0]}>
          <CheckBadge color="#2DBE60" />
        </group>
      )}
    </Stage>
  );
};
