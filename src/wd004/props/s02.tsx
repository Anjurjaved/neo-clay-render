// wd004 S02 (price) prop — gift/package box, blank page, feature badge, slider, chat bubble, credit card, add-on row,
// আর ফোনের DOM screen-গুলো। সব bevelled soft clay (LESSONS E1)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, Txt } from "../../kit/Clay";
import { slabGeo, roundedCylGeo, shapeGeo, roundedRectPath, latheGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar, Inset } from "../../kit/Soft";
import { StatusBar } from "../../kit/Device";
import { C } from "../../kit/theme";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

// ---------- Gift / package box ----------
export const GIFT = { w: 2.2, h: 1.45, d: 1.9, lidH: 0.42, lidO: 0.12 };
/** cream বাক্স + navy ঢাকনা + কমলা ফিতা। open 0..1 → ঢাকনা পিছনের কিনারা ধরে খুলে পিছনে দাঁড়ায় */
export const GiftBox: React.FC<P & { open?: number; lidOut?: number }> = ({ open = 0, lidOut = 0, ...p }) => {
  const { w, h, d, lidH, lidO } = GIFT;
  const body = useMemo(() => slabGeo(w, h, d, 0.26, 0.14, 8), []);
  const lid = useMemo(() => slabGeo(w + lidO * 2, lidH, d + lidO * 2, 0.16, 0.1, 8), []);
  const mouth = useMemo(() => slabGeo(w * 0.86, d * 0.84, 0.03, 0.18, 0.012, 3, false), []);
  const loop = useMemo(() => new THREE.TorusGeometry(0.26, 0.1, 20, 48), []);
  return (
    <G {...p}>
      {/* বাক্স */}
      <mesh geometry={body} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ClayMat color="#F5EEE4" rough={0.66} />
      </mesh>
      {/* উপরের খোলা মুখ (ঢাকনা খুললে দেখা যায়) */}
      <mesh geometry={mouth} position={[0, h + 0.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ClayMat color="#E2D3C1" rough={0.8} bump={0.1} />
      </mesh>
      {/* সামনের ফিতা (খাড়া) */}
      <RaisedBar position={[0, h / 2, d / 2 + 0.005]} w={0.36} h={h - 0.12} d={0.06} radius={0.08} color={C.orange} />
      {/* পাশের ফিতা */}
      {[-1, 1].map((s) => (
        <RaisedBar key={s} position={[(w / 2 + 0.005) * s, h / 2, 0]} rotation={[0, (Math.PI / 2) * s, 0]} w={0.36} h={h - 0.12} d={0.06} radius={0.08} color={C.orange} />
      ))}
      {/* ঢাকনা — পিছনের কিনারায় hinge */}
      <group position={[0, h - 0.06 + open * 2.35, -open * 0.45]} rotation={[open * 0.32, 0, open * 0.1]} scale={Math.max(0.001, 1 - lidOut)}>
        <group position={[0, lidH / 2, 0]}>
          <mesh geometry={lid} castShadow receiveShadow>
            <ClayMat color={C.navy} rough={0.55} />
          </mesh>
          <RaisedBar position={[0, 0, d / 2 + lidO + 0.005]} w={0.4} h={lidH - 0.08} d={0.06} radius={0.08} color={C.orange} />
          <RaisedBar position={[0, lidH / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} w={0.4} h={d + lidO * 2 - 0.1} d={0.06} radius={0.08} color={C.orange} />
          <RaisedBar position={[0, lidH / 2 + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} w={w + lidO * 2 - 0.1} h={0.4} d={0.05} radius={0.08} color={C.orange} />
          {/* ফিতার ফুল (bow) */}
          <group position={[0, lidH / 2 + 0.1, 0]}>
            {[-1, 1].map((s) => (
              <mesh key={s} geometry={loop} position={[0.27 * s, 0.17, 0]} rotation={[0, 0, s * 0.55]} scale={[1.05, 0.8, 0.55]} castShadow>
                <meshPhysicalMaterial color={C.orange} roughness={0.42} clearcoat={0.5} clearcoatRoughness={0.3} sheen={0.4} sheenColor="#ffe0c0" />
              </mesh>
            ))}
            <mesh position={[0, 0.08, 0]} castShadow>
              <sphereGeometry args={[0.15, 32, 20]} />
              <meshPhysicalMaterial color={C.deepOrange} roughness={0.4} clearcoat={0.5} />
            </mesh>
          </group>
        </group>
      </group>
    </G>
  );
};

/** লেখা-ছাড়া page card (box-এর ভেতরের পাতার গোছা) — PageCard-এর মতো একই আকার */
export const BlankPage: React.FC<P & { accent?: string }> = ({ accent = C.steel, ...p }) => (
  <SoftPanel w={1.0} h={1.25} thick={0.18} color="#F6F1EA" {...p}>
    <Inset position={[0, 0.27, 0]} w={0.82} h={0.42} color="#ECE6DE" />
    <RaisedBar position={[0, 0.27, -0.004]} w={0.72} h={0.3} d={0.04} radius={0.06} color={accent} />
    <RaisedBar position={[-0.06, -0.06, 0]} w={0.6} h={0.06} d={0.02} color="#d6dce3" />
    <RaisedBar position={[-0.14, -0.16, 0]} w={0.44} h={0.06} d={0.02} color="#d6dce3" />
    <RaisedBar position={[0, -0.38, 0]} w={0.56} h={0.09} d={0.02} color="#e2e6eb" />
  </SoftPanel>
);

// ---------- Feature badge (চকচকে গোল চাকতি + সাদা icon) ----------
const discGeo = roundedCylGeo(0.5, 0.24, 0.1);
const Disc: React.FC<{ color: string }> = ({ color }) => (
  <mesh geometry={discGeo} rotation={[Math.PI / 2, 0, 0]} castShadow>
    <meshPhysicalMaterial color={color} roughness={0.36} clearcoat={0.7} clearcoatRoughness={0.25} sheen={0.35} sheenColor="#ffe2c4" />
  </mesh>
);
const white = <ClayMat color="#FFFFFF" rough={0.45} bump={0.08} sheen={0.3} />;

export const EnvelopeIcon: React.FC<P> = (p) => {
  const body = useMemo(() => slabGeo(0.6, 0.42, 0.1, 0.07, 0.035, 4), []);
  return (
    <G {...p}>
      <mesh geometry={body} castShadow>{white}</mesh>
      {[-1, 1].map((s) => (
        <RaisedBar key={s} position={[0.135 * s, 0.07, 0.05]} rotation={[0, 0, 0.62 * s]} w={0.34} h={0.045} d={0.02} color="#C9D3DE" />
      ))}
    </G>
  );
};
export const MagnifierIcon: React.FC<P> = (p) => {
  const lens = useMemo(() => roundedCylGeo(0.16, 0.04, 0.015, 48), []);
  return (
    <G {...p}>
      <mesh position={[-0.06, 0.06, 0]} castShadow>
        <torusGeometry args={[0.17, 0.055, 20, 56]} />
        {white}
      </mesh>
      <mesh geometry={lens} position={[-0.06, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color="#CFE3F5" roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh position={[0.15, -0.15, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <capsuleGeometry args={[0.055, 0.2, 8, 16]} />
        {white}
      </mesh>
    </G>
  );
};
export const GearIcon: React.FC<P> = (p) => {
  const g = useMemo(() => {
    const s = new THREE.Shape();
    const N = 8, R1 = 0.2, R2 = 0.29;
    for (let i = 0; i <= N * 4; i++) {
      const a = (i / (N * 4)) * Math.PI * 2;
      const ph = i % 4;
      const r = ph === 1 || ph === 2 ? R2 : R1;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    const geo = shapeGeo(s, 0.06, 0.025, 3);
    geo.translate(0, 0, -0.03);
    return geo;
  }, []);
  const hub = useMemo(() => roundedCylGeo(0.09, 0.08, 0.03, 32), []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>{white}</mesh>
      <mesh geometry={hub} position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <ClayMat color={C.steel} rough={0.5} />
      </mesh>
    </G>
  );
};
export const FeatureBadge: React.FC<P & { icon: "mail" | "seo" | "gear"; color?: string }> = ({ icon, color = C.orange, ...p }) => (
  <G {...p}>
    <Disc color={color} />
    <group position={[0, 0, 0.17]}>
      {icon === "mail" && <EnvelopeIcon />}
      {icon === "seo" && <MagnifierIcon />}
      {icon === "gear" && <GearIcon />}
    </group>
  </G>
);

// ---------- Price slider (clay track + knob) ----------
/** w world প্রস্থ; k 0..1 knob অবস্থান; fill = কমলা ভরাট পর্যন্ত */
export const PriceSlider: React.FC<P & { k: number; w?: number; lo?: string; hi?: string; span?: number }> = ({ k, w = 4.2, lo = "15,000", hi = "30,000", span = 0, ...p }) => {
  const trackH = 0.34;
  const inner = w - 0.3;
  const fillW = Math.max(0.2, inner * Math.max(k, span));
  const knob = useMemo(() => latheGeo([[0.0, 0.0], [0.3, 0.0], [0.36, 0.06], [0.37, 0.15], [0.33, 0.24], [0.2, 0.29], [0.0, 0.3]], 64), []);
  return (
    <G {...p}>
      <SoftPanel w={w} h={trackH + 0.26} thick={0.26} color="#F4EEE6">
        <Inset w={inner} h={trackH * 0.62} color="#E2D8CB" />
      </SoftPanel>
      <RaisedBar position={[-inner / 2 + fillW / 2, 0, 0.13]} w={fillW} h={trackH * 0.5} d={0.05} color={C.orange} />
      <group position={[-inner / 2 + inner * k, 0, 0.14]}>
        <mesh geometry={knob} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <meshPhysicalMaterial color={C.navy} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.3} sheenColor="#dbe6ff" />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <sphereGeometry args={[0.07, 20, 14]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      </group>
      <Txt size={0.25} color={C.deepNavy} position={[-inner / 2 + 0.45, 0.55, 0.05]}>{lo}</Txt>
      <Txt size={0.25} color={C.deepNavy} position={[inner / 2 - 0.45, 0.55, 0.05]}>{hi}</Txt>
    </G>
  );
};

// ---------- Chat bubble (SMS / EN / BN) ----------
export const ChatBubble: React.FC<P & { text: string; color?: string; ink?: string; w?: number; h?: number; tail?: 1 | -1 }> = ({ text, color = C.green, ink = "#ffffff", w = 1.3, h = 0.8, tail = -1, ...p }) => {
  const g = useMemo(() => {
    const s = roundedRectPath(w, h, h * 0.42) as THREE.Shape;
    const body = shapeGeo(s, 0.16, 0.09, 6);
    body.translate(0, 0, -0.08);
    return body;
  }, [w, h]);
  const tailGeo = useMemo(() => {
    const t = new THREE.Shape();
    t.moveTo(-0.2, 0.06);
    t.quadraticCurveTo(-0.08, -0.12, -0.26, -0.3);
    t.quadraticCurveTo(0.05, -0.24, 0.16, 0.06);
    t.closePath();
    const geo = shapeGeo(t, 0.1, 0.05, 4);
    geo.translate(0, 0, -0.05);
    return geo;
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.55} clearcoatRoughness={0.3} sheen={0.3} sheenColor="#ffffff" />
      </mesh>
      <mesh geometry={tailGeo} position={[w * 0.24 * -tail, -h / 2 + 0.02, 0]} scale={[tail, 1, 1]} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.55} clearcoatRoughness={0.3} />
      </mesh>
      <Txt size={h * 0.42} color={ink} position={[0, -0.01, 0.18]}>{text}</Txt>
    </G>
  );
};

// ---------- Credit card ----------
export const ClayCard: React.FC<P> = (p) => (
  <SoftPanel w={1.7} h={1.07} thick={0.12} color={C.navy} rough={0.5} {...p}>
    <RaisedBar position={[-0.5, 0.12, 0]} w={0.34} h={0.26} d={0.04} radius={0.06} color="#E9C27A" />
    <RaisedBar position={[-0.5, 0.12, 0.02]} w={0.2} h={0.02} d={0.01} color="#c99d4f" />
    {[0, 1, 2].map((gi) =>
      [0, 1, 2, 3].map((i) => (
        <mesh key={`${gi}-${i}`} position={[-0.62 + gi * 0.42 + i * 0.075, -0.2, 0.02]}>
          <sphereGeometry args={[0.024, 12, 10]} />
          <meshStandardMaterial color="#dbe4ef" roughness={0.5} />
        </mesh>
      ))
    )}
    <Txt size={0.15} color="#ffffff" position={[0.58, -0.2, 0.02]}>2468</Txt>
    {[0, 1].map((i) => (
      <mesh key={i} position={[0.48 + i * 0.17, 0.3, 0.02]}>
        <sphereGeometry args={[0.12, 24, 16]} />
        <meshPhysicalMaterial color={i ? C.orange : C.deepOrange} roughness={0.45} clearcoat={0.4} transparent opacity={0.95} />
      </mesh>
    ))}
  </SoftPanel>
);

// ---------- Add-on receipt row ----------
export const AddonRow: React.FC<P & { amount: string; label: string; color?: string }> = ({ amount, label, color = C.deepOrange, ...p }) => (
  <SoftPanel w={3.1} h={0.78} thick={0.18} color="#FBF8F3" {...p}>
    <RaisedBar position={[-1.36, 0, 0]} w={0.12} h={0.46} d={0.04} radius={0.05} color={color} />
    <Txt size={0.32} color={color} anchorX="left" position={[-1.18, -0.01, 0.02]}>{amount}</Txt>
    <Txt size={0.21} color={C.deepNavy} anchorX="right" position={[1.3, -0.01, 0.02]}>{label}</Txt>
  </SoftPanel>
);

// ================= DOM screens (phone 390 × 843) =================
const ui = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";
const bn = "'Hind Siliguri', Inter, sans-serif";
const cl = (x: number) => Math.max(0, Math.min(1, x));

/** beat 2: mobile-এ সুন্দর দেখানো chamber site */
export const MobileSite: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#FBF8F4", fontFamily: ui, color: "#13253C" }}>
    <StatusBar />
    <div style={{ position: "absolute", top: 64, left: 22, right: 22, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#1B4470" }} />
      <div style={{ fontWeight: 800, fontSize: 24 }}>Dr. Shirin</div>
    </div>
    <div style={{ position: "absolute", top: 128, left: 22, right: 22, height: 230, borderRadius: 26, background: "linear-gradient(150deg,#DCE8F3,#BFD3E6)" }}>
      <div style={{ position: "absolute", left: 24, top: 40, width: 110, height: 110, borderRadius: 55, background: "#fff", opacity: 0.9 }} />
    </div>
    <div style={{ position: "absolute", top: 384, left: 22, right: 22, fontSize: 40, fontWeight: 800, lineHeight: 1.08 }}>Gentle dental care</div>
    <div style={{ position: "absolute", top: 490, left: 22, right: 22, background: "#F5952B", color: "#fff", fontWeight: 800, fontSize: 28, padding: "20px 0", borderRadius: 18, textAlign: "center" }}>Book Serial</div>
    <div style={{ position: "absolute", top: 600, left: 22, right: 22, display: "flex", gap: 12 }}>
      {["Scaling", "Braces"].map((x) => (
        <div key={x} style={{ flex: 1, background: "#fff", borderRadius: 18, padding: "18px 16px", fontWeight: 800, fontSize: 22, boxShadow: "0 4px 14px rgba(20,40,70,0.07)" }}>{x}</div>
      ))}
    </div>
  </div>
);

/** beat 5: serial form → SMS / ভাষা EN↔বাংলা / payment — mode: 0 sms, 1 lang, 2 pay */
export const AddonScreen: React.FC<{ mode: number; booked: number; sms: number; bnK: number; paid: number }> = ({ mode, booked, sms, bnK, paid }) => {
  const layer = (m: number): React.CSSProperties => {
    const o = cl(1 - Math.abs(mode - m) * 1.6);
    return { position: "absolute", inset: 0, opacity: o, display: o <= 0 ? "none" : "block" };
  };
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FBF8F4", fontFamily: ui, color: "#13253C" }}>
      {/* --- SMS --- */}
      <div style={layer(0)}>
        <div style={{ position: "absolute", top: 70, left: 24, right: 24, fontSize: 34, fontWeight: 800 }}>Book a serial</div>
        {[
          ["Name", "Rahima Akter"],
          ["Phone", "01711-245980"],
          ["Time", "Today, 6:30 PM"],
        ].map(([k, v], i) => (
          <div key={k} style={{ position: "absolute", top: 140 + i * 104, left: 24, right: 24 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#6b7785" }}>{k}</div>
            <div style={{ marginTop: 6, background: "#fff", borderRadius: 16, padding: "16px 16px", fontSize: 23, fontWeight: 700, boxShadow: "0 3px 10px rgba(20,40,70,0.07)" }}>{v}</div>
          </div>
        ))}
        <div style={{ position: "absolute", top: 470, left: 24, right: 24, background: booked > 0.5 ? "#1F9D55" : "#F5952B", color: "#fff", fontWeight: 800, fontSize: 27, padding: "20px 0", borderRadius: 18, textAlign: "center", transform: `scale(${1 - 0.06 * Math.sin(Math.PI * cl(booked * 2))})` }}>
          {booked > 0.5 ? "Serial #12 booked" : "Book Serial"}
        </div>
        {/* SMS notification */}
        <div style={{ position: "absolute", left: 14, right: 14, top: 14 + (1 - sms) * -170, opacity: sms, background: "rgba(255,255,255,0.97)", borderRadius: 24, padding: "16px 18px", boxShadow: "0 10px 28px rgba(20,40,70,0.18)", display: "flex", gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: "#2DBE60", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1L4.6 21l4.3-2.3c1 .2 2 .3 3.1.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#6b7785" }}>SMS · Dr. Shirin Dental</div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginTop: 4 }}>Serial #12 confirmed. Today 6:30 PM.</div>
          </div>
        </div>
      </div>
      {/* --- Language --- */}
      <div style={layer(1)}>
        <StatusBar />
        <div style={{ position: "absolute", top: 70, left: 22, right: 22, display: "flex", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 24 }}>Dr. Shirin</div>
          <div style={{ marginLeft: "auto", display: "flex", background: "#EDE6DC", borderRadius: 16, padding: 4 }}>
            {["EN", "বাংলা"].map((x, i) => {
              const on = i === 0 ? 1 - bnK : bnK;
              return (
                <div key={x} style={{ padding: "8px 14px", borderRadius: 12, fontSize: 19, fontWeight: 800, fontFamily: i ? bn : ui, background: `rgba(27,68,112,${on})`, color: on > 0.5 ? "#fff" : "#13253C" }}>{x}</div>
              );
            })}
          </div>
        </div>
        <div style={{ position: "absolute", top: 140, left: 22, right: 22, height: 210, borderRadius: 26, background: "linear-gradient(150deg,#DCE8F3,#BFD3E6)" }} />
        <div style={{ position: "absolute", top: 380, left: 22, right: 22, height: 150 }}>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - bnK, fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>Gentle dental care in Sylhet</div>
          <div style={{ position: "absolute", inset: 0, opacity: bnK, fontSize: 42, fontWeight: 700, lineHeight: 1.25, fontFamily: bn }}>সিলেটে যত্নের সাথে দাঁতের চিকিৎসা</div>
        </div>
        <div style={{ position: "absolute", top: 560, left: 22, right: 22, background: "#F5952B", color: "#fff", fontWeight: 800, fontSize: 28, padding: "20px 0", borderRadius: 18, textAlign: "center" }}>
          <span style={{ opacity: 1 - bnK, position: bnK > 0.5 ? "absolute" : "static", left: 0, right: 0 }}>Book Serial</span>
          <span style={{ opacity: bnK, fontFamily: bn, fontWeight: 700, position: bnK > 0.5 ? "static" : "absolute", left: 0, right: 0 }}>সিরিয়াল নিন</span>
        </div>
      </div>
      {/* --- Payment --- */}
      <div style={layer(2)}>
        <StatusBar />
        <div style={{ position: "absolute", top: 76, left: 24, right: 24, fontSize: 34, fontWeight: 800 }}>Checkout</div>
        <div style={{ position: "absolute", top: 140, left: 24, right: 24, background: "#fff", borderRadius: 20, padding: "20px 20px", boxShadow: "0 4px 14px rgba(20,40,70,0.07)" }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#6b7785" }}>Consultation fee</div>
          <div style={{ fontSize: 50, fontWeight: 800, marginTop: 4 }}>৳ 500</div>
        </div>
        {[
          ["bKash", "#E2136E"],
          ["Nagad", "#F6921E"],
          ["Card", "#1B4470"],
        ].map(([n, c], i) => (
          <div key={n} style={{ position: "absolute", top: 300 + i * 82, left: 24, right: 24, background: "#fff", borderRadius: 16, padding: "16px 18px", fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", gap: 14, border: i === 2 ? `3px solid ${c}` : "3px solid transparent" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: c }} />
            {n}
          </div>
        ))}
        <div style={{ position: "absolute", top: 560, left: 24, right: 24, background: paid > 0.5 ? "#1F9D55" : "#F5952B", color: "#fff", fontWeight: 800, fontSize: 28, padding: "20px 0", borderRadius: 18, textAlign: "center", transform: `scale(${1 - 0.06 * Math.sin(Math.PI * cl(paid * 2))})` }}>
          {paid > 0.5 ? "Paid  ✓" : "Pay now"}
        </div>
      </div>
    </div>
  );
};

/** PageCard-এর মতো, কিন্তু বড় পাঠযোগ্য label (লম্বা নামে আপনা-আপনি ছোট) */
export const LabelPage: React.FC<P & { label: string; accent?: string }> = ({ label, accent = C.steel, ...p }) => {
  const fs = Math.min(0.2, 0.88 / (label.length * 0.66));
  return (
    <SoftPanel w={1.0} h={1.25} thick={0.18} color="#F6F1EA" {...p}>
      <Inset position={[0, 0.27, 0]} w={0.82} h={0.42} color="#ECE6DE" />
      <RaisedBar position={[0, 0.27, -0.004]} w={0.72} h={0.3} d={0.04} radius={0.06} color={accent} />
      <RaisedBar position={[-0.06, -0.08, 0]} w={0.6} h={0.06} d={0.02} color="#d6dce3" />
      <Txt size={fs} color={C.deepNavy} position={[0, -0.36, 0.012]}>{label}</Txt>
    </SoftPanel>
  );
};
