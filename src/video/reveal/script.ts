import {MAP_ASSET_TYPES} from "../builder/mapTokens";
/** Review timing uses LOCAL frames in MapRevealTease (30fps, starts at 25.2s). */
export const MAP_REVEAL = {
  start: 25.2,
  question: "What if we could change\n*all of this?*",
  imagine: "Where you could get a\n*bird's-eye view.*",
  folders: "Where your folders become *islands.*",
  workflows: "Where your workflows become *bright blue nodes.*",
  assets: "Where every asset becomes a *connected node.*",
  categories: [
    {key: "tags", label: "Tags", color: MAP_ASSET_TYPES.tags.color, icon: MAP_ASSET_TYPES.tags.icon},
    {key: "forms", label: "Forms", color: MAP_ASSET_TYPES.forms.color, icon: MAP_ASSET_TYPES.forms.icon},
    {key: "fields", label: "Custom fields", color: MAP_ASSET_TYPES.contactCustomFields.color, icon: MAP_ASSET_TYPES.contactCustomFields.icon},
    {key: "users", label: "Users", color: MAP_ASSET_TYPES.users.color, icon: MAP_ASSET_TYPES.users.icon},
    {key: "calendars", label: "Calendars", color: MAP_ASSET_TYPES.calendars.color, icon: MAP_ASSET_TYPES.calendars.icon},
    {key: "pipelines", label: "Pipelines", color: MAP_ASSET_TYPES.pipelines.color, icon: MAP_ASSET_TYPES.pipelines.icon},
    {key: "funnels", label: "Funnels", color: MAP_ASSET_TYPES.funnels.color, icon: MAP_ASSET_TYPES.funnels.icon},
    {key: "funnelPages", label: "Funnel pages", color: MAP_ASSET_TYPES.funnelPages.color, icon: MAP_ASSET_TYPES.funnelPages.icon},
    {key: "funnelProducts", label: "Funnel products", color: MAP_ASSET_TYPES.funnelProducts.color, icon: MAP_ASSET_TYPES.funnelProducts.icon},
    {key: "globalProducts", label: "Products", color: MAP_ASSET_TYPES.globalProducts.color, icon: MAP_ASSET_TYPES.globalProducts.icon},
    {key: "videos", label: "Videos", color: MAP_ASSET_TYPES.videos.color, icon: MAP_ASSET_TYPES.videos.icon},
  ],
} as const;
