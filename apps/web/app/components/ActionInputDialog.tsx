import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@kreozalabs/ui";
import { useQueryClient } from "@tanstack/react-query";
import type { Action } from "../types/actions";
import { ActionInput, type ActionInputHandle } from "./action-input";
import { ActionDetailView } from "./ActionDetailView";
import { useSettings } from "@/providers/SettingsContext";

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
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const actionInputRef = useRef<ActionInputHandle>(null);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    if (open) {
      if (!actionToEdit) {
        setIsEditing(true);
      } else {
        setIsEditing(settings.direct_edit_mode);
      }
    }
  }, [open, actionToEdit, settings.direct_edit_mode]);

  const handleCloseAttempt = (e: Event) => {
    if (isEditing) {
      e.preventDefault();
      actionInputRef.current?.handleCancelAttempt();
    }
  };

  const handleComplete = async (action: Action) => {
    const { activateAction, completeAction } = await import("@/db/actions");
    if (action.status === "completed") {
      await activateAction(action.id);
    } else {
      await completeAction(action.id);
    }
    queryClient.invalidateQueries({ queryKey: ["actions"] });
  };

  const handleAbandon = async (action: Action) => {
    const { abandonAction } = await import("@/db/actions");
    await abandonAction(action.id);
    queryClient.invalidateQueries({ queryKey: ["actions"] });
  };

  const handleReactivate = async (action: Action) => {
    const { activateAction } = await import("@/db/actions");
    await activateAction(action.id);
    queryClient.invalidateQueries({ queryKey: ["actions"] });
  };

  const handleDeletePermanently = async (action: Action) => {
    const { deleteActionPermanently } = await import("@/db/actions");
    await deleteActionPermanently(action.id);
    queryClient.invalidateQueries({ queryKey: ["actions"] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className="w-[calc(100%-1.5rem)] sm:max-w-xl p-0 bg-background/60 backdrop-blur-3xl border border-border/20 shadow-2xl ring-0 gap-0 rounded-4xl sm:rounded-3xl animate-in fade-in zoom-in-95 duration-200"
        showCloseButton={!isEditing}
        onPointerDownOutside={handleCloseAttempt}
        onEscapeKeyDown={handleCloseAttempt}
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground/90">
            {isEditing ? (actionToEdit ? "Update Action" : "Add New Action") : "Action Details"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Capture, refine, or review your high-impact move.
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="px-2 pb-2">
            <ActionInput
              key={actionToEdit?.id || "new"}
              ref={actionInputRef}
              variant="dialog"
              onSuccess={() => onOpenChange(false)}
              onCancel={() => {
                if (actionToEdit && !settings.direct_edit_mode) {
                  setIsEditing(false);
                } else {
                  onOpenChange(false);
                }
              }}
              initialDate={initialDate || selectedDate}
              actionToEdit={actionToEdit}
            />
          </div>
        ) : (
          actionToEdit && (
            <ActionDetailView
              action={actionToEdit}
              onEdit={() => setIsEditing(true)}
              onClose={() => onOpenChange(false)}
              onComplete={handleComplete}
              onAbandon={handleAbandon}
              onReactivate={handleReactivate}
              onDeletePermanently={handleDeletePermanently}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
