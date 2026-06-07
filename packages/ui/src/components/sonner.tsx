import * as React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:font-sans group-[.toaster]:p-4 group-[.toaster]:gap-3",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium transition-colors",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground group-[.toast]:hover:bg-secondary/90 group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium transition-colors",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground group-[.toast]:rounded-lg transition-colors",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
// eslint-disable-next-line react-refresh/only-export-components
export { toast } from "sonner";
