'use client';

import { MailWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSendEmailVerification } from '@/services/auth/mutations';
import { useAuthStore } from '@/store/auth-store';

const EmailVerificationBanner = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const sendEmailVerificationMutation = useSendEmailVerification();

  if (!authUser || authUser.emailVerified) {
    return null;
  }

  return (
    <div className='border-b border-amber-200 bg-amber-50 px-6 py-4'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='rounded-full bg-amber-100 p-2 text-amber-700'>
            <MailWarning className='h-4 w-4' />
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-semibold text-amber-950'>
              Verify your email address
            </p>
            <p className='text-sm text-amber-900/80'>
              Your account email is still unverified. Check your inbox for the
              verification link, or request a new email.
            </p>
          </div>
        </div>

        <div className='flex shrink-0'>
          <Button
            type='button'
            variant='outline'
            className='border-amber-300 bg-white text-amber-950 hover:bg-amber-100 hover:text-amber-950'
            onClick={() => sendEmailVerificationMutation.mutate()}
            disabled={sendEmailVerificationMutation.isPending}
          >
            {sendEmailVerificationMutation.isPending
              ? 'Sending...'
              : 'Resend verification email'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
