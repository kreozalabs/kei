const channel = typeof window !== "undefined" ? new BroadcastChannel("kei_db_sync") : null;

export function broadcastDbUpdate(entity: "actions" | "settings") {
  if (channel) {
    channel.postMessage({ type: "DB_UPDATED", entity });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kei_db_sync_local", {
        detail: { type: "DB_UPDATED", entity },
      })
    );
  }
}
