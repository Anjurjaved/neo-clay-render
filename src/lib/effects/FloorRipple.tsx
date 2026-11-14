// FloorRipple — floor নিজেই নরম clay/জলের মতো ঢেউ খেলে (কোনো আলাদা ring sprite নয়)।
// কৌশল: একটা high-res disc floor-এর ঠিক উপরে (FLOOR+0.0005, ContactShadows-এর নিচে) যেটা Stage-এর হুবহু
// screen-space gradient আঁকে → সমতল অবস্থায় অদৃশ্য; GPU-তে vertex displacement + analytic normal দিয়ে শুধু ঢেউয়ের
// ঢাল আলো/ছায়া পায় (key light-এর দিক থেকে), depth লেখে বলে N8AO খাঁজে নরম AO দেয়।
// সময় = prop (t), উৎস = deterministic list → frame-exact।
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { FLOOR, BG_LAYER } from "../../kit/Stage";
import { GLSL_STAGE, stageUniforms } from "./floorShader";

export type RippleSource = { x: number; z: number; at: number; amp?: number };
export type RippleOpts = { speed?: number; lambda?: number; width?: number; decay?: number };
const DEF = { speed: 2.3, lambda: 0.85, width: 0.95, decay: 1.15 };
const MAX = 8;
export const RIPPLE_LIFE = 4.2; // s — এর পরে ঢেউ কার্যত শূন্য

/** JS mirror of the shader height — বস্তুকে ঢেউয়ের উপর দোলাতে চাইলে */
export const rippleHeight = (t: number, sources: RippleSource[], x: number, z: number, o: RippleOpts = {}) => {
  const { speed, lambda, width, decay } = { ...DEF, ...o };
  let h = 0;
  for (const s of sources) {
    const age = t - s.at;
    if (age <= 0 || age > RIPPLE_LIFE) continue;
    const r = Math.hypot(x - s.x, z - s.z);
    const d = age * speed - r;
    if (d < 0) continue;
    const pk = Math.exp(-Math.pow((d - width) / width, 2));
    h += (s.amp ?? 0.05) * Math.exp(-age * decay) / Math.sqrt(1 + r * 1.2) * pk * Math.sin((d * 2 * Math.PI) / lambda);
  }
  return h;
};

const VERT = `
uniform vec4 uSrc[${MAX}];
uniform int uCount;
uniform float uTime, uSpeed, uLambda, uWidth, uDecay, uR;
uniform vec2 uCenter;
varying vec3 vN;
varying vec3 vW;
float H(vec2 p){
  float h = 0.0;
  for (int i = 0; i < ${MAX}; i++) {
    if (i >= uCount) break;
    vec4 s = uSrc[i];
    float age = uTime - s.z;
    if (age <= 0.0 || age > ${RIPPLE_LIFE.toFixed(2)}) continue;
    float r = length(p - s.xy);
    float d = age * uSpeed - r;
    if (d < 0.0) continue;
    float pk = exp(-pow((d - uWidth) / uWidth, 2.0));
    h += s.w * exp(-age * uDecay) / sqrt(1.0 + r * 1.2) * pk * sin(d * 6.2831853 / uLambda);
  }
  return h;
}
void main(){
  vec2 lp = position.xz;
  vec2 p = lp + uCenter;
  float rim = 1.0 - smoothstep(uR * 0.78, uR, length(lp));
  float e = 0.018;
  float h = H(p) * rim;
  float hx = (H(p + vec2(e, 0.0)) - H(p - vec2(e, 0.0))) * rim / (2.0 * e);
  float hz = (H(p + vec2(0.0, e)) - H(p - vec2(0.0, e))) * rim / (2.0 * e);
  vN = normalize(vec3(-hx, 1.0, -hz));
  vec3 pos = vec3(position.x, h, position.z);
  vec4 w = modelMatrix * vec4(pos, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const FRAG = `${GLSL_STAGE}
varying vec3 vN;
varying vec3 vW;
uniform float uShade;
void main(){
  vec3 base = stageColor(gl_FragCoord.xy);
  vec3 L = normalize(vec3(-6.0, 9.0, 8.0));
  vec3 n = normalize(vN);
  float lam = dot(n, L) - dot(vec3(0.0, 1.0, 0.0), L);
  lam = lam > 0.0 ? lam * 0.5 : lam * 1.15; // উজ্জ্বল দিক নরম (pale floor সাদা হয়ে clip না করে), ছায়ার দিক গভীর
  vec3 V = normalize(cameraPosition - vW);
  float tilt = 1.0 - n.y;
  float spec = pow(max(dot(reflect(-L, n), V), 0.0), 28.0) * clamp(tilt * 40.0, 0.0, 1.0) * 0.05;
  vec3 c = base * (1.0 + uShade * lam) + vec3(1.0, 0.97, 0.93) * spec;
  gl_FragColor = vec4(srgbToLin(clamp(c, 0.0, 1.0)), 1.0);
}`;

/**
 * <FloorRipple t sources /> — Stage-এর child। sources: কোথায় কখন কত জোরে ঢেউ উঠবে (world x,z; at = সেকেন্ড)।
 * radius-এর বাইরে ঢেউ মিলিয়ে যায়; কোনো উৎস সক্রিয় না থাকলে কিছুই render হয় না।
 */
export const FloorRipple: React.FC<{ t: number; sources: RippleSource[]; center?: [number, number]; radius?: number; shade?: number; floorY?: number } & RippleOpts> = ({
  t,
  sources,
  center = [0, 0],
  radius = 11,
  shade = 1.5,
  floorY = FLOOR,
  ...o
}) => {
  const { speed, lambda, width, decay } = { ...DEF, ...o };
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(0.0001, radius, 360, 260);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [radius]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          ...stageUniforms(),
          uSrc: { value: Array.from({ length: MAX }, () => new THREE.Vector4()) },
          uCount: { value: 0 },
          uTime: { value: 0 },
          uSpeed: { value: speed },
          uLambda: { value: lambda },
          uWidth: { value: width },
          uDecay: { value: decay },
          uR: { value: radius },
          uCenter: { value: new THREE.Vector2() },
          uShade: { value: shade },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        toneMapped: false,
      }),
    []
  );
  const { size } = useThree();
  const live = sources.filter((s) => t > s.at && t - s.at < RIPPLE_LIFE).slice(0, MAX);
  if (!live.length) return null;
  const u = mat.uniforms;
  u.uRes.value.set(size.width, size.height);
  live.forEach((s, i) => u.uSrc.value[i].set(s.x, s.z, s.at, s.amp ?? 0.05));
  u.uCount.value = live.length;
  u.uTime.value = t;
  u.uSpeed.value = speed;
  u.uLambda.value = lambda;
  u.uWidth.value = width;
  u.uDecay.value = decay;
  u.uR.value = radius;
  u.uCenter.value.set(center[0], center[1]);
  u.uShade.value = shade;
  return <mesh geometry={geo} material={mat} position={[center[0], floorY + 0.0005, center[1]]} frustumCulled={false} renderOrder={-998} layers={BG_LAYER} />;
};
