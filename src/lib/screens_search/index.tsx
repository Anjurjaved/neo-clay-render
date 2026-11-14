import React from "react";
import { LibItem } from "../types";
import { springStep } from "../../kit/anim";
import { PhoneShow, TabletShow, useT, typeN, caretOn, rng, easeInOut } from "./ui";
import { GoogleResultsMobile, GoogleResultsDesktop, SYLHET_DENTIST } from "./GoogleResults";
import { GoogleMapsMobile, GoogleMapsDesktop, PIN_AT } from "./GoogleMaps";
import { BrowserDesktop, BrowserMobile, DentalSiteDesktop, DentalSiteMobile, Tab } from "./Browser";
import { AiAnswerMobile, AiAnswerDesktop, AI_Q } from "./AiAnswer";

const G = "screens_search";

/* -------- Google results: type → suggestions → load → reveal → scroll → Your Shop climbs #4 → #1 -------- */
const Q = "dentist sylhet";
const resultsState = (t: number) => {
  const n = typeN(Q, t, 0.45, 1.6);
  const typing = t < 1.85;
  const climb = springStep(t - 3.35, { k: 46, c: 7.5 }); // overshoot past #1 and settle
  const pos: Record<string, number> = {};
  SYLHET_DENTIST.forEach((r, i) => {
    if (r.mine) pos[r.id] = 3 - 3 * climb;
    else if (i < 3) pos[r.id] = i + springStep(t - 3.45 - i * 0.06, { k: 60, c: 10 });
    else pos[r.id] = i;
  });
  const scroll = 150 * easeInOut(rng(t, 2.55, 3.1)) * (1 - easeInOut(rng(t, 3.35, 4.1)));
  return {
    query: Q.slice(0, n),
    caret: typing && caretOn(t),
    suggest: t < 0.5 ? 0 : 1 - rng(t, 1.75, 1.9),
    loading: t > 1.85 && t < 2.45 ? easeInOut(rng(t, 1.85, 2.4)) : -1,
    reveal: rng(t, 2.15, 2.75),
    pos,
    scroll,
    highlight: rng(t, 2.9, 3.3) * (0.55 + 0.45 * rng(t, 4.1, 4.5)),
  };
};
const ResultsShow: React.FC = () => {
  const t = useT();
  return <PhoneShow t={t} ui={<GoogleResultsMobile {...resultsState(t)} />} />;
};
const ResultsDesktopShow: React.FC = () => {
  const t = useT();
  const s = resultsState(t);
  return <TabletShow t={t} ui={<GoogleResultsDesktop {...s} scroll={s.scroll * 0.4} />} />;
};

/* -------- Google Maps: zoom in → pin drops → profile sheet → photos scroll → Directions → route -------- */
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const MapsShow: React.FC = () => {
  const t = useT();
  const zin = easeInOut(rng(t, 0.15, 1.7));
  const zout = easeInOut(rng(t, 4.6, 5.5));
  const sheetUp = springStep(t - 1.65, { k: 120, c: 14 });
  const sheetDown = springStep(t - 4.6, { k: 110, c: 15 });
  return (
    <PhoneShow
      t={t}
      ui={
        <GoogleMapsMobile
          zoom={lerp(lerp(0.5, 0.82, zin), 0.64, zout)}
          center={[lerp(lerp(600, PIN_AT[0] + 70, zin), 420, zout), lerp(lerp(760, PIN_AT[1] - 10, zin), 600, zout)]}
          pin={springStep(t - 0.95, { k: 170, c: 8 })}
          label={rng(t, 1.3, 1.6)}
          pulse={(t * 0.8) % 1}
          sheet={sheetUp - 0.55 * sheetDown}
          photoScroll={230 * easeInOut(rng(t, 2.75, 3.75)) - 12 * Math.sin(Math.PI * rng(t, 3.75, 4.1))}
          press={0}
          pressK={rng(t, 4.25, 4.85)}
          route={easeInOut(rng(t, 4.75, 5.8))}
        />
      }
    />
  );
};
const MapsDesktopShow: React.FC = () => {
  const t = useT();
  const zin = easeInOut(rng(t, 0.15, 1.6));
  const zout = easeInOut(rng(t, 4.0, 4.9));
  return (
    <TabletShow
      t={t}
      ui={
        <GoogleMapsDesktop
          zoom={lerp(lerp(0.55, 0.85, zin), 0.7, zout)}
          center={[lerp(lerp(620, PIN_AT[0] + 40, zin), 400, zout), lerp(lerp(760, PIN_AT[1] - 20, zin), 700, zout)]}
          pin={springStep(t - 0.9, { k: 170, c: 8 })}
          label={rng(t, 1.2, 1.5)}
          pulse={(t * 0.8) % 1}
          sheet={springStep(t - 0.6, { k: 120, c: 15 })}
          photoScroll={403 * easeInOut(rng(t, 2.3, 3.0))}
          press={0}
          pressK={rng(t, 3.6, 4.2)}
          route={easeInOut(rng(t, 4.0, 5.1))}
        />
      }
    />
  );
};

