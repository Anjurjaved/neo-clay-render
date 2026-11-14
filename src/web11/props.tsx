// web11 গল্পের clay prop v2 — সব bevelled soft clay (LESSONS E1: কোনো দৃশ্যমান box/plane নয়)
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, Txt, GlowMat } from "../kit/Clay";
import { slabGeo, pillGeo, roundedCylGeo, latheGeo, shapeGeo, roundedRectPath } from "../kit/Geo";
import { SoftPanel, RaisedBar, Inset, CheckBadge } from "../kit/Soft";
import { C } from "../kit/theme";

export { CheckBadge };
type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);

// ---------- Tooth (molar) ----------
export const Tooth: React.FC<P & { color?: string }> = ({ color = "#FBFAF7", ...p }) => {
  const crown = useMemo(() => latheGeo([[0.0, 0.28], [0.2, 0.3], [0.33, 0.42], [0.36, 0.56], [0.33, 0.7], [0.22, 0.78], [0.0, 0.76]], 48), []);
  const root = useMemo(() => latheGeo([[0.0, 0.0], [0.05, 0.01], [0.09, 0.08], [0.13, 0.22], [0.15, 0.36], [0.0, 0.38]], 32), []);
  const m = <ClayMat color={color} rough={0.42} sheen={0.3} bump={0.06} />;
  return (
    <G {...p}>
      <mesh geometry={crown} castShadow>{m}</mesh>
      {[[-0.13, 0.11], [0.13, 0.11], [-0.13, -0.11], [0.13, -0.11]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.74, z]} castShadow>
          <sphereGeometry args={[0.13, 32, 20]} />
          {m}
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={root} position={[0.14 * s, 0.02, 0]} rotation={[0, 0, -s * 0.14]} castShadow>
          {m}
        </mesh>
      ))}
    </G>
  );
};

// ---------- Map pin ----------
export const MapPin: React.FC<P & { color?: string }> = ({ color = C.orange, ...p }) => {
  const body = useMemo(() => latheGeo([[0.0, 0.0], [0.05, 0.12], [0.16, 0.36], [0.26, 0.58], [0.3, 0.78], [0.26, 0.98], [0.15, 1.08], [0.0, 1.11]], 64), []);
  return (
    <G {...p}>
      <mesh geometry={body} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.5} clearcoatRoughness={0.3} sheen={0.3} sheenColor="#ffe0c0" />
      </mesh>
      <mesh position={[0, 0.8, 0.22]}>
        <sphereGeometry args={[0.1, 32, 20]} />
        <ClayMat color="#FFFFFF" rough={0.5} />
      </mesh>
    </G>
  );
};

// ---------- Calendar ----------
export const Calendar: React.FC<P & { top: string; big: string; nextBig?: string; flip?: number; header?: string; w?: number }> = ({ top, big, nextBig, flip = 0, header = C.orange, w = 1.2, ...p }) => {
  const h = w * 1.05;
  const body = useMemo(() => slabGeo(w, h, 0.26, 0.2, 0.1, 8), [w]);
  const head = useMemo(() => slabGeo(w * 0.98, h * 0.3, 0.28, 0.18, 0.1, 8), [w]);
  const page = useMemo(() => slabGeo(w * 0.86, h * 0.58, 0.03, 0.08, 0.012, 3), [w]);
  const a = Math.min(1, Math.max(0, flip)) * Math.PI;
  return (
    <G {...p}>
      <mesh geometry={body} castShadow receiveShadow><ClayMat color="#F7F2EC" /></mesh>
      <mesh geometry={head} position={[0, h * 0.355, 0.012]} castShadow><ClayMat color={header} rough={0.55} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[w * 0.27 * s, h * 0.53, 0.02]}>
          <capsuleGeometry args={[0.05, 0.16, 8, 16]} />
          <SilverMat color="#dfe2e6" />
        </mesh>
      ))}
      <Txt size={w * 0.15} color="#ffffff" position={[0, h * 0.355, 0.16]}>{top}</Txt>
      {nextBig && <Txt size={w * 0.32} color={C.deepNavy} position={[0, -h * 0.14, 0.15]}>{nextBig}</Txt>}
      <group position={[0, h * 0.17, 0.145]} rotation={[a, 0, 0]}>
        <mesh geometry={page} position={[0, -h * 0.3, 0]}><ClayMat color="#FBF8F4" rough={0.7} /></mesh>
        {a < Math.PI / 2 && <Txt size={w * 0.32} color={C.deepNavy} position={[0, -h * 0.31, 0.02]}>{big}</Txt>}
      </group>
    </G>
  );
};

