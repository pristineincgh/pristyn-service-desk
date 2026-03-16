'use client';

import { EmptyState } from '@/components/common/EmptyState';
import KPICard from '@/components/common/cards/KPICard';
import AssignTicketModal from '@/components/common/modals/AssignTicketModal';
import NewTicketModal from '@/components/common/modals/NewTicketModal';
import LatestTicketsTable from '@/components/dashboard/moderator/cards/LatestTicketsTable';
import { Button } from '@/components/ui/button';
import { formatUserDisplayName } from '@/lib/self-reference';
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
import { UserStatus } from '@/types/user-types';
import {
  AlertTriangle,
  BriefcaseBusiness,
  Clock3,
  MessageSquarePlus,
  ShieldCheck,
  Ticket,
  UserCog,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

const SupervisorDashboardContent = () => {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isAssignTicketModalOpen, setIsAssignTicketModalOpen] = useState(false);
  const authUser = useAuthStore((state) => state.authUser);
  const ticketsQuery = useTickets(1, 50);
  const teamQuery = useUsersByScope();

  const tickets = useMemo(
    () => ticketsQuery.data?.tickets ?? [],
    [ticketsQuery.data?.tickets]
  );
  const teamMembers = teamQuery.data?.users ?? [];
  const total = ticketsQuery.data?.total ?? 0;

  const stats = useMemo(() => {
    const openCount = tickets.filter(
      (ticket) => ticket.status === TicketStatus.OPEN
    ).length;
    const inProgressCount = tickets.filter(
      (ticket) => ticket.status === TicketStatus.IN_PROGRESS
    ).length;
    const overdueCount = tickets.filter((ticket) => ticket.sla.breached).length;
    const activeAgents = teamMembers.filter(
      (user) => user.status === UserStatus.ACTIVE
    ).length;

    return {
      openCount,
      inProgressCount,
      overdueCount,
      activeAgents,
    };
  }, [teamMembers, tickets]);

  const teamWorkload = useMemo(
    () =>
      teamMembers
        .map((member) => {
          const assignedCount = tickets.filter(
            (ticket) => ticket.assignedTo?.id === member.id
          ).length;
          const urgentCount = tickets.filter(
            (ticket) =>
              ticket.assignedTo?.id === member.id && ticket.sla.breached
          ).length;

          return {
            ...member,
            assignedCount,
            urgentCount,
          };
        })
        .sort((left, right) => right.assignedCount - left.assignedCount)
        .slice(0, 4),
    [teamMembers, tickets]
  );

  return (
    <>
      <div className='space-y-6'>
        <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <KPICard
            title='Team tickets'
            value={total}
            description='Tickets currently inside your supervisor scope.'
            icon={<Ticket className='h-5 w-5' />}
            theme='blue'
            loading={ticketsQuery.isLoading}
            detailsHref='/dashboard/supervisor/tickets'
            detailsLabel='Open workspace'
          />
          <KPICard
            title='Open queue'
            value={stats.openCount}
            description='New work waiting for triage or assignment.'
            icon={<Clock3 className='h-5 w-5' />}
            theme='amber'
            loading={ticketsQuery.isLoading}
          />
          <KPICard
            title='In progress'
            value={stats.inProgressCount}
            description='Tickets actively being handled by your team.'
            icon={<ShieldCheck className='h-5 w-5' />}
            theme='slate'
            loading={ticketsQuery.isLoading}
          />
          <KPICard
            title='Active agents'
            value={stats.activeAgents}
            description='Assigned agents currently available in your team.'
            icon={<Users className='h-5 w-5' />}
            theme='emerald'
            loading={teamQuery.isLoading}
            detailsHref='/dashboard/supervisor/team'
            detailsLabel='View team'
          />
        </section>

        <section className='grid gap-6 xl:grid-cols-[1.4fr_0.9fr]'>
          <Card className='rounded-2xl border-border/70 shadow-sm'>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                Stay on top of routing, new issues, and supervisor follow-ups.
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
                <Link href='/dashboard/supervisor/tickets'>
                  <Ticket />
                  Review tickets
                </Link>
              </Button>
              <Button variant='outline' asChild>
                <Link href='/dashboard/supervisor/team'>
                  <UserCog />
                  Review team
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className='rounded-2xl border-border/70 shadow-sm'>
            <CardHeader>
              <CardTitle>Workload watch</CardTitle>
              <CardDescription>
                A quick look at who has the heaviest queue right now.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teamQuery.isLoading ? (
                <p className='text-sm text-muted-foreground'>
                  Loading team workload...
                </p>
              ) : teamWorkload.length > 0 ? (
                <div className='space-y-3'>
                  {teamWorkload.map((member) => (
                    <div
                      key={member.id}
                      className='rounded-xl border border-border/70 p-4'
                    >
                      <div className='flex items-start justify-between gap-4'>
                        <div>
                          <p className='font-medium'>{member.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {member.email}
                          </p>
                        </div>
                        <div className='text-right text-sm'>
                          <p className='font-medium'>
                            {member.assignedCount} ticket
                            {member.assignedCount === 1 ? '' : 's'}
                          </p>
                          <p className='text-muted-foreground'>
                            {member.urgentCount} overdue
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title='No agents assigned'
                  description='Once agents are assigned to this supervisor, their workload snapshot will appear here.'
                />
              )}
            </CardContent>
          </Card>
        </section>

        <section className='grid gap-6 xl:grid-cols-[1.35fr_0.95fr]'>
          <LatestTicketsTable
            tickets={tickets}
            total={total}
            isLoading={ticketsQuery.isLoading}
            errorMessage={ticketsQuery.error?.message}
            listHref='/dashboard/supervisor/tickets'
            ticketHrefBase='/dashboard/supervisor/tickets'
          />

          <Card className='rounded-2xl border-border/70 shadow-sm'>
            <CardHeader>
              <CardTitle>Attention needed</CardTitle>
              <CardDescription>
                Tickets that are already past SLA and need supervisor action.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsQuery.isLoading ? (
                <p className='text-sm text-muted-foreground'>
                  Loading SLA alerts...
                </p>
              ) : stats.overdueCount > 0 ? (
                <div className='space-y-3'>
                  {tickets
                    .filter((ticket) => ticket.sla.breached)
                    .slice(0, 5)
                    .map((ticket) => (
                      <Link
                        key={ticket.id}
                        href={`/dashboard/supervisor/tickets/${ticket.id}`}
                        className='block rounded-xl border border-rose-200/70 bg-rose-50/50 p-4 transition-colors hover:bg-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/20 dark:hover:bg-rose-950/30'
                      >
                        <div className='flex items-start gap-3'>
                          <AlertTriangle className='mt-0.5 h-4 w-4 text-rose-600 dark:text-rose-400' />
                          <div className='min-w-0'>
                            <p className='font-medium'>{ticket.ticketNumber}</p>
                            <p className='truncate text-sm text-muted-foreground'>
                              {ticket.title}
                            </p>
                            <p className='mt-1 text-xs text-muted-foreground'>
                              {ticket.assignedTo
                                ? formatUserDisplayName(
                                    ticket.assignedTo.name,
                                    ticket.assignedTo.id,
                                    authUser?.id
                                  )
                                : 'Unassigned'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              ) : (
                <EmptyState
                  icon={ShieldCheck}
                  title='No overdue tickets'
                  description='Your team is currently staying within SLA targets.'
                />
              )}
            </CardContent>
          </Card>
        </section>
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

export default SupervisorDashboardContent;
