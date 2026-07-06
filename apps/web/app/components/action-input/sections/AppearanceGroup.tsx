import React from "react";

export function AppearanceGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-muted-foreground px-1 text-xs font-medium tracking-wider uppercase">
        Appearance
      </h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
