<template>
  <div class="max-w-5xl mx-auto w-full">
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

    <BaseAlert v-if="error" type="error" class="mb-6">
      {{ error }}
    </BaseAlert>

    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>

    <div v-else-if="classes.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
      <h3 class="text-lg font-bold text-slate-800 mb-2">Aucune classe trouvée</h3>
      <p class="text-slate-600">Aucune inscription ne correspond à ce filtre.</p>
    </div>

    <!-- Planning Mode -->
    <WeeklySchedule 
      v-else-if="viewType === 'planning'"
      :classes="classes"
      :showChildName="true"
    />

    <!-- Cards Mode -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BaseCard v-for="item in classes" :key="item.registrationId" class="p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-xl text-slate-800">{{ item.class?.name || 'Classe inconnue' }}</h3>
            <p class="text-emerald-600 font-medium text-sm mt-1">Enfant: {{ item.child?.fullName }}</p>
          </div>
          <BaseBadge :variant="item.active ? 'success' : 'neutral'">
            {{ item.active ? 'Active' : 'Terminée' }}
          </BaseBadge>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase mb-1">Niveau</p>
            <p class="text-slate-800">{{ item.class?.level || '-' }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase mb-1">Type</p>
            <p class="text-slate-800">{{ item.class?.type || '-' }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase mb-1">Horaires</p>
            <p class="text-slate-800">{{ item.class?.day || '-' }} - {{ item.class?.startTime }} à {{ item.class?.endTime }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase mb-1">Année</p>
            <p class="text-slate-800">{{ item.class?.schoolYear || '-' }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase mb-1">Enseignant</p>
            <p class="text-slate-800">{{ item.class?.teacher?.fullName || 'Non assigné' }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase mb-1">Salle</p>
            <p class="text-slate-800">{{ item.class?.room?.name || 'Non assignée' }}</p>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CalendarDaysIcon, LayoutGridIcon } from 'lucide-vue-next'
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
