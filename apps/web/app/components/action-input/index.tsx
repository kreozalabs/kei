import type { Action } from "@kreozalabs/core";
import { forwardRef, useEffect, useRef, useState } from "react";

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
  (
    {
      onSuccess,
      onCancel,
      initialDate,
      className,
      variant = "inline",
      actionToEdit,
    },
    ref
  ) => {
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
    };

    return (
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col p-6 h-full">
         <h2 className="text-xl font-bold mb-4">Create New Action</h2>
         {/* Simple placeholder for the actual form for now */}
         <p className="text-muted-foreground text-sm">Form goes here...</p>
      </form>
    );
  }
);

ActionInput.displayName = "ActionInput";
