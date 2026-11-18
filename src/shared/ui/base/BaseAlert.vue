<script setup>
import { computed } from 'vue'
import { AlertCircle, CheckCircle2, Info } from 'lucide-vue-next'
const props = defineProps({
  variant: { type: String, default: 'info' },
  type: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: [Object, Function], default: null },
})
const tone = computed(() => props.type || props.variant)
const alertIcon = computed(() => props.icon || (tone.value === 'success' ? CheckCircle2 : ['error', 'warning'].includes(tone.value) ? AlertCircle : Info))
</script>

<template>
  <div :class="['base-alert', `base-alert--${tone}`]" :role="tone === 'error' ? 'alert' : 'status'">
    <component :is="alertIcon" class="base-alert__icon" :size="18" aria-hidden="true" />
    <div class="base-alert__content">
      <p v-if="title" class="base-alert__title">{{ title }}</p>
      <p v-if="description" class="base-alert__description">{{ description }}</p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.base-alert { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid #c4ddcd; border-radius: 8px; background: #f0f7f2; color: #123f35; font-size: 14px; }
.base-alert__icon { flex-shrink: 0; margin-top: 2px; }
.base-alert__content { flex: 1; min-width: 0; }
.base-alert__title { margin-bottom: 4px; color: inherit; font-weight: 500; }
.base-alert__description { color: inherit; line-height: 1.6; }
.base-alert--warning { background: #fcf8ed; border-color: #ead8a7; color: #80531c; }
.base-alert--error { background: #fcf4f3; border-color: #e8cace; color: #882d3a; }
</style>
