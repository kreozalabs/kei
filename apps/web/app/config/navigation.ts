import {
  InboxIcon,
  CalendarDaysIcon,
  CalendarIcon,
  PersonStandingIcon,
  HandshakeIcon,
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
        mobileVisible: false,
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
        id: "upcoming",
        label: "Upcoming",
        icon: CalendarIcon,
        href: "/app/upcoming",
        mobileVisible: true,
      },
    ],
  },
  {
    label: "Reflection",
    items: [
      {
        id: "me",
        label: "Me",
        icon: PersonStandingIcon,
        href: "/app/me",
        mobileVisible: true,
      },
      {
        id: "promises",
        label: "Promises",
        icon: HandshakeIcon,
        href: "/app/promises",
        mobileVisible: false,
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
