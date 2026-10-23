import React from "react";
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, win } from "./anim";
import { AppWindow } from "./AppWindow";
import { mascotAt, recedeAt } from "./choreography";
import { GLOBAL_CSS, loadFonts } from "./fonts";
import { Mascot } from "./Mascot";
import { EDIT, editTime, FPS, M, MUSIC, PANELS, uncut, VIDEO_END } from "./script";
import { Background, BrowserTabs, Flash, Message, Titles } from "./Stage";
import { Impact, ImpactBack, KineticTitle } from "./Impact";
import { ClipWindow, Panels } from "./Panels";
import { DEFAULT_MUSIC, MusicSettings } from "./musicProps";
import { Cfg, CfgProvider, cardText, DEFAULT_CFG, ShowCfg, StyleCfg, styleVars, TextCfg } from "./config";
import { BuildOverlay, splitAt, splitStyle } from "./Build";

loadFonts();

/** Layers back to front: background, tabs, app window, titles, message, mascot, flash.
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
export const WorkflowMapsVideo: React.FC<{ layer?: Layer; item?: number; music?: MusicSettings; text?: TextCfg; style?: StyleCfg; show?: ShowCfg }> = ({
  layer = "all", item = 0, music = DEFAULT_MUSIC, text = DEFAULT_CFG.text, style = DEFAULT_CFG.style, show = DEFAULT_CFG.show,
}) => {
  const cfg: Cfg = { text, style, show };
  const L = (k: Layer) => layer === "all" || layer === k || (k === "titles" && layer === "titles-clean");
  const plate = layer === "base";
  const frame = useCurrentFrame();
  const tn = uncut(frame / FPS);   // music time: the intro cut is skipped
  const { t, seg } = editTime(tn);
  // panel shots and film clips replace the window for their length (cross-fading in and out)
  const trio = seg?.panels ? win(tn, seg.n0, seg.n1, 0.35, 0.35) : seg?.clip ? win(tn, seg.n0, seg.n1, 0.2, 0.25) : 0;
  const k = seg?.hold && !seg.card?.top && !seg.panels && !seg.clip ? win(tn, seg.n0, seg.n1, 0.3, 0.35) : 0;
  const cards = EDIT.filter((s) => s.hold && !s.card?.top && !s.card?.build && !s.panels && !s.clip && tn >= s.n0 - 0.05 && tn < s.n1 + 0.4);
  const top = EDIT.find((s) => s.hold && s.card?.top && !s.clip && tn >= s.n0 && tn < (s.until ?? s.n1));
  // the mascot keeps to the corner while a panel shot or film clip replaces the window
  const st0 = mascotAt(t), st1 = seg?.panels || seg?.clip ? { ...st0, x: 1830, y: 960, s: 0.38, r: -10, o: (st0.o ?? 1) * (1 - 0.15 * trio) } : st0;
  // while the map is built beside the shrunk window, the mascot waits small under the window's bottom-right corner
  const sp = splitAt(t);
  const st = sp > 0 ? { ...st1, x: st1.x + (1790 - st1.x) * sp, y: st1.y + (968 - st1.y) * sp, s: st1.s + (0.32 - st1.s) * sp } : st1;
  return (
    <CfgProvider cfg={cfg}>
    <AbsoluteFill
      style={{ ...styleVars(style), background: L("base") ? "#F4F8FF" : "transparent", fontFamily: "var(--font-body, Inter), system-ui, sans-serif", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}
    >
      <style>{GLOBAL_CSS}</style>
      {/* music: percussion under the intro, cross-fading into the original track, whose first drop lands on the video's drop.
          Every time and level comes from the `music` props (editable in Studio's Props panel). */}
      {L("audio") ? (() => {
        const m = music, ramp = (x: number, a: number, b: number) => clamp((x - a) / Math.max(0.01, b - a));
        return <>
          <Sequence durationInFrames={Math.round(Math.max(m.percussionFadeOutEnd, 0.1) * FPS)} layout="none">
            <Audio src={staticFile(MUSIC.intro)} volume={(f) => m.percussionVolume * (1 - ramp(f / FPS, m.percussionFadeOutStart, m.percussionFadeOutEnd))} />
          </Sequence>
          <Sequence from={Math.round(m.originalStart * FPS)} durationInFrames={Math.round(MUSIC.loopAfter * FPS) + 4} layout="none">
            <Audio src={staticFile(MUSIC.main)} volume={(f) => m.originalVolume * ramp(f / FPS + m.originalStart, m.originalFadeInStart, m.originalFadeInEnd) * (1 - clamp((f / FPS - MUSIC.loopAfter) / 0.13))} />
          </Sequence>
          {/* bar-aligned loop: back to the drop, until the end */}
          <Sequence from={Math.round((m.originalStart + MUSIC.loopAfter) * FPS)} layout="none">
            <Audio src={staticFile(MUSIC.main)} trimBefore={Math.round(MUSIC.drop * FPS)} volume={(f) => m.originalVolume * (1 - ramp(f / FPS + m.originalStart + MUSIC.loopAfter, VIDEO_END - m.endFade, VIDEO_END))} />
          </Sequence>
        </>;
      })() : null}
      {L("base") ? <Background /> : null}
      <Freeze frame={Math.round(t * FPS)}>
        {/* the editor's titles carry a wash in place of the window's recede */}
        {layer === "titles" ? <div style={{ position: "absolute", inset: 0, background: "#EEF4FF", opacity: 0.6 * Math.max(k, t >= M.B2 && t < M.D2 + 0.1 ? 0 : recedeAt(t)) * (1 - trio) }} /> : null}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 560px", transform: plate ? undefined : `scale(${(1 - 0.1 * k).toFixed(4)})`, opacity: (plate ? 1 : 1 - 0.5 * k) * (1 - trio), filter: k > 0.02 && !plate ? `blur(${(7 * k).toFixed(2)}px)` : undefined }}>
          {L("base") ? <div style={{ position: "absolute", inset: 0, ...splitStyle(t) }}>
            <BrowserTabs t={t} />
            <AppWindow t={t} plate={plate} />
          </div> : layer === "tabs" ? <div style={{ position: "absolute", inset: 0, ...splitStyle(t) }}><BrowserTabs t={t} /></div> : null}
          {L("panel") ? <BuildOverlay t={t} /> : layer === "buildpanel" ? <BuildOverlay t={t} part="panel" /> : layer === "flight" ? <BuildOverlay t={t} part={item} /> : null}
          {L("titles") ? <>
            <ImpactBack t={t} />
            <Titles t={t} />
            <Impact t={t} />
          </> : null}
          {L("panel") || layer === "message" ? <Message t={t} /> : null}
        </div>
        {L("mascot") && show.mascot ? <Mascot t={t} st={{ ...(seg?.hold && !seg.card?.top ? { ...st, y: st.y - 8 * Math.sin((tn - seg.n0) * 3.2) } : st), s: st.s * show.mascotSize }} /> : null}
        {L("flash") && show.flashes ? <Flash t={t} /> : null}
      </Freeze>
      {/* the statement before each feature (say), on output time */}
      <div className="poppins" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {seg?.panels && (L("base") || layer === "panels") ? <Panels cfg={PANELS[seg.panels]} lt={tn - seg.n0} {...cardText(cfg, seg.card!)} fade={trio} /> : null}
        {seg?.clip && (L("base") || layer === "panels") ? <ClipWindow film={seg.clip[0] + (tn - seg.n0)} lt={tn - seg.n0} {...cardText(cfg, seg.card!)} fade={trio} /> : null}
        {L("titles") && show.featureCards && cards.map((s) => <KineticTitle key={s.n0} t={tn} at={s.n0} out={s.n1 - 0.3} {...cardText(cfg, s.card!)} size={style.sizes.featureCard} />)}
        {/* or, where the visual is light, the line sits above the window and the animation plays under it */}
        {top && L("titles") && show.topLines ? (() => {
          const o = win(tn, top.n0, top.until!, 0.3, 0.3), y = (1 - clamp((tn - top.n0) / 0.4)) * 24, tx = cardText(cfg, top.card!);
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
