<template>
  <section class="content">
    <h1>Our Products</h1>
    <div class="product-list">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ProductCard from './ProductCard.vue';
import { fetchProducts } from '~/api/products';
import type { Product } from '~/types/product';

const products = ref<Product[]>([]);

onMounted(async () => {
  products.value = await fetchProducts();
});
</script>

<style scoped>
.content {
  padding: 2rem;
  background-color: white;
  color: black;
  min-height: 100vh;
  text-align: center;
}

.content h1 {
  font-size: 2.5rem;
  margin: 2rem 0;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  max-width: 70%;
  gap: 2rem;
  margin: 0 auto;
}

</style>