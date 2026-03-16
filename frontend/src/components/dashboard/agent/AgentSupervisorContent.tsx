'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { formatUserDisplayName } from '@/lib/self-reference';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUsersByScope } from '@/services/users/queries';
import { useAuthStore } from '@/store/auth-store';
import { AlertCircle, Mail, Phone, ShieldUser } from 'lucide-react';
import Link from 'next/link';

const AgentSupervisorContent = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const { data, isLoading, isError } = useUsersByScope();
  const supervisor = data?.users?.[0] ?? null;

  return (
    <div className='space-y-6'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>Supervisor</h1>
        <p className='text-sm text-muted-foreground'>
          Contact details and assignment information for your reporting line.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading supervisor</CardTitle>
            <CardDescription>
              Fetching the supervisor currently assigned to your account.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load supervisor</CardTitle>
            <CardDescription>
              Your supervisor details could not be retrieved right now.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !supervisor ? (
        <EmptyState
          icon={AlertCircle}
          title='No supervisor assigned'
          description='A moderator has not linked this agent account to a supervisor yet.'
        />
      ) : (
        <section className='grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
          <Card>
            <CardHeader>
              <CardTitle>
                {formatUserDisplayName(
                  supervisor.name,
                  supervisor.id,
                  authUser?.id
                )}
              </CardTitle>
              <CardDescription>
                Primary supervisor for tickets in your queue.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-6 sm:grid-cols-2'>
              <div className='rounded-xl border p-4'>
                <div className='mb-3 flex items-center gap-2 text-sm font-medium'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  Email
                </div>
                <p className='text-sm text-foreground'>{supervisor.email}</p>
              </div>
              <div className='rounded-xl border p-4'>
                <div className='mb-3 flex items-center gap-2 text-sm font-medium'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  Phone
                </div>
                <p className='text-sm text-foreground'>
                  {supervisor.phone || 'No phone number added'}
                </p>
              </div>
              <div className='rounded-xl border p-4'>
                <div className='mb-3 flex items-center gap-2 text-sm font-medium'>
                  <ShieldUser className='h-4 w-4 text-muted-foreground' />
                  Role
                </div>
                <p className='text-sm text-foreground'>{supervisor.role}</p>
              </div>
              <div className='rounded-xl border p-4'>
                <div className='mb-3 flex items-center gap-2 text-sm font-medium'>
                  <AlertCircle className='h-4 w-4 text-muted-foreground' />
                  Account status
                </div>
                <p className='text-sm text-foreground'>{supervisor.status}</p>
              </div>
            </CardContent>
          </Card>

          <Card className='self-start'>
            <CardHeader>
              <CardTitle>How to use this contact</CardTitle>
              <CardDescription>
                Typical situations where you should reach out or reassign work.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 text-sm text-muted-foreground'>
              <p>
                Use your supervisor for approvals and ticket handoffs that
                exceed your support scope.
              </p>
              <p>
                Tickets can be reassigned directly from your ticket workspace if
                ownership needs to move.
              </p>
              <Button asChild className='w-full'>
                <Link href='/dashboard/agent/tickets'>
                  Open ticket workspace
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default AgentSupervisorContent;
