// Thermal receipt printer with REAL paper motion:
//  • platen roller + side feed knob turn exactly with the fed length (angle = L / r)
//  • paper is a thick-sheet mesh whose centre-line is solved every frame (curl memory + self-weight bending,
//    a small elastica) → it rises from the slot, arches back, cups across its width, flutters with a travelling wave
//  • feed is stepwise (one burst per printed line) — each burst gives a tiny jerk
//  • the print is a canvas texture: rows fade in (thermal darkening) exactly as they cross the print head
//  • `tear` (0→1) rips the slip off: jerk, lift, swing away
// local floor = y 0; footprint ≈ 2.1 × 1.7; slot at (0, PR.slotY, PR.slotZ)
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, GlowMat, Txt } from "../../kit/Clay";
import { slabGeo, roundedCylGeo, pillGeo } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { G, P, sheetGeo, canvasTex, FONT, useDisposable, k01 } from "./common";

export const PR = { w: 2.1, h: 1.2, d: 1.7, slotY: 1.16, slotZ: 0.3, paperW: 1.2, roller: 0.085, knobR: 0.3 };

export type ReceiptRow = { label: string; amount: string };
export type ReceiptData = { title: string; sub?: string; rows: ReceiptRow[]; total: string; footer?: string; stamp?: string; barcode?: boolean };
export const DEFAULT_RECEIPT: ReceiptData = {
  title: "JAVED IT SOLUTION",
  sub: "Website package · Dhaka",
  rows: [
    { label: "Domain .com", amount: "৳1,200" },
    { label: "Hosting 1 yr", amount: "৳3,000" },
    { label: "Design + build", amount: "৳9,300" },
    { label: "SEO setup", amount: "৳1,500" },
  ],
  total: "৳15,000",
  footer: "Thank you",
  stamp: "PAID",
};

/** receipt length (world) for the texture/layout */
export const receiptLength = (d: ReceiptData) => 1.25 + d.rows.length * 0.26 + 0.95;

