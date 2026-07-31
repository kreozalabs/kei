import { SettingRow, type SettingRowProps } from "./SettingRow";

export interface SettingStatusBadgeProps extends Pick<
  SettingRowProps,
  "label" | "description" | "icon" | "layout" | "className" | "controlClassName"
> {
  statusLabel: string;
  status?: "success" | "warning" | "error";
}

export function SettingStatusBadge({
  label,
  description,
  icon,
  layout = "row",
  className,
  controlClassName,
  statusLabel,
  status = "success",
}: SettingStatusBadgeProps) {
  const isSuccess = status === "success";
  const isWarning = status === "warning";

  const colorClasses = isSuccess
    ? "border-success/30 bg-success/10 text-success"
    : isWarning
      ? "border-warning/30 bg-warning/10 text-warning"
      : "border-destructive/30 bg-destructive/10 text-destructive";

  const dotPingClasses = isSuccess ? "bg-success" : isWarning ? "bg-warning" : "bg-destructive";

  const dotBgClasses = isSuccess ? "bg-success" : isWarning ? "bg-warning" : "bg-destructive";

  return (
    <SettingRow
      label={label}
      description={description}
      icon={icon}
      layout={layout}
      className={className}
      controlClassName={controlClassName}
    >
      <div
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium ${colorClasses}`}
      >
        <span className="relative flex size-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotPingClasses}`}
          />
          <span className={`relative inline-flex size-2 rounded-full ${dotBgClasses}`} />
        </span>
        <span>{statusLabel}</span>
      </div>
    </SettingRow>
  );
}
