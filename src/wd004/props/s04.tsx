// wd004 S04 (compare) — নতুন clay prop: প্রশ্ন-bubble, sticker, iceberg, checklist strip, চাবি, তালা,
// contract কাগজ, stamp, bug/cloud icon, template card (ভাঙা অর্ধেকসহ), custom site card, X badge।
// সব bevelled (slabGeo/SoftPanel/lathe/sphere/torus) — কোনো দৃশ্যমান box/plane/cone নয়।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, SilverMat, Txt } from "../../kit/Clay";
import { slabGeo, latheGeo, roundedCylGeo } from "../../kit/Geo";
import { SoftPanel, RaisedBar, Inset, CheckBadge } from "../../kit/Soft";
import { Tag } from "../../kit/Clock";
import { Tooth } from "../../web11/props";
import { C } from "../../kit/theme";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number] };
const G: React.FC<P & { children?: React.ReactNode }> = ({ position, rotation, scale = 1, children }) => (
  <group position={position} rotation={rotation as any} scale={scale as any}>
    {children}
  </group>
);
const gloss = (color: string) => <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.6} clearcoatRoughness={0.28} sheen={0.35} sheenColor="#ffe2c4" />;
const k01 = (x: number) => Math.max(0, Math.min(1, x));

// ---------- প্রশ্ন-bubble "?" (w ≈ 1.9) ----------
export const QBubble: React.FC<P> = (p) => (
  <G {...p}>
    <SoftPanel w={1.9} h={1.5} thick={0.34} radius={0.6} color="#FBF8F3">
      <Txt size={1.0} color={C.deepOrange} position={[0, -0.02, 0.02]}>
        ?
      </Txt>
    </SoftPanel>
    {[
      [-0.55, -0.92, 0.15],
      [-0.85, -1.16, 0.09],
    ].map(([x, y, r], i) => (
      <mesh key={i} position={[x, y, 0]} castShadow>
        <sphereGeometry args={[r, 32, 20]} />
        <ClayMat color="#FBF8F3" rough={0.6} />
      </mesh>
    ))}
  </G>
);

// ---------- গোল sticker "CHEAP OFFER" (ব্যাস 1.1) ----------
export const Sticker: React.FC<P & { top: string; bottom: string; color?: string }> = ({ top, bottom, color = "#E2503A", ...p }) => {
  const g = useMemo(() => roundedCylGeo(0.55, 0.14, 0.06), []);
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[Math.PI / 2, 0, 0]} castShadow>
        {gloss(color)}
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <torusGeometry args={[0.45, 0.014, 10, 72]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <Txt size={0.2} color="#ffffff" position={[0, 0.11, 0.08]}>
        {top}
      </Txt>
      <Txt size={0.2} color="#ffffff" position={[0, -0.13, 0.08]}>
        {bottom}
      </Txt>
    </G>
  );
};

