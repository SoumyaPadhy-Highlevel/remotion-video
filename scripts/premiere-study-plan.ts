/** Prepare three current-cut title transitions for finishing in Premiere.
 * Reads the saved composition props; does not change the Remotion edit. */
import React from "react";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { MyComposition } from "../src/Composition";
import { cardText, Cfg } from "../src/video/config";
import { MusicSettings } from "../src/video/musicProps";
import { CUT_LEN, EDIT, editTime, FPS, INTRO_CUT, TITLE_CARDS, uncut, VIDEO_END } from "../src/video/script";

const dir = resolve(process.argv[2] ?? "out/premiere-computer-use/current-study");
mkdirSync(resolve(dir, "media"), { recursive: true });
const composition = React.Children.toArray(MyComposition().props.children).find(
  (child) => React.isValidElement<{ id: string }>(child) && child.props.id === "WorkflowMaps",
) as React.ReactElement<{ defaultProps: Cfg & { music: MusicSettings } }>;
if (!composition) throw new Error("WorkflowMaps registration was not found");
const props = composition.props.defaultProps;
const out = (time: number) => time < INTRO_CUT[0] ? time : time - CUT_LEN;
const fr = (time: number) => Math.round(time * FPS);
const targets = [
  ["organise", "Organise your map"],
  ["troubleshoot", "Pick any contact"],
  ["assistant", "And it doesn’t just answer"],
];
const scenes = targets.map(([id, match]) => {
  const index = EDIT.findIndex((s) => s.hold && s.card?.html.includes(match));
  if (index < 0) throw new Error(`Missing study scene: ${match}`);
  const segment = EDIT[index];
  const title = cardText(props, segment.card!);
  const start = fr(out(segment.n0));
  const end = fr(out(segment.n1));
  return { id, ...title, start, end, patchStart: start - 24, patchEnd: end + 27,
    titleEnd: end - 3, entranceFrames: 12, exitFrames: 8, size: props.style.sizes.featureCard,
    maxWidth: id === "organise" ? 1000 : 1500 };
});
const makeCard = TITLE_CARDS[0];
const visibleFrames = Array.from({length: fr(VIDEO_END)}, (_, f) => f).filter((f) => {
  const {t} = editTime(uncut(f / FPS));
  return t > makeCard.a && t < makeCard.b;
});
const makeItYours = { id: "make-it-yours-smooth", ...cardText(props, makeCard),
  start: visibleFrames[0], end: visibleFrames[visibleFrames.length - 1] + 1,
  titleEnd: visibleFrames[visibleFrames.length - 1] + 1,
  patchStart: scenes[0].patchStart - 30, patchEnd: scenes[0].patchEnd + 30,
  entranceFrames: 10, exitFrames: 6, motion: "calm", size: props.style.sizes.titleCard, maxWidth: 1500 };
const plan = { fps: FPS, end: fr(VIDEO_END), sourceRevision: "384dc03", scenes, makeItYours, props };
writeFileSync(resolve(dir, "plan.json"), JSON.stringify(plan, null, 2));
writeFileSync(resolve(dir, "clean-props.json"), JSON.stringify({ ...props, show: { ...props.show, featureCards: false } }));
for (const s of scenes) writeFileSync(resolve(dir, `${s.id}-title.json`), JSON.stringify({ cfg: props, title: s }));
writeFileSync(resolve(dir, `${makeItYours.id}-title.json`), JSON.stringify({cfg: props, title: makeItYours}));
writeFileSync(resolve(dir, "make-it-yours-clean-props.json"), JSON.stringify({...props, show: {...props.show, featureCards: false, titleCards: false}}));
console.log(JSON.stringify({ fps: FPS, frames: plan.end, scenes: scenes.map(({id,start,end,patchStart,patchEnd,kicker,html}) => ({id,start,end,patchStart,patchEnd,kicker,html})) }, null, 2));
