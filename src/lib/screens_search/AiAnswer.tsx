// AI answer screen (generic chat-assistant look, no brand logo) — mobile (390×843) + desktop (1024×700).
// Flow props: composer typing → sent bubble → "searching the web" → streamed answer (business name marked) → sources.
import React from "react";
import { StatusBar } from "../../kit/Device";
import { SANS, BN, Rich, Seg, segLen, IcMenu, IcEdit, IcPlus, IcMic, IcSend, IcCopy, IcThumb, IcReload, IcGlobe, IcSearch, IcShare, HomeBar, clamp01, Fav } from "./ui";

export type Source = { domain: string; title: string; fav: [string, string] };
export const AI_Q = "সিলেটে ভালো dentist কে? অনলাইনে সিরিয়াল দেওয়া যায় এমন";
export const AI_ANSWER: Seg[][] = [
  [{ t: "সিলেটে অনলাইনে সিরিয়াল নেওয়া যায় এমন কয়েকটা ভালো dental chamber:" }],
  [{ t: "১. " }, { t: "Dr. Shirin Dental Chamber", b: true, mark: true }, { t: " — জিন্দাবাজার। রুট ক্যানেল ও স্কেলিং, Google-এ ৪.৮ rating (১২৬ review)। website থেকে সরাসরি সিরিয়াল দেওয়া যায়, confirm SMS আসে।" }],
  [{ t: "২. " }, { t: "Sylhet Dental Care", b: true }, { t: " — আম্বরখানা। সকাল ১০টা থেকে রাত ৮টা, সিরিয়াল ফোনে।" }],
  [{ t: "বিকেলে যেতে চাইলে Dr. Shirin-এর chamber খোলা থাকে রাত ৯টা পর্যন্ত।" }],
];
export const AI_SOURCES: Source[] = [
  { domain: "drshirindental.com", title: "Dr. Shirin Dental Chamber — Serial", fav: ["#F5952B", "S"] },
  { domain: "google.com/maps", title: "Dentists near Zindabazar, Sylhet", fav: ["#34A853", "M"] },
  { domain: "doctorbd.com.bd", title: "Best Dentist in Sylhet — List", fav: ["#3B6FB6", "D"] },
];

export type AiProps = {
  question?: string;
  composer?: string; // text in the input box (typing)
  caret?: boolean;
  sent?: number; // 0..1 user bubble pop
  searching?: number; // 0..1 "Searching the web" phase (1 = done → "Searched 6 sites")
  stream?: number; // 0..1 answer progress
  mark?: number; // 0..1 highlight sweep on marked names
  sources?: number; // 0..1 source cards reveal
  scroll?: number;
  answer?: Seg[][];
  srcs?: Source[];
};

const blocksWithBudget = (answer: Seg[][], stream: number) => {
  const lens = answer.map(segLen);
  const total = lens.reduce((a, b) => a + b, 0);
  let left = Math.round(total * clamp01(stream));
  return answer.map((b, i) => {
    const take = Math.max(0, Math.min(lens[i], left));
    left -= lens[i];
    return { segs: b, budget: take, visible: take > 0, last: take > 0 && take < lens[i] };
  });
};

const Searching: React.FC<{ k: number; fs: number }> = ({ k, fs }) => {
  const done = k >= 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: fs, color: "#5d5d5d", fontFamily: SANS }}>
      {done ? (
        <div style={{ display: "flex" }}>
          {AI_SOURCES.map((s, i) => (
            <div key={i} style={{ marginLeft: i ? -7 : 0, borderRadius: 12, boxShadow: "0 0 0 2px #fff" }}>
              <Fav bg={s.fav[0]} ch={s.fav[1]} s={20} />
            </div>
          ))}
        </div>
      ) : (
        <IcGlobe s={fs + 2} c="#5d5d5d" />
      )}
      <span
        style={
          done
            ? undefined
            : {
                backgroundImage: `linear-gradient(90deg,#8f8f8f 0%,#8f8f8f ${k * 120 - 30}%,#e0e0e0 ${k * 120 - 10}%,#8f8f8f ${k * 120 + 10}%,#8f8f8f 100%)`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }
        }
      >
        {done ? "Searched 6 sites" : "Searching the web"}
      </span>
    </div>
  );
};

