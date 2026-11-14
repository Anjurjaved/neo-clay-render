// wd004 S08 (cta) — নতুন prop: ActionChip (CALL/WHATSAPP/phone pill), Notepad, Pencil, MapTile, CtaSite (laptop DOM)
import React, { useMemo } from "react";
import * as THREE from "three";
import { Img, staticFile } from "remotion";
import { ClayMat, Txt } from "../../kit/Clay";
import { roundedCylGeo, latheGeo, shapeGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar, Inset } from "../../kit/Soft";
import { Tag } from "../../kit/Clock";
import { StatusBar } from "../../kit/Device";
import { MapPin } from "../../web11/props";
import { C } from "../../kit/theme";
import { springStep } from "../../kit/anim";
import { LOGO_SRC } from "../../kit/Logo";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

// ---------- handset icon (bevelled extruded banana-shape, গোল মাথা) — width ≈ 1 ----------
const handsetShape = () => {
  const s = new THREE.Shape();
  const R = 0.5,
    r = 0.27,
    a0 = Math.PI * 0.62,
    a1 = Math.PI * 1.38;
  const cap = (R - r) / 2,
    mid = (R + r) / 2;
  s.absarc(0, 0, R, a0, a1, false);
  s.absarc(Math.cos(a1) * mid, Math.sin(a1) * mid, cap * 1.25, a1 + Math.PI, a1, true);
  s.absarc(0, 0, r, a1, a0, true);
  s.absarc(Math.cos(a0) * mid, Math.sin(a0) * mid, cap * 1.25, a0 + Math.PI, a0 + Math.PI * 2, true);
  s.closePath();
  return s;
};
export const Handset: React.FC<P & { color?: string }> = ({ color = "#ffffff", ...p }) => {
  const g = useMemo(() => {
    const geo = shapeGeo(handsetShape(), 0.08, 0.03, 3);
    geo.translate(0.14, 0, -0.04);
    return geo;
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.4} />
      </mesh>
    </G>
  );
};

// ---------- ActionChip: পুরু রঙিন বালিশ-বোতাম, বাঁয়ে সাদা গম্বুজে icon, ডানে label ----------
export const ActionChip: React.FC<P & { label: string; color: string; w?: number; h?: number; size?: number; icon?: "phone" | "chat" }> = ({ label, color, w = 2.4, h = 0.74, size, icon = "phone", ...p }) => {
  const disc = useMemo(() => roundedCylGeo(0.5, 0.22, 0.1), []);
  const bubble = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0.04, 0.34, -Math.PI * 0.62, Math.PI * 1.36, false);
    s.lineTo(-0.3, -0.36);
    s.closePath();
    return shapeGeo(s, 0.06, 0.03, 3);
  }, []);
  const d = h * 0.62;
  const fs = size ?? Math.min(h * 0.34, ((w - h) * 0.82) / Math.max(2, label.length * 0.64));
  return (
    <SoftPanel w={w} h={h} thick={h * 0.38} color={color} rough={0.5} {...p}>
      <group position={[-w / 2 + h * 0.52, 0, 0.0]} scale={d}>
        <mesh geometry={disc} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <ClayMat color="#FFFFFF" rough={0.5} sheen={0.3} />
        </mesh>
        {icon === "phone" ? (
          <Handset color={color} position={[0, 0, 0.12]} scale={0.62} />
        ) : (
          <group position={[0, 0, 0.1]}>
            <mesh geometry={bubble} castShadow>
              <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.4} />
            </mesh>
            <Handset color="#ffffff" position={[0, 0.04, 0.09]} scale={0.34} />
          </group>
        )}
      </group>
      <Txt size={fs} color="#ffffff" position={[h * 0.3, -fs * 0.03, 0.012]}>
        {label}
      </Txt>
    </SoftPanel>
  );
};

