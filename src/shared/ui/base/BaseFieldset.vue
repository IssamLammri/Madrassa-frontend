<script setup>
defineProps({
  legend: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <fieldset class="base-fieldset">
    <legend v-if="legend" class="base-fieldset__legend">
      {{ legend }}
    </legend>

    <div class="base-fieldset__content">
      <slot />
    </div>
  </fieldset>
</template>

<style lang="scss" scoped>
.base-fieldset {
  margin: 0;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-sm);

  &__legend {
    padding: 0 0.75rem;
    color: var(--color-body-faint);
    font-size: 10px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
}
</style>