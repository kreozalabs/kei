import React from "react";

export function CoreGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/10 border-border/20 focus-within:border-border/40 relative flex flex-col gap-2 rounded-2xl border p-4 transition-all">
      {children}
    </div>
  );
}
