'use client';

import UserKPIs from '@/components/dashboard/moderator/cards/UserKPIs';
import LatestTicketsTable from '@/components/dashboard/moderator/cards/LatestTicketsTable';
import QuickActions from '@/components/dashboard/moderator/cards/QuickActions';
import TicketSummary from '@/components/dashboard/moderator/cards/TicketSummary';
import TicketCategorySummary from '@/components/dashboard/moderator/cards/TicketCategorySummary';
import ResolvedVsAllLineChart from '@/components/dashboard/moderator/charts/ResolvedVsAllLineChart';
import TicketPriorityPieChart from '@/components/dashboard/moderator/charts/TicketPriorityPieChart';
import TicketStatusPieChart from '@/components/dashboard/moderator/charts/TicketStatusPieChart';
import { useCustomersQuery } from '@/services/customers/queries';
import { useTickets } from '@/services/tickets/queries';
import { useActiveUsers } from '@/services/users/queries';
import { UserRole } from '@/types/user-types';
import { useState } from 'react';
import NewTicketModal from '@/components/common/modals/NewTicketModal';
import AssignTicketModal from '@/components/common/modals/AssignTicketModal';
import AddCustomerModal from './modals/AddCustomerModal';
import AddNewUserModal from './modals/AddNewUserModal';
import AssignSupervisorModal from './modals/AssignSupervisorModal';
import CreateTicketCategoryModal from './modals/CreateTicketCategoryModal';

const ModeratorDashboardContent = () => {
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isAssignTicketModalOpen, setIsAssignTicketModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isAssignSupervisorModalOpen, setIsAssignSupervisorModalOpen] =
    useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);

  const activeUsersQuery = useActiveUsers();
  const customersQuery = useCustomersQuery();
  const ticketsQuery = useTickets(1, 100);

  const activeUsers = activeUsersQuery.data?.users ?? [];
  const tickets = ticketsQuery.data?.tickets ?? [];

  const agentCount = activeUsers.filter(
    (user) => user.role === UserRole.AGENT
  ).length;
  const supervisorCount = activeUsers.filter(
    (user) => user.role === UserRole.SUPERVISOR
  ).length;
  const customerCount = customersQuery.data?.total ?? 0;

  const userKpisLoading =
    activeUsersQuery.isLoading || customersQuery.isLoading;

  return (
    <div className='space-y-6'>
      <UserKPIs
        agentCount={agentCount}
        supervisorCount={supervisorCount}
        customerCount={customerCount}
        isLoading={userKpisLoading}
      />

      <QuickActions
        onCreateTicket={() => setIsNewTicketModalOpen(true)}
        onAssignTicket={() => setIsAssignTicketModalOpen(true)}
        onAddUser={() => setIsNewUserModalOpen(true)}
        onAddCustomer={() => setIsNewCustomerModalOpen(true)}
        onAssignSupervisor={() => setIsAssignSupervisorModalOpen(true)}
        onCreateCategory={() => setIsCreateCategoryModalOpen(true)}
      />

      <section className='grid grid-cols-1 gap-6 xl:grid-cols-5'>
        <div className='xl:col-span-3'>
          <TicketSummary
            tickets={tickets}
            total={ticketsQuery.data?.total ?? 0}
            isLoading={ticketsQuery.isLoading}
            errorMessage={ticketsQuery.error?.message}
          />
        </div>
        <div className='xl:col-span-2'>
          <TicketStatusPieChart
            tickets={tickets}
            total={ticketsQuery.data?.total ?? 0}
            isLoading={ticketsQuery.isLoading}
            errorMessage={ticketsQuery.error?.message}
          />
        </div>
      </section>

      <section className='grid gap-6 xl:grid-cols-3'>
        <TicketCategorySummary
          tickets={tickets}
          total={ticketsQuery.data?.total ?? 0}
          isLoading={ticketsQuery.isLoading}
          errorMessage={ticketsQuery.error?.message}
        />
        <TicketPriorityPieChart
          tickets={tickets}
          total={ticketsQuery.data?.total ?? 0}
          isLoading={ticketsQuery.isLoading}
          errorMessage={ticketsQuery.error?.message}
        />
        <ResolvedVsAllLineChart
          tickets={tickets}
          total={ticketsQuery.data?.total ?? 0}
          isLoading={ticketsQuery.isLoading}
          errorMessage={ticketsQuery.error?.message}
        />
      </section>

      <LatestTicketsTable
        tickets={tickets}
        total={ticketsQuery.data?.total ?? 0}
        isLoading={ticketsQuery.isLoading}
        errorMessage={ticketsQuery.error?.message}
      />

      {isNewTicketModalOpen && (
        <NewTicketModal
          open={isNewTicketModalOpen}
          onOpenChange={setIsNewTicketModalOpen}
        />
      )}
      {isAssignTicketModalOpen && (
        <AssignTicketModal
          open={isAssignTicketModalOpen}
          onOpenChange={setIsAssignTicketModalOpen}
          tickets={tickets}
        />
      )}
      {isNewUserModalOpen && (
        <AddNewUserModal
          open={isNewUserModalOpen}
          onOpenChange={setIsNewUserModalOpen}
        />
      )}
      {isNewCustomerModalOpen && (
        <AddCustomerModal
          open={isNewCustomerModalOpen}
          onOpenChange={setIsNewCustomerModalOpen}
        />
      )}
      {isAssignSupervisorModalOpen && (
        <AssignSupervisorModal
          open={isAssignSupervisorModalOpen}
          onOpenChange={setIsAssignSupervisorModalOpen}
        />
      )}
      {isCreateCategoryModalOpen && (
        <CreateTicketCategoryModal
          open={isCreateCategoryModalOpen}
          onOpenChange={setIsCreateCategoryModalOpen}
        />
      )}
    </div>
  );
};

export default ModeratorDashboardContent;
