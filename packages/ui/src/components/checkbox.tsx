import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@kreozalabs/ui/lib/utils";

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
          "relative flex items-center justify-center shrink-0 select-none",
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
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "size-4.5 rounded-md border transition-all duration-200 flex items-center justify-center shadow-sm",
            "border-input bg-transparent",
            "group-hover:border-primary/50 group-hover:bg-primary/5",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "active:scale-95",
            internalChecked &&
              "bg-primary border-primary text-primary-foreground group-hover:bg-primary/90 group-hover:border-primary",
            className
          )}
        >
          <Check
            className={cn(
              "size-3 stroke-[3px] transition-all scale-0 opacity-0 duration-200",
              internalChecked && "scale-100 opacity-100 animate-in zoom-in-50"
            )}
          />
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
