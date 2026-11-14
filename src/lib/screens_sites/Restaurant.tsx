// Shatkora Kitchen — সিলেট জিন্দাবাজারের restaurant website (hero, menu + ৳ দাম, online order cart, table reservation)
import React from "react";
import { SiteDef, SiteProps, SiteShell, Ic, I, Btn, Field, Credit, IconTile, Stars, BN } from "./ui";

const P = "#9C2F1E"; // brick red
const PD = "#3A140D";
const SAF = "#E9A23B"; // saffron
const CREAM = "#FFF7EC";

export const RESTAURANT: SiteDef = {
  url: "shatkorakitchen.com",
  header: { desktop: 68, mobile: 62 },
  sections: [
    { key: "hero", h: { desktop: 572, mobile: 700 } },
    { key: "menu", h: { desktop: 610, mobile: 930 } },
    { key: "order", h: { desktop: 470, mobile: 600 } },
    { key: "reserve", h: { desktop: 470, mobile: 640 } },
    { key: "footer", h: { desktop: 150, mobile: 170 } },
  ],
};

type Dish = "beef" | "biryani" | "pulao" | "tikka" | "pitha" | "tea";
const MENU: { k: Dish; bn: string; en: string; p: number; tag?: string; spicy?: boolean }[] = [
  { k: "beef", bn: "সাতকরা গরুর মাংস", en: "Shatkora Beef", p: 420, tag: "Signature", spicy: true },
  { k: "biryani", bn: "কাচ্চি বিরিয়ানি", en: "Kacchi Biryani (Full)", p: 350 },
  { k: "pulao", bn: "সিলেটি আখনি", en: "Akhni Pulao", p: 280 },
  { k: "tikka", bn: "চিকেন টিক্কা", en: "Chicken Tikka (6 pcs)", p: 260, spicy: true },
  { k: "pitha", bn: "হান্দেশ পিঠা", en: "Handesh Pitha (4 pcs)", p: 120 },
  { k: "tea", bn: "সাত রঙের চা", en: "Seven-Layer Tea", p: 80 },
];

