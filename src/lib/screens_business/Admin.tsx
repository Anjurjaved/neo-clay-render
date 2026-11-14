// CMS/admin panel (tablet 1024×700): holiday notice toggle + লেখা, opening hours, service-এর দাম edit, Save → "website updated" toast
import React from "react";
import { UI, INK, SUB, LINE, Icon, Tk, Cursor, Pointer, Toggle, k01, mixHex, Bn, BN, toBn } from "./ui";

const ORANGE = "#F5952B";
export const ADMIN_NOTICE = "ঈদুল আযহা উপলক্ষে ১৫–১৯ জুন চেম্বার বন্ধ থাকবে। ২০ জুন থেকে নিয়মিত সিরিয়াল।";

export type AdminProps = {
  holiday: number; // toggle 0→1
  notice: string; // টাইপ হওয়া বাংলা notice
  price: string; // price field-এর লেখা ("1,200")
  focus?: "notice" | "price" | null;
  caret?: boolean;
  savePress?: number;
  saved?: number; // 0→1 toast + "Saved"
  dirty?: boolean; // unsaved changes আছে
  cursor?: Pointer;
};

const NAV: [Parameters<typeof Icon>[0]["n"], string, string?][] = [
  ["home", "Dashboard"],
  ["sliders", "Business info"],
  ["tag", "Services & prices"],
  ["calendar", "Appointments", "12"],
  ["image", "Gallery"],
  ["star", "Reviews"],
  ["users", "Staff"],
];

