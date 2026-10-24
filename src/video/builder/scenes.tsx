// The builder, redrawn over the film wherever the film shows it, so the video matches the product (the film's own canvas
// was styled by hand). `ft` is film time (timeline − 3.9 in the app window; a clip's film time in ClipWindow). Each shot
// covers the film's canvas exactly (window px), fades with the film's own cuts and tab flips, and carries the film
// cursor's tracked path (filmTrack.ts) moved onto the redrawn cards. Add a shot here when the film shows the builder.
import React from "react";
import { PriorityAssignment, PriorityInMaps } from "./linkedShots";
import { RunShots } from "./runShots";
import { MapShots } from "../map3d/MapShots";
import { AssistantShots } from "../assistant/shots";
import { assistantShown } from "../assistant/timing";

/** Every builder redraw at film time `ft`, in window px (place it inside the 1620×880 app window, over the film). The
 * Assistant section (assistant/shots.tsx) draws its own map, panel and cursor, in place of the film's map shot. */
export const BuilderScenes: React.FC<{ ft: number }> = ({ ft }) => assistantShown(ft)
  ? <AssistantShots ft={ft} /> : <><MapShots ft={ft} /><BuilderShotsAt ft={ft} /></>;

const BuilderShotsAt: React.FC<{ ft: number }> = ({ ft }) => {
  if (ft >= 185.8 && ft <= 193.5) return <><PriorityAssignment ft={ft} /><PriorityInMaps ft={ft} /></>;
  // the run in "errors" (film 150.3–153.65 s); the run scene itself (film 128.6–143.35 s) was rebuilt from staging (film v30:
  // taylor reynolds' run) and the redraw still shows Jordan's old one, so it stays off there until it is redrawn for v30
  if (ft >= 150.3 && ft <= 153.65) return <RunShots ft={ft} />;
  // The intro's builder shots (film 9.4–42.8 s) are off: that stretch of the film was rebuilt (the Lead Management hand-off
  // glide, the restyled form windows and the wall of tabs replace Continue Client Journey / Tag workflow, the four-up and the
  // flashes), so ContinueJourney, TagWorkflow, FourUp and Flashes no longer match what is under them.
  return null;
};
