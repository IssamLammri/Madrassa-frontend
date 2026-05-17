<script setup>
defineProps({
  icon: {
    type: Object,
    default: null,
  },
});
</script>

<template>
  <span class="base-tag">
    <component
        :is="icon"
        v-if="icon"
        class="base-tag__icon"
        :size="12"
    />

    <span class="base-tag__text">
      <slot />
    </span>
  </span>
</template>

<style lang="scss" scoped>
.base-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  width: fit-content;
  max-width: 100%;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background-color: var(--color-bg-cream);
  color: var(--color-body);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;

  &__icon {
    flex-shrink: 0;
    color: var(--color-body-faint);
  }

  &__text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>