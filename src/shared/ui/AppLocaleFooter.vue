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

<style scoped lang="scss">
.app-locale-footer {
  position: relative;
  z-index: 2;
  border-top: 1px solid var(--color-border);
  background: rgba(249, 248, 246, 0.92);
  backdrop-filter: blur(10px);

  &__inner {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 1.5rem 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    text-align: center;
  }

  &__languages {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.45rem 0.75rem;
  }

  &__language {
    appearance: none;
    border: none;
    background: transparent;
    padding: 0.15rem 0;
    font-size: var(--text-body-sm);
    font-weight: 500;
    line-height: 1.4;
    color: var(--color-body);
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);

    &:hover {
      color: var(--color-heading);
    }

    &:focus-visible {
      outline: none;
      text-decoration: underline;
      text-underline-offset: 0.2rem;
    }

    &.is-active {
      color: var(--color-primary);
      font-weight: 700;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    color: var(--color-body-faint);
    text-align: center;
  }
}

@media (max-width: 640px) {
  .app-locale-footer {
    &__inner {
      padding: 0.9rem 1rem 1rem;
    }
  }
}
</style>
