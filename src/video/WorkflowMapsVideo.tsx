import React from "react";
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, win } from "./anim";
import { AppWindow } from "./AppWindow";
import { mascotAt, recedeAt } from "./choreography";
import { GLOBAL_CSS, loadFonts } from "./fonts";
import { Mascot } from "./Mascot";
import { CUT_LEN, EDIT, editTime, FPS, INTRO_CUT, M, PANELS, uncut, VIDEO_END } from "./script";
import { Background, BrowserTabs, Flash, Message, Titles } from "./Stage";
import { Impact, ImpactBack, KineticTitle } from "./Impact";
import { ClipWindow, Panels } from "./Panels";
import { BuildOverlay, splitAt, splitStyle } from "./Build";

loadFonts();
const MUSIC_LEN = 183.85;   // music-intro2.mp3

/** Layers back to front: background, tabs, app window, titles, message, mascot, flash.
 * After the intro the output is an edit of the timeline (script.ts EDIT): before each feature the scene freezes and
 * recedes behind a statement card, then the visual plays on its own. `tn` is output time, `t` the timeline time. */
/** `layer` renders one pass for an editor (DaVinci export, scripts/resolve-export.ts). Default "all" = the video.
 * "base": background, tabs, app window and panel shots; the window never recedes behind titles, so every title sits over a
 * clean still of the platform. "titles": every line of type plus, behind statement cards, a soft wash that stands in for the
 * recede. "panel": the "How the map works" panel and flying items, and the client message. "flash", "mascot", "audio". */
export type Layer = "all" | "base" | "titles" | "panel" | "flash" | "mascot" | "audio";
export const WorkflowMapsVideo: React.FC<{ layer?: Layer }> = ({ layer = "all" }) => {
  const L = (k: Layer) => layer === "all" || layer === k;
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
    <AbsoluteFill
      style={{ background: L("base") ? "#F4F8FF" : "transparent", fontFamily: "Inter, system-ui, sans-serif", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}
    >
      <style>{GLOBAL_CSS}</style>
      {/* placeholder music: the extended track with the intro cut's 3 bars taken out, then looped under the longer edit */}
      {L("audio") ? <>
      <Sequence durationInFrames={Math.round(INTRO_CUT[0] * FPS)} layout="none"><Audio src={staticFile("music-intro2.mp3")} /></Sequence>
      <Sequence from={Math.round(INTRO_CUT[0] * FPS)} durationInFrames={Math.round((MUSIC_LEN - INTRO_CUT[1]) * FPS)} layout="none">
        <Audio src={staticFile("music-intro2.mp3")} trimBefore={Math.round(INTRO_CUT[1] * FPS)} />
      </Sequence>
      <Sequence from={Math.round((MUSIC_LEN - CUT_LEN) * FPS)} layout="none">
        <Audio src={staticFile("music-intro2.mp3")} loop volume={(f) => 1 - clamp(((f / FPS + MUSIC_LEN - CUT_LEN) - (VIDEO_END - 1.6)) / 1.6)} />
      </Sequence>
      </> : null}
      {L("base") ? <Background /> : null}
      <Freeze frame={Math.round(t * FPS)}>
        {/* the editor's titles carry a wash in place of the window's recede */}
        {layer === "titles" ? <div style={{ position: "absolute", inset: 0, background: "#EEF4FF", opacity: 0.6 * Math.max(k, t >= M.B2 && t < M.D2 + 0.1 ? 0 : recedeAt(t)) * (1 - trio) }} /> : null}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 560px", transform: plate ? undefined : `scale(${(1 - 0.1 * k).toFixed(4)})`, opacity: (plate ? 1 : 1 - 0.5 * k) * (1 - trio), filter: k > 0.02 && !plate ? `blur(${(7 * k).toFixed(2)}px)` : undefined }}>
          {L("base") ? <div style={{ position: "absolute", inset: 0, ...splitStyle(t) }}>
            <BrowserTabs t={t} />
            <AppWindow t={t} plate={plate} />
          </div> : null}
          {L("panel") ? <BuildOverlay t={t} /> : null}
          {L("titles") ? <>
            <ImpactBack t={t} />
            <Titles t={t} />
            <Impact t={t} />
          </> : null}
          {L("panel") ? <Message t={t} /> : null}
        </div>
        {L("mascot") ? <Mascot t={t} st={seg?.hold && !seg.card?.top ? { ...st, y: st.y - 8 * Math.sin((tn - seg.n0) * 3.2) } : st} /> : null}
        {L("flash") ? <Flash t={t} /> : null}
      </Freeze>
      {/* the statement before each feature (say), on output time */}
      <div className="poppins" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {seg?.panels && L("base") ? <Panels cfg={PANELS[seg.panels]} lt={tn - seg.n0} kicker={seg.card!.kicker} html={seg.card!.html} fade={trio} /> : null}
        {seg?.clip && L("base") ? <ClipWindow film={seg.clip[0] + (tn - seg.n0)} lt={tn - seg.n0} kicker={seg.card!.kicker} html={seg.card!.html} fade={trio} /> : null}
        {L("titles") && cards.map((s) => <KineticTitle key={s.n0} t={tn} at={s.n0} out={s.n1 - 0.3} kicker={s.card!.kicker} html={s.card!.html} size={84} />)}
        {/* or, where the visual is light, the line sits above the window and the animation plays under it */}
        {top && L("titles") ? (() => {
          const o = win(tn, top.n0, top.until!, 0.3, 0.3), y = (1 - clamp((tn - top.n0) / 0.4)) * 24;
          return (
            <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", opacity: o, transform: `translateY(${y.toFixed(1)}px)` }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: "#155EEF", letterSpacing: "0.12em", marginBottom: 2 }}>{top.card!.kicker}</div>
              <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.01em", color: "#0B1B3A" }} dangerouslySetInnerHTML={{ __html: top.card!.html }} />
            </div>
          );
        })() : null}
      </div>
    </AbsoluteFill>
  );
};
