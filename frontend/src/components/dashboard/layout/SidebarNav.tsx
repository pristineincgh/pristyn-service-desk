'use client';

import { Button } from '@/components/ui/button';
import {
  moderatorNavItems,
  supervisorNavItems,
  supportNavItems,
} from '@/lib/nav-items';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/user-types';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RiCustomerService2Fill } from 'react-icons/ri';
import { toast } from 'sonner';
import { useLogout } from '@/services/auth/mutations';
import { useState } from 'react';
import ConfirmAlertDialog from '@/components/common/modals/ConfirmAlertDialog';

const SidebarNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const authUser = useAuthStore((state) => state.authUser);
  const clearAuthUser = useAuthStore((state) => state.clearAuthUser);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { mutateAsync: logout, isPending } = useLogout();
  const userRole = authUser?.role;

  const roleNavMap: Record<UserRole, typeof supportNavItems> = {
    [UserRole.AGENT]: supportNavItems,
    [UserRole.SUPERVISOR]: supervisorNavItems,
    [UserRole.MODERATOR]: moderatorNavItems,
  };

  const navItems = userRole ? (roleNavMap[userRole] ?? []) : [];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuthUser();
      toast.success('Logged out successfully');
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <>
      <div className='fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar-background'>
        <div className='border-b border-sidebar-border'>
          <Link
            href='/dashboard'
            className='flex items-center justify-center gap-2 bg-sidebar-accent px-6 py-4 font-bold text-accent-foreground'
          >
            <div className='grid h-12 w-12 place-content-center rounded-full bg-primary'>
              <RiCustomerService2Fill className='size-8 text-accent' />
            </div>
            <div className='uppercase'>
              <h2 className='tracking-wide'>Pristyn</h2>
              <p className='text-xs leading-3 text-muted-foreground'>
                Service Desk
              </p>
            </div>
          </Link>
        </div>

        <nav className='flex-1 space-y-2 overflow-y-auto px-3 py-4'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.label === 'Dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-sidebar-primary text-sidebar-accent'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon className='h-5 w-5' />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className='border-t border-sidebar-border p-4'>
          <Button
            variant='ghost'
            size='lg'
            onClick={() => setIsConfirmModalOpen(true)}
            className='flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent'
          >
            <LogOut className='h-5 w-5' />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {isConfirmModalOpen && (
        <ConfirmAlertDialog
          open={isConfirmModalOpen}
          onOpenChange={setIsConfirmModalOpen}
          title='Confirm Logout'
          description='Are you sure you want to log out? You will need to sign in again to continue'
          onConfirm={handleLogout}
          confirmLabel='Yes, Logout'
          isConfirming={isPending}
          confirmVariant='destructive'
        />
      )}
    </>
  );
};
export default SidebarNav;
