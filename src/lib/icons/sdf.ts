// Signed-distance toolkit for the clay icon family. Every icon = ONE implicit field (smooth unions give real
// fillets), polygonised once by MarchingCubes in bake.ts → no stuck-together pieces anywhere.
// All functions are plain-number (no allocation) because each icon is evaluated ~10^6 times.

export type SDF = (x: number, y: number, z: number) => number;
export type D2 = (x: number, y: number) => number;

const { sqrt, abs, max, min, atan2, cos, sin, PI } = Math;
export const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const len2 = (x: number, y: number) => sqrt(x * x + y * y);
export const len3 = (x: number, y: number, z: number) => sqrt(x * x + y * y + z * z);

/** polynomial smooth min (fillet of radius ~k) */
export const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return min(a, b);
  const h = max(k - abs(a - b), 0) / k;
  return min(a, b) - h * h * k * 0.25;
};
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
/** smooth subtraction a − b */
export const ssub = (a: number, b: number, k: number) => smax(a, -b, k);
export const sminN = (k: number, ...d: number[]) => d.reduce((a, b) => smin(a, b, k));

/** 0..1 paint weight from a region distance (inside → 1), soft edge of width w */
export const inside = (d: number, w = 0.012) => clamp(0.5 - d / (2 * w));
export const smooth01 = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

// ---------------- 3D primitives ----------------
export const sphere = (x: number, y: number, z: number, r: number) => sqrt(x * x + y * y + z * z) - r;
/** approximate ellipsoid (iq) */
export const ellipsoid = (x: number, y: number, z: number, a: number, b: number, c: number) => {
  const k0 = len3(x / a, y / b, z / c);
  const k1 = len3(x / (a * a), y / (b * b), z / (c * c));
  return (k0 * (k0 - 1)) / Math.max(1e-6, k1);
};
/** rounded box, half extents + corner radius */
export const rbox = (x: number, y: number, z: number, bx: number, by: number, bz: number, r: number) => {
  const qx = abs(x) - bx + r,
    qy = abs(y) - by + r,
    qz = abs(z) - bz + r;
  return len3(max(qx, 0), max(qy, 0), max(qz, 0)) + min(max(qx, max(qy, qz)), 0) - r;
};
/** capsule between a and b */
export const capsule = (x: number, y: number, z: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r: number) => {
  const px = x - ax,
    py = y - ay,
    pz = z - az,
    ex = bx - ax,
    ey = by - ay,
    ez = bz - az;
  const h = clamp((px * ex + py * ey + pz * ez) / (ex * ex + ey * ey + ez * ez));
  return len3(px - ex * h, py - ey * h, pz - ez * h) - r;
};
/** tapered capsule (round cone) between a (radius r1) and b (radius r2) — iq */
export const roundCone = (x: number, y: number, z: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r1: number, r2: number) => {
  const bax = bx - ax,
    bay = by - ay,
    baz = bz - az;
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = r1 - r2;
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  const pax = x - ax,
    pay = y - ay,
    paz = z - az;
  const yy = pax * bax + pay * bay + paz * baz;
  const zz = yy - l2;
  const xvx = pax * l2 - bax * yy,
    xvy = pay * l2 - bay * yy,
    xvz = paz * l2 - baz * yy;
  const x2 = xvx * xvx + xvy * xvy + xvz * xvz;
  const y2 = yy * yy * l2;
  const z2 = zz * zz * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(zz) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(yy) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
};
/** torus lying in the plane ⟂ axis; axis 'y' = ring in xz, 'z' = ring in xy (faces camera) */
export const torusY = (x: number, y: number, z: number, R: number, r: number) => len2(len2(x, z) - R, y) - r;
export const torusZ = (x: number, y: number, z: number, R: number, r: number) => len2(len2(x, y) - R, z) - r;
export const torusX = (x: number, y: number, z: number, R: number, r: number) => len2(len2(y, z) - R, x) - r;

