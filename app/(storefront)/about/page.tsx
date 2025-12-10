/**
 * About Us Page
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/providers/tenant-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AboutPage() {
  const { tenant, storefront, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  const storeName = tenant?.name || 'Mandao Store';
  const aboutContent = storefront?.about_us || `Bienvenido a ${storeName}, tu tienda de confianza para todas tus necesidades.

Somos una empresa comprometida con ofrecer productos de calidad y un servicio excepcional a nuestros clientes. Nuestra misión es brindarte la mejor experiencia de compra posible.

Con años de experiencia en el mercado, nos hemos convertido en un referente de confianza y calidad. Trabajamos constantemente para mejorar nuestros servicios y ofrecerte siempre lo mejor.`;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Sobre Nosotros</h1>
        <Card>
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {aboutContent}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

