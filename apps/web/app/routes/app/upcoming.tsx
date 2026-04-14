import { useEffect } from "react";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "@/components/layout/AppLayout";
import { CalendarIcon } from "lucide-react";

export default function Upcoming() {
  const { setTitle, setSubtitle, setOnFabClick } = useOutletContext<AppLayoutContext>();

  useEffect(() => {
    setTitle("Upcoming");
    setSubtitle(undefined);
    setOnFabClick(undefined);
  }, [setTitle, setSubtitle, setOnFabClick]);

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
