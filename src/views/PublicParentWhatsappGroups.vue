<template>
  <main class="whatsapp-page" :class="{ 'whatsapp-page--connected': !token }" lang="fr">
    <div class="whatsapp-page__container">
      <header class="whatsapp-header">
        <div class="whatsapp-header__icon" aria-hidden="true">✳</div>
        <p class="whatsapp-eyebrow">Portail familles CCIB38</p>
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
              <span class="whatsapp-join__mark" aria-hidden="true">◉</span>
              Rejoindre le groupe WhatsApp
              <span aria-hidden="true">↗</span>
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
.whatsapp-page{min-height:100vh;box-sizing:border-box;padding:48px 20px 28px;background:radial-gradient(circle at top,#e4f5ec 0,#f7faf8 36%,#f3f6f8 100%);color:#263a32}
.whatsapp-page__container{width:min(100%,760px);margin:0 auto}
.whatsapp-page--connected{min-height:auto;border-radius:22px}
.whatsapp-header{text-align:center;margin:0 auto 30px;max-width:650px}
.whatsapp-header__icon{display:grid;place-items:center;width:54px;height:54px;margin:0 auto 16px;border-radius:18px;background:#e0f5eb;color:#087453;font-size:27px}
.whatsapp-eyebrow{margin:0 0 8px;color:#087453;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.whatsapp-header h1{margin:0;color:#18352a;font-size:clamp(28px,5vw,42px);line-height:1.12;letter-spacing:-.035em}
.whatsapp-intro{max-width:590px;margin:15px auto 0;color:#65746e;font-size:15px;line-height:1.65}
.whatsapp-groups{display:grid;gap:14px}
.whatsapp-group{padding:22px 24px;border:1px solid #e0e9e4;border-radius:18px;background:rgba(255,255,255,.94);box-shadow:0 12px 32px rgba(32,67,52,.06)}
.whatsapp-group__topline{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.whatsapp-group__label{margin:0 0 5px;color:#84918b;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.whatsapp-group h2{margin:0;color:#203a30;font-size:21px;line-height:1.3}
.whatsapp-status{display:inline-flex;flex:0 0 auto;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;font-size:11px;font-weight:800}
.whatsapp-status>span{width:7px;height:7px;border-radius:50%;background:currentColor}
.whatsapp-status--available{background:#e8f7ef;color:#197b50}
.whatsapp-status--unavailable{background:#fff3e7;color:#a45d13}
.whatsapp-updated{margin:14px 0 16px;color:#77847e;font-size:12px}
.whatsapp-join{display:flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 16px;border-radius:12px;background:#128c53;color:#fff;text-decoration:none;font-size:14px;font-weight:800;transition:background .15s ease,transform .15s ease}
.whatsapp-join:hover{background:#0d7443;transform:translateY(-1px)}
.whatsapp-join:focus-visible,.whatsapp-retry:focus-visible{outline:3px solid #28a66a55;outline-offset:3px}
.whatsapp-join__mark{font-size:18px}
.whatsapp-unavailable{margin:0;padding:14px;border-radius:11px;background:#f7f8f7;color:#68756f;font-size:13px;line-height:1.6}
.whatsapp-state{padding:32px 24px;border:1px solid #e0e9e4;border-radius:18px;background:#fff;text-align:center;box-shadow:0 12px 32px rgba(32,67,52,.06)}
.whatsapp-state h2{margin:0 0 9px;color:#203a30;font-size:20px}
.whatsapp-state p{margin:0;color:#65746e;font-size:14px;line-height:1.6}
.whatsapp-state--error{border-color:#f0e3d8}
.whatsapp-spinner{display:block;width:27px;height:27px;margin:0 auto 13px;border:3px solid #dcece3;border-top-color:#128c53;border-radius:50%;animation:whatsapp-spin .8s linear infinite}
.whatsapp-retry{margin-top:18px;padding:10px 16px;border:0;border-radius:9px;background:#128c53;color:#fff;font-weight:700;cursor:pointer}
.whatsapp-footer-note{margin:22px auto 0;color:#7d8983;text-align:center;font-size:12px;line-height:1.6}
.whatsapp-brand{margin:32px 0 0;color:#91a099;text-align:center;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.whatsapp-brand span{padding:0 5px;color:#b0bab4}
@keyframes whatsapp-spin{to{transform:rotate(360deg)}}
@media(max-width:560px){.whatsapp-page{padding:32px 14px 22px}.whatsapp-header{margin-bottom:22px}.whatsapp-intro{font-size:14px}.whatsapp-group{padding:18px 16px}.whatsapp-group__topline{flex-direction:column;gap:11px}.whatsapp-group h2{font-size:19px}.whatsapp-status{align-self:flex-start}.whatsapp-state{padding:26px 18px}}
</style>
