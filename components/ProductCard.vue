<!-- components/ProductCard.vue -->
<template>
  <div class="product">
    <img :src="product.imageUrls?.[0]" :alt="product.name" class="product-image" @error="handleImageError" />
    <div class="product-info">
      <div>
        <h2>{{ product.name }}</h2>
        <p class="price">{{ product.price }} {{ product.currency }}</p>
      </div>
      <div class="buy">
        <NuxtLink :to="`/products/${product.id}`">
          <button>View Product</button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';

defineProps<{
  product: Product;
}>();

const placeholderImage = 'https://via.placeholder.com/150';

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = placeholderImage;
  target.alt = 'Image not found';
};
</script>

<style scoped>
.product {
  padding: 1rem;
  border-radius: 8px;
  text-align: left;
}

.product-image {
  height: auto;
  border-radius: 4px;
}

.product-info {
  display: flex;
  justify-content: space-between;
  border: 0.25rem solid black;
  padding: 1rem;
}

.buy {
  display: flex;
  align-items: center;
}

.buy button {
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15);
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  outline: none;
}

.buy button:hover,
.buy button:focus {
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(255, 87, 34, 0.18);
}

.buy button:active {
  transform: scale(0.98);
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
}

.product h2 {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}

.price {
  font-weight: bold;
}
</style>