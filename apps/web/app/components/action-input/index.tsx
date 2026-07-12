import type { Action } from "@kreozalabs/kei-core";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Button } from "@kreozalabs/kei-ui";
import { EditableIntention, type IntentionType } from "./EditableIntention";
import { EditableImportant } from "./EditableImportant";
import { PropertyButton } from "./PropertyButton";
import {
  CoreGroup,
  TimeGroup,
  ContextGroup,
  DetailsGroup,
  AppearanceGroup,
  FooterGroup,
} from "./sections";
import { SendHorizontal, Palette, Paperclip, ArrowDownUp } from "lucide-react";

interface ActionInputProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDate?: string;
  className?: string;
  variant?: "inline" | "dialog";
  actionToEdit?: Action;
}

interface ActionInputHandle {
  handleCancelAttempt: () => void;
}

export const ActionInput = forwardRef<ActionInputHandle, ActionInputProps>(
  ({ onSuccess, onCancel }) => {
    const [isLoading, setIsLoading] = useState(false);

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

    const [intention, setIntention] = useState<IntentionType>("want");
    const [important, setImportant] = useState(false);
    // TODO: Allow user to configure what is shown by default. For that, we should be able to loop over some settings instead of hard-coding what is shown.
    // TODO: Allow user to keybindings that will activate note and title from quickbar, such as /t <tab> title<key> <tab> note<key>
    // TODO: Define initial <keys> for fields
    // TODO: Allow user to set his own <keys>

    return (
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="bg-background border-border/40 flex flex-col gap-3 border p-4 shadow-xs"
      >
        <CoreGroup>
          {/* FIXME: These should work seamlessly and without problems. UX should be great on any device, whether touch, mouse or keyboard or virtual keyboard, or even voice command. It should be like rich editor. */}
          <div className="visible:block hidden">
            <DetailsGroup>
              {/* TODO: Implement*/}
              <PropertyButton icon={<Paperclip className="size-3.5" />} label="Attachments" />
              {/* Tooltip: Attachments to the action. Use <key> in title or note to configure using keyboard. */}
            </DetailsGroup>
          </div>
        </CoreGroup>

        {/* FIXME: Activate when done with implementation */}
        <div className="visible:none hidden">
          {/* Active Properties (Only shows what has been explicitly set or changed from defaults in user settings) */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {/* TODO: Implement user-configured Quick Bar here */}
            {/* TODO: Make set values dynamic, so any included field is show hier and we should not need to write comps here. They just appear if user set value for component or subcomponent. */}
          </div>
          <div className="border-border/40 mt-2 flex flex-col gap-6 border-t pt-3">
            {/* TODO: Each group should be like dropdown or dialog or something. It should just appear and extend. Disappear when user chooses something else (NOT SURE ABOUT IT)??? */}
            <TimeGroup />

            <ContextGroup />
            <div className="visible:block hidden">
              {/* TODO: Implement*/}
              <AppearanceGroup>
                <PropertyButton icon={<Palette className="size-3.5" />} label="Color" />
                {/* Tooltip: Color of the action. Use <key> in title or note to configure using keyboard. */}
              </AppearanceGroup>
            </div>
          </div>
        </div>
        {/* Footer */}
        <FooterGroup>
          <PropertyButton icon={<ArrowDownUp className="size-3.5" />} label="Order" />
          {/* Tooltip: Order of the action. Use <key> in title or note to configure using keyboard. */}

          <div className="mt-2 flex items-center gap-3 sm:mt-0">
            <div className="text-muted-foreground/60 hidden text-xs md:block">
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
              <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5 px-4">
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
