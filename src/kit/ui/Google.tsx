// master-এর মতো Google mobile search screen (390×843 DOM)
import React from "react";
import { StatusBar } from "../Device";

export const GWord: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <span style={{ fontFamily: "'Product Sans', 'Google Sans', Inter, Arial, sans-serif", fontWeight: 500, fontSize: size, letterSpacing: -1 }}>
    {[["G", "#4285F4"], ["o", "#EA4335"], ["o", "#FBBC05"], ["g", "#4285F4"], ["l", "#34A853"], ["e", "#EA4335"]].map(([c, col], i) => (
      <span key={i} style={{ color: col }}>{c}</span>
    ))}
  </span>
);

const Thumb: React.FC = () => <div style={{ width: 92, height: 92, borderRadius: 12, background: "linear-gradient(140deg,#E9ECEF,#D5DADF)" }} />;

export const GoogleSearch: React.FC<{ query: string; caret?: boolean; results?: { title: string }[]; reveal?: number }> = ({ query, caret = false, results = [], reveal = 1 }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: "Roboto, Inter, Arial, sans-serif", color: "#202124" }}>
    <StatusBar />
    <div style={{ position: "absolute", top: 66, left: 22, right: 22, display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 22, height: 2.6, background: "#5f6368", borderRadius: 2 }} />)}
      </div>
      <div style={{ marginLeft: "auto", display: "grid", gridTemplateColumns: "repeat(3,5px)", gap: 3, marginRight: 18 }}>
        {Array.from({ length: 9 }).map((_, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: 3, background: "#5f6368" }} />)}
      </div>
      <div style={{ width: 38, height: 38, borderRadius: 19, background: "#8D6E63", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 500 }}>A</div>
    </div>
    <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center" }}>
      <GWord size={70} />
    </div>
    <div style={{ position: "absolute", top: 270, left: 20, right: 20, height: 56, borderRadius: 28, border: "1.5px solid #dfe1e5", boxShadow: "0 2px 6px rgba(32,33,36,0.18)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
      <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" stroke="#5f6368" strokeWidth="2.4" fill="none" /><path d="M15 15l5 5" stroke="#5f6368" strokeWidth="2.4" strokeLinecap="round" /></svg>
      <div style={{ fontSize: 20, flex: 1 }}>
        {query}
        <span style={{ opacity: caret ? 1 : 0, color: "#1a73e8" }}>|</span>
      </div>
      <svg width="16" height="22" viewBox="0 0 16 22"><rect x="4" y="1" width="8" height="13" rx="4" fill="#4285F4" /><path d="M1.5 10a6.5 6.5 0 0 0 13 0" stroke="#EA4335" strokeWidth="2" fill="none" /><path d="M8 16.5V21" stroke="#34A853" strokeWidth="2" /></svg>
    </div>
    <div style={{ position: "absolute", top: 350, left: 16, right: 16 }}>
      {results.map((r, i) => {
        const k = Math.max(0, Math.min(1, reveal * results.length - i));
        return (
          <div key={i} style={{ display: "flex", gap: 14, padding: "16px 14px", borderRadius: 16, background: "#fff", boxShadow: "0 1px 4px rgba(60,64,67,0.16)", marginBottom: 12, opacity: k, transform: `translateY(${(1 - k) * 18}px)` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 500, color: "#1a0dab" }}>{r.title}</div>
              <div style={{ height: 9, borderRadius: 5, background: "#E8EAED", marginTop: 12, width: "86%" }} />
              <div style={{ height: 9, borderRadius: 5, background: "#E8EAED", marginTop: 8, width: "64%" }} />
            </div>
            <Thumb />
          </div>
        );
      })}
    </div>
    <div style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", width: 134, height: 5, borderRadius: 3, background: "#111" }} />
  </div>
);
