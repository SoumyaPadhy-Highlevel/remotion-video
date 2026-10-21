import React from "react";
import { AbsoluteFill, Audio, Freeze, staticFile, useCurrentFrame } from "remotion";
import { clamp, win } from "./anim";
import { AppWindow } from "./AppWindow";
import { mascotAt } from "./choreography";
import { GLOBAL_CSS, loadFonts } from "./fonts";
import { Mascot } from "./Mascot";
import { EDIT, EDIT_END, editTime, FPS } from "./script";
import { Background, BrowserTabs, Flash, Message, Titles } from "./Stage";
import { Impact, ImpactBack, KineticTitle } from "./Impact";

loadFonts();

/** Layers back to front: background, tabs, app window, titles, message, mascot, flash.
 * After the intro the output is an edit of the timeline (script.ts EDIT): before each feature the scene freezes and
 * recedes behind a statement card, then the visual plays on its own. `tn` is output time, `t` the timeline time. */
export const WorkflowMapsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const tn = frame / FPS;
  const { t, seg } = editTime(tn);
  const k = seg?.hold ? win(tn, seg.n0, seg.n1, 0.3, 0.35) : 0;
  const cards = EDIT.filter((s) => s.hold && tn >= s.n0 - 0.05 && tn < s.n1 + 0.4);
  const st = mascotAt(t);
  return (
    <AbsoluteFill style={{ background: "#F4F8FF", fontFamily: "Inter, system-ui, sans-serif", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}>
      <style>{GLOBAL_CSS}</style>
      {/* placeholder music: the extended track, looped under the longer edit */}
      <Audio src={staticFile("music-intro2.mp3")} loop volume={(f) => 1 - clamp((f / FPS - (EDIT_END - 1.6)) / 1.6)} />
      <Background />
      <Freeze frame={Math.round(t * FPS)}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 560px", transform: `scale(${(1 - 0.1 * k).toFixed(4)})`, opacity: 1 - 0.5 * k, filter: k > 0.02 ? `blur(${(7 * k).toFixed(2)}px)` : undefined }}>
          <BrowserTabs t={t} />
          <AppWindow t={t} />
          <ImpactBack t={t} />
          <Titles t={t} />
          <Impact t={t} />
          <Message t={t} />
        </div>
        <Mascot t={t} st={seg?.hold ? { ...st, y: st.y - 8 * Math.sin((tn - seg.n0) * 3.2) } : st} />
        <Flash t={t} />
      </Freeze>
      {/* the statement before each feature (say), on output time */}
      <div className="poppins" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {cards.map((s) => <KineticTitle key={s.n0} t={tn} at={s.n0} out={s.n1 - 0.3} kicker={s.card!.kicker} html={s.card!.html} size={84} />)}
      </div>
    </AbsoluteFill>
  );
};
