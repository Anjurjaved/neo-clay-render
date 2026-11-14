// Seamless studio stage v2 — opaque canvas; backdrop + floor দুটোই একই screen-space gradient আঁকে
// (তাই horizon/seam অদৃশ্য), কিন্তু floor সত্যিকারের mesh → N8AO ambient occlusion + feathered
// ContactShadows তার উপর পড়ে। আলো: CC0 studio HDRI + Lightformer (key upper-left, cool fill, rim)।
// Post: N8AO → Bloom (শুধু emissive >1.15) → SMAA। tone-map effect নেই — backdrop হুবহু master-এর রং রাখে;
// আলোর মান এমন রাখা যাতে clay clip না করে।
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, N8AO, Bloom, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode, Effect } from "postprocessing";

// composer শেষে sRGB encode করছিল না (pixel মেপে প্রমাণিত) — তাই নিজেই শেষ ধাপে linear→sRGB
class SRGBEncodeEffect extends Effect {
  constructor() {
    super(
      "SRGBEncode",
      `void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
        vec3 c = clamp(inputColor.rgb, 0.0, 1.0);
        outputColor = vec4(mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)), inputColor.a);
      }`
    );
  }
}
const SRGBEncode: React.FC = () => {
  const e = useMemo(() => new SRGBEncodeEffect(), []);
  return <primitive object={e} />;
};
import * as THREE from "three";
import { W, H } from "./time";
import { ScreenOverlay, ScreenSpec } from "./Screens";

export const FLOOR = -2.2;
export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number; roll?: number };
export const DEFAULT_CAM: Cam = { pos: [0, 2.6, 21], target: [0, -0.7, 0], fov: 27 };
export const BG_LAYER = 1; // backdrop/floor — ContactShadows-এর depth pass এদের দেখে না

// master থেকে মাপা gradient stop (উপর→নিচ, sRGB)
const STOPS: [number, string][] = [
  [0.0, "#FFE9D0"],
  [0.25, "#FEE3CE"],
  [0.45, "#FBE4D2"],
  [0.6, "#F4DFD8"],
  [0.76, "#E0D8D6"],
  [0.92, "#CDD3DD"],
  [1.0, "#C9D1DE"],
];

const GLSL_GRADIENT = `
uniform vec3 uStops[7];
uniform float uPos[7];
uniform vec2 uRes;
vec3 srgbToLin(vec3 c){ return mix(c/12.92, pow((c+0.055)/1.055, vec3(2.4)), step(0.04045, c)); }
vec3 neutralTM(vec3 color){
  const float sc = 0.8 - 0.04; const float desat = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float off = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= off;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < sc) return color;
  float d = 1. - sc;
  float np = 1. - d * d / (peak + d - sc);
  color *= np / peak;
  float g = 1. - 1. / (desat * (peak - np) + 1.);
  return mix(color, np * vec3(1.), g);
}
// tone-map-এর পরে যেন ঠিক master-এর রং আসে: fixed-point inverse
vec3 invNeutral(vec3 t){ vec3 c = t; for(int i=0;i<12;i++){ c += (t - neutralTM(c)); } return max(c, vec3(0.)); }
vec3 stageColor(vec2 frag){
  float y = 1.0 - frag.y / uRes.y; // 0 = উপর
  float x = frag.x / uRes.x;
  vec3 c = uStops[6];
  for (int i = 5; i >= 0; i--) {
    float a = uPos[i], b = uPos[i+1];
    if (y >= a && y <= b) c = mix(uStops[i], uStops[i+1], smoothstep(0., 1., (y - a) / (b - a)));
  }
  if (y < 0.0) c = uStops[0];
  float warm = 1.0 - smoothstep(0.0, 0.8, length(vec2(x * 0.8, y) - vec2(0.05, 0.0)));
  c += vec3(0.012, 0.006, -0.004) * warm - vec3(0.010, 0.008, 0.002) * x * (1.0 - y);
  return clamp(c, 0.0, 1.0);
}
`;

