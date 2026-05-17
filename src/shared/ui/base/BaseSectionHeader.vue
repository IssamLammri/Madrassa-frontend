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

<style lang="scss" scoped>
.base-section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);

  &__icon {
    color: var(--color-primary);
    flex-shrink: 0;
  }

  &__title {
    margin: 0;
    color: var(--color-heading);
    font-size: var(--text-h1);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
}
</style>