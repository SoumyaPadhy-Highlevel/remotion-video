// Workflow Maps' right drawer (automation-workflows-frontend master, workflow-grid/components/grid-right-sidebar and
// workflow-grid/components/ui), drawn the way the product draws it: the workflow's panel (WorkflowDetailPanel: header,
// Enrollments, "Assets in this workflow" with its search, type select and sections, asset rows that expand to the steps
// using them) and an asset's panel (AssetDetailPanel: summary cards, "Workflows using this asset", Published / Draft tabs,
// workflow rows). Every value is the resolved Highrise / Tailwind token (classes and file:line in the comments).
import React from "react";
import { BIcon } from "./Nodes";
import { FONT, HR } from "./tokens";

/** Type colours and glyphs (workflow-grid/utils/get-grid-asset-style.ts; constants/tailwind-colors.ts). */
export const GRID_TYPES = {
  workflow: { color: "#2455d6", icon: "mdi:sitemap" },
  forms: { color: "#14b8a6", icon: "mdi:form-select" },
  tags: { color: "#a855f7", icon: "heroicons-solid:tag" },
} as const;
export type GridType = keyof typeof GRID_TYPES;
/** Step glyphs (ui/GridAssetGlyph.vue): trigger mingcute:lightning-fill amber-500, action mingcute:play-fill green-500. */
const GLYPH = { trigger: { icon: "mingcute:lightning-fill", color: "#f59e0b" }, action: { icon: "mingcute:play-fill", color: "#22c55e" }, workflow: { icon: "mdi:sitemap", color: "#2455d6" } };
/** Folder colours on the map (the folder icon is tinted for painted folders: resolveGridPlaneColorShades(color).edge). */
export const FOLDER_TINT: Record<string, string> = { "01": "#3b82f6", "08": "#f43f5e" };

const T = { fontFamily: FONT, WebkitFontSmoothing: "antialiased" as const };
const SHADOW_XS = "0 1px 2px #1018280D";

