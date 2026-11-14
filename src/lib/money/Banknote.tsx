// Generic banknote (own design, not a real currency): thick-sheet mesh with vertex bend + travelling flutter,
// printed canvas face/back. NoteBundle: স্তূপ করা নোট + কাগজের band (band নিজেও এক টুকরা sheet)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { G, P, sheetGeo, canvasTex, FONT, useDisposable } from "./common";

export const NOTE = { w: 3.0, h: 1.36, t: 0.014 };

type NoteStyle = { base: string; deep: string; light: string; value: string; words: string };
export const NOTE_STYLES: Record<string, NoteStyle> = {
  green: { base: "#4FA88A", deep: "#1F5E4E", light: "#BFE5D3", value: "500", words: "FIVE HUNDRED" },
  violet: { base: "#8E7CC3", deep: "#3E2F78", light: "#DCD4F2", value: "1000", words: "ONE THOUSAND" },
  orange: { base: "#E99A55", deep: "#8A3F16", light: "#FBE0C4", value: "100", words: "ONE HUNDRED" },
};

const texCache: Record<string, THREE.Texture> = {};
const noteTex = (style: string, side: "front" | "back") => {
  const key = style + side;
  if (texCache[key]) return texCache[key];
  const s = NOTE_STYLES[style] ?? NOTE_STYLES.green;
  const W = 1024,
    H = Math.round((1024 * NOTE.h) / NOTE.w);
  const t = canvasTex(W, H, (g) => {
    const gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, s.light);
    gr.addColorStop(0.45, s.base);
    gr.addColorStop(1, s.light);
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    // guilloche
    g.lineWidth = 1.2;
    g.strokeStyle = s.deep + "55";
    for (let k = 0; k < 26; k++) {
      g.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const y = H * 0.5 + Math.sin(x * 0.012 + k * 0.42) * H * 0.32 * Math.cos(k * 0.21) + Math.sin(x * 0.031 + k) * 10;
        x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    // border frame
    g.strokeStyle = s.deep;
    g.lineWidth = 10;
    g.strokeRect(22, 22, W - 44, H - 44);
    g.lineWidth = 2;
    g.strokeRect(40, 40, W - 80, H - 80);
    if (side === "front") {
      // medallion (rosette) right
      const cx = W * 0.72,
        cy = H * 0.5,
        R = H * 0.3;
      g.fillStyle = s.light + "ee";
      g.beginPath();
      g.ellipse(cx, cy, R * 1.05, R * 1.05, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = s.deep;
      for (let k = 0; k < 36; k++) {
        g.lineWidth = 1.6;
        g.beginPath();
        g.ellipse(cx, cy, R * 0.92, R * 0.38, (k / 36) * Math.PI, 0, Math.PI * 2);
        g.stroke();
      }
      g.fillStyle = s.deep;
      g.beginPath();
      g.arc(cx, cy, R * 0.18, 0, Math.PI * 2);
      g.fill();
      // value
      g.fillStyle = s.deep;
      g.font = FONT(800, H * 0.34);
      g.textBaseline = "middle";
      g.fillText(s.value, 80, H * 0.44);
      g.font = FONT(800, H * 0.085);
      g.fillText(s.words, 84, H * 0.74);
      g.font = FONT(800, H * 0.11);
      g.textAlign = "right";
      g.fillText("৳ " + s.value, W - 70, H * 0.17);
      g.textAlign = "left";
      // security thread
      const th = g.createLinearGradient(W * 0.5, 0, W * 0.53, 0);
      th.addColorStop(0, "#d9dde2");
      th.addColorStop(0.5, "#ffffff");
      th.addColorStop(1, "#9aa3ad");
      g.fillStyle = th;
      g.fillRect(W * 0.505, 30, 16, H - 60);
      // serial
      g.fillStyle = "#B2402A";
      g.font = FONT(700, H * 0.06);
      g.fillText("KA 4521087", 84, H * 0.15);
    } else {
      g.fillStyle = s.deep;
      g.font = FONT(800, H * 0.42);
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(s.value, W * 0.5, H * 0.5);
      g.font = FONT(800, H * 0.08);
      g.fillText(s.words, W * 0.5, H * 0.82);
    }
  });
  texCache[key] = t;
  return t;
};

/** bend = total curl across length (rad, +z দিকে), flutter = amplitude, phase = travelling wave phase, lift = কোণ ওঠা */
export const noteDeform = (bend: number, flutter: number, phase: number, lift = 0) => (x: number, y: number): [number, number, number] => {
  const w = NOTE.w;
  let px = x,
    pz = 0;
  if (Math.abs(bend) > 1e-4) {
    const R = w / bend;
    px = R * Math.sin(x / R);
    pz = R * (1 - Math.cos(x / R));
  }
  const free = x / w + 0.5; // 0 = left edge (held), 1 = free end
  pz += flutter * Math.sin(x * 2.4 - phase) * (0.25 + 0.75 * free) + flutter * 0.35 * Math.sin(y * 3.1 + phase * 0.7) * free;
  pz += lift * free * free * (0.6 + 0.4 * (y / NOTE.h + 0.5));
  return [px, y, pz];
};

export const Banknote: React.FC<P & { style?: keyof typeof NOTE_STYLES | string; bend?: number; flutter?: number; phase?: number; lift?: number; seg?: number }> = ({
  style = "green",
  bend = 0,
  flutter = 0,
  phase = 0,
  lift = 0,
  seg = 40,
  ...p
}) => {
  const flat = bend === 0 && flutter === 0 && lift === 0;
  const g = useDisposable(
    () => sheetGeo({ w: NOTE.w, h: NOTE.h, t: NOTE.t, r: 0.03, nx: flat ? 8 : seg, ny: flat ? 4 : Math.round(seg / 2.2), edge: 3, deform: flat ? undefined : noteDeform(bend, flutter, phase, lift) }),
    [bend, flutter, phase, lift, flat, seg]
  );
  const front = noteTex(style, "front"),
    back = noteTex(style, "back");
  const edge = NOTE_STYLES[style]?.light ?? "#dfeee6";
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <meshPhysicalMaterial attach="material-0" map={front} roughness={0.72} sheen={0.3} sheenColor="#ffffff" />
        <meshPhysicalMaterial attach="material-1" map={back} roughness={0.75} sheen={0.3} sheenColor="#ffffff" />
        <meshStandardMaterial attach="material-2" color={edge} roughness={0.8} />
      </mesh>
    </G>
  );
};

