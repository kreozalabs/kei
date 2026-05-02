import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function SyncListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = new BroadcastChannel("kei_db_sync");

    const handleMessage = (event: MessageEvent) => {
      const { type, entity } = event.data || {};

      if (type === "DB_UPDATED") {
        console.log(`DB update broadcast received for ${entity || "all"}, invalidating queries...`);

        // If no entity is specified (legacy/global) or it's "actions"
        if (!entity || entity === "actions") {
          queryClient.invalidateQueries({ queryKey: ["actions"] });
          queryClient.invalidateQueries({ queryKey: ["recent-configs"] });
        }
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [queryClient]);

  return null;
}
