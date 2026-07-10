import { useDashboardContext } from "../context/DashboardContext";
import { VIEW_MODES, type ViewMode } from "../types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Button,
  cn,
} from "@kreozalabs/kei-ui";
import { LayoutGrid, ChevronDown, Calendar, Inbox, ListTodo } from "lucide-react";

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
        return <Calendar />;
      case "inbox":
        return <Inbox />;
      case "lists":
        return <ListTodo />;
      default:
        return <LayoutGrid />;
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
          <span className="hidden sm:inline">{currentView.label}</span>
          <ChevronDown className="text-muted-foreground ml-1 size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background/95 border-border/40 w-56 rounded-xl border shadow-xl backdrop-blur-md"
      >
        {chronologicalViews.map((view) => (
          <DropdownMenuItem
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={cn(
              "mx-1 my-0.5 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold",
              viewMode === view.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
            )}
          >
            {view.label}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

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