// ---------- Reception desk + chair ----------
export const Desk: React.FC<P & { w?: number }> = ({ w = 2.4, ...p }) => {
  const top = useMemo(() => slabGeo(w, 0.18, 1.0, 0.09, 0.07, 6), [w]);
  const front = useMemo(() => slabGeo(w * 0.96, 0.9, 0.26, 0.14, 0.09, 7), [w]);
  return (
    <G {...p}>
      <mesh geometry={front} position={[0, 0.45, 0.3]} castShadow receiveShadow><ClayMat color={C.clay} /></mesh>
      <RaisedBar position={[0, 0.6, 0.43]} w={w * 0.7} h={0.07} d={0.03} color={C.orange} />
      <mesh geometry={top} position={[0, 0.98, 0]} castShadow receiveShadow><ClayMat color="#F6F1EA" /></mesh>
    </G>
  );
};

export const Chair: React.FC<P & { spin?: number }> = ({ spin = 0, ...p }) => {
  const seat = useMemo(() => roundedCylGeo(0.36, 0.14, 0.06), []);
  const back = useMemo(() => slabGeo(0.62, 0.62, 0.14, 0.22, 0.06, 6), []);
  return (
    <G {...p}>
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <mesh position={[0.2, 0.07, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.035, 0.36, 8, 12]} />
            <ClayMat color={C.navy} rough={0.55} />
          </mesh>
          <mesh position={[0.38, 0.045, 0]}>
            <sphereGeometry args={[0.045, 16, 12]} />
            <meshStandardMaterial color="#2a2f36" roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.28, 0]}>
        <capsuleGeometry args={[0.035, 0.38, 8, 16]} />
        <SilverMat />
      </mesh>
      <group rotation={[0, spin, 0]}>
        <mesh geometry={seat} position={[0, 0.5, 0]} castShadow><ClayMat color={C.navy} rough={0.6} /></mesh>
        <mesh geometry={back} position={[0, 0.92, -0.3]} rotation={[-0.1, 0, 0]} castShadow><ClayMat color={C.navy} rough={0.6} /></mesh>
      </group>
    </G>
  );
};

/** দাঁড়ানো ছোট sign (desk-এ "ON LEAVE") */
export const StandSign: React.FC<P & { text: string; ink?: string; w?: number }> = ({ text, ink = C.deepOrange, w = 0.9, ...p }) => (
  <SoftPanel w={w} h={w * 0.36} thick={w * 0.1} color="#FBF8F3" {...p}>
    <Txt size={w * 0.14} color={ink} position={[0, -0.005, 0.01]}>{text}</Txt>
  </SoftPanel>
);

// ---------- Coin ----------
export const Coin: React.FC<P> = (p) => {
  const g = useMemo(() => roundedCylGeo(0.36, 0.12, 0.05), []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <meshPhysicalMaterial color="#F2A640" roughness={0.36} metalness={0.25} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.4} sheenColor="#ffe0b0" />
      </mesh>
      <mesh position={[0, 0.062, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.016, 10, 64]} />
        <meshPhysicalMaterial color="#E08E30" roughness={0.4} clearcoat={0.4} />
      </mesh>
    </G>
  );
};

// ---------- Price tag ----------
const tagShape = (w: number, h: number) => {
  const s = new THREE.Shape();
  const r = 0.16, n = h * 0.5;
  s.moveTo(-w / 2 + n, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(w / 2, h / 2 - r);
  s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2, false);
  s.lineTo(-w / 2 + n, h / 2);
  s.quadraticCurveTo(-w / 2 + n * 0.25, h * 0.32, -w / 2, 0.0);
  s.quadraticCurveTo(-w / 2 + n * 0.25, -h * 0.32, -w / 2 + n, -h / 2);
  const hole = new THREE.Path();
  hole.absarc(-w / 2 + n * 0.62, 0, h * 0.09, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
};
export const PriceTag: React.FC<P & { text: string; sub?: string; w?: number; h?: number; color?: string; ink?: string }> = ({ text, sub, w = 2.8, h = 1.0, color = C.orange, ink = "#ffffff", ...p }) => {
  const g = useMemo(() => {
    const geo = shapeGeo(tagShape(w, h), 0.14, 0.08, 7);
    geo.translate(0, 0, -0.07);
    return geo;
  }, [w, h]);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.4} sheen={0.35} sheenColor="#ffe0c0" />
      </mesh>
      <Txt size={h * (sub ? 0.3 : 0.36)} color={ink} position={[h * 0.22, sub ? h * 0.1 : 0, 0.17]}>{text}</Txt>
      {sub && <Txt size={h * 0.15} color={ink} opacity={0.9} position={[h * 0.22, -h * 0.25, 0.17]}>{sub}</Txt>}
    </G>
  );
};

