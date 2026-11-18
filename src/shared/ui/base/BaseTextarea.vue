<script setup>
import { computed, useAttrs, useId } from 'vue';
defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const generatedId = useId();
const controlId = computed(() => attrs.id || generatedId);
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
    <label v-if="label" :for="controlId" class="base-textarea__label">
      {{ label }}
    </label>

    <textarea
        v-bind="attrs"
        :id="controlId"
        :rows="rows"
        :value="modelValue"
        :placeholder="placeholder"
        class="base-textarea__field"
        @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<style scoped>
.base-textarea { display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 0; }
.base-textarea__label { color: var(--color-heading); font-size: 13px; font-weight: 500; }
.base-textarea__control { position: relative; width: 100%; }
.base-textarea__field { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-input-bg); color: var(--color-heading); font-size: 15px; line-height: 1.5; transition: background-color 160ms, border-color 160ms; }
.base-textarea__field:focus { background: white; border-color: var(--color-primary); outline: 2px solid #c4ddcd; outline-offset: 1px; }
.base-textarea__field::placeholder { color: var(--color-body-ultra-faint); }
.base-textarea__field { resize: vertical; }
</style>
