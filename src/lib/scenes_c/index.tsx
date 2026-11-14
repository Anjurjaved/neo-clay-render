// scenes_c — persona + chat scene templates (data-driven, যেকোনো industry) — showcase ITEMS
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { FPS } from "../../kit/time";
import { mkCue, Cue } from "./common";
import { ScenePersona, PersonaData } from "./Persona";
import { SceneChat, ChatData } from "./Chat";

export { ScenePersona, SceneChat };
export type { PersonaData, ChatData };
export type { Cue };

// ---------------- sample data + আনুমানিক বাংলা VO শব্দ-সময় ----------------
const P_DENTAL: [PersonaData, [string, number][]] = [
  {
    industry: "dental",
    name: "DR. SHIRIN",
    role: "DENTIST · SYLHET",
    business: "SHIRIN DENTAL",
    problem: { kind: "missed-calls", label: "12 MISSED CALLS A DAY", count: 12, clock: "11:40", day: "Saturday" },
    cues: { place: "সিলেটের", name: "শিরিনের", problem: "ফোন", peak: "বারোটা" },
  },
  // "সিলেটের জিন্দাবাজারে ডা. শিরিনের dental chamber। রোগী দেখার সময় ফোন ধরতে পারেন না — দিনে বারোটা missed call।"
  [["সিলেটের", 0.4], ["জিন্দাবাজারে", 1.0], ["ডা", 1.9], ["শিরিনের", 2.3], ["dental", 2.9], ["chamber", 3.4], ["রোগী", 4.3], ["দেখার", 4.8], ["সময়", 5.2], ["ফোন", 5.7], ["ধরতে", 6.1], ["পারেন", 6.5], ["না", 6.9], ["দিনে", 7.4], ["বারোটা", 7.8], ["missed", 8.3], ["call", 8.7]],
];
const P_RESTAURANT: [PersonaData, [string, number][]] = [
  {
    industry: "restaurant",
    name: "RAFIQ",
    role: "OWNER · DHANMONDI",
    business: "SPICE GARDEN",
    problem: { kind: "queue", label: "45 MIN WAIT AT LUNCH", count: 4, clock: "1:15" },
    cues: { place: "ধানমন্ডির", name: "রফিক", problem: "ভিড়", peak: "অনেকে" },
  },
  // "ধানমন্ডির Spice Garden-এর মালিক রফিক সাহেব। দুপুরে এত ভিড় যে মানুষ বাইরে লাইনে দাঁড়িয়ে থাকে — অনেকে ফিরে যান।"
  [["ধানমন্ডির", 0.4], ["Spice", 1.1], ["Garden-এর", 1.5], ["মালিক", 2.1], ["রফিক", 2.6], ["সাহেব", 3.0], ["দুপুরে", 4.0], ["এত", 4.5], ["ভিড়", 4.8], ["যে", 5.2], ["মানুষ", 5.5], ["বাইরে", 5.9], ["লাইনে", 6.3], ["দাঁড়িয়ে", 6.8], ["থাকে", 7.3], ["অনেকে", 7.9], ["ফিরে", 8.4], ["যান", 8.8]],
];
const P_ECOM: [PersonaData, [string, number][]] = [
  {
    industry: "ecommerce",
    name: "NUSRAT",
    role: "FASHION SELLER · MIRPUR",
    business: "NUSRAT FASHION",
    problem: { kind: "unread", label: "80 UNREAD MESSAGES", count: 80, items: ["Price?", "Size M?", "Delivery?", "In stock?"] },
    cues: { place: "মিরপুরের", name: "নুসরাত", problem: "inbox", peak: "আশিটা" },
  },
  // "মিরপুরের নুসরাত Facebook page-এ কুর্তি বিক্রি করেন। রাতে inbox ভরে যায় — দাম কত, size আছে? সকালে দেখেন আশিটা unread message।"
  [["মিরপুরের", 0.4], ["নুসরাত", 1.0], ["Facebook", 1.6], ["page-এ", 2.1], ["কুর্তি", 2.6], ["বিক্রি", 3.0], ["করেন", 3.4], ["রাতে", 4.2], ["inbox", 4.6], ["ভরে", 5.1], ["যায়", 5.4], ["দাম", 5.9], ["কত", 6.2], ["size", 6.6], ["আছে", 7.0], ["সকালে", 7.6], ["দেখেন", 8.0], ["আশিটা", 8.4], ["unread", 8.9], ["message", 9.3]],
];
const P_REALESTATE: [PersonaData, [string, number][]] = [
  {
    industry: "realestate",
    name: "ARIF",
    role: "PROPERTY AGENT · BASHUNDHARA",
    business: "GREEN NEST",
    problem: { kind: "after-hours", label: "CLOSED AFTER 8 PM", clock: "8:30" },
    cues: { place: "বসুন্ধরার", name: "আরিফ", problem: "অফিস", peak: "দরজা" },
  },
  // "বসুন্ধরার Green Nest-এর আরিফ সাহেব। অফিস বন্ধ হয় রাত আটটায়, কিন্তু flat-এর খোঁজে মানুষ আসেন তার পরেও — দরজা বন্ধ দেখে ফিরে যান।"
  [["বসুন্ধরার", 0.4], ["Green", 1.0], ["Nest-এর", 1.4], ["আরিফ", 2.2], ["সাহেব", 2.6], ["অফিস", 3.5], ["বন্ধ", 3.9], ["হয়", 4.2], ["রাত", 4.5], ["আটটায়", 4.9], ["কিন্তু", 5.5], ["flat-এর", 5.9], ["খোঁজে", 6.3], ["মানুষ", 6.7], ["আসেন", 7.1], ["তার", 7.4], ["পরেও", 7.7], ["দরজা", 8.3], ["বন্ধ", 8.7], ["দেখে", 9.0], ["ফিরে", 9.4], ["যান", 9.8]],
];

