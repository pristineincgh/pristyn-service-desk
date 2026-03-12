import {
  FolderClosed,
  History,
  LayoutDashboard,
  Tickets,
  Users,
  UsersRound,
} from "lucide-react";

export const supportNavItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/support",
  },
];

export const supervisorNavItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/supervisor",
  },
];

export const moderatorNavItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/moderator",
  },
  {
    label: "Tickets",
    icon: Tickets,
    href: "/dashboard/moderator/tickets",
  },
  {
    label: "Users",
    icon: Users,
    href: "/dashboard/moderator/users",
  },
  {
    label: "Customers",
    icon: UsersRound,
    href: "/dashboard/moderator/customers",
  },
  {
    label: "Activity",
    icon: History,
    href: "/dashboard/moderator/activity",
  },
  {
    label: "Ticket Categories",
    icon: FolderClosed,
    href: "/dashboard/moderator/ticket-categories",
  },
];
