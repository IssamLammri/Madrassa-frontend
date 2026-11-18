<template>
  <main class="whatsapp-page" :class="{ 'whatsapp-page--connected': !token }" lang="fr">
    <div class="whatsapp-page__container">
      <header class="whatsapp-header">

        <p class="page-heading__context">CCIB38 · Espace familles</p>
        <h1>Groupes WhatsApp de vos enfants</h1>
        <p class="whatsapp-intro">
          Les liens sont actualisés lorsque cela est nécessaire. Vous pouvez conserver cette page dans vos favoris pour retrouver les liens à jour.
        </p>
      </header>

      <section v-if="isLoading" class="whatsapp-state" aria-live="polite">
        <span class="whatsapp-spinner" aria-hidden="true"></span>
        <p>Chargement des groupes…</p>
      </section>

      <section v-else-if="isInvalid" class="whatsapp-state whatsapp-state--error" role="status">
        <h2>{{ token ? 'Ce lien n’est pas valide' : 'Dossier parent introuvable' }}</h2>
        <p>{{ token ? 'Vérifiez l’adresse reçue par e-mail ou contactez l’équipe du CCIB38 pour obtenir un nouveau lien.' : 'Contactez l’équipe du CCIB38 pour associer votre compte à votre dossier parent.' }}</p>
      </section>

      <section v-else-if="hasError" class="whatsapp-state whatsapp-state--error" role="status">
        <h2>Les groupes sont momentanément indisponibles</h2>
        <p>Veuillez réessayer dans quelques instants.</p>
        <button type="button" class="whatsapp-retry" @click="loadGroups">Réessayer</button>
      </section>

      <template v-else>
        <div v-if="groups.length" class="whatsapp-groups">
          <article v-for="(group, index) in groups" :key="`${group.className}-${index}`" class="whatsapp-group">
            <div class="whatsapp-group__topline">
              <div>
                <p class="whatsapp-group__label">Classe</p>
                <h2>{{ group.className }}</h2>
              </div>
              <span class="whatsapp-status" :class="group.available ? 'whatsapp-status--available' : 'whatsapp-status--unavailable'">
                <span aria-hidden="true"></span>{{ group.available ? 'Disponible' : 'Indisponible' }}
              </span>
            </div>

            <p class="whatsapp-updated">Dernière mise à jour : <time :datetime="group.lastUpdatedAt">{{ formatDate(group.lastUpdatedAt) }}</time></p>

            <a
              v-if="group.available && isSafeGroupUrl(group.whatsappUrl)"
              class="whatsapp-join"
              :href="group.whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              referrerpolicy="no-referrer"
            >
              <MessageCircle :size="18" aria-hidden="true" />
              Rejoindre le groupe WhatsApp
              <ExternalLink :size="16" aria-hidden="true" />
            </a>
            <p v-else class="whatsapp-unavailable">
              Ce groupe WhatsApp n'est pas disponible actuellement. Notre équipe travaille à résoudre le problème. Merci de revenir sur cette page ultérieurement.
            </p>
          </article>
        </div>

        <section v-else class="whatsapp-state">
          <h2>Aucun groupe WhatsApp disponible</h2>
          <p>Aucun groupe n’est associé aux inscriptions actives de cette année scolaire.</p>
        </section>

        <p class="whatsapp-footer-note">Si un lien change ou est suspendu, revenez sur cette même page pour consulter sa version actualisée.</p>
      </template>

      <footer class="whatsapp-brand">CCIB38 <span>·</span> Espace familles</footer>
    </div>
  </main>
</template>

<script setup>
import { MessageCircle, ExternalLink } from 'lucide-vue-next'
import axios from 'axios'
import apiClient from '@/services/apiClient.js'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const apiHost = (import.meta.env.VITE_API_HOST || 'https://ecole.ccib38.fr').replace(/\/$/, '')
const groups = ref([])
const isLoading = ref(true)
const isInvalid = ref(false)
const hasError = ref(false)

const token = computed(() => String(route.params.token_parent || ''))

