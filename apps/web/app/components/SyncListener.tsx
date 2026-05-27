import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function SyncListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = new BroadcastChannel("kei_db_sync");
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleMessage = (event: MessageEvent) => {
      const { type, entity } = event.data || {};

      if (type === "DB_UPDATED") {
        if (!entity || entity === "actions") {
          if (debounceTimeout) {
            clearTimeout(debounceTimeout);
          }
          debounceTimeout = setTimeout(() => {
            console.log(`DB update broadcast received for ${entity || "all"}, invalidating queries (debounced)...`);
            queryClient.invalidateQueries({ queryKey: ["actions"] });
            queryClient.invalidateQueries({ queryKey: ["recent-configs"] });
          }, 150);
        }
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [queryClient]);

  return null;
}
