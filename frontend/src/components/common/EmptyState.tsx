'use client';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { LucideIcon } from 'lucide-react';
import { IconType } from 'react-icons';

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
}

interface EmptyStateProps {
  icon: LucideIcon | IconType;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
}: EmptyStateProps) {
  return (
    <Empty className='border'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>

      {actions && actions.length > 0 && (
        <EmptyContent className='flex-row justify-center gap-2'>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant ?? 'secondary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </EmptyContent>
      )}
    </Empty>
  );
}
