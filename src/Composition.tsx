import { Composition } from "remotion";
import { WorkflowMapsVideo } from "./video/WorkflowMapsVideo";
import { FPS, VIDEO_END } from "./video/script";
import { StructureOpeningPreview } from "./video/StructureOpening";
import { MapBuildMock } from "./video/MapBuildMock";

export const MyComposition = () => {
  return (
    <>
    <Composition
      id="WorkflowMaps"
      component={WorkflowMapsVideo}
      durationInFrames={Math.round(VIDEO_END * FPS)}
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
    <Composition id="MapBuild-Mock" component={MapBuildMock} durationInFrames={1} fps={30} width={1920} height={1080} />
    </>
  );
};
