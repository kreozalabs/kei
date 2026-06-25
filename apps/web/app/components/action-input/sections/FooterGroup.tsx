import React from "react";

export function FooterGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/10">
      {children}
    </div>
  );
}
