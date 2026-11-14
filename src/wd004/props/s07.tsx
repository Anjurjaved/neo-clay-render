// wd004 S07 (faq) — নিজস্ব prop: treatment fee DOM screen, বড় fee card, TREATMENTS ও SERIAL FORM page card, missed-call badge
import React, { useMemo } from "react";
import * as THREE from "three";
import { Txt } from "../../kit/Clay";
import { roundedCylGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar, Inset, CheckBadge } from "../../kit/Soft";
import { StatusBar } from "../../kit/Device";
import { C } from "../../kit/theme";
import { Tooth } from "../../web11/props";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ui = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";

export const FEES: { name: string; fixed: string; range: string }[] = [
  { name: "Scaling", fixed: "BDT 2,000", range: "BDT 1,500 – 3,000" },
  { name: "Root Canal", fixed: "BDT 7,500", range: "BDT 6,000 – 9,000" },
  { name: "Braces", fixed: "BDT 60,000", range: "BDT 40,000 – 80,000" },
];

/** phone DOM (390 px wide) — chamber-এর treatment fee page।
 *  rows 0..1 (row আসা), strike 0..1 (নির্দিষ্ট দাম কাটা), ranged 0..1 (range-এ বদল), focus 0..1 (Root Canal জোর), note 0..1 */
export const TreatmentFeesScreen: React.FC<{ rows: number; strike: number; ranged: number; focus: number; note: number }> = ({ rows, strike, ranged, focus, note }) => (
  <div style={{ position: "absolute", inset: 0, background: "#FBF8F4", fontFamily: ui, color: "#13253C" }}>
    <StatusBar />
    <div style={{ position: "absolute", top: 62, left: 0, right: 0, height: 64, display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, background: "#1B4470", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
          <path d="M7.5 2.5c-2.6 0-4.5 2-4.5 4.8 0 2.2.8 3.5 1.5 5.2.6 1.6.9 3.6 1.3 6 .3 2 1 3 2 3s1.5-1.2 1.8-3c.3-1.6.8-2.8 2.4-2.8s2.1 1.2 2.4 2.8c.3 1.8.8 3 1.8 3s1.7-1 2-3c.4-2.4.7-4.4 1.3-6 .7-1.7 1.5-3 1.5-5.2 0-2.8-1.9-4.8-4.5-4.8-1.8 0-2.8 1-4.5 1s-2.7-1-4.5-1Z" />
        </svg>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>Dr. Shirin Dental</div>
    </div>
    <div style={{ position: "absolute", top: 146, left: 22, right: 22 }}>
      <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1.4, color: "#D85E24" }}>TREATMENTS</div>
      <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.05, marginTop: 6, letterSpacing: -0.5 }}>Fees &amp; Prices</div>
    </div>
    <div style={{ position: "absolute", top: 262, left: 16, right: 16 }}>
      {FEES.map((f, i) => {
        const k = clamp01(rows * 3 - i);
        const fo = i === 1 ? focus : 0;
        return (
          <div
            key={f.name}
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "22px 22px",
              marginBottom: 18,
              opacity: k,
              transform: `translateY(${(1 - k) * 26}px) scale(${1 + fo * 0.03})`,
              boxShadow: `0 6px 18px rgba(30,50,80,0.08), 0 0 0 ${fo * 3}px rgba(245,149,43,${fo})`,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800 }}>{f.name}</div>
            <div style={{ position: "relative", height: 38, marginTop: 8 }}>
              <div style={{ position: "absolute", left: 0, top: 0, fontSize: 28, fontWeight: 800, color: strike > 0.5 ? "#B8BEC6" : "#1B4470", opacity: 1 - ranged }}>
                {f.fixed}
                <div style={{ position: "absolute", left: -4, top: 17, height: 4, borderRadius: 2, width: `${strike * 104}%`, background: "#E5484D" }} />
              </div>
              <div style={{ position: "absolute", left: 0, top: 0, fontSize: 28, fontWeight: 800, color: "#D85E24", opacity: ranged, transform: `translateY(${(1 - ranged) * 12}px)` }}>{f.range}</div>
            </div>
          </div>
        );
      })}
    </div>
    <div
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 46,
        background: "#FFF1E2",
        borderRadius: 18,
        padding: "14px 18px",
        fontSize: 23,
        fontWeight: 800,
        color: "#8A4A16",
        opacity: note,
        transform: `translateY(${(1 - note) * 18}px)`,
      }}
    >
      * Final price after check-up
    </div>
  </div>
);

