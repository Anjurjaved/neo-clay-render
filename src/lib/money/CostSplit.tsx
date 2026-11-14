// ONE-TIME vs EVERY YEAR (replaces the rejected jar metaphor).
//  left : a printed receipt with a "PAID ONCE" stamp that thumps on + a small fixed coin stack — nothing more ever comes
//  right: a 12-month calendar ring that keeps turning; every time JAN passes the dispenser at the bottom, one coin drops
//         onto a growing stack, the hub counter ticks ×1, ×2, ×3 — "this one comes back every year"
// Pure props: `time` (s). Layout centred at x = 0, floor = local y 0 (≈ 5.4 wide, 5 tall).
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "../../kit/Clay";
import { roundedRectPath, shapeGeo, roundedCylGeo, slabGeo } from "../../kit/Geo";
import { SoftPanel } from "../../kit/Soft";
import { popIn, wobble } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, P, GlossMat, sheetGeo, canvasTex, k01, mixHex } from "./common";
import { CoinStack } from "./Coin";
import { drawReceipt, receiptLength, ReceiptData, PXU, PR } from "./ReceiptPrinter";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const COST_SPLIT_RECEIPT: ReceiptData = {
  title: "WEBSITE BUILD",
  sub: "Design + development",
  rows: [
    { label: "Design", amount: "৳6,000" },
    { label: "Development", amount: "৳9,000" },
  ],
  total: "৳15,000",
  footer: "",
  barcode: false,
};

/** stamp mark: rounded frame + two words, sits on a surface facing +z */
const Stamp: React.FC<P & { a: string; b: string; color?: string; opacity?: number }> = ({ a, b, color = C.green, ...p }) => {
  const frame = useMemo(() => {
    const s = roundedRectPath(1.0, 0.56, 0.12) as THREE.Shape;
    s.holes.push(roundedRectPath(0.88, 0.44, 0.07, new THREE.Path()));
    return shapeGeo(s, 0.012, 0.008, 2);
  }, []);
  return (
    <G {...p}>
      <mesh geometry={frame}>
        <GlossMat color={color} rough={0.5} />
      </mesh>
      <Txt size={0.2} color={color} position={[0, 0.08, 0.03]} letterSpacing={0.06}>
        {a}
      </Txt>
      <Txt size={0.13} color={color} position={[0, -0.12, 0.03]} letterSpacing={0.18}>
        {b}
      </Txt>
    </G>
  );
};

let _rtex: THREE.Texture | null = null;
const receiptTex = () => {
  if (_rtex) return _rtex;
  const L = receiptLength(COST_SPLIT_RECEIPT);
  _rtex = canvasTex(Math.round(PR.paperW * PXU), Math.round(L * PXU), (g) => drawReceipt(g, COST_SPLIT_RECEIPT, L, 99));
  return _rtex;
};

/** coin dispensing times for a ring that starts turning at `start` with `period` seconds per year */
export const yearDrops = (start: number, period: number, n: number, firstAfter = 1.0) => Array.from({ length: n }, (_, k) => start + firstAfter + k * period);

