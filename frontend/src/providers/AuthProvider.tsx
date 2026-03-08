'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Loader from '@/components/common/Loader';
import { getAuthUser } from '@/services/auth/endpoints';
import { useAuthStore } from '@/store/auth-store';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const setAuthStatus = useAuthStore((state) => state.setAuthStatus);
  const clearAuthUser = useAuthStore((state) => state.clearAuthUser);
  const hasInitialized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      setAuthStatus('loading');

      try {
        const response = await getAuthUser();

        if (!isMounted) {
          return;
        }

        setAuthUser(response.user);
      } catch {
        if (!isMounted) {
          return;
        }

        clearAuthUser();
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      void syncSession();
    }

    return () => {
      isMounted = false;
    };
  }, [clearAuthUser, setAuthStatus, setAuthUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthUser();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [clearAuthUser]);

  if (!isReady) {
    return <Loader screen='full' />;
  }

  return <>{children}</>;
};

export default AuthProvider;
