'use client';

import { useEffect, useState } from 'react';
import { LaptopMinimal, Moon, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ThemeValue = 'light' | 'dark' | 'system';

const themeMeta: Record<
  ThemeValue,
  { label: string; icon: typeof SunMedium }
> = {
  light: {
    label: 'Light',
    icon: SunMedium,
  },
  dark: {
    label: 'Dark',
    icon: Moon,
  },
  system: {
    label: 'System',
    icon: LaptopMinimal,
  },
};

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme = mounted
    ? ((theme as ThemeValue | undefined) ?? 'system')
    : 'system';
  const ActiveIcon = themeMeta[resolvedTheme].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9'
          aria-label='Change theme'
        >
          <ActiveIcon className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-36'>
        <DropdownMenuRadioGroup
          value={resolvedTheme}
          onValueChange={(value) => setTheme(value)}
        >
          {Object.entries(themeMeta).map(([value, meta]) => {
            const Icon = meta.icon;

            return (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon className='h-4 w-4' />
                {meta.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
