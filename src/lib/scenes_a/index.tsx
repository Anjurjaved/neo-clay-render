// scenes_a — scene templates: TITLE (opening hook) + QUOTE (owner-এর নিজের কথা)। showcase = sample data + sample cue।
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { FPS } from "../../kit/time";
import { makeCue } from "./common";
import { SceneTitle, TitleData } from "./SceneTitle";
import { SceneQuote, QuoteData } from "./SceneQuote";

export { SceneTitle, SceneQuote, makeCue };
export type { TitleData, QuoteData };
export type { Cue } from "./common";
export type { Industry } from "./industry";

// ---------------- sample data ----------------
const TITLE_DENTAL: TitleData = {
  industry: "dental",
  business: "DENTAL CHAMBER",
  place: "ZINDABAZAR, SYLHET",
  phone: {
    day: "Friday",
    time: "9:41",
    kind: "call",
    summary: "missed calls",
    count: 30,
    alerts: [
      { kind: "call", app: "Phone", text: "Missed call · +880 1711-24••••", time: "9:38" },
      { kind: "call", app: "Phone", text: "Missed call · +880 1819-40••••", time: "9:31" },
      { kind: "sms", app: "Messages", text: "আপা, আজ কি চেম্বার খোলা?", time: "9:20" },
      { kind: "call", app: "Phone", text: "Missed call · +880 1912-77••••", time: "9:12" },
      { kind: "call", app: "Phone", text: "Missed call · +880 1556-31••••", time: "8:57" },
    ],
  },
  lost: 3,
  title: "HOW MUCH DOES A\nWEBSITE COST?",
  sub: "DENTAL CHAMBER · 2026",
  open: 0.62,
  cues: { place: "জিন্দাবাজারে", problem: "ফোন", count: "তিরিশটা", lost: "রোগীরা", hook: "তাহলে" },
};
// "সিলেটের জিন্দাবাজারে ডাক্তার শিরিনের dental chamber। শুক্রবার সকালে ফোন খুলে দেখেন তিরিশটা missed call।
//  রোগীরা না পেয়ে চলে গেছে অন্য চেম্বারে। তাহলে website-এর খরচ আসলে কত?"
const CUE_TITLE_DENTAL = makeCue([
  ["সিলেটের", 0.2], ["জিন্দাবাজারে", 0.75], ["ডাক্তার", 1.5], ["শিরিনের", 1.9], ["dental", 2.4], ["chamber", 2.8],
  ["শুক্রবার", 3.4], ["সকালে", 3.95], ["ফোন", 4.4], ["খুলে", 4.75], ["দেখেন", 5.05], ["তিরিশটা", 5.5], ["missed", 6.05], ["call", 6.4],
  ["রোগীরা", 7.0], ["না", 7.45], ["পেয়ে", 7.6], ["চলে", 7.9], ["গেছে", 8.15], ["অন্য", 8.45], ["চেম্বারে", 8.75],
  ["তাহলে", 9.3], ["website-এর", 9.7], ["খরচ", 10.25], ["আসলে", 10.6], ["কত", 10.95],
]);

