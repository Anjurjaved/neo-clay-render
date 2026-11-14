// showcase: একই site — উপরে kit Tablet-এ desktop রূপ, নিচে-ডানে iPhone-এ mobile রূপ; দুটোই ঢোকে (clay pop),
// section reveal হয়, তারপর anchor ধরে ধরে scroll করে (প্রতিটায় একটু থামে), শেষে স্থির।
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage, atScreen, worldWidth, DEFAULT_CAM, Cam } from "../../kit/Stage";
import { FPS } from "../../kit/time";
import { Phone, phoneScreen, PHONE, Tablet, tabletScreen, TABLET } from "../../kit/Device";
import { popIn, springStep, range, drift, emphDecel, wobble } from "../../kit/anim";
import { Mode, SiteDef, SiteProps, anchorOf } from "./ui";

export type ShowcaseCfg = {
  Site: React.FC<SiteProps>;
  def: SiteDef;
  stops: { desktop: string[]; mobile: string[] }; // scroll করে কোন section-গুলোয় থামবে (ক্রমানুসারে)
  duration?: number;
};

const cam: Cam = DEFAULT_CAM;
const TZ = 1.2;
const PZ = 3.4;
const TAB = atScreen(0.47, 0.3, TZ, cam);
const TAB_S = worldWidth(0.78, TZ, cam) / TABLET.w;
const PH = atScreen(0.67, 0.715, PZ, cam);
const PH_S = worldWidth(0.31, PZ, cam) / PHONE.w;

/** stops ধরে scroll: প্রতিটা stop-এ যাওয়া (emphDecel) + থামা */
const scrollAt = (t: number, def: SiteDef, mode: Mode, keys: string[], t0: number, t1: number) => {
  const ys = [0, ...keys.map((k) => anchorOf(def, mode, k))];
  const seg = (t1 - t0) / (ys.length - 1);
  let y = 0;
  for (let i = 1; i < ys.length; i++) {
    const a = t0 + (i - 1) * seg;
    const k = emphDecel(range(t, a, a + seg * 0.62));
    if (t >= a) y = ys[i - 1] + (ys[i] - ys[i - 1]) * k;
  }
  return y;
};

export const makeShowcase = ({ Site, def, stops, duration = 6 }: ShowcaseCfg): React.FC => {
  const C: React.FC = () => {
    const t = useCurrentFrame() / FPS;
    const end = duration - 0.5;
    const tp = popIn(t, 0.05, { k: 210, c: 15 });
    const pp = popIn(t, 0.3, { k: 230, c: 14 });
    const reveal = range(t, 0.2, 1.2);
    const sD = scrollAt(t, def, "desktop", stops.desktop, 1.9, end);
    const sM = scrollAt(t, def, "mobile", stops.mobile, 2.1, end);
    // scroll থামার মুহূর্তে device-এ হালকা follow-through কাঁপুনি
    const tilt = wobble(t - 1.9, 0.012, 1.4, 0.3);
    const tab = {
      position: [TAB[0] + 0.04 * drift(t, 1), TAB[1] + 0.05 * drift(t, 2), TAB[2]] as [number, number, number],
      rotation: [0.06 + 0.015 * drift(t, 4) + tilt, -0.24 + 0.03 * drift(t, 5), 0.0] as [number, number, number],
      scale: TAB_S * Math.max(0.0001, tp.s),
    };
    const ph = {
      position: [PH[0] + 0.03 * drift(t, 7), PH[1] + 0.05 * drift(t, 8) + 0.2 * (1 - springStep(t - 0.3, { k: 120, c: 13 })), PH[2]] as [number, number, number],
      rotation: [0.03 + 0.012 * drift(t, 9), -0.32 + 0.04 * drift(t, 3), 0.05] as [number, number, number],
      scale: PH_S * Math.max(0.0001, pp.s),
    };
    const screens = [];
    if (tp.s > 0.02) screens.push(tabletScreen(tab, <Site mode="desktop" scroll={sD} reveal={reveal} />, { opacity: Math.min(1, tp.s * 1.6), bg: "#fff" }));
    if (pp.s > 0.02) screens.push(phoneScreen(ph, <Site mode="mobile" scroll={sM} reveal={range(t, 0.4, 1.4)} />, { kind: "iphone", opacity: Math.min(1, pp.s * 1.6) }));
    const camLive: Cam = { ...cam, pos: [cam.pos[0] + 0.12 * drift(t, 11), cam.pos[1] + 0.06 * drift(t, 12), cam.pos[2] - 0.6 * range(t, 0, duration)] };
    return (
      <Stage cam={camLive} screens={screens}>
        {tp.s > 0.02 && <Tablet {...tab} />}
        {pp.s > 0.02 && <Phone {...ph} kind="iphone" />}
      </Stage>
    );
  };
  return C;
};
