// scenes_a objects — এক টুকরার (SDF bake) industry sign object + problem item + speech bubble।
// সব mesh seamless: জৈব আকৃতি smin দিয়ে fuse, রং vertex colour দিয়ে (আলাদা টুকরো জোড়া নয়)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { clayNoise, ClayMat, SilverMat, Txt } from "../../kit/Clay";
import { latheGeo, shapeGeo, roundedRectPath } from "../../kit/Geo";
import { C } from "../../kit/theme";
import { P, G, bakeSDF, smin, smax, sdSphere, sdEllipsoid, sdRoundBox, sdCapsule, sdTorusXY, rot2, V3 } from "./common";

/** vertex-colour clay (bake করা এক-mesh বহুরঙা বস্তুর জন্য) */
export const VClay: React.FC<{ rough?: number; coat?: number; sheen?: number }> = ({ rough = 0.5, coat = 0.25, sheen = 0.4 }) => {
  const n = clayNoise();
  return (
    <meshPhysicalMaterial
      vertexColors
      color="#ffffff"
      roughness={rough}
      metalness={0}
      sheen={sheen}
      sheenRoughness={0.8}
      sheenColor="#ffe2c8"
      clearcoat={coat}
      clearcoatRoughness={0.35}
      bumpMap={n}
      bumpScale={0.12}
      envMapIntensity={0.9}
    />
  );
};
const gloss = (color: string, rough = 0.4) => <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.6} clearcoatRoughness={0.28} sheen={0.35} sheenColor="#ffe2c4" />;

// ======================= industry sign objects (base y=0, height ≈ 1, width ≈ 0.8–1) =======================

/** molar — crown + 4 cusp + 2 root, এক টুকরা */
export const Molar: React.FC<P> = (p) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "a-molar",
        (x, y, z) => {
          let d = sdRoundBox(x, y - 0.6, z, 0.2, 0.12, 0.17, 0.13);
          for (const [cx, cz] of [
            [-0.15, -0.12],
            [0.15, -0.12],
            [-0.15, 0.12],
            [0.15, 0.12],
          ])
            d = smin(d, sdSphere(x - cx, y - 0.8, z - cz, 0.15), 0.09);
          d = smax(d, -sdSphere(x, y - 1.0, z, 0.12), 0.07); // occlusal groove
          for (const s of [-1, 1]) d = smin(d, sdCapsule([x, y, z], [0.13 * s, 0.5, 0], [0.19 * s, 0.06, 0.02], 0.13, 0.055), 0.1);
          return d;
        },
        [0, 0.5, 0],
        0.56,
        88
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <meshPhysicalMaterial color="#FBFAF7" roughness={0.32} clearcoat={0.55} clearcoatRoughness={0.22} sheen={0.3} sheenColor="#fff1e6" bumpMap={clayNoise()} bumpScale={0.05} />
      </mesh>
    </G>
  );
};

/** cloche on plate — রুপালি ঢাকনা (এক lathe profile, knob সহ) + সাদা প্লেট */
export const Cloche: React.FC<P> = (p) => {
  const dome = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.1],
          [0.5, 0.1],
          [0.53, 0.13],
          [0.5, 0.3],
          [0.42, 0.48],
          [0.28, 0.61],
          [0.12, 0.67],
          [0.07, 0.7],
          [0.07, 0.76],
          [0.12, 0.8],
          [0.1, 0.86],
          [0.0, 0.875],
        ],
        72,
        96
      ),
    []
  );
  const plate = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.42, 0.0],
          [0.62, 0.05],
          [0.68, 0.1],
          [0.64, 0.12],
          [0.52, 0.1],
          [0.0, 0.08],
        ],
        72,
        64
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={plate} castShadow receiveShadow>
        <ClayMat color="#FBF8F3" rough={0.45} bump={0.1} />
      </mesh>
      <mesh geometry={dome} castShadow>
        <SilverMat color="#dfe3e7" rough={0.32} />
      </mesh>
    </G>
  );
};

/** shopping bag — কমলা ব্যাগ + navy হাতল, এক টুকরা */
export const Bag: React.FC<P> = (p) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "a-bag",
        (x, y, z) => {
          const body = sdRoundBox(x, y - 0.38, z, 0.3, 0.32, 0.12, 0.07);
          const handle = Math.max(sdTorusXY(x, y - 0.72, z, 0.16, 0.035), -(y - 0.7));
          return smin(body, handle, 0.04);
        },
        [0, 0.48, 0],
        0.5,
        88,
        (x, y) => (y > 0.76 ? C.navy : C.orange)
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <VClay rough={0.48} coat={0.35} />
      </mesh>
    </G>
  );
};

