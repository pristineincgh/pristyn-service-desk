import { UserRole, UserStatus, type UserSummary } from '@/types/user-types';

export const roleLabelMap: Record<UserRole, string> = {
  [UserRole.AGENT]: 'Agent',
  [UserRole.SUPERVISOR]: 'Supervisor',
  [UserRole.MODERATOR]: 'Moderator',
};

export const roleBadgeClassMap: Record<UserRole, string> = {
  [UserRole.AGENT]: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  [UserRole.SUPERVISOR]:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  [UserRole.MODERATOR]:
    'bg-violet-500/10 text-violet-700 dark:text-violet-300',
};

export const statusLabelMap: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.INACTIVE]: 'Inactive',
};

export const statusBadgeClassMap: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  [UserStatus.INACTIVE]:
    'bg-slate-500/10 text-slate-700 dark:text-slate-300',
};

export const formatUserTimestamp = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const getUserInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const matchesUserSearch = (user: UserSummary, term: string) => {
  const normalizedTerm = term.trim().toLowerCase();

  if (!normalizedTerm) {
    return true;
  }

  return [user.name, user.email, user.phone ?? ''].some((value) =>
    value.toLowerCase().includes(normalizedTerm),
  );
};
