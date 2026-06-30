import type { Action } from "@kreozalabs/core";
import { forwardRef, useEffect, useRef, useState } from "react";
import { RichEditor, TitleEnforcementPlugin } from "@kreozalabs/ui";
import { Button } from "@kreozalabs/ui";
import { $getRoot, type EditorState } from "lexical";
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

    const handleEditorChange = (editorState: EditorState) => {
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        if (children.length > 0) {
          setTitle(children[0].getTextContent());
        }
        if (children.length > 1) {
          const noteText = children
            .slice(1)
            .map((c) => c.getTextContent())
            .join("\n");
          setNote(noteText);
        } else {
          setNote("");
        }
      });
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
        className="flex flex-col gap-3 p-4 bg-background border border-border/40 shadow-xs"
      >
        <CoreGroup>
          {/* FIXME: These should work seamlessly and without problems. UX should be great on any device, whether touch, mouse or keyboard or virtual keyboard, or even voice command. It should be like rich editor. */}
          <RichEditor onChange={handleEditorChange} plugins={<TitleEnforcementPlugin />} />
          <div className="hidden visible:block">
            <DetailsGroup>
              {/* TODO: Implement*/}
              <PropertyButton icon={<Paperclip className="size-3.5" />} label="Attachments" />
              {/* Tooltip: Attachments to the action. Use <key> in title or note to configure using keyboard. */}
            </DetailsGroup>
          </div>
        </CoreGroup>

        {/* FIXME: Activate when done with implementation */}
        <div className="hidden visible:none">
          {/* Active Properties (Only shows what has been explicitly set or changed from defaults in user settings) */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {/* TODO: Implement user-configured Quick Bar here */}
            {/* TODO: Make set values dynamic, so any included field is show hier and we should not need to write comps here. They just appear if user set value for component or subcomponent. */}
          </div>
          <div className="flex flex-col gap-6 mt-2 pt-3 border-t border-border/40">
            {/* TODO: Each group should be like dropdown or dialog or something. It should just appear and extend. Disappear when user chooses something else (NOT SURE ABOUT IT)??? */}
            <TimeGroup />

            <ContextGroup />
            <div className="hidden visible:block">
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
