// 30 clay icons — each is ONE implicit field (smooth unions = real fillets), painted zones only.
// Authored in a ~2-unit box (|x|,|y| ≤ ~1, |z| ≤ ~0.6) so every icon shares one scale.
import {
  smin, smax, ssub, inside, smooth01, sphere, ellipsoid, rbox, capsule, roundCone, torusX, torusY, torusZ,
  circle2, rrect2, poly2, star5, heart2, polarFold, rot2, extrude, puff, puffFront, latheProfile, smoothPoly, len2, clamp,
} from "./sdf";
import type { IconDef } from "./bake";

export const PAL = {
  cream: "#F6EFE6",
  white: "#FBF8F3",
  enamel: "#FBF7F1",
  orange: "#F5952B",
  gold: "#F6B23E",
  yellow: "#FFC23D",
  navy: "#1B4470",
  deep: "#0C3054",
  steel: "#4A84B9",
  sky: "#CFE4F3",
  green: "#2DBE60",
  led: "#3BD46F",
  red: "#EE5A52",
  silver: "#C3CDD6",
};
const P = PAL;
const N0: [number, number] = [0, 0];

// ---------- helpers ----------
const lathe = (half: number[], per = 5) => latheProfile(smoothPoly(half, per));

// 1 tooth — molar: crown with 4 cusps, gentle central fossa, two tapering roots
const tooth: IconDef = {
  key: "tooth",
  color: P.enamel,
  accent: P.orange,
  ink: P.deep,
  gloss: 0.5,
  sdf: (x, y0, z) => {
    const y = y0 - 0.06;
    let c = rbox(x, y - 0.3, z, 0.6, 0.34, 0.46, 0.3);
    const ax = Math.abs(x),
      az = Math.abs(z);
    c = smin(c, sphere(ax - 0.29, y - 0.55, az - 0.2, 0.27), 0.2);
    c = ssub(c, sphere(x, y - 1.0, z, 0.3), 0.18);
    const roots = roundCone(ax, y, z, 0.3, 0.1, 0, 0.34, -0.86, 0.03, 0.25, 0.09);
    return smin(c, roots, 0.26);
  },
};

// 2 map-pin — teardrop with a filleted through-hole
const mapPin: IconDef = {
  key: "map-pin",
  color: P.orange,
  accent: P.cream,
  ink: P.deep,
  sdf: (x, y, z0) => {
    const z = z0 / 0.8;
    let d = smin(sphere(x, y - 0.34, z, 0.6), roundCone(x, y, z, 0, 0.22, 0, 0, -0.9, 0, 0.44, 0.05), 0.3) * 0.8;
    d = ssub(d, len2(x, y - 0.34) - 0.2, 0.12);
    return d;
  },
  paint: (x, y, z) => [z > -0.05 ? inside(len2(x, y - 0.34) - 0.31, 0.02) : 0, 0],
};

// 3 shield-check
const shieldPts = (() => {
  const half: number[] = [];
  // top edge (slight crown), right side, curved belly to the point
  for (let i = 0; i <= 8; i++) {
    const x = (i / 8) * 0.72;
    half.push(x, 0.8 + 0.06 * Math.cos((x / 0.72) * (Math.PI / 2)));
  }
  half.push(0.76, 0.7, 0.76, 0.2);
  const belly = smoothPoly([0.76, 0.2, 0.7, -0.22, 0.52, -0.56, 0.27, -0.8, 0, -0.94], 5);
  for (let i = 2; i < belly.length; i += 2) half.push(belly[i], belly[i + 1]);
  // mirror (left side, top → bottom reversed)
  const right = half;
  const out: number[] = [];
  for (let i = 0; i < right.length; i += 2) out.push(right[i], right[i + 1]);
  for (let i = right.length - 4; i >= 2; i -= 2) out.push(-right[i], right[i + 1]);
  return out;
})();
const shieldTick = (x: number, y: number, z: number) =>
  Math.min(capsule(x, y, z, -0.3, 0.02, 0.26, -0.07, -0.22, 0.26, 0.085), capsule(x, y, z, -0.07, -0.22, 0.26, 0.33, 0.3, 0.26, 0.085));
const shield: IconDef = {
  key: "shield-check",
  color: P.navy,
  accent: P.orange,
  ink: P.steel,
  sdf: (x, y, z) => {
    const d2 = poly2(x, y, shieldPts) - 0.05;
    let d = puff(d2, z, 0.12, 0.1, 0.14, 0.45);
    const zf = puffFront(-0.14, 0.12, 0.14, 0.45);
    d = ssub(d, len2(d2 + 0.14, z - zf) - 0.03, 0.02);
    return smin(d, shieldTick(x, y, z), 0.07);
  },
  paint: (x, y, z) => [inside(shieldTick(x, y, z) - 0.012, 0.02), 0],
};

