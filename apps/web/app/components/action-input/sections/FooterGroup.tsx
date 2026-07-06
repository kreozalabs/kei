import React from "react";

export function FooterGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/10 mt-2 flex items-center justify-between border-t pt-2">
      {children}
    </div>
  );
}
