'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmAlertDialog from '@/components/common/modals/ConfirmAlertDialog';
import KPICard from '@/components/common/cards/KPICard';
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
import { useDeleteCustomer } from '@/services/customers/mutations';
import { useCustomerQuery } from '@/services/customers/queries';
import { TicketPriority } from '@/types/ticket-types';
import { toast } from 'sonner';
import UpdateCustomerModal from './UpdateCustomerModal';
import {
  formatCustomerTimestamp,
  getCustomerInitials,
} from './customer-formatters';
import {
  ArrowLeft,
  ArrowRight,
  Inbox,
  Mail,
  Phone,
  SquarePen,
  Trash2,
  UsersRound,
} from 'lucide-react';

type ModeratorCustomerDetailsProps = {
  customerId: string;
};

const ModeratorCustomerDetails = ({
  customerId,
}: ModeratorCustomerDetailsProps) => {
  const router = useRouter();
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isDeleteCustomerDialogOpen, setIsDeleteCustomerDialogOpen] =
    useState(false);
  const {
    data: customer,
    isLoading,
    isFetching,
    isError,
  } = useCustomerQuery(customerId);
  const deleteCustomerMutation = useDeleteCustomer();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/dashboard/moderator/customers');
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

  const handleDeleteCustomer = async () => {
    if (!customer) {
      return;
    }

    try {
      const response = await deleteCustomerMutation.mutateAsync(customer.id);

      toast.success(response.message || 'Customer deleted successfully');
      setIsDeleteCustomerDialogOpen(false);
      router.push('/dashboard/moderator/customers');
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

  if (!customer || isError) {
    return (
      <div className='space-y-4'>
        <Button variant='outline' type='button' onClick={handleBack}>
          <ArrowLeft />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Customer unavailable</CardTitle>
            <CardDescription>
              The requested customer record could not be loaded.
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
                  {getCustomerInitials(customer.name)}
                </AvatarFallback>
              </Avatar>

              <div className='space-y-3'>
                <div className='space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
                      {customer.name}
                    </h1>
                    <Badge variant='outline' className='rounded-md'>
                      Customer
                    </Badge>
                    <Badge
                      variant={customer.email ? 'outline' : 'secondary'}
                      className='rounded-md'
                    >
                      {customer.email ? 'Email and phone' : 'Phone only'}
                    </Badge>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {customer.email ?? 'No email on file'}
                    {isFetching ? ' (refreshing...)' : ''}
                  </p>
                </div>

                <div className='grid gap-2 text-sm text-muted-foreground sm:grid-cols-2'>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    {customer.phone}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    {customer.email ?? 'No email on file'}
                  </div>
                  <div className='flex items-center gap-2'>
                    <UsersRound className='h-4 w-4' />
                    Created {formatCustomerTimestamp(customer.createdAt)}
                  </div>
                  <div className='flex items-center gap-2'>
                    <UsersRound className='h-4 w-4' />
                    Updated {formatCustomerTimestamp(customer.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                onClick={() => setIsEditCustomerModalOpen(true)}
              >
                <SquarePen />
                Edit Customer
              </Button>
              <Button
                variant='outline-destructive'
                onClick={() => setIsDeleteCustomerDialogOpen(true)}
              >
                <Trash2 />
                Delete Customer
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          <KPICard
            title='Customer name'
            value={customer.name}
            icon={<UsersRound className='h-5 w-5' />}
            theme='slate'
          />
          <KPICard
            title='Primary phone'
            value={customer.phone}
            icon={<Phone className='h-5 w-5' />}
            theme='blue'
          />
          <KPICard
            title='Email'
            value={customer.email ?? 'Not provided'}
            icon={<Mail className='h-5 w-5' />}
            theme='amber'
          />
        </section>

        <Card className='rounded-2xl border-border/70 shadow-sm'>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              Contact and audit information for this customer record.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-5'>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Contact mode
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {customer.email ? 'Email and phone' : 'Phone only'}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Created
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {formatCustomerTimestamp(customer.createdAt)}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Last updated
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {formatCustomerTimestamp(customer.updatedAt)}
                </p>
              </div>
            </div>

            <Separator />

            <div className='space-y-3'>
              <h2 className='text-sm font-medium text-foreground'>
                Account summary
              </h2>
              <p className='text-sm text-muted-foreground'>
                Use this page to update the customer contact record or remove it
                if it is no longer linked to active ticket workflows.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-2xl border-border/70 shadow-sm'>
          <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div className='space-y-1'>
              <CardTitle>Customer tickets</CardTitle>
              <CardDescription>
                Review every ticket raised for this customer and open any row
                for full ticket details.
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
            {customer.tickets.length === 0 ? (
              <div className='flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-10 text-center'>
                <Inbox className='mb-3 h-10 w-10 text-muted-foreground' />
                <h3 className='text-sm font-medium text-foreground'>
                  No tickets for this customer
                </h3>
                <p className='mt-1 max-w-md text-sm text-muted-foreground'>
                  Tickets linked to this customer will appear here once support
                  requests are created.
                </p>
              </div>
            ) : (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.tickets.map((ticket) => (
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
                        <TableCell>
                          {ticket.ticketCategory?.name ?? 'Unassigned'}
                        </TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{getPriorityLabel(ticket.priority)}</TableCell>
                        <TableCell>
                          {ticket.assignedTo?.name ?? 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          {formatCustomerTimestamp(ticket.createdAt)}
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

      {isEditCustomerModalOpen ? (
        <UpdateCustomerModal
          open={isEditCustomerModalOpen}
          onOpenChange={setIsEditCustomerModalOpen}
          customer={customer}
        />
      ) : null}

      <ConfirmAlertDialog
        open={isDeleteCustomerDialogOpen}
        onOpenChange={setIsDeleteCustomerDialogOpen}
        title='Delete Customer'
        description='This will permanently delete the customer record. Deletion will fail if tickets are still linked to this customer.'
        confirmLabel='Delete Customer'
        confirmVariant='destructive'
        isConfirming={deleteCustomerMutation.isPending}
        onConfirm={handleDeleteCustomer}
      />
    </>
  );
};

export default ModeratorCustomerDetails;
