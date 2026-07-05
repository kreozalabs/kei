import { CalendarDaysIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  mobileVisible?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Core",
    items: [
      {
        id: "days",
        label: "Days",
        icon: CalendarDaysIcon,
        href: "/app",
        mobileVisible: true,
      },
    ],
  },
];

export const navItems: NavItem[] = [...navGroups.flatMap((group) => group.items)];
