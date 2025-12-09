/**
 * Theme Provider
 * Proporciona el template activo basado en la configuración del storefront
 */

'use client';

import { createContext, useContext, useMemo } from 'react';
import { useTenant } from './tenant-provider';
import { getTemplateByName, type TemplateConfig, type TemplateName } from '@/templates';

interface ThemeContextValue {
  template: TemplateName;
  config: TemplateConfig;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { storefront } = useTenant();

  const themeValue = useMemo(() => {
    // Obtener template desde la configuración del storefront
    const templateName = (storefront?.theme_config as any)?.template as
      | TemplateName
      | undefined;

    const config = getTemplateByName(templateName);

    return {
      template: config.name,
      config,
    };
  }, [storefront]);

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

