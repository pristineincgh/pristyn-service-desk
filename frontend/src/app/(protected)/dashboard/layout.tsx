'use client';

import EmailVerificationBanner from '@/components/dashboard/layout/EmailVerificationBanner';
import ForcePasswordChangeDialog from '@/components/dashboard/layout/ForcePasswordChangeDialog';
import SidebarNav from '@/components/dashboard/layout/SidebarNav';
import TopHeader from '@/components/dashboard/layout/TopHeader';
import DashboardProvider from '@/providers/DashboardProvider';
import { ReactNode } from 'react';
// import DashboardProvider from './dashboard-provider';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <DashboardProvider>
      <div className='min-h-screen flex'>
        <SidebarNav />

        {/* Main Content */}
        <div className='flex flex-1 flex-col ml-64'>
          <TopHeader />
          <EmailVerificationBanner />
          <ForcePasswordChangeDialog />

          {/* Content Area */}
          <main className='flex-1'>
            <div className='p-6'>{children}</div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
};
export default DashboardLayout;
