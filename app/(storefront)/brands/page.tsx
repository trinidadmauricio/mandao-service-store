/**
 * Brands Listing Page
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { storefrontService } from '@/lib/api/services/storefront.service';
import { useTenant } from '@/providers/tenant-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function BrandsPage() {
  const { tenant } = useTenant();

  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands', tenant?.id],
    queryFn: async () => {
      return await storefrontService.getBrands();
    },
    enabled: !!tenant,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  const displayBrands = brands || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marcas</h1>
        <p className="text-muted-foreground">
          {displayBrands.length > 0
            ? `Explora nuestras ${displayBrands.length} marca${displayBrands.length !== 1 ? 's' : ''}`
            : 'No hay marcas disponibles'}
        </p>
      </div>

      {displayBrands.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No hay marcas disponibles</h3>
            <p className="text-muted-foreground">
              Las marcas aparecerán aquí cuando estén disponibles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayBrands.map((brand) => (
            <Link key={brand.id} href={`/products?brand_id=${brand.id}`}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-lg h-full">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {brand.logo_url ? (
                      <Image
                        src={brand.logo_url}
                        alt={brand.name}
                        fill
                        className="object-contain p-8 transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        {brand.name}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{brand.name}</h3>
                    {brand.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {brand.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

