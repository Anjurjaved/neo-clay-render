// 3D odometer — গভীর bevelled housing (প্রতিটা digit-এর জানালা কাটা, এক টুকরা), পিছনে আসল drum (০–৯ গায়ে লেখা)।
// নিচের digit একটানা ঘোরে, উপরেরটা শুধু carry-তে (আসল mechanical odometer), থামার সময় প্রতিটা drum দোলে।
import React, { useMemo } from "react";
import * as THREE from "three";
import { Txt } from "../../kit/Clay";
import { roundedCylGeo, roundedRectPath } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { G, P, Gloss } from "./common";

const R = 0.95; // drum radius
const DW = 0.6; // drum width
const WIN_W = 0.66,
  WIN_H = 0.84;
const PITCH = 0.78;

/** wheel i-এর digit position (ভগ্নাংশ সহ) — carry যুক্তি */
export const odoDigit = (v: number, i: number) => {
  const p = Math.pow(10, i);
  const base = Math.floor(v / p) % 10;
  if (i === 0) return v % 10;
  const r = v % p;
  return base + Math.max(0, r - (p - 1));
};

const hole = (cx: number, cy: number, w: number, h: number, r: number) => {
  const p = new THREE.Path();
  const x = cx - w / 2,
    y = cy - h / 2;
  p.moveTo(x + r, y);
  p.absarc(x + r, y + r, r, Math.PI * 1.5, Math.PI, true);
  p.lineTo(x, y + h - r);
  p.absarc(x + r, y + h - r, r, Math.PI, Math.PI / 2, true);
  p.lineTo(x + w - r, y + h);
  p.absarc(x + w - r, y + h - r, r, Math.PI / 2, 0, true);
  p.lineTo(x + w, y + r);
  p.absarc(x + w - r, y + r, r, 0, -Math.PI / 2, true);
  p.lineTo(x + r, y);
  return p;
};

const Drum: React.FC<{ pos: number; accent?: boolean }> = ({ pos, accent }) => {
  const g = useMemo(() => {
    const geo = roundedCylGeo(R, DW, 0.06, 96);
    geo.rotateZ(Math.PI / 2);
    return geo;
  }, []);
  // সামনের দিকে যে digit-গুলো দেখা যেতে পারে শুধু সেগুলো আঁকি (Txt কম)
  const cur = Math.round(pos);
  const show = [-2, -1, 0, 1, 2].map((k) => (((cur + k) % 10) + 10) % 10);
  return (
    <group rotation={[-pos * ((Math.PI * 2) / 10), 0, 0]}>
      <mesh geometry={g} castShadow receiveShadow>
        <Gloss color={accent ? "#FFF3E6" : "#FBF8F4"} rough={0.5} coat={0.25} />
      </mesh>
      {show.map((d) => {
        const a = d * ((Math.PI * 2) / 10);
        return (
          <group key={d} rotation={[a, 0, 0]}>
            <Txt size={0.56} color={accent ? C.deepOrange : C.deepNavy} position={[0, -0.02, R + 0.04]}>
              {String(d)}
            </Txt>
          </group>
        );
      })}
    </group>
  );
};

export const Odometer: React.FC<
  P & {
    value: number;
    digits?: number;
    /** প্রতিটা drum-এর অতিরিক্ত দোলা (digit একক, settle wobble) */
    jiggle?: number[];
    label?: string;
    color?: string;
    /** হাজারের ঘরে কমা */
    commas?: boolean;
  }
> = ({ value, digits = 5, jiggle = [], label = "WEBSITE VISITORS", color = C.navy, commas = true, ...p }) => {
  // বাম→ডান x অবস্থান (কমার জন্য বাড়তি ফাঁক)
  const xs = useMemo(() => {
    const out: number[] = [];
    let x = 0;
    for (let k = 0; k < digits; k++) {
      const i = digits - 1 - k; // place value
      out.push(x);
      x += PITCH + (commas && i % 3 === 0 && i > 0 ? 0.2 : 0);
    }
    const mid = (out[0] + out[out.length - 1]) / 2;
    return out.map((v) => v - mid);
  }, [digits, commas]);
  const FW = xs[xs.length - 1] - xs[0] + WIN_W + 0.9;
  const FH = 2.3;
  const depth = 2.15;
  const frame = useMemo(() => {
    const b = 0.1;
    const s = roundedRectPath(FW - b * 2, FH - b * 2, 0.42 - b) as THREE.Shape;
    xs.forEach((x) => s.holes.push(hole(x, 0.12, WIN_W + b * 2, WIN_H + b * 2, 0.14 + b)));
    const g = new THREE.ExtrudeGeometry(s, { depth: depth - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 7, curveSegments: 24 });
    g.translate(0, 0, R + 0.15 - depth + b);
    g.computeVertexNormals();
    return g;
  }, [xs, FW]);
  const front = R + 0.15;
  return (
    <G {...p}>
      <mesh geometry={frame} castShadow receiveShadow>
        <Gloss color={color} rough={0.45} coat={0.5} />
      </mesh>
      {xs.map((x, k) => {
        const i = digits - 1 - k;
        return (
          <group key={k} position={[x, 0.12, 0]}>
            <Drum pos={odoDigit(Math.max(0, value), i) + (jiggle[i] ?? 0)} accent={i === 0} />
          </group>
        );
      })}
      {commas &&
        xs.map((x, k) => {
          const i = digits - 1 - k;
          return i % 3 === 0 && i > 0 ? (
            <Txt key={"c" + k} size={0.42} color="#ffffff" position={[x + PITCH / 2 + 0.1, -0.22, front + 0.02]}>
              ,
            </Txt>
          ) : null;
        })}
      <Txt size={0.16} color="#ffffff" position={[0, -FH / 2 + 0.3, front + 0.02]} letterSpacing={0.12}>
        {label}
      </Txt>
    </G>
  );
};
