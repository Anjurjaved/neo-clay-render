// screens_chat showcases — প্রতিটা screen kit Phone-এ, আসল interaction motion সহ
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { FPS, typed } from "../../kit/time";
import { PhoneShow } from "./Show";
import { ramp, clamp01 } from "./ui";
import { WhatsAppChat, WhatsAppNewContact, WaMsg } from "./WhatsApp";
import { MessengerChat, MsMsg } from "./Messenger";
import { SmsThread } from "./Sms";
import { DialPad, CallingScreen, DialerFlow, fmtBDPhone } from "./Dialer";
import { LockScreen, LockNote } from "./LockScreen";
import { MailInbox, MailQuote, MailFlow, MailRow } from "./Email";

const useT = () => useCurrentFrame() / FPS;
const tick = (t: number, sent: number, deliv: number, read: number) => (t < sent ? 0 : t < deliv ? 1 : t < read ? 2 : 3);
/** key-press highlight: typed string-এর শেষ অক্ষর কখন এসেছে */
const keyPress = (full: string, t: number, t0: number, t1: number) => {
  const s = typed(full, t, t0, t1);
  let at = t0;
  for (let u = t; u > t0; u -= 1 / FPS) {
    if (typed(full, u, t0, t1).length < s.length) {
      at = u;
      break;
    }
  }
  const k = s.length ? Math.max(0, 1 - (t - at) / 0.22) : 0;
  return { s, key: s.slice(-1), k };
};

// ---------------- WhatsApp ----------------
const NUM = "1712345678";
const fmtBD = (d: string) => (d.length > 4 ? d.slice(0, 4) + "-" + d.slice(4) : d);
const WhatsAppShow: React.FC = () => {
  const t = useT();
  const sw = ramp(t, 1.75, 2.15); // contact → chat
  const kp = keyPress(NUM, t, 0.45, 1.45);
  const msgs: WaMsg[] = [
    { kind: "date", text: "Yesterday" },
    { kind: "text", from: "them", text: "Dr. Shirin Dental Chamber-এ আপনাকে স্বাগতম। সিরিয়াল নিতে নাম ও সময় লিখে পাঠান।", time: "7:02 pm" },
    { kind: "text", from: "me", text: "ধন্যবাদ, কাল জানাব।", time: "7:05 pm", tick: 3 },
    { kind: "date", text: "Today" },
    { kind: "text", from: "me", text: "আসসালামু আলাইকুম। কাল সন্ধ্যায় সিরিয়াল পাওয়া যাবে?", time: "4:12 pm", tick: tick(t, 2.35, 2.6, 2.95), k: ramp(t, 2.2, 2.6) },
    { kind: "text", from: "them", text: "ওয়ালাইকুম আসসালাম। জি, সন্ধ্যা ৬:৩০-এ একটা সিরিয়াল খালি আছে। রোগীর নাম আর বয়স পাঠান।", time: "4:13 pm", k: ramp(t, 3.55, 3.95) },
    { kind: "text", from: "me", text: "রাফি আহমেদ, ২৮ বছর", time: "4:13 pm", tick: tick(t, 4.35, 4.55, 4.85), k: ramp(t, 4.2, 4.55) },
    { kind: "voice", from: "them", secs: 14, time: "4:14 pm", play: ramp(t, 5.3, 6.3) * 0.62, k: ramp(t, 4.9, 5.3) },
  ];
  const typingK = t > 2.95 && t < 3.6 ? Math.min(1, (t - 2.95) / 0.25) : 0;
  const draft = t > 3.9 && t < 4.2 ? typed("রাফি আহমেদ, ২৮ বছর", t, 3.95, 4.15) : "";
  const offset = (1 - sw) * 0;
  const screen = (
    <div style={{ position: "absolute", inset: 0 }}>
      {sw < 1 && (
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-sw * 30}%)`, opacity: 1 - sw * 0.6 }}>
          <WhatsAppNewContact first="Dr. Shirin" last="Dental" number={fmtBD(kp.s)} caret={Math.floor(t * 2.2) % 2 === 0 || kp.k > 0} pressed={kp.key} press={kp.k} save={ramp(t, 1.55, 1.85)} />
        </div>
      )}
      {sw > 0 && (
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - sw) * 100 + offset}%)`, boxShadow: "-12px 0 30px rgba(0,0,0,0.18)" }}>
          <WhatsAppChat name="Dr. Shirin Dental" status="online" msgs={msgs} typing={typingK} clock={t} draft={draft} caret={!!draft} />
        </div>
      )}
    </div>
  );
  return <PhoneShow t={t} kind="android" screen={screen} buzz={t > 3.55 && t < 3.85 ? 1 : t > 4.9 && t < 5.15 ? 0.8 : 0} />;
};


