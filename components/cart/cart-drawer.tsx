/**
 * Componente Cart Drawer (Sheet)
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store/cart-store';
import { CartItem, CartItemSkeleton } from './cart-item';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { storefrontService } from '@/lib/api/services/storefront.service';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter();
  const { cart, isLoading, fetchCart, getTotalItems, getSubtotal } = useCartStore();

  useEffect(() => {
    if (open && !cart) {
      fetchCart();
    }
  }, [open, cart, fetchCart]);

  // Fetch product details for cart items
  const productIds = cart?.items.map((item) => item.product_id) || [];
  const { data: products } = useQuery({
    queryKey: ['products', 'cart', productIds],
    queryFn: async () => {
      const allProducts = await storefrontService.getProducts({ limit: 1000 });
      return allProducts.filter((p) => productIds.includes(p.id));
    },
    enabled: productIds.length > 0,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD', // TODO: Get from tenant context
    }).format(price);
  };

  const handleCheckout = () => {
    onOpenChange(false);
    router.push('/cart');
  };

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrito de Compras</SheetTitle>
          <SheetDescription>
            {totalItems > 0
              ? `${totalItems} producto${totalItems !== 1 ? 's' : ''} en tu carrito`
              : 'Tu carrito está vacío'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartItemSkeleton key={i} compact />
              ))}
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tu carrito está vacío</h3>
              <p className="text-muted-foreground mb-6">
                Agrega productos a tu carrito para continuar
              </p>
              <Button onClick={() => onOpenChange(false)} asChild>
                <Link href="/products">Explorar Productos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => {
                const product = products?.find((p) => p.id === item.product_id);
                return (
                  <CartItem
                    key={item.id}
                    item={item}
                    productName={product?.name}
                    productImage={product?.featured_image_url || undefined}
                    compact
                  />
                );
              })}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {cart.coupon_code && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento ({cart.coupon_code})</span>
                  <span className="text-green-600">-</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceder al Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/cart" onClick={() => onOpenChange(false)}>
                  Ver Carrito Completo
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

