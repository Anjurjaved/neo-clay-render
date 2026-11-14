// Google Maps-style business profile — mobile (390×843) + desktop (1024×700).
// Map is a hand-drawn SVG of a Sylhet-like neighbourhood (roads, Surma river, park, building footprints, POIs);
// pin drops with bounce, route draws, bottom sheet slides up, photo strip scrolls, buttons press.
import React, { useMemo } from "react";
import { StatusBar } from "../../kit/Device";
import { GSANS, BN, IcBack, IcX, IcDirections, IcPhone, IcGlobe, IcBookmark, IcShare, IcPin, IcClock, IcSearch, Stars, HomeBar, clamp01 } from "./ui";

export type Biz = {
  name: string;
  category: string;
  area: string;
  rating: number;
  reviews: number;
  open: boolean;
  hours: string; // "Closes 9 PM" / "Opens 10 AM"
  address: string;
  phone: string;
  web: string;
  distance: string;
  photos?: string[]; // optional real photo URLs; default = drawn tiles
};
export const SHIRIN: Biz = {
  name: "Dr. Shirin Dental Chamber",
  category: "Dentist",
  area: "Zindabazar",
  rating: 4.8,
  reviews: 126,
  open: true,
  hours: "Closes 9 PM",
  address: "2nd floor, Al-Hamra Tower, Zindabazar Rd, Sylhet 3100",
  phone: "01711-458 296",
  web: "drshirindental.com",
  distance: "1.2 km",
};

/* ---------------- map canvas ---------------- */
export const PIN_AT: [number, number] = [430, 560]; // map units (1200×1400 canvas)
const ME_AT: [number, number] = [280, 860];
const hash = (i: number) => {
  const h = Math.sin(i * 91.17 + 7.3) * 43758.5453;
  return h - Math.floor(h);
};
const ROUTE = `M${ME_AT[0]} ${ME_AT[1]} L280 712 Q280 698 294 698 L438 694 Q452 694 452 680 L452 600 Q452 585 ${PIN_AT[0]} ${PIN_AT[1] + 4}`;

