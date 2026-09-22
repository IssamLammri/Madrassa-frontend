<template>
  <div class="requests-view max-w-6xl mx-auto w-full space-y-8 pb-12">
    <!-- 1. HEADER SECTION -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <ClipboardListIcon class="w-3.5 h-3.5 text-amber-600" />
            <span>Suivi des dossiers</span>
          </span>
          <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {{ isCurrentYearOnly ? 'Année scolaire en cours' : 'Toutes les années' }}
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Mes demandes & inscriptions
        </h1>
        <p class="text-sm text-slate-500 max-w-xl">
          Consultez l'état d'avancement de vos demandes d'inscription en langue arabe et soutien scolaire.
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="fetchRequests"
          :disabled="isLoading"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 transition-colors disabled:opacity-50 cursor-pointer"
          title="Actualiser la liste"
        >
          <RefreshCwIcon class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          <span>Actualiser</span>
        </button>

        <button
          type="button"
          @click="showRegistrationModal = true"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
        >
          <PlusCircleIcon class="w-4 h-4" />
          <span>Nouvelle inscription</span>
        </button>
      </div>
    </div>

    <!-- 2. SUMMARY COUNTERS -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total demandes</span>
        <span class="text-2xl sm:text-3xl font-black text-slate-900">{{ requests.length }}</span>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">En cours / Attente</span>
        <span class="text-2xl sm:text-3xl font-black text-amber-700">{{ pendingCount }}</span>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">Validées</span>
        <span class="text-2xl sm:text-3xl font-black text-emerald-700">{{ validatedCount }}</span>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">Paiement requis</span>
        <span class="text-2xl sm:text-3xl font-black text-indigo-700">{{ paymentCount }}</span>
      </div>
    </div>

    <!-- 3. FILTERS & YEAR SWITCHER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <!-- Service filter tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          v-for="tab in serviceTabs"
          :key="tab.id"
          type="button"
          @click="selectedServiceTab = tab.id"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
          :class="selectedServiceTab === tab.id
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'"
        >
          {{ tab.label }}
          <span class="ml-1 text-[11px] opacity-75">({{ getTabCount(tab.id) }})</span>
        </button>
      </div>

      <!-- Year Toggle (currentYear=true vs currentYear=false) -->
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <span class="text-xs font-semibold text-slate-500">Période :</span>
        <div class="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-bold">
          <button
            type="button"
            @click="setYearFilter(true)"
            class="px-3 py-1 rounded-lg transition-colors cursor-pointer"
            :class="isCurrentYearOnly ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          >
            Année en cours
          </button>
          <button
            type="button"
            @click="setYearFilter(false)"
            class="px-3 py-1 rounded-lg transition-colors cursor-pointer"
            :class="!isCurrentYearOnly ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          >
            Toutes les années
          </button>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <BaseAlert v-if="error" type="error" class="shadow-xs">
      <div class="flex items-center justify-between gap-4">
        <span>{{ error }}</span>
        <button @click="fetchRequests" class="underline font-bold text-xs">Réessayer</button>
      </div>
    </BaseAlert>

    <!-- 4. LOADING STATE -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
      <div class="animate-spin rounded-full h-12 w-12 border-3 border-emerald-600 border-t-transparent mb-4"></div>
      <p class="text-sm font-semibold text-slate-600">Chargement de vos demandes...</p>
      <p class="text-xs text-slate-400 mt-1">Interrogation des dossiers auprès de l'administration</p>
    </div>

    <!-- 5. REQUESTS LIST -->
    <div v-else-if="filteredRequests.length > 0" class="space-y-4">
      <div
        v-for="(req, index) in filteredRequests"
        :key="req.id || index"
        class="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-5"
      >
        <!-- Top bar of the card -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div class="flex items-start sm:items-center gap-3.5">
            <!-- Service Icon -->
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-sm"
              :class="isArabe(req.type) ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'"
            >
              <component :is="isArabe(req.type) ? BookOpenIcon : GraduationCapIcon" class="w-6 h-6" />
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-base sm:text-lg font-black text-slate-900">
                  {{ getChildName(req) }}
                </h3>
                <!-- Service Badge -->
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  :class="isArabe(req.type) ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'"
                >
                  {{ isArabe(req.type) ? 'Langue Arabe' : 'Soutien Scolaire' }}
                </span>
                <!-- School Year Badge -->
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  {{ req.schoolYear || req.anneeScolaire || '2026/2027' }}
                </span>
              </div>

              <!-- Classroom info if assigned -->
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span v-if="req.classroom || req.classe" class="font-semibold text-slate-700">
                  Classe : {{ req.classroom || req.classe }}
                </span>
                <span v-else class="italic text-slate-400">
                  Classe : En attente d'affectation
                </span>
              </p>
            </div>
          </div>

          <!-- Status badge -->
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <span
              class="px-3.5 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5"
              :class="getStatusBadgeClass(req)"
            >
              <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(req)"></span>
              {{ req.statusLabel || req.status || 'En cours' }}
            </span>
          </div>
        </div>

        <!-- Progress Bar & Step Section -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Étape actuelle :</span>
              <span class="font-bold text-slate-800">{{ getStepLabel(req) }}</span>
            </div>
            <div class="flex items-center gap-1.5 font-bold">
              <span class="text-slate-400">Avancement :</span>
              <span :class="getProgressTextClass(getProgressPercent(req))">
                {{ getProgressPercent(req) }}%
              </span>
            </div>
          </div>

          <!-- Progress Bar visual -->
          <div class="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="getProgressBarColor(req)"
              :style="{ width: `${Math.min(Math.max(getProgressPercent(req), 5), 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Action / Note Footer -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div class="text-slate-500">
            <span v-if="isPaymentRequired(req)" class="text-amber-700 font-bold flex items-center gap-1.5">
              <AlertCircleIcon class="w-4 h-4 text-amber-600" />
              L'inscription sera validée définitivement dès réception du règlement.
            </span>
            <span v-else-if="isCompleted(req)" class="text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2Icon class="w-4 h-4 text-emerald-600" />
              Dossier validé et inscription confirmée.
            </span>
            <span v-else class="text-slate-500 flex items-center gap-1.5">
              <ClockIcon class="w-4 h-4 text-slate-400" />
              Votre dossier est examiné par l'équipe administrative.
            </span>
          </div>

          <!-- Call to action button -->
          <div class="flex items-center gap-2">
            <router-link
              v-if="isPaymentRequired(req)"
              to="/home/invoices"
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <WalletIcon class="w-3.5 h-3.5" />
              <span>Procéder au règlement</span>
            </router-link>

            <button
              v-if="req.childId || (req.child && req.child.id)"
              type="button"
              @click="goToChildDetail(req)"
              class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 font-semibold rounded-xl text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Fiche enfant</span>
              <ArrowRightIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. EMPTY STATE -->
    <div v-else class="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
      <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
        <InboxIcon class="w-8 h-8" />
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-bold text-slate-800">Aucune demande trouvée</h3>
        <p class="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {{ isCurrentYearOnly ? 'Aucune demande active enregistrée pour l\'année scolaire en cours.' : 'Vous n\'avez aucune demande d\'inscription enregistrée.' }}
        </p>
      </div>
      <div class="pt-2 flex justify-center gap-3">
        <button
          v-if="isCurrentYearOnly"
          type="button"
          @click="setYearFilter(false)"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Voir toutes les années
        </button>
        <button
          type="button"
          @click="showRegistrationModal = true"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
        >
          <PlusCircleIcon class="w-4 h-4" />
          <span>Faire une nouvelle inscription</span>
        </button>
      </div>
    </div>

    <!-- REGISTRATION CHOICE MODAL -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRegistrationModal"
          class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          @click.self="showRegistrationModal = false"
        >
          <div
            class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 overflow-hidden transform transition-all"
            role="dialog"
            aria-modal="true"
          >
            <!-- Close Button -->
            <button
              type="button"
              @click="showRegistrationModal = false"
              class="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <XIcon class="w-5 h-5" />
            </button>

            <!-- Header -->
            <div class="space-y-1 pr-8">
              <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
                <SparklesIcon class="w-3.5 h-3.5 text-emerald-600" />
                <span>Nouvelle inscription</span>
              </span>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Choisir le programme
              </h2>
              <p class="text-xs sm:text-sm text-slate-500">
                Sélectionnez le service d'enseignement auquel vous souhaitez inscrire votre enfant :
              </p>
            </div>

            <!-- Choice Options Cards -->
            <div class="space-y-3.5">
              <!-- Option 1: Soutien Scolaire -->
              <div
                @click="chooseRegistration('/inscription-soutien-scolaire')"
                class="group p-4 sm:p-5 rounded-2xl border-2 border-slate-200/80 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 transition-all cursor-pointer shadow-xs hover:shadow-md flex items-start gap-4"
              >
                <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCapIcon class="w-6 h-6" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <h3 class="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Soutien Scolaire
                    </h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Primaire à Lycée
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                    Mathématiques, Français, Physique, Anglais... Accompagnement individualisé et renforcement des acquis scolaires.
                  </p>
                  <div class="mt-2.5 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                    <span>30 € / an par matière</span>
                    <span class="inline-flex items-center gap-1">
                      Choisir ce service
                      <ArrowRightIcon class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>

              <!-- Option 2: Langue Arabe & Éducation -->
              <div
                @click="chooseRegistration('/inscription')"
                class="group p-4 sm:p-5 rounded-2xl border-2 border-slate-200/80 hover:border-indigo-500 bg-white hover:bg-indigo-50/40 transition-all cursor-pointer shadow-xs hover:shadow-md flex items-start gap-4"
              >
                <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpenIcon class="w-6 h-6" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <h3 class="text-base font-black text-slate-900 group-hover:text-indigo-800 transition-colors">
                      Langue Arabe & Éducation
                    </h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      Niveaux N1 à N6
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                    Apprentissage de la lecture, de l'écriture arabe, mémorisation du Coran et éducation éthique islamique.
                  </p>
                  <div class="mt-2.5 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                    <span>Semaine & Week-end</span>
                    <span class="inline-flex items-center gap-1">
                      Choisir ce service
                      <ArrowRightIcon class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-2 flex justify-end">
              <button
                type="button"
                @click="showRegistrationModal = false"
                class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ClipboardListIcon,
  RefreshCwIcon,
  PlusCircleIcon,
  BookOpenIcon,
  GraduationCapIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  WalletIcon,
  ArrowRightIcon,
  InboxIcon,
  XIcon,
  SparklesIcon
} from 'lucide-vue-next'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import { getParentRequests } from '@/services/parentApi.js'

