import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '@/lib/api';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

interface CartState {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: any) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      totalItems: 0,
      totalPrice: 0,

      addToCart: (product) => {
        // Use the API function to add to cart
        const updatedCart = apiAddToCart(product);
        
        // Calculate totals
        const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update state
        set({ cart: updatedCart, totalItems, totalPrice });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) return;
        
        // Use the API function to update cart
        const updatedCart = apiUpdateCartItem(productId, quantity);
        
        // Calculate totals
        const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update state
        set({ cart: updatedCart, totalItems, totalPrice });
      },

      removeFromCart: (productId) => {
        // Use the API function to remove from cart
        const updatedCart = apiRemoveFromCart(productId);
        
        // Calculate totals
        const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update state
        set({ cart: updatedCart, totalItems, totalPrice });
      },

      clearCart: () => {
        // Use the API function to clear cart
        apiClearCart();
        set({ cart: [], totalItems: 0, totalPrice: 0 });
      },
    }),
    {
      name: 'e-commerce-cart',
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Sync with localStorage on rehydration
            const cart = getCart();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            state.cart = cart;
            state.totalItems = totalItems;
            state.totalPrice = totalPrice;
          }
        };
      }
    }
  )
); 