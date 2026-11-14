// screens_chat showcase rig — kit Phone frame-এর মাঝে বড় (প্রস্থের ~62%), 3/4 কোণে; spring-এ ঢোকে, হালকা ভাসে,
// notification/call এলে `buzz` দিয়ে কাঁপে (haptic)। floor phone-এর নিচের কিনারার নিচে (LESSONS D6/rule 7)।
import React from "react";
import { Stage, atScreen, worldWidth, DEFAULT_CAM } from "../../kit/Stage";
import { Phone, phoneScreen, PHONE, PhoneKind } from "../../kit/Device";
import { popIn, springStep, drift } from "../../kit/anim";

const Z = 1;
const SCALE = worldWidth(0.62, Z, DEFAULT_CAM) / PHONE.w;
const CENTER = atScreen(0.5, 0.465, Z, DEFAULT_CAM);
export const SHOW_FLOOR = CENTER[1] - (PHONE.h * SCALE) / 2 - 0.38;

export const PhoneShow: React.FC<{
  t: number;
  kind?: PhoneKind;
  screen: React.ReactNode;
  bg?: string;
  /** 0..1 — এই মুহূর্তে haptic কাঁপুনির শক্তি */
  buzz?: number;
  /** শেষ ভঙ্গি: y-ঘোরা (rad) */
  yaw?: number;
}> = ({ t, kind = "iphone", screen, bg = "#fff", buzz = 0, yaw = -0.3 }) => {
  const p = popIn(t, 0.05, { k: 170, c: 15 });
  const swingIn = springStep(t - 0.05, { k: 55, c: 8 });
  const sc = SCALE * Math.max(0.0001, p.s);
  const shake = buzz > 0 ? Math.sin(t * 92) * 0.022 * buzz : 0;
  const ph = {
    position: [CENTER[0] + shake * 3, CENTER[1] + 0.06 * drift(t, 1.3) + (1 - swingIn) * -0.8, CENTER[2]] as [number, number, number],
    rotation: [-0.06 + 0.02 * drift(t, 4.1), yaw + (1 - swingIn) * -0.7 + 0.03 * drift(t, 2.2), 0.015 + shake] as [number, number, number],
    scale: sc,
  };
  const on = p.s > 0.02;
  return (
    <Stage floorY={SHOW_FLOOR} contact={0.42} contactBlur={3} screens={on ? [phoneScreen(ph, screen, { kind, bg, opacity: Math.min(1, p.s * 1.6) })] : []}>
      <Phone {...ph} kind={kind} />
    </Stage>
  );
};
