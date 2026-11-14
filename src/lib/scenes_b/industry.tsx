// industry → theme (site content, colours) + এক টুকরার polished 3D subject object (base y = 0, উচ্চতা ≈ 1)
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat } from "../../kit/Clay";
import { latheGeo, roundedCylGeo, shapeGeo, slabGeo } from "../../kit/Geo";
import { RaisedBar } from "../../kit/Soft";
import { C } from "../../kit/theme";
import { G, Industry, P } from "./common";
import { bakeSDF, sdCone, sdEllipsoid, sdSphere, smax, smin } from "./sdf";

export type SiteItem = { name: string; sub: string; price: string; icon: "tooth" | "spark" | "shield" | "smile" | "bowl" | "cup" | "flame" | "shirt" | "bag" | "star" | "book" | "flask" | "pen" | "home" | "key" | "map" };
export type IndustryTheme = {
  label: string; // 3D English sign
  brand: string; // site/business name (English)
  brandBn: string;
  url: string;
  accent: string;
  accentInk: string;
  soft: string; // light tint for site sections
  heroBn: string;
  subBn: string;
  ctaBn: string;
  cta2Bn: string;
  nav: string[];
  items: SiteItem[];
  meta: [string, string][]; // ছোট তথ্য: label → value
};

export const THEME: Record<Industry, IndustryTheme> = {
  dental: {
    label: "DENTAL CHAMBER",
    brand: "Dr. Shirin Dental Care",
    brandBn: "ডা. শিরিন ডেন্টাল কেয়ার",
    url: "drshirindental.com",
    accent: "#1F78C8",
    accentInk: "#ffffff",
    soft: "#EAF3FC",
    heroBn: "দাঁতের চিকিৎসা, আগে থেকেই জানা খরচে",
    subBn: "জিন্দাবাজার, সিলেট · শনি–বৃহস্পতি বিকেল ৫টা–রাত ৯টা",
    ctaBn: "Serial নিন",
    cta2Bn: "খরচ দেখুন",
    nav: ["Home", "Doctor", "Treatments", "Fees", "Contact"],
    items: [
      { name: "Scaling", sub: "৩০ মিনিট", price: "৳1,500–2,500", icon: "spark" },
      { name: "Root Canal", sub: "২–৩ সিটিং", price: "৳6,000–9,000", icon: "tooth" },
      { name: "Braces", sub: "১২–১৮ মাস", price: "৳45,000+", icon: "smile" },
    ],
    meta: [["Rating", "4.9 ★ (212)"], ["Phone", "01616-901396"]],
  },
  restaurant: {
    label: "RESTAURANT",
    brand: "Surma Spice Kitchen",
    brandBn: "সুরমা স্পাইস কিচেন",
    url: "surmaspice.com.bd",
    accent: "#C9462C",
    accentInk: "#ffffff",
    soft: "#FDF0E8",
    heroBn: "আজকের menu, ঘরে বসেই order",
    subBn: "দরগাহ গেট, সিলেট · প্রতিদিন দুপুর ১২টা–রাত ১১টা",
    ctaBn: "Order করুন",
    cta2Bn: "Table book",
    nav: ["Menu", "Order", "Reservation", "Catering", "Contact"],
    items: [
      { name: "Kacchi Biryani", sub: "Full plate", price: "৳320", icon: "bowl" },
      { name: "Beef Tehari", sub: "Half plate", price: "৳220", icon: "flame" },
      { name: "Borhani", sub: "500 ml", price: "৳80", icon: "cup" },
    ],
    meta: [["Delivery", "35 min"], ["Rating", "4.7 ★ (1.2k)"]],
  },
  ecommerce: {
    label: "ONLINE SHOP",
    brand: "Nakshi Threads",
    brandBn: "নকশি থ্রেডস",
    url: "nakshithreads.com",
    accent: "#B83A62",
    accentInk: "#ffffff",
    soft: "#FBEFF3",
    heroBn: "ঈদের নতুন collection এখন online-এ",
    subBn: "সারা দেশে delivery · bKash, Nagad বা cash on delivery",
    ctaBn: "Shop now",
    cta2Bn: "Size guide",
    nav: ["New", "Panjabi", "Saree", "Kurti", "Cart (2)"],
    items: [
      { name: "Cotton Panjabi", sub: "M · L · XL", price: "৳1,850", icon: "shirt" },
      { name: "Jamdani Saree", sub: "Handloom", price: "৳3,200", icon: "star" },
      { name: "Printed Kurti", sub: "Free size", price: "৳1,250", icon: "bag" },
    ],
    meta: [["Delivery", "2–3 days"], ["Orders", "3,200+"]],
  },
  school: {
    label: "COACHING CENTRE",
    brand: "Shikhon Coaching Point",
    brandBn: "শিখন কোচিং পয়েন্ট",
    url: "shikhoncoaching.com",
    accent: "#23885A",
    accentInk: "#ffffff",
    soft: "#EAF6EF",
    heroBn: "SSC ও HSC batch-এ ভর্তি চলছে",
    subBn: "আম্বরখানা, সিলেট · সকাল ও বিকেলের batch",
    ctaBn: "ভর্তি form",
    cta2Bn: "Routine দেখুন",
    nav: ["Courses", "Teachers", "Results", "Admission", "Contact"],
    items: [
      { name: "SSC Science", sub: "সপ্তাহে ৪ দিন", price: "৳2,500/মাস", icon: "flask" },
      { name: "HSC Physics", sub: "সপ্তাহে ৩ দিন", price: "৳3,000/মাস", icon: "book" },
      { name: "Admission Batch", sub: "৪ মাস", price: "৳12,000", icon: "pen" },
    ],
    meta: [["Students", "480+"], ["GPA 5", "92 in 2026"]],
  },
  realestate: {
    label: "REAL ESTATE",
    brand: "Green Nest Properties",
    brandBn: "গ্রিন নেস্ট প্রপার্টিজ",
    url: "greennestbd.com",
    accent: "#1E4E79",
    accentInk: "#ffffff",
    soft: "#EEF3F8",
    heroBn: "Ready flat, ছবি আর দাম একসাথে",
    subBn: "উপশহর ও শিবগঞ্জ, সিলেট · site visit বুক করুন",
    ctaBn: "Visit book",
    cta2Bn: "Brochure",
    nav: ["Projects", "Ready Flats", "Plots", "About", "Contact"],
    items: [
      { name: "1,250 sqft · 3 bed", sub: "Uposhohor", price: "৳85 lakh", icon: "home" },
      { name: "1,600 sqft · 3 bed", sub: "Shibganj", price: "৳1.1 crore", icon: "key" },
      { name: "5 katha plot", sub: "Tilagor", price: "৳60 lakh", icon: "map" },
    ],
    meta: [["Handover", "Dec 2027"], ["Projects", "14 done"]],
  },
};

