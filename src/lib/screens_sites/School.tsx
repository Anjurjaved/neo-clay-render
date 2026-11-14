// Proggya Academic Care — মিরপুরের coaching center website (hero, course + মাসিক ফি, কেন আমরা + routine, ভর্তি form)
import React from "react";
import { SiteDef, SiteProps, SiteShell, Ic, I, Btn, Field, Credit, IconTile, BN } from "./ui";

const P = "#2C3A8F"; // indigo
const PD = "#151D52";
const Y = "#F6C343";
const SKY = "#EEF1FB";

export const SCHOOL: SiteDef = {
  url: "proggyacare.com",
  header: { desktop: 68, mobile: 62 },
  sections: [
    { key: "hero", h: { desktop: 572, mobile: 680 } },
    { key: "courses", h: { desktop: 560, mobile: 700 } },
    { key: "why", h: { desktop: 400, mobile: 560 } },
    { key: "admission", h: { desktop: 540, mobile: 740 } },
    { key: "footer", h: { desktop: 150, mobile: 170 } },
  ],
};

const COURSES = [
  { bn: "এসএসসি ২০২৭ — সায়েন্স", sub: "Physics · Chemistry · Math · Biology", fee: "৳2,500", time: "বিকাল ৪:০০", seats: 8, icon: I.book, c: "#2C3A8F", bg: "#E6EAFB" },
  { bn: "এইচএসসি ২০২৭ — সায়েন্স", sub: "Physics · Chemistry · Higher Math", fee: "৳3,200", time: "সকাল ৭:৩০", seats: 5, icon: I.zap, c: "#C2410C", bg: "#FDEBDD" },
  { bn: "মেডিকেল ভর্তি প্রস্তুতি", sub: "Biology · Chemistry · GK · Mock test", fee: "৳18,000", per: "পুরো কোর্স", time: "সন্ধ্যা ৬:০০", seats: 12, icon: I.cap, c: "#047857", bg: "#DDF3EA" },
  { bn: "স্পোকেন ইংলিশ", sub: "Speaking · IELTS basics · Presentation", fee: "৳3,500", per: "৩ মাস", time: "শুক্র ১০:০০", seats: 15, icon: I.discuss, c: "#7C3AED", bg: "#EEE5FD" },
];

/** ক্লাসরুম: সবুজ বোর্ডে সূত্র, বইয়ের স্তূপ, globe */
const ClassArt: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <svg width={w} height={h} viewBox="0 0 460 380" style={{ display: "block" }}>
    <rect width="460" height="380" rx="28" fill="#E3E8FA" />
    <circle cx="390" cy="60" r="70" fill="#fff" opacity="0.5" />
    <rect x="40" y="40" width="300" height="190" rx="14" fill="#8D6B4A" />
    <rect x="52" y="52" width="276" height="166" rx="8" fill="#2F5D4A" />
    <text x="76" y="104" fontFamily="Inter" fontWeight="700" fontSize="30" fill="#EAF4EE">E = mc²</text>
    <text x="76" y="150" fontFamily="Inter" fontWeight="700" fontSize="24" fill="#EAF4EE" opacity="0.9">a² + b² = c²</text>
    <text x="76" y="192" fontFamily="Inter" fontWeight="700" fontSize="22" fill="#F6C343">H₂O → 2H + O</text>
    <path d="M250 110 l40 -36 l26 30" stroke="#EAF4EE" strokeWidth="3" fill="none" />
    <circle cx="290" cy="74" r="4" fill="#EAF4EE" />
    <rect x="120" y="226" width="140" height="8" rx="4" fill="#6E5238" />
    <rect x="200" y="222" width="30" height="8" rx="3" fill="#fff" />
    {/* books */}
    {[
      ["#E4572E", 0],
      ["#2C3A8F", 1],
      ["#F6C343", 2],
      ["#17A673", 3],
    ].map(([c, i]) => (
      <g key={String(c)}>
        <rect x={250 + Number(i) * 6} y={330 - Number(i) * 26} width="150" height="24" rx="5" fill={c as string} />
        <rect x={258 + Number(i) * 6} y={334 - Number(i) * 26} width="134" height="5" rx="2" fill="#fff" opacity="0.5" />
      </g>
    ))}
    {/* globe */}
    <circle cx="120" cy="300" r="46" fill="#5BA4E6" />
    <path d="M90 284 q14 -14 30 -4 q8 10 -4 18 q-12 4 -10 16 q-10 4 -16 -8Z M134 270 q16 2 22 16 q-6 12 -20 6 q-8 -10 -2 -22Z" fill="#7BC67E" />
    <path d="M120 346 V362 M96 364 H144" stroke="#8D6B4A" strokeWidth="6" strokeLinecap="round" />
    <path d="M70 300 a50 50 0 0 0 100 0" stroke="#8D6B4A" strokeWidth="4" fill="none" />
  </svg>
);

