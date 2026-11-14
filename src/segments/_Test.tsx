import React from "react";
import { Stage, FLOOR } from "../kit/Stage";
import { Phone, phoneScreen, StatusBar } from "../kit/Device";
import { CBox } from "../kit/Clay";
import { useVideoTime, typed } from "../kit/time";
export const Test: React.FC = () => {
  const t = useVideoTime(0);
  const ph = { position: [-0.2, -0.3, 0] as [number, number, number], rotation: [-0.05, 0.35, 0] as [number, number, number], scale: 1.6 };
  const ui = (
    <div style={{ padding: "80px 22px", fontSize: 22 }}>
      <StatusBar />
      <div style={{ fontSize: 46, fontWeight: 700, textAlign: "center", color: "#4285F4" }}>Google</div>
      <div style={{ marginTop: 20, border: "1px solid #ddd", borderRadius: 30, padding: "12px 18px" }}>{typed("hoodie shop in dhaka", t, 0.2, 1.5)}|</div>
      <div style={{ marginTop: 30, fontFamily: "'Hind Siliguri'", fontSize: 26 }}>জি, আছে! দাম ৯৯০ টাকা</div>
    </div>
  );
  return (
    <Stage screens={[phoneScreen(ph, ui)]}>
      <Phone {...ph} />
      <CBox size={[1.44, 0.2, 0.2]} position={[1.6, FLOOR + 0.2, 0]} color="#1B4470" />
    </Stage>
  );
};
