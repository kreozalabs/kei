import { cn } from "@kreozalabs/kei-ui";
import { AppHeader } from "./AppHeader";

interface AppPageProps {
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function AppPage({
  title,
  subtitle,
  header,
  scrollable = false,
  padded = false,
  className,
  children,
}: AppPageProps) {
  return (
    <div className="bg-muted flex h-full w-full flex-col overflow-hidden">
      {/* Header Container */}
      {header !== undefined ? header : <AppHeader title={title} subtitle={subtitle} />}

      {/* Nested Content Card */}
      <div
        className={cn(
          "flex-1 overflow-hidden rounded-4xl",
          scrollable && "no-scrollbar overflow-y-auto",
          padded && "p-6 md:p-8",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