const Card: React.FC<{ title: string; icon: Parameters<typeof Icon>[0]["n"]; style?: React.CSSProperties; right?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, style, right, children }) => (
  <div style={{ background: "#fff", borderRadius: 18, padding: "16px 18px", boxShadow: "0 2px 10px rgba(20,33,61,0.05)", border: `1px solid ${LINE}`, ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: "#FFF1E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon n={icon} s={18} c="#D85E24" w={2.2} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ marginLeft: "auto" }}>{right}</div>
    </div>
    {children}
  </div>
);

export const AdminScreen: React.FC<AdminProps> = ({ holiday, notice, price, focus = null, caret = true, savePress = 0, saved = 0, dirty = false, cursor }) => {
  const h = k01(holiday);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F5F6F9", fontFamily: UI, color: INK, overflow: "hidden" }}>
      {/* top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 62, background: "#fff", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 22px", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(145deg,#2C5E93,#173A63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="tooth" s={21} c="#fff" w={1.8} fill="rgba(255,255,255,0.2)" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.1 }}>Dr. Shirin Dental Chamber</div>
          <div style={{ fontSize: 12, color: SUB, fontWeight: 600 }}>Website admin</div>
        </div>
        <div style={{ marginLeft: 40, width: 280, height: 38, borderRadius: 12, background: "#F2F4F7", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", color: "#8A94A3", fontSize: 14 }}>
          <Icon n="search" s={17} c="#8A94A3" /> Search settings, services…
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: "#2C5E93" }}>
          <Icon n="globe" s={18} c="#2C5E93" /> View website
        </div>
        <Icon n="bell" s={21} c={SUB} style={{ marginLeft: 14 }} />
        <div style={{ width: 36, height: 36, borderRadius: 18, background: "#E9D7C6", color: "#7A4A26", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 6 }}>SA</div>
      </div>
      {/* sidebar */}
      <div style={{ position: "absolute", top: 62, left: 0, bottom: 0, width: 206, background: "#fff", borderRight: `1px solid ${LINE}`, padding: "16px 12px" }}>
        {NAV.map(([ic, label, n], i) => {
          const on = i === 1;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 11, height: 44, padding: "0 12px", borderRadius: 12, marginBottom: 3, background: on ? "#FFF1E2" : "transparent", color: on ? "#C2531C" : "#3A4658", fontSize: 15, fontWeight: on ? 700 : 600 }}>
              <Icon n={ic} s={19} c={on ? "#D85E24" : "#6B7686"} />
              {label}
              {n && <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#8A94A3" }}>{n}</span>}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 14, right: 14, bottom: 18, background: "#EEF8F2", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 700, color: "#1C8A4C" }}>
            <div style={{ width: 9, height: 9, borderRadius: 5, background: "#22B35E", boxShadow: "0 0 0 3px rgba(34,179,94,0.2)" }} /> Website live
          </div>
          <div style={{ fontSize: 13, color: SUB, marginTop: 4 }}>shirindental.com</div>
        </div>
      </div>
      {/* main */}
      <div style={{ position: "absolute", top: 62, left: 206, right: 0, bottom: 0, padding: "20px 26px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Business info</div>
            <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>Changes appear on your website as soon as you save</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            {dirty && saved < 0.5 && <div style={{ fontSize: 13.5, color: "#B46A16", fontWeight: 700 }}>Unsaved changes</div>}
            <div
              style={{
                height: 46, padding: "0 22px", borderRadius: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: "#fff",
                background: saved > 0.5 ? "#22B35E" : ORANGE, transform: `scale(${1 - 0.05 * savePress})`, boxShadow: saved > 0.5 ? "0 6px 14px rgba(34,179,94,0.3)" : "0 6px 14px rgba(245,149,43,0.35)",
              }}
            >
              <Icon n="check" s={19} c="#fff" w={3} /> {saved > 0.5 ? "Saved" : "Save changes"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
          {/* left column */}
          <div style={{ flex: 1.15, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <Card title="Holiday notice" icon="bell" right={<Toggle k={h} on={ORANGE} />}>
              <div style={{ fontSize: 14, color: SUB, marginTop: -4, marginBottom: 10 }}>Show this notice at the top of your website</div>
              <div style={{ minHeight: 86, borderRadius: 14, border: `2px solid ${focus === "notice" ? ORANGE : LINE}`, boxShadow: focus === "notice" ? "0 0 0 4px rgba(245,149,43,0.13)" : "none", padding: "10px 14px", fontFamily: BN, fontSize: 18, fontWeight: 600, lineHeight: 1.5, color: INK, background: mixHex("#FAFBFC", "#FFFFFF", h) }}>
                {notice ? toBn(notice) : <span style={{ color: "#A9B1BD" }}>Write a notice…</span>}
                {focus === "notice" && <span style={{ display: "inline-block", width: 2, height: 22, background: ORANGE, marginLeft: 1, verticalAlign: -4, opacity: caret ? 1 : 0 }} />}
              </div>
              {/* website preview strip */}
              <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", border: `1px solid ${LINE}`, opacity: 0.35 + 0.65 * h }}>
                <div style={{ height: 22, background: "#F2F4F7", display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  {["#FF6159", "#FFBD2E", "#28C941"].map((c) => (
                    <div key={c} style={{ width: 8, height: 8, borderRadius: 4, background: c }} />
                  ))}
                  <div style={{ fontSize: 11, color: SUB, marginLeft: 8, fontWeight: 600 }}>shirindental.com</div>
                </div>
                <div style={{ background: mixHex("#F2F4F7", "#FFF3E0", h), padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#8A4A0F", minWidth: 0 }}>
                  <Icon n="info" s={16} c="#D85E24" />
                  <span style={{ fontFamily: BN, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h > 0.02 ? toBn(notice || "…") : ""}</span>
                </div>
              </div>
            </Card>
            <Card title="Opening hours" icon="clock" right={<span style={{ fontSize: 14, fontWeight: 700, color: "#2C5E93" }}>Edit</span>}>
              {[
                ["Saturday – Thursday", "5:00 PM – 10:00 PM", false],
                ["Friday", "Closed", true],
                ["Eid holiday", "15 – 19 June", true],
              ].map(([d, tm, closed], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderTop: i ? `1px solid ${LINE}` : "none", fontSize: 15.5, opacity: i === 2 ? 0.3 + 0.7 * h : 1 }}>
                  <span style={{ fontWeight: 600 }}>{d as string}</span>
                  <span style={{ marginLeft: "auto", fontWeight: 700, color: closed ? "#D2483A" : INK }}>{tm as string}</span>
                </div>
              ))}
            </Card>
          </div>
          {/* right column: service edit */}
          <div style={{ flex: 0.85, minWidth: 0 }}>
            <Card title="Edit service" icon="pencil" right={<Icon n="more" s={20} c={SUB} />}>
              <div style={{ height: 120, borderRadius: 14, background: "linear-gradient(140deg,#E3EEF8,#C8DBEE)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 160, height: 160, borderRadius: 80, background: "rgba(255,255,255,0.45)", right: -40, top: -50 }} />
                <Icon n="tooth" s={64} c="#2C5E93" w={1.4} fill="#fff" />
                <div style={{ position: "absolute", right: 10, bottom: 10, background: "rgba(255,255,255,0.92)", borderRadius: 9, padding: "4px 9px", fontSize: 12, fontWeight: 700, display: "flex", gap: 5, alignItems: "center" }}>
                  <Icon n="image" s={13} c={INK} /> Change photo
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: SUB, marginTop: 14 }}>Service name</div>
              <div style={{ marginTop: 6, height: 44, borderRadius: 12, border: `1.5px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 13px", fontSize: 16.5, fontWeight: 700 }}>Scaling & Polishing</div>
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <div style={{ flex: 1.2 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: SUB }}>Price</div>
                  <div style={{ marginTop: 6, height: 48, borderRadius: 12, border: `2px solid ${focus === "price" ? ORANGE : LINE}`, boxShadow: focus === "price" ? "0 0 0 4px rgba(245,149,43,0.13)" : "none", display: "flex", alignItems: "center", padding: "0 13px", fontSize: 21, fontWeight: 800 }}>
                    <Tk n={price} />
                    {focus === "price" && <span style={{ display: "inline-block", width: 2, height: 22, background: ORANGE, marginLeft: 2, opacity: caret ? 1 : 0 }} />}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: SUB }}>Duration</div>
                  <div style={{ marginTop: 6, height: 48, borderRadius: 12, border: `1.5px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 13px", fontSize: 17, fontWeight: 700, gap: 6 }}>
                    <span style={{ whiteSpace: "nowrap" }}>30 min</span> <Icon n="down" s={16} c={SUB} style={{ marginLeft: "auto" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginTop: 16, fontSize: 15, fontWeight: 600 }}>
                Show price <div style={{ marginLeft: "auto" }}><Toggle k={1} w={46} /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginTop: 12, fontSize: 15, fontWeight: 600 }}>
                Online booking <div style={{ marginLeft: "auto" }}><Toggle k={1} w={46} /></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {/* toast */}
      {saved > 0 && (
        <div style={{ position: "absolute", bottom: 26, left: "calc(50% + 103px)", transform: `translate(-50%, ${(1 - k01(saved * 2.5)) * 50}px)`, opacity: k01(saved * 3), background: "#14213D", color: "#fff", borderRadius: 16, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700, boxShadow: "0 12px 28px rgba(14,22,40,0.3)", whiteSpace: "nowrap" }}>
          <div style={{ width: 24, height: 24, borderRadius: 12, background: "#22B35E", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon n="check" s={15} c="#fff" w={3.4} />
          </div>
          Saved — your website is updated
        </div>
      )}
      {cursor && <Cursor {...cursor} />}
    </div>
  );
};
