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

export const navItems: NavItem[] = [
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
    id: "upcoming",
    label: "Upcoming",
    icon: CalendarIcon,
    href: "/app/upcoming",
    mobileVisible: true,
  },
  {
    id: "me",
    label: "Me",
    icon: PersonStandingIcon,
    href: "/app/me",
    mobileVisible: false,
  },
  {
    id: "promises",
    label: "Promises",
    icon: HandshakeIcon,
    href: "/app/promises",
    mobileVisible: false,
  },
  {
    id: "browse",
    label: "Browse",
    icon: MenuIcon,
    href: "/app/browse",
    mobileVisible: true,
  },
];
