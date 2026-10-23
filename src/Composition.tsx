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
            buriedInFolders: "As you grow, workflows end up\nBuried in *folders, inside folders.*",
            handsOffContact: "This step hands the contact to another workflow.\nWhat happens next lives *in another tab.*",
            flipBackAndForth: "Nothing connects the two.\nSo you *flip back and forth.*",
            oneFormFourWorkflows: "The same form\nStarts *four workflows,* in four folders.",
            fourWorkflowsBreak: "Delete the form, and nothing warns you.\n*Four workflows break.*",
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
    <Composition id="MapBuild-Mock" component={MapBuildMock} durationInFrames={1} fps={30} width={1920} height={1080} />
    </>
  );
};
