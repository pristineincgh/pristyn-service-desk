import { AlertTriangle, Clock3, Trash2, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { getStatusBadge } from '@/lib/get-status-badge';
import { formatUserDisplayName } from '@/lib/self-reference';
import { cn } from '@/lib/utils';
import type {
  TicketDetail,
  TicketPriority,
  TicketStatus,
} from '@/types/ticket-types';
import type { UserShort } from '@/types/user-types';
import {
  formatTimestamp,
  getSlaLabel,
  getSlaTone,
  PRIORITY_BADGE_STYLES,
  PRIORITY_LABELS,
  STATUS_OPTIONS,
} from './ticket-details.constants';
import { DetailRow } from './ticket-details-primitives';

interface TicketDetailsSidebarProps {
  ticket: TicketDetail;
  assignees: UserShort[];
  authUserId?: string;
  selectedStatus: TicketStatus;
  selectedPriority: TicketPriority;
  selectedAssigneeId: string;
  isUsersLoading: boolean;
  isTicketMutating: boolean;
  isStatusDirty: boolean;
  isPriorityDirty: boolean;
  isAssigneeDirty: boolean;
  isUpdatingTicket: boolean;
  isDeletingTicket: boolean;
  onStatusChange: (value: TicketStatus) => void;
  onPriorityChange: (value: TicketPriority) => void;
  onAssigneeChange: (value: string) => void;
  onSaveStatus: () => void;
  onSavePriority: () => void;
  onSaveAssignee: () => void;
  onDeleteTicket: () => void;
}

const TicketDetailsSidebar = ({
  ticket,
  assignees,
  selectedStatus,
  selectedPriority,
  selectedAssigneeId,
  isUsersLoading,
  isTicketMutating,
  isStatusDirty,
  isPriorityDirty,
  isAssigneeDirty,
  isUpdatingTicket,
  isDeletingTicket,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onSaveStatus,
  onSavePriority,
  onSaveAssignee,
  onDeleteTicket,
  authUserId,
}: TicketDetailsSidebarProps) => {
  return (
    <div className='space-y-6'>
      <Card className='gap-0 overflow-hidden py-0'>
        <CardHeader className='border-b py-6'>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Update routing, status, and ownership for this ticket.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-5 py-6'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Clock3 className='size-4 text-muted-foreground' />
              Status
            </div>
            <Select
              value={selectedStatus || undefined}
              onValueChange={(value) => onStatusChange(value as TicketStatus)}
              disabled={isTicketMutating}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              className='w-full'
              onClick={onSaveStatus}
              disabled={!isStatusDirty || isTicketMutating}
            >
              {isUpdatingTicket && isStatusDirty ? <Spinner /> : null}
              Save status
            </Button>
          </div>

          <Separator />

          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <AlertTriangle className='size-4 text-muted-foreground' />
              Priority
            </div>
            <Select
              value={selectedPriority || undefined}
              onValueChange={(value) =>
                onPriorityChange(value as TicketPriority)
              }
              disabled={isTicketMutating}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select priority' />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              className='w-full'
              variant='outline'
              onClick={onSavePriority}
              disabled={!isPriorityDirty || isTicketMutating}
            >
              {isUpdatingTicket && isPriorityDirty ? <Spinner /> : null}
              Save priority
            </Button>
          </div>

          <Separator />

          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <UserRound className='size-4 text-muted-foreground' />
              Assignee
            </div>
            <Select
              value={selectedAssigneeId || undefined}
              onValueChange={onAssigneeChange}
              disabled={isTicketMutating || isUsersLoading}
            >
              <SelectTrigger className='w-full'>
                <SelectValue
                  placeholder={
                    isUsersLoading ? 'Loading users...' : 'Select assignee'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {formatUserDisplayName(user.name, user.id, authUserId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              className='w-full'
              variant='outline'
              onClick={onSaveAssignee}
              disabled={
                !selectedAssigneeId || !isAssigneeDirty || isTicketMutating
              }
            >
              {isUpdatingTicket && isAssigneeDirty ? <Spinner /> : null}
              Save assignee
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className='gap-0 overflow-hidden py-0'>
        <CardHeader className='border-b py-6'>
          <CardTitle>Operational Snapshot</CardTitle>
          <CardDescription>
            Quick view of the state signals tied to this ticket.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 py-6'>
          <DetailRow
            label='Priority'
            value={
              <Badge
                variant='outline'
                className={cn(
                  'rounded-md',
                  PRIORITY_BADGE_STYLES[ticket.priority]
                )}
              >
                {PRIORITY_LABELS[ticket.priority]}
              </Badge>
            }
          />
          <DetailRow
            label='Current Status'
            value={getStatusBadge(ticket.status)}
          />
          <DetailRow
            label='SLA'
            value={
              <Badge
                variant='outline'
                className={cn('rounded-md', getSlaTone(ticket))}
              >
                {getSlaLabel(ticket)}
              </Badge>
            }
          />
          <DetailRow
            label='Deadline'
            value={formatTimestamp(ticket.sla.deadlineAt)}
          />
          <DetailRow label='Notes' value={`${ticket.notes.length}`} />
        </CardContent>
      </Card>

      <Card className='gap-0 overflow-hidden border-destructive/25 py-0'>
        <CardHeader className='border-b border-destructive/15 py-6'>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Permanently remove this ticket and all of its notes.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 py-6'>
          <p className='text-sm text-muted-foreground'>
            Delete should only be used for invalid or duplicate tickets. This
            cannot be undone.
          </p>
          <Button
            type='button'
            variant='destructive'
            className='w-full'
            onClick={onDeleteTicket}
            disabled={isDeletingTicket}
          >
            {isDeletingTicket ? <Spinner /> : <Trash2 />}
            Delete ticket
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketDetailsSidebar;