export const CostSplit: React.FC<P & { time: number; start?: number; period?: number; years?: number; oneTime?: string; yearly?: string }> = ({
  time: t,
  start = 0.6,
  period = 1.5,
  years = 3,
  oneTime = "Tk 15,000",
  yearly = "Tk 4,200 / yr",
  ...p
}) => {
  const L = receiptLength(COST_SPLIT_RECEIPT);
  const RS = 1.05; // receipt scale
  const paper = useMemo(
    () =>
      sheetGeo({
        w: PR.paperW,
        h: L,
        t: 0.012,
        r: 0.012,
        nx: 12,
        ny: 40,
        edge: 3,
        deform: (x, y) => {
          const v = y / L + 0.5;
          return [x, y, -0.22 * Math.pow(v, 2.2) + 0.06 * (x * x - 0.12) - 0.05 * Math.pow(1 - v, 3)];
        },
      }),
    [L]
  );
  const tex = receiptTex();
  // ---- left timing ----
  const recIn = popIn(t, 0.05, { k: 220, c: 14 });
  const stampT = 1.0;
  const st = t - stampT;
  const stampK = st < 0 ? 0 : 1;
  const stampDrop = st < 0 ? 1 : Math.max(0, 1 - st / 0.12);
  const thump = st > 0.12 ? wobble(st - 0.12, 0.06, 4, 0.3) : 0;
  // ---- right ring ----
  const ringIn = popIn(t, 0.25, { k: 220, c: 14 });
  const w = (2 * Math.PI) / period;
  const theta = w * (Math.max(t, start) - start - 1.0); // JAN at the dispenser at start + 1 s, then every period
  const drops = yearDrops(start, period, years);
  const paid = drops.filter((d) => t >= d + 0.32).length;
  const R = 1.0;
  const ringCy = 2.55;
  const rim = useMemo(() => new THREE.TorusGeometry(R, 0.055, 20, 160), []);
  const hubG = useMemo(() => roundedCylGeo(0.42, 0.2, 0.08, 64), []);
  const spokeG = useMemo(() => slabGeo(0.08, R * 2 - 0.1, 0.06, 0.04, 0.02, 3), []);
  const chuteG = useMemo(() => slabGeo(0.7, 0.34, 0.5, 0.14, 0.1, 5), []);
  const slitG = useMemo(() => slabGeo(0.42, 0.06, 0.06, 0.03, 0.015, 2), []);
  const rx = 1.38,
    lx = -1.45;
  const chuteY = ringCy - R - 0.42;
  const lastDrop = drops.filter((d) => t >= d).pop();
  const pulse = lastDrop !== undefined ? wobble(t - lastDrop, 0.08, 3, 0.3) : 0;
  return (
    <G {...p}>
      {/* ===== headers ===== */}
      <SoftPanel position={[lx, 4.3, 0]} w={1.9} h={0.56} thick={0.18} radius={0.26} color={C.navy} scale={recIn.s}>
        <Txt size={0.24} color="#ffffff" position={[0, -0.005, 0.012]} letterSpacing={0.05}>
          ONE-TIME
        </Txt>
      </SoftPanel>
      <SoftPanel position={[rx, 4.3, 0]} w={2.2} h={0.56} thick={0.18} radius={0.26} color={C.orange} scale={ringIn.s}>
        <Txt size={0.24} color="#ffffff" position={[0, -0.005, 0.012]} letterSpacing={0.05}>
          EVERY YEAR
        </Txt>
      </SoftPanel>

      {/* ===== left: receipt + stamp + coin stack ===== */}
      <group position={[lx, 0.45 + (RS * L) / 2, 0]} rotation={[0, 0.18, 0.0]} scale={[RS * recIn.s * recIn.sx, RS * recIn.s * recIn.sy, RS * recIn.s]}>
        <group rotation={[0, 0, thump * 0.15]}>
          <mesh geometry={paper} castShadow receiveShadow>
            <meshPhysicalMaterial attach="material-0" map={tex} roughness={0.62} sheen={0.25} sheenColor="#ffffff" />
            <meshStandardMaterial attach="material-1" color="#F6F3EA" roughness={0.75} />
            <meshStandardMaterial attach="material-2" color="#F2EFE6" roughness={0.8} />
          </mesh>
          {stampK > 0 && (
            <Stamp a="PAID" b="ONCE" position={[0.04, -0.82, 0.03 + stampDrop * 0.8]} rotation={[0, 0, -0.22]} scale={(1 + stampDrop * 0.5) * (1 + thump)} />
          )}
        </group>
      </group>
      <CoinStack time={t} n={5} start={0.15} every={0.08} position={[lx + 0.55, 0, 0.75]} scale={0.95} seed={4} />
      <SoftPanel position={[lx, 0.08, 1.55]} rotation={[-1.2, 0, 0]} w={1.75} h={0.5} thick={0.14} radius={0.2} color="#FBF8F3" scale={recIn.s}>
        <Txt size={0.21} color={C.deepNavy} position={[0, 0, 0.01]}>
          {oneTime}
        </Txt>
      </SoftPanel>

      {/* ===== right: turning year ring ===== */}
      <group position={[rx, ringCy, 0]} scale={ringIn.s}>
        <group rotation={[0, -0.12, 0]}>
          <group rotation={[0, 0, theta - Math.PI / 2]}>
            <mesh geometry={rim} position={[0, 0, -0.12]} castShadow>
              <ClayMat color="#EDE3D6" rough={0.6} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} geometry={spokeG} rotation={[0, 0, (i * Math.PI) / 3]} position={[0, 0, -0.14]} castShadow>
                <ClayMat color="#E4D9CB" rough={0.6} />
              </mesh>
            ))}
          </group>
          {MONTHS.map((m, i) => {
            const a = -Math.PI / 2 - (i * Math.PI) / 6 + theta;
            const atBottom = Math.cos(a + Math.PI / 2); // 1 when at bottom
            const hot = i === 0;
            const glow = hot ? 1 : Math.max(0, atBottom - 0.97) * 30 * 0.4;
            return (
              <SoftPanel
                key={m}
                position={[Math.cos(a) * R, Math.sin(a) * R, 0]}
                w={0.46}
                h={0.32}
                thick={0.13}
                radius={0.1}
                color={hot ? C.orange : mixHex("#FBF8F3", "#FFE3C2", glow)}
                scale={hot ? 1.08 + pulse : 1}
              >
                <Txt size={0.13} color={hot ? "#ffffff" : C.deepNavy} position={[0, -0.005, 0.012]}>
                  {m}
                </Txt>
              </SoftPanel>
            );
          })}
          {/* hub: payment counter */}
          <mesh geometry={hubG} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]} castShadow>
            <ClayMat color="#FBF8F3" rough={0.55} />
          </mesh>
          <Txt size={0.11} color={C.steel} position={[0, 0.17, 0.1]} letterSpacing={0.1}>
            PAID
          </Txt>
          <Txt size={0.3} color={C.deepOrange} position={[0, -0.06, 0.1]}>
            {`×${paid}`}
          </Txt>
        </group>
      </group>
      {/* dispenser under the ring */}
      <group position={[rx, chuteY, 0.05]} scale={ringIn.s}>
        <mesh geometry={chuteG} castShadow>
          <ClayMat color={C.navy} rough={0.5} />
        </mesh>
        <mesh geometry={slitG} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.17, 0.0]}>
          <meshStandardMaterial color="#0d1520" roughness={0.6} />
        </mesh>
      </group>
      <CoinStack time={t} n={years} start={drops[0]} every={period} drop={chuteY - 0.25} position={[rx, 0, 0.05]} scale={0.95} seed={7} />
      <SoftPanel position={[rx, 0.08, 1.55]} rotation={[-1.2, 0, 0]} w={2.0} h={0.5} thick={0.14} radius={0.2} color="#FBF8F3" scale={ringIn.s}>
        <Txt size={0.21} color={C.deepOrange} position={[0, 0, 0.01]}>
          {yearly}
        </Txt>
      </SoftPanel>
    </G>
  );
};
