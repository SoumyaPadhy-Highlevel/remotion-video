import { Composition } from "remotion";
import { WorkflowMapsVideo } from "./video/WorkflowMapsVideo";
import { FPS, VIDEO_END } from "./video/script";
import { workflowMapsSchema } from "./video/musicProps";
import { StructureOpeningPreview } from "./video/StructureOpening";
import { MapBuildMock } from "./video/MapBuildMock";
import { EditorPieces, FootageAsEdited } from "./video/EditorPieces";

export const MyComposition = () => {
  return (
    <>
    <Composition
      id="WorkflowMaps"
      component={WorkflowMapsVideo}
      durationInFrames={Math.round(VIDEO_END * FPS)}
      schema={workflowMapsSchema}
      defaultProps={{
        music: {
          percussionVolume: 1,
          percussionFadeOutStart: 40.6,
          percussionFadeOutEnd: 44.6,
          originalStart: 32.94,
          originalVolume: 1,
          originalFadeInStart: 40.6,
          originalFadeInEnd: 44.6,
          endFade: 1.6,
        },
        text: {
          opening: {
            pill: "WORKFLOWS",
            headline: "Your account runs on *hundreds of workflows.*",
          },
          introCards: {
            startedSimple: "It started *simple.*",
            callingEachOther: "Then workflows started *calling each other.*",
            oneFormManyWorkflows: "And one form can start *many workflows.*",
            openEveryWorkflow: "The only way to know? *Open every workflow.*",
            whatIf: "What if we could change *all of this…*",
            reimagine: "…and reimagine how you *see your workflows?*",
          },
          titleDrop: {
            kicker: "INTRODUCING",
            title: "Workflow *Maps*",
          },
          featureCards: {
            selectWorkflow: {
              kicker: "PLAN IT",
              text: "Select a workflow. See what’s inside, *down to the exact trigger.*",
            },
            clickAsset: {
              kicker: "PLAN IT",
              text: "Click any asset. See *everywhere it’s used.*",
            },
            handOff: {
              kicker: "PLAN IT",
              text: "See how workflows *hand off to each other.*",
            },
            interconnected: {
              kicker: "PLAN IT",
              text: "All your interconnected workflows, *visualized.*",
            },
            findAnything: {
              kicker: "PLAN IT",
              text: "Find anything, *fast.*",
            },
            moveWorkflows: {
              kicker: "ORGANISE IT",
              text: "Move workflows and folders, *right on the map.*",
            },
            keepTidy: {
              kicker: "ORGANISE IT",
              text: "And keep it tidy, *right on the map.*",
            },
            pickContact: {
              kicker: "TROUBLESHOOT IT",
              text: "Pick any contact. See every workflow *they’ve been in.*",
            },
            everyRun: {
              kicker: "TROUBLESHOOT IT",
              text: "Every run, *newest first.*",
            },
            openRun: {
              kicker: "TROUBLESHOOT IT",
              text: "Open any run. See the exact path, *and the email Jordan got.*",
            },
            stepRunToRun: {
              kicker: "TROUBLESHOOT IT",
              text: "Step from *run to run.*",
            },
            needsAttention: {
              kicker: "WHEN IT BREAKS",
              text: "Spot what needs attention. *See exactly which runs failed.*",
            },
            failedStep: {
              kicker: "WHEN IT BREAKS",
              text: "Jump straight to the *failed step.*",
            },
            deletedAssets: {
              kicker: "WHEN IT BREAKS",
              text: "Catch deleted assets *still in use.*",
            },
            askYourMap: {
              kicker: "ASSISTANT",
              text: "Ask your map *anything.*",
            },
            answersOnMap: {
              kicker: "ASSISTANT",
              text: "It answers on the map, *down to what to fix first.*",
            },
          },
          panelShots: {
            searchLabel: "Search anything, fly straight to it",
            filterLabel: "Filter to what matters",
            colourLabel: "Colour-code folders",
            notesLabel: "Leave sticky notes",
            renameLabel: "Rename workflows",
            tidyOutro: "All of it, *right on the map.*",
          },
          titleCards: {
            makeItYours: {
              kicker: "ORGANISE IT",
              text: "Make it *yours*",
            },
            traceContact: {
              kicker: "TROUBLESHOOT IT",
              text: "Trace any *contact*",
            },
            fixErrors: {
              kicker: "TROUBLESHOOT IT",
              text: "Fix *errors* fast",
            },
            justAsk: {
              kicker: "ONE MORE THING",
              text: "Just *ask* your map",
            },
          },
          breaksHeadline: "And when something *breaks?*",
          mapBuild: {
            kicker: "HOW THE MAP WORKS",
            headline: "Your list,\n*drawn as a map.*",
            step1: "Folders become islands",
            step1List: "Workflows list · Home",
            step1Count: "7 folders",
            step2: "Workflows become blue nodes",
            step2List: "01 · Lead Capture",
            step2Count: "5 workflows",
            step3: "Assets become coloured nodes",
            step3List: "What Lead Capture’s workflows use",
            step3Count: "",
          },
          clientMessage: {
            from: "Client · Summit Shield",
            initials: "SS",
            text: "Why did Jordan get this email?",
          },
          lockup: {
            name: "Workflow",
            accent: "Maps",
            badge: "BETA",
            tagline: "See every connection.",
          },
          browserTabs: [
            "Continue Client Journey",
            "Tag workflow",
            "Tag New Enquiries",
            "Consultation Booking Goal",
            "contact tag - form 7",
            "Opportunity Status Routing",
            "Program Application Submitted",
            "Course Progress & Completion",
            "no filter tag",
            "Sales Stage Follow-up",
          ],
        },
        style: {
          ink: "#0B1B3A",
          accent: "#155EEF",
          gradientStart: "#155EEF",
          gradientMid: "#2E90FA",
          gradientEnd: "#22CCEE",
          pill: "#4A90F7",
          badge: "#7F56D9",
          headingFont: "Poppins" as const,
          bodyFont: "Inter" as const,
          sizes: {
            introCard: 92,
            introCardRaised: 64,
            titleDrop: 168,
            featureCard: 84,
            topLine: 42,
            panelCaption: 56,
            titleCard: 120,
            lockup: 132,
          },
        },
        show: {
          opening: true,
          introCards: true,
          titleDrop: true,
          featureCards: true,
          topLines: true,
          panelCaptions: true,
          titleCards: true,
          breaksHeadline: true,
          mapBuildPanel: true,
          flights: true,
          clientMessage: true,
          browserTabs: true,
          flashes: true,
          lockup: true,
          mascot: true,
          mascotSize: 1,
        },
      }}
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
    <Composition id="EditorPieces" component={EditorPieces} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ piece: "background" as const }} />
    <Composition id="FootageAsEdited" component={FootageAsEdited} durationInFrames={Math.round(VIDEO_END * FPS)} fps={FPS} width={1620} height={880} />
    <Composition id="MapBuild-Mock" component={MapBuildMock} durationInFrames={1} fps={30} width={1920} height={1080} />
    </>
  );
};
