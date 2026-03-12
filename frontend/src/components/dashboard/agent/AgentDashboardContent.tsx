'use client';

import LatestTicketsTable from '@/components/dashboard/moderator/cards/LatestTicketsTable';
import KPICard from '@/components/common/cards/KPICard';
import NewTicketModal from '@/components/common/modals/NewTicketModal';
import AssignTicketModal from '@/components/common/modals/AssignTicketModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTickets } from '@/services/tickets/queries';
import { useUsersByScope } from '@/services/users/queries';
import { TicketStatus } from '@/types/ticket-types';
import {
  AlertTriangle,
  BriefcaseBusiness,
  Clock3,
  Inbox,
  LifeBuoy,
  MessageSquarePlus,
  Ticket,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const AgentDashboardContent = () => {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isAssignTicketModalOpen, setIsAssignTicketModalOpen] = useState(false);
  const ticketsQuery = useTickets(1, 50);
  const supervisorQuery = useUsersByScope();
  const tickets = useMemo(
    () => ticketsQuery.data?.tickets ?? [],
    [ticketsQuery.data?.tickets]
  );
  const total = ticketsQuery.data?.total ?? 0;
  const supervisor = supervisorQuery.data?.users?.[0] ?? null;

  const stats = useMemo(() => {
    const openCount = tickets.filter(
      (ticket) => ticket.status === TicketStatus.OPEN
    ).length;
    const inProgressCount = tickets.filter(
      (ticket) => ticket.status === TicketStatus.IN_PROGRESS
    ).length;
    const resolvedCount = tickets.filter(
      (ticket) => ticket.status === TicketStatus.RESOLVED
    ).length;
    const overdueCount = tickets.filter((ticket) => ticket.sla.breached).length;

    return {
      openCount,
      inProgressCount,
      resolvedCount,
      overdueCount,
    };
  }, [tickets]);

  return (
    <>
      <div className='space-y-6'>
        <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <KPICard
            title='My tickets'
            value={total}
            description='Tickets currently in your personal queue.'
            icon={<Ticket className='h-5 w-5' />}
            theme='blue'
            loading={ticketsQuery.isLoading}
          />
          <KPICard
            title='Open'
            value={stats.openCount}
            description='New work waiting to be picked up.'
            icon={<Inbox className='h-5 w-5' />}
            theme='amber'
            loading={ticketsQuery.isLoading}
          />
          <KPICard
            title='In progress'
            value={stats.inProgressCount}
            description='Tickets actively being investigated.'
            icon={<Clock3 className='h-5 w-5' />}
            theme='slate'
            loading={ticketsQuery.isLoading}
          />
          <KPICard
            title='At risk'
            value={stats.overdueCount}
            description='Tickets with breached SLA that need attention.'
            icon={<AlertTriangle className='h-5 w-5' />}
            theme='rose'
            loading={ticketsQuery.isLoading}
          />
        </section>

        <section className='grid gap-6 xl:grid-cols-[1.4fr_0.9fr]'>
          <Card className='rounded-2xl border-border/70 shadow-sm'>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                Create, assign, and review tickets without leaving the
                dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-3'>
              <Button onClick={() => setIsNewTicketModalOpen(true)}>
                <MessageSquarePlus />
                New ticket
              </Button>
              <Button
                variant='outline'
                onClick={() => setIsAssignTicketModalOpen(true)}
              >
                <BriefcaseBusiness />
                Reassign ticket
              </Button>
              <Button variant='outline' asChild>
                <Link href='/dashboard/agent/tickets'>
                  <Ticket />
                  Open workspace
                </Link>
              </Button>
              <Button variant='outline' asChild>
                <Link href='/dashboard/agent/supervisor'>
                  <UserRound />
                  View supervisor
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className='rounded-2xl border-border/70 shadow-sm'>
            <CardHeader>
              <CardTitle>Supervisor contact</CardTitle>
              <CardDescription>
                Your current supervisor and routing point for handoffs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supervisorQuery.isLoading ? (
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <p>Loading supervisor details...</p>
                </div>
              ) : supervisor ? (
                <div className='space-y-4'>
                  <div>
                    <p className='text-lg font-semibold'>{supervisor.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {supervisor.email}
                    </p>
                  </div>
                  <div className='grid gap-3 text-sm sm:grid-cols-2'>
                    <div>
                      <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                        Role
                      </p>
                      <p className='mt-1'>{supervisor.role}</p>
                    </div>
                    <div>
                      <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                        Status
                      </p>
                      <p className='mt-1'>{supervisor.status}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={LifeBuoy}
                  title='No supervisor assigned'
                  description='You can still create and manage your own tickets, but a supervisor has not been linked to your account yet.'
                />
              )}
            </CardContent>
          </Card>
        </section>

        <LatestTicketsTable
          tickets={tickets}
          total={total}
          isLoading={ticketsQuery.isLoading}
          errorMessage={ticketsQuery.error?.message}
          listHref='/dashboard/agent/tickets'
          ticketHrefBase='/dashboard/agent/tickets'
        />
      </div>

      <NewTicketModal
        open={isNewTicketModalOpen}
        onOpenChange={setIsNewTicketModalOpen}
      />

      <AssignTicketModal
        open={isAssignTicketModalOpen}
        onOpenChange={setIsAssignTicketModalOpen}
        tickets={tickets}
      />
    </>
  );
};

export default AgentDashboardContent;
