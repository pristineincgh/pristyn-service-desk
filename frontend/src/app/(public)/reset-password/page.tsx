'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { useResetPassword } from '@/services/auth/mutations';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const resetPasswordMutation = useResetPassword();
  const [showPasswords, setShowPasswords] = useState({
    next: false,
    confirm: false,
  });

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: ResetPasswordFormData) => {
    await resetPasswordMutation.mutateAsync({
      token,
      newPassword: data.newPassword,
    });
    router.replace('/login');
  };

  const isMissingToken = token.length === 0;

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
              Choose a new password and get back into your workspace.
            </h1>
            <p className='max-w-xl text-base leading-7 text-muted-foreground sm:text-lg'>
              This reset link is single-use. Once you submit a new password, any
              older sessions will stop working automatically.
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
                    <KeyRound className='h-7 w-7' />
                  </div>
                  <div className='space-y-2'>
                    <h2 className='text-2xl font-bold tracking-tight text-foreground'>
                      Reset password
                    </h2>
                    <p className='text-sm leading-6 text-muted-foreground'>
                      Set a new password for your account.
                    </p>
                  </div>
                </div>

                {isMissingToken ? (
                  <div className='rounded-3xl border border-destructive/20 bg-destructive/10 p-4 text-sm leading-6 text-destructive'>
                    This reset link is missing a token. Request a fresh password
                    reset email from the login screen.
                  </div>
                ) : (
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className='space-y-5'
                  >
                    <FieldGroup>
                      <Field data-invalid={!!form.formState.errors.newPassword}>
                        <FieldLabel htmlFor='reset-password-new'>
                          New password
                        </FieldLabel>
                        <div className='relative'>
                          <Input
                            id='reset-password-new'
                            type={showPasswords.next ? 'text' : 'password'}
                            disabled={resetPasswordMutation.isPending}
                            aria-invalid={!!form.formState.errors.newPassword}
                            className={cn('bg-background pr-10')}
                            {...form.register('newPassword')}
                          />
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent [&_svg:not([class*='size-'])]:size-4"
                            onClick={() =>
                              setShowPasswords((current) => ({
                                ...current,
                                next: !current.next,
                              }))
                            }
                          >
                            {showPasswords.next ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                        <FieldError
                          errors={[form.formState.errors.newPassword]}
                        />
                      </Field>

                      <Field
                        data-invalid={!!form.formState.errors.confirmPassword}
                      >
                        <FieldLabel htmlFor='reset-password-confirm'>
                          Confirm new password
                        </FieldLabel>
                        <div className='relative'>
                          <Input
                            id='reset-password-confirm'
                            type={showPasswords.confirm ? 'text' : 'password'}
                            disabled={resetPasswordMutation.isPending}
                            aria-invalid={
                              !!form.formState.errors.confirmPassword
                            }
                            className={cn('bg-background pr-10')}
                            {...form.register('confirmPassword')}
                          />
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent [&_svg:not([class*='size-'])]:size-4"
                            onClick={() =>
                              setShowPasswords((current) => ({
                                ...current,
                                confirm: !current.confirm,
                              }))
                            }
                          >
                            {showPasswords.confirm ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                        <FieldError
                          errors={[form.formState.errors.confirmPassword]}
                        />
                      </Field>
                    </FieldGroup>

                    <Button
                      type='submit'
                      className='w-full h-11'
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending
                        ? 'Resetting password...'
                        : 'Reset password'}
                    </Button>
                  </form>
                )}

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

export default ResetPasswordPage;
