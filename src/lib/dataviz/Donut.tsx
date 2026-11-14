// Clay donut chart — প্রতিটা ভাগ এক টুকরার ফোলা (puffy) bevelled arc; উপর থেকে ঘড়ির কাঁটার দিকে ভরে ওঠে,
// highlight ভাগ spring দিয়ে বাইরে-সামনে বেরিয়ে আসে, মাঝখানে % count-up।
import React, { useMemo } from "react";
import * as THREE from "three";
import { Txt } from "../../kit/Clay";
import { roundedCylGeo } from "../../kit/Geo";
import { ClayMat } from "../../kit/Clay";
import { C } from "../../kit/theme";
import { G, P, Gloss } from "./common";

const sectorGeo = (ri: number, ro: number, a0: number, a1: number, depth: number, b: number) => {
  const s = new THREE.Shape();
  const r1 = ri + b,
    r2 = ro - b;
  // কোণের ফাঁক দুই radius-এ সমান world দূরত্ব রাখতে আলাদা trim
  const t2 = b / r2,
    t1 = b / r1;
  const A0 = a0 + t2,
    A1 = a1 - t2,
    B0 = a0 + t1,
    B1 = a1 - t1;
  s.moveTo(Math.cos(B0) * r1, Math.sin(B0) * r1);
  s.lineTo(Math.cos(A0) * r2, Math.sin(A0) * r2);
  s.absarc(0, 0, r2, A0, A1, false);
  s.lineTo(Math.cos(B1) * r1, Math.sin(B1) * r1);
  s.absarc(0, 0, r1, B1, B0, true);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: depth - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.98, bevelSegments: 8, curveSegments: Math.max(8, Math.ceil((a1 - a0) * 40)) });
  g.translate(0, 0, -(depth - b * 2) / 2);
  g.computeVertexNormals();
  return g;
};

const Sector: React.FC<{ ri: number; ro: number; a0: number; a1: number; depth: number; color: string }> = ({ ri, ro, a0, a1, depth, color }) => {
  const b = depth * 0.36;
  const geo = useMemo(() => sectorGeo(ri, ro, a0, a1, depth, b), [ri, ro, a0, a1, depth, b]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <Gloss color={color} rough={0.45} coat={0.45} />
    </mesh>
  );
};

export type Slice = { value: number; label: string; color: string };

export const DonutChart: React.FC<
  P & {
    slices: Slice[];
    /** 0..1 — উপর থেকে ঘড়ির কাঁটার দিকে কতটা ভরেছে */
    sweep: number;
    highlight?: number;
    /** highlight ভাগের বেরিয়ে আসা (spring, overshoot চলবে) */
    pop?: number;
    centerLabel?: string;
    /** 0..1 — বাইরের legend লেখা */
    legend?: number;
    ri?: number;
    ro?: number;
  }
> = ({ slices, sweep, highlight = 0, pop = 0, centerLabel, legend = 1, ri = 0.8, ro = 1.5, ...p }) => {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const gapA = 0.035;
  let acc = 0;
  const hv = slices[highlight];
  const hf1 = slices.slice(0, highlight + 1).reduce((a, s) => a + s.value, 0) / total;
  const shownPct = Math.round((hv.value / total) * 100 * Math.min(1, Math.max(0, sweep / hf1)));
  return (
    <G {...p}>
      {slices.map((s, i) => {
        const f0 = acc / total;
        acc += s.value;
        const f1 = acc / total;
        const vis = Math.min(f1, Math.max(f0, sweep)) - f0; // কতটা দেখা যায়
        if (vis * Math.PI * 2 * ri < 0.2) return null;
        const a0 = Math.PI / 2 - (f0 + vis) * Math.PI * 2 + gapA;
        const a1 = Math.PI / 2 - f0 * Math.PI * 2 - gapA;
        const mid = (a0 + a1) / 2;
        const isH = i === highlight;
        const off = isH ? pop * 0.22 : 0;
        const midFull = Math.PI / 2 - ((f0 + f1) / 2) * Math.PI * 2;
        const lr = ro + 0.2;
        const lx = Math.cos(midFull) * lr,
          ly = Math.sin(midFull) * lr;
        const right = lx >= 0;
        return (
          <group key={i}>
            <group position={[Math.cos(mid) * off, Math.sin(mid) * off, isH ? pop * 0.28 : 0]}>
              <Sector ri={ri} ro={ro} a0={a0} a1={a1} depth={0.5} color={s.color} />
            </group>
            {vis >= f1 - f0 - 1e-4 && legend > 0 && (
              <group position={[lx + Math.cos(midFull) * off, ly + Math.sin(midFull) * off, 0.1]} scale={legend}>
                <Txt size={0.24} color={isH ? C.deepOrange : C.navy} anchorX={right ? "left" : "right"} position={[0, 0.1, 0]}>
                  {Math.round((s.value / total) * 100) + "%"}
                </Txt>
                <Txt size={0.14} color={C.navy} anchorX={right ? "left" : "right"} position={[0, -0.12, 0]} letterSpacing={0.04}>
                  {s.label}
                </Txt>
              </group>
            )}
          </group>
        );
      })}
      <Txt size={0.5} color={C.deepNavy} position={[0, 0.08, 0.05]}>
        {shownPct + "%"}
      </Txt>
      {centerLabel && (
        <Txt size={0.13} color={C.navy} position={[0, -0.3, 0.05]} letterSpacing={0.05}>
          {centerLabel}
        </Txt>
      )}
    </G>
  );
};

/** donut দাঁড় করানোর নরম cradle (pedestal) */
export const DonutCradle: React.FC<P> = (p) => {
  const g = useMemo(() => roundedCylGeo(1.25, 0.26, 0.11), []);
  const g2 = useMemo(() => roundedCylGeo(0.62, 0.22, 0.09), []);
  return (
    <G {...p}>
      <mesh geometry={g} position={[0, 0.13, 0]} castShadow receiveShadow>
        <ClayMat color="#F3ECE3" />
      </mesh>
      <mesh geometry={g2} position={[0, 0.34, 0]} castShadow receiveShadow>
        <ClayMat color="#EFE6DA" />
      </mesh>
    </G>
  );
};
