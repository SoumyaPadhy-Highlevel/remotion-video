/** Plan native Premiere phrase layers from the saved script and composition.
 * Only static typography is rasterized; all movement/blur/opacity is in Premiere. */
import React from "react";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { MyComposition } from "../src/Composition";
import { cardText, Cfg, introCardHtml } from "../src/video/config";
import { CUT_LEN, EDIT, editTime, FPS, HEADLINES, INTRO_CUT, INTRO_CARDS, MUSIC, TITLE_CARDS, TITLE_DROP, uncut, VIDEO_END } from "../src/video/script";
import type { MusicSettings } from "../src/video/musicProps";
import { transform } from "motion";

const dir = resolve("out/premiere-computer-use/animated-type");
mkdirSync(resolve(dir, "media"), {recursive: true});
const main = React.Children.toArray(MyComposition().props.children).find(
  (c) => React.isValidElement<{id: string}>(c) && c.props.id === "WorkflowMaps",
) as React.ReactElement<{defaultProps: Cfg & {music: MusicSettings; steadyMotion?: boolean}}>;
const cfg = main.props.defaultProps;
const END = Math.round(VIDEO_END * FPS);
const out = (t: number) => t < INTRO_CUT[0] ? t : t - CUT_LEN;
const fr = (t: number) => Math.round(t * FPS);
type Card = {id: string; kicker: string; html: string; size: number; maxWidth: number; offsetY: number; start: number; end: number; kind: "support" | "hero" | "headline"};
const cards: Card[] = [];
const bounds = (a: number, b: number) => {
  const frames = Array.from({length: END}, (_, f) => f).filter((f) => {
    const tn = uncut(f / FPS), {t, seg} = editTime(tn);
    if (t < a || t >= b) return false;
    // Stage titles sit below replacement film/panel shots. Frozen source time
    // can lie inside a chapter for several seconds while that chapter is hidden.
    const si = seg ? EDIT.indexOf(seg) : -1, prev = EDIT[si - 2], next = EDIT[si + 2];
    const contIn = !!seg?.clip && prev?.clip?.[1] === seg.clip[0];
    const contOut = !!seg?.clip && next?.clip?.[0] === seg.clip[1];
    const afterCard = !!seg?.clip && !!prev?.hold && !prev.clip && !prev.panels && !prev.card?.top;
    const clipStart = seg && (contIn || afterCard) ? seg.n0 - 1 / FPS : seg?.n0 ?? 0;
    const trio = seg?.panels ? transform(tn, [seg.n0, seg.n0 + .35, seg.n1 - .35, seg.n1], [0, 1, 1, 0])
      : seg?.clip ? transform(tn, [clipStart, clipStart + (contIn || afterCard ? .001 : .2),
        seg.n1 - (next?.card?.over || contOut || next?.panels ? .001 : .25), seg.n1], [0, 1, 1, 0])
      : seg?.hold && seg.card?.over ? 1 : 0;
    const fromClip = seg?.panels && prev?.clip && tn < seg.n0 + .4;
    return !fromClip && 1 - trio > .05;
  });
  return frames.length ? [frames[0], frames[frames.length - 1] + 1] : undefined;
};
INTRO_CARDS.forEach((c, i) => {
  const range = bounds(c.a, c.b); if (!range) return;
  cards.push({id: `intro-${i + 1}`, kicker: "", html: introCardHtml(cfg, i), size: c.y ? cfg.style.sizes.introCardRaised : cfg.style.sizes.introCard,
    maxWidth: 1500, offsetY: c.y ?? 0, start: range[0], end: range[1], kind: "support"});
});
EDIT.filter((s) => s.hold && s.card && !s.card.top && !s.card.build && !s.card.cut && !s.panels && !s.clip && s.n1 > s.n0).forEach((s, i) => {
  const text = cardText(cfg, s.card!);
  cards.push({id: `statement-${i + 1}`, ...text, size: cfg.style.sizes.featureCard,
    maxWidth: text.html.startsWith("Organise your map") ? 1000 : 1500,
    offsetY: 0, start: fr(out(s.n0)), end: fr(out(s.n1)) - 3, kind: "support"});
});
TITLE_CARDS.forEach((c, i) => {
  const range = bounds(c.a, c.b); if (!range) return;
  cards.push({id: `chapter-${i + 1}`, ...cardText(cfg, c), size: cfg.style.sizes.titleCard,
    maxWidth: 1500, offsetY: 0, start: range[0], end: range[1], kind: "support"});
});
const impactFrame = fr(MUSIC.drop);
cards.push({id: "workflow-maps-drop", kicker: cfg.text.titleDrop.kicker,
  html: cfg.text.titleDrop.title.replace(/\*([^*]+)\*/g, '<span class="grad-text">$1</span>'),
  size: cfg.style.sizes.titleDrop, maxWidth: 1500, offsetY: 0,
  start: impactFrame - 12, end: fr(out(TITLE_DROP.out + 0.3)), kind: "hero"});
const breaks = bounds(HEADLINES[1].a, HEADLINES[1].b);
if (breaks) cards.push({id: "breaks-headline", kicker: "", html: cfg.text.breaksHeadline.replace(/\*([^*]+)\*/g, '<span class="grad-text">$1</span>'),
  size: HEADLINES[1].size, maxWidth: 1400, offsetY: 0, start: breaks[0], end: breaks[1], kind: "headline"});
cards.sort((a,b) => a.start - b.start);
const plates = cards.flatMap((card) => [
  ...(card.kicker ? [{...card, part: "kicker", file: `${card.id}-kicker.png`}] : []),
  {...card, part: "main", file: `${card.id}-main.png`},
  {...card, part: "accent", file: `${card.id}-accent.png`},
]);
writeFileSync(resolve(dir, "plan.json"), JSON.stringify({fps: FPS, end: END, impactFrame, wallFrame: impactFrame + 9, cfg, cards, plates}, null, 2));
writeFileSync(resolve(dir, "plates-props.json"), JSON.stringify({cfg, plates}));
writeFileSync(resolve(dir, "picture-props.json"), JSON.stringify({...cfg, steadyMotion: true, show: {...cfg.show,
  introCards: false, titleDrop: false, featureCards: false, titleCards: false, breaksHeadline: false}}));
console.log(`${cards.length} title cards, ${plates.length} phrase plates; drop impact at frame ${impactFrame} (${impactFrame / FPS}s)`);
