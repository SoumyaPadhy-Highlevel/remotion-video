// The builder, redrawn over the film wherever the film shows it, so the video matches the product (the film's own canvas
// was styled by hand). `ft` is film time (timeline − 3.9 in the app window; a clip's film time in ClipWindow). Each shot
// covers the film's canvas exactly (window px), fades with the film's own cuts and tab flips, and carries the film
// cursor's tracked path (filmTrack.ts) moved onto the redrawn cards. Add a shot here when the film shows the builder.
import React from "react";
import { ContinueJourney, Flashes, FourUp, TagWorkflow } from "./introShots";
import { PriorityAssignment, PriorityInMaps } from "./linkedShots";
import { RunShots } from "./runShots";
import { MapShots } from "../map3d/MapShots";

/** Every builder redraw at film time `ft`, in window px (place it inside the 1620×880 app window, over the film). */
export const BuilderScenes: React.FC<{ ft: number }> = ({ ft }) => <><MapShots ft={ft} /><BuilderShotsAt ft={ft} /></>;

const BuilderShotsAt: React.FC<{ ft: number }> = ({ ft }) => {
  if (ft >= 185.8 && ft <= 193.5) return <><PriorityAssignment ft={ft} /><PriorityInMaps ft={ft} /></>;
  if ((ft >= 128.6 && ft <= 143.35) || (ft >= 150.3 && ft <= 153.65)) return <RunShots ft={ft} />;
  if (ft < 9.4 || ft > 42.8) return null;
  return <>
    <ContinueJourney ft={ft} />
    <TagWorkflow ft={ft} />
    <FourUp ft={ft} />
    <Flashes ft={ft} />
  </>;
};
