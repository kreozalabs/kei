import { IMPORTANT_CONFIG, type Action } from "@kreozalabs/core";
import { forwardRef, useEffect, useRef, useState } from "react";
import { EditableTitle } from "./EditableTitle";
import { EditableNote } from "./EditableNote";
import { EditableStatus, type StatusType } from "./EditableStatus";
import { EditableIntention, type IntentionType } from "./EditableIntention";
import { EditableEnergy, type EnergyType } from "./EditableEnergy";
import { EditableDuration } from "./EditableDuration";
import { EditableImportant } from "./EditableImportant";
import { PropertyButton } from "./PropertyButton";
import { Badge, Button, cn } from "@kreozalabs/ui";
import {
  SendHorizontal,
  Calendar,
  Bell,
  Folder,
  MapPin,
  Palette,
  Users,
  BatteryMedium,
  Target,
  Star,
  Paperclip,
  Tags,
  ArrowDownUp,
  MoreHorizontal,
  Layers,
  Share2,
  Link2,
} from "lucide-react";
import { useSettings } from "@/providers/SettingsContext";

export interface ActionInputProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDate?: string;
  className?: string;
  variant?: "inline" | "dialog";
  actionToEdit?: Action;
}

export interface ActionInputHandle {
  handleCancelAttempt: () => void;
}

export const ActionInput = forwardRef<ActionInputHandle, ActionInputProps>(
  ({ onSuccess, onCancel, initialDate, className, variant = "inline", actionToEdit }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const { settings } = useSettings();

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel?.();
        // TODO: Save as draft
      }
    };

    const titleInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      titleInputRef.current?.focus();
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      setIsLoading(true);
      // NOTE: Simulate save
      setTimeout(() => {
        setIsLoading(false);
        onSuccess?.();
      }, 500);
    };

    // State for all editable fields
    const [title, setTitle] = useState(actionToEdit?.title || "");
    const [note, setNote] = useState(actionToEdit?.note || "");
    const [status, setStatus] = useState<StatusType>("active");
    const [intention, setIntention] = useState<IntentionType>("want");
    const [energy, setEnergy] = useState<EnergyType>("medium");
    const [duration, setDuration] = useState<[number, number | null]>([0, null]); // FIXME: Use TYPE
    const [important, setImportant] = useState(false);
    // TODO: Allow user to configure what is shown by default. For that, we should be able to loop over some settings instead of hard-coding what is shown.

    return (
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-3 p-4 bg-background border border-border/40 shadow-xs"
      >
        {/* Header */}
        <div className="flex flex-col gap-1">
          {/* Under creation: starts editing automatically */}
          <EditableTitle
            value={title}
            onChange={setTitle}
            defaultEditing={!actionToEdit}
            placeholder="What needs to be done?"
          />
          <EditableNote value={note} onChange={setNote} />
        </div>

        {/* Active Properties (Only shows what has been explicitly set or changed from defaults in user settings) */}
        {!isAdvancedMode && (
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {intention !== settings.default_intention && (
              <EditableIntention value={intention} onChange={setIntention} />
            )}
            {important && (
              <Badge
                variant="secondary"
                className="gap-1.5 h-7 px-2 font-medium bg-primary/10 text-primary hover:bg-primary/15"
              >
                <Star
                  className={cn(
                    "size-3 shrink-0 inline-block",
                    IMPORTANT_CONFIG.active.color,
                    IMPORTANT_CONFIG.active.fill
                  )}
                />
                Important
              </Badge>
            )}

            {duration !==
              settings.action_duration_options.find((doOpt) => doOpt.default === true)?.value && (
              <EditableDuration value={duration} onChange={setDuration} />
            )}
          </div>
        )}

        {/* Advanced Properties View */}
        {isAdvancedMode && (
          <div className="flex flex-col gap-4 mt-2 pt-3 border-t border-border/40">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <EditableStatus value={status} onChange={setStatus} />
              {/* Tooltip: Status of the action. Use <key> in title or note to configure using keyboard. */}
              <EditableIntention value={intention} onChange={setIntention} />
              {/* Tooltip: Intention of the action. Use <key> in title or note to configure using keyboard. */}
              <EditableEnergy value={energy} onChange={setEnergy} />
              {/* Tooltip: Energy of the action. Use <key> in title or note to configure using keyboard. */}
              <EditableDuration value={duration} onChange={setDuration} />
              {/* Tooltip: Duration of the action. Use <key> in title or note to configure using keyboard. */}
              <EditableImportant value={important} onChange={setImportant} />
              {/* Tooltip: Important of the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Calendar className="size-3.5" />} label="Date & Time" />{" "}
              {/* Tooltip: Date and time of the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Bell className="size-3.5" />} label="Reminder" />{" "}
              {/* Tooltip: Reminder for the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Target className="size-3.5" />} label="Deadline" />{" "}
              {/* Tooltip: Deadline for the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Folder className="size-3.5" />} label="Project" />{" "}
              {/* Tooltip: Project of the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<MapPin className="size-3.5" />} label="Location" />{" "}
              {/* Tooltip: Location of the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Palette className="size-3.5" />} label="Color" />{" "}
              {/* Tooltip: Color of the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Tags className="size-3.5" />} label="Labels" />{" "}
              {/* Tooltip: Labels for the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Users className="size-3.5" />} label="People" />{" "}
              {/* Tooltip: People associated with the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Paperclip className="size-3.5" />} label="Attachments" />{" "}
              {/* Tooltip: Attachments to the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Layers className="size-3.5" />} label="Type" />{" "}
              {/* Tooltip: Type of the action. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Share2 className="size-3.5" />} label="Shared" />
              {/* Tooltip: Share to another user. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<Link2 className="size-3.5" />} label="Link" />{" "}
              {/* Tooltip: Link to another action or object. Use <key> in title or note to configure using keyboard. */}
              <PropertyButton icon={<ArrowDownUp className="size-3.5" />} label="Order" />{" "}
              {/* Tooltip: Order of the action. Use <key> in title or note to configure using keyboard. */}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/10">
          <div className="flex items-center gap-1">
            {!isAdvancedMode && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  title="Date & Time"
                >
                  <Calendar className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  title="Project"
                >
                  <Folder className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  title="Energy"
                >
                  <BatteryMedium className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  title="People"
                >
                  <Users className="size-4" />
                </Button>
                <div className="w-[1px] h-4 bg-border/50 mx-1" />
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 text-muted-foreground",
                isAdvancedMode ? "text-primary bg-primary/10 hover:bg-primary/15" : ""
              )}
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            >
              {isAdvancedMode ? (
                <>Less Options</>
              ) : (
                <>
                  <MoreHorizontal className="size-4 mr-1.5" />
                  <span>More</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground/60 hidden sm:block">
              Draft saved automatically
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !title.trim()}
                className="gap-1.5 px-4"
              >
                <span>Save</span>
                <SendHorizontal className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  }
);

ActionInput.displayName = "ActionInput";
