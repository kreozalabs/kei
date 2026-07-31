import { Badge, Button, CardHeader, CardTitle, Input } from "@kreozalabs/kei-ui";
import { RotateCcw, Search, X } from "lucide-react";

interface ShortcutSearchHeaderProps {
  isEnabled: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onResetAll: () => void;
}

export function ShortcutSearchHeader({
  isEnabled,
  searchQuery,
  onSearchQueryChange,
  onResetAll,
}: ShortcutSearchHeaderProps) {
  return (
    <CardHeader className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <CardTitle className="text-sm font-medium">Available Shortcuts</CardTitle>
        <Badge variant={isEnabled ? "default" : "secondary"} className="text-sm font-normal">
          {isEnabled ? "Active" : "Disabled"}
        </Badge>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
        {/* Reset Defaults Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onResetAll}
          className="h-8 shrink-0 gap-1.5 text-sm"
          title="Reset all keyboard shortcuts to default settings"
          aria-label="Reset all keyboard shortcuts to default settings"
        >
          <RotateCcw className="text-muted-foreground size-3.5" aria-hidden="true" />
          Reset defaults
        </Button>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search
            className="text-muted-foreground absolute top-2.5 left-2.5 size-4"
            aria-hidden="true"
          />
          <Input
            id="shortcut-search-input"
            type="text"
            aria-label="Search commands or shortcuts"
            placeholder='Search commands or shortcuts (e.g. "ctrl+k", "g s")'
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-8 pr-8 pl-8 text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground absolute top-1.5 right-1.5"
              onClick={() => onSearchQueryChange("")}
              aria-label="Clear search query"
            >
              <X className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Clear search query</span>
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
