<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default', // default | emphasis | dashed
  },
  padding: {
    type: String,
    default: 'lg', // none | sm | md | lg | xl
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  descriptionLines: {
    type: Number,
    default: 3,
  },
});

const slots = useSlots();

const cardClasses = computed(() => [
  'base-card',
  `base-card--${props.variant}`,
  `base-card--padding-${props.padding}`,
  {
    'base-card--hoverable': props.hoverable,
  },
]);

const hasIcon = computed(() => !!slots.icon);
const hasHeader = computed(() => !!slots.title || !!slots.description);

const descriptionStyle = computed(() => ({
  '--base-card-description-lines': props.descriptionLines,
}));
</script>

<template>
  <div :class="cardClasses">
    <div v-if="hasIcon" class="base-card__icon">
      <slot name="icon" />
    </div>

    <div v-if="hasHeader" class="base-card__header">
      <div v-if="$slots.title" class="base-card__title">
        <slot name="title" />
      </div>

      <div
          v-if="$slots.description"
          class="base-card__description"
          :style="descriptionStyle"
      >
        <slot name="description" />
      </div>
    </div>

    <div v-if="$slots.default" class="base-card__content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-card {
  --base-card-max-width: 24rem;
  --base-card-width: 100%;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: var(--base-card-width);
  max-width: var(--base-card-max-width);
  min-width: 0;
  border-radius: var(--radius-card);
  transition:
      background-color var(--duration-normal) var(--ease-standard),
      border-color var(--duration-normal) var(--ease-standard),
      box-shadow var(--duration-normal) var(--ease-standard),
      transform var(--duration-normal) var(--ease-standard),
      color var(--duration-normal) var(--ease-standard);

  &--padding-none {
    padding: 0;
  }

  &--padding-sm {
    padding: 1rem;
  }

  &--padding-md {
    padding: 1.5rem;
  }

  &--padding-lg {
    padding: 2rem;
  }

  &--padding-xl {
    padding: 2.5rem;
  }

  &--default {
    background-color: var(--color-white);
    color: var(--color-heading);
    box-shadow: var(--shadow-soft);
  }

  &--emphasis {
    overflow: hidden;
    background-color: var(--color-heading);
    color: var(--color-white);
    box-shadow: var(--shadow-float);

    &::after {
      content: '';
      position: absolute;
      right: -3rem;
      bottom: -3rem;
      width: 12rem;
      height: 12rem;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(
          circle,
          rgba(0, 200, 150, 0.14) 0%,
          rgba(0, 200, 150, 0.08) 35%,
          rgba(0, 200, 150, 0) 72%
      );
    }
  }

  &--dashed {
    background-color: transparent;
    color: var(--color-heading);
    border: 2px dashed var(--color-border);
  }

  &--hoverable {
    &.base-card--default:hover {
      box-shadow: var(--shadow-float);
      transform: translateY(-2px);
    }

    &.base-card--emphasis:hover {
      transform: translateY(-2px);
    }

    &.base-card--dashed:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
    }
  }

  &__icon {
    position: relative;
    z-index: 1;
    width: 3rem;
    height: 3rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: var(--radius-input);
  }

  &__header {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
  }

  &__title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
    font-size: var(--text-h3);
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  &__description {
    --base-card-description-lines: 3;

    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--base-card-description-lines);
    line-clamp: var(--base-card-description-lines);
    font-size: var(--text-body-lg);
    line-height: 1.5;
    word-break: break-word;
  }

  &__content {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  &--default &__description,
  &--dashed &__description {
    color: var(--color-body);
  }

  &--emphasis &__description {
    color: var(--color-white-soft-text);
  }

  &--default &__icon {
    background-color: var(--color-success-bg);
    color: var(--color-primary);
  }

  &--emphasis &__icon {
    background-color: var(--color-white-soft-border);
    color: var(--color-primary);
  }

  &--dashed &__icon {
    background-color: var(--color-heading-soft);
    color: var(--color-body-soft);
  }
}
</style>