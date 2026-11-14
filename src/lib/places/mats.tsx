// places-এর material — polished clay (চকচকে নরম glaze), কাচ, satin ধাতু
import React from "react";
import * as THREE from "three";
import { clayNoise } from "../../kit/Clay";

/** polished clay: clay-এর উষ্ণ sheen + পাতলা clearcoat glaze — sign object-এর জন্য (apple-grade চকচকে) */
export const PolishedClay: React.FC<{ color: string; rough?: number; coat?: number; emissive?: string; emissiveIntensity?: number; opacity?: number }> = ({
  color,
  rough = 0.34,
  coat = 0.65,
  emissive,
  emissiveIntensity = 0,
  opacity = 1,
}) => (
  <meshPhysicalMaterial
    color={color}
    roughness={rough}
    metalness={0}
    clearcoat={coat}
    clearcoatRoughness={0.18}
    sheen={0.35}
    sheenRoughness={0.6}
    sheenColor="#ffe6d2"
    bumpMap={clayNoise()}
    bumpScale={0.04}
    emissive={emissive ?? "#000000"}
    emissiveIntensity={emissive ? emissiveIntensity : 0}
    envMapIntensity={1.0}
    transparent={opacity < 1}
    opacity={opacity}
  />
);

/** দোকানের কাচ — হালকা নীলচে, প্রতিফলন, ভেতর দেখা যায় */
export const ShopGlass: React.FC<{ tint?: string; opacity?: number }> = ({ tint = "#cfe3ee", opacity = 0.32 }) => (
  <meshPhysicalMaterial color={tint} roughness={0.04} metalness={0} clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={1.6} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} />
);

/** satin aluminium (দরজার frame, handle, lamp post) */
export const Satin: React.FC<{ color?: string; rough?: number }> = ({ color = "#c9ced3", rough = 0.36 }) => (
  <meshPhysicalMaterial color={color} metalness={0.85} roughness={rough} envMapIntensity={1.0} clearcoat={0.2} clearcoatRoughness={0.4} />
);
