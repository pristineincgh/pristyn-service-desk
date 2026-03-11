'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AddTicketNoteModal from '@/components/common/modals/AddTicketNoteModal';
import ConfirmAlertDialog from '@/components/common/modals/ConfirmAlertDialog';
import TicketDetailsHeader from './TicketDetailsHeader';
import TicketDetailsNotesSection from './TicketDetailsNotesSection';
import TicketDetailsOverview from './TicketDetailsOverview';
import TicketDetailsSidebar from './TicketDetailsSidebar';
import UpdateTicketDetailsModal from './UpdateTicketDetailsModal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteTicket, useUpdateTicket } from '@/services/tickets/mutations';
import { useTicket } from '@/services/tickets/queries';
import {
  useDeleteTicketNote,
  useUpdateTicketNote,
} from '@/services/tickets/notes/mutations';
import { useUsersByScope } from '@/services/users/queries';
import { useAuthStore } from '@/store/auth-store';
import { TicketNote, TicketPriority, TicketStatus } from '@/types/ticket-types';
import { UserShort } from '@/types/user-types';
import { MetricCard } from './ticket-details-primitives';
import {
  formatRelativeTimestamp,
  formatTimestamp,
} from './ticket-details.constants';

interface Props {
  ticketId: string;
}

const TicketDetails = ({ ticketId }: Props) => {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.authUser);
  const { data: ticket, isLoading, isFetching, isError } = useTicket(ticketId);
  const { data: usersByScopeResponse, isLoading: isUsersLoading } =
    useUsersByScope();
  const updateTicketMutation = useUpdateTicket();
  const deleteTicketMutation = useDeleteTicket();
  const updateTicketNoteMutation = useUpdateTicketNote();
  const deleteTicketNoteMutation = useDeleteTicketNote();

  const [statusOverride, setStatusOverride] = useState<TicketStatus | null>(
    null
  );
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [descriptionOverride, setDescriptionOverride] = useState<string | null>(
    null
  );
  const [priorityOverride, setPriorityOverride] =
    useState<TicketPriority | null>(null);
  const [assigneeOverride, setAssigneeOverride] = useState<string | null>(null);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);
  const [isDeleteTicketDialogOpen, setIsDeleteTicketDialogOpen] =
    useState(false);
  const [notePendingDelete, setNotePendingDelete] = useState<TicketNote | null>(
    null
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [editedNoteInternal, setEditedNoteInternal] = useState(true);

  const assignees = useMemo<UserShort[]>(() => {
    const scopedUsers = usersByScopeResponse?.users ?? [];

    if (!authUser) {
      return scopedUsers;
    }

    const usersMap = new Map<string, UserShort>();
    usersMap.set(authUser.id, {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role,
    });

    scopedUsers.forEach((user) => {
      usersMap.set(user.id, user);
    });

    return Array.from(usersMap.values());
  }, [authUser, usersByScopeResponse?.users]);

  const notes = ticket?.notes ?? [];
  const selectedStatus = ticket ? (statusOverride ?? ticket.status) : undefined;
  const editedTitle = ticket ? (titleOverride ?? ticket.title) : '';
  const editedDescription = ticket
    ? (descriptionOverride ?? ticket.description)
    : '';
  const selectedPriority = ticket
    ? (priorityOverride ?? ticket.priority)
    : undefined;
  const selectedAssigneeId = ticket
    ? (assigneeOverride ?? ticket.assignedTo?.id ?? '')
    : '';
  const isTicketMutating =
    updateTicketMutation.isPending || deleteTicketMutation.isPending;
  const isStatusDirty = !!ticket && selectedStatus !== ticket.status;
  const isDetailsDirty =
    !!ticket &&
    (editedTitle.trim() !== ticket.title ||
      editedDescription.trim() !== ticket.description);
  const isPriorityDirty = !!ticket && selectedPriority !== ticket.priority;
  const isAssigneeDirty =
    !!ticket && selectedAssigneeId !== (ticket.assignedTo?.id ?? '');

  const handleDetailsSave = async () => {
    if (!ticket || !isDetailsDirty) {
      return;
    }

    const nextTitle = editedTitle.trim();
    const nextDescription = editedDescription.trim();

    if (!nextTitle || !nextDescription) {
      return;
    }

    try {
      const response = await updateTicketMutation.mutateAsync({
        id: ticket.id,
        data: {
          ...(nextTitle !== ticket.title ? { title: nextTitle } : {}),
          ...(nextDescription !== ticket.description
            ? { description: nextDescription }
            : {}),
        },
      });
      toast.success(response.message || 'Ticket details updated');
      setTitleOverride(null);
      setDescriptionOverride(null);
      setIsEditDetailsModalOpen(false);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  const handleDetailsReset = () => {
    setTitleOverride(null);
    setDescriptionOverride(null);
  };

  const handlePrioritySave = async () => {
    if (!ticket || !selectedPriority || !isPriorityDirty) {
      return;
    }

    try {
      const response = await updateTicketMutation.mutateAsync({
        id: ticket.id,
        data: { priority: selectedPriority },
      });
      toast.success(response.message || 'Ticket priority updated');
      setPriorityOverride(null);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  const handleStatusSave = async () => {
    if (!ticket || !selectedStatus || !isStatusDirty) {
      return;
    }

    try {
      const response = await updateTicketMutation.mutateAsync({
        id: ticket.id,
        data: { status: selectedStatus },
      });
      toast.success(response.message || 'Ticket status updated');
      setStatusOverride(null);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  const handleAssigneeSave = async () => {
    if (!ticket || !selectedAssigneeId || !isAssigneeDirty) {
      return;
    }

    try {
      const response = await updateTicketMutation.mutateAsync({
        id: ticket.id,
        data: { assignedToId: selectedAssigneeId },
      });
      toast.success(response.message || 'Ticket assignee updated');
      setAssigneeOverride(null);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  const beginNoteEdit = (note: TicketNote) => {
    setEditingNoteId(note.id);
    setEditedNoteContent(note.content);
    setEditedNoteInternal(note.isInternal);
  };

  const cancelNoteEdit = () => {
    setEditingNoteId(null);
    setEditedNoteContent('');
    setEditedNoteInternal(true);
  };

  const handleNoteSave = async () => {
    if (!ticket || !editingNoteId || !editedNoteContent.trim()) {
      return;
    }

    try {
      const response = await updateTicketNoteMutation.mutateAsync({
        ticketId: ticket.id,
        noteId: editingNoteId,
        data: {
          content: editedNoteContent.trim(),
          isInternal: editedNoteInternal,
        },
      });
      toast.success(response.message || 'Ticket note updated');
      cancelNoteEdit();
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  const handleDeleteNote = async () => {
    if (!ticket || !notePendingDelete) {
      return;
    }

    try {
      const response = await deleteTicketNoteMutation.mutateAsync({
        ticketId: ticket.id,
        noteId: notePendingDelete.id,
      });
      toast.success(response.message || 'Ticket note deleted');
      setNotePendingDelete(null);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) {
      return;
    }

    try {
      const response = await deleteTicketMutation.mutateAsync(ticket.id);
      toast.success(response.message || 'Ticket deleted successfully');
      router.push('/dashboard/moderator/tickets');
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }, []);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between gap-3'>
          <Skeleton className='h-10 w-44' />
          <Skeleton className='h-10 w-32' />
        </div>
        <div className='grid gap-6 xl:grid-cols-[1.55fr_0.95fr]'>
          <Skeleton className='h-180 w-full rounded-2xl' />
          <Skeleton className='h-180 w-full rounded-2xl' />
        </div>
      </div>
    );
  }

  if (!ticket || isError) {
    return (
      <div className='space-y-4'>
        <Button variant='outline' asChild>
          <Link href='/dashboard/moderator/tickets'>
            <ArrowLeft />
            Back to tickets
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Ticket unavailable</CardTitle>
            <CardDescription>
              The ticket could not be loaded. It may have been deleted or you
              may no longer have access.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className='space-y-6'>
        <TicketDetailsHeader
          ticket={ticket}
          isFetching={isFetching}
          isDeleting={deleteTicketMutation.isPending}
          onAddNote={() => setIsAddNoteModalOpen(true)}
          onEditDetails={() => setIsEditDetailsModalOpen(true)}
          onDeleteTicket={() => setIsDeleteTicketDialogOpen(true)}
        />

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <MetricCard
            label='Customer'
            value={ticket.customer.name}
            hint={`Issue type: ${ticket.category.name}`}
          />
          <MetricCard
            label='Assigned To'
            value={ticket.assignedTo?.name ?? 'Unassigned'}
            hint={
              ticket.assignedTo
                ? 'Ownership set'
                : 'Pick an assignee from the action panel'
            }
          />
          <MetricCard
            label='Created'
            value={formatTimestamp(ticket.createdAt)}
            hint={`By ${ticket.createdBy.name}`}
          />
          <MetricCard
            label='SLA Deadline'
            value={formatRelativeTimestamp(ticket.sla.deadlineAt)}
            hint={`Target ${ticket.sla.targetHours} hours`}
          />
        </div>

        <div className='grid gap-6 xl:grid-cols-[1.55fr_0.95fr]'>
          <div className='space-y-6'>
            <TicketDetailsOverview ticket={ticket} />
            <TicketDetailsNotesSection
              notes={notes}
              authUserId={authUser?.id}
              authUserRole={authUser?.role}
              editingNoteId={editingNoteId}
              editedNoteContent={editedNoteContent}
              editedNoteInternal={editedNoteInternal}
              isUpdatingNote={updateTicketNoteMutation.isPending}
              isDeletingNote={deleteTicketNoteMutation.isPending}
              notePendingDeleteId={notePendingDelete?.id}
              onAddNote={() => setIsAddNoteModalOpen(true)}
              onBeginEdit={beginNoteEdit}
              onDeleteRequest={setNotePendingDelete}
              onEditedNoteContentChange={setEditedNoteContent}
              onEditedNoteInternalChange={setEditedNoteInternal}
              onSaveNote={handleNoteSave}
              onCancelEdit={cancelNoteEdit}
            />
          </div>

          <TicketDetailsSidebar
            ticket={ticket}
            assignees={assignees}
            selectedStatus={selectedStatus ?? ticket.status}
            selectedPriority={selectedPriority ?? ticket.priority}
            selectedAssigneeId={selectedAssigneeId}
            isUsersLoading={isUsersLoading}
            isTicketMutating={isTicketMutating}
            isStatusDirty={isStatusDirty}
            isPriorityDirty={isPriorityDirty}
            isAssigneeDirty={isAssigneeDirty}
            isUpdatingTicket={updateTicketMutation.isPending}
            isDeletingTicket={deleteTicketMutation.isPending}
            authUserId={authUser?.id}
            onStatusChange={setStatusOverride}
            onPriorityChange={setPriorityOverride}
            onAssigneeChange={setAssigneeOverride}
            onSaveStatus={handleStatusSave}
            onSavePriority={handlePrioritySave}
            onSaveAssignee={handleAssigneeSave}
            onDeleteTicket={() => setIsDeleteTicketDialogOpen(true)}
          />
        </div>
      </div>

      <AddTicketNoteModal
        open={isAddNoteModalOpen}
        onOpenChange={setIsAddNoteModalOpen}
        ticketId={ticket.id}
      />

      <UpdateTicketDetailsModal
        open={isEditDetailsModalOpen}
        onOpenChange={setIsEditDetailsModalOpen}
        title={editedTitle}
        description={editedDescription}
        isSubmitting={updateTicketMutation.isPending}
        onTitleChange={setTitleOverride}
        onDescriptionChange={setDescriptionOverride}
        onSubmit={handleDetailsSave}
        onReset={handleDetailsReset}
      />

      <ConfirmAlertDialog
        open={isDeleteTicketDialogOpen}
        onOpenChange={setIsDeleteTicketDialogOpen}
        title='Delete Ticket'
        description='This will permanently delete the ticket and all notes attached to it. This action cannot be undone.'
        confirmLabel='Delete Ticket'
        confirmVariant='destructive'
        isConfirming={deleteTicketMutation.isPending}
        onConfirm={handleDeleteTicket}
      />

      <ConfirmAlertDialog
        open={!!notePendingDelete}
        onOpenChange={(open) => {
          if (!open) {
            setNotePendingDelete(null);
          }
        }}
        title='Delete Note'
        description='This note will be removed permanently from the ticket history.'
        confirmLabel='Delete Note'
        confirmVariant='destructive'
        isConfirming={deleteTicketNoteMutation.isPending}
        onConfirm={handleDeleteNote}
      />
    </>
  );
};

export default TicketDetails;
