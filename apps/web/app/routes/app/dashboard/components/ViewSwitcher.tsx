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
        return <Calendar className="size-4 mr-2" />;
      case "kanban":
        return <KanbanSquare className="size-4 mr-2" />;
      case "inbox":
        return <Inbox className="size-4 mr-2" />;
      case "lists":
        return <ListTodo className="size-4 mr-2" />;
      default:
        return <LayoutGrid className="size-4 mr-2" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed bg-background hover:bg-muted font-medium text-xs rounded-full px-3 gap-1 shadow-sm"
        >
          {getIcon(currentView.id)}
          <span className="hidden sm:inline">{currentView.label}</span>
          <ChevronDown className="size-3.5 ml-1 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-background/95 backdrop-blur-md border border-border/40 shadow-xl rounded-xl"
      >
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 px-3 py-1.5">
          Chronological
        </DropdownMenuLabel>
        {chronologicalViews.map((view) => (
          <DropdownMenuItem
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={cn(
              "px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg mx-1 my-0.5",
              viewMode === view.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
            )}
          >
            {getIcon(view.id)}
            {view.label}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-border/40 my-1" />

        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 px-3 py-1.5">
          Structural
        </DropdownMenuLabel>
        {structuralViews.map((view) => (
          <DropdownMenuItem
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={cn(
              "px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg mx-1 my-0.5",
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
