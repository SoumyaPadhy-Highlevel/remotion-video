import React from "react";
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame } from "remotion";
import { mix, transform } from "motion";
import { AppWindow } from "./AppWindow";
import { mascotAt, recedeAt } from "./choreography";
import { GLOBAL_CSS, loadFonts } from "./fonts";
import { Mascot } from "./Mascot";
import { EDIT, editTime, FPS, introCalloutAt, M, MUSIC, PANELS, uncut, VIDEO_END } from "./script";
import { Background, Flash, Message, Titles } from "./Stage";
import { Impact, ImpactBack, KineticTitle } from "./Impact";
import { ClipWindow, Panels } from "./Panels";
import { DEFAULT_MUSIC, MusicSettings } from "./musicProps";
import { Cfg, CfgProvider, cardText, DEFAULT_CFG, FxCfg, MotionCfg, ShowCfg, StyleCfg, styleVars, TextCfg } from "./config";
import { BuildOverlay, splitAt, splitStyle } from "./Build";

loadFonts();

/** Layers back to front: background, app window (in its device, with the tabs, through the intro), titles, message, mascot, flash.
 * After the intro the output is an edit of the timeline (script.ts EDIT): before each feature the scene freezes and
 * recedes behind a statement card, then the visual plays on its own. `tn` is output time, `t` the timeline time. */
/** `layer` renders one pass for an editor (DaVinci export, scripts/resolve-export.ts). Default "all" = the video.
 * "base": background, tabs, app window and panel shots; the window never recedes behind titles, so every title sits over a
 * clean still of the platform. "titles": every line of type plus, behind statement cards, a soft wash that stands in for the
 * recede. "panel": the "How the map works" panel and flying items, and the client message. "flash", "mascot", "audio". */
export type Layer = "all" | "base" | "titles" | "panel" | "flash" | "mascot" | "audio"
  // single pieces for the full breakdown (scripts/resolve-dissect.ts): titles without the wash, the panel shots only,
  // the map-build panel only, one flying item (`item`), the client message only
  | "titles-clean" | "panels" | "buildpanel" | "flight" | "message" | "tabs";
