// scenes_g — faq + myth scene template showcase (প্রতিটা দুটো industry, নিজের লেখা ছোট বাংলা VO-র আনুমানিক শব্দ-সময়)
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { FPS } from "../../kit/time";
import { makeCue } from "./common";
import { SceneFaq, FaqData } from "./SceneFaq";
import { SceneMyth, MythData } from "./SceneMyth";

export { SceneFaq, SceneMyth };
export type { FaqData, MythData };
export type { Cue, Industry } from "./common";

const useT = () => useCurrentFrame() / FPS;

// ---------------- FAQ · dental ----------------
// "অনেকে জিজ্ঞেস করেন, treatment-এর দাম কি website-এ দেওয়া উচিত? উত্তর হলো হ্যাঁ, তবে একটা range দিন। Scaling, root canal,
//  braces — প্রতিটার আন্দাজ লিখুন, চূড়ান্ত দাম check-up-এর পর। এতে দাম জানতে আসা ফোন কমে, রোগী নিশ্চিন্তে আসেন।"
const FAQ_DENTAL_WORDS: [string, number][] = [
  ["অনেকে", 0.3], ["জিজ্ঞেস", 0.75], ["করেন", 1.2], ["treatment-এর", 1.6], ["দাম", 2.2], ["কি", 2.45], ["website-এ", 2.65], ["দেওয়া", 3.2],
  ["উচিত", 3.55], ["উত্তর", 4.1], ["হলো", 4.45], ["হ্যাঁ", 4.75], ["তবে", 5.1], ["একটা", 5.35], ["range", 5.65], ["দিন", 6.0],
  ["Scaling", 6.35], ["root", 6.8], ["canal", 7.05], ["braces", 7.4], ["প্রতিটার", 7.85], ["আন্দাজ", 8.25], ["লিখুন", 8.6],
  ["চূড়ান্ত", 8.95], ["দাম", 9.3], ["check-up-এর", 9.5], ["পর", 9.95], ["এতে", 10.2], ["দাম", 10.45], ["জানতে", 10.65],
  ["আসা", 10.95], ["ফোন", 11.15], ["কমে", 11.45], ["রোগী", 11.8], ["নিশ্চিন্তে", 12.1], ["আসেন", 12.6],
];
const FAQ_DENTAL: FaqData = {
  industry: "dental",
  brand: "Dr. Shirin Dental",
  question: "SHOULD OUR TREATMENT PRICES BE ON THE SITE?",
  answer: "YES — SHOW A PRICE RANGE",
  points: ["A RANGE, NOT ONE FIXED PRICE", "FINAL PRICE AFTER CHECK-UP", "FEWER PRICE-ONLY CALLS"],
  screen: {
    kicker: "Treatments",
    title: "Fees & Prices",
    rows: [
      { label: "Scaling", value: "৳1,500–3,000", sub: "30 মিনিট" },
      { label: "Root Canal", value: "৳6,000–9,000", sub: "২–৩ বার আসতে হয়" },
      { label: "Braces", value: "৳40,000–80,000", sub: "১২–১৮ মাস" },
    ],
    focus: 1,
    note: "* চূড়ান্ত দাম check-up-এর পর",
  },
  cues: { question: "জিজ্ঞেস", answer: "হ্যাঁ", screen: "তবে", points: ["range", "check-up", "ফোন"], done: "রোগী" },
};

