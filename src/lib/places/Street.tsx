// Street — দোকানের সারি (ডেন্টাল, রেস্টুরেন্ট, ফার্মেসি, কাপড়, অফিস) নরম রাস্তার ধারে, তির্যকভাবে দূরে মিলিয়ে যায়।
// lamp post, metaball গাছ, একটা clay গাড়ি (চাকা দূরত্ব অনুযায়ী ঘোরে)। Street t = showcase-এর সময় (সব ধাপ এখান থেকে)।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat } from "../../kit/Clay";
import { latheGeo, roundedCylGeo, roundedRectPath, slabGeo } from "../../kit/Geo";
import { springStep, wobble, tween, range, emphDecel, expoOut } from "../../kit/anim";
import { C } from "../../kit/theme";
import { Storefront, STORE, RoofPlinth } from "./Storefront";
import { OfficeTower, TOWER } from "./OfficeTower";
import { Molar, PharmacyCross, Cloche, TeeOnHanger, Tree, HangerStand } from "./signs";
import { PolishedClay, Satin } from "./mats";
import { bakeSDF, sdRoundBox, smin, smax } from "./sdf";

/** plan-এ গোল কোণের সমতল slab (রাস্তা, ফুটপাত) — উপরের তল y = thick */
export const flatSlab = (w: number, depth: number, thick: number, r: number, bevel = 0.03) => {
  const s = roundedRectPath(w - bevel * 2, depth - bevel * 2, Math.max(0.001, r - bevel)) as THREE.Shape;
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, thick - bevel * 2), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 20 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  g.computeVertexNormals();
  return g;
};

/** lamp post — lathe খুঁটি + বাঁকা arm + নরম lamp head; on 0..1 */
export const LampPost: React.FC<{ position?: [number, number, number]; on?: number; rotationY?: number }> = ({ position, on = 0, rotationY = 0 }) => {
  const post = useMemo(() => latheGeo([[0, 0], [0.12, 0], [0.11, 0.05], [0.05, 0.12], [0.04, 1.2], [0.035, 2.0], [0.0, 2.02]], 24), []);
  const arm = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.95, 0), new THREE.Vector3(0, 2.12, 0.05), new THREE.Vector3(0, 2.18, 0.25), new THREE.Vector3(0, 2.12, 0.45)]);
    return new THREE.TubeGeometry(c, 40, 0.03, 10, false);
  }, []);
  const head = useMemo(() => latheGeo([[0, 0], [0.13, 0.0], [0.12, 0.04], [0.06, 0.1], [0.0, 0.12]], 32), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={post} castShadow>
        <PolishedClay color="#3B4A5C" rough={0.45} coat={0.4} />
      </mesh>
      <mesh geometry={arm} castShadow>
        <PolishedClay color="#3B4A5C" rough={0.45} coat={0.4} />
      </mesh>
      <group position={[0, 2.02, 0.47]}>
        <mesh geometry={head} castShadow>
          <PolishedClay color="#3B4A5C" rough={0.45} coat={0.4} />
        </mesh>
        <mesh position={[0, 0.0, 0]} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[0.09, 24, 12]} />
          <meshStandardMaterial color="#FFF1D6" emissive="#FFC46B" emissiveIntensity={0.3 + on * 3.2} toneMapped={false} />
        </mesh>
        {on > 0.02 && <pointLight position={[0, -0.25, 0]} intensity={1.6 * on} distance={2.6} decay={2} color="#FFC27A" />}
      </group>
    </group>
  );
};

