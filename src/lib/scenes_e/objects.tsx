// scenes_e — step/station-এর অর্থবহ clay object। প্রতিটা নিজের কাজ করে (act 0→1), t = idle loop-এর সেকেন্ড।
// জৈব/জটিল আকৃতি = SDF part fuse করে এক mesh (জোড়া নেই, vertex colour-এ কয়েক রং); ঘূর্ণন-আকৃতি = এক lathe profile।
// সব object মোটামুটি 1.4 world চওড়া, কেন্দ্র origin-এ (hero zone-এ ভাসে); `ACT_HALF` = কেন্দ্র থেকে তলা পর্যন্ত (tread-এ বসাতে)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "../../kit/Clay";
import { slabGeo, roundedCylGeo, latheGeo, shapeGeo } from "../../kit/Geo";
import { SoftPanel, CheckBadge } from "../../kit/Soft";
import { springStep, wobble, smoothstep } from "../../kit/anim";
import { C } from "../../kit/theme";
import { PriceTag } from "../../web11/props";
import { Coin as LibCoin } from "../money/Coin";
import { bakeParts, sdRoundBox, sdSphere, sdEllipsoid, sdRoundCone, sdTorusXY, dArc2, sdTri2, extrudeRound, smax } from "./sdf";
import { ActKind, G, Glaze, Metal, P, k01 } from "./common";

const WHITE = "#FBF8F3";

// ---------------------------------------------------------------- shared bits
const starShape = () => {
  const s = new THREE.Shape();
  const N = 4;
  for (let i = 0; i <= N * 2; i++) {
    const a = (i / (N * 2)) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 === 0 ? 0.16 : 0.045;
    const x = Math.cos(a) * r,
      y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  return s;
};
let _star: THREE.BufferGeometry | null = null;
const starGeo = () => (_star ??= shapeGeo(starShape(), 0.03, 0.02, 3));
/** ছোট চকচকে ঝিলিক — k 0→1→0 */
export const Sparkle: React.FC<P & { k: number; color?: string }> = ({ k, color = "#FFFFFF", ...p }) => {
  if (k <= 0.01) return null;
  return (
    <G {...p}>
      <mesh geometry={starGeo()} scale={k} rotation={[0, 0, k * 0.8]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.9} roughness={0.3} toneMapped={false} />
      </mesh>
    </G>
  );
};
const twinkle = (t: number, a: number, len = 0.7) => {
  const u = (t - a) / len;
  return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u);
};

// ---------------------------------------------------------------- tooth (dental)
const toothGeo = () =>
  bakeParts(
    "e-tooth",
    [
      {
        color: "#FDFBF7",
        d: (x, y, z) => {
          let d = sdRoundBox(x, y - 0.2, z, 0.2, 0.08, 0.14, 0.27);
          for (const [cx, cz] of [[-0.19, -0.15], [0.19, -0.15], [-0.19, 0.15], [0.19, 0.15]]) d = Math.min(d, sdSphere(x - cx, y - 0.45, z - cz, 0.2));
          return smax(d, -sdEllipsoid(x, y - 0.69, z, 0.16, 0.13, 0.3), 0.07);
        },
      },
      {
        color: "#F3EAD9",
        d: (x, y, z) => Math.min(sdRoundCone(x, y, z, [-0.19, 0.05, 0], [-0.15, -0.6, 0.03], 0.2, 0.075), sdRoundCone(x, y, z, [0.19, 0.05, 0], [0.15, -0.6, -0.03], 0.2, 0.075)),
      },
    ],
    0.14,
    [0, -0.02, 0],
    0.8,
    100
  );
const Tooth: React.FC<{ act: number; t: number }> = ({ act, t }) => {
  const g = useMemo(toothGeo, []);
  const spin = 0.5 * Math.sin(t * 0.9) + act * Math.PI * 2 * smoothstep(0.1, 0.6, act);
  return (
    <group>
      <mesh geometry={g} rotation={[0.12, spin * 0.35, 0]} castShadow receiveShadow>
        <Glaze vc rough={0.26} coat={0.85} bump={0.02} />
      </mesh>
      <Sparkle position={[0.42, 0.52, 0.35]} k={twinkle(act * 3, 1.2, 0.9)} />
      <Sparkle position={[-0.45, 0.1, 0.4]} k={twinkle(act * 3, 1.6, 0.9) * 0.7} />
    </group>
  );
};

