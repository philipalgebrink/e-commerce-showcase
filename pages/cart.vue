<template>
  <div class="cart-page">
    <NuxtLink to="/" class="back-link">← Back to Products</NuxtLink>
    <h1>Shopping Cart</h1>
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Your cart is empty.</p>
      <NuxtLink to="/" class="shop-link">Continue Shopping</NuxtLink>
    </div>
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="`${item.productId}-${item.variantId}`" class="cart-item">
          <img :src="item.imageUrl" :alt="item.name" class="item-image" @error="handleImageError" />
          <div class="item-details">
            <h2>{{ item.name }}</h2>
            <p class="size"> Size: {{ item.size }}</p>
            <p class="price">{{ item.price }} {{ item.currency }}</p>
            <div class="quantity-control">
              <button @click="updateQuantity(item.productId, item.variantId, item.quantity - 1)" class="quantity-btn">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button @click="updateQuantity(item.productId, item.variantId, item.quantity + 1)" class="quantity-btn">+</button>
            </div>
            <button @click="removeItem(item.productId, item.variantId)" class="remove-btn">Remove</button>
          </div>
        </div>
      </div>
      <div class="cart-summary">
        <h2>Summary</h2>
        <p>Total Items: {{ cartStore.itemCount }}</p>
        <p>Total Price: {{ cartStore.totalPrice }} {{ cartStore.items[0]?.currency || 'SEK' }}</p>
        <button @click="showCheckoutForm = !showCheckoutForm" class="checkout-button">
          {{ showCheckoutForm ? 'Cancel' : 'Proceed to Checkout' }}
        </button>
        <button @click="cartStore.clearCart" class="clear-cart-button">Clear Cart</button>

        <div v-if="showCheckoutForm" class="checkout-form">
          <h3>Shipping Information</h3>
          <form @submit.prevent="handleCheckout">
            <div class="form-group">
              <label for="name">Name</label>
              <input v-model="shipping.name" id="name" type="text" required />
            </div>
            <div class="form-group">
              <label for="address1">Address</label>
              <input v-model="shipping.address1" id="address1" type="text" required />
            </div>
            <div class="form-group">
              <label for="city">City</label>
              <input v-model="shipping.city" id="city" type="text" required />
            </div>
            <div class="form-group">
              <label for="state_code">State/Province Code</label>
              <input v-model="shipping.state_code" id="state_code" type="text" placeholder="e.g., CA" required />
            </div>
            <div class="form-group">
              <label for="country_code">Country Code</label>
              <input v-model="shipping.country_code" id="country_code" type="text" placeholder="e.g., US" required />
            </div>
            <div class="form-group">
              <label for="zip">ZIP/Postal Code</label>
              <input v-model="shipping.zip" id="zip" type="text" required />
            </div>
            <h3>Payment Information</h3>
            <div id="card-element" class="card-element"></div>
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
            <button type="submit" class="pay-button" :disabled="loading">
              {{ loading ? 'Processing...' : 'Pay Now' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '~/stores/cart';
import { loadStripe } from '@stripe/stripe-js';

const cartStore = useCartStore();
const placeholderImage = 'https://via.placeholder.com/150';
const showCheckoutForm = ref(false);
const errorMessage = ref('');
const loading = ref(false);

const shipping = ref({
  name: '',
  address1: '',
  city: '',
  state_code: '',
  country_code: '',
  zip: '',
});

let stripe: any = null;
let elements: any = null;
let cardElement: any = null;

onMounted(async () => {
  stripe = await loadStripe('pk_test_51RQ99uD69CjBsj6AcwVz0N7ZpLR03insV6VZedZNPUldTfXd6zUKlloQPQSnCbZnYTCJ5eXv0ZGIo2344HA6TRJZ00gAPfQn3l');
  if (stripe) {
    elements = stripe.elements();
    cardElement = elements.create('card', {
      style: {
        base: {
          color: '#fff',
          fontSize: '16px',
          '::placeholder': {
            color: '#ccc',
          },
        },
      },
    });
    cardElement.mount('#card-element');
  }
});

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = placeholderImage;
  target.alt = 'Image not found';
};

const updateQuantity = (productId: string, variantId: string, quantity: number) => {
  cartStore.updateQuantity(productId, variantId, quantity);
};

const removeItem = (productId: string, variantId: string) => {
  cartStore.removeItem(productId, variantId);
};

const handleCheckout = async () => {
  if (!stripe || !elements) {
    errorMessage.value = 'Payment system not initialized.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await $fetch('/api/checkout', {
      method: 'POST',
      body: {
        items: cartStore.items,
        shipping: shipping.value,
      },
    });

    if (!response.success) {
      throw new Error('Checkout initialization failed');
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      response.paymentIntentClientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (paymentIntent.status === 'succeeded') {
      alert(`Order placed successfully! Order ID: ${response.orderId}`);
      showCheckoutForm.value = false;
      shipping.value = {
        name: '',
        address1: '',
        city: '',
        state_code: '',
        country_code: '',
        zip: '',
      };
      cardElement.clear();
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'An unknown error occurred';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 4rem);
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: #ff9800;
}

h1 {
  font-size: 2rem;
  color: #fff;
  text-align: center;
  margin-bottom: 2rem;
}

.empty-cart {
  text-align: center;
  color: #ccc;
}

.shop-link {
  color: #ff9800;
  text-decoration: none;
  font-weight: bold;
}

.shop-link:hover {
  text-decoration: underline;
}

.cart-content {
  display: flex;
  gap: 2rem;
}

.cart-items {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #333;
}

.item-image {
  width: 100px;
  height: auto;
  border-radius: 4px;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-details h2 {
  font-size: 1.25rem;
  color: #fff;
  margin: 0;
}

.size {
  color: #ccc;
  margin: 0;
}

.price {
  font-weight: bold;
  color: #ccc;
  margin: 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  background: #555;
  color: #fff;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.quantity-btn:hover {
  background: #777;
}

.quantity {
  color: #fff;
  font-weight: bold;
}

.remove-btn {
  background: #ff4444;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #cc0000;
}

.cart-summary {
  flex: 1;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #333;
  position: sticky;
  top: 2rem;
  align-self: flex-start;
}

.cart-summary h2 {
  font-size: 1.5rem;
  color: #fff;
  margin-top: 0;
}

.cart-summary h3 {
  font-size: 1.25rem;
  color: #fff;
  margin-top: 1rem;
}

.cart-summary p {
  color: #ccc;
  margin: 0.5rem 0;
}

.checkout-button {
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  width: 100%;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  margin-top: 1rem;
}

.checkout-button:hover {
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(255, 87, 34, 0.18);
}

.checkout-button:active {
  transform: scale(0.98);
}

.clear-cart-button {
  background: #ff4444;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  width: 100%;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.clear-cart-button:hover {
  background: #cc0000;
}

.checkout-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #fff;
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #444;
  color: #fff;
}

.card-element {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #444;
  margin-bottom: 1rem;
}

.error-message {
  color: #ff4444;
  margin-bottom: 1rem;
}

.pay-button {
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  width: 100%;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
}

.pay-button:hover:not(:disabled) {
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(255, 87, 34, 0.18);
}

.pay-button:active:not(:disabled) {
  transform: scale(0.98);
}

.pay-button:disabled {
  background: #666;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-content {
    flex-direction: column;
  }

  .cart-summary {
    position: static;
  }

  .cart-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .item-image {
    width: 80px;
  }
}
</style>