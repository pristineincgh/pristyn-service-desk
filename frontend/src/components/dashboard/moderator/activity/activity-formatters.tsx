import { Badge } from '@/components/ui/badge';
import {
  formatUserDisplayName,
  formatUserReflexiveLabel,
} from '@/lib/self-reference';
import { cn } from '@/lib/utils';
import {
  type ActivityEntityType,
  type ActivityLogAction,
  type ActivityLogItem,
} from '@/types/activity-types';
import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

export const activityEntityLabelMap: Record<ActivityEntityType, string> = {
  TICKET: 'Ticket',
  USER: 'User',
  CUSTOMER: 'Customer',
  TICKET_CATEGORY: 'Ticket category',
  SYSTEM: 'System',
};

export const activityEntityBadgeClassMap: Record<ActivityEntityType, string> = {
  TICKET: 'border-0 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  USER: 'border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  CUSTOMER: 'border-0 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  TICKET_CATEGORY:
    'border-0 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  SYSTEM: 'border-0 bg-slate-500/10 text-slate-700 dark:text-slate-300',
};

export const activityActionLabelMap: Record<ActivityLogAction, string> = {
  TICKET_CREATED: 'Ticket created',
  TICKET_UPDATED: 'Ticket updated',
  TICKET_ASSIGNED: 'Ticket assigned',
  TICKET_STATUS_CHANGED: 'Status changed',
  TICKET_PRIORITY_CHANGED: 'Priority changed',
  TICKET_DELETED: 'Ticket deleted',
  USER_CREATED: 'User created',
  USER_UPDATED: 'User updated',
  USER_VERIFICATION_EMAIL_SENT: 'Verification email sent',
  USER_EMAIL_VERIFIED: 'Email verified',
  USER_ASSIGNED_TO_SUPERVISOR: 'Supervisor assigned',
  USER_STATUS_CHANGED: 'Status changed',
  USER_PASSWORD_RESET: 'Password reset',
  USER_PASSWORD_RESET_REQUESTED: 'Reset requested',
  USER_PASSWORD_RESET_COMPLETED: 'Password reset completed',
  USER_LOGGED_IN: 'Logged in',
  USER_LOGGED_OUT: 'Logged out',
  CUSTOMER_CREATED: 'Customer created',
  CUSTOMER_UPDATED: 'Customer updated',
  CUSTOMER_DELETED: 'Customer deleted',
  TICKET_CATEGORY_CREATED: 'Category created',
  TICKET_CATEGORY_UPDATED: 'Category updated',
  TICKET_CATEGORY_DELETED: 'Category deleted',
};

const activityActionBadgeClassMap: Record<ActivityLogAction, string> = {
  TICKET_CREATED: 'border-0 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  TICKET_UPDATED: 'border-0 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  TICKET_ASSIGNED:
    'border-0 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  TICKET_STATUS_CHANGED:
    'border-0 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  TICKET_PRIORITY_CHANGED:
    'border-0 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  TICKET_DELETED: 'border-0 bg-red-500/10 text-red-700 dark:text-red-300',
  USER_CREATED:
    'border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  USER_UPDATED: 'border-0 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  USER_VERIFICATION_EMAIL_SENT:
    'border-0 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  USER_EMAIL_VERIFIED:
    'border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  USER_ASSIGNED_TO_SUPERVISOR:
    'border-0 bg-teal-500/10 text-teal-700 dark:text-teal-300',
  USER_STATUS_CHANGED:
    'border-0 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  USER_PASSWORD_RESET:
    'border-0 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  USER_PASSWORD_RESET_REQUESTED:
    'border-0 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  USER_PASSWORD_RESET_COMPLETED:
    'border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  USER_LOGGED_IN:
    'border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  USER_LOGGED_OUT:
    'border-0 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  CUSTOMER_CREATED:
    'border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  CUSTOMER_UPDATED:
    'border-0 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  CUSTOMER_DELETED: 'border-0 bg-red-500/10 text-red-700 dark:text-red-300',
  TICKET_CATEGORY_CREATED:
    'border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  TICKET_CATEGORY_UPDATED:
    'border-0 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  TICKET_CATEGORY_DELETED:
    'border-0 bg-red-500/10 text-red-700 dark:text-red-300',
};