/** graduation cap — বোর্ড + টুপি + কমলা tassel, এক টুকরা */
export const GradCap: React.FC<P> = (p) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "a-grad",
        (x, y, z) => {
          const [rx, rz] = rot2(x, z, Math.PI / 4);
          const board = sdRoundBox(rx, y - 0.56, rz, 0.4, 0.018, 0.4, 0.025);
          const skull = smax(sdEllipsoid(x, y - 0.4, z, 0.3, 0.22, 0.3), -(y - 0.18), 0.04);
          let d = smin(board, skull, 0.05);
          d = smin(d, sdSphere(x, y - 0.6, z, 0.05), 0.02);
          // tassel: কেন্দ্র → কোণ → নিচে
          const tip: V3 = [0.5, 0.57, 0];
          d = smin(d, sdCapsule([x, y, z], [0, 0.6, 0], tip, 0.018), 0.01);
          d = smin(d, sdCapsule([x, y, z], tip, [0.5, 0.3, 0.02], 0.022, 0.05), 0.02);
          return d;
        },
        [0.08, 0.42, 0],
        0.6,
        92,
        (x, y, z) => {
          const nearT = Math.hypot(x - 0.5, z) < 0.09 && y < 0.6;
          const onLine = Math.abs(z) < 0.04 && x > 0.05 && y > 0.57 && y < 0.65;
          return nearT || onLine ? C.orange : C.navy;
        }
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <VClay rough={0.55} coat={0.2} />
      </mesh>
    </G>
  );
};

/** house — cream দেয়াল, কমলা ছাদ, navy দরজা, এক টুকরা */
export const House: React.FC<P> = (p) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "a-house",
        (x, y, z) => {
          let d = sdRoundBox(x, y - 0.27, z, 0.3, 0.22, 0.24, 0.05);
          for (const s of [-1, 1]) {
            const [rx, ry] = rot2(x - s * 0.19, y - 0.66, s * 0.72);
            d = smin(d, sdRoundBox(rx, ry, z, 0.25, 0.03, 0.3, 0.035), 0.04);
          }
          d = smax(d, -(y - 0.86), 0.02);
          d = smin(d, sdRoundBox(x - 0.2, y - 0.78, z, 0.05, 0.12, 0.05, 0.02), 0.03);
          d = smax(d, -sdRoundBox(x, y - 0.17, z - 0.3, 0.07, 0.13, 0.05, 0.02), 0.015); // দরজা খাঁজ
          return d;
        },
        [0, 0.48, 0],
        0.52,
        92,
        (x, y, z) => {
          if (z > 0.2 && Math.abs(x) < 0.1 && y < 0.33) return C.navy;
          if (y > 0.47 && !(x > 0.14 && y > 0.72 && Math.abs(z) < 0.08)) return C.deepOrange;
          return "#F7F0E6";
        }
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <VClay rough={0.55} coat={0.18} />
      </mesh>
    </G>
  );
};

/** medical cross — সবুজ চকচকে এক টুকরা */
export const MedCross: React.FC<P & { color?: string }> = ({ color = "#1FA971", ...p }) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "a-cross",
        (x, y, z) => smin(sdRoundBox(x, y - 0.45, z, 0.12, 0.33, 0.08, 0.06), sdRoundBox(x, y - 0.45, z, 0.33, 0.12, 0.08, 0.06), 0.06),
        [0, 0.45, 0],
        0.5,
        80
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        {gloss(color, 0.38)}
      </mesh>
    </G>
  );
};

/** chef hat — ফোলা মেঘের মাথা + band, এক টুকরা (figure মাথায়) */
export const ChefHat: React.FC<P> = (p) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "a-chef",
        (x, y, z) => {
          let d = sdRoundBox(x, y - 0.06, z, 0.13, 0.05, 0.13, 0.03);
          for (const [cx, cy, cz, r] of [
            [0, 0.2, 0, 0.15],
            [-0.1, 0.16, 0.04, 0.11],
            [0.1, 0.17, -0.03, 0.11],
            [0.02, 0.17, 0.1, 0.1],
            [-0.03, 0.16, -0.1, 0.1],
          ])
            d = smin(d, sdSphere(x - cx, y - cy, z - cz, r), 0.07);
          return d;
        },
        [0, 0.14, 0],
        0.3,
        64
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <ClayMat color="#FCFBF8" rough={0.6} bump={0.2} />
      </mesh>
    </G>
  );
};

// ======================= problem items (≈1 wide) =======================

