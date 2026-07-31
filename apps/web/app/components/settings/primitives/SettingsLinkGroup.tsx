import * as React from "react";
import { Card, cn } from "@kreozalabs/kei-ui";
import { SettingsLinkRow, type SettingsLinkRowProps } from "./SettingsLinkRow";

export interface SettingsLinkGroupProps {
  title?: React.ReactNode;
  items: SettingsLinkRowProps[];
  className?: string;
  children?: React.ReactNode;
}

export function SettingsLinkGroup({ title, items, className, children }: SettingsLinkGroupProps) {
  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-muted-foreground px-1 text-sm font-semibold tracking-wider uppercase">
          {title}
        </h3>
      )}

      <Card
        className={cn(
          "border-border/60 divide-border/30 bg-card/80 gap-0 divide-y overflow-hidden rounded-xl p-0 shadow-xs backdrop-blur-xs",
          className
        )}
      >
        {items.map((item, index) => (
          <SettingsLinkRow
            key={(
              item.to ||
              item.href ||
              (typeof item.title === "string" ? item.title : index)
            ).toString()}
            {...item}
          />
        ))}
        {children}
      </Card>
    </div>
  );
}
