import React from "react";

export function DetailsGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 mt-2 pt-3 border-t border-border/10">{children}</div>;
}
