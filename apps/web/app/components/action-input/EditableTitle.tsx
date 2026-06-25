import { cn, Input } from "@kreozalabs/ui";
import { useEditableField } from "./useEditableField";

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  defaultEditing?: boolean;
  placeholder?: string;
}

export function EditableTitle({
  value,
  onChange,
  className,
  defaultEditing = false,
  placeholder = "Untitled Action",
}: EditableTitleProps) {
  const {
    isEditing,
    setIsEditing,
    currentValue,
    setCurrentValue,
    ref: inputRef,
    handleBlur,
    handleEscape,
  } = useEditableField(value, onChange, { defaultEditing });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!defaultEditing) {
        inputRef.current?.blur();
      } else {
        // In creation view, Enter might submit the whole form, handled by the parent
        onChange(currentValue.trim());
      }
    } else if (e.key === "Escape") {
      handleEscape();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={currentValue}
        placeholder={placeholder}
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
      {value || placeholder}
    </h3>
  );
}
