import React from "react";
import { AbsoluteFill } from "remotion";
import { STAGE_BG } from "../kit/theme";

export const Placeholder: React.FC<{ id: string }> = ({ id }) => (
  <AbsoluteFill style={{ background: STAGE_BG, alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontSize: 80, color: "#c9b9a6" }}>
    {id}
  </AbsoluteFill>
);
