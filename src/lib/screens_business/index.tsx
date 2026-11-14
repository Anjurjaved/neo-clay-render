// screens_business showcases — প্রতিটা আসল app-এর মতো DOM screen, kit Phone/Tablet-এ, আসল interaction (tap/cursor, toggle, chart, form)
import React from "react";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { FPS } from "../../kit/time";
import { range, cubicPulse } from "../../kit/anim";
import { DeviceShowcase, track, presses, Pose } from "./rig";
import { CheckoutScreen } from "./Checkout";
import { BookingScreen } from "./Booking";
import { AppStoreScreen } from "./AppStore";
import { AdminScreen, ADMIN_NOTICE } from "./Admin";
import { AnalyticsScreen, analyticsPoint } from "./Analytics";
import { InvoiceScreen } from "./Invoice";
import { typed, caretOn } from "../../kit/time";

const useT = () => useCurrentFrame() / FPS;
const fade = (t: number, a: number, b: number, c: number, d: number) => Math.min(range(t, a, b), 1 - range(t, c, d));

// ফোন: সামনে (z 4), প্রস্থের ~55%, নিচের কিনারা floor-এর উপরে; 3/4 কোণ
const PHONE_BASE: Pose = { position: [-0.3, 0.86, 4], rotation: [-0.1, -0.3, 0], scale: 2.7 };

// ---------------- checkout ----------------
const CheckoutShow: React.FC = () => {
  const t = useT();
  const tapSel = 1.35, tapPay = 2.2;
  const pos = track(t, [
    [0.85, 310, 660],
    [1.25, 205, 522],
    [1.75, 205, 522],
    [2.1, 230, 798],
  ]);
  const pr = presses(t, [tapSel, tapPay]);
  const ui = (
    <CheckoutScreen
      method={t > tapSel ? 0 : -1}
      selectK={range(t, tapSel, tapSel + 0.25)}
      payPress={cubicPulse(tapPay, 0.12, t)}
      processing={range(t, tapPay + 0.12, 3.3)}
      spin={t * 420}
      paid={range(t, 3.35, 4.25)}
      touch={{ ...pos, ...pr, show: fade(t, 0.85, 1.0, 2.35, 2.55) }}
    />
  );
  return <DeviceShowcase t={t} dur={5} kind="iphone" base={PHONE_BASE} taps={[tapSel, tapPay]} ui={ui} badgeAt={3.7} badgePos={[1.5, 2.7, 4.3]} badgeScale={0.72} />;
};

const TABLET_BASE: Pose = { position: [0.02, 0.35, 3], rotation: [-0.1, -0.27, 0], scale: 1.85 };
const PORTRAIT_BASE: Pose = { position: [-0.1, 0.25, 3], rotation: [-0.08, -0.3, 0], scale: 1.8 };

// ---------------- booking ----------------
const BookingShow: React.FC = () => {
  const t = useT();
  const T = { day: 1.2, slot: 1.75, name: 2.2, phone: 3.1, ok: 4.25 };
  const pos = track(t, [
    [0.85, 300, 650],
    [1.12, 195, 306],
    [1.3, 195, 306],
    [1.67, 73, 479],
    [1.85, 73, 479],
    [2.12, 200, 556],
    [3.0, 200, 556],
    [3.05, 200, 628],
    [3.95, 200, 628],
    [4.17, 205, 776],
  ]);
  const pr = presses(t, [T.day, T.slot, T.name, T.phone, T.ok]);
  const ui = (
    <BookingScreen
      day={t > T.day ? 2 : 0}
      dayK={t > T.day ? range(t, T.day, T.day + 0.25) : 1}
      slot={t > T.slot ? 3 : -1}
      slotK={range(t, T.slot, T.slot + 0.25)}
      name={typed("Rahim Uddin", t, T.name + 0.1, T.name + 0.7)}
      phone={typed("01712-345678", t, T.phone + 0.1, T.phone + 0.8)}
      focus={t > T.phone ? (t < T.ok ? "phone" : null) : t > T.name ? "name" : null}
      caret={caretOn(t)}
      confirmPress={cubicPulse(T.ok, 0.12, t)}
      confirmed={range(t, T.ok + 0.15, T.ok + 1.0)}
      touch={{ ...pos, ...pr, show: fade(t, 0.85, 1.0, 4.45, 4.65) }}
    />
  );
  return <DeviceShowcase t={t} dur={6} kind="iphone" base={PHONE_BASE} taps={[T.day, T.slot, T.name, T.phone, T.ok]} ui={ui} badgeAt={4.85} badgePos={[1.5, 2.7, 4.3]} badgeScale={0.72} />;
};

