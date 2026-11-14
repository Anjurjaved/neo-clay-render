// scenes_h — scene templates: before_after + cta (data-driven, any industry). Showcase = sample Bangla VO word times.
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { FPS } from "../../kit/time";
import { mkCue } from "./common";
import { SceneBeforeAfter, BeforeAfterData } from "./BeforeAfter";
import { SceneCta, CtaData } from "./Cta";

export { SceneBeforeAfter, SceneCta };
export type { BeforeAfterData, CtaData };
export type { Cue, Industry } from "./common";

const useT = () => useCurrentFrame() / FPS;

// ---------- before_after samples ----------
// "আগে রাতে দোকান ফাঁকা, ফোন বাজে কিন্তু কেউ ধরে না — বারোটা missed call। website চালু হওয়ার পর আলো জ্বলে, customer আসে, আর সপ্তাহে আটত্রিশটা order।"
const BA_REST_VO = mkCue([
  ["আগে", 0.3], ["রাতে", 0.6], ["দোকান", 0.95], ["ফাঁকা", 1.35], ["ফোন", 2.0], ["বাজে", 2.35], ["কিন্তু", 2.7], ["কেউ", 3.0], ["ধরে", 3.25], ["না", 3.5],
  ["বারোটা", 3.9], ["missed", 4.4], ["call", 4.8], ["website", 5.6], ["চালু", 6.1], ["হওয়ার", 6.4], ["পর", 6.7], ["আলো", 7.1], ["জ্বলে", 7.45],
  ["customer", 8.0], ["আসে", 8.5], ["আর", 9.0], ["সপ্তাহে", 9.3], ["আটত্রিশটা", 9.8], ["order", 10.5],
]);
const BA_REST: BeforeAfterData = { industry: "restaurant", missed: 12, missedKind: "call", gained: 38, cues: { before: "আগে", missed: "ফোন", after: "website", customers: "customer", orders: "সপ্তাহে" } };

// "Facebook page-এ শুধু inbox, রাতে কেউ উত্তর দেয় না — বিশটা message miss। নিজের website হওয়ার পর রাত দুইটাতেও customer order দেয়, মাসে একশো কুড়িটা।"
const BA_SHOP_VO = mkCue([
  ["Facebook", 0.3], ["page-এ", 0.85], ["শুধু", 1.2], ["inbox", 1.55], ["রাতে", 2.1], ["কেউ", 2.4], ["উত্তর", 2.65], ["দেয়", 3.0], ["না", 3.25],
  ["বিশটা", 3.6], ["message", 4.0], ["miss", 4.5], ["নিজের", 5.1], ["website", 5.5], ["হওয়ার", 6.05], ["পর", 6.35], ["রাত", 6.7], ["দুইটাতেও", 7.0],
  ["customer", 7.6], ["order", 8.1], ["দেয়", 8.5], ["মাসে", 8.95], ["একশো", 9.3], ["কুড়িটা", 9.7],
]);
const BA_SHOP: BeforeAfterData = { industry: "ecommerce", missed: 20, missedKind: "message", gained: 120, cues: { before: "Facebook", missed: "inbox", after: "website", customers: "customer", orders: "মাসে" } };

// "আগে চেম্বারে সন্ধ্যায় ফোনের পর ফোন, ধরার কেউ নেই। online serial চালু হওয়ার পর রোগী নিজেই আসেন, মাসে নব্বইটা booking।"
const BA_DENT_VO = mkCue([
  ["আগে", 0.3], ["চেম্বারে", 0.65], ["সন্ধ্যায়", 1.2], ["ফোনের", 1.8], ["পর", 2.2], ["ফোন", 2.45], ["ধরার", 2.9], ["কেউ", 3.25], ["নেই", 3.5],
  ["online", 4.3], ["serial", 4.75], ["চালু", 5.2], ["হওয়ার", 5.5], ["পর", 5.8], ["রোগী", 6.3], ["নিজেই", 6.7], ["আসেন", 7.1], ["মাসে", 7.8], ["নব্বইটা", 8.15], ["booking", 8.7],
]);
const BA_DENT: BeforeAfterData = { industry: "dental", missed: 9, gained: 90, gainedUnit: "BOOKINGS / MONTH", cues: { before: "আগে", missed: "ফোনের", after: "online", customers: "রোগী", orders: "মাসে" } };

// ---------- cta samples ----------
const digitsBn = (start: number, gap = 0.31): [string, number][] =>
  ["শূন্য", "এক", "ছয়", "এক", "ছয়", "নয়", "শূন্য", "এক", "তিন", "নয়", "ছয়"].map((w, i) => [w, +(start + i * gap + (i >= 5 ? 0.12 : 0)).toFixed(2)] as [string, number]);
