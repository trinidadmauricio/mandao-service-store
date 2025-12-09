/**
 * Componente de Icono de Carrito
 */

'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store/cart-store';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
}

export function CartIcon({ className }: CartIconProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <Link href="/cart" aria-label="Ver carrito">
      <Button variant="ghost" size="icon" className={cn('relative', className)}>
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            aria-label={`${totalItems} items en el carrito`}
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
        <span className="sr-only">Carrito de compras</span>
      </Button>
    </Link>
  );
}

