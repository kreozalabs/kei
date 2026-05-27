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
    const isCompleted = action.status === "completed";
    const nextStatus = isCompleted ? "active" : "completed";

    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
    queryClient.setQueriesData<Action[]>(
      { queryKey: ["actions"] },
      (oldData) => {
        if (!oldData) return [];
        return oldData.map((a) =>
          a.id === action.id ? { ...a, status: nextStatus } : a
        );
      }
    );

    try {
      if (isCompleted) {
        await activateAction(action.id);
      } else {
        await completeAction(action.id);
      }
      queryClient.invalidateQueries({ queryKey: ["actions"] });

      if (settings.enable_undo_toast) {
        const { toast } = await import("sonner");
        toast.success(
          isCompleted ? `"${action.title}" reactivated` : `"${action.title}" completed`,
          {
            action: {
              label: "Undo",
              onClick: async () => {
                const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
                previousQueries.forEach(([queryKey, data]) => {
                  queryClient.setQueryData(queryKey, data);
                });
                try {
                  if (isCompleted) {
                    await completeAction(action.id);
                  } else {
                    await activateAction(action.id);
                  }
                  queryClient.invalidateQueries({ queryKey: ["actions"] });
                  toast.success("Reverted status change");
                } catch (err) {
                  console.error(err);
                  revertedQueries.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                  });
                }
              },
            },
          }
        );
      }
    } catch (err) {
      console.error(err);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    }
  };

  const handleAbandon = async (action: Action) => {
    const { abandonAction, activateAction } = await import("@/db/actions");
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
    queryClient.setQueriesData<Action[]>(
      { queryKey: ["actions"] },
      (oldData) => {
        if (!oldData) return [];
        return oldData.map((a) =>
          a.id === action.id ? { ...a, status: "abandoned" } : a
        );
      }
    );

    try {
      await abandonAction(action.id);
      queryClient.invalidateQueries({ queryKey: ["actions"] });

      if (settings.enable_undo_toast) {
        const { toast } = await import("sonner");
        toast.success(`"${action.title}" abandoned`, {
          action: {
            label: "Undo",
            onClick: async () => {
              const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
              previousQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              try {
                await activateAction(action.id);
                queryClient.invalidateQueries({ queryKey: ["actions"] });
                toast.success("Action reactivated");
              } catch (err) {
                console.error(err);
                revertedQueries.forEach(([queryKey, data]) => {
                  queryClient.setQueryData(queryKey, data);
                });
              }
            },
          },
        });
      }
    } catch (err) {
      console.error(err);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    }
  };

  const handleReactivate = async (action: Action) => {
    const { activateAction, abandonAction } = await import("@/db/actions");
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
    queryClient.setQueriesData<Action[]>(
      { queryKey: ["actions"] },
      (oldData) => {
        if (!oldData) return [];
        return oldData.map((a) =>
          a.id === action.id ? { ...a, status: "active" } : a
        );
      }
    );

    try {
      await activateAction(action.id);
      queryClient.invalidateQueries({ queryKey: ["actions"] });

      if (settings.enable_undo_toast) {
        const { toast } = await import("sonner");
        toast.success(`"${action.title}" reactivated`, {
          action: {
            label: "Undo",
            onClick: async () => {
              const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
              previousQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              try {
                await abandonAction(action.id);
                queryClient.invalidateQueries({ queryKey: ["actions"] });
                toast.success("Action abandoned");
              } catch (err) {
                console.error(err);
                revertedQueries.forEach(([queryKey, data]) => {
                  queryClient.setQueryData(queryKey, data);
                });
              }
            },
          },
        });
      }
    } catch (err) {
      console.error(err);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    }
  };

  const handleDeletePermanently = async (action: Action) => {
    const { deleteActionPermanently, restoreAction } = await import("@/db/actions");
    const previousQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
    queryClient.setQueriesData<Action[]>(
      { queryKey: ["actions"] },
      (oldData) => {
        if (!oldData) return [];
        return oldData.filter((a) => a.id !== action.id);
      }
    );

    try {
      await deleteActionPermanently(action.id);
      queryClient.invalidateQueries({ queryKey: ["actions"] });

      if (settings.enable_undo_toast) {
        const { toast } = await import("sonner");
        toast.success(`"${action.title}" deleted permanently`, {
          action: {
            label: "Undo",
            onClick: async () => {
              const revertedQueries = queryClient.getQueriesData<Action[]>({ queryKey: ["actions"] });
              previousQueries.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
              });
              try {
                await restoreAction(action);
                queryClient.invalidateQueries({ queryKey: ["actions"] });
                toast.success("Action restored");
              } catch (err) {
                console.error(err);
                revertedQueries.forEach(([queryKey, data]) => {
                  queryClient.setQueryData(queryKey, data);
                });
              }
            },
          },
        });
      }
    } catch (err) {
      console.error(err);
      previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    }
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
