// Dr. Shirin Dental Chamber — ধানমন্ডির dental chamber-এর website (hero, ট্রিটমেন্ট + ৳ খরচ, ডাক্তার, সিরিয়াল form, map)
import React from "react";
import { SiteDef, SiteProps, SiteShell, Ic, I, Btn, Field, Credit, IconTile, Stars, BN } from "./ui";

const P = "#0E7C7B"; // teal
const PD = "#0B4650";
const MINT = "#E7F4F1";
const CORAL = "#F07F5F";

export const DENTAL: SiteDef = {
  url: "drshirindental.com.bd",
  header: { desktop: 68, mobile: 62 },
  sections: [
    { key: "hero", h: { desktop: 572, mobile: 690 } },
    { key: "treatments", h: { desktop: 560, mobile: 760 } },
    { key: "doctor", h: { desktop: 440, mobile: 620 } },
    { key: "serial", h: { desktop: 520, mobile: 640 } },
    { key: "map", h: { desktop: 0, mobile: 420 } },
    { key: "footer", h: { desktop: 150, mobile: 170 } },
  ],
};

const TREAT = [
  { bn: "স্কেলিং ও পলিশিং", en: "Scaling & Polishing", p: "৳1,500 – 2,500", time: "30 min", icon: I.sparkle },
  { bn: "রুট ক্যানেল", en: "Root Canal (RCT)", p: "৳6,000 – 12,000", time: "2–3 visits", icon: I.tooth },
  { bn: "ফিলিং", en: "Tooth Filling", p: "৳1,500 – 3,500", time: "40 min", icon: I.shield },
  { bn: "দাঁত তোলা", en: "Extraction", p: "৳1,000 – 3,000", time: "20 min", icon: I.zap },
  { bn: "ব্রেসেস", en: "Orthodontic Braces", p: "৳45,000 – 90,000", time: "12–18 months", icon: I.award },
  { bn: "ইমপ্ল্যান্ট", en: "Dental Implant", p: "৳55,000 – 85,000", time: "3 visits", icon: I.star },
];

/** চেম্বারের ভেতর (dental chair + lamp + জানালা) */
const ClinicArt: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <svg width={w} height={h} viewBox="0 0 480 400" style={{ display: "block" }}>
    <defs>
      <linearGradient id="dwall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D9EFEA" />
        <stop offset="1" stopColor="#BFE2DB" />
      </linearGradient>
      <linearGradient id="dwin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF6E5" />
        <stop offset="1" stopColor="#CFEAF4" />
      </linearGradient>
      <linearGradient id="dchair" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1A9C97" />
        <stop offset="1" stopColor="#0E6F6D" />
      </linearGradient>
    </defs>
    <rect width="480" height="400" fill="url(#dwall)" />
    <rect x="0" y="318" width="480" height="82" fill="#A9D3CA" />
    <rect x="0" y="318" width="480" height="6" fill="#98C7BD" />
    {/* window */}
    <rect x="290" y="46" width="150" height="150" rx="14" fill="#fff" />
    <rect x="300" y="56" width="130" height="130" rx="8" fill="url(#dwin)" />
    <rect x="363" y="56" width="4" height="130" fill="#fff" />
    <rect x="300" y="119" width="130" height="4" fill="#fff" />
    <path d="M300 160 Q340 130 380 150 T430 140 V186 H300Z" fill="#BFE3C9" />
    {/* plant */}
    <rect x="410" y="268" width="40" height="50" rx="8" fill="#F3EDE4" />
    <path d="M430 270 C410 240 400 220 412 200 C425 222 430 240 430 270Z M430 270 C445 236 460 226 470 214 C468 240 452 258 430 270Z M430 270 C428 238 432 214 440 196 C448 222 440 250 430 270Z" fill="#3FA672" />
    {/* lamp arm */}
    <path d="M70 40 H190 Q205 40 205 55 V92" stroke="#B9C6CC" strokeWidth="9" fill="none" strokeLinecap="round" />
    <ellipse cx="205" cy="104" rx="38" ry="16" fill="#E6ECEF" />
    <ellipse cx="205" cy="108" rx="26" ry="8" fill="#FFF8D6" />
    <path d="M180 116 L150 250 H262 L230 116Z" fill="#FFF8D6" opacity="0.35" />
    {/* chair base + seat */}
    <rect x="150" y="300" width="120" height="22" rx="11" fill="#C9D3D8" />
    <rect x="196" y="250" width="26" height="56" rx="8" fill="#AEBBC2" />
    <path d="M70 196 Q60 186 70 176 L112 160 Q124 156 132 166 L150 214 H300 Q328 214 336 238 L342 254 Q346 266 332 266 H140 Q118 266 108 248Z" fill="url(#dchair)" />
    <path d="M150 214 H300 Q318 214 326 228 H160Z" fill="#26B1AA" opacity="0.6" />
    <rect x="58" y="156" width="54" height="30" rx="15" transform="rotate(-20 85 171)" fill="#1A9C97" />
    {/* side tray + monitor */}
    <rect x="330" y="200" width="6" height="110" rx="3" fill="#B9C6CC" />
    <rect x="300" y="186" width="70" height="16" rx="8" fill="#E6ECEF" />
    <rect x="96" y="96" width="74" height="50" rx="8" fill="#26343F" />
    <rect x="102" y="102" width="62" height="38" rx="4" fill="#5FD0C3" />
    <path d="M110 128 L122 118 L132 126 L146 110 L156 120" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
    <rect x="128" y="146" width="10" height="20" fill="#B9C6CC" />
  </svg>
);

