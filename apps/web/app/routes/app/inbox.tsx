import { useEffect } from "react";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderSearch, HeaderMore, HeaderNewAction } from "@/components/layout/AppHeader";
import { InboxIcon } from "lucide-react";

export default function Inbox() {
  const { setTitle, setSubtitle, setOnFabClick, setHeaderActions, openActionInput } =
    useOutletContext<AppLayoutContext>();

  useEffect(() => {
    setTitle("Inbox");
    setSubtitle("Capture everything");

    setHeaderActions({
      center: <HeaderSearch />,
    });

    return () => setHeaderActions(undefined);
  }, [setTitle, setSubtitle, setHeaderActions]);

  return (
    <div className="flex flex-col items-center justify-center p-20 border border-dashed rounded-4xl gap-4">
      <div className="flex items-center justify-center bg-primary/10 text-primary size-12 rounded-2xl animate-pulse">
        <InboxIcon className="size-6" />
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
        Inbox is currently empty...
      </p>
    </div>
  );
}
