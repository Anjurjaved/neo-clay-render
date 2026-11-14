// LightSweep — product-render-এর মতো একটা নরম আলোর পাত (sheen band) বস্তুর উপর দিয়ে তির্যকভাবে সরে যায়।
// যেকোনো children-কে wrap করে: ভেতরের সব MeshStandard/Physical material-এ onBeforeCompile দিয়ে world-space band
// যোগ হয় (fresnel-ভারী, তাই কিনারা আর চকচকে তল বেশি জ্বলে)। সময় = progress prop → deterministic।
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type U = { uSwS: { value: number }; uSwDir: { value: THREE.Vector3 }; uSwW: { value: number }; uSwCol: { value: THREE.Color }; uSwI: { value: number } };
const patched = new WeakMap<THREE.Material, U>();

const patch = (m: THREE.Material, u: U) => {
  if (patched.get(m) === u) return;
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    prev?.call(m, sh, r);
    Object.assign(sh.uniforms, u);
    sh.vertexShader = "varying vec3 vSwW;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\n vSwW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader =
      "varying vec3 vSwW;\nuniform float uSwS, uSwW, uSwI;\nuniform vec3 uSwDir, uSwCol;\n" +
      sh.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          float d = dot(vSwW, uSwDir) - uSwS;
          float band = exp(-d * d / (uSwW * uSwW)) + 0.35 * exp(-pow(d + uSwW * 2.2, 2.0) / (uSwW * uSwW * 0.16));
          float fres = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.0);
          totalEmissiveRadiance += uSwCol * uSwI * band * (0.32 + 0.68 * fres);
        }`
      );
  };
  m.customProgramCacheKey = () => "lightsweep";
  m.needsUpdate = true;
  patched.set(m, u);
};

/**
 * <LightSweep progress={0..1}>{object}</LightSweep>
 * progress 0 = band বস্তুর এক পাশে (বাইরে), 1 = অন্য পাশে বাইরে। নিজের সময়ে চালাতে `sweepProgress(t, t0, dur)` ব্যবহার করুন।
 * dir = band কোন দিকে সরে (world; default বাম-নিচ → ডান-উপর তির্যক), width world unit, intensity ~0.6–1.2।
 */
export const LightSweep: React.FC<{ progress: number; dir?: [number, number, number]; width?: number; intensity?: number; color?: string; children: React.ReactNode }> = ({
  progress,
  dir = [1, 0.55, 0.15],
  width = 0.32,
  intensity = 0.9,
  color = "#FFF4E6",
  children,
}) => {
  const ref = useRef<THREE.Group>(null);
  const u = useMemo<U>(() => ({ uSwS: { value: -999 }, uSwDir: { value: new THREE.Vector3() }, uSwW: { value: width }, uSwCol: { value: new THREE.Color(color) }, uSwI: { value: 0 } }), []);
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    const D = new THREE.Vector3(...dir).normalize();
    // children-এর world bounding box-কে dir-এ project করে band-এর পথ (বাইরে থেকে বাইরে)
    g.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(g);
    let lo = Infinity,
      hi = -Infinity;
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
      const d = c.dot(D);
      lo = Math.min(lo, d);
      hi = Math.max(hi, d);
    }
    if (!isFinite(lo)) return;
    u.uSwDir.value.copy(D);
    u.uSwW.value = width;
    u.uSwCol.value.set(color);
    u.uSwS.value = lo - width * 2 + (hi - lo + width * 4) * progress;
    u.uSwI.value = progress <= 0 || progress >= 1 ? 0 : intensity;
    g.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const ms = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      ms.forEach((m) => {
        if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) patch(m, u);
      });
    });
  });
  return <group ref={ref}>{children}</group>;
};

/** t0 থেকে dur সেকেন্ডে 0→1 (ধীর শুরু, মসৃণ শেষ) — LightSweep-এর progress */
export const sweepProgress = (t: number, t0: number, dur = 1.1) => {
  const k = Math.min(1, Math.max(0, (t - t0) / dur));
  return k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);
};
