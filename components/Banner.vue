<template>
  <section ref="heroSection" class="hero">
    <div class="logo-container">
      <img ref="logo" :src="logoSrc" alt="Mostvalue Logo" class="logo" :style="logoStyle" :class="{ hidden: isAtTop }" />
      <p class="tagline" :style="taglineStyle" :class="{ hidden: isAtTop }">Join the movement.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import logoSrc from '@/assets/logo.png';

const heroSection = ref(null);
const logo = ref(null);

const initialWidth = '20vw';
const initialFontSize = 1.5;

const logoStyle = ref({
  width: initialWidth,
  transform: 'translateY(0)',
  position: 'relative',
  top: '0',
  left: '0',
});

const taglineStyle = ref({
  fontSize: `${initialFontSize}rem`,
});

const scrollPosition = ref(0);
const isAtTop = ref(false);

const handleScroll = () => {
  scrollPosition.value = window.scrollY;
  const navbarThreshold = 350;

  const progress = Math.min(scrollPosition.value / navbarThreshold, 1);

  const initialWidthPx = window.innerWidth * 0.2;
  const scale = 1 - progress * (1 - 40 / initialWidthPx);
  const currentWidth = `${initialWidthPx * scale}px`;
  const translateY = -scrollPosition.value * 0.5 * (1 - progress);
  const blur = (1 - progress) * 5;

  logoStyle.value = {
    ...logoStyle.value,
    width: currentWidth,
    transform: `translateY(${translateY}px)`,
  };

  const minFontSize = 0.5;
  const currentFontSize = Math.max(initialFontSize - progress * 1, minFontSize);
  taglineStyle.value = {
    ...taglineStyle.value,
    fontSize: `${currentFontSize}rem`,
  };

  isAtTop.value = scrollPosition.value > navbarThreshold;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});

defineExpose({ isAtTop });
</script>

<style scoped>
.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: black;
  color: white;
}

.logo-container {
  text-align: center;
  transition: opacity 0.3s ease;
}

.logo {
  transition: all 0.3s ease;
}

.tagline {
  margin-top: 1rem;
  font-size: 1.5rem;
}

.hidden {
  display: none !important;
}
</style>