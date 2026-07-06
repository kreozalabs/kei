import React from "react";

export function DetailsGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/10 mt-2 flex items-center gap-2 border-t pt-3">{children}</div>
  );
}
