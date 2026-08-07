import * as React from "react";
import { Button } from "@kreozalabs/kei-ui";
import { Loader2 } from "lucide-react";
import { SettingRow, type SettingRowProps } from "./SettingRow";

export interface SettingButtonProps extends Pick<
  SettingRowProps,
  "label" | "description" | "icon" | "layout" | "className" | "controlClassName"
> {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  children: React.ReactNode;
  id?: string;
}

export function SettingButton({
  label,
  description,
  icon,
  layout = "row",
  className,
  controlClassName,
  onClick,
  disabled = false,
  loading = false,
  buttonVariant = "outline",
  children,
  id,
}: SettingButtonProps) {
  return (
    <SettingRow
      label={label}
      description={description}
      icon={icon}
      layout={layout}
      className={className}
      controlClassName={controlClassName}
    >
      <Button
        id={id}
        onClick={onClick}
        disabled={disabled || loading}
        variant={buttonVariant}
        size="sm"
        className="border-border/60 bg-background hover:bg-muted/80 text-foreground gap-1.5 rounded-xl px-3 text-sm font-semibold shadow-2xs transition-all active:scale-95"
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        {children}
      </Button>
    </SettingRow>
  );
}