/** কাগজের band যা নোটের গোছার মাঝখানে পেঁচানো (z-y cross-section rounded rect) */
const bandGeo = (depth: number, height: number, bw: number) => {
  const r = Math.min(height / 2, 0.05);
  const a = depth / 2,
    b = height / 2;
  // perimeter param around rounded rect in (z, y)
  const segs: { len: number; at: (u: number) => [number, number] }[] = [];
  const line = (p0: [number, number], p1: [number, number]) => segs.push({ len: Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), at: (u) => [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u] });
  const arc = (cz: number, cy: number, a0: number) => segs.push({ len: (Math.PI / 2) * r, at: (u) => [cz + Math.cos(a0 + u * (Math.PI / 2)) * r, cy + Math.sin(a0 + u * (Math.PI / 2)) * r] });
  line([a - r, b], [-a + r, b]);
  arc(-a + r, b - r, Math.PI / 2);
  line([-a, b - r], [-a, -b + r]);
  arc(-a + r, -b + r, Math.PI);
  line([-a + r, -b], [a - r, -b]);
  arc(a - r, -b + r, Math.PI * 1.5);
  line([a, -b + r], [a, b - r]);
  arc(a - r, b - r, 0);
  const total = segs.reduce((s, q) => s + q.len, 0);
  const at = (s: number): [number, number] => {
    let d = ((s % total) + total) % total;
    for (const q of segs) {
      if (d <= q.len) return q.at(d / q.len);
      d -= q.len;
    }
    return segs[0].at(0);
  };
  return sheetGeo({
    w: bw,
    h: total * 0.995,
    t: 0.012,
    r: 0.006,
    nx: 6,
    ny: 120,
    edge: 3,
    deform: (x, y) => {
      const [z, yy] = at(y + total / 2);
      return [x, yy, z];
    },
  });
};

/** নোটের গোছা: flat, front উপরে; count নোট; band = বেল্ট */
export const NoteBundle: React.FC<P & { count?: number; style?: string; band?: boolean; top?: number }> = ({ count = 14, style = "green", band = true, top, ...p }) => {
  const gap = NOTE.t * 1.25;
  const H = count * gap;
  const bg = useMemo(() => bandGeo(NOTE.h + 0.035, H + 0.02, 0.42), [H]);
  const n = top ?? count;
  return (
    <G {...p}>
      {Array.from({ length: n }).map((_, i) => {
        const j = Math.sin(i * 12.9898) * 0.5;
        return <Banknote key={i} style={style} position={[j * 0.04, gap / 2 + i * gap, Math.cos(i * 4.1) * 0.015]} rotation={[-Math.PI / 2, 0, j * 0.025]} />;
      })}
      {band && (
        <mesh geometry={bg} position={[0.25, H / 2 + 0.01, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial attach="material-0" color="#F4EEE2" roughness={0.7} sheen={0.4} sheenColor="#ffffff" />
          <meshPhysicalMaterial attach="material-1" color="#E9E0D0" roughness={0.75} />
          <meshStandardMaterial attach="material-2" color="#EDE5D6" roughness={0.8} />
        </mesh>
      )}
    </G>
  );
};
