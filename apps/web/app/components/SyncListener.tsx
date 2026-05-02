import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function SyncListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = new BroadcastChannel("kei_db_sync");

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "DB_UPDATED") {
        console.log("DB update broadcast received, invalidating queries...");
        // Invalidate all queries starting with "actions"
        queryClient.invalidateQueries({ queryKey: ["actions"] });
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
