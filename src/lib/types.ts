// Library contract — প্রতিটা item একটা showcase scene: পুরো Stage, নিজের duration-এ নিজের সেরা motion দেখায়
import React from "react";
export type LibKind = "component" | "screen" | "scene";
export type LibItem = {
  id: string; // kebab-case, globally unique, group prefix সহ: "devices-macbook"
  name: string; // English display name
  nameBn: string; // বাংলা নাম (dashboard-এর জন্য)
  group: string; // folder name
  kind: LibKind;
  duration: number; // seconds (2–8) — showcase দৈর্ঘ্য
  still: number; // কোন সেকেন্ডে thumbnail নেওয়া হবে
  tags?: string[]; // কোন scene type/format-এ লাগে: "price", "faq" …
  note?: string; // props / ব্যবহারের এক লাইন
  Comp: React.FC; // showcase — নিজে <Stage> render করে; সময় = useCurrentFrame()/FPS (0 থেকে)
};
