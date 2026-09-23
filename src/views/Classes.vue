<template>
  <div class="max-w-6xl mx-auto w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Classes</h1>
        <p class="text-slate-600 mt-1">Consultez les classes et l'emploi du temps de vos enfants.</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- View mode toggle: Planning vs List -->
        <div class="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <button
            type="button"
            @click="viewType = 'planning'"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all"
            :class="viewType === 'planning' 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'"
          >
            <CalendarDaysIcon class="w-4 h-4" />
            <span>Planning</span>
          </button>
          <button
            type="button"
            @click="viewType = 'cards'"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all"
            :class="viewType === 'cards' 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'"
          >
            <LayoutGridIcon class="w-4 h-4" />
            <span>Liste</span>
          </button>
        </div>

        <!-- Active/Past Filter -->
        <div class="flex items-center gap-1 text-sm bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button 
            @click="setActiveFilter(true)" 
            class="px-3.5 py-1.5 rounded-lg transition-colors text-xs sm:text-sm"
            :class="isActiveFilter ? 'bg-slate-100 font-semibold text-slate-800' : 'text-slate-500 hover:text-slate-700'"
          >
            Actives
          </button>
          <button 
            @click="setActiveFilter(false)" 
            class="px-3.5 py-1.5 rounded-lg transition-colors text-xs sm:text-sm"
            :class="!isActiveFilter ? 'bg-slate-100 font-semibold text-slate-800' : 'text-slate-500 hover:text-slate-700'"
          >
            Anciennes
          </button>
        </div>
      </div>
    </div>

    <!-- Child Filter Toolbar (if parent has multiple children) -->
    <div 
      v-if="availableChildren.length > 1" 
      class="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2"
    >
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1.5">
        <UsersIcon class="w-4 h-4 text-emerald-600" />
        Filtrer par enfant :
      </span>

      <!-- All Children Button -->
      <button
        type="button"
        @click="selectedChildId = 'all'"
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all"
        :class="selectedChildId === 'all' 
          ? 'bg-slate-900 text-white shadow-xs' 
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
      >
        <span>Tous les enfants</span>
        <span 
          class="text-[11px] px-1.5 py-0.2 rounded-full font-bold"
          :class="selectedChildId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
        >
          {{ classes.length }}
        </span>
      </button>

      <!-- Individual Child Buttons with Color Badges -->
      <button
        v-for="child in availableChildren"
        :key="child.id"
        type="button"
        @click="selectedChildId = child.id"
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all"
        :class="selectedChildId === child.id 
          ? 'bg-emerald-600 text-white shadow-xs' 
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
      >
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="child.dotClass"></span>
        <span>{{ child.fullName }}</span>
        <span 
          class="text-[11px] px-1.5 py-0.2 rounded-full font-bold"
          :class="selectedChildId === child.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
        >
          {{ child.count }}
        </span>
      </button>
    </div>

    <!-- Alert / Errors -->
    <BaseAlert v-if="error" type="error">
      {{ error }}
    </BaseAlert>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredClasses.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
      <h3 class="text-lg font-bold text-slate-800 mb-2">Aucune classe trouvée</h3>
      <p class="text-slate-600">Aucune inscription ne correspond à cette sélection.</p>
    </div>

    <!-- 1. Planning Mode -->
    <WeeklySchedule 
      v-else-if="viewType === 'planning'"
      :classes="filteredClasses"
      :showChildName="true"
    />

    <!-- 2. Cards / Liste Mode -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <BaseCard 
        v-for="item in filteredClasses" 
        :key="item.registrationId || item.id" 
        class="p-6 flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200/80"
      >
        <div>
          <!-- Header: Child name + status badge -->
          <div class="flex justify-between items-start gap-2 mb-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
              <span class="w-2 h-2 rounded-full" :class="getChildDotClass(item.child?.id)"></span>
              {{ item.child?.fullName || 'Élève' }}
            </span>
            <BaseBadge :variant="item.active ? 'success' : 'neutral'">
              {{ item.active ? 'Active' : 'Terminée' }}
            </BaseBadge>
          </div>

          <!-- Class Title -->
          <h3 class="font-bold text-xl text-slate-900 mb-1">
            {{ item.class?.name || item.name || 'Classe sans nom' }}
          </h3>

          <p class="text-xs font-semibold text-emerald-700 mb-4">
            {{ item.class?.speciality || item.class?.type || 'Programme régulier' }}
            <span v-if="item.class?.schoolYear"> • {{ item.class?.schoolYear }}</span>
          </p>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 mb-4">
            <div>
              <p class="text-slate-400 font-semibold uppercase text-[10px] mb-0.5">Niveau</p>
              <p class="text-slate-800 font-bold">{{ item.class?.level || '-' }}</p>
            </div>
            <div>
              <p class="text-slate-400 font-semibold uppercase text-[10px] mb-0.5">Jour & Heure</p>
              <p class="text-slate-800 font-bold flex items-center gap-1">
                <ClockIcon class="w-3 h-3 text-slate-500" />
                {{ item.class?.day }} {{ item.class?.startTime }}-{{ item.class?.endTime }}
              </p>
            </div>
            <div>
              <p class="text-slate-400 font-semibold uppercase text-[10px] mb-0.5">Salle</p>
              <p class="text-slate-800 font-medium flex items-center gap-1">
                <MapPinIcon class="w-3 h-3 text-slate-400" />
                {{ item.class?.room?.name || 'Non assignée' }}
              </p>
            </div>
            <div>
              <p class="text-slate-400 font-semibold uppercase text-[10px] mb-0.5">Enseignant</p>
              <p class="text-slate-800 font-medium flex items-center gap-1 truncate">
                <UserIcon class="w-3 h-3 text-slate-400" />
                <span class="truncate">{{ item.class?.teacher?.fullName || 'Non assigné' }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- WhatsApp Link Button if available -->
        <div v-if="item.class?.whatsappUrl || item.whatsappUrl" class="pt-3 border-t border-slate-100">
          <a
            :href="item.class?.whatsappUrl || item.whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Groupe WhatsApp</span>
          </a>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CalendarDaysIcon,
  LayoutGridIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon
} from 'lucide-vue-next'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import WeeklySchedule from '@/shared/ui/WeeklySchedule.vue'
import { getClasses } from '@/services/parentApi.js'

