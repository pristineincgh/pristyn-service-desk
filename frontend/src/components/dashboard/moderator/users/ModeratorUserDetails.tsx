'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddNewUserModal from '@/components/dashboard/moderator/modals/AddNewUserModal';
import AssignSupervisorModal from '@/components/dashboard/moderator/modals/AssignSupervisorModal';
import ConfirmAlertDialog from '@/components/common/modals/ConfirmAlertDialog';
import { EmptyState } from '@/components/common/EmptyState';
import KPICard from '@/components/common/cards/KPICard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BiMailSend } from 'react-icons/bi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  useResetUserPassword,
  useUpdateUserStatus,
} from '@/services/users/mutations';
import { useAllUsers, useUserDetailByScope } from '@/services/users/queries';
import { cn } from '@/lib/utils';
import { UserRole, UserStatus } from '@/types/user-types';
import { toast } from 'sonner';
import UpdateUserModal from './UpdateUserModal';
import {
  formatUserTimestamp,
  getUserInitials,
  roleBadgeClassMap,
  roleLabelMap,
  statusBadgeClassMap,
  statusLabelMap,
} from './user-formatters';
import {
  ArrowLeft,
  Building2,
  KeyRound,
  Mail,
  Phone,
  Power,
  ShieldUser,
  SquarePen,
  UserPlus,
  Users,
} from 'lucide-react';

type ModeratorUserDetailsProps = {
  userId: string;
};