/** GridAssetIcon: a `size` tile, 6 px radius, the type colour with a white glyph at half the size. */
export const Tile: React.FC<{ type: GridType; size: number }> = ({ type, size }) => (
  <div style={{ width: size, height: size, flex: "none", borderRadius: 6, background: GRID_TYPES[type].color, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <BIcon name={GRID_TYPES[type].icon} size={size / 2} color="#fff" />
  </div>
);

/** GridRightSidebarHeader: p-4, border-b gray-100; 44 px tile, the type row (folder line or type title) over the name;
 *  sparkle (Stars02, purple-700) then close (XClose, gray-700), 16 px apart. `below` is the bottomAction slot. */
export const DrawerHeader: React.FC<{ type: GridType; typeRow: React.ReactNode; name: string; below?: React.ReactNode }> = ({ type, typeRow, name, below }) => (
  <div style={{ padding: 16, borderBottom: `1px solid ${HR.gray[100]}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Tile type={type} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: "20px", color: type === "workflow" ? HR.gray[600] : HR.gray[500], display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>{typeRow}</div>
        <div style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600, color: HR.gray[900], whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, alignSelf: "flex-start", paddingTop: 2 }}>
        <BIcon name="ghl:Stars02" size={20} color={HR.purple[700]} />
        <BIcon name="ghl:XClose" size={20} color={HR.gray[700]} />
      </div>
    </div>
    {below}
  </div>
);

/** The folder line (WorkflowDetailPanel typeTitle slot): gray-600, 8 px gap, FolderIcon 16 px (tinted for painted folders). */
export const FolderLine: React.FC<{ folder: string; size?: number; gap?: number }> = ({ folder, size = 16, gap = 8 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap, minWidth: 0 }}>
    <BIcon name="ghl:Folder" size={size} color={FOLDER_TINT[folder.slice(0, 2)] ?? "currentColor"} />
    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{folder}</span>
  </span>
);

/** WorkflowStatusTag (HLTag lg, not bordered): 28 px, 0 8px, 4 px radius, 13/18 500. */
export const StatusTag: React.FC<{ draft?: boolean }> = ({ draft }) => (
  <span style={{ height: 28, padding: "0 8px", borderRadius: 4, display: "inline-flex", alignItems: "center", fontSize: 13, lineHeight: "18px", fontWeight: 500,
    background: draft ? HR.gray[100] : "#ecfdf3", color: draft ? HR.gray[600] : "#027a48" }}>{draft ? "Draft" : "Published"}</span>
);

/** GridDetailSummaryCard (HLButton secondary, h-auto p-3): label, a 32 px gray-50 circle with a 20 px glyph, the count
 *  20/28 600; `on` is the selected view (blue: #84adff border, #eff4ff, #004eeb); `chevron` the iconRight. */
const SummaryCard: React.FC<{ label: string; icon: string; color: string; count: number; on?: boolean; chevron?: boolean }> = ({ label, icon, color, count, on, chevron }) => (
  <div style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: 12, borderRadius: 8, border: `1px solid ${on ? "#84adff" : HR.gray[300]}`, background: on ? HR.primary[50] : "#fff",
    boxShadow: SHADOW_XS, color: on ? HR.primary[700] : HR.gray[600], display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 8, alignItems: "center" }}>
      <div style={{ gridColumn: "1 / 3", marginBottom: 4, fontSize: 12, lineHeight: "16px", fontWeight: 400 }}>{label}</div>
      <span style={{ width: 32, height: 32, borderRadius: 16, background: HR.gray[50], display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name={icon} size={20} color={color} /></span>
      <div style={{ fontSize: 20, lineHeight: "28px", fontWeight: 600 }}>{count}</div>
    </div>
    {chevron ? <BIcon name="ghl:ChevronRight" size={16} color={HR.gray[400]} /> : null}
  </div>
);

/** HLInput sm: 36 px, 6 px radius, gray-300 border (primary-600 when focused, with a 4 px primary-100 ring), SearchMd prefix. */
const SearchInput: React.FC<{ placeholder: string; value?: string; focus?: boolean; caret?: boolean }> = ({ placeholder, value, focus, caret }) => (
  <div style={{ height: 36, boxSizing: "border-box", borderRadius: 6, border: `1px solid ${focus ? HR.primary[600] : HR.gray[300]}`, boxShadow: focus ? `0 0 0 4px ${HR.primary[100]}` : undefined,
    display: "flex", alignItems: "center", gap: 8, padding: "0 8px", fontSize: 14, background: "#fff" }}>
    <BIcon name="ghl:SearchMd" size={16} color={HR.gray[400]} />
    <span style={{ color: value ? HR.gray[900] : HR.gray[500], whiteSpace: "nowrap" }}>{value || placeholder}</span>
    {caret ? <span style={{ width: 1, height: 18, background: HR.gray[900], marginLeft: -7 }} /> : null}
  </div>
);

/** HLSelect sm: 36 px, 6 px radius, gray-300 border, 8px 36px 8px 12px, 14/20, 16 px gray-500 arrow. */
const Select: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <div style={{ height: 36, boxSizing: "border-box", borderRadius: 6, border: `1px solid ${HR.gray[300]}`, boxShadow: "0 1px 2px rgba(16,24,40,.05)", position: "relative",
    display: "flex", alignItems: "center", padding: "0 36px 0 12px", fontSize: 14, color: HR.gray[500] }}>
    {placeholder}<BIcon name="lucide:chevron-down" size={16} color={HR.gray[500]} style={{ position: "absolute", right: 12, top: 9 }} />
  </div>
);

/** GridDetailListToolbar: sticky, border-b gray-100, px-4 pt-4 pb-3; heading 14/20 600, subtitle 12/20 gray-500 (mt-1). */
const Toolbar: React.FC<{ heading: string; sub: string; children?: React.ReactNode }> = ({ heading, sub, children }) => (
  <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${HR.gray[100]}`, background: "#fff" }}>
    <div style={{ fontSize: 14, lineHeight: "20px", fontWeight: 600, color: HR.gray[900] }}>{heading}</div>
    <div style={{ marginTop: 4, fontSize: 12, lineHeight: "20px", color: HR.gray[500] }}>{sub}</div>
    {children}
  </div>
);

/** A step (ui/GridStepListItem.vue): 32 px, the 16 px glyph, the name 14/20 500; hover gray-50 shows "View step"
 *  (HLButton blue tertiary 3xs: 24 px, #eff4ff, #004eeb 11/16 600, 4 px radius; hovered #d1e0ff / #0040c1), 150 ms. */
export const StepRow: React.FC<{ kind: "trigger" | "action"; name: string; hover?: number; btnHover?: boolean }> = ({ kind, name, hover = 0, btnHover }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: 8, background: hover > 0.5 ? HR.gray[50] : "transparent", borderRadius: 4 }}>
    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, padding: "6px 4px 6px 8px", fontSize: 14, lineHeight: "20px", fontWeight: 500, color: HR.gray[900] }}>
      <BIcon name={GLYPH[kind].icon} size={16} color={GLYPH[kind].color} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
    </div>
    <span style={{ height: 24, boxSizing: "border-box", padding: "0 6px", borderRadius: 4, display: "flex", alignItems: "center", fontSize: 11, lineHeight: "16px", fontWeight: 600, whiteSpace: "nowrap",
      background: btnHover ? HR.primary[100] : HR.primary[50], border: `1px solid ${btnHover ? HR.primary[200] : HR.primary[50]}`, color: btnHover ? "#0040c1" : HR.primary[700], boxShadow: SHADOW_XS, opacity: hover }}>View step</span>
  </div>
);