// ---------- Iceberg: জলের উপরে ছোট চূড়া, নিচে বড় লুকানো অংশ + লুকানো খরচের tag ----------
// base y=0, জলরেখা y=1.78, চূড়া y≈2.75; প্রস্থ ≈ 3.3
export const ICE = { water: 1.78, top: 2.75 };
export const Iceberg: React.FC<P & { labels: string[]; show: number[] }> = ({ labels, show, ...p }) => {
  const body = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [1.05, 0.03],
          [1.48, 0.36],
          [1.66, 0.92],
          [1.56, 1.42],
          [1.3, 1.74],
          [0.0, 1.8],
        ],
        96
      ),
    []
  );
  const tip = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 1.7],
          [1.0, 1.72],
          [0.9, 2.05],
          [0.62, 2.45],
          [0.3, 2.8],
          [0.0, 2.92],
        ],
        72
      ),
    []
  );
  const water = useMemo(() => roundedCylGeo(2.0, 0.1, 0.045), []);
  const slots: [number, number][] = [
    [-0.74, 1.18],
    [0.74, 1.18],
    [-0.74, 0.5],
    [0.74, 0.5],
  ];
  return (
    <G {...p}>
      <mesh geometry={body} scale={[1, 1, 0.72]} castShadow receiveShadow>
        <ClayMat color="#B4D0E7" rough={0.6} />
      </mesh>
      <mesh geometry={water} position={[0, ICE.water, 0]} receiveShadow>
        <meshPhysicalMaterial color="#8DBDE2" roughness={0.3} clearcoat={0.7} clearcoatRoughness={0.2} sheen={0.2} sheenColor="#e8f4ff" />
      </mesh>
      <group rotation={[0, 0.4, 0]}>
        <mesh geometry={tip} scale={[1, 1, 0.78]} castShadow>
          <ClayMat color="#F4F9FD" rough={0.5} sheen={0.5} />
        </mesh>
        {[
          [0.55, 1.98, 0.1, 0.42],
          [-0.58, 1.92, 0.15, 0.34],
          [0.1, 1.9, 0.55, 0.36],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} scale={[1, 0.85, 0.8]} castShadow>
            <sphereGeometry args={[r, 40, 24]} />
            <ClayMat color="#F4F9FD" rough={0.5} />
          </mesh>
        ))}
      </group>
      {labels.map((l, i) => {
        const k = k01(show[i] ?? 0);
        if (k <= 0.001) return null;
        const [x, y] = slots[i];
        return <Tag key={l} text={l} position={[x, y, 1.18]} scale={k} size={0.2} w={1.36} h={0.46} color={i % 2 ? C.navy : C.deepNavy} />;
      })}
    </G>
  );
};

// ---------- Checklist strip — ৪টা ঘর (w 5.3 × h 1.3) ----------
export const Checklist: React.FC<P & { labels: string[]; slot: number[]; label: number[]; tick: number[] }> = ({ labels, slot, label, tick, ...p }) => {
  const W = 5.3,
    H = 1.3;
  return (
    <SoftPanel w={W} h={H} thick={0.28} color="#FBF8F3" {...p}>
      {labels.map((l, i) => {
        const x = -W / 2 + (W / 4) * (i + 0.5);
        const s = k01(slot[i] ?? 0);
        const lk = k01(label[i] ?? 0);
        const tk = k01(tick[i] ?? 0);
        return (
          <group key={i} position={[x, 0, 0]}>
            {i > 0 && <RaisedBar position={[-W / 8, 0, 0]} w={0.035} h={H * 0.62} d={0.02} color="#E4DCD1" />}
            {s > 0.001 && (
              <group scale={s}>
                <Inset position={[0, 0.2, 0]} w={0.56} h={0.56} color="#ECE5DB" />
                {tk < 0.5 && (
                  <Txt size={0.28} color={C.steel} position={[0, 0.19, 0.02]}>
                    {String(i + 1)}
                  </Txt>
                )}
                {tk > 0.001 && <CheckBadge position={[0, 0.2, 0.0]} scale={0.6 * tk} />}
                {lk < 1 && <RaisedBar position={[0, -0.34, 0]} w={0.8 * (1 - lk)} h={0.08} d={0.02} color="#DCD5CB" />}
                {lk > 0.001 && (
                  <group scale={0.6 + 0.4 * lk}>
                    <Txt size={0.165} color={C.deepNavy} opacity={lk} position={[0, -0.34, 0.02]}>
                      {l}
                    </Txt>
                  </group>
                )}
              </group>
            )}
          </group>
        );
      })}
    </SoftPanel>
  );
};