// ---------------- FAQ · e-commerce ----------------
// "Customer প্রায়ই জানতে চান, Dhaka-র বাইরে delivery হয় কি? হ্যাঁ, সারা দেশে। Website-এ charge আর সময় আগেই লিখে দিন —
//  Dhaka-য় এক দিন, বাইরে তিন দিন। আর cash on delivery থাকলে order বাড়ে, customer খুশি।"
const FAQ_ECOM_WORDS: [string, number][] = [
  ["Customer", 0.3], ["প্রায়ই", 0.8], ["জানতে", 1.2], ["চান", 1.55], ["Dhaka-র", 1.9], ["বাইরে", 2.3], ["delivery", 2.7], ["হয়", 3.2],
  ["কি", 3.45], ["হ্যাঁ", 4.0], ["সারা", 4.4], ["দেশে", 4.75], ["Website-এ", 5.3], ["charge", 5.85], ["আর", 6.2], ["সময়", 6.4],
  ["আগেই", 6.8], ["লিখে", 7.15], ["দিন", 7.45], ["Dhaka-য়", 7.9], ["এক", 8.35], ["দিন", 8.55], ["বাইরে", 8.85], ["তিন", 9.2],
  ["দিন", 9.45], ["আর", 9.8], ["cash", 10.05], ["on", 10.35], ["delivery", 10.5], ["থাকলে", 10.95], ["order", 11.3], ["বাড়ে", 11.6],
  ["customer", 11.95], ["খুশি", 12.35],
];
const FAQ_ECOM: FaqData = {
  industry: "ecommerce",
  brand: "Trendy Wear BD",
  question: "DO YOU DELIVER OUTSIDE DHAKA?",
  answer: "YES — ALL 64 DISTRICTS",
  points: ["CHARGE SHOWN UPFRONT", "1–3 DAY DELIVERY", "CASH ON DELIVERY"],
  screen: {
    kicker: "Delivery",
    title: "Shipping & Payment",
    rows: [
      { label: "Inside Dhaka", value: "৳60", sub: "1 দিনে হাতে" },
      { label: "Outside Dhaka", value: "৳120", sub: "2–3 দিনে, সব জেলায়" },
      { label: "Cash on Delivery", value: "Yes", sub: "হাতে পেয়ে টাকা দিন" },
    ],
    focus: 1,
    note: "64 জেলায় home delivery",
  },
  cues: { question: "জানতে", answer: "হ্যাঁ", screen: "Website", points: ["charge", "তিন", "cash"], done: "বাড়ে" },
};

// ---------------- MYTH · restaurant ----------------
// "অনেকে ভাবেন, Facebook page থাকলেই website লাগে না। কথাটা ঠিক নয়। Google-এ খুঁজলে website-ওয়ালা restaurant আগে আসে,
//  menu দেখে সরাসরি order দেয়। এক মাসেই online order দ্বিগুণ।"
const MYTH_REST_WORDS: [string, number][] = [
  ["অনেকে", 0.3], ["ভাবেন", 0.75], ["Facebook", 1.15], ["page", 1.65], ["থাকলেই", 1.95], ["website", 2.4], ["লাগে", 2.9], ["না", 3.2],
  ["কথাটা", 3.7], ["ঠিক", 4.1], ["নয়", 4.4], ["Google-এ", 4.9], ["খুঁজলে", 5.4], ["website-ওয়ালা", 5.8], ["restaurant", 6.5],
  ["আগে", 7.0], ["আসে", 7.3], ["menu", 7.7], ["দেখে", 8.05], ["সরাসরি", 8.35], ["order", 8.8], ["দেয়", 9.15], ["এক", 9.6],
  ["মাসেই", 9.85], ["online", 10.25], ["order", 10.7], ["দ্বিগুণ", 11.05],
];
const MYTH_REST: MythData = {
  industry: "restaurant",
  brand: "Surma Kitchen",
  myth: "A FACEBOOK PAGE IS ENOUGH",
  fact: "YOUR OWN SITE BRINGS DIRECT ORDERS",
  proof: {
    stat: "2x",
    label: "ONLINE ORDERS IN ONE MONTH",
    screen: {
      kicker: "Online orders",
      title: "Today",
      big: { value: "48", label: "আজকের order — website থেকে" },
      rows: [
        { label: "Kacchi Biryani × 2", value: "৳640", sub: "Zindabazar" },
        { label: "Beef Tehari × 3", value: "৳690", sub: "Amberkhana" },
        { label: "Chicken Roast × 1", value: "৳260", sub: "Shahi Eidgah" },
      ],
      focus: 0,
      note: "সরাসরি order — কোনো commission নেই",
    },
  },
  cues: { myth: "ভাবেন", crack: "নয়", fact: "Google", proof: "menu", stat: "দ্বিগুণ" },
};

