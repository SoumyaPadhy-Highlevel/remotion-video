import { Composition } from "remotion";
import { WorkflowMapsVideo } from "./video/WorkflowMapsVideo";
import { FPS, VIDEO_END } from "./video/script";
import { workflowMapsSchema } from "./video/musicProps";
import { StructureOpeningPreview } from "./video/StructureOpening";
import { MapBuildMock } from "./video/MapBuildMock";
import { EditorPieces, FootageAsEdited } from "./video/EditorPieces";
import { BuilderShots } from "./video/builder/BuilderShots";
import { AssistantStills } from "./video/assistant/AssistantStills";
import { AssistantSection, SECTION_LEN } from "./video/assistant/AssistantSection";

export const MyComposition = () => {
  return (
    <>
    <Composition
      id="WorkflowMaps"
      component={WorkflowMapsVideo}
      durationInFrames={Math.round(VIDEO_END * FPS)}
      schema={workflowMapsSchema}
      defaultProps={{
        steadyMotion: true,
        music: {
          volume: 1,
          offset: 0,
          loopToDrop: true,
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
          introCallouts: {
            buriedInFolders: "As you grow, workflows end up\nBuried in *folders.*",
            handsOffContact: "This step sends the contact to another workflow.\nWhat happens next is *in another tab.*",
            everyHandOffTab: "Every hand-off opens\n*another tab.*",
            whichTab: "Five tabs for one contact.\n*Which one was it?*",
            oneFormFourWorkflows: "The same form\nStarts *four workflows,* in four folders.",
            fourWorkflowsBreak: "Delete one form, and four workflows break.\n*And the impact stays invisible.*",
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
            rememberHandOff: {
              kicker: "PLAN IT",
              text: "Remember having to jump across workflows *to view connections?*",
            },
            linkedQuestion: {
              kicker: "PLAN IT",
              text: "This is an *Add to Workflow* action.\nWhat happens to the contact *next?*",
            },
            whatIfOneView: {
              kicker: "PLAN IT",
              text: "What if you could see *all of it in one interface?*",
            },
            linkedCanvas: {
              kicker: "PLAN IT",
              text: "All your linked workflows. *One canvas.*",
            },
            traceJourney: {
              kicker: "PLAN IT",
              text: "Follow one contact *across every workflow.*",
            },
            organiseAndDocument: {
              kicker: "ORGANISE IT",
              text: "Organise and document your workflows, *right on the map.*",
            },
            makeItYourOwn: {
              kicker: "ORGANISE IT",
              text: "Make the map *your own.*",
            },
            writeItOnce: {
              kicker: "ORGANISE IT",
              text: "Notes your whole team reads, *right on the map.*",
            },
            customerJourney: {
              kicker: "ORGANISE IT",
              text: "Notes that tell *the customer journey.*",
            },
            pickContact: {
              kicker: "TROUBLESHOOT IT",
              text: "Pick any contact. See every workflow *they’ve been in.*",
            },
            activeAndFinished: {
              kicker: "TROUBLESHOOT IT",
              text: "See all their *active and finished workflows.*",
            },
            onTheTimeline: {
              kicker: "TROUBLESHOOT IT",
              text: "Or follow every run *on the timeline.*",
            },
            needsAttention: {
              kicker: "WHEN IT BREAKS",
              text: "Catch it quickly, *right on the map.*",
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
            doesTheWork: {
              kicker: "ASSISTANT",
              text: "And it doesn’t just answer. *It does the work.*",
            },
            actsOnMap: {
              kicker: "ASSISTANT",
              text: "Ask it to find, create and move, *right on the map.*",
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
            traceContact: {
              kicker: "TROUBLESHOOT IT",
              text: "Trace any *contact*",
            },
            justAsk: {
              kicker: "ONE MORE THING",
              text: "Just *ask* your map",
            },
          },
          breaksHeadline: "What if something *breaks*\nacross {20|50|100} workflows?",
          mapBuild: {
            kicker: "HOW THE MAP WORKS",
            headline: "Your same workflows,\n*now drawn as a map.*",
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
            text: "Why hasn’t Taylor moved on yet?",
          },
          lockup: {
            name: "Workflow",
            accent: "Maps",
            badge: "BETA",
            tagline: "See every connection.",
          },
          browserTabs: [
            "Lead Management | Priority Assignment",
            "Lead Management | High Priority Nurture",
            "Lead Management | Medium Priority Nurture",
            "Lead Management | Low Priority Nurture",
            "Lead Management | Consultation Handoff",
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
          introCallouts: true,
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
        motion: {
          window: {
            riseDistance: 160,
            riseStartScale: 0.94,
            introPush: 0.025,
            firstDropPunch: 0.03,
            dropPunch: 0.04,
            dropPunchTime: 0.45,
            hitPunch: 0.02,
            endShrink: 0.15,
            endBlur: 10,
          },
          recedeIntro: {
            shrink: 0.12,
            dim: 0.45,
            blur: 7,
          },
          recedeCards: {
            shrink: 0.1,
            dim: 0.5,
            blur: 7,
          },
          shake: {
            x: 9,
            y: 5,
            duration: 0.22,
          },
          pushIns: {
            drawers: {
              on: true,
              scale: 1.2,
              focusX: 1620,
              focusY: 0,
            },
            search: {
              on: true,
              scale: 1.2,
              focusX: 0,
              focusY: 0,
            },
            cleanup: {
              on: true,
              scale: 1.15,
              focusX: 0,
              focusY: 0,
            },
            contactDrawer: {
              on: true,
              scale: 1.15,
              focusX: 1620,
              focusY: 0,
            },
            runDetails: {
              on: true,
              scale: 1.12,
              focusX: 1620,
              focusY: 220,
            },
            needsAttention: {
              on: true,
              scale: 1.15,
              focusX: 0,
              focusY: 0,
            },
            errorExecutions: {
              on: true,
              scale: 1.2,
              focusX: 1620,
              focusY: 0,
            },
            assistant: {
              on: true,
              scale: 1.12,
              focusX: 0,
              focusY: 300,
            },
          },
          pushInEase: {
            in: 0.6,
            out: 0.5,
          },
          introCallouts: {
            push: 1.08,
            in: 0.8,
            out: 0.5,
          },
          titles: {
            rise: 0.85,
            tilt: 7,
            blur: 8,
            letterDelay: 0.032,
            duration: 0.45,
            exitLift: 0.45,
            pulse: 0.045,
            topLineSlide: 24,
          },
          flights: {
            duration: 0.55,
            arcHeight: 70,
            shrink: 0.45,
          },
          mascotBob: 8,
        },
        fx: {
          flash: {
            strength: 0.75,
            duration: 0.45,
          },
          background: {
            skyTop: "#F8FBFF",
            skyUpper: "#EEF4FF",
            skyLower: "#DDEBFF",
            skyBottom: "#C9DFFF",
            dots: true,
            floor: true,
            floorCentre: "#FFFFFF",
            floorInner: "#E3EFFF",
            floorMid: "#B9D5FF",
            floorEdge: "#9CC3FF",
          },
          windowRadius: 18,
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
    <Composition id="AssistantSection" component={AssistantSection} durationInFrames={Math.round(SECTION_LEN * FPS)} fps={FPS} width={1620} height={880} />
    <Composition id="AssistantStills" component={AssistantStills} durationInFrames={1} fps={FPS} width={1620} height={880} defaultProps={{ still: "A1" }} />
    <Composition id="BuilderShots" component={BuilderShots} durationInFrames={Math.round(236 * FPS)} fps={FPS} width={1620} height={880} defaultProps={{ overlay: true }} />
    <Composition id="MapBuild-Mock" component={MapBuildMock} durationInFrames={1} fps={30} width={1920} height={1080} />
    </>
  );
};
