import { forwardRef } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@kreozalabs/kei-ui";
import { useOutletContext } from "react-router";
import type { AppLayoutContext } from "./AppLayout";

export const HeaderNewAction = forwardRef<HTMLButtonElement, { onClick?: () => void }>(
  ({ onClick, ...props }, ref) => {
    const context = useOutletContext<AppLayoutContext | null>();

    const handleClick = onClick || context?.openActionInput;

    return (
      <Button
        ref={ref}
        variant="default"
        size="icon"
        onClick={handleClick}
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30 hidden h-10 w-20 items-center justify-center rounded-xl border-none shadow-lg transition-all active:scale-95 md:flex"
        {...props}
      >
        <PlusIcon className="size-5" />
      </Button>
    );
  }
);

HeaderNewAction.displayName = "HeaderNewAction";