export const activityEntityOptions = Object.entries(activityEntityLabelMap).map(
  ([value, label]) => ({
    value: value as ActivityEntityType,
    label,
  })
);

export const activityActionOptions = Object.entries(activityActionLabelMap).map(
  ([value, label]) => ({
    value: value as ActivityLogAction,
    label,
  })
);

const toDisplayValue = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const formatEnumValue = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getChangedFieldsLabel = (metadata: Record<string, unknown>) => {
  const changedFields = metadata.changedFields;
  if (!Array.isArray(changedFields) || changedFields.length === 0) {
    return null;
  }

  const changedFieldLabelMap: Record<string, string> = {
    assignedToId: 'Assignee',
    status: 'Status',
    priority: 'Priority',
    title: 'Title',
    description: 'Description',
    categoryId: 'Category',
    noteAdded: 'Note added',
    noteDeleted: 'Note deleted',
    noteContent: 'Note content',
    noteVisibility: 'Note visibility',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    emailVerified: 'Email verification',
    supervisorId: 'Supervisor',
  };

  return changedFields
    .filter((field): field is string => typeof field === 'string')
    .map((field) => changedFieldLabelMap[field] ?? field)
    .join(', ');
};

const getChangedFieldLabels = (metadata: Record<string, unknown>) => {
  const changedFields = metadata.changedFields;
  if (!Array.isArray(changedFields) || changedFields.length === 0) {
    return [] as string[];
  }

  const changedFieldLabelMap: Record<string, string> = {
    assignedToId: 'Assignee',
    status: 'Status',
    priority: 'Priority',
    title: 'Title',
    description: 'Description',
    categoryId: 'Category',
    noteAdded: 'Note added',
    noteDeleted: 'Note deleted',
    noteContent: 'Note content',
    noteVisibility: 'Note visibility',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    emailVerified: 'Email verification',
    supervisorId: 'Supervisor',
    mustChangePassword: 'Must change password',
  };

  return changedFields
    .filter((field): field is string => typeof field === 'string')
    .map((field) => changedFieldLabelMap[field] ?? field);
};

const formatAuditValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'Empty';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'string') {
    return value.trim().length > 0 ? formatEnumValue(value) : 'Empty';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return JSON.stringify(value);
};

export const getActivityAuditEntries = (activity: ActivityLogItem) => {
  const metadata = activity.metadata ?? {};
  const previous =
    metadata.previous && typeof metadata.previous === 'object'
      ? (metadata.previous as Record<string, unknown>)
      : null;
  const current =
    metadata.current && typeof metadata.current === 'object'
      ? (metadata.current as Record<string, unknown>)
      : null;
  const changedFields = Array.isArray(metadata.changedFields)
    ? metadata.changedFields.filter(
        (field): field is string => typeof field === 'string',
      )
    : [];
  const changedFieldLabels = getChangedFieldLabels(metadata);

  if (!previous && !current) {
    return [];
  }

  const keys =
    changedFields.length > 0
      ? changedFields
      : Array.from(
          new Set([
            ...Object.keys(previous ?? {}),
            ...Object.keys(current ?? {}),
          ]),
        );

  return keys.map((key, index) => ({
    field: changedFieldLabels[index] ?? key,
    previous: formatAuditValue(previous?.[key]),
    current: formatAuditValue(current?.[key]),
  }));
};

export const formatActivityTimestamp = (value: string) => {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return 'Unknown';
  }

  return format(parsed, 'PPp');
};

export const formatActivityRelativeTimestamp = (value: string) => {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return 'Unknown';
  }

  return formatDistanceToNowStrict(parsed, { addSuffix: true });
};

export const getActivityActorLabel = (
  activity: ActivityLogItem,
  currentUserId?: string
) => {
  if (!activity.actor) {
    return 'System';
  }

  return formatUserDisplayName(
    activity.actor.name,
    activity.actor.id,
    currentUserId
  );
};

