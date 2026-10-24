/** Current film with steady framing. The four rebuilt Premiere titles remain
 * separate layers in the finishing timeline, so omit them from this picture. */
import React from "react";
import { Composition, registerRoot, useCurrentFrame } from "remotion";
import { MyComposition } from "../src/Composition";
import { DEFAULT_CFG } from "../src/video/config";
import { EDIT, editTime, FPS, TITLE_CARDS, uncut, VIDEO_END } from "../src/video/script";
import { WorkflowMapsVideo } from "../src/video/WorkflowMapsVideo";

type Props = React.ComponentProps<typeof WorkflowMapsVideo>;
const selected = EDIT.filter((s) => s.hold && ["Organise your map", "Pick any contact", "And it doesn’t just answer"].some((text) => s.card?.html.includes(text)));
const Picture: React.FC<Props> = (props) => {
  const tn = uncut(useCurrentFrame() / FPS), {t} = editTime(tn);
  const feature = selected.some((s) => tn >= s.n0 - 0.1 && tn < s.n1 + 0.5);
  const make = TITLE_CARDS[0];
  const chapter = t >= make.a - 0.1 && t < make.b + 0.5;
  const show = props.show ?? DEFAULT_CFG.show;
  return <WorkflowMapsVideo {...props} steadyMotion show={{...show,
    featureCards: show.featureCards && !feature, titleCards: show.titleCards && !chapter}} />;
};
const original = React.Children.toArray(MyComposition().props.children).find(
  (child) => React.isValidElement<{id: string}>(child) && child.props.id === "WorkflowMaps",
) as React.ReactElement<{defaultProps: Props}>;
const Root = () => <Composition id="PremiereSteadyPicture" component={Picture} fps={FPS} width={1920} height={1080}
  durationInFrames={Math.round(VIDEO_END * FPS)} defaultProps={original.props.defaultProps} />;
registerRoot(Root);