// 4 padlock
const lockKey2 = (x: number, y: number) => smin(circle2(x, y + 0.2, 0.1), rrect2(x, y + 0.38, 0.045, 0.14, 0.04), 0.04);
const padlock: IconDef = {
  key: "padlock",
  color: P.orange,
  accent: P.silver,
  ink: P.deep,
  sdf: (x, y, z) => {
    const body = rbox(x, y + 0.3, z, 0.62, 0.45, 0.3, 0.2);
    const arc = smax(torusZ(x, y - 0.18, z, 0.36, 0.105), -(y - 0.18), 0.0);
    const legs = capsule(Math.abs(x), y, z, 0.36, 0.18, 0, 0.36, -0.2, 0, 0.105);
    let d = smin(body, Math.min(arc, legs), 0.08);
    d = ssub(d, extrude(lockKey2(x, y), z - 0.3, 0.09, 0.02), 0.025);
    return d;
  },
  paint: (x, y, z) => [smooth01(0.12, 0.2, y), z > 0.12 ? inside(lockKey2(x, y) - 0.02, 0.02) : 0],
};

// 5 key
const key2 = (x: number, y: number) => {
  const [u, v] = rot2(x, y, 0.75);
  let d = smin(circle2(u + 0.5, v, 0.38), rrect2(u - 0.32, v, 0.56, 0.1, 0.08), 0.12);
  d = smin(d, rrect2(u - 0.56, v + 0.2, 0.075, 0.16, 0.05), 0.06);
  d = smin(d, rrect2(u - 0.8, v + 0.16, 0.075, 0.12, 0.05), 0.06);
  d = smax(d, -circle2(u + 0.56, v, 0.16), 0.05);
  return d;
};
const key: IconDef = {
  key: "key",
  color: P.gold,
  accent: P.orange,
  ink: P.deep,
  sdf: (x, y, z) => puff(key2(x, y), z, 0.11, 0.09, 0.05, 0.2),
};

// 6 globe — sphere with fused latitude/longitude ridges
const globeLines = (x: number, y: number, z: number) => {
  const R = 0.86,
    r = 0.034;
  let d = torusY(x, y, z, R, r);
  const pr = Math.sqrt(R * R - 0.46 * 0.46);
  d = Math.min(d, torusY(x, Math.abs(y) - 0.46, z, pr, r));
  for (let i = 0; i < 3; i++) {
    const [u, w] = rot2(x, z, (i * Math.PI) / 3 + 0.3);
    d = Math.min(d, len2(len2(u, y) - R, w) - r);
  }
  return d;
};
const globe: IconDef = {
  key: "globe",
  color: P.steel,
  accent: P.cream,
  ink: P.deep,
  sdf: (x, y, z) => smin(sphere(x, y, z, 0.86), globeLines(x, y, z), 0.035),
  paint: (x, y, z) => [inside(globeLines(x, y, z) - 0.004, 0.012), 0],
};

// 7 server — three fused rack units, LEDs + vent slots
const srvLeds = (x: number, y: number, z: number) => {
  const yi = Math.round(clamp(y / 0.56, -1, 1)) * 0.56;
  return Math.min(sphere(x - 0.44, y - yi, z - 0.41, 0.065), sphere(x - 0.27, y - yi, z - 0.41, 0.05));
};
const srvSlots = (x: number, y: number, z: number) => {
  const yi = Math.round(clamp(y / 0.56, -1, 1)) * 0.56;
  return Math.min(capsule(x, y, z, -0.5, yi + 0.06, 0.44, -0.05, yi + 0.06, 0.44, 0.028), capsule(x, y, z, -0.5, yi - 0.06, 0.44, -0.05, yi - 0.06, 0.44, 0.028));
};
const server: IconDef = {
  key: "server",
  color: P.navy,
  accent: P.led,
  ink: "#8FB2D4",
  sdf: (x, y, z) => {
    let d = 1e9;
    for (let i = -1; i <= 1; i++) d = smin(d, rbox(x, y - i * 0.56, z, 0.66, 0.25, 0.44, 0.13), 0.06);
    d = smin(d, srvLeds(x, y, z), 0.03);
    return ssub(d, srvSlots(x, y, z), 0.02);
  },
  paint: (x, y, z) => [inside(srvLeds(x, y, z) - 0.01, 0.015), inside(srvSlots(x, y, z) - 0.02, 0.015)],
};