// ---------- Pencil (lathe, গোল ডগা — চোখা cone নয়) — দৈর্ঘ্য ≈ 1.6, ডগা y=0 ----------
export const Pencil: React.FC<P> = (p) => {
  const tip = useMemo(() => latheGeo([[0.0, 0.0], [0.022, 0.012], [0.05, 0.07], [0.075, 0.16], [0.09, 0.24], [0.0, 0.24]], 32), []);
  const body = useMemo(() => roundedCylGeo(0.09, 1.1, 0.02, 32), []);
  const band = useMemo(() => roundedCylGeo(0.094, 0.1, 0.02, 32), []);
  return (
    <G {...p}>
      <mesh geometry={tip} castShadow>
        <ClayMat color="#F1D7B6" rough={0.6} />
      </mesh>
      <mesh position={[0, 0.03, 0]} scale={0.32}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <ClayMat color={C.deepNavy} rough={0.5} />
      </mesh>
      <mesh geometry={body} position={[0, 0.24 + 0.55, 0]} castShadow>
        <ClayMat color={C.orange} rough={0.5} />
      </mesh>
      <mesh geometry={band} position={[0, 1.39, 0]} castShadow>
        <meshPhysicalMaterial color="#cfd5da" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.47, 0]} castShadow>
        <capsuleGeometry args={[0.088, 0.06, 8, 16]} />
        <ClayMat color="#E98A86" rough={0.6} />
      </mesh>
    </G>
  );
};

// ---------- Notepad: পুরু cream বালিশ, উপরে orange header + spiral ring, ruled lines, per-slot digits ----------
export const NOTE = { w: 4.4, h: 2.3 };
export const noteSlotX = (i: number, n: number, cw: number) => -((n - 1) * cw) / 2 + i * cw;
export const Notepad: React.FC<P & { chars: string[]; shown: number[]; title?: string; size?: number }> = ({ chars, shown, title = "CALL BACK", size = 0.5, ...p }) => {
  const { w, h } = NOTE;
  const cw = size * 0.66;
  return (
    <SoftPanel w={w} h={h} thick={0.3} color="#FBF7F0" {...p}>
      <RaisedBar position={[0, h * 0.34, 0]} w={w * 0.92} h={h * 0.2} d={0.06} radius={h * 0.07} color={C.orange} />
      <Txt size={h * 0.1} color="#ffffff" position={[0, h * 0.34, 0.075]} letterSpacing={0.08}>
        {title}
      </Txt>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-w * 0.36 + i * w * 0.12, h * 0.5, 0.0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.09, 0.028, 10, 32]} />
          <meshPhysicalMaterial color="#cfd5da" metalness={0.55} roughness={0.38} />
        </mesh>
      ))}
      {[-0.16, -0.38].map((y, i) => (
        <RaisedBar key={i} position={[0, y * h, -0.008]} w={w * 0.86} h={0.026} d={0.012} color="#DCE5EE" />
      ))}
      {chars.map((ch, i) => {
        const k = shown[i] ?? 0;
        if (k <= 0.001) return null;
        return (
          <group key={i} position={[noteSlotX(i, chars.length, cw), -h * 0.06, 0.03]} scale={k}>
            <Txt size={size} color={C.deepNavy}>
              {ch}
            </Txt>
          </group>
        );
      })}
    </SoftPanel>
  );
};

