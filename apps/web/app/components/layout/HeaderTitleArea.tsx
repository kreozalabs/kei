import { cn } from "@kreozalabs/kei-ui";

interface HeaderTitleAreaProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function HeaderTitleArea({ title, subtitle, icon, className }: HeaderTitleAreaProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {icon && (
        <div className="text-primary/80 flex shrink-0 items-center justify-center">{icon}</div>
      )}
      <div className="flex min-w-0 flex-col justify-center">
        <h1 className="flex items-center gap-2 text-base font-bold tracking-tight md:text-lg">
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="text-muted-foreground/60 mt-0.5 truncate text-sm font-normal">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
