import { useEffect } from "react";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderMore } from "@/components/layout/AppHeader";
import { PersonStandingIcon } from "lucide-react";

export default function Me() {
  const { setTitle, setSubtitle, setOnFabClick, setHeaderActions, openActionInput } =
    useOutletContext<AppLayoutContext>();

  useEffect(() => {
    setTitle("Me");
    setSubtitle("Personal Reflection");
    setOnFabClick(() => openActionInput);

    setHeaderActions({ right: <HeaderMore /> });

    return () => setHeaderActions(undefined);
  }, [setTitle, setSubtitle, setOnFabClick, setHeaderActions, openActionInput]);

  return (
    <div className="flex flex-col items-center justify-center p-20 border border-dashed rounded-4xl gap-4">
      <div className="flex items-center justify-center bg-primary/10 text-primary size-12 rounded-2xl animate-pulse">
        <PersonStandingIcon className="size-6" />
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
        Personal statistics coming soon...
      </p>
    </div>
  );
}