const C_ECOM: [ChatData, [string, number][]] = [
  {
    industry: "ecommerce",
    business: "Nusrat Fashion",
    sign: "NUSRAT FASHION",
    initials: "NF",
    clock: "2:07",
    night: true,
    replyTag: "AUTO-REPLY",
    messages: [
      { from: "customer", text: "আপু, এই কুর্তিটা কি M size-এ আছে?", time: "2:07 AM", cue: "জিজ্ঞেস" },
      { from: "business", text: "জি আছে! দাম ৳১,৪৫০, ঢাকার ভেতরে delivery ৳৬০।", time: "2:07 AM", cue: "উত্তর" },
      { from: "customer", text: "অর্ডার করতে চাই, cash on delivery।", time: "2:08 AM", cue: "অর্ডার" },
    ],
    outcome: { label: "ORDER CONFIRMED", cue: "দিলেন" },
  },
  // "রাত দুইটা সাত। নুসরাতের page-এ একজন জিজ্ঞেস করলেন, M size আছে? সাথে সাথে উত্তর — আছে, দাম চোদ্দশো পঞ্চাশ। তিনি অর্ডার দিলেন, নুসরাত তখন ঘুমিয়ে।"
  [["রাত", 0.4], ["দুইটা", 0.8], ["সাত", 1.2], ["নুসরাতের", 1.9], ["page-এ", 2.5], ["একজন", 2.9], ["জিজ্ঞেস", 3.4], ["করলেন", 3.9], ["M", 4.3], ["size", 4.6], ["আছে", 5.0], ["সাথে", 5.7], ["সাথে", 6.0], ["উত্তর", 6.4], ["আছে", 7.0], ["দাম", 7.4], ["চোদ্দশো", 7.8], ["পঞ্চাশ", 8.3], ["তিনি", 9.0], ["অর্ডার", 9.4], ["দিলেন", 9.8], ["নুসরাত", 10.3], ["তখন", 10.7], ["ঘুমিয়ে", 11.0]],
];
const C_DENTAL: [ChatData, [string, number][]] = [
  {
    industry: "dental",
    business: "Shirin Dental",
    sign: "SHIRIN DENTAL",
    initials: "SD",
    clock: "11:02",
    night: true,
    replyTag: "REPLIED IN 1 MIN",
    messages: [
      { from: "customer", text: "কাল সকালে serial পাওয়া যাবে?", time: "11:02 PM", cue: "যাবে" },
      { from: "business", text: "জি, কাল সকাল ১০:৩০-এ খালি আছে। নাম আর ফোন নম্বর দিন।", time: "11:03 PM", cue: "উত্তর" },
      { from: "customer", text: "রুমানা, ০১৭১২-৩৪৫৬৭৮", time: "11:03 PM", cue: "খালি" },
    ],
    outcome: { label: "SERIAL BOOKED", cue: "book" },
  },
  // "রাত এগারোটায় একজন রোগী লিখলেন — কাল সকালে serial পাওয়া যাবে? এক মিনিটে উত্তর এল, সাড়ে দশটায় খালি আছে। serial book হয়ে গেল।"
  [["রাত", 0.4], ["এগারোটায়", 0.8], ["একজন", 1.5], ["রোগী", 1.9], ["লিখলেন", 2.4], ["কাল", 3.0], ["সকালে", 3.4], ["serial", 3.9], ["পাওয়া", 4.3], ["যাবে", 4.7], ["এক", 5.4], ["মিনিটে", 5.7], ["উত্তর", 6.1], ["এল", 6.5], ["সাড়ে", 7.0], ["দশটায়", 7.4], ["খালি", 7.8], ["আছে", 8.1], ["serial", 8.7], ["book", 9.1], ["হয়ে", 9.4], ["গেল", 9.7]],
];

