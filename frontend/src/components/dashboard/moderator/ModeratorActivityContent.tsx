'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { History, Search, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/common/EmptyState';
import ActivityLogTable from '@/components/dashboard/moderator/activity/ActivityLogTable';
import {
  activityActionOptions,
  activityEntityOptions,
  formatActivityTimestamp,
} from '@/components/dashboard/moderator/activity/activity-formatters';
import { useActivities } from '@/services/activity/queries';
import { useAllUsers } from '@/services/users/queries';
import { type ActivityFilters } from '@/types/activity-types';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const ALL_FILTER_VALUE = 'ALL';

const ModeratorActivityContent = () => {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedActorId, setSelectedActorId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const deferredSearch = useDeferredValue(searchInput.trim());
  const { data: usersResponse } = useAllUsers();

  const activityFilters = useMemo<ActivityFilters>(
    () => ({
      ...(deferredSearch ? { search: deferredSearch } : {}),
      ...(selectedEntityType
        ? { entityType: selectedEntityType as ActivityFilters['entityType'] }
        : {}),
      ...(selectedAction
        ? { action: selectedAction as ActivityFilters['action'] }
        : {}),
      ...(selectedActorId ? { actorId: selectedActorId } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }),
    [
      dateFrom,
      dateTo,
      deferredSearch,
      selectedAction,
      selectedActorId,
      selectedEntityType,
    ]
  );

  const { data, isLoading, isFetching, isError, error } = useActivities(
    page,
    pageSize,
    activityFilters
  );

  const activities = data?.activities ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasActiveFilters = Object.keys(activityFilters).length > 0;
  const generatedAtLabel = data?.generatedAt
    ? formatActivityTimestamp(data.generatedAt)
    : null;

  const actorOptions = usersResponse?.users ?? [];

  const resetTableState = () => {
    setPage(DEFAULT_PAGE);
  };

  const clearFilters = () => {
    resetTableState();
    setSearchInput('');
    setSelectedEntityType('');
    setSelectedAction('');
    setSelectedActorId('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Review operational events across tickets, users, customers, and
              ticket categories.
            </CardDescription>
          </div>
          {generatedAtLabel ? (
            <p className='text-sm text-muted-foreground'>
              Last refreshed {generatedAtLabel}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='relative w-md'>
              <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='search'
                value={searchInput}
                onChange={(event) => {
                  resetTableState();
                  setSearchInput(event.target.value);
                }}
                placeholder='Search actor, ticket, user, or entity id'
                className='pl-9'
              />
            </div>

            {hasActiveFilters ? (
              <Button
                type='button'
                variant='outline'
                onClick={clearFilters}
                className='h-11'
              >
                <X />
                Clear
              </Button>
            ) : null}
          </div>

          <div className='grid grid-cols-5 gap-3'>
            <Select
              value={selectedEntityType || ALL_FILTER_VALUE}
              onValueChange={(value) => {
                resetTableState();
                setSelectedEntityType(value === ALL_FILTER_VALUE ? '' : value);
              }}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='All entities' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>All entities</SelectItem>
                {activityEntityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedAction || ALL_FILTER_VALUE}
              onValueChange={(value) => {
                resetTableState();
                setSelectedAction(value === ALL_FILTER_VALUE ? '' : value);
              }}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='All actions' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>All actions</SelectItem>
                {activityActionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedActorId || ALL_FILTER_VALUE}
              onValueChange={(value) => {
                resetTableState();
                setSelectedActorId(value === ALL_FILTER_VALUE ? '' : value);
              }}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='All actors' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>All actors</SelectItem>
                {actorOptions.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type='date'
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => {
                resetTableState();
                setDateFrom(event.target.value);
              }}
              aria-label='Filter from date'
            />
            <Input
              type='date'
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
                resetTableState();
                setDateTo(event.target.value);
              }}
              aria-label='Filter to date'
            />
          </div>

          {isError ? (
            <EmptyState
              icon={History}
              title='Activity log unavailable'
              description={
                error?.message || 'Unable to load activity right now.'
              }
            />
          ) : (
            <ActivityLogTable
              activities={activities}
              total={total}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              isLoading={isLoading}
              isFetching={isFetching}
              onPageChange={(nextPage) => {
                const boundedPage = Math.min(
                  Math.max(nextPage, 1),
                  Math.max(totalPages, 1)
                );
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
  );
};

export default ModeratorActivityContent;
