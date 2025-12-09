/**
 * Template Registry
 * Sistema de templates intercambiables para el storefront
 */

import { classicTemplate } from './classic';

export type TemplateName = 'classic' | 'modern' | 'minimal' | 'fashion';

export interface TemplateComponents {
  Header: React.ComponentType<any>;
  Footer: React.ComponentType<any>;
  ProductCard: React.ComponentType<any>;
  ProductGrid: React.ComponentType<any>;
  HeroBanner: React.ComponentType<any>;
  CategoryShowcase: React.ComponentType<any>;
}

export interface TemplateConfig {
  name: TemplateName;
  displayName: string;
  description: string;
  components: TemplateComponents;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
    };
  };
}

// Registry de templates
// Solo incluir templates implementados
export const templates: Partial<Record<TemplateName, TemplateConfig>> & {
  classic: TemplateConfig;
} = {
  classic: classicTemplate,
  // modern: modernTemplate, // TODO: Implementar
  // minimal: minimalTemplate, // TODO: Implementar
  // fashion: fashionTemplate, // TODO: Implementar
};

/**
 * Obtener template por nombre
 */
export function getTemplate(name: TemplateName): TemplateConfig {
  return templates[name] || templates.classic;
}

/**
 * Obtener template por nombre desde string (con fallback)
 */
export function getTemplateByName(name: string | null | undefined): TemplateConfig {
  if (!name || !(name in templates)) {
    return templates.classic;
  }
  const template = templates[name as TemplateName];
  return template || templates.classic;
}

