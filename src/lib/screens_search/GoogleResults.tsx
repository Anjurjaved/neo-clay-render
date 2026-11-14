// Google search results — mobile (390×843) + desktop (1024×700). No ads, organic list only.
// Rank animation: every result has `pos` (0 = top, may be fractional while moving) — rows are absolutely placed,
// so a spring on `pos` gives a real climb with overshoot. `mine` row can be highlighted (Your Shop).
import React from "react";
import { StatusBar } from "../../kit/Device";
import { GWord } from "../../kit/ui/Google";
import { GSANS as SANS, BN, Rich, Seg, IcSearch, IcMic, IcLens, IcX, IcDots, IcMenu, IcApps, IcGear, Stars, Fav, HomeBar, clamp01 } from "./ui";

export type GResult = {
  id: string;
  site: string; // display name
  url: string; // breadcrumb url
  fav: [string, string]; // [bg colour, letter]
  title: string;
  snippet: Seg[];
  rating?: [number, number]; // [stars, reviews]
  mine?: boolean;
};

export const SYLHET_DENTIST: GResult[] = [
  {
    id: "sdc",
    site: "Sylhet Dental Care",
    url: "https://sylhetdentalcare.com",
    fav: ["#2F7D6D", "S"],
    title: "Sylhet Dental Care | Amberkhana, Sylhet",
    snippet: [{ t: "আম্বরখানায় দাঁতের সব চিকিৎসা। সকাল ১০টা থেকে রাত ৮টা, শুক্রবার বন্ধ।" }],
  },
  {
    id: "dir",
    site: "DoctorBD",
    url: "https://doctorbd.com.bd › dentist › sylhet",
    fav: ["#3B6FB6", "D"],
    title: "Best Dentist in Sylhet — 48 Doctors List & Chamber",
    snippet: [{ t: "সিলেটের ৪৮ জন dentist-এর chamber, ফি ও সময়সূচি এক জায়গায়।" }],
  },
  {
    id: "smile",
    site: "Facebook",
    url: "https://facebook.com › smiledentalsylhet",
    fav: ["#55606E", "f"],
    title: "Smile Dental Clinic - Chowhatta | Facebook",
    snippet: [{ t: "Smile Dental Clinic, Chowhatta. 2.1K likes · 36 talking about this." }],
  },
  {
    id: "mine",
    site: "Dr. Shirin Dental Chamber",
    url: "https://drshirindental.com › serial",
    fav: ["#F5952B", "S"],
    title: "Dr. Shirin Dental Chamber — Zindabazar, Sylhet",
    snippet: [{ t: "রুট ক্যানেল, স্কেলিং, ব্রেস। " }, { t: "অনলাইনে সিরিয়াল দিন", b: true }, { t: " — ২ মিনিটে confirm SMS।" }],
    rating: [4.8, 126],
    mine: true,
  },
  {
    id: "mag",
    site: "Popular Diagnostic",
    url: "https://populardiagnostic.com › sylhet",
    fav: ["#8A4FB0", "P"],
    title: "Dental Unit — Popular Diagnostic Centre, Sylhet",
    snippet: [{ t: "Dental consultation, X-ray and scaling at Nayasarak branch." }],
  },
];

export type GResultsProps = {
  query: string;
  caret?: boolean;
  suggest?: number; // 0..1 suggestion dropdown visibility (while typing)
  suggestions?: string[];
  loading?: number; // 0..1 progress of the blue loading line; <0 = hidden
  results?: GResult[];
  pos?: Record<string, number>; // id → rank position (fractional ok); default = array order
  reveal?: number; // 0..1 staggered fade-in of rows
  scroll?: number; // px
  highlight?: number; // 0..1 Your Shop glow
};

const DEFAULT_SUGG = ["dentist sylhet", "dentist sylhet zindabazar", "dentist sylhet near me", "dentist sylhet online serial"];

const SuggestRow: React.FC<{ q: string; s: string; fs: number; pad: string }> = ({ q, s, fs, pad }) => {
  const k = s.toLowerCase().startsWith(q.toLowerCase()) ? q.length : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: pad }}>
      <IcSearch s={fs + 2} c="#70757a" />
      <div style={{ fontSize: fs, color: "#202124", flex: 1 }}>
        {s.slice(0, k)}
        <b style={{ fontWeight: 700 }}>{s.slice(k)}</b>
      </div>
      <svg width={fs} height={fs} viewBox="0 0 24 24" fill="none" stroke="#70757a" strokeWidth="2" strokeLinecap="round">
        <path d="M6 18L18 6M9 6h9v9" />
      </svg>
    </div>
  );
};