// ---------------- 3D subjects ----------------
const GlossClay: React.FC<{ color: string; rough?: number; coat?: number }> = ({ color, rough = 0.36, coat = 0.6 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={coat} clearcoatRoughness={0.28} sheen={0.35} sheenColor="#ffe6cc" sheenRoughness={0.8} envMapIntensity={0.95} />
);

/** এক টুকরার molar — crown + ৪ cusp + দুই root, smooth-union (fillet), উপরে হালকা খাঁজ। উচ্চতা ≈ 1.05 */
export const Tooth: React.FC<P & { color?: string }> = ({ color = "#FBF9F4", ...p }) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "sb-molar",
        (x, y, z) => {
          let d = sdEllipsoid(x, y - 0.68, z, 0.4, 0.27, 0.34);
          for (const [cx, cz] of [[-0.17, -0.13], [0.17, -0.13], [-0.17, 0.14], [0.17, 0.14]]) d = smin(d, sdSphere(x - cx, y - 0.86, z - cz, 0.17), 0.12);
          d = smin(d, sdCone([x, y, z], [-0.16, 0.55, 0], [-0.2, 0.06, 0.02], 0.17, 0.075), 0.16);
          d = smin(d, sdCone([x, y, z], [0.16, 0.55, 0], [0.22, 0.08, -0.02], 0.17, 0.075), 0.16);
          d = smax(d, -sdEllipsoid(x, y - 1.02, z, 0.08, 0.1, 0.3), 0.06); // মাঝের খাঁজ
          return d;
        },
        [0, 0.55, 0],
        0.62,
        88
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} roughness={0.26} clearcoat={0.85} clearcoatRoughness={0.15} sheen={0.3} sheenColor="#fff2e0" envMapIntensity={1.0} />
      </mesh>
    </G>
  );
};

