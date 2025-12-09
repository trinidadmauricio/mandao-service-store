/**
 * Servicio para búsqueda de productos
 * 
 * Nota: Por ahora usa el endpoint de productos y filtra client-side.
 * Cuando el endpoint de búsqueda esté disponible (api-1.10), se actualizará.
 */

import { storefrontService } from './storefront.service';
import type { SearchResult, StorefrontProduct, StorefrontCategory, StorefrontBrand } from '@/types/api';

export const searchService = {
  /**
   * Buscar productos, categorías y marcas
   * 
   * Implementación temporal: busca en productos, categorías y marcas client-side
   * hasta que el endpoint de búsqueda esté disponible en el backend.
   */
  async search(params: {
    q: string;
    page?: number;
    limit?: number;
    locale?: string;
    currency?: string;
  }): Promise<SearchResult> {
    const query = params.q.toLowerCase().trim();
    
    if (!query) {
      return {
        products: [],
        categories: [],
        brands: [],
        total: 0,
      };
    }

    // Fetch all products, categories, and brands
    const [products, categories, brands] = await Promise.all([
      storefrontService.getProducts({
        locale: params.locale,
        currency: params.currency,
        limit: 1000, // Get all products for search
      }),
      storefrontService.getCategories({ include_children: false }),
      storefrontService.getBrands(),
    ]);

    // Filter products by name, description, or SKU
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );

    // Filter categories by name or description
    const filteredCategories = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
    );

    // Filter brands by name or description
    const filteredBrands = brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(query) ||
        brand.description?.toLowerCase().includes(query) ||
        brand.slug.toLowerCase().includes(query)
    );

    // Apply pagination to products
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = filteredProducts.slice(start, end);

    const total = filteredProducts.length + filteredCategories.length + filteredBrands.length;

    return {
      products: paginatedProducts,
      categories: filteredCategories,
      brands: filteredBrands,
      total,
    };
  },
};