const personaShow = (d: [PersonaData, [string, number][]], dur: number): React.FC => {
  const cue: Cue = mkCue(d[1]);
  return () => <ScenePersona t={useCurrentFrame() / FPS} dur={dur} cue={cue} data={d[0]} />;
};
const chatShow = (d: [ChatData, [string, number][]], dur: number): React.FC => {
  const cue: Cue = mkCue(d[1]);
  return () => <SceneChat t={useCurrentFrame() / FPS} dur={dur} cue={cue} data={d[0]} />;
};

const PNOTE = "<ScenePersona t dur cue data={{industry, name, role, business, problem:{kind:'missed-calls'|'queue'|'after-hours'|'unread', label, count, clock, items}, cues:{place,name,problem,peak}}}/>";
const CNOTE = "<SceneChat t dur cue data={{industry, business, sign, clock, night, messages:[{from,text,time,cue}], replyTag, outcome:{label,cue}}}/>";

export const ITEMS: LibItem[] = [
  { id: "scenes-persona-dental", name: "Persona — dentist, missed calls", nameBn: "পরিচয় — ডেন্টিস্ট, missed call", group: "scenes", kind: "scene", duration: 10, still: 8.9, tags: ["persona"], note: PNOTE, Comp: personaShow(P_DENTAL, 10) },
  { id: "scenes-persona-restaurant", name: "Persona — restaurant, lunch queue", nameBn: "পরিচয় — রেস্তোরাঁ, দুপুরের লাইন", group: "scenes", kind: "scene", duration: 10, still: 8.6, tags: ["persona"], note: PNOTE, Comp: personaShow(P_RESTAURANT, 10) },
  { id: "scenes-persona-ecommerce", name: "Persona — online seller, unread inbox", nameBn: "পরিচয় — online seller, unread inbox", group: "scenes", kind: "scene", duration: 11, still: 9.6, tags: ["persona"], note: PNOTE, Comp: personaShow(P_ECOM, 11) },
  { id: "scenes-persona-realestate", name: "Persona — property agent, closed after hours", nameBn: "পরিচয় — property agent, বন্ধের পরে", group: "scenes", kind: "scene", duration: 11.5, still: 9.4, tags: ["persona"], note: PNOTE, Comp: personaShow(P_REALESTATE, 11.5) },
  { id: "scenes-chat-ecommerce", name: "Chat — 2 AM order, auto-reply", nameBn: "চ্যাট — রাত ২টার অর্ডার, auto-reply", group: "scenes", kind: "scene", duration: 12.5, still: 10.6, tags: ["chat"], note: CNOTE, Comp: chatShow(C_ECOM, 12.5) },
  { id: "scenes-chat-dental", name: "Chat — 11 PM serial booking", nameBn: "চ্যাট — রাত ১১টার serial booking", group: "scenes", kind: "scene", duration: 11, still: 9.8, tags: ["chat"], note: CNOTE, Comp: chatShow(C_DENTAL, 11) },
];