// 8 cloud — metaballs, flattened belly
const cloud: IconDef = {
  key: "cloud",
  color: P.white,
  accent: "#BFD5EC",
  ink: P.deep,
  sdf: (x, y0, z0) => {
    const y = y0 + 0.1,
      z = z0 / 0.8;
    let d = sphere(x + 0.5, y + 0.06, z, 0.4);
    d = smin(d, sphere(x + 0.06, y - 0.16, z, 0.52), 0.24);
    d = smin(d, sphere(x - 0.5, y + 0.02, z, 0.42), 0.24);
    d = smin(d, sphere(x - 0.1, y + 0.18, z, 0.46), 0.24);
    d = smax(d * 0.8, -(y + 0.4), 0.16);
    return d;
  },
  paint: (x, y) => [0.45 * smooth01(0.05, -0.5, y), 0],
};

// 9 gear
const gear2 = (x: number, y: number) => {
  const [fx, fy] = polarFold(x, y, 8);
  let d = smin(circle2(x, y, 0.62), rrect2(fx - 0.74, fy, 0.17, 0.14, 0.06), 0.09);
  return smax(d, -circle2(x, y, 0.22), 0.05);
};
const gear: IconDef = {
  key: "gear",
  color: P.orange,
  accent: P.cream,
  ink: P.deep,
  sdf: (x, y, z) => smin(puff(gear2(x, y), z, 0.15, 0.09, 0.03, 0.2), torusZ(x, y, Math.abs(z) - 0.18, 0.33, 0.055), 0.05),
  paint: (x, y) => [inside(len2(x, y) - 0.4, 0.02), 0],
};

// 10 wrench (authored vertical, rotated 45°)
const wrench2 = (x: number, y: number) => {
  const [u, v] = rot2(x, y, 0.785);
  let d = smin(rrect2(u, v + 0.2, 0.12, 0.55, 0.12), circle2(u, v - 0.52, 0.34), 0.14);
  d = smin(d, circle2(u, v + 0.76, 0.18), 0.12);
  d = smax(d, -rrect2(u, v - 0.84, 0.125, 0.32, 0.06), 0.04);
  d = smax(d, -circle2(u, v + 0.76, 0.07), 0.03);
  return d;
};
const wrench: IconDef = {
  key: "wrench",
  color: P.silver,
  accent: P.orange,
  ink: P.deep,
  sdf: (x, y, z) => puff(wrench2(x, y), z, 0.08, 0.07, 0.05, 0.16),
  paint: (x, y) => {
    const [, v] = rot2(x, y, 0.785);
    return [smooth01(-0.05, -0.15, v), 0];
  },
};

// 11 magnifier
const magnifier: IconDef = {
  key: "magnifier",
  color: P.navy,
  accent: P.sky,
  ink: P.orange,
  sdf: (x, y, z) => {
    const cx = x + 0.2,
      cy = y - 0.2;
    let d = smin(torusZ(cx, cy, z, 0.44, 0.11), extrude(circle2(cx, cy, 0.44), z, 0.035, 0.03), 0.05);
    d = smin(d, roundCone(x, y, z, 0.16, -0.16, 0, 0.72, -0.72, 0, 0.09, 0.13), 0.09);
    return d;
  },
  paint: (x, y) => {
    const cx = x + 0.2,
      cy = y - 0.2;
    const proj = (cx - cy) / Math.SQRT2;
    return [inside(len2(cx, cy) - 0.37, 0.02), smooth01(0.6, 0.66, proj)];
  },
};

// 12 envelope
const envSeal = (x: number, y: number) => circle2(x, y + 0.04, 0.17);
const envelope: IconDef = {
  key: "envelope",
  color: P.white,
  accent: P.orange,
  ink: P.deep,
  sdf: (x, y, z) => {
    let d = puff(rrect2(x, y, 0.9, 0.6, 0.14), z, 0.1, 0.08, 0.05, 0.3);
    const zf = 0.15;
    const flap = Math.min(capsule(x, y, z, -0.8, 0.5, zf, 0, -0.04, zf, 0.04), capsule(x, y, z, 0.8, 0.5, zf, 0, -0.04, zf, 0.04));
    d = smin(d, flap, 0.04);
    const folds = Math.min(capsule(x, y, z, -0.84, -0.54, zf, -0.2, 0.04, zf, 0.022), capsule(x, y, z, 0.84, -0.54, zf, 0.2, 0.04, zf, 0.022));
    d = ssub(d, folds, 0.015);
    d = smin(d, extrude(envSeal(x, y), z - 0.17, 0.045, 0.035), 0.03);
    return d;
  },
  paint: (x, y, z) => [z > 0.08 ? inside(envSeal(x, y) - 0.02, 0.02) : 0, 0],
};

