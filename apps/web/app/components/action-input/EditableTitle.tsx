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
          "focus-visible:ring-primary/20 text-foreground h-auto w-full rounded-md border-none bg-transparent px-1 py-0 text-xl leading-snug font-bold tracking-tight shadow-none focus-visible:ring-1",
          className
        )}
      />
    );
  }

  return (
    <h3
      onClick={() => setIsEditing(true)}
      className={cn(
        "hover:bg-muted/50 -ml-1 cursor-text rounded-md px-1 py-0.5 wrap-break-word transition-colors",
        className
      )}
    >
      {value || placeholder}
    </h3>
  );
}
