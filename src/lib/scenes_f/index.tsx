// scenes_f — price ও compare scene template-এর showcase (sample বাংলা VO-র আনুমানিক শব্দ-সময় দিয়ে)
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { FPS } from "../../kit/time";
import { mkCue } from "./common";
import { ScenePrice, PriceData } from "./ScenePrice";
import { SceneCompare, CompareData } from "./SceneCompare";

export { ScenePrice } from "./ScenePrice";
export type { PriceData } from "./ScenePrice";
export { SceneCompare } from "./SceneCompare";
export type { CompareData } from "./SceneCompare";

const useT = () => useCurrentFrame() / FPS;

// ---------- price · dental ----------
// VO: "ডেন্টাল চেম্বারের মূল package খুললেই contact form, basic SEO আর mobile design। দাম পনেরো থেকে পঁচিশ হাজার, আপনার জন্য বিশ হাজার।
//      add-on: SMS তিন হাজার, payment দুই হাজার। মোট পঁচিশ হাজার — একবারই দেবেন। শুধু domain-hosting প্রতি বছর চার হাজার।"
const cueDental = mkCue([
  ["ডেন্টাল", 0.2], ["চেম্বারের", 0.55], ["মূল", 0.95], ["package", 1.2], ["খুললেই", 1.6], ["contact", 2.0], ["form", 2.3], ["basic", 2.5], ["SEO", 2.8],
  ["mobile", 3.1], ["design", 3.4], ["দাম", 3.9], ["পনেরো", 4.2], ["পঁচিশ", 4.7], ["আপনার", 5.2], ["বিশ", 5.6], ["add-on", 6.3], ["SMS", 6.8], ["তিন", 7.1],
  ["payment", 7.5], ["দুই", 7.9], ["মোট", 8.5], ["পঁচিশ", 8.8], ["একবারই", 9.4], ["দেবেন", 9.9], ["শুধু", 10.4], ["domain", 10.7], ["প্রতি", 11.2], ["বছর", 11.5], ["চার", 11.8],
]);
const priceDental: PriceData = {
  industry: "dental",
  title: "DENTAL WEBSITE",
  shop: "Dr. Shirin Dental · Sylhet",
  features: [
    { label: "CONTACT FORM", icon: "mail", cue: "contact" },
    { label: "BASIC SEO", icon: "seo", cue: "SEO" },
    { label: "MOBILE READY", icon: "phone", cue: "mobile" },
  ],
  range: { lo: 15000, hi: 25000, pick: 20000, cue: "পনেরো", pickCue: "বিশ" },
  addons: [
    { label: "SMS alerts", amount: 3000, cue: "তিন" },
    { label: "Online payment", amount: 2000, cue: "দুই" },
  ],
  split: { yearlyLabel: "DOMAIN + HOSTING", yearly: 4000, cue: "একবারই", onceCue: "দেবেন", yearlyCue: "প্রতি" },
  cues: { open: "খুললেই", receipt: "add-on", total: "মোট" },
};