export const MapCanvas: React.FC<{ route?: number; pin?: number; label?: number; pulse?: number; dark?: boolean }> = ({ route = 0, pin = 1, label = 1, pulse = 0 }) => {
  // building footprints inside blocks (deterministic)
  const blocks = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number }[] = [];
    const cols = [60, 300, 600, 860];
    const rows = [40, 320, 620, 940];
    let k = 0;
    cols.forEach((cx, ci) =>
      rows.forEach((cy, ri) => {
        const bw = ci === 3 ? 300 : 210;
        const bh = ri === 3 ? 160 : 240;
        for (let i = 0; i < 9; i++) {
          k++;
          const x = cx + 14 + (i % 3) * (bw / 3) + hash(k) * 8;
          const y = cy + 14 + Math.floor(i / 3) * (bh / 3) + hash(k + 50) * 8;
          if (hash(k + 99) < 0.2) continue;
          out.push({ x, y, w: bw / 3 - 16 - hash(k + 3) * 12, h: bh / 3 - 16 - hash(k + 7) * 14 });
        }
      })
    );
    return out;
  }, []);
  const dash = 1200;
  return (
    <svg width={1200} height={1400} viewBox="0 0 1200 1400" style={{ position: "absolute", left: 0, top: 0, display: "block" }}>
      <rect width="1200" height="1400" fill="#F5F3EE" />
      {/* park */}
      <path d="M612 330 L840 318 L852 560 L640 590 Q606 470 612 330Z" fill="#CBEBC2" />
      <path d="M70 330 L250 330 L250 520 L70 520Z" fill="#DCEFD3" />
      {/* buildings */}
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill="#EAE6DE" stroke="#E0DCD3" strokeWidth={1.5} />
      ))}
      {/* river */}
      <path d="M-20 1120 C200 1060 380 1150 600 1110 S980 1040 1220 1090 L1220 1260 C980 1210 800 1290 600 1270 S220 1230 -20 1280Z" fill="#A8D8F8" />
      <text x="560" y="1205" fill="#4F86B3" fontSize="34" fontStyle="italic" fontFamily={GSANS} letterSpacing="2">Surma River</text>
      {/* bridge */}
      <path d="M560 1040 L540 1330" stroke="#D6D2CA" strokeWidth="30" />
      <path d="M560 1040 L540 1330" stroke="#fff" strokeWidth="24" />
      {/* minor streets */}
      {[
        "M0 300 L1200 300",
        "M0 600 L1200 600",
        "M0 920 L1200 920",
        "M280 0 L280 1100",
        "M580 0 L580 1080",
        "M840 0 L840 1060",
        "M120 600 L120 920",
        "M700 600 L700 920",
      ].map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#DEDAD2" strokeWidth="11" fill="none" />
          <path d={d} stroke="#fff" strokeWidth="8" fill="none" />
        </g>
      ))}
      {/* main road */}
      <path d="M0 700 Q600 690 1200 720" stroke="#D4D0C7" strokeWidth="21" fill="none" />
      <path d="M0 700 Q600 690 1200 720" stroke="#fff" strokeWidth="17" fill="none" />
      {/* highway */}
      <path d="M380 -20 C410 300 470 520 452 760 S500 1000 520 1420" stroke="#EFC452" strokeWidth="22" fill="none" />
      <path d="M380 -20 C410 300 470 520 452 760 S500 1000 520 1420" stroke="#FFE38F" strokeWidth="17" fill="none" />
      {/* road labels */}
      <text x="700" y="704" fill="#5F6368" fontSize="24" fontFamily={GSANS} transform="rotate(1.4 700 704)">Zindabazar Rd</text>
      <text x="0" y="0" fill="#7A5B00" fontSize="22" fontFamily={GSANS} transform="translate(420 300) rotate(80)">Airport Rd</text>
      <text x="40" y="294" fill="#70757a" fontSize="21" fontFamily={GSANS}>Chowhatta Rd</text>
      <text x="880" y="914" fill="#70757a" fontSize="21" fontFamily={GSANS}>Bandar Bazar Rd</text>
      {/* area labels */}
      <text x="640" y="200" fill="#8A8D91" fontSize="28" fontFamily={GSANS} letterSpacing="6" fontWeight="700">AMBERKHANA</text>
      <text x="90" y="1010" fill="#8A8D91" fontSize="28" fontFamily={GSANS} letterSpacing="6" fontWeight="700">BANDAR BAZAR</text>
      <text x="660" y="470" fill="#3B7D3A" fontSize="23" fontFamily={GSANS}>Osmani Shishu Park</text>
      {/* POIs */}
      {[
        [700, 780, "#F28B30", "Panshi Restaurant"],
        [180, 640, "#4A80F5", "Al-Hamra Shopping City"],
        [900, 640, "#E06055", "Mount Adora Hospital"],
        [640, 1000, "#12B5CB", "Sylhet Model School"],
      ].map(([x, y, c, n], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="14" fill={c as string} stroke="#fff" strokeWidth="3" />
          <circle r="4" fill="#fff" />
          <text x="22" y="7" fill={c as string} fontSize="21" fontWeight="700" fontFamily={GSANS} stroke="#fff" strokeWidth="4" paintOrder="stroke">
            {n}
          </text>
        </g>
      ))}
      {/* route */}
      {route > 0 && (
        <g>
          <path d={ROUTE} stroke="#1558D6" strokeWidth="12" fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={dash * (1 - route)} />
          <path d={ROUTE} stroke="#669DF6" strokeWidth="6" fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={dash * (1 - route)} />
        </g>
      )}
      {/* me */}
      <g transform={`translate(${ME_AT[0]} ${ME_AT[1]})`}>
        <circle r={26 + 22 * pulse} fill="#4285F4" opacity={0.22 * (1 - pulse)} />
        <circle r="26" fill="#4285F4" opacity="0.16" />
        <circle r="12" fill="#1A73E8" stroke="#fff" strokeWidth="4" />
      </g>
      {/* pin (drop + squash) */}
      {pin > 0 && (
        <g transform={`translate(${PIN_AT[0]} ${PIN_AT[1]})`}>
          <ellipse cx="0" cy="2" rx={11 * Math.min(1, pin)} ry="4" fill="#000" opacity={0.25 * Math.min(1, pin)} />
          <g transform={`translate(0 ${-(1 - Math.min(1, pin)) * 120}) scale(${1 + (pin > 1 ? (pin - 1) * 0.8 : 0)} ${1 - (pin > 1 ? (pin - 1) * 0.8 : 0)})`}>
            <path d="M0 0 C-4 -14 -22 -26 -22 -46 a22 22 0 0 1 44 0 C22 -26 4 -14 0 0Z" fill="#EA4335" stroke="#B31412" strokeWidth="1.5" />
            <circle cx="0" cy="-46" r="8" fill="#B31412" />
          </g>
          <text x="32" y="-40" fill="#C5221F" fontSize="26" fontWeight="700" fontFamily={GSANS} stroke="#fff" strokeWidth="5" paintOrder="stroke" opacity={label}>
            Dr. Shirin Dental
          </text>
          <text x="32" y="-12" fill="#C5221F" fontSize="26" fontWeight="700" fontFamily={GSANS} stroke="#fff" strokeWidth="5" paintOrder="stroke" opacity={label}>
            Chamber
          </text>
        </g>
      )}
    </svg>
  );
};

