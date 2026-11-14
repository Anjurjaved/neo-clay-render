// Gmail-ধাঁচ mail app (logo ছাড়া) — inbox (নতুন mail উপরে ঢোকে) → খোলা quote email (line item, total ৳, PDF) — 390×843
import React from "react";
import { StatusBar } from "../../kit/Device";
import { UI, Bn, I, Avatar, HomeBar, Arrive, clamp01, sprK } from "./ui";

const INK = "#1F1F1F",
  META = "#5E6370",
  ACC = "#0B57D0";

export type MailRow = { from: string; initials: string; color: string; subject: string; snippet: string; time: string; unread?: boolean; star?: boolean; attach?: string; k?: number; hl?: number };

export const MailInbox: React.FC<{ rows: MailRow[]; tap?: number; tapRow?: number; unreadCount?: number }> = ({ rows, tap = 0, tapRow = 0, unreadCount = 3 }) => (
  <div style={{ position: "absolute", inset: 0, background: "#F6F8FC", fontFamily: UI, color: INK, overflow: "hidden" }}>
    <StatusBar time="9:41" />
    {/* search bar */}
    <div style={{ position: "absolute", top: 56, left: 14, right: 14, height: 54, borderRadius: 27, background: "#E9EEF6", display: "flex", alignItems: "center", padding: "0 10px 0 16px", gap: 14 }}>
      <I.menu size={24} color="#444746" stroke={2} />
      <div style={{ flex: 1, fontSize: 18, color: "#444746", fontWeight: 500 }}>Search in mail</div>
      <Avatar size={34} text="S" bg="#7B4BB7" fontSize={15} />
    </div>
    <div style={{ position: "absolute", top: 126, left: 22, fontSize: 14, fontWeight: 700, color: META, letterSpacing: 0.3 }}>Primary</div>
    {/* list */}
    <div style={{ position: "absolute", top: 152, left: 0, right: 0, bottom: 84 }}>
      {rows.map((r, i) => (
        <Arrive key={r.subject} k={r.k ?? 1} from="center" maxH={110}>
          <div style={{ position: "relative", display: "flex", gap: 14, padding: "11px 16px 11px 16px", background: r.hl ? `rgba(211,227,253,${0.95 * r.hl})` : undefined }}>
            {i === tapRow && tap > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(31,31,31,${0.09 * Math.sin(clamp01(tap) * Math.PI)})` }} />}
            <Avatar size={44} text={r.initials} bg={r.color} fontSize={18} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 17.5, fontWeight: r.unread ? 800 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.from}</span>
                <span style={{ fontSize: 13.5, fontWeight: r.unread ? 800 : 500, color: r.unread ? INK : META, marginLeft: 8 }}>{r.time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: r.unread ? 700 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
                    <Bn>{r.subject}</Bn>
                  </div>
                  <div style={{ fontSize: 15, color: META, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
                    <Bn>{r.snippet}</Bn>
                  </div>
                </div>
                <div style={{ alignSelf: "flex-end" }}>
                  <I.star size={22} color={r.star ? "#F5B400" : "#747775"} stroke={1.8} on={r.star} />
                </div>
              </div>
              {r.attach && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 7, height: 32, padding: "0 12px 0 8px", borderRadius: 16, border: "1px solid #C4C7C5", fontSize: 14, fontWeight: 600, color: "#444746" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 3, background: "#DC3545", color: "#fff", fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>PDF</div>
                  {r.attach}
                </div>
              )}
            </div>
          </div>
        </Arrive>
      ))}
    </div>
    {/* compose FAB */}
    <div style={{ position: "absolute", right: 16, bottom: 104, height: 58, borderRadius: 18, background: "#C2E7FF", display: "flex", alignItems: "center", gap: 10, padding: "0 20px 0 18px", boxShadow: "0 3px 8px rgba(0,0,0,0.15)", fontSize: 17, fontWeight: 700, color: "#001D35" }}>
      <I.pencil size={23} color="#001D35" stroke={2} />
      Compose
    </div>
    {/* bottom nav */}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 86, background: "#F3F6FC", display: "flex", justifyContent: "space-around", paddingTop: 10 }}>
      {[
        ["Mail", <I.mail size={24} color="#001D35" stroke={2} />],
        ["Meet", <I.video size={25} color="#444746" stroke={1.9} />],
      ].map(([label, icon], i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
          <div style={{ width: 64, height: 32, borderRadius: 16, background: i === 0 ? "#D3E3FD" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon as any}</div>
          {i === 0 && unreadCount > 0 && <div style={{ position: "absolute", top: -4, left: 40, minWidth: 22, height: 18, borderRadius: 9, background: "#B3261E", color: "#fff", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{unreadCount}</div>}
          <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? INK : META }}>{label as string}</span>
        </div>
      ))}
    </div>
    <HomeBar bottom={8} />
  </div>
);

export type QuoteLine = { item: string; price: string };

/** খোলা quote email — reveal 0..1 body line-by-line, totalK = total row highlight */
export const MailQuote: React.FC<{ subject: string; from: string; initials: string; time: string; greet: string; intro: string; lines: QuoteLine[]; total: string; reveal: number; totalK?: number; sign?: string }> = ({
  subject,
  from,
  initials,
  time,
  greet,
  intro,
  lines,
  total,
  reveal,
  totalK = 0,
  sign = "",
}) => {
  const step = (i: number) => {
    const k = clamp01(reveal * (lines.length + 5) - i);
    return { opacity: k, transform: `translateY(${(1 - k) * 14}px)` };
  };
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: UI, color: INK, overflow: "hidden" }}>
      <StatusBar time="9:42" />
      <div style={{ position: "absolute", top: 54, left: 0, right: 0, height: 56, display: "flex", alignItems: "center", padding: "0 16px", gap: 24 }}>
        <I.back size={25} color="#444746" stroke={2.1} />
        <div style={{ flex: 1 }} />
        <I.archive size={23} color="#444746" stroke={1.9} />
        <I.trash size={23} color="#444746" stroke={1.9} />
        <I.mail size={23} color="#444746" stroke={1.9} />
        <I.more size={21} color="#444746" />
      </div>
      <div style={{ position: "absolute", top: 118, left: 20, right: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, fontSize: 23, fontWeight: 600, lineHeight: 1.25 }}>
            <Bn>{subject}</Bn>
            <span style={{ display: "inline-block", marginLeft: 8, fontSize: 12.5, fontWeight: 600, background: "#E9EEF6", color: "#444746", padding: "2px 7px", borderRadius: 5, verticalAlign: 3 }}>Inbox</span>
          </div>
          <I.star size={24} color="#747775" stroke={1.8} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <Avatar size={42} text={initials} bg="#D85E24" bg2="#F5952B" fontSize={16} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16.5, fontWeight: 700 }}>
              {from} <span style={{ fontSize: 13.5, fontWeight: 500, color: META, marginLeft: 4 }}>{time}</span>
            </div>
            <div style={{ fontSize: 14, color: META, fontWeight: 500 }}>to me ⌄</div>
          </div>
          <I.reply size={22} color="#444746" stroke={1.9} />
          <I.more size={20} color="#444746" />
        </div>
        {/* body */}
        <div style={{ marginTop: 18, fontSize: 17.5, lineHeight: 1.5 }}>
          <div style={step(0)}>
            <Bn>{greet}</Bn>
          </div>
          <div style={{ ...step(1), marginTop: 6 }}>
            <Bn>{intro}</Bn>
          </div>
          <div style={{ marginTop: 12, border: "1px solid #E3E6EA", borderRadius: 14, overflow: "hidden", opacity: step(2).opacity }}>
            {lines.map((l, i) => (
              <div key={i} style={{ ...step(2 + i), display: "flex", justifyContent: "space-between", padding: "12px 14px", borderTop: i ? "1px solid #EEF0F2" : undefined, fontSize: 16.5 }}>
                <Bn>{l.item}</Bn>
                <span style={{ fontWeight: 700, flex: "none", marginLeft: 10 }}>{l.price}</span>
              </div>
            ))}
            <div style={{ ...step(2 + lines.length), display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: totalK > 0 ? `rgba(245,149,43,${0.12 + 0.1 * totalK})` : "#F6F8FC", fontSize: 18, fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: "#D85E24", fontSize: 21, transform: `scale(${1 + 0.06 * Math.sin(clamp01(totalK) * Math.PI)})` }}>{total}</span>
            </div>
          </div>
          {sign && (
            <div style={{ ...step(3 + lines.length), marginTop: 10, fontSize: 15.5, color: "#3C4043" }}>
              <Bn>{sign}</Bn>
            </div>
          )}
          {/* attachment */}
          <div style={{ ...step(4 + lines.length), marginTop: 14, width: 236, height: 64, borderRadius: 12, border: "1px solid #DADCE0", display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
            <div style={{ width: 34, height: 40, borderRadius: 5, background: "#DC3545", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>PDF</div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>Quotation-1042.pdf</div>
              <div style={{ fontSize: 12.5, color: META, fontWeight: 500 }}>184 KB</div>
            </div>
          </div>
        </div>
      </div>
      {/* reply buttons */}
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 34, display: "flex", gap: 12 }}>
        {[
          ["Reply", <I.reply size={20} color="#444746" stroke={2} />],
          ["Forward", <I.forward size={20} color="#444746" stroke={2} />],
        ].map(([l, ic], i) => (
          <div key={i} style={{ flex: 1, height: 46, borderRadius: 23, border: "1px solid #747775", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 16, fontWeight: 700, color: "#444746" }}>
            {ic as any}
            {l as string}
          </div>
        ))}
      </div>
      <HomeBar />
    </div>
  );
};

/** inbox → খোলা mail: ডান থেকে slide */
export const MailFlow: React.FC<{ k: number; inbox: React.ReactNode; mail: React.ReactNode }> = ({ k, inbox, mail }) => {
  const s = Math.min(1, sprK(k * 1.05, 190, 21));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {k < 1 && <div style={{ position: "absolute", inset: 0, transform: `translateX(${-s * 25}%)` }}>{inbox}</div>}
      {k > 0 && <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - s) * 100}%)`, boxShadow: "-10px 0 28px rgba(0,0,0,0.15)" }}>{mail}</div>}
    </div>
  );
};
