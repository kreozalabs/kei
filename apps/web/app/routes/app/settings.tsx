/*
TODO: QUESTIONS
1. Does settings page need search? In header or like braves in header, but different one from default search button?
2. What should be structure of settings? Like Brave? Or like google calendar (scroll down to move to sub pages) inside groups, like general, and have it togglable ?
3. Should other pages be visible on settings page? Or settings should be in separate tab-like view? Like cloudflare and google calendar?
4. Does each settings group and setting need its id that can be used to link to it?
5. What kind of document title does it need? Should it be dynamic? What should change subpage?
*/
// 1. Like in brave
// 2. Style like brave, Experience, scroll to move between groups, like google calendar. Movement from one group to another needs clicking either tab on desktop or moving back and clicking another group on mobile.
// 3. On both mobile and desktop open like google calendar and brave with button to move back to home page and exit button to exit settings page to home. No logo needed.
// 4. It would be good, but maybe is too redundant. It can be developed later if needed, but it might not be worth it.
// 5. Kei︱Settings - {Group}

// const SETTINGS_GROUPS = {
//   General: ["Language and region", "Time zone", "World clock", "Keyboard shortcuts", "Offline"],
//   Calendar: ["View Options"],
//   Notifications: {
//     turned: "Off/On",
//     When: "custom field, default 1 minute",
//     "play notification sounds": ["on/off", "sound_custom"],
//   },
//   Appearance: {
//     Theme: ["Mode", "Color", "Font", "upload css theme"],
//     // 1. Where elements live on screen (Per Page)
//     Layout: {
//       PageLayout: ["Standard Calendar", "Focus / Split View", "Bento Dashboard"],
//       SidebarPosition: ["Left", "Right", "Hidden"],
//       ActiveWidgets: ["MiniCalendar", "TaskList", "AboutMeQuickCard"],
//     },

//     // 2. Visual presentation & interface behaviors
//     ViewModeOptions: {
//       // Clutter & Focus Control
//       HeaderBehavior: ["Always Visible", "Subtle On Idle", "Auto-Hide on Scroll"],
//       InterfaceDensity: ["Compact (More Data)", "Comfortable", "Spacious"],

//       // Visual Hierarchy & Subtlety
//       PastEventsVisual: ["Dim / Lower Opacity", "Strikethrough", "Normal"],
//       EventCardDetailLevel: ["Full (Title, Location, Time)", "Minimal (Title Only)", "Dot Only"],
//       GridLines: ["Subtle", "High Contrast", "Hidden"],

//       // Motion & Transitions
//       Animations: ["Smooth / Full", "Reduced Motion", "Off"],
//     },
//     Accessibility: [],
//     Reset: "button",
//   },
//   Extensions: ["dev:not_available", "idea:not_available:holidays"],
//   Sync_Backup: {
//     Sync: ["Sync Settings", "Peers", "Cloud", "dev:not_available:Freenet"],
//     Import_and_Export: ["Import", "Export"],
//   },
//   Privacy_Security: {
//     Security: ["App Lock / Passcode", "Local Encryption", "Auto-lock Timeout"],
//     Telemetry: ["Usage", "Error Reporting", "Privacy Policy"],
//   },
//   Storage_Maintenance: {
//     Maintenance: {
//       "Security Audits": ["how_often", "run_now"],
//       "Database Audits": ["how_often", "run_now"],
//       "Accessibility Audits": ["how_often", "run_now"],
//     },
//     Storage: ["Engine", "Size", "Age", "Location"],
//   },
//   About: ["Title", "Version", "Check for Updates", "Source Code", "Links", "Licenses"],
// };
import { useEffect } from "react";
import { AppPage } from "@/components/layout/AppPage";
import { MobileFAB } from "@/components/MobileFAB";
import { GeneralSettings } from "@/components/settings/GeneralSettings";

export default function Settings({ groupTitle }: { groupTitle: string }) {
  useEffect(() => {
    document.title = `Kei︱Settings - ${groupTitle}`;
  }, [groupTitle]);

  return (
    <AppPage title="Settings" scrollable padded>
      <MobileFAB className="hidden">{null}</MobileFAB>
      <GeneralSettings />
    </AppPage>
  );
}
