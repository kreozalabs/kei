import React, { createContext, use, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { DragResizeWrapper } from "@/components/DragResizeWrapper";
import { ActionInput } from "@/components/action-input";

interface ActionInputModalContextType {
  isActionInputOpen: boolean;
  openActionInput: (options?: { initialDate?: string }) => void;
  closeActionInput: () => void;
}

const ActionInputModalContext = createContext<ActionInputModalContextType | undefined>(undefined);

export function ActionInputModalProvider({ children }: { children: React.ReactNode }) {
  const [isActionInputOpen, setIsActionInputOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<string | undefined>(undefined);

  const openActionInput = useCallback((options?: { initialDate?: string }) => {
    setInitialDate(options?.initialDate);
    setIsActionInputOpen(true);
  }, []);

  const closeActionInput = useCallback(() => {
    setIsActionInputOpen(false);
    setInitialDate(undefined);
  }, []);

  return (
    <ActionInputModalContext
      value={{
        isActionInputOpen,
        openActionInput,
        closeActionInput,
      }}
    >
      {children}
      <AnimatePresence>
        {isActionInputOpen && (
          <DragResizeWrapper onClose={closeActionInput}>
            <ActionInput
              initialDate={initialDate}
              onSuccess={closeActionInput}
              onCancel={closeActionInput}
            />
          </DragResizeWrapper>
        )}
      </AnimatePresence>
    </ActionInputModalContext>
  );
}

export function useActionInputModal() {
  const context = use(ActionInputModalContext);
  if (context === undefined) {
    throw new Error("useActionInputModal must be used within an ActionInputModalProvider");
  }
  return context;
}
