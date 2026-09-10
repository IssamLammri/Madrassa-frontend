<template>
  <div class="max-w-5xl mx-auto w-full">
    <!-- Breadcrumb -->
    <button @click="router.push('/home/children')" class="flex items-center text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
      <ArrowLeftIcon class="w-4 h-4 mr-1" />
      Retour à mes enfants
    </button>

    <BaseAlert v-if="error" type="error" class="mb-6">
      {{ error }}
    </BaseAlert>

    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>

    <div v-else-if="child">
      <!-- Header -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div class="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-3xl flex-shrink-0">
          {{ getInitials(child.fullName) }}
        </div>
        <div class="text-center sm:text-left flex-1">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 class="text-2xl font-bold text-slate-800">{{ child.fullName }}</h1>
            <BaseBadge>{{ child.levelLabel || 'Non assigné' }}</BaseBadge>
          </div>
          <p class="text-slate-600 mb-4">Né(e) le {{ formatDate(child.birthDate) }}</p>
          
          <div class="flex items-start text-sm text-slate-500 gap-2">
            <MapPinIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{{ child.address }}, {{ child.postalCode }} {{ child.city }}</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-200 mb-6">
        <button 
          class="px-6 py-3 font-semibold text-sm border-b-2 transition-colors"
          :class="activeTab === 'classes' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
          @click="activeTab = 'classes'"
        >
          Classes
        </button>
        <button 
          class="px-6 py-3 font-semibold text-sm border-b-2 transition-colors"
          :class="activeTab === 'attendance' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
          @click="activeTab = 'attendance'"
        >
          Présences
        </button>
      </div>

      <!-- Classes Tab -->
      <div v-if="activeTab === 'classes'">
        <div v-if="!child.classes || child.classes.length === 0" class="bg-white p-8 rounded-2xl text-center shadow-sm border border-slate-100">
          <p class="text-slate-600">Aucune classe associée à cet enfant pour le moment.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- We can assume child.classes exists, or fetch them if they are returned by getChild -->
          <BaseCard v-for="c in child.classes" :key="c.id" class="p-6">
            <h3 class="font-bold text-lg text-slate-800 mb-2">{{ c.name || 'Classe sans nom' }}</h3>
            <div class="space-y-2 text-sm text-slate-600">
              <p><strong>Niveau:</strong> {{ c.level }}</p>
              <p v-if="c.teacher"><strong>Enseignant:</strong> {{ c.teacher.fullName }}</p>
              <p v-if="c.room"><strong>Salle:</strong> {{ c.room.name }}</p>
              <p><strong>Horaires:</strong> {{ c.day }} de {{ c.startTime }} à {{ c.endTime }}</p>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Attendance Tab -->
      <div v-if="activeTab === 'attendance'">
        <!-- Filters -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Du</label>
            <input type="date" v-model="attendanceFilters.from" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Au</label>
            <input type="date" v-model="attendanceFilters.to" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
          </div>
          <BaseButton @click="fetchAttendance(1)" variant="secondary" size="sm">Filtrer</BaseButton>
        </div>

        <div v-if="isLoadingAttendance" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        
        <div v-else-if="attendanceData">
          <!-- Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-xl border border-slate-100 text-center">
              <p class="text-xs text-slate-500 uppercase font-bold mb-1">Total</p>
              <p class="text-2xl font-bold text-slate-800">{{ attendanceData.summary?.total || 0 }}</p>
            </div>
            <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
              <p class="text-xs text-emerald-600 uppercase font-bold mb-1">Présent</p>
              <p class="text-2xl font-bold text-emerald-700">{{ attendanceData.summary?.present || 0 }}</p>
            </div>
            <div class="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
              <p class="text-xs text-red-600 uppercase font-bold mb-1">Absent</p>
              <p class="text-2xl font-bold text-red-700">{{ attendanceData.summary?.absent || 0 }}</p>
            </div>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <p class="text-xs text-slate-500 uppercase font-bold mb-1">Non noté</p>
              <p class="text-2xl font-bold text-slate-700">{{ attendanceData.summary?.notMarked || 0 }}</p>
            </div>
          </div>

          <!-- List -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <!-- Desktop Table -->
            <table class="w-full text-left text-sm hidden sm:table">
              <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4">Date et heure</th>
                  <th class="px-6 py-4">Classe</th>
                  <th class="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="attendanceData.items?.length === 0">
                  <td colspan="3" class="px-6 py-8 text-center text-slate-500">Aucune séance trouvée.</td>
                </tr>
                <tr v-for="item in attendanceData.items" :key="item.id" class="hover:bg-slate-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ formatDateTime(item.session?.startTime) }} - {{ formatTime(item.session?.endTime) }}
                  </td>
                  <td class="px-6 py-4">
                    {{ item.session?.class?.name || 'Classe' }}
                  </td>
                  <td class="px-6 py-4">
                    <span v-if="item.status === 'present'" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Présent
                    </span>
                    <span v-else-if="item.status === 'absent'" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Absent
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      Non renseigné
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Mobile List -->
            <div class="sm:hidden divide-y divide-slate-100">
              <div v-if="attendanceData.items?.length === 0" class="px-4 py-8 text-center text-slate-500 text-sm">
                Aucune séance trouvée.
              </div>
              <div v-for="item in attendanceData.items" :key="'mob-'+item.id" class="p-4">
                <div class="flex justify-between items-start mb-2">
                  <div class="font-medium text-slate-800 text-sm">
                    {{ item.session?.class?.name || 'Classe' }}
                  </div>
                  <span v-if="item.status === 'present'" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Présent
                  </span>
                  <span v-else-if="item.status === 'absent'" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Absent
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    Non renseigné
                  </span>
                </div>
                <div class="text-xs text-slate-500">
                  {{ formatDateTime(item.session?.startTime) }} - {{ formatTime(item.session?.endTime) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div class="flex justify-between items-center mt-6" v-if="attendanceData.pagination && attendanceData.pagination.pages > 1">
            <BaseButton 
              variant="secondary" 
              size="sm" 
              :disabled="attendanceData.pagination.page === 1"
              @click="fetchAttendance(attendanceData.pagination.page - 1)"
            >
              Précédent
            </BaseButton>
            <span class="text-sm text-slate-600">
              Page {{ attendanceData.pagination.page }} sur {{ attendanceData.pagination.pages }}
            </span>
            <BaseButton 
              variant="secondary" 
              size="sm" 
              :disabled="attendanceData.pagination.page === attendanceData.pagination.pages"
              @click="fetchAttendance(attendanceData.pagination.page + 1)"
            >
              Suivant
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, MapPinIcon } from 'lucide-vue-next'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import { getChild, getChildSessions } from '@/services/parentApi.js'

const route = useRoute()
const router = useRouter()
const childId = route.params.id

const isLoading = ref(true)
const error = ref('')
const child = ref(null)

const activeTab = ref('classes')

// Attendance state
const isLoadingAttendance = ref(false)
const attendanceData = ref(null)
const attendanceFilters = ref({
  from: '',
  to: ''
})

onMounted(async () => {
  try {
    child.value = await getChild(childId)
    // Pre-fetch attendance data on mount
    await fetchAttendance(1)
  } catch (e) {
    console.error(e)
    error.value = "Impossible de charger les informations de l'enfant."
  } finally {
    isLoading.value = false
  }
})

const fetchAttendance = async (page = 1) => {
  isLoadingAttendance.value = true
  try {
    const params = { page, limit: 20 }
    if (attendanceFilters.value.from) params.from = attendanceFilters.value.from
    if (attendanceFilters.value.to) params.to = attendanceFilters.value.to
    
    attendanceData.value = await getChildSessions(childId, params)
  } catch (e) {
    console.error(e)
  } finally {
    isLoadingAttendance.value = false
  }
}

const getInitials = (name) => {
  if (!name) return 'E'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
