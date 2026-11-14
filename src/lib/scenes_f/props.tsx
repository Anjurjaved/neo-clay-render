// scenes_f props — feature icon, Roberval balance (উপরে pan, উঁচু স্তূপ ধরে),
// weight block, compare card, check row। সব bevelled soft clay (LESSONS E1)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { SilverMat, Txt } from "../../kit/Clay";
import { slabGeo, latheGeo, pillGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar, Inset, CheckBadge } from "../../kit/Soft";
import { C } from "../../kit/theme";
import { Envelope, Magnifier, PhoneHandset, ShieldCheck, Cloud, Wrench, Gear, Cart, Calendar, ChatBubble, Star, Globe } from "../icons/Icons";
import { G, P, Gloss } from "./common";

// ================= Feature icon (icons group-এর এক টুকরার clay icon, ≈1 উঁচু) =================
export type FeatIcon = "mail" | "seo" | "phone" | "shield" | "cloud" | "wrench" | "gear" | "cart" | "calendar" | "chat" | "star" | "globe";
export const FeatBadge: React.FC<P & { icon: FeatIcon; color?: string; spin?: number }> = ({ icon, color, spin = 0, ...p }) => {
  const ip = { scale: 0.5, color, res: 96 };
  return (
    <G {...p}>
      {icon === "mail" && <Envelope {...ip} />}
      {icon === "seo" && <Magnifier {...ip} />}
      {icon === "phone" && <PhoneHandset {...ip} />}
      {icon === "shield" && <ShieldCheck {...ip} />}
      {icon === "cloud" && <Cloud {...ip} />}
      {icon === "wrench" && <Wrench {...ip} />}
      {icon === "gear" && <Gear {...ip} spin={spin} />}
      {icon === "cart" && <Cart {...ip} />}
      {icon === "calendar" && <Calendar {...ip} />}
      {icon === "chat" && <ChatBubble {...ip} />}
      {icon === "star" && <Star {...ip} />}
      {icon === "globe" && <Globe {...ip} />}
    </G>
  );
};

// ================= Roberval balance (উপরে দুই pan, pan সবসময় সমতল) =================
export const BAL = { span: 1.78, pivotY: 1.25, post: 0.32, panR: 0.78 };
/** tilt rad (+ = বাম নিচে)। children-এর জন্য pan-এর উপরের তলের অবস্থান: panTop(tilt, side) */
export const panTop = (tilt: number, side: -1 | 1): [number, number, number] => {
  const x = Math.cos(tilt) * BAL.span * side;
  const y = BAL.pivotY + Math.sin(tilt) * BAL.span * side + BAL.post + 0.06;
  return [x, y, 0];
};
export const Balance: React.FC<P & { tilt: number; color?: string }> = ({ tilt, color = C.navy, ...p }) => {
  const base = useMemo(() => latheGeo([[0, 0], [0.72, 0], [0.8, 0.06], [0.74, 0.17], [0.4, 0.24], [0.17, 0.32], [0.0, 0.33]], 72), []);
  const column = useMemo(() => latheGeo([[0.0, 0.25], [0.16, 0.25], [0.12, 0.5], [0.1, 0.9], [0.13, 1.12], [0.0, 1.16]], 48), []);
  const beam = useMemo(() => pillGeo(BAL.span * 2 + 0.24, 0.2, 0.22, 0.08), []);
  const pan = useMemo(() => latheGeo([[0, 0], [0.32, 0.0], [0.62, 0.04], [BAL.panR, 0.1], [BAL.panR + 0.02, 0.14], [BAL.panR - 0.05, 0.13], [0.55, 0.08], [0.0, 0.07]], 80), []);
  const postG = useMemo(() => latheGeo([[0, 0], [0.09, 0], [0.065, 0.08], [0.06, BAL.post - 0.04], [0.12, BAL.post], [0.0, BAL.post + 0.02]], 32), []);
  return (
    <G {...p}>
      <mesh geometry={base} castShadow receiveShadow>
        <Gloss color={color} rough={0.48} coat={0.4} />
      </mesh>
      <mesh geometry={column} castShadow>
        <SilverMat color="#e0e3e7" rough={0.34} />
      </mesh>
      <group position={[0, BAL.pivotY, 0]}>
        <group rotation={[0, 0, tilt]}>
          <mesh geometry={beam} castShadow>
            <Gloss color={color} rough={0.45} coat={0.45} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.13]}>
          <sphereGeometry args={[0.13, 32, 20]} />
          <Gloss color={C.orange} rough={0.35} coat={0.7} />
        </mesh>
      </group>
      {([-1, 1] as const).map((s) => {
        const x = Math.cos(tilt) * BAL.span * s;
        const y = BAL.pivotY + Math.sin(tilt) * BAL.span * s;
        return (
          <group key={s} position={[x, y, 0]}>
            <mesh geometry={postG}>
              <SilverMat color="#e0e3e7" rough={0.34} />
            </mesh>
            <mesh geometry={pan} position={[0, BAL.post - 0.02, 0]} castShadow receiveShadow>
              <SilverMat color="#eceef1" rough={0.3} />
            </mesh>
          </group>
        );
      })}
    </G>
  );
};

