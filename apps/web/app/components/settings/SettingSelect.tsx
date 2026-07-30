import * as React from "react";
import {
  Label,
  Select,
  SelectLabel,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@kreozalabs/kei-ui";

interface SettingSelectProps<T extends string> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  placeholder?: string;
  groupLabel?: string;
  className?: string;
}

export function SettingSelect<T extends string>({
  label,
  description,
  icon,
  value,
  onValueChange,
  options,
  placeholder,
  groupLabel,
  className,
}: SettingSelectProps<T>) {
  return (
    <div
      className={cn(
        "hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-lg px-3 py-3.5 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>}
        <div className="space-y-1">
          <Label className="text-foreground text-sm leading-none font-medium">{label}</Label>
          {description && (
            <p className="text-muted-foreground text-xs leading-normal">{description}</p>
          )}
        </div>
      </div>
      <div className="w-full shrink-0 sm:w-52">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="bg-background/80 border-border/60 hover:bg-background h-9 w-full shadow-xs transition-all">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {groupLabel && (
                <SelectLabel className="text-muted-foreground text-xs font-semibold">
                  {groupLabel}
                </SelectLabel>
              )}
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs sm:text-sm">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
