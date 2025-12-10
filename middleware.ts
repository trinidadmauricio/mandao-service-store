/**
 * Middleware para resolución multi-tenant
 * Extrae el subdominio y resuelve el tenant_id
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cache simple en memoria (en producción usar Redis o similar)
const tenantCache = new Map<string, { tenantId: string; expiresAt: number }>();
const CACHE_TTL = 60 * 1000; // 60 segundos

/**
 * Extrae el subdominio del hostname
 */
function getSubdomain(hostname: string): string | null {
  // En desarrollo, usar header X-Subdomain si está presente
  if (process.env.NODE_ENV === "development") {
    return null; // En dev, se puede usar header o query param
  }

  // Ignorar dominios de Railway (contienen .up.railway.app)
  // Estos dominios no son subdomains de tenant, son dominios de la plataforma
  if (hostname.includes(".up.railway.app")) {
    return null;
  }

  const parts = hostname.split(".");
  // Ejemplo: mitienda.mandao.com -> mitienda
  // Ejemplo: localhost -> null
  // Ejemplo: mandao-service-store-production.up.railway.app -> null (ya manejado arriba)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

/**
 * Resuelve tenant_id desde subdominio usando storefront config
 */
async function resolveTenant(subdomain: string): Promise<string | null> {
  // Verificar cache
  const cached = tenantCache.get(subdomain);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.tenantId;
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    // Usar el endpoint de storefront config que ya existe
    // Este endpoint requiere X-Tenant-Id, pero podemos intentar obtenerlo del subdomain
    // Por ahora, intentamos obtener el config pasando el subdomain como header
    const response = await fetch(`${apiUrl}/api/v1/storefront/config`, {
      cache: "no-store",
      headers: {
        "X-Subdomain": subdomain,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const tenantId = data.data?.tenant?.id;

    if (tenantId) {
      // Cachear resultado
      tenantCache.set(subdomain, {
        tenantId,
        expiresAt: Date.now() + CACHE_TTL,
      });
    }

    return tenantId || null;
  } catch (error) {
    console.error("Error resolving tenant:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar archivos estáticos y API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Obtener hostname
  const hostname = request.headers.get("host") || "";
  const subdomain = getSubdomain(hostname);

  // Si no hay subdominio, permitir acceso (puede ser dominio principal, localhost, o Railway)
  if (!subdomain) {
    // En desarrollo, usar 'dev' como subdomain por defecto
    if (process.env.NODE_ENV === "development") {
      const response = NextResponse.next();
      response.cookies.set("subdomain", "dev", {
        path: "/",
        maxAge: 60 * 60 * 24, // 24 horas
        sameSite: "lax",
      });
      return response;
    }
    
    // En producción sin subdominio (Railway, dominio principal, etc.)
    // Permitir acceso - el TenantProvider manejará la obtención del tenant
    // desde cookies, headers, o tenant por defecto
    const response = NextResponse.next();
    
    // Si hay un tenant por defecto configurado, establecerlo en cookies
    const defaultTenantId = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID;
    if (defaultTenantId) {
      response.cookies.set("tenant_id", defaultTenantId, {
        path: "/",
        maxAge: 60 * 60 * 24, // 24 horas
        sameSite: "lax",
      });
    }
    
    return response;
  }

  // Resolver tenant
  const tenantId = await resolveTenant(subdomain);

  if (!tenantId) {
    // Tenant no encontrado - mostrar 404 o página de error
    return new NextResponse("Store not found", { status: 404 });
  }

  // Crear response y agregar headers
  const response = NextResponse.next();

  // Agregar tenant_id a headers para que esté disponible en Server Components
  response.headers.set("X-Tenant-Id", tenantId);
  response.headers.set("X-Subdomain", subdomain);

  // Agregar tenant_id y subdomain a cookies para que esté disponible en Client Components
  response.cookies.set("tenant_id", tenantId, {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 horas
    sameSite: "lax",
  });
  response.cookies.set("subdomain", subdomain, {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 horas
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
