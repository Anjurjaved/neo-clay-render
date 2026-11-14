// places group — showcase item (প্রতিটা নিজে <Stage> render করে; t = নিজের সেকেন্ড)
import React from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { LibItem } from "../types";
import { Stage, atFloor, worldWidth, DEFAULT_CAM, Cam } from "../../kit/Stage";
import { FPS } from "../../kit/time";
import { springStep, wobble, tween, range, expoOut, emphDecel, smoothstep } from "../../kit/anim";
import { C } from "../../kit/theme";
import { Storefront, STORE, RoofPlinth } from "./Storefront";
import { Molar, PharmacyCross, TeeOnHanger, Tee, Cloche, PottedPlant } from "./signs";
import { OfficeTower, TOWER } from "./OfficeTower";
import { Reception } from "./Reception";
import { Street } from "./Street";
import { DentalInterior, RestaurantInterior, ClothingInterior, PharmacyInterior } from "./interiors";

const cam: Cam = DEFAULT_CAM;
const useT = () => useCurrentFrame() / FPS;

/** clay land: scale spring + squash/stretch (মাটিতে নামার মতো), origin floor-এ থাকে */
export const landPop = (t: number, t0: number) => {
  const u = t - t0;
  if (u <= 0) return { s: 0, sx: 0, sy: 0 };
  const s = springStep(u, { k: 170, c: 14 });
  const j = wobble(u - 0.12, 0.09, 2.6, 0.25);
  return { s, sx: s * (1 + j), sy: s * (1 - j) };
};
/** sign object: উপর থেকে নেমে bounce, তারপর ধীরে ঘোরে + ভাসে */
const signDrop = (t: number, t0: number) => {
  const u = t - t0;
  const k = springStep(u, { k: 210, c: 12 });
  return { y: (1 - k) * 0.9, s: u <= 0 ? 0 : Math.min(1, u * 6), squash: wobble(u - 0.18, 0.12, 3.2, 0.3) };
};

// ---- একটা দোকান-showcase-এর সাধারণ ছক ----
const SHOP_POS = atFloor(0.5, 0.8, cam);
const shopScale = (frac: number, w = STORE.w) => worldWidth(frac, SHOP_POS[2], cam) / w;

type ShopShowProps = {
  t: number;
  label: string;
  signColor: string;
  roof: (t: number) => React.ReactNode;
  interior?: React.ReactNode;
  awning?: [string, string];
  h?: number;
  wall?: string;
  frac?: number;
  timing?: { pop: number; up0: number; up1: number; door0: number; door1: number };
};
const ShopShow: React.FC<ShopShowProps> = ({ t, label, signColor, roof, interior, awning, h, wall, frac = 0.6, timing = { pop: 0.1, up0: 1.3, up1: 2.3, door0: 2.5, door1: 3.2 } }) => {
  const S = shopScale(frac);
  const p = landPop(t, timing.pop);
  const open = tween(t, timing.up0, timing.up1, 0, 1, emphDecel);
  const light = tween(t, timing.up0 + 0.2, timing.up1, 0, 1, expoOut);
  const doors = tween(t, timing.door0, timing.door1, 0, 1, emphDecel);
  const yaw = -0.42 + tween(t, 0, 5, 0.06, -0.04, (x) => x);
  return (
    <Stage cam={cam}>
      <Storefront
        label={label}
        signColor={signColor}
        open={open}
        light={light}
        doors={doors}
        awning={awning}
        awningFlutter={t}
        dims={h ? { h } : undefined}
        interiorWall={wall}
        position={SHOP_POS}
        rotationY={yaw}
        scale={[S * p.sx, S * p.sy, S * p.sx]}
        roof={roof(t)}
        interior={interior}
      />
    </Stage>
  );
};

// ---------------- dental ----------------
const DentalShow: React.FC = () => {
  const t = useT();
  return (
    <ShopShow
      t={t}
      label="DENTAL CHAMBER"
      signColor={C.navy}
      interior={<DentalInterior />}
      roof={(t) => {
        const d = signDrop(t, 0.6);
        return (
          <>
            <RoofPlinth w={0.78} />
            <group position={[0, 0.1 + d.y, 0.05]} scale={[d.s * (1 + d.squash), d.s * (1 - d.squash), d.s * (1 + d.squash)]}>
              <Molar scale={0.92} rotation={[0.06, 0.5 + Math.sin(t * 0.9) * 0.18, 0]} glow={range(t, 1.5, 2.3)} />
            </group>
          </>
        );
      }}
    />
  );
};