// ---------------- app store ----------------
const AppStoreShow: React.FC = () => {
  const t = useT();
  const tapI = 1.2;
  const pos = track(t, [
    [0.8, 300, 620],
    [1.12, 195, 372],
    [1.35, 195, 372],
    [1.6, 250, 470],
    [3.3, 330, 585],
    [3.6, 330, 585],
    [4.2, 80, 575],
  ]);
  const pr = presses(t, [tapI]);
  const drag = t > 3.58 && t < 4.22 ? 1 : 0;
  // download: অসম গতি (নেটওয়ার্কের মতো), শেষে একটু থেমে install
  const raw = range(t, 1.3, 3.0);
  const progress = Math.min(1, raw * 0.8 + 0.2 * Math.sin(raw * Math.PI * 0.5) ** 4);
  const sx = 300 * (1 - Math.pow(1 - range(t, 3.6, 4.45), 3));
  const ui = (
    <AppStoreScreen
      downloading={t > tapI + 0.08}
      progress={progress}
      installed={range(t, 3.05, 3.35)}
      installPress={cubicPulse(tapI, 0.12, t)}
      shotsX={sx}
      touch={{ ...pos, down: Math.max(pr.down, drag * 0.6), ripple: pr.ripple, show: Math.max(fade(t, 0.8, 0.95, 1.45, 1.65), fade(t, 3.3, 3.45, 4.25, 4.45)) }}
    />
  );
  return <DeviceShowcase t={t} dur={5.5} kind="android" base={PHONE_BASE} taps={[tapI, 3.6]} ui={ui} />;
};

// ---------------- admin ----------------
const AdminShow: React.FC = () => {
  const t = useT();
  const T = { tog: 1.3, area: 1.8, price: 3.35, save: 4.4 };
  const pos = track(t, [
    [0.8, 820, 560],
    [1.2, 617, 184],
    [1.4, 617, 184],
    [1.72, 430, 268],
    [3.1, 430, 268],
    [3.27, 772, 468],
    [4.0, 772, 468],
    [4.32, 905, 108],
  ]);
  const pr = presses(t, [T.tog, T.area, T.price, T.save]);
  // দাম 1,500 → মুছে → 1,200
  const seq = ["1,500", "1,50", "1,5", "1,", "1,2", "1,20", "1,200"];
  const pi = Math.max(0, Math.min(seq.length - 1, Math.floor((t - (T.price + 0.15)) / 0.085)));
  const ui = (
    <AdminScreen
      holiday={range(t, T.tog, T.tog + 0.22)}
      notice={typed(ADMIN_NOTICE, t, T.area + 0.12, T.price - 0.3)}
      price={t > T.price + 0.15 ? seq[pi] : "1,500"}
      focus={t > T.price && t < T.save ? "price" : t > T.area && t < T.price ? "notice" : null}
      caret={caretOn(t)}
      dirty={t > T.tog}
      savePress={cubicPulse(T.save, 0.12, t)}
      saved={range(t, T.save + 0.1, T.save + 0.6)}
      cursor={{ ...pos, ...pr, show: fade(t, 0.8, 0.95, 5.3, 5.5) }}
    />
  );
  return <DeviceShowcase t={t} dur={6} kind="tablet" base={TABLET_BASE} taps={[T.tog, T.save]} ui={ui} badgeAt={T.save + 0.3} badgePos={[1.45, 2.55, 3.4]} badgeScale={0.7} />;
};

// ---------------- analytics ----------------
const AnalyticsShow: React.FC = () => {
  const t = useT();
  const tc = 1.25;
  const hp = analyticsPoint(27);
  const pos = track(t, [
    [0.8, 560, 560],
    [1.15, 847, 107],
    [1.35, 847, 107],
    [3.5, hp.x + 16, hp.y + 18],
  ]);
  const pr = presses(t, [tc]);
  const after = t > tc + 0.03;
  const ui = (
    <AnalyticsScreen
      range={range(t, tc, tc + 0.25)}
      draw={after ? range(t, tc + 0.1, tc + 1.6) : range(t, 0.25, 1.0)}
      count={after ? range(t, tc + 0.1, tc + 1.3) : range(t, 0.25, 0.9)}
      bars={after ? range(t, tc + 0.3, tc + 1.6) : range(t, 0.35, 1.0)}
      hover={27}
      hoverK={range(t, 3.5, 3.75)}
      cursor={{ ...pos, ...pr, show: fade(t, 0.8, 0.95, 9, 10) }}
    />
  );
  return <DeviceShowcase t={t} dur={5.5} kind="tablet" base={TABLET_BASE} taps={[tc]} ui={ui} />;
};

