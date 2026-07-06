import { toast, Button } from "@kreozalabs/ui";

export function registerPWA() {
  if (typeof window === "undefined") return;

  const isTauri = "__TAURI_METADATA__" in window || "__TAURI_IPC__" in window;
  if (isTauri) return;

  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({
      onOfflineReady() {
        toast.custom(
          (t) => (
            <div className="border-border bg-background flex w-80 flex-col gap-3 rounded-2xl border p-4 text-left shadow-lg md:w-96">
              <div className="flex flex-col gap-1">
                <h3 className="text-foreground text-sm font-semibold">Ready to work offline</h3>
                <p className="text-muted-foreground text-xs">
                  Kei is now fully configured for offline capability and works perfectly without
                  internet connection!
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => toast.dismiss(t)}
                  className="rounded-xl px-4 py-1 text-xs"
                >
                  OK
                </Button>
              </div>
            </div>
          ),
          {
            duration: Infinity,
          }
        );
      },
      onRegisteredSW(swUrl, r) {
        const intervalMS = 60 * 60 * 1000;
        if (r) {
          setInterval(async () => {
            if (r.installing || !navigator) return;

            if ("connection" in navigator && !navigator.onLine) return;

            try {
              console.log("Checking for service worker updates...");
              const resp = await fetch(swUrl, {
                cache: "no-store",
                headers: {
                  cache: "no-store",
                  "cache-control": "no-cache",
                },
              });

              if (resp?.status === 200) {
                await r.update();
              }
            } catch (error) {
              // handle fetch failure/network error gracefully (server is down)
              console.error("Failed to check for service worker updates:", error);
            }
          }, intervalMS);
        }
      },
    });
  });
}
