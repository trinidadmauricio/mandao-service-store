/**
 * Order Detail Page
 */

'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/lib/api/services/order.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

const orderStatusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendiente', variant: 'outline' },
  CONFIRMED: { label: 'Confirmada', variant: 'default' },
  PREPARING: { label: 'Preparando', variant: 'default' },
  READY: { label: 'Lista', variant: 'default' },
  IN_TRANSIT: { label: 'En Tránsito', variant: 'default' },
  DELIVERED: { label: 'Entregada', variant: 'default' },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' },
  FAILED: { label: 'Fallida', variant: 'destructive' },
};

function OrderDetailContent() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['customer-order', orderId],
    queryFn: () => orderService.getOrder(orderId),
  });

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Link href="/account/orders">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pedidos
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Pedido no encontrado</h2>
            <p className="text-muted-foreground mb-6">
              El pedido que buscas no existe o no tienes permisos para verlo.
            </p>
            <Button asChild>
              <Link href="/account/orders">Ver Mis Pedidos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = orderStatusMap[order.status] || {
    label: order.status,
    variant: 'outline' as const,
  };

  return (
    <div>
      <Link href="/account/orders">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Pedidos
        </Button>
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Pedido #{order.order_display_number || order.order_number}
          </h2>
          <p className="text-muted-foreground">Realizado el {formatDate(order.created_at)}</p>
        </div>
        <Badge variant={status.variant} className="text-lg px-4 py-2">
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Los detalles de los productos se mostrarán aquí cuando la API esté disponible.
              </p>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La información de entrega se mostrará aquí cuando la API esté disponible.
              </p>
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Número de Pedido</span>
                  <span className="font-mono">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking Code</span>
                  <span className="font-mono">{order.tracking_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div>
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}

