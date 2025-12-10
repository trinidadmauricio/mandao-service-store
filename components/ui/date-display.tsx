/**
 * Componente para mostrar fechas de forma segura
 * Evita errores de hidratación al renderizar fechas solo en el cliente
 */

'use client';

import { useClientDate } from '@/lib/hooks/use-client-date';

interface DateDisplayProps {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
  className?: string;
}

export function DateDisplay({ date, options, fallback = '-', className }: DateDisplayProps) {
  const formattedDate = useClientDate(date, options);

  return <span className={className}>{formattedDate || fallback}</span>;
}

