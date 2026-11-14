// scenes_b — answer ও stat scene template-এর showcase (প্রতিটা আলাদা industry-র sample data + আনুমানিক VO শব্দ-সময়)
import React from "react";
import { LibItem } from "../types";
import { mkCue, useT } from "./common";
import { SceneAnswer, AnswerData } from "./SceneAnswer";
import { SceneStat, StatData } from "./SceneStat";

// ---------- answer ----------
// VO: "সহজ উত্তর হলো — Javed IT Solution-এ একটা dental chamber-এর website পনেরো থেকে তিরিশ হাজার টাকায় হয়, আর তৈরি হতে লাগে সাত থেকে চোদ্দ দিন।"
const ANS_DENTAL: { dur: number; data: AnswerData; words: [string, number][] } = {
  dur: 11.5,
  data: { industry: "dental", priceMin: 15000, priceMax: 30000, daysMin: 7, daysMax: 14, cues: { priceMin: "পনেরো", priceMax: "তিরিশ", daysMin: "সাত", daysMax: "চোদ্দ" } },
  words: [
    ["সহজ", 0.3], ["উত্তর", 0.62], ["হলো", 0.98], ["Javed", 1.3], ["IT", 1.68], ["Solution-এ", 1.9], ["একটা", 2.6], ["dental", 2.9], ["chamber-এর", 3.32],
    ["website", 3.95], ["পনেরো", 4.75], ["থেকে", 5.12], ["তিরিশ", 5.42], ["হাজার", 5.8], ["টাকায়", 6.1], ["হয়", 6.5], ["আর", 6.9], ["তৈরি", 7.2],
    ["হতে", 7.6], ["লাগে", 7.82], ["সাত", 8.3], ["থেকে", 8.66], ["চোদ্দ", 8.92], ["দিন", 9.42],
  ],
};
// VO: "এক কথায়: Javed IT Solution একটা restaurant-এর menu আর online order-সহ website বানায় পঁচিশ থেকে পঁয়তাল্লিশ হাজার টাকায়, সময় লাগে দশ থেকে একুশ দিন।"
const ANS_RESTAURANT: typeof ANS_DENTAL = {
  dur: 12.5,
  data: { industry: "restaurant", priceMin: 25000, priceMax: 45000, daysMin: 10, daysMax: 21, finish: "grey", cues: { priceMin: "পঁচিশ", priceMax: "পঁয়তাল্লিশ", days: "সময়", daysMin: "দশ", daysMax: "একুশ" } },
  words: [
    ["এক", 0.3], ["কথায়", 0.55], ["Javed", 1.05], ["IT", 1.42], ["Solution", 1.62], ["একটা", 2.3], ["restaurant-এর", 2.6], ["menu", 3.3], ["আর", 3.6],
    ["online", 3.8], ["order-সহ", 4.2], ["website", 4.7], ["বানায়", 5.2], ["পঁচিশ", 5.65], ["থেকে", 6.05], ["পঁয়তাল্লিশ", 6.35], ["হাজার", 6.95],
    ["টাকায়", 7.25], ["সময়", 7.85], ["লাগে", 8.25], ["দশ", 8.75], ["থেকে", 9.05], ["একুশ", 9.4], ["দিন", 9.9],
  ],
};

const mkAnswer = (s: typeof ANS_DENTAL): React.FC => () => {
  const t = useT();
  return <SceneAnswer t={t} dur={s.dur} cue={mkCue(s.words)} data={s.data} />;
};


