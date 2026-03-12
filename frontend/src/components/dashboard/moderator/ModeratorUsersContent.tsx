'use client';

import { useMemo, useState } from 'react';
import AddNewUserModal from '@/components/dashboard/moderator/modals/AddNewUserModal';
import AssignSupervisorModal from '@/components/dashboard/moderator/modals/AssignSupervisorModal';
import UsersTable from '@/components/dashboard/moderator/users/UsersTable';
import {
  matchesUserSearch,
  roleLabelMap,
} from '@/components/dashboard/moderator/users/user-formatters';
import { EmptyState } from '@/components/common/EmptyState';
import KPICard from '@/components/common/cards/KPICard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAllUsers } from '@/services/users/queries';
import { UserRole, type UserSummary } from '@/types/user-types';
import {
  Headset,
  Search,
  ShieldUser,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

type UserStatusTab = 'all' | 'active' | 'inactive';

const ModeratorUsersContent = () => {
  const [activeTab, setActiveTab] = useState<UserStatusTab>('all');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAssignSupervisorModalOpen, setIsAssignSupervisorModalOpen] =
    useState(false);
  const {
    data: allUsersResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useAllUsers();

  const allUsers = allUsersResponse?.users ?? [];

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesTab =
        activeTab === 'all' ? true : user.status === activeTab.toUpperCase();
      const matchesRole = roleFilter ? user.role === roleFilter : true;

      return matchesTab && matchesRole && matchesUserSearch(user, searchInput);
    });
  }, [activeTab, allUsers, roleFilter, searchInput]);

  const totalPages = Math.max(Math.ceil(filteredUsers.length / pageSize), 1);
  const paginatedUsers = useMemo(
    () => filteredUsers.slice((page - 1) * pageSize, page * pageSize),
    [filteredUsers, page, pageSize],
  );

  const usersById = useMemo(
    () =>
      Object.fromEntries(
        allUsers.map((user) => [user.id, user.name] satisfies [string, string]),
      ),
    [allUsers],
  );

  const kpis = useMemo(() => {
    const activeUsers = allUsers.filter((user) => user.status === 'ACTIVE');
    const inactiveUsers = allUsers.filter((user) => user.status === 'INACTIVE');
    const activeAgents = activeUsers.filter((user) => user.role === 'AGENT');
    const activeSupervisors = activeUsers.filter(
      (user) => user.role === 'SUPERVISOR',
    );

    return [
      {
        title: 'Total users',
        value: allUsers.length,
        icon: <Users className='h-5 w-5' />,
        theme: 'slate' as const,
      },
      {
        title: 'Active agents',
        value: activeAgents.length,
        icon: <Headset className='h-5 w-5' />,
        theme: 'blue' as const,
      },
      {
        title: 'Active supervisors',
        value: activeSupervisors.length,
        icon: <ShieldUser className='h-5 w-5' />,
        theme: 'emerald' as const,
      },
      {
        title: 'Inactive users',
        value: inactiveUsers.length,
        icon: <UserCog className='h-5 w-5' />,
        theme: 'amber' as const,
      },
    ];
  }, [allUsers]);

  const resetTableState = () => {
    setPage(DEFAULT_PAGE);
  };

  const clearFilters = () => {
    resetTableState();
    setSearchInput('');
    setRoleFilter('');
    setActiveTab('all');
  };

  const renderUsersContent = (users: UserSummary[]) => {
    if (isError) {
      return (
        <p className='text-sm text-muted-foreground'>
          {error?.message || 'Unable to load users right now.'}
        </p>
      );
    }

    if (!isLoading && users.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title='No users match these filters'
          description='Try changing the status tab, role filter, or search term.'
          actions={[
            {
              label: 'Clear filters',
              onClick: clearFilters,
              variant: 'outline',
            },
          ]}
        />
      );
    }

    return (
      <UsersTable
        users={users}
        total={filteredUsers.length}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        isLoading={isLoading}
        isFetching={isFetching}
        roleFilter={roleFilter}
        supervisorLookup={usersById}
        onPageChange={(nextPage) => {
          const boundedPage = Math.min(Math.max(nextPage, 1), totalPages);
          setPage(boundedPage);
        }}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(DEFAULT_PAGE);
        }}
      />
    );
  };

  return (
    <>
      <div className='space-y-6'>
        <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {kpis.map((card) => (
            <KPICard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              theme={card.theme}
              loading={isLoading}
            />
          ))}
        </section>

        <Card>
          <CardHeader className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Browse moderators, supervisors, and agents from one place.
              </CardDescription>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button onClick={() => setIsAddUserModalOpen(true)}>
                <UserPlus />
                Add User
              </Button>
              <Button
                variant='outline'
                onClick={() => setIsAssignSupervisorModalOpen(true)}
              >
                <ShieldUser />
                Assign Supervisor
              </Button>
            </div>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
              <div className='relative flex-1'>
                <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  type='search'
                  value={searchInput}
                  onChange={(event) => {
                    resetTableState();
                    setSearchInput(event.target.value);
                  }}
                  placeholder='Search by name, email, or phone'
                  className='pl-9'
                />
              </div>

              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant={roleFilter === '' ? 'default' : 'outline'}
                  onClick={() => {
                    resetTableState();
                    setRoleFilter('');
                  }}
                >
                  All roles
                </Button>
                {Object.values(UserRole).map((role) => (
                  <Button
                    key={role}
                    type='button'
                    variant={roleFilter === role ? 'default' : 'outline'}
                    onClick={() => {
                      resetTableState();
                      setRoleFilter(role);
                    }}
                  >
                    {roleLabelMap[role]}
                  </Button>
                ))}
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                resetTableState();
                setActiveTab(value as UserStatusTab);
              }}
              className='space-y-4'
            >
              <TabsList variant='line'>
                <TabsTrigger value='all'>All ({allUsers.length})</TabsTrigger>
                <TabsTrigger value='active'>
                  Active (
                  {allUsers.filter((user) => user.status === 'ACTIVE').length})
                </TabsTrigger>
                <TabsTrigger value='inactive'>
                  Inactive (
                  {allUsers.filter((user) => user.status === 'INACTIVE').length}
                  )
                </TabsTrigger>
              </TabsList>

              <TabsContent value='all'>
                {renderUsersContent(paginatedUsers)}
              </TabsContent>
              <TabsContent value='active'>
                {renderUsersContent(paginatedUsers)}
              </TabsContent>
              <TabsContent value='inactive'>
                {renderUsersContent(paginatedUsers)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {isAddUserModalOpen ? (
        <AddNewUserModal
          open={isAddUserModalOpen}
          onOpenChange={setIsAddUserModalOpen}
        />
      ) : null}

      {isAssignSupervisorModalOpen ? (
        <AssignSupervisorModal
          open={isAssignSupervisorModalOpen}
          onOpenChange={setIsAssignSupervisorModalOpen}
        />
      ) : null}
    </>
  );
};

export default ModeratorUsersContent;
