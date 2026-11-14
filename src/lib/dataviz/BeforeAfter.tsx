// Before / after — clay frame (পুরু, bevelled) + নরম base; ভেতরে DOM screen-এ পুরোনো বনাম নতুন website,
// মাঝে slider handle যা spring overshoot নিয়ে সরে। bezel-এ খোদাই BEFORE / AFTER (3D লেখা)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "../../kit/Clay";
import { slabGeo, pillGeo } from "../../kit/Geo";
import { ScreenSpec, toMatrix } from "../../kit/Screens";
import { C } from "../../kit/theme";
import { G, P, Gloss } from "./common";

export const BA = { fw: 4.3, fh: 3.35, sw: 3.8, sh: 2.5, sy: 0.18, thick: 0.32 };
const PX = 912,
  PY = 600; // 3.8 : 2.5 হুবহু (LESSONS E8)

export const BeforeAfterFrame: React.FC<P & { split: number; color?: string }> = ({ split, color = "#F4EDE4", ...p }) => {
  const frame = useMemo(() => slabGeo(BA.fw, BA.fh, BA.thick, 0.34, 0.12, 8), []);
  const bezel = useMemo(() => slabGeo(BA.sw + 0.12, BA.sh + 0.12, 0.04, 0.16, 0.015, 3, false), []);
  const base = useMemo(() => pillGeo(2.4, 1.15, 0.36, 0.14), []);
  return (
    <G {...p}>
      <mesh geometry={base} rotation={[Math.PI / 2, 0, 0]} position={[0, -BA.fh / 2 - 0.08, 0]} castShadow receiveShadow>
        <ClayMat color="#EADFD2" />
      </mesh>
      <group position={[0, 0, 0]}>
        <mesh geometry={frame} castShadow receiveShadow>
          <Gloss color={color} rough={0.6} coat={0.2} />
        </mesh>
        {/* screen-এর চারপাশে কালো সরু bezel (screen-এর ঠিক পিছনে) */}
        <mesh geometry={bezel} position={[0, BA.sy, BA.thick / 2 - 0.03]}>
          <meshPhysicalMaterial color="#14171c" roughness={0.25} clearcoat={0.8} />
        </mesh>
        <Txt size={0.15} color={split > 0.1 ? C.navy : "#9aa5b2"} position={[-BA.sw / 2 + 0.55, -BA.fh / 2 + 0.24, BA.thick / 2 + 0.03]} letterSpacing={0.12}>
          BEFORE
        </Txt>
        <Txt size={0.15} color={split < 0.9 ? C.deepOrange : "#9aa5b2"} position={[BA.sw / 2 - 0.5, -BA.fh / 2 + 0.24, BA.thick / 2 + 0.03]} letterSpacing={0.12}>
          AFTER
        </Txt>
      </group>
    </G>
  );
};

const bn = (s: string) => <span style={{ fontFamily: "'Sabbir Sorolota', 'Hind Siliguri'" }}>{s}</span>;

/** পুরোনো, অগোছালো site (Times, নীল underline link, ভাঙা ছবি, ছোট লেখা) */
export const OldSite: React.FC = () => (
  <div style={{ width: PX, height: PY, background: "#FFFFE8", fontFamily: "'Times New Roman', serif", color: "#000", position: "relative", overflow: "hidden" }}>
    <div style={{ background: "#000080", color: "#FFFF00", fontSize: 30, padding: "10px 18px", fontWeight: 700, fontFamily: "'Hind Siliguri'" }}>রহমান টেইলার্স — স্বাগতম!!!</div>
    <div style={{ fontSize: 19, padding: "8px 18px", color: "#0000EE", textDecoration: "underline", fontFamily: "'Hind Siliguri'" }}>হোম | আমাদের সম্পর্কে | ছবি | যোগাযোগ | গেস্টবুক</div>
    <div style={{ display: "flex", gap: 18, padding: "10px 18px" }}>
      <div style={{ width: 250, height: 190, border: "2px inset #999", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c00" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" stroke="#999" />
          <path d="M8 8l8 8M16 8l-8 8" />
        </svg>
        <div style={{ position: "absolute", bottom: 6, fontSize: 14, color: "#666" }}>image not found</div>
      </div>
      <div style={{ flex: 1, fontSize: 17, lineHeight: 1.35, color: "#333", fontFamily: "'Hind Siliguri'" }}>
        আমাদের দোকানে সব ধরনের পাঞ্জাবি, শার্ট, প্যান্ট সেলাই করা হয়। অর্ডারের জন্য দোকানে আসুন অথবা ফোন করুন। শুক্রবার বন্ধ। দাম দোকানে এসে জানুন।
        <div style={{ marginTop: 10, color: "red", fontWeight: 700, fontSize: 18 }}>*** সাইটটি নির্মাণাধীন ***</div>
      </div>
    </div>
    <table style={{ margin: "6px 18px", borderCollapse: "collapse", fontSize: 16, fontFamily: "'Hind Siliguri'" }}>
      <tbody>
        <tr>
          <td style={{ border: "1px solid #888", padding: "4px 10px" }}>ফোন</td>
          <td style={{ border: "1px solid #888", padding: "4px 10px" }}>{bn("০১৭১১-৪৮২৯১৩")}</td>
        </tr>
        <tr>
          <td style={{ border: "1px solid #888", padding: "4px 10px" }}>ঠিকানা</td>
          <td style={{ border: "1px solid #888", padding: "4px 10px" }}>মিরপুর {bn("১০")}, ঢাকা</td>
        </tr>
      </tbody>
    </table>
    <div style={{ position: "absolute", bottom: 14, left: 18, fontSize: 15, color: "#555" }}>
      Visitors: <span style={{ background: "#000", color: "#0f0", fontFamily: "monospace", padding: "1px 6px" }}>000127</span> &nbsp; Best viewed in Internet Explorer 800x600
    </div>
  </div>
);

const Swatch: React.FC<{ c1: string; c2: string; name: string; price: string }> = ({ c1, c2, name, price }) => (
  <div style={{ flex: 1, background: "#fff", borderRadius: 18, boxShadow: "0 6px 18px rgba(30,40,60,0.10)", overflow: "hidden" }}>
    <div style={{ height: 112, background: `repeating-linear-gradient(45deg, ${c1} 0 6px, ${c2} 6px 12px)` }} />
    <div style={{ padding: "10px 14px" }}>
      <div style={{ fontFamily: "'Hind Siliguri'", fontWeight: 700, fontSize: 22, color: "#14233a" }}>{name}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.deepOrange, fontFamily: "'Hind Siliguri'" }}>৳{bn(price)}</div>
    </div>
  </div>
);

