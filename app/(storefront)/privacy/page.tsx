/**
 * Privacy Policy Page
 */

'use client';

import { useTenant } from '@/providers/tenant-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrivacyPage() {
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
  const privacyContent = storefront?.privacy_policy || `POLÍTICA DE PRIVACIDAD

Última actualización: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}

1. INFORMACIÓN QUE RECOPILAMOS

Recopilamos información que usted nos proporciona directamente, incluyendo:
- Información de cuenta (nombre, email, teléfono)
- Información de pedidos y transacciones
- Información de dirección de entrega
- Comunicaciones con nuestro servicio al cliente

2. CÓMO UTILIZAMOS SU INFORMACIÓN

Utilizamos la información recopilada para:
- Procesar y completar sus pedidos
- Enviarle actualizaciones sobre sus pedidos
- Responder a sus consultas y solicitudes
- Mejorar nuestros productos y servicios
- Enviarle comunicaciones de marketing (con su consentimiento)

3. COMPARTIR INFORMACIÓN

No vendemos su información personal. Podemos compartir su información con:
- Proveedores de servicios que nos ayudan a operar nuestro negocio (procesadores de pago, servicios de envío)
- Cuando sea requerido por ley o para proteger nuestros derechos

4. SEGURIDAD

Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal. Sin embargo, ningún método de transmisión por Internet es 100% seguro.

5. COOKIES

Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. Puede configurar su navegador para rechazar cookies, pero esto puede afectar algunas funcionalidades del sitio.

6. SUS DERECHOS

Usted tiene derecho a:
- Acceder a su información personal
- Corregir información inexacta
- Solicitar la eliminación de su información
- Oponerse al procesamiento de su información
- Retirar su consentimiento en cualquier momento

7. RETENCIÓN DE DATOS

Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera un período de retención más largo.

8. MENORES DE EDAD

Nuestro sitio web no está dirigido a menores de 18 años. No recopilamos intencionalmente información personal de menores.

9. CAMBIOS A ESTA POLÍTICA

Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos publicando la nueva política en esta página.

10. CONTACTO

Si tiene preguntas sobre esta política de privacidad, puede contactarnos a través de nuestra página de contacto.`;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Política de Privacidad</h1>
        <Card>
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {privacyContent}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

