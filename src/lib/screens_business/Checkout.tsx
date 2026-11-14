// Checkout (phone 390×843): order summary → payment method (bKash গোলাপি / Nagad কমলা / Card / Cash) → Pay → processing → Paid
// brand logo নেই — শুধু রং আর নাম। সব অবস্থা prop।
import React from "react";
import { StatusBar } from "../../kit/Device";
import { UI, INK, SUB, LINE, Icon, Tk, Touch, Pointer, Spinner, SuccessMark, k01, mixHex } from "./ui";

export const PAY_METHODS = [
  { id: "bkash", name: "bKash", sub: "Pay from your bKash account", color: "#E2136E", tint: "#FDE7F1" },
  { id: "nagad", name: "Nagad", sub: "Pay from your Nagad account", color: "#EE4023", tint: "#FEEBE4" },
  { id: "card", name: "Card", sub: "Visa · Mastercard · Amex", color: "#1D3C6E", tint: "#E6ECF5" },
];

export type CheckoutProps = {
  method: number; // -1 = কিছু বাছা হয়নি
  selectK?: number; // বাছাইয়ের animation 0→1
  payPress?: number; // Pay বোতাম চাপ 0→1
  processing?: number; // 0→1 (spinner sheet)
  spin?: number; // spinner deg
  paid?: number; // 0→1 success screen
  touch?: Pointer;
};

const items = [
  { name: "Cotton Panjabi", v: "Navy · Size L · ×1", price: 2450, c1: "#2B4C7E", c2: "#1B3359" },
  { name: "Printed Kurti", v: "Rose · Size M · ×1", price: 1850, c1: "#E58EA6", c2: "#C8627F" },
];
const DELIVERY = 60;
const TOTAL = items.reduce((a, b) => a + b.price, 0) + DELIVERY;

