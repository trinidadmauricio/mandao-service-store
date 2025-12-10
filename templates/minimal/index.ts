/**
 * Minimal Template
 * Template minimalista con diseño limpio y elegante
 */

import { Header } from '@/components/layout/header/header';
import { Footer } from '@/components/layout/footer/footer';
import { ProductCard } from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryShowcase } from '@/components/home/category-showcase';
import type { TemplateConfig } from '../index';

export const minimalTemplate: TemplateConfig = {
  name: 'minimal',
  displayName: 'Minimal',
  description: 'Template minimalista con diseño limpio y elegante',
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
      primary: 'hsl(0 0% 9%)',          // Negro puro
      secondary: 'hsl(0 0% 96%)',       // Gris muy claro
      accent: 'hsl(0 0% 45%)',          // Gris medio
      background: 'hsl(0 0% 100%)',     // Blanco puro
      foreground: 'hsl(0 0% 9%)',       // Negro
    },
  },
};

