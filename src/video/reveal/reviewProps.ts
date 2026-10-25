import {z} from "zod";
import {MAP_REVEAL as R} from "./script";
import {motionSchema} from "../config";
const frame = (label: string) => z.number().int().min(0).max(1800).describe(label);
export const revealSchema = z.object({
  preview: z.boolean().describe("Preview title, mascot and music"),
  layer: z.enum(["review", "map", "titles", "mascot"]).describe("Review everything, or isolate a layer for Premiere handoff"),
  timing: z.object({
    questionEndFrame: frame("What-if text ends — local frame").optional(),
    imagineStartFrame: z.number().min(0).max(1800).step(.5).describe("Bird's-eye-view text begins — local frame").optional(),
    foldersFrame: frame("Folders begin — local frame"),
    workflowsFrame: frame("Workflows begin — local frame"),
    assetsFrame: frame("Asset categories begin — local frame"),
    categoryFrames: z.number().int().min(6).max(120).describe("Frames per asset type — equal for all 11"),
    titleFrame: frame("Original title and mascot start — 684 = song drop at 48s"),
    titleHoldFrames: z.number().int().min(30).max(300).describe("Title frames before exit starts — exit always plays in full"),
  }),
  copy: z.object({
    question: z.string().describe("What-if line"),
    imagine: z.string().describe("Bird's-eye-view line"),
    folders: z.string().describe("Folder line"),
    workflows: z.string().describe("Workflow line"),
    assets: z.string().describe("Asset line"),
  }).optional(),
  title: z.object({
    text: z.string().describe("Title — *Maps* uses the existing blue gradient"),
    kicker: z.string().describe("Small line above title"),
    size: z.number().min(40).max(240).describe("Title font size"),
    motion: motionSchema.shape.titles,
  }),
  mascot: z.object({
    visible: z.boolean().describe("Show the original mascot choreography"),
    scale: z.number().min(.5).max(1.5).step(.05).describe("Mascot size multiplier"),
    offsetX: z.number().min(-300).max(300).describe("Mascot horizontal offset (px)"),
    offsetY: z.number().min(-300).max(300).describe("Mascot vertical offset (px)"),
  }),
});
export type RevealProps = z.infer<typeof revealSchema>;
export type RevealTiming = RevealProps["timing"];
export const DEFAULT_TIMING: RevealTiming = {questionEndFrame: 111, imagineStartFrame: 115.5, foldersFrame: 220, workflowsFrame: 335, assetsFrame: 451, categoryFrames: 10, titleFrame: 684, titleHoldFrames: 104};
export const settleFrame = (timing: RevealTiming) => timing.assetsFrame + timing.categoryFrames * R.categories.length + 9;
export const titleHold = (timing: RevealTiming, letterDuration = .45) => Math.max(timing.titleHoldFrames, Math.ceil((.63 + letterDuration * 1.6) * 30));
// KineticTitle owns its normal entrance and 0.6s exit envelope. Never compress
// or truncate those animations to satisfy a previous composition end frame.
export const reviewDuration = (timing: RevealTiming, letterDuration = .45) => Math.max(800, timing.titleFrame + titleHold(timing, letterDuration) + 20, settleFrame(timing) + 20);