/** GridExpandableListItem's open block: ml-6 mr-2 mb-2, a 1 px gray-200 guide line, py-2 pl-3; the hint
 *  (ui/GridUsageStepList.vue: 12/16 500 gray-500, px-2 mb-2), then the steps. `k` 0–1 is its height/opacity (0.2 s). */
export const StepsBlock: React.FC<{ k: number; steps: { kind: "trigger" | "action"; name: string }[]; hover?: number; btnHover?: boolean }> = ({ k, steps, hover = 0, btnHover }) => {
  const h = 8 + 16 + 8 + steps.length * 32 + 8 + 8;   // py-2, hint + mb-2, rows, py-2, mb-2
  return (
    <div style={{ height: h * k, opacity: k, overflow: "hidden" }}>
      <div style={{ margin: "0 8px 8px 24px", borderLeft: `1px solid ${HR.gray[200]}`, padding: "8px 0 8px 12px" }}>
        <p style={{ margin: "0 0 8px", padding: "0 8px", fontSize: 12, lineHeight: "16px", fontWeight: 500, color: HR.gray[500] }}>Select an action or trigger to preview it in the workflow.</p>
        {steps.map((s, i) => <StepRow key={i} kind={s.kind} name={s.name} hover={i === 0 ? hover : 0} btnHover={i === 0 && btnHover} />)}
      </div>
    </div>
  );
};

/** ui/GridListItem.vue: px-2, 2 px left border, py-2, mb-1, 12 px gap; 36 px leading slot; title 14/20 500 gray-900, meta 12/16
 *  gray-500 (mt-1, 6 px gaps); hover / expanded gray-50; the chevron (lucide 16 px gray-500 in a 36 px box) turns 180°. */
export const ListRow: React.FC<{ lead: React.ReactNode; title: React.ReactNode; meta: React.ReactNode; open?: number; hover?: boolean }> = ({ lead, title, meta, open = 0, hover }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, padding: "8px 8px", borderLeft: "2px solid transparent", background: open > 0.5 || hover ? HR.gray[50] : "#fff" }}>
      {lead}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: "20px", fontWeight: 500, color: HR.gray[900], whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: "16px", color: HR.gray[500], whiteSpace: "nowrap" }}>{meta}</div>
      </div>
      <span style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <BIcon name="lucide:chevron-down" size={16} color={HR.gray[500]} style={{ transform: `rotate(${(180 * open).toFixed(1)}deg)` }} />
      </span>
    </div>
  </div>
);

/** ui/GridListSection.vue: px-2 py-3, 1 px gray-100 divider between sections; the title (12/16 600, 0.3 px, uppercase,
 *  gray-600, py-1) and a gray HLTag sm count (22 px, 0 6px, 4 px radius, gray-100, 12/17 500 gray-600) in a 36 px box. */
