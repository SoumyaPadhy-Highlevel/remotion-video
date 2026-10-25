import React from "react";
import {AbsoluteFill, Freeze, Sequence, useCurrentFrame, useVideoConfig} from "remotion";
import {z} from "zod";
import {WorkflowMapsVideo} from "../WorkflowMapsVideo";
import {DEFAULT_CFG} from "../config";
import {DEFAULT_MUSIC} from "../musicProps";
import {workflowMapsSchema} from "../musicProps";
import {MapRevealTease} from "./MapRevealTease";
import {revealSchema} from "./reviewProps";
import {mainEdit, MAIN_CONNECTED_SOURCE, MAIN_CONTEXT_FRAME, MAIN_INTRO_FROM, MAIN_REPEAT_START, MAIN_RESUME_SOURCE} from "./mainEdit";

export const mergedWorkflowMapsSchema = z.object({intro: revealSchema.omit({preview: true, layer: true}), ...workflowMapsSchema.shape});
export type MergedProps = z.infer<typeof mergedWorkflowMapsSchema>;

/** Latest main visuals remain code-driven. The surrounding sequences only cut
 * the already approved repeats; they never flatten or rewrite those scenes. */
export const MergedWorkflowMapsVideo: React.FC<MergedProps> = ({intro, ...base}) => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig();
  const edit = mainEdit(intro.timing, intro.title.motion.duration);
  const layer = base.layer ?? "all", showMusic = layer === "all" || layer === "audio";
  const showVisuals = layer !== "audio";
  const fade = Math.max(0, Math.min(1, (edit.end - 1 - frame) / (1.4 * fps)));
  const music = base.music ?? DEFAULT_MUSIC;
  const musicBase = {...base, layer: "audio" as const, audioEnabled: true};
  const musicGain = (sourceStart: number, outputStart: number, a: number, b: number) => (sourceFrame: number) => {
    const outputFrame = outputStart + sourceFrame - sourceStart;
    const xf = .04 * fps;
    const enter = a === 0 ? 1 : Math.sin(Math.max(0, Math.min(1, (outputFrame - (a - xf)) / (xf * 2))) * Math.PI / 2) ** 2;
    const leave = b === edit.end ? 1 : Math.cos(Math.max(0, Math.min(1, (outputFrame - (b - xf)) / (xf * 2))) * Math.PI / 2) ** 2;
    const endFade = Math.max(0, Math.min(1, (edit.end - 1 - outputFrame) / (1.4 * fps)));
    return endFade * enter * leave;
  };
  const xf = .04 * fps;
  const backdrop = <Freeze frame={0}>
    <Sequence from={-MAIN_CONTEXT_FRAME} layout="none" showInTimeline={false}>
      <WorkflowMapsVideo {...base} layer="base" audioEnabled={false} />
      <WorkflowMapsVideo {...base} layer="mascot" audioEnabled={false} />
    </Sequence>
  </Freeze>;
  const revealLayers = layer === "all" ? ["review" as const] : layer === "base" || layer === "tabs" || layer === "panel" || layer === "panels" ? ["map" as const]
    : layer === "titles" || layer === "titles-clean" ? ["titles" as const] : layer === "mascot" ? ["mascot" as const] : [];
  return <AbsoluteFill style={{background: layer === "all" || layer === "base" ? "#F4F8FF" : "transparent"}}>
    {showMusic ? <>
      <Sequence name="Music · approved intro, original 48s drop" durationInFrames={edit.musicDemoFrom + xf} layout="none">
        <WorkflowMapsVideo {...musicBase} music={music} audioGain={musicGain(0, 0, 0, edit.musicDemoFrom)} />
      </Sequence>
      <Sequence name="Music · current Plan it section" from={edit.musicDemoFrom - xf} trimBefore={MAIN_RESUME_SOURCE - xf}
        durationInFrames={edit.musicConnectedFrom - edit.musicDemoFrom + xf * 2} layout="none">
        <WorkflowMapsVideo {...musicBase} music={music} audioGain={musicGain(MAIN_RESUME_SOURCE, edit.musicDemoFrom, edit.musicDemoFrom, edit.musicConnectedFrom)} />
      </Sequence>
      <Sequence name="Music · connected workflows through ending" from={edit.musicConnectedFrom - xf} trimBefore={MAIN_CONNECTED_SOURCE - xf}
        durationInFrames={edit.end - edit.musicConnectedFrom + xf} layout="none">
        <WorkflowMapsVideo {...musicBase} music={music} audioGain={musicGain(MAIN_CONNECTED_SOURCE, edit.musicConnectedFrom, edit.musicConnectedFrom, edit.end)} />
      </Sequence>
    </> : null}
    {showVisuals ? <AbsoluteFill style={{opacity: fade}}>
      <Sequence name="Main opening · latest project" durationInFrames={MAIN_INTRO_FROM} layout="none">
        <WorkflowMapsVideo {...base} audioEnabled={false} />
      </Sequence>
      <Sequence name="Approved intro · editable text, map and mascot" from={MAIN_INTRO_FROM} durationInFrames={edit.demoFrom - MAIN_INTRO_FROM} layout="none">
        {revealLayers.map((revealLayer) => <MapRevealTease key={revealLayer} {...intro} preview layer={revealLayer} audioEnabled={false}
          background={backdrop} brandStyle={base.style ?? DEFAULT_CFG.style} />)}
      </Sequence>
      <Sequence name="Main · latest Plan it and asset interactions" from={edit.demoFrom} trimBefore={MAIN_RESUME_SOURCE} durationInFrames={edit.firstDemoFrames} layout="none">
        <WorkflowMapsVideo {...base} audioEnabled={false} />
      </Sequence>
      <Sequence name="Hold result · align linked-workflow music bar" from={edit.holdFrom} durationInFrames={edit.connectedFrom - edit.holdFrom} layout="none">
        <Freeze frame={0}><Sequence from={-(MAIN_REPEAT_START - 1)} layout="none" showInTimeline={false}>
          <WorkflowMapsVideo {...base} audioEnabled={false} />
        </Sequence></Freeze>
      </Sequence>
      <Sequence name="Main · current connected workflows, Organise, AI and errors" from={edit.connectedFrom} trimBefore={MAIN_CONNECTED_SOURCE} durationInFrames={edit.sourceEnd - MAIN_CONNECTED_SOURCE} layout="none">
        <WorkflowMapsVideo {...base} audioEnabled={false} />
      </Sequence>
    </AbsoluteFill> : null}
  </AbsoluteFill>;
};