// ---------- MapTile: হেলানো নরম map tile; pins world-upright; বাঁকা dashed arc ----------
export const MAP = { w: 3.6, h: 2.7, tilt: -0.62 };
const DHAKA: [number, number] = [-0.62, -0.5];
const SYLHET: [number, number] = [0.95, 0.42];
export const MapTile: React.FC<P & { t: number; dhakaAt: number; dhakaTagAt: number; arc: number; sylhetAt: number; sylhetTagAt: number }> = ({ t, dhakaAt, dhakaTagAt, arc, sylhetAt, sylhetTagAt, ...p }) => {
  const { w, h, tilt } = MAP;
  const up: [number, number, number] = [-tilt, 0, 0]; // tile-এর ভেতরে world-upright
  const pin = (at: number, xy: [number, number], col: string) => {
    if (t < at) return null;
    const k = springStep(t - at, { k: 170, c: 12 });
    return (
      <group position={[xy[0], xy[1], 0.02]} rotation={up}>
        <MapPin position={[0, (1 - k) * 2.2, 0]} scale={0.62 * Math.min(1, 0.3 + k)} color={col} />
      </group>
    );
  };
  const tag = (at: number, xy: [number, number], text: string, col: string, dx: number) => {
    if (t < at) return null;
    const k = Math.min(1.15, springStep(t - at, { k: 230, c: 15 }));
    return (
      <group position={[xy[0] + dx, xy[1], 0.02]} rotation={up}>
        <Tag text={text} position={[0, 0.98, 0.05]} scale={k} size={0.24} h={0.44} color={col} />
      </group>
    );
  };
  // arc: Dhaka → Sylhet, tile-এর তল থেকে উঁচু হয়ে বাঁকা (normal দিকে)
  const N = 15;
  const dots = Array.from({ length: N }).map((_, i) => {
    const u = (i + 0.5) / N;
    const x = DHAKA[0] + (SYLHET[0] - DHAKA[0]) * u - Math.sin(Math.PI * u) * 0.18;
    const y = DHAKA[1] + (SYLHET[1] - DHAKA[1]) * u + Math.sin(Math.PI * u) * 0.34;
    const z = 0.08 + Math.sin(Math.PI * u) * 0.55;
    const k = Math.max(0, Math.min(1, arc * N - i));
    return { x, y, z, k };
  });
  return (
    <SoftPanel w={w} h={h} thick={0.34} color="#F4EEE6" {...p} rotation={[tilt, 0, 0]}>
      <Inset position={[0, 0, 0]} w={w * 0.9} h={h * 0.86} color="#D9E5EF" />
      {/* land mass + rivers (নরম উঁচু clay) */}
      <RaisedBar position={[-0.08, 0.0, -0.004]} w={w * 0.72} h={h * 0.74} d={0.05} radius={h * 0.3} color="#EFE6D6" />
      <RaisedBar position={[0.55, 0.25, 0.0]} w={w * 0.36} h={h * 0.4} d={0.06} radius={h * 0.18} color="#E8DCC7" />
      <RaisedBar position={[-0.2, 0.1, 0.04]} rotation={[0, 0, -0.9]} w={2.0} h={0.07} d={0.02} color="#BFD3E6" />
      <RaisedBar position={[0.25, -0.38, 0.04]} rotation={[0, 0, 0.35]} w={1.5} h={0.06} d={0.02} color="#BFD3E6" />
      {dots.map((d, i) =>
        d.k > 0.01 ? (
          <mesh key={i} position={[d.x, d.y, d.z]} scale={d.k}>
            <sphereGeometry args={[0.055, 18, 12]} />
            <ClayMat color={C.navy} rough={0.5} />
          </mesh>
        ) : null
      )}
      {pin(dhakaAt, DHAKA, C.orange)}
      {pin(sylhetAt, SYLHET, C.deepOrange)}
      {tag(dhakaTagAt, DHAKA, "DHAKA", C.deepNavy, -0.3)}
      {tag(sylhetTagAt, SYLHET, "SYLHET", C.navy, 0.0)}
    </SoftPanel>
  );
};

