'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
    <div className='w-full max-w-md space-y-8'>
      {/* Logo/Branding */}
      <div className='text-center'>
        <div className='inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4'>
          <Mail className='h-6 w-6 text-primary' />
        </div>
        <h1 className='text-3xl font-bold'>Pristyn</h1>
        <p className='mt-2 text-muted-foreground'>Service Desk Platform</p>
      </div>

      {/* Login Card */}
      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleLogin)} className='space-y-5'>
            <FieldGroup>
              {/* Email Field */}
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='email'>Email</FieldLabel>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
                      <Input
                        {...field}
                        id='email'
                        aria-invalid={fieldState.invalid}
                        placeholder='you@example.com'
                        className={cn(
                          'w-full pl-10',
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

              {/* Password Field */}
              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='password'>Password</FieldLabel>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
                      <Input
                        {...field}
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        aria-invalid={fieldState.invalid}
                        placeholder='Enter your password'
                        className={cn(
                          'w-full pl-10 pr-10',
                          fieldState.invalid &&
                            'ring-2 ring-destructive/50 focus-visible:ring-destructive/70'
                        )}
                        disabled={isLoading}
                      />
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        className="hover:bg-transparent text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 group-hover:text-muted-foreground group-focus-within:text-muted-foreground transition-all duration-300 ease-in-out [&_svg:not([class*='size-'])]:size-4"
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

            {/* Remember Me & Forgot Password */}
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
                <Label htmlFor='rememberMe-checkbox'>Remember me</Label>
              </Field>
              <Button
                type='button'
                variant={'link'}
                onClick={() => handleForgotPassword()}
              >
                Forgot password?
              </Button>
            </div>

            {/* Submit Button */}
            <Button type='submit' disabled={isLoading} className='w-full h-12'>
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