// ================= Weight block (লুকানো খরচ) — w 1.3 × h 0.56, নিচের তল y=0 =================
export const BLOCK = { w: 1.32, h: 0.56, d: 0.7 };
export const WeightBlock: React.FC<P & { label: string; amount?: string; color?: string }> = ({ label, amount, color = "#D9453B", ...p }) => {
  const g = useMemo(() => slabGeo(BLOCK.w, BLOCK.h, BLOCK.d, 0.14, 0.1, 6), []);
  const fs = Math.min(0.17, (BLOCK.w * 0.86) / (label.length * 0.64));
  return (
    <G {...p}>
      <mesh geometry={g} position={[0, BLOCK.h / 2, 0]} castShadow receiveShadow>
        <Gloss color={color} rough={0.48} coat={0.4} />
      </mesh>
      <Txt size={fs} color="#ffffff" position={[0, amount ? BLOCK.h * 0.66 : BLOCK.h / 2, BLOCK.d / 2 + 0.012]}>
        {label}
      </Txt>
      {amount && (
        <Txt size={0.19} color="#FFE3C8" position={[0, BLOCK.h * 0.3, BLOCK.d / 2 + 0.012]}>
          {amount}
        </Txt>
      )}
    </G>
  );
};

// ================= Compare card (w 2.5 × h 1.5) =================
export const CompareCard: React.FC<P & { title: string; price: string; sub?: string; tone: "bad" | "good"; emblem?: React.ReactNode; glow?: number }> = ({ title, price, sub, tone, emblem, glow = 0, ...p }) => {
  const ink = tone === "bad" ? "#D9453B" : "#1F9D55";
  const col = "#" + new THREE.Color("#FBF8F3").lerp(new THREE.Color(tone === "good" ? "#E3F5E8" : "#FBE3DF"), glow).getHexString();
  const ts = Math.min(0.24, 1.55 / (title.length * 0.64));
  const ps = Math.min(0.34, 1.6 / (price.length * 0.6));
  return (
    <SoftPanel w={2.5} h={1.5} thick={0.3} color={col} {...p}>
      <Inset position={[-0.78, 0.0, 0]} w={0.7} h={1.12} color="#EDE5DA" />
      {emblem && <group position={[-0.78, -0.36, 0.06]}>{emblem}</group>}
      <Txt size={ts} color={C.deepNavy} anchorX="left" position={[-0.32, 0.36, 0.012]}>
        {title}
      </Txt>
      <RaisedBar position={[-0.32 + 0.38, 0.14, 0]} w={0.76} h={0.05} d={0.02} color={ink} />
      <Txt size={ps} color={ink} anchorX="left" position={[-0.32, -0.15, 0.012]}>
        {price}
      </Txt>
      {sub && (
        <Txt size={0.13} color="#6b7785" anchorX="left" position={[-0.32, -0.5, 0.012]}>
          {sub}
        </Txt>
      )}
    </SoftPanel>
  );
};

/** সবুজ check সহ এক সারি (B-এর ভেতরে যা আছে) — w 2.3 × h 0.5 */
export const CheckRow: React.FC<P & { label: string; tick: number }> = ({ label, tick, ...p }) => {
  const fs = Math.min(0.19, 1.6 / (label.length * 0.62));
  return (
    <SoftPanel w={2.3} h={0.5} thick={0.14} color="#FBF8F3" {...p}>
      <CheckBadge position={[-0.88, 0, 0.0]} scale={0.38} color="#22B35E" tick={tick} />
      <Txt size={fs} color={C.deepNavy} anchorX="left" position={[-0.6, -0.005, 0.012]}>
        {label}
      </Txt>
    </SoftPanel>
  );
};
