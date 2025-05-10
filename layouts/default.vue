<template>
  <div>
    <Navbar ref="navbar" />
    <div class="wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue';
</script>

<style scoped>
.wrapper {
  min-height: 100vh;
}
</style>