// ---------- price · restaurant ----------
// VO: "রেস্তোরাঁর website package-এ থাকছে call button, basic SEO আর secure site। দাম কুড়ি থেকে চল্লিশ হাজার, আপনার জন্য তিরিশ।
//      এর সাথে food order আট হাজার, SMS তিন হাজার আর ইংরেজি-বাংলা দুই হাজার। মোট তেতাল্লিশ হাজার একবারই। প্রতি বছর শুধু পাঁচ হাজার।"
const cueRest = mkCue([
  ["রেস্তোরাঁর", 0.2], ["website", 0.7], ["package-এ", 1.1], ["থাকছে", 1.5], ["call", 1.9], ["button", 2.1], ["basic", 2.4], ["SEO", 2.7], ["secure", 3.0], ["site", 3.3],
  ["দাম", 3.8], ["কুড়ি", 4.1], ["চল্লিশ", 4.6], ["আপনার", 5.0], ["তিরিশ", 5.4], ["সাথে", 6.1], ["food", 6.5], ["আট", 6.9], ["SMS", 7.3], ["তিন", 7.6],
  ["ইংরেজি-বাংলা", 8.0], ["দুই", 8.4], ["মোট", 8.9], ["তেতাল্লিশ", 9.2], ["একবারই", 9.8], ["প্রতি", 10.5], ["বছর", 10.8], ["শুধু", 11.1], ["পাঁচ", 11.4],
]);
const priceRestaurant: PriceData = {
  industry: "restaurant",
  title: "RESTAURANT WEBSITE",
  shop: "Panshi Restaurant · Sylhet",
  features: [
    { label: "CALL BUTTON", icon: "phone", cue: "call" },
    { label: "BASIC SEO", icon: "seo", cue: "SEO" },
    { label: "SECURE SITE", icon: "shield", cue: "secure" },
  ],
  range: { lo: 20000, hi: 40000, pick: 30000, cue: "কুড়ি", pickCue: "তিরিশ" },
  addons: [
    { label: "Food order", amount: 8000, cue: "আট" },
    { label: "SMS alerts", amount: 3000, cue: "তিন" },
    { label: "English + Bangla", amount: 2000, cue: "দুই" },
  ],
  split: { yearlyLabel: "DOMAIN + HOSTING", yearly: 5000, cue: "একবারই", onceCue: "একবারই", yearlyCue: "প্রতি" },
  cues: { open: "package", receipt: "সাথে", total: "মোট" },
};

const PriceDentalShow: React.FC = () => <ScenePrice t={useT()} dur={14} cue={cueDental} data={priceDental} />;
const PriceRestShow: React.FC = () => <ScenePrice t={useT()} dur={14} cue={cueRest} data={priceRestaurant} />;

// ---------- compare · e-commerce (cheap offer vs proper build) ----------
// VO: "অনলাইন shop-এর জন্য কেউ বলবে পাঁচ হাজারে website, আর ঠিকমতো বানাতে কুড়ি হাজার। কিন্তু সস্তাটায় পরে আসে domain renewal,
//      bug fix আর redesign — মোট বত্রিশ হাজার। proper build-এ নিজের নামে domain, এক বছর maintenance আর admin panel সব আছে। শেষে proper build-ই কম খরচ।"
const cueShop = mkCue([
  ["অনলাইন", 0.2], ["shop-এর", 0.5], ["কেউ", 0.9], ["পাঁচ", 1.2], ["হাজারে", 1.5], ["ঠিকমতো", 2.1], ["কুড়ি", 2.6], ["কিন্তু", 3.2], ["সস্তাটায়", 3.5],
  ["পরে", 3.9], ["renewal", 4.5], ["bug", 5.2], ["redesign", 5.9], ["মোট", 6.6], ["বত্রিশ", 6.9], ["proper", 7.4], ["domain", 7.9], ["maintenance", 8.5],
  ["admin", 9.1], ["শেষে", 9.8], ["কম", 10.3],
]);
const compareShop: CompareData = {
  industry: "ecommerce",
  a: { title: "CHEAP OFFER", price: 5000, sub: "LOOKS CHEAP", cue: "পাঁচ", hidden: [
    { label: "DOMAIN RENEWAL", amount: 4000, cue: "renewal" },
    { label: "BUG FIXES", amount: 8000, cue: "bug" },
    { label: "REDESIGN", amount: 15000, cue: "redesign" },
  ] },
  b: { title: "PROPER BUILD", price: 20000, sub: "ALL INCLUDED", cue: "কুড়ি", included: [
    { label: "DOMAIN IN YOUR NAME", cue: "domain" },
    { label: "1 YEAR SUPPORT", cue: "maintenance" },
    { label: "ADMIN PANEL", cue: "admin" },
  ] },
  verdict: { text: "PROPER BUILD COSTS LESS", cue: "শেষে" },
  cues: { scale: "কিন্তু" },
};