const TITLE_RESTAURANT: TitleData = {
  industry: "restaurant",
  business: "SPICE GARDEN",
  place: "DHANMONDI, DHAKA",
  phone: {
    day: "Friday",
    time: "8:47",
    kind: "chat",
    summary: "order messages",
    count: 18,
    alerts: [
      { kind: "chat", app: "WhatsApp", text: "ভাই, ২টা কাচ্চি পাঠানো যাবে?", time: "8:46" },
      { kind: "chat", app: "WhatsApp", text: "মেনু আর দামটা দিবেন প্লিজ", time: "8:41" },
      { kind: "chat", app: "WhatsApp", text: "ধানমন্ডি ২৭-এ delivery কত?", time: "8:33" },
      { kind: "chat", app: "WhatsApp", text: "আধা ঘণ্টা ধরে wait করছি…", time: "8:25" },
      { kind: "chat", app: "WhatsApp", text: "order টা cancel করে দেন", time: "8:19" },
    ],
  },
  lost: 4,
  title: "TAKE ORDERS ON\nYOUR OWN WEBSITE",
  sub: "RESTAURANT · 2026",
  open: 0.7,
  cues: { place: "ধানমন্ডির", problem: "WhatsApp", count: "দেরি", lost: "customer", hook: "নিজের" },
};
// "ধানমন্ডির Spice Garden রেস্টুরেন্ট। শুক্রবার রাতে WhatsApp-এ আঠারোটা order message, উত্তর দিতে দিতে দেরি।
//  customer অপেক্ষা না করে চলে গেল। নিজের website-এ order নিলে কেমন হয়?"
const CUE_TITLE_RESTAURANT = makeCue([
  ["ধানমন্ডির", 0.2], ["Spice", 0.85], ["Garden", 1.2], ["রেস্টুরেন্ট", 1.6], ["শুক্রবার", 2.4], ["রাতে", 2.9], ["WhatsApp-এ", 3.3],
  ["আঠারোটা", 4.0], ["order", 4.55], ["message", 4.9], ["উত্তর", 5.5], ["দিতে", 5.85], ["দিতে", 6.1], ["দেরি", 6.4],
  ["customer", 7.0], ["অপেক্ষা", 7.5], ["না", 7.95], ["করে", 8.1], ["চলে", 8.35], ["গেল", 8.6],
  ["নিজের", 9.2], ["website-এ", 9.6], ["order", 10.1], ["নিলে", 10.45], ["কেমন", 10.8], ["হয়", 11.15],
]);

const QUOTE_ECOM: QuoteData = {
  industry: "ecommerce",
  business: "TRENDY WEAR",
  quote: "Facebook page-এ দিনে পঞ্চাশটা message আসে, দাম জেনে চলে যায়, order হয় মাত্র পাঁচটা।",
  emphasis: ["পঞ্চাশটা", "পাঁচটা"],
  speaker: "Rafiq, Trendy Wear",
  problem: { kind: "leak", item: "messenger", n: 10, kept: 1, count: 50, keptCount: 5, label: "{kept} ORDERS FROM {n} MESSAGES", at: "message" },
};
const CUE_QUOTE_ECOM = makeCue([
  ["Facebook", 0.7], ["page-এ", 1.2], ["দিনে", 1.6], ["পঞ্চাশটা", 2.0], ["message", 2.6], ["আসে", 3.0], ["দাম", 3.6], ["জেনে", 3.95],
  ["চলে", 4.3], ["যায়", 4.6], ["order", 5.2], ["হয়", 5.6], ["মাত্র", 5.85], ["পাঁচটা", 6.25],
]);

const QUOTE_SCHOOL: QuoteData = {
  industry: "school",
  business: "BRIGHT COACHING",
  quote: "admission-এর সময় গার্ডিয়ানরা দিনে একশোবার একই প্রশ্ন করেন — ফি কত, ক্লাস কবে, সিট আছে কি না।",
  emphasis: ["একশোবার", "একই"],
  speaker: "Principal, Bright Coaching",
  problem: { kind: "pile", item: "question", n: 12, count: 100, label: "{n} SAME QUESTIONS", at: "একই" },
};
const CUE_QUOTE_SCHOOL = makeCue([
  ["admission-এর", 0.7], ["সময়", 1.3], ["গার্ডিয়ানরা", 1.7], ["দিনে", 2.4], ["একশোবার", 2.8], ["একই", 3.5], ["প্রশ্ন", 3.85], ["করেন", 4.25],
  ["ফি", 4.8], ["কত", 5.1], ["ক্লাস", 5.5], ["কবে", 5.9], ["সিট", 6.3], ["আছে", 6.6], ["কি", 6.85], ["না।", 7.0],
]);

