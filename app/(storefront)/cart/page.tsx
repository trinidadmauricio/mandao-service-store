/**
 * Cart Page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { CartItem, CartItemSkeleton } from '@/components/cart/cart-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { storefrontService } from '@/lib/api/services/storefront.service';
import { useTenant } from '@/providers/tenant-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function CartPage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const { cart, isLoading, fetchCart, getTotalItems, getSubtotal } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Fetch product details for cart items
  const productIds = cart?.items.map((item) => item.product_id) || [];
  const { data: products } = useQuery({
    queryKey: ['products', 'cart', productIds],
    queryFn: async () => {
      const allProducts = await storefrontService.getProducts({
        limit: 1000,
        locale: tenant?.default_locale,
        currency: tenant?.default_currency,
      });
      return allProducts.filter((p) => productIds.includes(p.id));
    },
    enabled: productIds.length > 0 && !!tenant,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: tenant?.default_currency || 'USD',
    }).format(price);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CartItemSkeleton key={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-6">
              Agrega productos a tu carrito para continuar con tu compra
            </p>
            <Button asChild>
              <Link href="/products">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Explorar Productos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {totalItems} producto{totalItems !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const product = products?.find((p) => p.id === item.product_id);
                  return (
                    <CartItem
                      key={item.id}
                      item={item}
                      productName={product?.name}
                      productImage={product?.featured_image_url || undefined}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {cart.coupon_code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Descuento ({cart.coupon_code})
                    </span>
                    <span className="text-green-600">-</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-muted-foreground">Calculado en checkout</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">{formatPrice(subtotal)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceder al Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/products">Continuar Comprando</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

