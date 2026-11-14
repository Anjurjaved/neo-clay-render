// wd004 — website-development-004 পুরো ভিডিও (259 s)। প্রতিটা scene নিজের Stage-এ, নিজের সময়-জানালায়।
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FPS } from "../kit/time";
import { SCENES, DURATION } from "./cues";
import { S01 } from "./scenes/S01";
import { S02 } from "./scenes/S02";
import { S03 } from "./scenes/S03";
import { S04 } from "./scenes/S04";
import { S05 } from "./scenes/S05";
import { S06 } from "./scenes/S06";
import { S07 } from "./scenes/S07";
import { S08 } from "./scenes/S08";

const f = (s: number) => Math.round(s * FPS);
/** [component, শুরু, শেষ] — S01 ০ থেকে (title+answer) */
export const WD_SCENES: [React.FC, number, number, string][] = [
  [S01, 0, SCENES.price, "S01 title+answer"],
  [S02, SCENES.price, SCENES.stat, "S02 price"],
  [S03, SCENES.stat, SCENES.compare, "S03 stat"],
  [S04, SCENES.compare, SCENES.points, "S04 compare"],
  [S05, SCENES.points, SCENES.timeline, "S05 points"],
  [S06, SCENES.timeline, SCENES.faq, "S06 timeline"],
  [S07, SCENES.faq, SCENES.cta, "S07 faq"],
  [S08, SCENES.cta, DURATION, "S08 cta"],
];

export const Film: React.FC = () => (
  <AbsoluteFill style={{ background: "#F6E3D4" }}>
    {WD_SCENES.map(([C, a, b, name]) => (
      <Sequence key={name} from={f(a)} durationInFrames={f(b) - f(a)} name={name}>
        <C />
      </Sequence>
    ))}
    <Audio src={staticFile("wd004/voice.mp3")} />
  </AbsoluteFill>
);
