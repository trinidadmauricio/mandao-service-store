/**
 * Layout principal del storefront
 * Usa el sistema de templates para renderizar Header/Footer dinámicamente
 */

import { TemplateLayout } from '@/components/layout/template-layout';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TemplateLayout>{children}</TemplateLayout>;
}

