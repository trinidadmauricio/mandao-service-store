/**
 * Componente Footer Principal
 */

'use client';

import Link from 'next/link';
import { useTenant } from '@/providers/tenant-provider';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  shop: [
    { href: '/products', label: 'Todos los Productos' },
    { href: '/categories', label: 'Categorías' },
    { href: '/brands', label: 'Marcas' },
  ],
  customer: [
    { href: '/account', label: 'Mi Cuenta' },
    { href: '/account/orders', label: 'Mis Pedidos' },
    { href: '/account/addresses', label: 'Mis Direcciones' },
  ],
  company: [
    { href: '/about', label: 'Sobre Nosotros' },
    { href: '/contact', label: 'Contacto' },
    { href: '/terms', label: 'Términos y Condiciones' },
    { href: '/privacy', label: 'Política de Privacidad' },
  ],
};

export function Footer() {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <footer className="border-t bg-muted/50">
        <div className="container py-8 px-4">
          <div className="h-32 animate-pulse rounded bg-muted" />
        </div>
      </footer>
    );
  }

  const currentYear = new Date().getFullYear();
  const storeName = tenant?.name || 'Mandao Store';

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Información de la Tienda */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{storeName}</h3>
            <p className="text-sm text-muted-foreground">
              Tu tienda de confianza para todas tus necesidades.
            </p>
          </div>

          {/* Comprar */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Comprar</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cliente */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Cliente</h4>
            <ul className="space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Empresa</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {storeName}. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <Link href="https://mandao.com" className="hover:text-primary transition-colors">
              Mandao
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

