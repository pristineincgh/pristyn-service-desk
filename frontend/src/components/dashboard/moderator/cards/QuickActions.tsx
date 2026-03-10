'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BadgePlus,
  ClipboardCheck,
  FolderPlus,
  ShieldPlus,
  Ticket,
  UserPlus,
} from 'lucide-react';
import { TbCategoryPlus } from 'react-icons/tb';
import Link from 'next/link';

const actions = [
  {
    label: 'Create ticket',
    // description: 'Open the ticket workspace and log a new issue.',
    // href: '/dashboard/moderator/tickets',
    icon: FolderPlus,
  },
  {
    label: 'Assign tickets',
    // description: 'Review queue ownership and reassign active tickets.',
    // href: '/dashboard/moderator/tickets',
    icon: Ticket,
  },
  {
    label: 'Add user',
    // description: 'Create a new agent or supervisor account.',
    // href: '/dashboard/moderator/users',
    icon: UserPlus,
  },
  {
    label: 'Assign supervisor',
    // description: 'Link agents to the right supervisor.',
    // href: '/dashboard/moderator/users',
    icon: ShieldPlus,
  },
  {
    label: 'Add customer',
    // description: 'Create a new customer record for ticket intake.',
    // href: '/dashboard/moderator/customers',
    icon: BadgePlus,
  },
  // {
  //   label: 'Review tickets',
  //   description: 'Jump into ticket status, SLA, and resolution work.',
  //   href: '/dashboard/moderator/tickets',
  //   icon: ClipboardCheck,
  // },
];

type QuickActionsCardProps = {
  onCreateTicket: () => void;
  onAssignTicket: () => void;
  onAddUser: () => void;
  onAddCustomer: () => void;
  onAssignSupervisor: () => void;
  onCreateCategory?: () => void;
};

const QuickActions = ({
  onCreateTicket,
  onAssignTicket,
  onAddUser,
  onAddCustomer,
  onAssignSupervisor,
  onCreateCategory,
}: QuickActionsCardProps) => {
  return (
    <Card className='rounded-2xl border-border/70 shadow-sm'>
      <CardHeader className='space-y-1'>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>
          Common moderator tasks grouped into a single action panel.
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-wrap gap-3'>
        <Button variant='default' onClick={onCreateTicket}>
          <FolderPlus />
          Create Ticket
        </Button>
        <Button variant='outline' onClick={onAssignTicket}>
          <Ticket />
          Assign Ticket
        </Button>
        <Button variant='outline' onClick={onAddUser}>
          <UserPlus />
          Add New User
        </Button>
        <Button variant='outline' onClick={onAddCustomer}>
          <BadgePlus />
          Add Customer
        </Button>
        <Button variant='outline' onClick={onAssignSupervisor}>
          <ShieldPlus />
          Assign Supervisor
        </Button>
        <Button variant='outline' onClick={onCreateCategory}>
          <TbCategoryPlus />
          New Ticket Category
        </Button>
        {/* {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.label}
              asChild
              variant='outline'
              className='h-auto justify-start rounded-xl px-4 py-3 text-left group'
            >
              <Link href={action.href}>
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-white'>
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='space-y-1'>
                    <div className='font-medium text-foreground group-hover:text-white'>
                      {action.label}
                    </div>
                    <div className='text-xs text-muted-foreground group-hover:text-white/70'>
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          );
        })} */}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
