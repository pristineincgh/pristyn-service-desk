'use client';

import KPICard from '@/components/common/cards/KPICard';
import { Headset, ShieldUser, UsersRound } from 'lucide-react';

type UserKPIsProps = {
  agentCount: number;
  supervisorCount: number;
  customerCount: number;
  isLoading?: boolean;
};

const UserKPIs = ({
  agentCount,
  supervisorCount,
  customerCount,
  isLoading = false,
}: UserKPIsProps) => {
  const cards = [
    {
      title: 'Active agents',
      value: agentCount,
      icon: <Headset className='h-5 w-5' />,
      theme: 'blue' as const,
      detailsHref: '/dashboard/moderator/users',
    },
    {
      title: 'Active supervisors',
      value: supervisorCount,
      icon: <ShieldUser className='h-5 w-5' />,
      theme: 'emerald' as const,
      detailsHref: '/dashboard/moderator/users',
    },
    {
      title: 'Customers',
      value: customerCount,
      icon: <UsersRound className='h-5 w-5' />,
      theme: 'amber' as const,
      detailsHref: '/dashboard/moderator/customers',
    },
  ];

  return (
    <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
      {cards.map((card) => (
        <KPICard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          theme={card.theme}
          detailsHref={card.detailsHref}
          loading={isLoading}
        />
      ))}
    </section>
  );
};

export default UserKPIs;
