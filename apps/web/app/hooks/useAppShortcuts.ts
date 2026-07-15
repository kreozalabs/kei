// hooks/useAppShortcuts.ts
import { useMemo } from "react";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { useFullscreen } from "./useFullscreen";

export function useAppShortcuts({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { toggleFullscreen } = useFullscreen();

  const shortcuts = useMemo(
    () => [
      { key: "b", ctrlOrMeta: true, handler: toggleSidebar, description: "Toggle Sidebar" },
      {
        key: "k",
        ctrlOrMeta: true,
        handler: () => console.log("Search..."),
        description: "Search",
      },
      { key: "f", alt: true, handler: toggleFullscreen, description: "Toggle Fullscreen" },
    ],
    [toggleSidebar, toggleFullscreen]
  );

  useKeyboardShortcuts(shortcuts);
}
