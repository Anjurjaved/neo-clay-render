// Road timeline — floor-এ শোয়ানো এক টুকরার নরম রাস্তা (custom ribbon: গোল কাঁধ, গোল মাথা), মাঝে dash,
// পাশে station (pedestal + দাঁড়ানো সাইন)। figure রাস্তা ধরে হাঁটে (phase = দূরত্ব → পা পিছলায় না);
// পৌঁছালে station কমলা হয়, সাইন spring দিয়ে লাফিয়ে ওঠে, check badge pop।
import React, { useMemo } from "react";
import * as THREE from "three";
import { ClayMat, Txt } from "../../kit/Clay";
import { pillGeo, roundedCylGeo } from "../../kit/Geo";
import { SoftPanel, CheckBadge } from "../../kit/Soft";
import { Figure } from "../../kit/Figure";
import { springStep, smoothstep } from "../../kit/anim";
import { C } from "../../kit/theme";
import { G, P, Gloss } from "./common";

/** curve বরাবর নরম ribbon — superellipse cross-section, দুই মাথা গোল */
export const ribbonGeo = (curve: THREE.Curve<THREE.Vector3>, w: number, h: number, samples = 260, prof = 18) => {
  const len = curve.getLength();
  const capU = Math.min(0.5, (w * 0.5) / len);
  const pos: number[] = [];
  const idx: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const p = curve.getPointAt(u);
    const tg = curve.getTangentAt(u);
    const side = new THREE.Vector3().crossVectors(tg, up).normalize();
    const d = Math.min(u, 1 - u);
    const e = d >= capU ? 1 : Math.sqrt(Math.max(0, 1 - ((capU - d) / capU) ** 2));
    const ww = (w / 2) * Math.max(0.02, e);
    const hh = h * Math.max(0.05, Math.sqrt(e));
    for (let j = 0; j <= prof; j++) {
      const a = Math.PI * (j / prof); // 0..π  (ডান কাঁধ → উপর → বাম কাঁধ)
      const c = Math.cos(a),
        s = Math.sin(a);
      const x = Math.sign(c) * Math.pow(Math.abs(c), 0.45) * ww;
      const y = Math.pow(s, 0.45) * hh;
      pos.push(p.x + side.x * x, p.y + y, p.z + side.z * x);
    }
  }
  const R = prof + 1;
  for (let i = 0; i < samples; i++)
    for (let j = 0; j < prof; j++) {
      const a = i * R + j,
        b = a + R;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

export const DEFAULT_ROAD: [number, number][] = [
  [-1.9, 2.7],
  [0.2, 2.25],
  [1.7, 1.2],
  [0.4, 0.1],
  [-1.6, -0.6],
  [-1.1, -1.8],
  [0.9, -2.4],
  [2.0, -3.0],
];

/** showcase/scene helper: station থেকে station হাঁটা, প্রতিটায় থামা — progress, walk তীব্রতা, প্রতিটা station-এর age */
export const roadSchedule = (t: number, stops: number[], t0 = 0.6, speed = 0.17, pause = 0.45) => {
  let time = t0;
  let prev = 0;
  const ages: number[] = [];
  let progress = 0;
  let walk = 0;
  let found = false;
  for (const s of stops) {
    const dur = (s - prev) / speed;
    if (!found && t < time + dur) {
      const k = (t - time) / dur;
      const e = k < 0 ? 0 : k * k * (3 - 2 * k); // ease in-out এক leg-এ
      progress = prev + (s - prev) * e;
      walk = t < time ? 0 : Math.min(1, Math.sin(Math.PI * Math.min(1, Math.max(0, k))) * 1.6);
      found = true;
    }
    time += dur;
    ages.push(t - time);
    if (!found && t < time + pause) {
      progress = s;
      walk = 0;
      found = true;
    }
    time += pause;
    prev = s;
  }
  if (!found) progress = prev;
  return { progress, walk, ages };
};

const Station: React.FC<{ label: string; num: number; age: number; position: [number, number, number]; flip?: boolean }> = ({ label, num, age, position, flip }) => {
  const ped = useMemo(() => roundedCylGeo(0.36, 0.16, 0.07), []);
  const post = useMemo(() => roundedCylGeo(0.045, 0.62, 0.02, 24), []);
  const on = age >= 0;
  const pop = on ? springStep(age, { k: 210, c: 9 }) : 0;
  const colK = on ? smoothstep(0, 0.25, age) : 0;
  const col = new THREE.Color("#F1E9DF").lerp(new THREE.Color(C.orange), colK);
  const sw = Math.min(1.2, 0.36 + label.length * 0.11);
  return (
    <group position={position}>
      <mesh geometry={ped} position={[0, 0.08, 0]} castShadow receiveShadow>
        <Gloss color={"#" + col.getHexString()} rough={0.5} coat={0.4} />
      </mesh>
      <group position={[0, 0.16, 0]} scale={[1, 0.86 + 0.14 * pop, 1]}>
        <mesh geometry={post} position={[0, 0.31, 0]} castShadow>
          <ClayMat color="#E6DCCF" />
        </mesh>
        <group position={[0, 0.82 + pop * 0.08, 0]} rotation={[0, flip ? 0.25 : -0.25, Math.sin(age * 9) * Math.exp(-age * 4) * (on ? 0.12 : 0)]}>
          <SoftPanel w={sw} h={0.48} thick={0.13} color={on ? "#FFFFFF" : "#F5EFE7"}>
            <Txt size={0.13} color={on ? C.deepOrange : "#8a96a5"} position={[-sw / 2 + 0.2, 0, 0.012]}>
              {String(num)}
            </Txt>
            <Txt size={0.13} color={on ? C.deepNavy : "#7d8a99"} position={[0.08, 0, 0.012]} letterSpacing={0.03}>
              {label}
            </Txt>
          </SoftPanel>
          {on && <CheckBadge scale={0.3 * pop} position={[sw / 2 - 0.02, 0.24, 0.08]} />}
        </group>
      </group>
    </group>
  );
};

export const RoadTimeline: React.FC<
  P & {
    stations: string[];
    /** প্রতিটা station রাস্তার কত ভগ্নাংশে (0..1) */
    stops: number[];
    /** figure-এর অবস্থান (0..1, রাস্তার দৈর্ঘ্য ধরে) */
    progress: number;
    /** 0..1 হাঁটার তীব্রতা */
    walk: number;
    /** প্রতিটা station পৌঁছানোর পর কত সেকেন্ড (ঋণাত্মক = এখনো নয়) */
    ages: number[];
    path?: [number, number][];
    /** 0..1 — রাস্তা আঁকা হওয়া (প্রথম ঢোকা) */
    draw?: number;
    figure?: boolean;
  }
> = ({ stations, stops, progress, walk, ages, path = DEFAULT_ROAD, draw = 1, figure = true, ...p }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(path.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal"), [path]);
  const len = useMemo(() => curve.getLength(), [curve]);
  const road = useMemo(() => ribbonGeo(curve, 0.95, 0.12), [curve]);
  const dash = useMemo(() => {
    const g = pillGeo(0.26, 0.07, 0.03, 0.012);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const dashes = useMemo(() => {
    const out: { p: THREE.Vector3; a: number; u: number }[] = [];
    const n = Math.floor(len / 0.5);
    for (let i = 1; i < n; i++) {
      const u = i / n;
      const pt = curve.getPointAt(u);
      const tg = curve.getTangentAt(u);
      out.push({ p: pt, a: Math.atan2(tg.x, tg.z), u });
    }
    return out;
  }, [curve, len]);
  const fp = curve.getPointAt(Math.min(1, Math.max(0, progress)));
  const ft = curve.getTangentAt(Math.min(0.999, Math.max(0.001, progress)));
  const FS = 1.0;
  return (
    <G {...p}>
      <mesh geometry={road} scale={[1, Math.max(0.001, draw), 1]} castShadow receiveShadow>
        <ClayMat color="#E9E1D8" rough={0.72} />
      </mesh>
      {dashes.map((d, i) =>
        d.u <= draw ? (
          <mesh key={i} geometry={dash} position={[d.p.x, 0.12 * draw + 0.012, d.p.z]} rotation={[0, d.a + Math.PI / 2, 0]}>
            <ClayMat color={d.u <= progress ? C.orange : "#FFFFFF"} rough={0.55} bump={0.1} />
          </mesh>
        ) : null
      )}
      {stations.map((s, i) => {
        const u = stops[i];
        const pt = curve.getPointAt(u);
        const tg = curve.getTangentAt(u);
        const side = new THREE.Vector3().crossVectors(tg, new THREE.Vector3(0, 1, 0)).normalize();
        // station রাস্তার ক্যামেরা-থেকে-দূরের পাশে নয় — যে পাশে x কেন্দ্রের বাইরে
        const sgn = Math.sign(pt.x + side.x * 0.01) || 1;
        const sd = side.x * sgn >= 0 ? 1 : -1;
        const pos: [number, number, number] = [pt.x + side.x * sd * 0.95, 0, pt.z + side.z * sd * 0.95];
        return draw >= u ? <Station key={i} label={s} num={i + 1} age={ages[i] ?? -1} position={pos} flip={pos[0] < 0} /> : null;
      })}
      {figure && draw >= 1 && (
        <Figure
          position={[fp.x, 0.12, fp.z]}
          rotationY={walk > 0.05 ? Math.atan2(ft.x, ft.z) : Math.atan2(ft.x, ft.z) * 0.6}
          scale={FS}
          pose={{ dist: (progress * len) / FS, walk }}
        />
      )}
    </G>
  );
};
