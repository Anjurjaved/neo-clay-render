import React from "react";
import { AbsoluteFill } from "remotion";
import { byId } from "./registry";
import { FontGate } from "../kit/Fonts";
export const LibComp: React.FC<{ id: string }> = ({ id }) => {
  const it = byId(id);
  if (!it) return <AbsoluteFill style={{ background: "#f6e3d4", alignItems: "center", justifyContent: "center", fontSize: 60 }}>missing: {id}</AbsoluteFill>;
  return (
    <FontGate>
      <it.Comp />
    </FontGate>
  );
};