/** ডাক্তারের illustrated portrait (হিজাব, সাদা coat, stethoscope) */
const DoctorArt: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s * 1.08} viewBox="0 0 300 324" style={{ display: "block" }}>
    <defs>
      <linearGradient id="dbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E3F3EF" />
        <stop offset="1" stopColor="#BFE1D9" />
      </linearGradient>
    </defs>
    <rect width="300" height="324" rx="28" fill="url(#dbg)" />
    <circle cx="232" cy="70" r="60" fill="#fff" opacity="0.45" />
    {/* coat */}
    <path d="M40 324 C44 252 82 226 150 222 C218 226 256 252 260 324Z" fill="#FBFCFD" />
    <path d="M118 226 L150 300 L182 226 Q166 220 150 220 Q134 220 118 226Z" fill="#2A8E88" />
    <path d="M118 226 L136 324 M182 226 L164 324" stroke="#E2E8EC" strokeWidth="3" />
    {/* stethoscope */}
    <path d="M112 232 C100 270 118 292 140 290" stroke="#3A4650" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="146" cy="290" r="9" fill="#9AA6AE" stroke="#3A4650" strokeWidth="3" />
    {/* hijab + face */}
    <path d="M86 150 C86 92 116 62 150 62 C184 62 214 92 214 150 C214 196 196 222 150 232 C104 222 86 196 86 150Z" fill="#4E6A86" />
    <ellipse cx="150" cy="148" rx="44" ry="52" fill="#E8B796" />
    <path d="M104 132 C106 98 126 82 150 82 C174 82 194 98 196 132 C184 112 168 104 150 104 C132 104 116 112 104 132Z" fill="#4E6A86" />
    <path d="M132 146 q6 -5 12 0 M156 146 q6 -5 12 0" stroke="#4A3428" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M136 172 q14 12 28 0" stroke="#B5664E" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="128" cy="164" r="7" fill="#F2A08A" opacity="0.45" />
    <circle cx="172" cy="164" r="7" fill="#F2A08A" opacity="0.45" />
  </svg>
);

