<script setup>
import { ChevronDown } from 'lucide-vue-next';
import { computed, useAttrs, useId } from 'vue';

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const generatedId = useId();
const controlId = computed(() => attrs.id || generatedId);

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
    <label v-if="label" :for="controlId" class="base-select__label">
      {{ label }}
    </label>

    <div class="base-select__control">
      <select
          v-bind="attrs"
          :id="controlId"
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

<style scoped>
.base-select { display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 0; }
.base-select__label { color: var(--color-heading); font-size: 13px; font-weight: 500; }
.base-select__control { position: relative; width: 100%; }
.base-select__field { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-input-bg); color: var(--color-heading); font-size: 15px; line-height: 1.5; transition: background-color 160ms, border-color 160ms; }
.base-select__field:focus { background: white; border-color: var(--color-primary); outline: 2px solid #c4ddcd; outline-offset: 1px; }
.base-select__field::placeholder { color: var(--color-body-ultra-faint); }
.base-select__field { appearance: none; padding-inline-end: 40px; cursor: pointer; }
.base-select__icon { position: absolute; inset-inline-end: 12px; top: 50%; transform: translateY(-50%); color: var(--color-body); pointer-events: none; }
</style>
