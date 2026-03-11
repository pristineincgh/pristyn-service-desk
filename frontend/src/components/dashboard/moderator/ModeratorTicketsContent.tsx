'use client';

import AddTicketNoteModal from '@/components/common/modals/AddTicketNoteModal';
import ConfirmAlertDialog from '@/components/common/modals/ConfirmAlertDialog';
import NewTicketModal from '@/components/common/modals/NewTicketModal';
import ReassignBulkTicketsModal from '@/components/common/modals/ReassignBulkTicketsModal';
import UpdateBulkTicketStatusModal from '@/components/common/modals/UpdateBulkTicketStatusModal';
import TicketsTable from '@/components/common/tickets/TicketsTable';
import TicketSummary from '@/components/dashboard/moderator/cards/TicketSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useBulkDeleteTickets } from '@/services/tickets/mutations';
import { useTicketCategories } from '@/services/tickets/categories/queries';
import { useTickets } from '@/services/tickets/queries';
import { TicketPriority, TicketStatus } from '@/types/ticket-types';
import { Search, X } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';

const DEFAULT_TABLE_PAGE = 1;
const DEFAULT_TABLE_PAGE_SIZE = 20;
const ALL_FILTER_VALUE = 'ALL';

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
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const selectedCount = selectedTicketIds.length;
  const bulkDeleteMutation = useBulkDeleteTickets();
  const isBulkActionPending = bulkDeleteMutation.isPending;
  const { data: categories = [] } = useTicketCategories();
  const deferredSearch = useDeferredValue(searchInput.trim());

  const ticketFilters = useMemo(
    () => ({
      ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
      ...(selectedStatus ? { status: selectedStatus as TicketStatus } : {}),
      ...(selectedPriority
        ? { priority: selectedPriority as TicketPriority }
        : {}),
      ...(deferredSearch ? { search: deferredSearch } : {}),
    }),
    [deferredSearch, selectedCategoryId, selectedPriority, selectedStatus]
  );

  const { data, isLoading, isFetching, isError } = useTickets(
    ticketTablePage,
    ticketTablePageSize,
    ticketFilters
  );

  const tickets = data?.tickets ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasActiveFilters =
    !!deferredSearch ||
    !!selectedCategoryId ||
    !!selectedStatus ||
    !!selectedPriority;

  const clearSelection = () => {
    setSelectedTicketIds([]);
  };

  const resetTableForFilters = () => {
    setTicketTablePage(DEFAULT_TABLE_PAGE);
    setSelectedTicketIds([]);
  };

  const clearFilters = () => {
    resetTableForFilters();
    setSearchInput('');
    setSelectedCategoryId('');
    setSelectedStatus('');
    setSelectedPriority('');
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
            <div className='mb-4 flex flex-col gap-3 lg:flex-row lg:items-center'>
              <div className='relative flex-1'>
                <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  type='search'
                  value={searchInput}
                  onChange={(event) => {
                    resetTableForFilters();
                    setSearchInput(event.target.value);
                  }}
                  placeholder='Search by ticket number or customer name'
                  className='pl-9'
                />
              </div>

              <Select
                value={selectedCategoryId || ALL_FILTER_VALUE}
                onValueChange={(value) => {
                  resetTableForFilters();
                  setSelectedCategoryId(
                    value === ALL_FILTER_VALUE ? '' : value
                  );
                }}
              >
                <SelectTrigger className='w-full lg:w-52'>
                  <SelectValue placeholder='All categories' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>
                    All categories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedStatus || ALL_FILTER_VALUE}
                onValueChange={(value) => {
                  resetTableForFilters();
                  setSelectedStatus(value === ALL_FILTER_VALUE ? '' : value);
                }}
              >
                <SelectTrigger className='w-full lg:w-44'>
                  <SelectValue placeholder='All statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>All statuses</SelectItem>
                  <SelectItem value={TicketStatus.OPEN}>Open</SelectItem>
                  <SelectItem value={TicketStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TicketStatus.RESOLVED}>
                    Resolved
                  </SelectItem>
                  <SelectItem value={TicketStatus.CLOSED}>Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedPriority || ALL_FILTER_VALUE}
                onValueChange={(value) => {
                  resetTableForFilters();
                  setSelectedPriority(value === ALL_FILTER_VALUE ? '' : value);
                }}
              >
                <SelectTrigger className='w-full lg:w-40'>
                  <SelectValue placeholder='All priorities' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>
                    All priorities
                  </SelectItem>
                  <SelectItem value={TicketPriority.HIGH}>High</SelectItem>
                  <SelectItem value={TicketPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TicketPriority.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters ? (
                <Button
                  type='button'
                  variant='outline'
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className='w-full lg:w-auto'
                >
                  <X />
                  Clear
                </Button>
              ) : null}
            </div>

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
