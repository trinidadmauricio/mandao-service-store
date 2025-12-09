/**
 * Order Confirmation Page
 */

'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function OrderConfirmationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const isSuccess = searchParams.get('success') === 'true';

  if (!isSuccess) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Orden no encontrada</h1>
            <p className="text-muted-foreground mb-6">
              No se pudo encontrar la información de la orden.
            </p>
            <Button asChild>
              <Link href="/products">Continuar Comprando</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-3xl font-bold mb-2">¡Pedido Confirmado!</h1>
            <p className="text-muted-foreground mb-6">
              Tu pedido ha sido procesado exitosamente. Recibirás un email de confirmación pronto.
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-1">Número de orden</p>
              <p className="font-mono font-semibold">{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/products">
                  <Package className="mr-2 h-4 w-4" />
                  Continuar Comprando
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/account/orders">
                  Ver Mis Pedidos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Cargando...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}

