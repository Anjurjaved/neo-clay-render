// iPhone lock screen + notification stack (missed call, order, message) — 390×843
// নতুন notification উপরে আসে, পুরোনোগুলো নিচে সরে; ৩টার বেশি হলে পিছনে stack-এর কিনারা দেখা যায়
import React from "react";
import { StatusBar } from "../../kit/Device";
import { UI, Bn, I, HomeBar, clamp01, sprK } from "./ui";

export type LockNote = {
  app: string;
  icon: "phone" | "bag" | "chat" | "mail";
  tint: string;
  title: string;
  body: string;
  when: string;
  k?: number; // আসা 0..1
};

const ICON: Record<LockNote["icon"], (c: string) => React.ReactNode> = {
  phone: (c) => <I.phone size={21} color={c} />,
  bag: (c) => <I.bag size={22} color={c} stroke={2.2} />,
  chat: (c) => <I.chat size={21} color={c} />,
  mail: (c) => <I.mail size={21} color={c} stroke={2.2} />,
};

const CARD_H = 92;
const Card: React.FC<{ n: LockNote }> = ({ n }) => (
  <div style={{ height: CARD_H, borderRadius: 22, background: "rgba(246,246,248,0.9)", boxShadow: "0 6px 18px rgba(30,20,40,0.12)", display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: n.tint, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{ICON[n.icon]("#fff")}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <Bn>{n.title}</Bn>
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#6E6E73", marginLeft: 8, flex: "none" }}>{n.when}</span>
      </div>
      <div style={{ fontSize: 15, color: "#2C2C2E", lineHeight: 1.35, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        <Bn>{n.body}</Bn>
      </div>
    </div>
  </div>
);

export const LockScreen: React.FC<{
  time?: string;
  date?: string;
  notes: LockNote[]; // পুরোনো → নতুন ক্রমে
  wake?: number; // 0 = কালো, 1 = জ্বলা
}> = ({ time = "9:41", date = "শনিবার, ১৬ নভেম্বর", notes, wake = 1 }) => {
  // নতুনটা উপরে: reverse
  const vis = notes.filter((n) => (n.k ?? 1) > 0);
  const order = [...vis].reverse();
  // প্রতিটা card-এর y: উপরের card-গুলোর (আসার progress অনুযায়ী) উচ্চতা যোগ
  let y = 0;
  const pos = order.map((n, i) => {
    const s = sprK((n.k ?? 1) * 1.15, 170, 16);
    const top = y;
    const slot = i < 3 ? CARD_H + 10 : 0;
    y += slot * Math.min(1, s);
    return { n, s, top, i };
  });
  const hidden = Math.max(0, order.length - 3);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: UI, overflow: "hidden", background: "#0b0b10" }}>
      {/* wallpaper — উষ্ণ peach থেকে নরম নীল, নরম আলোর blob */}
      <div style={{ position: "absolute", inset: 0, opacity: wake, background: "linear-gradient(170deg,#F7B98A 0%,#E99A86 26%,#B98BB0 52%,#6F86C4 76%,#3E5A9E 100%)" }}>
        <div style={{ position: "absolute", left: -80, top: 160, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,226,190,0.75) 0%, rgba(255,226,190,0) 70%)" }} />
        <div style={{ position: "absolute", right: -120, top: 470, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,180,255,0.55) 0%, rgba(140,180,255,0) 70%)" }} />
        <div style={{ position: "absolute", left: 40, bottom: -160, width: 420, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(40,50,110,0.6) 0%, rgba(40,50,110,0) 70%)" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: wake }}>
        <StatusBar dark time="" />
        <div style={{ position: "absolute", top: 58, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <I.lock size={22} color="#fff" stroke={2.3} />
        </div>
        <div style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.92)", fontSize: 21, fontWeight: 600 }}>
          <Bn>{date}</Bn>
        </div>
        <div style={{ position: "absolute", top: 118, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.96)", fontSize: 104, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, fontFamily: "-apple-system, 'SF Pro Display', sans-serif" }}>{time}</div>
        {/* notifications */}
        <div style={{ position: "absolute", left: 12, right: 12, top: 300 }}>
          {vis.length > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px 10px", color: "#fff", fontSize: 20, fontWeight: 700, opacity: clamp01(order.length - 1) }}>
              Notification Centre
              <div style={{ width: 30, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1 }}>×</div>
            </div>
          )}
          <div style={{ position: "relative" }}>
            {hidden > 0 &&
              [2, 1].map((d) => (
                <div key={d} style={{ position: "absolute", left: 10 * d, right: 10 * d, top: 2 * (CARD_H + 10) + 10 * d, height: CARD_H, borderRadius: 22, background: `rgba(246,246,248,${0.75 - d * 0.18})` }} />
              ))}
            {pos.map(({ n, s, top, i }) => {
              if (i > 2) return null;
              const fresh = i === 0;
              return (
                <div key={notes.indexOf(n)} style={{ position: "absolute", left: 0, right: 0, top, transform: fresh ? `translateY(${(1 - s) * -40}px) scale(${0.86 + 0.14 * s})` : undefined, opacity: fresh ? clamp01(s * 2) : 1, transformOrigin: "50% 0" }}>
                  <Card n={n} />
                </div>
              );
            })}
            {hidden > 0 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 3 * (CARD_H + 10) + 30, textAlign: "center", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{`+${hidden} more`}</div>
            )}
          </div>
        </div>
        {/* bottom buttons */}
        {[
          { left: 46, icon: <I.flash size={25} color="#fff" stroke={2} /> },
          { right: 46, icon: <I.camera size={26} color="#fff" stroke={2} /> },
        ].map((b, i) => (
          <div key={i} style={{ position: "absolute", bottom: 46, left: b.left, right: b.right, width: 54, height: 54, borderRadius: 27, background: "rgba(20,20,35,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {b.icon}
          </div>
        ))}
        <HomeBar dark />
      </div>
    </div>
  );
};
