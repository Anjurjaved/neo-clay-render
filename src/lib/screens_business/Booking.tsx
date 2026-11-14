// Serial/appointment booking (phone 390×843): doctor card → date strip → time slot → নাম/মোবাইল → Confirm → serial confirmed sheet
import React from "react";
import { StatusBar } from "../../kit/Device";
import { UI, INK, SUB, LINE, Icon, Tk, Touch, Pointer, SuccessMark, k01, mixHex, Bn } from "./ui";

const ORANGE = "#F5952B";
export const BOOK_DAYS = [
  { d: "Sat", n: 15 },
  { d: "Sun", n: 16 },
  { d: "Mon", n: 17 },
  { d: "Tue", n: 18 },
  { d: "Wed", n: 19 },
];
export const BOOK_SLOTS = [
  { s: "5:00 PM", booked: true },
  { s: "5:30 PM", booked: false },
  { s: "6:00 PM", booked: true },
  { s: "6:30 PM", booked: false },
  { s: "7:00 PM", booked: false },
  { s: "7:30 PM", booked: true },
];

export type BookingProps = {
  day: number; // বাছাই করা দিন index
  dayK?: number; // 0→1 বাছাই animation
  slot: number; // -1 = কিছু নয়
  slotK?: number;
  name: string;
  phone: string;
  focus?: "name" | "phone" | null;
  caret?: boolean;
  confirmPress?: number;
  confirmed?: number; // 0→1 sheet
  serial?: number;
  touch?: Pointer;
};

const Field: React.FC<{ icon: "user" | "phone"; label: string; value: string; ph: string; focus: boolean; caret: boolean }> = ({ icon, label, value, ph, focus, caret }) => (
  <div style={{ background: "#fff", borderRadius: 16, border: `2px solid ${focus ? ORANGE : "#fff"}`, padding: "8px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: focus ? "0 0 0 4px rgba(245,149,43,0.14)" : "0 3px 10px rgba(20,33,61,0.05)" }}>
    <Icon n={icon} s={22} c={focus ? ORANGE : SUB} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: SUB }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 700, color: value ? INK : "#A9B1BD", height: 25, display: "flex", alignItems: "center" }}>
        {value || (!focus ? ph : "")}
        {focus && <span style={{ display: "inline-block", width: 2, height: 21, background: ORANGE, marginLeft: 1, opacity: caret ? 1 : 0 }} />}
      </div>
    </div>
  </div>
);