// canvas layout in world units → px
export const PXU = 420; // px per world unit
export const drawReceipt = (g: CanvasRenderingContext2D, d: ReceiptData, Lfull: number, printed: number) => {
  const W = Math.round(PR.paperW * PXU);
  const H = Math.round(Lfull * PXU);
  g.fillStyle = "#FFFEFA";
  g.fillRect(0, 0, W, H);
  // ink alpha for a row whose top is at world distance y (from the tip)
  const ink = (y: number) => k01((printed - y) / 0.14);
  const ccol = (a: number) => `rgba(34,40,52,${a})`;
  const u = (x: number) => x * PXU;
  let y = 0.16;
  const line = (yy: number, a: number) => {
    g.strokeStyle = ccol(0.55 * a);
    g.lineWidth = 3;
    g.setLineDash([10, 8]);
    g.beginPath();
    g.moveTo(u(0.08), u(yy));
    g.lineTo(W - u(0.08), u(yy));
    g.stroke();
    g.setLineDash([]);
  };
  g.textBaseline = "middle";
  // header mark: soft circle + check
  let a = ink(y);
  g.fillStyle = ccol(a);
  g.beginPath();
  g.arc(W / 2, u(y + 0.1), u(0.09), 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = `rgba(255,254,250,${a})`;
  g.lineWidth = 7;
  g.beginPath();
  g.moveTo(W / 2 - u(0.04), u(y + 0.1));
  g.lineTo(W / 2 - u(0.008), u(y + 0.135));
  g.lineTo(W / 2 + u(0.045), u(y + 0.065));
  g.stroke();
  y += 0.3;
  a = ink(y);
  g.fillStyle = ccol(a);
  g.textAlign = "center";
  g.font = FONT(800, u(0.105));
  g.fillText(d.title, W / 2, u(y));
  y += 0.15;
  if (d.sub) {
    a = ink(y);
    g.fillStyle = ccol(0.75 * a);
    g.font = FONT(700, u(0.072));
    g.fillText(d.sub, W / 2, u(y));
  }
  y += 0.14;
  line(y, ink(y));
  y += 0.16;
  g.textAlign = "left";
  for (const r of d.rows) {
    a = ink(y);
    g.fillStyle = ccol(a);
    g.font = FONT(700, u(0.08));
    g.textAlign = "left";
    g.fillText(r.label, u(0.1), u(y));
    g.textAlign = "right";
    g.font = FONT(800, u(0.08));
    g.fillText(r.amount, W - u(0.1), u(y));
    y += 0.26;
  }
  y -= 0.08;
  line(y, ink(y));
  y += 0.2;
  a = ink(y);
  g.fillStyle = ccol(a);
  g.textAlign = "left";
  g.font = FONT(800, u(0.1));
  g.fillText("TOTAL", u(0.1), u(y));
  g.textAlign = "right";
  g.font = FONT(800, u(0.125));
  g.fillText(d.total, W - u(0.1), u(y));
  y += 0.24;
  // barcode
  if (d.barcode !== false) {
  a = ink(y);
  g.fillStyle = ccol(a);
  let x = u(0.16);
  let s = 11;
  while (x < W - u(0.16)) {
    s = (s * 16807) % 2147483647;
    const bw = 2 + (s % 4) * 2;
    g.fillRect(x, u(y), bw, u(0.2));
    x += bw + 3 + ((s >> 3) % 3) * 2;
  }
  }
  y += 0.36;
  if (d.footer) {
    a = ink(y);
    g.fillStyle = ccol(0.8 * a);
    g.textAlign = "center";
    g.font = FONT(700, u(0.08));
    g.fillText(d.footer, W / 2, u(y));
  }
};

/** paper centre-line: s ∈ [0, L] from the slot. returns points (y up, z back = -) and angle */
const solvePaper = (L: number, time: number, jerk: number) => {
  const N = 90;
  const ds = L / N;
  const phi = new Float64Array(N + 1);
  const yb = new Float64Array(N + 1);
  const zb = new Float64Array(N + 1); // + = backwards
  const c0 = 0.3; // roll-curl memory (rad / unit)
  const Gk = 0.1; // self-weight bending
  const phi0 = -0.16 + jerk * 0.05;
  const integrate = (kap: (i: number) => number) => {
    phi[0] = phi0;
    yb[0] = 0;
    zb[0] = 0;
    for (let i = 1; i <= N; i++) {
      phi[i] = phi[i - 1] + kap(i - 1) * ds;
      const pm = (phi[i] + phi[i - 1]) / 2;
      yb[i] = yb[i - 1] + Math.cos(pm) * ds;
      zb[i] = zb[i - 1] + Math.sin(pm) * ds;
    }
  };
  integrate(() => c0);
  for (let it = 0; it < 5; it++) {
    const M = new Float64Array(N + 1);
    for (let i = 0; i <= N; i++) {
      let m = 0;
      for (let k = i + 1; k <= N; k++) m += (zb[k] - zb[i]) * ds;
      M[i] = m;
    }
    integrate((i) => {
      const sr = (i * ds) / Math.max(L, 0.001);
      const flutter = 0.16 * Math.sin(2 * Math.PI * 1.15 * time - i * ds * 2.6) * sr + 0.07 * Math.sin(2 * Math.PI * 2.3 * time + i * ds * 1.7) * sr * sr;
      return c0 + Gk * M[i] + flutter + jerk * 0.5 * sr;
    });
  }
  return { N, ds, phi, yb, zb };
};

/**
 * ReceiptPrinter
 *  fed   = world length of paper out of the slot (0 … receiptLength(data))
 *  time  = seconds (for flutter only)
 *  jerk  = feed impulse (0..1, decays) — caller passes from feed bursts
 *  tear  = 0 … 1 (rip off & lift)
 */
export const ReceiptPrinter: React.FC<P & { fed: number; time: number; jerk?: number; tear?: number; data?: ReceiptData; body?: string; lid?: string }> = ({
  fed,
  time,
  jerk = 0,
  tear = 0,
  data = DEFAULT_RECEIPT,
  body = C.navy,
  lid = "#F4EEE6",
  ...p
}) => {
  const Lfull = receiptLength(data);
  const L = Math.max(0.001, Math.min(Lfull, fed));
  const hidden = 0.14; // paper still inside the slot
  const bodyG = useMemo(() => slabGeo(PR.w, PR.h, PR.d, 0.36, 0.26, 8), []);
  const lidG = useMemo(() => slabGeo(1.86, 0.98, 0.16, 0.3, 0.07, 6), []);
  const slitG = useMemo(() => slabGeo(1.62, 0.2, 0.06, 0.08, 0.025, 4), []);
  const barG = useMemo(() => slabGeo(1.72, 0.11, 0.06, 0.04, 0.02, 4), []);
  const tooth = useMemo(() => new THREE.SphereGeometry(0.026, 12, 8), []);
  const btnG = useMemo(() => pillGeo(0.36, 0.16, 0.07, 0.03), []);
  const footG = useMemo(() => roundedCylGeo(0.12, 0.06, 0.025, 32), []);
  const rollerG = useMemo(() => {
    const g = roundedCylGeo(PR.roller, 1.56, 0.03, 96);
    const pa = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i),
        z = pa.getZ(i);
      const r = Math.hypot(x, z);
      if (r > PR.roller * 0.8) {
        const k = 1 - 0.07 * (0.5 + 0.5 * Math.cos(Math.atan2(z, x) * 16));
        pa.setX(i, x * k);
        pa.setZ(i, z * k);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const knobG = useMemo(() => {
    const g = roundedCylGeo(PR.knobR, 0.13, 0.05, 160);
    const pa = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i),
        z = pa.getZ(i);
      const r = Math.hypot(x, z);
      if (r > PR.knobR * 0.86) {
        const k = 1 - 0.06 * Math.pow(0.5 + 0.5 * Math.cos(Math.atan2(z, x) * 14), 3);
        pa.setX(i, x * k);
        pa.setZ(i, z * k);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const dotG = useMemo(() => roundedCylGeo(0.05, 0.03, 0.012, 24), []);

  // ---- paper ----
  const tearK = k01(tear);
  const sol = useMemo(() => solvePaper(L + hidden * 0, time, jerk), [L, time, jerk]);
  const printedTex = useDisposable(
    () =>
      canvasTex(Math.round(PR.paperW * PXU), Math.round(Lfull * PXU), (g) => drawReceipt(g, data, Lfull, L)),
    [Math.round(L * 400), data, Lfull]
  );
  const paperG = useDisposable(() => {
    const total = L + hidden;
    const at = (s: number) => {
      // s from -hidden (inside) to L
      if (s <= 0) return { y: s, z: 0, phi: sol.phi[0] };
      const f = Math.min(sol.N - 1e-6, s / sol.ds);
      const i = Math.floor(f),
        k = f - i;
      return { y: sol.yb[i] + (sol.yb[i + 1] - sol.yb[i]) * k, z: -(sol.zb[i] + (sol.zb[i + 1] - sol.zb[i]) * k), phi: sol.phi[i] + (sol.phi[i + 1] - sol.phi[i]) * k };
    };
    return sheetGeo({
      w: PR.paperW,
      h: total,
      t: 0.012,
      r: 0.012,
      nx: 14,
      ny: Math.max(8, Math.round(total * 34)),
      edge: 3,
      deform: (x, y) => {
        const s = y + total / 2 - hidden;
        const c = at(s);
        const sr = k01(s / Math.max(0.3, L));
        // normal of centre-line (front side): (0, sin φ, cos φ)
        const ny = Math.sin(c.phi),
          nz = Math.cos(c.phi);
        const cup = 0.1 * (x * x - (PR.paperW * PR.paperW) / 12) * sr;
        const tw = x * sr * (0.05 * Math.sin(2 * Math.PI * 0.9 * time + s * 1.4) + 0.03 * Math.sin(2 * Math.PI * 1.9 * time - s));
        const off = cup + tw;
        return [x, c.y + ny * off, c.z + nz * off];
      },
      uv: (u, v) => {
        const dTip = (1 - v) * total; // world distance from the tip
        return [u, 1 - dTip / Lfull];
      },
    });
  }, [sol, L, Lfull, time]);

  const knobA = -fed / PR.knobR * 0.55;
  const rollA = -fed / PR.roller;
  // tear: slip lifts & swings off; stub stays
  const tearPos: [number, number, number] = [0.25 * tearK, 0.75 * tearK, 0.45 * tearK];
  const tearRot: [number, number, number] = [-0.12 * tearK, 0.12 * tearK, -0.1 * tearK];
  const H = PR.h;
  return (
    <G {...p}>
      {/* body */}
      <mesh geometry={bodyG} position={[0, H / 2, 0]} castShadow receiveShadow>
        <ClayMat color={body} rough={0.5} sheen={0.4} />
      </mesh>
      {/* feet */}
      {[
        [-0.75, -0.55],
        [0.75, -0.55],
        [-0.75, 0.55],
        [0.75, 0.55],
      ].map(([x, z], i) => (
        <mesh key={i} geometry={footG} position={[x, 0.03, z]}>
          <meshStandardMaterial color="#1a2230" roughness={0.9} />
        </mesh>
      ))}
      {/* paper-roll lid (cream) */}
      <mesh geometry={lidG} rotation={[-Math.PI / 2, 0, 0]} position={[0, H - 0.02, -0.28]} castShadow receiveShadow>
        <ClayMat color={lid} rough={0.55} />
      </mesh>
      {/* dark slit behind the paper */}
      <mesh geometry={slitG} rotation={[-Math.PI / 2, 0, 0]} position={[0, H - 0.015, PR.slotZ + 0.01]}>
        <meshStandardMaterial color="#121a26" roughness={0.6} />
      </mesh>
      {/* platen roller (turns with feed) */}
      <group position={[0, PR.slotY - 0.03, PR.slotZ + 0.06]} rotation={[rollA, 0, Math.PI / 2]}>
        <mesh geometry={rollerG}>
          <meshPhysicalMaterial color="#2a313c" roughness={0.55} clearcoat={0.2} />
        </mesh>
      </group>
      {/* serrated silver tear bar */}
      <mesh geometry={barG} rotation={[-Math.PI / 2, 0, 0]} position={[0, H + 0.0, PR.slotZ + 0.2]} castShadow>
        <SilverMat color="#dfe3e8" rough={0.32} />
      </mesh>
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={i} geometry={tooth} position={[-0.8 + (i / 29) * 1.6, H + 0.012, PR.slotZ + 0.135]} scale={[1, 0.6, 1.2]}>
          <SilverMat color="#dfe3e8" rough={0.32} />
        </mesh>
      ))}
      {/* front: LED + FEED button + name */}
      <mesh position={[0.66, H * 0.62, PR.d / 2 - 0.005]}>
        <sphereGeometry args={[0.045, 20, 14]} />
        <GlowMat color="#4ade80" intensity={2.6} />
      </mesh>
      <mesh geometry={btnG} position={[0.66, H * 0.4, PR.d / 2 - 0.01]} castShadow>
        <ClayMat color={lid} rough={0.5} />
      </mesh>
      <Txt size={0.07} color={C.navy} position={[0.66, H * 0.4, PR.d / 2 + 0.035]}>
        FEED
      </Txt>
      <Txt size={0.13} color={lid} position={[-0.42, H * 0.5, PR.d / 2 + 0.005]} anchorX="center">
        POS 80
      </Txt>
      {/* side feed knob (turns) */}
      <group position={[PR.w / 2 + 0.02, H * 0.55, -0.15]} rotation={[knobA, 0, Math.PI / 2]}>
        <mesh geometry={knobG} castShadow>
          <ClayMat color={lid} rough={0.5} />
        </mesh>
        <mesh geometry={dotG} position={[PR.knobR * 0.6, -0.07, 0]}>
          <meshPhysicalMaterial color={C.orange} roughness={0.4} clearcoat={0.5} />
        </mesh>
      </group>
      {/* paper */}
      {fed > 0.005 && (
        <group position={[0, PR.slotY, PR.slotZ]}>
          <group position={tearPos} rotation={tearRot}>
            <mesh geometry={paperG} castShadow receiveShadow>
              <meshPhysicalMaterial attach="material-0" map={printedTex} roughness={0.62} sheen={0.25} sheenColor="#ffffff" />
              <meshStandardMaterial attach="material-1" color="#F6F3EA" roughness={0.75} />
              <meshStandardMaterial attach="material-2" color="#F2EFE6" roughness={0.8} />
            </mesh>
          </group>
        </group>
      )}
    </G>
  );
};

/** feed curve for a showcase: stepwise bursts (one per line) → {fed, jerk} */
export const feedCurve = (t: number, t0: number, t1: number, Lfull: number, steps = 16) => {
  const p = k01((t - t0) / (t1 - t0));
  const q = p * steps;
  const i = Math.floor(q),
    f = q - i;
  const burst = (x: number) => (x < 0.55 ? (1 - Math.cos((x / 0.55) * Math.PI)) / 2 : 1);
  const fed = p >= 1 ? Lfull : ((i + burst(f)) / steps) * Lfull;
  const sinceStop = f > 0.55 ? (f - 0.55) * ((t1 - t0) / steps) : 0;
  const jerk = p > 0 && p < 1 && f > 0.55 ? Math.exp(-sinceStop * 14) * Math.sin(sinceStop * 40) : 0;
  return { fed, jerk };
};
