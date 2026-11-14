// scenes_e — steps + timeline scene template showcase (প্রতিটা দুই+ industry, ছোট বাংলা VO-র আনুমানিক শব্দ-সময়)
import React from "react";
import { LibItem } from "../types";
import { makeCue, useT } from "./common";
import { SceneSteps, StepsData } from "./SceneSteps";
import { SceneTimeline, TimelineData } from "./SceneTimeline";

export { SceneSteps, SceneTimeline };
export type { StepsData, TimelineData };

// ---------- steps: dental ----------
const STEPS_DENTAL: StepsData = {
  industry: "dental",
  title: "SERIAL IN 4 STEPS",
  steps: [
    { label: "CALL THE CHAMBER", cue: "ফোন", icon: "phone" },
    { label: "PICK A DATE", cue: "তারিখ", icon: "calendar", unit: "NOV", from: "10", text: "12" },
    { label: "COME FOR TREATMENT", cue: "চেম্বারে", icon: "tooth" },
    { label: "PAY THE BILL", cue: "bill", icon: "pay", text: "BDT 800" },
  ],
  doneLabel: "ALL DONE",
  doneCue: "ব্যস",
};
// "serial নিতে চারটা ধাপ। প্রথমে ফোন করুন, তারপর তারিখ বেছে নিন, চেম্বারে এসে treatment, শেষে bill দিন। ব্যস।"
const VO_DENTAL: [string, number][] = [
  ["serial", 0.3], ["নিতে", 0.75], ["চারটা", 1.1], ["ধাপ", 1.5], ["প্রথমে", 1.95], ["ফোন", 2.45], ["করুন", 2.8], ["তারপর", 3.7], ["তারিখ", 4.15],
  ["বেছে", 4.6], ["নিন", 4.9], ["চেম্বারে", 5.75], ["এসে", 6.25], ["treatment", 6.6], ["শেষে", 7.7], ["bill", 8.1], ["দিন", 8.45], ["ব্যস", 9.5],
];

// ---------- steps: restaurant ----------
const STEPS_RESTAURANT: StepsData = {
  industry: "restaurant",
  title: "ORDER IN 4 STEPS",
  steps: [
    { label: "FIND THE MENU", cue: "menu", icon: "search" },
    { label: "SEND YOUR ORDER", cue: "WhatsApp", icon: "chat", text: "2 KACCHI" },
    { label: "PAY BY BKASH", cue: "bKash", icon: "pay", text: "BDT 640" },
    { label: "FOOD AT YOUR TABLE", cue: "গরম", icon: "cloche" },
  ],
  doneLabel: "ENJOY YOUR MEAL",
};
// "খাবারের order চার ধাপে। menu দেখুন, WhatsApp-এ লিখে পাঠান, bKash-এ pay করুন, আর গরম খাবার চলে আসবে টেবিলে।"
const VO_RESTAURANT: [string, number][] = [
  ["খাবারের", 0.3], ["order", 0.8], ["চার", 1.2], ["ধাপে", 1.5], ["menu", 2.1], ["দেখুন", 2.55], ["WhatsApp-এ", 3.6], ["লিখে", 4.2], ["পাঠান", 4.55],
  ["bKash-এ", 5.5], ["pay", 6.05], ["করুন", 6.35], ["আর", 7.2], ["গরম", 7.5], ["খাবার", 7.9], ["চলে", 8.35], ["আসবে", 8.6], ["টেবিলে", 9.0],
];

// ---------- timeline: ecommerce (days) ----------
const TL_ECOM: TimelineData = {
  industry: "ecommerce",
  unit: "DAY",
  total: 5,
  title: "ORDER TO DOOR",
  stations: [
    { label: "ORDER", at: 1, cue: "order", icon: "chat", text: "CONFIRMED" },
    { label: "PACKED", at: 2, cue: "pack", icon: "bag", text: "SHOP" },
    { label: "SHIPPED", at: 3, cue: "courier", icon: "box", text: "#2481" },
    { label: "DELIVERED", at: 5, cue: "দরজায়", icon: "check", pay: "CASH ON DELIVERY", payCue: "টাকা" },
  ],
};
// "প্রথম দিনে order confirm, দ্বিতীয় দিনে pack, তৃতীয় দিনে courier-এ, আর পাঁচ দিনের মধ্যে আপনার দরজায় — টাকা দেবেন হাতে পেয়ে।"
const VO_ECOM: [string, number][] = [
  ["প্রথম", 0.4], ["দিনে", 0.8], ["order", 1.15], ["confirm", 1.6], ["দ্বিতীয়", 2.6], ["দিনে", 3.05], ["pack", 3.45], ["তৃতীয়", 4.5], ["দিনে", 4.95],
  ["courier-এ", 5.3], ["আর", 6.4], ["পাঁচ", 6.7], ["দিনের", 7.05], ["মধ্যে", 7.4], ["আপনার", 7.75], ["দরজায়", 8.1], ["টাকা", 9.2], ["দেবেন", 9.55], ["হাতে", 9.95], ["পেয়ে", 10.3],
];