// ---------------- restaurant ----------------
const RestaurantShow: React.FC = () => {
  const t = useT();
  return (
    <ShopShow
      t={t}
      label="SYLHET KITCHEN"
      signColor={C.deepOrange}
      awning={["#E9573F", "#FBF5EE"]}
      h={2.95}
      interior={<RestaurantInterior />}
      roof={(t) => {
        const d = signDrop(t, 0.6);
        const lift = springStep(t - 2.4, { k: 120, c: 9 });
        return (
          <>
            <RoofPlinth w={1.2} />
            <group position={[0, 0.1 + d.y, 0.05]} scale={[d.s * (1 + d.squash), d.s * (1 - d.squash), d.s * (1 + d.squash)]}>
              <Cloche scale={0.95} rotation={[0, 0.35, 0]} lift={lift} steam={range(t, 2.6, 3.2)} time={t} />
            </group>
          </>
        );
      }}
    />
  );
};

// ---------------- clothing ----------------
const ClothingShow: React.FC = () => {
  const t = useT();
  return (
    <ShopShow
      t={t}
      label="TRENDY WEAR"
      signColor="#2F7D78"
      awning={["#2F9C95", "#FBF5EE"]}
      h={2.95}
      interior={<ClothingInterior />}
      roof={(t) => {
        const d = signDrop(t, 0.6);
        const sw = wobble(t - 0.75, 0.32, 0.9, 0.12) + Math.sin(t * 1.6) * 0.025;
        return (
          <>
            <RoofPlinth w={0.6} position={[-0.55, 0, 0]} />
            <RoofStand x={-0.55} />
            <group position={[0.02, 1.26 + d.y, 0.0]} scale={d.s * 0.82}>
              <TeeOnHanger color="#F5952B" swing={sw} twist={0.25 + Math.sin(t * 1.1) * 0.08} />
            </group>
          </>
        );
      }}
    />
  );
};
/** clothing roof stand: satin L-pole (একটা বাঁকা tube) যার ডগায় hanger ঝোলে */
const RoofStand: React.FC<{ x: number }> = ({ x }) => {
  const geo = React.useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0.05, 0),
      new THREE.Vector3(x, 1.0, 0),
      new THREE.Vector3(x + 0.06, 1.22, 0),
      new THREE.Vector3(x + 0.25, 1.3, 0),
      new THREE.Vector3(0.12, 1.3, 0),
    ]);
    return new THREE.TubeGeometry(c, 80, 0.035, 16, false);
  }, [x]);
  return (
    <mesh geometry={geo} castShadow>
      <meshPhysicalMaterial color="#cfd4d8" metalness={0.85} roughness={0.3} envMapIntensity={1} />
    </mesh>
  );
};

// ---------------- pharmacy ----------------
const PharmacyShow: React.FC = () => {
  const t = useT();
  return (
    <ShopShow
      t={t}
      label="CITY PHARMACY"
      signColor="#178A55"
      wall="#F6C58F"
      interior={<PharmacyInterior />}
      roof={(t) => {
        const d = signDrop(t, 0.6);
        const lit = range(t, 1.4, 2.0) * (0.75 + 0.25 * Math.sin(t * 5));
        return (
          <>
            <RoofPlinth w={0.62} />
            <group position={[0, 0.66 + d.y, 0.05]} scale={[d.s * (1 + d.squash), d.s * (1 - d.squash), d.s]}>
              <PharmacyCross scale={1.15} rotation={[0, 0.35 + t * 0.6, 0]} lit={lit} />
            </group>
            <mesh position={[0, 0.17, 0.05]} castShadow>
              <cylinderGeometry args={[0.035, 0.05, 0.18, 24]} />
              <meshPhysicalMaterial color="#cfd4d8" metalness={0.85} roughness={0.3} />
            </mesh>
          </>
        );
      }}
    />
  );
};

// ---------------- office ----------------
const OFF_POS = atFloor(0.5, 0.8, cam);
const OfficeShow: React.FC = () => {
  const t = useT();
  const S = worldWidth(0.46, OFF_POS[2], cam) / TOWER.w;
  const rise = springStep(t - 0.1, { k: 120, c: 12 });
  const j = wobble(t - 0.35, 0.06, 2.4, 0.25);
  return (
    <Stage cam={cam}>
      <OfficeTower
        position={OFF_POS}
        rotationY={-0.5 + t * 0.012}
        scale={[S * (1 + j), S * rise * (1 - j), S * (1 + j)]}
        lights={range(t, 1.2, 3.0)}
        doors={tween(t, 3.1, 3.8, 0, 1, emphDecel)}
        signPop={springStep(t - 1.0, { k: 200, c: 12 })}
        time={t}
      />
    </Stage>
  );
};

