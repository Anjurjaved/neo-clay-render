// WhatsApp-ধাঁচ chat (logo ছাড়া — সবুজ header, beige wallpaper, সবুজ bubble, নীল tick দিয়ে চেনা) — Android, 390×843
// <WhatsAppChat> : messages (k = আসার progress), typing dots, ticks, voice note playback, composer typing
// <WhatsAppNewContact> : নতুন contact-এ number টাইপ (BD +880), numeric keyboard key press
import React from "react";
import { StatusBar } from "../../kit/Device";
import { UI, Bn, I, Ticks, Avatar, Dots, HomeBar, Arrive, clamp01 } from "./ui";

export const WA = {
  green: "#008069",
  accent: "#00A884",
  out: "#D9FDD3",
  wall: "#EFEAE2",
  ink: "#111B21",
  meta: "#667781",
  blue: "#53BDEB",
};

export type WaMsg =
  | { kind: "text"; from: "me" | "them"; text: string; time: string; tick?: number; k?: number }
  | { kind: "voice"; from: "me" | "them"; secs: number; time: string; play?: number; tick?: number; k?: number }
  | { kind: "date"; text: string; k?: number };

// wallpaper doodle — খুব হালকা line pattern (আসল app-এর texture)
const doodle = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120' fill='none' stroke='#cfc4b6' stroke-width='1.6' stroke-linecap='round' opacity='0.55'>
  <circle cx='18' cy='20' r='7'/><path d='M44 14l8 8M52 14l-8 8'/><path d='M80 12c6 0 10 4 10 10'/><rect x='96' y='38' width='12' height='16' rx='3'/>
  <path d='M14 58c4-6 12-6 16 0'/><circle cx='60' cy='52' r='3'/><path d='M70 70l10-6 10 6-10 6z'/><path d='M20 96h18M29 87v18'/>
  <path d='M58 98c0-6 8-6 8 0s8 6 8 0'/><circle cx='100' cy='96' r='6'/><path d='M100 90v-6'/></svg>`
);
const WALL_BG = `${WA.wall} url("data:image/svg+xml,${doodle}")`;

const Tail: React.FC<{ side: "me" | "them"; color: string }> = ({ side, color }) => (
  <svg width="10" height="14" viewBox="0 0 10 14" style={{ position: "absolute", top: 0, [side === "me" ? "right" : "left"]: -8 } as any}>
    <path d={side === "me" ? "M0 0h10L0 12z" : "M10 0H0l10 12z"} fill={color} />
  </svg>
);

const Meta: React.FC<{ time: string; tick?: number; me: boolean }> = ({ time, tick, me }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, float: "right", margin: "8px 0 -6px 10px", fontSize: 12.5, color: WA.meta, fontFamily: UI, fontWeight: 500, lineHeight: 1 }}>
    {time}
    {me && tick !== undefined && <Ticks state={tick} size={17} />}
  </span>
);

const Wave: React.FC<{ play: number; me: boolean }> = ({ play, me }) => {
  const n = 34;
  return (
    <div style={{ position: "relative", flex: 1, height: 30, display: "flex", alignItems: "center", gap: 2.2 }}>
      {Array.from({ length: n }, (_, i) => {
        const h = 5 + Math.abs(Math.sin(i * 1.7) * 13 + Math.sin(i * 0.53) * 7);
        const done = i / n < play;
        return <div key={i} style={{ width: 3, height: Math.min(28, h), borderRadius: 2, background: done ? (me ? "#4FA0A0" : "#34B7F1") : "#B4BDC3" }} />;
      })}
      <div style={{ position: "absolute", left: `calc(${clamp01(play) * 100}% - 7px)`, top: 8, width: 14, height: 14, borderRadius: 7, background: me ? "#4FA0A0" : "#34B7F1" }} />
    </div>
  );
};

const Bubble: React.FC<{ m: WaMsg; first: boolean }> = ({ m, first }) => {
  if (m.kind === "date")
    return (
      <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 10px" }}>
        <div style={{ background: "#fff", color: WA.meta, fontSize: 13.5, fontWeight: 600, padding: "6px 12px", borderRadius: 8, boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)", fontFamily: UI }}>{m.text}</div>
      </div>
    );
  const me = m.from === "me";
  const bg = me ? WA.out : "#fff";
  const base: React.CSSProperties = {
    position: "relative",
    maxWidth: m.kind === "voice" ? 300 : 292,
    background: bg,
    borderRadius: 10,
    borderTopRightRadius: me && first ? 0 : 10,
    borderTopLeftRadius: !me && first ? 0 : 10,
    boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
    color: WA.ink,
  };
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", padding: me ? "0 16px 0 60px" : "0 60px 0 16px", marginTop: first ? 8 : 3 }}>
      {m.kind === "text" ? (
        <div style={{ ...base, padding: "8px 10px 10px 11px", fontSize: 17.5, lineHeight: 1.42 }}>
          {first && <Tail side={m.from} color={bg} />}
          <Bn>{m.text}</Bn>
          <Meta time={m.time} tick={m.tick} me={me} />
        </div>
      ) : (
        <div style={{ ...base, width: 292, padding: "9px 10px 7px 9px" }}>
          {first && <Tail side={m.from} color={bg} />}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!me && (
              <div style={{ position: "relative" }}>
                <Avatar size={50} text="DS" bg="#1B4470" bg2="#3E6E9E" fontSize={18} />
                <div style={{ position: "absolute", right: -3, bottom: -2, width: 22, height: 22, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <I.mic size={15} color={(m.play ?? 0) > 0 ? "#34B7F1" : WA.accent} />
                </div>
              </div>
            )}
            {(m.play ?? 0) > 0 && (m.play ?? 0) < 1 ? <I.pause size={30} color="#8696A0" /> : <I.play size={30} color="#8696A0" />}
            <Wave play={m.play ?? 0} me={me} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: WA.meta, fontFamily: UI, fontWeight: 500, padding: me ? "2px 2px 0 40px" : "2px 2px 0 100px" }}>
            <span>{`0:${String(Math.floor((m.play ?? 0) > 0 ? (m.play ?? 0) * m.secs : m.secs)).padStart(2, "0")}`}</span>
            <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
              {m.time}
              {me && m.tick !== undefined && <Ticks state={m.tick} size={17} />}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const WhatsAppChat: React.FC<{
  name: string;
  initials?: string;
  status?: string; // "online" / "last seen today at 4:10 pm"
  msgs: WaMsg[];
  typing?: number; // 0..1 — typing bubble দেখা যাওয়ার মাত্রা
  clock: number; // সেকেন্ড (dots/caret phase)
  draft?: string; // composer-এ টাইপ হওয়া লেখা
  caret?: boolean;
}> = ({ name, initials = "DS", status = "online", msgs, typing = 0, clock, draft = "", caret = false }) => (
  <div style={{ position: "absolute", inset: 0, background: WALL_BG, backgroundSize: "120px 120px", fontFamily: UI, overflow: "hidden" }}>
    {/* header */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 124, background: WA.green, zIndex: 5 }}>
      <StatusBar dark kind="android" time="4:12" />
      <div style={{ position: "absolute", top: 58, left: 0, right: 0, height: 62, display: "flex", alignItems: "center", padding: "0 6px 0 10px", color: "#fff" }}>
        <I.back size={25} color="#fff" stroke={2.3} />
        <Avatar size={42} text={initials} bg="#1B4470" bg2="#3E6E9E" style={{ marginLeft: 6 }} fontSize={16} />
        <div style={{ marginLeft: 11, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.9, marginTop: 1 }}>{typing > 0.5 ? "typing…" : status}</div>
        </div>
        <div style={{ display: "flex", gap: 22, alignItems: "center", paddingRight: 6 }}>
          <I.video size={25} color="#fff" stroke={2} />
          <I.phone size={22} color="#fff" />
          <I.more size={22} color="#fff" />
        </div>
      </div>
    </div>
    {/* messages: নিচ থেকে stack */}
    <div style={{ position: "absolute", top: 124, left: 0, right: 0, bottom: 82, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 8, overflow: "hidden" }}>
      {msgs.map((m, i) => {
        const prev = msgs[i - 1];
        const first = !prev || prev.kind === "date" || (m.kind !== "date" && prev.from !== m.from);
        const k = m.k ?? 1;
        return (
          <Arrive key={i} k={k} from={m.kind === "date" ? "center" : m.from === "me" ? "right" : "left"}>
            <Bubble m={m} first={first} />
          </Arrive>
        );
      })}
      {typing > 0 && (
        <Arrive k={typing} from="left">
          <div style={{ display: "flex", padding: "0 16px", marginTop: 8 }}>
            <div style={{ position: "relative", background: "#fff", borderRadius: 10, borderTopLeftRadius: 0, padding: "10px 16px", boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)" }}>
              <Tail side="them" color="#fff" />
              <Dots clock={clock} />
            </div>
          </div>
        </Arrive>
      )}
    </div>
    {/* composer */}
    <div style={{ position: "absolute", left: 7, right: 7, bottom: 26, height: 52, display: "flex", alignItems: "flex-end", gap: 6 }}>
      <div style={{ flex: 1, height: 52, borderRadius: 26, background: "#fff", display: "flex", alignItems: "center", padding: "0 14px 0 12px", gap: 10, boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)" }}>
        <I.smile size={26} color="#8696A0" stroke={1.8} />
        <div style={{ flex: 1, fontSize: 18, color: draft ? WA.ink : "#8696A0", whiteSpace: "nowrap", overflow: "hidden", display: "flex", alignItems: "center" }}>
          {draft ? <Bn>{draft}</Bn> : "Message"}
          {caret && <span style={{ display: "inline-block", width: 2, height: 22, background: WA.accent, marginLeft: 1 }} />}
        </div>
        <I.clip size={23} color="#8696A0" stroke={1.8} style={{ transform: "rotate(-40deg)" }} />
        {!draft && <I.camera size={24} color="#8696A0" stroke={1.8} />}
      </div>
      <div style={{ width: 52, height: 52, borderRadius: 26, background: WA.accent, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        {draft ? <I.send size={24} color="#fff" /> : <I.mic size={25} color="#fff" />}
      </div>
    </div>
    <HomeBar bottom={8} />
  </div>
);

const KEYS = [
  ["1", ""],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["+", ""],
  ["0", ""],
  ["⌫", ""],
];

/** নতুন contact: নাম + BD +880 phone field-এ number টাইপ, Android numeric keyboard */
export const WhatsAppNewContact: React.FC<{ first: string; last?: string; number: string; caret?: boolean; pressed?: string; press?: number; save?: number }> = ({
  first,
  last = "",
  number,
  caret = false,
  pressed,
  press = 0,
  save = 0,
}) => {
  const Field: React.FC<{ label: string; value: string; active?: boolean; icon?: React.ReactNode; mono?: boolean }> = ({ label, value, active, icon }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 22px", height: 72 }}>
      <div style={{ width: 26, display: "flex", justifyContent: "center" }}>{icon}</div>
      <div style={{ flex: 1, borderBottom: `${active ? 2.5 : 1.5}px solid ${active ? WA.accent : "#C9D1D6"}`, paddingBottom: 6 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: active ? WA.accent : WA.meta }}>{label}</div>
        <div style={{ fontSize: 21, fontWeight: 500, color: WA.ink, marginTop: 4, height: 28, display: "flex", alignItems: "center" }}>
          {value}
          {active && caret && <span style={{ display: "inline-block", width: 2, height: 24, background: WA.accent, marginLeft: 1 }} />}
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: UI, color: WA.ink }}>
      <StatusBar kind="android" time="4:11" />
      <div style={{ position: "absolute", top: 56, left: 0, right: 0, height: 64, display: "flex", alignItems: "center", padding: "0 18px", gap: 22 }}>
        <I.back size={25} color={WA.ink} stroke={2.2} />
        <div style={{ fontSize: 22, fontWeight: 600 }}>New contact</div>
      </div>
      <div style={{ position: "absolute", top: 132, left: 0, right: 0 }}>
        <Field label="First name" value={first} icon={<I.users size={24} color={WA.meta} stroke={1.8} />} />
        <Field label="Last name" value={last} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 22px", height: 78 }}>
          <div style={{ width: 26, display: "flex", justifyContent: "center" }}>
            <I.phone size={22} color={WA.meta} />
          </div>
          <div style={{ width: 92, borderBottom: "1.5px solid #C9D1D6", paddingBottom: 6, marginLeft: 4 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: WA.meta }}>Country</div>
            <div style={{ fontSize: 21, fontWeight: 500, marginTop: 4, height: 28 }}>BD +880</div>
          </div>
          <div style={{ flex: 1, borderBottom: `2.5px solid ${WA.accent}`, paddingBottom: 6 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: WA.accent }}>Phone</div>
            <div style={{ fontSize: 21, fontWeight: 600, marginTop: 4, height: 28, display: "flex", alignItems: "center", letterSpacing: 0.4 }}>
              {number}
              {caret && <span style={{ display: "inline-block", width: 2, height: 24, background: WA.accent, marginLeft: 1 }} />}
            </div>
          </div>
        </div>
        {number.replace(/\D/g, "").length >= 10 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px 0 66px", fontSize: 15, fontWeight: 600, color: WA.accent }}>
            <I.check size={18} color={WA.accent} stroke={2.6} />
            This phone number is on WhatsApp.
          </div>
        )}
      </div>
      {/* Save */}
      <div style={{ position: "absolute", top: 440, left: 22, right: 22, height: 50, borderRadius: 25, background: WA.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, transform: `scale(${1 - 0.05 * Math.sin(clamp01(save) * Math.PI)})`, boxShadow: save > 0 ? `0 0 0 ${10 * save}px rgba(0,168,132,${0.25 * (1 - save)})` : undefined }}>
        Save
      </div>
      {/* numeric keyboard */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 290, background: "#E9EEF1", padding: "12px 8px 34px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "1fr", gap: 7 }}>
        {KEYS.map(([d, l]) => {
          const hit = pressed === d ? press : 0;
          return (
            <div key={d} style={{ borderRadius: 9, background: hit > 0 ? `rgba(0,168,132,${0.18 + 0.25 * hit})` : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 1px 0 rgba(0,0,0,0.12)", transform: `scale(${1 - 0.04 * hit})` }}>
              {d === "⌫" ? <I.backspace size={26} color={WA.ink} stroke={1.8} /> : <span style={{ fontSize: 27, fontWeight: 500 }}>{d}</span>}
              {l && <span style={{ fontSize: 11, fontWeight: 600, color: WA.meta, letterSpacing: 0.6, width: 34 }}>{l}</span>}
            </div>
          );
        })}
      </div>
      <HomeBar bottom={8} />
    </div>
  );
};
