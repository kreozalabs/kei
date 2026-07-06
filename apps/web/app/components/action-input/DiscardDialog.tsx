import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from "@kreozalabs/ui";

interface DiscardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DiscardDialog = ({ open, onOpenChange, onConfirm }: DiscardDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-popover border-border/50 max-w-100 rounded-xl border p-6 shadow-2xl"
      >
        <DialogHeader className="gap-2">
          <DialogTitle className="text-foreground text-[17px] font-bold tracking-tight">
            Discard unsaved changes?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-[14px] leading-relaxed font-medium">
            Your unsaved changes will be discarded.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mx-0 mt-6 mb-0 flex flex-row justify-end gap-3 border-none bg-transparent p-0">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-lg border-none px-4 font-bold transition-all active:scale-95"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-9 rounded-lg border-none px-4 font-bold transition-all active:scale-95"
          >
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