// ---------- চাবি + ঝুলন্ত নাম-tag (দৈর্ঘ্য ≈ 1.9, bow বামে x≈-0.7) ----------
export const Key: React.FC<P & { label: string; labelPop?: number; color?: string }> = ({ label, labelPop = 1, color = C.orange, ...p }) => {
  const tooth = useMemo(() => slabGeo(0.16, 0.24, 0.13, 0.05, 0.035, 3), []);
  const k = 1 + 0.25 * Math.sin(Math.PI * k01(labelPop));
  return (
    <G {...p}>
      <mesh position={[-0.68, 0, 0]} castShadow>
        <torusGeometry args={[0.3, 0.11, 24, 64]} />
        {gloss(color)}
      </mesh>
      <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.085, 1.2, 10, 24]} />
        {gloss(color)}
      </mesh>
      <mesh geometry={tooth} position={[0.6, -0.17, 0]} castShadow>
        {gloss(color)}
      </mesh>
      <mesh geometry={tooth} position={[0.3, -0.14, 0]} scale={[1, 0.75, 1]} castShadow>
        {gloss(color)}
      </mesh>
      {/* tag-এর সুতো */}
      <mesh position={[-0.22, -0.32, 0]}>
        <capsuleGeometry args={[0.018, 0.34, 6, 12]} />
        <ClayMat color={C.deepNavy} rough={0.5} />
      </mesh>
      <group position={[-0.22, -0.75, 0.02]} scale={k}>
        <SoftPanel w={1.95} h={0.5} thick={0.14} color={C.deepNavy}>
          <Txt size={0.2} color="#ffffff" position={[0, -0.005, 0.015]}>
            {label}
          </Txt>
        </SoftPanel>
      </group>
    </G>
  );
};

// ---------- তালা (padlock) — body 0.95 × 0.8 ----------
export const Padlock: React.FC<P & { color?: string }> = ({ color = C.navy, ...p }) => {
  const body = useMemo(() => slabGeo(0.95, 0.8, 0.42, 0.22, 0.14, 8), []);
  return (
    <G {...p}>
      <mesh position={[0, 0.36, 0]} castShadow>
        <torusGeometry args={[0.29, 0.075, 20, 64, Math.PI]} />
        <SilverMat color="#dfe3e8" rough={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.29 * s, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.14, 8, 16]} />
          <SilverMat color="#dfe3e8" rough={0.4} />
        </mesh>
      ))}
      <mesh geometry={body} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.5} clearcoatRoughness={0.3} />
      </mesh>
      <mesh position={[0, 0.06, 0.215]}>
        <sphereGeometry args={[0.075, 24, 16]} />
        <meshStandardMaterial color="#0b1626" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.07, 0.212]}>
        <capsuleGeometry args={[0.035, 0.12, 6, 12]} />
        <meshStandardMaterial color="#0b1626" roughness={0.5} />
      </mesh>
    </G>
  );
};

// ---------- ছোট icon: bug, cloud ----------
export const BugIcon: React.FC<P> = (p) => (
  <G {...p}>
    {[-1, 1].map((s) =>
      [-0.12, 0.02, 0.16].map((y, i) => (
        <mesh key={`${s}${i}`} position={[0.2 * s, y - 0.04, -0.02]} rotation={[0, 0, s * (1.2 - i * 0.35)]}>
          <capsuleGeometry args={[0.022, 0.16, 6, 10]} />
          <ClayMat color={C.deepNavy} rough={0.5} />
        </mesh>
      ))
    )}
    <mesh position={[0, -0.03, 0]} scale={[1, 1.15, 0.55]} castShadow>
      <sphereGeometry args={[0.19, 40, 24]} />
      {gloss("#E2503A")}
    </mesh>
    <mesh position={[0, 0.2, 0.0]} scale={[1, 0.85, 0.7]} castShadow>
      <sphereGeometry args={[0.1, 32, 20]} />
      <ClayMat color={C.deepNavy} rough={0.5} />
    </mesh>
    {[
      [-0.07, 0.02],
      [0.07, -0.08],
      [0.06, 0.06],
    ].map(([x, y], i) => (
      <mesh key={i} position={[x, y, 0.1]}>
        <sphereGeometry args={[0.03, 16, 10]} />
        <ClayMat color={C.deepNavy} rough={0.5} />
      </mesh>
    ))}
  </G>
);
export const CloudIcon: React.FC<P & { color?: string }> = ({ color = C.steel, ...p }) => (
  <G {...p}>
    {[
      [-0.16, -0.02, 0.13],
      [0.0, 0.07, 0.17],
      [0.16, -0.01, 0.13],
    ].map(([x, y, r], i) => (
      <mesh key={i} position={[x, y, 0]} scale={[1, 1, 0.6]} castShadow>
        <sphereGeometry args={[r, 32, 20]} />
        <ClayMat color={color} rough={0.55} />
      </mesh>
    ))}
    <mesh position={[0, -0.07, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.6]} castShadow>
      <capsuleGeometry args={[0.085, 0.32, 8, 20]} />
      <ClayMat color={color} rough={0.55} />
    </mesh>
  </G>
);

