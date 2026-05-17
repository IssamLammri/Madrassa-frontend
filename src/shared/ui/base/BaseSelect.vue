<script setup>
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const handleChange = (e) => {
  emit('update:modelValue', e.target.value);
};
</script>

<template>
  <div class="base-select">
    <label v-if="label" class="base-select__label">
      {{ label }}
    </label>

    <div class="base-select__control">
      <select
          :value="modelValue"
          class="base-select__field"
          @change="handleChange"
      >
        <option
            v-for="option in options"
            :key="option.value ?? option"
            :value="option.value ?? option"
        >
          {{ option.label ?? option }}
        </option>
      </select>

      <ChevronDown class="base-select__icon" :size="18" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-select {
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
    padding: 0.875rem 2.75rem 0.875rem 1.25rem;
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
    cursor: pointer;
    transition:
        background-color var(--duration-fast) var(--ease-standard),
        border-color var(--duration-fast) var(--ease-standard),
        box-shadow var(--duration-fast) var(--ease-standard);

    &:focus {
      background-color: var(--color-white);
      border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 5%, transparent);
    }
  }

  &__icon {
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
    color: var(--color-body-ultra-faint);
    pointer-events: none;
    transition: color var(--duration-fast) var(--ease-standard);
  }

  &:focus-within &__icon {
    color: var(--color-primary);
  }
}
</style>