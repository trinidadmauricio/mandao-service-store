/**
 * Componente Hero Banner
 */

'use client';

import { useTenant } from '@/providers/tenant-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroBanner() {
  const { storefront, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="relative h-[400px] w-full animate-pulse rounded-lg bg-muted" />
    );
  }

  const heroConfig = storefront?.theme_config?.hero as
    | {
        title?: string;
        subtitle?: string;
        cta_text?: string;
        cta_link?: string;
        image_url?: string;
      }
    | undefined;

  const title = heroConfig?.title || 'Bienvenido a nuestra tienda';
  const subtitle = heroConfig?.subtitle || 'Descubre los mejores productos';
  const ctaText = heroConfig?.cta_text || 'Explorar Productos';
  const ctaLink = heroConfig?.cta_link || '/products';
  const imageUrl = heroConfig?.image_url;

  return (
    <section
      className="relative h-[400px] w-full overflow-hidden rounded-lg bg-muted"
      style={
        imageUrl
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="mb-8 max-w-2xl text-lg md:text-xl">{subtitle}</p>
        <Link href={ctaLink}>
          <Button size="lg" className="gap-2">
            {ctaText}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

