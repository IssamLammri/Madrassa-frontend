<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const handleToggle = () => {
  if (props.disabled) return;
  emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <label
      class="base-switch"
      :class="{ 'base-switch--disabled': disabled }"
      @click="handleToggle"
  >
    <input
        class="base-switch__input"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="handleToggle"
    />

    <span
        class="base-switch__control"
        :class="{ 'base-switch__control--checked': modelValue }"
    >
      <span
          class="base-switch__thumb"
          :class="{ 'base-switch__thumb--checked': modelValue }"
      ></span>
    </span>

    <span v-if="label" class="base-switch__label">
      {{ label }}
    </span>
  </label>
</template>

<style lang="scss" scoped>
.base-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;

  &:hover {
    .base-switch__control {
      border-color: var(--color-primary);
    }
  }

  &:active {
    .base-switch__control {
      transform: scale(0.98);
    }
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;

    .base-switch__control {
      transform: none;
    }
  }

  &__input {
    display: none;
  }

  &__control {
    width: 3.25rem;
    height: 1.75rem;
    flex-shrink: 0;
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 0.2rem;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-pill);
    background-color: var(--color-input-bg);
    transition:
        border-color var(--duration-fast) var(--ease-standard),
        background-color var(--duration-fast) var(--ease-standard),
        transform var(--duration-fast) var(--ease-standard);
  }

  &__control--checked {
    border-color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 18%, white);
  }

  &__thumb {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: var(--radius-pill);
    background-color: var(--color-white);
    box-shadow: var(--shadow-thumb);
    transition:
        transform var(--duration-fast) var(--ease-standard),
        background-color var(--duration-fast) var(--ease-standard);
    transform: translateX(0);
  }

  &__thumb--checked {
    transform: translateX(1.45rem);
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