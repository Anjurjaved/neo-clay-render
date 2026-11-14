// kit Stage-এর floor gradient হুবহু (screen-space) — যাতে effect-এর floor mesh (ripple/sink) আসল floor-এর সাথে seam ছাড়া মেশে।
// kit-এ export নেই বলে এখানে copy; kit/Stage.tsx-এর STOPS বদলালে এখানেও বদলাতে হবে।
import * as THREE from "three";
export const STAGE_STOPS: [number, string][] = [
  [0.0, "#FFE9D0"],
  [0.25, "#FEE3CE"],
  [0.45, "#FBE4D2"],
  [0.6, "#F4DFD8"],
  [0.76, "#E0D8D6"],
  [0.92, "#CDD3DD"],
  [1.0, "#C9D1DE"],
];
export const stageUniforms = () => ({
  uStops: {
    value: STAGE_STOPS.map(([, h]) => {
      const n = parseInt(h.slice(1), 16);
      return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
    }),
  },
  uPos: { value: STAGE_STOPS.map(([p]) => p) },
  uRes: { value: new THREE.Vector2(1080, 1920) },
});
export const GLSL_STAGE = `
uniform vec3 uStops[7];
uniform float uPos[7];
uniform vec2 uRes;
vec3 srgbToLin(vec3 c){ return mix(c/12.92, pow((c+0.055)/1.055, vec3(2.4)), step(0.04045, c)); }
vec3 stageColor(vec2 frag){
  float y = 1.0 - frag.y / uRes.y;
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
