/**
 * Componente Category Showcase
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { storefrontService } from '@/lib/api/services/storefront.service';
import { useTenant } from '@/providers/tenant-provider';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryShowcase() {
  const { tenant } = useTenant();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-showcase', tenant?.id],
    queryFn: async () => {
      return await storefrontService.getCategories({
        include_children: false,
      });
    },
    enabled: !!tenant,
  });

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="mb-8 text-3xl font-bold">Categorías</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  // Mostrar solo las primeras 8 categorías
  const displayCategories = categories.slice(0, 8);

  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="mb-8 text-3xl font-bold">Explorar por Categoría</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {displayCategories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
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
                  <div className="p-4 text-center">
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.product_count !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        {category.product_count} productos
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