// 13 bell — lathe profile, hollow mouth, hanging clapper, top loop
const bellP = lathe([0, -0.5, 0.72, -0.5, 0.8, -0.47, 0.79, -0.39, 0.62, -0.26, 0.52, 0.0, 0.47, 0.3, 0.39, 0.52, 0.2, 0.63, 0, 0.65]);
const bell: IconDef = {
  key: "bell",
  color: P.gold,
  accent: P.orange,
  ink: P.deep,
  sdf: (x, y0, z) => {
    const y = y0 + 0.04;
    let d = poly2(len2(x, z), y, bellP) - 0.03;
    d = ssub(d, ellipsoid(x, y + 0.53, z, 0.66, 0.32, 0.66), 0.06);
    d = smin(d, torusZ(x, y - 0.76, z, 0.1, 0.042), 0.05);
    d = smin(d, sphere(x, y + 0.52, z, 0.14), 0.02);
    d = smin(d, capsule(x, y, z, 0, -0.2, 0, 0, -0.5, 0, 0.04), 0.04);
    return d;
  },
  paint: (x, y0, z) => [inside(sphere(x, y0 + 0.04 + 0.52, z, 0.17), 0.02), 0],
};

// 14 chart-up — tile with rising bars and a growth arrow
const chartBars = (x: number, y: number, z: number) => {
  const xs = [-0.45, 0, 0.45],
    hs = [0.28, 0.46, 0.66];
  let d = 1e9;
  for (let i = 0; i < 3; i++) d = Math.min(d, rbox(x - xs[i], y - (-0.6 + hs[i] / 2), z - 0.12, 0.12, hs[i] / 2, 0.1, 0.06));
  return d;
};
const arrowHead = [0.68, 0.74, 0.36, 0.64, 0.58, 0.42];
const chartArrow = (x: number, y: number, z: number) => {
  const zc = 0.16,
    r = 0.045;
  let d = capsule(x, y, z, -0.62, 0.02, zc, -0.25, 0.3, zc, r);
  d = Math.min(d, capsule(x, y, z, -0.25, 0.3, zc, 0.05, 0.12, zc, r));
  d = Math.min(d, capsule(x, y, z, 0.05, 0.12, zc, 0.5, 0.56, zc, r));
  d = smin(d, extrude(poly2(x, y, arrowHead) - 0.02, z - zc, 0.045, 0.035), 0.03);
  return d;
};
const chartUp: IconDef = {
  key: "chart-up",
  color: P.cream,
  accent: P.orange,
  ink: P.green,
  sdf: (x, y, z) => {
    let d = puff(rrect2(x, y, 0.85, 0.85, 0.3), z, 0.09, 0.08, 0.03, 0.3);
    d = smin(d, chartBars(x, y, z), 0.04);
    return smin(d, chartArrow(x, y, z), 0.035);
  },
  paint: (x, y, z) => [z > 0.1 ? inside(chartBars(x, y, z) - 0.01, 0.015) : 0, inside(chartArrow(x, y, z) - 0.01, 0.015)],
};

// 15 star
const star: IconDef = {
  key: "star",
  color: P.gold,
  accent: P.orange,
  ink: P.deep,
  sdf: (x, y, z) => puff(star5(x, y + 0.08, 0.86, 0.5) - 0.07, z, 0.1, 0.09, 0.16, 0.45),
};

// 16 calendar
const calCell = (x: number, y: number, z: number) => {
  const i = Math.round(clamp((x + 0.51) / 0.34, 0, 3)),
    j = Math.round(clamp((0.08 - y) / 0.28, 0, 2));
  return rbox(x - (-0.51 + i * 0.34), y - (0.08 - j * 0.28), z - 0.16, 0.1, 0.085, 0.05, 0.04);
};
const calRings = (x: number, y: number, z: number) => torusX(Math.abs(x) - 0.36, y - 0.68, z, 0.13, 0.045);
const calendar: IconDef = {
  key: "calendar",
  color: P.cream,
  accent: P.orange,
  ink: P.navy,
  sdf: (x, y, z) => {
    let d = puff(rrect2(x, y + 0.08, 0.82, 0.76, 0.22), z, 0.13, 0.1, 0.03, 0.25);
    d = ssub(d, Math.max(len2(y - 0.33, z - 0.16) - 0.02, Math.abs(x) - 0.74), 0.015);
    d = smin(d, calCell(x, y, z), 0.02);
    return smin(d, calRings(x, y, z), 0.03);
  },
  paint: (x, y, z) => {
    const cell = z > 0.1 ? inside(calCell(x, y, z) - 0.006, 0.012) : 0;
    const hi = cell * inside(len2(x - 0.17, y + 0.2) - 0.14, 0.01);
    const ring = inside(calRings(x, y, z) - 0.01, 0.015);
    const head = smooth01(0.33, 0.37, y) * (1 - ring);
    return [Math.max(head, hi), Math.max(ring, cell * 0.3 * (1 - hi))];
  },
};

