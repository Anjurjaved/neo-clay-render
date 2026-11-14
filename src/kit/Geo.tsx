// নিখুঁত bevelled geometry — এক টুকরার গোল-কিনারার clay আকৃতি (seam নেই)
import * as THREE from "three";

/** গোল-কোণের আয়তক্ষেত্র (কেন্দ্র 0,0) */
export const roundedRectPath = (w: number, h: number, r: number, path: THREE.Path = new THREE.Shape()) => {
  const x = -w / 2,
    y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x + w, y + h - r);
  path.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  path.lineTo(x + r, y + h);
  path.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + r);
  path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return path;
};

/** offset সহ rounded rect (hole বসানোর জন্য) */
const roundedRectAt = (cx: number, cy: number, w: number, h: number, r: number, path: THREE.Path) => {
  const x = cx - w / 2,
    y = cy - h / 2;
  r = Math.min(r, w / 2, h / 2);
  path.moveTo(x + r, y);
  path.absarc(x + r, y + r, r, Math.PI * 1.5, Math.PI, true);
  path.lineTo(x, y + h - r);
  path.absarc(x + r, y + h - r, r, Math.PI, Math.PI / 2, true);
  path.lineTo(x + w - r, y + h);
  path.absarc(x + w - r, y + h - r, r, Math.PI / 2, 0, true);
  path.lineTo(x + w, y + r);
  path.absarc(x + w - r, y + r, r, 0, -Math.PI / 2, true);
  path.lineTo(x + r, y);
  return path;
};

/**
 * Bevelled slab: rounded-rect shape extruded along z with a soft bevel → পিলো-মতো নরম কিনারা।
 * z = 0 থেকে সামনে depth পর্যন্ত (centered দিলে -depth/2..depth/2)।
 */
export const slabGeo = (w: number, h: number, depth: number, r: number, bevel = 0.05, seg = 6, centered = true) => {
  const b = Math.min(bevel, depth / 2 - 0.001, r * 0.9);
  const s = roundedRectPath(w - b * 2, h - b * 2, Math.max(0.001, r - b)) as THREE.Shape;
  const g = new THREE.ExtrudeGeometry(s, { depth: depth - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: seg, curveSegments: 24 });
  g.translate(0, 0, centered ? -(depth - b * 2) / 2 : b);
  g.computeVertexNormals();
  return g;
};

/** stadium (দুই মাথা গোল) pill slab */
export const pillGeo = (w: number, h: number, depth: number, bevel = 0.04) => slabGeo(w, h, depth, h / 2, bevel, 6);

/**
 * Doorway frame: বাইরের rounded rect থেকে দরজার rounded-rect hole কাটা, extrude + bevel।
 * দরজার নিচ খোলা রাখতে doorBottom ≈ -h/2 + sill দিন।
 * ফলাফল: এক টুকরা frame, দরজার ভেতরের দেয়ালও গোল কিনারাসহ।
 */
export const frameGeo = (o: { w: number; h: number; depth: number; r: number; doorW: number; doorH: number; doorR: number; doorCy: number; bevel?: number }) => {
  const b = o.bevel ?? 0.07;
  const s = roundedRectPath(o.w - b * 2, o.h - b * 2, o.r - b) as THREE.Shape;
  const hole = new THREE.Path();
  roundedRectAt(0, o.doorCy, o.doorW + b * 2, o.doorH + b * 2, o.doorR + b, hole);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: o.depth - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 7, curveSegments: 28 });
  g.translate(0, 0, -(o.depth - b * 2) / 2);
  g.computeVertexNormals();
  return g;
};

/** Lathe দিয়ে নরম ঘূর্ণন-আকৃতি (profile: [radius, y] list, নিচ থেকে উপর) — Catmull-Rom smoothing */
export const latheGeo = (pts: [number, number][], seg = 48, smooth = 64) => {
  const curve = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)));
  const p = curve.getPoints(smooth).map((v) => new THREE.Vector2(Math.max(0.0001, v.x), v.y));
  const g = new THREE.LatheGeometry(p, seg);
  g.computeVertexNormals();
  return g;
};

/** গোল-কিনারার cylinder (disc/badge/pedestal): lathe profile দিয়ে */
export const roundedCylGeo = (r: number, h: number, edge = 0.06, seg = 96) => {
  const e = Math.min(edge, h / 2, r / 2);
  const pts: THREE.Vector2[] = [];
  // সমতল cap-কে কয়েক ভাগে ভাগ — না হলে লম্বা ত্রিভুজে normal মিশে radial দাগ পড়ে
  for (let i = 0; i < 8; i++) pts.push(new THREE.Vector2(0.0001 + ((r - e) * i) / 8, -h / 2));
  const N = 8;
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI / 2 + (i / N) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - e + Math.cos(a) * e, -h / 2 + e + Math.sin(a) * e));
  }
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - e + Math.cos(a) * e, h / 2 - e + Math.sin(a) * e));
  }
  for (let i = 7; i >= 0; i--) pts.push(new THREE.Vector2(0.0001 + ((r - e) * i) / 8, h / 2));
  const g = new THREE.LatheGeometry(pts, seg);
  g.computeVertexNormals();
  return g;
};

/** extrude any shape with bevel (moon glyph, icons) */
export const shapeGeo = (shape: THREE.Shape, depth: number, bevel = 0.012, seg = 4) => {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: seg, curveSegments: 32 });
  g.computeVertexNormals();
  return g;
};