// ---------------- Messenger ----------------
const MessengerShow: React.FC = () => {
  const t = useT();
  const tapK = ramp(t, 0.9, 1.15);
  const msgs: MsMsg[] = [
    { kind: "time", text: "Yesterday 9:02 PM" },
    { kind: "text", from: "me", text: "আপনাদের শোরুম কোথায়?" },
    { kind: "text", from: "page", text: "Mirpur 10, Shah Ali Plaza, ৩য় তলা। প্রতিদিন সকাল ১০টা থেকে রাত ৯টা খোলা।" },
    { kind: "time", text: "Today 8:15 PM" },
    { kind: "text", from: "me", text: "আপু, লাল জামদানিটা কি এখনো আছে?" },
    { kind: "text", from: "page", text: "জি আপু, আছে। কোনটা জানতে চান, নিচে দেখুন:" },
    { kind: "text", from: "me", text: "দাম কত?", k: ramp(t, 1.15, 1.5) },
    { kind: "product", title: "লাল জামদানি শাড়ি", price: "৳2,450", sub: "ফ্রি ডেলিভারি ঢাকায়", k: ramp(t, 2.55, 3.0) },
    { kind: "text", from: "page", text: "আজ অর্ডার করলে কাল পেয়ে যাবেন।", k: ramp(t, 3.25, 3.6) },
    { kind: "text", from: "me", text: "অর্ডার করব। bKash-এ পাঠাচ্ছি।", k: ramp(t, 4.25, 4.6) },
  ];
  const typing = t > 1.75 && t < 2.6 ? clamp01((t - 1.75) / 0.25) : 0;
  return (
    <PhoneShow
      t={t}
      kind="iphone"
      buzz={t > 2.55 && t < 2.8 ? 0.7 : 0}
      screen={
        <MessengerChat
          page="Rongdhonu Fashion"
          msgs={msgs}
          typing={typing}
          clock={t}
          chips={["দাম কত?", "ডেলিভারি চার্জ?", "সাইজ"]}
          chipTap={0}
          chipK={tapK}
          chipsOut={ramp(t, 1.2, 1.5)}
          seen={ramp(t, 4.9, 5.15)}
        />
      }
    />
  );
};

// ---------------- SMS ----------------
const SMS_NEW = "প্রিয় রাফি আহমেদ, আপনার সিরিয়াল নিশ্চিত হয়েছে। সিরিয়াল নং: ১২, শনিবার ১৬ নভেম্বর, সন্ধ্যা ৬:৩০। ঠিকানা: Zindabazar, Sylhet। ১০ মিনিট আগে আসুন। - Dr. Shirin Dental";
const SmsShow: React.FC = () => {
  const t = useT();
  const heads = t < 2.6 ? ramp(t, 0.7, 1.05) : 1 - ramp(t, 2.6, 2.95);
  return (
    <PhoneShow
      t={t}
      kind="android"
      buzz={t > 0.7 && t < 1.0 ? 1 : 0}
      screen={
        <SmsThread
          sender="DRSHIRIN"
          initials="DS"
          heads={heads}
          headsText={SMS_NEW}
          glow={t > 3.1 ? Math.sin(ramp(t, 3.1, 4.3) * Math.PI) : 0}
          msgs={[
            { stamp: "28 Sep · 6:10 PM", text: "আপনার সিরিয়াল নিশ্চিত: সিরিয়াল নং ৭, রবিবার ২৯ সেপ্টেম্বর, সন্ধ্যা ৭:০০। - Dr. Shirin Dental", time: "SMS" },
            { stamp: "12 Oct · 11:05 AM", text: "রাফি আহমেদ, আপনার পরের চেকআপ ১৯ অক্টোবর। সিরিয়াল নিতে কল করুন 01711-234567।", time: "SMS" },
            { stamp: "Today · 4:12 PM", text: SMS_NEW, time: "Now · SMS", k: ramp(t, 1.15, 1.6) },
          ]}
        />
      }
    />
  );
};

