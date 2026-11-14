// Invoice / quote (portrait tablet 700×1024): line item একে একে আসে, total count-up, "Mark as paid" → PAID stamp
import React from "react";
import { UI, INK, SUB, LINE, Icon, Tk, Cursor, Pointer, k01 } from "./ui";

const NAVY = "#0C3054";
const ORANGE = "#F5952B";
export const INVOICE_LINES = [
  { d: "Business website — design & development", s: "6 pages · mobile-first · SEO setup", q: 1, r: 15000 },
  { d: ".com domain registration", s: "shirindental.com · 1 year", q: 1, r: 1450 },
  { d: "Web hosting — 5 GB SSD", s: "Free SSL · daily backup · 1 year", q: 1, r: 3500 },
  { d: "Google Business Profile setup", s: "Map listing · photos · reviews link", q: 1, r: 2000 },
];
const SUBTOTAL = INVOICE_LINES.reduce((a, l) => a + l.q * l.r, 0);
const DISCOUNT = 950;
export const INVOICE_TOTAL = SUBTOTAL - DISCOUNT;

export type InvoiceProps = {
  lines: number; // 0..4 (ভগ্নাংশ = পরের line আসছে)
  total: number; // 0→1 total count-up
  paidPress?: number;
  paid?: number; // 0→1 stamp
  cursor?: Pointer;
};

