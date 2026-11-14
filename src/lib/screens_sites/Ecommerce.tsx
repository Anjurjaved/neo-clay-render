// Nakshi Threads — পোশাকের online shop (hero, product grid, cart, checkout with bKash/Nagad/COD)
import React from "react";
import { SiteDef, SiteProps, SiteShell, Ic, I, Btn, Field, Credit, Stars, BN } from "./ui";

const P = "#1E3A34"; // deep bottle green
const ACC = "#C8553D"; // terracotta
const SAND = "#F6F1EA";

export const ECOMMERCE: SiteDef = {
  url: "nakshithreads.com",
  header: { desktop: 68, mobile: 62 },
  sections: [
    { key: "hero", h: { desktop: 572, mobile: 640 } },
    { key: "products", h: { desktop: 640, mobile: 960 } },
    { key: "cart", h: { desktop: 470, mobile: 560 } },
    { key: "checkout", h: { desktop: 560, mobile: 760 } },
    { key: "footer", h: { desktop: 150, mobile: 170 } },
  ],
};

type G = "panjabi" | "saree" | "kurti" | "polo" | "kids" | "shawl" | "fatua" | "three";
const PRODUCTS: { g: G; n: string; p: number; old?: number; c: string; bg: string; tag?: string }[] = [
  { g: "panjabi", n: "Cotton Panjabi — Ivory", p: 1850, old: 2300, c: "#EFE6D2", bg: "#E9E2D6" },
  { g: "saree", n: "Dhakai Jamdani Saree", p: 6500, c: "#B23A48", bg: "#F3DCD8" },
  { g: "kurti", n: "Block-print Kurti", p: 1250, old: 1490, c: "#3D6E8F", bg: "#DCE7EE" },
  { g: "polo", n: "Pique Polo Tee", p: 690, c: "#2F5D50", bg: "#DDE9E2" },
  { g: "kids", n: "Kids Panjabi Set", p: 990, c: "#E3A72F", bg: "#F6EBCF" },
  { g: "shawl", n: "Winter Wool Shawl", p: 1450, c: "#7A4E3B", bg: "#EEE0D6" },
  { g: "fatua", n: "Khadi Fatua", p: 890, c: "#6B7F3A", bg: "#E7EBD6" },
  { g: "three", n: "Lawn Three-piece", p: 2750, old: 3200, c: "#8E5A9E", bg: "#ECE0F0" },
];