/** বড় fee card — ROOT CANAL + range + "* Final after check-up" (note 0..1) — w 4.0 × h 2.3 */
export const FeeCard: React.FC<P & { note: number }> = ({ note, ...p }) => (
  <SoftPanel w={4.0} h={2.3} thick={0.42} color="#FBF7F1" {...p}>
    <Tooth position={[-1.4, 0.36, 0.12]} scale={0.55} rotation={[0.35, 0.5, 0]} />
    <Txt size={0.3} color={C.deepNavy} anchorX="left" position={[-1.0, 0.62, 0.02]}>
      ROOT CANAL
    </Txt>
    <RaisedBar position={[-0.35, 0.32, 0]} w={1.3} h={0.07} d={0.025} color="#DCE2E8" />
    <Txt size={0.36} color={C.deepOrange} position={[0, -0.18, 0.02]}>
      BDT 6,000 – 9,000
    </Txt>
    {note > 0.01 && (
      <group position={[0, -0.78, 0.0]} scale={[0.6 + 0.4 * note, 0.6 + 0.4 * note, 1]}>
        <Inset w={3.2} h={0.5} color="#F6E4CF" />
        <Txt size={0.2} color="#8A4A16" opacity={note} position={[0, -0.005, 0.02]}>
          * Final after check-up
        </Txt>
      </group>
    )}
  </SoftPanel>
);

/** TREATMENTS page card — w 1.5 × h 1.9 */
export const TreatmentsCard: React.FC<P & { check: number }> = ({ check, ...p }) => (
  <SoftPanel w={1.5} h={1.9} thick={0.3} color="#FBF7F1" {...p}>
    <RaisedBar position={[0, 0.66, 0]} w={1.26} h={0.36} d={0.05} radius={0.1} color={C.navy} />
    <Txt size={0.13} color="#ffffff" position={[-0.04, 0.66, 0.085]}>
      TREATMENTS
    </Txt>
    {[0, 1, 2].map((i) => (
      <group key={i} position={[0, 0.2 - i * 0.36, 0]}>
        <Inset w={1.26} h={0.28} color="#EFE8DE" />
        <mesh position={[-0.5, 0, 0.03]}>
          <sphereGeometry args={[0.05, 20, 14]} />
          <meshStandardMaterial color={[C.steel, C.orange, C.navy][i]} roughness={0.45} />
        </mesh>
        <RaisedBar position={[-0.17, 0, 0]} w={0.46} h={0.07} d={0.025} color="#CFD6DE" />
        <RaisedBar position={[0.37, 0, 0]} w={0.36} h={0.12} d={0.035} color={C.orange} />
      </group>
    ))}
    {check > 0 && <CheckBadge position={[0.7, 0.98, 0.08]} scale={0.42 * check} />}
  </SoftPanel>
);

/** SERIAL FORM page card — w 1.5 × h 1.9 */
export const SerialFormCard: React.FC<P & { check: number }> = ({ check, ...p }) => (
  <SoftPanel w={1.5} h={1.9} thick={0.3} color="#FBF7F1" {...p}>
    <RaisedBar position={[0, 0.66, 0]} w={1.26} h={0.36} d={0.05} radius={0.1} color={C.steel} />
    <Txt size={0.13} color="#ffffff" position={[-0.04, 0.66, 0.085]}>
      SERIAL FORM
    </Txt>
    {[0, 1].map((i) => (
      <group key={i} position={[0, 0.22 - i * 0.36, 0]}>
        <Inset w={1.26} h={0.28} color="#EFE8DE" />
        <RaisedBar position={[-0.3, 0, 0]} w={0.5} h={0.07} d={0.025} color="#CFD6DE" />
      </group>
    ))}
    <RaisedBar position={[0, -0.6, 0]} w={1.0} h={0.3} d={0.07} radius={0.15} color={C.orange} />
    <Txt size={0.14} color="#ffffff" position={[0, -0.6, 0.075]}>
      BOOK SERIAL
    </Txt>
    {check > 0 && <CheckBadge position={[0.7, 0.98, 0.08]} scale={0.42 * check} />}
  </SoftPanel>
);

/** missed-call গোল badge (ব্যাস ≈1) — সংখ্যা + হালকা phone handset; calm 0..1 হলে কমলা → সবুজ */
export const CallBadge: React.FC<P & { n: number; calm: number }> = ({ n, calm, ...p }) => {
  const geo = useMemo(() => roundedCylGeo(0.5, 0.26, 0.11), []);
  const col = "#" + new THREE.Color(C.deepOrange).lerp(new THREE.Color("#22A45A"), calm).getHexString();
  return (
    <group position={p.position} rotation={p.rotation as any} scale={p.scale as any}>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]} geometry={geo}>
        <meshPhysicalMaterial color={col} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.4} sheenColor="#ffd0b0" />
      </mesh>
      <Txt size={0.44} color="#ffffff" position={[0, -0.01, 0.14]}>
        {String(n)}
      </Txt>
    </group>
  );
};