/** ধানমন্ডি এলাকার map (lake, রাস্তা, pin) */
const MapArt: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <svg width={w} height={h} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
    <rect width="400" height="300" fill="#EEF0E8" />
    <path d="M-10 190 C60 170 90 210 150 200 C210 190 230 150 300 160 C350 168 380 150 420 140 V178 C380 190 350 204 300 198 C240 190 214 232 150 238 C90 244 60 210 -10 226Z" fill="#B6DBEF" />
    <rect x="250" y="40" width="80" height="60" rx="10" fill="#CFE8C8" />
    <rect x="40" y="40" width="70" height="50" rx="10" fill="#CFE8C8" />
    {[60, 130, 270].map((y) => (
      <rect key={y} x="-10" y={y} width="420" height={y === 130 ? 16 : 10} fill="#fff" />
    ))}
    {[80, 190, 330].map((x) => (
      <rect key={x} x={x} y="-10" width={x === 190 ? 16 : 10} height="320" fill="#fff" />
    ))}
    <rect x="190" y="-10" width="16" height="320" fill="#FBE7B0" />
    <text x="212" y="30" fontSize="13" fontWeight="700" fill="#8a7a55" fontFamily="Inter">Satmasjid Rd</text>
    <text x="16" y="124" fontSize="12" fontWeight="700" fill="#8f979e" fontFamily="Inter">Road 8A</text>
    <text x="250" y="230" fontSize="13" fontWeight="700" fill="#5f93b3" fontFamily="Inter">Dhanmondi Lake</text>
    <g transform="translate(198 138)">
      <ellipse cx="0" cy="4" rx="14" ry="5" fill="#000" opacity="0.15" />
      <path d="M0 0 C-16 -18 -20 -28 -20 -38 A20 20 0 0 1 20 -38 C20 -28 16 -18 0 0Z" fill="#E5484D" />
      <circle cx="0" cy="-38" r="7.5" fill="#fff" />
    </g>
  </svg>
);

const Logo: React.FC<{ m: boolean }> = ({ m }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: m ? 38 : 42, height: m ? 38 : 42, borderRadius: 12, background: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Ic d={I.tooth} s={m ? 22 : 24} c="#fff" w={2.1} />
    </div>
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontSize: m ? 18 : 20, fontWeight: 800, color: PD }}>Dr. Shirin</div>
      <div style={{ fontSize: m ? 12 : 13, fontWeight: 700, color: P, letterSpacing: 1.2 }}>DENTAL CHAMBER</div>
    </div>
  </div>
);

