<script setup>
defineProps({
  modelValue: {
    type: String,
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
  rows: {
    type: Number,
    default: 4,
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="base-textarea">
    <label v-if="label" class="base-textarea__label">
      {{ label }}
    </label>

    <textarea
        :rows="rows"
        :value="modelValue"
        :placeholder="placeholder"
        class="base-textarea__field"
        @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<style lang="scss" scoped>
.base-textarea {
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
    line-height: 1.2;
  }

  &__field {
    width: 100%;
    padding: 0.875rem 1.25rem;
    border: 2px solid transparent;
    border-radius: var(--radius-input);
    background-color: var(--color-input-bg);
    color: var(--color-heading);
    font-size: var(--text-body-sm);
    font-weight: 500;
    line-height: 1.5;
    outline: none;
    resize: none;
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
}
</style>