'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/common/Loader';
import { getDashboardByRole } from '@/lib/roles';
import { useAuthStore } from '@/store/auth-store';

interface PublicRouteGuardProps {
  children: ReactNode;
}

const PublicRouteGuard = ({ children }: PublicRouteGuardProps) => {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.authUser);
  const authStatus = useAuthStore((state) => state.authStatus);

  useEffect(() => {
    if (
      authStatus === 'authenticated' &&
      authUser
    ) {
      router.replace(getDashboardByRole(authUser.role));
    }
  }, [authStatus, authUser, router]);

  if (authStatus === 'idle' || authStatus === 'loading') {
    return <Loader screen='full' />;
  }

  if (authStatus === 'authenticated' && authUser) {
    return <Loader screen='full' />;
  }

  return <>{children}</>;
};

export default PublicRouteGuard;
