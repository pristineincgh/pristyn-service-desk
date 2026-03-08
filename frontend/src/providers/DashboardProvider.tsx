'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Loader from '@/components/common/Loader';
import { useAuthStore } from '@/store/auth-store';
import { getDashboardByRole, isDashboardPathAllowed } from '@/lib/roles';

export default function DashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const authUser = useAuthStore((state) => state.authUser);
  const authStatus = useAuthStore((state) => state.authStatus);

  useEffect(() => {
    if (authStatus === 'idle' || authStatus === 'loading') {
      return;
    }

    if (!authUser) {
      router.replace('/login');
      return;
    }

    const allowedPrefix = getDashboardByRole(authUser.role);

    if (!isDashboardPathAllowed(authUser.role, pathname)) {
      router.replace(allowedPrefix);
    }
  }, [authStatus, authUser, pathname, router]);

  if (authStatus === 'idle' || authStatus === 'loading') {
    return <Loader screen='full' />;
  }

  if (!authUser) {
    return <Loader screen='full' />;
  }

  const allowedPrefix = getDashboardByRole(authUser.role);

  if (!isDashboardPathAllowed(authUser.role, pathname)) {
    return <Loader screen='full' />;
  }

  return <>{children}</>;
}
