// Android dialer — keypad-এ number টাইপ (key ripple), contact suggestion, call button → calling screen (timer) — 390×843
import React from "react";
import { StatusBar } from "../../kit/Device";
import { UI, I, Avatar, HomeBar, Dots, clamp01, sprK } from "./ui";

const INK = "#1F1F1F",
  META = "#5E6370",
  ACC = "#0B57D0",
  GREEN = "#1E8E3E";
const KEYS: [string, string][] = [
  ["1", "∞"],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["*", ""],
  ["0", "+"],
  ["#", ""],
];
export const fmtBDPhone = (d: string) => (d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d);

export const DialPad: React.FC<{
  digits: string;
  pressed?: string;
  press?: number; // 0..1 ripple
  match?: { name: string; label: string; initials: string };
  call?: number; // call button চাপ 0..1
}> = ({ digits, pressed, press = 0, match, call = 0 }) => {
  const shown = fmtBDPhone(digits);
  const fs = shown.length > 11 ? 38 : 44;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F8FAFD", fontFamily: UI, color: INK }}>
      <StatusBar kind="android" time="4:20" />
      {/* typed number */}
      <div style={{ position: "absolute", top: 108, left: 0, right: 0, textAlign: "center", fontSize: fs, fontWeight: 500, letterSpacing: 1, height: 56 }}>{shown}</div>
      {digits.length > 0 && (
        <div style={{ position: "absolute", top: 176, left: 0, right: 0, textAlign: "center", fontSize: 16, fontWeight: 700, color: ACC }}>
          {match ? "" : "Add to contacts"}
        </div>
      )}
      {match && (
        <div style={{ position: "absolute", top: 168, left: 24, right: 24, height: 64, borderRadius: 18, background: "#E8EEF8", display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
          <Avatar size={42} text={match.initials} bg="#1B4470" bg2="#3E6E9E" fontSize={15} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17.5, fontWeight: 700 }}>{match.name}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: META }}>{match.label}</div>
          </div>
          <I.video size={24} color={ACC} stroke={2} />
        </div>
      )}
      {/* keypad */}
      <div style={{ position: "absolute", top: 262, left: 40, right: 40, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", rowGap: 12, justifyItems: "center" }}>
        {KEYS.map(([d, l]) => {
          const hit = pressed === d ? press : 0;
          return (
            <div key={d} style={{ width: 88, height: 70, borderRadius: 35, background: hit > 0 ? `rgba(11,87,208,${0.1 + 0.22 * hit})` : "#E8EEF8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.05 * hit})` }}>
              <span style={{ fontSize: d === "*" ? 36 : 31, fontWeight: 500, lineHeight: 1, marginTop: d === "*" ? 10 : 0 }}>{d}</span>
              {l && <span style={{ fontSize: 11.5, fontWeight: 700, color: META, letterSpacing: 1, marginTop: 3 }}>{l}</span>}
            </div>
          );
        })}
      </div>
      {/* call row */}
      <div style={{ position: "absolute", top: 616, left: 0, right: 0, height: 76, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 118, height: 66, borderRadius: 33, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.07 * Math.sin(clamp01(call) * Math.PI)})`, boxShadow: call > 0 ? `0 0 0 ${16 * call}px rgba(30,142,62,${0.3 * (1 - call)})` : undefined }}>
          <I.phone size={30} color="#fff" />
        </div>
        {digits.length > 0 && (
          <div style={{ position: "absolute", right: 46 }}>
            <I.backspace size={28} color={META} stroke={1.9} />
          </div>
        )}
      </div>
      {/* bottom tabs */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, height: 76, display: "flex", justifyContent: "space-around", alignItems: "center", borderTop: "1px solid #E3E8EF" }}>
        {[
          ["Favourites", <I.star2 size={23} color={META} stroke={1.9} />],
          ["Recents", <I.clock size={23} color={META} stroke={1.9} />],
          ["Contacts", <I.users size={23} color={META} stroke={1.9} />],
          ["Keypad", <I.dialpad size={22} color="#04305E" />],
        ].map(([label, icon], i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 62, height: 32, borderRadius: 16, background: i === 3 ? "#C2E7FF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon as any}</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: i === 3 ? INK : META }}>{label as string}</span>
          </div>
        ))}
      </div>
      <HomeBar bottom={8} />
    </div>
  );
};

/** calling / in-call screen — secs < 0 হলে "Calling…" */
export const CallingScreen: React.FC<{ name: string; number: string; initials: string; secs: number; clock: number; speaker?: number }> = ({ name, number, initials, secs, clock, speaker = 0 }) => {
  const connected = secs >= 0;
  const mm = Math.floor(Math.max(0, secs) / 60),
    ss = Math.floor(Math.max(0, secs)) % 60;
  // ringing pulse
  const pulse = connected ? 0 : (clock * 1.1) % 1;
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#DDE6F3 0%,#EEF2F8 55%,#F6F8FB 100%)", fontFamily: UI, color: INK }}>
      <StatusBar kind="android" time="4:20" />
      <div style={{ position: "absolute", top: 96, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: META, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
          <I.phone size={15} color={META} /> Mobile · Grameenphone
        </div>
        <div style={{ position: "relative", width: 124, height: 124, margin: "26px auto 0" }}>
          {!connected && <div style={{ position: "absolute", inset: -pulse * 36, borderRadius: "50%", border: `3px solid rgba(11,87,208,${0.45 * (1 - pulse)})` }} />}
          <Avatar size={124} text={initials} bg="#1B4470" bg2="#3E6E9E" fontSize={44} />
        </div>
        <div style={{ fontSize: 33, fontWeight: 600, marginTop: 24, lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontSize: 17, fontWeight: 500, color: META, marginTop: 6, letterSpacing: 0.5 }}>{number}</div>
        <div style={{ fontSize: 19, fontWeight: 700, marginTop: 14, color: connected ? GREEN : META, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, height: 26 }}>
          {connected ? `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}` : (
            <>
              Calling <Dots clock={clock} color={META} size={6} gap={4} />
            </>
          )}
        </div>
      </div>
      {/* controls */}
      <div style={{ position: "absolute", top: 456, left: 34, right: 34, display: "grid", gridTemplateColumns: "repeat(3,1fr)", rowGap: 18, justifyItems: "center" }}>
        {[
          ["Keypad", <I.dialpad size={25} color={INK} />],
          ["Mute", <I.micOff size={26} color={INK} stroke={1.9} />],
          ["Speaker", <I.speaker size={27} color={speaker > 0.5 ? "#fff" : INK} stroke={1.9} />],
          ["Add call", <I.addUser size={26} color={INK} stroke={1.9} />],
          ["Video", <I.video size={27} color={INK} stroke={1.9} />],
          ["Hold", <I.holdPause size={26} color={INK} stroke={2.6} />],
        ].map(([label, icon], i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: i === 2 && speaker > 0 ? `rgba(11,87,208,${speaker})` : "#fff", boxShadow: "0 1px 3px rgba(20,40,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center", transform: i === 2 ? `scale(${1 - 0.06 * Math.sin(clamp01(speaker) * Math.PI)})` : undefined }}>{icon as any}</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: META }}>{label as string}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 48, left: "50%", marginLeft: -59, width: 118, height: 66, borderRadius: 33, background: "#DC3545", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <I.phone size={32} color="#fff" style={{ transform: "rotate(135deg)" }} />
      </div>
      <HomeBar bottom={8} />
    </div>
  );
};

/** dial → calling transition (k 0..1): calling screen নিচ থেকে উঠে আসে */
export const DialerFlow: React.FC<{ k: number; dial: React.ReactNode; calling: React.ReactNode }> = ({ k, dial, calling }) => {
  const s = sprK(k * 1.1, 160, 18);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {k < 1 && <div style={{ position: "absolute", inset: 0, transform: `scale(${1 - 0.06 * clamp01(k * 2)})`, opacity: 1 - clamp01(k * 1.5) }}>{dial}</div>}
      {k > 0 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - Math.min(1.02, s)) * 100}%)`, borderRadius: 24, overflow: "hidden" }}>{calling}</div>}
    </div>
  );
};
