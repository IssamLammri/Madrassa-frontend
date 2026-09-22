<template>
  <div class="attendance-viewer w-full space-y-6">
    <!-- 1. KPI & ATTENDANCE RATE HERO CARD -->
    <div class="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <!-- Left: Assiduité Gauge & Text -->
        <div class="flex items-center gap-5">
          <!-- Circular Score Badge -->
          <div class="relative flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-md"
            :class="attendanceRate >= 90 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : (attendanceRate >= 75 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-rose-500 to-red-600')"
          >
            <span class="text-2xl tracking-tight leading-none">{{ attendanceRate }}%</span>
            <span class="text-[10px] uppercase font-semibold tracking-wider opacity-90 mt-0.5">Assiduité</span>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-xl font-bold text-slate-900">Bilan des présences</h3>
              <span 
                class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                :class="attendanceRate >= 90 ? 'bg-emerald-100 text-emerald-800' : (attendanceRate >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')"
              >
                <SparklesIcon class="w-3 h-3" />
                {{ attendanceAppreciation }}
              </span>
            </div>
            <p class="text-sm text-slate-500 leading-relaxed">
              {{ summary.present }} séance{{ summary.present > 1 ? 's' : '' }} honorée{{ summary.present > 1 ? 's' : '' }}
              <span v-if="summary.absent > 0">, {{ summary.absent }} absence{{ summary.absent > 1 ? 's' : '' }}</span>
              <span v-if="summary.notMarked > 0"> et {{ summary.notMarked }} en attente d'émargement</span>.
            </p>
          </div>
        </div>

        <!-- Right: Modern Mini Progress Bar & Quick Stats -->
        <div class="w-full lg:w-72 space-y-2">
          <div class="flex justify-between text-xs font-semibold text-slate-500">
            <span>Répartition des séances</span>
            <span>{{ summary.total }} séances</span>
          </div>
          <!-- Segmented Progress Bar -->
          <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            <div 
              v-if="summary.present > 0"
              class="h-full bg-emerald-500 rounded-full transition-all"
              :style="{ width: `${(summary.present / Math.max(1, summary.total)) * 100}%` }"
              title="Présences"
            ></div>
            <div 
              v-if="summary.absent > 0"
              class="h-full bg-rose-500 rounded-full transition-all"
              :style="{ width: `${(summary.absent / Math.max(1, summary.total)) * 100}%` }"
              title="Absences"
            ></div>
            <div 
              v-if="summary.notMarked > 0"
              class="h-full bg-slate-300 rounded-full transition-all"
              :style="{ width: `${(summary.notMarked / Math.max(1, summary.total)) * 100}%` }"
              title="Non noté"
            ></div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-400">
            <span class="flex items-center gap-1 text-emerald-700 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              {{ summary.present }} Présent{{ summary.present > 1 ? 's' : '' }}
            </span>
            <span class="flex items-center gap-1 text-rose-700 font-medium">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              {{ summary.absent }} Absent{{ summary.absent > 1 ? 's' : '' }}
            </span>
            <span class="flex items-center gap-1 text-slate-600 font-medium">
              <span class="w-2 h-2 rounded-full bg-slate-400"></span>
              {{ summary.notMarked }} En attente
            </span>
          </div>
        </div>
      </div>

      <!-- 2. INTERACTIVE STAT CARDS (CLICKABLE FILTERS) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
        <!-- ALL -->
        <button
          type="button"
          @click="statusFilter = 'all'"
          class="text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden"
          :class="statusFilter === 'all' 
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10' 
            : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/60 text-slate-800'"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs uppercase font-bold tracking-wider opacity-75">Total</span>
            <LayersIcon class="w-4 h-4 opacity-60" />
          </div>
          <p class="text-2xl sm:text-3xl font-black">{{ summary.total }}</p>
          <span class="text-[11px] opacity-70 mt-1 block">Toutes les séances</span>
        </button>

        <!-- PRÉSENT -->
        <button
          type="button"
          @click="statusFilter = 'present'"
          class="text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden"
          :class="statusFilter === 'present' 
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20' 
            : 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100 text-emerald-950'"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs uppercase font-bold tracking-wider" :class="statusFilter === 'present' ? 'text-white' : 'text-emerald-700'">Présent</span>
            <CheckCircle2Icon class="w-4 h-4" :class="statusFilter === 'present' ? 'text-white' : 'text-emerald-600'" />
          </div>
          <p class="text-2xl sm:text-3xl font-black" :class="statusFilter === 'present' ? 'text-white' : 'text-emerald-700'">{{ summary.present }}</p>
          <span class="text-[11px] opacity-80 mt-1 block">Séances validées</span>
        </button>

        <!-- ABSENT -->
        <button
          type="button"
          @click="statusFilter = 'absent'"
          class="text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden"
          :class="statusFilter === 'absent' 
            ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-600/20' 
            : 'bg-rose-50/50 hover:bg-rose-50 border-rose-100 text-rose-950'"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs uppercase font-bold tracking-wider" :class="statusFilter === 'absent' ? 'text-white' : 'text-rose-700'">Absent</span>
            <XCircleIcon class="w-4 h-4" :class="statusFilter === 'absent' ? 'text-white' : 'text-rose-600'" />
          </div>
          <p class="text-2xl sm:text-3xl font-black" :class="statusFilter === 'absent' ? 'text-white' : 'text-rose-700'">{{ summary.absent }}</p>
          <span class="text-[11px] opacity-80 mt-1 block">Manquées</span>
        </button>

        <!-- NON NOTÉ -->
        <button
          type="button"
          @click="statusFilter = 'not_marked'"
          class="text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden"
          :class="statusFilter === 'not_marked' 
            ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-600/20' 
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs uppercase font-bold tracking-wider" :class="statusFilter === 'not_marked' ? 'text-white' : 'text-slate-600'">En attente</span>
            <ClockIcon class="w-4 h-4" :class="statusFilter === 'not_marked' ? 'text-white' : 'text-slate-400'" />
          </div>
          <p class="text-2xl sm:text-3xl font-black">{{ summary.notMarked }}</p>
          <span class="text-[11px] opacity-70 mt-1 block">Non renseigné</span>
        </button>
      </div>
    </div>

    <!-- 3. MODERN FILTER BAR & VIEW SWITCHER -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Date Pickers -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wide">Du</label>
            <input 
              type="date" 
              v-model="localFilters.from" 
              class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wide">Au</label>
            <input 
              type="date" 
              v-model="localFilters.to" 
              class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
          <button
            type="button"
            @click="applyDateFilter"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
          >
            Filtrer
          </button>
          <button
            v-if="localFilters.from || localFilters.to"
            type="button"
            @click="resetDateFilter"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Réinitialiser les dates"
          >
            <RotateCcwIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Class Quick Filter & View Mode Switcher -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Class dropdown filter if multiple classes -->
          <div v-if="availableClasses.length > 1" class="relative">
            <select
              v-model="selectedClassFilter"
              class="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-xl text-xs sm:text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Toutes les classes</option>
              <option v-for="c in availableClasses" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
            <ChevronDownIcon class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <!-- View Mode: Timeline / Cards vs Table -->
          <div class="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              type="button"
              @click="displayView = 'timeline'"
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all"
              :class="displayView === 'timeline' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'"
              title="Affichage cartes chronologiques"
            >
              <LayoutListIcon class="w-3.5 h-3.5" />
              <span>Chronologie</span>
            </button>
            <button
              type="button"
              @click="displayView = 'table'"
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all"
              :class="displayView === 'table' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'"
              title="Affichage tableau épuré"
            >
              <TableIcon class="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Active Filter Chips Reminder -->
      <div v-if="statusFilter !== 'all' || selectedClassFilter !== 'all'" class="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span>Filtres actifs :</span>
        <span v-if="statusFilter !== 'all'" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
          Statut : {{ statusFilter === 'present' ? 'Présents' : (statusFilter === 'absent' ? 'Absents' : 'En attente') }}
          <button @click="statusFilter = 'all'" class="hover:text-slate-900">×</button>
        </span>
        <span v-if="selectedClassFilter !== 'all'" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
          Classe : {{ selectedClassFilter }}
          <button @click="selectedClassFilter = 'all'" class="hover:text-slate-900">×</button>
        </span>
        <button @click="resetAllFilters" class="text-emerald-600 hover:underline font-semibold ml-auto">
          Tout réinitialiser
        </button>
      </div>
    </div>

    <!-- 4. LOADING STATE -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-100">
      <div class="animate-spin rounded-full h-10 w-10 border-3 border-emerald-600 border-t-transparent mb-3"></div>
      <p class="text-sm font-medium text-slate-500">Chargement des séances...</p>
    </div>

    <!-- 5. EMPTY STATE -->
    <div v-else-if="filteredItems.length === 0" class="bg-white p-12 rounded-3xl text-center shadow-xs border border-slate-100">
      <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <CalendarX2Icon class="w-7 h-7" />
      </div>
      <h3 class="text-base font-bold text-slate-800 mb-1">Aucune séance trouvée</h3>
      <p class="text-sm text-slate-500 max-w-md mx-auto">
        Aucun enregistrement ne correspond aux critères sélectionnés. Essayez de réinitialiser vos filtres.
      </p>
      <button
        type="button"
        @click="resetAllFilters"
        class="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </div>

    <!-- 6. DISPLAY VIEW: TIMELINE / CHRONOLOGIE GROUPÉE PAR MOIS -->
    <div v-else-if="displayView === 'timeline'" class="space-y-6">
      <div 
        v-for="group in groupedSessionsByMonth" 
        :key="group.monthKey"
        class="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80"
      >
        <!-- Month Group Header -->
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
            <h4 class="font-bold text-lg text-slate-800 capitalize">{{ group.monthLabel }}</h4>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            {{ group.items.length }} séance{{ group.items.length > 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Sessions in this month -->
        <div class="space-y-3">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-sm"
            :class="getItemBorderBgClass(item.status)"
          >
            <!-- Left: Date block + Class details -->
            <div class="flex items-start sm:items-center gap-4">
              <!-- Date Badge Box -->
              <div class="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
                <span class="text-[10px] uppercase font-bold text-slate-400 leading-none">{{ formatDayName(item.session?.startTime) }}</span>
                <span class="text-lg font-black text-slate-800 leading-tight">{{ formatDayNumber(item.session?.startTime) }}</span>
              </div>

              <!-- Class Name & Time -->
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h5 class="font-bold text-base text-slate-900">{{ item.session?.class?.name || 'Classe' }}</h5>
                  <span v-if="item.session?.class?.level" class="text-[11px] font-semibold px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md">
                    {{ item.session.class.level }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span class="flex items-center gap-1 font-medium">
                    <ClockIcon class="w-3.5 h-3.5 text-slate-400" />
                    {{ formatTime(item.session?.startTime) }} - {{ formatTime(item.session?.endTime) }}
                  </span>
                  <span class="opacity-40">•</span>
                  <span>{{ formatFullDateString(item.session?.startTime) }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Status Badge -->
            <div class="mt-3 sm:mt-0 flex items-center gap-2">
              <!-- PRESENT -->
              <div 
                v-if="item.status === 'present'"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-2xs"
              >
                <CheckCircle2Icon class="w-4 h-4 text-emerald-600" />
                <span>Présent</span>
              </div>

              <!-- ABSENT -->
              <div 
                v-else-if="item.status === 'absent'"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200/80 shadow-2xs"
              >
                <XCircleIcon class="w-4 h-4 text-rose-600" />
                <span>Absent</span>
              </div>

              <!-- NOT MARKED -->
              <div 
                v-else
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
              >
                <ClockIcon class="w-4 h-4 text-slate-400" />
                <span>Non renseigné</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 7. DISPLAY VIEW: TABLEAU MODERNE -->
    <div v-else class="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Horaires</th>
              <th class="px-6 py-4">Classe</th>
              <th class="px-6 py-4 text-right">Statut de présence</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="item in filteredItems" 
              :key="'tbl-' + item.id" 
              class="hover:bg-slate-50/80 transition-colors"
            >
              <!-- Date with Day of Week -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center font-bold text-xs">
                    {{ formatDayNumber(item.session?.startTime) }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 capitalize">{{ formatDayName(item.session?.startTime) }}</p>
                    <p class="text-xs text-slate-500">{{ formatMonthYear(item.session?.startTime) }}</p>
                  </div>
                </div>
              </td>

              <!-- Time -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  <ClockIcon class="w-3.5 h-3.5 text-slate-400" />
                  {{ formatTime(item.session?.startTime) }} - {{ formatTime(item.session?.endTime) }}
                </span>
              </td>

              <!-- Class -->
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800">
                  {{ item.session?.class?.name || 'Classe' }}
                </div>
                <div v-if="item.session?.class?.level" class="text-xs text-slate-500">
                  {{ item.session.class.level }}
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <span 
                  v-if="item.status === 'present'"
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                >
                  <CheckCircle2Icon class="w-3.5 h-3.5 text-emerald-600" />
                  Présent
                </span>
                <span 
                  v-else-if="item.status === 'absent'"
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200/60"
                >
                  <XCircleIcon class="w-3.5 h-3.5 text-rose-600" />
                  Absent
                </span>
                <span 
                  v-else
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <ClockIcon class="w-3.5 h-3.5 text-slate-400" />
                  Non renseigné
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 8. PAGINATION -->
    <div 
      v-if="pagination && pagination.pages > 1" 
      class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-2xs"
    >
      <span class="text-xs sm:text-sm text-slate-600 font-medium">
        Page <strong class="text-slate-900">{{ pagination.page }}</strong> sur <strong class="text-slate-900">{{ pagination.pages }}</strong> ({{ pagination.total }} séances au total)
      </span>
      <div class="flex items-center gap-2">
        <button 
          type="button"
          :disabled="pagination.page === 1"
          @click="$emit('page-change', pagination.page - 1)"
          class="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700"
        >
          Précédent
        </button>
        <button 
          type="button"
          :disabled="pagination.page === pagination.pages"
          @click="$emit('page-change', pagination.page + 1)"
          class="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700"
        >
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
  LayersIcon,
  RotateCcwIcon,
  LayoutListIcon,
  TableIcon,
  CalendarX2Icon,
  ChevronDownIcon
} from 'lucide-vue-next'

const props = defineProps({
  attendanceData: {
    type: Object,
    default: () => ({
      items: [],
      summary: { total: 0, present: 0, absent: 0, notMarked: 0 },
      pagination: { page: 1, pages: 1, total: 0 }
    })
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    default: () => ({ from: '', to: '' })
  }
})

const emit = defineEmits(['filter', 'page-change', 'update:filters'])

// Local state
const displayView = ref('timeline') // 'timeline' | 'table'
const statusFilter = ref('all') // 'all' | 'present' | 'absent' | 'not_marked'
const selectedClassFilter = ref('all')

const localFilters = reactive({
  from: props.filters.from || '',
  to: props.filters.to || ''
})

watch(() => props.filters, (newVal) => {
  localFilters.from = newVal.from || ''
  localFilters.to = newVal.to || ''
}, { deep: true })

const summary = computed(() => {
  return props.attendanceData?.summary || { total: 0, present: 0, absent: 0, notMarked: 0 }
})

const pagination = computed(() => {
  return props.attendanceData?.pagination || { page: 1, pages: 1, total: 0 }
})

const rawItems = computed(() => {
  return props.attendanceData?.items || []
})

// Calculate Attendance Rate %
const attendanceRate = computed(() => {
  const present = summary.value.present || 0
  const absent = summary.value.absent || 0
  const evaluated = present + absent
  if (evaluated > 0) {
    return Math.round((present / evaluated) * 100)
  }
  const total = summary.value.total || 0
  if (total > 0) {
    return Math.round((present / total) * 100)
  }
  return 100
})

const attendanceAppreciation = computed(() => {
  const rate = attendanceRate.value
  if (rate >= 95) return 'Excellente assiduité'
  if (rate >= 80) return 'Très bonne régularité'
  if (rate >= 60) return 'Assiduité moyenne'
  return 'À surveiller'
})

// Unique classes for filter dropdown
const availableClasses = computed(() => {
  const set = new Set()
  rawItems.value.forEach(item => {
    if (item.session?.class?.name) {
      set.add(item.session.class.name)
    }
  })
  return Array.from(set)
})

// Filtered items based on statusFilter and selectedClassFilter
const filteredItems = computed(() => {
  return rawItems.value.filter(item => {
    // Status filter
    if (statusFilter.value === 'present' && item.status !== 'present') return false
    if (statusFilter.value === 'absent' && item.status !== 'absent') return false
    if (statusFilter.value === 'not_marked' && (item.status === 'present' || item.status === 'absent')) return false

    // Class filter
    if (selectedClassFilter.value !== 'all' && item.session?.class?.name !== selectedClassFilter.value) {
      return false
    }

    return true
  })
})

// Group sessions by month (Year-Month)
const groupedSessionsByMonth = computed(() => {
  const groupsMap = new Map()

  filteredItems.value.forEach(item => {
    const rawDate = item.session?.startTime
    let monthKey = 'inconnu'
    let monthLabel = 'Date non définie'

    if (rawDate) {
      const d = new Date(rawDate)
      if (!isNaN(d)) {
        monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthLabel = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      }
    }

    if (!groupsMap.has(monthKey)) {
      groupsMap.set(monthKey, {
        monthKey,
        monthLabel,
        items: []
      })
    }

    groupsMap.get(monthKey).items.push(item)
  })

  // Convert to array
  return Array.from(groupsMap.values())
})

// Card border & background helper
const getItemBorderBgClass = (status) => {
  if (status === 'present') {
    return 'bg-emerald-50/25 border-emerald-100 hover:border-emerald-300'
  }
  if (status === 'absent') {
    return 'bg-rose-50/25 border-rose-100 hover:border-rose-300'
  }
  return 'bg-white border-slate-100 hover:border-slate-300'
}

// Date helpers
const formatDayName = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
}

const formatDayNumber = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d)) return '-'
  return d.getDate()
}

const formatMonthYear = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

const formatFullDateString = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const applyDateFilter = () => {
  emit('update:filters', { ...localFilters })
  emit('filter', 1)
}

const resetDateFilter = () => {
  localFilters.from = ''
  localFilters.to = ''
  emit('update:filters', { from: '', to: '' })
  emit('filter', 1)
}

const resetAllFilters = () => {
  statusFilter.value = 'all'
  selectedClassFilter.value = 'all'
  resetDateFilter()
}
</script>
