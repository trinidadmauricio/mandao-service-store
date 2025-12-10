/**
 * Categories Listing Page
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { storefrontService } from '@/lib/api/services/storefront.service';
import { useTenant } from '@/providers/tenant-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoriesPage() {
  const { tenant } = useTenant();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', tenant?.id],
    queryFn: async () => {
      return await storefrontService.getCategories({
        include_children: true,
      });
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

  const displayCategories = categories || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Categorías</h1>
        <p className="text-muted-foreground">
          {displayCategories.length > 0
            ? `Explora nuestras ${displayCategories.length} categoría${displayCategories.length !== 1 ? 's' : ''}`
            : 'No hay categorías disponibles'}
        </p>
      </div>

      {displayCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No hay categorías disponibles</h3>
            <p className="text-muted-foreground">
              Las categorías aparecerán aquí cuando estén disponibles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayCategories.map((category) => (
            <Link key={category.id} href={`/products?category_id=${category.id}`}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-lg h-full">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        {category.name}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    {category.product_count !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        {category.product_count} producto{category.product_count !== 1 ? 's' : ''}
                      </p>
                    )}
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {category.description}
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