export const BookingScreen: React.FC<BookingProps> = ({ day, dayK = 1, slot, slotK = 1, name, phone, focus = null, caret = true, confirmPress = 0, confirmed = 0, serial = 7, touch }) => {
  const ready = slot >= 0 && name.length > 2 && phone.length >= 12;
  const dd = BOOK_DAYS[day];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F4F5F8", fontFamily: UI, color: INK }}>
      <StatusBar />
      <div style={{ position: "absolute", top: 58, left: 0, right: 0, height: 54, display: "flex", alignItems: "center", padding: "0 18px", gap: 14 }}>
        <Icon n="back" s={26} c={INK} w={2.4} />
        <div style={{ fontSize: 22, fontWeight: 800 }}>Book a serial</div>
      </div>
      {/* doctor */}
      <div style={{ position: "absolute", top: 116, left: 16, right: 16, background: "#fff", borderRadius: 22, padding: 14, display: "flex", gap: 14, alignItems: "center", boxShadow: "0 4px 14px rgba(20,33,61,0.05)" }}>
        <div style={{ width: 66, height: 66, borderRadius: 20, background: "linear-gradient(145deg,#2C5E93,#173A63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="tooth" s={36} c="#fff" w={1.8} fill="rgba(255,255,255,0.18)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>Dr. Shirin Akter</div>
          <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>BDS, FCPS · Dental Surgeon</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, marginTop: 5, color: SUB }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Icon n="pin" s={15} c={SUB} /> Zindabazar, Sylhet
            </span>
            <span style={{ color: INK, fontWeight: 700 }}>
              Fee <Tk n={500} />
            </span>
          </div>
        </div>
      </div>
      {/* date */}
      <div style={{ position: "absolute", top: 234, left: 22, right: 22, display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 800 }}>Choose date</div>
        <div style={{ marginLeft: "auto", fontSize: 14, color: SUB, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          November 2026 <Icon n="down" s={16} c={SUB} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 266, left: 16, right: 16, display: "flex", gap: 8 }}>
        {BOOK_DAYS.map((x, i) => {
          const on = i === day ? k01(dayK) : 0;
          return (
            <div key={i} style={{ flex: 1, height: 80, borderRadius: 18, background: on > 0 ? mixHex("#FFFFFF", ORANGE, on) : "#fff", color: on > 0.5 ? "#fff" : INK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: on > 0.5 ? "0 8px 16px rgba(245,149,43,0.32)" : "0 3px 10px rgba(20,33,61,0.05)", transform: `translateY(${-4 * Math.sin(Math.PI * on)}px)` }}>
              <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.8 }}>{x.d}</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 1 }}>{x.n}</div>
            </div>
          );
        })}
      </div>
      {/* slots */}
      <div style={{ position: "absolute", top: 364, left: 22, fontSize: 17, fontWeight: 800 }}>Choose time</div>
      <div style={{ position: "absolute", top: 364, right: 22, fontSize: 13.5, color: SUB, fontWeight: 600 }}>3 left today</div>
      <div style={{ position: "absolute", top: 396, left: 16, right: 16, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {BOOK_SLOTS.map((x, i) => {
          const on = i === slot ? k01(slotK) : 0;
          return (
            <div
              key={i}
              style={{
                height: 50, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700,
                background: x.booked ? "#ECEEF2" : on > 0 ? mixHex("#FFFFFF", INK, on) : "#fff",
                color: x.booked ? "#AAB1BC" : on > 0.5 ? "#fff" : INK, textDecoration: x.booked ? "line-through" : "none",
                border: x.booked ? "none" : `1.5px solid ${on > 0 ? INK : "#DCE0E7"}`, transform: `scale(${1 + 0.05 * Math.sin(Math.PI * on)})`,
              }}
            >
              {x.s}
            </div>
          );
        })}
      </div>
      {/* fields */}
      <div style={{ position: "absolute", top: 524, left: 16, right: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <Field icon="user" label="Patient name" value={name} ph="Your name" focus={focus === "name"} caret={caret} />
        <Field icon="phone" label="Mobile number" value={phone} ph="01XXX-XXXXXX" focus={focus === "phone"} caret={caret} />
      </div>
      <div style={{ position: "absolute", top: 680, left: 22, right: 22, fontSize: 13.5, color: SUB, display: "flex", gap: 6, alignItems: "center" }}>
        <Icon n="info" s={16} c={SUB} /> <Bn style={{ fontSize: 14.5, fontWeight: 600 }}>সিরিয়াল নম্বর SMS-এ চলে যাবে</Bn>
      </div>
      {/* confirm */}
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 36, height: 60, borderRadius: 19, background: ready ? ORANGE : "#C7CDD6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 20, fontWeight: 800, transform: `scale(${1 - 0.04 * confirmPress})`, boxShadow: ready ? "0 10px 20px rgba(245,149,43,0.35)" : "none" }}>
        <Icon n="calendar" s={22} c="#fff" w={2.2} /> Confirm serial
      </div>
      {/* confirmed sheet */}
      {confirmed > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(14,22,40,${0.42 * k01(confirmed * 3)})` }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: "#fff", borderRadius: "30px 30px 0 0", transform: `translateY(${(1 - k01(confirmed * 2.2)) * 570}px)`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18 }}>
            <div style={{ width: 44, height: 5, borderRadius: 3, background: "#DDE1E7", marginBottom: 22 }} />
            <SuccessMark k={k01(confirmed * 1.3 - 0.2)} s={104} />
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 12 }}>Serial confirmed</div>
            <div style={{ marginTop: 18, width: 330, borderRadius: 24, background: "linear-gradient(150deg,#FFF4E6,#FDE7CF)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#B4651B", letterSpacing: 1 }}>SERIAL</div>
                <div style={{ fontSize: 58, fontWeight: 800, color: "#D85E24", lineHeight: 1, letterSpacing: -2 }}>#{String(serial).padStart(2, "0")}</div>
              </div>
              <div style={{ width: 1.5, alignSelf: "stretch", background: "rgba(216,94,36,0.25)" }} />
              <div style={{ fontSize: 16, lineHeight: 1.55 }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>
                  {dd ? `${dd.d}, ${dd.n} Nov` : ""}
                </div>
                <div style={{ fontWeight: 700 }}>{slot >= 0 ? BOOK_SLOTS[slot].s : ""}</div>
                <div style={{ color: SUB }}>{name}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 15, color: SUB }}>
              <Icon n="chat" s={18} c="#1FAF5A" /> SMS sent to {phone}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22, width: 358 }}>
              <div style={{ flex: 1, height: 54, borderRadius: 17, border: `2px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 17, fontWeight: 700 }}>
                <Icon n="pin" s={20} c={INK} /> Directions
              </div>
              <div style={{ flex: 1, height: 54, borderRadius: 17, background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 17, fontWeight: 700 }}>
                <Icon n="calendar" s={20} c="#fff" /> Add to calendar
              </div>
            </div>
          </div>
        </div>
      )}
      {touch && <Touch {...touch} />}
    </div>
  );
};
