// Price range slider: deep inset track, orange fill that grows as one soft pill, glossy dome knob
// (squashes when grabbed), value bubble riding above the knob, min/max labels, tick dots.
// Track centred at origin along x (length SL.len), facing +z.
import React, { useMemo } from "react";
import { ClayMat, Txt } from "../../kit/Clay";
import { slabGeo, pillGeo, latheGeo, roundedCylGeo } from "../../kit/Geo";
import { SoftPanel } from "../../kit/Soft";
import { C } from "../../kit/theme";
import { G, P, GlossMat, useDisposable } from "./common";

export const SL = { len: 4.2, h: 0.34 };
const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

export const PriceSlider: React.FC<
  P & { value: number; min?: number; max?: number; press?: number; step?: number; currency?: string; minLabel?: string; maxLabel?: string }
> = ({ value, min = 15000, max = 100000, press = 0, step = 500, currency = "Tk", minLabel, maxLabel, ...p }) => {
  const { len, h } = SL;
  const v = Math.max(0, Math.min(1, value));
  const base = useMemo(() => slabGeo(len + 0.7, h + 0.5, 0.34, (h + 0.5) / 2, 0.14, 8), []);
  const groove = useMemo(() => pillGeo(len + 0.06, h + 0.06, 0.06, 0.025), []);
  const fillW = Math.max(h, (len + 0.02) * v + h * (1 - v));
  const fill = useDisposable(() => pillGeo(fillW, h - 0.04, 0.12, 0.05), [Math.round(fillW * 500)]);
  const knob = useMemo(
    () =>
      latheGeo(
        [
          [0.0, 0.0],
          [0.3, 0.0],
          [0.37, 0.05],
          [0.39, 0.15],
          [0.36, 0.25],
          [0.26, 0.31],
          [0.0, 0.33],
        ],
        64
      ),
    []
  );
  const ring = useMemo(() => roundedCylGeo(0.13, 0.04, 0.015, 40), []);
  const pointer = useMemo(() => slabGeo(0.2, 0.2, 0.12, 0.05, 0.04, 3), []);
  const tick = useMemo(() => roundedCylGeo(0.028, 0.03, 0.012, 16), []);
  const x0 = -len / 2,
    kx = x0 + len * v;
  const val = Math.round((min + (max - min) * v) / step) * step;
  const sq = press;
  const label = `${currency} ${fmt(val)}`;
  const bw = Math.max(1.5, label.length * 0.17 + 0.4);
  return (
    <G {...p}>
      <mesh geometry={base} position={[0, 0, -0.17]} castShadow receiveShadow>
        <ClayMat color="#F4EEE6" rough={0.62} />
      </mesh>
      <mesh geometry={groove} position={[0, 0, 0.0]} receiveShadow>
        <ClayMat color="#DCD3C8" rough={0.75} bump={0.15} />
      </mesh>
      <mesh geometry={fill} position={[x0 - h / 2 + fillW / 2 + 0.0, 0, 0.04]} castShadow>
        <GlossMat color={C.orange} rough={0.42} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) =>
        i === 0 || i === 8 ? null : (
          <mesh key={i} geometry={tick} rotation={[Math.PI / 2, 0, 0]} position={[x0 + (i / 8) * len, -h / 2 - 0.13, 0.0]}>
            <ClayMat color="#C9BFB2" rough={0.6} />
          </mesh>
        )
      )}
      {/* knob */}
      <group position={[kx, 0, 0.06]} scale={[1 + sq * 0.12, 1 + sq * 0.12, 1 - sq * 0.3]}>
        <mesh geometry={knob} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.18} sheen={0.3} sheenColor="#ffe2c4" />
        </mesh>
        <mesh geometry={ring} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.33]}>
          <GlossMat color={C.orange} rough={0.4} />
        </mesh>
      </group>
      {/* value bubble */}
      <group position={[kx, 0.95 + sq * 0.06, 0.1]}>
        <SoftPanel w={bw} h={0.62} thick={0.16} radius={0.24} color={C.navy}>
          <Txt size={0.26} color="#ffffff" position={[0, -0.01, 0.012]}>
            {label}
          </Txt>
        </SoftPanel>
        <mesh geometry={pointer} position={[0, -0.36, -0.02]} rotation={[0, 0, Math.PI / 4]}>
          <ClayMat color={C.navy} rough={0.6} />
        </mesh>
      </group>
      <Txt size={0.2} color={C.deepNavy} position={[x0, -0.68, 0.02]}>
        {minLabel ?? `${currency} ${fmt(min)}`}
      </Txt>
      <Txt size={0.2} color={C.deepNavy} position={[x0 + len, -0.68, 0.02]}>
        {maxLabel ?? `${currency} ${fmt(max)}`}
      </Txt>
    </G>
  );
};
