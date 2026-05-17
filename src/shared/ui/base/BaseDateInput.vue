<script setup>
import { Calendar } from 'lucide-vue-next';

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  min: {
    type: String,
    default: '',
  },
  max: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  helper: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="base-date-input" :class="{ 'base-date-input--disabled': disabled }">
    <label v-if="label" class="base-date-input__label">
      {{ label }}
    </label>

    <div
        class="base-date-input__control"
        :class="{
        'base-date-input__control--error': error,
      }"
    >
      <input
          type="date"
          :value="modelValue"
          :min="min"
          :max="max"
          :disabled="disabled"
          class="base-date-input__field"
          @input="emit('update:modelValue', $event.target.value)"
      />
      <Calendar class="base-date-input__icon" :size="18" />
    </div>

    <p v-if="error" class="base-date-input__message base-date-input__message--error">
      {{ error }}
    </p>

    <p v-else-if="helper" class="base-date-input__message">
      {{ helper }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.base-date-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;

  &__label {
    color: var(--color-heading);
    font-size: var(--text-body-sm);
    font-weight: 700;
    line-height: 1.4;
  }

  &__control {
    position: relative;
    width: 100%;
    border-radius: var(--radius-input);
    transition:
        box-shadow var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard),
        background-color var(--duration-fast) var(--ease-standard);

    &--error {
      .base-date-input__field {
        border-color: var(--color-accent);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-accent) 8%, transparent);
      }

      .base-date-input__icon {
        color: var(--color-accent);
      }
    }
  }

  &__field {
    width: 100%;
    min-height: var(--control-height);
    padding: 0.875rem 1.25rem 0.875rem 2.75rem;
    border: 2px solid transparent;
    border-radius: var(--radius-input);
    background-color: var(--color-input-bg);
    color: var(--color-heading);
    font-size: var(--text-body-sm);
    font-weight: 500;
    line-height: 1.4;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    transition:
        background-color var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard),
        box-shadow var(--duration-fast) var(--ease-standard),
        color var(--duration-fast) var(--ease-standard);

    &:focus {
      background-color: var(--color-white);
      border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 5%, transparent);
    }

    &:disabled {
      cursor: not-allowed;
      background-color: var(--color-border);
      color: var(--color-body-faint);
    }

    &::-webkit-calendar-picker-indicator {
      opacity: 0;
      cursor: pointer;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    &::-webkit-date-and-time-value {
      text-align: left;
    }
  }

  &__icon {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    color: var(--color-body-ultra-faint);
    pointer-events: none;
    transition: color var(--duration-fast) var(--ease-standard);
  }

  &__message {
    margin: 0;
    color: var(--color-body);
    font-size: var(--text-caption);
    line-height: 1.4;

    &--error {
      color: var(--color-accent);
    }
  }

  &--disabled {
    .base-date-input__label,
    .base-date-input__message {
      opacity: 0.7;
    }

    .base-date-input__icon {
      color: var(--color-body-faint);
    }
  }
}
</style>