const Logo: React.FC<{ m: boolean }> = ({ m }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: m ? 38 : 42, height: m ? 38 : 42, borderRadius: 12, background: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Ic d={I.cap} s={m ? 22 : 24} c={Y} w={2.2} />
    </div>
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontFamily: BN, fontSize: m ? 19 : 21, fontWeight: 700, color: PD }}>প্রজ্ঞা</div>
      <div style={{ fontSize: m ? 11 : 12, fontWeight: 800, color: P, letterSpacing: 1.6 }}>ACADEMIC CARE</div>
    </div>
  </div>
);

export const SchoolSite: React.FC<SiteProps> = ({ mode, scroll = 0, reveal = 1 }) => {
  const m = mode === "mobile";
  const pad = m ? 18 : 48;

  const header = m ? (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 12 }}>
      <Logo m />
      <Btn bg={Y} c={PD} h={38} fs={15} px={14} style={{ marginLeft: "auto", boxShadow: "none" }}>
        <span style={{ fontFamily: BN }}>ভর্তি</span>
      </Btn>
      <Ic d={I.menu} s={28} c={PD} w={2.4} />
    </div>
  ) : (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 28 }}>
      <Logo m={false} />
      <div style={{ display: "flex", gap: 24, marginLeft: 24, fontFamily: BN, fontSize: 16, fontWeight: 700, color: "#3b4466" }}>
        <span style={{ color: P }}>হোম</span>
        <span>কোর্স</span>
        <span>শিক্ষক</span>
        <span>রুটিন</span>
        <span>রেজাল্ট</span>
        <span>যোগাযোগ</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: PD }}>
        <Ic d={I.phone} s={18} c={P} /> 01558-204716
      </div>
      <Btn bg={Y} c={PD} h={42} fs={15} px={18} style={{ boxShadow: "none" }}>
        <span style={{ fontFamily: BN }}>ভর্তি চলছে</span>
      </Btn>
    </div>
  );

  const hero = (
    <div style={{ height: "100%", background: `linear-gradient(180deg, ${SKY}, #fff)`, padding: m ? `24px ${pad}px 0` : `44px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 20 : 36 }}>
      <div style={{ flex: m ? "none" : 1.05, paddingTop: m ? 0 : 16 }}>
        <div style={{ fontFamily: BN, fontSize: m ? 16 : 18, fontWeight: 700, color: "#C2410C" }}>নতুন ব্যাচ শুরু ১ ডিসেম্বর · মিরপুর ১০</div>
        <div style={{ fontFamily: BN, fontSize: m ? 34 : 46, lineHeight: 1.2, fontWeight: 700, color: PD, marginTop: 10 }}>
          ছোট ব্যাচে পড়ুন, <span style={{ color: P, boxShadow: `inset 0 -14px 0 ${Y}66` }}>প্রতিটা প্রশ্নের</span> উত্তর বুঝে নিন
        </div>
        <div style={{ fontFamily: BN, fontSize: m ? 17 : 19, lineHeight: 1.55, color: "#4b5374", fontWeight: 600, marginTop: 12 }}>
          প্রতি ব্যাচে সর্বোচ্চ ২০ জন। সাপ্তাহিক পরীক্ষা, অভিভাবকের কাছে মাসিক রিপোর্ট আর অনলাইনে ক্লাসের রেকর্ডিং।
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: m ? 18 : 26 }}>
          <Btn bg={P} h={m ? 52 : 54} fs={m ? 17 : 18} icon={I.cap} style={{ flex: m ? 1 : undefined }}>
            <span style={{ fontFamily: BN }}>ভর্তি হন</span>
          </Btn>
          <Btn bg={P} outline h={m ? 52 : 54} fs={m ? 17 : 18} icon={I.play} style={{ flex: m ? 1 : undefined }}>
            <span style={{ fontFamily: BN }}>ফ্রি ডেমো ক্লাস</span>
          </Btn>
        </div>
        <div style={{ display: "flex", gap: m ? 10 : 18, marginTop: m ? 18 : 30 }}>
          {[
            ["২০", "জনের ব্যাচ"],
            ["৬", "বিষয়ের শিক্ষক"],
            ["প্রতি সপ্তাহে", "পরীক্ষা"],
          ].map(([a, b]) => (
            <div key={b} style={{ flex: 1, background: "#fff", borderRadius: 16, padding: m ? "10px 10px" : "12px 16px", boxShadow: "0 6px 16px rgba(21,29,82,0.07)", fontFamily: BN }}>
              <div style={{ fontSize: m ? 20 : 24, fontWeight: 700, color: P }}>{a}</div>
              <div style={{ fontSize: m ? 13 : 15, fontWeight: 600, color: "#5b6386" }}>{b}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: m ? "none" : 1, display: "flex", justifyContent: "center" }}>
        <div style={{ borderRadius: 28, overflow: "hidden", boxShadow: "0 18px 40px rgba(21,29,82,0.14)" }}>
          <ClassArt w={m ? 354 : 440} h={m ? 236 : 364} />
        </div>
      </div>
    </div>
  );

  const courses = (
    <div style={{ height: "100%", background: "#fff", padding: m ? `26px ${pad}px 0` : `40px ${pad}px 0` }}>
      <div style={{ fontFamily: BN, fontSize: m ? 30 : 38, fontWeight: 700, color: PD }}>আমাদের কোর্স</div>
      <div style={{ fontFamily: BN, fontSize: m ? 16 : 18, color: "#5b6386", fontWeight: 600 }}>মাসিক ফি, ক্লাসের সময় আর খালি সিট — সব এক জায়গায়</div>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "1fr 1fr", gap: m ? 12 : 18, marginTop: m ? 18 : 24 }}>
        {COURSES.map((x) => (
          <div key={x.bn} style={{ borderRadius: 22, background: x.bg, padding: m ? 14 : 20, height: m ? 268 : 196, boxSizing: "border-box", display: "flex", flexDirection: m ? "column" : "row", gap: m ? 8 : 18 }}>
            <IconTile d={x.icon} bg="#fff" c={x.c} s={m ? 44 : 60} r={16} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: BN, fontSize: m ? 18 : 22, fontWeight: 700, color: PD, lineHeight: 1.25 }}>{x.bn}</div>
              <div style={{ fontSize: m ? 13 : 14, fontWeight: 600, color: "#5b6386", marginTop: 4, lineHeight: 1.35 }}>{x.sub}</div>
              <div style={{ display: "flex", gap: m ? 8 : 16, marginTop: m ? 8 : 10, fontFamily: BN, fontSize: m ? 13 : 15, fontWeight: 700, color: "#3b4466", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Ic d={I.clock} s={15} c={x.c} /> {x.time}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: x.seats < 10 ? "#C2410C" : "#3b4466" }}>
                  <Ic d={I.users} s={15} c={x.c} /> {x.seats} সিট খালি
                </span>
              </div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: m ? 22 : 26, fontWeight: 800, color: x.c }}>{x.fee}</span>
                <span style={{ fontFamily: BN, fontSize: m ? 13 : 15, fontWeight: 700, color: "#5b6386" }}>/{x.per ?? "মাস"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const routine = [
    ["শনি", "Physics", "Math"],
    ["রবি", "Chemistry", "Biology"],
    ["সোম", "Math", "English"],
    ["মঙ্গল", "Weekly test", "Solve class"],
  ];
  const why = (
    <div style={{ height: "100%", background: PD, color: "#fff", padding: m ? `26px ${pad}px 0` : `40px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 18 : 40 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: BN, fontSize: m ? 28 : 34, fontWeight: 700 }}>অভিভাবকেরা কেন বেছে নেন</div>
        <div style={{ display: "flex", flexDirection: "column", gap: m ? 10 : 14, marginTop: m ? 14 : 20 }}>
          {["প্রতি সপ্তাহে পরীক্ষা, রেজাল্ট SMS-এ অভিভাবকের মোবাইলে", "ক্লাস মিস হলে অনলাইনে রেকর্ডিং দেখা যায়", "বুয়েট ও ঢাকা মেডিকেলের শিক্ষার্থী শিক্ষক"].map((s) => (
            <div key={s} style={{ display: "flex", gap: 12, alignItems: "center", fontFamily: BN, fontSize: m ? 16 : 18, fontWeight: 600, color: "#DDE2FA" }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: Y, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Ic d={I.check} s={17} c={PD} w={3} />
              </div>
              {s}
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: m ? "none" : 0.9, background: "#fff", borderRadius: 20, padding: m ? "8px 14px" : "10px 18px", color: PD }}>
        <div style={{ display: "flex", padding: "10px 0", fontFamily: BN, fontSize: 14, fontWeight: 700, color: "#6b7396" }}>
          <span style={{ width: 70 }}>দিন</span>
          <span style={{ flex: 1 }}>৪:০০ – ৫:১৫</span>
          <span style={{ flex: 1 }}>৫:৩০ – ৬:৪৫</span>
        </div>
        {routine.map(([d, a, b], i) => (
          <div key={d} style={{ display: "flex", padding: m ? "10px 0" : "12px 0", borderTop: "1px solid #ECEEF7", fontSize: m ? 15 : 16, fontWeight: 700 }}>
            <span style={{ width: 70, fontFamily: BN, color: "#3b4466" }}>{d}</span>
            <span style={{ flex: 1, color: i === 3 ? "#C2410C" : PD }}>{a}</span>
            <span style={{ flex: 1, color: PD }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const fee = (
    <div style={{ background: SKY, borderRadius: 22, padding: m ? 16 : 22, display: "flex", flexDirection: "column", gap: 10, width: m ? "100%" : 330, boxSizing: "border-box", alignSelf: "flex-start" }}>
      <div style={{ fontFamily: BN, fontSize: 19, fontWeight: 700, color: PD }}>ফি-এর হিসাব</div>
      {[
        ["ভর্তি ফি (একবার)", "৳1,000"],
        ["প্রথম মাসের ফি", "৳2,500"],
        ["স্টাডি ম্যাটেরিয়াল", "৳500"],
      ].map(([a, b]) => (
        <div key={a} style={{ display: "flex", justifyContent: "space-between", fontFamily: BN, fontSize: 16, fontWeight: 700, color: "#4b5374" }}>
          <span>{a}</span>
          <span style={{ fontFamily: "Inter" }}>{b}</span>
        </div>
      ))}
      <div style={{ height: 1, background: "#D6DCF3" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 800, color: P }}>
        <span style={{ fontFamily: BN }}>মোট</span>
        <span>৳4,000</span>
      </div>
      <div style={{ fontFamily: BN, fontSize: 14, fontWeight: 600, color: "#5b6386" }}>bKash / Nagad-এ অথবা অফিসে নগদ দেওয়া যাবে</div>
    </div>
  );
  const admission = (
    <div style={{ height: "100%", background: "#fff", padding: m ? `26px ${pad}px 0` : `40px ${pad}px 0` }}>
      <div style={{ fontFamily: BN, fontSize: m ? 30 : 36, fontWeight: 700, color: PD }}>অনলাইনে ভর্তি ফর্ম</div>
      <div style={{ display: "flex", flexDirection: m ? "column" : "row", gap: m ? 14 : 26, marginTop: m ? 14 : 20 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, background: "#fff", borderRadius: 22, padding: m ? 16 : 22, boxShadow: "0 14px 36px rgba(21,29,82,0.10)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="শিক্ষার্থীর নাম" value="Arif Hossain" icon={I.user} />
            <Field label="ক্লাস" value="Class 9" select />
          </div>
          <Field label="কোর্স" value="SSC 2027 — Science" select icon={I.book} />
          <Field label="অভিভাবকের মোবাইল" value="01676-118902" icon={I.phone} />
          <div style={{ fontFamily: BN, fontSize: 13, fontWeight: 700, color: "#5b6675" }}>ব্যাচের সময়</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["সকাল ৭:৩০", "বিকাল ৪:০০", "সন্ধ্যা ৬:০০"].map((s, i) => (
              <div key={s} style={{ flex: 1, height: 42, borderRadius: 12, fontFamily: BN, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: i === 1 ? P : SKY, color: i === 1 ? "#fff" : P }}>
                {s}
              </div>
            ))}
          </div>
          <Btn bg={P} h={52} fs={18} full r={14} icon={I.check}>
            <span style={{ fontFamily: BN }}>ভর্তি নিশ্চিত করুন</span>
          </Btn>
        </div>
        {fee}
      </div>
    </div>
  );

  const footer = (
    <div style={{ height: "100%", background: "#0E1440", color: "#B9C0E6", padding: m ? `24px ${pad}px` : `30px ${pad}px`, boxSizing: "border-box", display: "flex", flexDirection: m ? "column" : "row", gap: m ? 10 : 0, justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Proggya Academic Care</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>01558-204716 · Section 10, Mirpur, Dhaka</div>
      </div>
      <div style={{ alignSelf: m ? "flex-start" : "flex-end", textAlign: m ? "left" : "right" }}>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>© 2026 Proggya Academic Care</div>
        <Credit c="#8E97C7" />
      </div>
    </div>
  );

  return <SiteShell def={SCHOOL} mode={mode} scroll={scroll} reveal={reveal} header={header} sections={{ hero, courses, why, admission, footer }} />;
};