// ---------------------------------------------------------------- phone handset (call)
const handsetGeo = (color: string) => {
  const R = 0.5,
    a0 = (150 / 180) * Math.PI,
    a1 = (300 / 180) * Math.PI;
  const pad = (x: number, y: number, z: number, a: number) => {
    const cx = 0.12 + Math.cos(a) * (R - 0.04),
      cy = 0.12 + Math.sin(a) * (R - 0.04);
    const dx = x - cx,
      dy = y - cy;
    const u = -dx * Math.sin(a) + dy * Math.cos(a);
    const v = dx * Math.cos(a) + dy * Math.sin(a);
    return sdEllipsoid(u, v, z, 0.2, 0.135, 0.15);
  };
  return bakeParts(
    "e-handset-" + color,
    [
      {
        color,
        d: (x, y, z) => {
          const tube = Math.hypot(dArc2(x - 0.12, y - 0.12, R, a0, a1), z * 1.15) - 0.1;
          return Math.min(tube, pad(x, y, z, a0 + 0.05), pad(x, y, z, a1 - 0.05));
        },
      },
    ],
    0.09,
    [0.03, 0.03, 0],
    0.68,
    96
  );
};
const Phone: React.FC<{ act: number; t: number; accent: string }> = ({ act, t, accent }) => {
  const g = useMemo(() => handsetGeo(accent), [accent]);
  const ring = act < 0.72 ? 1 : 0;
  const burst = ring * Math.max(0, Math.sin(t * 2.6 * Math.PI)) ** 2;
  const shake = ring * Math.sin(t * 46) * 0.13 * burst;
  const pick = smoothstep(0.72, 0.9, act);
  return (
    <group rotation={[0, 0, shake + pick * 0.35]} position={[0, pick * 0.08, 0]}>
      <mesh geometry={g} castShadow receiveShadow>
        <Glaze vc rough={0.32} coat={0.7} />
      </mesh>
      {[0, 1].map((i) => {
        const k = ring * k01(burst * 1.4 - i * 0.35);
        if (k < 0.02) return null;
        return (
          <mesh key={i} position={[0.2, 0.2, 0]} rotation={[0, 0, -0.2]} scale={0.6 + 0.4 * k}>
            <torusGeometry args={[0.5 + i * 0.17, 0.042, 16, 40, 1.8]} />
            <Glaze color={accent} rough={0.35} opacity={k} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- chat bubble
const bubbleGeo = () =>
  bakeParts(
    "e-bubble",
    [
      {
        color: "#FFFFFF",
        d: (x, y, z) => Math.min(sdRoundBox(x, y - 0.08, z, 0.55, 0.28, 0.07, 0.17), sdRoundCone(x, y, z, [-0.4, -0.26, 0], [-0.66, -0.6, 0], 0.16, 0.05)),
      },
    ],
    0.12,
    [-0.02, -0.06, 0],
    0.84,
    100
  );
const tickGeo = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.2, 0.0);
  s.lineTo(-0.07, -0.13);
  s.lineTo(0.21, 0.15);
  s.lineTo(0.16, 0.2);
  s.lineTo(-0.07, -0.03);
  s.lineTo(-0.15, -0.05);
  s.closePath();
  return shapeGeo(s, 0.02, 0.012, 2);
};
const Chat: React.FC<{ act: number; t: number; accent: string; text?: string }> = ({ act, t, accent, text = "HI!" }) => {
  const g = useMemo(bubbleGeo, []);
  const tk = useMemo(tickGeo, []);
  const typing = 1 - smoothstep(0.5, 0.62, act);
  const msg = smoothstep(0.52, 0.6, act);
  const fs = Math.min(0.24, 1.2 / Math.max(3, text.length * 0.64));
  return (
    <group>
      <mesh geometry={g} castShadow receiveShadow>
        <Glaze vc rough={0.4} coat={0.5} />
      </mesh>
      {typing > 0.02 &&
        [-1, 0, 1].map((i) => (
          <mesh key={i} position={[i * 0.24, 0.08 + Math.max(0, Math.sin(t * 8 - i * 0.9)) * 0.06, 0.25]} scale={typing}>
            <sphereGeometry args={[0.075, 24, 16]} />
            <Glaze color={accent} rough={0.3} coat={0.7} />
          </mesh>
        ))}
      {msg > 0.02 && (
        <group position={[0, 0.1, 0.25]} scale={0.6 + 0.4 * msg}>
          <Txt size={fs} color={C.deepNavy} opacity={msg}>
            {text}
          </Txt>
        </group>
      )}
      {act > 0.8 &&
        [0, 1].map((i) => (
          <mesh key={i} geometry={tk} position={[0.42 + i * 0.09, -0.12, 0.25]} scale={0.38 * springStep((act - 0.8 - i * 0.04) * 6, { k: 200, c: 14 })}>
            <meshStandardMaterial color="#34A7E8" roughness={0.35} />
          </mesh>
        ))}
    </group>
  );
};

// ---------------------------------------------------------------- magnifier (search) + map pin
const magGeo = () =>
  bakeParts(
    "e-mag",
    [
      { color: "#F8F5F0", d: (x, y, z) => sdTorusXY(x, y, z, 0.34, 0.085) },
      { color: C.navy, d: (x, y, z) => sdRoundCone(x, y, z, [0.29, -0.29, 0], [0.72, -0.72, 0], 0.08, 0.115) },
    ],
    0.06,
    [0.17, -0.17, 0],
    0.68,
    96
  );
const pinGeo = () =>
  latheGeo(
    [
      [0.0, 0.0],
      [0.04, 0.1],
      [0.14, 0.32],
      [0.24, 0.54],
      [0.28, 0.74],
      [0.24, 0.92],
      [0.13, 1.02],
      [0.0, 1.04],
    ],
    64
  );
const Search: React.FC<{ act: number; t: number; accent: string }> = ({ act, t, accent }) => {
  const g = useMemo(magGeo, []);
  const lens = useMemo(() => roundedCylGeo(0.27, 0.035, 0.015, 48), []);
  const pg = useMemo(pinGeo, []);
  const sweep = 1 - smoothstep(0.5, 0.72, act);
  const a = act * Math.PI * 3.2;
  const mx = Math.cos(a) * 0.28 * sweep,
    my = Math.sin(a) * 0.18 * sweep + 0.08 * (1 - sweep);
  const found = springStep((act - 0.62) * 2.2, { k: 230, c: 14 });
  return (
    <group>
      {act > 0.6 && (
        <group position={[0, -0.32, -0.25]} scale={0.62 * found}>
          <mesh geometry={pg} castShadow>
            <Glaze color={accent} rough={0.32} coat={0.7} />
          </mesh>
          <mesh position={[0, 0.76, 0.24]}>
            <sphereGeometry args={[0.09, 24, 16]} />
            <Glaze color="#FFFFFF" rough={0.4} />
          </mesh>
        </group>
      )}
      <group position={[mx, my, 0.1]} rotation={[0, 0, Math.sin(t * 1.3) * 0.06]}>
        <mesh geometry={g} castShadow receiveShadow>
          <Glaze vc rough={0.34} coat={0.65} />
        </mesh>
        <mesh geometry={lens} rotation={[Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial color="#D5E9F6" roughness={0.04} clearcoat={1} transparent opacity={0.42} depthWrite={false} />
        </mesh>
        <Sparkle position={[-0.12, 0.14, 0.08]} k={twinkle(act * 3, 2.0, 0.8) * 0.8} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- desk calendar (flip — D11: flip শেষে page বদলায়)
const calGeo = (accent: string) =>
  bakeParts(
    "e-cal-" + accent,
    [
      { color: "#F8F3EC", d: (x, y, z) => sdRoundBox(x, y, z, 0.5, 0.52, 0.05, 0.13) },
      { color: accent, d: (x, y, z) => sdRoundBox(x, y - 0.42, z, 0.5, 0.11, 0.065, 0.12) },
    ],
    0.02,
    [0, 0.02, 0],
    0.72,
    96,
    0.006
  );
const Calendar: React.FC<{ act: number; accent: string; unit: string; from: string; to: string }> = ({ act, accent, unit, from, to }) => {
  const g = useMemo(() => calGeo(accent), [accent]);
  const page = useMemo(() => slabGeo(1.0, 0.7, 0.024, 0.08, 0.01, 3), []);
  const fp = smoothstep(0.15, 0.5, act);
  const flipping = fp > 0 && fp < 1;
  const shown = fp >= 1 ? to : from;
  const fsz = (s: string) => Math.min(0.46, 0.85 / Math.max(1, s.length * 0.62));
  return (
    <group>
      <mesh geometry={g} castShadow receiveShadow>
        <Glaze vc rough={0.45} coat={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.3 * s, 0.66, 0.0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.085, 0.026, 14, 32]} />
          <Metal />
        </mesh>
      ))}
      <Txt size={0.15} color="#ffffff" position={[0, 0.42, 0.205]} letterSpacing={0.08}>
        {unit}
      </Txt>
      {/* base page */}
      <mesh geometry={page} position={[0, -0.14, 0.205]} receiveShadow>
        <ClayMat color="#FFFDF9" rough={0.7} bump={0.1} />
      </mesh>
      <Txt size={fsz(flipping ? to : shown)} color={C.deepNavy} position={[0, -0.15, 0.225]}>
        {flipping ? to : shown}
      </Txt>
      {flipping && (
        <group position={[0, 0.21, 0.232]} rotation={[-fp * Math.PI, 0, 0]}>
          <mesh geometry={page} position={[0, -0.35, 0]} castShadow>
            <ClayMat color="#FFFDF9" rough={0.7} bump={0.1} />
          </mesh>
          {fp < 0.5 && (
            <Txt size={fsz(from)} color={C.deepNavy} position={[0, -0.36, 0.02]}>
              {from}
            </Txt>
          )}
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- coins + tag (pay)
const Pay: React.FC<{ act: number; t: number; accent: string; text?: string }> = ({ act, t, text }) => {
  const N = 5;
  const cx = text ? -0.36 : 0;
  return (
    <group>
      {Array.from({ length: N }).map((_, i) => {
        const at = 0.06 + i * 0.12;
        const u = (act - at) * 4.2;
        if (u <= 0) return null;
        const k = springStep(u, { k: 170, c: 11 });
        const y = -0.38 + i * 0.088 + (1 - k) * 1.3;
        return (
          <LibCoin key={i} scale={0.84} detail={i === N - 1} position={[cx + Math.sin(i * 2.1) * 0.03, y, Math.cos(i * 1.7) * 0.03]} rotation={[0.03 * Math.sin(i), i * 0.7, 0.04 * Math.cos(i * 1.3)]} />
        );
      })}
      {text && act > 0.45 && (
        <group position={[0.3, 0.05, 0.05]} scale={0.36 * springStep((act - 0.45) * 3, { k: 220, c: 13 })} rotation={[0, -0.12, wobble((act - 0.45) * 3, 0.12, 1.3, 0.12)]}>
          <PriceTag text={text} w={Math.max(2.0, text.length * 0.3 + 0.8)} h={1.0} />
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- clipboard form (rows tick)
const clipGeo = () =>
  bakeParts(
    "e-clip",
    [{ color: "#D4D9DF", d: (x, y, z) => Math.min(sdRoundBox(x, y - 0.66, z - 0.1, 0.18, 0.05, 0.03, 0.035), sdTorusXY(x, y - 0.77, z - 0.1, 0.075, 0.026)) }],
    0.04,
    [0, 0.72, 0.1],
    0.3,
    64
  );
const Form: React.FC<{ act: number; lines: string[] }> = ({ act, lines }) => {
  const board = useMemo(() => slabGeo(1.15, 1.5, 0.08, 0.1, 0.035, 5), []);
  const paper = useMemo(() => slabGeo(1.0, 1.24, 0.02, 0.05, 0.008, 2), []);
  const slot = useMemo(() => roundedCylGeo(0.1, 0.03, 0.012, 32), []);
  const cg = useMemo(clipGeo, []);
  const n = Math.min(4, lines.length);
  return (
    <group>
      <mesh geometry={board} castShadow receiveShadow>
        <ClayMat color="#E6CFAE" rough={0.6} />
      </mesh>
      <mesh geometry={paper} position={[0, -0.06, 0.06]} receiveShadow>
        <ClayMat color="#FFFDF8" rough={0.75} bump={0.08} />
      </mesh>
      <mesh geometry={cg} castShadow>
        <Metal color="#dfe3e8" rough={0.3} />
      </mesh>
      {lines.slice(0, n).map((l, i) => {
        const y = 0.32 - i * (0.88 / Math.max(1, n - 1 + 0.6));
        const at = 0.15 + i * (0.6 / n);
        const k = springStep((act - at) * 4, { k: 240, c: 13 });
        const fs = Math.min(0.15, 0.62 / Math.max(3, l.length * 0.64));
        return (
          <group key={i} position={[0, y, 0.075]}>
            <mesh geometry={slot} position={[-0.32, 0, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
              <ClayMat color="#E3DACD" rough={0.7} />
            </mesh>
            {act > at && <CheckBadge position={[-0.32, 0, 0.01]} scale={0.24 * k} color={C.green} />}
            <Txt size={fs} color={C.deepNavy} anchorX="left" position={[-0.16, 0, 0.012]}>
              {l}
            </Txt>
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- cloche (restaurant): plate + food + silver dome lifts, steam
const foodGeo = () =>
  bakeParts(
    "e-food",
    [
      {
        color: "#F1C15E",
        d: (x, y, z) => sdEllipsoid(x, y - 0.06, z, 0.44, 0.22, 0.4) - 0.018 * Math.sin(x * 23) * Math.sin(z * 21) * Math.sin(y * 17 + 1),
      },
      { color: "#58A84B", d: (x, y, z) => Math.min(sdEllipsoid(x + 0.1, y - 0.27, z - 0.05, 0.1, 0.035, 0.06), sdEllipsoid(x - 0.08, y - 0.26, z + 0.08, 0.08, 0.03, 0.05)) },
      { color: "#E0553A", d: (x, y, z) => sdEllipsoid(x - 0.13, y - 0.25, z - 0.1, 0.09, 0.035, 0.09) },
    ],
    0.03,
    [0, 0.08, 0],
    0.52,
    84
  );
const Cloche: React.FC<{ act: number; t: number }> = ({ act, t }) => {
  const plate = useMemo(() => latheGeo([[0.0, 0.0], [0.5, 0.0], [0.62, 0.03], [0.74, 0.08], [0.78, 0.11], [0.72, 0.12], [0.56, 0.07], [0.0, 0.07]], 72), []);
  const dome = useMemo(
    () =>
      latheGeo(
        [
          [0.66, 0.0],
          [0.65, 0.12],
          [0.6, 0.3],
          [0.48, 0.48],
          [0.3, 0.6],
          [0.12, 0.65],
          [0.07, 0.67],
          [0.1, 0.72],
          [0.11, 0.78],
          [0.07, 0.82],
          [0.0, 0.83],
        ],
        72,
        90
      ),
    []
  );
  const food = useMemo(foodGeo, []);
  const lift = smoothstep(0.12, 0.5, act);
  const dy = lift * 0.95 + wobble((act - 0.5) * 3, 0.06, 1.2, 0.2);
  return (
    <group position={[0, -0.35, 0]}>
      <mesh geometry={plate} castShadow receiveShadow>
        <Glaze color="#FFFFFF" rough={0.22} coat={0.9} bump={0.01} />
      </mesh>
      <mesh geometry={food} position={[0, 0.07, 0]} castShadow receiveShadow>
        <Glaze vc rough={0.55} coat={0.25} bump={0.12} />
      </mesh>
      {lift > 0.3 &&
        [0, 1, 2].map((i) => {
          const ph = (t * 0.55 + i * 0.33) % 1;
          const k = Math.sin(Math.PI * ph) * smoothstep(0.3, 0.6, lift);
          return (
            <mesh key={i} position={[(i - 1) * 0.2 + Math.sin(t * 2 + i) * 0.05, 0.45 + ph * 0.7, 0]} scale={[0.09 + ph * 0.06, 0.14 + ph * 0.1, 0.09]}>
              <sphereGeometry args={[1, 20, 14]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.55 * k} roughness={1} depthWrite={false} />
            </mesh>
          );
        })}
      <group position={[lift * 0.45, 0.08 + dy, -lift * 0.15]} rotation={[0, 0, -lift * 0.55]}>
        <mesh geometry={dome} castShadow receiveShadow>
          <meshPhysicalMaterial color="#DDE1E6" metalness={0.92} roughness={0.22} clearcoat={0.5} clearcoatRoughness={0.15} envMapIntensity={1.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <torusGeometry args={[0.66, 0.022, 12, 72]} />
          <Metal color="#d0d5da" rough={0.25} />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- shopping bag (ecommerce)
const bagGeo = (accent: string) =>
  bakeParts(
    "e-bag-" + accent,
    [
      { color: accent, d: (x, y, z) => sdRoundBox(x, y + 0.12, z, 0.42, 0.4, 0.14, 0.1) },
      { color: C.navy, d: (x, y, z) => smax(sdTorusXY(x, y - 0.36, z, 0.22, 0.045), -(y - 0.42), 0.02) },
    ],
    0.05,
    [0, 0.0, 0],
    0.72,
    96,
    0.008
  );
const Bag: React.FC<{ act: number; t: number; accent: string; text?: string }> = ({ act, t, accent, text }) => {
  const g = useMemo(() => bagGeo(accent), [accent]);
  const land = springStep(act * 3.2, { k: 160, c: 11 });
  const y = (1 - land) * 0.55;
  const sq = 1 + wobble(act * 3.2 - 0.25, 0.1, 2.4, 0.25);
  const sway = wobble(act * 3.2 - 0.2, 0.14, 1.1, 0.12) + Math.sin(t * 1.1) * 0.03;
  const plus = springStep((act - 0.55) * 3, { k: 230, c: 13 });
  return (
    <group>
      <group position={[0, y - 0.5, 0]} scale={[1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)]} rotation={[0, -0.45, sway]}>
        <group position={[0, 0.5, 0]}>
          <mesh geometry={g} castShadow receiveShadow>
            <Glaze vc rough={0.42} coat={0.45} />
          </mesh>
          {text && (
            <Txt size={Math.min(0.17, 0.62 / Math.max(3, text.length * 0.62))} color="#ffffff" position={[0, -0.1, 0.25]}>
              {text}
            </Txt>
          )}
        </group>
      </group>
      {act > 0.55 && (
        <group position={[0.5, 0.62, 0.1]} scale={plus}>
          <SoftPanel w={0.52} h={0.4} thick={0.12} color={C.green}>
            <Txt size={0.2} color="#ffffff" position={[0, -0.005, 0.012]}>
              +1
            </Txt>
          </SoftPanel>
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- parcel box (delivery)
const Box: React.FC<{ act: number; t: number; text?: string }> = ({ act, text }) => {
  const body = useMemo(() => slabGeo(1.1, 0.8, 0.9, 0.09, 0.07, 6), []);
  const tape = useMemo(() => slabGeo(0.24, 0.816, 0.916, 0.06, 0.05, 5), []);
  const label = useMemo(() => slabGeo(0.34, 0.24, 0.02, 0.04, 0.008, 2), []);
  // দুই লাফে ডান থেকে এসে থামে
  const travel = 1 - smoothstep(0.0, 0.42, act);
  const hop = Math.abs(Math.sin(smoothstep(0.0, 0.42, act) * Math.PI * 2)) * 0.3 * travel ** 0.3;
  const landK = act > 0.42 ? wobble((act - 0.42) * 3.2, 0.12, 2.2, 0.25) : 0;
  const done = springStep((act - 0.68) * 3, { k: 230, c: 13 });
  return (
    <group position={[travel * 0.8, -0.4 + hop, 0]}>
      <group scale={[1 - landK * 0.5, 1 + landK, 1 - landK * 0.5]} rotation={[0, 0, -travel * 0.25]}>
        <group position={[0, 0.4, 0]}>
          <mesh geometry={body} castShadow receiveShadow>
            <ClayMat color="#D9A66B" rough={0.62} />
          </mesh>
          <mesh geometry={tape} castShadow>
            <ClayMat color="#EFD5A8" rough={0.5} bump={0.15} />
          </mesh>
          <mesh geometry={label} position={[0.33, -0.12, 0.46]}>
            <ClayMat color="#FFFDF8" rough={0.7} />
          </mesh>
          {text && (
            <Txt size={Math.min(0.075, 0.3 / Math.max(3, text.length * 0.6))} color={C.deepNavy} position={[0.33, -0.12, 0.475]}>
              {text}
            </Txt>
          )}
        </group>
      </group>
      {act > 0.68 && <CheckBadge position={[0.5, 0.95, 0.2]} scale={0.42 * done} color={C.green} />}
    </group>
  );
};

// ---------------------------------------------------------------- open book (school) + flipping page (vertex bend)
const BOOK = { L: 0.7, D: 0.92, top: (ax: number) => 0.04 + 0.15 * Math.pow(Math.sin(Math.PI * Math.min(1, ax / 0.74)), 0.75) };
const bookGeo = (accent: string) =>
  bakeParts(
    "e-book-" + accent,
    [
      {
        color: "#FBF6EC",
        d: (x, y, z) => {
          const ax = Math.abs(x);
          const a = ax - BOOK.L;
          const b = Math.abs(z) - BOOK.D / 2;
          const c = y - BOOK.top(ax);
          const e = -0.01 - y;
          return smax(smax(a, b, 0.03), smax(c, e, 0.02), 0.03);
        },
      },
      { color: accent, d: (x, y, z) => sdRoundBox(x, y + 0.045, z, 0.73, 0.012, BOOK.D / 2 + 0.02, 0.025) },
    ],
    0.015,
    [0, 0.06, 0],
    0.8,
    110,
    0.006
  );
/** কাগজের পাতা: (u 0..L, v across, w thickness) grid — প্রতি frame বাঁকানো হয় */
const sheetBase = (L: number, Wd: number, th: number, nu = 28, nv = 3) => {
  const verts: number[] = [];
  const idx: number[] = [];
  const id = (s: number, i: number, j: number) => s * (nu + 1) * (nv + 1) + j * (nu + 1) + i;
  for (let s = 0; s < 2; s++)
    for (let j = 0; j <= nv; j++)
      for (let i = 0; i <= nu; i++) verts.push((i / nu) * L, (j / nv - 0.5) * Wd, s === 0 ? th / 2 : -th / 2);
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = id(0, i, j), b = id(0, i + 1, j), c = id(0, i + 1, j + 1), d = id(0, i, j + 1);
      idx.push(a, b, c, a, c, d);
      const a2 = id(1, i, j), b2 = id(1, i + 1, j), c2 = id(1, i + 1, j + 1), d2 = id(1, i, j + 1);
      idx.push(a2, c2, b2, a2, d2, c2);
    }
  const ring: [number, number][] = [];
  for (let i = 0; i <= nu; i++) ring.push([i, 0]);
  for (let j = 1; j <= nv; j++) ring.push([nu, j]);
  for (let i = nu - 1; i >= 0; i--) ring.push([i, nv]);
  for (let j = nv - 1; j >= 1; j--) ring.push([0, j]);
  for (let k = 0; k < ring.length; k++) {
    const [i0, j0] = ring[k], [i1, j1] = ring[(k + 1) % ring.length];
    const a = id(0, i0, j0), b = id(0, i1, j1), c = id(1, i1, j1), d = id(1, i0, j0);
    idx.push(a, d, c, a, c, b);
  }
  return { verts: new Float32Array(verts), idx };
};
const SheetPage: React.FC<{ phi: number; beta: number }> = ({ phi, beta }) => {
  const base = useMemo(() => sheetBase(BOOK.L - 0.02, BOOK.D - 0.04, 0.008), []);
  const geo = useMemo(() => {
    const L = BOOK.L - 0.02;
    const out = new Float32Array(base.verts.length);
    for (let i = 0; i < base.verts.length; i += 3) {
      const u = base.verts[i], v = base.verts[i + 1], w = base.verts[i + 2];
      const ph = phi - (beta * u) / L;
      let X: number, Y: number;
      if (Math.abs(beta) < 1e-4) {
        X = u * Math.cos(phi);
        Y = u * Math.sin(phi);
      } else {
        X = (L / beta) * (Math.sin(phi) - Math.sin(ph));
        Y = (L / beta) * (Math.cos(ph) - Math.cos(phi));
      }
      out[i] = X - w * Math.sin(ph);
      out[i + 1] = Y + w * Math.cos(ph);
      out[i + 2] = v;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(out, 3));
    g.setIndex(base.idx);
    g.computeVertexNormals();
    return g;
  }, [base, Math.round(phi * 200), Math.round(beta * 200)]);
  return (
    <mesh geometry={geo} position={[0, 0.055, 0]} castShadow>
      <meshPhysicalMaterial color="#FFFCF5" roughness={0.75} sheen={0.3} sheenColor="#fff0de" side={THREE.DoubleSide} />
    </mesh>
  );
};
const Book: React.FC<{ act: number; t: number; accent: string; text?: string }> = ({ act, t, accent, text }) => {
  const g = useMemo(() => bookGeo(accent), [accent]);
  const flips = [smoothstep(0.12, 0.42, act), smoothstep(0.42, 0.72, act)];
  return (
    <group rotation={[0.95, Math.sin(t * 0.6) * 0.08, 0]} position={[0, -0.05, 0]}>
      <mesh geometry={g} castShadow receiveShadow>
        <Glaze vc rough={0.62} coat={0.15} bump={0.06} />
      </mesh>
      {flips.map((f, i) => (f > 0 && f < 1 ? <SheetPage key={i} phi={0.08 + f * (Math.PI - 0.16)} beta={0.9 * Math.sin(Math.PI * f)} /> : null))}
      {text && (
        <group position={[0.36, 0.215, 0.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <Txt size={Math.min(0.13, 0.5 / Math.max(2, text.length * 0.62))} color={C.deepNavy}>
            {text}
          </Txt>
        </group>
      )}
      <mesh position={[0.02, 0.0, BOOK.D / 2 + 0.05]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.025, 0.18, 6, 12]} />
        <ClayMat color={C.orange} rough={0.5} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- house (real estate) — walls+roof+chimney+door এক mesh
const houseGeo = () =>
  bakeParts(
    "e-house",
    [
      { color: "#F6EEE2", d: (x, y, z) => sdRoundBox(x, y + 0.14, z, 0.4, 0.28, 0.34, 0.07) },
      { color: "#E06B3C", d: (x, y, z) => extrudeRound(sdTri2(x, y - 0.17, 0.52, 0.42) - 0.06, z, 0.45, 0.06) },
      { color: "#C85A36", d: (x, y, z) => sdRoundBox(x - 0.29, y - 0.5, z + 0.12, 0.05, 0.13, 0.05, 0.03) },
      { color: C.navy, d: (x, y, z) => sdRoundBox(x, y + 0.3, z - 0.405, 0.1, 0.16, 0.025, 0.03) },
    ],
    0.03,
    [0, 0.08, 0],
    0.78,
    104,
    0.008
  );
const House: React.FC<{ act: number; t: number; text?: string }> = ({ act, t, text }) => {
  const g = useMemo(houseGeo, []);
  const win = useMemo(() => slabGeo(0.17, 0.17, 0.03, 0.04, 0.012, 2), []);
  const lit = smoothstep(0.25, 0.45, act);
  const sign = springStep((act - 0.5) * 3, { k: 220, c: 13 });
  return (
    <group rotation={[0, -0.32 + Math.sin(t * 0.7) * 0.05, 0]}>
      <mesh geometry={g} castShadow receiveShadow>
        <Glaze vc rough={0.45} coat={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={win} position={[0.25 * s, -0.08, 0.425]}>
          <meshStandardMaterial color={lit > 0.5 ? "#FFD27A" : "#BFD7EA"} emissive="#FFC35A" emissiveIntensity={lit * 2.4} roughness={0.2} toneMapped={false} />
        </mesh>
      ))}
      {[0, 1].map((i) => {
        const ph = (t * 0.45 + i * 0.5) % 1;
        const k = Math.sin(Math.PI * ph) * lit;
        return (
          <mesh key={i} position={[-0.29 + ph * 0.12, 0.72 + ph * 0.5, -0.12]} scale={0.06 + ph * 0.07}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.6 * k} depthWrite={false} />
          </mesh>
        );
      })}
      {text && act > 0.5 && (
        <group position={[0.62, -0.38, 0.45]} scale={sign} rotation={[0, 0.3, wobble((act - 0.5) * 3, 0.1, 1.2, 0.15)]}>
          <mesh position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.025, 0.32, 6, 12]} />
            <ClayMat color="#8C6A4E" rough={0.6} />
          </mesh>
          <SoftPanel position={[0, 0.16, 0.02]} w={Math.max(0.6, text.length * 0.085 + 0.2)} h={0.26} thick={0.08} color="#FFFDF8">
            <Txt size={0.1} color="#1F8A52" position={[0, -0.003, 0.01]}>
              {text}
            </Txt>
          </SoftPanel>
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- key (handover) — bow+shaft+teeth এক mesh, নাম-tag কেন্দ্র থেকে ঝোলে
const keyGeo = () =>
  bakeParts(
    "e-key",
    [
      {
        color: "#F0AE45",
        d: (x, y, z) =>
          Math.min(
            sdTorusXY(x + 0.5, y, z * 0.95, 0.23, 0.085),
            sdRoundBox(x - 0.14, y, z, 0.4, 0.04, 0.035, 0.035),
            sdRoundBox(x + 0.16, y, z, 0.03, 0.08, 0.06, 0.035),
            sdRoundBox(x - 0.42, y + 0.12, z, 0.045, 0.08, 0.03, 0.03),
            sdRoundBox(x - 0.26, y + 0.1, z, 0.035, 0.06, 0.03, 0.03)
          ),
      },
    ],
    0.05,
    [-0.1, -0.03, 0],
    0.76,
    104
  );
const Key: React.FC<{ act: number; t: number; text?: string }> = ({ act, t, text }) => {
  const g = useMemo(keyGeo, []);
  const turn = smoothstep(0.3, 0.5, act) * (Math.PI / 2) + wobble((act - 0.5) * 3, 0.15, 2, 0.2);
  const tagSwing = wobble((act - 0.3) * 3, 0.25, 1.1, 0.12) + Math.sin(t * 1.4) * 0.04;
  return (
    <group position={[0.05, 0.12, 0]}>
      <group rotation={[turn, 0, 0.08]}>
        <mesh geometry={g} castShadow receiveShadow>
          <meshPhysicalMaterial vertexColors roughness={0.26} metalness={0.45} clearcoat={0.8} clearcoatRoughness={0.18} sheen={0.3} sheenColor="#ffe0b0" />
        </mesh>
      </group>
      <Sparkle position={[0.62, 0.12, 0.15]} k={twinkle(act * 3, 1.55, 0.8)} />
      {text && (
        <group position={[-0.5, 0, 0]} rotation={[0, 0, tagSwing]}>
          <mesh position={[0, -0.22, 0.02]}>
            <capsuleGeometry args={[0.014, 0.24, 6, 10]} />
            <ClayMat color={C.deepNavy} rough={0.5} />
          </mesh>
          <SoftPanel position={[0, -0.52, 0.03]} w={Math.max(0.7, text.length * 0.1 + 0.24)} h={0.32} thick={0.09} color={C.deepNavy}>
            <Txt size={0.13} color="#ffffff" position={[0, -0.004, 0.01]}>
              {text}
            </Txt>
          </SoftPanel>
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- check (done)
const Check: React.FC<{ act: number; t: number }> = ({ act, t }) => {
  const k = springStep(act * 3, { k: 200, c: 11 });
  return (
    <group rotation={[0.1, Math.sin(t * 0.8) * 0.12, 0]}>
      <CheckBadge scale={1.25} color={C.green} tick={k} />
      <Sparkle position={[0.6, 0.5, 0.3]} k={twinkle(act * 3, 0.5, 0.8)} />
      <Sparkle position={[-0.62, 0.3, 0.3]} k={twinkle(act * 3, 0.8, 0.8) * 0.7} />
    </group>
  );
};

// ---------------------------------------------------------------- dispatcher
export type ActProps = { kind: ActKind; act: number; t: number; accent: string; text?: string; lines?: string[]; unit?: string; from?: string; to?: string };
/** কেন্দ্র থেকে তলা — tread/pedestal-এ বসাতে */
export const ACT_HALF: Record<ActKind, number> = { phone: 0.55, chat: 0.6, search: 0.6, calendar: 0.66, pay: 0.58, form: 0.75, tooth: 0.7, cloche: 0.36, bag: 0.62, box: 0.4, book: 0.3, house: 0.55, key: 0.25, check: 0.38 };
export const ActObject: React.FC<ActProps> = ({ kind, act, t, accent, text, lines, unit, from, to }) => {
  const a = k01(act);
  switch (kind) {
    case "tooth":
      return <Tooth act={a} t={t} />;
    case "phone":
      return <Phone act={a} t={t} accent={accent} />;
    case "chat":
      return <Chat act={a} t={t} accent={accent} text={text} />;
    case "search":
      return <Search act={a} t={t} accent={accent} />;
    case "calendar":
      return <Calendar act={a} accent={accent} unit={unit ?? "DATE"} from={from ?? "1"} to={to ?? text ?? "7"} />;
    case "pay":
      return <Pay act={a} t={t} accent={accent} text={text} />;
    case "form":
      return <Form act={a} lines={lines ?? (text ? [text] : ["NAME", "PHONE", "DATE"])} />;
    case "cloche":
      return <Cloche act={a} t={t} />;
    case "bag":
      return <Bag act={a} t={t} accent={accent} text={text} />;
    case "box":
      return <Box act={a} t={t} text={text} />;
    case "book":
      return <Book act={a} t={t} accent={accent} text={text} />;
    case "house":
      return <House act={a} t={t} text={text} />;
    case "key":
      return <Key act={a} t={t} text={text} />;
    case "check":
    default:
      return <Check act={a} t={t} />;
  }
};
