// javeditsolution.com/services/website-development — আসল page-এর তথ্য দিয়ে (package ৳15,000 থেকে, ৪ ধাপ, যোগাযোগ)।
// তথ্যের উৎস: jit-live-19-sep/javeditsolution_app/resources/seo/packages|services/website-development.json
// (owner rule: client সংখ্যা / star rating দেখানো নয়; website কখনো ৳15,000-এর নিচে নয়)
import React from "react";
import { Img, staticFile } from "remotion";
import { SiteDef, SiteProps, SiteShell, Ic, I, Btn, Field, Credit, IconTile, BN } from "./ui";

const NAVY = "#0C3054";
const NAVY2 = "#1B4470";
const OR = "#F5952B";
const DOR = "#D85E24";
const CREAM = "#FBF8F3";

export const JIT: SiteDef = {
  url: "javeditsolution.com/services/website-development",
  header: { desktop: 68, mobile: 62 },
  sections: [
    { key: "hero", h: { desktop: 572, mobile: 700 } },
    { key: "packages", h: { desktop: 600, mobile: 790 } },
    { key: "steps", h: { desktop: 400, mobile: 560 } },
    { key: "contact", h: { desktop: 500, mobile: 780 } },
    { key: "footer", h: { desktop: 150, mobile: 170 } },
  ],
};

const PACKS = [
  { bn: "বেসিক", en: "Basic", p: "৳15,000", f: ["৫–১০ পেজ কাস্টম বিজনেস সাইট", "মোবাইল-রেসপন্সিভ ডিজাইন", "বেসিক SEO + SSL", "কন্টাক্ট ফর্ম ও WhatsApp বাটন"], d: "৭–১৪ দিনে ডেলিভারি" },
  { bn: "ই-কমার্স", en: "E-Commerce", p: "৳30,000", f: ["বেসিক প্যাকেজের সব ফিচার", "কার্ট ও চেকআউট", "bKash/Nagad/কার্ড পেমেন্ট", "অর্ডার ম্যানেজমেন্ট ড্যাশবোর্ড"], d: "৩–৬ সপ্তাহে ডেলিভারি", pop: true },
  { bn: "মাল্টি-ভেন্ডর", en: "Multi-Vendor", p: "৳80,000", f: ["ই-কমার্সের সব ফিচার", "আলাদা ভেন্ডর ড্যাশবোর্ড", "কমিশন ও সেটেলমেন্ট", "প্রায়োরিটি সাপোর্ট"], d: "কাস্টম টাইমলাইন" },
  { bn: "কাস্টম প্ল্যাটফর্ম", en: "Custom Platform", p: "৳2,00,000", f: ["সম্পূর্ণ কাস্টম ওয়েব অ্যাপ", "থার্ড-পার্টি API ইন্টিগ্রেশন", "স্কেলেবল Laravel আর্কিটেকচার", "ডেডিকেটেড প্রজেক্ট ম্যানেজার"], d: "কাস্টম টাইমলাইন" },
];

const STEPS = [
  { en: "Discuss", bn: "আলোচনা ও ফ্রি কোটেশন", s: "আপনার ব্যবসা, পেজ ও ফিচার বুঝে খরচ জানাই", d: I.discuss },
  { en: "Design", bn: "ডিজাইন mockup", s: "আগে ডিজাইন দেখবেন, approve করলে তবেই কাজ", d: I.pen },
  { en: "Develop", bn: "ডেভেলপমেন্ট", s: "স্ক্র্যাচ থেকে কোড, টেমপ্লেট নয়", d: I.code },
  { en: "Launch", bn: "লাইভ ও সাপোর্ট", s: "ডোমেইন-হোস্টিং সেটআপ, ১ বছর ফ্রি সাপোর্ট", d: I.rocket },
];

