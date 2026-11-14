// component lab — একটা component বড় আকারে, master reference-এর সাথে মেলানোর জন্য
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage, atScreen, atFloor, worldWidth, DEFAULT_CAM } from "../kit/Stage";
import { Phone, phoneScreen, PHONE, StatusBar } from "../kit/Device";
import { GoogleSearch } from "../kit/ui/Google";
import { SoftPanel, Chip, CheckBadge } from "../kit/Soft";
import { Txt } from "../kit/Clay";
import { C } from "../kit/theme";

export const Lab: React.FC<{ item: string }> = ({ item }) => {
  const f = useCurrentFrame();
  const cam = DEFAULT_CAM;
  if (item === "phones") {
    const p1 = atScreen(0.27, 0.36, 0, cam), p2 = atScreen(0.74, 0.36, 0, cam);
    const s = worldWidth(0.4, 0, cam) / PHONE.w;
    const a = { position: p1, rotation: [0, 0.12, 0] as [number, number, number], scale: s };
    const b = { position: p2, rotation: [0, -0.12, 0] as [number, number, number], scale: s };
    return (
      <Stage cam={cam} screens={[
        phoneScreen(a, <GoogleSearch query="hoodie shop in dhaka" results={[{ title: "Dhaka Hoodie House" }, { title: "Trendy Wear BD" }, { title: "Mirpur Fashion Mart" }]} />, { kind: "iphone" }),
        phoneScreen(b, <div style={{ position: "absolute", inset: 0, background: "#fff" }}><StatusBar kind="android" time="9:01" /></div>, { kind: "android" }),
      ]}>
        <Phone {...a} kind="iphone" />
        <Phone {...b} kind="android" />
      </Stage>
    );
  }
  // cards + chips
  const c1 = atScreen(0.5, 0.22, 0, cam);
  const cw = worldWidth(0.8, 0, cam);
  const row = atScreen(0.5, 0.42, 0, cam);
  const kw = worldWidth(0.19, 0, cam);
  return (
    <Stage cam={cam}>
      <SoftPanel position={c1} w={cw} h={cw * 0.22}>
        <CheckBadge position={[-cw * 0.37, 0, 0.02]} scale={cw * 0.13} />
        <Txt size={cw * 0.075} color={C.deepNavy} anchorX="left" position={[-cw * 0.27, -cw * 0.004, 0.02]}>Free Consultation</Txt>
      </SoftPanel>
      {["WEBSITE", "APP", "SEO", "AI"].map((l, i) => (
        <Chip key={l} position={[row[0] + (i - 1.5) * kw * 1.12, row[1], row[2]]} w={kw} h={kw * 0.82} label={l} active={i === 3 ? 1 : 0} />
      ))}
      <SoftPanel position={atScreen(0.5, 0.58, 0, cam)} w={worldWidth(0.26, 0, cam)} h={worldWidth(0.26, 0, cam)} color={C.navy}>
        <Txt size={worldWidth(0.08, 0, cam)} color="#fff" position={[0, 0, 0.02]}>AI</Txt>
      </SoftPanel>
    </Stage>
  );
};
