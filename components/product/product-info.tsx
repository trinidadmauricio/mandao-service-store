/**
 * Componente Product Info
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/lib/api/services/wishlist.service';
import type { StorefrontProductDetail } from '@/types/api';
import { ProductVariantSelector } from './product-variant-selector';
import { cn } from '@/lib/utils';

interface ProductInfoProps {
  product: StorefrontProductDetail;
  currency: string;
}

export function ProductInfo({ product, currency }: ProductInfoProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants.length > 0 ? product.variants[0]?.id || null : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Check if product is in wishlist
  const { data: wishlistItems } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    enabled: isAuthenticated,
  });

  const isInWishlist = wishlistItems?.some(
    (item) => item.product_id === product.id && item.variant_id === selectedVariantId
  );

  const wishlistMutation = useMutation({
    mutationFn: () =>
      isInWishlist
        ? wishlistService.removeFromWishlist(product.id, selectedVariantId || undefined)
        : wishlistService.addToWishlist(product.id, selectedVariantId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const displayPrice = selectedVariant
    ? product.selling_price + selectedVariant.price_adjustment
    : product.selling_price;

  const hasDiscount = product.compare_at_price && product.compare_at_price > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - displayPrice) / product.compare_at_price!) * 100
      )
    : 0;

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);
    try {
      await addItem({
        product_id: product.id,
        variant_id: selectedVariantId || undefined,
        quantity,
      });
      // Optionally show a toast notification here
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      {product.category && (
        <div className="text-sm text-muted-foreground">
          <Link href="/products" className="hover:text-foreground">
            Productos
          </Link>
          {' / '}
          <Link
            href={`/products?category_id=${product.category.id}`}
            className="hover:text-foreground"
          >
            {product.category.name}
          </Link>
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        {product.brand && (
          <p className="text-muted-foreground">Marca: {product.brand.name}</p>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatPrice(displayPrice)}</span>
        {hasDiscount && (
          <>
            <span className="text-xl text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
            <Badge variant="destructive">-{discountPercent}%</Badge>
          </>
        )}
      </div>

      {/* Variants */}
      {product.variants.length > 0 && (
        <ProductVariantSelector
          variants={product.variants}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
          basePrice={product.selling_price}
          currency={currency}
        />
      )}

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Cantidad:</label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="flex-1"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isAdding ? 'Agregando...' : 'Agregar al Carrito'}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={isAdding}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          Comprar Ahora
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={isInWishlist ? 'Remover de favoritos' : 'Agregar a favoritos'}
          onClick={() => {
            if (!isAuthenticated) {
              router.push('/login?redirect=' + encodeURIComponent(router.asPath));
              return;
            }
            wishlistMutation.mutate();
          }}
          disabled={wishlistMutation.isPending}
          className={cn(isInWishlist && 'text-red-500')}
        >
          <Heart className={cn('h-5 w-5', isInWishlist && 'fill-current')} />
        </Button>
        <Button variant="outline" size="icon" aria-label="Compartir">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Product Details */}
      <div className="space-y-2 text-sm">
        <div className="flex">
          <span className="font-medium w-24">SKU:</span>
          <span className="text-muted-foreground">{product.sku}</span>
        </div>
        {product.category && (
          <div className="flex">
            <span className="font-medium w-24">Categoría:</span>
            <span className="text-muted-foreground">{product.category.name}</span>
          </div>
        )}
        {product.brand && (
          <div className="flex">
            <span className="font-medium w-24">Marca:</span>
            <span className="text-muted-foreground">{product.brand.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

