import { Button, cn } from "@kreozalabs/ui";
import { type ReactNode, forwardRef } from "react";

export interface PropertyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label?: string;
  isActive?: boolean;
  value?: ReactNode;
}

export const PropertyButton = forwardRef<HTMLButtonElement, PropertyButtonProps>(
  ({ icon, label, isActive, value, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-2 gap-1.5 rounded-md text-xs font-medium transition-colors border border-transparent shadow-none",
          isActive
            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {label && <span className="truncate max-w-[120px]">{label}</span>}
        {value && <span className="font-semibold text-foreground ml-0.5">{value}</span>}
      </Button>
    );
  }
);

PropertyButton.displayName = "PropertyButton";
