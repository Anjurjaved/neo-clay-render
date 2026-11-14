// icons group — 30 fused clay icons + the "icons-set" grid showcase
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../../kit/Stage";
import { FPS } from "../../kit/time";
import { popIn, springStep, wobble, clamp } from "../../kit/anim";
import { LibItem } from "../types";
import { ClayIcon, Clock, Hourglass, Gear, Bell } from "./Icons";
import { ICON_KEYS } from "./defs";

export * from "./Icons";
export { PAL as ICON_PAL, ICON_KEYS } from "./defs";

type Meta = { key: string; name: string; nameBn: string; tags: string[]; tilt?: number };
const META: Meta[] = [
  { key: "tooth", name: "Tooth", nameBn: "দাঁত", tags: ["persona", "answer", "title"] },
  { key: "map-pin", name: "Map pin", nameBn: "ম্যাপ পিন", tags: ["answer", "points", "stat"] },
  { key: "shield-check", name: "Shield check", nameBn: "সুরক্ষা শিল্ড", tags: ["checklist", "points", "myth"] },
  { key: "padlock", name: "Padlock", nameBn: "তালা", tags: ["points", "myth", "faq"] },
  { key: "key", name: "Key", nameBn: "চাবি", tags: ["points", "answer"] },
  { key: "globe", name: "Globe", nameBn: "গ্লোব (ওয়েব)", tags: ["title", "points", "answer"] },
  { key: "server", name: "Server", nameBn: "সার্ভার", tags: ["points", "steps", "compare"] },
  { key: "cloud", name: "Cloud", nameBn: "ক্লাউড", tags: ["points", "answer"] },
  { key: "gear", name: "Gear", nameBn: "গিয়ার", tags: ["steps", "points"] },
  { key: "wrench", name: "Wrench", nameBn: "রেঞ্চ", tags: ["steps", "faq"] },
  { key: "magnifier", name: "Magnifier", nameBn: "ম্যাগনিফায়ার (সার্চ)", tags: ["answer", "faq", "title"] },
  { key: "envelope", name: "Envelope", nameBn: "খাম (ইমেইল)", tags: ["cta", "chat"] },
  { key: "bell", name: "Bell", nameBn: "নোটিফিকেশন বেল", tags: ["chat", "cta"] },
  { key: "chart-up", name: "Chart up", nameBn: "গ্রোথ চার্ট", tags: ["stat", "before_after"] },
  { key: "star", name: "Star", nameBn: "স্টার (রেটিং)", tags: ["stat", "quote"] },
  { key: "calendar", name: "Calendar", nameBn: "ক্যালেন্ডার", tags: ["timeline", "steps"] },
  { key: "clock", name: "Clock", nameBn: "ঘড়ি", tags: ["timeline", "stat"] },
  { key: "hourglass", name: "Hourglass", nameBn: "বালিঘড়ি", tags: ["timeline", "myth"] },
  { key: "megaphone", name: "Megaphone", nameBn: "মেগাফোন", tags: ["title", "cta"], tilt: 0.22 },
  { key: "cart", name: "Cart", nameBn: "শপিং কার্ট", tags: ["price", "points"] },
  { key: "shopping-bag", name: "Shopping bag", nameBn: "শপিং ব্যাগ", tags: ["price", "persona"] },
  { key: "document", name: "Document", nameBn: "ডকুমেন্ট", tags: ["checklist", "steps", "faq"] },
  { key: "stamp", name: "Stamp", nameBn: "স্ট্যাম্প (সিল)", tags: ["checklist", "myth"] },
  { key: "phone-handset", name: "Phone handset", nameBn: "ফোন রিসিভার (কল)", tags: ["cta", "chat"] },
  { key: "chat-bubble", name: "Chat bubble", nameBn: "চ্যাট বাবল", tags: ["chat", "quote", "faq"] },
  { key: "rocket", name: "Rocket", nameBn: "রকেট", tags: ["title", "cta", "stat"], tilt: -0.62 },
  { key: "lightning", name: "Lightning", nameBn: "বিদ্যুৎ (স্পিড)", tags: ["stat", "compare"] },
  { key: "heart", name: "Heart", nameBn: "হার্ট (লাইক)", tags: ["quote", "persona"] },
  { key: "home", name: "Home", nameBn: "বাড়ি (হোম)", tags: ["title", "persona"] },
  { key: "users", name: "Users", nameBn: "ইউজার (মানুষ)", tags: ["persona", "stat"] },
];

