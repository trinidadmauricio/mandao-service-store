/**
 * Template Layout Component
 * Renderiza el layout usando los componentes del template activo
 */

'use client';

import { useTheme } from '@/providers/theme-provider';

interface TemplateLayoutProps {
  children: React.ReactNode;
}

export function TemplateLayout({ children }: TemplateLayoutProps) {
  const { config } = useTheme();
  const { Header, Footer } = config.components;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