/** classic phone handset — এক টুকরা (C-বাঁক + দুই মাথা fused) */
export const Handset: React.FC<P & { color?: string }> = ({ color = C.deepOrange, ...p }) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "a-handset",
        (x, y, z) => {
          // C-arc (center 0.12,0.12, R .38) from 150° to 300°
          const cx = x - 0.12,
            cy = y - 0.12;
          let a = Math.atan2(cy, cx);
          if (a < 0) a += Math.PI * 2;
          const a0 = (150 / 180) * Math.PI,
            a1 = (300 / 180) * Math.PI;
          const ac = Math.min(a1, Math.max(a0, a));
          const px = 0.12 + Math.cos(ac) * 0.38,
            py = 0.12 + Math.sin(ac) * 0.38;
          let d = Math.hypot(x - px, y - py, z) - 0.085;
          for (const ang of [a0 + 0.1, a1 - 0.1]) {
            const ex = 0.12 + Math.cos(ang) * 0.36,
              ey = 0.12 + Math.sin(ang) * 0.36;
            const [lx, ly] = rot2(x - ex, y - ey, ang);
            d = smin(d, sdEllipsoid(lx, ly, z, 0.12, 0.2, 0.1), 0.06);
          }
          return d;
        },
        [0, 0, 0],
        0.52,
        80
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        {gloss(color, 0.36)}
      </mesh>
    </G>
  );
};

/** ringing arcs (handset-এর পাশে) — torus arc, k = 0..1 স্পন্দন */
export const RingArcs: React.FC<P & { k: number; color?: string }> = ({ k, color = C.orange, ...p }) => (
  <G {...p}>
    {[0, 1].map((i) => {
      const s = 1 + i * 0.55 + 0.12 * Math.sin(k * Math.PI * 2 - i);
      return (
        <mesh key={i} rotation={[0, 0, -0.75]} scale={s}>
          <torusGeometry args={[0.32, 0.045 / s, 14, 40, 1.4]} />
          <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.5} transparent opacity={0.95 - i * 0.25} />
        </mesh>
      );
    })}
  </G>
);

/** speech/chat bubble shape (rounded rect + নরম লেজ, এক outline) */
export const bubbleShape = (w: number, h: number, r: number, tailX: number, tailLen: number, tailW: number, tailDir = 1) => {
  const s = new THREE.Shape();
  const x0 = -w / 2,
    y0 = -h / 2,
    x1 = w / 2,
    y1 = h / 2;
  r = Math.min(r, w / 2, h / 2);
  const tl = Math.max(x0 + r + 0.01, tailX - tailW / 2),
    tr = Math.min(x1 - r - 0.01, tailX + tailW / 2);
  const tipX = tailX + tailDir * tailW * 0.9,
    tipY = y0 - tailLen;
  s.moveTo(x0 + r, y0);
  s.lineTo(tl, y0);
  s.quadraticCurveTo(tl + (tr - tl) * 0.55, y0 - tailLen * 0.25, tipX, tipY);
  s.quadraticCurveTo(tr - (tr - tl) * 0.1, y0 - tailLen * 0.35, tr, y0);
  s.lineTo(x1 - r, y0);
  s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x1, y1 - r);
  s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  s.lineTo(x0 + r, y1);
  s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + r);
  s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};

/** বড় পুরু speech bubble (quote-এর জন্য) — front face z = d/2; DOM screen এর উপর বসে */
export const SpeechBubble: React.FC<P & { w: number; h: number; tailX: number; tailLen?: number; tailDir?: number; color?: string }> = ({ w, h, tailX, tailLen = 0.55, tailDir = 1, color = "#FCFAF6", ...p }) => {
  const d = 0.32;
  const g = useMemo(() => {
    const geo = shapeGeo(bubbleShape(w, h, Math.min(0.55, h * 0.3), tailX, tailLen, 0.62, tailDir), d - 0.2, 0.1, 8);
    geo.translate(0, 0, -(d - 0.2) / 2);
    geo.computeVertexNormals();
    return geo;
  }, [w, h, tailX, tailLen, tailDir]);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <ClayMat color={color} rough={0.62} bump={0.12} sheen={0.35} />
      </mesh>
    </G>
  );
};
export const BUBBLE_D = 0.32;

/** ছোট chat bubble (message) — রঙিন, তিনটা উঁচু dot; w ≈ 1 */
export const ChatBlob: React.FC<P & { color?: string; dot?: string; phase?: number; flip?: boolean }> = ({ color = "#25C16F", dot = "#ffffff", phase = 0, flip = false, ...p }) => {
  const g = useMemo(() => {
    const geo = shapeGeo(bubbleShape(1.0, 0.66, 0.3, 0.22, 0.26, 0.3, 1), 0.12, 0.08, 6);
    geo.translate(0, 0, -0.06);
    geo.computeVertexNormals();
    return geo;
  }, []);
  return (
    <G {...p}>
      <group scale={[flip ? -1 : 1, 1, 1]}>
        <mesh geometry={g} castShadow>
          {gloss(color, 0.4)}
        </mesh>
      </group>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 0.22, Math.max(0, Math.sin(phase * 6 - i)) * 0.05, 0.16]} scale={[1, 1, 0.6]}>
          <sphereGeometry args={[0.07, 24, 16]} />
          <meshPhysicalMaterial color={dot} roughness={0.35} clearcoat={0.4} />
        </mesh>
      ))}
    </G>
  );
};