/** hero-র ডানে: laptop browser + ফোনে একটা বানানো site-এর ছোট mockup */
const DeviceArt: React.FC<{ w: number }> = ({ w }) => {
  const k = w / 440;
  return (
    <div style={{ position: "relative", width: w, height: 340 * k }}>
      <div style={{ position: "absolute", left: 0, top: 14 * k, width: 380 * k, height: 260 * k, borderRadius: 18 * k, background: "#fff", boxShadow: "0 22px 44px rgba(12,48,84,0.18)", overflow: "hidden" }}>
        <div style={{ height: 30 * k, background: "#EEF1F5", display: "flex", alignItems: "center", gap: 6 * k, padding: `0 ${12 * k}px` }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 9 * k, height: 9 * k, borderRadius: 5 * k, background: c }} />
          ))}
          <div style={{ flex: 1, height: 16 * k, marginLeft: 8 * k, borderRadius: 8 * k, background: "#fff", fontSize: 10 * k, fontWeight: 700, color: "#6b7785", display: "flex", alignItems: "center", paddingLeft: 8 * k }}>yourbusiness.com.bd</div>
        </div>
        <div style={{ padding: 16 * k, display: "flex", gap: 14 * k }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22 * k, fontWeight: 800, color: NAVY, lineHeight: 1.1 }}>Your business, open 24/7</div>
            <div style={{ fontFamily: BN, fontSize: 12 * k, fontWeight: 600, color: "#5b6675", marginTop: 6 * k }}>কাস্টমার নিজেই খুঁজে পাবে, কল করবে, অর্ডার দেবে</div>
            <div style={{ display: "flex", gap: 6 * k, marginTop: 12 * k }}>
              <div style={{ height: 26 * k, padding: `0 ${12 * k}px`, borderRadius: 13 * k, background: OR, color: "#fff", fontSize: 11 * k, fontWeight: 800, display: "flex", alignItems: "center" }}>Order now</div>
              <div style={{ height: 26 * k, padding: `0 ${12 * k}px`, borderRadius: 13 * k, boxShadow: `inset 0 0 0 1.5px ${NAVY}`, color: NAVY, fontSize: 11 * k, fontWeight: 800, display: "flex", alignItems: "center" }}>Call</div>
            </div>
          </div>
          <div style={{ width: 130 * k, height: 104 * k, borderRadius: 12 * k, background: "linear-gradient(135deg,#FDE3C4,#F5952B)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 18 * k, bottom: 0, width: 50 * k, height: 70 * k, borderRadius: `${10 * k}px ${10 * k}px 0 0`, background: "#fff", opacity: 0.85 }} />
            <div style={{ position: "absolute", left: 76 * k, bottom: 0, width: 36 * k, height: 48 * k, borderRadius: `${8 * k}px ${8 * k}px 0 0`, background: NAVY, opacity: 0.8 }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 * k, padding: `0 ${16 * k}px` }}>
          {[
            [I.phone, "Call"],
            [I.pin, "Map"],
            [I.chat, "Chat"],
          ].map(([d, t]) => (
            <div key={t as string} style={{ height: 56 * k, borderRadius: 10 * k, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 * k, fontSize: 12 * k, fontWeight: 800, color: NAVY }}>
              <Ic d={d as string | string[]} s={16 * k} c={DOR} /> {t as string}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 0, bottom: 0, width: 116 * k, height: 236 * k, borderRadius: 22 * k, background: "#1d2026", padding: 5 * k, boxSizing: "border-box", boxShadow: "0 18px 36px rgba(12,48,84,0.25)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 17 * k, background: "#fff", overflow: "hidden", padding: 10 * k, boxSizing: "border-box" }}>
          <div style={{ width: 34 * k, height: 8 * k, borderRadius: 4 * k, background: "#1d2026", margin: `0 auto ${10 * k}px` }} />
          <div style={{ fontSize: 13 * k, fontWeight: 800, color: NAVY, lineHeight: 1.15 }}>Your business, open 24/7</div>
          <div style={{ height: 64 * k, borderRadius: 9 * k, background: "linear-gradient(135deg,#FDE3C4,#F5952B)", marginTop: 8 * k }} />
          <div style={{ height: 22 * k, borderRadius: 11 * k, background: OR, marginTop: 8 * k, color: "#fff", fontSize: 10 * k, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>Order now</div>
          <div style={{ display: "flex", gap: 5 * k, marginTop: 8 * k }}>
            {[I.phone, I.pin, I.chat].map((d, i) => (
              <div key={i} style={{ flex: 1, height: 28 * k, borderRadius: 7 * k, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic d={d} s={13 * k} c={DOR} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Logo: React.FC<{ m: boolean }> = ({ m }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <Img src={staticFile("ref/jit-logo-alpha.png")} style={{ width: m ? 38 : 42, height: m ? 38 : 42, objectFit: "contain" }} />
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontSize: m ? 18 : 20, fontWeight: 800, color: NAVY }}>Javed IT</div>
      <div style={{ fontSize: m ? 11 : 12, fontWeight: 800, color: DOR, letterSpacing: 2 }}>SOLUTION</div>
    </div>
  </div>
);

export const JitSite: React.FC<SiteProps> = ({ mode, scroll = 0, reveal = 1 }) => {
  const m = mode === "mobile";
  const pad = m ? 18 : 48;

  const header = m ? (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 12, background: CREAM }}>
      <Logo m />
      <div style={{ marginLeft: "auto", width: 42, height: 42, borderRadius: 21, background: "#FDEBD6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ic d={I.phone} s={20} c={DOR} />
      </div>
      <Ic d={I.menu} s={28} c={NAVY} w={2.4} />
    </div>
  ) : (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 26, background: CREAM }}>
      <Logo m={false} />
      <div style={{ display: "flex", gap: 22, marginLeft: 20, fontSize: 16, fontWeight: 700, color: "#3c4a57" }}>
        <span>Home</span>
        <span style={{ color: DOR }}>Website</span>
        <span>SEO</span>
        <span>AI Chatbot</span>
        <span>Contact</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: NAVY }}>
        <Ic d={I.phone} s={18} c={DOR} /> 01616-901396
      </div>
      <Btn bg={OR} h={42} fs={15} px={18}>
        <span style={{ fontFamily: BN }}>ফ্রি কোটেশন</span>
      </Btn>
    </div>
  );

  const hero = (
    <div style={{ height: "100%", background: `radial-gradient(circle at 80% 40%, #FDE9D2 0%, ${CREAM} 52%)`, padding: m ? `24px ${pad}px 0` : `42px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 22 : 30 }}>
      <div style={{ flex: m ? "none" : 1.1, paddingTop: m ? 0 : 12 }}>
        <div style={{ fontSize: m ? 14 : 15, fontWeight: 700, color: "#6b7785", display: "flex", alignItems: "center", gap: 6 }}>
          Home <Ic d={I.chevR} s={14} c="#9aa3ad" /> Services <Ic d={I.chevR} s={14} c="#9aa3ad" /> <span style={{ color: DOR }}>Website Development</span>
        </div>
        <div style={{ fontFamily: BN, fontSize: m ? 34 : 44, lineHeight: 1.2, fontWeight: 700, color: NAVY, marginTop: 12 }}>
          কাস্টম ওয়েবসাইট ডেভেলপমেন্ট <span style={{ color: DOR }}>বাংলাদেশ</span>
        </div>
        <div style={{ fontFamily: BN, fontSize: m ? 17 : 19, lineHeight: 1.55, color: "#4d5a67", fontWeight: 600, marginTop: 12 }}>
          দ্রুত, mobile-first, SEO-রেডি সাইট — শুরু <b style={{ color: NAVY }}>৳১৫,০০০</b> থেকে। ঢাকা ও বিদেশের ক্লায়েন্টের জন্য।
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: m ? 18 : 24 }}>
          <Btn bg={OR} h={m ? 52 : 54} fs={m ? 17 : 18} icon={I.arrowR} style={{ flex: m ? 1 : undefined }}>
            <span style={{ fontFamily: BN }}>ফ্রি কোটেশন নিন</span>
          </Btn>
          <Btn bg={NAVY} outline h={m ? 52 : 54} fs={m ? 17 : 18} icon={I.phone} style={{ flex: m ? 1 : undefined }}>
            {m ? <span style={{ fontFamily: BN }}>কল করুন</span> : "01616-901396"}
          </Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr 1fr" : "1fr 1fr 1fr", gap: m ? 8 : 14, marginTop: m ? 18 : 28 }}>
          {[
            { d: I.clock, t: "৭–১৪ দিনে live" },
            { d: I.shield, t: "১ বছর ফ্রি সাপোর্ট" },
            { d: I.code, t: "সোর্স কোড আপনার" },
          ].map((x) => (
            <div key={x.t} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 14, padding: m ? "10px 8px" : "12px 12px", boxShadow: "0 6px 16px rgba(12,48,84,0.06)", flexDirection: m ? "column" : "row", textAlign: "center" }}>
              <Ic d={x.d} s={m ? 20 : 22} c={DOR} />
              <span style={{ fontFamily: BN, fontSize: m ? 13 : 15, fontWeight: 700, color: NAVY }}>{x.t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: m ? "none" : 1, display: "flex", justifyContent: "center", paddingTop: m ? 0 : 30 }}>
        <DeviceArt w={m ? 330 : 420} />
      </div>
    </div>
  );

  const packages = (
    <div style={{ height: "100%", background: "#fff", padding: m ? `26px ${pad}px 0` : `38px ${pad}px 0` }}>
      <div style={{ textAlign: m ? "left" : "center" }}>
        <div style={{ fontFamily: BN, fontSize: m ? 28 : 36, fontWeight: 700, color: NAVY }}>প্যাকেজ ও দাম</div>
        <div style={{ fontFamily: BN, fontSize: m ? 15 : 17, color: "#5b6675", fontWeight: 600, marginTop: 2 }}>স্ক্র্যাচ থেকে কাস্টম, SEO-রেডি ওয়েবসাইট · ৫০% অগ্রিম, ৫০% ডেলিভারিতে</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4,1fr)", gap: m ? 10 : 14, marginTop: m ? 16 : 24 }}>
        {PACKS.map((x) => {
          const pop = !!x.pop;
          return (
            <div key={x.en} style={{ borderRadius: 22, background: pop ? NAVY : CREAM, color: pop ? "#fff" : NAVY, padding: m ? "14px 12px" : "18px 16px", height: m ? 318 : 450, boxSizing: "border-box", display: "flex", flexDirection: "column", boxShadow: pop ? "0 18px 36px rgba(12,48,84,0.28)" : "inset 0 0 0 1.5px #EFE6DA", position: "relative", overflow: "hidden" }}>
              {pop && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6, background: OR }} />}
              <div style={{ fontFamily: BN, fontSize: m ? 18 : 21, fontWeight: 700 }}>{x.bn}</div>
              <div style={{ fontSize: m ? 12 : 13, fontWeight: 700, opacity: 0.65 }}>{pop ? "Most popular" : x.en}</div>
              <div style={{ fontSize: m ? 24 : 30, fontWeight: 800, color: pop ? OR : DOR, marginTop: m ? 8 : 12 }}>{x.p}</div>
              <div style={{ fontFamily: BN, fontSize: m ? 13 : 14, fontWeight: 700, opacity: 0.7 }}>থেকে শুরু</div>
              <div style={{ display: "flex", flexDirection: "column", gap: m ? 6 : 10, marginTop: m ? 10 : 16 }}>
                {(m ? x.f.slice(0, 3) : x.f).map((f) => (
                  <div key={f} style={{ display: "flex", gap: 7, alignItems: "flex-start", fontFamily: BN, fontSize: m ? 13 : 15, fontWeight: 600, lineHeight: 1.35 }}>
                    <Ic d={I.check} s={m ? 15 : 17} c={pop ? OR : "#1F9D55"} w={3} style={{ marginTop: 2 }} />
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontFamily: BN, fontSize: m ? 12 : 14, fontWeight: 700, opacity: 0.75, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                  <Ic d={I.clock} s={14} c="currentColor" /> {x.d}
                </div>
                <Btn bg={pop ? OR : NAVY} h={m ? 40 : 44} fs={m ? 14 : 15} full r={12} style={{ boxShadow: "none" }}>
                  <span style={{ fontFamily: BN }}>কোটেশন নিন</span>
                </Btn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const steps = (
    <div style={{ height: "100%", background: NAVY, color: "#fff", padding: m ? `26px ${pad}px 0` : `38px ${pad}px 0` }}>
      <div style={{ fontFamily: BN, fontSize: m ? 28 : 34, fontWeight: 700 }}>কাজ হয় ৪ ধাপে</div>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4,1fr)", gap: m ? 10 : 16, marginTop: m ? 16 : 24, position: "relative" }}>
        {!m && <div style={{ position: "absolute", left: 60, right: 60, top: 34, height: 3, background: "repeating-linear-gradient(90deg, rgba(245,149,43,0.7) 0 10px, transparent 10px 18px)" }} />}
        {STEPS.map((x, i) => (
          <div key={x.en} style={{ background: m ? "rgba(255,255,255,0.07)" : "transparent", borderRadius: 18, padding: m ? 14 : 0, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: m ? 48 : 68, height: m ? 48 : 68, borderRadius: m ? 24 : 34, background: i === 0 ? OR : NAVY2, boxShadow: `0 0 0 ${m ? 0 : 6}px ${NAVY}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Ic d={x.d} s={m ? 22 : 30} c="#fff" w={2.1} />
              </div>
              <div style={{ fontSize: m ? 26 : 34, fontWeight: 800, color: "rgba(255,255,255,0.18)" }}>0{i + 1}</div>
            </div>
            <div style={{ fontSize: m ? 14 : 15, fontWeight: 800, color: OR, marginTop: m ? 10 : 16, letterSpacing: 1 }}>{x.en.toUpperCase()}</div>
            <div style={{ fontFamily: BN, fontSize: m ? 17 : 20, fontWeight: 700, marginTop: 2 }}>{x.bn}</div>
            <div style={{ fontFamily: BN, fontSize: m ? 13 : 15, fontWeight: 600, color: "#BCD0E6", marginTop: 4, lineHeight: 1.45 }}>{x.s}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const contact = (
    <div style={{ height: "100%", background: CREAM, padding: m ? `26px ${pad}px 0` : `38px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 16 : 34 }}>
      <div style={{ flex: m ? "none" : 0.9 }}>
        <div style={{ fontFamily: BN, fontSize: m ? 28 : 34, fontWeight: 700, color: NAVY }}>আজই ফ্রি কোটেশন নিন</div>
        <div style={{ fontFamily: BN, fontSize: m ? 15 : 17, fontWeight: 600, color: "#5b6675", marginTop: 4 }}>ছোট একটা আলোচনার পর খরচ জানিয়ে দিই — কোনো চার্জ নেই</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: m ? 14 : 20 }}>
          {[
            { d: I.phone, t: "01616-901396", s: "Call · সকাল ১০টা – রাত ১০টা", c: DOR, bg: "#FDEBD6" },
            { d: I.chat, t: "WhatsApp", s: "01616-901396", c: "#1F9D55", bg: "#DDF3E6" },
            { d: I.mail, t: "ceo@javeditsolution.com", s: "Email", c: NAVY2, bg: "#E3EBF5" },
            { d: I.pin, t: "Mirpur-1, Dhaka", s: "অফিসে এসে কথা বলতে পারেন", c: NAVY2, bg: "#E3EBF5" },
          ].map((x) => (
            <div key={x.t} style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", borderRadius: 16, padding: m ? "10px 12px" : "11px 14px", boxShadow: "0 6px 14px rgba(12,48,84,0.05)" }}>
              <IconTile d={x.d} bg={x.bg} c={x.c} s={m ? 42 : 44} r={13} />
              <div>
                <div style={{ fontSize: m ? 16 : 17, fontWeight: 800, color: NAVY }}>{x.t}</div>
                <div style={{ fontFamily: BN, fontSize: m ? 13 : 14, fontWeight: 600, color: "#6b7785" }}>{x.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, background: "#fff", borderRadius: 22, padding: m ? 16 : 22, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 16px 38px rgba(12,48,84,0.10)", alignSelf: "flex-start", width: m ? undefined : "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="আপনার নাম" value="Kamrul Islam" icon={I.user} />
          <Field label="মোবাইল" value="01822-470193" icon={I.phone} />
        </div>
        <Field label="কেমন website" value="Business website (5–10 pages)" select icon={I.globe} />
        <Field label="বাজেট" value="৳15,000 – ৳30,000" select />
        <div style={{ fontFamily: BN, fontSize: 13, fontWeight: 700, color: "#5b6675" }}>পেমেন্ট: bKash · Nagad · Rocket · ব্যাংক</div>
        <Btn bg={OR} h={52} fs={18} full r={14} icon={I.arrowR}>
          <span style={{ fontFamily: BN }}>কোটেশন চাই</span>
        </Btn>
      </div>
    </div>
  );

  const footer = (
    <div style={{ height: "100%", background: "#081F38", color: "#A9BCD2", padding: m ? `24px ${pad}px` : `30px ${pad}px`, boxSizing: "border-box", display: "flex", flexDirection: m ? "column" : "row", gap: m ? 10 : 0, justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Javed IT Solution</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>01616-901396 · Mirpur-1, Dhaka · since 2020</div>
      </div>
      <div style={{ alignSelf: m ? "flex-start" : "flex-end", textAlign: m ? "left" : "right" }}>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>© 2026 Javed IT Solution</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Website · SEO · AI Automation</div>
      </div>
    </div>
  );

  return (
    <SiteShell
      def={JIT}
      mode={mode}
      scroll={scroll}
      reveal={reveal}
      bg={CREAM}
      headerBg={CREAM}
      header={header}
      sections={{ hero, packages, steps, contact, footer }}
      floating={
        <div style={{ position: "absolute", right: m ? 16 : 26, bottom: m ? 16 : 24, width: m ? 56 : 60, height: m ? 56 : 60, borderRadius: 30, background: "#1F9D55", boxShadow: "0 10px 24px rgba(31,157,85,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ic d={I.chat} s={28} c="#fff" w={2.2} />
        </div>
      }
    />
  );
};