export const InvoiceScreen: React.FC<InvoiceProps> = ({ lines, total, paidPress = 0, paid = 0, cursor }) => {
  const ease = (x: number) => 1 - Math.pow(1 - k01(x), 3);
  const shown = INVOICE_LINES.reduce((a, l, i) => a + l.q * l.r * k01(lines - i), 0);
  const sub = shown;
  const tot = INVOICE_TOTAL * ease(total);
  const st = k01(paid);
  const stampS = 1 + 1.3 * Math.pow(1 - k01(st * 1.6), 2) - 0.06 * Math.sin(Math.PI * k01(st * 1.6 - 0.5));
  return (
    <div style={{ position: "absolute", inset: 0, background: "#EEF1F5", fontFamily: UI, color: INK, overflow: "hidden" }}>
      {/* app bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 74, background: "#fff", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 14 }}>
        <Icon n="back" s={26} c={INK} w={2.4} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Invoice JIT-2026-118</div>
          <div style={{ fontSize: 13.5, color: SUB, fontWeight: 600 }}>Dr. Shirin Dental Chamber</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <div style={{ height: 42, padding: "0 14px", borderRadius: 12, border: `1.5px solid ${LINE}`, display: "flex", alignItems: "center", gap: 7, fontSize: 15, fontWeight: 700 }}>
            <Icon n="download" s={18} c={INK} /> PDF
          </div>
          <div style={{ height: 42, padding: "0 14px", borderRadius: 12, background: "#E7F7EE", color: "#16824A", display: "flex", alignItems: "center", gap: 7, fontSize: 15, fontWeight: 700 }}>
            <Icon n="chat" s={18} c="#16824A" /> Send on WhatsApp
          </div>
        </div>
      </div>
      {/* paper */}
      <div style={{ position: "absolute", top: 96, left: 26, right: 26, bottom: 108, background: "#fff", borderRadius: 18, boxShadow: "0 10px 30px rgba(20,33,61,0.09)", padding: "30px 32px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, letterSpacing: -0.5, position: "relative", overflow: "hidden" }}>
              JIT
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, background: ORANGE }} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: NAVY }}>Javed IT Solution</div>
              <div style={{ fontSize: 13, color: SUB, marginTop: 2 }}>Dhaka, Bangladesh · javeditsolution.com</div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 2, color: NAVY }}>INVOICE</div>
            <div style={{ fontSize: 13.5, color: SUB, marginTop: 2, fontWeight: 600 }}>No. JIT-2026-118</div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 26, gap: 20 }}>
          <div style={{ flex: 1.3 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: SUB, letterSpacing: 1 }}>BILL TO</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 5 }}>Dr. Shirin Dental Chamber</div>
            <div style={{ fontSize: 14, color: SUB, marginTop: 3, lineHeight: 1.45 }}>
              Zindabazar, Sylhet 3100
              <br />
              +880 1711-•••••
            </div>
          </div>
          {[
            ["ISSUED", "14 Nov 2026"],
            ["DUE", "21 Nov 2026"],
          ].map(([a, b]) => (
            <div key={a} style={{ flex: 0.8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: SUB, letterSpacing: 1 }}>{a}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 5 }}>{b}</div>
            </div>
          ))}
        </div>
        {/* table */}
        <div style={{ marginTop: 26, display: "flex", fontSize: 12, fontWeight: 800, color: SUB, letterSpacing: 1, padding: "10px 0", borderTop: `2px solid ${NAVY}`, borderBottom: `1px solid ${LINE}` }}>
          <div style={{ flex: 1 }}>DESCRIPTION</div>
          <div style={{ width: 44, textAlign: "center" }}>QTY</div>
          <div style={{ width: 110, textAlign: "right" }}>AMOUNT</div>
        </div>
        <div style={{ height: 300 }}>
          {INVOICE_LINES.map((l, i) => {
            const k = k01(lines - i);
            if (k <= 0) return null;
            const e = ease(k * 1.4);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${LINE}`, opacity: e, transform: `translateX(${(1 - e) * 26}px)` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16.5, fontWeight: 700 }}>{l.d}</div>
                  <div style={{ fontSize: 13.5, color: SUB, marginTop: 3 }}>{l.s}</div>
                </div>
                <div style={{ width: 44, textAlign: "center", fontSize: 16, fontWeight: 600 }}>{l.q}</div>
                <Tk n={l.r} style={{ width: 110, textAlign: "right", fontSize: 17, fontWeight: 800 }} />
              </div>
            );
          })}
        </div>
        {/* totals */}
        <div style={{ display: "flex", marginTop: 8 }}>
          <div style={{ flex: 1, paddingRight: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: SUB, letterSpacing: 1 }}>PAY WITH</div>
            <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
              {[["bKash", "#E2136E"], ["Nagad", "#EE4023"], ["Bank", "#1D3C6E"]].map(([n, c]) => (
                <div key={n} style={{ height: 32, padding: "0 12px", borderRadius: 9, background: c, color: "#fff", fontSize: 13.5, fontWeight: 800, display: "flex", alignItems: "center" }}>{n}</div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: SUB, marginTop: 12, lineHeight: 1.45 }}>50% advance to start, rest on launch. Thank you for your business.</div>
          </div>
          <div style={{ width: 250, position: "relative" }}>
            {[
              ["Subtotal", <Tk n={sub} />],
              ["Discount", <span style={{ color: "#1FAF5A" }}>− <Tk n={DISCOUNT * k01((lines - 3.5) * 2)} /></span>],
            ].map(([a, b], i) => (
              <div key={i} style={{ display: "flex", fontSize: 15.5, padding: "5px 0", color: SUB, fontWeight: 600 }}>
                {a}
                <span style={{ marginLeft: "auto", color: INK, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{b}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "baseline", marginTop: 8, paddingTop: 10, borderTop: `2px solid ${NAVY}` }}>
              <span style={{ fontSize: 17, fontWeight: 800 }}>Total</span>
              <Tk n={tot} style={{ marginLeft: "auto", fontSize: 30, fontWeight: 800, color: NAVY, letterSpacing: -0.6, fontVariantNumeric: "tabular-nums" }} />
            </div>
            {/* PAID stamp */}
            {st > 0 && (
              <div style={{ position: "absolute", right: 280, top: 116, transform: `rotate(-9deg) scale(${stampS})`, opacity: k01(st * 2.5), border: "5px solid #1FAF5A", color: "#1FAF5A", borderRadius: 14, padding: "6px 18px 4px", textAlign: "center", background: "rgba(255,255,255,0.75)" }}>
                <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 6, lineHeight: 1 }}>PAID</div>
                <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 1.5, marginTop: 2 }}>14 NOV 2026 · bKash</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* bottom bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 92, background: "#fff", borderTop: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 26px", gap: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: SUB, fontWeight: 600 }}>{st > 0.5 ? "Balance due" : "Amount due"}</div>
          <Tk n={st > 0.5 ? 0 : tot} style={{ fontSize: 26, fontWeight: 800, color: st > 0.5 ? "#1FAF5A" : INK }} />
        </div>
        <div style={{ marginLeft: "auto", height: 56, padding: "0 28px", borderRadius: 17, background: st > 0.5 ? "#E7F7EE" : "#1FAF5A", color: st > 0.5 ? "#16824A" : "#fff", display: "flex", alignItems: "center", gap: 9, fontSize: 18, fontWeight: 800, transform: `scale(${1 - 0.05 * paidPress})`, boxShadow: st > 0.5 ? "none" : "0 8px 18px rgba(31,175,90,0.32)" }}>
          <Icon n="check" s={21} c={st > 0.5 ? "#16824A" : "#fff"} w={3} /> {st > 0.5 ? "Paid · 14 Nov" : "Mark as paid"}
        </div>
      </div>
      {cursor && <Cursor {...cursor} />}
    </div>
  );
};
