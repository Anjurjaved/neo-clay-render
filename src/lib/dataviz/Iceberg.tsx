// Iceberg — জলের উপরে ছোট চূড়া, নিচে বিশাল অংশ। পানি = আসল জলের মতো: ঢেউ খেলানো উপরিতল (displaced grid,
// চকচকে, কিনারায় foam, berg-এর চারপাশে ripple), সামনের কাটা তলে গভীরতা-অনুযায়ী রং, caustic আলো, god-ray,
// বাম-ডান-নিচে ধীরে মিলিয়ে যায় (প্লেটের কিনারা নেই)। berg = এক টুকরার high-res displaced mesh।
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Txt } from "../../kit/Clay";
import { springStep } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, P, rand } from "./common";

const WX = 5.0,
  WZ = 2.7,
  DEPTH = 4.3;

/** জলের উচ্চতা (surface local) — বড় ঢেউ + ছোট ঢেউ + berg-এর চারপাশে ripple + ঢোকার splash ring */
export const waveY = (x: number, z: number, t: number, splash = -1, bob = 0) => {
  let y = 0.045 * Math.sin(x * 1.7 + t * 1.6) + 0.03 * Math.sin(x * 0.9 - z * 1.3 + t * 1.1) + 0.018 * Math.sin(x * 3.7 + z * 2.9 + t * 2.7) + 0.012 * Math.sin(-x * 5.1 + z * 4.2 + t * 3.4);
  const r = Math.hypot(x / 1.15, z / 0.9);
  if (r > 0.9) {
    const rr = r - 0.9;
    y += 0.03 * Math.sin(rr * 7 - t * 4) * Math.exp(-rr * 1.3) - bob * 0.4 * Math.exp(-rr * 2);
    if (splash >= 0) {
      const front = splash * 2.2;
      y += 0.16 * Math.exp(-splash * 1.4) * Math.sin((rr - front) * 6) * Math.exp(-((rr - front) ** 2) * 2.5);
    }
  }
  return y;
};

const bergGeo = () => {
  // Icosahedron non-indexed → merge না করলে flat-shaded facet; merge করে মসৃণ normal (আর ৬ গুণ কম vertex)
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, 6));
  const a = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const nz = (p: THREE.Vector3) => {
    // ridged sin-noise → বরফের চাঙড়ের মতো নরম খাঁজ
    let s = 0;
    const dirs = [
      [0.8, 0.3, 0.5, 2.1, 0.3],
      [-0.4, 0.9, 0.2, 2.7, 1.7],
      [0.2, -0.5, 0.85, 3.3, 2.9],
      [0.7, -0.7, -0.1, 4.6, 0.8],
      [-0.6, 0.1, 0.8, 5.9, 4.1],
    ];
    dirs.forEach(([x, y, z, f, ph], i) => {
      const d = p.x * x + p.y * y + p.z * z;
      s += (1 - Math.abs(Math.sin(d * f + ph))) * (0.5 / (i + 1));
    });
    return s;
  };
  for (let i = 0; i < a.count; i++) {
    v.fromBufferAttribute(a, i);
    const y = v.y;
    const W = y > 0 ? 1.12 * (1 - 0.55 * Math.pow(y, 1.3)) : 1.12 + 0.42 * Math.sin(Math.min(1, -y * 1.25) * Math.PI * 0.75);
    const H = y > 0 ? y * 1.45 : y * 3.1;
    const n = nz(v);
    const px = v.x * W * (0.86 + 0.32 * n);
    const pz = v.z * W * 0.62 * (0.86 + 0.32 * n); // জলের সামনের তল (z = WZ/2) ভেদ না করে
    let py = H + (y > 0 ? 0.25 * n * y : -0.3 * n * y * y);
    // দ্বিতীয় চূড়া (বাম পিছনে) — চেনা iceberg silhouette
    if (y > 0) py += 0.42 * Math.exp(-((v.x + 0.45) ** 2 + (v.z + 0.1) ** 2) / 0.12) * y;
    a.setXYZ(i, px, py, pz);
  }
  g.computeVertexNormals();
  return g;
};

