<template>
  <div class="product">
    <img :src="product.imageUrl || placeholderImage" :alt="product.name" class="product-image" />
    <h2>{{ product.name }}</h2>
    <p>{{ product.description }}</p>
    <p class="price">{{ product.price }} {{ product.currency }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';

defineProps<{
  product: Product;
}>();

const placeholderImage = 'https://via.placeholder.com/150';
</script>

<style scoped>
.product {
  background: #222;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.product-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.price {
  font-weight: bold;
  color: #00ff00;
}
</style>