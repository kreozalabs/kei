import {
  InboxIcon,
  CalendarDaysIcon,
  PersonStandingIcon,
  MenuIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  count?: number;
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
        id: "inbox",
        label: "Inbox",
        icon: InboxIcon,
        href: "/app/inbox",
        count: 5,
        mobileVisible: true,
      },
      {
        id: "today",
        label: "Today",
        icon: CalendarDaysIcon,
        href: "/app",
        count: 6,
        mobileVisible: true,
      },
      {
        id: "me",
        label: "Me",
        icon: PersonStandingIcon,
        href: "/app/me",
        mobileVisible: true,
      },
    ],
  },
];

export const navItems: NavItem[] = [
  ...navGroups.flatMap((group) => group.items),
  {
    id: "browse",
    label: "Browse",
    icon: MenuIcon,
    href: "/app/browse",
    mobileVisible: true,
  },
];