/** উপর থেকে দেখা থালা — রান্নার ধরন অনুযায়ী ভেতরটা */
const Plate: React.FC<{ k: Dish; s: number }> = ({ k, s }) => {
  const rice = (c: string, n: number, seed: number) =>
    Array.from({ length: n }).map((_, i) => {
      const a = (i * 137.5 + seed) * (Math.PI / 180);
      const r = 8 + ((i * 53) % 46);
      return <ellipse key={i} cx={60 + Math.cos(a) * r} cy={60 + Math.sin(a) * r} rx="3.2" ry="1.4" transform={`rotate(${(i * 47) % 180} ${60 + Math.cos(a) * r} ${60 + Math.sin(a) * r})`} fill={c} />;
    });
  if (k === "tea")
    return (
      <svg width={s} height={s} viewBox="0 0 120 120" style={{ display: "block" }}>
        <ellipse cx="60" cy="108" rx="30" ry="6" fill="#000" opacity="0.12" />
        <path d="M36 18 H84 L78 104 Q60 110 42 104Z" fill="#fff" opacity="0.6" />
        {["#F4E9D8", "#C98B4E", "#7A3E1D", "#E7C38C", "#9A5A2C", "#D9A35F", "#5A2A12"].map((c, i) => (
          <path key={c} d={`M${37.5 + i * 0.85} ${30 + i * 10.5} H${82.5 - i * 0.85} L${81.7 - i * 0.85} ${40.5 + i * 10.5} H${38.3 + i * 0.85}Z`} fill={c} />
        ))}
        <path d="M36 18 H84" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path d="M44 24 L46 96" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" style={{ display: "block" }}>
      <circle cx="62" cy="64" r="56" fill="#000" opacity="0.10" />
      <circle cx="60" cy="60" r="56" fill="#FBFAF7" />
      <circle cx="60" cy="60" r="46" fill="#F1ECE3" />
      {k === "beef" && (
        <>
          <circle cx="60" cy="60" r="42" fill="#7B2E12" />
          <circle cx="60" cy="60" r="42" fill="url(#gl)" opacity="0.0" />
          {[[44, 48], [70, 44], [58, 66], [38, 70], [78, 70], [62, 86], [50, 34]].map(([x, y], i) => (
            <rect key={i} x={x - 9} y={y - 7} width="18" height="14" rx="6" fill={i % 2 ? "#5A1E0A" : "#4A1607"} transform={`rotate(${i * 31} ${x} ${y})`} />
          ))}
          {[[60, 52], [42, 60], [76, 58], [56, 78]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="7" fill="#B9D36A" />
              <circle cx={x} cy={y} r="4.5" fill="#E8F0B0" />
              <path d={`M${x} ${y - 4.5} V${y + 4.5} M${x - 4.5} ${y} H${x + 4.5}`} stroke="#B9D36A" strokeWidth="1" />
            </g>
          ))}
          <path d="M30 40 q6 -8 14 -6" stroke="#E2603A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {k === "biryani" && (
        <>
          <circle cx="60" cy="60" r="42" fill="#F6E7C4" />
          {rice("#E8B54A", 70, 0)}
          {rice("#fff", 60, 40)}
          <ellipse cx="48" cy="56" rx="13" ry="11" fill="#E0A85C" />
          <ellipse cx="46" cy="54" rx="6" ry="4" fill="#F2CE8A" />
          <path d="M66 62 q10 -14 22 -4 q-2 14 -16 14 q-8 -2 -6 -10Z" fill="#8A3A16" />
          <circle cx="58" cy="80" r="5" fill="#F7F2E8" />
          <circle cx="58" cy="80" r="2.4" fill="#F2B530" />
        </>
      )}
      {k === "pulao" && (
        <>
          <circle cx="60" cy="60" r="42" fill="#FBF5E6" />
          {rice("#EFE2C2", 90, 12)}
          <path d="M42 48 q14 -10 22 2 q-4 12 -16 10 q-8 -3 -6 -12Z" fill="#C9772F" />
          <path d="M62 66 q14 -6 20 6 q-6 10 -16 8 q-6 -4 -4 -14Z" fill="#B5652A" />
          {[[40, 74], [52, 70], [78, 46]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="3.5" ry="2" fill="#6CA14A" transform={`rotate(${i * 50} ${x} ${y})`} />
          ))}
          <circle cx="72" cy="40" r="4" fill="#E2603A" />
        </>
      )}
      {k === "tikka" && (
        <>
          <ellipse cx="60" cy="60" rx="42" ry="30" fill="#E9F0D6" transform="rotate(-25 60 60)" />
          <path d="M22 86 L98 34" stroke="#BFA27A" strokeWidth="3" strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={30 + i * 14} y={66 - i * 9.6} width="15" height="15" rx="5" fill={i % 2 ? "#D2561F" : "#B9431A"} transform={`rotate(-34 ${37 + i * 14} ${73 - i * 9.6})`} />
          ))}
          <ellipse cx="86" cy="80" rx="9" ry="6" fill="#F7F2E8" />
          <circle cx="40" cy="44" r="6" fill="#B9D36A" />
          <circle cx="40" cy="44" r="3.5" fill="#E8F0B0" />
        </>
      )}
      {k === "pitha" && (
        <>
          {[[44, 46], [76, 46], [44, 76], [76, 76]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="15" fill="#7A3E1A" />
              <circle cx={x - 2} cy={y - 2} r="11" fill="#9A5527" />
              <circle cx={x - 4} cy={y - 4} r="3" fill="#B8733E" />
            </g>
          ))}
        </>
      )}
    </svg>
  );
};

