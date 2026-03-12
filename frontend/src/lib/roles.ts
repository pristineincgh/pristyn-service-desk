import { UserRole } from '@/types/user-types';

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  [UserRole.AGENT]: '/dashboard/agent',
  [UserRole.SUPERVISOR]: '/dashboard/supervisor',
  [UserRole.MODERATOR]: '/dashboard/moderator',
};

export const getDashboardByRole = (role: UserRole) => DASHBOARD_ROUTES[role];

export const isDashboardPathAllowed = (role: UserRole, pathname: string) =>
  pathname.startsWith(getDashboardByRole(role));
