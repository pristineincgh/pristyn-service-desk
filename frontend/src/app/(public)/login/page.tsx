import LoginForm from '@/components/auth/LoginForm';
import PublicRouteGuard from '@/providers/PublicRouteGuard';

const LoginPage = () => {
  return (
    <PublicRouteGuard>
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <LoginForm />
      </div>
    </PublicRouteGuard>
  );
};
export default LoginPage;