// 17 clock (face only — hands are separate pivoting parts, like a real clock)
const clockTicks = (x: number, y: number, z: number) => {
  const [fx, fy] = polarFold(x, y, 12);
  return capsule(fx, fy, z, 0.54, 0, 0.1, 0.63, 0, 0.1, 0.034);
};
const clock: IconDef = {
  key: "clock",
  color: P.cream,
  accent: P.orange,
  ink: P.navy,
  sdf: (x, y, z) => {
    let d = puff(circle2(x, y, 0.86), z, 0.15, 0.1, -0.05, 0.4);
    d = smin(d, torusZ(x, y, Math.abs(z) - 0.13, 0.79, 0.08), 0.04);
    return smin(d, clockTicks(x, y, z), 0.02);
  },
  paint: (x, y, z) => [smooth01(0.7, 0.74, len2(x, y)), inside(clockTicks(x, y, z) - 0.006, 0.012)],
};

// 18 hourglass — glass, caps and posts in one lathe-based field; sand is painted (prop `sand` 0..1)
const glassP = latheProfile(smoothPoly([0, 0, 0.085, 0, 0.17, 0.09, 0.33, 0.25, 0.43, 0.43, 0.44, 0.58, 0.38, 0.7, 0, 0.7], 5));
// latheProfile mirrors rho; we use |y| so the profile only needs the upper half
const hgPost = (x: number, y: number, z: number) => {
  const [fx, fz] = polarFold(x, z, 3);
  return capsule(fx, y, fz, 0.5, -0.78, 0, 0.5, 0.78, 0, 0.042);
};
const hourglass: IconDef = {
  key: "hourglass",
  color: "#E6EFF6",
  accent: P.orange,
  ink: P.navy,
  sdf: (x, y, z) => {
    const rho = len2(x, z),
      ay = Math.abs(y);
    let d = poly2(rho, ay, glassP) - 0.02;
    d = smin(d, rrect2(rho, ay - 0.82, 0.6, 0.085, 0.07), 0.06);
    return smin(d, hgPost(x, y, z), 0.05);
  },
  paint: (x, y, z, o) => {
    const ay = Math.abs(y);
    const post = inside(hgPost(x, y, z) - 0.01, 0.015);
    const cap = smooth01(0.69, 0.73, ay);
    const ink = Math.max(post, cap);
    const s = clamp(o.sand ?? 0.35);
    const top = smooth01(0.02, 0.05, y) * (1 - smooth01(0.06 + (1 - s) * 0.5 - 0.02, 0.06 + (1 - s) * 0.5 + 0.02, y)) * (s < 0.999 ? 1 : 0);
    const bot = (1 - smooth01(-0.7 + s * 0.48 - 0.02, -0.7 + s * 0.48 + 0.02, y)) * smooth01(-0.72, -0.69, y);
    const stream = s > 0.01 && s < 0.99 ? inside(Math.abs(y) - 0.08, 0.02) : 0;
    return [(1 - ink) * Math.max(top, bot, stream), ink];
  },
};

// 19 megaphone — revolved about x, hollow bell, handle
const megaP = latheProfile(smoothPoly([0, -0.82, 0.17, -0.82, 0.2, -0.75, 0.2, -0.45, 0.28, -0.1, 0.42, 0.25, 0.6, 0.6, 0.66, 0.68, 0.64, 0.75, 0, 0.75], 5));
const megaCav = (x: number, y: number, z: number) => roundCone(x, y, z, 0.86, 0, 0, -0.12, 0, 0, 0.56, 0.1);
const megaHandle = (x: number, y: number, z: number) => capsule(x, y, z, -0.3, -0.2, 0, -0.4, -0.62, 0, 0.085);
const megaphone: IconDef = {
  key: "megaphone",
  color: P.orange,
  accent: P.cream,
  ink: P.navy,
  sdf: (x, y, z) => {
    let d = poly2(len2(y, z), x, megaP) - 0.025;
    d = ssub(d, megaCav(x, y, z), 0.05);
    return smin(d, megaHandle(x, y, z), 0.08);
  },
  paint: (x, y, z) => [inside(megaCav(x, y, z) - 0.03, 0.02), y < -0.15 ? inside(megaHandle(x, y, z) - 0.015, 0.02) : 0],
};