/** one icon with its own natural motion at time t */
const IconAt: React.FC<{ k: string; t: number; res?: number; tilt?: number }> = ({ k, t, res, tilt = 0 }) => {
  const common = { res, rotation: [0, 0, tilt] as [number, number, number] };
  if (k === "gear") return <Gear {...common} spin={-t * 0.9} />;
  if (k === "clock") return <Clock {...common} hours={10.05 + t * 0.22} />;
  if (k === "hourglass") return <Hourglass {...common} sand={clamp((t - 0.5) / 2.3)} />;
  if (k === "bell") return <Bell {...common} swing={wobble(t - 0.45, 0.34, 1.5, 0.1)} />;
  return <ClayIcon name={k} {...common} />;
};

const Showcase: React.FC<{ m: Meta }> = ({ m }) => {
  const t = useCurrentFrame() / FPS;
  const p = popIn(t, 0.08, { k: 190, c: 11 });
  const spinIn = 1 - springStep(t - 0.08, { k: 60, c: 9 });
  const ry = -0.62 + 0.8 * (0.5 - 0.5 * Math.cos(Math.PI * clamp(t / 3))) - spinIn * 1.4;
  const bob = Math.sin(t * 2.1) * 0.04 * clamp(t - 0.5);
  const S = 2.15 * p.s;
  return (
    <Stage>
      <group position={[0, 0.05 + bob, 0]} rotation={[0.1, ry, 0]} scale={[S * p.sx, S * p.sy, S]}>
        <IconAt k={m.key} t={t} tilt={m.tilt} />
      </group>
    </Stage>
  );
};

const one = (m: Meta): LibItem => ({
  id: `icons-${m.key}`,
  name: m.name,
  nameBn: m.nameBn,
  group: "icons",
  kind: "component",
  duration: 3,
  still: 2.2,
  tags: m.tags,
  note: `<ClayIcon name="${m.key}" color accent ink scale/> (~2 units tall at scale 1)`,
  Comp: () => <Showcase m={m} />,
});

const SetGrid: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cols = 5,
    gap = 1.16;
  return (
    <Stage floor={false} contact={0} softShadow={0} cam={{ pos: [0, 0, 21], target: [0, 0, 0], fov: 27 }}>
      {META.map((m, i) => {
        const c = i % cols,
          r = Math.floor(i / cols);
        const x = (c - (cols - 1) / 2) * gap,
          y = (2.5 - r) * gap * 1.32;
        const t0 = 0.05 + (r + c) * 0.07;
        const p = popIn(t, t0, { k: 220, c: 12 });
        const ry = -0.5 + 0.5 * Math.sin(t * 1.1 + i * 0.7);
        const S = 0.5 * p.s;
        return (
          <group key={m.key} position={[x, y, 0]} rotation={[0.12, ry, 0]} scale={[S * p.sx, S * p.sy, S]}>
            <IconAt k={m.key} t={t} res={84} tilt={m.tilt} />
          </group>
        );
      })}
    </Stage>
  );
};

export const ITEMS: LibItem[] = [
  ...META.map(one),
  {
    id: "icons-set",
    name: "Icon set (30)",
    nameBn: "আইকন সেট (৩০টা)",
    group: "icons",
    kind: "component",
    duration: 4,
    still: 3,
    tags: ["points", "title", "checklist"],
    note: `all ${ICON_KEYS.length} icons in a 5×6 grid, staggered pop + idle sway`,
    Comp: () => <SetGrid />,
  },
];
