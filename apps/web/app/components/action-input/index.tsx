import type { Action } from "@kreozalabs/core";
import { forwardRef, useEffect, useRef, useState } from "react";
import { DragResizeWrapper } from "../DragResizeWrapper";

export interface ActionInputProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDate?: string;
  className?: string;
  variant?: "inline" | "dialog";
  actionToEdit?: Action;
  mode?: "floating" | "docked" | "drawer";
  onModeChange?: (mode: "floating" | "docked" | "drawer") => void;
}

export interface ActionInputHandle {
  handleCancelAttempt: () => void;
}

export const ActionInput = forwardRef<ActionInputHandle, ActionInputProps>(
  (
    {
      onSuccess,
      onCancel,
      initialDate,
      className,
      variant = "inline",
      actionToEdit,
      mode,
      onModeChange,
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
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
    };

    return (
      <DragResizeWrapper mode={mode} onModeChange={onModeChange} onClose={onCancel}>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col"></form>
      </DragResizeWrapper>
    );
  }
);

ActionInput.displayName = "ActionInput";