// ---------- Jar (খোলা clay পাত্র; ভেতরে আসল কয়েন জমে) ----------
export const Jar: React.FC<P & { label: string; color: string; loop?: boolean; fill?: number }> = ({ label, color, loop, fill = 0, ...p }) => {
  const outer = useMemo(() => latheGeo([[0.0, 0.0], [0.62, 0.0], [0.74, 0.1], [0.8, 0.5], [0.82, 0.9], [0.86, 0.99], [0.8, 1.04], [0.72, 0.96], [0.68, 0.5], [0.6, 0.14], [0.0, 0.12]], 72), []);
  const n = Math.round(fill * 14);
  return (
    <G {...p}>
      <mesh geometry={outer} castShadow receiveShadow><ClayMat color={color} rough={0.55} /></mesh>
      {Array.from({ length: n }).map((_, i) => {
        const a = i * 2.4, rr = 0.15 + ((i * 37) % 5) * 0.08;
        return <Coin key={i} position={[Math.cos(a) * rr, 0.62 + i * 0.022, Math.sin(a) * rr]} rotation={[0.25 * Math.sin(i), a, 0.3 * Math.cos(i * 1.7)]} scale={0.55} />;
      })}
      <SoftPanel position={[0, 0.5, 0.84]} w={loop ? 1.5 : 1.3} h={0.36} thick={0.1} color="#FBF8F3">
        <Txt size={0.15} color={color} position={[loop ? 0.1 : 0, -0.005, 0.01]}>{label}</Txt>
        {loop && <LoopArrow position={[-0.56, 0, 0.02]} scale={0.13} color={color} />}
      </SoftPanel>
    </G>
  );
};

/** ঘূর্ণি arrow — bevelled extruded shape */
export const LoopArrow: React.FC<P & { color?: string }> = ({ color = C.orange, ...p }) => {
  const g = useMemo(() => {
    const s = new THREE.Shape();
    const R1 = 0.62, R2 = 0.95, a0 = 0.5, a1 = Math.PI * 1.75;
    s.absarc(0, 0, R2, a0, a1, false);
    // arrow head
    const hx = Math.cos(a1), hy = Math.sin(a1);
    s.lineTo(hx * 1.12, hy * 1.12);
    s.lineTo(Math.cos(a1 + 0.5) * 0.78, Math.sin(a1 + 0.5) * 0.78);
    s.lineTo(hx * 0.45, hy * 0.45);
    s.absarc(0, 0, R1, a1, a0, true);
    s.closePath();
    return shapeGeo(s, 0.2, 0.06, 4);
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g}><meshPhysicalMaterial color={color} roughness={0.45} clearcoat={0.3} /></mesh>
    </G>
  );
};

// ---------- Receipt printer ----------
export const ReceiptPrinter: React.FC<P & { out: number; rows: string[] }> = ({ out, rows, ...p }) => {
  const body = useMemo(() => slabGeo(1.5, 0.82, 1.1, 0.26, 0.12, 8), []);
  const L = 2.2 * Math.max(0, Math.min(1, out));
  const paper = useMemo(() => (L > 0.02 ? slabGeo(0.92, L, 0.016, 0.03, 0.006, 2) : null), [L]);
  return (
    <G {...p}>
      <mesh geometry={body} position={[0, 0.41, 0]} castShadow receiveShadow><ClayMat color={C.navy} rough={0.55} /></mesh>
      <RaisedBar position={[0, 0.83, 0.16]} rotation={[-Math.PI / 2, 0, 0]} w={1.02} h={0.1} d={0.02} color="#132842" />
      <mesh position={[0.52, 0.55, 0.555]}>
        <sphereGeometry args={[0.05, 16, 12]} />
        <GlowMat color="#4ade80" intensity={2.4} />
      </mesh>
      {paper && (
        <group position={[0, 0.82, 0.16]} rotation={[-0.18, 0, 0]}>
          <mesh geometry={paper} position={[0, L / 2, 0]} castShadow><meshStandardMaterial color="#FFFFFF" roughness={0.85} /></mesh>
          {rows.map((r, i) => {
            const y = L - 0.28 - i * 0.34;
            if (y < 0.12) return null;
            return (
              <group key={i} position={[0, y, 0.012]}>
                <Txt size={0.1} color="#33404f" bold={false} anchorX="left" position={[-0.38, 0, 0]}>{r}</Txt>
                <RaisedBar position={[0.28, 0, 0]} w={0.2} h={0.04} d={0.006} color="#c9ced6" />
              </group>
            );
          })}
        </group>
      )}
    </G>
  );
};

