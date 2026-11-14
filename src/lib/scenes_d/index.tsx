// scenes_d — POINTS আর CHECKLIST scene template-এর showcase (sample বাংলা VO-র আনুমানিক শব্দ-সময় দিয়ে)
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { FPS } from "../../kit/time";
import { makeCue } from "./common";
import { ScenePoints, PointsData } from "./ScenePoints";
import { SceneChecklist, ChecklistData } from "./SceneChecklist";

export { ScenePoints, SceneChecklist };
export type { PointsData, ChecklistData };
export type { PointItem } from "./ScenePoints";
export type { CheckItem } from "./SceneChecklist";
export type { Cue, Industry, IconKey } from "./common";
export { Icon3D, ICON_KEYS } from "./icons";

// ---------- POINTS: dental ----------
// "একটা dental chamber-এর website-এ চারটা জিনিস থাকতেই হবে — online serial, চেম্বারের সময়, Google Maps-এ location, আর রোগীদের review।"
const PD: PointsData = {
  industry: "dental",
  title: "4 MUST-HAVES",
  titleWord: "চারটা",
  points: [
    { label: "ONLINE SERIAL", short: "SERIAL", word: "serial", icon: "calendar", text: "SAT" },
    { label: "CHAMBER HOURS", short: "HOURS", word: "সময়", icon: "clock" },
    { label: "GOOGLE MAPS", short: "MAPS", word: "Maps", icon: "pin" },
    { label: "PATIENT REVIEWS", short: "REVIEWS", word: "review", icon: "star" },
  ],
};
const PD_CUE = makeCue([
  ["একটা", 0.3], ["dental", 0.62], ["chamber-এর", 1.0], ["website-এ", 1.5], ["চারটা", 2.0], ["জিনিস", 2.4], ["থাকতেই", 2.75], ["হবে", 3.1],
  ["online", 3.5], ["serial", 3.9], ["চেম্বারের", 5.6], ["সময়", 6.15], ["Google", 7.6], ["Maps-এ", 8.0], ["location", 8.4], ["আর", 9.6], ["রোগীদের", 9.85], ["review", 10.4],
]);

// ---------- POINTS: restaurant (৩টা) ----------
// "রেস্তোরাঁর site-এ তিনটা জিনিস রাখুন — দামসহ পুরো menu, home delivery-র order, আর WhatsApp-এ table reservation।"
const PR: PointsData = {
  industry: "restaurant",
  title: "3 THINGS TO ADD",
  titleWord: "তিনটা",
  points: [
    { label: "FULL MENU + PRICE", short: "MENU", word: "menu", icon: "cloche" },
    { label: "HOME DELIVERY", short: "DELIVERY", word: "delivery", icon: "truck" },
    { label: "TABLE BOOKING", short: "BOOKING", word: "reservation", icon: "chat" },
  ],
};
const PR_CUE = makeCue([
  ["রেস্তোরাঁর", 0.3], ["site-এ", 0.95], ["তিনটা", 1.3], ["জিনিস", 1.7], ["রাখুন", 2.05], ["দামসহ", 2.7], ["পুরো", 3.15], ["menu", 3.5],
  ["home", 5.4], ["delivery-র", 5.75], ["order", 6.3], ["আর", 7.6], ["WhatsApp-এ", 7.9], ["table", 8.6], ["reservation", 9.0],
]);

// ---------- POINTS: real estate (৫টা) ----------
// "flat বিক্রির site-এ পাঁচটা জিনিস — আসল ছবি, ঠিক location, দাম আর size, handover-এর তারিখ, আর সরাসরি call button।"
const PE: PointsData = {
  industry: "realestate",
  title: "5 THINGS BUYERS CHECK",
  titleWord: "পাঁচটা",
  points: [
    { label: "REAL PHOTOS", short: "PHOTOS", word: "ছবি", icon: "photo" },
    { label: "EXACT LOCATION", short: "LOCATION", word: "location", icon: "pin" },
    { label: "PRICE + SIZE", short: "PRICE", word: "দাম", icon: "coins" },
    { label: "HANDOVER DATE", short: "HANDOVER", word: "handover", icon: "key" },
    { label: "CALL BUTTON", short: "CALL", word: "call", icon: "phone" },
  ],
};
const PE_CUE = makeCue([
  ["flat", 0.3], ["বিক্রির", 0.6], ["site-এ", 1.05], ["পাঁচটা", 1.4], ["জিনিস", 1.85], ["আসল", 2.5], ["ছবি", 2.85], ["ঠিক", 4.1], ["location", 4.4],
  ["দাম", 5.9], ["আর", 6.25], ["size", 6.5], ["handover-এর", 7.7], ["তারিখ", 8.3], ["আর", 9.3], ["সরাসরি", 9.55], ["call", 10.1], ["button", 10.45],
]);