const isLoading = ref(true)
const error = ref('')
const classes = ref([])
const isActiveFilter = ref(true)
const viewType = ref('planning') // 'planning' | 'cards'
const selectedChildId = ref('all')

const dotColors = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-purple-500'
]

// Extract distinct children
const availableChildren = computed(() => {
  const map = new Map()
  let idx = 0
  classes.value.forEach(item => {
    const child = item.child
    if (child && child.id && !map.has(child.id)) {
      map.set(child.id, {
        id: child.id,
        fullName: child.fullName || `${child.firstName || ''} ${child.lastName || ''}`.trim(),
        count: classes.value.filter(c => c.child?.id === child.id).length,
        dotClass: dotColors[idx % dotColors.length]
      })
      idx++
    }
  })
  return Array.from(map.values())
})

const getChildDotClass = (childId) => {
  const found = availableChildren.value.find(c => c.id === childId)
  return found ? found.dotClass : 'bg-emerald-500'
}

// Filtered classes according to selected child
const filteredClasses = computed(() => {
  if (selectedChildId.value === 'all') {
    return classes.value
  }
  return classes.value.filter(c => c.child?.id === selectedChildId.value)
})

const fetchClasses = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const data = await getClasses({ active: isActiveFilter.value })
    classes.value = data.items || []
  } catch (e) {
    console.error(e)
    error.value = "Impossible de charger les classes."
  } finally {
    isLoading.value = false
  }
}

const setActiveFilter = (val) => {
  if (isActiveFilter.value !== val) {
    isActiveFilter.value = val
    fetchClasses()
  }
}

onMounted(() => {
  fetchClasses()
})
</script>
