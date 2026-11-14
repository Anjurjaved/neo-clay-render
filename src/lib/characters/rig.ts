// NEO clay character rig v2 — pure functions: Pose → joint positions → SDF ops (এক টুকরার দেহ) + hand/torso/head matrix।
// figure-local: পায়ের তলা y=0, মুখ +z, উচ্চতা ≈ 1.16। anatomical Right = −x (ক্যামেরার দিকে মুখ করলে screen-এর বামে)।
// হাত-পা two-bone IK দিয়ে (target + pole) — pose লেখা সহজ: "হাত চিবুকে", "ফোন বুকের সামনে"।
import * as THREE from "three";
import { Basis, Op, V3, basisFromQuat, basisMatrix, basisYZ, v } from "./sdf";

export type Side = "L" | "R";
export const SX: Record<Side, number> = { L: 1, R: -1 };

export type ArmCtl = {
  /** wrist target, torso frame (origin = pelvis) */
  t: V3;
  /** elbow hint direction, torso frame */
  pole: V3;
  /** fingers direction (torso frame) */
  dir: V3;
  /** palm normal (torso frame) */
  palm: V3;
  grip: number; // 0 খোলা … 1 মুঠো
  index: number; // 0..1 তর্জনী সোজা (point)
};
export type LegCtl = { t: V3; pole: V3; toe: number }; // ankle target (figure-local), foot pitch
export type Pose = {
  y: number; // pelvis offset (bob / বসা)
  lean: number;
  twist: number;
  roll: number;
  nod: number;
  turn: number;
  tilt: number;
  armL: ArmCtl;
  armR: ArmCtl;
  legL: LegCtl;
  legR: LegCtl;
};

// ---------- proportions ----------
export const BODY = {
  pelvisY: 0.43,
  hip: 0.088,
  thigh: 0.182,
  shin: 0.178,
  ankleY: 0.072,
  shoulder: [0.148, 0.285, 0] as V3, // torso frame (x mirrored)
  upper: 0.19,
  fore: 0.168,
  neck: [0, 0.4, 0] as V3,
  headR: 0.176,
  headUp: 0.162,
};

/** torso shape (torso frame) — body ও পোশাক দুজায়গাতেই একই মাপ */
export const TORSO = { a: [0, 0.035, 0] as V3, b: [0, 0.27, 0] as V3, ra: 0.172, rb: 0.14, bc: [0, 0.07, 0.0] as V3, br: [0.168, 0.122, 0.148] as V3 };

export type Rig = {
  pelvis: V3;
  torsoQ: THREE.Quaternion;
  headQ: THREE.Quaternion;
  torsoM: THREE.Matrix4; // torso frame → figure-local
  headM: THREE.Matrix4; // head center frame
  head: V3;
  shoulder: Record<Side, V3>;
  elbow: Record<Side, V3>;
  wrist: Record<Side, V3>;
  hand: Record<Side, Basis>;
  handM: Record<Side, THREE.Matrix4>; // palm-surface anchor (Z = palm normal)
  hip: Record<Side, V3>;
  knee: Record<Side, V3>;
  ankle: Record<Side, V3>;
  footB: Record<Side, Basis>;
  T: (p: V3) => V3; // torso → local
  Td: (d: V3) => V3; // torso direction → local
};

const ik = (S: V3, T: V3, L1: number, L2: number, pole: V3) => {
  const st = v.sub(T, S);
  let d = v.len(st);
  const n = v.norm(st);
  d = Math.max(Math.abs(L1 - L2) + 1e-3, Math.min((L1 + L2) * 0.998, d));
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  let pp = v.sub(pole, v.mul(n, v.dot(pole, n)));
  if (v.len(pp) < 1e-5) pp = [0, 0, 1];
  pp = v.norm(pp);
  const E = v.add(v.add(S, v.mul(n, a)), v.mul(pp, h));
  return { E, W: v.add(S, v.mul(n, d)) };
};