export const getActivitySubjectLabel = (
  activity: ActivityLogItem,
  currentUserId?: string
) => {
  if (activity.ticket) {
    return activity.ticket.ticketNumber;
  }

  if (activity.user) {
    return formatUserDisplayName(
      activity.user.name,
      activity.user.id,
      currentUserId
    );
  }

  const metadata = activity.metadata ?? {};
  const metadataName = toDisplayValue(metadata.name);
  if (metadataName) {
    if (activity.entityType === 'CUSTOMER') {
      return `${metadataName}`;
    }

    if (activity.entityType === 'TICKET_CATEGORY') {
      return `${metadataName}`;
    }

    if (activity.entityType === 'USER') {
      return `${metadataName}`;
    }

    return metadataName;
  }

  const metadataEmail = toDisplayValue(metadata.email);
  if (metadataEmail) {
    if (activity.entityType === 'USER') {
      return `${metadataEmail}`;
    }

    return metadataEmail;
  }

  return activity.entityId;
};

export const getActivitySubjectSubLabel = (activity: ActivityLogItem) => {
  if (activity.ticket) {
    return activity.ticket.title;
  }

  return activityEntityLabelMap[activity.entityType];
};

export const getActivityDetails = (
  activity: ActivityLogItem,
  currentUserId?: string
) => {
  const metadata = activity.metadata ?? {};
  const activityUserName = activity.user?.name;
  const activityUserId = activity.user?.id;
  const userTargetLabel =
    activityUserName && activityUserId
      ? formatUserReflexiveLabel(activityUserName, activityUserId, currentUserId)
      : null;

  switch (activity.action) {
    case 'TICKET_CREATED': {
      const status = toDisplayValue(metadata.status);
      const priority = toDisplayValue(metadata.priority);
      if (status && priority) {
        return `Opened with ${formatEnumValue(status)} status and ${formatEnumValue(priority)} priority`;
      }

      return 'Ticket opened';
    }
    case 'TICKET_UPDATED': {
      const changedFields = getChangedFieldsLabel(metadata);
      const isInternal = metadata.isInternal;

      if (Array.isArray(metadata.changedFields)) {
        if (metadata.changedFields.includes('noteAdded')) {
          return `Added ${isInternal === true ? 'internal' : 'public'} note`;
        }

        if (metadata.changedFields.includes('noteDeleted')) {
          return 'Deleted ticket note';
        }

        if (
          metadata.changedFields.includes('noteContent') &&
          metadata.changedFields.includes('noteVisibility')
        ) {
          return 'Updated note content and visibility';
        }

        if (metadata.changedFields.includes('noteContent')) {
          return 'Updated note content';
        }

        if (metadata.changedFields.includes('noteVisibility')) {
          return 'Updated note visibility';
        }
      }

      return changedFields
        ? `Updated ${changedFields}`
        : 'Updated ticket details';
    }
    case 'TICKET_ASSIGNED': {
      const previousAssignedToId = toDisplayValue(
        metadata.previousAssignedToId
      );
      const reason = toDisplayValue(metadata.reason);

      if (!previousAssignedToId && reason === 'initial_assignment') {
        return 'Assigned ticket on creation';
      }

      if (!previousAssignedToId) {
        return 'Assigned ticket';
      }

      return 'Reassigned ticket';
    }
    case 'TICKET_STATUS_CHANGED': {
      const previousStatus = toDisplayValue(metadata.previousStatus);
      const status = toDisplayValue(metadata.status);
      return previousStatus && status
        ? `Changed from ${formatEnumValue(previousStatus)} to ${formatEnumValue(status)}`
        : 'Ticket status updated';
    }
    case 'TICKET_PRIORITY_CHANGED': {
      const previousPriority = toDisplayValue(metadata.previousPriority);
      const priority = toDisplayValue(metadata.priority);
      return previousPriority && priority
        ? `Changed from ${formatEnumValue(previousPriority)} to ${formatEnumValue(priority)}`
        : 'Ticket priority updated';
    }
    case 'TICKET_DELETED':
      return toDisplayValue(metadata.title)
        ? `Deleted ticket "${toDisplayValue(metadata.title)}"`
        : 'Deleted ticket';
    case 'USER_CREATED': {
      const role = toDisplayValue(metadata.role);
      const email = toDisplayValue(metadata.email);
      if (role && email) {
        return `Created ${formatEnumValue(role).toLowerCase()} account for ${email}`;
      }

      return email ? `Created account for ${email}` : 'Created user account';
    }
    case 'USER_UPDATED':
      return getChangedFieldsLabel(metadata)
        ? `Updated ${getChangedFieldsLabel(metadata)}`
        : 'Updated user details';
    case 'USER_VERIFICATION_EMAIL_SENT': {
      const email = toDisplayValue(metadata.email);
      const reason = toDisplayValue(metadata.reason);

      if (email && reason) {
        return `Sent verification email to ${email} (${formatEnumValue(reason).toLowerCase()})`;
      }

      return email
        ? `Sent verification email to ${email}`
        : 'Sent verification email';
    }
    case 'USER_EMAIL_VERIFIED':
      return toDisplayValue(metadata.email)
        ? `Verified email address ${toDisplayValue(metadata.email)}`
        : 'Verified email address';
    case 'USER_ASSIGNED_TO_SUPERVISOR': {
      const previousSupervisorId = toDisplayValue(
        metadata.previousSupervisorId
      );
      return previousSupervisorId
        ? 'Changed assigned supervisor'
        : 'Assigned supervisor';
    }
    case 'USER_STATUS_CHANGED': {
      const previousStatus = toDisplayValue(metadata.previousStatus);
      const status = toDisplayValue(metadata.status);
      return previousStatus && status
        ? `Changed from ${formatEnumValue(previousStatus)} to ${formatEnumValue(status)}`
        : 'User status updated';
    }
    case 'USER_PASSWORD_RESET':
      return userTargetLabel
        ? `Issued temporary password for ${userTargetLabel}`
        : toDisplayValue(metadata.email)
          ? `Issued temporary password for ${toDisplayValue(metadata.email)}`
        : 'Issued temporary password';
    case 'USER_PASSWORD_RESET_REQUESTED':
      return userTargetLabel
        ? `Requested password reset for ${userTargetLabel}`
        : toDisplayValue(metadata.email)
          ? `Requested password reset for ${toDisplayValue(metadata.email)}`
        : 'Requested password reset';
    case 'USER_PASSWORD_RESET_COMPLETED':
      return userTargetLabel
        ? `Reset password completed for ${userTargetLabel}`
        : toDisplayValue(metadata.email)
          ? `Reset password completed for ${toDisplayValue(metadata.email)}`
        : 'Completed password reset';
    case 'USER_LOGGED_IN':
      return 'Started a new session';
    case 'USER_LOGGED_OUT':
      return 'Ended the current session';
    case 'CUSTOMER_CREATED':
      return toDisplayValue(metadata.phone)
        ? `Added customer with phone ${toDisplayValue(metadata.phone)}`
        : 'Added customer';
    case 'CUSTOMER_UPDATED':
      return getChangedFieldsLabel(metadata)
        ? `Updated ${getChangedFieldsLabel(metadata)}`
        : 'Updated customer details';
    case 'CUSTOMER_DELETED':
      return toDisplayValue(metadata.phone)
        ? `Deleted customer with phone ${toDisplayValue(metadata.phone)}`
        : 'Deleted customer';
    case 'TICKET_CATEGORY_CREATED':
      return toDisplayValue(metadata.name)
        ? `Created category "${toDisplayValue(metadata.name)}"`
        : 'Created ticket category';
    case 'TICKET_CATEGORY_UPDATED': {
      const previousName = toDisplayValue(metadata.previousName);
      const name = toDisplayValue(metadata.name);
      if (previousName && name) {
        return `Renamed category from "${previousName}" to "${name}"`;
      }

      return getChangedFieldsLabel(metadata)
        ? `Updated ${getChangedFieldsLabel(metadata)}`
        : 'Updated ticket category';
    }
    case 'TICKET_CATEGORY_DELETED':
      return toDisplayValue(metadata.name)
        ? `Deleted category "${toDisplayValue(metadata.name)}"`
        : 'Deleted ticket category';
    default:
      return 'Activity recorded';
  }
};

export const ActivityEntityBadge = ({
  entityType,
}: {
  entityType: ActivityEntityType;
}) => (
  <Badge
    variant='secondary'
    className={cn(
      'rounded-md border-0',
      activityEntityBadgeClassMap[entityType]
    )}
  >
    {activityEntityLabelMap[entityType]}
  </Badge>
);

export const ActivityActionBadge = ({
  action,
}: {
  action: ActivityLogAction;
}) => (
  <Badge
    variant='secondary'
    className={cn('rounded-md border-0', activityActionBadgeClassMap[action])}
  >
    {activityActionLabelMap[action]}
  </Badge>
);
