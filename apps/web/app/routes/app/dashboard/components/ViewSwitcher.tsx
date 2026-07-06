import { useDashboardContext } from "../context/DashboardContext";
import { VIEW_MODES, type ViewMode } from "../types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Button,
  cn,
} from "@kreozalabs/ui";
import { LayoutGrid, ChevronDown, Calendar, KanbanSquare, Inbox, ListTodo } from "lucide-react";

export function ViewSwitcher() {
  const { viewMode, setViewMode } = useDashboardContext();

  const currentView = VIEW_MODES[viewMode];

  const chronologicalViews = Object.values(VIEW_MODES).filter((v) => v.group === "chronological");
  const structuralViews = Object.values(VIEW_MODES).filter((v) => v.group === "structural");

  const getIcon = (id: ViewMode) => {
    switch (id) {
      case "day":
      case "week":
      case "month":
      case "year":
      case "agenda":
        return <Calendar className="mr-2 size-4" />;
      case "kanban":
        return <KanbanSquare className="mr-2 size-4" />;
      case "inbox":
        return <Inbox className="mr-2 size-4" />;
      case "lists":
        return <ListTodo className="mr-2 size-4" />;
      default:
        return <LayoutGrid className="mr-2 size-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-background hover:bg-muted h-8 gap-1 rounded-full border-dashed px-3 text-xs font-medium shadow-sm"
        >
          {getIcon(currentView.id)}
          <span className="hidden sm:inline">{currentView.label}</span>
          <ChevronDown className="text-muted-foreground ml-1 size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background/95 border-border/40 w-56 rounded-xl border shadow-xl backdrop-blur-md"
      >
        <DropdownMenuLabel className="text-muted-foreground/60 px-3 py-1.5 text-[10px] font-black tracking-wider uppercase">
          Chronological
        </DropdownMenuLabel>
        {chronologicalViews.map((view) => (
          <DropdownMenuItem
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={cn(
              "mx-1 my-0.5 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold",
              viewMode === view.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
            )}
          >
            {getIcon(view.id)}
            {view.label}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-border/40 my-1" />

        <DropdownMenuLabel className="text-muted-foreground/60 px-3 py-1.5 text-[10px] font-black tracking-wider uppercase">
          Structural
        </DropdownMenuLabel>
        {structuralViews.map((view) => (
          <DropdownMenuItem
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={cn(
              "mx-1 my-0.5 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold",
              viewMode === view.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
            )}
          >
            {getIcon(view.id)}
            {view.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
