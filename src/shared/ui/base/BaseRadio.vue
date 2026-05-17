<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: null,
  },
  value: {
    type: [String, Number, Boolean],
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const handleSelect = () => {
  emit('update:modelValue', props.value);
};
</script>

<template>
  <label class="base-radio" @click="handleSelect">
    <input
        class="base-radio__input"
        type="radio"
        :checked="modelValue === value"
        :value="value"
        @change="handleSelect"
    />

    <span
        class="base-radio__control"
        :class="{ 'base-radio__control--checked': modelValue === value }"
    >
      <span
          v-if="modelValue === value"
          class="base-radio__indicator"
      ></span>
    </span>

    <span v-if="label" class="base-radio__label">
      {{ label }}
    </span>
  </label>
</template>

<style lang="scss" scoped>
.base-radio {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;

  &:hover {
    .base-radio__control {
      border-color: var(--color-primary);
    }
  }

  &:active {
    .base-radio__control {
      transform: scale(0.9);
    }
  }

  &__input {
    display: none;
  }

  &__control {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-pill);
    background-color: var(--color-input-bg);
    transition:
        border-color var(--duration-fast) var(--ease-standard),
        transform var(--duration-fast) var(--ease-standard),
        background-color var(--duration-fast) var(--ease-standard);
  }

  &__control--checked {
    border-color: var(--color-primary);
  }

  &__indicator {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: var(--radius-pill);
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