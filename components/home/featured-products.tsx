/**
 * Componente Featured Products
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductGrid } from '@/components/product/product-grid';
import { storefrontService } from '@/lib/api/services/storefront.service';
import { useTenant } from '@/providers/tenant-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FeaturedProducts() {
  const { tenant } = useTenant();

  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products', tenant?.id],
    queryFn: async () => {
      const allProducts = await storefrontService.getProducts({
        page: 1,
        limit: 8,
        locale: tenant?.default_locale,
        currency: tenant?.default_currency,
      });
      // Filtrar productos destacados
      return allProducts.filter((p) => p.is_featured).slice(0, 8);
    },
    enabled: !!tenant,
  });

  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Productos Destacados</h2>
            <p className="text-muted-foreground">Los productos más populares de nuestra tienda</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="gap-2">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ProductGrid products={products || []} isLoading={isLoading} />
      </div>
    </section>
  );
}

