import { useSettings } from "@/providers/SettingsContext";
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
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
} from "@kreozalabs/kei-ui";
import {
  LayoutGrid,
  ChevronDown,
  Calendar,
  Inbox,
  ListTodo,
  Trash2Icon,
  CheckCircle2Icon,
  CheckSquare,
} from "lucide-react";

export function ViewSwitcher() {
  const { settings, updateSetting } = useSettings();
  const {
    viewMode,
    setViewMode,
    visibleSelectedActionIds,
    isSelectionModeForced,
    setIsSelectionModeForced,
    handleClearSelection,
  } = useDashboardContext();

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
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {settings.enable_selection && (
            <DropdownMenuCheckboxItem
              checked={isSelectionModeForced || visibleSelectedActionIds.size > 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  setIsSelectionModeForced(true);
                } else {
                  handleClearSelection();
                }
              }}
            >
              <CheckSquare
                className={cn(
                  isSelectionModeForced || visibleSelectedActionIds.size > 0
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
              Selection Mode
            </DropdownMenuCheckboxItem>
          )}
          <DropdownMenuCheckboxItem
            checked={settings.show_completed}
            onCheckedChange={(checked) => updateSetting("show_completed", checked)}
          >
            <CheckCircle2Icon
              className={cn(settings.show_completed ? "text-primary" : "text-muted-foreground")}
            />
            Show Completed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={settings.show_abandoned}
            onCheckedChange={(checked) => updateSetting("show_abandoned", checked)}
          >
            <Trash2Icon
              className={cn(settings.show_abandoned ? "text-primary" : "text-muted-foreground")}
            />
            Show Abandoned
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
