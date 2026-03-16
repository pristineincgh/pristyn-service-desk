'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  MailCheck,
  Orbit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthUser, verifyEmail } from '@/services/auth/endpoints';
import { authQueryKeys } from '@/services/auth/queries';
import { useAuthStore } from '@/store/auth-store';
import type { AuthUserResponse } from '@/types/user-types';

type VerificationViewState = 'idle' | 'verifying' | 'success' | 'error';

const stateConfig: Record<
  Exclude<VerificationViewState, 'idle'>,
  {
    badge: string;
    title: string;
    description: string;
    icon: typeof MailCheck;
    iconClassName: string;
    panelClassName: string;
  }
> = {
  verifying: {
    badge: 'Verification in progress',
    title: 'Checking your verification link',
    description:
      'We are confirming that this link is valid and belongs to your account.',
    icon: Orbit,
    iconClassName: 'text-sky-600',
    panelClassName: 'border-sky-200 bg-sky-50/80',
  },
  success: {
    badge: 'Email confirmed',
    title: 'Your account is ready',
    description:
      'Your email address has been verified successfully. You can continue to the login screen and access your workspace.',
    icon: CheckCircle2,
    iconClassName: 'text-emerald-600',
    panelClassName: 'border-emerald-200 bg-emerald-50/80',
  },
  error: {
    badge: 'Verification failed',
    title: 'This verification link cannot be used',
    description:
      'The link may be invalid, expired, or already used. Request a fresh verification email from your account.',
    icon: AlertCircle,
    iconClassName: 'text-rose-600',
    panelClassName: 'border-rose-200 bg-rose-50/80',
  },
};

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const hasTriggeredRef = useRef(false);
  const token = searchParams.get('token')?.trim() ?? '';
  const [viewState, setViewState] = useState<VerificationViewState>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    if (hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;

    const runVerification = async () => {
      try {
        const response = await verifyEmail({ token });

        try {
          const authResponse = await getAuthUser();

          queryClient.setQueryData<AuthUserResponse>(authQueryKeys.currentUser, {
            user: authResponse.user,
          });
          setAuthUser(authResponse.user);
        } catch {
          // Verification can also happen without an active session.
        }

        if (!hasTriggeredRef.current) {
          return;
        }

        setViewState('success');
        setMessage(
          response.message ||
            'Your email address has been verified successfully.'
        );
      } catch (error) {
        if (!hasTriggeredRef.current) {
          return;
        }

        const nextMessage =
          error instanceof Error
            ? error.message
            : 'The verification link is invalid or has expired.';

        setViewState('error');
        setMessage(nextMessage);
      }
    };

    void runVerification();

    return () => {
      hasTriggeredRef.current = false;
    };
  }, [queryClient, setAuthUser, token]);

  const resolvedState = !token
    ? 'error'
    : viewState === 'idle'
      ? 'verifying'
      : viewState;
  const config = stateConfig[resolvedState];
  const StateIcon = config.icon;
  const resolvedMessage =
    resolvedState === 'error' && !token
      ? 'The verification link is missing a token.'
      : message;

  return (
    <div className='relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_28%,#f8fafc_62%,#ffffff_100%)] px-4 py-10'>
      <div className='absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,rgba(14,116,144,0.18),rgba(37,99,235,0.08),transparent)]' />
      <div className='absolute -left-16 top-20 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl' />
      <div className='absolute right-0 top-12 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl' />

      <div className='relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]'>
        <section className='space-y-6'>
          <div className='inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 backdrop-blur'>
            Pristyn Service Desk
          </div>

          <div className='space-y-4'>
            <h1 className='max-w-xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl'>
              Finish your account setup with one secure email check.
            </h1>
            <p className='max-w-xl text-base leading-7 text-slate-600 sm:text-lg'>
              This screen validates the verification link from your inbox and
              confirms that your account email is trusted before you continue.
            </p>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur'>
              <p className='text-sm font-semibold text-slate-900'>
                Why this matters
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                Verification protects account access, confirms notification
                delivery, and keeps workflow ownership tied to a valid address.
              </p>
            </div>
            <div className='rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur'>
              <p className='text-sm font-semibold text-slate-900'>
                If the link expires
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                Sign in and use the resend action from the banner or profile
                page.
              </p>
            </div>
          </div>
        </section>

        <section className='relative'>
          <div className='absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-slate-900/8 blur-2xl' />

          <div className='relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_30px_80px_-28px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8'>
            <div className='absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(59,130,246,0.06),transparent)]' />

            <div className='relative space-y-6'>
              <div className='flex items-start justify-between gap-4'>
                <div className='space-y-3'>
                  <div className='inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600'>
                    {config.badge}
                  </div>
                  <div className='space-y-2'>
                    <h2 className='text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl'>
                      {config.title}
                    </h2>
                    <p className='max-w-md text-sm leading-6 text-slate-600 sm:text-base'>
                      {config.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border ${config.panelClassName}`}
                >
                  <StateIcon
                    className={`h-8 w-8 ${config.iconClassName} ${
                      resolvedState === 'verifying' ? 'animate-spin' : ''
                    }`}
                  />
                </div>
              </div>

              <div
                className={`rounded-3xl border p-5 ${config.panelClassName}`}
              >
                <p className='text-sm font-medium leading-6 text-slate-800'>
                  {resolvedState === 'verifying'
                    ? 'Verifying your email address...'
                    : resolvedMessage}
                </p>
              </div>

              <div className='flex flex-col gap-3 sm:flex-row'>
                {resolvedState === 'success' ? (
                  <>
                    <Button asChild size='lg' className='min-w-40'>
                      <Link href='/login'>
                        Go to login
                        <ArrowRight className='ml-1 h-4 w-4' />
                      </Link>
                    </Button>
                  </>
                ) : null}

                {resolvedState === 'error' ? (
                  <>
                    <Button asChild size='lg'>
                      <Link href='/login'>Return to login</Link>
                    </Button>
                  </>
                ) : null}

                {resolvedState === 'verifying' ? (
                  <Button size='lg' disabled className='min-w-44'>
                    Checking link...
                  </Button>
                ) : null}
              </div>

              <div className='rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500'>
                Verification links are single-use and expire automatically for
                security.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