export const buildRig = (p: Pose): Rig => {
  const pelvis: V3 = [0, BODY.pelvisY + p.y, 0];
  const torsoQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(p.lean, p.twist, p.roll, "YXZ"));
  const tq = (d: V3): V3 => {
    const w = new THREE.Vector3(...d).applyQuaternion(torsoQ);
    return [w.x, w.y, w.z];
  };
  const T = (q: V3): V3 => v.add(pelvis, tq(q));
  const torsoM = new THREE.Matrix4().compose(new THREE.Vector3(...pelvis), torsoQ, new THREE.Vector3(1, 1, 1));
  const headQ = torsoQ.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(p.nod, p.turn, p.tilt, "YXZ")));
  const neck = T(BODY.neck);
  const hu = new THREE.Vector3(0, BODY.headUp, 0).applyQuaternion(headQ);
  const head: V3 = [neck[0] + hu.x, neck[1] + hu.y, neck[2] + hu.z];
  const headM = new THREE.Matrix4().compose(new THREE.Vector3(...head), headQ, new THREE.Vector3(1, 1, 1));

  const r = {} as Rig;
  r.shoulder = {} as any;
  r.elbow = {} as any;
  r.wrist = {} as any;
  r.hand = {} as any;
  r.handM = {} as any;
  r.hip = {} as any;
  r.knee = {} as any;
  r.ankle = {} as any;
  r.footB = {} as any;
  (["L", "R"] as Side[]).forEach((s) => {
    const sx = SX[s];
    const a = s === "L" ? p.armL : p.armR;
    const S = T([BODY.shoulder[0] * sx, BODY.shoulder[1], BODY.shoulder[2]]);
    const { E, W } = ik(S, T(a.t), BODY.upper, BODY.fore, tq(a.pole));
    r.shoulder[s] = S;
    r.elbow[s] = E;
    r.wrist[s] = W;
    const hb = basisYZ(tq(a.dir), tq(a.palm));
    // anatomical: right hand thumb on +X (Y×Z); left hand mirror → flip X so thumb side is consistent via thumbSide
    r.hand[s] = hb;
    const palmC = v.inB(W, hb, [0, 0.046, 0]);
    r.handM[s] = basisMatrix(v.inB(palmC, hb, [0, 0, 0.024]), hb);

    const l = s === "L" ? p.legL : p.legR;
    const H = T([BODY.hip * sx, -0.005, 0]);
    const k = ik(H, l.t, BODY.thigh, BODY.shin, tq(l.pole));
    r.hip[s] = H;
    r.knee[s] = k.E;
    r.ankle[s] = k.W;
    // foot: heading follows torso twist a little, pitch = toe
    const yaw = p.twist * 0.6;
    const fq = new THREE.Quaternion().setFromEuler(new THREE.Euler(l.toe, yaw, 0, "YXZ"));
    r.footB[s] = basisFromQuat(fq);
  });
  return Object.assign(r, { pelvis, torsoQ, headQ, torsoM, headM, head, T, Td: tq });
};

export type BodyOpts = { hands?: "full" | "mitten"; headScale?: number };

/** rig → SDF ops for the one-piece clay body */
export const bodyOps = (r: Rig, o: BodyOpts = {}): Op[] => {
  const T = r.T;
  const ops: Op[] = [];
  // torso: gumdrop (wide hips → narrower chest) + soft belly
  const TB = basisFromQuat(r.torsoQ);
  ops.push({ t: "cone", a: T(TORSO.a), b: T(TORSO.b), ra: TORSO.ra, rb: TORSO.rb });
  ops.push({ t: "ell", c: T(TORSO.bc), B: TB, r: TORSO.br, k: 0.08 });
  // head (fused via a soft neck fillet)
  const hs = o.headScale ?? 1;
  ops.push({ t: "ell", c: r.head, B: basisFromQuat(r.headQ), r: [0.172 * hs, 0.178 * hs, 0.168 * hs], k: 0.085, kc: T(BODY.neck), kr0: 0.05, kr1: 0.16, kMin: 0.01 });
  (["L", "R"] as Side[]).forEach((s) => {
    const S = r.shoulder[s],
      E = r.elbow[s],
      W = r.wrist[s];
    // legs
    const H = r.hip[s],
      K = r.knee[s],
      A = r.ankle[s];
    ops.push({ t: "cone", a: H, b: K, ra: 0.084, rb: 0.074, k: 0.07, kc: H, kr0: 0.05, kr1: 0.15, kMin: 0.006 });
    ops.push({ t: "cone", a: K, b: A, ra: 0.074, rb: 0.064, k: 0.035, kc: K, kr0: 0.02, kr1: 0.08, kMin: 0.004 });
    const fb = r.footB[s];
    ops.push({ t: "ell", c: v.inB(A, fb, [0, -0.028, 0.038]), B: fb, r: [0.072, 0.046, 0.108], k: 0.045, kc: A, kr0: 0.02, kr1: 0.08, kMin: 0.004 });
    // arms (shoulder fillet only near the shoulder → no webbing against the hips)
    ops.push({ t: "cone", a: S, b: E, ra: 0.058, rb: 0.051, k: 0.075, kc: S, kr0: 0.03, kr1: 0.12, kMin: 0.004 });
    ops.push({ t: "cone", a: E, b: W, ra: 0.051, rb: 0.043, k: 0.03, kc: E, kr0: 0.015, kr1: 0.07, kMin: 0.003 });
    ops.push(...handOps(r, s, o.hands ?? "full"));
  });
  return ops;
};

