import * as React from "react";
import { Link } from "react-router";
import { ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@kreozalabs/kei-ui";
import { SettingRow } from "./SettingRow";

export interface SettingsLinkRowProps {
  title: string;
  description?: string;
  to?: string;
  href?: string;
  icon?: React.ReactNode;
  value?: React.ReactNode;
  external?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function SettingsLinkRow({
  title,
  description,
  to,
  href,
  icon,
  value,
  external,
  disabled,
  className,
  onClick,
}: SettingsLinkRowProps) {
  const trailingControl = (
    <div className="text-muted-foreground group-hover:text-foreground flex items-center justify-end gap-2 transition-colors">
      {value && <span className="text-xs font-medium">{value}</span>}
      {external ? (
        <ExternalLink className="size-4 shrink-0" />
      ) : (
        <ChevronRight className="size-4 shrink-0" />
      )}
    </div>
  );

  const content = (
    <SettingRow
      label={title}
      description={description}
      icon={icon}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "group hover:bg-accent/40 active:bg-accent/60 transition-colors",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      controlClassName="w-auto shrink-0 sm:w-auto flex justify-end"
    >
      {trailingControl}
    </SettingRow>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className="block text-left no-underline">
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block text-left no-underline">
        {content}
      </a>
    );
  }

  return content;
}
