'use client';

import { EmptyState } from '@/components/common/EmptyState';
import KPICard from '@/components/common/cards/KPICard';
import { Badge } from '@/components/ui/badge';
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
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  Ticket,
  UserCog,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';

const SupervisorTeamContent = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const teamQuery = useUsersByScope();
  const ticketsQuery = useTickets(1, 200);
  const teamMembers = teamQuery.data?.users ?? [];
  const tickets = ticketsQuery.data?.tickets ?? [];

  const stats = useMemo(() => {
    const activeCount = teamMembers.filter(
      (member) => member.status === UserStatus.ACTIVE
    ).length;
    const verifiedCount = teamMembers.filter(
      (member) => member.emailVerified
    ).length;
    const inProgressCount = tickets.filter(
      (ticket) => ticket.status === TicketStatus.IN_PROGRESS
    ).length;

    return {
      activeCount,
      verifiedCount,
      inProgressCount,
    };
  }, [teamMembers, tickets]);

  const membersWithLoad = useMemo(
    () =>
      teamMembers.map((member) => {
        const assignedTickets = tickets.filter(
          (ticket) => ticket.assignedTo?.id === member.id
        );
        const openCount = assignedTickets.filter(
          (ticket) => ticket.status === TicketStatus.OPEN
        ).length;
        const inProgressCount = assignedTickets.filter(
          (ticket) => ticket.status === TicketStatus.IN_PROGRESS
        ).length;
        const overdueCount = assignedTickets.filter(
          (ticket) => ticket.sla.breached
        ).length;

        return {
          ...member,
          assignedCount: assignedTickets.length,
          openCount,
          inProgressCount,
          overdueCount,
        };
      }),
    [teamMembers, tickets]
  );

  return (
    <div className='space-y-6'>
      <section className='space-y-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>Team overview</h1>
        <p className='text-sm text-muted-foreground'>
          Monitor your assigned agents, workload balance, and readiness at a
          glance.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <KPICard
          title='Assigned agents'
          value={teamMembers.length}
          description='Agents currently mapped to your supervisor account.'
          icon={<Users className='h-5 w-5' />}
          theme='blue'
          loading={teamQuery.isLoading}
        />
        <KPICard
          title='Active agents'
          value={stats.activeCount}
          description='Team members who can actively receive work.'
          icon={<ShieldCheck className='h-5 w-5' />}
          theme='emerald'
          loading={teamQuery.isLoading}
        />
        <KPICard
          title='Verified accounts'
          value={stats.verifiedCount}
          description='Agents who have completed email verification.'
          icon={<CheckCircle2 className='h-5 w-5' />}
          theme='amber'
          loading={teamQuery.isLoading}
        />
        <KPICard
          title='In progress'
          value={stats.inProgressCount}
          description='Scoped tickets actively being worked by the team.'
          icon={<Ticket className='h-5 w-5' />}
          theme='slate'
          loading={ticketsQuery.isLoading}
          detailsHref='/dashboard/supervisor/tickets'
          detailsLabel='View tickets'
        />
      </section>

      <Card className='rounded-2xl border-border/70 shadow-sm'>
        <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <CardTitle>Assigned agents</CardTitle>
            <CardDescription>
              Each card shows contact info, account state, and current ticket
              load.
            </CardDescription>
          </div>
          <Button variant='outline' asChild>
            <Link href='/dashboard/supervisor/tickets'>
              <Ticket />
              Open ticket workspace
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {teamQuery.isLoading ? (
            <p className='text-sm text-muted-foreground'>Loading team...</p>
          ) : membersWithLoad.length === 0 ? (
            <EmptyState
              icon={UserCog}
              title='No assigned agents'
              description='A moderator needs to assign agents to this supervisor before team management features become active.'
            />
          ) : (
            <div className='grid gap-4 xl:grid-cols-2'>
              {membersWithLoad.map((member) => (
                <Card key={member.id} className='rounded-2xl border-border/70'>
                  <CardHeader className='space-y-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <CardTitle className='text-lg'>
                          {formatUserDisplayName(
                            member.name,
                            member.id,
                            authUser?.id
                          )}
                        </CardTitle>
                        <CardDescription>{member.email}</CardDescription>
                      </div>
                      <Badge variant='secondary'>
                        {member.status === UserStatus.ACTIVE
                          ? 'Active'
                          : 'Inactive'}
                      </Badge>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <Badge variant='outline'>
                        {member.emailVerified
                          ? 'Email verified'
                          : 'Email pending'}
                      </Badge>
                      {member.mustChangePassword ? (
                        <Badge variant='outline'>Password reset pending</Badge>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div className='rounded-xl border border-border/70 p-3'>
                        <div className='mb-2 flex items-center gap-2 text-sm font-medium'>
                          <Mail className='h-4 w-4 text-muted-foreground' />
                          Email
                        </div>
                        <p className='text-sm'>{member.email}</p>
                      </div>
                      <div className='rounded-xl border border-border/70 p-3'>
                        <div className='mb-2 flex items-center gap-2 text-sm font-medium'>
                          <Phone className='h-4 w-4 text-muted-foreground' />
                          Phone
                        </div>
                        <p className='text-sm'>
                          {member.phone || 'No phone number added'}
                        </p>
                      </div>
                    </div>

                    <div className='grid gap-3 sm:grid-cols-3'>
                      <div className='rounded-xl border border-border/70 p-3'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                          Assigned
                        </p>
                        <p className='mt-1 text-xl font-semibold'>
                          {member.assignedCount}
                        </p>
                      </div>
                      <div className='rounded-xl border border-border/70 p-3'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                          Open
                        </p>
                        <p className='mt-1 text-xl font-semibold'>
                          {member.openCount}
                        </p>
                      </div>
                      <div className='rounded-xl border border-border/70 p-3'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                          Overdue
                        </p>
                        <p className='mt-1 text-xl font-semibold'>
                          {member.overdueCount}
                        </p>
                      </div>
                    </div>

                    <div className='rounded-xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground'>
                      {member.inProgressCount} ticket
                      {member.inProgressCount === 1 ? '' : 's'} are currently in
                      progress for this agent.
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisorTeamContent;
