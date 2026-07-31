import { useEffect, useState } from "react";
import { useSettings } from "@/providers/SettingsContext";
import { SettingSection } from "../SettingSection";
import { SettingSwitch } from "../SettingSwitch";
import { Command, KeyboardIcon, MinusCircle, Plus, RotateCcw, Search, X } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Kbd,
  cn,
} from "@kreozalabs/kei-ui";

interface CommandShortcut {
  id: string;
  description: string;
  category: string;
  shortcuts: string[][];
}

// Local UI mapping
// TODO: Replace with i18n
// TODO: use "⌘" for mac, "Win" for Win & Linux
const INITIAL_COMMANDS: CommandShortcut[] = [
  {
    id: "back",
    description: "Back",
    category: "Navigation",
    shortcuts: [["BrowserBack"], ["⌥ Alt", "ArrowLeft"], ["⌥ AltGr", "ArrowLeft"]],
  },
  {
    id: "forward",
    description: "Forward",
    category: "Navigation",
    shortcuts: [["BrowserForward"], ["⌥ Alt", "ArrowRight"], ["⌥ AltGr", "ArrowRight"]],
  },
  {
    id: "global-search",
    description: "Global Search & Command Palette",
    category: "General & Navigation",
    shortcuts: [["⌘", "K"]],
  },
  {
    id: "toggle-sidebar",
    description: "Toggle Sidebar",
    category: "General & Navigation",
    shortcuts: [["⌘", "B"]],
  },
  {
    id: "open-settings",
    description: "Open Preferences / Settings",
    category: "General & Navigation",
    shortcuts: [["⌘", ","]],
  },
  {
    id: "create-action",
    description: "Create New Action",
    category: "Calendar",
    shortcuts: [["N"]],
  },
  {
    id: "quick-filter",
    description: "Quick Filter Actions",
    category: "Calendar",
    shortcuts: [["/"]],
  },
  {
    id: "toggle-completed",
    description: "Toggle Completed Items",
    category: "Calendar",
    shortcuts: [["Shift", "C"]],
  },
  {
    id: "save-workspace",
    description: "Save tabs as workspace…",
    category: "Workspaces",
    shortcuts: [],
  },
  {
    id: "open-workspace",
    description: "Open workspace…",
    category: "Workspaces",
    shortcuts: [],
  },
];

