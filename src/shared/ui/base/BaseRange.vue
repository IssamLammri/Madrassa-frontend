<script setup>
defineProps({
  modelValue: {
    type: [Number, String],
    default: 0,
  },
  label: {
    type: String,
    default: '',
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  showValues: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="base-range">
    <label v-if="label" class="base-range__label">
      {{ label }}
    </label>

    <div class="base-range__body">
      <input
          type="range"
          :value="modelValue"
          :min="min"
          :max="max"
          class="base-range__input"
          @input="emit('update:modelValue', Number($event.target.value))"
      />

      <div v-if="showValues" class="base-range__values">
        <span class="base-range__value base-range__value--muted">Min: {{ min }}</span>
        <span class="base-range__value base-range__value--current">Valeur: {{ modelValue }}</span>
        <span class="base-range__value base-range__value--muted">Max: {{ max }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-range {
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

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__input {
    width: 100%;
    height: 0.5rem;
    margin: 0;
    border-radius: var(--radius-pill);
    background: var(--color-input-bg);
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    outline: none;

    &::-webkit-slider-runnable-track {
      height: 0.5rem;
      border-radius: var(--radius-pill);
      background: var(--color-input-bg);
    }

    &::-webkit-slider-thumb {
      width: 1.25rem;
      height: 1.25rem;
      margin-top: -0.375rem;
      border: 0;
      border-radius: 50%;
      background: var(--color-primary);
      box-shadow: var(--shadow-thumb);
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      transition:
          transform var(--duration-fast) var(--ease-standard),
          box-shadow var(--duration-fast) var(--ease-standard);
    }

    &::-moz-range-track {
      height: 0.5rem;
      border: 0;
      border-radius: var(--radius-pill);
      background: var(--color-input-bg);
    }

    &::-moz-range-thumb {
      width: 1.25rem;
      height: 1.25rem;
      border: 0;
      border-radius: 50%;
      background: var(--color-primary);
      box-shadow: var(--shadow-thumb);
      cursor: pointer;
      transition:
          transform var(--duration-fast) var(--ease-standard),
          box-shadow var(--duration-fast) var(--ease-standard);
    }

    &:hover::-webkit-slider-thumb {
      transform: scale(1.05);
    }

    &:hover::-moz-range-thumb {
      transform: scale(1.05);
    }

    &:active::-webkit-slider-thumb {
      transform: scale(0.96);
    }

    &:active::-moz-range-thumb {
      transform: scale(0.96);
    }

    &:focus-visible::-webkit-slider-thumb {
      box-shadow:
          var(--shadow-thumb),
          0 0 0 4px color-mix(in srgb, var(--color-primary) 12%, transparent);
    }

    &:focus-visible::-moz-range-thumb {
      box-shadow:
          var(--shadow-thumb),
          0 0 0 4px color-mix(in srgb, var(--color-primary) 12%, transparent);
    }
  }

  &__values {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__value {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    line-height: 1.2;

    &--muted {
      color: var(--color-body-ultra-faint);
    }

    &--current {
      color: var(--color-primary);
    }
  }
}
</style>