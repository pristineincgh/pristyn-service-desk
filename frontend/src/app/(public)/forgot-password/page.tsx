'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ThemeToggle from '@/components/common/ThemeToggle';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useRequestPasswordReset } from '@/services/auth/mutations';

const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const requestPasswordResetMutation = useRequestPasswordReset();
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    await requestPasswordResetMutation.mutateAsync({
      email: data.email.trim(),
    });
    form.reset({
      email: data.email.trim(),
    });
  };

  return (
    <div className='relative min-h-screen overflow-hidden bg-background px-4 py-10'>
      <div className='absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_16%,transparent),color-mix(in_oklab,var(--accent)_24%,transparent),transparent)]' />
      <div className='absolute -left-16 top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute right-0 top-12 h-64 w-64 rounded-full bg-accent blur-3xl opacity-70' />
      <div className='absolute right-4 top-4 z-10'>
        <ThemeToggle />
      </div>

      <div className='relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]'>
        <section className='space-y-6'>
          <div className='inline-flex items-center rounded-full border border-border/80 bg-card/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground backdrop-blur'>
            Pristyn Service Desk
          </div>

          <div className='space-y-4'>
            <h1 className='max-w-xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl'>
              Forgot your password? We&apos;ll help you get back in.
            </h1>
            <p className='max-w-xl text-base leading-7 text-muted-foreground sm:text-lg'>
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          <div className='rounded-3xl border border-border/70 bg-card/70 p-5 shadow-[0_20px_60px_-30px_color-mix(in_oklab,var(--foreground)_22%,transparent)] backdrop-blur'>
            <p className='text-sm font-semibold text-foreground'>
              What happens next
            </p>
            <p className='mt-2 text-sm leading-6 text-muted-foreground'>
              Check your inbox for a password reset email. The link will take
              you to a page where you can choose a new password.
            </p>
          </div>
        </section>

        <section className='relative'>
          <div className='absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-foreground/8 blur-2xl' />

          <Card className='relative overflow-hidden rounded-[2rem] border-border/80 bg-card/95 shadow-[0_30px_80px_-28px_color-mix(in_oklab,var(--foreground)_25%,transparent)] backdrop-blur'>
            <CardContent className='p-6 sm:p-8'>
              <div className='space-y-6'>
                <div className='space-y-3'>
                  <div className='inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary'>
                    <MailCheck className='h-7 w-7' />
                  </div>
                  <div className='space-y-2'>
                    <h2 className='text-2xl font-bold tracking-tight text-foreground'>
                      Reset your password
                    </h2>
                    <p className='text-sm leading-6 text-muted-foreground'>
                      Enter the email linked to your account and we&apos;ll send
                      you a reset link if we find a match.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className='space-y-5'
                >
                  <FieldGroup>
                    <Field data-invalid={!!form.formState.errors.email}>
                      <FieldLabel htmlFor='forgot-password-email'>
                        Email address
                      </FieldLabel>
                      <Input
                        id='forgot-password-email'
                        type='email'
                        placeholder='you@example.com'
                        disabled={requestPasswordResetMutation.isPending}
                        aria-invalid={!!form.formState.errors.email}
                        className='bg-background'
                        {...form.register('email')}
                      />
                      <FieldError errors={[form.formState.errors.email]} />
                    </Field>
                  </FieldGroup>

                  <Button
                    type='submit'
                    className='w-full h-11'
                    disabled={requestPasswordResetMutation.isPending}
                  >
                    {requestPasswordResetMutation.isPending
                      ? 'Sending email...'
                      : 'Email me a reset link'}
                  </Button>
                </form>

                <Button asChild variant='ghost' className='w-auto'>
                  <Link href='/login'>
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back to login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