/** mitten hand: palm + 2-segment curling finger block + thumb + optional index finger */
export const handOps = (r: Rig, s: Side, mode: "full" | "mitten", grip?: number, index?: number): Op[] => {
  const W = r.wrist[s];
  const B = r.hand[s];
  const ctl = (r as any)._ctl?.[s] as ArmCtl | undefined;
  const g = grip ?? ctl?.grip ?? 0.2;
  const ix = index ?? ctl?.index ?? 0;
  const ts = s === "R" ? 1 : -1; // thumb on +X for right hand
  const L = (q: V3) => v.inB(W, B, q);
  const dirB = (q: V3) => v.inB([0, 0, 0], B, q);
  const ops: Op[] = [];
  // palm
  ops.push({ t: "box", c: L([0, 0.044, 0.002]), B, h: [0.026, 0.026, 0.006], r: 0.019, k: 0.028, kc: W, kr0: 0.01, kr1: 0.05, kMin: 0.004 });
  // finger block (mitten), 2 segments curling toward +Z (palm side)
  const a1 = g * 1.25,
    a2 = g * 1.15;
  const k1 = L([0, 0.074, 0.0]);
  const d1: V3 = [0, Math.cos(a1), Math.sin(a1)];
  const B1 = basisYZ(dirB(d1), dirB([0, -Math.sin(a1), Math.cos(a1)]));
  const c1 = v.add(k1, v.mul(dirB(d1), 0.016));
  const fx = ix > 0.5 ? 0.017 : 0.025; // index pulled out → block narrower
  const off = ix > 0.5 ? -ts * 0.008 : 0;
  ops.push({ t: "box", c: v.add(c1, v.mul(B[0], off)), B: B1, h: [fx, 0.012, 0.004], r: 0.0165, k: 0.02, kc: k1, kr0: 0.005, kr1: 0.035, kMin: 0.004 });
  const k2 = v.add(k1, v.mul(dirB(d1), 0.034));
  const a12 = a1 + a2;
  const d2: V3 = [0, Math.cos(a12), Math.sin(a12)];
  const B2 = basisYZ(dirB(d2), dirB([0, -Math.sin(a12), Math.cos(a12)]));
  ops.push({ t: "box", c: v.add(v.add(k2, v.mul(dirB(d2), 0.013)), v.mul(B[0], off)), B: B2, h: [fx * 0.96, 0.01, 0.003], r: 0.0155, k: 0.016, kc: k2, kr0: 0.004, kr1: 0.03, kMin: 0.003 });
  if (mode === "full") {
    // thumb: base on the palm edge, curls over the palm with grip
    const tb = L([ts * 0.03, 0.026, 0.012]);
    const td = v.norm(dirB([ts * (0.55 - g * 0.35), 0.6 + g * 0.05, 0.35 + g * 0.55]));
    ops.push({ t: "cone", a: tb, b: v.add(tb, v.mul(td, 0.038)), ra: 0.019, rb: 0.016, k: 0.02, kc: tb, kr0: 0.006, kr1: 0.03, kMin: 0.003 });
    if (ix > 0) {
      const ib = L([ts * 0.016, 0.07, 0.0]);
      const idir = v.norm(dirB([0, 1, (1 - ix) * 1.4]));
      ops.push({ t: "cone", a: ib, b: v.add(ib, v.mul(idir, 0.062 * (0.4 + 0.6 * ix))), ra: 0.0165, rb: 0.014, k: 0.014, kc: ib, kr0: 0.004, kr1: 0.025, kMin: 0.003 });
    }
  }
  return ops;
};

/** pose + rig একসাথে (hand ctl গুলো rig-এ রেখে দিই যাতে handOps grip পায়) */
export const rigOf = (p: Pose): Rig => {
  const r = buildRig(p);
  (r as any)._ctl = { L: p.armL, R: p.armR };
  return r;
};
