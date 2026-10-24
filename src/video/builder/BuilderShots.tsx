// For checking the builder redraws: the app film on its own clock (frame = film frame), 1620×880, with the redraws over it
// (`overlay`: false shows the bare film to compare). Composition "BuilderShots".
import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { GLOBAL_CSS, loadFonts } from "../fonts";
import { APP_FILE, FPS } from "../script";
import { BuilderScenes } from "./scenes";
import { PlanAssets, PLAN_LEN } from "./PlanAssets";

loadFonts();

export const BuilderShots: React.FC<{ overlay?: boolean }> = ({ overlay = true }) => {
  const ft = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <style>{GLOBAL_CSS}</style>
      <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted style={{ width: 1620, height: 880 }} />
      {overlay ? <BuilderScenes ft={ft} /> : null}
    </AbsoluteFill>
  );
};

/** For checking "Plan it" (PlanAssets.tsx) on its own clock: the film's map page held at `film` s, the shot over it. Composition
 *  "PlanAssets". */
export { PLAN_LEN };
export const PlanAssetsShot: React.FC<{ film?: number }> = ({ film = 64.24 }) => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <style>{GLOBAL_CSS}</style>
      <Freeze frame={0}><OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted trimBefore={Math.round(film * FPS)} style={{ width: 1620, height: 880 }} /></Freeze>
      <PlanAssets t={t} />
    </AbsoluteFill>
  );
};