const makeStageMat = (mode: "backdrop" | "floor") =>
  new THREE.ShaderMaterial({
    uniforms: {
      // raw sRGB মান সরাসরি (THREE.Color-এর linear রূপান্তর এড়াতে Vector3)
      uStops: { value: STOPS.map(([, h]) => {
        const n = parseInt(h.slice(1), 16);
        return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
      }) },
      uPos: { value: STOPS.map(([p]) => p) },
      uRes: { value: new THREE.Vector2(W, H) },
    },
    vertexShader:
      mode === "backdrop"
        ? `void main(){ gl_Position = vec4(position.xy, 0.99999, 1.0); }`
        : `void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `${GLSL_GRADIENT}
      void main(){ vec3 s = stageColor(gl_FragCoord.xy); gl_FragColor = vec4(srgbToLin(s), 1.0); }`,
    depthWrite: mode === "floor",
    depthTest: mode === "floor",
    toneMapped: false,
  });

const StageSurfaces: React.FC<{ floorY: number; floor: boolean }> = ({ floorY, floor }) => {
  const back = useMemo(() => makeStageMat("backdrop"), []);
  const fl = useMemo(() => makeStageMat("floor"), []);
  const { size } = useThree();
  back.uniforms.uRes.value.set(size.width, size.height);
  fl.uniforms.uRes.value.set(size.width, size.height);
  return (
    <>
      <mesh material={back} frustumCulled={false} renderOrder={-1000} layers={BG_LAYER}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      {floor && (
        <mesh material={fl} rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY - 0.004, 0]} layers={BG_LAYER} renderOrder={-999}>
          <planeGeometry args={[160, 160]} />
        </mesh>
      )}
    </>
  );
};

const CamRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, gl } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.layers.enable(BG_LAYER);
    c.position.set(...cam.pos);
    c.fov = cam.fov;
    c.near = 0.1;
    c.far = 200;
    c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
    c.lookAt(...cam.target);
    c.updateProjectionMatrix();
  }, [camera, cam.pos[0], cam.pos[1], cam.pos[2], cam.target[0], cam.target[1], cam.target[2], cam.fov, cam.roll]);
  useLayoutEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);
  return null;
};

/** floor-এর নিচ কাটার clipping plane — উঠে-আসা/ডুবে-যাওয়া বস্তুর material-এ দিন */
export const FLOOR_CLIP = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR)];

const mkCam = (cam: Cam) => {
  const c = new THREE.PerspectiveCamera(cam.fov, W / H, 0.1, 200);
  c.position.set(...cam.pos);
  c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return c;
};
/** screen-percentage → world point (z-plane-এ) */
export const atScreen = (px: number, py: number, z = 0, cam: Cam = DEFAULT_CAM): [number, number, number] => {
  const c = mkCam(cam);
  const dir = new THREE.Vector3(px * 2 - 1, -(py * 2 - 1), 0.5).unproject(c).sub(c.position).normalize();
  const k = (z - c.position.z) / dir.z;
  const p = c.position.clone().add(dir.multiplyScalar(k));
  return [p.x, p.y, p.z];
};
/** screen-percentage → floor-এর উপর বিন্দু */
export const atFloor = (px: number, py: number, cam: Cam = DEFAULT_CAM, y = FLOOR): [number, number, number] => {
  const c = mkCam(cam);
  const dir = new THREE.Vector3(px * 2 - 1, -(py * 2 - 1), 0.5).unproject(c).sub(c.position).normalize();
  const k = (y - c.position.y) / dir.y;
  const q = c.position.clone().add(dir.multiplyScalar(k));
  return [q.x, q.y, q.z];
};
/** world point → screen-percentage (যাচাইয়ের জন্য) */
export const toScreen = (p: [number, number, number], cam: Cam = DEFAULT_CAM): [number, number] => {
  const v = new THREE.Vector3(...p).project(mkCam(cam));
  return [(v.x + 1) / 2, (1 - v.y) / 2];
};
export const worldWidth = (frac: number, z = 0, cam: Cam = DEFAULT_CAM) => {
  const a = atScreen(0, 0.5, z, cam);
  const b = atScreen(1, 0.5, z, cam);
  return (b[0] - a[0]) * frac;
};

export const Lights: React.FC<{ dim?: number }> = ({ dim = 1 }) => (
  <>
    <directionalLight
      position={[-6, 9, 8]}
      intensity={1.1 * dim}
      color="#fff1e2"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-radius={14}
      shadow-blurSamples={20}
      shadow-bias={-0.0005}
      shadow-camera-left={-12}
      shadow-camera-right={12}
      shadow-camera-top={12}
      shadow-camera-bottom={-12}
      shadow-camera-near={1}
      shadow-camera-far={50}
    />
    <directionalLight position={[7, 1.5, 5]} intensity={0.25 * dim} color="#dfe8ff" />
    <directionalLight position={[1, 5, -9]} intensity={0.55 * dim} color="#ffffff" />
    <hemisphereLight args={["#fff3e6", "#cfd8e6", 0.22 * dim]} />
  </>
);

export const StudioEnv: React.FC = () => (
  <Environment files={staticFile("hdri/studio_small_09_1k.hdr")} environmentIntensity={0.75} environmentRotation={[0, Math.PI * 0.25, 0]} resolution={256}>
    <Lightformer form="rect" intensity={2.4} color="#fff3e8" position={[-5, 6, 5]} scale={[7, 5, 1]} target={[0, 0, 0]} />
    <Lightformer form="rect" intensity={0.7} color="#d5e1ff" position={[6, -1, 3]} scale={[5, 5, 1]} target={[0, 0, 0]} />
    <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[0, 3, -7]} scale={4} target={[0, 0, 0]} />
  </Environment>
);

export const Stage: React.FC<{
  cam?: Cam;
  children: React.ReactNode;
  floor?: boolean;
  floorY?: number;
  contact?: number;
  contactBlur?: number;
  ao?: number;
  aoRadius?: number;
  bloom?: number;
  overlay?: React.ReactNode;
  screens?: ScreenSpec[];
  dim?: number;
  post?: boolean;
  softShadow?: number;
}> = ({ softShadow = 0.14, cam = DEFAULT_CAM, children, floor = true, floorY = FLOOR, contact = 0.5, contactBlur = 2.6, ao = 2.4, aoRadius = 0.75, bloom = 0.5, overlay, screens, dim = 1, post = true }) => (
  <AbsoluteFill style={{ background: "#F6E3D4" }}>
    <ThreeCanvas
      width={W}
      height={H}
      dpr={1}
      shadows="variance"
      gl={{ antialias: !post, alpha: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
      camera={{ fov: cam.fov, position: cam.pos, near: 0.1, far: 200 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <CamRig cam={cam} />
      <StageSurfaces floorY={floorY} floor={floor} />
      <Lights dim={dim} />
      <StudioEnv />
      {children}
      {floor && softShadow > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.001, 0]} receiveShadow>
          <planeGeometry args={[160, 160]} />
          <shadowMaterial transparent opacity={softShadow} color="#5a3f36" />
        </mesh>
      )}
      {floor && contact > 0 && (
        <ContactShadows position={[0, floorY + 0.002, 0]} scale={30} resolution={1024} blur={contactBlur} far={3} opacity={contact} color="#5a3f36" frames={Infinity} />
      )}
      {post && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <N8AO aoRadius={aoRadius} distanceFalloff={1} intensity={ao} color="#4a3128" quality="high" halfRes={false} />
          <Bloom mipmapBlur luminanceThreshold={1.6} luminanceSmoothing={0.1} intensity={bloom} radius={0.7} />
          <ToneMapping mode={ToneMappingMode.LINEAR} />
          <SMAA />

        </EffectComposer>
      )}
    </ThreeCanvas>
    {screens && screens.length > 0 && <ScreenOverlay cam={cam} screens={screens} />}
    {overlay}
  </AbsoluteFill>
);
