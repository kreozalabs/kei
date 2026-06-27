import React from "react";

export function CoreGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2 relative bg-muted/10 border border-border/20 focus-within:border-border/40 rounded-2xl p-4 transition-all">{children}</div>;
}
