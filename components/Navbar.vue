<template>
  <nav ref="navbar" class="navbar" :class="{ 'opacity-0': !isNavbarVisible, 'opacity-100': isNavbarVisible }">
    <div class="container">
      <div class="links">
        <NuxtLink to="/" class="link">Home</NuxtLink>
        <NuxtLink to="/catalog" class="link">Catalog</NuxtLink>
        <NuxtLink to="/contact" class="link">Contact</NuxtLink>
      </div>

      <NuxtLink to="/" class="logo" :class="{ hidden: !isAtTop }">
        <img :src="logoSrc" alt="Mostvalue Logo" class="logo-img" />
      </NuxtLink>

      <div class="icons">
        <button aria-label="Search">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button aria-label="Cart">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import logoSrc from '@/assets/logo.png'

const isNavbarVisible = ref(false)
const scrollPosition = ref(0)
const isAtTop = ref(false)

const handleScroll = () => {
  scrollPosition.value = window.scrollY
  const scrollThreshold = 350

  isNavbarVisible.value = scrollPosition.value > scrollThreshold
  isAtTop.value = scrollPosition.value > scrollThreshold
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

defineExpose({ isAtTop })
</script>

<style scoped>
.navbar {
  background-color: black;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  transition: opacity 0.3s ease;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 2.5rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
}

.logo-img {
  height: 2.5rem;
}

.logo:not(.hidden) {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.logo.hidden {
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(5px);
}

.links {
  display: flex;
  gap: 1.5rem;
}

.link {
  color: white;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.icons {
  display: flex;
  gap: 1rem;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>