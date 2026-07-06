import { Button, cn } from "@kreozalabs/ui";
import { type ReactNode, forwardRef } from "react";

interface PropertyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
          "h-7 gap-1.5 rounded-md border border-transparent px-2 text-xs font-medium shadow-none transition-colors",
          isActive
            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {label && <span className="max-w-[120px] truncate">{label}</span>}
        {value && <span className="text-foreground ml-0.5 font-semibold">{value}</span>}
      </Button>
    );
  }
);

PropertyButton.displayName = "PropertyButton";
