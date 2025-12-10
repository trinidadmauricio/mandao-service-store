/**
 * Hook para formatear fechas de forma segura en el cliente
 * Evita errores de hidratación al renderizar fechas solo en el cliente
 */

import { useState, useEffect } from 'react';

/**
 * Formatea una fecha solo en el cliente para evitar errores de hidratación
 * @param dateString - String de fecha ISO o Date object
 * @param options - Opciones de formato para toLocaleDateString
 * @returns String formateado o null durante SSR
 */
export function useClientDate(
  dateString: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string | null {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!dateString) {
      setFormattedDate(null);
      return;
    }

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const formatted = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    });
    setFormattedDate(formatted);
  }, [dateString, options]);

  return formattedDate;
}

/**
 * Hook para obtener la fecha actual formateada solo en el cliente
 * @param options - Opciones de formato para toLocaleDateString
 * @returns String formateado o null durante SSR
 */
export function useCurrentDate(options?: Intl.DateTimeFormatOptions): string | null {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    const date = new Date();
    const formatted = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    });
    setFormattedDate(formatted);
  }, [options]);

  return formattedDate;
}

