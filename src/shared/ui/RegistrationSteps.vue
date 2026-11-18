<script setup>
defineProps({ labels: { type: Array, required: true }, currentStep: { type: Number, required: true } })
</script>

<template>
  <nav class="registration-steps" aria-label="Étapes de l’inscription">
    <div class="registration-steps__summary"><span>Étape {{ currentStep + 1 }} sur {{ labels.length }}</span><strong>{{ labels[currentStep] }}</strong></div>
    <ol :style="{ '--step-count': labels.length }">
      <li v-for="(label, index) in labels" :key="label" :class="{ 'is-current': currentStep === index, 'is-complete': currentStep > index }" :aria-current="currentStep === index ? 'step' : undefined">
        <span class="registration-steps__number">{{ index + 1 }}</span><span class="registration-steps__label">{{ label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.registration-steps { padding: 20px 24px; background: white; border: 1px solid var(--color-border); border-radius: 12px; }
.registration-steps ol { display: grid; grid-template-columns: repeat(var(--step-count), minmax(0, 1fr)); list-style: none; gap: 8px; margin: 0; padding: 0; }
.registration-steps li { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; padding-top: 4px; color: var(--color-body); font-size: 12px; }
.registration-steps li:not(:last-child)::after { content: ''; position: absolute; top: 20px; inset-inline-start: calc(50% + 24px); width: calc(100% - 40px); height: 1px; background: var(--color-border); }
.registration-steps__number { display: grid; place-items: center; width: 32px; height: 32px; background: var(--color-slate-100); border: 1px solid transparent; border-radius: 8px; color: var(--color-body); font-size: 13px; font-variant-numeric: tabular-nums; }
.is-current .registration-steps__number { background: var(--color-primary); color: white; border-radius: 16px 16px 6px 6px; }
.is-current .registration-steps__label { color: var(--color-primary); font-weight: 500; }
.is-complete .registration-steps__number { background: #e1eee5; color: #123f35; }
.registration-steps__summary { display: none; }
@media (max-width: 640px) {
  .registration-steps { padding: 16px; }
  .registration-steps__summary { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-bottom: 16px; font-size: 13px; color: var(--color-body); }
  .registration-steps__summary strong { color: var(--color-heading); font-weight: 500; }
  .registration-steps__label { display: none; }
  .registration-steps ol { gap: 4px; }
  .registration-steps li { gap: 0; padding: 0; }
  .registration-steps li:not(:last-child)::after { display: none; }
  .registration-steps__number { width: 28px; height: 28px; font-size: 12px; }
}
</style>