/** রেস্তোরাঁর cloche — clay থালা + satin dome (knob একই lathe-এ)। lift = dome ওঠা (0..1) */
export const Cloche: React.FC<P & { lift?: number; plate?: string }> = ({ lift = 0, plate = "#F7F1E8", ...p }) => {
  const plateG = useMemo(() => latheGeo([[0.0, 0.0], [0.5, 0.0], [0.62, 0.03], [0.7, 0.075], [0.69, 0.1], [0.6, 0.085], [0.48, 0.07], [0.0, 0.07]], 72), []);
  const dome = useMemo(
    () => latheGeo([[0.55, 0.0], [0.56, 0.03], [0.54, 0.16], [0.47, 0.33], [0.34, 0.47], [0.17, 0.55], [0.06, 0.57], [0.05, 0.6], [0.09, 0.64], [0.1, 0.69], [0.06, 0.73], [0.0001, 0.735]], 72, 96),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={plateG} castShadow receiveShadow>
        <ClayMat color={plate} rough={0.5} />
      </mesh>
      <group position={[0, 0.075 + lift * 0.5, 0]} rotation={[0, 0, -0.35 * lift]}>
        <mesh geometry={dome} castShadow>
          <SilverMat color="#E6E8EC" rough={0.32} />
        </mesh>
      </group>
    </G>
  );
};

/** shopping bag — নরম পুরু ব্যাগ + দুটো দড়ির হাতল (ভেতরে ঢোকা) */
export const Bag: React.FC<P & { color?: string; handle?: string }> = ({ color = "#B83A62", handle = "#F4E7DA", ...p }) => {
  const body = useMemo(() => {
    const gg = slabGeo(0.86, 0.9, 0.42, 0.12, 0.1, 8);
    gg.translate(0, 0.45, 0);
    return gg;
  }, []);
  const ring = useMemo(() => new THREE.TorusGeometry(0.19, 0.03, 16, 48, Math.PI), []);
  return (
    <G {...p}>
      <mesh geometry={body} castShadow receiveShadow>
        <GlossClay color={color} rough={0.48} coat={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={ring} position={[0, 0.86, s * 0.1]} castShadow>
          <ClayMat color={handle} rough={0.55} />
        </mesh>
      ))}
      <RaisedBar w={0.34} h={0.07} d={0.02} color={handle} position={[0, 0.62, 0.21]} radius={0.035} />
    </G>
  );
};

