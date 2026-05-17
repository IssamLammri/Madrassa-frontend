import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'

const savedLocale = localStorage.getItem('locale') || 'fr' // default to French

export const i18n = createI18n({
    legacy: false,        // use Composition API mode
    locale: savedLocale,
    fallbackLocale: 'fr',
    messages: { en, fr }
})