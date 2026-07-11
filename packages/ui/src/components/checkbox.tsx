import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@kreozalabs/kei-ui/lib/utils";

export interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onCheckedChange, disabled, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(
      checked !== undefined ? checked : defaultChecked || false
    );

    React.useEffect(() => {
      if (checked !== undefined) {
        setInternalChecked(checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const isChecked = e.target.checked;
      if (checked === undefined) {
        setInternalChecked(isChecked);
      }
      onCheckedChange?.(isChecked);
    };

    return (
      <label
        className={cn(
          "relative flex shrink-0 items-center justify-center select-none",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          "group"
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={internalChecked}
          onChange={handleChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "flex size-4.5 items-center justify-center rounded-md border shadow-sm transition-all duration-200",
            "border-input bg-transparent",
            "group-hover:border-primary/50 group-hover:bg-primary/5",
            "peer-focus-visible:ring-ring peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
            "active:scale-95",
            internalChecked &&
              "bg-primary border-primary text-primary-foreground group-hover:bg-primary/90 group-hover:border-primary",
            className
          )}
        >
          <Check
            className={cn(
              "size-3 scale-0 stroke-[3px] opacity-0 transition-all duration-200",
              internalChecked && "animate-in zoom-in-50 scale-100 opacity-100"
            )}
          />
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
