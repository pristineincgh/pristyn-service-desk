'use client';

import AddTicketNoteModal from '@/components/common/modals/AddTicketNoteModal';
import ConfirmAlertDialog from '@/components/common/modals/ConfirmAlertDialog';
import NewTicketModal from '@/components/common/modals/NewTicketModal';
import ReassignBulkTicketsModal from '@/components/common/modals/ReassignBulkTicketsModal';
import UpdateBulkTicketStatusModal from '@/components/common/modals/UpdateBulkTicketStatusModal';
import TicketsTable from '@/components/common/tables/TicketsTable';
import TicketSummary from '@/components/dashboard/moderator/cards/TicketSummary';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useBulkDeleteTickets } from '@/services/tickets/mutations';
import { useTickets } from '@/services/tickets/queries';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const DEFAULT_TABLE_PAGE = 1;
const DEFAULT_TABLE_PAGE_SIZE = 20;

const ModeratorTicketsContent = () => {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [ticketTablePage, setTicketTablePage] = useState(DEFAULT_TABLE_PAGE);
  const [ticketTablePageSize, setTicketTablePageSize] = useState(
    DEFAULT_TABLE_PAGE_SIZE
  );
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const selectedCount = selectedTicketIds.length;
  const bulkDeleteMutation = useBulkDeleteTickets();
  const isBulkActionPending = bulkDeleteMutation.isPending;

  const { data, isLoading, isFetching, isError } = useTickets(
    ticketTablePage,
    ticketTablePageSize
  );

  const tickets = data?.tickets ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const clearSelection = () => {
    setSelectedTicketIds([]);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await bulkDeleteMutation.mutateAsync({
        ticketIds: selectedTicketIds,
      });
      toast.success('Tickets deleted successfully');
      clearSelection();
      setIsBulkDeleteDialogOpen(false);
    } catch {
      // Error toasts are handled by mutation hook.
    }
  };

  return (
    <>
      <div className='space-y-6'>
        <TicketSummary
          tickets={tickets}
          total={total}
          isLoading={isLoading}
          errorMessage={
            isError ? 'Unable to load ticket summary right now.' : undefined
          }
          onOpenNewTicketModal={setIsNewTicketModalOpen}
        />

        <Card>
          <CardHeader className='flex items-center justify-between'>
            <div>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Browse and manage all tickets.</CardDescription>
            </div>
            {/** Selected Ticket Actions */}
            {selectedCount > 0 ? (
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => setIsReassignModalOpen(true)}
                  disabled={isBulkActionPending}
                >
                  Reassign
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => setIsUpdateStatusModalOpen(true)}
                  disabled={isBulkActionPending}
                >
                  Update Status
                </Button>
                {selectedCount === 1 ? (
                  <Button
                    size='sm'
                    variant='outline'
                    type='button'
                    onClick={() => setIsAddNoteModalOpen(true)}
                    disabled={isBulkActionPending}
                  >
                    Add Note
                  </Button>
                ) : null}
                <Button
                  size='sm'
                  variant='destructive'
                  type='button'
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  disabled={isBulkActionPending}
                >
                  Delete
                </Button>
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {isError ? (
              <p className='text-sm text-muted-foreground'>
                Unable to load tickets right now.
              </p>
            ) : (
              <TicketsTable
                tickets={tickets}
                total={total}
                page={ticketTablePage}
                pageSize={ticketTablePageSize}
                totalPages={totalPages}
                isLoading={isLoading}
                isFetching={isFetching}
                onPageChange={(nextPage) => {
                  const boundedPage = Math.min(
                    Math.max(nextPage, 1),
                    Math.max(totalPages, 1)
                  );
                  setTicketTablePage(boundedPage);
                  clearSelection();
                }}
                onPageSizeChange={(size) => {
                  setTicketTablePageSize(size);
                  setTicketTablePage(1);
                  clearSelection();
                }}
                selectedTicketIds={selectedTicketIds}
                onSelectionChange={setSelectedTicketIds}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {isNewTicketModalOpen && (
        <NewTicketModal
          open={isNewTicketModalOpen}
          onOpenChange={setIsNewTicketModalOpen}
        />
      )}

      <ReassignBulkTicketsModal
        open={isReassignModalOpen}
        onOpenChange={setIsReassignModalOpen}
        ticketIds={selectedTicketIds}
        onReassigned={clearSelection}
      />

      <AddTicketNoteModal
        open={isAddNoteModalOpen}
        onOpenChange={setIsAddNoteModalOpen}
        ticketId={selectedTicketIds[0]}
      />

      <UpdateBulkTicketStatusModal
        open={isUpdateStatusModalOpen}
        onOpenChange={setIsUpdateStatusModalOpen}
        ticketIds={selectedTicketIds}
        onStatusesUpdated={clearSelection}
      />

      <ConfirmAlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        title='Delete Selected Tickets'
        description={`This will permanently delete ${selectedCount} selected ticket${selectedCount === 1 ? '' : 's'}. This action cannot be undone.`}
        confirmLabel='Delete'
        confirmVariant='destructive'
        isConfirming={bulkDeleteMutation.isPending}
        onConfirm={handleBulkDeleteConfirm}
      />
    </>
  );
};
export default ModeratorTicketsContent;
