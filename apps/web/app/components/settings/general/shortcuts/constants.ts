import type { CommandShortcut } from "./types";

export const IGNORE_RECORDING_KEYS = ["Control", "Meta", "Alt", "Shift", "AltGraph"];

export const INITIAL_COMMANDS: CommandShortcut[] = [
  // Navigation Sequences
  {
    id: "go-to-settings",
    description: "Go to Settings",
    category: "Navigation",
    shortcuts: [["G", ">", "S"]],
  },
  {
    id: "go-to-day",
    description: "Go to Day View",
    category: "Navigation",
    shortcuts: [["G", ">", "D"]],
  },
  {
    id: "go-to-week",
    description: "Go to Week View",
    category: "Navigation",
    shortcuts: [["G", ">", "W"]],
  },
  {
    id: "go-to-month",
    description: "Go to Month View",
    category: "Navigation",
    shortcuts: [["G", ">", "M"]],
  },
  {
    id: "go-to-year",
    description: "Go to Year View",
    category: "Navigation",
    shortcuts: [["G", ">", "Y"]],
  },
  {
    id: "go-to-inbox",
    description: "Go to Inbox",
    category: "Navigation",
    shortcuts: [["G", ">", "I"]],
  },
  {
    id: "go-to-timeline",
    description: "Go to Timeline",
    category: "Navigation",
    shortcuts: [["G", ">", "T"]],
  },
  {
    id: "go-to-agenda",
    description: "Go to Agenda",
    category: "Navigation",
    shortcuts: [["G", ">", "A"]],
  },
  {
    id: "go-to-lists",
    description: "Go to Lists",
    category: "Navigation",
    shortcuts: [["G", ">", "L"]],
  },

  // General & System
  {
    id: "global-search",
    description: "Global Search & Command Palette",
    category: "General & System",
    shortcuts: [["Mod", "K"]],
  },
  {
    id: "toggle-fullscreen",
    description: "Toggle Fullscreen",
    category: "General & System",
    shortcuts: [["F"]],
  },
  {
    id: "toggle-sidebar",
    description: "Toggle Sidebar",
    category: "General & System",
    shortcuts: [["Mod", "B"]],
  },

  // Actions & Calendar
  {
    id: "create-action",
    description: "Create New Action",
    category: "Actions & Calendar",
    shortcuts: [["N"]],
  },
];
