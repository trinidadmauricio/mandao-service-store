/**
 * Terms and Conditions Page
 */

'use client';

import { useTenant } from '@/providers/tenant-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function TermsPage() {
  const { tenant, storefront, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  const storeName = tenant?.name || 'Mandao Store';
  const termsContent = storefront?.terms || `TÉRMINOS Y CONDICIONES DE USO

Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}

1. ACEPTACIÓN DE LOS TÉRMINOS

Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web.

2. USO DEL SITIO WEB

Usted se compromete a utilizar este sitio web de manera legal y de acuerdo con estos términos. No debe:
- Utilizar el sitio para fines ilegales o no autorizados
- Intentar acceder a áreas restringidas del sitio
- Interferir con el funcionamiento del sitio web
- Transmitir virus u otro código malicioso

3. PRODUCTOS Y SERVICIOS

Todos los productos y servicios están sujetos a disponibilidad. Nos reservamos el derecho de modificar, suspender o discontinuar cualquier producto o servicio en cualquier momento sin previo aviso.

4. PRECIOS Y PAGOS

Los precios están sujetos a cambios sin previo aviso. Todos los precios incluyen impuestos aplicables a menos que se indique lo contrario. Los métodos de pago aceptados se mostrarán durante el proceso de checkout.

5. ENVÍOS Y ENTREGAS

Los tiempos de entrega son estimados y pueden variar. No nos hacemos responsables por retrasos causados por terceros (transportistas, aduanas, etc.).

6. DEVOLUCIONES Y REEMBOLSOS

Las políticas de devolución y reembolso se aplicarán según se indique en cada producto. Por favor, revise la política de devoluciones antes de realizar su compra.

7. PROPIEDAD INTELECTUAL

Todo el contenido de este sitio web, incluyendo textos, gráficos, logotipos, imágenes y software, es propiedad de ${storeName} y está protegido por las leyes de propiedad intelectual.

8. LIMITACIÓN DE RESPONSABILIDAD

${storeName} no será responsable por ningún daño directo, indirecto, incidental o consecuente que resulte del uso o la imposibilidad de usar este sitio web.

9. MODIFICACIONES

Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.

10. CONTACTO

Si tiene preguntas sobre estos términos y condiciones, puede contactarnos a través de nuestra página de contacto.`;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Términos y Condiciones</h1>
        <Card>
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {termsContent}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