const Section: React.FC<{ title: string; count: number; last?: boolean; children: React.ReactNode }> = ({ title, count, last, children }) => (
  <div style={{ padding: "12px 8px", borderBottom: last ? undefined : `1px solid ${HR.gray[100]}` }}>
    <div style={{ marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
      <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase", color: HR.gray[600], padding: "4px 0" }}>{title}</span>
      <span style={{ width: 36, display: "flex", justifyContent: "center" }}>
        <span style={{ height: 22, padding: "0 6px", borderRadius: 4, background: HR.gray[100], color: HR.gray[600], fontSize: 12, lineHeight: "17px", fontWeight: 500, display: "flex", alignItems: "center" }}>{count}</span>
      </span>
    </div>
    {children}
  </div>
);

/** The drawer card (NodeDetailDrawer: rounded-lg bg-white shadow-lg, 450 px), entering with slide-right (opacity, 20 px, 0.2 s). */
export const DrawerCard: React.FC<{ k: number; children: React.ReactNode }> = ({ k, children }) => (
  <div style={{ ...T, position: "absolute", left: 1158, top: 76, width: 450, height: 792, borderRadius: 8, background: "#fff", overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05)", opacity: k, transform: `translateX(${(20 * (1 - k)).toFixed(1)}px)`, visibility: k > 0.001 ? "visible" : "hidden" }}>
    {children}
  </div>
);

export type AssetEntry = { type: GridType; name: string; steps: { kind: "trigger" | "action"; name: string }[] };

/** WorkflowDetailPanel: header (status, updated, Preview workflow + ⋯), Enrollments, the asset toolbar and sections.
 *  `query` filters like use-workflow-detail-search.ts (substring on category, name or step) and expands every match. */
export const WorkflowDrawer: React.FC<{ name: string; folder: string; updated: string; enrolled: [number, number]; assets: AssetEntry[];
  query: string; focus?: boolean; caret?: boolean; stepHover?: number; btnHover?: boolean }> = ({ name, folder, updated, enrolled, assets, query, focus, caret, stepHover = 0, btnHover }) => {
  const q = query.trim().toLowerCase(), label = (t: GridType) => (t === "forms" ? "Forms" : "Tags");
  const shown = assets.filter((a) => !q || label(a.type).toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.steps.some((s) => s.name.toLowerCase().includes(q)));
  const cats = (["forms", "tags"] as GridType[]).filter((c) => shown.some((a) => a.type === c));
  const count = (a: AssetEntry) => {
    const tr = a.steps.filter((s) => s.kind === "trigger").length, ac = a.steps.length - tr;
    return [tr ? `${tr} trigger${tr > 1 ? "s" : ""}` : "", ac ? `${ac} action${ac > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ");
  };
  return (
    <>
      <DrawerHeader type="workflow" typeRow={<FolderLine folder={folder} />} name={name} below={<>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <StatusTag /><span style={{ fontSize: 12, lineHeight: "16px", color: HR.gray[500] }}>Updated {updated}</span>
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 40, boxSizing: "border-box", borderRadius: 8, background: HR.primary[600], border: `1px solid ${HR.primary[600]}`, boxShadow: SHADOW_XS,
            color: "#fff", fontSize: 14, lineHeight: "20px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>Preview workflow</div>
          <div style={{ width: 40, height: 40, boxSizing: "border-box", borderRadius: 8, border: `1px solid ${HR.gray[300]}`, boxShadow: SHADOW_XS, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BIcon name="ghl:DotsHorizontal" size={20} color={HR.gray[600]} />
          </div>
        </div>
      </>} />
      <div style={{ padding: 16, borderBottom: `1px solid ${HR.gray[100]}` }}>
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 14, lineHeight: "20px", fontWeight: 600, color: HR.gray[900] }}>Enrollments</span>
          <span style={{ fontSize: 12, lineHeight: "16px", color: HR.gray[500] }}>Select a count to view history</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <SummaryCard label="Total Enrolled" icon="heroicons-solid:users" color={HR.primary[600]} count={enrolled[0]} chevron />
          <SummaryCard label="Currently Enrolled" icon="heroicons-solid:user" color="#039855" count={enrolled[1]} chevron />
        </div>
      </div>
      <Toolbar heading={`Assets in this workflow (${assets.length})`} sub="Expand an asset to see the actions and triggers that use it.">
        <div style={{ marginTop: 12 }}><SearchInput placeholder="Search assets, actions, or triggers" value={query} focus={focus} caret={caret} /></div>
        <div style={{ marginTop: 8 }}><Select placeholder="All asset types" /></div>
        {q ? <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 12, lineHeight: "16px", color: HR.gray[500] }}>{shown.length} of {assets.length} assets match</span>
          <span style={{ fontSize: 13, lineHeight: "18px", fontWeight: 600, color: HR.primary[700] }}>Reset filters</span>
        </div> : null}
      </Toolbar>
      <div style={{ paddingBottom: 16 }}>
        {cats.map((c, ci) => {
          const rows = shown.filter((a) => a.type === c).sort((a, b) => a.name.localeCompare(b.name));
          return <Section key={c} title={label(c)} count={rows.length} last={ci === cats.length - 1}>
            {rows.map((a) => <React.Fragment key={a.name}>
              <ListRow lead={<Tile type={a.type} size={36} />} title={a.name} meta={count(a)} open={q ? 1 : 0} />
              {q ? <StepsBlock k={1} steps={a.steps} hover={stepHover} btnHover={btnHover} /> : null}
            </React.Fragment>)}
          </Section>;
        })}
      </div>
    </>
  );
};

export type UsingWorkflow = { name: string; folder: string; draft?: boolean; steps: { kind: "trigger" | "action"; name: string }[] };

/** AssetDetailPanel: the asset's header with "Show usage on map" (when it is in more than one folder) and its helper, the
 *  three summary cards (Workflows selected), "Workflows using this asset (N)", search, the Published / Draft tabs (HLTabs line
 *  md: 32 px tabs, 6px 8px, 14/20 500 gray-600; active 600 #004eeb with a 1 px underline; gray-200 nav border) and the rows. */
export const AssetDrawer: React.FC<{ type: GridType; name: string; workflows: UsingWorkflow[]; triggers: number; actions: number; usage?: boolean;
  tab: "published" | "draft"; open?: string; openK?: number; rowHover?: string; tabHover?: string; stepHover?: number }> = ({ type, name, workflows, triggers, actions, usage, tab, open, openK = 0, rowHover, tabHover, stepHover = 0 }) => {
  const pub = workflows.filter((w) => !w.draft), dr = workflows.filter((w) => w.draft), list = tab === "draft" ? dr : pub;
  const usageCount = (w: UsingWorkflow) => {
    const tr = w.steps.filter((s) => s.kind === "trigger").length, ac = w.steps.length - tr;
    return [tr ? `${tr} trigger${tr > 1 ? "s" : ""}` : "", ac ? `${ac} action${ac > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ");
  };
  const Tab: React.FC<{ id: "published" | "draft"; label: string }> = ({ id, label }) => {
    const on = tab === id;
    return <span style={{ height: 32, boxSizing: "border-box", padding: "6px 8px", borderRadius: 4, fontSize: 14, lineHeight: "20px", fontWeight: on ? 600 : 500,
      color: on ? HR.primary[700] : tabHover === id ? HR.gray[800] : HR.gray[600], background: tabHover === id && !on ? HR.primary[50] : "transparent",
      boxShadow: on ? `inset 0 -1px 0 ${HR.primary[700]}` : undefined }}>{label}</span>;
  };
  return (
    <>
      <DrawerHeader type={type} typeRow={type === "forms" ? "Forms" : "Tags"} name={name} below={usage ? <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 40, boxSizing: "border-box", borderRadius: 8, background: HR.primary[600], border: `1px solid ${HR.primary[600]}`, boxShadow: SHADOW_XS, color: "#fff",
          fontSize: 14, lineHeight: "20px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>Show usage on map</div>
        <div style={{ fontSize: 12, lineHeight: "20px", color: HR.gray[500] }}>Highlight the connections between folders that share this asset.</div>
      </div> : undefined} />
      <div style={{ padding: 16, borderBottom: `1px solid ${HR.gray[100]}`, display: "flex", gap: 8 }}>
        <SummaryCard label="Workflows" icon="mdi:sitemap" color="#2455d6" count={workflows.length} on />
        <SummaryCard label="Triggers" icon="mingcute:lightning-fill" color="#f59e0b" count={triggers} />
        <SummaryCard label="Actions" icon="mingcute:play-fill" color="#22c55e" count={actions} />
      </div>
      <Toolbar heading={`Workflows using this asset (${workflows.length})`} sub="Expand a workflow to see the actions and triggers that use this asset.">
        <div style={{ marginTop: 12 }}><SearchInput placeholder="Search workflows or folders" /></div>
        <div style={{ marginTop: 8, display: "flex", gap: 6, borderBottom: `1px solid ${HR.gray[200]}` }}>
          <Tab id="published" label={`Published · ${pub.length}`} /><Tab id="draft" label={`Draft · ${dr.length}`} />
        </div>
      </Toolbar>
      <div style={{ padding: "0 8px 16px" }}>
        {list.map((w) => {
          const k = open === w.name ? openK : 0;
          return <React.Fragment key={w.name}>
            <ListRow lead={<Tile type="workflow" size={36} />} title={w.name} open={k} hover={rowHover === w.name}
              meta={<><span>{usageCount(w)}</span><span style={{ width: 2, height: 2, borderRadius: 1, background: HR.gray[400] }} /><FolderLine folder={w.folder} size={14} gap={4} /></>} />
            {k > 0 ? <StepsBlock k={k} steps={w.steps} hover={stepHover} /> : null}
          </React.Fragment>;
        })}
      </div>
    </>
  );
};