const router = useRouter()

const isLoading = ref(true)
const error = ref('')
const requests = ref([])
const isCurrentYearOnly = ref(true)
const selectedServiceTab = ref('all')
const showRegistrationModal = ref(false)

const serviceTabs = [
  { id: 'all', label: 'Toutes les demandes' },
  { id: 'arabe', label: 'Langue Arabe' },
  { id: 'soutienScolaire', label: 'Soutien Scolaire' }
]

const chooseRegistration = (path) => {
  showRegistrationModal.value = false
  router.push(path)
}

const goToChildDetail = (req) => {
  const childId = req.childId || (req.child && req.child.id)
  if (childId) {
    router.push(`/home/children/${childId}`)
  } else {
    router.push('/home/children')
  }
}

const setYearFilter = async (currentYear) => {
  if (isCurrentYearOnly.value === currentYear) return
  isCurrentYearOnly.value = currentYear
  await fetchRequests()
}

const fetchRequests = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const params = {}
    if (!isCurrentYearOnly.value) {
      params.currentYear = false
    }

    const response = await getParentRequests(params)
    
    // Normalisation flexible du retour API
    if (Array.isArray(response)) {
      requests.value = response
    } else if (response && Array.isArray(response.data)) {
      requests.value = response.data
    } else if (response && Array.isArray(response.requests)) {
      requests.value = response.requests
    } else {
      requests.value = []
    }
  } catch (err) {
    console.error('Erreur chargement des demandes:', err)
    error.value = "Impossible de récupérer la liste des demandes pour le moment."
    requests.value = []
  } finally {
    isLoading.value = false
  }
}

