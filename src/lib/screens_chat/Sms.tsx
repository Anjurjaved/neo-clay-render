// SMS thread (Android Messages-ধাঁচ) — chamber-এর serial confirmation; উপরে heads-up notification নামে — 390×843
import React from "react";
import { StatusBar } from "../../kit/Device";
import { UI, Bn, I, Avatar, HomeBar, Arrive } from "./ui";

const INK = "#1F1F1F",
  META = "#5E6370",
  IN = "#E9EEF6",
  ACC = "#0B57D0";

export type SmsMsg = { text: string; time?: string; k?: number; stamp?: string };

export const SmsThread: React.FC<{
  sender: string;
  initials?: string;
  msgs: SmsMsg[];
  /** heads-up notification 0..1 (নামা), তারপর 1→0 (ওঠা) */
  heads?: number;
  headsText?: string;
  /** নতুন মেসেজের হালকা highlight 0..1 */
  glow?: number;
}> = ({ sender, initials = "DS", msgs, heads = 0, headsText = "", glow = 0 }) => (
  <div style={{ position: "absolute", inset: 0, background: "#F8FAFD", fontFamily: UI, color: INK, overflow: "hidden" }}>
    <StatusBar kind="android" time="4:12" />
    {/* app bar */}
    <div style={{ position: "absolute", top: 56, left: 0, right: 0, height: 68, display: "flex", alignItems: "center", padding: "0 14px 0 16px", gap: 14, background: "#F8FAFD", zIndex: 4 }}>
      <I.back size={25} color={INK} stroke={2.2} />
      <Avatar size={42} text={initials} bg="#C2E7FF" color="#04305E" fontSize={16} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 0.3 }}>{sender}</div>
        <div style={{ fontSize: 13.5, color: META, fontWeight: 500 }}>Business · Verified sender</div>
      </div>
      <I.more size={22} color={INK} />
    </div>
    {/* thread */}
    <div style={{ position: "absolute", top: 126, left: 0, right: 0, bottom: 104, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 0 8px", overflow: "hidden" }}>
      {msgs.map((m, i) => {
        const last = i === msgs.length - 1;
        return (
          <Arrive key={i} k={m.k ?? 1} from="left">
            {m.stamp && <div style={{ textAlign: "center", fontSize: 13.5, fontWeight: 600, color: META, margin: "14px 0 8px" }}>{m.stamp}</div>}
            <div style={{ display: "flex", alignItems: "flex-end", padding: "0 54px 0 14px", gap: 10, marginTop: 6 }}>
              <Avatar size={34} text={initials} bg="#C2E7FF" color="#04305E" fontSize={13} />
              <div
                style={{
                  background: IN,
                  borderRadius: "22px 22px 22px 6px",
                  padding: "12px 15px 13px",
                  fontSize: 18.5,
                  lineHeight: 1.45,
                  boxShadow: last && glow > 0 ? `0 0 0 ${3 * glow}px rgba(245,149,43,${0.55 * glow})` : undefined,
                }}
              >
                <Bn>{m.text}</Bn>
              </div>
            </div>
            {m.time && <div style={{ fontSize: 12.5, color: META, fontWeight: 600, padding: "5px 0 0 62px" }}>{m.time}</div>}
          </Arrive>
        );
      })}
    </div>
    {/* bottom: short-code sender-এ reply যায় না */}
    <div style={{ position: "absolute", left: 16, right: 16, bottom: 34, height: 58, borderRadius: 16, background: "#EEF1F6", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", fontSize: 15, fontWeight: 600, color: META }}>
      <I.shield size={22} color={META} stroke={1.9} />
      <span>
        Can't reply to this sender. <span style={{ color: ACC }}>Learn more</span>
      </span>
    </div>
    <HomeBar bottom={8} />
    {/* heads-up notification */}
    {heads > 0 && (
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          right: 10,
          borderRadius: 24,
          background: "#FFFFFF",
          boxShadow: "0 10px 30px rgba(20,30,50,0.22), 0 1px 3px rgba(20,30,50,0.12)",
          padding: "14px 16px 15px",
          transform: `translateY(${(heads - 1) * 140}%)`,
          zIndex: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: META }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: ACC, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <I.chat size={13} color="#fff" />
          </div>
          Messages · now
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "flex-start" }}>
          <Avatar size={40} text={initials} bg="#C2E7FF" color="#04305E" fontSize={15} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: INK }}>{sender}</div>
            <div style={{ fontSize: 15.5, color: "#3C4043", lineHeight: 1.4, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as any}>
              <Bn>{headsText}</Bn>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 10, paddingLeft: 52, fontSize: 15, fontWeight: 700, color: ACC }}>
          <span>Mark as read</span>
          <span>Copy</span>
        </div>
      </div>
    )}
  </div>
);
