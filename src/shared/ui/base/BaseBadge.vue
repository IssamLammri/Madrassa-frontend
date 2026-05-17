<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default', // success | pending | alert | dark | default
  },
});
</script>

<template>
  <span :class="['base-badge', `base-badge--${variant}`]">
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;

  &--success {
    background-color: var(--color-success-bg);
    color: var(--color-primary);
    border-color: var(--color-success-border);
  }

  &--pending {
    background-color: var(--color-heading-soft);
    color: var(--color-heading);
    border-color: var(--color-border);
  }

  &--alert {
    background-color: var(--color-accent-bg);
    color: var(--color-accent);
    border-color: var(--color-accent-border);
  }

  &--dark {
    background-color: var(--color-heading);
    color: var(--color-white);
    border-color: var(--color-heading);
  }

  &--default {
    background-color: var(--color-bg-cream);
    color: var(--color-body);
    border-color: var(--color-border);
  }
}
</style>