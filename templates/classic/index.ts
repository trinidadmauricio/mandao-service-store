/**
 * Classic Template
 * Template tradicional y versátil para e-commerce
 */

import { Header } from '@/components/layout/header/header';
import { Footer } from '@/components/layout/footer/footer';
import { ProductCard } from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryShowcase } from '@/components/home/category-showcase';
import type { TemplateConfig } from '../index';

export const classicTemplate: TemplateConfig = {
  name: 'classic',
  displayName: 'Classic',
  description: 'Template tradicional y versátil para e-commerce',
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
      primary: 'hsl(222.2 47.4% 11.2%)',
      secondary: 'hsl(210 40% 96.1%)',
      accent: 'hsl(210 40% 96.1%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 47.4% 11.2%)',
    },
  },
};

