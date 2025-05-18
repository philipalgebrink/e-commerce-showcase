import { useCartStore } from '~/stores/cart';

export default defineNuxtPlugin((nuxtApp) => {
  const cartStore = useCartStore();
  cartStore.initializeCart();
});