/**
 * Componente Product Filters
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { storefrontService } from '@/lib/api/services/storefront.service';
import { useTenant } from '@/providers/tenant-provider';
import { X } from 'lucide-react';

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'featured';

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();

  const [categoryId, setCategoryId] = useState<string | undefined>(
    searchParams.get('category_id') || undefined
  );
  const [brandId, setBrandId] = useState<string | undefined>(
    searchParams.get('brand_id') || undefined
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'featured'
  );
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories', tenant?.id],
    queryFn: () => storefrontService.getCategories({ include_children: false }),
    enabled: !!tenant,
  });

  // Fetch brands
  const { data: brands } = useQuery({
    queryKey: ['brands', tenant?.id],
    queryFn: () => storefrontService.getBrands(),
    enabled: !!tenant,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId) params.set('category_id', categoryId);
    if (brandId) params.set('brand_id', brandId);
    if (sortBy && sortBy !== 'featured') params.set('sort', sortBy);
    params.set('page', '1'); // Reset to first page when filters change

    const queryString = params.toString();
    router.push(`/products${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [categoryId, brandId, sortBy, router]);

  const clearFilters = () => {
    setCategoryId(undefined);
    setBrandId(undefined);
    setSortBy('featured');
    router.push('/products', { scroll: false });
  };

  const hasActiveFilters = categoryId || brandId || (sortBy && sortBy !== 'featured');

  return (
    <div className="space-y-4">
      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full"
        >
          {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
        </Button>
      </div>

      {/* Filters */}
      <div
        className={`space-y-4 ${showFilters ? 'block' : 'hidden'} lg:block`}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Filtros</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="name_asc">Nombre (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Nombre (Z-A)</SelectItem>
                  <SelectItem value="price_asc">Precio (Menor a Mayor)</SelectItem>
                  <SelectItem value="price_desc">Precio (Mayor a Menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select
                value={categoryId || 'all'}
                onValueChange={(value) => setCategoryId(value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Marca</label>
              <Select
                value={brandId || 'all'}
                onValueChange={(value) => setBrandId(value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las marcas</SelectItem>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