// ---------- timeline: school (payment milestones, months) ----------
const TL_SCHOOL: TimelineData = {
  industry: "school",
  unit: "MONTH",
  total: 6,
  title: "FEES IN 4 PARTS",
  stations: [
    { label: "ADMISSION", at: 0, cue: "ভর্তির", icon: "form", lines: ["NAME", "CLASS", "PHONE"], pay: "BDT 5,000", payCue: "fee" },
    { label: "1ST PART", at: 1, cue: "এক", icon: "book", text: "ABC", pay: "BDT 3,000" },
    { label: "2ND PART", at: 3, cue: "তিন", icon: "chat", text: "PAID", pay: "BDT 3,000" },
    { label: "FINAL PART", at: 6, cue: "ছয়", icon: "check", pay: "BDT 3,000", payCue: "শেষ" },
  ],
};
// "ভর্তির দিনে admission fee, এক মাস পরে প্রথম কিস্তি, তিন মাসে দ্বিতীয়, আর ছয় মাসে শেষ কিস্তি।"
const VO_SCHOOL: [string, number][] = [
  ["ভর্তির", 0.5], ["দিনে", 0.95], ["admission", 1.3], ["fee", 1.95], ["এক", 3.0], ["মাস", 3.3], ["পরে", 3.6], ["প্রথম", 3.95], ["কিস্তি", 4.4],
  ["তিন", 5.6], ["মাসে", 5.95], ["দ্বিতীয়", 6.35], ["আর", 7.5], ["ছয়", 7.8], ["মাসে", 8.15], ["শেষ", 8.6], ["কিস্তি", 8.95],
];

const mkSteps = (data: StepsData, vo: [string, number][], dur: number): React.FC => {
  const cue = makeCue(vo);
  return () => <SceneSteps t={useT()} dur={dur} cue={cue} data={data} />;
};
const mkTl = (data: TimelineData, vo: [string, number][], dur: number): React.FC => {
  const cue = makeCue(vo);
  return () => <SceneTimeline t={useT()} dur={dur} cue={cue} data={data} />;
};

const STEP_NOTE = "<SceneSteps t dur cue data={{industry, title?, steps:[{label, cue?, icon?, text?, lines?, unit?, from?}] (3–5), doneLabel?, doneCue?}}/>";
const TL_NOTE = "<SceneTimeline t dur cue data={{industry, unit:'DAY'|'WEEK'|'MONTH', total?, title?, stations:[{label, at, cue?, icon?, text?, lines?, pay?, payCue?}] (3–5)}}/>";

export const ITEMS: LibItem[] = [
  { id: "scenes-steps-dental", name: "Steps scene — dental serial", nameBn: "ধাপ scene — dental serial", group: "scenes", kind: "scene", duration: 11, still: 7.4, tags: ["steps"], note: STEP_NOTE, Comp: mkSteps(STEPS_DENTAL, VO_DENTAL, 11) },
  { id: "scenes-steps-restaurant", name: "Steps scene — restaurant order", nameBn: "ধাপ scene — রেস্তোরাঁর order", group: "scenes", kind: "scene", duration: 11, still: 9.2, tags: ["steps"], note: STEP_NOTE, Comp: mkSteps(STEPS_RESTAURANT, VO_RESTAURANT, 11) },
  { id: "scenes-timeline-ecommerce", name: "Timeline scene — order to delivery (days)", nameBn: "সময়রেখা scene — order থেকে delivery", group: "scenes", kind: "scene", duration: 12, still: 6.6, tags: ["timeline"], note: TL_NOTE, Comp: mkTl(TL_ECOM, VO_ECOM, 12) },
  { id: "scenes-timeline-school", name: "Timeline scene — fee instalments (months)", nameBn: "সময়রেখা scene — কিস্তিতে ভর্তি fee", group: "scenes", kind: "scene", duration: 11, still: 6.8, tags: ["timeline", "price"], note: TL_NOTE, Comp: mkTl(TL_SCHOOL, VO_SCHOOL, 11) },
];