/* -------- Browser: new tab → type URL (suggestion) → enter → loading bar + spinner → site paints → scroll -------- */
const URL_ = "drshirindental.com";
const browserState = (t: number) => {
  const n = typeN(URL_, t, 0.6, 1.7);
  const entered = t >= 1.85;
  // real loading: fast start, stall, finish
  const lp = rng(t, 1.85, 3.0);
  const loading = entered && lp < 1 ? Math.min(0.97, 0.55 * easeInOut(rng(lp, 0, 0.3)) + 0.25 * rng(lp, 0.3, 0.8) + 0.2 * easeInOut(rng(lp, 0.8, 1))) : -1;
  const named = t > 2.6;
  const tabs: Tab[] = [
    { title: "dentist sylhet - Google Search", fav: ["#4285F4", "G"] },
    entered ? { title: named ? "Dr. Shirin Dental Chamber | Sylhet" : URL_, fav: ["#F5952B", "S"] } : { title: "New Tab", fav: ["#5F6368", "N"] },
  ];
  return {
    tabs,
    active: 1,
    url: entered ? URL_ : URL_.slice(0, n),
    caret: !entered && t > 0.4 && caretOn(t),
    focus: entered ? 0 : rng(t, 0.3, 0.5),
    suggestion: n > 3 && !entered ? URL_ : undefined,
    loading,
    newTab: !entered || t < 2.15,
    spin: t * 540,
    reveal: rng(t, 2.15, 3.3),
    scroll: easeInOut(rng(t, 3.8, 5.2)),
  };
};
const BrowserShow: React.FC = () => {
  const t = useT();
  const s = browserState(t);
  return <TabletShow t={t} ui={<BrowserDesktop {...s} page={<DentalSiteDesktop reveal={s.reveal} scroll={400 * s.scroll} />} />} />;
};
const BrowserMobileShow: React.FC = () => {
  const t = useT();
  const s = browserState(t);
  return <PhoneShow t={t} ui={<BrowserMobile {...s} page={<DentalSiteMobile reveal={s.reveal} scroll={460 * s.scroll} />} />} />;
};

/* -------- AI answer: type question → send → searching → streamed answer, business name marked → sources -------- */
const aiState = (t: number) => {
  const n = typeN(AI_Q, t, 0.35, 1.9);
  const sentAt = 2.0;
  return {
    composer: t < sentAt ? AI_Q.slice(0, n) : "",
    caret: t < sentAt && caretOn(t),
    sent: springStep(t - sentAt, { k: 170, c: 14 }),
    searching: rng(t, 2.2, 3.0),
    stream: easeInOut(rng(t, 3.0, 5.2)) * 0.15 + rng(t, 3.0, 5.2) * 0.85,
    mark: easeInOut(rng(t, 5.2, 5.65)),
    sources: rng(t, 5.3, 5.9),
  };
};
const AiShow: React.FC = () => {
  const t = useT();
  return <PhoneShow t={t} ui={<AiAnswerMobile {...aiState(t)} scroll={105 * easeInOut(rng(t, 4.3, 6.0))} />} />;
};
const AiDesktopShow: React.FC = () => {
  const t = useT();
  return <TabletShow t={t} ui={<AiAnswerDesktop {...aiState(t)} scroll={60 * easeInOut(rng(t, 4.8, 6.0))} />} />;
};