export function KeyboardShortcutsSettings() {
  const { settings, updateSetting } = useSettings();
  const isEnabled = settings.enable_keyboard_shortcuts ?? true;

  const [searchQuery, setSearchQuery] = useState("");
  const [commands, setCommands] = useState<CommandShortcut[]>(INITIAL_COMMANDS);

  // Add Shortcut Dialog state
  const [selectedCommandForAdd, setSelectedCommandForAdd] = useState<CommandShortcut | null>(null);
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);

  // Keydown listener for shortcut recording dialog
  useEffect(() => {
    if (!selectedCommandForAdd) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return; // Allow escape to close dialog naturally

      e.preventDefault();
      e.stopPropagation();

      const ignoreKeys = ["Control", "Meta", "Alt", "Shift", "AltGraph"];
      if (ignoreKeys.includes(e.key)) return;

      const keys: string[] = [];
      if (e.metaKey || e.ctrlKey) {
        keys.push(navigator.platform.toUpperCase().includes("MAC") ? "⌘" : "Ctrl");
      }
      if (e.altKey) keys.push("⌥ Alt");
      if (e.shiftKey) keys.push("Shift");

      let keyName = e.key;
      if (keyName === " ") keyName = "Space";
      else if (keyName === "ArrowLeft") keyName = "ArrowLeft";
      else if (keyName === "ArrowRight") keyName = "ArrowRight";
      else if (keyName === "ArrowUp") keyName = "ArrowUp";
      else if (keyName === "ArrowDown") keyName = "ArrowDown";
      else if (keyName.length === 1) keyName = keyName.toUpperCase();

      keys.push(keyName);
      setPendingKeys(keys);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCommandForAdd]);

  const handleSaveNewShortcut = () => {
    if (!selectedCommandForAdd || pendingKeys.length === 0) return;

    setCommands((prev) =>
      prev.map((cmd) =>
        cmd.id === selectedCommandForAdd.id
          ? { ...cmd, shortcuts: [...cmd.shortcuts, pendingKeys] }
          : cmd
      )
    );

    setSelectedCommandForAdd(null);
    setPendingKeys([]);
  };

  const handleRemoveShortcut = (commandId: string, indexToRemove: number) => {
    setCommands((prev) =>
      prev.map((cmd) =>
        cmd.id === commandId
          ? { ...cmd, shortcuts: cmd.shortcuts.filter((_, i) => i !== indexToRemove) }
          : cmd
      )
    );
  };

  const isCommandModified = (cmd: CommandShortcut) => {
    const initial = INITIAL_COMMANDS.find((item) => item.id === cmd.id);
    if (!initial) return false;
    return JSON.stringify(cmd.shortcuts) !== JSON.stringify(initial.shortcuts);
  };

  const handleResetSingleCommand = (commandId: string) => {
    const initial = INITIAL_COMMANDS.find((item) => item.id === commandId);
    if (!initial) return;
    setCommands((prev) =>
      prev.map((cmd) => (cmd.id === commandId ? { ...cmd, shortcuts: initial.shortcuts } : cmd))
    );
  };

  const filteredCommands = commands.filter((cmd) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesDescription = cmd.description.toLowerCase().includes(query);
    const matchesCategory = cmd.category.toLowerCase().includes(query);
    const matchesShortcuts = cmd.shortcuts.some((keys) =>
      keys.some((k) => k.toLowerCase().includes(query))
    );
    return matchesDescription || matchesCategory || matchesShortcuts;
  });

  return (
    <SettingSection
      title="Keyboard shortcuts"
      description="Manage application hotkeys and quick action key bindings."
      icon={<KeyboardIcon className="size-4" />}
    >
      <SettingSwitch
        label="Enable keyboard shortcuts"
        description="Allow using hotkeys throughout the app to navigate and execute actions quickly."
        icon={<Command className="size-4" />}
        value={isEnabled}
        onValueChange={(val) => updateSetting("enable_keyboard_shortcuts", val)}
      />

      <Card className={cn("transition-opacity", !isEnabled && "pointer-events-none opacity-50")}>
        <CardHeader className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Available Shortcuts</CardTitle>
            <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs font-normal">
              {isEnabled ? "Active" : "Disabled"}
            </Badge>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            {/* Reset Defaults Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCommands(INITIAL_COMMANDS);
                setSearchQuery("");
              }}
              className="h-8 shrink-0 gap-1.5 text-xs"
              title="Reset all keyboard shortcuts to default settings"
            >
              <RotateCcw className="text-muted-foreground size-3.5" />
              Reset defaults
            </Button>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
              <Input
                type="text"
                placeholder="Search for a command or shortcut"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pr-8 pl-8 text-xs"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-foreground absolute top-1.5 right-1.5"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-border divide-y">
            {filteredCommands.length === 0 ? (
              <div className="text-muted-foreground p-6 text-center text-xs">
                No matching commands or shortcuts found for &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredCommands.map((command) => (
                <div
                  key={command.id}
                  className="hover:bg-muted/30 grid grid-cols-12 items-start gap-4 p-3.5 text-sm transition-colors"
                >
                  {/* Column 1: Command Title & Category */}
                  <div className="col-span-12 flex flex-col gap-1 sm:col-span-4">
                    <span className="text-foreground font-medium">{command.description}</span>
                    <Badge
                      variant="outline"
                      className="text-muted-foreground w-fit text-[10px] font-normal"
                    >
                      {command.category}
                    </Badge>
                  </div>

                  {/* Column 2: Shortcuts List */}
                  <div className="col-span-12 flex flex-col gap-2 sm:col-span-6">
                    {command.shortcuts.length === 0 && (
                      <span className="text-muted-foreground/70 py-0.5 text-xs italic">
                        No shortcut assigned
                      </span>
                    )}

                    {command.shortcuts.map((keys, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <div className="flex flex-wrap items-center gap-1">
                          {keys.map((k, kIdx) => (
                            <Kbd key={kIdx}>{k}</Kbd>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground hover:text-destructive size-6 shrink-0 transition-colors"
                          onClick={() => handleRemoveShortcut(command.id, sIdx)}
                          title="Remove key combination"
                        >
                          <MinusCircle className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Column 3: Row Actions (Reset per field + Add) */}
                  <div className="col-span-12 flex items-center justify-end gap-1 sm:col-span-2">
                    {isCommandModified(command) && (
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => handleResetSingleCommand(command.id)}
                        className="text-muted-foreground hover:text-foreground size-7"
                        title="Reset this shortcut to default"
                      >
                        <RotateCcw className="size-3.5" /> Reset
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedCommandForAdd(command);
                        setPendingKeys([]);
                      }}
                      className="h-7 gap-1 px-2.5 text-xs"
                    >
                      <Plus className="size-3.5" />
                      Add
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create New Shortcut Dialog */}
      <Dialog
        open={!!selectedCommandForAdd}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCommandForAdd(null);
            setPendingKeys([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {selectedCommandForAdd
                ? `Add shortcut for "${selectedCommandForAdd.description}"`
                : "Create new shortcut"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Create a new shortcut. Press the desired keys to create a new binding
            </DialogDescription>
          </DialogHeader>

          <div className="border-border bg-muted/30 my-4 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center">
            {pendingKeys.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {pendingKeys.map((key, i) => (
                  <Kbd key={i} className="px-2.5 py-1 text-sm font-medium">
                    {key}
                  </Kbd>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="bg-muted text-muted-foreground rounded-full p-2.5">
                  <KeyboardIcon className="size-5" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                  Press the desired keys to create a new binding
                </span>
              </div>
            )}

            {pendingKeys.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground hover:text-foreground mt-1 gap-1 text-xs"
                onClick={() => setPendingKeys([])}
              >
                <RotateCcw className="size-3" />
                Clear key combination
              </Button>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCommandForAdd(null);
                setPendingKeys([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={pendingKeys.length === 0}
              onClick={handleSaveNewShortcut}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingSection>
  );
}
