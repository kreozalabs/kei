import { useState, useRef, useEffect } from "react";

interface UseDiscardGuardProps {
  hasChanges: boolean;
  onDiscard?: () => void;
}

/**
 * A hook to protect against accidental data loss when discarding changes or reloading the page.
 *
 * @param hasChanges - Boolean indicating if there are unsaved changes.
 * @param onDiscard - Callback when the user confirms they want to discard changes.
 */
export function useDiscardGuard({ hasChanges, onDiscard }: UseDiscardGuardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Use a ref for changes to ensure the beforeunload listener always has the latest value
  // without needing to re-attach the event listener on every change.
  const hasChangesRef = useRef(hasChanges);

  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        e.preventDefault();
        e.returnValue = ""; // Standard for most browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleCancelAttempt = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onDiscard?.();
    }
  };

  const handleConfirmDiscard = () => {
    setShowConfirmDialog(false);
    onDiscard?.();
  };

  return {
    showConfirmDialog,
    setShowConfirmDialog,
    handleCancelAttempt,
    handleConfirmDiscard,
  };
}
