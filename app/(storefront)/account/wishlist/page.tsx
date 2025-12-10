/**
 * Wishlist Page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/lib/api/services/wishlist.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { useCartStore } from '@/lib/store/cart-store';
import Link from 'next/link';

export default function WishlistPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);

  const { data: wishlistItems, isLoading, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    retry: false, // No reintentar si falla con 401
  });

  // Todos los hooks deben estar antes de cualquier return condicional
  const removeMutation = useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId?: string }) =>
      wishlistService.removeFromWishlist(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  // Si hay error 401, redirigir a login (solo en el cliente)
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      router.push('/login?redirect=/account/wishlist');
    }
  }, [error, router]);

  // Si hay error 401, mostrar loading mientras se redirige
  if (error && (error as any)?.response?.status === 401) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  const handleAddToCart = async (productId: string, variantId?: string) => {
    try {
      await addItem({
        product_id: productId,
        variant_id: variantId,
        quantity: 1,
      });
      // Opcional: remover de wishlist después de agregar al carrito
      // await removeMutation.mutateAsync({ productId, variantId });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  const items = wishlistItems || [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Mi Lista de Deseos</h2>
        <p className="text-muted-foreground">
          {items.length > 0
            ? `${items.length} producto${items.length !== 1 ? 's' : ''} guardado${items.length !== 1 ? 's' : ''}`
            : 'No tienes productos guardados'}
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tu lista de deseos está vacía</h3>
            <p className="text-muted-foreground mb-6">
              Guarda tus productos favoritos para encontrarlos fácilmente más tarde
            </p>
            <Button asChild>
              <Link href="/products">Explorar Productos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard product={item.product} />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => handleAddToCart(item.product.id, item.variant_id || undefined)}
                  title="Agregar al carrito"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    removeMutation.mutate({
                      productId: item.product.id,
                      variantId: item.variant_id || undefined,
                    })
                  }
                  disabled={removeMutation.isPending}
                  title="Remover de lista de deseos"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