const isArabe = (type) => {
  if (!type) return false
  const t = String(type).toLowerCase()
  return t.includes('arabe')
}

const getChildName = (req) => {
  if (req.childName) return req.childName
  if (req.enfant) {
    if (typeof req.enfant === 'string') return req.enfant
    if (typeof req.enfant === 'object') {
      return `${req.enfant.firstName || ''} ${req.enfant.lastName || ''}`.trim() || req.enfant.name || 'Enfant'
    }
  }
  if (req.child) {
    if (typeof req.child === 'string') return req.child
    if (typeof req.child === 'object') {
      return `${req.child.firstName || ''} ${req.child.lastName || ''}`.trim() || req.child.name || 'Enfant'
    }
  }
  return 'Enfant'
}

const getProgressPercent = (req) => {
  if (req.progress && typeof req.progress.percent === 'number') {
    return req.progress.percent
  }
  if (typeof req.percentage === 'number') {
    return req.percentage
  }
  if (typeof req.progress === 'number') {
    return req.progress
  }
  const s = String(req.status || '').toLowerCase()
  if (s === 'validated' || s === 'completed' || s === 'accepted') return 100
  if (s === 'payment') return 40
  if (s === 'pending') return 20
  return 10
}

const getStepLabel = (req) => {
  if (req.progress && req.progress.step) {
    const st = req.progress.step.toLowerCase()
    if (st === 'payment') return 'Paiement en attente'
    if (st === 'validation') return 'Validation administrative'
    if (st === 'affectation') return 'Affectation à une classe'
    if (st === 'completed') return 'Inscription terminée'
    return req.progress.step
  }
  return req.statusLabel || req.status || 'Traitement en cours'
}

