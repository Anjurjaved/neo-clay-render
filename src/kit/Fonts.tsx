// DOM font: @font-face + delayRender যতক্ষণ না load হয়
import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const FACES: [string, string, string][] = [
  ["Inter", "fonts/Inter-400-latin.woff2", "400"],
  ["Inter", "fonts/Inter-500-latin.woff2", "500"],
  ["Inter", "fonts/Inter-600-latin.woff2", "600"],
  ["Hind Siliguri", "fonts/HindSiliguri-400-bengali.woff2", "400"],
  ["Hind Siliguri", "fonts/HindSiliguri-500-bengali.woff2", "500"],
  ["Inter", "fonts/Inter-700.woff2", "700"],
  ["Inter", "fonts/Inter-800.woff2", "800"],
  ["Hind Siliguri", "fonts/HindSiliguri-600.woff2", "600"],
  ["Hind Siliguri", "fonts/HindSiliguri-700.ttf", "700"],
  ["Sabbir Sorolota", "fonts/SabbirSorolota-num.woff2", "400"],
];
let loaded: Promise<void> | null = null;

export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [h] = useState(() => delayRender("dom-fonts"));
  useEffect(() => {
    if (!loaded) {
      loaded = Promise.all(
        FACES.map(([fam, url, weight]) => {
          const f = new FontFace(fam, `url(${staticFile(url)})`, { weight });
          return f.load().then((ff) => {
            (document.fonts as any).add(ff);
          });
        })
      ).then(() => undefined);
    }
    loaded.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  return <>{children}</>;
};
