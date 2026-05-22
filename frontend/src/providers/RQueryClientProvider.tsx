'use client';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

import type * as React from 'react';

export default function RQueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // defaultOptions: {
        // 	queries: {
        // 		staleTime: 3 * 60 * 1000, // 3 mins
        // 		gcTime: 5 * 60 * 1000, // 5 mins
        // 		refetchOnWindowFocus: true,
        // 		refetchOnMount: false,
        // 		refetchOnReconnect: false,
        // 		retry: 1,
        // 	},
        // },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <div className='no-print'>
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  );
}
