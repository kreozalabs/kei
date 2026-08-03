import { useSettings } from "@/providers/SettingsContext";
import { useSubtleOnIdle } from "@/hooks/useSubtleOnIdle";
import { cn } from "@kreozalabs/kei-ui";

interface IdleFadeWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function IdleFadeWrapper({ children, className }: IdleFadeWrapperProps) {
  const { settings } = useSettings();
  const isSubtleMode = (settings.interface_behavior ?? "subtle_on_idle") === "subtle_on_idle";
  const { isSubtle, show, hide } = useSubtleOnIdle({
    initialDelay: 3000,
    idleDelay: 2000,
    disableOnMobile: true,
    disabled: !isSubtleMode,
  });

  return (
    <div
      className={cn(
        "flex w-full cursor-default items-center gap-4 transition-[opacity,transform] duration-1000 ease-in-out",
        isSubtle ? "translate-y-0.5 opacity-20" : "opacity-100",
        className
      )}
      onMouseEnter={show}
      onMouseMove={show}
      onMouseLeave={hide}
    >
      {children}
    </div>
  );
}
