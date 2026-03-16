'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmAlertDialog from '@/components/common/modals/ConfirmAlertDialog';
import KPICard from '@/components/common/cards/KPICard';
import CreateTicketCategoryModal from '@/components/dashboard/moderator/modals/CreateTicketCategoryModal';
import UpdateTicketCategoryModal from './UpdateTicketCategoryModal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getStatusBadge } from '@/lib/get-status-badge';
import { formatUserDisplayName } from '@/lib/self-reference';
import { useDeleteTicketCategory } from '@/services/tickets/categories/mutations';
import { useTicketCategory } from '@/services/tickets/categories/queries';
import { useAuthStore } from '@/store/auth-store';
import { TicketPriority } from '@/types/ticket-types';
import { toast } from 'sonner';
import {
  formatTicketCategoryTimestamp,
  getTicketCategoryInitials,
} from './ticket-category-formatters';
import {
  ArrowLeft,
  ArrowRight,
  FolderClosed,
  Inbox,
  SquarePen,
  Ticket,
  Trash2,
} from 'lucide-react';

type ModeratorTicketCategoryDetailsProps = {
  categoryId: string;
};

const getPriorityLabel = (priority: TicketPriority) => {
  if (priority === TicketPriority.HIGH) {
    return 'High';
  }

  if (priority === TicketPriority.MEDIUM) {
    return 'Medium';
  }

  return 'Low';
};

const ModeratorTicketCategoryDetails = ({
  categoryId,
}: ModeratorTicketCategoryDetailsProps) => {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.authUser);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {
    data: category,
    isLoading,
    isFetching,
    isError,
  } = useTicketCategory(categoryId);
  const deleteTicketCategoryMutation = useDeleteTicketCategory();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/dashboard/moderator/ticket-categories');
  };

  const handleDeleteCategory = async () => {
    if (!category) {
      return;
    }

    try {
      const response = await deleteTicketCategoryMutation.mutateAsync(
        category.id
      );
      toast.success(response.message || 'Ticket category deleted successfully');
      setIsDeleteDialogOpen(false);
      router.push('/dashboard/moderator/ticket-categories');
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-48 w-full rounded-2xl' />
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className='h-36 w-full rounded-2xl' />
          ))}
        </div>
      </div>
    );
  }

  if (!category || isError) {
    return (
      <div className='space-y-4'>
        <Button variant='outline' type='button' onClick={handleBack}>
          <ArrowLeft />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Category unavailable</CardTitle>
            <CardDescription>
              The requested ticket category could not be loaded.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className='space-y-6'>
        <Button variant='link' type='button' onClick={handleBack}>
          <ArrowLeft />
          Back
        </Button>

        <Card className='overflow-hidden rounded-2xl border-border/70 shadow-sm'>
          <CardContent className='flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between'>
            <div className='flex items-start gap-4'>
              <Avatar size='lg' className='size-16'>
                <AvatarFallback>
                  {getTicketCategoryInitials(category.name)}
                </AvatarFallback>
              </Avatar>

              <div className='space-y-3'>
                <div className='space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
                      {category.name}
                    </h1>
                    <Badge variant='outline' className='rounded-md'>
                      Ticket category
                    </Badge>
                    <Badge
                      variant={category.ticketCount ? 'outline' : 'secondary'}
                      className='rounded-md'
                    >
                      {category.ticketCount ? 'In use' : 'Unused'}
                    </Badge>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {category.ticketCount ?? 0} linked tickets
                    {isFetching ? ' (refreshing...)' : ''}
                  </p>
                </div>

                <div className='grid gap-2 text-sm text-muted-foreground sm:grid-cols-2'>
                  <div className='flex items-center gap-2'>
                    <FolderClosed className='h-4 w-4' />
                    Created {formatTicketCategoryTimestamp(category.createdAt)}
                  </div>
                  <div className='flex items-center gap-2'>
                    <FolderClosed className='h-4 w-4' />
                    Updated {formatTicketCategoryTimestamp(category.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                onClick={() => setIsEditModalOpen(true)}
              >
                <SquarePen />
                Edit Category
              </Button>
              <Button
                variant='outline-destructive'
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 />
                Delete Category
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          <KPICard
            title='Category name'
            value={category.name}
            icon={<FolderClosed className='h-5 w-5' />}
            theme='slate'
          />
          <KPICard
            title='Linked tickets'
            value={category.ticketCount ?? category.tickets.length}
            icon={<Ticket className='h-5 w-5' />}
            theme='blue'
          />
          <KPICard
            title='Unused slots'
            value={category.tickets.length === 0 ? 'Ready' : 'Active'}
            icon={<FolderClosed className='h-5 w-5' />}
            theme='amber'
          />
        </section>

        <Card className='rounded-2xl border-border/70 shadow-sm'>
          <CardHeader>
            <CardTitle>Category details</CardTitle>
            <CardDescription>
              Audit information and usage summary for this ticket category.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-5'>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Current usage
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {category.ticketCount
                    ? 'Assigned to existing tickets'
                    : 'Not assigned yet'}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Created
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {formatTicketCategoryTimestamp(category.createdAt)}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Last updated
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {formatTicketCategoryTimestamp(category.updatedAt)}
                </p>
              </div>
            </div>

            <Separator />

            <div className='space-y-3'>
              <h2 className='text-sm font-medium text-foreground'>
                Category summary
              </h2>
              <p className='text-sm text-muted-foreground'>
                Rename this category as your taxonomy evolves, or delete it once
                it is no longer linked to existing tickets.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border/70 shadow-sm'>
          <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div className='space-y-1'>
              <CardTitle>Tickets in this category</CardTitle>
              <CardDescription>
                Open any ticket below to review its full details.
              </CardDescription>
            </div>
            <Button variant='outline' asChild>
              <Link href='/dashboard/moderator/tickets'>
                View all tickets
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {category.tickets.length === 0 ? (
              <div className='flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-10 text-center'>
                <Inbox className='mb-3 h-10 w-10 text-muted-foreground' />
                <h3 className='text-sm font-medium text-foreground'>
                  No tickets in this category
                </h3>
                <p className='mt-1 max-w-md text-sm text-muted-foreground'>
                  Tickets assigned to this category will appear here once they
                  are created.
                </p>
              </div>
            ) : (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.tickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        role='link'
                        tabIndex={0}
                        className='cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        onClick={() =>
                          router.push(
                            `/dashboard/moderator/tickets/${encodeURIComponent(ticket.id)}`
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            router.push(
                              `/dashboard/moderator/tickets/${encodeURIComponent(ticket.id)}`
                            );
                          }
                        }}
                      >
                        <TableCell className='font-medium text-foreground'>
                          <div className='space-y-0.5'>
                            <p>{ticket.ticketNumber}</p>
                            <p className='text-xs text-muted-foreground'>
                              {ticket.title}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{ticket.customer.name}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>
                          {getPriorityLabel(ticket.priority)}
                        </TableCell>
                        <TableCell>
                          {ticket.assignedTo
                            ? formatUserDisplayName(
                                ticket.assignedTo.name,
                                ticket.assignedTo.id,
                                authUser?.id
                              )
                            : 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          {formatTicketCategoryTimestamp(ticket.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isEditModalOpen ? (
        <UpdateTicketCategoryModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          category={category}
        />
      ) : null}

      <ConfirmAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title='Delete Ticket Category'
        description='This will permanently delete the category. Deletion will fail if existing tickets are still assigned to it.'
        confirmLabel='Delete Category'
        confirmVariant='destructive'
        isConfirming={deleteTicketCategoryMutation.isPending}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
};

export default ModeratorTicketCategoryDetails;
