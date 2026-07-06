export type ViewMode = "day" | "week" | "month" | "year" | "agenda" | "inbox" | "kanban" | "lists";

export interface ViewModeConfig {
  id: ViewMode;
  label: string;
  icon?: string;
  group: "chronological" | "structural";
}

export const VIEW_MODES: Record<ViewMode, ViewModeConfig> = {
  day: { id: "day", label: "Day", group: "chronological" },
  week: { id: "week", label: "Week", group: "chronological" },
  month: { id: "month", label: "Month", group: "chronological" },
  year: { id: "year", label: "Year", group: "chronological" },
  agenda: { id: "agenda", label: "Agenda", group: "chronological" },
  inbox: { id: "inbox", label: "Inbox", group: "structural" },
  kanban: { id: "kanban", label: "Kanban", group: "structural" },
  lists: { id: "lists", label: "Lists", group: "structural" },
};
