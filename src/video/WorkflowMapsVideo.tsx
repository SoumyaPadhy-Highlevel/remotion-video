import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { clamp } from "./anim";
import { AppWindow } from "./AppWindow";
import { mascotAt } from "./choreography";
import { GLOBAL_CSS, loadFonts } from "./fonts";
import { Mascot } from "./Mascot";
import { FPS, M } from "./script";
import { Background, BrowserTabs, Flash, Message, Titles } from "./Stage";
import { Impact, ImpactBack } from "./Impact";

loadFonts();

/** Layers back to front: background, tabs, app window, titles, message, mascot, flash. */
export const WorkflowMapsVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: "#F4F8FF", fontFamily: "Inter, system-ui, sans-serif", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}>
      <style>{GLOBAL_CSS}</style>
      <Audio src={staticFile("music.mp3")} volume={(f) => 1 - clamp((f / FPS - (M.END - 1.3)) / 1.3)} />
      <Background />
      <BrowserTabs t={t} />
      <AppWindow t={t} />
      <ImpactBack t={t} />
      <Titles t={t} />
      <Impact t={t} />
      <Message t={t} />
      <Mascot t={t} st={mascotAt(t)} />
      <Flash t={t} />
    </AbsoluteFill>
  );
};
