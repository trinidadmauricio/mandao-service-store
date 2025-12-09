/**
 * Store de Zustand para el carrito
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem } from '@/types/api';
import { cartService } from '@/lib/api/services/cart.service';
import type { AddCartItemDto, UpdateCartItemDto } from '@/lib/api/services/cart.service';

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchCart: () => Promise<void>;
  addItem: (item: AddCartItemDto) => Promise<void>;
  updateItem: (itemId: string, data: UpdateCartItemDto) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      error: null,

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.getCart();
          set({ cart, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch cart',
            isLoading: false,
          });
        }
      },

      addItem: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.addItem(item);
          set({ cart, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add item to cart',
            isLoading: false,
          });
          throw error;
        }
      },

      updateItem: async (itemId, data) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.updateItem(itemId, data);
          set({ cart, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update cart item',
            isLoading: false,
          });
          throw error;
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.removeItem(itemId);
          set({ cart, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to remove item from cart',
            isLoading: false,
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await cartService.clearCart();
          set({ cart: null, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to clear cart',
            isLoading: false,
          });
          throw error;
        }
      },

      getTotalItems: () => {
        const { cart } = get();
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        const { cart } = get();
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + item.total_price, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }), // Solo persistir el cart, no loading/error
    }
  )
);

