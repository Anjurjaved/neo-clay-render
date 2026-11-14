// registry metadata → console (render script verbose log থেকে পড়ে)
import React from "react";
import { AbsoluteFill } from "remotion";
import { LIB } from "./registry";
let printed = false;
export const Manifest: React.FC = () => {
  if (!printed) {
    printed = true;
    console.log("LIBMANIFEST:" + JSON.stringify(LIB.map(({ Comp, ...m }) => m)));
  }
  return <AbsoluteFill style={{ background: "#fff" }} />;
};
