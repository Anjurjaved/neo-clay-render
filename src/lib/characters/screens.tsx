// Developer laptop screen — VS Code-ধাঁচ editor (নিজের নকশা, logo ছাড়া): file tree, tab, syntax-coloured code
// যা `typed` (0..1) অনুযায়ী লেখা হয়, নিচে terminal-এ deploy ফলাফল (`done` 0..1)।
import React from "react";

const LINES: [string, string][][] = [
  [["#c586c0", "<section "], ["#9cdcfe", "class"], ["#d4d4d4", "="], ["#ce9178", '"hero"'], ["#c586c0", ">"]],
  [["#d4d4d4", "  "], ["#569cd6", "<h1>"], ["#e8e8e8", "Dr. Shirin Dental Chamber"], ["#569cd6", "</h1>"]],
  [["#d4d4d4", "  "], ["#569cd6", "<p>"], ["#e8e8e8", "Mirpur 10, Dhaka · Sat–Thu 4–9 PM"], ["#569cd6", "</p>"]],
  [["#d4d4d4", "  "], ["#569cd6", "<a "], ["#9cdcfe", "href"], ["#d4d4d4", "="], ["#ce9178", '"tel:01711-482903"'], ["#569cd6", ">"], ["#e8e8e8", "Call now"], ["#569cd6", "</a>"]],
  [["#d4d4d4", "  "], ["#569cd6", "<a "], ["#9cdcfe", "href"], ["#d4d4d4", "="], ["#ce9178", '"/serial"'], ["#569cd6", ">"], ["#e8e8e8", "Book serial"], ["#569cd6", "</a>"]],
  [["#c586c0", "</section>"]],
  [["#6a9955", "// treatments with price range"]],
  [["#569cd6", "const "], ["#4fc1ff", "treatments"], ["#d4d4d4", " = ["]],
  [["#d4d4d4", "  { "], ["#9cdcfe", "name"], ["#d4d4d4", ": "], ["#ce9178", '"Scaling"'], ["#d4d4d4", ", "], ["#9cdcfe", "price"], ["#d4d4d4", ": "], ["#ce9178", '"৳1,500"'], ["#d4d4d4", " },"]],
  [["#d4d4d4", "  { "], ["#9cdcfe", "name"], ["#d4d4d4", ": "], ["#ce9178", '"Root canal"'], ["#d4d4d4", ", "], ["#9cdcfe", "price"], ["#d4d4d4", ": "], ["#ce9178", '"৳6,000"'], ["#d4d4d4", " },"]],
  [["#d4d4d4", "  { "], ["#9cdcfe", "name"], ["#d4d4d4", ": "], ["#ce9178", '"Braces"'], ["#d4d4d4", ", "], ["#9cdcfe", "price"], ["#d4d4d4", ": "], ["#ce9178", '"৳45,000"'], ["#d4d4d4", " },"]],
  [["#d4d4d4", "];"]],
];
const total = LINES.reduce((a, l) => a + l.reduce((b, s) => b + s[1].length, 0), 0);

const Ico: React.FC<{ d: string; c?: string; s?: number }> = ({ d, c = "#c5c5c5", s = 26 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const CodeEditor: React.FC<{ typed: number; done?: number }> = ({ typed, done = 0 }) => {
  let budget = Math.floor(typed * total);
  const files = ["index.html", "style.css", "treatments.js", "serial.php"];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#1e1f24", display: "flex", flexDirection: "column", fontFamily: "'JetBrains Mono', Menlo, monospace", color: "#d4d4d4" }}>
      {/* title bar */}
      <div style={{ height: 40, background: "#2b2d33", display: "flex", alignItems: "center", padding: "0 16px", gap: 9 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
        <div style={{ flex: 1, textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: 22, color: "#b8bcc6", fontWeight: 600 }}>shirin-dental — index.html</div>
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* activity bar */}
        <div style={{ width: 54, background: "#25272c", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, paddingTop: 18 }}>
          <Ico d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M14 3v6h6" c="#e8e8e8" />
          <Ico d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.3-4.3" />
          <Ico d="M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9" />
        </div>
        {/* explorer */}
        <div style={{ width: 0, overflow: "hidden", background: "#232429", padding: "14px 0", fontFamily: "Inter, sans-serif" }}>
          <div style={{ fontSize: 15, letterSpacing: 1.5, color: "#8b8f99", padding: "0 18px 10px", fontWeight: 700 }}>EXPLORER</div>
          {files.map((f, i) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 18px", fontSize: 18, background: i === 0 ? "#37373d" : "transparent", color: i === 0 ? "#fff" : "#c0c3ca" }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: ["#e44d26", "#2965f1", "#f7df1e", "#8892bf"][i] }} />
              {f}
            </div>
          ))}
        </div>
        {/* editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ height: 44, background: "#232429", display: "flex", alignItems: "flex-end" }}>
            <div style={{ background: "#1e1f24", padding: "9px 22px", fontSize: 21, fontFamily: "Inter, sans-serif", color: "#fff", borderTop: "2px solid #F5952B" }}>index.html</div>
            <div style={{ padding: "9px 22px", fontSize: 21, fontFamily: "Inter, sans-serif", color: "#8b8f99" }}>treatments.js</div>
          </div>
          <div style={{ flex: 1, padding: "12px 0", fontSize: 27, lineHeight: "41px", overflow: "hidden" }}>
            {LINES.map((l, i) => {
              if (budget <= 0 && i > 0) return <div key={i} style={{ display: "flex" }}><span style={{ width: 46, textAlign: "right", color: "#5a5e68", paddingRight: 16 }}>{i + 1}</span></div>;
              const spans = l.map(([c, s], j) => {
                const take = Math.max(0, Math.min(s.length, budget));
                budget -= take;
                return take > 0 ? (
                  <span key={j} style={{ color: c, whiteSpace: "pre" }}>
                    {s.slice(0, take)}
                  </span>
                ) : null;
              });
              const cursor = budget <= 0 && typed < 1;
              return (
                <div key={i} style={{ display: "flex", background: cursor ? "#2a2c33" : "transparent" }}>
                  <span style={{ width: 46, textAlign: "right", color: cursor ? "#c6c6c6" : "#5a5e68", paddingRight: 16, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ whiteSpace: "pre" }}>{spans}</span>
                  {cursor && <span style={{ width: 3, height: 34, marginTop: 4, background: "#F5952B", marginLeft: 1 }} />}
                </div>
              );
            })}
          </div>
          {/* terminal */}
          <div style={{ height: 128, background: "#18191d", borderTop: "1px solid #2f3138", padding: "8px 20px", fontSize: 24, lineHeight: "36px" }}>
            <div style={{ color: "#8b8f99", fontFamily: "Inter, sans-serif", fontSize: 14, letterSpacing: 1.4, fontWeight: 700 }}>TERMINAL</div>
            <div>
              <span style={{ color: "#28c840" }}>➜</span> <span style={{ color: "#4fc1ff" }}>shirin-dental</span> npm run deploy
            </div>
            {done > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: Math.min(1, done * 2) }}>
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="11" fill="#28c840" />
                  <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: "#e8e8e8" }}>Live at </span>
                <span style={{ color: "#F5952B" }}>shirindental.com</span>
                <span style={{ color: "#8b8f99" }}>· 1.2s</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
