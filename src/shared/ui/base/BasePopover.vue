<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

defineProps({
  title: {
    type: String,
    default: '',
  },
});

const isOpen = ref(false);
const containerRef = ref(null);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event) => {
  if (!containerRef.value) return;

  if (!containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div ref="containerRef" class="base-popover">
    <div class="base-popover__trigger" @click.stop="toggle">
      <slot name="trigger" />
    </div>

    <div v-if="isOpen" class="base-popover__content">
      <h4 v-if="title" class="base-popover__title">
        {{ title }}
      </h4>

      <div class="base-popover__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-popover {
  position: relative;
  display: inline-block;

  &__trigger {
    display: inline-flex;
    cursor: pointer;
  }

  &__content {
    position: absolute;
    top: calc(100% + 0.75rem);
    left: 0;
    width: 18rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card-sm);
    background-color: var(--color-white);
    box-shadow: var(--shadow-tooltip);
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__title {
    margin: 0;
    color: var(--color-heading);
    font-size: var(--text-caption);
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>