// ---------------- reception ----------------
const REC_POS = atFloor(0.5, 0.66, cam);
const ReceptionShow: React.FC = () => {
  const t = useT();
  const S = worldWidth(0.66, REC_POS[2], cam) / 2.6;
  const p = landPop(t, 0.1);
  return (
    <Stage cam={cam}>
      <Reception
        position={REC_POS}
        rotationY={-0.38}
        scale={[S * p.sx, S * p.sy, S * p.sx]}
        person={springStep(t - 1.0, { k: 160, c: 13 })}
        wave={range(t, 1.5, 3.6)}
        time={t}
        bellPress={smoothstep(2.9, 3.0, t) * (1 - smoothstep(3.06, 3.2, t))}
        bellRing={wobble(t - 3.0, 0.12, 6, 0.08)}
        screenOn={range(t, 0.8, 1.2)}
      />
    </Stage>
  );
};

// ---------------- street ----------------
const STREET_CAM: Cam = { pos: [0, 5.2, 21], target: [0, -0.9, 0], fov: 27 };
const StreetShow: React.FC = () => {
  const t = useT();
  return (
    <Stage cam={STREET_CAM}>
      <Street t={t} />
    </Stage>
  );
};

export const ITEMS: LibItem[] = [
  {
    id: "places-dental-chamber",
    name: "Dental chamber",
    nameBn: "ডেন্টাল চেম্বার",
    group: "places",
    kind: "component",
    duration: 5,
    still: 4.2,
    tags: ["title", "persona", "before_after", "answer"],
    note: "Storefront label/signColor/open/light/doors + roof={<Molar/>} (one fused SDF molar)",
    Comp: DentalShow,
  },
  {
    id: "places-restaurant",
    name: "Restaurant",
    nameBn: "রেস্টুরেন্ট",
    group: "places",
    kind: "component",
    duration: 5,
    still: 4.0,
    tags: ["title", "persona", "before_after"],
    note: "Storefront + awning + roof={<Cloche lift steam time/>}",
    Comp: RestaurantShow,
  },
  {
    id: "places-clothing-shop",
    name: "Clothing shop",
    nameBn: "কাপড়ের দোকান",
    group: "places",
    kind: "component",
    duration: 5,
    still: 4.0,
    tags: ["title", "persona", "before_after"],
    note: "Storefront + teal awning + roof TeeOnHanger (swing prop)",
    Comp: ClothingShow,
  },
  {
    id: "places-pharmacy",
    name: "Pharmacy",
    nameBn: "ফার্মেসি",
    group: "places",
    kind: "component",
    duration: 5,
    still: 4.0,
    tags: ["title", "persona", "before_after"],
    note: "Storefront + roof PharmacyCross (lit prop, spins)",
    Comp: PharmacyShow,
  },
  {
    id: "places-office-building",
    name: "Office building",
    nameBn: "অফিস বিল্ডিং",
    group: "places",
    kind: "component",
    duration: 5,
    still: 4.2,
    tags: ["title", "persona", "stat"],
    note: "OfficeTower lights (floors light up), doors, signPop (briefcase on roof)",
    Comp: OfficeShow,
  },
  {
    id: "places-reception",
    name: "Reception desk",
    nameBn: "রিসেপশন ডেস্ক",
    group: "places",
    kind: "component",
    duration: 5,
    still: 3.1,
    tags: ["persona", "chat", "steps"],
    note: "Reception person 0..1 (receptionist or empty), wave, bellPress/bellRing, screenOn",
    Comp: ReceptionShow,
  },
  {
    id: "places-street",
    name: "Shop street",
    nameBn: "দোকানের সারি (রাস্তা)",
    group: "places",
    kind: "scene",
    duration: 6,
    still: 5.2,
    tags: ["title", "compare", "stat", "persona"],
    note: "Street t — row of shops pop in, shutters open one by one, lamps light",
    Comp: StreetShow,
  },
];

export { Storefront, STORE, RoofPlinth, Molar, PharmacyCross, TeeOnHanger, Tee, Cloche, PottedPlant, OfficeTower, Reception, Street };
