<script setup>
import { HelpCircle } from 'lucide-vue-next';

defineProps({
  text: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="base-tooltip">
    <HelpCircle class="base-tooltip__trigger" :size="20" />

    <div class="base-tooltip__content">
      {{ text }}
      <span class="base-tooltip__arrow"></span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    .base-tooltip__content {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, 0);
    }

    .base-tooltip__trigger {
      color: var(--color-body);
    }
  }

  &__trigger {
    color: var(--color-body-ultra-faint);
    cursor: help;
    transition: color var(--duration-fast) var(--ease-standard);
  }

  &__content {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 0.75rem);
    transform: translate(-50%, 0.25rem);
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background-color: var(--color-heading);
    color: var(--color-white);
    font-size: 10px;
    line-height: 1.3;
    white-space: nowrap;
    box-shadow: var(--shadow-tooltip);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
        opacity var(--duration-fast) var(--ease-standard),
        transform var(--duration-fast) var(--ease-standard),
        visibility var(--duration-fast) var(--ease-standard);
    z-index: 20;
  }

  &__arrow {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 0.25rem solid transparent;
    border-right: 0.25rem solid transparent;
    border-top: 0.25rem solid var(--color-heading);
  }
}
</style>