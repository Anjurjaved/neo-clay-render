// device screen-এর আসল DOM UI (390×812 phone / 1024×700 laptop)
import React from "react";
import { StatusBar } from "../kit/Device";

const ui = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";

const PhoneIcon: React.FC<{ c?: string; s?: number }> = ({ c = "#E5484D", s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
  </svg>
);

/** lock-screen missed calls — count 0..30 */
export const MissedCalls: React.FC<{ count: number; t: number }> = ({ count }) => {
  const n = Math.max(0, Math.round(count));
  const rows = Math.min(5, n);
  const nums = ["+880 1711-2•••••", "+880 1819-4•••••", "+880 1912-7•••••", "+880 1556-3•••••", "+880 1678-9•••••"];
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg,#E9EEF4 0%,#DCE4EE 60%,#D2DCE8 100%)", fontFamily: ui }}>
      <StatusBar />
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, textAlign: "center", color: "#1B2A3D" }}>
        <div style={{ fontSize: 22, fontWeight: 600, opacity: 0.7 }}>Friday</div>
        <div style={{ fontSize: 86, fontWeight: 300, letterSpacing: -2, lineHeight: 1 }}>5:12</div>
      </div>
      <div style={{ position: "absolute", top: 260, left: 16, right: 16 }}>
        {n > 0 && (
          <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 22, padding: "16px 18px", boxShadow: "0 6px 18px rgba(30,50,80,0.10)", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FDECEC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhoneIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, color: "#6b7785", fontWeight: 600 }}>Phone</div>
              <div style={{ fontSize: 27, color: "#1B2A3D", fontWeight: 800 }}>{n} Missed calls</div>
            </div>
          </div>
        )}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{ background: "rgba(255,255,255,0.78)", borderRadius: 18, padding: "12px 16px", marginBottom: 9, display: "flex", alignItems: "center", gap: 12, transform: `scale(${1 - i * 0.03})`, opacity: 1 - i * 0.12 }}
          >
            <PhoneIcon s={18} />
            <div style={{ fontSize: 19, color: "#2a3646", fontWeight: 600 }}>Missed call</div>
            <div style={{ fontSize: 15, color: "#7a8694", marginLeft: "auto" }}>{nums[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** চেম্বারের business website (laptop 1024×700) */
export const DentalSite: React.FC<{ reveal: number }> = ({ reveal }) => {
  const r = Math.max(0, Math.min(1, reveal));
  const sec = (i: number) => ({ opacity: Math.max(0, Math.min(1, r * 4 - i)), transform: `translateY(${(1 - Math.max(0, Math.min(1, r * 4 - i))) * 24}px)` });
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FBF8F4", fontFamily: ui, color: "#13253C" }}>
      <div style={{ height: 66, display: "flex", alignItems: "center", padding: "0 40px", borderBottom: "1px solid #EEE6DC", ...sec(0) }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#1B4470", marginRight: 12 }} />
        <div style={{ fontWeight: 800, fontSize: 22 }}>Dr. Shirin Dental Chamber</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 26, fontSize: 16, fontWeight: 600, color: "#4a5a6c" }}>
          <span>Treatments</span>
          <span>Doctor</span>
          <span>Fees</span>
          <span>Contact</span>
        </div>
      </div>
      <div style={{ display: "flex", padding: "46px 40px 0", gap: 34 }}>
        <div style={{ flex: 1.1, ...sec(1) }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#D85E24", letterSpacing: 1 }}>ZINDABAZAR, SYLHET</div>
          <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.08, marginTop: 10 }}>Gentle dental care, booked in a minute.</div>
          <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
            <div style={{ background: "#F5952B", color: "#fff", fontWeight: 800, fontSize: 18, padding: "15px 26px", borderRadius: 14 }}>Book Appointment</div>
            <div style={{ border: "2px solid #1B4470", color: "#1B4470", fontWeight: 800, fontSize: 18, padding: "13px 22px", borderRadius: 14 }}>Call Now</div>
          </div>
        </div>
        <div style={{ flex: 0.9, height: 300, borderRadius: 24, background: "linear-gradient(150deg,#DCE8F3,#BFD3E6)", position: "relative", ...sec(2) }}>
          <div style={{ position: "absolute", left: 40, top: 60, width: 150, height: 150, borderRadius: 75, background: "#fff", opacity: 0.85 }} />
          <div style={{ position: "absolute", right: 30, bottom: 30, background: "#fff", borderRadius: 14, padding: "12px 16px", fontWeight: 700, fontSize: 15 }}>Next slot · 5:30 PM</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 18, padding: "34px 40px 0", ...sec(3) }}>
        {["Scaling", "Root Canal", "Braces", "Whitening"].map((x) => (
          <div key={x} style={{ flex: 1, background: "#fff", borderRadius: 16, padding: "18px 18px", fontWeight: 700, fontSize: 17, boxShadow: "0 4px 14px rgba(20,40,70,0.06)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#E8EEF5", marginBottom: 10 }} />
            {x}
          </div>
        ))}
      </div>
    </div>
  );
};

/** WhatsApp-ধাঁচের chat (logo নয়) — নম্বর টাইপ হয় */
export const ChatScreen: React.FC<{ typed: string; caret: boolean; sent: number }> = ({ typed, caret, sent }) => (
  <div style={{ position: "absolute", inset: 0, background: "#EFE7DE", fontFamily: ui }}>
    <div style={{ height: 130, background: "#1F9D55", color: "#fff", display: "flex", alignItems: "flex-end", padding: "0 18px 16px", gap: 12 }}>
      <div style={{ width: 46, height: 46, borderRadius: 23, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#1B4470", fontWeight: 800, fontSize: 16 }}>JIT</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 22 }}>Javed IT Solution</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>online</div>
      </div>
    </div>
    <div style={{ padding: "22px 16px" }}>
      <div style={{ background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "14px 16px", fontSize: 21, color: "#1d2733", maxWidth: 300, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
        Hi! Which pages does your chamber need?
      </div>
      {sent > 0 && (
        <div style={{ marginTop: 14, marginLeft: "auto", background: "#D8F6C9", borderRadius: "16px 16px 4px 16px", padding: "14px 16px", fontSize: 21, color: "#1d2733", maxWidth: 290, opacity: sent, transform: `translateY(${(1 - sent) * 16}px)` }}>
          Need a website for my dental chamber
        </div>
      )}
    </div>
    {/* নম্বর input */}
    <div style={{ position: "absolute", left: 16, right: 16, bottom: 120 }}>
      <div style={{ fontSize: 14, color: "#5b6672", fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>WHATSAPP</div>
      <div style={{ background: "#fff", borderRadius: 18, padding: "18px 18px", fontSize: 40, fontWeight: 800, color: "#13253C", letterSpacing: 1.5, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", minHeight: 44 }}>
        {typed}
        <span style={{ opacity: caret ? 1 : 0, color: "#1F9D55" }}>|</span>
      </div>
    </div>
  </div>
);