const rowStyle = (mine: boolean | undefined, hl: number, k: number): React.CSSProperties => ({
  opacity: k,
  background: mine ? `rgb(255,${Math.round(255 - 11 * hl)},${Math.round(255 - 25 * hl)})` : "transparent",
  boxShadow: mine && hl > 0 ? `inset 0 0 0 ${2 * hl}px rgba(245,149,43,${0.85 * hl}), 0 ${8 * hl}px ${22 * hl}px rgba(216,94,36,${0.18 * hl})` : undefined,
});

/* ======================= MOBILE ======================= */
const M_ROW = 186;
export const GoogleResultsMobile: React.FC<GResultsProps> = ({ query, caret, suggest = 0, suggestions = DEFAULT_SUGG, loading = -1, results = SYLHET_DENTIST, pos, reveal = 1, scroll = 0, highlight = 0 }) => {
  const P = (r: GResult, i: number) => pos?.[r.id] ?? i;
  const order = [...results].sort((a, b) => (a.mine ? 1 : 0) - (b.mine ? 1 : 0)); // mine painted last (on top while overtaking)
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS, color: "#202124" }}>
      <StatusBar />
      {/* header */}
      <div style={{ position: "absolute", top: 56, left: 16, right: 16, height: 52, display: "flex", alignItems: "center" }}>
        <IcMenu s={26} c="#5f6368" />
        <div style={{ flex: 1, textAlign: "center" }}>
          <GWord size={30} />
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: "#7B5E57", color: "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>R</div>
      </div>
      {/* search box */}
      <div
        style={{
          position: "absolute",
          top: 116,
          left: 14,
          right: 14,
          height: 52,
          borderRadius: 26,
          background: "#fff",
          boxShadow: suggest > 0.01 ? "0 1px 6px rgba(32,33,36,0.28)" : "0 1px 3px rgba(32,33,36,0.22)",
          border: "1px solid #dfe1e5",
          display: "flex",
          alignItems: "center",
          padding: "0 14px 0 18px",
          gap: 12,
          zIndex: 20,
        }}
      >
        <div style={{ flex: 1, fontSize: 18.5, whiteSpace: "nowrap", overflow: "hidden" }}>
          {query}
          <span style={{ display: "inline-block", width: 2, height: 22, background: "#1a73e8", verticalAlign: "-4px", marginLeft: 1, opacity: caret ? 1 : 0 }} />
        </div>
        {query.length > 0 && <IcX s={20} />}
        <div style={{ width: 1, height: 26, background: "#dadce0" }} />
        <IcMic s={22} />
        <IcLens s={22} />
      </div>
      {/* tabs */}
      <div style={{ position: "absolute", top: 182, left: 0, right: 0, height: 40, display: "flex", gap: 24, padding: "0 20px", fontSize: 15.5, color: "#5f6368", borderBottom: "1px solid #ebebeb", whiteSpace: "nowrap" }}>
        {["All", "Maps", "Images", "News", "Videos", "Shopping"].map((x, i) => (
          <div key={x} style={{ position: "relative", color: i === 0 ? "#1f1f1f" : undefined, fontWeight: i === 0 ? 700 : 500 }}>
            {x}
            {i === 0 && <div style={{ position: "absolute", left: -4, right: -4, bottom: 0, height: 3, borderRadius: "3px 3px 0 0", background: "#1f1f1f" }} />}
          </div>
        ))}
      </div>
      {/* loading line */}
      {loading >= 0 && loading < 1 && (
        <div style={{ position: "absolute", top: 221, left: 0, height: 3, width: `${loading * 100}%`, background: "linear-gradient(90deg,#4285F4,#34A853 40%,#FBBC04 70%,#EA4335)", zIndex: 5 }} />
      )}
      {/* results */}
      <div style={{ position: "absolute", top: 224, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        {order.map((r) => {
          const i = results.indexOf(r);
          const k = clamp01(reveal * (results.length + 1) - i);
          const y = P(r, i) * M_ROW - scroll + (1 - k) * 22;
          return (
            <div key={r.id} style={{ position: "absolute", left: 8, right: 8, top: y + 6, height: M_ROW - 12, borderRadius: 18, padding: "14px 12px 0", ...rowStyle(r.mine, highlight, k) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Fav bg={r.fav[0]} ch={r.fav[1]} s={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: "#202124", fontWeight: 500 }}>{r.site}</div>
                  <div style={{ fontSize: 13, color: "#4d5156", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.url}</div>
                </div>
                <IcDots s={20} />
              </div>
              <div style={{ fontSize: 20.5, lineHeight: "26px", color: "#1a0dab", marginTop: 10, fontWeight: 400 }}>{r.title}</div>
              <div style={{ fontSize: 15.5, lineHeight: "23px", color: "#4d5156", marginTop: 5, fontFamily: BN, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {r.rating && (
                  <span style={{ fontFamily: SANS, marginRight: 6 }}>
                    <Stars v={r.rating[0]} s={14} /> <span style={{ color: "#4d5156" }}>{r.rating[0]} ({r.rating[1]}) ·</span>
                  </span>
                )}
                <Rich segs={r.snippet} />
              </div>
              <div style={{ position: "absolute", left: 4, right: 4, bottom: -6, height: 1, background: r.mine && highlight > 0.1 ? "transparent" : "#ececec" }} />
            </div>
          );
        })}
      </div>
      {/* suggestions dropdown (typing) */}
      {suggest > 0.01 && (
        <div style={{ position: "absolute", top: 168, left: 0, right: 0, bottom: 0, background: "#fff", opacity: suggest, zIndex: 15, paddingTop: 14 }}>
          {suggestions
            .filter((s) => !query || s.toLowerCase().startsWith(query.toLowerCase().slice(0, Math.min(query.length, s.length))))
            .slice(0, 5)
            .map((s) => (
              <SuggestRow key={s} q={query} s={s} fs={18} pad="14px 22px" />
            ))}
        </div>
      )}
      <HomeBar />
    </div>
  );
};

/* ======================= DESKTOP ======================= */
const D_ROW = 132;
export const GoogleResultsDesktop: React.FC<GResultsProps> = ({ query, caret, suggest = 0, suggestions = DEFAULT_SUGG, loading = -1, results = SYLHET_DENTIST, pos, reveal = 1, scroll = 0, highlight = 0 }) => {
  const P = (r: GResult, i: number) => pos?.[r.id] ?? i;
  const order = [...results].sort((a, b) => (a.mine ? 1 : 0) - (b.mine ? 1 : 0));
  const mine = results.find((r) => r.mine);
  const L = 168;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS, color: "#202124" }}>
      {/* top bar */}
      <div style={{ position: "absolute", top: 22, left: 28, right: 28, height: 50, display: "flex", alignItems: "center" }}>
        <div style={{ width: L - 28 }}>
          <GWord size={32} />
        </div>
        <div style={{ width: 600, height: 48, borderRadius: suggest > 0.01 ? "24px 24px 0 0" : 24, border: "1px solid #dfe1e5", boxShadow: "0 1px 6px rgba(32,33,36,0.2)", display: "flex", alignItems: "center", padding: "0 16px 0 22px", gap: 14, position: "relative", zIndex: 20, background: "#fff" }}>
          <div style={{ flex: 1, fontSize: 17 }}>
            {query}
            <span style={{ display: "inline-block", width: 2, height: 20, background: "#1a73e8", verticalAlign: "-4px", marginLeft: 1, opacity: caret ? 1 : 0 }} />
          </div>
          {query.length > 0 && <IcX s={22} />}
          <div style={{ width: 1, height: 28, background: "#dadce0" }} />
          <IcMic s={22} />
          <IcLens s={22} />
          <IcSearch s={22} c="#4285F4" w={2.4} />
          {suggest > 0.01 && (
            <div style={{ position: "absolute", top: 47, left: -1, right: -1, background: "#fff", borderRadius: "0 0 24px 24px", boxShadow: "0 4px 6px rgba(32,33,36,0.2)", border: "1px solid #dfe1e5", borderTop: "1px solid #e8eaed", opacity: suggest, paddingBottom: 10 }}>
              {suggestions.slice(0, 4).map((s) => (
                <SuggestRow key={s} q={query} s={s} fs={16} pad="9px 22px" />
              ))}
            </div>
          )}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 22 }}>
          <IcGear s={22} />
          <IcApps s={22} />
          <div style={{ width: 34, height: 34, borderRadius: 17, background: "#7B5E57", color: "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>R</div>
        </div>
      </div>
      {/* tabs */}
      <div style={{ position: "absolute", top: 86, left: L, right: 0, height: 42, display: "flex", gap: 28, fontSize: 14.5, color: "#5f6368" }}>
        {["All", "Maps", "Images", "News", "Videos", "Shopping", "More"].map((x, i) => (
          <div key={x} style={{ position: "relative", paddingTop: 10, color: i === 0 ? "#1f1f1f" : undefined, fontWeight: i === 0 ? 700 : 500 }}>
            {x}
            {i === 0 && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, borderRadius: "3px 3px 0 0", background: "#1f1f1f" }} />}
          </div>
        ))}
        <div style={{ marginLeft: 210, paddingTop: 10 }}>Tools</div>
      </div>
      <div style={{ position: "absolute", top: 128, left: 0, right: 0, height: 1, background: "#ebebeb" }} />
      {loading >= 0 && loading < 1 && <div style={{ position: "absolute", top: 127, left: 0, height: 3, width: `${loading * 100}%`, background: "#1a73e8" }} />}
      <div style={{ position: "absolute", top: 140, left: L, fontSize: 13.5, color: "#70757a", opacity: reveal }}>About 1,24,000 results (0.41 seconds)</div>
      {/* organic list */}
      <div style={{ position: "absolute", top: 166, left: L - 16, width: 600, bottom: 0, overflow: "hidden" }}>
        {order.map((r) => {
          const i = results.indexOf(r);
          const k = clamp01(reveal * (results.length + 1) - i);
          const y = P(r, i) * D_ROW - scroll + (1 - k) * 16;
          return (
            <div key={r.id} style={{ position: "absolute", left: 0, right: 0, top: y, height: D_ROW - 10, borderRadius: 14, padding: "10px 16px 0", ...rowStyle(r.mine, highlight, k) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Fav bg={r.fav[0]} ch={r.fav[1]} s={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#202124" }}>{r.site}</div>
                  <div style={{ fontSize: 12.5, color: "#4d5156" }}>{r.url}</div>
                </div>
              </div>
              <div style={{ fontSize: 20, lineHeight: "26px", color: "#1a0dab", marginTop: 6 }}>{r.title}</div>
              <div style={{ fontSize: 14.5, lineHeight: "22px", color: "#4d5156", marginTop: 3, fontFamily: BN, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.rating && (
                  <span style={{ fontFamily: SANS, marginRight: 6 }}>
                    <Stars v={r.rating[0]} s={13} /> Rating: {r.rating[0]} · {r.rating[1]} reviews ·
                  </span>
                )}
                <Rich segs={r.snippet} />
              </div>
            </div>
          );
        })}
      </div>
      {/* knowledge panel for Your Shop */}
      {mine && (
        <div style={{ position: "absolute", top: 166, left: 790, right: 26, height: 430, border: "1px solid #dadce0", borderRadius: 16, overflow: "hidden", opacity: clamp01(reveal * 2 - 0.6), boxShadow: highlight > 0 ? `0 0 0 ${2 * highlight}px rgba(245,149,43,${0.8 * highlight})` : undefined }}>
          <MiniMap h={128} />
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: "25px" }}>{mine.site}</div>
            <div style={{ fontSize: 13.5, color: "#4d5156", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "#202124" }}>{mine.rating?.[0]}</span> <Stars v={mine.rating?.[0] ?? 5} s={13} /> <span style={{ color: "#1a0dab" }}>{mine.rating?.[1]} Google reviews</span>
            </div>
            <div style={{ fontSize: 13.5, color: "#4d5156", marginTop: 3 }}>Dentist in Sylhet</div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {["Website", "Directions", "Call"].map((b) => (
                <div key={b} style={{ flex: 1, height: 36, borderRadius: 18, border: "1px solid #dadce0", fontSize: 13.5, fontWeight: 600, color: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {b}
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: "#ebebeb", margin: "14px -16px 10px" }} />
            {[
              ["Address", "Zindabazar Rd, Sylhet 3100"],
              ["Hours", "Open · Closes 9 PM"],
              ["Phone", "01711-458 296"],
            ].map(([a, b]) => (
              <div key={a} style={{ fontSize: 13.5, lineHeight: "22px", color: "#4d5156" }}>
                <b style={{ color: "#202124" }}>{a}: </b>
                <span style={{ color: a === "Hours" ? "#188038" : undefined }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/** tiny static map used inside the knowledge panel */
export const MiniMap: React.FC<{ h: number }> = ({ h }) => (
  <svg width="100%" height={h} viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
    <rect width="200" height="100" fill="#F3F1EC" />
    <path d="M0 78 C40 70 70 92 110 80 S170 66 200 74 L200 100 L0 100Z" fill="#AADAFF" />
    <rect x="128" y="10" width="42" height="26" rx="5" fill="#CDEBC5" />
    <path d="M-5 40 L205 30" stroke="#fff" strokeWidth="7" />
    <path d="M70 -5 L88 105" stroke="#FDE293" strokeWidth="7" />
    <path d="M70 -5 L88 105" stroke="#F3CF65" strokeWidth="1" />
    <path d="M10 10 L60 60 L140 58" stroke="#fff" strokeWidth="4" fill="none" />
    <g transform="translate(96 22)">
      <path d="M8 26C8 26 0 16 0 8.5a8 8 0 0 1 16 0C16 16 8 26 8 26z" fill="#EA4335" />
      <circle cx="8" cy="8.5" r="3" fill="#A50E0E" />
    </g>
  </svg>
);
