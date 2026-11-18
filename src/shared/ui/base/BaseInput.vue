<script setup>
import { computed, useAttrs, useId, useSlots } from 'vue';

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
const slots = useSlots();
const generatedId = useId();
const controlId = computed(() => attrs.id || generatedId);

const hasIcon = computed(() => !!props.icon && !props.error);
const hasSuffix = computed(() => !!slots.suffix);
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="controlId" class="base-input__label">
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
          :id="controlId"
          :aria-invalid="error ? true : undefined"
          :aria-describedby="[attrs['aria-describedby'], error ? `${controlId}-error` : null].filter(Boolean).join(' ') || undefined"
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

    <p v-if="error" :id="`${controlId}-error`" class="base-input__error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.base-input { display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 0; }
.base-input__label { color: var(--color-heading); font-size: 13px; font-weight: 500; }
.base-input__control { position: relative; width: 100%; }
.base-input__field {
  width: 100%; min-height: var(--control-height); padding: 10px 12px;
  border: 1px solid var(--color-border); border-radius: var(--radius-input);
  background: var(--color-input-bg); color: var(--color-heading); font-size: 15px;
  line-height: 1.5; transition: background-color 160ms, border-color 160ms;
}
.base-input__field::placeholder { color: var(--color-body-ultra-faint); }
.base-input__field:focus { background: white; border-color: var(--color-primary); outline: 2px solid #c4ddcd; outline-offset: 1px; }
.base-input__control--with-icon .base-input__field, .base-input__control--with-suffix .base-input__field { padding-inline-end: 48px; }
.base-input__icon, .base-input__suffix { position: absolute; top: 50%; inset-inline-end: 12px; transform: translateY(-50%); color: var(--color-body); }
.base-input__icon { pointer-events: none; }
.base-input__suffix { display: flex; align-items: center; justify-content: center; }
.base-input__control--error .base-input__field { border-color: var(--color-accent); background: #fffafa; }
.base-input__error { color: var(--color-accent); font-size: 13px; }
</style>