const SourceCards: React.FC<{ k: number; w: number; srcs: Source[]; fs: number }> = ({ k, w, srcs, fs }) => (
  <div style={{ display: "flex", gap: 8 }}>
    {srcs.map((s, i) => {
      const kk = clamp01(k * 3 - i);
      return (
        <div key={s.domain} style={{ flex: "none", width: w, borderRadius: 14, border: "1px solid #E8E8E8", background: "#FAFAFA", padding: "10px 12px", opacity: kk, transform: `translateY(${(1 - kk) * 10}px)`, fontFamily: SANS }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: fs - 3, color: "#5d5d5d" }}>
            <Fav bg={s.fav[0]} ch={s.fav[1]} s={18} />
            {s.domain}
          </div>
          <div style={{ fontSize: fs - 1, fontWeight: 600, color: "#0d0d0d", marginTop: 6, lineHeight: 1.3 }}>{s.title}</div>
        </div>
      );
    })}
  </div>
);

const Conversation: React.FC<AiProps & { fs: number; srcW: number }> = ({ question = AI_Q, sent = 0, searching = 0, stream = 0, mark = 0, sources = 0, answer = AI_ANSWER, srcs = AI_SOURCES, fs, srcW }) => {
  const blocks = blocksWithBudget(answer, stream);
  const pop = clamp01(sent);
  return (
    <div>
      {sent > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", opacity: clamp01(pop * 2), transform: `translateY(${(1 - pop) * 24}px) scale(${0.9 + 0.1 * pop})`, transformOrigin: "100% 100%" }}>
          <div style={{ maxWidth: "80%", background: "#F1F1F1", borderRadius: 22, padding: "12px 18px", fontSize: fs, lineHeight: 1.45, fontFamily: BN, color: "#0d0d0d" }}>{question}</div>
        </div>
      )}
      {searching > 0 && (
        <div style={{ marginTop: 22 }}>
          <Searching k={searching} fs={fs - 2} />
        </div>
      )}
      <div style={{ marginTop: 14, fontFamily: BN, fontSize: fs, lineHeight: 1.55, color: "#0d0d0d" }}>
        {blocks.map((b, i) =>
          b.visible ? (
            <div key={i} style={{ marginBottom: 12, paddingLeft: i > 0 && i < blocks.length - 1 ? 4 : 0 }}>
              <Rich segs={b.segs} budget={b.budget} markK={mark} cursor={b.last} />
            </div>
          ) : null
        )}
      </div>
      {sources > 0 && (
        <div style={{ marginTop: 4 }}>
          <SourceCards k={sources} w={srcW} srcs={srcs} fs={fs - 1} />
          <div style={{ display: "flex", gap: 18, marginTop: 14, opacity: sources }}>
            <IcCopy s={fs} />
            <IcThumb s={fs} />
            <IcThumb s={fs} down />
            <IcReload s={fs} c="#5d5d5d" w={2} />
            <IcShare s={fs} c="#5d5d5d" w={2} />
          </div>
        </div>
      )}
    </div>
  );
};

const Composer: React.FC<{ text?: string; caret?: boolean; fs: number; ph?: string }> = ({ text = "", caret, fs, ph = "Ask anything" }) => (
  <div style={{ borderRadius: 28, background: "#fff", border: "1px solid #E3E3E3", boxShadow: "0 4px 16px rgba(0,0,0,.07)", padding: "12px 12px 10px 18px", fontFamily: BN }}>
    <div style={{ fontSize: fs, lineHeight: 1.4, color: text ? "#0d0d0d" : "#8f8f8f", minHeight: fs * 1.4, maxHeight: fs * 1.4 * 2, overflow: "hidden", fontFamily: text ? BN : SANS }}>
      {text || ph}
      <span style={{ display: "inline-block", width: 2, height: fs * 1.15, background: "#0d0d0d", verticalAlign: "-3px", marginLeft: 1, opacity: caret ? 1 : 0 }} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
      <div style={{ width: 34, height: 34, borderRadius: 17, border: "1px solid #E3E3E3", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IcPlus s={18} c="#0d0d0d" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: fs - 3, color: "#5d5d5d", fontFamily: SANS, border: "1px solid #E3E3E3", borderRadius: 17, height: 34, padding: "0 12px" }}>
        <IcGlobe s={16} c="#5d5d5d" /> Search
      </div>
      <div style={{ marginLeft: "auto" }}>
        <IcMic s={20} mono="#5d5d5d" />
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 18, background: text ? "#0d0d0d" : "#D7D7D7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IcSend s={18} />
      </div>
    </div>
  </div>
);

