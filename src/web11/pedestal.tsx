// cream clay pedestal (logo reveal) — উপরে কমলা ring আভা
import React, { useMemo } from "react";
import { ClayMat } from "../kit/Clay";
import { roundedCylGeo } from "../kit/Geo";
import { C } from "../kit/theme";
export const Pedestal: React.FC<{ r?: number; h?: number }> = ({ r = 1.4, h = 0.42 }) => {
  const g = useMemo(() => roundedCylGeo(r, h, 0.08), [r, h]);
  return (
    <group>
      <mesh geometry={g} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ClayMat color={C.clay} />
      </mesh>
      <mesh position={[0, h + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r * 0.8, r * 0.92, 96]} />
        <meshStandardMaterial color={C.orange} roughness={0.5} />
      </mesh>
    </group>
  );
};
