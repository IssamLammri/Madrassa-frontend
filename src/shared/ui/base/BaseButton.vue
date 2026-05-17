<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  type: {
    type: String,
    default: 'button',
  },
});
</script>

<template>
  <button :type="type" :class="['custom-btn', `btn-${variant}`]">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.custom-btn {
  // 1. Layout & Basics (Matches your image)
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 14px; // Matches the image's rounded look
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: auto;

  // 2. Default Variant Styling
  &.btn-primary {
    background-color: var(--color-primary);
    color: white;

    &:hover {
      background-color: var(--color-primary-hover);
      transform: translateY(-1px);
    }
  }

  &.btn-secondary {
    background-color: var(--color-heading);
    color: white;
    &:hover { opacity: 0.9; }
  }

  &.btn-tertiary {
    background-color: transparent;
    border: 2px solid var(--color-border);
    color: var(--color-heading);
    &:hover { background-color: var(--color-bg-cream); }
  }
}
</style>