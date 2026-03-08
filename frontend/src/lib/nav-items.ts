import { LayoutDashboard, Tickets, Users } from 'lucide-react';

export const supportNavItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard/support',
  },
];

export const supervisorNavItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard/supervisor',
  },
];

export const moderatorNavItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard/moderator',
  },
  {
    label: 'Tickets',
    icon: Tickets,
    href: '/dashboard/moderator/tickets',
  },
  {
    label: 'Users',
    icon: Users,
    href: '/dashboard/moderator/users',
  },
];
