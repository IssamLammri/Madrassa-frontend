<template>
  <div>
    <!-- 1. FLOATING ACTION BUTTON (Always visible in the portal) -->
    <button
      type="button"
      id="parent-support-fab"
      @click="openModal"
      class="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
      aria-label="Faire une demande, réclamation ou remerciement"
    >
      <div class="relative flex items-center justify-center">
        <MessageSquareTextIcon class="w-5 h-5 group-hover:rotate-6 transition-transform" />
        <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-600 animate-pulse"></span>
      </div>
      <span class="font-bold text-xs sm:text-sm tracking-wide hidden sm:inline-block">
        Faire une demande
      </span>
    </button>

    <!-- 2. MODAL BACKDROP & DIALOG -->
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
          v-if="isOpen"
          class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          @click.self="closeModal"
        >
          <div
            class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <!-- Close Button -->
            <button
              type="button"
              @click="closeModal"
              class="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer"
              aria-label="Fermer"
            >
              <XIcon class="w-5 h-5" />
            </button>

            <!-- SUCCESS STATE -->
            <div v-if="isSubmitted" class="p-8 sm:p-10 text-center space-y-4">
              <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2Icon class="w-9 h-9" />
              </div>
              <div class="space-y-1.5">
                <h3 class="text-xl sm:text-2xl font-black text-slate-900">Message envoyé !</h3>
                <p class="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Votre {{ selectedCategoryLabel.toLowerCase() }} a bien été transmise à l'administration de l'établissement. Nous la traiterons avec attention dans les plus brefs délais.
                </p>
              </div>

              <div class="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  @click="resetFormAndClose"
                  class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  @click="resetForm"
                  class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            </div>

            <!-- FORM STATE -->
            <div v-else class="p-6 sm:p-8 space-y-5">
              <!-- Header -->
              <div class="space-y-1 pr-8">
                <div class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
                  <HeartHandshakeIcon class="w-3.5 h-3.5" />
                  <span>Contact & Administration</span>
                </div>
                <h2 id="modal-title" class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Envoyer un message
                </h2>
                <p class="text-xs sm:text-sm text-slate-500">
                  Faites part d'une demande, d'une réclamation ou d'un remerciement à l'équipe CCIB38.
                </p>
              </div>

              <!-- Category Pills -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Type de message
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    v-for="cat in categories"
                    :key="cat.id"
                    type="button"
                    @click="selectCategory(cat)"
                    class="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center"
                    :class="selectedCategory === cat.id 
                      ? `${cat.activeBg} ${cat.activeText} ${cat.activeBorder} shadow-2xs scale-[1.02]` 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'"
                  >
                    <component :is="cat.icon" class="w-3.5 h-3.5 flex-shrink-0" />
                    <span class="truncate">{{ cat.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Quick suggestions -->
              <div v-if="currentSuggestions.length > 0" class="flex flex-wrap items-center gap-1.5">
                <span class="text-[11px] text-slate-400 font-medium">Suggestions :</span>
                <button
                  v-for="sug in currentSuggestions"
                  :key="sug"
                  type="button"
                  @click="applySuggestion(sug)"
                  class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  {{ sug }}
                </button>
              </div>

              <!-- Error Alert -->
              <BaseAlert v-if="error" type="error" class="text-xs">
                {{ error }}
              </BaseAlert>

              <!-- Form Inputs -->
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Titre Input -->
                <div class="space-y-1">
                  <label for="complaint-title" class="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Titre du message <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="complaint-title"
                    v-model="form.title"
                    type="text"
                    required
                    placeholder="ex. Problème de facturation, Question sur les horaires..."
                    class="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-medium text-slate-800 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <!-- Contenu Textarea -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <label for="complaint-content" class="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Votre message <span class="text-rose-500">*</span>
                    </label>
                    <span class="text-[11px] text-slate-400">
                      {{ form.content.length }} car.
                    </span>
                  </div>
                  <textarea
                    id="complaint-content"
                    v-model="form.content"
                    rows="4"
                    required
                    placeholder="Bonjour, je souhaite obtenir des précisions sur..."
                    class="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-medium text-slate-800 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20 resize-y"
                  ></textarea>
                </div>

                <!-- Parent Info Footer preview -->
                <div v-if="parentName" class="text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-xl flex items-center justify-between border border-slate-100">
                  <span>Expéditeur : <strong class="text-slate-800">{{ parentName }}</strong></span>
                  <span v-if="parentId" class="text-slate-400">ID Dossier : #{{ parentId }}</span>
                </div>

                <!-- Actions -->
                <div class="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmitting || !form.title.trim() || !form.content.trim()"
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <SendIcon v-if="!isSubmitting" class="w-4 h-4" />
                    <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{{ isSubmitting ? 'Envoi en cours...' : 'Envoyer à l\'administration' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  MessageSquareTextIcon,
  XIcon,
  SendIcon,
  CheckCircle2Icon,
  HelpCircleIcon,
  AlertTriangleIcon,
  HeartIcon,
  LightbulbIcon,
  HeartHandshakeIcon
} from 'lucide-vue-next'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import { sendParentComplaint, getParentProfile } from '@/services/parentApi.js'
import { getToken } from '@/services/apiClient.js'

const isOpen = ref(false)
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const error = ref('')

const parentId = ref(null)
const parentName = ref('')

const selectedCategory = ref('demande')

const form = reactive({
  title: '',
  content: ''
})

const categories = [
  {
    id: 'demande',
    label: 'Demande',
    icon: HelpCircleIcon,
    activeBg: 'bg-blue-600',
    activeText: 'text-white',
    activeBorder: 'border-blue-600',
    suggestions: ['Demande de renseignement', 'Changement d\'horaire', 'Certificat de scolarité']
  },
  {
    id: 'reclamation',
    label: 'Réclamation',
    icon: AlertTriangleIcon,
    activeBg: 'bg-amber-600',
    activeText: 'text-white',
    activeBorder: 'border-amber-600',
    suggestions: ['Problème de facturation', 'Signalement d\'absence non notée', 'Difficulté pédagogique']
  },
  {
    id: 'remerciement',
    label: 'Remerciement',
    icon: HeartIcon,
    activeBg: 'bg-emerald-600',
    activeText: 'text-white',
    activeBorder: 'border-emerald-600',
    suggestions: ['Remerciements aux enseignants', 'Félicitations pour l\'organisation', 'Message d\'encouragement']
  },
  {
    id: 'suggestion',
    label: 'Suggestion',
    icon: LightbulbIcon,
    activeBg: 'bg-purple-600',
    activeText: 'text-white',
    activeBorder: 'border-purple-600',
    suggestions: ['Idée pour les ateliers', 'Amélioration du portail', 'Activité périscolaire']
  }
]

const selectedCategoryLabel = computed(() => {
  const cat = categories.find(c => c.id === selectedCategory.value)
  return cat ? cat.label : 'Demande'
})

const currentSuggestions = computed(() => {
  const cat = categories.find(c => c.id === selectedCategory.value)
  return cat ? cat.suggestions : []
})

const selectCategory = (cat) => {
  selectedCategory.value = cat.id
}

const applySuggestion = (text) => {
  form.title = text
}

// Extract parent ID from profile or JWT
const loadParentContext = async () => {
  try {
    // 1. Try from JWT payload
    const token = getToken()
    if (token) {
      try {
        const base64Url = token.split('.')[1]
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          const parsed = JSON.parse(jsonPayload)
          if (parsed.parentId || parsed.parent_id) {
            parentId.value = parsed.parentId || parsed.parent_id
          } else if (parsed.id) {
            parentId.value = parsed.id
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // 2. Fetch parent profile to verify parentId & name
    const profile = await getParentProfile()
    if (profile) {
      parentName.value = profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email
      if (profile.parent?.id) {
        parentId.value = profile.parent.id
      } else if (profile.parentId) {
        parentId.value = profile.parentId
      } else if (!parentId.value && profile.id) {
        parentId.value = profile.id
      }
    }
  } catch (err) {
    console.error('Erreur chargement infos parent:', err)
  }
}

const openModal = async () => {
  isOpen.value = true
  isSubmitted.value = false
  error.value = ''
  if (!parentId.value) {
    await loadParentContext()
  }
}

const closeModal = () => {
  isOpen.value = false
}

const resetForm = () => {
  form.title = ''
  form.content = ''
  isSubmitted.value = false
  error.value = ''
}

const resetFormAndClose = () => {
  resetForm()
  closeModal()
}

const handleSubmit = async () => {
  if (!form.title.trim() || !form.content.trim()) {
    error.value = "Veuillez remplir le titre et le contenu de votre message."
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    // Ensure parentId exists
    if (!parentId.value) {
      await loadParentContext()
    }

    // Build payload matching API specification
    const payload = {
      parentId: parentId.value ? Number(parentId.value) : 1,
      title: form.title.trim(),
      content: form.content.trim()
    }

    await sendParentComplaint(payload)
    isSubmitted.value = true
  } catch (err) {
    console.error('Erreur envoi demande:', err)
    error.value = err.response?.data?.message || "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer."
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadParentContext()
})
</script>