const Title: React.FC<{ fs: number }> = ({ fs }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: fs, fontWeight: 600, color: "#0d0d0d", fontFamily: SANS }}>
    Assistant
    <svg width={fs * 0.7} height={fs * 0.7} viewBox="0 0 24 24" fill="none" stroke="#8f8f8f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </div>
);

/* ======================= MOBILE ======================= */
export const AiAnswerMobile: React.FC<AiProps> = (p) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS, color: "#0d0d0d" }}>
    <StatusBar />
    <div style={{ position: "absolute", top: 56, left: 18, right: 18, height: 50, display: "flex", alignItems: "center", gap: 16, zIndex: 10 }}>
      <IcMenu s={24} c="#0d0d0d" />
      <Title fs={19} />
      <div style={{ marginLeft: "auto" }}>
        <IcEdit s={23} />
      </div>
    </div>
    <div style={{ position: "absolute", top: 112, left: 0, right: 0, bottom: 140, overflow: "hidden" }}>
      <div style={{ padding: "8px 20px 0", transform: `translateY(${-(p.scroll ?? 0)}px)` }}>
        {(p.sent ?? 0) <= 0 ? (
          <div style={{ paddingTop: 210, textAlign: "center", fontSize: 26, fontWeight: 600, color: "#0d0d0d", fontFamily: SANS }}>What can I help with?</div>
        ) : (
          <Conversation {...p} fs={17.5} srcW={158} />
        )}
      </div>
    </div>
    <div style={{ position: "absolute", left: 12, right: 12, bottom: 30 }}>
      <Composer text={p.composer} caret={p.caret} fs={17} />
    </div>
    <HomeBar />
  </div>
);

/* ======================= DESKTOP ======================= */
const HISTORY = ["Sylhet dentist serial", "Website cost in Bangladesh", "bKash payment gateway setup", "Daraz seller fee 2026", "Eid offer Facebook post", "Restaurant menu QR code"];
export const AiAnswerDesktop: React.FC<AiProps> = (p) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS, color: "#0d0d0d" }}>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 232, background: "#F9F9F9", padding: "16px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
        <IcMenu s={22} c="#5d5d5d" />
        <IcEdit s={21} c="#5d5d5d" />
      </div>
      {[
        [<IcEdit s={17} key="n" />, "New chat"],
        [<IcSearch s={17} c="#0d0d0d" key="s" />, "Search chats"],
      ].map(([ic, l], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", marginTop: i ? 0 : 18, fontSize: 14.5 }}>
          {ic}
          {l}
        </div>
      ))}
      <div style={{ fontSize: 12.5, color: "#8f8f8f", padding: "18px 10px 6px", fontWeight: 600 }}>Today</div>
      {HISTORY.map((h, i) => (
        <div key={h} style={{ padding: "8px 10px", borderRadius: 10, fontSize: 14, background: i === 0 ? "#ECECEC" : undefined, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {h}
        </div>
      ))}
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 15, background: "#7B5E57", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>R</div>
        Rashed Ahmed
      </div>
    </div>
    <div style={{ position: "absolute", left: 232, right: 0, top: 0, height: 56, display: "flex", alignItems: "center", padding: "0 22px" }}>
      <Title fs={18} />
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 14, border: "1px solid #E3E3E3", borderRadius: 18, height: 34, padding: "0 14px" }}>
        <IcShare s={15} c="#0d0d0d" w={2} /> Share
      </div>
    </div>
    <div style={{ position: "absolute", left: 232, right: 0, top: 56, bottom: 120, overflow: "hidden" }}>
      <div style={{ width: 620, margin: "0 auto", paddingTop: 12, transform: `translateY(${-(p.scroll ?? 0)}px)` }}>
        {(p.sent ?? 0) <= 0 ? (
          <div style={{ paddingTop: 170, textAlign: "center", fontSize: 28, fontWeight: 600 }}>What can I help with?</div>
        ) : (
          <Conversation {...p} fs={16.5} srcW={196} />
        )}
      </div>
    </div>
    <div style={{ position: "absolute", left: 232 + (792 - 640) / 2, width: 640, bottom: 22 }}>
      <Composer text={p.composer} caret={p.caret} fs={16} />
    </div>
  </div>
);