// "আপনার chamber-এর জন্য কয়টা page লাগবে, জানিয়ে ফ্রি quote নিন। ফোন বা WhatsApp করুন, শূন্য এক ছয় এক ছয় নয় শূন্য এক তিন নয় ছয়। অথবা javeditsolution dot com। Javed IT Solution, মিরপুর এক, ঢাকা।"
const CTA_DENT_VO = mkCue([
  ["আপনার", 0.3], ["chamber-এর", 0.7], ["জন্য", 1.2], ["কয়টা", 1.5], ["page", 1.9], ["লাগবে", 2.2], ["জানিয়ে", 2.6], ["ফ্রি", 3.0], ["quote", 3.35], ["নিন", 3.75],
  ["ফোন", 4.3], ["বা", 4.6], ["WhatsApp", 4.8], ["করুন", 5.35], ...digitsBn(5.8),
  ["অথবা", 9.5], ["javeditsolution", 9.85], ["dot", 10.6], ["com", 10.8], ["Javed", 11.35], ["IT", 11.7], ["Solution", 11.9], ["মিরপুর", 12.35], ["এক", 12.7], ["ঢাকা", 12.95],
]);
const CTA_DENT: CtaData = { industry: "dental", cues: { quote: "chamber", free: "ফ্রি", call: "ফোন", whatsapp: "WhatsApp", number: "শূন্য", url: "javeditsolution", dot: "dot", brand: "Javed", address: "মিরপুর" } };

// "coaching-এর admission website-এর ফ্রি quote চাইলে ফোন বা WhatsApp করুন, শূন্য এক ছয় এক ছয় নয় শূন্য এক তিন নয় ছয়। বিস্তারিত javeditsolution dot com-এ। Javed IT Solution, মিরপুর এক, ঢাকা।"
const CTA_SCHOOL_VO = mkCue([
  ["coaching-এর", 0.3], ["admission", 0.9], ["website-এর", 1.5], ["ফ্রি", 2.1], ["quote", 2.45], ["চাইলে", 2.85],
  ["ফোন", 3.4], ["বা", 3.7], ["WhatsApp", 3.9], ["করুন", 4.45], ...digitsBn(4.9, 0.3),
  ["বিস্তারিত", 8.55], ["javeditsolution", 9.1], ["dot", 9.85], ["com-এ", 10.05], ["Javed", 10.65], ["IT", 11.0], ["Solution", 11.2], ["মিরপুর", 11.7], ["এক", 12.05], ["ঢাকা", 12.3],
]);
const CTA_SCHOOL: CtaData = { industry: "school", cues: { quote: "coaching", free: "ফ্রি", call: "ফোন", whatsapp: "WhatsApp", number: "শূন্য", url: "javeditsolution", dot: "dot", brand: "Javed", address: "মিরপুর" } };

const mkBA = (data: BeforeAfterData, cue: ReturnType<typeof mkCue>, dur: number): React.FC => () => <SceneBeforeAfter t={useT()} dur={dur} cue={cue} data={data} />;
const mkCTA = (data: CtaData, cue: ReturnType<typeof mkCue>, dur: number): React.FC => () => <SceneCta t={useT()} dur={dur} cue={cue} data={data} />;

const note = {
  ba: "<SceneBeforeAfter t dur cue data={{industry, name?, missed, missedKind?, gained, gainedUnit?, cues:{before,missed,after,customers,orders}}}/>",
  cta: "<SceneCta t dur cue data={{industry, noun?, phone?, url?, path?, address?, digitWords?, bnWeb?, cues:{quote,free,call,whatsapp,number,url,dot,brand,address}}}/>",
};

export const ITEMS: LibItem[] = [
  { id: "scenes-before_after-restaurant", name: "Before/After — restaurant", nameBn: "আগে/পরে — রেস্তোরাঁ", group: "scenes", kind: "scene", duration: 12, still: 10.8, tags: ["before_after"], note: note.ba, Comp: mkBA(BA_REST, BA_REST_VO, 12) },
  { id: "scenes-before_after-ecommerce", name: "Before/After — online shop", nameBn: "আগে/পরে — online shop", group: "scenes", kind: "scene", duration: 11.5, still: 10.2, tags: ["before_after"], note: note.ba, Comp: mkBA(BA_SHOP, BA_SHOP_VO, 11.5) },
  { id: "scenes-before_after-dental", name: "Before/After — dental chamber", nameBn: "আগে/পরে — dental chamber", group: "scenes", kind: "scene", duration: 10.5, still: 9.4, tags: ["before_after"], note: note.ba, Comp: mkBA(BA_DENT, BA_DENT_VO, 10.5) },
  { id: "scenes-cta-dental", name: "CTA — dental chamber", nameBn: "CTA — dental chamber", group: "scenes", kind: "scene", duration: 14, still: 13.8, tags: ["cta"], note: note.cta, Comp: mkCTA(CTA_DENT, CTA_DENT_VO, 14) },
  { id: "scenes-cta-school", name: "CTA — coaching centre", nameBn: "CTA — coaching centre", group: "scenes", kind: "scene", duration: 13.5, still: 13.3, tags: ["cta"], note: note.cta, Comp: mkCTA(CTA_SCHOOL, CTA_SCHOOL_VO, 13.5) },
];