/** নতুন, পরিষ্কার site */
export const NewSite: React.FC = () => (
  <div style={{ width: PX, height: PY, background: "linear-gradient(180deg,#FFF8F1 0%,#FFFFFF 60%)", fontFamily: "'Hind Siliguri', Inter, sans-serif", position: "relative", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", padding: "18px 28px" }}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={C.deepOrange} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
      </svg>
      <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 26, color: "#14233a", marginLeft: 10 }}>Rahman Tailors</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 26, fontSize: 20, color: "#3c4a5e", fontWeight: 600 }}>
        <span>কাপড়</span>
        <span>দাম</span>
        <span>মাপ দিন</span>
      </div>
    </div>
    <div style={{ padding: "8px 28px 0" }}>
      <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.15, color: "#14233a" }}>মাপমতো পাঞ্জাবি, {bn("৭")} দিনে ডেলিভারি</div>
      <div style={{ fontSize: 21, color: "#55627a", marginTop: 6, fontWeight: 600 }}>মিরপুর {bn("১০")} · ঘরে বসে মাপ দিন, বাসায় পৌঁছে যাবে</div>
      <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
        <div style={{ background: C.orange, color: "#fff", fontSize: 22, fontWeight: 700, padding: "12px 26px", borderRadius: 14, boxShadow: "0 8px 18px rgba(245,149,43,0.35)" }}>অর্ডার করুন</div>
        <div style={{ border: "2px solid #14233a", color: "#14233a", fontSize: 22, fontWeight: 700, padding: "10px 24px", borderRadius: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14233a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
          </svg>
          কল করুন
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 18, padding: "22px 28px" }}>
      <Swatch c1="#F3EDE2" c2="#E9E0D1" name="সুতি পাঞ্জাবি" price="২,৪৫০" />
      <Swatch c1="#2E4A6B" c2="#27405D" name="লিনেন শার্ট" price="১,৮৯০" />
      <Swatch c1="#7A3E2E" c2="#6D3628" name="কাবলি সেট" price="৩,২০০" />
    </div>
  </div>
);

const Handle: React.FC<{ x: number }> = ({ x }) => (
  <div style={{ position: "absolute", top: 0, bottom: 0, left: x - 3, width: 6, background: "#fff", boxShadow: "0 0 14px rgba(0,0,0,0.35)" }}>
    <div
      style={{
        position: "absolute",
        top: PY / 2 - 34,
        left: -31,
        width: 68,
        height: 68,
        borderRadius: 34,
        background: "#fff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.deepOrange} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
      </svg>
    </div>
  </div>
);

/** split: 0..1 — বাম থেকে কতটা জুড়ে BEFORE দেখা যায় */
export const BeforeAfterContent: React.FC<{ split: number; before?: React.ReactNode; after?: React.ReactNode }> = ({ split, before = <OldSite />, after = <NewSite /> }) => {
  const x = Math.max(0, Math.min(1, split)) * PX;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0 }}>{after}</div>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${PX - x}px 0 0)` }}>{before}</div>
      <Handle x={x} />
    </div>
  );
};

/** frame-এর world matrix (frame group-এর position/rotation/scale) → DOM ScreenSpec */
export const beforeAfterScreen = (frameMatrix: THREE.Matrix4, split: number, before?: React.ReactNode, after?: React.ReactNode): ScreenSpec => ({
  matrix: frameMatrix.clone().multiply(toMatrix([0, BA.sy, BA.thick / 2 + 0.012])),
  w: BA.sw,
  h: BA.sh,
  px: PX,
  py: PY,
  radius: 14,
  bg: "#fff",
  content: <BeforeAfterContent split={split} before={before} after={after} />,
});