// 20 cart — open basket with engraved wire lines, handle, rails, wheels
const cartTrap = [-0.62, 0.36, 0.78, 0.36, 0.6, -0.26, -0.42, -0.26];
const cartWheels = (x: number, y: number, z: number) => {
  const cx = x < 0.1 ? -0.3 : 0.5;
  return extrude(circle2(x - cx, y + 0.58, 0.12), Math.abs(z) - 0.3, 0.055, 0.045);
};
const cartGrip = (x: number, y: number, z: number) => capsule(x, y, z, -0.9, 0.62, -0.38, -0.9, 0.62, 0.38, 0.06);
const cart: IconDef = {
  key: "cart",
  color: P.orange,
  accent: P.cream,
  ink: P.navy,
  sdf: (x, y, z) => {
    const az = Math.abs(z);
    let d = extrude(poly2(x, y, cartTrap), z, 0.38, 0.08);
    d = ssub(d, extrude(poly2(x, y - 0.12, cartTrap) + 0.07, z, 0.31, 0.06), 0.03);
    const ln = Math.min(len2(y - 0.14, az - 0.38), len2(y + 0.06, az - 0.38)) - 0.022;
    d = ssub(d, ln, 0.015);
    let f = capsule(x, y, az, -0.58, 0.3, 0.3, -0.9, 0.62, 0.3, 0.05);
    f = Math.min(f, cartGrip(x, y, z));
    f = Math.min(f, capsule(x, y, az, -0.38, -0.42, 0.3, 0.62, -0.42, 0.3, 0.045));
    f = Math.min(f, capsule(x, y, az, -0.33, -0.2, 0.3, -0.3, -0.45, 0.3, 0.045), capsule(x, y, az, 0.52, -0.2, 0.3, 0.5, -0.45, 0.3, 0.045));
    d = smin(d, f, 0.05);
    return smin(d, cartWheels(x, y, z), 0.04);
  },
  paint: (x, y, z) => [inside(cartGrip(x, y, z) - 0.01, 0.015), smooth01(-0.44, -0.48, y)],
};

// 21 shopping-bag
const bag: IconDef = {
  key: "shopping-bag",
  color: P.orange,
  accent: P.cream,
  ink: P.navy,
  sdf: (x, y, z) => {
    const taper = 1 + 0.08 * (y + 0.2);
    let d = rbox(x * taper, y + 0.22, z, 0.62, 0.6, 0.27, 0.14);
    d = ssub(d, len2(y - 0.26, Math.abs(z) - 0.27) - 0.018, 0.012);
    return smin(d, torusZ(x, y - 0.38, Math.abs(z) - 0.14, 0.3, 0.052), 0.05);
  },
  paint: (x, y) => [smooth01(0.37, 0.42, y), 0],
};

// 22 document — dog-ear, text lines
const docLines = (x: number, y: number, z: number) => {
  const zc = 0.12,
    r = 0.034;
  let d = capsule(x, y, z, -0.42, 0.5, zc, 0.04, 0.5, zc, r + 0.008);
  const rows: [number, number][] = [[0.26, 0.42], [0.06, 0.42], [-0.14, 0.42], [-0.34, 0.42], [-0.54, 0.1]];
  for (const [yy, xe] of rows) d = Math.min(d, capsule(x, y, z, -0.42, yy, zc, xe, yy, zc, r));
  return d;
};
const docFold = [0.3, 0.84, 0.64, 0.5, 0.3, 0.5];
const document_: IconDef = {
  key: "document",
  color: P.white,
  accent: P.orange,
  ink: "#8EA7C0",
  sdf: (x, y, z) => {
    let d2 = rrect2(x, y, 0.64, 0.84, 0.12);
    d2 = smax(d2, (x + y - 1.14) / Math.SQRT2, 0.03);
    let d = puff(d2, z, 0.1, 0.07, 0.02, 0.2);
    d = smin(d, extrude(poly2(x, y, docFold) - 0.02, z - 0.125, 0.03, 0.025), 0.02);
    return smin(d, docLines(x, y, z), 0.02);
  },
  paint: (x, y, z) => {
    const ln = inside(docLines(x, y, z) - 0.01, 0.012);
    const title = ln * smooth01(0.4, 0.44, y);
    return [title, Math.max(ln * (1 - title), 0.16 * inside(poly2(x, y, docFold), 0.02))];
  },
};

