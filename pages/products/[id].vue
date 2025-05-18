<template>
  <div v-if="error" class="error">
    <h1>Error</h1>
    <p>{{ error }}</p>
    <NuxtLink to="/" class="back-link">Back to Home</NuxtLink>
  </div>
  <div v-else-if="!product" class="loading">
    <h1>Loading...</h1>
  </div>
  <div v-else class="product-page">
    <div class="product-container">
      <div class="product-image-wrapper">
        <img
          :src="selectedImageUrl"
          :alt="`${product.name} - ${selectedImageIndex === 0 ? 'Front' : 'Back'}`"
          class="main-image"
          @error="handleImageError($event, 'main')"
        />
        <div class="thumbnail-gallery">
          <img
            v-for="(imageUrl, index) in product.imageUrls"
            :key="index"
            :src="imageUrl"
            :alt="`${product.name} - ${index === 0 ? 'Front' : 'Back'}`"
            class="thumbnail"
            :class="{ 'selected': selectedImageIndex === index }"
            @click="selectImage(index)"
            @error="handleImageError($event, index)"
          />
        </div>
      </div>
      <div class="product-details">
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>
        <p v-if="!product.isAvailable" class="unavailable">Currently Unavailable</p>
        <p class="price">{{ product.price }} {{ product.currency }}</p>
        <div v-if="addedToCart" class="added-message">
          Added to cart! <NuxtLink to="/cart" class="view-cart-link">View Cart</NuxtLink>
        </div>
        <div class="add-to-cart">
          <select
            v-if="product.variants && product.variants.length > 0"
            v-model="selectedVariantId"
            class="variant-select"
            :disabled="!product.isAvailable"
          >
            <option v-for="variant in product.variants" :key="variant.id" :value="variant.id">
              {{ variant.name }} ({{ variant.size }}, {{ variant.color }})
              <span v-if="variant.colorCode" :style="{ backgroundColor: variant.colorCode }" class="color-swatch"></span>
            </option>
          </select>
          <button
            @click="addToCart"
            :disabled="!selectedVariantId || !product.isAvailable"
            class="addtocart-button"
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCartStore } from '~/stores/cart';
import type { Product } from '~/types/product';

const route = useRoute();
const product = ref<Product | null>(null);
const error = ref<string | null>(null);
const selectedVariantId = ref<string>('');
const placeholderImage = 'https://via.placeholder.com/150';
const addedToCart = ref(false);

const selectedImageIndex = ref(0);
const selectedImageUrl = ref('');

const cartStore = useCartStore();

watch([product, selectedImageIndex], () => {
  if (product.value && product.value.imageUrls) {
    selectedImageUrl.value = product.value.imageUrls[selectedImageIndex.value] || placeholderImage;
  }
});

const handleImageError = (event: Event, type: string | number) => {
  const target = event.target as HTMLImageElement;
  target.src = placeholderImage;
  target.alt = type === 'main' ? 'Main image not found' : `Thumbnail ${type} not found`;
};

const selectImage = (index: number) => {
  selectedImageIndex.value = index;
};

const fetchProduct = async (id: string) => {
  try {
    const response = await fetch(`/api/printful-products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const data = await response.json();
    product.value = data;
    selectedVariantId.value = product.value?.variants?.[0]?.id || '';
    if (product.value?.imageUrls) {
      selectedImageUrl.value = product.value.imageUrls[0] || placeholderImage;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error fetching product:', err);
  }
};

const addToCart = () => {
  if (!product.value || !selectedVariantId.value) return;

  cartStore.addItem({
    productId: product.value.id,
    variantId: selectedVariantId.value,
    quantity: 1,
    name: product.value.name,
    price: product.value.price,
    currency: product.value.currency,
    imageUrl: product.value.imageUrls[0],
  });

  addedToCart.value = true;
  setTimeout(() => {
    addedToCart.value = false;
  }, 3000);
};

fetchProduct(route.params.id as string);
</script>

<style scoped>
.product-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 4rem);
  justify-content: center;
}

.back-link {
  align-self: flex-start;
  margin-bottom: 1rem;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: #ff9800;
}

.product-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
  width: 100%;
  justify-items: center;
}

.product-image-wrapper {
  position: sticky;
  top: 2rem;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.main-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s ease;
}

.thumbnail-gallery {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.thumbnail {
  width: 100%;
  max-width: 100px;
  height: auto;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  opacity: 0.7;
  border: 2px solid transparent;
}

.thumbnail:hover {
  transform: scale(1.05);
  opacity: 1;
}

.thumbnail.selected {
  opacity: 1;
  border: 2px solid #ff9800;
}

.product-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.product-details h1 {
  font-size: 2rem;
  margin: 0;
  color: black;
}

.description {
  color: gray;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  max-width: 500px;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: black;
  margin: 0;
}

.add-to-cart {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.added-message {
  color: #4caf50;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.view-cart-link {
  color: #ff9800;
  text-decoration: none;
  margin-left: 0.5rem;
}

.view-cart-link:hover {
  text-decoration: underline;
}

.unavailable {
  color: #ff0000;
  font-weight: bold;
  margin: 0;
}

.variant-select {
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #333;
  color: #fff;
  width: 100%;
  height: 50px;
  max-width: 400px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.variant-select:focus {
  border-color: #ff9800;
  outline: none;
}

.color-swatch {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: eleventh;
  margin-left: 5px;
  vertical-align: middle;
  border: 1px solid #ccc;
}

.addtocart-button {
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  padding: 1rem 1.5rem;
  width: 150px;
  height: 50px;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  outline: none;
}

.addtocart-button:hover:not(:disabled),
.addtocart-button:focus {
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(255, 87, 34, 0.18);
}

.addtocart-button:active:not(:disabled) {
  transform: scale(0.98);
  background: linear-gradient(90deg, rgb(129, 129, 129) 0%, rgb(44, 44, 44) 100%);
}

.addtocart-button:disabled {
  background: #666;
  cursor: not-allowed;
  box-shadow: none;
}

.error,
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  color: #fff;
}

.error .back-link {
  color: #ff9800;
  text-decoration: none;
}

.error .back-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
  }

  .product-image-wrapper {
    position: static;
    max-width: 100%;
  }

  .main-image {
    max-width: 300px;
  }

  .thumbnail {
    max-width: 80px;
  }

  .product-page {
    padding: 1rem;
    min-height: auto;
  }

  .add-to-cart {
    flex-direction: column;
  }

  .variant-select,
  .addtocart-button {
    width: 100%;
    max-width: 100%;
  }
}
</style>