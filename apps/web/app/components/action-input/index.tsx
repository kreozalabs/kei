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
  CoreGroup,
  TimeGroup,
  ContextGroup,
  AttachmentsGroup,
  AppearanceGroup,
  FooterGroup,
} from "./sections";
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
    // TODO: Allow user to keybindings that will activate note and title from quickbar, such as /t <tab> title<key> <tab> note<key>
    // TODO: Define initial <keys> for fields
    // TODO: Allow user to set his own <keys>

    return (
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-3 p-4 bg-background border border-border/40 shadow-xs"
      >
        <CoreGroup>
          {/* FIXME: These should work seamlessly and without problems. UX should be great on any device, whether touch, mouse or keyboard or virtual keyboard, or even voice command. It should be like rich editor. */}
          {/* Under creation: starts editing automatically */}
          <EditableTitle
            value={title}
            onChange={setTitle}
            defaultEditing={!actionToEdit}
            placeholder="What needs to be done?"
          />
          <EditableNote value={note} onChange={setNote} />
        </CoreGroup>
        {/* Active Properties (Only shows what has been explicitly set or changed from defaults in user settings) */}
        {!isAdvancedMode && (
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {/* TODO: Implement user-configured Quick Bar here */}
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
            {/* TODO: Make this own dynamic, so any included field is show hier and we should not need to write comps here. They just appear if user set component or subcomponent. */}
          </div>
        )}
        <div className="flex flex-col gap-6 mt-2 pt-3 border-t border-border/40">
          {/* TODO: Each group should be like dropdown or dialog or something. It should just appear and extend. Disappear when user chooses something else (NOT SURE ABOUT IT)??? */}
          <TimeGroup>
            <EditableDuration value={duration} onChange={setDuration} />
            {/* Tooltip: Duration of the action. Use <key> in title or note to configure using keyboard. */}
            <PropertyButton icon={<Calendar className="size-3.5" />} label="Date & Time" />
            {/* Tooltip: Date and time of the action. Use <key> in title or note to configure using keyboard. */}
            <PropertyButton icon={<Target className="size-3.5" />} label="Deadline" />
            {/* Tooltip: Deadline for the action. Use <key> in title or note to configure using keyboard. */}
            <PropertyButton icon={<Bell className="size-3.5" />} label="Reminder" />
            {/* Tooltip: Reminder for the action. Use <key> in title or note to configure using keyboard. */}
          </TimeGroup>

          <ContextGroup>
            <PropertyButton icon={<Folder className="size-3.5" />} label="Project" />
            {/* Tooltip: Project of the action. Use <key> in title or note to configure using keyboard. */}
            <PropertyButton icon={<MapPin className="size-3.5" />} label="Location" />
            {/* Tooltip: Location of the action. Use <key> in title or note to configure using keyboard. */}
            <EditableEnergy value={energy} onChange={setEnergy} />
            {/* Tooltip: Energy of the action. Use <key> in title or note to configure using keyboard. */}
            <PropertyButton icon={<Tags className="size-3.5" />} label="Labels" />
            {/* Tooltip: Labels for the action. Use <key> in title or note to configure using keyboard. */}
            <PropertyButton icon={<Users className="size-3.5" />} label="People" />
            {/* Tooltip: People associated with the action. Use <key> in title or note to configure using keyboard. */}
            <EditableStatus value={status} onChange={setStatus} />
            {/* Tooltip: Status of the action. Use <key> in title or note to configure using keyboard. */}

            <PropertyButton icon={<Layers className="size-3.5" />} label="Type" />
            {/* Tooltip: Type of the action. Use <key> in title or note to configure using keyboard. */}
            <PropertyButton icon={<Share2 className="size-3.5" />} label="Shared" />
            {/* Tooltip: Share to another user. Use <key> in title or note to configure using keyboard. */}
            <PropertyButton icon={<Link2 className="size-3.5" />} label="Link" />
            {/* Tooltip: Link to another action or object. Use <key> in title or note to configure using keyboard. */}
          </ContextGroup>

          <AttachmentsGroup>
            <PropertyButton icon={<Paperclip className="size-3.5" />} label="Attachments" />
            {/* Tooltip: Attachments to the action. Use <key> in title or note to configure using keyboard. */}
          </AttachmentsGroup>

          <AppearanceGroup>
            <PropertyButton icon={<Palette className="size-3.5" />} label="Color" />
            {/* Tooltip: Color of the action. Use <key> in title or note to configure using keyboard. */}
          </AppearanceGroup>
        </div>
        {/* Footer */}
        <FooterGroup>
          <PropertyButton icon={<ArrowDownUp className="size-3.5" />} label="Order" />
          {/* Tooltip: Order of the action. Use <key> in title or note to configure using keyboard. */}

          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <div className="text-xs text-muted-foreground/60 hidden md:block">
              Draft saved automatically
            </div>
            <div className="flex items-center gap-2">
              <EditableIntention value={intention} onChange={setIntention} />
              {/* Tooltip: Intention of the action. Use <key> in title or note to configure using keyboard. */}
              <EditableImportant value={important} onChange={setImportant} />
              {/* Tooltip: Important of the action. Use <key> in title or note to configure using keyboard. */}

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
        </FooterGroup>
      </form>
    );
  }
);

ActionInput.displayName = "ActionInput";
