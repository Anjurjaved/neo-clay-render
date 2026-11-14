import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, staticFile } from "remotion";
import { SEGMENTS } from "./segments";
import { FPS, W, H, TOTAL_SEC } from "./kit/time";
import { Test } from "./segments/_Test";
import { FontGate } from "./kit/Fonts";
import { Web11 } from "./web11/Web11";
import { Lab } from "./lab/Lab";
import { LibComp } from "./lib/LibComp";
import { Manifest } from "./lib/Manifest";
import { byId as libById } from "./lib/registry";
import { Film as WD004 } from "./wd004/Film";
import { DURATION as WD_DUR } from "./wd004/cues";

const f = (s: number) => Math.round(s * FPS);

/** পুরো ফিল্ম: প্রতিটা segment নিজের Sequence-এ; audio = আসল master-এর audio (voice+SFX, timing হুবহু) */
const Main: React.FC<{ audio?: boolean }> = ({ audio = true }) => (
  <AbsoluteFill style={{ background: "#F6E7D6" }}>
    <FontGate>
    {SEGMENTS.map((s) => (
      <Sequence key={s.id} from={f(s.start)} durationInFrames={f(s.end) - f(s.start)} name={s.id}>
        <s.Comp />
      </Sequence>
    ))}
    </FontGate>
    {audio && <Audio src={staticFile("master_audio.m4a")} />}
  </AbsoluteFill>
);

/** একক segment preview — local frame-এ, কিন্তু segment নিজে absolute সময় হিসাব করে */
const SegOnly: React.FC<{ id: string }> = ({ id }) => {
  const s = SEGMENTS.find((x) => x.id === id)!;
  return (
    <AbsoluteFill>
      <FontGate>
        <s.Comp />
      </FontGate>
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <Composition id="Test" component={() => <FontGate><Test /></FontGate>} durationInFrames={60} fps={FPS} width={W} height={H} />
    <Composition
      id="Web11"
      component={() => (
        <AbsoluteFill>
          <FontGate>
            <Web11 />
          </FontGate>
          <Audio src={staticFile("web11/voice.mp3")} />
        </AbsoluteFill>
      )}
      durationInFrames={1213}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition id="WD004" component={() => (<FontGate><WD004 /></FontGate>)} durationInFrames={Math.round(WD_DUR * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="LibManifest" component={Manifest} durationInFrames={1} fps={FPS} width={64} height={64} />
    <Composition
      id="LibItem"
      component={LibComp as any}
      durationInFrames={90}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ id: "devices-macbook" }}
      calculateMetadata={({ props }: any) => ({ durationInFrames: Math.max(30, Math.round((libById(props.id)?.duration ?? 3) * FPS)) })}
    />
    <Composition id="Lab" component={(p: any) => (<FontGate><Lab item={p.item} /></FontGate>)} durationInFrames={30} fps={FPS} width={W} height={H} defaultProps={{ item: "phones" }} />
    <Composition id="Neo" component={Main} durationInFrames={f(TOTAL_SEC)} fps={FPS} width={W} height={H} defaultProps={{ audio: true }} />
    {SEGMENTS.map((s) => (
      <Composition
        key={s.id}
        id={`Seg-${s.id}`}
        component={SegOnly as any}
        durationInFrames={f(s.end) - f(s.start)}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ id: s.id }}
      />
    ))}
  </>
);
