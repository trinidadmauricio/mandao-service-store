/**
 * Account Dashboard Page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/lib/api/services/customer.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Package, MapPin, Heart, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { isAuthenticated } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => customerService.getProfile(),
    enabled: isAuthenticated,
  });

  if (profileLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const userName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : 'Usuario';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, {userName}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Link href="/account/profile">
          <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Mi Perfil</CardTitle>
                  <CardDescription>Gestiona tu información personal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{userName}</p>
                <p className="text-muted-foreground">{profile?.email}</p>
                {profile?.phone && (
                  <p className="text-muted-foreground">{profile.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Orders Card */}
        <Link href="/account/orders">
          <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Mis Pedidos</CardTitle>
                  <CardDescription>Historial de tus compras</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ver y rastrear tus pedidos
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Addresses Card */}
        <Link href="/account/addresses">
          <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Direcciones</CardTitle>
                  <CardDescription>Gestiona tus direcciones</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Agregar y editar direcciones de entrega
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Wishlist Card */}
        <Link href="/account/wishlist">
          <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Lista de Deseos</CardTitle>
                  <CardDescription>Productos guardados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ver tus productos favoritos
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Settings Card */}
        <Link href="/account/settings">
          <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription>Preferencias de cuenta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cambiar contraseña y preferencias
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