const isPaymentRequired = (req) => {
  const s = String(req.status || '').toLowerCase()
  const step = String(req.progress?.step || '').toLowerCase()
  return s === 'payment' || step === 'payment' || s.includes('paiement')
}

const isCompleted = (req) => {
  const s = String(req.status || '').toLowerCase()
  const p = getProgressPercent(req)
  return s === 'validated' || s === 'completed' || s === 'accepted' || p >= 100
}

const getStatusBadgeClass = (req) => {
  if (isPaymentRequired(req)) {
    return 'bg-amber-100 text-amber-800 border border-amber-300'
  }
  if (isCompleted(req)) {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-300'
  }
  const s = String(req.status || '').toLowerCase()
  if (s === 'rejected' || s === 'refused') {
    return 'bg-rose-100 text-rose-800 border border-rose-300'
  }
  return 'bg-blue-100 text-blue-800 border border-blue-300'
}

const getStatusDotClass = (req) => {
  if (isPaymentRequired(req)) return 'bg-amber-500 animate-pulse'
  if (isCompleted(req)) return 'bg-emerald-500'
  const s = String(req.status || '').toLowerCase()
  if (s === 'rejected' || s === 'refused') return 'bg-rose-500'
  return 'bg-blue-500 animate-pulse'
}

const getProgressBarColor = (req) => {
  if (isCompleted(req)) return 'bg-emerald-500'
  if (isPaymentRequired(req)) return 'bg-amber-500'
  return 'bg-blue-500'
}

const getProgressTextClass = (percent) => {
  if (percent >= 100) return 'text-emerald-700'
  if (percent >= 40) return 'text-amber-700'
  return 'text-blue-700'
}

const getTabCount = (tabId) => {
  if (tabId === 'all') return requests.value.length
  if (tabId === 'arabe') return requests.value.filter(r => isArabe(r.type)).length
  if (tabId === 'soutienScolaire') return requests.value.filter(r => !isArabe(r.type)).length
  return 0
}

const filteredRequests = computed(() => {
  if (selectedServiceTab.value === 'all') return requests.value
  if (selectedServiceTab.value === 'arabe') return requests.value.filter(r => isArabe(r.type))
  if (selectedServiceTab.value === 'soutienScolaire') return requests.value.filter(r => !isArabe(r.type))
  return requests.value
})

const pendingCount = computed(() => {
  return requests.value.filter(r => !isCompleted(r)).length
})

const validatedCount = computed(() => {
  return requests.value.filter(r => isCompleted(r)).length
})

const paymentCount = computed(() => {
  return requests.value.filter(r => isPaymentRequired(r)).length
})

onMounted(() => {
  fetchRequests()
})
</script>
