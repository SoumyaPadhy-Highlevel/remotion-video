import { Composition } from "remotion";
import { WorkflowMapsVideo } from "./video/WorkflowMapsVideo";
import { FPS, M } from "./video/script";

export const MyComposition = () => {
  return (
    <Composition
      id="WorkflowMaps"
      component={WorkflowMapsVideo}
      durationInFrames={Math.round(M.END * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
