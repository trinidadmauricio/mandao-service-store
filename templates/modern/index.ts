/**
 * Modern Template
 * Template moderno con estilo full-width, tonos azules y sombras suaves
 */

import { Header } from '@/components/layout/header/header';
import { Footer } from '@/components/layout/footer/footer';
import { ProductCard } from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryShowcase } from '@/components/home/category-showcase';
import type { TemplateConfig } from '../index';

export const modernTemplate: TemplateConfig = {
  name: 'modern',
  displayName: 'Modern',
  description: 'Template moderno con diseño full-width y tonos azules',
  components: {
    Header,
    Footer,
    ProductCard,
    ProductGrid,
    HeroBanner,
    CategoryShowcase,
  },
  theme: {
    colors: {
      primary: 'hsl(217 91% 60%)',      // Azul vibrante
      secondary: 'hsl(215 20% 65%)',    // Gris azulado
      accent: 'hsl(199 89% 48%)',       // Cyan
      background: 'hsl(210 20% 98%)',   // Blanco azulado
      foreground: 'hsl(222 47% 11%)',   // Azul oscuro
    },
  },
};
