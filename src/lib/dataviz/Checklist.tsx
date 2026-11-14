// Checklist — clay clipboard (রুপালি clip), সাদা কাগজ; প্রতিটা সারিতে খোদাই socket-এ গম্বুজ check badge
// spring overshoot নিয়ে pop করে, tick আঁকা হয়, পিছনে উষ্ণ highlight বাম থেকে ছড়িয়ে যায়, লেখা গাঢ় হয়।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, Txt } from "../../kit/Clay";
import { pillGeo, roundedCylGeo, slabGeo } from "../../kit/Geo";
import { SoftPanel, CheckBadge } from "../../kit/Soft";
import { springStep, smoothstep, expoOut, clamp } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, P, stretchGeo } from "./common";

export const checklistAges = (t: number, n: number, t0 = 0.9, gap = 0.55) => Array.from({ length: n }, (_, i) => t - t0 - i * gap);

const Row: React.FC<{ label: string; age: number; w: number; y: number }> = ({ label, age, w, y }) => {
  const sock = useMemo(() => {
    const g = roundedCylGeo(0.24, 0.05, 0.02, 48);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const hb = useMemo(() => {
    const g = pillGeo(0.5, 0.5, 0.02, 0.008);
    g.translate(0.25, 0, 0);
    return g;
  }, []);
  const on = age >= 0;
  const pop = on ? springStep(age, { k: 260, c: 11 }) : 0;
  const tick = on ? expoOut(clamp((age - 0.08) / 0.3)) : 0;
  const hl = on ? expoOut(clamp((age - 0.05) / 0.5)) : 0;
  const HL = 0.5 + (w - 0.5) * hl;
  const hg = useMemo(() => stretchGeo(hb, 0, 0.25, HL - 0.5), [hb, HL]);
  const ink = new THREE.Color("#8d98a6").lerp(new THREE.Color(C.deepNavy), smoothstep(0, 0.25, age));
  return (
    <group position={[0, y, 0]}>
      {hl > 0.001 && (
        <mesh geometry={hg} position={[-w / 2, 0, 0.004]}>
          <ClayMat color="#FCE6CF" rough={0.8} bump={0.05} />
        </mesh>
      )}
      <mesh geometry={sock} position={[-w / 2 + 0.36, 0, 0.0]} receiveShadow>
        <ClayMat color="#E4DAD0" rough={0.8} bump={0.1} />
      </mesh>
      {on && (
        <group position={[-w / 2 + 0.36, 0, 0.02]} scale={[0.5 * pop, 0.5 * pop, 0.5 * Math.min(pop, 1.15)]}>
          <CheckBadge tick={tick} />
        </group>
      )}
      <Txt size={0.2} color={"#" + ink.getHexString()} anchorX="left" position={[-w / 2 + 0.74, -0.01, 0.03]}>
        {label}
      </Txt>
    </group>
  );
};

export const Checklist: React.FC<
  P & {
    items: string[];
    /** প্রতিটা item check হওয়ার পর সেকেন্ড (ঋণাত্মক = এখনো নয়) */
    ages: number[];
    title?: string;
    w?: number;
  }
> = ({ items, ages, title = "WEBSITE CHECKLIST", w = 3.3, ...p }) => {
  const rowH = 0.66;
  const ph = items.length * rowH + 0.95;
  const bh = ph + 0.55;
  const clipBase = useMemo(() => slabGeo(1.25, 0.42, 0.2, 0.14, 0.07, 6), []);
  const clipBar = useMemo(() => pillGeo(0.9, 0.16, 0.14, 0.05), []);
  return (
    <G {...p}>
      {/* board */}
      <SoftPanel w={w + 0.4} h={bh} thick={0.3} color="#E7C9A6" rough={0.62}>
        {/* paper */}
        <SoftPanel w={w} h={ph} thick={0.06} color="#FFFDF9" position={[0, -0.12, 0.0]} rough={0.8}>
          <Txt size={0.19} color={C.navy} anchorX="left" position={[-w / 2 + 0.3, ph / 2 - 0.48, 0.02]} letterSpacing={0.05}>
            {title}
          </Txt>
          {items.map((it, i) => (
            <Row key={i} label={it} age={ages[i] ?? -1} w={w - 0.3} y={ph / 2 - 1.08 - i * rowH} />
          ))}
        </SoftPanel>
        {/* clip */}
        <mesh geometry={clipBase} position={[0, bh / 2 - 0.12, 0.08]} castShadow>
          <SilverMat rough={0.38} />
        </mesh>
        <mesh geometry={clipBar} position={[0, bh / 2 - 0.2, 0.2]} castShadow>
          <SilverMat rough={0.3} color="#cfd5db" />
        </mesh>
      </SoftPanel>
    </G>
  );
};
