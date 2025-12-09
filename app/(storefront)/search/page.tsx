/**
 * Search Results Page
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProductGrid } from '@/components/product/product-grid';
import { searchService } from '@/lib/api/services/search.service';
import { useTenant } from '@/providers/tenant-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search } from 'lucide-react';
import Image from 'next/image';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { tenant } = useTenant();

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query, tenant?.id],
    queryFn: async () => {
      if (!query.trim()) {
        return {
          products: [],
          categories: [],
          brands: [],
          total: 0,
        };
      }
      return await searchService.search({
        q: query,
        locale: tenant?.default_locale,
        currency: tenant?.default_currency,
      });
    },
    enabled: !!query.trim() && !!tenant,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <ProductGrid products={[]} isLoading={true} />
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Buscar productos</h2>
            <p className="text-muted-foreground">
              Ingresa un término de búsqueda para encontrar productos, categorías o marcas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const products = results?.products || [];
  const categories = results?.categories || [];
  const brands = results?.brands || [];
  const total = results?.total || 0;

  if (total === 0) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Resultados para &quot;{query}&quot;
          </h1>
          <p className="text-muted-foreground">No se encontraron resultados</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No se encontraron resultados</h2>
            <p className="text-muted-foreground mb-4">
              Intenta con otros términos de búsqueda o explora nuestras categorías.
            </p>
            <Link href="/products">
              <span className="text-primary hover:underline">Ver todos los productos</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Resultados para &quot;{query}&quot;
        </h1>
        <p className="text-muted-foreground">
          Se encontraron {total} resultado{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Categorías</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category_id=${category.id}`}>
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
        </section>
      )}

      {/* Brands Section */}
      {brands.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Marcas</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/products?brand_id=${brand.id}`}>
                <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-4 text-center">
                    {brand.logo_url ? (
                      <div className="relative h-24 w-full mb-4">
                        <Image
                          src={brand.logo_url}
                          alt={brand.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="h-24 flex items-center justify-center mb-4">
                        <span className="text-lg font-semibold">{brand.name}</span>
                      </div>
                    )}
                    <h3 className="font-semibold">{brand.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      {products.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Productos</h2>
          <ProductGrid products={products} isLoading={false} />
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <ProductGrid products={[]} isLoading={true} />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}

