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
