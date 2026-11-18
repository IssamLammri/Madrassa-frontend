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

<style scoped>
.base-badge { display: inline-flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 6px; background: var(--color-slate-100); color: var(--color-body); font-size: 12px; font-weight: 500; line-height: 1.4; }
.base-badge--success { color: #123f35; background: #e1eee5; }
.base-badge--pending { color: #80531c; background: #fcf8ed; }
.base-badge--alert { color: #882d3a; background: #fcf4f3; }
.base-badge--dark { color: white; background: var(--color-heading); }
</style>
