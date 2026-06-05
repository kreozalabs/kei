import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function SyncListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = new BroadcastChannel("kei_db_sync");
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const triggerInvalidation = (entity?: string) => {
      if (!entity || entity === "actions") {
        const activeWrites =
          typeof window !== "undefined"
            ? (window as Window & { __activeWrites?: number }).__activeWrites
            : undefined;
        if (activeWrites && activeWrites > 0) {
          console.log(
            "Skipping sync-listener query invalidation because local writes are in progress"
          );
          return;
        }
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
          console.log(
            `DB update broadcast received for ${entity || "all"}, invalidating queries (debounced)...`
          );
          queryClient.invalidateQueries({ queryKey: ["actions"] });
          queryClient.invalidateQueries({ queryKey: ["recent-configs"] });
        }, 150);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      const { type, entity } = event.data || {};
      if (type === "DB_UPDATED") {
        triggerInvalidation(entity);
      }
    };

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, entity } = customEvent.detail || {};
      if (type === "DB_UPDATED") {
        triggerInvalidation(entity);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const activeWrites =
        typeof window !== "undefined"
          ? (window as Window & { __activeWrites?: number }).__activeWrites
          : undefined;
      if (activeWrites && activeWrites > 0) {
        e.preventDefault();
        e.returnValue = "Changes you made may not be saved.";
        return e.returnValue;
      }
    };

    channel.addEventListener("message", handleMessage);
    window.addEventListener("kei_db_sync_local", handleCustomEvent);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      channel.removeEventListener("message", handleMessage);
      window.removeEventListener("kei_db_sync_local", handleCustomEvent);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      channel.close();
    };
  }, [queryClient]);

  return null;
}