// ---------- Laptop ----------
export const LAPTOP = { w: 2.6, d: 1.75, lidH: 1.7 };
export const Laptop: React.FC<P & { open: number }> = ({ open, ...p }) => {
  const base = useMemo(() => slabGeo(LAPTOP.w, LAPTOP.d, 0.11, 0.14, 0.045, 6), []);
  const lid = useMemo(() => slabGeo(LAPTOP.w, LAPTOP.lidH, 0.07, 0.12, 0.03, 6), []);
  const glass = useMemo(() => new THREE.ShapeGeometry(roundedRectPath(LAPTOP.w - 0.014, LAPTOP.lidH - 0.014, 0.112) as THREE.Shape, 32), []);
  const th = (1 - open) * (Math.PI / 2) - 0.22 * open;
  return (
    <G {...p}>
      <mesh geometry={base} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]} castShadow receiveShadow><SilverMat color="#d4d8dc" rough={0.46} /></mesh>
      <Inset position={[0, 0.112, 0.2]} rotation={[-Math.PI / 2, 0, 0]} w={LAPTOP.w * 0.84} h={LAPTOP.d * 0.42} color="#cfd3d8" />
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 12 }).map((_, c) => (
          <RaisedBar key={`${r}-${c}`} position={[-LAPTOP.w * 0.39 + c * 0.183, 0.112, -0.08 + r * 0.17]} rotation={[-Math.PI / 2, 0, 0]} w={0.15} h={0.13} d={0.018} radius={0.03} color="#f4f5f7" />
        ))
      )}
      <Inset position={[0, 0.112, 0.66]} rotation={[-Math.PI / 2, 0, 0]} w={0.8} h={0.32} color="#d5d9de" />
      <group position={[0, 0.1, -LAPTOP.d / 2 + 0.04]} rotation={[th, 0, 0]}>
        <mesh geometry={lid} position={[0, LAPTOP.lidH / 2, 0]} castShadow><SilverMat color="#d4d8dc" rough={0.46} /></mesh>
        <mesh geometry={glass} position={[0, LAPTOP.lidH / 2, 0.037]}>
          <meshPhysicalMaterial color="#07080a" roughness={0.05} clearcoat={1} />
        </mesh>
      </group>
    </G>
  );
};
export const laptopScreenMatrix = (pos: [number, number, number], rotY: number, scale: number, open: number) => {
  const th = (1 - open) * (Math.PI / 2) - 0.22 * open;
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)), new THREE.Vector3(scale, scale, scale));
  const hinge = new THREE.Matrix4().compose(new THREE.Vector3(0, 0.1, -LAPTOP.d / 2 + 0.04), new THREE.Quaternion().setFromEuler(new THREE.Euler(th, 0, 0)), new THREE.Vector3(1, 1, 1));
  const local = new THREE.Matrix4().makeTranslation(0, LAPTOP.lidH / 2, 0.045);
  return m.multiply(hinge).multiply(local);
};

// ---------- Browser window (clay) — উঁচু নরম block নিজেকে গড়ে ----------
export const BrowserWin: React.FC<P & { build: number; w?: number; h?: number }> = ({ build, w = 2.2, h = 1.6, ...p }) => {
  const blocks: [number, number, number, number, string][] = [
    [0, 0.25, 0.88, 0.24, C.steel],
    [-0.24, -0.05, 0.38, 0.2, C.orange],
    [0.2, -0.0, 0.42, 0.055, "#d3d9e0"],
    [0.2, -0.1, 0.42, 0.055, "#d3d9e0"],
    [-0.29, -0.33, 0.26, 0.2, "#e4e8ee"],
    [0.0, -0.33, 0.26, 0.2, "#e4e8ee"],
    [0.29, -0.33, 0.26, 0.2, "#e4e8ee"],
  ];
  return (
    <SoftPanel w={w} h={h} thick={0.2} color="#FBF8F4" {...p}>
      <RaisedBar position={[0, h * 0.4, 0]} w={w * 0.92} h={h * 0.11} d={0.03} color="#EEE7DD" />
      {[C.deepOrange, C.orange, C.steel].map((c, i) => (
        <mesh key={i} position={[-w * 0.4 + i * 0.13, h * 0.4, 0.045]}>
          <sphereGeometry args={[0.042, 16, 12]} />
          <ClayMat color={c} rough={0.5} />
        </mesh>
      ))}
      {blocks.map(([x, y, bw, bh, col], i) => {
        const k = Math.max(0, Math.min(1, build * blocks.length - i));
        if (k <= 0.01) return null;
        return <RaisedBar key={i} position={[x * w, y * h, 0.18 * (1 - k)]} scale={0.6 + 0.4 * k} w={bw * w} h={bh * h} d={0.045} radius={Math.min(bw * w, bh * h) * 0.25} color={col} />;
      })}
    </SoftPanel>
  );
};

