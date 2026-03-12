'use client';

import { useMemo, useState } from 'react';
import AddCustomerModal from '@/components/dashboard/moderator/modals/AddCustomerModal';
import CustomersTable from '@/components/dashboard/moderator/customers/CustomersTable';
import { matchesCustomerSearch } from '@/components/dashboard/moderator/customers/customer-formatters';
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
import { useCustomersQuery } from '@/services/customers/queries';
import { Search, UserPlus, UsersRound, UserRoundSearch } from 'lucide-react';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const ModeratorCustomersContent = () => {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const { data, isLoading, isFetching, isError, error } = useCustomersQuery();

  const customers = data?.customers ?? [];

  const filteredCustomers = useMemo(
    () => customers.filter((customer) => matchesCustomerSearch(customer, searchInput)),
    [customers, searchInput]
  );

  const totalPages = Math.max(Math.ceil(filteredCustomers.length / pageSize), 1);
  const paginatedCustomers = useMemo(
    () => filteredCustomers.slice((page - 1) * pageSize, page * pageSize),
    [filteredCustomers, page, pageSize]
  );

  const customersWithEmail = customers.filter((customer) => !!customer.email).length;

  const resetTableState = () => {
    setPage(DEFAULT_PAGE);
  };

  return (
    <>
      <div className='space-y-6'>
        <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          <KPICard
            title='Total customers'
            value={customers.length}
            icon={<UsersRound className='h-5 w-5' />}
            theme='slate'
            loading={isLoading}
          />
          <KPICard
            title='With email'
            value={customersWithEmail}
            icon={<UserRoundSearch className='h-5 w-5' />}
            theme='blue'
            loading={isLoading}
          />
          <KPICard
            title='Phone only'
            value={customers.length - customersWithEmail}
            icon={<UsersRound className='h-5 w-5' />}
            theme='amber'
            loading={isLoading}
          />
        </section>

        <Card>
          <CardHeader className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>
                Browse and manage customer contact records.
              </CardDescription>
            </div>

            <Button onClick={() => setIsAddCustomerModalOpen(true)}>
              <UserPlus />
              Add Customer
            </Button>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='relative'>
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

            {isError ? (
              <p className='text-sm text-muted-foreground'>
                {error?.message || 'Unable to load customers right now.'}
              </p>
            ) : !isLoading && filteredCustomers.length === 0 ? (
              <EmptyState
                icon={UsersRound}
                title='No customers match this search'
                description='Try a different name, email, or phone search term.'
              />
            ) : (
              <CustomersTable
                customers={paginatedCustomers}
                total={filteredCustomers.length}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                isLoading={isLoading}
                isFetching={isFetching}
                onPageChange={(nextPage) => {
                  const boundedPage = Math.min(Math.max(nextPage, 1), totalPages);
                  setPage(boundedPage);
                }}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(DEFAULT_PAGE);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {isAddCustomerModalOpen ? (
        <AddCustomerModal
          open={isAddCustomerModalOpen}
          onOpenChange={setIsAddCustomerModalOpen}
        />
      ) : null}
    </>
  );
};

export default ModeratorCustomersContent;
