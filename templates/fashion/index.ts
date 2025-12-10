/**
 * Fashion Template
 * Template estilo lookbook con estética editorial premium
 */

import { Header } from '@/components/layout/header/header';
import { Footer } from '@/components/layout/footer/footer';
import { ProductCard } from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryShowcase } from '@/components/home/category-showcase';
import type { TemplateConfig } from '../index';

export const fashionTemplate: TemplateConfig = {
  name: 'fashion',
  displayName: 'Fashion',
  description: 'Template estilo lookbook con estética editorial premium',
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
      primary: 'hsl(0 0% 5%)',          // Negro profundo
      secondary: 'hsl(43 74% 49%)',     // Dorado
      accent: 'hsl(43 74% 49%)',        // Dorado accent
      background: 'hsl(0 0% 98%)',      // Blanco cremoso
      foreground: 'hsl(0 0% 5%)',       // Negro profundo
    },
  },
};

