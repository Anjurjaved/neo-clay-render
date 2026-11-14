// wd004 S06 props — payment timeline: clay road, station pedestal, speech bubble, progress/test cards, pay chip, chat screen
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "../../kit/Clay";
import { roundedCylGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar, CheckBadge, Inset } from "../../kit/Soft";
import { StatusBar } from "../../kit/Device";
import { C } from "../../kit/theme";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);
const mix = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, k))).getHexString();

// ---------- Road: চ্যাপ্টা clay tube (নরম কিনারা) + উপরে কমলা progress ফিতা ----------
const TUB = 240;
const RAD = 20;
/** curve-এর y = 0 (local); group-কে FLOOR-এ বসান। grow = কতটা রাস্তা তৈরি হয়েছে, prog = কমলা অংশ (arc-length fraction) */
export const Road: React.FC<P & { curve: THREE.CatmullRomCurve3; grow: number; prog: number; w?: number }> = ({ curve, grow, prog, w = 0.36, ...p }) => {
  const base = useMemo(() => new THREE.TubeGeometry(curve, TUB, w, RAD, false), [curve, w]);
  const top = useMemo(() => new THREE.TubeGeometry(curve, TUB, w * 0.55, RAD, false), [curve, w]);
  const cap = useMemo(() => new THREE.SphereGeometry(1, 32, 16), []);
  const gN = Math.max(0, Math.min(TUB, Math.round(grow * TUB)));
  const pN = Math.max(0, Math.min(gN, Math.round(prog * TUB)));
  base.setDrawRange(0, gN * RAD * 6);
  top.setDrawRange(0, pN * RAD * 6);
  const ys = 0.14,
    yt = 0.4;
  const at = (u: number) => curve.getPointAt(Math.max(0, Math.min(1, u)));
  const c0 = at(0),
    cg = at(gN / TUB),
    cp = at(pN / TUB);
  const roadMat = <ClayMat color="#F1E6D8" rough={0.7} />;
  const orMat = <meshPhysicalMaterial color={C.orange} roughness={0.45} clearcoat={0.4} clearcoatRoughness={0.3} sheen={0.35} sheenColor="#ffe0c0" />;
  if (gN < 1) return null;
  return (
    <G {...p}>
      <group scale={[1, ys, 1]}>
        <mesh geometry={base} castShadow receiveShadow>
          {roadMat}
        </mesh>
        {[c0, cg].map((c, i) => (
          <mesh key={i} geometry={cap} position={c.toArray()} scale={w} receiveShadow>
            {roadMat}
          </mesh>
        ))}
      </group>
      {pN >= 1 && (
        <group scale={[1, yt, 1]}>
          <mesh geometry={top} receiveShadow>
            {orMat}
          </mesh>
          {[c0, cp].map((c, i) => (
            <mesh key={i} geometry={cap} position={c.toArray()} scale={w * 0.55}>
              {orMat}
            </mesh>
          ))}
        </group>
      )}
    </G>
  );
};

