/**
 * Componente de Icono de Carrito
 */

'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store/cart-store';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
}

export function CartIcon({ className }: CartIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  // Evitar mismatch de hidratación: solo mostrar badge después de montar
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn('relative', className)}
        onClick={() => setIsOpen(true)}
        aria-label="Ver carrito"
      >
        <ShoppingCart className="h-5 w-5" />
        {isMounted && totalItems > 0 && (
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
      <CartDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

