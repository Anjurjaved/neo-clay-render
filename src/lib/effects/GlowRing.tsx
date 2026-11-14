// GlowRing — বস্তুর নিচে floor-এ নরম আলোর পুকুর (soft radial glow, কোনো কঠিন ring/orbit নয়) + মাঝে মাঝে একটা
// মসৃণ আলো-ঢেউ বাইরে ছড়িয়ে মিলিয়ে যায়। "এটাই সেই জিনিস" বোঝাতে highlight। additive shader disc, depthWrite নেই।
import React, { useMemo } from "react";
import * as THREE from "three";
import { FLOOR } from "../../kit/Stage";
import { smoothstep } from "../../kit/anim";
import { C } from "../../kit/theme";

const VERT = `varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vP;
uniform vec3 uCol;
uniform float uR, uOn, uPulse[3], uPulseA[3];
void main(){
  float r = length(vP) / uR;
  // পুকুর: ভেতরে নরম, কিনারায় উজ্জ্বল-ধার (rim) — দুটোই gaussian, কোনো ধারালো রেখা নয়
  float pool = exp(-r * r * 2.2) * 0.42 + exp(-pow((r - 0.86) / 0.2, 2.0)) * 0.5;
  float wave = 0.0;
  for (int i = 0; i < 3; i++) {
    float pr = uPulse[i];
    wave += uPulseA[i] * exp(-pow((r - pr) / (0.1 + 0.12 * pr), 2.0));
  }
  float a = (pool * uOn + wave) * (1.0 - smoothstep(1.6, 2.2, r));
  gl_FragColor = vec4(uCol * a, 1.0);
}`;

/**
 * <GlowRing t at radius>{object}</GlowRing> — children-এর নিচে (floor-এ, x/z = position) halo।
 * position = বস্তুর floor-বিন্দু (world)। pulses: প্রতি `period` সেকেন্ডে একটা ঢেউ, `until` পর্যন্ত। out = নিভে যাওয়ার সময়।
 */
export const GlowRing: React.FC<{
  t: number;
  at: number;
  out?: number;
  radius?: number;
  color?: string;
  intensity?: number;
  period?: number;
  until?: number;
  position?: [number, number, number];
  children?: React.ReactNode;
}> = ({ t, at, out = 999, radius = 1.6, color = C.orange, intensity = 0.55, period = 1.25, until = 999, position = [0, FLOOR, 0], children }) => {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(radius * 2.2, 128);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [radius]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uCol: { value: new THREE.Color() }, uR: { value: radius }, uOn: { value: 0 }, uPulse: { value: [0, 0, 0] }, uPulseA: { value: [0, 0, 0] } },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    []
  );
  const on = smoothstep(at, at + 0.6, t) * (1 - smoothstep(out, out + 0.5, t));
  const u = mat.uniforms;
  u.uCol.value.set(color).multiplyScalar(intensity);
  u.uR.value = radius;
  u.uOn.value = on;
  // সবচেয়ে সাম্প্রতিক ৩টা pulse — প্রতিটা 0.25R থেকে 1.4R পর্যন্ত ছড়ায়, ছড়াতে ছড়াতে ফিকে
  const first = at + 0.35;
  const n = t < first ? -1 : Math.floor((Math.min(t, until) - first) / period);
  for (let i = 0; i < 3; i++) {
    const k = n - i;
    const age = k >= 0 ? t - (first + k * period) : -1;
    const life = 1.7;
    if (age < 0 || age > life || first + k * period > until) {
      u.uPulse.value[i] = -10;
      u.uPulseA.value[i] = 0;
    } else {
      const e = 1 - Math.pow(1 - age / life, 2.4);
      u.uPulse.value[i] = 0.25 + 1.15 * e;
      u.uPulseA.value[i] = 0.55 * (1 - age / life) * smoothstep(0, 0.15, age) * (1 - smoothstep(out, out + 0.5, t));
    }
  }
  return (
    <>
      {on > 0.001 || n >= 0 ? <mesh geometry={geo} material={mat} position={[position[0], position[1] + 0.006, position[2]]} renderOrder={5} /> : null}
      {children}
    </>
  );
};
