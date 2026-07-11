import { cn, Textarea } from "@kreozalabs/kei-ui";
import { useEditableField } from "./useEditableField";

interface EditableNoteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function EditableNote({ value, onChange, className }: EditableNoteProps) {
  const {
    isEditing,
    setIsEditing,
    currentValue,
    setCurrentValue,
    ref: inputRef,
    handleBlur,
    handleEscape,
  } = useEditableField(value, onChange);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleEscape();
    }
  };

  if (isEditing) {
    return (
      <Textarea
        ref={inputRef}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-muted/20 border-border/20 focus-visible:ring-primary/20 text-foreground min-h-[100px] w-full resize-y rounded-2xl p-4 text-sm leading-relaxed focus-visible:ring-1",
          className
        )}
        placeholder="Add notes or subtasks..."
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "hover:bg-muted/40 hover:border-border/10 cursor-text rounded-2xl border border-transparent transition-colors",
        className
      )}
    >
      {value ? (
        <p className="text-muted-foreground/80 bg-muted/20 border-border/5 pointer-events-none rounded-2xl border p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {value}
        </p>
      ) : (
        <p className="text-muted-foreground/45 mt-1 px-1 py-2 text-xs italic">
          No notes or subtasks attached to this action. Click to add.
        </p>
      )}
    </div>
  );
}
