<script setup>
defineProps({
  icon: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="base-section-header">
    <component :is="icon" class="base-section-header__icon" :size="32" />

    <h2 class="base-section-header__title">
      {{ title }}
    </h2>
  </div>
</template>

<style scoped>
.base-section-header { display: flex; align-items: center; gap: 12px; padding-bottom: 20px; border-bottom: 1px solid var(--color-border); }
.base-section-header__icon { width: 20px; height: 20px; color: var(--color-primary); }
.base-section-header__title { color: var(--color-heading); font-size: 20px; font-weight: 500; line-height: 1.4; }
</style>
