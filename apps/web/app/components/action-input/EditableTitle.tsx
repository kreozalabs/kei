import { useState, useRef, useEffect } from "react";
import { cn, Input } from "@kreozalabs/ui";

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function EditableTitle({ value, onChange, className }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (currentValue !== value && currentValue.trim() !== "") {
      onChange(currentValue.trim());
    } else {
      setCurrentValue(value); // Revert if empty
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-transparent border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-md px-1 py-0 h-auto text-xl font-bold tracking-tight text-foreground leading-snug",
          className
        )}
      />
    );
  }

  return (
    <h3
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-text hover:bg-muted/50 rounded-md px-1 py-0.5 -ml-1 transition-colors wrap-break-word",
        className
      )}
    >
      {value || "Untitled Action"}
    </h3>
  );
}