// ---------- CHECKLIST: e-commerce ----------
// "online shop খোলার আগে এই চারটা মিলিয়ে নিন — bKash আর Nagad payment, cash on delivery, order tracking, আর পরিষ্কার return policy। তাহলেই বিক্রি শুরু।"
const CE: ChecklistData = {
  industry: "ecommerce",
  title: "BEFORE YOU LAUNCH",
  titleWord: "online",
  items: [
    { label: "BKASH + NAGAD PAYMENT", word: "bKash", icon: "card" },
    { label: "CASH ON DELIVERY", word: "cash", icon: "truck" },
    { label: "ORDER TRACKING", word: "tracking", icon: "phone" },
    { label: "RETURN POLICY", word: "return", icon: "shield" },
  ],
  done: "READY TO SELL",
  doneWord: "বিক্রি",
};
const CE_CUE = makeCue([
  ["online", 0.25], ["shop", 0.6], ["খোলার", 0.95], ["আগে", 1.3], ["এই", 1.6], ["চারটা", 1.85], ["মিলিয়ে", 2.25], ["নিন", 2.7],
  ["bKash", 3.1], ["আর", 3.55], ["Nagad", 3.75], ["payment", 4.15], ["cash", 4.9], ["on", 5.25], ["delivery", 5.4], ["order", 6.5], ["tracking", 6.85],
  ["আর", 7.9], ["পরিষ্কার", 8.1], ["return", 8.6], ["policy", 9.0], ["তাহলেই", 10.0], ["বিক্রি", 10.5], ["শুরু", 10.9],
]);

// ---------- CHECKLIST: school (৩টা) ----------
// "admission-এর মৌসুমে school-এর site-এ তিনটা জিনিস চাই — online admission form, ক্লাসের routine, আর result-এর notice। সব ঠিক থাকলে অভিভাবকের ফোন কমে।"
const CS: ChecklistData = {
  industry: "school",
  title: "ADMISSION SEASON",
  titleWord: "admission",
  items: [
    { label: "ONLINE ADMISSION FORM", word: "form", icon: "book" },
    { label: "CLASS ROUTINE", word: "routine", icon: "calendar" },
    { label: "RESULT NOTICE", word: "result", icon: "bell" },
  ],
  done: "FEWER CALLS",
  doneWord: "কমে",
};
const CS_CUE = makeCue([
  ["admission-এর", 0.25], ["মৌসুমে", 0.9], ["school-এর", 1.35], ["site-এ", 1.85], ["তিনটা", 2.15], ["জিনিস", 2.55], ["চাই", 2.9],
  ["online", 3.3], ["admission", 3.65], ["form", 4.25], ["ক্লাসের", 5.3], ["routine", 5.75], ["আর", 6.9], ["result-এর", 7.1], ["notice", 7.6],
  ["সব", 8.4], ["ঠিক", 8.65], ["থাকলে", 8.9], ["অভিভাবকের", 9.3], ["ফোন", 9.85], ["কমে", 10.15],
]);

const showPoints = (data: PointsData, cue: ReturnType<typeof makeCue>, dur: number): React.FC => () => {
  const t = useCurrentFrame() / FPS;
  return <ScenePoints t={t} dur={dur} cue={cue} data={data} />;
};
const showCheck = (data: ChecklistData, cue: ReturnType<typeof makeCue>, dur: number): React.FC => () => {
  const t = useCurrentFrame() / FPS;
  return <SceneChecklist t={t} dur={dur} cue={cue} data={data} />;
};

const NOTE_P = "ScenePoints({t,dur,cue,data:PointsData{industry,title,titleWord?,points:[{label,word,icon?,short?,text?}] 3–5}})";
const NOTE_C = "SceneChecklist({t,dur,cue,data:ChecklistData{industry,title,titleWord?,items:[{label,word,icon?,text?}] 3–5,done?,doneWord?}})";

export const ITEMS: LibItem[] = [
  { id: "scenes-points-dental", name: "Points — dental (4)", nameBn: "পয়েন্ট — ডেন্টাল (৪টা)", group: "scenes", kind: "scene", duration: 13, still: 11.6, tags: ["points"], note: NOTE_P, Comp: showPoints(PD, PD_CUE, 13) },
  { id: "scenes-points-restaurant", name: "Points — restaurant (3)", nameBn: "পয়েন্ট — রেস্তোরাঁ (৩টা)", group: "scenes", kind: "scene", duration: 12, still: 10.8, tags: ["points"], note: NOTE_P, Comp: showPoints(PR, PR_CUE, 12) },
  { id: "scenes-points-realestate", name: "Points — real estate (5)", nameBn: "পয়েন্ট — রিয়েল এস্টেট (৫টা)", group: "scenes", kind: "scene", duration: 13.5, still: 12.4, tags: ["points"], note: NOTE_P, Comp: showPoints(PE, PE_CUE, 13.5) },
  { id: "scenes-checklist-ecommerce", name: "Checklist — e-commerce (4)", nameBn: "চেকলিস্ট — ই-কমার্স (৪টা)", group: "scenes", kind: "scene", duration: 12.5, still: 11.4, tags: ["checklist"], note: NOTE_C, Comp: showCheck(CE, CE_CUE, 12.5) },
  { id: "scenes-checklist-school", name: "Checklist — school (3)", nameBn: "চেকলিস্ট — স্কুল (৩টা)", group: "scenes", kind: "scene", duration: 11.5, still: 10.6, tags: ["checklist"], note: NOTE_C, Comp: showCheck(CS, CS_CUE, 11.5) },
];
