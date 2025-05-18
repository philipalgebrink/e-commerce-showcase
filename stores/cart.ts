import { defineStore } from 'pinia';
import Cookies from 'js-cookie';

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  actions: {
    initializeCart() {
      const cartData = Cookies.get('cart');
      if (cartData) {
        try {
          this.items = JSON.parse(cartData);
        } catch (error) {
          console.error('Error parsing cart from cookies:', error);
          this.items = [];
        }
      }
    },

    saveCart() {
      Cookies.set('cart', JSON.stringify(this.items), { expires: 7 });
    },

    addItem(item: CartItem) {
      const existingItem = this.items.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        this.items.push(item);
      }
      this.saveCart();
    },

    updateQuantity(productId: string, variantId: string, quantity: number) {
      const item = this.items.find(
        (i) => i.productId === productId && i.variantId === variantId
      );
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId, variantId);
        } else {
          item.quantity = quantity;
          this.saveCart();
        }
      }
    },

    removeItem(productId: string, variantId: string) {
      this.items = this.items.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      );
      this.saveCart();
    },

    clearCart() {
      this.items = [];
      this.saveCart();
    },
  },

  getters: {
    itemCount(state): number {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },

    totalPrice(state): number {
      return state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
  },
});