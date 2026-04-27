import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@kreozalabs/ui";
import type { Action } from "../types/events";
import { ActionInput, type ActionInputHandle } from "./ActionInput";

interface ActionInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  initialDate?: string | null;
  selectedDate?: string;
  actionToEdit?: Action;
}

export function ActionInputDialog({
  open,
  onOpenChange,
  trigger,
  initialDate,
  selectedDate,
  actionToEdit,
}: ActionInputDialogProps) {
  const actionInputRef = useRef<ActionInputHandle>(null);

  const handleCloseAttempt = (e: Event) => {
    e.preventDefault();
    actionInputRef.current?.handleCancelAttempt();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className="w-[calc(100%-3rem)] sm:max-w-xl p-0 bg-background/60 backdrop-blur-3xl border border-border/20 shadow-2xl ring-0 gap-0 rounded-[2rem] sm:rounded-3xl"
        showCloseButton={false}
        onPointerDownOutside={handleCloseAttempt}
        onEscapeKeyDown={handleCloseAttempt}
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            {actionToEdit ? "Update Action" : "Add New Action"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Capture or refine your high-impact move.
          </DialogDescription>
        </DialogHeader>
        <div className="px-2 pb-2">
          <ActionInput
            key={actionToEdit?.id || "new"}
            ref={actionInputRef}
            variant="dialog"
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
            initialDate={initialDate || selectedDate}
            actionToEdit={actionToEdit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