// ---------- Station: cream pedestal + রঙিন top disc + সামনে নম্বর ----------
export const STATION = { r: 0.46, h: 0.32 };
export const Station: React.FC<P & { n: number; lit: number; live?: number }> = ({ n, lit, live = 0, ...p }) => {
  const { r, h } = STATION;
  const body = useMemo(() => roundedCylGeo(r, h, 0.09), []);
  const disc = useMemo(() => roundedCylGeo(r * 0.8, 0.07, 0.03), []);
  const top = mix(mix("#E4DACD", C.orange, lit), C.green, live);
  return (
    <G {...p}>
      <mesh geometry={body} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ClayMat color={C.clay} />
      </mesh>
      <mesh geometry={disc} position={[0, h + 0.008, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={top} roughness={0.42} clearcoat={0.5} clearcoatRoughness={0.3} sheen={0.3} sheenColor="#ffe2c4" emissive={top} emissiveIntensity={0.08 * Math.max(lit, live)} />
      </mesh>
    </G>
  );
};

/** coin stack উচ্চতা হিসাবের জন্য: Station top (disc-এর উপর) */
export const STATION_TOP = STATION.h + 0.045;

// ---------- Speech bubble (আলোচনা) ----------
export const Bubble: React.FC<P & { color: string; dot: string; w?: number; h?: number; tail?: 1 | -1; phase?: number }> = ({ color, dot, w = 1.5, h = 0.85, tail = 1, phase = 0, ...p }) => (
  <G {...p}>
    <SoftPanel w={w} h={h} thick={0.26} color={color} radius={h * 0.45}>
      {[-1, 0, 1].map((i) => {
        const b = Math.max(0, Math.sin(phase * 7 - i * 0.9)) * 0.05;
        return (
          <mesh key={i} position={[i * w * 0.2, b, 0.02]} castShadow>
            <sphereGeometry args={[h * 0.095, 24, 16]} />
            <meshPhysicalMaterial color={dot} roughness={0.4} clearcoat={0.5} />
          </mesh>
        );
      })}
    </SoftPanel>
    {/* লেজ: ছোট গোল clay ফোঁটা */}
    <mesh position={[tail * w * 0.36, -h * 0.55, -0.02]} castShadow>
      <sphereGeometry args={[h * 0.15, 24, 16]} />
      <ClayMat color={color} />
    </mesh>
    <mesh position={[tail * w * 0.48, -h * 0.74, -0.02]} castShadow>
      <sphereGeometry args={[h * 0.08, 20, 14]} />
      <ClayMat color={color} />
    </mesh>
  </G>
);

// ---------- Progress card (development) ----------
export const ProgressCard: React.FC<P & { p: number }> = ({ p, ...rest }) => {
  const W = 3.6,
    H = 1.55,
    tw = 3.0,
    th = 0.36;
  const k = Math.max(0, Math.min(1, p));
  const fw = Math.max(th, tw * k);
  const pct = Math.round(k * 100);
  return (
    <SoftPanel w={W} h={H} thick={0.3} color="#F7F2EB" {...rest}>
      <Txt size={0.2} color={C.deepNavy} anchorX="left" position={[-tw / 2, 0.42, 0.01]}>
        BUILDING YOUR SITE
      </Txt>
      <Txt size={0.26} color={pct >= 100 ? C.green : C.deepOrange} anchorX="right" position={[tw / 2, 0.42, 0.01]}>
        {pct + "%"}
      </Txt>
      <Inset position={[0, -0.18, 0]} w={tw + 0.08} h={th + 0.08} color="#E6DED3" />
      {k > 0.005 && <RaisedBar position={[-tw / 2 + fw / 2, -0.18, -0.004]} w={fw} h={th} d={0.06} radius={th / 2} color={pct >= 100 ? C.green : C.orange} />}
    </SoftPanel>
  );
};

// ---------- Test checklist card ----------
const SLOT_GEO = roundedCylGeo(0.14, 0.05, 0.02);
export const TestCard: React.FC<P & { rows: string[]; ticks: number[] }> = ({ rows, ticks, ...rest }) => {
  const W = 3.3,
    H = 2.25;
  return (
    <SoftPanel w={W} h={H} thick={0.32} color="#F7F2EB" {...rest}>
      <Txt size={0.22} color={C.deepNavy} position={[0, 0.78, 0.01]}>
        TESTING
      </Txt>
      {rows.map((r, i) => {
        const y = 0.3 - i * 0.5;
        const tk = ticks[i] ?? 0;
        return (
          <group key={r} position={[0, y, 0]}>
            <Inset w={2.8} h={0.4} color="#ECE5DB" />
            <Txt size={0.17} color={C.navy} anchorX="left" position={[-1.25, 0, 0.012]}>
              {r}
            </Txt>
            {tk > 0.01 ? <CheckBadge position={[1.12, 0, 0.0]} scale={0.36 * tk} color={C.green} /> : <mesh position={[1.12, 0, 0.0]} rotation={[Math.PI / 2, 0, 0]} geometry={SLOT_GEO}>
              <ClayMat color="#DCD3C7" />
            </mesh>}
          </group>
        );
      })}
    </SoftPanel>
  );
};

// ---------- LIVE badge ----------
export const LiveBadge: React.FC<P & { pulse: number }> = ({ pulse, ...rest }) => (
  <SoftPanel w={2.5} h={0.86} thick={0.28} color="#22A85A" {...rest}>
    <mesh position={[-0.72, 0, 0.03]}>
      <sphereGeometry args={[0.12 * (1 + 0.12 * pulse), 24, 16]} />
      <meshStandardMaterial color="#ffffff" emissive="#eafff1" emissiveIntensity={0.4 + 0.5 * pulse} roughness={0.3} />
    </mesh>
    <Txt size={0.4} color="#ffffff" position={[0.2, -0.01, 0.012]}>
      LIVE
    </Txt>
  </SoftPanel>
);

// ---------- Payment chip ----------
export const PayChip: React.FC<P & { label: string; color: string; w?: number }> = ({ label, color, w = 1.35, ...rest }) => (
  <SoftPanel w={w} h={0.66} thick={0.24} color={color} {...rest}>
    <Txt size={0.22} color="#ffffff" position={[0, -0.01, 0.012]}>
      {label}
    </Txt>
  </SoftPanel>
);

// ---------- Chat screen (advance-এর আগে প্রশ্ন) ----------
const ui = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";
export const PayChatScreen: React.FC<{ typed: string; caret: boolean; sent: number }> = ({ typed, caret, sent }) => (
  <div style={{ position: "absolute", inset: 0, background: "#EFE7DE", fontFamily: ui }}>
    <div style={{ height: 150, background: "#1F9D55", color: "#fff", display: "flex", alignItems: "flex-end", padding: "0 20px 18px", gap: 14, position: "relative" }}>
      <StatusBar dark />
      <div style={{ width: 54, height: 54, borderRadius: 27, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#1B4470", fontWeight: 800, fontSize: 18 }}>JIT</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 25 }}>Javed IT Solution</div>
        <div style={{ fontSize: 17, opacity: 0.9 }}>online</div>
      </div>
    </div>
    <div style={{ padding: "24px 18px" }}>
      <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "16px 18px", fontSize: 25, lineHeight: 1.25, color: "#1d2733", maxWidth: 310, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
        Any question before the advance?
      </div>
      {sent > 0 && (
        <div style={{ marginTop: 16, marginLeft: "auto", background: "#D8F6C9", borderRadius: "18px 18px 4px 18px", padding: "16px 18px", fontSize: 25, lineHeight: 1.25, color: "#1d2733", maxWidth: 300, opacity: sent, transform: `translateY(${(1 - sent) * 16}px)` }}>
          Yes, how do I pay the 50%?
        </div>
      )}
    </div>
    <div style={{ position: "absolute", left: 18, right: 18, bottom: 110 }}>
      <div style={{ fontSize: 17, color: "#46525e", fontWeight: 800, marginBottom: 10, letterSpacing: 0.6 }}>WHATSAPP</div>
      <div style={{ background: "#fff", borderRadius: 20, padding: "20px 18px", fontSize: 42, fontWeight: 800, color: "#13253C", letterSpacing: 1.2, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", minHeight: 50, whiteSpace: "nowrap" }}>
        {typed}
        <span style={{ opacity: caret ? 1 : 0, color: "#1F9D55" }}>|</span>
      </div>
    </div>
  </div>
);