/** প্রশ্ন bubble — সাদা, কমলা "?" ; w ≈ 1 */
export const QuestionBlob: React.FC<P & { color?: string; ink?: string; mark?: string }> = ({ color = "#FCFAF6", ink = C.deepOrange, mark = "?", ...p }) => {
  const g = useMemo(() => {
    const geo = shapeGeo(bubbleShape(0.9, 0.8, 0.36, -0.15, 0.24, 0.28, -1), 0.14, 0.09, 6);
    geo.translate(0, 0, -0.07);
    geo.computeVertexNormals();
    return geo;
  }, []);
  return (
    <G {...p}>
      <mesh geometry={g} castShadow>
        <ClayMat color={color} rough={0.55} bump={0.1} />
      </mesh>
      <Txt size={0.56} color={ink} position={[0, -0.01, 0.18]}>
        {mark}
      </Txt>
    </G>
  );
};

/** parcel — kraft বাক্স + কমলা tape, এক টুকরা; w ≈ 0.8 */
export const Parcel: React.FC<P> = (p) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "a-parcel",
        (x, y, z) => sdRoundBox(x, y, z, 0.33, 0.25, 0.27, 0.07),
        [0, 0, 0],
        0.45,
        72,
        (x, y, z) => (Math.abs(x) < 0.07 && (y > 0.18 || z > 0.2) ? C.orange : "#D8AB72")
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <VClay rough={0.66} coat={0.08} />
      </mesh>
    </G>
  );
};

/** ছোট cart (e-commerce) — এক টুকরা basket + চাকা */
export const Cart: React.FC<P> = (p) => {
  const g = useMemo(
    () =>
      bakeSDF(
        "a-cart",
        (x, y, z) => {
          // basket: trapezoid-ish rounded box, ভেতর ফাঁপা
          const taper = 1 + (y - 0.45) * 0.5;
          let d = sdRoundBox(x / taper, y - 0.45, z / taper, 0.34, 0.17, 0.22, 0.05);
          d = smax(d, -sdRoundBox(x / taper, y - 0.55, z / taper, 0.3, 0.17, 0.18, 0.04), 0.02);
          d = smin(d, sdCapsule([x, y, z], [-0.44, 0.66, 0], [-0.62, 0.8, 0], 0.035), 0.03);
          d = smin(d, sdCapsule([x, y, z], [-0.38, 0.25, 0], [-0.44, 0.66, 0], 0.03), 0.03);
          for (const sx of [-0.25, 0.25]) for (const sz of [-0.16, 0.16]) d = smin(d, sdSphere(x - sx, y - 0.1, z - sz, 0.075), 0.02);
          return d;
        },
        [-0.1, 0.45, 0],
        0.6,
        92,
        (x, y) => (y < 0.18 ? C.deepNavy : x < -0.36 ? C.navy : C.orange)
      ),
    []
  );
  return (
    <G {...p}>
      <mesh geometry={g} castShadow receiveShadow>
        <VClay rough={0.45} coat={0.35} />
      </mesh>
    </G>
  );
};

/** লাল-ধূসর count badge (গম্বুজ disc + সংখ্যা) — ব্যাস 1 */
export const CountBadge: React.FC<P & { n: string; color?: string }> = ({ n, color = "#E4483A", ...p }) => {
  const g = useMemo(
    () =>
      latheGeo(
        [
          [0, -0.12],
          [0.42, -0.12],
          [0.5, -0.06],
          [0.5, 0.04],
          [0.44, 0.12],
          [0.25, 0.16],
          [0, 0.165],
        ],
        64
      ),
    []
  );
  const fs = n.length >= 3 ? 0.36 : 0.46;
  return (
    <G {...p}>
      <mesh geometry={g} rotation={[Math.PI / 2, 0, 0]} castShadow>
        {gloss(color, 0.34)}
      </mesh>
      <Txt size={fs} color="#ffffff" position={[0, -0.01, 0.18]}>
        {n}
      </Txt>
    </G>
  );
};

/** pill board (title) — পুরু নরম panel + দুই সুতা উপরে */
export const pillPath = (w: number, h: number) => roundedRectPath(w, h, h * 0.42) as THREE.Shape;