// ---------- stat ----------
type StatSample = { dur: number; data: StatData; words: [string, number][] };
// VO: "নতুন website চালুর পর এই online shop-এ এখন প্রতি মাসে তিন হাজার দুইশোর বেশি order আসে, সবই website থেকে।"
const ST_ECOM: StatSample = {
  dur: 10,
  data: { industry: "ecommerce", value: 3200, suffix: "+", unit: "ORDERS", label: "ORDERS EVERY MONTH", sub: "ALL FROM THE WEBSITE", cues: { label: "online", value: "তিন", sub: "সবই" } },
  words: [["নতুন", 0.3], ["website", 0.6], ["চালুর", 1.1], ["পর", 1.4], ["এই", 1.65], ["online", 1.85], ["shop-এ", 2.25], ["এখন", 2.7], ["প্রতি", 3.0], ["মাসে", 3.3], ["তিন", 3.8], ["হাজার", 4.1], ["দুইশোর", 4.5], ["বেশি", 5.0], ["order", 5.3], ["আসে", 5.7], ["সবই", 6.5], ["website", 6.85], ["থেকে", 7.35]],
};
// VO: "ভর্তির form online হওয়ায় এবার পুরো ভর্তি শেষ হয়েছে মাত্র দশ দিনে — আগে লাগত পুরো এক মাস।"
const ST_SCHOOL: StatSample = {
  dur: 10,
  data: { industry: "school", value: 10, unit: "DAYS", label: "ADMISSION DONE IN", sub: "IT USED TO TAKE A MONTH", cues: { label: "ভর্তির", value: "দশ", sub: "আগে" } },
  words: [["ভর্তির", 0.3], ["form", 0.75], ["online", 1.05], ["হওয়ায়", 1.5], ["এবার", 2.0], ["পুরো", 2.3], ["ভর্তি", 2.6], ["শেষ", 3.0], ["হয়েছে", 3.3], ["মাত্র", 3.8], ["দশ", 4.2], ["দিনে", 4.5], ["আগে", 5.6], ["লাগত", 5.95], ["পুরো", 6.3], ["এক", 6.6], ["মাস", 6.85]],
};
// VO: "website-এ ছবি আর দাম দেওয়ার আগে মাসে site visit-এর enquiry আসত বারোটা, এখন আসে সাতচল্লিশটা।"
const ST_REAL: StatSample = {
  dur: 10,
  data: {
    industry: "realestate", value: 47, unit: "PER MONTH", label: "SITE-VISIT ENQUIRIES", sub: "BEFORE vs AFTER THE WEBSITE",
    compare: [{ label: "BEFORE", value: 12 }, { label: "AFTER", value: 47 }], cues: { label: "enquiry", value: "সাতচল্লিশটা", sub: "এখন", compare: ["বারোটা", "সাতচল্লিশটা"] },
  },
  words: [["website-এ", 0.3], ["ছবি", 0.9], ["আর", 1.15], ["দাম", 1.35], ["দেওয়ার", 1.65], ["আগে", 2.0], ["মাসে", 2.4], ["site", 2.75], ["visit-এর", 3.0], ["enquiry", 3.45], ["আসত", 3.95], ["বারোটা", 4.3], ["এখন", 5.2], ["আসে", 5.5], ["সাতচল্লিশটা", 5.8]],
};
// VO: "দোকান বন্ধ থাকলেও website-এ order নেওয়া চলে দিনে চব্বিশ ঘণ্টা — রাত দুটোতেও।"
const ST_REST: StatSample = {
  dur: 9,
  data: { industry: "restaurant", value: 24, unit: "HOURS", label: "ORDERS TAKEN ONLINE", sub: "EVEN AFTER CLOSING TIME", cues: { label: "order", value: "চব্বিশ", sub: "রাত" } },
  words: [["দোকান", 0.3], ["বন্ধ", 0.7], ["থাকলেও", 1.0], ["website-এ", 1.5], ["order", 2.1], ["নেওয়া", 2.45], ["চলে", 2.8], ["দিনে", 3.1], ["চব্বিশ", 3.45], ["ঘণ্টা", 3.95], ["রাত", 4.9], ["দুটোতেও", 5.2]],
};
const mkStat = (s: StatSample): React.FC => () => {
  const t = useT();
  return <SceneStat t={t} dur={s.dur} cue={mkCue(s.words)} data={s.data} />;
};
const statItem = (id: string, name: string, nameBn: string, s: StatSample, still: number, note: string): LibItem => ({
  id, name, nameBn, group: "scenes", kind: "scene", duration: s.dur, still, tags: ["stat"], note, Comp: mkStat(s),
});

export const ITEMS: LibItem[] = [
  {
    id: "scenes-answer-dental",
    name: "Answer scene — dental chamber",
    nameBn: "উত্তর scene — ডেন্টাল চেম্বার",
    group: "scenes",
    kind: "scene",
    duration: ANS_DENTAL.dur,
    still: 10.2,
    tags: ["answer"],
    note: "<SceneAnswer t dur cue data={{industry, priceMin, priceMax, daysMin, daysMax, cues}}/> — logo, MacBook site build, hanging price tag, flip calendar → LIVE",
    Comp: mkAnswer(ANS_DENTAL),
  },
  {
    id: "scenes-answer-restaurant",
    name: "Answer scene — restaurant",
    nameBn: "উত্তর scene — রেস্তোরাঁ",
    group: "scenes",
    kind: "scene",
    duration: ANS_RESTAURANT.dur,
    still: 11.0,
    tags: ["answer"],
    note: "same template, restaurant data (grey MacBook, cloche subject)",
    Comp: mkAnswer(ANS_RESTAURANT),
  },
  statItem("scenes-stat-ecommerce", "Stat scene — e-commerce (counter)", "স্ট্যাট scene — অনলাইন শপ (counter)", ST_ECOM, 7.5, "<SceneStat data={{industry, value, label, sub, unit, suffix, cues}}/> — visual auto: odometer + falling subject pile"),
  statItem("scenes-stat-school", "Stat scene — coaching (calendar)", "স্ট্যাট scene — কোচিং (calendar)", ST_SCHOOL, 7.5, "unit DAYS → flip calendar"),
  statItem("scenes-stat-realestate", "Stat scene — real estate (bars)", "স্ট্যাট scene — রিয়েল এস্টেট (bars)", ST_REAL, 7.8, "compare[] → before/after bars (dataviz BarChart)"),
  statItem("scenes-stat-restaurant", "Stat scene — restaurant (hourglass)", "স্ট্যাট scene — রেস্তোরাঁ (hourglass)", ST_REST, 7.0, "unit HOURS → hourglass flips + hour counter"),
];
