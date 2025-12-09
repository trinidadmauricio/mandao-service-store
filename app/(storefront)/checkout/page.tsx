/**
 * Checkout Page
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/lib/store/cart-store';
import { checkoutService, type CheckoutRequest } from '@/lib/api/services/checkout.service';
import { paymentService } from '@/lib/api/services/payment.service';
import { useTenant } from '@/providers/tenant-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { storefrontService } from '@/lib/api/services/storefront.service';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

const checkoutSchema = z.object({
  customer_name: z.string().min(1, 'El nombre es requerido'),
  customer_email: z.string().email('Email inválido').optional().or(z.literal('')),
  customer_phone: z.string().min(1, 'El teléfono es requerido'),
  delivery_street: z.string().min(1, 'La calle es requerida'),
  delivery_city: z.string().min(1, 'La ciudad es requerida'),
  delivery_state: z.string().optional(),
  delivery_zip_code: z.string().optional(),
  delivery_country: z.string().min(1, 'El país es requerido'),
  branch_id: z.string().uuid('Debe seleccionar una sucursal'),
  special_instructions: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface Branch {
  id: string;
  name: string;
  address: string;
}

function CheckoutPageContent() {
  const router = useRouter();
  const { tenant, storefront } = useTenant();
  const { cart, fetchCart, getSubtotal } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);

  // Check if checkout was canceled from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled') === 'true') {
      setCanceled(true);
      // Remove canceled param from URL
      router.replace('/checkout', { scroll: false });
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery_country: 'El Salvador',
    },
  });

  // Fetch branches (simplified - in production would use proper endpoint)
  const { data: branches } = useQuery<Branch[]>({
    queryKey: ['branches', tenant?.id],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<Branch[]>>('/api/v1/branches');
        return response.data.data;
      } catch {
        // If not authenticated or endpoint not available, return empty
        return [];
      }
    },
    enabled: !!tenant,
  });

  // Fetch product details
  const productIds = cart?.items.map((item) => item.product_id) || [];
  const { data: products } = useQuery({
    queryKey: ['products', 'checkout', productIds],
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

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Set default branch if available
  useEffect(() => {
    if (branches && branches.length > 0 && !watch('branch_id')) {
      const mainBranch = branches.find((b) => b.name.toLowerCase().includes('principal')) || branches[0];
      if (mainBranch) {
        setValue('branch_id', mainBranch.id);
      }
    }
  }, [branches, setValue, watch]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: tenant?.default_currency || 'USD',
    }).format(price);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart || !tenant) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate estimated delivery (2 hours from now)
      const estimatedDelivery = new Date();
      estimatedDelivery.setHours(estimatedDelivery.getHours() + 2);

      const checkoutData: CheckoutRequest = {
        tenant_id: tenant.id,
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id || undefined,
          quantity: item.quantity,
        })),
        customer: {
          name: data.customer_name,
          email: data.customer_email || undefined,
          phone: data.customer_phone,
        },
        delivery_address: {
          street: data.delivery_street,
          city: data.delivery_city,
          state: data.delivery_state || undefined,
          zip_code: data.delivery_zip_code || undefined,
          country: data.delivery_country,
          lat: 13.6929, // Default coordinates (San Salvador) - TODO: Add geocoding
          lng: -89.2182,
        },
        branch_id: data.branch_id,
        currency: tenant.default_currency,
        locale: tenant.default_locale,
        special_instructions: data.special_instructions || undefined,
        estimated_delivery_at: estimatedDelivery.toISOString(),
        priority: 'NORMAL',
      };

      const result = await checkoutService.checkout(checkoutData);

      // Clear cart
      await fetchCart();

      // Create Stripe checkout session
      try {
        const baseUrl = window.location.origin;
        const stripeCheckout = await paymentService.createCheckout({
          order_id: result.order_id,
          tenant_id: tenant.id,
          success_url: `${baseUrl}/orders/${result.order_id}?success=true`,
          cancel_url: `${baseUrl}/checkout?canceled=true`,
        });

        // Redirect to Stripe Checkout
        if (stripeCheckout.checkout_url) {
          window.location.href = stripeCheckout.checkout_url;
          return;
        }
      } catch (paymentError) {
        console.error('Error creating Stripe checkout:', paymentError);
        // If Stripe fails, still redirect to order confirmation
        // The order was created successfully, payment can be handled later
      }

      // Redirect to order confirmation
      router.push(`/orders/${result.order_id}?success=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el checkout');
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = getSubtotal();

  return (
    <div className="container py-8">
      <Link href="/cart" className="inline-flex items-center text-sm text-muted-foreground mb-6 hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al carrito
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {canceled && (
        <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
          El pago fue cancelado. Puedes intentar nuevamente completando el formulario.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer_name">Nombre completo *</Label>
                  <Input
                    id="customer_name"
                    {...register('customer_name')}
                    placeholder="Juan Pérez"
                  />
                  {errors.customer_name && (
                    <p className="text-sm text-destructive mt-1">{errors.customer_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    {...register('customer_email')}
                    placeholder="juan@example.com"
                  />
                  {errors.customer_email && (
                    <p className="text-sm text-destructive mt-1">{errors.customer_email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customer_phone">Teléfono *</Label>
                  <Input
                    id="customer_phone"
                    {...register('customer_phone')}
                    placeholder="+503 1234 5678"
                  />
                  {errors.customer_phone && (
                    <p className="text-sm text-destructive mt-1">{errors.customer_phone.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Dirección de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery_street">Calle y número *</Label>
                  <Input
                    id="delivery_street"
                    {...register('delivery_street')}
                    placeholder="Calle Principal 123"
                  />
                  {errors.delivery_street && (
                    <p className="text-sm text-destructive mt-1">{errors.delivery_street.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="delivery_city">Ciudad *</Label>
                    <Input
                      id="delivery_city"
                      {...register('delivery_city')}
                      placeholder="San Salvador"
                    />
                    {errors.delivery_city && (
                      <p className="text-sm text-destructive mt-1">{errors.delivery_city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="delivery_state">Estado/Provincia</Label>
                    <Input
                      id="delivery_state"
                      {...register('delivery_state')}
                      placeholder="San Salvador"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="delivery_zip_code">Código Postal</Label>
                    <Input
                      id="delivery_zip_code"
                      {...register('delivery_zip_code')}
                      placeholder="1101"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_country">País *</Label>
                    <Input
                      id="delivery_country"
                      {...register('delivery_country')}
                      placeholder="El Salvador"
                    />
                    {errors.delivery_country && (
                      <p className="text-sm text-destructive mt-1">{errors.delivery_country.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branch Selection */}
            {branches && branches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sucursal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={watch('branch_id') || ''}
                    onValueChange={(value) => setValue('branch_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.branch_id && (
                    <p className="text-sm text-destructive mt-1">{errors.branch_id.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones Especiales</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register('special_instructions')}
                  placeholder="Instrucciones para la entrega (opcional)"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.items.map((item) => {
                    const product = products?.find((p) => p.id === item.product_id);
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {product?.name || 'Producto'} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.total_price)}</span>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Envío</span>
                  <span>Calculado al procesar</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                  <p className="font-semibold mb-1">Pago seguro con Stripe</p>
                  <p>Serás redirigido a Stripe para completar el pago de forma segura.</p>
                </div>
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container py-8">Cargando...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}

