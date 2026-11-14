// industry → clay জগৎ: দোকানের sign object, sign রং, owner-এর পোশাক/আনুষঙ্গিক, ফোনের app রং
import React from "react";
import { C } from "../../kit/theme";
import { Stethoscope } from "../../web11/props";
import { Molar, Cloche, Bag, GradCap, House, MedCross, ChefHat } from "./objects";

export type Industry = "dental" | "restaurant" | "ecommerce" | "school" | "realestate" | "clinic";

export type IndustryLook = {
  sign: string; // default signboard label (English)
  signColor: string;
  clay: string; // দোকানের body
  /** facade-এর উপরে বসানো এক টুকরার চিহ্ন (local: base y=0, ≈1 উঁচু) */
  Mark: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }>;
  markScale: number;
  owner: { color?: string; coat?: string; acc?: "stetho" | "chef" | "none" };
  ownerRole: string;
};

export const LOOK: Record<Industry, IndustryLook> = {
  dental: { sign: "DENTAL CHAMBER", signColor: C.navy, clay: C.clay, Mark: Molar, markScale: 1.0, owner: { coat: "#F6F4F0", acc: "stetho" }, ownerRole: "Dentist" },
  restaurant: { sign: "SPICE GARDEN", signColor: C.deepOrange, clay: "#F1DFCB", Mark: Cloche, markScale: 0.95, owner: { coat: "#FBFAF7", acc: "chef" }, ownerRole: "Owner" },
  ecommerce: { sign: "TRENDY WEAR", signColor: "#C2416B", clay: "#F2E3D6", Mark: Bag, markScale: 1.05, owner: { color: C.figure, acc: "none" }, ownerRole: "Founder" },
  school: { sign: "BRIGHT COACHING", signColor: C.navy, clay: "#EDE3D2", Mark: GradCap, markScale: 1.0, owner: { color: "#2F4E7A", acc: "none" }, ownerRole: "Principal" },
  realestate: { sign: "GREEN HOMES", signColor: "#1F7A55", clay: "#EFE6D8", Mark: House, markScale: 1.05, owner: { color: "#2B3F5E", acc: "none" }, ownerRole: "Director" },
  clinic: { sign: "CITY CLINIC", signColor: "#157F5B", clay: "#EEF0EC", Mark: MedCross, markScale: 0.95, owner: { coat: "#F6F4F0", acc: "stetho" }, ownerRole: "Doctor" },
};

/** owner figure-এর আনুষঙ্গিক (Figure children — body-local) */
export const OwnerAcc: React.FC<{ acc?: "stetho" | "chef" | "none" }> = ({ acc }) =>
  acc === "stetho" ? <Stethoscope /> : acc === "chef" ? <ChefHat position={[0, 1.13, 0]} scale={1.05} /> : null;