// 23 stamp — knob handle, waisted neck, base with rubber pad
const stampP = lathe([0, -0.74, 0.58, -0.74, 0.62, -0.68, 0.62, -0.52, 0.55, -0.45, 0.32, -0.36, 0.17, -0.18, 0.13, 0.08, 0.16, 0.24, 0, 0.26]);
const stamp: IconDef = {
  key: "stamp",
  color: P.navy,
  accent: P.orange,
  ink: P.cream,
  sdf: (x, y0, z) => {
    const y = y0 + 0.04;
    return smin(poly2(len2(x, z), y, stampP) - 0.025, sphere(x, y - 0.5, z, 0.3), 0.12);
  },
  paint: (x, y0) => {
    const y = y0 + 0.04;
    return [1 - smooth01(-0.6, -0.56, y), smooth01(-0.6, -0.56, y) * (1 - smooth01(-0.47, -0.43, y))];
  },
};

// 24 phone-handset — classic arched handset
const handset2 = (x0: number, y0: number) => {
  const [x, y] = rot2(x0 + 0.12, y0 - 0.2, 0.55);
  const cy = -1.05,
    R = 1.15,
    A = 0.62;
  const ang = Math.atan2(x, y - cy);
  const ex = R * Math.sin(A),
    ey = cy + R * Math.cos(A);
  const band = Math.abs(ang) < A ? Math.abs(len2(x, y - cy) - R) - 0.14 : len2(Math.abs(x) - ex, y - ey) - 0.14;
  const [u, v] = rot2(Math.abs(x) - ex, y - ey, A);
  const cup = rrect2(u - 0.02, v + 0.12, 0.27, 0.17, 0.15);
  return smin(band, cup, 0.14);
};
const handset: IconDef = {
  key: "phone-handset",
  color: P.green,
  accent: P.cream,
  ink: P.deep,
  sdf: (x, y, z) => puff(handset2(x, y), z, 0.14, 0.12, 0.06, 0.2),
};

// 25 chat-bubble — puffy bubble with tail + typing dots
const chatDots = (x: number, y: number, z: number) => sphere(Math.abs(x) < 0.18 ? x : Math.abs(x) - 0.36, y - 0.1, z - 0.2, 0.11);
const chat: IconDef = {
  key: "chat-bubble",
  color: P.orange,
  accent: "#FFF6EC",
  ink: P.deep,
  sdf: (x, y, z) => {
    const d2 = smin(rrect2(x, y - 0.1, 0.88, 0.62, 0.42), poly2(x, y, [-0.55, -0.32, -0.15, -0.44, -0.74, -0.86]), 0.12);
    return smin(puff(d2, z, 0.12, 0.1, 0.12, 0.35), chatDots(x, y, z), 0.05);
  },
  paint: (x, y, z) => [inside(chatDots(x, y, z) - 0.012, 0.015), 0],
};

// 26 rocket — lathe body + nozzle, 3 fins, porthole
const rocketP = lathe([0, -0.6, 0.22, -0.6, 0.3, -0.45, 0.33, -0.1, 0.32, 0.2, 0.26, 0.45, 0.15, 0.67, 0.05, 0.8, 0, 0.83]);
const nozzleP = latheProfile([0, -0.82, 0.21, -0.82, 0.23, -0.78, 0.15, -0.58, 0, -0.58]);
const finD = (x: number, y: number, z: number) => {
  const [fx, fz] = polarFold(x, z, 3);
  return extrude(poly2(fx, y, [0.2, -0.08, 0.52, -0.5, 0.54, -0.7, 0.24, -0.56]) - 0.03, fz, 0.045, 0.04);
};
const rocket: IconDef = {
  key: "rocket",
  color: P.cream,
  accent: P.orange,
  ink: P.navy,
  sdf: (x, y, z) => {
    const rho = len2(x, z);
    let d = poly2(rho, y, rocketP) - 0.02;
    d = smin(d, poly2(rho, y, nozzleP) - 0.02, 0.04);
    d = smin(d, finD(x, y, z), 0.07);
    d = smin(d, torusZ(x, y - 0.18, z - 0.31, 0.12, 0.04), 0.03);
    return smin(d, sphere(x, y - 0.18, z - 0.22, 0.12), 0.02);
  },
  paint: (x, y, z) => {
    const fin = inside(finD(x, y, z) - 0.02, 0.02);
    const nose = smooth01(0.5, 0.54, y);
    const win = z > 0.22 ? inside(len2(x, y - 0.18) - 0.09, 0.012) : 0;
    const noz = 1 - smooth01(-0.62, -0.58, y);
    return [Math.max(fin, nose) * (1 - noz), Math.max(win, noz)];
  },
};

