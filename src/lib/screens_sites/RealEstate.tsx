// Green Nest Properties — ঢাকার flat listing website (search hero, listing cards, flat detail + gallery, enquiry form)
import React from "react";
import { SiteDef, SiteProps, SiteShell, Ic, I, Btn, Field, Credit, IconTile, BN } from "./ui";

const P = "#14532D"; // forest green
const PD = "#0F1F17";
const GOLD = "#C8A04A";
const MIST = "#F3F5F1";

export const REALESTATE: SiteDef = {
  url: "greennestbd.com",
  header: { desktop: 68, mobile: 62 },
  sections: [
    { key: "hero", h: { desktop: 572, mobile: 690 } },
    { key: "listings", h: { desktop: 560, mobile: 860 } },
    { key: "detail", h: { desktop: 540, mobile: 760 } },
    { key: "enquiry", h: { desktop: 470, mobile: 660 } },
    { key: "footer", h: { desktop: 150, mobile: 170 } },
  ],
};

/** apartment building — রং, তলা, বারান্দা, গাছ, আকাশ */
const Building: React.FC<{ w: number; h: number; wall?: string; trim?: string; floors?: number; sky?: [string, string]; dusk?: boolean }> = ({ w, h, wall = "#EDE6DA", trim = "#8C6A4A", floors = 9, sky = ["#CFE6F5", "#F4EEE4"], dusk }) => {
  const fh = 260 / floors;
  const id = `sky${wall.slice(1)}${floors}${dusk ? 1 : 0}`;
  return (
    <svg width={w} height={h} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id})`} />
      <circle cx="330" cy="60" r="26" fill={dusk ? "#FFC56E" : "#fff"} opacity={dusk ? 0.9 : 0.7} />
      {/* back towers */}
      <rect x="20" y="110" width="70" height="190" fill="#C9D3D8" opacity="0.7" />
      <rect x="300" y="90" width="80" height="210" fill="#C2CDD3" opacity="0.7" />
      {/* main */}
      <rect x="110" y={300 - floors * fh - 14} width="180" height={floors * fh + 14} fill={wall} />
      <rect x="104" y={300 - floors * fh - 22} width="192" height="12" rx="3" fill={trim} />
      {Array.from({ length: floors }).map((_, f) => {
        const y = 300 - (f + 1) * fh;
        return (
          <g key={f}>
            {[124, 188, 238].map((x, i) => (
              <rect key={x} x={x} y={y + fh * 0.18} width={i === 1 ? 40 : 34} height={fh * 0.56} rx="2" fill={dusk && (f + i) % 3 === 0 ? "#FFD98A" : "#7FA6BD"} />
            ))}
            <rect x="180" y={y + fh * 0.72} width="56" height={fh * 0.12} rx="2" fill={trim} />
            <rect x="110" y={y + fh - 2} width="180" height="2" fill="rgba(0,0,0,0.06)" />
          </g>
        );
      })}
      <rect x="182" y="270" width="36" height="30" fill={trim} />
      {/* trees */}
      {[[70, 262, 30], [330, 266, 28], [100, 276, 18], [300, 280, 16]].map(([x, y, r], i) => (
        <g key={i}>
          <rect x={x - 3} y={y} width="6" height={300 - y} fill="#6B4F36" />
          <circle cx={x} cy={y - r * 0.4} r={r} fill={i % 2 ? "#4F9A5C" : "#3E8A4F"} />
        </g>
      ))}
      <rect x="0" y="292" width="400" height="8" fill="#C9C2B5" />
    </svg>
  );
};

const LISTINGS = [
  { n: "Green Nest Lake View", loc: "Bashundhara R/A, Block D", price: "৳1.35 Cr", sft: "1,450", bed: 3, bath: 3, wall: "#EDE6DA", trim: "#8C6A4A", floors: 9, status: "Ready" },
  { n: "Nest Orchid", loc: "Mohammadpur, Iqbal Road", price: "৳78 Lac", sft: "1,120", bed: 3, bath: 2, wall: "#E4EBE6", trim: "#2F6B4F", floors: 8, status: "Handover Jun 2027" },
  { n: "Nest Skyline", loc: "Uttara, Sector 15", price: "৳96 Lac", sft: "1,280", bed: 3, bath: 3, wall: "#F1E9E1", trim: "#9A4E3A", floors: 10, status: "Ready", dusk: true },
];

const Logo: React.FC<{ m: boolean }> = ({ m }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: m ? 38 : 42, height: m ? 38 : 42, borderRadius: 12, background: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Ic d={I.building} s={m ? 21 : 23} c={GOLD} w={2} />
    </div>
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontSize: m ? 19 : 21, fontWeight: 800, color: PD }}>Green Nest</div>
      <div style={{ fontSize: m ? 11 : 12, fontWeight: 800, color: GOLD, letterSpacing: 2.2 }}>PROPERTIES LTD.</div>
    </div>
  </div>
);

const Specs: React.FC<{ bed: number; bath: number; sft: string; fs?: number }> = ({ bed, bath, sft, fs = 15 }) => (
  <div style={{ display: "flex", gap: 14, fontSize: fs, fontWeight: 700, color: "#4a564f" }}>
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <Ic d={I.bed} s={fs + 3} c={P} /> {bed} Bed
    </span>
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <Ic d={I.bath} s={fs + 3} c={P} /> {bath} Bath
    </span>
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <Ic d={I.ruler} s={fs + 3} c={P} /> {sft} sft
    </span>
  </div>
);

export const RealEstateSite: React.FC<SiteProps> = ({ mode, scroll = 0, reveal = 1 }) => {
  const m = mode === "mobile";
  const pad = m ? 18 : 48;

  const header = m ? (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 14 }}>
      <Logo m />
      <div style={{ marginLeft: "auto" }}>
        <Ic d={I.heart} s={24} c={PD} w={2.2} />
      </div>
      <Ic d={I.menu} s={28} c={PD} w={2.4} />
    </div>
  ) : (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 28 }}>
      <Logo m={false} />
      <div style={{ display: "flex", gap: 24, marginLeft: 24, fontSize: 16, fontWeight: 700, color: "#3d4a43" }}>
        <span style={{ color: P }}>Buy</span>
        <span>Ongoing</span>
        <span>Ready Flats</span>
        <span>Land Owners</span>
        <span>About</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: PD }}>
        <Ic d={I.phone} s={18} c={P} /> 09611-447700
      </div>
      <Btn bg={P} h={42} fs={15} px={18}>
        Book a Visit
      </Btn>
    </div>
  );

  const search = (
    <div style={{ background: "#fff", borderRadius: 20, padding: m ? 12 : 14, boxShadow: "0 18px 40px rgba(15,31,23,0.18)", display: "flex", flexDirection: m ? "column" : "row", gap: m ? 10 : 12, alignItems: m ? "stretch" : "flex-end" }}>
      <div style={{ flex: 1.2 }}>
        <Field label="Location" value="Bashundhara R/A" icon={I.pin} select />
      </div>
      <div style={{ display: "flex", gap: 10, flex: m ? "none" : 1.6 }}>
        <div style={{ flex: 1 }}>
          <Field label="Size" value="3 Bed" icon={I.bed} select />
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Budget" value="৳80L – 1.5Cr" select />
        </div>
      </div>
      <Btn bg={GOLD} c={PD} h={48} fs={17} r={12} icon={I.search} style={{ boxShadow: "none" }}>
        Search
      </Btn>
    </div>
  );
  const hero = (
    <div style={{ height: "100%", position: "relative", background: PD }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.9 }}>
        <Building w={m ? 390 : 1024} h={m ? 690 : 572} floors={12} wall="#E8E1D4" trim="#6E5A44" sky={["#9CC3DD", "#F1E6D6"]} dusk />
      </div>
      <div style={{ position: "absolute", inset: 0, background: m ? "linear-gradient(180deg, rgba(15,31,23,0.82) 0%, rgba(15,31,23,0.55) 46%, rgba(15,31,23,0.1) 100%)" : "linear-gradient(90deg, rgba(15,31,23,0.85) 0%, rgba(15,31,23,0.55) 50%, rgba(15,31,23,0.05) 100%)" }} />
      <div style={{ position: "relative", padding: m ? `28px ${pad}px 0` : `60px ${pad}px 0`, color: "#fff", width: m ? undefined : 560 }}>
        <div style={{ fontSize: m ? 15 : 16, fontWeight: 800, color: GOLD, letterSpacing: 1.6 }}>RAJUK APPROVED · READY & ONGOING</div>
        <div style={{ fontSize: m ? 36 : 50, fontWeight: 800, lineHeight: 1.05, marginTop: 10, letterSpacing: -1 }}>Find a flat your family will love coming home to</div>
        <div style={{ fontFamily: BN, fontSize: m ? 16 : 18, fontWeight: 600, color: "#D7E3DB", marginTop: 12 }}>বসুন্ধরা, উত্তরা, মোহাম্মদপুরে ১,১০০–১,৮০০ sft — সহজ কিস্তিতে</div>
      </div>
      <div style={{ position: m ? "relative" : "absolute", left: m ? undefined : pad, right: m ? undefined : pad, bottom: m ? undefined : 40, padding: m ? `22px ${pad}px 0` : 0 }}>{search}</div>
    </div>
  );

  const items = m ? LISTINGS.slice(0, 2) : LISTINGS;
  const listings = (
    <div style={{ height: "100%", background: MIST, padding: m ? `26px ${pad}px 0` : `40px ${pad}px 0` }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: m ? 28 : 36, fontWeight: 800, color: PD, letterSpacing: -0.5 }}>Featured flats</div>
          <div style={{ fontSize: m ? 15 : 17, fontWeight: 600, color: "#5e6a63" }}>Prices include car parking & utility connection</div>
        </div>
        {!m && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 800, color: P }}>
            View all 24 <Ic d={I.arrowR} s={18} c={P} />
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr 1fr", gap: m ? 16 : 18, marginTop: m ? 16 : 22 }}>
        {items.map((x, i) => (
          <div key={x.n} style={{ background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: "0 10px 26px rgba(15,31,23,0.08)" }}>
            <div style={{ position: "relative", height: m ? 200 : 190 }}>
              <Building w={m ? 354 : 280} h={m ? 200 : 190} wall={x.wall} trim={x.trim} floors={x.floors} dusk={x.dusk} />
              <div style={{ position: "absolute", left: 12, top: 12, background: x.status === "Ready" ? P : "#fff", color: x.status === "Ready" ? "#fff" : PD, fontSize: 13, fontWeight: 800, borderRadius: 8, padding: "5px 9px" }}>{x.status}</div>
              <div style={{ position: "absolute", right: 12, top: 12, width: 34, height: 34, borderRadius: 17, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic d={I.heart} s={17} c={i === 0 ? "#D9443B" : "#4a564f"} fill={i === 0 ? "#D9443B" : "none"} />
              </div>
            </div>
            <div style={{ padding: m ? "14px 16px 16px" : "14px 16px 16px" }}>
              <div style={{ fontSize: m ? 24 : 24, fontWeight: 800, color: P }}>{x.price}</div>
              <div style={{ fontSize: m ? 18 : 17, fontWeight: 800, color: PD, marginTop: 2 }}>{x.n}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 600, color: "#6b766f", marginTop: 4 }}>
                <Ic d={I.pin} s={15} c="#6b766f" /> {x.loc}
              </div>
              <div style={{ height: 1, background: "#EEF1EC", margin: "12px 0" }} />
              <Specs bed={x.bed} bath={x.bath} sft={x.sft} fs={m ? 15 : 14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const L = LISTINGS[0];
  const gallery = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: m ? undefined : 470 }}>
      <div style={{ borderRadius: 22, overflow: "hidden", height: m ? 230 : 300, position: "relative" }}>
        <Building w={m ? 354 : 470} h={m ? 230 : 300} wall={L.wall} trim={L.trim} floors={9} sky={["#BFDDF0", "#F6EFE3"]} />
        <div style={{ position: "absolute", right: 12, bottom: 12, background: "rgba(15,31,23,0.75)", color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }}>
          <Ic d={I.video} s={15} c="#fff" /> 1 / 14
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[
          ["#E9DFD0", "#B9A07F"],
          ["#DDE7E1", "#4E7A63"],
          ["#EFE5DA", "#9A4E3A"],
          ["#E3E8EE", "#506A85"],
        ].map(([w, t], i) => (
          <div key={i} style={{ flex: 1, height: m ? 62 : 74, borderRadius: 12, overflow: "hidden", boxShadow: i === 0 ? `0 0 0 3px ${GOLD}` : "none" }}>
            {i === 0 ? (
              <Building w={m ? 80 : 110} h={m ? 62 : 74} wall={L.wall} trim={L.trim} floors={9} />
            ) : (
              <svg width="100%" height="100%" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice">
                <rect width="100" height="70" fill={w} />
                <rect x="0" y="48" width="100" height="22" fill="#CDBBA2" />
                <rect x="58" y="12" width="30" height="24" rx="2" fill="#BFDDF0" stroke="#fff" strokeWidth="2" />
                <rect x="10" y="34" width="38" height="18" rx="5" fill={t} />
                <rect x="10" y="28" width="38" height="10" rx="5" fill={t} opacity="0.75" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  const detail = (
    <div style={{ height: "100%", background: "#fff", padding: m ? `26px ${pad}px 0` : `40px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 16 : 34 }}>
      {gallery}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: m ? 15 : 16, fontWeight: 700, color: "#6b766f", display: "flex", alignItems: "center", gap: 6 }}>
          <Ic d={I.pin} s={16} c={P} /> {L.loc}
        </div>
        <div style={{ fontSize: m ? 26 : 32, fontWeight: 800, color: PD, marginTop: 6, letterSpacing: -0.5 }}>{L.n} — Unit 6B</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
          <div style={{ fontSize: m ? 30 : 34, fontWeight: 800, color: P }}>৳1.35 Crore</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#6b766f" }}>৳9,300 / sft</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Specs bed={3} bath={3} sft="1,450" fs={m ? 15 : 16} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: m ? 10 : 12, marginTop: m ? 14 : 18 }}>
          {[
            { d: I.car, t: "1 car parking" },
            { d: I.lift, t: "2 lifts + generator" },
            { d: I.shield, t: "24/7 security, CCTV" },
            { d: I.sparkle, t: "South-facing, lake view" },
          ].map((x) => (
            <div key={x.t} style={{ display: "flex", alignItems: "center", gap: 10, background: MIST, borderRadius: 14, padding: "10px 12px", fontSize: m ? 14 : 15, fontWeight: 700, color: "#33403a" }}>
              <Ic d={x.d} s={20} c={P} /> {x.t}
            </div>
          ))}
        </div>
        <div style={{ marginTop: m ? 14 : 18, display: "flex", alignItems: "center", gap: 12, background: "#FBF6EA", borderRadius: 16, padding: "12px 14px" }}>
          <IconTile d={I.cash} bg="#fff" c={GOLD} s={42} r={12} />
          <div style={{ fontSize: m ? 14 : 15, fontWeight: 700, color: "#4a4030", lineHeight: 1.4 }}>
            Booking ৳10 Lac · rest in 24 easy installments
            <div style={{ fontFamily: BN, fontSize: 14, color: "#7a6a4a" }}>হোম লোনের ব্যবস্থাও আছে</div>
          </div>
        </div>
      </div>
    </div>
  );

  const enquiry = (
    <div style={{ height: "100%", background: P, padding: m ? `26px ${pad}px 0` : `40px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 16 : 36, color: "#fff" }}>
      <div style={{ flex: m ? "none" : 0.85 }}>
        <div style={{ fontSize: m ? 28 : 36, fontWeight: 800, letterSpacing: -0.5 }}>Visit the flat this weekend</div>
        <div style={{ fontFamily: BN, fontSize: m ? 16 : 18, fontWeight: 600, color: "#CFE3D6", marginTop: 8, lineHeight: 1.5 }}>ফর্ম পূরণ করুন — আমাদের প্রতিনিধি ৩০ মিনিটের মধ্যে কল করবেন।</div>
        {!m && (
          <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.08)", borderRadius: 18, padding: "14px 16px" }}>
            <div style={{ width: 54, height: 54, borderRadius: 27, background: "#E8D2B0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic d={I.user} s={28} c="#6E5A44" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Tanvir Hasan</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#CFE3D6" }}>Sales Manager · 01847-305612</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, background: "#fff", borderRadius: 22, padding: m ? 16 : 22, color: PD, display: "flex", flexDirection: "column", gap: 12, alignSelf: "flex-start", width: m ? undefined : "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Your name" value="Mahmudul Karim" icon={I.user} />
          <Field label="Mobile" value="01755-904218" icon={I.phone} />
        </div>
        <Field label="Interested in" value="Green Nest Lake View — 6B" select icon={I.building} />
        <Field label="Preferred visit" value="Sat, 22 Nov · 11:00 AM" icon={I.cal} select />
        <Btn bg={GOLD} c={PD} h={52} fs={18} full r={14} icon={I.arrowR} style={{ boxShadow: "none" }}>
          Send enquiry
        </Btn>
      </div>
    </div>
  );

  const footer = (
    <div style={{ height: "100%", background: PD, color: "#AFC2B6", padding: m ? `24px ${pad}px` : `30px ${pad}px`, boxSizing: "border-box", display: "flex", flexDirection: m ? "column" : "row", gap: m ? 10 : 0, justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Green Nest Properties Ltd.</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>Hotline 09611-447700 · Gulshan Avenue, Dhaka</div>
      </div>
      <div style={{ alignSelf: m ? "flex-start" : "flex-end", textAlign: m ? "left" : "right" }}>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>© 2026 Green Nest Properties · REHAB member</div>
        <Credit c="#8FA699" />
      </div>
    </div>
  );

  return <SiteShell def={REALESTATE} mode={mode} scroll={scroll} reveal={reveal} headerBg="#fff" header={header} sections={{ hero, listings, detail, enquiry, footer }} />;
};
