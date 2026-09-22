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
        <div v-if="!child.classes || child.classes.length === 0" class="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-100">
          <CalendarXIcon class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-600 font-medium">Aucune classe associée à cet enfant pour le moment.</p>
        </div>
        <div v-else class="space-y-6">
          <!-- View switcher between Planning de la semaine and Cartes -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-slate-700 px-1">Mode d'affichage :</span>
              <div class="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  @click="classesDisplayMode = 'planning'"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all"
                  :class="classesDisplayMode === 'planning' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'"
                >
                  <CalendarDaysIcon class="w-4 h-4" />
                  <span>Planning de la semaine</span>
                </button>
                <button
                  type="button"
                  @click="classesDisplayMode = 'cards'"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all"
                  :class="classesDisplayMode === 'cards' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'"
                >
                  <LayoutGridIcon class="w-4 h-4" />
                  <span>Cartes des cours</span>
                </button>
              </div>
            </div>

            <div class="text-xs text-slate-500 px-2 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{{ child.classes.length }} cours programmé{{ child.classes.length > 1 ? 's' : '' }}</span>
            </div>
          </div>

          <!-- Weekly Schedule Component -->
          <WeeklySchedule
            v-if="classesDisplayMode === 'planning'"
            :classes="child.classes"
          />

          <!-- Classic Cards Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseCard v-for="c in child.classes" :key="c.id" class="p-6">
              <div class="flex items-start justify-between gap-3 mb-3">
                <h3 class="font-bold text-lg text-slate-800">{{ c.name || 'Classe sans nom' }}</h3>
                <span v-if="c.level" class="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg whitespace-nowrap">
                  {{ c.level }}
                </span>
              </div>
              <div class="space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-3">
                <p v-if="c.teacher" class="flex items-center gap-2">
                  <UserIcon class="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span><strong>Enseignant :</strong> {{ c.teacher.fullName || c.teacher }}</span>
                </p>
                <p v-if="c.room" class="flex items-center gap-2">
                  <MapPinIcon class="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span><strong>Salle :</strong> {{ c.room.name || c.room }}</span>
                </p>
                <p class="flex items-center gap-2">
                  <ClockIcon class="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Horaires :</strong> {{ c.day }} de {{ c.startTime }} à {{ c.endTime }}</span>
                </p>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>

      <!-- Attendance Tab -->
      <div v-if="activeTab === 'attendance'">
        <AttendanceViewer
          :attendanceData="attendanceData"
          :isLoading="isLoadingAttendance"
          :filters="attendanceFilters"
          @update:filters="val => { attendanceFilters = val }"
          @filter="page => fetchAttendance(page)"
          @page-change="page => fetchAttendance(page)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  CalendarDaysIcon, 
  CalendarXIcon, 
  LayoutGridIcon, 
  ClockIcon, 
  UserIcon 
} from 'lucide-vue-next'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import WeeklySchedule from '@/shared/ui/WeeklySchedule.vue'
import AttendanceViewer from '@/shared/ui/AttendanceViewer.vue'
import { getChild, getChildSessions } from '@/services/parentApi.js'

const route = useRoute()
const router = useRouter()
const childId = route.params.id

const isLoading = ref(true)
const error = ref('')
const child = ref(null)

const activeTab = ref('classes')
const classesDisplayMode = ref('planning') // 'planning' | 'cards'

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
