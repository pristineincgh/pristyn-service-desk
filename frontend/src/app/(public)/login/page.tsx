import LoginForm from '@/components/auth/LoginForm';
import ThemeToggle from '@/components/common/ThemeToggle';
import PublicRouteGuard from '@/providers/PublicRouteGuard';

const LoginPage = () => {
  return (
    <PublicRouteGuard>
      <div className='relative min-h-screen overflow-hidden bg-background px-4 py-8'>
        <div className='absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_16%,transparent),color-mix(in_oklab,var(--accent)_24%,transparent),transparent)]' />
        <div className='absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary/12 blur-3xl' />
        <div className='absolute right-0 top-12 h-80 w-80 rounded-full bg-accent blur-3xl opacity-70' />
        <div className='absolute right-4 top-4 z-10'>
          <ThemeToggle />
        </div>

        <div className='relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center'>
          <section className='relative w-full max-w-md'>
            <div className='absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] bg-foreground/8 blur-2xl' />
            <div className='relative'>
              <LoginForm />
            </div>
          </section>
        </div>
      </div>
    </PublicRouteGuard>
  );
};
export default LoginPage;
