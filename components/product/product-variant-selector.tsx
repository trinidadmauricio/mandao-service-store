/**
 * Componente Product Variant Selector
 */

'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductVariant } from '@/types/api';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onVariantChange: (variantId: string | null) => void;
  basePrice: number;
  currency: string;
}

export function ProductVariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
  basePrice,
  currency,
}: ProductVariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const displayPrice = selectedVariant
    ? basePrice + selectedVariant.price_adjustment
    : basePrice;

  // Simple variant selector - show all variants as options
  const getVariantLabel = (variant: ProductVariant) => {
    const parts: string[] = [];
    if (variant.option1_value) parts.push(variant.option1_value);
    if (variant.option2_value) parts.push(variant.option2_value);
    if (variant.option3_value) parts.push(variant.option3_value);
    return parts.join(' / ') || 'Variante';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Variante</Label>
        <Select
          value={selectedVariantId || ''}
          onValueChange={(value) => onVariantChange(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar variante" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((variant) => (
              <SelectItem key={variant.id} value={variant.id}>
                {getVariantLabel(variant)}
                {variant.price_adjustment !== 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({variant.price_adjustment > 0 ? '+' : ''}
                    {formatPrice(variant.price_adjustment)})
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Display */}
      <div className="rounded-lg border p-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{formatPrice(displayPrice)}</span>
          {selectedVariant && selectedVariant.price_adjustment !== 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedVariant.price_adjustment > 0 ? '+' : ''}
              {formatPrice(selectedVariant.price_adjustment)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