// ---------- Contract কাগজ (w 2.6 × h 3.3) ----------
export const Contract: React.FC<P & { rows: number[]; sign: number; stamped: number }> = ({ rows, sign, stamped, ...p }) => {
  const W = 2.6,
    H = 3.3;
  const r = (i: number) => k01(rows[i] ?? 0);
  return (
    <SoftPanel w={W} h={H} thick={0.16} radius={0.2} color="#FFFDF9" {...p}>
      <Txt size={0.27} color={C.deepNavy} position={[0, 1.28, 0.02]}>
        CONTRACT
      </Txt>
      <RaisedBar position={[0, 1.02, 0]} w={1.9} h={0.05} d={0.02} color={C.orange} />
      {r(0) > 0 && (
        <group position={[0, 0.7, 0]} scale={[1, r(0), 1]}>
          <Tag text="AFTER YEAR 1" position={[0, 0, 0]} size={0.17} w={1.8} h={0.4} color={C.steel} />
        </group>
      )}
      {[
        { y: 0.08, icon: <BugIcon scale={0.95} />, text: "BUG FIX" },
        { y: -0.56, icon: <CloudIcon scale={1.05} />, text: "BACKUP" },
      ].map((o, i) => {
        const k = r(i + 1);
        if (k <= 0.001) return null;
        return (
          <group key={i} position={[0, o.y, 0]}>
            <group position={[-0.82, 0, 0.12]} scale={k}>
              {o.icon}
            </group>
            <group position={[-0.46, 0.06, 0.02]} scale={0.7 + 0.3 * k}>
              <Txt size={0.24} color={C.deepNavy} anchorX="left" opacity={k}>
                {o.text}
              </Txt>
            </group>
            <RaisedBar position={[-0.46 + 0.55 * k, -0.17, 0]} w={1.1 * k + 0.01} h={0.05} d={0.015} color="#D9DEE5" />
          </group>
        );
      })}
      {/* signature line */}
      {sign > 0 && <RaisedBar position={[-1.05 + 0.5 * k01(sign), -1.4, 0]} w={0.05 + 1.0 * k01(sign)} h={0.045} d={0.015} color="#AEB8C4" />}
      {/* stamp imprint */}
      {stamped > 0.001 && (
        <group position={[0.55, -1.08, 0.012]} rotation={[0, 0, 0.14]} scale={0.9 + 0.1 * k01(stamped)}>
          <RaisedBar w={1.5} h={0.5} d={0.012} radius={0.1} color="#F7C9AC" />
          <Txt size={0.2} color={C.deepOrange} opacity={k01(stamped)} position={[0, -0.005, 0.02]}>
            IN WRITING
          </Txt>
        </group>
      )}
    </SoftPanel>
  );
};

// ---------- Stamp (উচ্চতা ≈ 1.25, নিচের তল y=0) ----------
export const Stamp: React.FC<P> = (p) => {
  const base = useMemo(() => slabGeo(1.15, 0.32, 0.6, 0.12, 0.08, 6), []);
  const rubber = useMemo(() => slabGeo(1.05, 0.08, 0.52, 0.08, 0.03, 3), []);
  const handle = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.16, 0.0],
          [0.12, 0.2],
          [0.11, 0.42],
          [0.24, 0.6],
          [0.26, 0.74],
          [0.16, 0.84],
          [0.0, 0.86],
        ],
        48
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={rubber} position={[0, 0.04, 0]} castShadow>
        <ClayMat color={C.deepOrange} rough={0.6} />
      </mesh>
      <mesh geometry={base} position={[0, 0.24, 0]} castShadow>
        <ClayMat color={C.navy} rough={0.5} />
      </mesh>
      <mesh geometry={handle} position={[0, 0.38, 0]} castShadow>
        {gloss(C.orange)}
      </mesh>
    </G>
  );
};

