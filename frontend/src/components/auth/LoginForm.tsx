'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { getDashboardByRole } from '@/lib/roles';
import { Card, CardContent } from '../ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Spinner } from '../ui/spinner';
import { useLogin } from '@/services/auth/mutations';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter a password'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: login, isPending: isLoading } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const response = await login({
        email: data.email.trim(),
        password: data.password,
      });

      setAuthUser(response.user);

      if (data.rememberMe) {
        localStorage.setItem('remember_email', data.email);
      } else {
        localStorage.removeItem('remember_email');
      }

      toast.success(response.message || 'Login successful');
      router.replace(getDashboardByRole(response.user.role));
    } catch {
      // Mutation-level error handling shows the toast.
    }
  };

  const handleForgotPassword = () => {
    console.log('[v0] Forgot password clicked');
    router.push('/forgot-password');
  };

  useEffect(() => {
    const email = localStorage.getItem('remember_email');
    if (email) {
      form.setValue('email', email);
      form.setValue('rememberMe', true);
    }
  }, [form]);

  return (
    <div className='w-full max-w-md'>
      <Card className='overflow-hidden rounded-[2rem] border-border/80 bg-card/95 py-0 shadow-[0_30px_80px_-28px_color-mix(in_oklab,var(--foreground)_25%,transparent)] backdrop-blur'>
        <div className='border-b border-border/80 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_14%,transparent),color-mix(in_oklab,var(--accent)_42%,transparent),transparent)] px-6 py-6 sm:px-8'>
          <div className='inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-background/80 text-primary shadow-sm'>
            <ShieldCheck className='h-7 w-7' />
          </div>
          <div className='mt-4 space-y-2'>
            <p className='text-sm font-semibold text-muted-foreground'>Pristyn</p>
            <p className='text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground'>
              Welcome back
            </p>
            <h1 className='text-3xl font-bold tracking-tight text-foreground'>
              Sign in to your workspace
            </h1>
            <p className='text-sm leading-6 text-muted-foreground'>
              Enter your email and password to continue.
            </p>
          </div>
        </div>

        <CardContent className='px-6 py-6 sm:px-8 sm:py-8'>
          <form onSubmit={form.handleSubmit(handleLogin)} className='space-y-5'>
            <FieldGroup>
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='email'>Email address</FieldLabel>
                      <div className='relative'>
                      <Mail className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        {...field}
                        id='email'
                        aria-invalid={fieldState.invalid}
                        placeholder='you@example.com'
                        className={cn(
                          'h-12 rounded-xl border-border bg-background pl-10 shadow-none',
                          fieldState.invalid &&
                            'ring-2 ring-destructive/50 focus-visible:ring-destructive/70'
                        )}
                        disabled={isLoading}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='password'>Password</FieldLabel>
                    <div className='relative'>
                      <Lock className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        {...field}
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        aria-invalid={fieldState.invalid}
                        placeholder='Enter your password'
                        className={cn(
                          'h-12 rounded-xl border-border bg-background pl-10 pr-10 shadow-none',
                          fieldState.invalid &&
                            'ring-2 ring-destructive/50 focus-visible:ring-destructive/70'
                        )}
                        disabled={isLoading}
                      />
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ease-in-out hover:bg-transparent [&_svg:not([class*='size-'])]:size-4"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className='flex items-center justify-between text-sm'>
              <Field orientation='horizontal'>
                <Checkbox
                  id='rememberMe-checkbox'
                  name='rememberMe-checkbox'
                  checked={!!form.watch('rememberMe')}
                  onCheckedChange={(checked) =>
                    form.setValue('rememberMe', Boolean(checked))
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor='rememberMe-checkbox'
                  className='text-muted-foreground'
                >
                  Remember me
                </Label>
              </Field>
              <Button
                type='button'
                variant={'link'}
                className='px-0 font-medium text-primary hover:text-primary/90'
                onClick={() => handleForgotPassword()}
              >
                Forgot password?
              </Button>
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='h-12 w-full rounded-xl'
            >
              {isLoading ? (
                <>
                  <Spinner />
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default LoginForm;
