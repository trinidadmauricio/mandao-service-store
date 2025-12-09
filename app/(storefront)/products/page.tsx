/**
 * Product Listing Page
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductPagination } from '@/components/products/product-pagination';
import { storefrontService } from '@/lib/api/services/storefront.service';
import { useTenant } from '@/providers/tenant-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import type { StorefrontProduct } from '@/types/api';

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'featured';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { tenant } = useTenant();

  const categoryId = searchParams.get('category_id') || undefined;
  const brandId = searchParams.get('brand_id') || undefined;
  const sortBy = (searchParams.get('sort') as SortOption) || 'featured';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 12;

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', tenant?.id, categoryId, brandId, page, limit],
    queryFn: async () => {
      const allProducts = await storefrontService.getProducts({
        category_id: categoryId,
        brand_id: brandId,
        page,
        limit: 100, // Fetch more to sort client-side (API doesn't support sorting yet)
        locale: tenant?.default_locale,
        currency: tenant?.default_currency,
      });

      // Client-side sorting
      let sorted = [...allProducts];
      switch (sortBy) {
        case 'name_asc':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          sorted.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'price_asc':
          sorted.sort((a, b) => a.selling_price - b.selling_price);
          break;
        case 'price_desc':
          sorted.sort((a, b) => b.selling_price - a.selling_price);
          break;
        case 'featured':
        default:
          sorted.sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return 0;
          });
          break;
      }

      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        products: sorted.slice(start, end),
        total: sorted.length,
        page,
        totalPages: Math.ceil(sorted.length / limit),
      };
    },
    enabled: !!tenant,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <ProductGrid products={[]} isLoading={true} />
          </div>
        </div>
      </div>
    );
  }

  const displayProducts = products?.products || [];
  const totalItems = products?.total || 0;
  const totalPages = products?.totalPages || 0;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Productos</h1>
        <p className="text-muted-foreground">
          {totalItems > 0
            ? `Encontrados ${totalItems} producto${totalItems !== 1 ? 's' : ''}`
            : 'No se encontraron productos'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid products={displayProducts} isLoading={isLoading} />
          {totalPages > 0 && (
            <div className="mt-8">
              <ProductPagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={limit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <ProductGrid products={[]} isLoading={true} />
            </div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}