// 27 lightning
const boltPts = [0.18, 0.95, -0.5, -0.02, -0.06, -0.02, -0.26, -0.95, 0.52, 0.12, 0.08, 0.12, 0.42, 0.95];
const lightning: IconDef = {
  key: "lightning",
  color: P.yellow,
  accent: P.orange,
  ink: P.deep,
  sdf: (x, y, z) => puff(poly2(x, y, boltPts) - 0.05, z, 0.1, 0.08, 0.08, 0.18),
};

// 28 heart
const heart: IconDef = {
  key: "heart",
  color: P.red,
  accent: P.orange,
  ink: P.deep,
  sdf: (x, y, z) => {
    const s = 1.55;
    return puff(heart2(x / s, (y + 0.86) / s) * s - 0.03, z, 0.12, 0.1, 0.2, 0.5);
  },
};

// 29 home
const homeDoor = (x: number, y: number) => rrect2(x, y + 0.58, 0.14, 0.22, 0.1);
const homeWin = (x: number, y: number) => Math.min(rrect2(x - 0.34, y + 0.3, 0.1, 0.1, 0.035), rrect2(x + 0.34, y + 0.3, 0.1, 0.1, 0.035));
const homeChim = (x: number, y: number, z: number) => rbox(x - 0.42, y - 0.48, z + 0.12, 0.09, 0.2, 0.09, 0.04);
const home: IconDef = {
  key: "home",
  color: P.cream,
  accent: P.orange,
  ink: P.navy,
  sdf: (x, y, z) => {
    let d = rbox(x, y + 0.4, z, 0.56, 0.42, 0.44, 0.08);
    d = smin(d, extrude(poly2(x, y, [-0.82, 0.0, 0.82, 0.0, 0, 0.74]) - 0.05, z, 0.54, 0.07), 0.04);
    d = smin(d, homeChim(x, y, z), 0.03);
    d = ssub(d, extrude(homeDoor(x, y), z - 0.44, 0.05, 0.02), 0.02);
    d = ssub(d, extrude(homeWin(x, y), z - 0.44, 0.04, 0.015), 0.015);
    d = ssub(d, extrude(circle2(x, y - 0.3, 0.1), z - 0.54, 0.045, 0.015), 0.015);
    return d;
  },
  paint: (x, y, z) => {
    const chim = inside(homeChim(x, y, z) - 0.01, 0.015);
    const roof = smooth01(-0.03, 0.02, y) * (1 - chim) * (z > 0.42 ? 1 - inside(circle2(x, y - 0.3, 0.12), 0.01) : 1);
    const front = z > 0.36 ? Math.max(inside(homeDoor(x, y) - 0.015, 0.012), inside(homeWin(x, y) - 0.012, 0.012)) : 0;
    const gable = z > 0.48 ? inside(circle2(x, y - 0.3, 0.115), 0.01) : 0;
    return [roof, Math.max(front, gable, chim)];
  },
};

// 30 users — two busts fused (front + back)
const person = (x: number, y: number, z: number, hy: number, hr: number, by: number, b: [number, number, number]) => {
  const head = sphere(x, y - hy, z, hr);
  const bust = smax(ellipsoid(x, y - by, z, b[0], b[1], b[2]), -(y + 0.64), 0.08);
  return smin(head, bust, 0.12);
};
const uFront = (x: number, y: number, z: number) => person(x - 0.26, y + 0.04, z - 0.16, 0.24, 0.29, -0.66, [0.54, 0.54, 0.34]);
const uBack = (x: number, y: number, z: number) => person(x + 0.4, y, z + 0.14, 0.4, 0.25, -0.45, [0.44, 0.52, 0.28]);
const users: IconDef = {
  key: "users",
  color: P.navy,
  accent: P.orange,
  ink: P.deep,
  sdf: (x, y, z) => smin(uFront(x, y, z), uBack(x, y, z), 0.05),
  paint: (x, y, z) => [smooth01(-0.02, 0.02, uFront(x, y, z) - uBack(x, y, z)), 0],
};

export const DEFS: Record<string, IconDef> = Object.fromEntries(
  [tooth, mapPin, shield, padlock, key, globe, server, cloud, gear, wrench, magnifier, envelope, bell, chartUp, star, calendar, clock, hourglass, megaphone, cart, bag, document_, stamp, handset, chat, rocket, lightning, heart, home, users].map((d) => [d.key, d])
);
export const ICON_KEYS = Object.keys(DEFS);
void N0;
void puffFront;