/** clay গাড়ি — body + cabin এক SDF (fused), কাচ পাশে, চার চাকা ঘোরে (spin rad); দৈর্ঘ্য ≈ 1.35 (x বরাবর) */
export const ClayCar: React.FC<{ position?: [number, number, number]; rotationY?: number; spin?: number; color?: string; bounce?: number }> = ({ position, rotationY = 0, spin = 0, color = C.orange, bounce = 0 }) => {
  const body = useMemo(
    () =>
      bakeSDF(
        "car-v1",
        (x, y, z) => {
          let d = sdRoundBox(x, y - 0.3, z, 0.52, 0.06, 0.24, 0.12);
          d = smin(d, sdRoundBox(x + 0.05, y - 0.5, z, 0.26, 0.06, 0.2, 0.1), 0.1);
          // চাকার খোপ
          for (const sx of [-1, 1]) d = smax(d, -(Math.hypot(x - sx * 0.4, y - 0.17) - 0.17), 0.03);
          return d;
        },
        [0, 0.38, 0],
        0.72,
        96
      ),
    []
  );
  const wheel = useMemo(() => roundedCylGeo(0.14, 0.12, 0.04, 40), []);
  const hub = useMemo(() => roundedCylGeo(0.06, 0.13, 0.02, 24), []);
  const pane = useMemo(() => slabGeo(0.2, 0.13, 0.02, 0.04, 0.008, 2), []);
  const wind = useMemo(() => slabGeo(0.36, 0.13, 0.02, 0.04, 0.008, 2), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group position={[0, bounce, 0]}>
        <mesh geometry={body} castShadow receiveShadow>
          <PolishedClay color={color} rough={0.32} coat={0.8} />
        </mesh>
        {/* পাশের কাচ (দুই দিকে দুই খণ্ড) + সামনের windshield */}
        {[-1, 1].map((sz) =>
          [-0.08, 0.17].map((x) => (
            <mesh key={sz + "_" + x} geometry={pane} position={[x, 0.53, sz * 0.305]}>
              <meshPhysicalMaterial color="#29384a" roughness={0.06} clearcoat={1} envMapIntensity={1.5} />
            </mesh>
          ))
        )}
        <mesh geometry={wind} position={[0.405, 0.53, 0]} rotation={[0, Math.PI / 2, 0]}>
          <meshPhysicalMaterial color="#29384a" roughness={0.06} clearcoat={1} envMapIntensity={1.5} />
        </mesh>
        {/* headlights */}
        {[-1, 1].map((sz) => (
          <mesh key={sz} position={[0.635, 0.33, sz * 0.18]} scale={[0.5, 1, 1]}>
            <sphereGeometry args={[0.045, 16, 10]} />
            <meshStandardMaterial color="#FFF6E0" emissive="#FFE2A8" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <group key={sx + "_" + sz} position={[sx * 0.4, 0.14, sz * 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <group rotation={[0, -spin, 0]}>
              <mesh geometry={wheel} castShadow>
                <ClayMat color="#2B2F36" rough={0.7} />
              </mesh>
              <mesh geometry={hub}>
                <Satin color="#d9dde1" rough={0.3} />
              </mesh>
              <mesh position={[0.035, sz * 0.066, 0]}>
                <sphereGeometry args={[0.018, 10, 8]} />
                <Satin color="#9aa1a8" />
              </mesh>
            </group>
          </group>
        ))
      )}
    </group>
  );
};

const pop = (t: number, t0: number) => {
  const u = t - t0;
  if (u <= 0) return [0, 0] as const;
  const s = springStep(u, { k: 190, c: 14 });
  const j = wobble(u - 0.1, 0.1, 2.8, 0.25);
  return [s * (1 + j), s * (1 - j)] as const;
};

const SP = 2.55; // দোকানের মাঝের দূরত্ব
export const Street: React.FC<{ t: number; position?: [number, number, number]; scale?: number; rotationY?: number }> = ({ t, position = [0.2, -2.2, -1.5], scale = 0.5, rotationY = 0.5 }) => {
  const road = useMemo(() => flatSlab(22, 2.3, 0.06, 0.4, 0.025), []);
  const walk = useMemo(() => flatSlab(22, 1.1, 0.16, 0.3, 0.05), []);
  const dash = useMemo(() => flatSlab(0.8, 0.12, 0.085, 0.06, 0.012), []);
  const xs = [-5.1, -5.1 + SP, -5.1 + SP * 2, -5.1 + SP * 3];
  const shops = [
    { label: "DENTAL CHAMBER", color: C.navy, h: 2.55 },
    { label: "SYLHET KITCHEN", color: C.deepOrange, h: 2.95, awning: ["#E9573F", "#FBF5EE"] as [string, string] },
    { label: "CITY PHARMACY", color: "#178A55", h: 2.55 },
    { label: "TRENDY WEAR", color: "#2F7D78", h: 2.95, awning: ["#2F9C95", "#FBF5EE"] as [string, string] },
  ];
  // car: রাস্তার কাছের lane-এ বাম→ডান (local x), ধীরে থামে না — একটানা
  const carX = tween(t, 0.6, 6.0, -11, 9.5, (x) => x);
  const R = 0.14;
  const spin = (carX + 11) / R;
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh geometry={road} position={[0, 0, 3.0]} receiveShadow>
        <ClayMat color="#8C96A3" rough={0.8} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} geometry={dash} position={[-10 + i * 1.8, 0, 3.0]} receiveShadow>
          <ClayMat color="#F7F3EC" rough={0.6} />
        </mesh>
      ))}
      <mesh geometry={walk} position={[0, 0, 1.48]} receiveShadow castShadow>
        <ClayMat color="#EDE4D8" />
      </mesh>
      {/* দোকান */}
      {shops.map((s, i) => {
        const [sx, sy] = pop(t, 0.15 + i * 0.22);
        const open = tween(t, 1.5 + i * 0.35, 2.4 + i * 0.35, 0, 1, emphDecel);
        const light = tween(t, 1.7 + i * 0.35, 2.5 + i * 0.35, 0, 1, expoOut);
        const sg = springStep(t - (1.0 + i * 0.22), { k: 200, c: 12 });
        return (
          <Storefront
            key={i}
            label={s.label}
            signColor={s.color}
            open={open}
            light={light}
            doors={0}
            awning={s.awning}
            dims={{ h: s.h }}
            position={[xs[i], 0, -0.1]}
            scale={[sx, sy, sx]}
            roof={
              sg > 0.001 && (
                <group scale={sg}>
                  {i === 0 && (
                    <>
                      <RoofPlinth w={0.7} />
                      <Molar position={[0, 0.1, 0.05]} scale={0.8} rotation={[0, 0.5 + Math.sin(t) * 0.15, 0]} />
                    </>
                  )}
                  {i === 1 && (
                    <>
                      <RoofPlinth w={1.1} />
                      <Cloche position={[0, 0.1, 0.05]} scale={0.85} lift={springStep(t - 2.5, { k: 120, c: 9 })} steam={range(t, 2.7, 3.3)} time={t} />
                    </>
                  )}
                  {i === 2 && (
                    <>
                      <RoofPlinth w={0.55} />
                      <mesh position={[0, 0.17, 0.05]}>
                        <cylinderGeometry args={[0.035, 0.05, 0.18, 20]} />
                        <Satin />
                      </mesh>
                      <PharmacyCross position={[0, 0.64, 0.05]} rotation={[0, t * 0.6, 0]} lit={range(t, 2.4, 2.9)} />
                    </>
                  )}
                  {i === 3 && (
                    <>
                      <RoofPlinth w={0.5} position={[-0.55, 0, 0]} />
                      <HangerStand x={-0.55} />
                      <TeeOnHanger position={[0.12, 1.26, 0]} scale={0.82} color="#F5952B" swing={wobble(t - 1.7, 0.25, 0.9, 0.12)} twist={0.2} />
                    </>
                  )}
                </group>
              )
            }
          />
        );
      })}
      {/* office tower শেষে */}
      {(() => {
        const [sx, sy] = pop(t, 0.15 + 4 * 0.22);
        return (
          <OfficeTower
            position={[-5.1 + SP * 4 + 0.35, 0, -0.5]}
            scale={[0.95 * sx, 0.95 * sy, 0.95 * sx]}
            lights={range(t, 2.6, 4.2)}
            signPop={springStep(t - 2.0, { k: 200, c: 12 })}
            time={t}
          />
        );
      })()}
      {/* lamp posts + গাছ ফুটপাতে */}
      {[-3.85, -3.85 + SP, -3.85 + SP * 2, -3.85 + SP * 3].map((x, i) => {
        const [sx, sy] = pop(t, 0.5 + i * 0.18);
        return (
          <group key={i} position={[x, 0.16, 1.75]} scale={[sx, sy, sx]}>
            {i % 2 === 0 ? <LampPost on={range(t, 3.2 + i * 0.12, 3.6 + i * 0.12)} /> : <Tree scale={0.95} sway={Math.sin(t * 1.3 + i) * 0.03} />}
          </group>
        );
      })}
      <ClayCar position={[carX, 0.06, 3.5]} spin={spin} bounce={Math.abs(Math.sin(carX * 3)) * 0.008} />
    </group>
  );
};

export { STORE, TOWER };