/** পোশাকের silhouette — hanger-এ ঝোলানো */
const Garment: React.FC<{ g: G; c: string; s: number }> = ({ g, c, s }) => {
  const dark = "rgba(0,0,0,0.14)";
  const lite = "rgba(255,255,255,0.35)";
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" style={{ display: "block" }}>
      <path d="M60 8 q6 0 6 6 q0 4 -6 6 L30 30 H90 L60 20" stroke="#9A8F80" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {(g === "panjabi" || g === "kids" || g === "fatua") && (
        <>
          <path d={`M42 26 L30 32 L18 64 L28 68 L36 48 L36 ${g === "fatua" ? 88 : 112} H84 V48 L92 68 L102 64 L90 32 L78 26 Q60 34 42 26Z`} fill={c} />
          <path d="M54 28 L60 36 L66 28" stroke={dark} strokeWidth="2" fill="none" />
          <path d={`M60 36 V${g === "fatua" ? 62 : 70}`} stroke={dark} strokeWidth="2" />
          {[44, 52, 60].map((y) => (
            <circle key={y} cx="60" cy={y} r="1.8" fill={g === "kids" ? "#fff" : "#8C7B5E"} />
          ))}
          <path d={`M36 ${g === "fatua" ? 80 : 104} H84`} stroke={dark} strokeWidth="1.5" />
          <path d="M40 40 L40 100" stroke={lite} strokeWidth="5" opacity="0.6" />
        </>
      )}
      {g === "polo" && (
        <>
          <path d="M42 28 L22 38 L14 56 L28 62 L34 52 V100 H86 V52 L92 62 L106 56 L98 38 L78 28 Q60 36 42 28Z" fill={c} />
          <path d="M48 28 L60 40 L72 28 L66 26 L60 32 L54 26Z" fill="#fff" />
          <path d="M60 40 V54" stroke="#fff" strokeWidth="2" />
          <path d="M40 40 L40 96" stroke={lite} strokeWidth="5" opacity="0.5" />
        </>
      )}
      {(g === "kurti" || g === "three") && (
        <>
          <path d="M44 26 L32 32 L24 60 L33 62 L38 46 L32 108 H88 L82 46 L87 62 L96 60 L88 32 L76 26 Q60 38 44 26Z" fill={c} />
          {[50, 66, 82, 98].map((y) =>
            [42, 54, 66, 78].map((x) => <circle key={x + "-" + y} cx={x + (y % 32 === 2 ? 6 : 0)} cy={y} r="2.6" fill={lite} />)
          )}
          <path d="M32 104 H88" stroke="#fff" strokeWidth="3" opacity="0.6" />
          {g === "three" && <path d="M86 30 Q104 60 92 112" stroke="#D9B3E3" strokeWidth="9" fill="none" strokeLinecap="round" />}
        </>
      )}
      {g === "saree" && (
        <>
          <path d="M30 30 H90 Q98 70 92 112 H28 Q22 70 30 30Z" fill={c} />
          <path d="M30 30 Q60 60 92 112" stroke="#E8C46A" strokeWidth="9" fill="none" />
          <path d="M30 30 Q60 60 92 112" stroke="#B0832C" strokeWidth="2" strokeDasharray="3 4" fill="none" />
          {[[44, 70], [56, 92], [40, 96], [70, 64], [76, 44]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y}Z`} fill="#F4D9A0" opacity="0.85" />
          ))}
          <path d="M28 106 H92" stroke="#E8C46A" strokeWidth="6" />
        </>
      )}
      {g === "shawl" && (
        <>
          <path d="M28 30 H92 V96 H28Z" fill={c} />
          <path d="M28 30 H92 V96 H28Z" fill="none" stroke="#C99B6D" strokeWidth="4" strokeDasharray="2 5" />
          {[42, 56, 70, 84].map((y) => (
            <path key={y} d={`M28 ${y} H92`} stroke={lite} strokeWidth="2" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d={`M${31 + i * 5.3} 96 V108`} stroke={c} strokeWidth="2.2" strokeLinecap="round" />
          ))}
        </>
      )}
    </svg>
  );
};

const money = (n: number) => "৳" + n.toLocaleString("en-IN");

const Logo: React.FC<{ m: boolean }> = ({ m }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
    <div style={{ fontSize: m ? 24 : 26, fontWeight: 800, color: P, letterSpacing: -0.8 }}>nakshi</div>
    <div style={{ fontSize: m ? 13 : 14, fontWeight: 800, color: ACC, letterSpacing: 3 }}>THREADS</div>
  </div>
);

export const EcommerceSite: React.FC<SiteProps> = ({ mode, scroll = 0, reveal = 1 }) => {
  const m = mode === "mobile";
  const pad = m ? 18 : 48;

  const cartBadge = (
    <div style={{ position: "relative" }}>
      <Ic d={I.bag} s={m ? 26 : 24} c={P} w={2.2} />
      <div style={{ position: "absolute", top: -7, right: -9, width: 20, height: 20, borderRadius: 10, background: ACC, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
    </div>
  );
  const header = m ? (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 16 }}>
      <Ic d={I.menu} s={26} c={P} w={2.4} />
      <Logo m />
      <div style={{ marginLeft: "auto" }}>
        <Ic d={I.search} s={24} c={P} w={2.2} />
      </div>
      {cartBadge}
    </div>
  ) : (
    <div style={{ height: "100%", display: "flex", alignItems: "center", padding: `0 ${pad}px`, gap: 26 }}>
      <Logo m={false} />
      <div style={{ display: "flex", gap: 22, marginLeft: 16, fontSize: 16, fontWeight: 700, color: "#3d4a47" }}>
        <span style={{ color: P }}>Men</span>
        <span>Women</span>
        <span>Kids</span>
        <span>Winter</span>
        <span style={{ color: ACC }}>Sale</span>
      </div>
      <div style={{ marginLeft: "auto", width: 230, height: 40, borderRadius: 12, background: SAND, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", fontSize: 15, fontWeight: 600, color: "#8a918f" }}>
        <Ic d={I.search} s={18} c="#8a918f" /> Search panjabi, saree…
      </div>
      <Ic d={I.heart} s={24} c={P} w={2.2} />
      {cartBadge}
    </div>
  );

  const hero = (
    <div style={{ height: "100%", background: SAND, padding: m ? `0 0 0` : `28px ${pad}px 0` }}>
      <div style={{ height: m ? "auto" : 410, borderRadius: m ? 0 : 30, background: `linear-gradient(120deg, ${P} 0%, #2F5A50 100%)`, display: "flex", flexDirection: m ? "column" : "row", overflow: "hidden", position: "relative", padding: m ? `26px ${pad}px 20px` : "0 0 0 50px" }}>
        <div style={{ flex: 1, color: "#fff", paddingTop: m ? 0 : 60 }}>
          <div style={{ fontSize: m ? 15 : 16, fontWeight: 800, color: "#F1C27D", letterSpacing: 2 }}>WINTER COLLECTION 2026</div>
          <div style={{ fontSize: m ? 38 : 52, fontWeight: 800, lineHeight: 1.04, marginTop: 10, letterSpacing: -1 }}>Handloom comfort for cold Dhaka evenings</div>
          <div style={{ fontFamily: BN, fontSize: m ? 16 : 18, fontWeight: 600, color: "#D3E2DD", marginTop: 12 }}>ঢাকার ভেতরে ২৪ ঘণ্টায় ডেলিভারি · ৭ দিনের সহজ রিটার্ন</div>
          <div style={{ display: "flex", gap: 12, marginTop: m ? 18 : 26 }}>
            <Btn bg="#F1C27D" c={P} h={m ? 50 : 54} fs={m ? 17 : 18} icon={I.bag}>
              Shop now
            </Btn>
            {!m && (
              <Btn bg="#fff" outline h={54} fs={18}>
                View lookbook
              </Btn>
            )}
          </div>
        </div>
        <div style={{ width: m ? "100%" : 420, height: m ? 250 : 410, position: "relative", marginTop: m ? 6 : 0 }}>
          <div style={{ position: "absolute", width: m ? 230 : 330, height: m ? 230 : 330, borderRadius: "50%", background: "radial-gradient(circle, rgba(241,194,125,0.45), rgba(241,194,125,0) 70%)", left: m ? 60 : 50, top: m ? 10 : 40 }} />
          <div style={{ position: "absolute", left: m ? 20 : 30, top: m ? 20 : 60 }}>
            <Garment g="panjabi" c="#EFE6D2" s={m ? 200 : 290} />
          </div>
          <div style={{ position: "absolute", left: m ? 170 : 200, top: m ? 46 : 100 }}>
            <Garment g="shawl" c="#B9774F" s={m ? 170 : 240} />
          </div>
        </div>
        <div style={{ position: "absolute", right: m ? 16 : 30, top: m ? undefined : 30, bottom: m ? 20 : undefined, background: ACC, color: "#fff", borderRadius: 18, padding: "10px 14px", textAlign: "center", lineHeight: 1.05 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>UP TO</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>30%</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>OFF</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: m ? 8 : 16, padding: m ? `16px ${pad}px 0` : "20px 0 0", justifyContent: "space-between" }}>
        {[
          { d: I.truck, t: m ? "24h Dhaka" : "24h delivery in Dhaka" },
          { d: I.return, t: m ? "7-day return" : "7-day easy return" },
          { d: I.cash, t: m ? "Cash on delivery" : "Cash on delivery" },
          ...(m ? [] : [{ d: I.shield, t: "100% original fabric" }]),
        ].map((x) => (
          <div key={x.t} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, fontSize: m ? 13 : 16, fontWeight: 700, color: P, background: m ? "#fff" : "transparent", borderRadius: 12, padding: m ? "10px 8px" : 0, flexDirection: m ? "column" : "row", textAlign: "center" }}>
            <Ic d={x.d} s={m ? 22 : 22} c={ACC} /> {x.t}
          </div>
        ))}
      </div>
    </div>
  );

  const list = m ? PRODUCTS.slice(0, 6) : PRODUCTS;
  const products = (
    <div style={{ height: "100%", background: "#fff", padding: m ? `26px ${pad}px 0` : `36px ${pad}px 0` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: m ? 28 : 34, fontWeight: 800, color: P, letterSpacing: -0.5 }}>New arrivals</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", borderRadius: 12, boxShadow: "inset 0 0 0 1.5px #E2E6E4", fontSize: 15, fontWeight: 700, color: P }}>
          <Ic d={I.filter} s={16} c={P} /> {m ? "Filter" : "Sort: Popular"}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: m ? 12 : 18, marginTop: m ? 16 : 22 }}>
        {list.map((x, i) => (
          <div key={x.n} style={{ height: m ? 272 : 262 }}>
            <div style={{ height: m ? 180 : 170, borderRadius: 18, background: x.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Garment g={x.g} c={x.c} s={m ? 160 : 150} />
              <div style={{ position: "absolute", top: 10, right: 10, width: 34, height: 34, borderRadius: 17, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic d={I.heart} s={17} c={i === 1 ? ACC : "#5e6b68"} fill={i === 1 ? ACC : "none"} />
              </div>
              {x.old && <div style={{ position: "absolute", top: 12, left: 12, fontSize: 13, fontWeight: 800, color: ACC }}>-{Math.round((1 - x.p / x.old) * 100)}%</div>}
            </div>
            <div style={{ fontSize: m ? 15 : 16, fontWeight: 700, color: "#25302d", marginTop: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.n}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <div style={{ fontSize: m ? 18 : 19, fontWeight: 800, color: P }}>{money(x.p)}</div>
              {x.old && <div style={{ fontSize: 14, fontWeight: 700, color: "#a0a8a6", textDecoration: "line-through" }}>{money(x.old)}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 13, fontWeight: 700, color: "#7c8784" }}>
              <Stars s={12} n={i % 3 === 2 ? 4 : 5} /> ({18 + ((i * 37) % 90)})
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const cartItems = [
    { g: "panjabi" as G, n: "Cotton Panjabi — Ivory", v: "Size: L", p: 1850, c: "#EFE6D2", bg: "#E9E2D6", q: 1 },
    { g: "saree" as G, n: "Dhakai Jamdani Saree", v: "Maroon · Half-silk", p: 6500, c: "#B23A48", bg: "#F3DCD8", q: 1 },
  ];
  const subtotal = cartItems.reduce((a, c) => a + c.p * c.q, 0);
  const summary = (
    <div style={{ background: SAND, borderRadius: 22, padding: m ? 18 : 24, width: m ? "100%" : 330, boxSizing: "border-box", alignSelf: "flex-start" }}>
      {[
        ["Subtotal", money(subtotal)],
        ["Delivery (Inside Dhaka)", "৳70"],
        ["Coupon WINTER10", "−৳835"],
      ].map(([a, b], i) => (
        <div key={a} style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: i === 2 ? ACC : "#55615e", marginBottom: 10 }}>
          <span>{a}</span>
          <span>{b}</span>
        </div>
      ))}
      <div style={{ height: 1, background: "#E2DACE", margin: "4px 0 12px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 800, color: P }}>
        <span>Total</span>
        <span>{money(subtotal + 70 - 835)}</span>
      </div>
      <Btn bg={P} h={52} fs={18} full r={14} style={{ marginTop: 14 }} icon={I.lock}>
        Checkout
      </Btn>
    </div>
  );
  const cart = (
    <div style={{ height: "100%", background: "#fff", padding: m ? `24px ${pad}px 0` : `36px ${pad}px 0` }}>
      <div style={{ fontSize: m ? 28 : 34, fontWeight: 800, color: P, letterSpacing: -0.5 }}>Your cart</div>
      <div style={{ display: "flex", flexDirection: m ? "column" : "row", gap: m ? 14 : 30, marginTop: m ? 14 : 20 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {cartItems.map((c) => (
            <div key={c.n} style={{ display: "flex", gap: 14, alignItems: "center", padding: m ? 10 : 14, borderRadius: 20, boxShadow: "inset 0 0 0 1.5px #ECEFEE" }}>
              <div style={{ width: m ? 84 : 104, height: m ? 84 : 104, borderRadius: 14, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Garment g={c.g} c={c.c} s={m ? 76 : 94} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: m ? 16 : 18, fontWeight: 800, color: "#25302d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.n}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#7c8784", marginTop: 2 }}>{c.v}</div>
                <div style={{ display: "flex", alignItems: "center", marginTop: 8, gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: SAND, borderRadius: 10, padding: "5px 10px" }}>
                    <Ic d={I.minus} s={15} c={P} w={2.6} />
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{c.q}</span>
                    <Ic d={I.plus} s={15} c={P} w={2.6} />
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: m ? 18 : 20, fontWeight: 800, color: P }}>{money(c.p)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {summary}
      </div>
    </div>
  );

  const payRow = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        { n: "bKash", s: "Pay with bKash account", c: "#E2136E", on: true },
        { n: "Nagad", s: "Pay with Nagad account", c: "#EC1C24", on: false },
        { n: "Cash on Delivery", s: "Pay when you receive", c: P, on: false },
      ].map((x) => (
        <div key={x.n} style={{ display: "flex", alignItems: "center", gap: 12, height: m ? 58 : 60, borderRadius: 14, padding: "0 14px", background: x.on ? "#FDF0F6" : "#fff", boxShadow: `inset 0 0 0 ${x.on ? 2 : 1.5}px ${x.on ? x.c : "#E2E6E4"}` }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, boxShadow: `inset 0 0 0 2px ${x.on ? x.c : "#B7BFBD"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{x.on && <div style={{ width: 12, height: 12, borderRadius: 6, background: x.c }} />}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: x.c }}>{x.n}</div>
          <div style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: "#7c8784" }}>{x.s}</div>
        </div>
      ))}
    </div>
  );
  const checkout = (
    <div style={{ height: "100%", background: SAND, padding: m ? `24px ${pad}px 0` : `36px ${pad}px 0` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: m ? 28 : 34, fontWeight: 800, color: P, letterSpacing: -0.5 }}>Checkout</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#2E8B57" }}>
          <Ic d={I.lock} s={15} c="#2E8B57" /> Secure
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: m ? "column" : "row", gap: m ? 14 : 26, marginTop: m ? 14 : 20 }}>
        <div style={{ flex: 1, background: "#fff", borderRadius: 22, padding: m ? 16 : 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: P }}>Delivery address</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Full name" value="Tasnim Rahman" />
            <Field label="Mobile" value="01914-552310" />
          </div>
          <Field label="Address" value="Flat 5B, Road 11, Banani, Dhaka" icon={I.pin} />
          <Field label="Area" value="Inside Dhaka — ৳70" select />
        </div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 22, padding: m ? 16 : 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: P }}>Payment</div>
          {payRow}
          <Btn bg={ACC} h={54} fs={18} full r={14} icon={I.check}>
            Place order · {money(subtotal + 70 - 835)}
          </Btn>
        </div>
      </div>
    </div>
  );

  const footer = (
    <div style={{ height: "100%", background: P, color: "#BFD3CD", padding: m ? `24px ${pad}px` : `30px ${pad}px`, boxSizing: "border-box", display: "flex", flexDirection: m ? "column" : "row", gap: m ? 10 : 0, justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>nakshi threads</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>Hotline 09613-447120 · Dhanmondi 27, Dhaka</div>
      </div>
      <div style={{ alignSelf: m ? "flex-start" : "flex-end", textAlign: m ? "left" : "right" }}>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>© 2026 Nakshi Threads</div>
        <Credit c="#9DB8B0" />
      </div>
    </div>
  );

  return <SiteShell def={ECOMMERCE} mode={mode} scroll={scroll} reveal={reveal} bg="#fff" header={header} sections={{ hero, products, cart, checkout, footer }} />;
};