async function loadGroups() {
  isLoading.value = true
  isInvalid.value = false
  hasError.value = false
  groups.value = []

  try {
    const response = token.value ? await axios.get(
      `${apiHost}/api/public/parents/whatsapp-groups/${encodeURIComponent(token.value)}`,
      {
        headers: { Accept: 'application/json' },
        withCredentials: false,
      },
    ) : await apiClient.get('/api/parent/whatsapp-groups')
    groups.value = Array.isArray(response.data?.groups) ? response.data.groups : []
  } catch (error) {
    if ([401, 404].includes(error.response?.status)) {
      isInvalid.value = true
    } else {
      hasError.value = true
    }
  } finally {
    isLoading.value = false
  }
}

function isSafeGroupUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date non disponible'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

watch(token, loadGroups, { immediate: true })
</script>

<style scoped>
.whatsapp-page { min-height: calc(100svh - 88px); padding: 48px 24px; background: var(--color-bg-cream); color: var(--color-heading); }
.whatsapp-page__container { max-width: 880px; margin-inline: auto; }
.whatsapp-page--connected { min-height: auto; padding: 0; background: transparent; }
.whatsapp-page--connected .whatsapp-page__container { max-width: none; }
.whatsapp-header { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--color-border); }
.whatsapp-header h1 { margin: 0; font-size: clamp(26px, 3vw, 32px); line-height: 1.25; font-weight: 500; letter-spacing: -.025em; }
.whatsapp-intro { max-width: 70ch; margin-top: 12px; color: var(--color-body); font-size: 14px; line-height: 1.7; }
.whatsapp-groups { display: grid; gap: 16px; }
.whatsapp-group { padding: 24px; border: 1px solid var(--color-border); border-radius: 16px; background: white; }
.whatsapp-group__topline { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.whatsapp-group__label { color: var(--color-body); font-size: 12px; margin-bottom: 8px; }
.whatsapp-group h2 { font-size: 20px; font-weight: 500; line-height: 1.4; }
.whatsapp-status { display: inline-flex; flex-shrink: 0; align-items: center; gap: 8px; font-size: 12px; padding: 4px 8px; border-radius: 6px; }
.whatsapp-status > span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.whatsapp-status--available { color: #123f35; background: #f0f7f2; }
.whatsapp-status--unavailable { color: #80531c; background: #fcf8ed; }
.whatsapp-updated { margin-top: 12px; margin-bottom: 24px; color: var(--color-body); font-size: 13px; }
.whatsapp-join { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 10px 16px; border-radius: 8px; background: var(--color-primary); color: white; font-size: 14px; font-weight: 500; text-decoration: none; transition: background-color 160ms; }
.whatsapp-join:hover { background: var(--color-primary-hover); }
.whatsapp-unavailable { margin: 0; padding: 16px; border-radius: 8px; background: var(--color-slate-50); color: var(--color-body); font-size: 14px; line-height: 1.65; }
.whatsapp-state { padding: 32px 24px; border: 1px solid var(--color-border); border-radius: 16px; background: white; }
.whatsapp-state h2 { margin-bottom: 8px; font-size: 20px; font-weight: 500; }
.whatsapp-state p { color: var(--color-body); font-size: 14px; line-height: 1.6; }
.whatsapp-state--error { border-color: #ead8a7; }
.whatsapp-spinner { display: block; width: 24px; height: 24px; margin-bottom: 16px; border: 2px solid #c4ddcd; border-top-color: var(--color-primary); border-radius: 50%; animation: whatsapp-spin .8s linear infinite; }
.whatsapp-retry { margin-top: 20px; min-height: 44px; padding: 10px 16px; border: 0; border-radius: 8px; background: var(--color-primary); color: white; font-size: 14px; cursor: pointer; }
.whatsapp-footer-note { margin-top: 24px; max-width: 72ch; color: var(--color-body); font-size: 13px; line-height: 1.7; }
.whatsapp-brand { margin-top: 32px; color: var(--color-body); font-size: 12px; }
.whatsapp-brand span { padding-inline: 4px; }
@keyframes whatsapp-spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) { .whatsapp-page { padding: 24px 16px; } .whatsapp-page--connected { padding: 0; } .whatsapp-header { margin-bottom: 24px; } .whatsapp-group { padding: 20px; } .whatsapp-group__topline { flex-direction: column; gap: 12px; } .whatsapp-join { width: 100%; } .whatsapp-group h2 { font-size: 18px; } }
</style>