/** map viewport: centre map point `at` in a box, zoom */
const MapView: React.FC<{ w: number; h: number; at: [number, number]; zoom: number; cx?: number; cy?: number; children: React.ReactNode }> = ({ w, h, at, zoom, cx = 0.5, cy = 0.5, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, overflow: "hidden", background: "#F5F3EE" }}>
    <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${w * cx}px, ${h * cy}px) scale(${zoom}) translate(${-at[0]}px, ${-at[1]}px)` }}>{children}</div>
  </div>
);

/* ---------------- photo tiles (CSS drawn — pass real photos via Biz.photos) ---------------- */
export const PhotoTile: React.FC<{ kind: number; w: number; h: number; src?: string; r?: number }> = ({ kind, w, h, src, r = 12 }) => {
  const box: React.CSSProperties = { position: "relative", width: w, height: h, borderRadius: r, overflow: "hidden", flex: "none" };
  if (src) return <div style={{ ...box, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }} />;
  const u = Math.min(w, h * 1.3) / 100; // design units (centred 100u box, background spans the tile)
  const ox = (w - 100 * u) / 2;
  const abs = (st: React.CSSProperties): React.CSSProperties => {
    if (st.left === 0 && st.right === 0) return { position: "absolute", ...st };
    return { position: "absolute", ...st, left: typeof st.left === "number" ? st.left + ox : st.left, right: typeof st.right === "number" ? st.right + ox : st.right };
  };
  if (kind === 0)
    // storefront
    return (
      <div style={{ ...box, background: "linear-gradient(180deg,#BFD9EE 0%,#DCE9F2 38%)" }}>
        <div style={abs({ left: 0, right: 0, top: h * 0.12, bottom: 0, background: "linear-gradient(180deg,#EFE4D2,#E2D3BC)" })} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={abs({ left: 8 * u + i * 30 * u, top: h * 0.17, width: 22 * u, height: h * 0.16, background: "linear-gradient(160deg,#9FC3DD,#6E94B3)", borderRadius: 2, boxShadow: "inset 0 0 0 2px #f4ede2" })} />
        ))}
        <div style={abs({ left: 4 * u, right: 4 * u, top: h * 0.4, height: h * 0.18, background: "linear-gradient(180deg,#123B63,#0C2E50)", borderRadius: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 3px 6px rgba(0,0,0,.25)" })}>
          <div style={{ fontFamily: GSANS, fontWeight: 700, fontSize: 9.5 * u, letterSpacing: 0.4 * u, lineHeight: 1 }}>DR. SHIRIN DENTAL</div>
          <div style={{ fontFamily: BN, fontSize: 6.5 * u, color: "#F5B062", lineHeight: 1.2 }}>দাঁতের চিকিৎসা ও সিরিয়াল</div>
        </div>
        <div style={abs({ left: 30 * u, width: 40 * u, top: h * 0.62, bottom: 0, background: "linear-gradient(115deg,#5E7F99 0%,#9DBAD0 40%,#5E7F99 60%,#456679)", boxShadow: "inset 0 0 0 3px #B9A88F" })} />
        <div style={abs({ left: 49.5 * u, width: 1 * u, top: h * 0.62, bottom: 0, background: "#B9A88F" })} />
        <div style={abs({ left: 0, right: 0, bottom: 0, height: h * 0.07, background: "#A9A39A" })} />
        <div style={abs({ left: 8 * u, bottom: h * 0.06, width: 12 * u, height: h * 0.2, borderRadius: "50% 50% 20% 20%", background: "radial-gradient(circle at 40% 35%,#6DBF6A,#2F7D3B)" })} />
        <div style={abs({ left: 80 * u, bottom: h * 0.06, width: 12 * u, height: h * 0.2, borderRadius: "50% 50% 20% 20%", background: "radial-gradient(circle at 40% 35%,#6DBF6A,#2F7D3B)" })} />
      </div>
    );
  if (kind === 1)
    // treatment room
    return (
      <div style={{ ...box, background: "linear-gradient(180deg,#E3F1EE 0%,#D2E7E3 62%,#C9C3B8 62%,#BDB6AA 100%)" }}>
        <div style={abs({ left: 62 * u, top: h * 0.08, width: 30 * u, height: h * 0.42, background: "linear-gradient(160deg,#FFFFFF,#DDEFF7)", boxShadow: "inset 0 0 0 3px #CFDCDC", borderRadius: 3 })} />
        <div style={abs({ left: 76 * u, top: h * 0.08, width: 2 * u, height: h * 0.42, background: "#CFDCDC" })} />
        {/* lamp arm */}
        <div style={abs({ left: 28 * u, top: h * 0.05, width: 2.4 * u, height: h * 0.26, background: "#C8CED3", borderRadius: 4 })} />
        <div style={abs({ left: 18 * u, top: h * 0.27, width: 22 * u, height: h * 0.1, borderRadius: "40% 40% 50% 50%", background: "linear-gradient(180deg,#F2F4F5,#B7BEC4)", boxShadow: "0 6px 12px rgba(255,250,220,.9)" })} />
        {/* chair: back, seat, leg rest */}
        <div style={abs({ left: 16 * u, top: h * 0.44, width: 16 * u, height: h * 0.3, borderRadius: 6 * u, background: "linear-gradient(140deg,#2CB3A8,#16857C)", transform: "rotate(-28deg)" })} />
        <div style={abs({ left: 26 * u, top: h * 0.6, width: 34 * u, height: h * 0.12, borderRadius: 5 * u, background: "linear-gradient(180deg,#2CB3A8,#14776F)" })} />
        <div style={abs({ left: 56 * u, top: h * 0.62, width: 22 * u, height: h * 0.1, borderRadius: 5 * u, background: "linear-gradient(180deg,#2CB3A8,#14776F)", transform: "rotate(16deg)" })} />
        <div style={abs({ left: 40 * u, top: h * 0.72, width: 6 * u, height: h * 0.16, background: "linear-gradient(90deg,#AEB5BB,#E7EAEC,#AEB5BB)" })} />
        <div style={abs({ left: 32 * u, top: h * 0.86, width: 22 * u, height: h * 0.05, borderRadius: 8, background: "#9AA2A9" })} />
        <div style={abs({ left: 4 * u, top: h * 0.5, width: 9 * u, height: h * 0.36, borderRadius: 3, background: "linear-gradient(90deg,#F7F7F5,#DCDAD4)" })} />
      </div>
    );
  if (kind === 2)
    // reception
    return (
      <div style={{ ...box, background: "linear-gradient(180deg,#F4EDE3 0%,#EBE1D3 58%,#C9B79C 58%,#B9A688 100%)" }}>
        <div style={abs({ left: 30 * u, top: h * 0.14, width: 40 * u, height: h * 0.16, borderRadius: 4, background: "#F5952B", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: GSANS, fontWeight: 700, fontSize: 8 * u })}>
          RECEPTION
        </div>
        <div style={abs({ left: 12 * u, right: 12 * u, top: h * 0.44, height: h * 0.32, borderRadius: "6px 6px 2px 2px", background: "linear-gradient(180deg,#FFFFFF,#E6E1D9)", boxShadow: "0 6px 10px rgba(80,60,40,.18)" })} />
        <div style={abs({ left: 12 * u, right: 12 * u, top: h * 0.44, height: h * 0.05, borderRadius: 6, background: "#7C5A3C" })} />
        <div style={abs({ left: 60 * u, top: h * 0.3, width: 16 * u, height: h * 0.14, borderRadius: 3, background: "linear-gradient(160deg,#2E3440,#11151b)" })} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={abs({ left: 6 * u + i * 13 * u, top: h * 0.8, width: 11 * u, height: h * 0.14, borderRadius: 4, background: "linear-gradient(180deg,#3F6E9E,#2B527A)" })} />
        ))}
        <div style={abs({ left: 84 * u, top: h * 0.5, width: 10 * u, height: h * 0.36, borderRadius: "50% 50% 10% 10%", background: "radial-gradient(circle at 40% 30%,#78C774,#2F7D3B)" })} />
      </div>
    );
  // street view
  return (
    <div style={{ ...box, background: "linear-gradient(180deg,#CFE3F2 0%,#E8EFF3 42%,#9C9890 42%,#7E7A73 100%)" }}>
      <div style={abs({ left: 0, width: 40 * u, top: h * 0.12, bottom: h * 0.58, background: "linear-gradient(180deg,#E9D9C2,#D9C6AA)", clipPath: "polygon(0 0,100% 30%,100% 100%,0 100%)" })} />
      <div style={abs({ right: 0, width: 40 * u, top: h * 0.18, bottom: h * 0.58, background: "linear-gradient(180deg,#D8E0E3,#BCC6CB)", clipPath: "polygon(0 30%,100% 0,100% 100%,0 100%)" })} />
      <div style={abs({ left: 48 * u, width: 4 * u, top: h * 0.42, bottom: 0, background: "repeating-linear-gradient(180deg,#F3F0E8 0 10px,transparent 10px 20px)" })} />
      <div style={abs({ left: 8, bottom: 8, padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,.55)", color: "#fff", fontFamily: GSANS, fontSize: 12, fontWeight: 700 })}>Street View</div>
    </div>
  );
};

/* ---------------- shared bits ---------------- */
const Rating: React.FC<{ b: Biz; fs: number }> = ({ b, fs }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: fs, color: "#474747" }}>
    <span style={{ color: "#1f1f1f" }}>{b.rating}</span>
    <Stars v={b.rating} s={fs} />
    <span>({b.reviews})</span>
    <span>·</span>
    <svg width={fs} height={fs} viewBox="0 0 24 24" fill="#474747">
      <path d="M6 20.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm12 0a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM6.5 14l2-7h7l2 7z" />
    </svg>
    <span>{b.distance}</span>
  </div>
);
const OpenLine: React.FC<{ b: Biz; fs: number }> = ({ b, fs }) => (
  <div style={{ fontSize: fs, color: "#474747" }}>
    <b style={{ color: b.open ? "#188038" : "#D93025", fontWeight: 700 }}>{b.open ? "Open" : "Closed"}</b> · {b.hours}
  </div>
);

type ActBtn = { label: string; icon: React.ReactNode; filled?: boolean };
const actions = (filled: boolean): ActBtn[] => [
  { label: "Directions", icon: <IcDirections s={20} c={filled ? "#fff" : "#0B57D0"} />, filled },
  { label: "Call", icon: <IcPhone s={19} c="#0B57D0" /> },
  { label: "Website", icon: <IcGlobe s={19} /> },
  { label: "Save", icon: <IcBookmark s={19} /> },
  { label: "Share", icon: <IcShare s={19} /> },
];

/* ======================= MOBILE ======================= */
export type MapsProps = {
  biz?: Biz;
  zoom?: number; // 0.6..1.6
  center?: [number, number]; // map units
  pin?: number; // 0..1 drop (values >1 = squash)
  label?: number;
  route?: number; // 0..1
  pulse?: number; // 0..1 my-location halo phase
  sheet?: number; // 0..1 bottom sheet slide
  photoScroll?: number; // px
  press?: number; // index of pressed action
  pressK?: number; // 0..1 ripple
};
export const GoogleMapsMobile: React.FC<MapsProps> = ({ biz = SHIRIN, zoom = 1, center = [PIN_AT[0], PIN_AT[1] - 40], pin = 1, label = 1, route = 0, pulse = 0, sheet = 1, photoScroll = 0, press = -1, pressK = 0 }) => {
  const SH = 520;
  const top = 843 - SH * sheet;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: GSANS, color: "#1f1f1f", background: "#F5F3EE" }}>
      <MapView w={390} h={843} at={center} zoom={zoom} cy={0.33 + 0.0 * sheet}>
        <MapCanvas pin={pin} label={label} route={route} pulse={pulse} />
      </MapView>
      <StatusBar />
      {/* search bar */}
      <div style={{ position: "absolute", top: 58, left: 14, right: 14, height: 54, borderRadius: 27, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,.18)", display: "flex", alignItems: "center", padding: "0 16px", gap: 14 }}>
        <IcBack s={24} c="#444746" />
        <div style={{ flex: 1, fontSize: 17.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{biz.name}</div>
        <IcX s={22} c="#444746" />
      </div>
      {/* bottom sheet */}
      <div style={{ position: "absolute", left: 0, right: 0, top, height: SH + 40, background: "#fff", borderRadius: "28px 28px 0 0", boxShadow: "0 -4px 18px rgba(0,0,0,.14)", padding: "0 0 0 18px" }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: "#C4C7C5", margin: "10px auto 14px", transform: "translateX(-9px)" }} />
        <div style={{ paddingRight: 18 }}>
          <div style={{ fontSize: 25, fontWeight: 700, lineHeight: "31px", letterSpacing: -0.2 }}>{biz.name}</div>
          <div style={{ marginTop: 6 }}>
            <Rating b={biz} fs={15} />
          </div>
          <div style={{ fontSize: 15, color: "#474747", marginTop: 4 }}>
            {biz.category} · {biz.area}
          </div>
          <div style={{ marginTop: 4 }}>
            <OpenLine b={biz} fs={15} />
          </div>
        </div>
        {/* action pills */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, whiteSpace: "nowrap" }}>
          {actions(true).map((a, i) => {
            const pk = press === i ? pressK : 0;
            const sc = 1 - 0.06 * Math.sin(Math.PI * clamp01(pk * 1.6));
            return (
              <div
                key={a.label}
                style={{
                  position: "relative",
                  flex: "none",
                  height: 40,
                  borderRadius: 20,
                  padding: "0 16px 0 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  background: a.filled ? "#0B57D0" : "#D3E3FD",
                  color: a.filled ? "#fff" : "#041E49",
                  transform: `scale(${sc})`,
                  overflow: "hidden",
                }}
              >
                {a.icon}
                {a.label}
                {pk > 0 && pk < 1 && <div style={{ position: "absolute", left: 30, top: 20, width: 240 * pk, height: 240 * pk, marginLeft: -120 * pk, marginTop: -120 * pk, borderRadius: "50%", background: "rgba(255,255,255,.35)", opacity: 1 - pk }} />}
              </div>
            );
          })}
        </div>
        {/* photos */}
        <div style={{ position: "relative", marginTop: 16, height: 128, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 6, transform: `translateX(${-photoScroll}px)` }}>
            {[0, 1, 2, 3].map((k) => (
              <PhotoTile key={k} kind={k} w={k === 0 ? 200 : 168} h={128} src={biz.photos?.[k]} r={k === 0 ? 14 : 6} />
            ))}
          </div>
        </div>
        {/* info rows */}
        <div style={{ paddingRight: 18, marginTop: 6 }}>
          {[
            [<IcPin s={21} key="p" />, biz.address],
            [<IcClock s={21} key="c" />, <OpenLine b={biz} fs={15} key="o" />],
            [<IcPhone s={20} key="ph" />, biz.phone],
          ].map(([ic, txt], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 0", borderBottom: "1px solid #EEF0F2", fontSize: 15, color: "#1f1f1f" }}>
              {ic}
              <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>
      <HomeBar />
    </div>
  );
};

/* ======================= DESKTOP ======================= */
export const GoogleMapsDesktop: React.FC<MapsProps & { tab?: number }> = ({ biz = SHIRIN, zoom = 1, center = PIN_AT, pin = 1, label = 1, route = 0, pulse = 0, sheet = 1, photoScroll = 0, press = -1, pressK = 0, tab = 0 }) => {
  const PW = 400;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: GSANS, color: "#1f1f1f" }}>
      <MapView w={1024} h={700} at={center} zoom={zoom} cx={0.66} cy={0.52}>
        <MapCanvas pin={pin} label={label} route={route} pulse={pulse} />
      </MapView>
      {/* zoom controls */}
      <div style={{ position: "absolute", right: 18, bottom: 26, width: 40, borderRadius: 8, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.3)", overflow: "hidden" }}>
        {["+", "−"].map((s, i) => (
          <div key={s} style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#666", borderTop: i ? "1px solid #e6e6e6" : undefined }}>
            {s}
          </div>
        ))}
      </div>
      {/* side panel */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: PW, background: "#fff", boxShadow: "2px 0 8px rgba(0,0,0,.18)", transform: `translateX(${-(1 - sheet) * (PW + 20)}px)`, overflow: "hidden" }}>
        <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
          <div style={{ transform: `translateX(${-photoScroll}px)`, display: "flex", gap: 3 }}>
            {[0, 1, 2].map((k) => (
              <PhotoTile key={k} kind={k} w={PW} h={190} src={biz.photos?.[k]} r={0} />
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 22px 0" }}>
          <div style={{ fontSize: 23, fontWeight: 700, lineHeight: "29px" }}>{biz.name}</div>
          <div style={{ marginTop: 6 }}>
            <Rating b={biz} fs={14} />
          </div>
          <div style={{ fontSize: 14, color: "#474747", marginTop: 3 }}>{biz.category}</div>
        </div>
        <div style={{ display: "flex", gap: 26, padding: "0 22px", marginTop: 12, borderBottom: "1px solid #E8EAED", fontSize: 14.5, fontWeight: 700, color: "#474747" }}>
          {["Overview", "Reviews", "About"].map((x, i) => (
            <div key={x} style={{ position: "relative", padding: "10px 2px 12px", color: i === tab ? "#0B57D0" : undefined }}>
              {x}
              {i === tab && <div style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 3, borderRadius: "3px 3px 0 0", background: "#0B57D0" }} />}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 22px 12px", borderBottom: "1px solid #E8EAED" }}>
          {actions(true).map((a, i) => {
            const pk = press === i ? pressK : 0;
            const sc = 1 - 0.08 * Math.sin(Math.PI * clamp01(pk * 1.6));
            return (
              <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 62 }}>
                <div style={{ position: "relative", width: 42, height: 42, borderRadius: 21, background: a.filled ? "#0B57D0" : "#fff", border: a.filled ? undefined : "1px solid #C4C7C5", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sc})`, boxShadow: pk > 0 && pk < 1 ? `0 0 0 ${10 * pk}px rgba(11,87,208,${0.25 * (1 - pk)})` : undefined }}>
                  {a.icon}
                </div>
                <div style={{ fontSize: 12.5, color: "#0B57D0", fontWeight: 700 }}>{a.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "4px 22px" }}>
          {[
            [<IcPin s={20} key="p" />, biz.address],
            [<IcClock s={20} key="c" />, <OpenLine b={biz} fs={14} key="o" />],
            [<IcGlobe s={20} key="g" />, biz.web],
            [<IcPhone s={19} key="ph" />, biz.phone],
          ].map(([ic, txt], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "11px 0", fontSize: 14, color: "#1f1f1f" }}>
              {ic}
              <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{txt}</div>
            </div>
          ))}
        </div>
        {/* search box over the photo */}
        <div style={{ position: "absolute", top: 14, left: 14, right: 14, height: 46, borderRadius: 23, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,.25)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
          <IcBack s={20} c="#444746" />
          <div style={{ flex: 1, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{biz.name}</div>
          <IcSearch s={20} c="#444746" />
        </div>
      </div>
    </div>
  );
};
