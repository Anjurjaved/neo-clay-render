// screens_sites — আসল-মানের বাংলাদেশি business website (desktop 1024×640 + mobile 390×843), scroll + reveal prop।
// প্রতিটা site component: <XSite mode="desktop"|"mobile" scroll={px} reveal={0..1}/>; section-এ scroll: anchorOf(DEF, mode, key)।
// Tablet-এ বসাতে: tabletScreen(p, <XSite mode="desktop" …/>) (1024×700 = 60 px browser bar + 640 site);
// ফোনে: phoneScreen(p, <XSite mode="mobile" …/>) (390×843, status bar + Safari bar ভেতরেই)।
import { LibItem } from "../types";
import { makeShowcase } from "./Showcase";
import { DentalSite, DENTAL } from "./Dental";
import { RestaurantSite, RESTAURANT } from "./Restaurant";
import { EcommerceSite, ECOMMERCE } from "./Ecommerce";
import { SchoolSite, SCHOOL } from "./School";
import { RealEstateSite, REALESTATE } from "./RealEstate";
import { JitSite, JIT } from "./Jit";

const G = "screens_sites";
const note = (comp: string, def: string, keys: string) => `<${comp} mode='desktop'|'mobile' scroll={px} reveal={0..1}/>; anchorOf(${def}, mode, ${keys}); maxScroll(${def}, mode)`;

export const ITEMS: LibItem[] = [
  {
    id: "screens-site-dental",
    name: "Dental chamber website",
    nameBn: "ডেন্টাল চেম্বারের website",
    group: G,
    kind: "screen",
    duration: 6,
    still: 3.2,
    tags: ["answer", "points", "price", "persona", "cta"],
    note: note("DentalSite", "DENTAL", "'treatments'|'doctor'|'serial'|'map'|'footer'"),
    Comp: makeShowcase({ Site: DentalSite, def: DENTAL, stops: { desktop: ["treatments", "doctor", "serial"], mobile: ["treatments", "doctor", "serial"] } }),
  },
  {
    id: "screens-site-restaurant",
    name: "Sylhet restaurant website",
    nameBn: "সিলেটের restaurant website",
    group: G,
    kind: "screen",
    duration: 6,
    still: 3.2,
    tags: ["answer", "points", "price", "cta"],
    note: note("RestaurantSite", "RESTAURANT", "'menu'|'order'|'reserve'|'footer'"),
    Comp: makeShowcase({ Site: RestaurantSite, def: RESTAURANT, stops: { desktop: ["menu", "order", "reserve"], mobile: ["menu", "order", "reserve"] } }),
  },
  {
    id: "screens-site-ecommerce",
    name: "Clothing e-commerce website",
    nameBn: "পোশাকের e-commerce website",
    group: G,
    kind: "screen",
    duration: 6,
    still: 3.2,
    tags: ["answer", "points", "price", "compare", "cta"],
    note: note("EcommerceSite", "ECOMMERCE", "'products'|'cart'|'checkout'|'footer'"),
    Comp: makeShowcase({ Site: EcommerceSite, def: ECOMMERCE, stops: { desktop: ["products", "cart", "checkout"], mobile: ["products", "cart", "checkout"] } }),
  },
  {
    id: "screens-site-school",
    name: "Coaching center website",
    nameBn: "কোচিং সেন্টারের website",
    group: G,
    kind: "screen",
    duration: 6,
    still: 3.2,
    tags: ["answer", "points", "price", "steps", "cta"],
    note: note("SchoolSite", "SCHOOL", "'courses'|'why'|'admission'|'footer'"),
    Comp: makeShowcase({ Site: SchoolSite, def: SCHOOL, stops: { desktop: ["courses", "why", "admission"], mobile: ["courses", "why", "admission"] } }),
  },
  {
    id: "screens-site-realestate",
    name: "Real-estate flat listing website",
    nameBn: "ফ্ল্যাট বিক্রির real-estate website",
    group: G,
    kind: "screen",
    duration: 6,
    still: 3.2,
    tags: ["answer", "points", "price", "compare", "cta"],
    note: note("RealEstateSite", "REALESTATE", "'listings'|'detail'|'enquiry'|'footer'"),
    Comp: makeShowcase({ Site: RealEstateSite, def: REALESTATE, stops: { desktop: ["listings", "detail", "enquiry"], mobile: ["listings", "detail", "enquiry"] } }),
  },
  {
    id: "screens-site-jit",
    name: "javeditsolution.com website-development page",
    nameBn: "javeditsolution.com — website development page",
    group: G,
    kind: "screen",
    duration: 6,
    still: 3.2,
    tags: ["price", "steps", "cta", "answer", "title"],
    note: note("JitSite", "JIT", "'packages'|'steps'|'contact'|'footer'") + " — real facts: ৳15,000+, 7–14 days, 01616-901396",
    Comp: makeShowcase({ Site: JitSite, def: JIT, stops: { desktop: ["packages", "steps", "contact"], mobile: ["packages", "steps", "contact"] } }),
  },
];
