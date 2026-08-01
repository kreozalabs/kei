import { useState, useEffect, useRef } from "react";

interface UseEditableFieldOptions<T> {
  defaultEditing?: boolean;
  onSave?: (value: T) => void;
  trim?: boolean;
}

export function useEditableField<T extends string>(
  value: T,
  onChange: (value: T) => void,
  options: UseEditableFieldOptions<T> = {}
) {
  const { defaultEditing = false, onSave, trim = true } = options;
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [currentValue, setCurrentValue] = useState<T>(value);
  const ref = useRef<any>(null);

  // Sync internal value with outer value prop
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Focus element when entering edit mode
  useEffect(() => {
    if (isEditing) {
      ref.current?.focus();
    }
  }, [isEditing]);

  const save = () => {
    const nextValue = (trim ? currentValue.trim() : currentValue) as T;
    onChange(nextValue);
    onSave?.(nextValue);
  };

  const handleBlur = () => {
    if (!defaultEditing) {
      setIsEditing(false);
    }
    save();
  };

  const handleEscape = () => {
    setCurrentValue(value);
    if (!defaultEditing) {
      setIsEditing(false);
    }
  };

  return {
    isEditing,
    setIsEditing,
    currentValue,
    setCurrentValue,
    ref,
    handleBlur,
    handleEscape,
    save,
  };
}