const ModeratorUserDetails = ({ userId }: ModeratorUserDetailsProps) => {
  const router = useRouter();
  const [isAssignSupervisorModalOpen, setIsAssignSupervisorModalOpen] =
    useState(false);
  const [isAssignAgentModalOpen, setIsAssignAgentModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const {
    data: user,
    isLoading,
    isFetching,
    isError,
  } = useUserDetailByScope(userId);
  const { data: allUsersResponse } = useAllUsers();
  const updateUserStatusMutation = useUpdateUserStatus();
  const resetUserPasswordMutation = useResetUserPassword();

  const allUsers = allUsersResponse?.users ?? [];

  const supervisor = user?.supervisorId
    ? allUsers.find((candidate) => candidate.id === user.supervisorId) ?? null
    : null;

  const directReports = allUsers.filter(
    (candidate) => candidate.supervisorId === user?.id
  );

  const teammates = user?.supervisorId
    ? allUsers.filter(
        (candidate) =>
          candidate.supervisorId === user.supervisorId &&
          candidate.id !== user.id
      )
    : [];

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/dashboard/moderator/users');
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-48 w-full rounded-2xl' />
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='h-36 w-full rounded-2xl' />
          ))}
        </div>
      </div>
    );
  }

  if (!user || isError) {
    return (
      <div className='space-y-4'>
        <Button variant='outline' type='button' onClick={handleBack}>
          <ArrowLeft />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>User unavailable</CardTitle>
            <CardDescription>
              The requested user could not be loaded or is outside your access
              scope.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const nextStatus =
    user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;

  const handleStatusToggle = async () => {
    try {
      const response = await updateUserStatusMutation.mutateAsync({
        id: user.id,
        data: {
          status: nextStatus,
        },
      });

      toast.success(response.message || 'User status updated successfully');
      setIsStatusDialogOpen(false);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await resetUserPasswordMutation.mutateAsync(user.id);

      toast.success(response.message || 'Password reset successfully');
      toast.info('Temporary password generated', {
        description: response.defaultPassword,
      });
      setIsResetPasswordDialogOpen(false);
    } catch {
      // Error toast handled in mutation hook.
    }
  };

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
                <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
              </Avatar>

              <div className='space-y-3'>
                <div className='space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
                      {user.name}
                    </h1>
                    <Badge
                      variant='secondary'
                      className={cn('border-0', roleBadgeClassMap[user.role])}
                    >
                      {roleLabelMap[user.role]}
                    </Badge>
                    <Badge
                      variant='secondary'
                      className={cn(
                        'border-0',
                        statusBadgeClassMap[user.status]
                      )}
                    >
                      {statusLabelMap[user.status]}
                    </Badge>
                    <Badge variant='outline' className='rounded-md'>
                      {user.emailVerified ? 'Verified email' : 'Email pending'}
                    </Badge>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {user.email}
                    {isFetching ? ' (refreshing...)' : ''}
                  </p>
                </div>

                <div className='grid gap-2 text-sm text-muted-foreground sm:grid-cols-2'>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    {user.email}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    {user.phone ?? 'No phone on file'}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Building2 className='h-4 w-4' />
                    Created {formatUserTimestamp(user.createdAt)}
                  </div>
                  <div className='flex items-center gap-2'>
                    <ShieldUser className='h-4 w-4' />
                    Updated {formatUserTimestamp(user.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                // onClick={() => setIsEditUserModalOpen(true)}
              >
                <BiMailSend />
                Resend Email Verification
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className={cn('grid gap-6 grid-cols-3')}>
          <KPICard
            title='Role'
            value={roleLabelMap[user.role]}
            theme='slate'
            icon={<ShieldUser className='h-5 w-5' />}
          />
          <KPICard
            title='Status'
            value={statusLabelMap[user.status]}
            theme='emerald'
            icon={<Users className='h-5 w-5' />}
          />
          {user.role === UserRole.AGENT ? (
            <KPICard
              title='Supervisor'
              value={supervisor?.name ?? 'None'}
              theme='blue'
              icon={<Building2 className='h-5 w-5' />}
            />
          ) : null}
          {user.role === UserRole.SUPERVISOR ? (
            <KPICard
              title='Direct reports'
              value={directReports.length}
              theme='amber'
              icon={<Users className='h-5 w-5' />}
            />
          ) : null}
          {user.role === UserRole.MODERATOR ? (
            <KPICard
              title='Created'
              value={formatUserTimestamp(user.createdAt)}
              theme='blue'
              icon={<Building2 className='h-5 w-5' />}
            />
          ) : null}
        </section>

        {user.role !== UserRole.MODERATOR ? (
          <section
            className={cn(
              user.role === UserRole.AGENT &&
                'grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'
            )}
          >
            {user.role === UserRole.AGENT ? (
              <Card className='rounded-2xl border-border/70 shadow-sm'>
                <CardHeader>
                  <CardTitle>Profile details</CardTitle>
                  <CardDescription>
                    Core account and relationship information for this user.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-5'>
                  <div className='grid gap-4 sm:grid-cols-3'>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                        Email verification
                      </p>
                      <p className='mt-1 text-sm text-foreground'>
                        {user.emailVerified ? 'Verified' : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                        Supervisor
                      </p>
                      <p className='mt-1 text-sm text-foreground'>
                        {supervisor
                          ? supervisor.name
                          : 'No supervisor assigned'}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                        Team peers
                      </p>
                      <p className='mt-1 text-sm text-foreground'>
                        {teammates.length}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-3'>
                    <h2 className='text-sm font-medium text-foreground'>
                      Relationship snapshot
                    </h2>

                    <div className='space-y-3'>
                      <p className='text-sm text-muted-foreground'>
                        This agent
                        {supervisor
                          ? ` reports to ${supervisor.name}.`
                          : ' does not have a supervisor assigned yet.'}
                      </p>
                      {teammates.length > 0 ? (
                        <div className='flex flex-wrap gap-2'>
                          {teammates.map((teammate) => (
                            <Badge key={teammate.id} variant='outline'>
                              {teammate.name}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className='rounded-2xl border-border/70 shadow-sm'>
              <CardHeader>
                <CardTitle>Related users</CardTitle>
                <CardDescription>
                  Navigate to users directly connected to this account.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {supervisor ? (
                  <div className='rounded-xl border border-border/70 p-4'>
                    <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      Assigned supervisor
                    </p>
                    <Link
                      href={`/dashboard/moderator/users/${encodeURIComponent(supervisor.id)}`}
                      className='mt-2 block font-medium text-foreground hover:underline'
                    >
                      {supervisor.name}
                    </Link>
                    <p className='text-sm text-muted-foreground'>
                      {supervisor.email}
                    </p>
                  </div>
                ) : null}

                {directReports.length > 0 ? (
                  <div className='space-y-3'>
                    <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      Direct reports
                    </p>

                    <div className='flex flex-wrap items-center gap-4'>
                      {directReports.map((agent) => (
                        <Badge
                          key={agent.id}
                          variant={'outline'}
                          asChild
                          className='p-3 text-base rounded-md block h-auto'
                        >
                          <Link
                            key={agent.id}
                            href={`/dashboard/moderator/users/${encodeURIComponent(agent.id)}`}
                          >
                            <p className='font-medium text-foreground'>
                              {agent.name}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              {agent.email}
                            </p>
                          </Link>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!supervisor && directReports.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title='No related users'
                    description='Supervisor and report relationships will appear here when assigned.'
                  />
                ) : null}
              </CardContent>
            </Card>
          </section>
        ) : null}

        <Card className='rounded-2xl border-border/70 shadow-sm'>
          <CardHeader>
            <CardTitle>Account actions</CardTitle>
            <CardDescription>
              Moderator controls for account maintenance and access management.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-3'>
            <Button
              variant='outline'
              onClick={() => setIsEditUserModalOpen(true)}
            >
              <SquarePen />
              Update user details
            </Button>
            {user.role === UserRole.AGENT ? (
              <Button
                variant='outline'
                onClick={() => setIsAssignSupervisorModalOpen(true)}
              >
                <ShieldUser />
                Change supervisor assignment
              </Button>
            ) : null}
            {user.role === UserRole.SUPERVISOR ? (
              <Button
                variant='outline'
                onClick={() => setIsAssignAgentModalOpen(true)}
              >
                <ShieldUser />
                Assign to agent
              </Button>
            ) : null}
            <Button
              variant='outline'
              onClick={() => setIsResetPasswordDialogOpen(true)}
            >
              <KeyRound />
              Reset password
            </Button>
            <Button
              variant={
                user.status === UserStatus.ACTIVE
                  ? 'outline-destructive'
                  : 'outline'
              }
              onClick={() => setIsStatusDialogOpen(true)}
            >
              <Power />
              {user.status === UserStatus.ACTIVE
                ? 'Disable account'
                : 'Enable account'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {isEditUserModalOpen ? (
        <UpdateUserModal
          open={isEditUserModalOpen}
          onOpenChange={setIsEditUserModalOpen}
          user={user}
        />
      ) : null}

      {isAssignSupervisorModalOpen ? (
        <AssignSupervisorModal
          open={isAssignSupervisorModalOpen}
          onOpenChange={setIsAssignSupervisorModalOpen}
          agent={{ id: user.id, name: user.name }}
          forAgent={true}
        />
      ) : null}

      {isAssignAgentModalOpen ? (
        <AssignSupervisorModal
          open={isAssignAgentModalOpen}
          onOpenChange={setIsAssignAgentModalOpen}
          agent={{ id: user.id, name: user.name }}
        />
      ) : null}

      <ConfirmAlertDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        title={
          user.status === UserStatus.ACTIVE
            ? 'Disable User Account'
            : 'Enable User Account'
        }
        description={
          user.status === UserStatus.ACTIVE
            ? 'This user will no longer be able to sign in until the account is re-enabled.'
            : 'This user will regain access to sign in and continue using the system.'
        }
        confirmLabel={
          user.status === UserStatus.ACTIVE
            ? 'Disable Account'
            : 'Enable Account'
        }
        confirmVariant={
          user.status === UserStatus.ACTIVE ? 'destructive' : 'default'
        }
        isConfirming={updateUserStatusMutation.isPending}
        onConfirm={handleStatusToggle}
      />

      <ConfirmAlertDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
        title='Reset User Password'
        description='A new temporary password will be generated immediately. Share it securely with the user.'
        confirmLabel='Reset Password'
        isConfirming={resetUserPasswordMutation.isPending}
        onConfirm={handleResetPassword}
      />
    </>
  );
};

export default ModeratorUserDetails;