// ---------------- 2D primitives ----------------
export const circle2 = (x: number, y: number, r: number) => len2(x, y) - r;
export const rrect2 = (x: number, y: number, bx: number, by: number, r: number) => {
  const qx = abs(x) - bx + r,
    qy = abs(y) - by + r;
  return len2(max(qx, 0), max(qy, 0)) + min(max(qx, qy), 0) - r;
};
export const seg2 = (x: number, y: number, ax: number, ay: number, bx: number, by: number) => {
  const px = x - ax,
    py = y - ay,
    ex = bx - ax,
    ey = by - ay;
  const h = clamp((px * ex + py * ey) / (ex * ex + ey * ey));
  return len2(px - ex * h, py - ey * h);
};
/** exact polygon SDF (iq) — pts flat [x0,y0,x1,y1,...] */
export const poly2 = (x: number, y: number, v: number[]) => {
  const n = v.length / 2;
  let d = (x - v[0]) * (x - v[0]) + (y - v[1]) * (y - v[1]);
  let s = 1;
  for (let i = 0, j = n - 1; i < n; j = i, i++) {
    const vix = v[i * 2],
      viy = v[i * 2 + 1],
      vjx = v[j * 2],
      vjy = v[j * 2 + 1];
    const ex = vjx - vix,
      ey = vjy - viy,
      wx = x - vix,
      wy = y - viy;
    const h = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey));
    const bx = wx - ex * h,
      by = wy - ey * h;
    const dd = bx * bx + by * by;
    if (dd < d) d = dd;
    const c1 = y >= viy,
      c2 = y < vjy,
      c3 = ex * wy > ey * wx;
    if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
  }
  return s * sqrt(d);
};
/** 5-point star (iq): r outer, rf inner ratio */
export const star5 = (x: number, y: number, r: number, rf: number) => {
  const k1x = 0.809016994375,
    k1y = -0.587785252292;
  const k2x = -k1x,
    k2y = k1y;
  let px = abs(x),
    py = y;
  let d = max(k1x * px + k1y * py, 0);
  px -= 2 * d * k1x;
  py -= 2 * d * k1y;
  d = max(k2x * px + k2y * py, 0);
  px -= 2 * d * k2x;
  py -= 2 * d * k2y;
  px = abs(px);
  py -= r;
  const bax = rf * -k1y - 0,
    bay = rf * k1x - 1;
  const h = clamp((px * bax + py * bay) / (bax * bax + bay * bay), 0, r);
  return len2(px - bax * h, py - bay * h) * Math.sign(py * bax - px * bay);
};
/** heart (iq) — tip at origin, top lobes ≈ y 1.0, |x| ≤ ~0.85 */
export const heart2 = (x: number, y: number) => {
  const px = abs(x);
  if (y + px > 1) return len2(px - 0.25, y - 0.75) - Math.SQRT2 / 4;
  const a = (px - 0) * (px - 0) + (y - 1) * (y - 1);
  const m = 0.5 * max(px + y, 0);
  const b = (px - m) * (px - m) + (y - m) * (y - m);
  return sqrt(min(a, b)) * Math.sign(px - y);
};
/** polar repeat: returns [x', y'] of the point folded into sector 0 (centred on +x) */
export const polarFold = (x: number, y: number, n: number): [number, number] => {
  const sec = (2 * PI) / n;
  let a = atan2(y, x);
  a = ((((a + sec / 2) % sec) + sec) % sec) - sec / 2;
  const r = len2(x, y);
  return [r * cos(a), r * sin(a)];
};
export const rot2 = (x: number, y: number, a: number): [number, number] => {
  const c = cos(a),
    s = sin(a);
  return [c * x - s * y, s * x + c * y];
};

// ---------------- 2D → 3D ----------------
/** rounded extrusion of a 2D distance: half thickness h, edge radius r (≤ h) */
export const extrude = (d2: number, z: number, h: number, r: number) => {
  const wx = d2 + r,
    wy = abs(z) - h + r;
  return min(max(wx, wy), 0) + len2(max(wx, 0), max(wy, 0)) - r;
};
/**
 * Pillow extrusion: like extrude but the faces swell toward the middle (clay "puff").
 * bulge = extra half-thickness reached `s` inside the outline.
 */
export const puff = (d2: number, z: number, h: number, r: number, bulge: number, s: number) => {
  const k = clamp(-d2 / s);
  const hh = h + bulge * k * (2 - k);
  return extrude(d2, z, hh, r) * 0.9;
};
/** front surface z of puff() at a given 2D distance (for placing embossed details) */
export const puffFront = (d2: number, h: number, bulge: number, s: number) => {
  const k = clamp(-d2 / s);
  return h + bulge * k * (2 - k);
};
/** revolve a 2D (rho, y) distance around the y axis */
export const revolveY = (x: number, y: number, z: number, d2: D2) => d2(len2(x, z), y);

/** closed profile polygon for a lathe: half-profile [rho,y,...] from bottom axis to top axis, mirrored to −rho */
export const latheProfile = (half: number[]) => {
  const out = [...half];
  for (let i = half.length - 2; i >= 0; i -= 2) out.push(-half[i], half[i + 1]);
  return out;
};
/** Catmull-Rom resample of a polyline [x,y,...] (smooth lathe profiles) */
export const smoothPoly = (pts: number[], perSeg = 6) => {
  const n = pts.length / 2;
  const P = (i: number) => {
    const k = Math.max(0, Math.min(n - 1, i));
    return [pts[k * 2], pts[k * 2 + 1]];
  };
  const out: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = P(i - 1),
      p1 = P(i),
      p2 = P(i + 1),
      p3 = P(i + 2);
    for (let s = 0; s < perSeg; s++) {
      const t = s / perSeg,
        t2 = t * t,
        t3 = t2 * t;
      for (let c = 0; c < 2; c++)
        out.push(0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3));
    }
  }
  out.push(pts[(n - 1) * 2], pts[(n - 1) * 2 + 1]);
  return out;
};