export const WorkflowMapsVideo: React.FC<{ layer?: Layer; item?: number; music?: MusicSettings; text?: TextCfg; style?: StyleCfg; show?: ShowCfg; motion?: MotionCfg; fx?: FxCfg }> = ({
  layer = "all", item = 0, music = DEFAULT_MUSIC, text = DEFAULT_CFG.text, style = DEFAULT_CFG.style, show = DEFAULT_CFG.show,
  motion = DEFAULT_CFG.motion, fx = DEFAULT_CFG.fx,
}) => {
  const cfg: Cfg = { text, style, show, motion, fx };
  const L = (k: Layer) => layer === "all" || layer === k || (k === "titles" && layer === "titles-clean");
  const plate = layer === "base";
  const frame = useCurrentFrame();
  const tn = uncut(frame / FPS);   // music time: the intro cut is skipped
  const { t, seg } = editTime(tn);
  // panel shots and film clips replace the window for their length (cross-fading in and out); a card held `over` a clip keeps
  // that clip's last frame behind it (receded) instead of the window, so the clip doesn't fade out into it
  const si = seg ? EDIT.indexOf(seg) : -1;
  const overSeg = seg?.hold && seg.card?.over ? seg : undefined, overClip = overSeg ? EDIT[si - 2] : undefined;
  // clips that continue the same film play straight on; a clip into a panel shot hands over its last frame under the panels
  // (no flash of the window between them)
  const prevS = EDIT[si - 2], nextS = EDIT[si + 2];
  const contIn = !!seg?.clip && prevS?.clip?.[1] === seg.clip[0], contOut = !!seg?.clip && nextS?.clip?.[0] === seg.clip[1];
  const intoOver = !!seg?.clip && !!nextS?.card?.over, intoPanels = !!seg?.clip && !!nextS?.panels;
  const fromClip = seg?.panels && prevS?.clip && tn < seg.n0 + 0.4 ? prevS : undefined;
  // a clip straight after a statement card cuts in (the card has finished leaving by then)
  const afterCard = !!seg?.clip && !!prevS?.hold && !prevS.clip && !prevS.panels && !prevS.card?.top;
  const trio = seg?.panels ? transform(tn, [seg.n0, seg.n0 + 0.35, seg.n1 - 0.35, seg.n1], [0, 1, 1, 0]) : seg?.clip ? transform(tn, [seg.n0, seg.n0 + (contIn || afterCard ? 0.001 : 0.2), seg.n1 - (intoOver || contOut || intoPanels ? 0.001 : 0.25), seg.n1], [0, 1, 1, 0]) : overSeg ? 1 : 0;
  const k = seg?.hold && !seg.card?.top && !seg.panels && !seg.clip ? transform(tn, [seg.n0, seg.n0 + 0.3, seg.n1 - (EDIT[EDIT.indexOf(seg) + 2]?.clip ? 0.001 : 0.35), seg.n1], [0, 1, 1, 0]) : 0;   // stays receded into a cut to a clip
  const cards = EDIT.filter((s) => s.hold && !s.card?.top && !s.card?.build && !s.panels && !s.clip && tn >= s.n0 - 0.05 && tn < s.n1 + 0.4);
  const top = EDIT.find((s) => s.hold && s.card?.top && !s.clip && tn >= s.n0 && tn < (s.until ?? s.n1));
  // the mascot keeps to the corner while a panel shot or film clip replaces the window
  const st0 = mascotAt(t), st1 = seg?.panels || seg?.clip || overSeg ? { ...st0, x: 1830, y: 960, s: 0.38, r: -10, o: (st0.o ?? 1) * (1 - 0.15 * trio) } : st0;
  // while the map is built beside the shrunk window, the mascot waits small under the window's bottom-right corner
  const sp = splitAt(t);
  const st = sp > 0 ? { ...st1, x: mix(st1.x, 1790, sp), y: mix(st1.y, 968, sp), s: mix(st1.s, 0.32, sp) } : st1;
  // the mascot bobs (as behind a statement card) while an intro callout holds the scene still
  const ih = introCalloutAt(tn), held = ih && tn >= ih.h0 && tn < ih.h1 ? ih.h0 : seg?.hold && !seg.card?.top ? seg.n0 : undefined;
  return (
    <CfgProvider cfg={cfg}>
    <AbsoluteFill
      style={{ ...styleVars(style), background: L("base") ? "#F4F8FF" : "transparent", fontFamily: "var(--font-body, Inter), system-ui, sans-serif", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}
    >
      <style>{GLOBAL_CSS}</style>
      {/* music: the one soundtrack file, its main drop on the video's drop; if the video outruns it, it jumps back to the drop
          on a bar line before its outro. Level, nudge, loop and end fade come from the `music` props (Studio's Props panel). */}
      {L("audio") ? (() => {
        const m = music, at = m.offset, loop = m.loopToDrop;
        const endVol = (o: number) => transform(o, [VIDEO_END - m.endFade, VIDEO_END - m.endFade + Math.max(0.01, m.endFade)], [1, 0]);
        return <>
          <Sequence from={Math.round(Math.max(0, at) * FPS)} durationInFrames={loop ? Math.round((MUSIC.loopAfter + Math.min(0, at)) * FPS) + 4 : undefined} layout="none">
            <Audio src={staticFile(MUSIC.file)} trimBefore={at < 0 ? Math.round(-at * FPS) : undefined}
              volume={(f) => m.volume * endVol(f / FPS + Math.max(0, at)) * (loop ? transform(f / FPS, [MUSIC.loopAfter + Math.min(0, at), MUSIC.loopAfter + Math.min(0, at) + 0.13], [1, 0]) : 1)} />
          </Sequence>
          {loop ? <Sequence from={Math.round((MUSIC.loopAfter + at) * FPS)} layout="none">
            <Audio src={staticFile(MUSIC.file)} trimBefore={Math.round(MUSIC.drop * FPS)} volume={(f) => m.volume * endVol(f / FPS + MUSIC.loopAfter + at)} />
          </Sequence> : null}
        </>;
      })() : null}
      {L("base") ? <Background /> : null}
      <Freeze frame={Math.round(t * FPS)}>
        {/* the editor's titles carry a wash in place of the window's recede */}
        {layer === "titles" ? <div style={{ position: "absolute", inset: 0, background: "#EEF4FF", opacity: 0.6 * Math.max(k, t >= M.B2 && t < M.D2 + 0.1 ? 0 : recedeAt(t)) * (1 - trio) }} /> : null}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 560px", transform: plate ? undefined : `scale(${(1 - motion.recedeCards.shrink * k).toFixed(4)})`, opacity: (plate ? 1 : 1 - motion.recedeCards.dim * k) * (1 - trio) * (fromClip ? 0 : 1), filter: k > 0.02 && !plate ? `blur(${(motion.recedeCards.blur * k).toFixed(2)}px)` : undefined }}>
          {L("base") ? <div style={{ position: "absolute", inset: 0, ...splitStyle(t) }}>
            <AppWindow t={t} tn={tn} plate={plate} />
          </div> : layer === "tabs" ? <div style={{ position: "absolute", inset: 0, ...splitStyle(t) }}><AppWindow t={t} tn={tn} plate chromeOnly /></div> : null}
          {L("panel") ? <BuildOverlay t={t} /> : layer === "buildpanel" ? <BuildOverlay t={t} part="panel" /> : layer === "flight" ? <BuildOverlay t={t} part={item} /> : null}
          {L("titles") ? <>
            <ImpactBack t={t} />
            <Titles t={t} />
            <Impact t={t} />
          </> : null}
          {L("panel") || layer === "message" ? <Message t={t} /> : null}
        </div>
        {L("mascot") && show.mascot ? <Mascot t={t} st={{ ...(held != null ? { ...st, y: st.y - motion.mascotBob * Math.sin((tn - held) * 3.2) } : st), s: st.s * show.mascotSize }} /> : null}
        {L("flash") && show.flashes ? <Flash t={t} /> : null}
      </Freeze>
      {/* the statement before each feature (say), on output time */}
      <div className="poppins" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {fromClip?.clip && (L("base") || layer === "panels") ? <div style={{ position: "absolute", inset: 0, opacity: transform(tn, [seg!.n0, seg!.n0 + 0.22], [1, 0]) }}>
          <ClipWindow film={fromClip.clip[1] - 1 / FPS} lt={fromClip.n1 - fromClip.n0} {...cardText(cfg, fromClip.card!)} fade={1} dur={fromClip.n1 - fromClip.n0} callout={fromClip.card!.callout} pop={fromClip.card!.pop} />
        </div> : null}
        {seg?.panels && (L("base") || layer === "panels") ? <Panels cfg={PANELS[seg.panels]} lt={tn - seg.n0} {...cardText(cfg, seg.card!)} fade={prevS?.clip ? Math.min(trio, transform(tn, [seg.n0 + 0.12, seg.n0 + 0.45], [0, 1])) : trio} /> : null}
        {seg?.clip && (L("base") || layer === "panels") ? <ClipWindow film={seg.clip[0] + (tn - seg.n0)} lt={tn - seg.n0} {...cardText(cfg, seg.card!)} fade={trio} dur={seg.n1 - seg.n0}
          callout={seg.card!.callout} pop={seg.card!.pop} /> : null}
        {overClip?.clip && (L("base") || layer === "panels") ? (() => {
          const kk = transform(tn, [overSeg!.n0, overSeg!.n0 + 0.35], [0, 1]), r = motion.recedeCards, out = nextS?.clip ? 1 : transform(tn, [overSeg!.n1 - 0.3, overSeg!.n1], [1, 0]);
          return <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 560px", transform: `scale(${(1 - r.shrink * kk).toFixed(4)})`, opacity: (1 - r.dim * kk) * out, filter: kk > 0.02 ? `blur(${(r.blur * kk).toFixed(2)}px)` : undefined }}>
            <ClipWindow film={overClip.clip[1] - 1 / FPS} lt={overClip.n1 - overClip.n0} {...cardText(cfg, overClip.card!)} fade={1} dur={overClip.n1 - overClip.n0} callout={overClip.card!.callout} pop={overClip.card!.pop} />
          </div>;
        })() : null}
        {L("titles") && show.featureCards && cards.map((s) => <KineticTitle key={s.n0} t={tn} at={s.n0} out={s.n1 - (EDIT[EDIT.indexOf(s) + 2]?.clip ? 0.75 : 0.3)} {...cardText(cfg, s.card!)} size={style.sizes.featureCard} />)}
        {/* or, where the visual is light, the line sits above the window and the animation plays under it */}
        {top && L("titles") && show.topLines ? (() => {
          const o = transform(tn, [top.n0, top.n0 + 0.3, top.until! - 0.3, top.until!], [0, 1, 1, 0]), y = transform(tn, [top.n0, top.n0 + 0.4], [1, 0]) * motion.titles.topLineSlide, tx = cardText(cfg, top.card!);
          return (
            <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", opacity: o, transform: `translateY(${y.toFixed(1)}px)` }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: "var(--accent, #155EEF)", letterSpacing: "0.12em", marginBottom: 2 }}>{tx.kicker}</div>
              <div style={{ fontSize: style.sizes.topLine, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink, #0B1B3A)" }} dangerouslySetInnerHTML={{ __html: tx.html }} />
            </div>
          );
        })() : null}
      </div>
    </AbsoluteFill>
    </CfgProvider>
  );
};
