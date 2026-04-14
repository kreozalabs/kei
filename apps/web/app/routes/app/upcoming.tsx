import { useEffect } from "react";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { HeaderSearch, HeaderMore, HeaderNewAction } from "@/components/layout/AppHeader";
import { CalendarIcon } from "lucide-react";

export default function Upcoming() {
  const { setTitle, setSubtitle, setOnFabClick, setHeaderActions, openActionInput } =
    useOutletContext<AppLayoutContext>();

  useEffect(() => {
    setTitle("Upcoming");
    setSubtitle(undefined);
    setOnFabClick(() => openActionInput);

    setHeaderActions({
      center: <HeaderSearch />,
      right: (
        <>
          <HeaderNewAction onClick={openActionInput} />
          <HeaderMore />
        </>
      ),
    });

    return () => setHeaderActions(undefined);
  }, [setTitle, setSubtitle, setOnFabClick, setHeaderActions, openActionInput]);

  return (
    <div className="flex flex-col items-center justify-center p-20 border border-dashed rounded-4xl gap-4">
      <div className="flex items-center justify-center bg-primary/10 text-primary size-12 rounded-2xl animate-pulse">
        <CalendarIcon className="size-6" />
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
        Visioning the Future...
      </p>
    </div>
  );
}
