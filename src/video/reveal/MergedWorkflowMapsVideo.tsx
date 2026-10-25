import React from "react";
import {AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {z} from "zod";
import {WorkflowMapsVideo} from "../WorkflowMapsVideo";
import {DEFAULT_CFG} from "../config";
import {DEFAULT_MUSIC, MusicSettings} from "../musicProps";
import {workflowMapsSchema} from "../musicProps";
import {MapRevealTease} from "./MapRevealTease";
import {revealSchema, RevealTiming} from "./reviewProps";
import {cutStretches, LINKED_DISSOLVE, mainEdit, MUSIC_MIX, MAIN_CONNECTED_SOURCE, MAIN_CONTEXT_FRAME, MAIN_FIRST_CARD_T, MAIN_INTRO_FROM, MAIN_PLAN_STILL, MAIN_RESUME_SOURCE} from "./mainEdit";
import {HANDOFF, recededRect} from "./handoff";
import {musicPieces} from "./musicEdit";
import {MUSIC} from "../script";
import {WINDOW} from "../AppWindow";
import {mascotAt} from "../choreography";
import {withSteadyMotion} from "../steadyMotion";

/** Studio mounts each section this many frames early (hidden), so its footage has loaded by the time it shows. */
const PREMOUNT = 45;

export const mergedWorkflowMapsSchema = z.object({intro: revealSchema.omit({preview: true, layer: true}), ...workflowMapsSchema.shape});
export type MergedProps = z.infer<typeof mergedWorkflowMapsSchema>;

/** The cut's music as edited: pieces of the one soundtrack file (musicEdit.ts), back to back, each join a 0.04 s equal-power
 * crossfade on a bar line, faded out at the end. The `WorkflowMapsMusicEdit` composition renders it; its bounce (MUSIC_MIX)
 * is what the video plays, as one audio track. Rebuild the bounce after changing any timing (mainEdit.ts MUSIC_MIX). */
export const MergedMusicEdit: React.FC<{intro: {timing: RevealTiming; title: {motion: {duration: number}}}; music?: MusicSettings}> = ({intro, music = DEFAULT_MUSIC}) => {
  const {fps} = useVideoConfig();
  const edit = mainEdit(intro.timing, intro.title.motion.duration), end = edit.end / fps, xf = .04;
  const pieces = musicPieces(cutStretches(edit), music);
  const k = (x: number) => Math.max(0, Math.min(1, x));
  return <>{pieces.map((p, i) => {
    const a = i > 0 ? p.out0 - xf : 0, b = i < pieces.length - 1 ? p.out1 + xf : end;
    const gain = (o: number) => (i > 0 ? Math.sin(k((o - a) / (2 * xf)) * Math.PI / 2) ** 2 : 1)
      * (i < pieces.length - 1 ? Math.cos(k((o - (p.out1 - xf)) / (2 * xf)) * Math.PI / 2) ** 2 : 1) * k((end - 1 / fps - o) / 1.4);
    return <Sequence key={i} name={`Music · file ${p.file0.toFixed(2)} s`} from={a * fps} durationInFrames={(b - a) * fps} layout="none">
      <Audio src={staticFile(MUSIC.file)} trimBefore={(p.file0 - (p.out0 - a)) * fps} volume={(f) => music.volume * gain(a + f / fps)} />
    </Sequence>;
  })}</>;
};

/** Latest main visuals remain code-driven. The surrounding sequences only cut
 * the already approved repeats; they never flatten or rewrite those scenes. */
export const MergedWorkflowMapsVideo: React.FC<MergedProps> = ({intro, ...base}) => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig();
  const edit = mainEdit(intro.timing, intro.title.motion.duration);
  const layer = base.layer ?? "all", showMusic = layer === "all" || layer === "audio";
  const showVisuals = layer !== "audio";
  const fade = Math.max(0, Math.min(1, (edit.end - 1 - frame) / (1.4 * fps)));
  const music = base.music ?? DEFAULT_MUSIC;
  // the reveal ends on the main video's first frame: its window receded behind the Plan it card, the mascot in its corner
  const motion = base.steadyMotion ? withSteadyMotion(base.motion ?? DEFAULT_CFG.motion) : base.motion ?? DEFAULT_CFG.motion;
  const mascotEnd = mascotAt(MAIN_FIRST_CARD_T), revealLen = edit.demoFrom - MAIN_INTRO_FROM;
  const handoff = {frame: revealLen, window: recededRect(WINDOW, motion.recedeCards.shrink), blur: motion.recedeCards.blur, wash: motion.recedeCards.dim,
    mascot: {...mascotEnd, s: mascotEnd.s * (base.show ?? DEFAULT_CFG.show).mascotSize}};
  // Plan it holds its last clean frame and dissolves into the linked workflows' first frame across the bar line
  const planFrames = MAIN_PLAN_STILL - MAIN_RESUME_SOURCE + 1, d0 = edit.connectedFrom - LINKED_DISSOLVE / 2, d1 = d0 + LINKED_DISSOLVE;
  const dissolve = Math.max(0, Math.min(1, (frame - d0 + 1) / (LINKED_DISSOLVE + 1))), planOut = 1 - dissolve * dissolve * (3 - 2 * dissolve);
  const still = (source: number) => <Freeze frame={0}><Sequence from={-source} layout="none" showInTimeline={false}>
    <WorkflowMapsVideo {...base} audioEnabled={false} />
  </Sequence></Freeze>;
  const backdrop = <Freeze frame={0}>
    <Sequence from={-MAIN_CONTEXT_FRAME} layout="none" showInTimeline={false}>
      <WorkflowMapsVideo {...base} layer="base" audioEnabled={false} />
      <WorkflowMapsVideo {...base} layer="mascot" audioEnabled={false} />
    </Sequence>
  </Freeze>;
  const revealLayers = layer === "all" ? ["review" as const] : layer === "base" || layer === "tabs" || layer === "panel" || layer === "panels" ? ["map" as const]
    : layer === "titles" || layer === "titles-clean" ? ["titles" as const] : layer === "mascot" ? ["mascot" as const] : [];
  // the AbsoluteFills here only style (background, fades): kept out of Studio's timeline, which lists the named sections
  return <AbsoluteFill showInTimeline={false}
    style={{
      background: layer === "all" || layer === "base" ? "#F4F8FF" : "transparent",
      translate: "1px 0px"
    }}
  >
    {/* one soundtrack for the whole video: the edited music, bounced to a single file (MergedMusicEdit) */}
    {showMusic ? <Audio name="Music" src={staticFile(MUSIC_MIX)} volume={music.volume} /> : null}
    {showVisuals ? <AbsoluteFill showInTimeline={false} style={{opacity: fade}}>
      <Sequence name="Main opening · latest project" durationInFrames={MAIN_INTRO_FROM} premountFor={PREMOUNT}>
        <WorkflowMapsVideo {...base} audioEnabled={false} />
      </Sequence>
      <Sequence name="Main · latest Plan it and asset interactions" from={edit.demoFrom} trimBefore={MAIN_RESUME_SOURCE} durationInFrames={planFrames} premountFor={PREMOUNT}>
        <WorkflowMapsVideo {...base} audioEnabled={false} cutInAt={MAIN_RESUME_SOURCE} />
      </Sequence>
      {/* over the main video, so its last frames fade out over the Plan it card's first ones */}
      <Sequence name="Approved intro · editable text, map and mascot" from={MAIN_INTRO_FROM} durationInFrames={revealLen + HANDOFF.fade} premountFor={PREMOUNT}>
        <AbsoluteFill showInTimeline={false} style={{opacity: 1 - Math.max(0, Math.min(1, (frame - edit.demoFrom + 1) / (HANDOFF.fade + 1)))}}>
          {revealLayers.map((revealLayer) => <MapRevealTease key={revealLayer} {...intro} preview layer={revealLayer} audioEnabled={false}
            background={backdrop} brandStyle={base.style ?? DEFAULT_CFG.style} handoff={handoff} />)}
        </AbsoluteFill>
      </Sequence>
      <Sequence name="Linked workflows · first frame under the dissolve" from={d0} durationInFrames={edit.connectedFrom - d0} premountFor={PREMOUNT}>
        {still(MAIN_CONNECTED_SOURCE)}
      </Sequence>
      <Sequence name="Main · current connected workflows, Organise, AI and errors" from={edit.connectedFrom} trimBefore={MAIN_CONNECTED_SOURCE} durationInFrames={edit.sourceEnd - MAIN_CONNECTED_SOURCE} premountFor={PREMOUNT}>
        <WorkflowMapsVideo {...base} audioEnabled={false} />
      </Sequence>
      <Sequence name="Hold result · dissolve into the linked-workflow music bar" from={edit.demoFrom + planFrames} durationInFrames={d1 - edit.demoFrom - planFrames} premountFor={PREMOUNT}>
        <AbsoluteFill showInTimeline={false} style={{opacity: planOut}}>{still(MAIN_PLAN_STILL)}</AbsoluteFill>
      </Sequence>
    </AbsoluteFill> : null}
  </AbsoluteFill>;
};
