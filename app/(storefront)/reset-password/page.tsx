/**
 * Reset Password Page
 */

'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/lib/api/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirm_password: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de reset no válido o faltante');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token de reset no válido');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.resetPassword({
        token,
        password: data.password,
      });
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?password_reset=true');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer contraseña');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh] py-12">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">¡Contraseña Restablecida!</h2>
            <p className="text-muted-foreground mb-6">
              Tu contraseña ha sido restablecida exitosamente. Redirigiendo al login...
            </p>
            <Button asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ir al Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh] py-12">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Token Inválido</h2>
            <p className="text-muted-foreground mb-6">
              El enlace de restablecimiento no es válido o ha expirado.
            </p>
            <Button asChild>
              <Link href="/forgot-password">Solicitar Nuevo Enlace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[60vh] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Restablecer Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                {...register('confirm_password')}
                disabled={isSubmitting}
              />
              {errors.confirm_password && (
                <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restableciendo...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Restablecer Contraseña
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="text-primary hover:underline inline-flex items-center">
              <ArrowLeft className="mr-1 h-3 w-3" />
              Volver al Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

