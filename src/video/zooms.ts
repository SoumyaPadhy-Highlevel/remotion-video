// The push-ins (when each happens). How much and toward where is editable in Studio (config.tsx motion.pushIns).
/** Push-ins so panels read at 1080p: [start, end, scale, originX, originY] in window px. */
export const ZOOMS: [number, number, number, number, number][] = [
  [68.35, 76.2, 1.2, 1620, 0], // workflow drawer, then the asset drawer
  [76.7, 79.7, 1.2, 0, 0], // search panel
  [102.46, 105.46, 1.15, 0, 0], // cleanup panel
  [125.76, 131.7, 1.15, 1620, 0], // contact drawer: workflows, timeline (out before the panels close)
  [135.9, 140.3, 1.12, 1620, 220], // run: the Wait step's details
  [149.76, 151.76, 1.15, 0, 0], // "Need your attention" card
  [151.96, 154.86, 1.2, 1620, 0], // error executions in the drawer
  [163.3, 170.1, 1.12, 0, 300], // the Assistant's answer
]