// ---------------- Dialer ----------------
const DIAL = "01711234567";
const DialerShow: React.FC = () => {
  const t = useT();
  const kp = keyPress(DIAL, t, 0.45, 2.3);
  const callTap = ramp(t, 2.55, 2.85);
  const flow = ramp(t, 2.8, 3.25);
  const secs = t < 4.2 ? -1 : t - 4.2;
  return (
    <PhoneShow
      t={t}
      kind="android"
      screen={
        <DialerFlow
          k={flow}
          dial={<DialPad digits={kp.s} pressed={kp.key} press={kp.k} call={callTap} match={kp.s.length >= 6 ? { name: "Dr. Shirin Dental", label: "Mobile · 01711-234567", initials: "DS" } : undefined} />}
          calling={<CallingScreen name="Dr. Shirin Dental" number={fmtBDPhone(DIAL)} initials="DS" secs={secs} clock={t} speaker={ramp(t, 4.9, 5.15)} />}
        />
      }
    />
  );
};

// ---------------- Lock screen ----------------
const LockShow: React.FC = () => {
  const t = useT();
  const at = [0.8, 1.7, 2.6, 3.5, 4.4];
  const notes: LockNote[] = [
    { app: "Phone", icon: "phone", tint: "#34C759", title: "Missed Call", body: "01711-234567", when: "8m ago", k: ramp(t, at[0], at[0] + 0.5) },
    { app: "Shop", icon: "bag", tint: "#F5952B", title: "নতুন অর্ডার #1042", body: "লাল জামদানি × 1 · ৳2,450 · bKash paid", when: "5m ago", k: ramp(t, at[1], at[1] + 0.5) },
    { app: "Phone", icon: "phone", tint: "#34C759", title: "Missed Call (2)", body: "Rafi Ahmed · Mobile", when: "2m ago", k: ramp(t, at[2], at[2] + 0.5) },
    { app: "Messages", icon: "chat", tint: "#2DBE60", title: "Nasrin Akter", body: "ভাই, ডেলিভারি কবে পাব? ঠিকানা পাঠালাম।", when: "1m ago", k: ramp(t, at[3], at[3] + 0.5) },
    { app: "Shop", icon: "bag", tint: "#F5952B", title: "নতুন অর্ডার #1043", body: "সুতি থ্রি-পিস × 2 · ৳3,200 · Cash on delivery", when: "now", k: ramp(t, at[4], at[4] + 0.5) },
  ];
  const buzz = at.reduce((b, a) => (t > a && t < a + 0.28 ? 1 : b), 0);
  return <PhoneShow t={t} kind="iphone" bg="#000" buzz={buzz} screen={<LockScreen notes={notes} wake={ramp(t, 0.35, 0.7)} />} />;
};

// ---------------- Email ----------------
const EmailShow: React.FC = () => {
  const t = useT();
  const rows: MailRow[] = [
    { from: "Javed IT Solution", initials: "J", color: "#D85E24", subject: "Website quotation — Dr. Shirin Dental", snippet: "প্রিয় ডা. শিরিন, আপনার চেম্বারের website-এর quotation…", time: "9:41 AM", unread: true, attach: "Quotation-1042.pdf", k: ramp(t, 0.85, 1.35), hl: t < 1.4 ? 1 : 1 - ramp(t, 1.4, 2.6) },
    { from: "bKash Merchant", initials: "B", color: "#E2136E", subject: "Payment received ৳1,500", snippet: "Your merchant account received a payment from…", time: "8:12 AM", unread: true },
    { from: "Sylhet Dental Society", initials: "S", color: "#0F9D58", subject: "মাসিক সভা — ২৩ নভেম্বর", snippet: "সম্মানিত সদস্য, আগামী মাসিক সভা জিন্দাবাজারে…", time: "Yesterday", star: true },
    { from: "Daraz", initials: "D", color: "#F57224", subject: "Your order has been shipped", snippet: "Dental chair cushion · arriving Monday", time: "Nov 14" },
    { from: "Rafi Ahmed", initials: "R", color: "#3E6E9E", subject: "রিপোর্টের ছবি", snippet: "আপা, X-ray রিপোর্টটা পাঠালাম, দেখে জানাবেন।", time: "Nov 13" },
    { from: "Grameenphone", initials: "G", color: "#1A73E8", subject: "Your monthly bill is ready", snippet: "Bill amount ৳1,240 · due 25 November", time: "Nov 12" },
  ];
  const open = ramp(t, 2.85, 3.35);
  return (
    <PhoneShow
      t={t}
      kind="iphone"
      buzz={t > 0.85 && t < 1.1 ? 0.6 : 0}
      screen={
        <MailFlow
          k={open}
          inbox={<MailInbox rows={rows} tap={ramp(t, 2.5, 2.9)} tapRow={0} unreadCount={t > 0.9 ? 3 : 2} />}
          mail={
            <MailQuote
              subject="Website quotation — Dr. Shirin Dental"
              from="Javed IT Solution"
              initials="J"
              time="9:41 AM"
              greet="প্রিয় ডা. শিরিন,"
              intro="আপনার চেম্বারের website-এর quotation নিচে দিলাম। ১০ দিনে live করে দেব।"
              lines={[
                { item: "Website design + development", price: "৳15,000" },
                { item: "Online serial form", price: "৳4,000" },
                { item: "Domain + hosting (১ বছর)", price: "৳3,500" },
              ]}
              total="৳22,500"
              reveal={ramp(t, 3.3, 4.6)}
              totalK={ramp(t, 4.7, 5.3)}
              sign="ধন্যবাদ — Javed IT Solution · javeditsolution.com"
            />
          }
        />
      }
    />
  );
};