const sideShader = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color("#5CC2DF") },
      uMid: { value: new THREE.Color("#1F86B8") },
      uDeep: { value: new THREE.Color("#0C3F6E") },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec3 vP;
      void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uShallow; uniform vec3 uMid; uniform vec3 uDeep;
      varying vec3 vP;
      void main(){
        float d = clamp(-vP.y / ${DEPTH.toFixed(2)}, 0.0, 1.0);
        vec3 c = mix(uShallow, uMid, smoothstep(0.0, 0.45, d));
        c = mix(c, uDeep, smoothstep(0.35, 1.0, d));
        // caustic: দুই ঢেউ-জালের গুণফল, উপরের দিকে জোরালো
        float k1 = sin(vP.x*6.0 + uTime*1.3 + sin(vP.y*4.0 + uTime)*1.2);
        float k2 = sin(vP.x*4.3 - vP.y*5.0 - uTime*1.7 + sin(vP.x*3.1)*1.5);
        float caus = pow(max(0.0, k1*k2), 3.0) * (1.0 - smoothstep(0.0, 0.5, d));
        // god-ray: ধীরে নড়া তির্যক আলো
        float ray = smoothstep(0.55, 1.0, sin(vP.x*1.6 + vP.y*0.55 + uTime*0.35)*0.5+0.5) * (1.0 - smoothstep(0.05, 0.8, d)) * 0.22;
        c += vec3(0.75, 0.95, 1.0) * (caus * 0.35 + ray);
        float edge = 1.0 - smoothstep(0.62, 1.0, abs(vP.x) / ${(WX / 2).toFixed(2)});
        float bottom = 1.0 - smoothstep(0.72, 1.0, d);
        float a = mix(0.42, 0.78, smoothstep(0.0, 0.8, d)) * edge * bottom;
        gl_FragColor = vec4(c, a);
      }`,
  });

export const Iceberg: React.FC<
  P & {
    /** জলের সময় (ঢেউ) — সেকেন্ড */
    time: number;
    /** berg-এর উল্লম্ব অবস্থান (0 = বিশ্রাম; ঋণাত্মক = ডোবা) */
    rise?: number;
    /** surface ভেদ করার পর সেকেন্ড (splash ring) */
    splash?: number;
    above?: string;
    below?: string[];
    /** প্রতিটা নিচের লেখার age (s) */
    belowAges?: number[];
    aboveAge?: number;
    bubbles?: boolean;
  }
> = ({ time, rise = 0, splash = -1, above, below = [], belowAges = [], aboveAge = -1, bubbles = true, ...p }) => {
  const berg = useMemo(bergGeo, []);
  const side = useMemo(sideShader, []);
  side.uniforms.uTime.value = time;
  const bob = Math.sin(time * 1.25) * 0.05 + rise;
  const NX = 110,
    NZ = 46;
  // উপরিতল (vertex color: কিনারায় alpha 0, berg-এর পাশে foam)
  const top = useMemo(() => {
    const g = new THREE.PlaneGeometry(WX, WZ, NX, NZ);
    g.rotateX(-Math.PI / 2);
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array((NX + 1) * (NZ + 1) * 4), 4));
    return g;
  }, []);
  {
    const a = top.attributes.position as THREE.BufferAttribute;
    const col = top.attributes.color as THREE.BufferAttribute;
    const water = new THREE.Color("#4FB0D6"),
      foam = new THREE.Color("#F4FBFF"),
      cc = new THREE.Color();
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i),
        z = a.getZ(i);
      const y = waveY(x, z, time, splash, bob);
      a.setY(i, y);
      const r = Math.hypot(x / 1.15, z / 0.9);
      const f = Math.max(0, 1 - Math.abs(r - 1.0) / 0.22) * (0.65 + 0.35 * Math.sin(Math.atan2(z, x) * 9 + time * 2)) + Math.max(0, y - 0.05) * 3;
      cc.copy(water).lerp(foam, Math.min(1, f));
      const ex = 1 - THREE.MathUtils.smoothstep(Math.abs(x) / (WX / 2), 0.62, 1.0);
      const ez = 1 - THREE.MathUtils.smoothstep(Math.abs(z) / (WZ / 2), 0.8, 1.0) * 0.6;
      col.setXYZW(i, cc.r, cc.g, cc.b, (0.62 + 0.3 * Math.min(1, f)) * ex * ez);
    }
    a.needsUpdate = true;
    col.needsUpdate = true;
    top.computeVertexNormals();
  }
  // সামনের/পিছনের/পাশের কাটা তল — উপরের সারি ঢেউ মেনে
  const SX = 110,
    SY = 30;
  const sides = useMemo(() => {
    const faces: THREE.BufferGeometry[] = [];
    for (let f = 0; f < 4; f++) {
      const len = f < 2 ? WX : WZ;
      const g = new THREE.PlaneGeometry(len, DEPTH, f < 2 ? SX : 40, SY);
      const a = g.attributes.position as THREE.BufferAttribute;
      const uv = new Float32Array(a.count * 2);
      for (let i = 0; i < a.count; i++) {
        uv[i * 2] = a.getX(i) / len + 0.5;
        uv[i * 2 + 1] = a.getY(i) / DEPTH + 0.5;
      }
      g.userData.uv0 = uv;
      faces.push(g);
    }
    return faces;
  }, []);
  sides.forEach((g, f) => {
    const a = g.attributes.position as THREE.BufferAttribute;
    const uv0 = g.userData.uv0 as Float32Array;
    for (let i = 0; i < a.count; i++) {
      const u = uv0[i * 2]; // 0..1
      const vRow = uv0[i * 2 + 1]; // 0 নিচ .. 1 উপর
      let x = 0,
        z = 0;
      if (f === 0) (x = (u - 0.5) * WX), (z = WZ / 2);
      else if (f === 1) (x = (0.5 - u) * WX), (z = -WZ / 2);
      else if (f === 2) (x = WX / 2), (z = (0.5 - u) * WZ);
      else (x = -WX / 2), (z = (u - 0.5) * WZ);
      const yTop = waveY(x, z, time, splash, bob);
      const y = vRow >= 0.999 ? yTop : -DEPTH * (1 - vRow) + yTop * vRow;
      a.setXYZ(i, x, y, z);
    }
    a.needsUpdate = true;
  });
  return (
    <G {...p}>
      {/* berg */}
      <group position={[0, bob + 0.02, 0]} rotation={[Math.sin(time * 0.9) * 0.02, 0.35, Math.sin(time * 1.1 + 1) * 0.025]}>
        <mesh geometry={berg} castShadow receiveShadow renderOrder={0}>
          <meshPhysicalMaterial color="#EEF7FC" roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.2} sheen={0.4} sheenColor="#d8f1ff" envMapIntensity={1.05} />
        </mesh>
      </group>
      {/* bubbles — ভেতরে উঠছে */}
      {bubbles &&
        Array.from({ length: 10 }, (_, i) => {
          const per = 3.2 + rand(i) * 1.5;
          const ph = ((time + rand(i + 4) * per) % per) / per;
          const x = (rand(i + 7) - 0.5) * 3.6;
          const y = -3.6 + ph * 3.5;
          return (
            <mesh key={i} position={[x + Math.sin(time * 3 + i) * 0.05, y, 0.6 + rand(i + 2) * 0.5]} renderOrder={1} scale={0.03 + rand(i + 1) * 0.04}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshPhysicalMaterial color="#e9fbff" roughness={0.1} transparent opacity={0.55 * Math.sin(ph * Math.PI)} depthWrite={false} />
            </mesh>
          );
        })}
      {/* জলের কাটা তল */}
      {sides.map((g, f) => (
        <mesh key={f} geometry={g} material={side} renderOrder={f === 0 ? 4 : 2} />
      ))}
      {/* উপরিতল */}
      <mesh geometry={top} renderOrder={3}>
        <meshPhysicalMaterial vertexColors transparent roughness={0.08} metalness={0} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.6} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* লেখা — জলের পরে আঁকা (renderOrder) যাতে জল লেখাকে ঢেকে না দেয় */}
      <group renderOrder={10}>
      {above && aboveAge >= 0 && (
        <group position={[0, 2.25, 0.4]} scale={springStep(aboveAge, { k: 220, c: 11 })}>
          <Txt size={0.26} color={C.deepNavy} letterSpacing={0.05}>
            {above}
          </Txt>
        </group>
      )}
      {below.map((s, i) => {
        const age = belowAges[i] ?? -1;
        if (age < 0) return null;
        const k = springStep(age, { k: 200, c: 11 });
        return (
          <group key={i} position={[0, -0.75 - i * 0.48, WZ / 2 + 0.06]} scale={k}>
            <Txt size={0.24} color="#0B3456" letterSpacing={0.06}>
              {s}
            </Txt>
          </group>
        );
      })}
      </group>
    </G>
  );
};
