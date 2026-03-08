'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell,
  LogOut,
  Search,
  SettingsIcon,
  User,
  UserIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import ConfirmAlertDialog from '@/components/common/modals/ConfirmAlertDialog';
import { useLogout } from '@/services/auth/mutations';

const TopHeader = () => {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.authUser);
  const clearAuthUser = useAuthStore((state) => state.clearAuthUser);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { mutateAsync: logout, isPending } = useLogout();

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
      <header className='border-b border-border bg-card px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Search */}
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search tickets...'
                className='flex-1 pl-10 text-base!'
                // onChange={handleSearch}
              />
            </div>
          </div>

          <div className='ml-4 flex items-center gap-4'>
            {/* Notification Bell */}
            <Button
              variant='ghost'
              size='icon'
              className='relative h-9 w-9'
              // onClick={handleNotificationClick}
            >
              <Bell className='h-5 w-5' />
              <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500' />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='gap-2 h-12'>
                  <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center'>
                    <User className='h-4 w-4 text-primary' />
                  </div>
                  <div className='hidden sm:flex flex-col items-start text-xs'>
                    <span className='font-medium'>
                      {authUser?.name ?? 'Authenticated User'}
                    </span>
                    <span className='text-muted-foreground'>
                      {authUser?.role.replaceAll('_', ' ') ?? 'Signed in'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-40'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => toast.info('Profile settings clicked')}
                  >
                    <UserIcon />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.info('Preferences clicked')}
                  >
                    <SettingsIcon />
                    Preferences
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant='destructive'
                    onClick={() => setIsConfirmModalOpen(true)}
                  >
                    <LogOut />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

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
export default TopHeader;