// ---------------- MYTH · school ----------------
// "অনেকে মনে করেন, ছোট coaching center-এর website দরকার নেই। আসলে উল্টো। অভিভাবক ভর্তির আগে online-এ খোঁজেন — course, fee,
//  result দেখে তবেই আসেন। এ বছর website থেকেই একশো বিশটা admission form।"
const MYTH_SCHOOL_WORDS: [string, number][] = [
  ["অনেকে", 0.3], ["মনে", 0.7], ["করেন", 0.95], ["ছোট", 1.35], ["coaching", 1.7], ["center-এর", 2.15], ["website", 2.7], ["দরকার", 3.2],
  ["নেই", 3.55], ["আসলে", 4.1], ["উল্টো", 4.5], ["অভিভাবক", 5.0], ["ভর্তির", 5.6], ["আগে", 6.0], ["online-এ", 6.3], ["খোঁজেন", 6.85],
  ["course", 7.3], ["fee", 7.75], ["result", 8.1], ["দেখে", 8.5], ["তবেই", 8.8], ["আসেন", 9.1], ["এ", 9.5], ["বছর", 9.65],
  ["website", 9.95], ["থেকেই", 10.4], ["একশো", 10.75], ["বিশটা", 11.1], ["admission", 11.5], ["form", 12.0],
];
const MYTH_SCHOOL: MythData = {
  industry: "school",
  brand: "Udayan Coaching",
  myth: "SMALL COACHING CENTRES DON'T NEED A WEBSITE",
  fact: "PARENTS CHECK ONLINE BEFORE ADMISSION",
  proof: {
    stat: "120",
    label: "ADMISSION FORMS THIS YEAR",
    screen: {
      kicker: "Admission 2027",
      title: "Online forms",
      big: { value: "120", label: "এ বছর website থেকে form" },
      rows: [
        { label: "Class 9 Science", value: "38", sub: "batch শুরু 1 জানুয়ারি" },
        { label: "SSC Batch", value: "52", sub: "সকাল ও বিকেল" },
        { label: "HSC Batch", value: "30", sub: "নতুন seat 20টা" },
      ],
      focus: 1,
      note: "Fee, result, routine — সব website-এ",
    },
  },
  cues: { myth: "মনে", crack: "উল্টো", fact: "অভিভাবক", proof: "course", stat: "একশো" },
};

const mk = (Scene: "faq" | "myth", data: any, words: [string, number][], dur: number): React.FC => {
  const cue = makeCue(words);
  const Comp: React.FC = () => {
    const t = useT();
    return Scene === "faq" ? <SceneFaq t={t} dur={dur} cue={cue} data={data} /> : <SceneMyth t={t} dur={dur} cue={cue} data={data} />;
  };
  return Comp;
};

export const ITEMS: LibItem[] = [
  {
    id: "scenes-faq-dental",
    name: "FAQ scene — dental (prices on site?)",
    nameBn: "FAQ scene — dental: দাম কি site-এ দেব?",
    group: "scenes",
    kind: "scene",
    duration: 13,
    still: 10.8,
    tags: ["faq"],
    note: "<SceneFaq t dur cue data={FaqData}/> — question bubble from customer → phone app answer + reply bubble + tick chips → ? flips to tick",
    Comp: mk("faq", FAQ_DENTAL, FAQ_DENTAL_WORDS, 13),
  },
  {
    id: "scenes-faq-ecommerce",
    name: "FAQ scene — e-commerce (delivery outside Dhaka?)",
    nameBn: "FAQ scene — e-commerce: Dhaka-র বাইরে delivery?",
    group: "scenes",
    kind: "scene",
    duration: 13.5,
    still: 11.2,
    tags: ["faq"],
    note: "industry: dental | restaurant | ecommerce | school — object, app colours and icon change with data.industry",
    Comp: mk("faq", FAQ_ECOM, FAQ_ECOM_WORDS, 13.5),
  },
  {
    id: "scenes-myth-restaurant",
    name: "Myth scene — restaurant (a Facebook page is enough)",
    nameBn: "Myth scene — restaurant: Facebook page-ই যথেষ্ট?",
    group: "scenes",
    kind: "scene",
    duration: 13.5,
    still: 12.0,
    tags: ["myth"],
    note: "<SceneMyth t dur cue data={MythData}/> — MYTH card stamped → cracks and breaks on cue → FACT card rises, phone proof + count-up stat card",
    Comp: mk("myth", MYTH_REST, MYTH_REST_WORDS, 13.5),
  },
  {
    id: "scenes-myth-school",
    name: "Myth scene — school (small centres don't need a site)",
    nameBn: "Myth scene — school: ছোট coaching-এর website লাগে না?",
    group: "scenes",
    kind: "scene",
    duration: 13.5,
    still: 12.2,
    tags: ["myth"],
    note: "stat string count-up: '2x', '+45%', '120', '৳ 3,000' — number part animates",
    Comp: mk("myth", MYTH_SCHOOL, MYTH_SCHOOL_WORDS, 13.5),
  },
];
