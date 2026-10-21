import { Composition } from "remotion";
import { WorkflowMapsVideo } from "./video/WorkflowMapsVideo";
import { EDIT_END, FPS } from "./video/script";
import { StructureOpeningPreview } from "./video/StructureOpening";

export const MyComposition = () => {
  return (
    <>
    <Composition
      id="WorkflowMaps"
      component={WorkflowMapsVideo}
      durationInFrames={Math.round(EDIT_END * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="WorkflowMaps-Opening"
      component={StructureOpeningPreview}
      durationInFrames={931}
      fps={30}
      width={1920}
      height={1080}
    />
    </>
  );
};