export const ITEMS: LibItem[] = [
  {
    id: "screens-search-google-results",
    name: "Google results (mobile)",
    nameBn: "Google search result — মোবাইল",
    group: G,
    kind: "screen",
    duration: 5.5,
    still: 4.9,
    tags: ["seo", "google", "rank", "search"],
    note: "GoogleResultsMobile {query, caret, suggest, loading, results, pos{id→rank}, reveal, scroll, highlight}",
    Comp: ResultsShow,
  },
  {
    id: "screens-search-google-results-desktop",
    name: "Google results (desktop)",
    nameBn: "Google search result — desktop",
    group: G,
    kind: "screen",
    duration: 5.5,
    still: 4.9,
    tags: ["seo", "google", "rank", "search"],
    note: "GoogleResultsDesktop — same props; right-side knowledge panel for the `mine` result",
    Comp: ResultsDesktopShow,
  },
  {
    id: "screens-search-google-maps",
    name: "Google Maps business profile (mobile)",
    nameBn: "Google Maps business profile — মোবাইল",
    group: G,
    kind: "screen",
    duration: 6,
    still: 3.3,
    tags: ["local-seo", "maps", "gbp", "directions"],
    note: "GoogleMapsMobile {biz, zoom, center, pin, label, route, pulse, sheet, photoScroll, press, pressK}",
    Comp: MapsShow,
  },
  {
    id: "screens-search-google-maps-desktop",
    name: "Google Maps business profile (desktop)",
    nameBn: "Google Maps business profile — desktop",
    group: G,
    kind: "screen",
    duration: 5.5,
    still: 2.0,
    tags: ["local-seo", "maps", "gbp", "directions"],
    note: "GoogleMapsDesktop — same props + tab; side panel slides with `sheet`",
    Comp: MapsDesktopShow,
  },
  {
    id: "screens-search-browser",
    name: "Browser chrome (desktop)",
    nameBn: "Browser — URL typing, tab, loading (desktop)",
    group: G,
    kind: "screen",
    duration: 5.6,
    still: 3.6,
    tags: ["website", "browser", "launch", "visit"],
    note: "BrowserDesktop {tabs, active, url, caret, focus, suggestion, loading, newTab, page, spin}; sample page DentalSiteDesktop {reveal, scroll}",
    Comp: BrowserShow,
  },
  {
    id: "screens-search-browser-mobile",
    name: "Browser chrome (mobile)",
    nameBn: "Browser — মোবাইল",
    group: G,
    kind: "screen",
    duration: 5.6,
    still: 3.6,
    tags: ["website", "browser", "launch", "visit"],
    note: "BrowserMobile {url, caret, focus, suggestion, loading, newTab, page, tabCount}; sample page DentalSiteMobile",
    Comp: BrowserMobileShow,
  },
  {
    id: "screens-search-ai-answer",
    name: "AI answer box (mobile)",
    nameBn: "AI উত্তরে business-এর নাম — মোবাইল",
    group: G,
    kind: "screen",
    duration: 6.5,
    still: 6.0,
    tags: ["aeo", "geo", "ai-search", "chatgpt"],
    note: "AiAnswerMobile {question, composer, caret, sent, searching, stream, mark, sources, scroll, answer: Seg[][], srcs}",
    Comp: AiShow,
  },
  {
    id: "screens-search-ai-answer-desktop",
    name: "AI answer box (desktop)",
    nameBn: "AI উত্তরে business-এর নাম — desktop",
    group: G,
    kind: "screen",
    duration: 6.5,
    still: 6.0,
    tags: ["aeo", "geo", "ai-search", "chatgpt"],
    note: "AiAnswerDesktop — same props; sidebar with chat history",
    Comp: AiDesktopShow,
  },
];
