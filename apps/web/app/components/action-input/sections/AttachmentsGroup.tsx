import React from "react";

export function AttachmentsGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
        Attachments
      </h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