// ---------------- invoice ----------------
const InvoiceShow: React.FC = () => {
  const t = useT();
  const tp = 4.05;
  const pos = track(t, [
    [3.15, 420, 760],
    [3.9, 574, 978],
  ]);
  const pr = presses(t, [tp]);
  const ui = (
    <InvoiceScreen
      lines={range(t, 0.65, 2.55) * 4}
      total={range(t, 2.45, 3.4)}
      paidPress={cubicPulse(tp, 0.12, t)}
      paid={range(t, tp + 0.1, tp + 0.55)}
      cursor={{ ...pos, ...pr, show: fade(t, 3.15, 3.3, 4.7, 4.9) }}
    />
  );
  return <DeviceShowcase t={t} dur={6} kind="tablet-portrait" base={PORTRAIT_BASE} taps={[tp]} ui={ui} badgeAt={tp + 0.4} badgePos={[1.75, 2.78, 3.5]} badgeScale={0.68} />;
};

export const ITEMS: LibItem[] = [
  {
    id: "screens-biz-checkout",
    name: "Checkout · bKash / Nagad / Card → Paid",
    nameBn: "চেকআউট — bKash/Nagad/Card দিয়ে পেমেন্ট",
    group: "screens_business",
    kind: "screen",
    duration: 5,
    still: 4.6,
    tags: ["price", "steps", "cta", "before_after"],
    note: "CheckoutScreen {method, selectK, payPress, processing, spin, paid, touch} — phone 390×843",
    Comp: CheckoutShow,
  },
  {
    id: "screens-biz-admin",
    name: "CMS admin · holiday notice, hours, price edit, Save",
    nameBn: "Admin panel — ছুটির notice, সময়, দাম বদল, Save",
    group: "screens_business",
    kind: "screen",
    duration: 6,
    still: 5.2,
    tags: ["answer", "steps", "faq", "before_after", "checklist"],
    note: "AdminScreen {holiday, notice, price, focus, caret, savePress, saved, dirty, cursor} — tablet 1024×700",
    Comp: AdminShow,
  },
  {
    id: "screens-biz-analytics",
    name: "Analytics dashboard · visitors, calls, chart",
    nameBn: "Analytics dashboard — visitor, call, chart",
    group: "screens_business",
    kind: "screen",
    duration: 5.5,
    still: 4.6,
    tags: ["stat", "answer", "before_after", "compare"],
    note: "AnalyticsScreen {range, draw, count, bars, hover, hoverK, cursor}; analyticsPoint(i) → chart point px — tablet 1024×700",
    Comp: AnalyticsShow,
  },
  {
    id: "screens-biz-booking",
    name: "Serial / appointment booking",
    nameBn: "সিরিয়াল/appointment booking form",
    group: "screens_business",
    kind: "screen",
    duration: 6,
    still: 5.6,
    tags: ["steps", "cta", "answer", "persona"],
    note: "BookingScreen {day, dayK, slot, slotK, name, phone, focus, caret, confirmPress, confirmed, serial, touch} — phone 390×843",
    Comp: BookingShow,
  },
  {
    id: "screens-biz-invoice",
    name: "Invoice / quote · line items → PAID",
    nameBn: "Invoice/quote — line item, মোট ৳, PAID",
    group: "screens_business",
    kind: "screen",
    duration: 6,
    still: 5.3,
    tags: ["price", "compare", "checklist", "cta"],
    note: "InvoiceScreen {lines 0..4, total, paidPress, paid, cursor} — portrait tablet 700×1024 (rig tabletPortraitScreen)",
    Comp: InvoiceShow,
  },
  {
    id: "screens-biz-appstore",
    name: "App store listing · Install → Open",
    nameBn: "App store listing — Install থেকে Open",
    group: "screens_business",
    kind: "screen",
    duration: 5.5,
    still: 4.8,
    tags: ["cta", "answer", "stat", "steps"],
    note: "AppStoreScreen {downloading, progress, installed, installPress, shotsX, touch} — android phone 390×843",
    Comp: AppStoreShow,
  },
];