export const ITEMS: LibItem[] = [
  {
    id: "screens-chat-whatsapp",
    name: "WhatsApp-style chat",
    nameBn: "WhatsApp-ধাঁচের chat",
    group: "screens_chat",
    kind: "screen",
    duration: 6.5,
    still: 5.8,
    tags: ["chat", "answer", "persona", "cta", "steps"],
    note: "<WhatsAppChat msgs typing clock draft/> + <WhatsAppNewContact number pressed press save/> — msg.k = arrive 0..1, tick 0–3 (3 = blue), voice play 0..1",
    Comp: WhatsAppShow,
  },
  {
    id: "screens-chat-messenger",
    name: "Messenger-style page inbox",
    nameBn: "Messenger-ধাঁচের page inbox",
    group: "screens_chat",
    kind: "screen",
    duration: 6,
    still: 5.4,
    tags: ["chat", "persona", "answer", "price", "cta"],
    note: "<MessengerChat page msgs typing chips chipTap chipK chipsOut seen clock/> — product card bubble, gradient out-bubbles, quick replies",
    Comp: MessengerShow,
  },
  {
    id: "screens-chat-sms",
    name: "SMS serial confirmation",
    nameBn: "SMS — সিরিয়াল নিশ্চিত",
    group: "screens_chat",
    kind: "screen",
    duration: 5,
    still: 3.7,
    tags: ["chat", "steps", "answer", "checklist"],
    note: "<SmsThread sender msgs heads headsText glow/> — heads-up notification drops, new SMS arrives, highlight pulse",
    Comp: SmsShow,
  },
  {
    id: "screens-chat-dialer",
    name: "Android dialer + calling",
    nameBn: "Dialer — number টাইপ ও call",
    group: "screens_chat",
    kind: "screen",
    duration: 6,
    still: 5.6,
    tags: ["cta", "persona", "steps", "chat"],
    note: "<DialerFlow k dial={<DialPad digits pressed press match call/>} calling={<CallingScreen secs clock speaker/>}/> — secs<0 = Calling…",
    Comp: DialerShow,
  },
  {
    id: "screens-chat-lockscreen",
    name: "Lock screen notification stack",
    nameBn: "Lock screen — notification-এর ভিড়",
    group: "screens_chat",
    kind: "screen",
    duration: 6,
    still: 5.5,
    tags: ["stat", "persona", "before_after", "myth", "title"],
    note: "<LockScreen notes wake time date/> — notes old→new with k 0..1; newest on top, >3 collapse into stack + 'N more'",
    Comp: LockShow,
  },
  {
    id: "screens-chat-email",
    name: "Mail inbox + quotation email",
    nameBn: "Email — inbox ও quotation",
    group: "screens_chat",
    kind: "screen",
    duration: 6,
    still: 5.6,
    tags: ["price", "steps", "answer", "cta"],
    note: "<MailFlow k inbox={<MailInbox rows tap tapRow/>} mail={<MailQuote lines total reveal totalK/>}/> — new mail slides in (hl), opens quote",
    Comp: EmailShow,
  },
];
