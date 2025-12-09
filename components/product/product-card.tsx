/**
 * Componente Product Card
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import type { StorefrontProduct } from '@/types/api';
import { useCartStore } from '@/lib/store/cart-store';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: StorefrontProduct;
  onAddToCart?: (productId: string, variantId?: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;

    setIsAdding(true);
    try {
      await addItem({
        product_id: product.id,
        quantity: 1,
      });
      onAddToCart?.(product.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.selling_price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.selling_price) / product.compare_at_price!) * 100
      )
    : 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="flex-1">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            {product.featured_image_url ? (
              <Image
                src={product.featured_image_url}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
            {product.is_featured && (
              <Badge className="absolute left-2 top-2">Destacado</Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="absolute right-2 top-2">
                -{discountPercent}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <div className="mb-2">
            {product.category && (
              <p className="text-xs text-muted-foreground">{product.category.name}</p>
            )}
            <h3 className="line-clamp-2 font-semibold">{product.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {formatPrice(product.selling_price, product.currency)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_at_price!, product.currency)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="flex-1"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAdding ? 'Agregando...' : 'Agregar'}
        </Button>
        <Button variant="outline" size="icon" aria-label="Agregar a favoritos">
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