const QUOTE_DENTAL: QuoteData = {
  industry: "dental",
  business: "DENTAL CHAMBER",
  quote: "রোগী দেখব না ফোন ধরব? সারাদিনে চল্লিশটা call, সবাই একই কথা জানতে চায়।",
  emphasis: ["চল্লিশটা"],
  speaker: "Dr. Shirin, Dentist",
  problem: { kind: "pile", item: "call", n: 10, count: 40, label: "{n} CALLS A DAY", at: "সারাদিনে" },
};
const CUE_QUOTE_DENTAL = makeCue([
  ["রোগী", 0.7], ["দেখব", 1.1], ["না", 1.5], ["ফোন", 1.7], ["ধরব?", 2.05], ["সারাদিনে", 2.8], ["চল্লিশটা", 3.4], ["call,", 3.95],
  ["সবাই", 4.5], ["একই", 4.85], ["কথা", 5.15], ["জানতে", 5.45], ["চায়।", 5.8],
]);

// ---------------- showcases ----------------
const mkTitle = (data: TitleData, cue: ReturnType<typeof makeCue>, dur: number): React.FC => () => {
  const t = useCurrentFrame() / FPS;
  return <SceneTitle t={t} dur={dur} cue={cue} data={data} />;
};
const mkQuote = (data: QuoteData, cue: ReturnType<typeof makeCue>, dur: number): React.FC => () => {
  const t = useCurrentFrame() / FPS;
  return <SceneQuote t={t} dur={dur} cue={cue} data={data} />;
};

const TITLE_NOTE = "<SceneTitle t dur cue data={TitleData}/> — industry shop + place pin/tag → owner walks in, phone alerts count up → customers leave → hook board drops";
const QUOTE_NOTE = "<SceneQuote t dur cue data={QuoteData}/> — owner in front of shop, clay speech bubble with Bangla words on cue, problem = pile | leak + counter tag";

export const ITEMS: LibItem[] = [
  { id: "scenes-title-dental", name: "Title hook — dental chamber, 30 missed calls", nameBn: "শুরুর hook — ডেন্টাল চেম্বার, ৩০টা missed call", group: "scenes", kind: "scene", duration: 12.5, still: 10.6, tags: ["title"], note: TITLE_NOTE, Comp: mkTitle(TITLE_DENTAL, CUE_TITLE_DENTAL, 12.5) },
  { id: "scenes-title-restaurant", name: "Title hook — restaurant, 18 unanswered orders", nameBn: "শুরুর hook — রেস্টুরেন্ট, ১৮টা order message", group: "scenes", kind: "scene", duration: 12.5, still: 6.2, tags: ["title"], note: TITLE_NOTE, Comp: mkTitle(TITLE_RESTAURANT, CUE_TITLE_RESTAURANT, 12.5) },
  { id: "scenes-quote-ecommerce", name: "Owner quote — 50 messages, 5 orders (leak)", nameBn: "মালিকের কথা — ৫০ message, ৫ order", group: "scenes", kind: "scene", duration: 10, still: 6.6, tags: ["quote"], note: QUOTE_NOTE, Comp: mkQuote(QUOTE_ECOM, CUE_QUOTE_ECOM, 10) },
  { id: "scenes-quote-school", name: "Owner quote — same question 100 times (pile)", nameBn: "মালিকের কথা — একই প্রশ্ন ১০০ বার", group: "scenes", kind: "scene", duration: 10, still: 7.4, tags: ["quote"], note: QUOTE_NOTE, Comp: mkQuote(QUOTE_SCHOOL, CUE_QUOTE_SCHOOL, 10) },
  { id: "scenes-quote-dental", name: "Owner quote — 40 calls a day (pile)", nameBn: "মালিকের কথা — দিনে ৪০টা call", group: "scenes", kind: "scene", duration: 9, still: 6.4, tags: ["quote"], note: QUOTE_NOTE, Comp: mkQuote(QUOTE_DENTAL, CUE_QUOTE_DENTAL, 9) },
];
