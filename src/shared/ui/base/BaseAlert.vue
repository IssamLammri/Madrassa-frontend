<script setup>
defineProps({
  variant: {
    type: String,
    default: 'info', // info | warning
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: null,
    required: true,
  },
});
</script>

<template>
  <div :class="['base-alert', `base-alert--${variant}`]">
    <component
        :is="icon"
        class="base-alert__icon"
        :size="20"
    />
    <div class="base-alert__content">
      <p class="base-alert__title">{{ title }}</p>
      <p class="base-alert__description">{{ description }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-alert {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid transparent;
  border-radius: var(--radius-card-sm);

  &__icon {
    flex-shrink: 0;
  }

  &__content {
    min-width: 0;
  }

  &__title {
    margin: 0 0 0.25rem;
    color: var(--color-heading);
    font-size: var(--text-body-sm);
    font-weight: 900;
    line-height: 1.2;
  }

  &__description {
    margin: 0;
    color: var(--color-body);
    font-size: var(--text-caption);
    line-height: 1.5;
  }

  &--info {
    background-color: var(--color-success-bg);
    border-color: var(--color-success-border);

    .base-alert__icon {
      color: var(--color-primary);
    }
  }

  &--warning {
    background-color: var(--color-accent-bg);
    border-color: var(--color-accent-border);

    .base-alert__icon {
      color: var(--color-accent);
    }
  }
}
</style>