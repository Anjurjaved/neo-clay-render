// Messenger-ধাঁচ page conversation (logo ছাড়া — নীল→বেগুনি gradient bubble, "Aa" composer দিয়ে চেনা) — iPhone, 390×843
// customer একটা Facebook page-কে message করছে: quick reply chip, product card, typing dots, seen avatar
import React from "react";
import { StatusBar } from "../../kit/Device";
import { UI, Bn, I, Avatar, Dots, HomeBar, Arrive } from "./ui";

export const MS = { blue: "#0A7CFF", purple: "#A033FF", grey: "#F0F0F0", ink: "#050505", meta: "#65676B" };

export type MsMsg =
  | { kind: "text"; from: "me" | "page"; text: string; k?: number }
  | { kind: "product"; title: string; price: string; sub: string; k?: number }
  | { kind: "time"; text: string; k?: number };

// gradient: পুরোনো (উপরের) bubble বেশি বেগুনি, নিচের বেশি নীল — আসল app-এর মতো
const mixHex = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16),
    pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * k);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

const PageAvatar: React.FC<{ size: number }> = ({ size }) => <Avatar size={size} text="RF" bg="#F5952B" bg2="#D85E24" fontSize={size * 0.38} />;

export const MessengerChat: React.FC<{
  page: string;
  msgs: MsMsg[];
  typing?: number;
  clock: number;
  chips?: string[];
  chipTap?: number; // কোন chip চাপা (index)
  chipK?: number; // চাপের মাত্রা 0..1
  chipsOut?: number; // chips সরে যাওয়া 0..1
  seen?: number; // seen avatar 0..1
}> = ({ page, msgs, typing = 0, clock, chips = [], chipTap = -1, chipK = 0, chipsOut = 0, seen = 0 }) => {
  const outIdx = msgs.map((m, i) => (m.kind === "text" && m.from === "me" ? i : -1)).filter((i) => i >= 0);
  const lastMe = outIdx[outIdx.length - 1];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: UI, color: MS.ink, overflow: "hidden" }}>
      <StatusBar time="9:41" />
      {/* header */}
      <div style={{ position: "absolute", top: 54, left: 0, right: 0, height: 62, display: "flex", alignItems: "center", padding: "0 14px 0 8px", borderBottom: "1px solid #E4E6EB", background: "#fff", zIndex: 5 }}>
        <I.chevL size={30} color={MS.blue} stroke={2.6} />
        <div style={{ position: "relative", marginLeft: 2 }}>
          <PageAvatar size={40} />
          <div style={{ position: "absolute", right: -1, bottom: -1, width: 14, height: 14, borderRadius: 7, background: "#31A24C", border: "2.5px solid #fff" }} />
        </div>
        <div style={{ marginLeft: 10, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17.5, fontWeight: 700, whiteSpace: "nowrap" }}>{page}</div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: MS.meta }}>Active now</div>
        </div>
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          <I.phone size={24} color={MS.blue} />
          <I.video size={27} color={MS.blue} stroke={2.1} />
        </div>
      </div>
      {/* thread */}
      <div style={{ position: "absolute", top: 117, left: 0, right: 0, bottom: chips.length && chipsOut < 1 ? 146 : 92, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 6, overflow: "hidden" }}>
        {/* page intro (thread-এর শুরু) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0 14px", flex: "none" }}>
          <PageAvatar size={74} />
          <div style={{ fontSize: 21, fontWeight: 700, marginTop: 8 }}>{page}</div>
          <div style={{ fontSize: 14, color: MS.meta, fontWeight: 500, marginTop: 2 }}>Clothing store · Mirpur, Dhaka</div>
          <div style={{ fontSize: 14, color: MS.meta, fontWeight: 500 }}>Typically replies within minutes</div>
        </div>
        {msgs.map((m, i) => {
          const k = m.k ?? 1;
          if (m.kind === "time")
            return (
              <Arrive key={i} k={k} from="center">
                <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: MS.meta, margin: "6px 0 8px" }}>{m.text}</div>
              </Arrive>
            );
          const prev = msgs[i - 1],
            next = msgs[i + 1];
          const side = m.kind === "product" ? "page" : m.from;
          const sideOf = (x?: MsMsg) => (!x || x.kind === "time" ? "" : x.kind === "product" ? "page" : x.from);
          const joinTop = sideOf(prev) === side,
            joinBot = sideOf(next) === side && (next?.k ?? 1) > 0;
          const me = side === "me";
          const r = (a: boolean) => (a ? 5 : 19);
          const radius = me ? `19px ${r(joinTop)}px ${r(joinBot)}px 19px` : `${r(joinTop)}px 19px 19px ${r(joinBot)}px`;
          const meOrder = outIdx.indexOf(i);
          const g = meOrder >= 0 ? (outIdx.length - 1 - meOrder) / Math.max(1, 3) : 0;
          const bg = me ? `linear-gradient(180deg, ${mixHex(MS.blue, MS.purple, Math.min(1, g + 0.18))} 0%, ${mixHex(MS.blue, MS.purple, Math.min(1, g))} 100%)` : MS.grey;
          return (
            <Arrive key={i} k={k} from={me ? "right" : "left"}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: me ? "flex-end" : "flex-start", padding: me ? "0 14px 0 70px" : "0 60px 0 10px", marginTop: joinTop ? 2 : 10 }}>
                {!me && <div style={{ width: 30, marginRight: 8, flex: "none" }}>{!joinBot && <PageAvatar size={30} />}</div>}
                {m.kind === "text" ? (
                  <div style={{ background: bg, color: me ? "#fff" : MS.ink, borderRadius: radius, padding: "9px 14px 10px", fontSize: 17.5, lineHeight: 1.38 }}>
                    <Bn>{m.text}</Bn>
                  </div>
                ) : (
                  <div style={{ width: 252, borderRadius: radius, overflow: "hidden", border: "1px solid #E4E6EB", background: "#fff" }}>
                    {/* product photo — জামদানি শাড়ির কাপড়ের নকশা (CSS) */}
                    <div style={{ height: 150, position: "relative", background: "linear-gradient(135deg,#7A1E3A 0%,#A3264B 45%,#6B1A33 100%)" }}>
                      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 12px 12px, rgba(255,214,140,0.85) 2.2px, transparent 2.8px), radial-gradient(circle at 0 0, rgba(255,214,140,0.5) 1.4px, transparent 2px)", backgroundSize: "24px 24px, 12px 12px" }} />
                      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 34, background: "repeating-linear-gradient(90deg,#E9B44C 0 6px,#C98A24 6px 9px,#F3D58A 9px 14px)", opacity: 0.95 }} />
                      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, height: 5, background: "#F3D58A" }} />
                    </div>
                    <div style={{ padding: "10px 13px 4px" }}>
                      <div style={{ fontSize: 17, fontWeight: 700 }}>
                        <Bn>{m.title}</Bn>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 19, fontWeight: 800, color: "#D85E24" }}>{m.price}</span>
                        <span style={{ fontSize: 13.5, color: MS.meta, fontWeight: 600 }}>
                          <Bn>{m.sub}</Bn>
                        </span>
                      </div>
                    </div>
                    <div style={{ margin: "8px 10px 10px", height: 38, borderRadius: 8, background: "#E7F0FE", color: MS.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>Order now</div>
                  </div>
                )}
              </div>
              {i === lastMe && seen > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "3px 14px 0", opacity: seen, transform: `scale(${0.6 + 0.4 * seen})`, transformOrigin: "100% 0" }}>
                  <PageAvatar size={16} />
                </div>
              )}
            </Arrive>
          );
        })}
        {typing > 0 && (
          <Arrive k={typing} from="left">
            <div style={{ display: "flex", alignItems: "flex-end", padding: "0 10px", marginTop: 10 }}>
              <PageAvatar size={30} />
              <div style={{ marginLeft: 8, background: MS.grey, borderRadius: 19, padding: "9px 15px" }}>
                <Dots clock={clock} color="#8A8D91" size={9} />
              </div>
            </div>
          </Arrive>
        )}
      </div>
      {/* quick replies */}
      {chips.length > 0 && chipsOut < 1 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 94, height: 48, display: "flex", gap: 8, justifyContent: "flex-end", padding: "0 12px", opacity: 1 - chipsOut, transform: `translateY(${chipsOut * 20}px)` }}>
          {chips.map((c, i) => {
            const hit = i === chipTap ? chipK : 0;
            return (
              <div key={c} style={{ height: 40, padding: "0 15px", borderRadius: 20, border: `1.5px solid ${MS.blue}`, color: hit > 0.3 ? "#fff" : MS.blue, background: hit > 0 ? `rgba(10,124,255,${hit})` : "#fff", display: "flex", alignItems: "center", fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", transform: `scale(${1 - 0.06 * Math.sin(hit * Math.PI)})` }}>
                <Bn>{c}</Bn>
              </div>
            );
          })}
        </div>
      )}
      {/* composer */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, height: 56, display: "flex", alignItems: "center", gap: 14, padding: "0 12px" }}>
        <I.plusCircle size={27} color={MS.blue} />
        <I.camera size={26} color={MS.blue} stroke={2.1} />
        <I.image size={26} color={MS.blue} stroke={2.1} />
        <I.mic size={26} color={MS.blue} />
        <div style={{ flex: 1, height: 40, borderRadius: 20, background: MS.grey, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 17, color: MS.meta, fontWeight: 500, justifyContent: "space-between" }}>
          Aa
          <I.smile size={22} color={MS.blue} stroke={2} />
        </div>
        <I.thumb size={27} color={MS.blue} />
      </div>
      <HomeBar />
    </div>
  );
};
