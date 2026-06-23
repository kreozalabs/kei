import { useState, useRef, useEffect } from "react";
import { cn, Textarea } from "@kreozalabs/ui";

interface EditableNoteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function EditableNote({ value, onChange, className }: EditableNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setCurrentValue(value);
      setIsEditing(false);
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
          "w-full bg-muted/20 border-border/20 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-2xl p-4 min-h-[100px] text-sm text-foreground leading-relaxed resize-y",
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
        "cursor-text hover:bg-muted/40 transition-colors border border-transparent hover:border-border/10 rounded-2xl",
        className
      )}
    >
      {value ? (
        <p className="text-sm text-muted-foreground/80 leading-relaxed bg-muted/20 border border-border/5 p-4 rounded-2xl whitespace-pre-wrap pointer-events-none">
          {value}
        </p>
      ) : (
        <p className="text-xs italic text-muted-foreground/45 mt-1 px-1 py-2">
          No notes or subtasks attached to this action. Click to add.
        </p>
      )}
    </div>
  );
}
