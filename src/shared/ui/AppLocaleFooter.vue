<script setup>
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'

const {locale, t} = useI18n()

const languages = computed(() => [
  {code: 'fr', label: 'Français'},
  {code: 'en', label: 'English'},
])

const currentYear = new Date().getFullYear()

function switchLanguage(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>

<template>
  <footer class="app-locale-footer">
    <div class="app-locale-footer__inner">
      <div class="app-locale-footer__languages">
        <button
            v-for="lang in languages"
            :key="lang.code"
            type="button"
            class="app-locale-footer__language"
            :class="{ 'is-active': locale === lang.code }"
            @click="switchLanguage(lang.code)"
        >
          {{ lang.label }}
        </button>
      </div>

      <div class="app-locale-footer__meta">
        <span>{{ t('layout.footer_brand', 'CCIB38') }}</span>
        <span>•</span>
        <span>{{ currentYear }}</span>
        <span>•</span>
        <span>{{ t('layout.footer_rights', 'Tous droits réservés.') }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-locale-footer { border-top: 1px solid var(--color-border); background: var(--color-bg-cream); }
.app-locale-footer__inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; max-width: 1504px; padding: 20px 32px; margin-inline: auto; }
.app-locale-footer__languages { display: flex; align-items: center; gap: 16px; }
.app-locale-footer__language { padding: 4px 0; border: 0; background: transparent; color: var(--color-body); font-size: 13px; cursor: pointer; }
.app-locale-footer__language.is-active { color: var(--color-primary); text-decoration: underline; text-underline-offset: 5px; }
.app-locale-footer__language:hover { color: var(--color-heading); }
.app-locale-footer__meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--color-body); }
@media (max-width: 640px) { .app-locale-footer__inner { padding: 16px; justify-content: center; } .app-locale-footer__meta { justify-content: center; } }
</style>