const Logo: React.FC<{ m: boolean }> = ({ m }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: m ? 38 : 42, height: m ? 38 : 42, borderRadius: 21, background: P, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 3px ${SAF}` }}>
      <Ic d={I.utensils} s={m ? 20 : 22} c="#fff" w={2.1} />
    </div>
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontSize: m ? 19 : 21, fontWeight: 800, color: PD }}>Shatkora</div>
      <div style={{ fontSize: m ? 11 : 12, fontWeight: 800, color: P, letterSpacing: 2.4 }}>KITCHEN · SYLHET</div>
    </div>
  </div>
);

export const RestaurantSite: React.FC<SiteProps> = ({ mode, scroll = 0, reveal = 1 }) => {
  const m = mode === "mobile";
  const pad = m ? 20 : 48;

  const header = m ? (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 14, background: CREAM }}>
      <Logo m />
      <div style={{ marginLeft: "auto", position: "relative" }}>
        <Ic d={I.bag} s={27} c={PD} w={2.2} />
        <div style={{ position: "absolute", top: -6, right: -8, width: 20, height: 20, borderRadius: 10, background: SAF, color: PD, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
      </div>
      <Ic d={I.menu} s={28} c={PD} w={2.4} />
    </div>
  ) : (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 28, background: CREAM }}>
      <Logo m={false} />
      <div style={{ display: "flex", gap: 26, marginLeft: 30, fontSize: 16, fontWeight: 700, color: "#5a3a30" }}>
        <span style={{ color: P }}>Menu</span>
        <span>Order Online</span>
        <span>Reservation</span>
        <span>Catering</span>
        <span>Contact</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: PD }}>
        <Ic d={I.bag} s={22} c={PD} /> ৳1,050
      </div>
      <Btn bg={P} h={42} fs={15} px={18}>
        Book a Table
      </Btn>
    </div>
  );

  const hero = (
    <div style={{ height: "100%", background: `radial-gradient(circle at 78% 46%, #F7D9A8 0%, ${CREAM} 46%)`, padding: m ? `24px ${pad}px 0` : `40px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 8 : 20, position: "relative" }}>
      <div style={{ flex: m ? "none" : 1.1, paddingTop: m ? 0 : 26 }}>
        <div style={{ fontFamily: BN, fontSize: m ? 17 : 19, fontWeight: 700, color: P }}>জিন্দাবাজারের আসল সিলেটি স্বাদ</div>
        <div style={{ fontSize: m ? 38 : 54, lineHeight: 1.04, fontWeight: 800, color: PD, marginTop: 10, letterSpacing: -1 }}>
          Slow-cooked <span style={{ color: P }}>Shatkora</span> beef, just like home.
        </div>
        <div style={{ fontSize: m ? 17 : 19, lineHeight: 1.5, color: "#6b4c40", marginTop: 14, fontWeight: 600 }}>Akhni, kacchi, handesh and seven-layer tea — order online or reserve a family table.</div>
        <div style={{ display: "flex", gap: 12, marginTop: m ? 18 : 26 }}>
          <Btn bg={P} h={m ? 52 : 56} fs={m ? 17 : 18} icon={I.bag} style={{ flex: m ? 1 : undefined }}>
            Order Now
          </Btn>
          <Btn bg={PD} outline h={m ? 52 : 56} fs={m ? 17 : 18} icon={I.cal} style={{ flex: m ? 1 : undefined }}>
            Reserve
          </Btn>
        </div>
        <div style={{ display: "flex", gap: m ? 16 : 28, marginTop: m ? 16 : 30, fontSize: m ? 14 : 16, fontWeight: 700, color: "#5a3a30" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Stars s={15} /> 4.7
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Ic d={I.truck} s={18} c={P} /> 35 min delivery
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Ic d={I.clock} s={18} c={P} /> 11am – 11pm
          </div>
        </div>
      </div>
      <div style={{ flex: m ? "none" : 1, position: "relative", height: m ? 300 : 470 }}>
        <div style={{ position: "absolute", left: m ? 46 : 40, top: m ? 0 : 20 }}>
          <Plate k="beef" s={m ? 260 : 380} />
        </div>
        <div style={{ position: "absolute", right: m ? 4 : 0, top: m ? 160 : 290 }}>
          <Plate k="pitha" s={m ? 120 : 170} />
        </div>
        <div style={{ position: "absolute", left: m ? -4 : -10, top: m ? 170 : 300 }}>
          <Plate k="tea" s={m ? 110 : 160} />
        </div>
        {!m && (
          <div style={{ position: "absolute", right: 10, top: 30, background: "#fff", borderRadius: 18, padding: "12px 16px", boxShadow: "0 12px 30px rgba(58,20,13,0.16)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#8a6a5d" }}>Today's special</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: PD }}>Shatkora Beef</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: P }}>৳420</div>
          </div>
        )}
      </div>
    </div>
  );

  const cats = ["All", "Rice", "Curry", "Kebab", "Dessert", "Tea"];
  const menu = (
    <div style={{ height: "100%", background: "#fff", padding: m ? `28px ${pad}px 0` : `40px ${pad}px 0` }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: m ? 32 : 40, fontWeight: 800, color: PD, letterSpacing: -0.5 }}>Our Menu</div>
          <div style={{ fontFamily: BN, fontSize: m ? 16 : 18, color: "#7a5a4d", fontWeight: 600 }}>প্রতিদিন তাজা রান্না, সিলেটি মসলায়</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: m ? 8 : 10, marginTop: 18, overflow: "hidden" }}>
        {cats.map((c, i) => (
          <div key={c} style={{ height: m ? 38 : 40, padding: m ? "0 15px" : "0 18px", borderRadius: 12, background: i === 0 ? PD : "#F7EFE4", color: i === 0 ? "#fff" : "#6b4c40", fontSize: m ? 15 : 16, fontWeight: 700, display: "flex", alignItems: "center", flex: "none" }}>
            {c}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: m ? 12 : 16, marginTop: m ? 18 : 22 }}>
        {MENU.map((x, i) => (
          <div key={x.en} style={{ display: "flex", alignItems: "center", gap: 14, borderRadius: 20, background: CREAM, padding: m ? "10px 12px" : "12px 16px", height: m ? 106 : 120, boxSizing: "border-box" }}>
            <Plate k={x.k} s={m ? 84 : 94} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontFamily: BN, fontSize: m ? 19 : 20, fontWeight: 700, color: PD, whiteSpace: "nowrap" }}>{x.bn}</div>
                {x.spicy && <Ic d={I.flame} s={17} c="#E2603A" fill="#F3A27F" w={1.8} />}
              </div>
              <div style={{ fontSize: m ? 14 : 15, fontWeight: 600, color: "#8a6a5d" }}>{x.en}</div>
              <div style={{ fontSize: m ? 19 : 21, fontWeight: 800, color: P, marginTop: 4 }}>৳{x.p}</div>
            </div>
            <div style={{ width: m ? 42 : 44, height: m ? 42 : 44, borderRadius: 14, background: i < 2 ? P : "#fff", boxShadow: i < 2 ? "none" : `inset 0 0 0 2px ${P}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic d={i < 2 ? I.check : I.plus} s={22} c={i < 2 ? "#fff" : P} w={2.6} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const cart = [
    { n: "Shatkora Beef", q: 1, p: 420 },
    { n: "Kacchi Biryani (Full)", q: 1, p: 350 },
    { n: "Akhni Pulao", q: 1, p: 280 },
  ];
  const sub = cart.reduce((a, c) => a + c.q * c.p, 0);
  const cartCard = (
    <div style={{ background: "#fff", borderRadius: 24, padding: m ? 18 : 24, boxShadow: "0 16px 40px rgba(58,20,13,0.12)", width: m ? undefined : 440, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Ic d={I.bag} s={24} c={P} />
        <div style={{ fontSize: m ? 22 : 24, fontWeight: 800, color: PD }}>Your order</div>
        <div style={{ marginLeft: "auto", fontSize: 15, fontWeight: 700, color: "#8a6a5d" }}>3 items</div>
      </div>
      {cart.map((c) => (
        <div key={c.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: "1px solid #F2E8DC" }}>
          <div style={{ flex: 1, fontSize: m ? 16 : 17, fontWeight: 700, color: "#3a2a24" }}>{c.n}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: CREAM, borderRadius: 10, padding: "4px 8px" }}>
            <Ic d={I.minus} s={16} c={P} w={2.6} />
            <span style={{ fontSize: 16, fontWeight: 800 }}>{c.q}</span>
            <Ic d={I.plus} s={16} c={P} w={2.6} />
          </div>
          <div style={{ width: 64, textAlign: "right", fontSize: 17, fontWeight: 800, color: PD }}>৳{c.p}</div>
        </div>
      ))}
      {[
        ["Subtotal", `৳${sub.toLocaleString("en-IN")}`],
        ["Delivery (Zindabazar)", "৳40"],
      ].map(([a, b]) => (
        <div key={a} style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#7a5a4d", marginTop: 10 }}>
          <span>{a}</span>
          <span>{b}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: m ? 22 : 24, fontWeight: 800, color: PD, marginTop: 12 }}>
        <span>Total</span>
        <span>৳{(sub + 40).toLocaleString("en-IN")}</span>
      </div>
      <Btn bg={P} h={m ? 54 : 54} fs={18} full r={14} style={{ marginTop: 14 }} icon={I.arrowR}>
        Checkout
      </Btn>
    </div>
  );
  const pay = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
      {!m && <div style={{ fontSize: 34, fontWeight: 800, color: PD, letterSpacing: -0.5 }}>Hot food at your door</div>}
      {[
        { d: I.truck, t: "Free delivery over ৳1,500", s: "Zindabazar, Amberkhana, Uposhohor" },
        { d: I.cash, t: "Pay on delivery or online", s: "bKash · Nagad · Card" },
        { d: I.clock, t: "Ready in 25–35 minutes", s: "Live order status by SMS" },
      ].map((x) => (
        <div key={x.t} style={{ display: "flex", gap: 14, alignItems: "center", background: "#fff", borderRadius: 18, padding: m ? "12px 14px" : "14px 16px", boxShadow: "0 6px 16px rgba(58,20,13,0.06)" }}>
          <IconTile d={x.d} bg="#FBE7D0" c={P} s={m ? 46 : 50} r={14} />
          <div>
            <div style={{ fontSize: m ? 17 : 18, fontWeight: 800, color: PD }}>{x.t}</div>
            <div style={{ fontSize: m ? 14 : 15, fontWeight: 600, color: "#8a6a5d" }}>{x.s}</div>
          </div>
        </div>
      ))}
      {!m && (
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {[
            ["bKash", "#E2136E"],
            ["Nagad", "#EC1C24"],
            ["VISA / Master", "#1A1F71"],
          ].map(([n, c]) => (
            <div key={n} style={{ height: 40, padding: "0 16px", borderRadius: 10, background: "#fff", boxShadow: "inset 0 0 0 1.5px #EEE2D3", color: c, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center" }}>
              {n}
            </div>
          ))}
        </div>
      )}
    </div>
  );
  const order = (
    <div style={{ height: "100%", background: CREAM, padding: m ? `26px ${pad}px 0` : `40px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 14 : 34 }}>
      {m && <div style={{ fontSize: 30, fontWeight: 800, color: PD }}>Order online</div>}
      {cartCard}
      {!m && pay}
      {m && (
        <div style={{ display: "flex", gap: 10 }}>
          {[
            ["bKash", "#E2136E"],
            ["Nagad", "#EC1C24"],
            ["Cash", "#3A140D"],
          ].map(([n, c]) => (
            <div key={n} style={{ flex: 1, height: 44, borderRadius: 12, background: "#fff", color: c, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1.5px #EEE2D3" }}>
              {n}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const reserve = (
    <div style={{ height: "100%", background: PD, padding: m ? `28px ${pad}px 0` : `44px ${pad}px 0`, display: "flex", flexDirection: m ? "column" : "row", gap: m ? 18 : 40, color: "#fff" }}>
      <div style={{ flex: m ? "none" : 0.9 }}>
        <div style={{ fontSize: m ? 30 : 38, fontWeight: 800, letterSpacing: -0.5 }}>Reserve a table</div>
        <div style={{ fontFamily: BN, fontSize: m ? 16 : 18, color: "#E9CFC3", fontWeight: 600, marginTop: 6, lineHeight: 1.5 }}>পরিবার নিয়ে আসছেন? আগে থেকে টেবিল বুক করুন — ২০ জনের পার্টি হলও আছে।</div>
        {!m && (
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14, fontSize: 17, fontWeight: 700, color: "#F3E2D8" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Ic d={I.pin} s={20} c={SAF} /> Level 2, Al-Hamra Shopping City, Zindabazar, Sylhet
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Ic d={I.phone} s={20} c={SAF} /> 01733-219840
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Ic d={I.clock} s={20} c={SAF} /> Every day, 11:00 AM – 11:00 PM
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, background: "#fff", borderRadius: 24, padding: m ? 18 : 24, color: PD, display: "flex", flexDirection: "column", gap: 12, alignSelf: "flex-start", width: m ? undefined : "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Date" value="Fri, 21 Nov" icon={I.cal} />
          <Field label="Time" value="8:00 PM" icon={I.clock} select />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#5b6675" }}>Guests</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[2, 4, 6, 8, "10+"].map((g, i) => (
            <div key={String(g)} style={{ flex: 1, height: 44, borderRadius: 12, background: i === 2 ? P : CREAM, color: i === 2 ? "#fff" : PD, fontSize: 17, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {g}
            </div>
          ))}
        </div>
        <Field label="Name & phone" value="Rafiq Ahmed · 01712-640358" icon={I.user} />
        <Btn bg={SAF} c={PD} h={52} fs={18} full r={14} icon={I.check}>
          Confirm booking
        </Btn>
      </div>
    </div>
  );

  const footer = (
    <div style={{ height: "100%", background: "#260C07", color: "#D9BFB3", padding: m ? `24px ${pad}px` : `30px ${pad}px`, boxSizing: "border-box", display: "flex", flexDirection: m ? "column" : "row", gap: m ? 10 : 0, justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Shatkora Kitchen</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>01733-219840 · Zindabazar, Sylhet</div>
      </div>
      <div style={{ alignSelf: m ? "flex-start" : "flex-end", textAlign: m ? "left" : "right" }}>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>© 2026 Shatkora Kitchen</div>
        <Credit c="#B8998C" />
      </div>
    </div>
  );

  return (
    <SiteShell
      def={RESTAURANT}
      mode={mode}
      scroll={scroll}
      reveal={reveal}
      bg={CREAM}
      headerBg={CREAM}
      header={header}
      sections={{ hero, menu, order, reserve, footer }}
      floating={
        m ? (
          <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, height: 58, borderRadius: 18, background: P, boxShadow: "0 12px 26px rgba(156,47,30,0.4)", display: "flex", alignItems: "center", padding: "0 18px", color: "#fff", fontSize: 17, fontWeight: 800 }}>
            <Ic d={I.bag} s={22} c="#fff" /> <span style={{ marginLeft: 10 }}>3 items</span>
            <span style={{ marginLeft: "auto" }}>View cart · ৳1,090</span>
          </div>
        ) : undefined
      }
    />
  );
};