export const DentalSite: React.FC<SiteProps> = ({ mode, scroll = 0, reveal = 1 }) => {
  const m = mode === "mobile";
  const pad = m ? 20 : 48;

  const header = m ? (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 12 }}>
      <Logo m />
      <div style={{ marginLeft: "auto", width: 42, height: 42, borderRadius: 21, background: MINT, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ic d={I.phone} s={20} c={P} />
      </div>
      <Ic d={I.menu} s={28} c={PD} w={2.4} />
    </div>
  ) : (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 30 }}>
      <Logo m={false} />
      <div style={{ display: "flex", gap: 26, marginLeft: 26, fontSize: 16, fontWeight: 700, color: "#3c4a57", fontFamily: BN }}>
        <span style={{ color: P }}>হোম</span>
        <span>ট্রিটমেন্ট</span>
        <span>ডাক্তার</span>
        <span>খরচ</span>
        <span>যোগাযোগ</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: PD }}>
        <Ic d={I.phone} s={18} c={P} />
        01711-458930
      </div>
      <Btn bg={P} h={42} fs={15} px={18}>
        <span style={{ fontFamily: BN }}>সিরিয়াল নিন</span>
      </Btn>
    </div>
  );

  const hero = (
    <div style={{ height: "100%", background: `linear-gradient(180deg, #F3FAF8 0%, #fff 100%)`, padding: m ? `26px ${pad}px 0` : `46px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 22 : 36 }}>
      <div style={{ flex: m ? "none" : 1.05, paddingTop: m ? 0 : 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: m ? 15 : 16, fontWeight: 700, color: P }}>
          <Stars s={m ? 15 : 16} />
          <span style={{ color: "#5b6675" }}>Google-এ 4.9 · 312 রিভিউ</span>
        </div>
        <div style={{ fontFamily: BN, fontSize: m ? 34 : 46, lineHeight: 1.18, fontWeight: 700, color: PD, marginTop: 12 }}>
          ব্যথাহীন দাঁতের চিকিৎসা, <span style={{ color: P }}>ধানমন্ডিতেই</span>
        </div>
        <div style={{ fontFamily: BN, fontSize: m ? 17 : 19, lineHeight: 1.55, color: "#4d5a67", marginTop: 12, fontWeight: 600 }}>
          রুট ক্যানেল, ব্রেসেস, ইমপ্ল্যান্ট থেকে স্কেলিং — আধুনিক যন্ত্রে, জীবাণুমুক্ত চেম্বারে। আগে থেকে সিরিয়াল নিন, এসে অপেক্ষা করতে হবে না।
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: m ? 20 : 26 }}>
          <Btn bg={P} h={m ? 52 : 54} fs={m ? 17 : 18} icon={I.cal} style={{ flex: m ? 1 : undefined }}>
            <span style={{ fontFamily: BN }}>সিরিয়াল নিন</span>
          </Btn>
          <Btn bg={P} outline h={m ? 52 : 54} fs={m ? 17 : 18} icon={I.phone} style={{ flex: m ? 1 : undefined }}>
            <span style={{ fontFamily: BN }}>কল করুন</span>
          </Btn>
        </div>
        <div style={{ display: "flex", gap: m ? 14 : 26, marginTop: m ? 18 : 30, fontFamily: BN, fontSize: m ? 14 : 16, fontWeight: 700, color: "#3c4a57" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Ic d={I.clock} s={18} c={P} />
            শনি–বৃহঃ, বিকাল ৪টা–রাত ৯টা
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Ic d={I.pin} s={18} c={P} />
            ধানমন্ডি ৮/এ
          </div>
        </div>
      </div>
      <div style={{ flex: m ? "none" : 1, position: "relative" }}>
        <div style={{ borderRadius: 28, overflow: "hidden", boxShadow: "0 18px 40px rgba(11,70,80,0.16)" }}>
          <ClinicArt w={m ? 350 : 440} h={m ? 270 : 366} />
        </div>
        <div style={{ position: "absolute", left: m ? 14 : -26, bottom: m ? -18 : 34, background: "#fff", borderRadius: 18, padding: "12px 16px", boxShadow: "0 12px 30px rgba(11,70,80,0.18)", display: "flex", alignItems: "center", gap: 12 }}>
          <IconTile d={I.cal} bg={MINT} c={P} s={44} r={13} />
          <div>
            <div style={{ fontFamily: BN, fontSize: 14, fontWeight: 700, color: "#6b7785" }}>আজকের সিরিয়াল</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: PD }}>
              <span style={{ fontFamily: BN }}>বাকি</span> 6 slot
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const treatments = (
    <div style={{ height: "100%", background: "#fff", padding: m ? `30px ${pad}px 0` : `44px ${pad}px 0` }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: BN, fontSize: m ? 30 : 38, fontWeight: 700, color: PD }}>ট্রিটমেন্ট ও খরচ</div>
          <div style={{ fontFamily: BN, fontSize: m ? 16 : 18, color: "#5b6675", fontWeight: 600, marginTop: 4 }}>খরচ আগেই জেনে নিন — কোনো লুকানো চার্জ নেই</div>
        </div>
        {!m && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 800, color: P, fontFamily: BN }}>
            সব ট্রিটমেন্ট <Ic d={I.arrowR} s={18} c={P} />
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "1fr 1fr 1fr", gap: m ? 12 : 18, marginTop: m ? 20 : 28 }}>
        {TREAT.map((x, i) => (
          <div key={x.en} style={{ borderRadius: 20, background: i === 1 ? PD : "#F6FAF9", padding: m ? "16px 14px" : "20px 20px", boxShadow: i === 1 ? "0 14px 30px rgba(11,70,80,0.25)" : "inset 0 0 0 1.5px #E3EEEB", color: i === 1 ? "#fff" : PD, height: m ? 186 : 196, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            <IconTile d={x.icon} bg={i === 1 ? "rgba(255,255,255,0.14)" : MINT} c={i === 1 ? "#fff" : P} s={m ? 42 : 48} r={14} />
            <div style={{ fontFamily: BN, fontSize: m ? 19 : 22, fontWeight: 700, marginTop: 12 }}>{x.bn}</div>
            <div style={{ fontSize: m ? 13 : 14, fontWeight: 600, opacity: 0.7 }}>{x.en}</div>
            <div style={{ marginTop: "auto", display: "flex", alignItems: m ? "flex-start" : "center", flexDirection: m ? "column" : "row", justifyContent: "space-between", gap: 2 }}>
              <div style={{ fontSize: m ? 17 : 20, fontWeight: 800, color: i === 1 ? "#8FF0DF" : P }}>{x.p}</div>
              <div style={{ fontSize: m ? 12 : 13, fontWeight: 700, opacity: 0.65, display: "flex", alignItems: "center", gap: 4 }}>
                <Ic d={I.clock} s={13} c="currentColor" /> {x.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const doctor = (
    <div style={{ height: "100%", background: MINT, padding: m ? `30px ${pad}px 0` : `44px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 18 : 40, alignItems: m ? "stretch" : "flex-start" }}>
      {m ? (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ borderRadius: 22, overflow: "hidden" }}>
            <DoctorArt s={130} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: PD }}>Dr. Shirin Akter</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: P, marginTop: 4 }}>BDS (DU), PGT (Prosthodontics)</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#5b6675", marginTop: 4 }}>BMDC Reg. No. 6214</div>
          </div>
        </div>
      ) : (
        <div style={{ borderRadius: 28, overflow: "hidden", boxShadow: "0 16px 34px rgba(11,70,80,0.14)" }}>
          <DoctorArt s={300} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        {!m && (
          <>
            <div style={{ fontFamily: BN, fontSize: 17, fontWeight: 700, color: P }}>আপনার ডাক্তার</div>
            <div style={{ fontSize: 38, fontWeight: 800, color: PD, marginTop: 4 }}>Dr. Shirin Akter</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: P, marginTop: 4 }}>BDS (DU), PGT (Prosthodontics) · BMDC Reg. No. 6214</div>
          </>
        )}
        <div style={{ fontFamily: BN, fontSize: m ? 16 : 18, lineHeight: 1.6, fontWeight: 600, color: "#3c4a57", marginTop: m ? 0 : 14 }}>
          ঢাকা ডেন্টাল কলেজের সাবেক সহকারী রেজিস্ট্রার। শিশু ও বয়স্ক রোগীদের ভয়হীন, ধৈর্যশীল চিকিৎসার জন্য পরিচিত।
        </div>
        <div style={{ marginTop: m ? 16 : 22, background: "#fff", borderRadius: 18, padding: m ? "6px 16px" : "8px 20px", boxShadow: "0 6px 18px rgba(11,70,80,0.08)" }}>
          {[
            ["শনিবার – বৃহস্পতিবার", "4:00 PM – 9:00 PM"],
            ["শুক্রবার", "10:00 AM – 1:00 PM"],
            ["জরুরি (ফোনে)", "24/7"],
          ].map(([d, h], i) => (
            <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: m ? "12px 0" : "13px 0", borderTop: i ? "1px solid #E8EFEE" : "none", fontSize: m ? 16 : 17, fontWeight: 700 }}>
              <span style={{ fontFamily: BN, color: "#3c4a57" }}>{d}</span>
              <span style={{ color: i === 2 ? CORAL : PD, fontWeight: 800 }}>{h}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const form = (
    <div style={{ background: "#fff", borderRadius: 24, padding: m ? 18 : 26, boxShadow: "0 16px 40px rgba(11,70,80,0.12)", display: "flex", flexDirection: "column", gap: m ? 12 : 14, width: m ? undefined : 470, boxSizing: "border-box" }}>
      <div style={{ fontFamily: BN, fontSize: m ? 26 : 28, fontWeight: 700, color: PD }}>অনলাইনে সিরিয়াল নিন</div>
      <Field label="রোগীর নাম" value="Nusrat Jahan" icon={I.user} fs={m ? 17 : 16} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="মোবাইল" value="01819-302447" icon={I.phone} fs={m ? 16 : 16} />
        <Field label="তারিখ" value="Sat, 22 Nov" icon={I.cal} fs={m ? 16 : 16} />
      </div>
      <Field label="ট্রিটমেন্ট" value="Scaling & Polishing" select fs={m ? 17 : 16} />
      <div style={{ display: "flex", gap: 8 }}>
        {["4:30", "5:00", "5:30", "6:00", "7:30"].map((s, i) => (
          <div key={s} style={{ flex: 1, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, background: i === 2 ? P : i === 1 ? "#F1F3F5" : MINT, color: i === 2 ? "#fff" : i === 1 ? "#b0b7bf" : P, textDecoration: i === 1 ? "line-through" : "none" }}>
            {s}
          </div>
        ))}
      </div>
      <Btn bg={P} h={m ? 54 : 52} fs={18} full icon={I.check} r={14}>
        <span style={{ fontFamily: BN }}>সিরিয়াল কনফার্ম করুন</span>
      </Btn>
    </div>
  );

  const serial = m ? (
    <div style={{ height: "100%", background: `linear-gradient(180deg,#fff,#F3FAF8)`, padding: `28px ${pad}px 0` }}>{form}</div>
  ) : (
    <div style={{ height: "100%", background: `linear-gradient(180deg,#fff,#F3FAF8)`, padding: `44px ${pad}px 0`, display: "flex", gap: 30 }}>
      {form}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ borderRadius: 24, overflow: "hidden", height: 300, boxShadow: "0 12px 30px rgba(11,70,80,0.12)" }}>
          <MapArt w={430} h={300} />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <IconTile d={I.pin} bg={MINT} c={P} s={46} r={14} />
          <div style={{ fontSize: 16, fontWeight: 700, color: "#3c4a57", lineHeight: 1.45 }}>
            House 42, Road 8A, Dhanmondi, Dhaka 1209
            <div style={{ fontFamily: BN, color: P, fontWeight: 800, marginTop: 2 }}>ম্যাপে দেখুন →</div>
          </div>
        </div>
      </div>
    </div>
  );

  const map = (
    <div style={{ height: "100%", background: "#F3FAF8", padding: `6px ${pad}px 0` }}>
      <div style={{ borderRadius: 22, overflow: "hidden", height: 250, boxShadow: "0 12px 30px rgba(11,70,80,0.12)" }}>
        <MapArt w={350} h={250} />
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        <IconTile d={I.pin} bg={MINT} c={P} s={46} r={14} />
        <div style={{ fontSize: 16, fontWeight: 700, color: "#3c4a57", lineHeight: 1.4 }}>House 42, Road 8A, Dhanmondi, Dhaka 1209</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <Btn bg={P} h={48} fs={16} icon={I.pin} style={{ flex: 1 }}>
          Directions
        </Btn>
        <Btn bg="#1F9D55" h={48} fs={16} icon={I.chat} style={{ flex: 1 }}>
          WhatsApp
        </Btn>
      </div>
    </div>
  );

  const footer = (
    <div style={{ height: "100%", background: PD, color: "#CFE6E2", padding: m ? `24px ${pad}px` : `30px ${pad}px`, boxSizing: "border-box", display: "flex", flexDirection: m ? "column" : "row", gap: m ? 10 : 0, justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Dr. Shirin Dental Chamber</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>01711-458930 · Dhanmondi, Dhaka</div>
      </div>
      <div style={{ alignSelf: m ? "flex-start" : "flex-end", textAlign: m ? "left" : "right" }}>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>© 2026 Dr. Shirin Dental Chamber</div>
        <Credit c="#9CC9C2" />
      </div>
    </div>
  );

  return (
    <SiteShell
      def={DENTAL}
      mode={mode}
      scroll={scroll}
      reveal={reveal}
      header={header}
      sections={{ hero, treatments, doctor, serial, map, footer }}
      floating={
        <div style={{ position: "absolute", right: m ? 16 : 26, bottom: m ? 16 : 24, width: m ? 56 : 60, height: m ? 56 : 60, borderRadius: 30, background: "#1F9D55", boxShadow: "0 10px 24px rgba(31,157,85,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ic d={I.chat} s={28} c="#fff" w={2.2} />
        </div>
      }
    />
  );
};