// ---------- Template card (w 1.0 × h 1.25) — half: -1 বাম অর্ধেক, 1 ডান অর্ধেক, 0 পুরো ----------
export const TemplateCard: React.FC<P & { label?: string; half?: -1 | 0 | 1 }> = ({ label = "TEMPLATE", half = 0, ...p }) => {
  if (half !== 0) {
    return (
      <SoftPanel w={0.5} h={1.25} thick={0.18} color="#E2DFDA" {...p}>
        <RaisedBar position={[0, 0.27, 0]} w={0.36} h={0.3} d={0.04} radius={0.06} color="#C4C9D0" />
        <RaisedBar position={[0, -0.08, 0]} w={0.32} h={0.06} d={0.02} color="#CFCBC5" />
      </SoftPanel>
    );
  }
  return (
    <SoftPanel w={1.0} h={1.25} thick={0.18} color="#E2DFDA" {...p}>
      <Inset position={[0, 0.27, 0]} w={0.82} h={0.42} color="#D9D5CF" />
      <RaisedBar position={[0, 0.27, -0.004]} w={0.72} h={0.3} d={0.04} radius={0.06} color="#C4C9D0" />
      <RaisedBar position={[-0.06, -0.06, 0]} w={0.6} h={0.06} d={0.02} color="#CFCBC5" />
      <RaisedBar position={[-0.14, -0.16, 0]} w={0.44} h={0.06} d={0.02} color="#CFCBC5" />
      <Txt size={Math.min(0.125, 0.86 / (label.length * 0.66))} color="#6E7682" position={[0, -0.39, 0.012]}>
        {label}
      </Txt>
    </SoftPanel>
  );
};

// ---------- নতুন custom website card (w 2.9 × h 2.4) ----------
export const CustomSite: React.FC<P & { build: number }> = ({ build, ...p }) => {
  const W = 2.9,
    H = 2.4;
  const b = (i: number, n = 6) => k01(build * n - i);
  return (
    <SoftPanel w={W} h={H} thick={0.3} color="#FBF8F4" {...p}>
      <RaisedBar position={[0, H * 0.4, 0]} w={W * 0.92} h={H * 0.11} d={0.03} color="#EEE7DD" />
      {[C.deepOrange, C.orange, C.steel].map((c, i) => (
        <mesh key={i} position={[-W * 0.4 + i * 0.15, H * 0.4, 0.045]}>
          <sphereGeometry args={[0.05, 16, 12]} />
          <ClayMat color={c} rough={0.5} />
        </mesh>
      ))}
      {/* hero: navy block + tooth + নাম */}
      {b(0) > 0 && (
        <group scale={0.6 + 0.4 * b(0)}>
          <RaisedBar position={[0, 0.42, 0]} w={W * 0.86} h={0.86} d={0.05} radius={0.16} color={C.navy} />
          <Tooth position={[-0.92, 0.12, 0.1]} scale={0.62} rotation={[0, 0.4, 0]} />
        </group>
      )}
      {b(1) > 0 && (
        <group position={[0.22, 0.6, 0.06]} scale={0.6 + 0.4 * b(1)}>
          <Txt size={0.26} color="#ffffff" opacity={b(1)}>
            DR. SHIRIN
          </Txt>
          <Txt size={0.13} color="#CFE0F0" opacity={b(1)} position={[0, -0.22, 0]}>
            DENTAL CHAMBER
          </Txt>
        </group>
      )}
      {b(2) > 0 && (
        <group position={[0.22, 0.12, 0.07]} scale={0.5 + 0.5 * b(2)}>
          <RaisedBar w={0.78} h={0.24} d={0.04} radius={0.12} color={C.orange} />
          <Txt size={0.11} color="#ffffff" position={[0, -0.003, 0.05]}>
            BOOK NOW
          </Txt>
        </group>
      )}
      {[0, 1, 2].map((i) =>
        b(3 + i * 0.6) > 0 ? (
          <RaisedBar key={i} position={[-0.86 + i * 0.86, -0.5, 0.18 * (1 - b(3 + i * 0.6))]} scale={0.6 + 0.4 * b(3 + i * 0.6)} w={0.74} h={0.62} d={0.05} radius={0.12} color={[C.orange, C.steel, "#E4E8EE"][i]} />
        ) : null
      )}
    </SoftPanel>
  );
};