// ---------- Globe (domain) ----------
export const Globe: React.FC<P> = (p) => (
  <G {...p}>
    <mesh castShadow>
      <sphereGeometry args={[0.5, 64, 40]} />
      <ClayMat color={C.steel} rough={0.5} />
    </mesh>
    {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a, i) => (
      <mesh key={i} rotation={[0, a, 0]}>
        <torusGeometry args={[0.505, 0.02, 10, 72]} />
        <ClayMat color="#e3ebf3" rough={0.5} />
      </mesh>
    ))}
    {[-0.25, 0, 0.25].map((y, i) => (
      <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[Math.sqrt(0.255 - y * y), 0.02, 10, 72]} />
        <ClayMat color="#e3ebf3" rough={0.5} />
      </mesh>
    ))}
  </G>
);

// ---------- Server (hosting) ----------
export const Server: React.FC<P> = (p) => {
  const unit = useMemo(() => slabGeo(1.0, 0.3, 0.8, 0.1, 0.05, 6), []);
  return (
    <G {...p}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.17 + i * 0.33, 0]}>
          <mesh geometry={unit} castShadow receiveShadow><ClayMat color={C.navy} rough={0.55} /></mesh>
          <mesh position={[0.32, 0, 0.405]}>
            <sphereGeometry args={[0.035, 16, 12]} />
            <GlowMat color="#4ade80" intensity={2.5} />
          </mesh>
          {[-0.3, -0.18, -0.06].map((x, j) => (
            <RaisedBar key={j} position={[x, 0, 0.4]} w={0.07} h={0.15} d={0.015} radius={0.03} color="#2a4d78" />
          ))}
        </group>
      ))}
    </G>
  );
};

// ---------- Page card (website page) ----------
export const PageCard: React.FC<P & { label: string; check?: number; accent?: string; dim?: number }> = ({ label, check = 0, accent = C.steel, dim = 0, ...p }) => (
  <SoftPanel w={1.0} h={1.25} thick={0.18} color={dim > 0 ? "#E6E1DA" : "#F6F1EA"} {...p}>
    <Inset position={[0, 0.27, 0]} w={0.82} h={0.42} color="#ECE6DE" />
    <RaisedBar position={[0, 0.27, -0.004]} w={0.72} h={0.3} d={0.04} radius={0.06} color={accent} />
    <RaisedBar position={[-0.06, -0.06, 0]} w={0.6} h={0.06} d={0.02} color="#d6dce3" />
    <RaisedBar position={[-0.14, -0.16, 0]} w={0.44} h={0.06} d={0.02} color="#d6dce3" />
    <Txt size={0.125} color={C.deepNavy} opacity={1 - dim * 0.5} position={[0, -0.39, 0.012]}>{label}</Txt>
    {check > 0 && <CheckBadge position={[0.42, 0.56, 0.04]} scale={0.38 * check} />}
  </SoftPanel>
);

// ---------- Stethoscope ----------
export const Stethoscope: React.FC<P> = (p) => (
  <G {...p}>
    <mesh position={[0, 0.66, 0.07]} rotation={[0.25, 0, 0]}>
      <torusGeometry args={[0.13, 0.018, 12, 48, Math.PI * 1.1]} />
      <meshPhysicalMaterial color={C.deepNavy} roughness={0.4} clearcoat={0.4} />
    </mesh>
    <mesh position={[0.07, 0.5, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
      <capsuleGeometry args={[0.035, 0.02, 8, 16]} />
      <SilverMat />
    </mesh>
  </G>
);
