<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section class="auth-context">
    <p class="auth-context__label carnet-marker">CCIB38 · Grenoble</p>
    <h2>{{ t('auth.context_title') }}</h2>
    <p class="auth-context__description">{{ t('auth.context_description') }}</p>
    <p class="auth-context__subjects">{{ t('auth.context_arabic') }} <span aria-hidden="true">·</span> {{ t('auth.context_support') }}</p>
  </section>
</template>

<style scoped>
.auth-context { max-width: 480px; align-self: center; padding: 32px 0; }
.auth-context__label { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--color-primary); }
.auth-context h2 { margin-top: 32px; font-size: clamp(32px, 3.8vw, 52px); line-height: 1.16; letter-spacing: -.035em; font-weight: 400; }
.auth-context__description { max-width: 38ch; margin-top: 24px; font-size: 16px; line-height: 1.7; }
.auth-context__subjects { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--color-border); font-size: 13px; color: var(--color-body); }
@media (max-width: 860px) { .auth-context { max-width: none; padding: 0; } .auth-context h2, .auth-context__description, .auth-context__subjects { display: none; } }
</style>