// ---------- লাল X badge (dome, ব্যাস 1) ----------
export const XBadge: React.FC<P & { color?: string; mark?: number }> = ({ color = "#D9453B", mark = 1, ...p }) => {
  const dome = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.38, 0.0],
          [0.47, 0.04],
          [0.5, 0.12],
          [0.48, 0.21],
          [0.4, 0.27],
          [0.22, 0.3],
          [0.0, 0.305],
        ],
        64
      ),
    []
  );
  const bar = useMemo(() => slabGeo(0.5, 0.1, 0.05, 0.05, 0.02, 3), []);
  return (
    <G {...p}>
      <mesh geometry={dome} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.25} sheen={0.3} sheenColor="#ffe2c4" />
      </mesh>
      {mark > 0 &&
        [1, -1].map((s) => (
          <mesh key={s} geometry={bar} position={[0, 0, 0.3]} rotation={[0, 0, (s * Math.PI) / 4]} scale={[mark, mark, 1]}>
            <meshStandardMaterial color="#ffffff" roughness={0.35} />
          </mesh>
        ))}
    </G>
  );
};

/** টুকরো ঝাঁকুনি helper — একবার ধাক্কা লাগলে কেঁপে থামে */
export const jolt = (t: number, at: number, amp = 1, f = 18, decay = 6) => (t < at ? 0 : Math.sin((t - at) * f * Math.PI * 2 * 0.25) * amp * Math.exp(-(t - at) * decay));
export const v3 = (a: [number, number, number], b: [number, number, number], k: number): [number, number, number] => new THREE.Vector3(...a).lerp(new THREE.Vector3(...b), k).toArray() as [number, number, number];

// ================= DOM screens =================
const ui = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";