const Garment: React.FC<{ c1: string; c2: string }> = ({ c1, c2 }) => (
  <div style={{ width: 58, height: 58, borderRadius: 15, background: `linear-gradient(150deg, #F6F1EA, #EDE4D8)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="44" height="46" viewBox="0 0 44 46">
      <defs>
        <linearGradient id={`g${c1}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <path d="M15 3 7 6 2 16l6 3 2-4v28h24V15l2 4 6-3-5-10-8-3c-1 3-4 5-7 5s-6-2-7-5Z" fill={`url(#g${c1})`} />
      <path d="M22 8v14" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" />
      <circle cx="22" cy="12" r="0.9" fill="#fff" />
      <circle cx="22" cy="16" r="0.9" fill="#fff" />
    </svg>
  </div>
);

const MethodMark: React.FC<{ m: (typeof PAY_METHODS)[number] }> = ({ m }) =>
  m.id === "card" || m.id === "cod" ? (
    <div style={{ width: 52, height: 38, borderRadius: 10, background: m.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon n={m.id === "card" ? "card" : "cash"} s={24} c="#fff" w={2} />
    </div>
  ) : (
    <div style={{ width: 52, height: 38, borderRadius: 10, background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, letterSpacing: -0.2, flexShrink: 0 }}>{m.name}</div>
  );

export const CheckoutScreen: React.FC<CheckoutProps> = ({ method, selectK = 1, payPress = 0, processing = 0, spin = 0, paid = 0, touch }) => {
  const sel = method >= 0 ? PAY_METHODS[method] : null;
  const btn = sel ? mixHex("#B9C0CB", sel.color, selectK) : "#B9C0CB";
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F5F6F9", fontFamily: UI, color: INK }}>
      <StatusBar />
      {/* header */}
      <div style={{ position: "absolute", top: 58, left: 0, right: 0, height: 56, display: "flex", alignItems: "center", padding: "0 18px" }}>
        <Icon n="back" s={26} c={INK} w={2.4} />
        <div style={{ flex: 1, textAlign: "center", fontSize: 21, fontWeight: 700, marginRight: 26 }}>Checkout</div>
      </div>
      {/* steps */}
      <div style={{ position: "absolute", top: 118, left: 22, right: 22, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
        {["Cart", "Address", "Payment"].map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: i < 2 ? "#1FAF5A" : INK }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: i < 2 ? "#1FAF5A" : INK, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800 }}>
                {i < 2 ? <Icon n="check" s={14} c="#fff" w={3.2} /> : 3}
              </div>
              {s}
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: "#1FAF5A", borderRadius: 1, opacity: 0.6 }} />}
          </React.Fragment>
        ))}
      </div>
      {/* order summary */}
      <div style={{ position: "absolute", top: 160, left: 16, right: 16, background: "#fff", borderRadius: 22, padding: "16px 16px 12px", boxShadow: "0 4px 14px rgba(20,33,61,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: SUB, marginBottom: 10 }}>
          <Icon n="bag" s={18} c={SUB} /> Trendy Wear · 2 items
        </div>
        {items.map((it) => (
          <div key={it.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
            <Garment c1={it.c1} c2={it.c2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{it.name}</div>
              <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>{it.v}</div>
            </div>
            <Tk n={it.price} style={{ fontSize: 18, fontWeight: 700 }} />
          </div>
        ))}
        <div style={{ height: 1, background: LINE, margin: "8px 0 10px" }} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 15, color: SUB, gap: 6 }}>
          <Icon n="truck" s={18} c={SUB} /> Delivery · Dhanmondi, Dhaka
          <Tk n={DELIVERY} style={{ marginLeft: "auto", color: INK, fontWeight: 600 }} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Total</div>
          <Tk n={TOTAL} style={{ marginLeft: "auto", fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }} />
        </div>
      </div>
      {/* payment methods */}
      <div style={{ position: "absolute", top: 458, left: 22, fontSize: 17, fontWeight: 800 }}>Pay with</div>
      <div style={{ position: "absolute", top: 488, left: 16, right: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {PAY_METHODS.map((m, i) => {
          const on = i === method ? k01(selectK) : 0;
          return (
            <div
              key={m.id}
              style={{
                display: "flex", alignItems: "center", gap: 13, background: on > 0 ? mixHex("#FFFFFF", m.tint, on) : "#fff", borderRadius: 18, padding: "11px 14px",
                border: `2px solid ${on > 0 ? mixHex("#FFFFFF", m.color, on) : "#fff"}`, boxShadow: "0 3px 10px rgba(20,33,61,0.05)",
                transform: `scale(${1 + 0.02 * Math.sin(Math.PI * on)})`,
              }}
            >
              <MethodMark m={m} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 13, color: SUB, marginTop: 1 }}>{m.sub}</div>
              </div>
              <div style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${on > 0 ? m.color : "#C4CAD4"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: m.color, transform: `scale(${on})` }} />
              </div>
            </div>
          );
        })}
      </div>
      {/* pay bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 124, background: "#fff", borderTop: `1px solid ${LINE}`, padding: "14px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12.5, color: SUB, marginBottom: 8 }}>
          <Icon n="lock" s={14} c={SUB} /> Secure payment · SSL encrypted
        </div>
        <div style={{ height: 56, borderRadius: 18, background: btn, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, transform: `scale(${1 - 0.04 * payPress})`, boxShadow: sel ? `0 8px 18px ${sel.color}44` : "none" }}>
          Pay&nbsp;<Tk n={TOTAL} />
          {sel && <span style={{ fontWeight: 600, opacity: 0.9 }}>&nbsp;· {sel.name}</span>}
        </div>
      </div>
      {/* processing sheet */}
      {processing > 0 && paid < 1 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(14,22,40,${0.38 * k01(processing * 3)})` }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, background: "#fff", borderRadius: "28px 28px 0 0", transform: `translateY(${(1 - k01(processing * 2.5)) * 340}px)`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22 }}>
            <div style={{ width: 44, height: 5, borderRadius: 3, background: "#DDE1E7", marginBottom: 26 }} />
            <div style={{ height: 6, width: 300, borderRadius: 3, background: "#F0F1F4", overflow: "hidden", marginBottom: 28 }}>
              <div style={{ height: "100%", width: `${k01(processing) * 100}%`, background: sel?.color ?? INK, borderRadius: 3 }} />
            </div>
            <Spinner deg={spin} s={58} c={sel?.color} />
            <div style={{ fontSize: 21, fontWeight: 800, marginTop: 20 }}>Confirming payment…</div>
            <div style={{ fontSize: 15, color: SUB, marginTop: 6 }}>
              Waiting for {sel?.name ?? "bank"} · <Tk n={TOTAL} />
            </div>
          </div>
        </div>
      )}
      {/* paid */}
      {paid > 0 && (
        <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: k01(paid * 3), display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 128 }}>
          <StatusBar />
          <div style={{ transform: `scale(${0.7 + 0.3 * k01(paid * 2)})` }}>
            <SuccessMark k={paid} s={132} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 18, letterSpacing: -0.5 }}>Payment successful</div>
          <div style={{ fontSize: 17, color: SUB, marginTop: 6 }}>
            <Tk n={TOTAL} style={{ color: INK, fontWeight: 800 }} /> paid via {sel?.name ?? "bKash"}
          </div>
          <div style={{ marginTop: 26, width: 340, background: "#F6F7FA", borderRadius: 20, padding: "6px 18px", opacity: k01(paid * 2 - 0.6), transform: `translateY(${(1 - k01(paid * 2 - 0.6)) * 18}px)` }}>
            {[
              ["Order no.", "TW-20841"],
              ["Transaction ID", "9KX7H3M2QD"],
              ["Paid with", sel?.name ?? "bKash"],
              ["Delivery", "Tomorrow, 16 Nov"],
            ].map(([a, b], i) => (
              <div key={a} style={{ display: "flex", alignItems: "center", padding: "13px 0", borderTop: i ? `1px solid ${LINE}` : "none", fontSize: 16 }}>
                <span style={{ color: SUB }}>{a}</span>
                <span style={{ marginLeft: "auto", fontWeight: 700, color: i === 2 && sel ? sel.color : INK }}>{b}</span>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 16, right: 16, bottom: 38, height: 56, borderRadius: 18, background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 19, fontWeight: 800, opacity: k01(paid * 2 - 0.8) }}>
            <Icon n="truck" s={22} c="#fff" /> Track order
          </div>
        </div>
      )}
      {touch && <Touch {...touch} />}
    </div>
  );
};