/** graduation cap — skull cap (lathe) + নরম বর্গ board + button + দোলা tassel */
export const GradCap: React.FC<P & { color?: string; tassel?: string; sway?: number }> = ({ color = "#1E3A5C", tassel = C.orange, sway = 0, ...p }) => {
  const cap = useMemo(() => latheGeo([[0.0, 0.0], [0.36, 0.0], [0.39, 0.06], [0.4, 0.2], [0.37, 0.34], [0.0, 0.36]], 64), []);
  const board = useMemo(() => {
    const gg = slabGeo(1.05, 1.05, 0.07, 0.08, 0.03, 4);
    gg.rotateX(-Math.PI / 2);
    return gg;
  }, []);
  const btn = useMemo(() => roundedCylGeo(0.07, 0.05, 0.02, 32), []);
  return (
    <G {...p}>
      <mesh geometry={cap} castShadow receiveShadow>
        <GlossClay color={color} rough={0.5} coat={0.3} />
      </mesh>
      <mesh geometry={board} position={[0, 0.39, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <GlossClay color={color} rough={0.5} coat={0.3} />
      </mesh>
      <mesh geometry={btn} position={[0, 0.45, 0]}>
        <GlossClay color={tassel} />
      </mesh>
      <group position={[0, 0.45, 0]} rotation={[0, Math.PI / 4, sway]}>
        <mesh position={[0.3, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.016, 0.56, 6, 12]} />
          <GlossClay color={tassel} />
        </mesh>
        <mesh position={[0.6, -0.2, 0]}>
          <capsuleGeometry args={[0.016, 0.36, 6, 12]} />
          <GlossClay color={tassel} />
        </mesh>
        <mesh position={[0.6, -0.42, 0]}>
          <capsuleGeometry args={[0.05, 0.12, 8, 16]} />
          <ClayMat color={tassel} rough={0.6} />
        </mesh>
      </group>
    </G>
  );
};

/** বাড়ি — chimney সহ এক outline extrude (মোটা নরম bevel) + দরজা/জানালা */
export const House: React.FC<P & { color?: string; roof?: string; door?: string }> = ({ color = "#F6F0E7", roof = "#1E4E79", door = C.orange, ...p }) => {
  const body = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.42, 0.0);
    s.lineTo(0.42, 0.0);
    s.lineTo(0.42, 0.58);
    s.lineTo(-0.42, 0.58);
    s.closePath();
    const gg = shapeGeo(s, 0.5, 0.08, 6);
    gg.translate(0, 0.0, -0.25);
    return gg;
  }, []);
  const roofG = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.58, 0.0);
    s.lineTo(0.58, 0.0);
    s.lineTo(0.0, 0.5);
    s.closePath();
    const gg = shapeGeo(s, 0.64, 0.07, 6);
    gg.translate(0, 0, -0.32);
    return gg;
  }, []);
  const chim = useMemo(() => slabGeo(0.14, 0.26, 0.14, 0.04, 0.03, 3), []);
  return (
    <G {...p}>
      <mesh geometry={body} castShadow receiveShadow>
        <ClayMat color={color} rough={0.6} />
      </mesh>
      <mesh geometry={chim} position={[0.26, 0.86, -0.06]} castShadow>
        <ClayMat color={roof} rough={0.5} />
      </mesh>
      <mesh geometry={roofG} position={[0, 0.6, 0]} castShadow receiveShadow>
        <GlossClay color={roof} rough={0.45} coat={0.4} />
      </mesh>
      <RaisedBar w={0.2} h={0.32} d={0.04} color={door} radius={0.06} position={[-0.14, 0.17, 0.33]} />
      <RaisedBar w={0.2} h={0.18} d={0.035} color="#BFD9EE" radius={0.04} position={[0.17, 0.33, 0.33]} />
    </G>
  );
};

/** industry → subject object (উচ্চতা ≈ 1, base y=0) */
export const Subject: React.FC<P & { industry: Industry; t?: number }> = ({ industry, t = 0, ...p }) => {
  const th = THEME[industry];
  if (industry === "dental") return <Tooth {...p} />;
  if (industry === "restaurant") return <Cloche {...p} lift={0} />;
  if (industry === "ecommerce") return <Bag {...p} color={th.accent} />;
  if (industry === "school") return <GradCap {...p} sway={Math.sin(t * 2.2) * 0.12} />;
  return <House {...p} roof={th.accent} />;
};

/** নরম গোল pedestal (উচ্চতা h, উপরের তল y = h) */
export const Pedestal: React.FC<P & { r?: number; h?: number; color?: string }> = ({ r = 0.7, h = 0.3, color = "#F3ECE3", ...p }) => {
  const g = useMemo(() => roundedCylGeo(r, h, Math.min(0.12, h * 0.45), 96), [r, h]);
  return (
    <G {...p}>
      <mesh geometry={g} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ClayMat color={color} rough={0.62} />
      </mesh>
    </G>
  );
};