/** phone: developer-কে বারবার call (390 × ~800) */
export const CallScreen: React.FC<{ n: number; pulse: number }> = ({ n, pulse }) => (
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(175deg,#2B4A70 0%,#1B3354 55%,#132842 100%)", fontFamily: ui, color: "#fff" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 56 }}>
      <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 118, height: 34, borderRadius: 20, background: "#000" }} />
    </div>
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontSize: 32, fontWeight: 600, opacity: 0.8 }}>calling…</div>
      <div style={{ fontSize: 60, fontWeight: 800, marginTop: 8 }}>Developer</div>
    </div>
    <div style={{ position: "absolute", top: 300, left: "50%", width: 190, height: 190, marginLeft: -95, borderRadius: 95, background: "#3E6E9E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 86, fontWeight: 800, boxShadow: `0 0 0 ${14 + pulse * 26}px rgba(245,149,43,${0.35 * (1 - pulse)})` }}>
      D
    </div>
    <div style={{ position: "absolute", top: 545, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", background: "#F5952B", color: "#fff", fontSize: 42, fontWeight: 800, padding: "14px 32px", borderRadius: 22 }}>Call #{n}</div>
    </div>
    <div style={{ position: "absolute", bottom: 70, left: "50%", width: 96, height: 96, marginLeft: -48, borderRadius: 48, background: "#E5484D", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={46} height={46} viewBox="0 0 24 24" fill="#fff" style={{ transform: "rotate(135deg)" }}>
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
      </svg>
    </div>
  </div>
);

/** tablet admin panel (1024 × 700): notice typing, time change, Friday toggle, saved */
export const AdminScreen: React.FC<{ notice: string; caret: boolean; timeNew: number; cursor: [number, number]; press: number; open: number; saved: number; reveal: number }> = ({ notice, caret, timeNew, cursor, press, open, saved, reveal }) => {
  const sec = (i: number) => {
    const k = Math.max(0, Math.min(1, reveal * 4 - i));
    return { opacity: k, transform: `translateY(${(1 - k) * 22}px)` };
  };
  const row: React.CSSProperties = { display: "flex", alignItems: "center", background: "#fff", borderRadius: 20, padding: "0 30px", height: 120, boxShadow: "0 4px 16px rgba(20,40,70,0.07)", marginBottom: 18 };
  const lab: React.CSSProperties = { fontSize: 38, fontWeight: 800, color: "#13253C", width: 330 };
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F3EEE7", fontFamily: ui, color: "#13253C" }}>
      <div style={{ height: 104, background: "#1B4470", display: "flex", alignItems: "center", padding: "0 36px", color: "#fff", ...sec(0) }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: "#F5952B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, marginRight: 18 }}>DS</div>
        <div style={{ fontSize: 40, fontWeight: 800 }}>Admin Panel</div>
        <div style={{ marginLeft: "auto", fontSize: 22, fontWeight: 600, opacity: 0.8 }}>Dr. Shirin Dental Chamber</div>
      </div>
      <div style={{ padding: "30px 40px 0" }}>
        <div style={{ ...row, ...sec(1) }}>
          <div style={lab}>Holiday notice</div>
          <div style={{ flex: 1, height: 76, borderRadius: 16, background: "#F4F1EC", border: notice ? "3px solid #F5952B" : "3px solid #E6E0D8", display: "flex", alignItems: "center", padding: "0 20px", fontSize: 36, fontWeight: 700, color: "#13253C" }}>
            {notice}
            <span style={{ opacity: caret ? 1 : 0, color: "#F5952B", marginLeft: 2 }}>|</span>
          </div>
        </div>
        <div style={{ ...row, ...sec(2) }}>
          <div style={lab}>Sat – Thu</div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>5:00 PM –</div>
          <div style={{ position: "relative", marginLeft: 14, width: 230, height: 70 }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800, opacity: 1 - timeNew, transform: `translateY(${-timeNew * 26}px)` }}>9:00 PM</div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800, color: "#D85E24", opacity: timeNew, transform: `translateY(${(1 - timeNew) * 26}px)` }}>10:00 PM</div>
          </div>
        </div>
        <div style={{ ...row, ...sec(3) }}>
          <div style={lab}>Friday</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: open > 0.5 ? "#1F9D55" : "#D9453B", width: 200 }}>{open > 0.5 ? "Open" : "Closed"}</div>
          <div style={{ marginLeft: "auto", width: 150, height: 80, borderRadius: 40, background: open > 0.5 ? "#2DBE60" : "#D3CCC2", position: "relative", transform: `scale(${1 - press * 0.06})` }}>
            <div style={{ position: "absolute", top: 7, left: 7 + open * 70, width: 66, height: 66, borderRadius: 33, background: "#fff", boxShadow: "0 3px 8px rgba(0,0,0,0.18)" }} />
          </div>
        </div>
      </div>
      {saved > 0 && (
        <div style={{ position: "absolute", right: 40, bottom: 34, background: "#1F9D55", color: "#fff", borderRadius: 18, padding: "18px 30px", fontSize: 36, fontWeight: 800, display: "flex", alignItems: "center", gap: 12, opacity: saved, transform: `translateY(${(1 - saved) * 24}px)` }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          Saved
        </div>
      )}
      {/* cursor */}
      <svg width={44} height={44} viewBox="0 0 24 24" style={{ position: "absolute", left: cursor[0], top: cursor[1], transform: `scale(${1 - press * 0.15})`, transformOrigin: "0 0", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.3))" }}>
        <path d="M4 2l15 10.5-6.6 1.2 3.8 7.3-2.9 1.5-3.8-7.3L4 19.5z" fill="#13253C" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
