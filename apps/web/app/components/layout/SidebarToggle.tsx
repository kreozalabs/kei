import { SidebarTrigger } from "@kreozalabs/kei-ui";

interface SidebarToggleProps {
  onClick?: () => void;
  className?: string;
}

export function SidebarToggle({ onClick, className }: SidebarToggleProps) {
  return <SidebarTrigger className={className} onClick={onClick} />;
}