// ---------- compare · real estate (ads vs SEO) ----------
// VO: "flat বিক্রির জন্য Facebook ads মাসে দশ হাজার, আর SEO-সহ website একবার তিরিশ হাজার। ads বন্ধ করলেই visitor শূন্য,
//      তাই আবার দশ, আবার দশ, আবার দশ। website থাকে নিজের, Google-এ প্রতিদিন search আসে, listing আর enquiry form। বছর শেষে website-ই কম খরচ।"
const cueFlat = mkCue([
  ["flat", 0.2], ["বিক্রির", 0.5], ["Facebook", 0.9], ["ads", 1.3], ["মাসে", 1.6], ["দশ", 1.9], ["SEO-সহ", 2.4], ["website", 2.8], ["তিরিশ", 3.3],
  ["বন্ধ", 4.0], ["visitor", 4.5], ["শূন্য", 4.9], ["আবার", 5.4], ["দশ", 5.7], ["আবার", 6.1], ["দশ", 6.4], ["আবার", 6.8], ["দশ", 7.0], ["website", 7.4],
  ["নিজের", 7.8], ["Google-এ", 8.2], ["search", 8.6], ["listing", 9.0], ["enquiry", 9.4], ["বছর", 9.9], ["কম", 10.5],
]);
const compareFlat: CompareData = {
  industry: "realestate",
  a: { title: "FACEBOOK ADS", price: 10000, sub: "EVERY MONTH", cue: "Facebook", hidden: [
    { label: "MONTH 2", amount: 10000, cue: "আবার" },
    { label: "MONTH 3", amount: 10000 },
    { label: "MONTH 4", amount: 10000 },
  ] },
  b: { title: "SEO WEBSITE", price: 30000, sub: "PAID ONCE", cue: "SEO", included: [
    { label: "YOURS FOREVER", cue: "নিজের" },
    { label: "GOOGLE SEARCH", cue: "search" },
    { label: "ENQUIRY FORM", cue: "enquiry" },
  ] },
  verdict: { text: "WEBSITE WINS BY MONTH 4", cue: "বছর" },
  cues: { scale: "বন্ধ" },
};

const CompareShopShow: React.FC = () => <SceneCompare t={useT()} dur={12} cue={cueShop} data={compareShop} />;
const CompareFlatShow: React.FC = () => <SceneCompare t={useT()} dur={12} cue={cueFlat} data={compareFlat} />;

export const ITEMS: LibItem[] = [
  {
    id: "scenes-price-dental",
    name: "Price scene — dental",
    nameBn: "দামের scene — ডেন্টাল চেম্বার",
    group: "scenes",
    kind: "scene",
    duration: 14,
    still: 8.9,
    tags: ["price"],
    note: "<ScenePrice t dur cue data={PriceData}/> — package opens → features → slider → receipt printer → ONE-TIME vs EVERY YEAR",
    Comp: PriceDentalShow,
  },
  {
    id: "scenes-price-restaurant",
    name: "Price scene — restaurant",
    nameBn: "দামের scene — রেস্তোরাঁ",
    group: "scenes",
    kind: "scene",
    duration: 14,
    still: 9.2,
    tags: ["price"],
    note: "same template, restaurant data (cloche emblem, 3 add-ons)",
    Comp: PriceRestShow,
  },
  {
    id: "scenes-compare-ecommerce",
    name: "Compare scene — e-commerce",
    nameBn: "তুলনার scene — অনলাইন shop (সস্তা offer বনাম proper build)",
    group: "scenes",
    kind: "scene",
    duration: 12,
    still: 9.6,
    tags: ["compare"],
    note: "<SceneCompare t dur cue data={CompareData}/> — cards → balance → hidden costs drop on A → B checks → verdict",
    Comp: CompareShopShow,
  },
  {
    id: "scenes-compare-realestate",
    name: "Compare scene — real estate",
    nameBn: "তুলনার scene — real estate (ads বনাম SEO)",
    group: "scenes",
    kind: "scene",
    duration: 12,
    still: 10.2,
    tags: ["compare"],
    note: "same template: monthly ad spend piles up vs one-time SEO website",
    Comp: CompareFlatShow,
  },
];
