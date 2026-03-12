'use client';

import { useMemo, useState } from 'react';
import CreateTicketCategoryModal from '@/components/dashboard/moderator/modals/CreateTicketCategoryModal';
import TicketCategoriesTable from '@/components/dashboard/moderator/ticket-categories/TicketCategoriesTable';
import { matchesTicketCategorySearch } from '@/components/dashboard/moderator/ticket-categories/ticket-category-formatters';
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
import { useTicketCategories } from '@/services/tickets/categories/queries';
import { FolderClosed, FolderKanban, Plus, Search, Ticket } from 'lucide-react';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const ModeratorTicketCategoriesContent = () => {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);
  const { data, isLoading, isFetching, isError, error } =
    useTicketCategories();

  const categories = data ?? [];

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        matchesTicketCategorySearch(category, searchInput)
      ),
    [categories, searchInput]
  );

  const totalPages = Math.max(Math.ceil(filteredCategories.length / pageSize), 1);
  const paginatedCategories = useMemo(
    () => filteredCategories.slice((page - 1) * pageSize, page * pageSize),
    [filteredCategories, page, pageSize]
  );

  const categoriesInUse = categories.filter(
    (category) => (category.ticketCount ?? 0) > 0
  ).length;
  const totalLinkedTickets = categories.reduce(
    (sum, category) => sum + (category.ticketCount ?? 0),
    0
  );

  return (
    <>
      <div className='space-y-6'>
        <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          <KPICard
            title='Total categories'
            value={categories.length}
            icon={<FolderClosed className='h-5 w-5' />}
            theme='slate'
            loading={isLoading}
          />
          <KPICard
            title='Categories in use'
            value={categoriesInUse}
            icon={<FolderKanban className='h-5 w-5' />}
            theme='blue'
            loading={isLoading}
          />
          <KPICard
            title='Linked tickets'
            value={totalLinkedTickets}
            icon={<Ticket className='h-5 w-5' />}
            theme='amber'
            loading={isLoading}
          />
        </section>

        <Card>
          <CardHeader className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
            <div>
              <CardTitle>Ticket categories</CardTitle>
              <CardDescription>
                Create, review, and maintain the categories used to classify tickets.
              </CardDescription>
            </div>

            <Button onClick={() => setIsCreateCategoryModalOpen(true)}>
              <Plus />
              New Category
            </Button>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='relative'>
              <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='search'
                value={searchInput}
                onChange={(event) => {
                  setPage(DEFAULT_PAGE);
                  setSearchInput(event.target.value);
                }}
                placeholder='Search by category name'
                className='pl-9'
              />
            </div>

            {isError ? (
              <p className='text-sm text-muted-foreground'>
                {error?.message || 'Unable to load ticket categories right now.'}
              </p>
            ) : !isLoading && filteredCategories.length === 0 ? (
              <EmptyState
                icon={FolderClosed}
                title='No categories match this search'
                description='Try a different category name or create a new category.'
              />
            ) : (
              <TicketCategoriesTable
                categories={paginatedCategories}
                total={filteredCategories.length}
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

      {isCreateCategoryModalOpen ? (
        <CreateTicketCategoryModal
          open={isCreateCategoryModalOpen}
          onOpenChange={setIsCreateCategoryModalOpen}
        />
      ) : null}
    </>
  );
};

export default ModeratorTicketCategoriesContent;
