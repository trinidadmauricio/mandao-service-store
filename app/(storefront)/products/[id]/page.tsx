/**
 * Product Detail Page
 */

'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { storefrontService } from '@/lib/api/services/storefront.service';
import { useTenant } from '@/providers/tenant-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ProductDetailContent() {
  const params = useParams();
  const productId = params.id as string;
  const { tenant } = useTenant();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId, tenant?.id],
    queryFn: async () => {
      return await storefrontService.getProduct(productId, {
        locale: tenant?.default_locale,
        currency: tenant?.default_currency,
      });
    },
    enabled: !!productId && !!tenant,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Link>
        </Button>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              El producto que buscas no existe o ha sido eliminado.
            </p>
            <Button asChild>
              <Link href="/products">Ver todos los productos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare images array
  const images: string[] = [];
  if (product.featured_image_url) {
    images.push(product.featured_image_url);
  }
  // Add variant images if available
  product.variants.forEach((variant) => {
    if (variant.image_url && !images.includes(variant.image_url)) {
      images.push(variant.image_url);
    }
  });

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Productos
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-12">
        {/* Image Gallery */}
        <ProductImageGallery images={images} productName={product.name} />

        {/* Product Info */}
        <ProductInfo
          product={product}
          currency={tenant?.default_currency || 'USD'}
        />
      </div>

      <Separator className="my-8" />

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList>
          <TabsTrigger value="description">Descripción</TabsTrigger>
          <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
          {product.variants.length > 0 && (
            <TabsTrigger value="variants">Variantes</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {product.description ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-muted-foreground">
                  No hay descripción disponible para este producto.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex">
                  <span className="font-medium w-32">SKU:</span>
                  <span className="text-muted-foreground">{product.sku}</span>
                </div>
                {product.category && (
                  <div className="flex">
                    <span className="font-medium w-32">Categoría:</span>
                    <span className="text-muted-foreground">{product.category.name}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="flex">
                    <span className="font-medium w-32">Marca:</span>
                    <span className="text-muted-foreground">{product.brand.name}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="font-medium w-32">Precio:</span>
                  <span className="text-muted-foreground">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: tenant?.default_currency || 'USD',
                    }).format(product.selling_price)}
                  </span>
                </div>
                {product.has_variants && (
                  <div className="flex">
                    <span className="font-medium w-32">Variantes:</span>
                    <span className="text-muted-foreground">
                      {product.variants_count} disponible{product.variants_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {product.variants.length > 0 && (
          <TabsContent value="variants" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">
                          {variant.option1_value || variant.option2_value || variant.option3_value || 'Variante'}
                        </p>
                        <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: tenant?.default_currency || 'USD',
                          }).format(product.selling_price + variant.price_adjustment)}
                        </p>
                        {variant.price_adjustment !== 0 && (
                          <p className="text-xs text-muted-foreground">
                            {variant.price_adjustment > 0 ? '+' : ''}
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: tenant?.default_currency || 'USD',
                            }).format(variant.price_adjustment)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}