// ---------- Laptop DOM: browser-এ javeditsolution.com/services/website-development (1024×590) ----------
const ui = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";
const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const CtaSite: React.FC<{ url: string; caret: boolean; load: number; reveal: number }> = ({ url, caret, load, reveal }) => {
  const sec = (i: number) => {
    const k = clamp(reveal * 3 - i);
    return { opacity: k, transform: `translateY(${(1 - k) * 22}px)` };
  };
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FBF8F4", fontFamily: ui, color: "#13253C" }}>
      {/* browser bar */}
      <div style={{ height: 78, background: "#EEE7DD", display: "flex", alignItems: "center", padding: "0 22px", gap: 16 }}>
        <div style={{ display: "flex", gap: 9 }}>
          {["#D85E24", "#F5952B", "#3E6E9E"].map((c) => (
            <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 50, background: "#fff", borderRadius: 25, display: "flex", alignItems: "center", padding: "0 20px", fontSize: 21, fontWeight: 700, color: "#13253C", whiteSpace: "nowrap", overflow: "hidden" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 12, flex: "none" }}>
            <rect x="5" y="10" width="14" height="11" rx="3" fill="#1F9D55" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#1F9D55" strokeWidth="2.6" fill="none" />
          </svg>
          {url ? url : <span style={{ color: "#9aa5b1", fontWeight: 600 }}>Search or type a URL</span>}
          <span style={{ opacity: caret ? 1 : 0, color: "#F5952B", marginLeft: 2 }}>|</span>
        </div>
      </div>
      {/* loading bar */}
      <div style={{ height: 5, width: `${load * 100}%`, background: "#F5952B", opacity: load > 0 && load < 1 ? 1 : 0 }} />
      {reveal > 0 && (
        <div>
          <div style={{ height: 70, display: "flex", alignItems: "center", padding: "0 38px", borderBottom: "1px solid #EEE6DC", ...sec(0) }}>
            <Img src={staticFile(LOGO_SRC)} style={{ width: 44, height: 44, marginRight: 12 }} />
            <div style={{ fontWeight: 800, fontSize: 23 }}>Javed IT Solution</div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 17, fontWeight: 700, color: "#4a5a6c" }}>
              <span>Services</span>
              <span style={{ color: "#D85E24" }}>Website</span>
              <span>Contact</span>
            </div>
          </div>
          <div style={{ padding: "26px 38px 0", ...sec(1) }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#D85E24", letterSpacing: 1.5 }}>SERVICES</div>
            <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.05, marginTop: 6 }}>Website Development</div>
          </div>
          <div style={{ display: "flex", gap: 20, padding: "24px 38px 0", ...sec(2) }}>
            {[
              ["Website", "ONE-TIME", "BDT 15,000 – 30,000", "#1B4470"],
              ["Domain + Hosting", "PER YEAR", "BDT 2,000 – 5,000", "#F5952B"],
            ].map(([a, b, c, col]) => (
              <div key={a} style={{ flex: 1, background: "#fff", borderRadius: 20, padding: "20px 22px", boxShadow: "0 6px 18px rgba(20,40,70,0.08)", borderTop: `7px solid ${col}` }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#7a8694", letterSpacing: 1 }}>{b}</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{a}</div>
                <div style={{ fontSize: 25, fontWeight: 800, marginTop: 8, color: col, whiteSpace: "nowrap" }}>{c}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/** WhatsApp-ধাঁচের chat (S08): JIT contact, নম্বর input বড় */
export const CtaChat: React.FC<{ typed: string; caret: boolean }> = ({ typed, caret }) => (
  <div style={{ position: "absolute", inset: 0, background: "#EFE7DE", fontFamily: ui }}>
    <StatusBar dark />
    <div style={{ height: 150, background: "#1F9D55", color: "#fff", display: "flex", alignItems: "flex-end", padding: "0 20px 18px", gap: 14 }}>
      <div style={{ width: 54, height: 54, borderRadius: 27, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <Img src={staticFile(LOGO_SRC)} style={{ width: 42, height: 42 }} />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 25 }}>Javed IT Solution</div>
        <div style={{ fontSize: 16, opacity: 0.9 }}>online</div>
      </div>
    </div>
    <div style={{ padding: "26px 18px" }}>
      <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "16px 18px", fontSize: 24, fontWeight: 600, color: "#1d2733", maxWidth: 310, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
        Hi! How many pages do you need?
      </div>
    </div>
    <div style={{ position: "absolute", left: 18, right: 18, bottom: 150 }}>
      <div style={{ fontSize: 17, color: "#1F9D55", fontWeight: 800, marginBottom: 10, letterSpacing: 1 }}>CALL / WHATSAPP</div>
      <div style={{ background: "#fff", borderRadius: 20, padding: "20px 18px", fontSize: 42, fontWeight: 800, color: "#13253C", letterSpacing: 1, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", minHeight: 50, whiteSpace: "nowrap" }}>
        {typed}
        <span style={{ opacity: caret ? 1 : 0, color: "#1F9D55" }}>|</span>
      </div>
    </div>
  </div>
);
