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
        className="max-w-100 p-6 bg-popover border border-border/50 shadow-2xl rounded-xl"
      >
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[17px] font-bold tracking-tight text-foreground">
            Discard unsaved changes?
          </DialogTitle>
          <DialogDescription className="text-[14px] text-muted-foreground leading-relaxed font-medium">
            Your unsaved changes will be discarded.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-3 mt-6 bg-transparent border-none p-0 mx-0 mb-0">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg font-bold transition-all active:scale-95 border-none"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="h-9 px-4 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold transition-all active:scale-95 border-none"
          >
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
