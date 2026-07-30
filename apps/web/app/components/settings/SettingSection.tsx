import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from "@kreozalabs/kei-ui";

export interface SettingSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SettingSection({
  title,
  description,
  icon,
  action,
  children,
  className,
  contentClassName,
}: SettingSectionProps) {
  return (
    <Card
      className={cn(
        "border-border/60 bg-card/80 hover:border-border shadow-xs backdrop-blur-xs transition-all",
        className
      )}
    >
      <CardHeader className="border-border/40 border-b pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                {icon}
              </div>
            )}
            <div className="space-y-0.5">
              <CardTitle className="text-foreground text-base font-semibold">{title}</CardTitle>
              {description && (
                <CardDescription className="text-muted-foreground text-xs">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className={cn("divide-border/30 divide-y p-1.5 sm:p-2", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
