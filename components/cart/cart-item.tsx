/**
 * Componente Cart Item
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';
import type { CartItem as CartItemType } from '@/types/api';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CartItemProps {
  item: CartItemType;
  productName?: string;
  productImage?: string;
  compact?: boolean;
}

export function CartItem({ item, productName, productImage, compact = false }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD', // TODO: Get from tenant context
    }).format(price);
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemove();
      return;
    }
    setIsUpdating(true);
    try {
      await updateItem(item.id, { quantity: newQuantity });
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItem(item.id);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 py-4 border-b last:border-0">
        {productImage ? (
          <Link href={`/products/${item.product_id}`} className="relative h-16 w-16 flex-shrink-0">
            <Image
              src={productImage}
              alt={productName || 'Product'}
              fill
              className="object-cover rounded"
              sizes="64px"
            />
          </Link>
        ) : (
          <div className="h-16 w-16 flex-shrink-0 bg-muted rounded" />
        )}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.product_id}`}>
            <h4 className="font-medium truncate">{productName || 'Product'}</h4>
          </Link>
          <p className="text-sm text-muted-foreground">
            {formatPrice(item.unit_price)} × {item.quantity}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 py-4 border-b last:border-0">
      {productImage ? (
        <Link href={`/products/${item.product_id}`} className="relative h-24 w-24 flex-shrink-0">
          <Image
            src={productImage}
            alt={productName || 'Product'}
            fill
            className="object-cover rounded"
            sizes="96px"
          />
        </Link>
      ) : (
        <div className="h-24 w-24 flex-shrink-0 bg-muted rounded" />
      )}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product_id}`}>
          <h4 className="font-semibold mb-1">{productName || 'Product'}</h4>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">
          {formatPrice(item.unit_price)} cada uno
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border rounded">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatPrice(item.total_price)}</p>
      </div>
    </div>
  );
}

export function CartItemSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-4 py-4">
        <Skeleton className="h-16 w-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 py-4">
      <Skeleton className="h-24 w-24" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

