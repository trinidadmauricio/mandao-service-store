/**
 * Componente Logo
 */

import Link from 'next/link';
import { useTenant } from '@/providers/tenant-provider';

export function Logo() {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="h-8 w-32 animate-pulse rounded bg-muted" aria-label="Loading logo" />
    );
  }

  return (
    <Link href="/" className="flex items-center space-x-2" aria-label="Home">
      <span className="text-2xl font-bold">
        {tenant?.name || 'Mandao Store'}
      </span>
    </Link>
  );
}

