<script setup>
import { computed, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  error: {
    type: String,
    default: '',
  },
  icon: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);
const attrs = useAttrs();

const hasIcon = computed(() => !!props.icon && !props.error);
const hasSuffix = computed(() => !!attrs['data-has-suffix']);
</script>

<template>
  <div class="base-input">
    <label v-if="label" class="base-input__label">
      {{ label }}
    </label>

    <div
        class="base-input__control"
        :class="{
        'base-input__control--error': error,
        'base-input__control--with-icon': hasIcon,
        'base-input__control--with-suffix': hasSuffix,
      }"
    >
      <input
          v-bind="attrs"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          class="base-input__field"
          @input="emit('update:modelValue', $event.target.value)"
      />

      <component
          :is="icon"
          v-if="hasIcon"
          class="base-input__icon"
          :size="18"
      />

      <div v-if="$slots.suffix" class="base-input__suffix">
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="base-input__error">
      {{ error }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;

  &__label {
    margin-left: 0.25rem;
    color: var(--color-body);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  &__control {
    position: relative;
    width: 100%;
  }

  &__field {
    width: 100%;
    min-height: var(--control-height);
    padding: 0.875rem 1.25rem;
    border: 2px solid transparent;
    border-radius: var(--radius-input);
    background-color: var(--color-input-bg);
    color: var(--color-heading);
    font-size: var(--text-body-sm);
    font-weight: 500;
    line-height: 1.4;
    outline: none;
    transition:
        background-color var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard),
        box-shadow var(--duration-fast) var(--ease-standard),
        color var(--duration-fast) var(--ease-standard);

    &::placeholder {
      color: var(--color-body-ultra-faint);
    }

    &:focus {
      background-color: var(--color-white);
      border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 5%, transparent);
    }
  }

  &__control--with-icon .base-input__field,
  &__control--with-suffix .base-input__field {
    padding-right: 3.25rem;
  }

  &__icon,
  &__suffix {
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
  }

  &__icon {
    color: var(--color-body-ultra-faint);
    pointer-events: none;
  }

  &__suffix {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__control--error {
    .base-input__field {
      background-color: var(--color-white);
      border-color: var(--color-accent);
      color: var(--color-heading);
    }

    .base-input__icon,
    .base-input__suffix {
      color: var(--color-accent);
    }
  }

  &__error {
    margin-left: 0.25rem;
    color: var(--color-accent);
    font-size: var(--text-overline);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
}
</style>