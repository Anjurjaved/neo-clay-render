// Screen overlay: 3D device-এর screen quad camera দিয়ে project করে DOM UI-কে CSS matrix3d (homography)
// দিয়ে ঠিক সেই চার কোণে বসায়। perspective-correct, crisp text, বাংলা সহ যেকোনো DOM।
// সীমা: overlay সবসময় canvas-এর উপরে আঁকা হয় — screen-এর সামনে দিয়ে 3D বস্তু গেলে ঢাকবে না।
import React from "react";
import * as THREE from "three";
import { Cam } from "./Stage";
import { W, H } from "./time";

export type ScreenSpec = {
  matrix: THREE.Matrix4; // screen-এর কেন্দ্রের world matrix (screen plane = local XY, সামনে +z)
  w: number; // world width
  h: number; // world height
  px: number; // DOM width px
  py: number; // DOM height px
  radius?: number; // px
  bg?: string;
  opacity?: number;
  content: React.ReactNode;
  glare?: boolean; // হালকা glass reflection
};

export const toMatrix = (
  position: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number] = [0, 0, 0],
  scale: number | [number, number, number] = 1,
  parent?: THREE.Matrix4
) => {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale)
  );
  return parent ? parent.clone().multiply(m) : m;
};

const makeCam = (cam: Cam) => {
  const c = new THREE.PerspectiveCamera(cam.fov, W / H, 0.1, 200);
  c.position.set(...cam.pos);
  c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return c;
};

// 4 point → 4 point homography (rect (0,0)-(w,h) → quad), CSS matrix3d
function homography(w: number, h: number, q: [number, number][]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q; // TL, TR, BR, BL
  // square→quad
  const dx1 = x1 - x2,
    dx2 = x3 - x2,
    dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2,
    dy2 = y3 - y2,
    dy3 = y0 - y1 + y2 - y3;
  let a, b, c, d, e, f, g, hh;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    a = x1 - x0; b = x2 - x1; c = x0;
    d = y1 - y0; e = y2 - y1; f = y0;
    g = 0; hh = 0;
  } else {
    const den = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    hh = (dx1 * dy3 - dx3 * dy1) / den;
    a = x1 - x0 + g * x1; b = x3 - x0 + hh * x3; c = x0;
    d = y1 - y0 + g * y1; e = y3 - y0 + hh * y3; f = y0;
  }
  // unit square uses (u along TL→TR, v along TL→BL); scale from px
  a /= w; d /= w; g /= w;
  b /= h; e /= h; hh /= h;
  // CSS matrix3d column-major
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}

export const ScreenOverlay: React.FC<{ cam: Cam; screens: ScreenSpec[] }> = ({ cam, screens }) => {
  const c = makeCam(cam);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {screens.map((s, i) => {
        const corners = [
          [-s.w / 2, s.h / 2],
          [s.w / 2, s.h / 2],
          [s.w / 2, -s.h / 2],
          [-s.w / 2, -s.h / 2],
        ].map(([x, y]) => {
          const v = new THREE.Vector3(x, y, 0).applyMatrix4(s.matrix).project(c);
          return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H] as [number, number];
        });
        // পিছন ফিরলে আঁকব না
        const n = new THREE.Vector3(0, 0, 1).transformDirection(s.matrix);
        const center = new THREE.Vector3().setFromMatrixPosition(s.matrix);
        if (n.dot(c.position.clone().sub(center)) <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: s.px,
              height: s.py,
              transformOrigin: "0 0",
              transform: homography(s.px, s.py, corners),
              borderRadius: s.radius ?? 40,
              overflow: "hidden",
              background: s.bg ?? "#fff",
              opacity: s.opacity ?? 1,
              fontFamily: "Inter, 'Hind Siliguri', sans-serif",
              color: "#1f2328",
            }}
          >
            {s.content}
            {s.glare !== false && (
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 32%, rgba(255,255,255,0) 50%)", pointerEvents: "none" }} />
            )}
          </div>
        );
      })}
    </div>
  );
};
