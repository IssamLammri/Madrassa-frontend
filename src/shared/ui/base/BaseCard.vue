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

<style scoped>
.base-card {
  --base-card-max-width: none; --base-card-width: 100%;
  display: flex; flex-direction: column; gap: 20px; width: var(--base-card-width);
  max-width: var(--base-card-max-width); min-width: 0;
  border: 1px solid var(--color-border); border-radius: var(--radius-card); background: white;
  color: var(--color-heading); transition: border-color 160ms, background-color 160ms;
}
.base-card--padding-none { padding: 0; }
.base-card--padding-sm { padding: 16px; }
.base-card--padding-md, .base-card--padding-lg { padding: 24px; }
.base-card--padding-xl { padding: 32px; }
.base-card--emphasis { background: var(--color-heading); color: white; border-color: transparent; }
.base-card--dashed { background: transparent; border-style: dashed; }
.base-card--hoverable:hover { background: var(--color-input-bg); border-color: #9bc3ac; }
.base-card__icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; color: var(--color-primary); }
.base-card__header { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.base-card__title { font-size: 20px; font-weight: 500; line-height: 1.4; }
.base-card__description { color: var(--color-body); font-size: 14px; line-height: 1.6; }
.base-card__content { min-width: 0; }
.base-card--emphasis .base-card__description { color: #dfe5df; }
@media (max-width: 640px) { .base-card--padding-lg, .base-card--padding-xl { padding: 24px; } }
</style>
