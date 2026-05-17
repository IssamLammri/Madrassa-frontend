<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const toggle = (event) => {
  event.preventDefault();
  emit('update:modelValue', !event.currentTarget.dataset.checked);
};
</script>

<template>
  <label class="base-checkbox">
    <button
        type="button"
        class="base-checkbox__control"
        :class="{ 'base-checkbox__control--checked': modelValue }"
        :data-checked="modelValue"
        :aria-pressed="modelValue"
        @click="emit('update:modelValue', !modelValue)"
    >
      <span v-if="modelValue" class="base-checkbox__indicator"></span>
    </button>

    <span v-if="label" class="base-checkbox__label">
      {{ label }}
    </span>
  </label>
</template>

<style lang="scss" scoped>
.base-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;

  &__control {
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-input);
    background-color: var(--color-input-bg);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    transition:
        border-color var(--duration-fast) var(--ease-standard),
        background-color var(--duration-fast) var(--ease-standard),
        transform var(--duration-fast) var(--ease-standard),
        box-shadow var(--duration-fast) var(--ease-standard);

    &:hover {
      border-color: var(--color-primary);
    }

    &:active {
      transform: scale(0.9);
    }

    &:focus-visible {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px rgba(0, 200, 150, 0.12);
    }

    &--checked {
      border-color: var(--color-primary);
    }
  }

  &__indicator {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 0.25rem;
    background-color: var(--color-primary);
  }

  &__label {
    color: var(--color-heading);
    font-size: var(--text-body-sm);
    font-weight: 700;
    line-height: 1.4;
  }
}
</style>