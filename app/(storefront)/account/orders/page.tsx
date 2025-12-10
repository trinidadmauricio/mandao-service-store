/**
 * Orders History Page
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/lib/api/services/order.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductPagination } from '@/components/products/product-pagination';
import { DateDisplay } from '@/components/ui/date-display';

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

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const limit = 10;

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['customer-orders', page, statusFilter],
    queryFn: () =>
      orderService.getOrders({
        page,
        limit,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      }),
  });

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const orders = ordersData?.data || [];
  const totalPages = ordersData?.totalPages || 0;
  const totalItems = ordersData?.total || 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Pedidos</h2>
          <p className="text-muted-foreground">
            {totalItems > 0
              ? `${totalItems} pedido${totalItems !== 1 ? 's' : ''} encontrado${totalItems !== 1 ? 's' : ''}`
              : 'No tienes pedidos aún'}
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            {Object.entries(orderStatusMap).map(([status, { label }]) => (
              <SelectItem key={status} value={status}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay pedidos</h3>
            <p className="text-muted-foreground mb-6">
              {statusFilter !== 'ALL'
                ? 'No se encontraron pedidos con ese estado'
                : 'Aún no has realizado ningún pedido'}
            </p>
            <Button asChild>
              <Link href="/products">Explorar Productos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = orderStatusMap[order.status] || {
              label: order.status,
              variant: 'outline' as const,
            };

            return (
              <Card key={order.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{order.order_display_number || order.order_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        <DateDisplay
                          date={order.created_at}
                          options={{
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }}
                        />
                      </p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Tracking:</span>{' '}
                        <span className="font-mono">{order.tracking_code}</span>
                      </p>
                    </div>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {totalPages > 1 && (
            <div className="mt-6">
              <ProductPagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={limit}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

