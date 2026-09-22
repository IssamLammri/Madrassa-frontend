<template>
  <div class="weekly-schedule w-full">
    <!-- Header / Stats / View Controls -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Stats Summary -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-medium border border-emerald-100/80">
            <BookOpenIcon class="w-4 h-4 text-emerald-600" />
            <span><strong>{{ parsedClasses.length }}</strong> cours / semaine</span>
          </div>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-800 rounded-xl font-medium border border-sky-100/80">
            <ClockIcon class="w-4 h-4 text-sky-600" />
            <span><strong>{{ totalWeeklyHoursFormatted }}</strong> au total</span>
          </div>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-medium">
            <CalendarDaysIcon class="w-4 h-4 text-slate-500" />
            <span><strong>{{ activeDaysCount }}</strong> {{ activeDaysCount > 1 ? 'jours actifs' : 'jour actif' }}</span>
          </div>
        </div>

        <!-- Controls: View mode + Filter empty days -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <!-- Toggle Hide Empty Days -->
          <button
            type="button"
            @click="hideEmptyDays = !hideEmptyDays"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl border transition-all"
            :class="hideEmptyDays 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
            title="Afficher uniquement les jours avec des cours"
          >
            <FilterIcon class="w-3.5 h-3.5" />
            <span>{{ hideEmptyDays ? 'Jours avec cours' : 'Tous les 7 jours' }}</span>
          </button>

          <!-- View Switcher (Grid vs Day-by-Day Agenda) -->
          <div class="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              @click="viewMode = 'grid'"
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-all"
              :class="viewMode === 'grid' 
                ? 'bg-white text-slate-900 shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-900'"
            >
              <LayoutGridIcon class="w-3.5 h-3.5" />
              <span>Grille horaire</span>
            </button>
            <button
              type="button"
              @click="viewMode = 'agenda'"
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-all"
              :class="viewMode === 'agenda' 
                ? 'bg-white text-slate-900 shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-900'"
            >
              <CalendarIcon class="w-3.5 h-3.5" />
              <span>Vue par jour</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State if no classes -->
    <div v-if="parsedClasses.length === 0" class="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-100">
      <CalendarXIcon class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <h3 class="text-base font-bold text-slate-800 mb-1">Aucun cours dans le planning</h3>
      <p class="text-sm text-slate-500">Aucun créneau d'enseignement n'a été programmé pour le moment.</p>
    </div>

    <!-- MODE 1: TIMETABLE GRID (Grille horaire) -->
    <div v-else-if="viewMode === 'grid'" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Desktop & Tablet Horizontally scrollable wrapper -->
      <div class="overflow-x-auto">
        <div class="min-w-[720px]">
          <!-- Grid Header (Days) -->
          <div class="grid border-b border-slate-200 bg-slate-50/80" :style="gridColumnsStyle">
            <!-- Time Column Header -->
            <div class="py-3 px-2 sm:px-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 border-r border-slate-200">
              Heure
            </div>

            <!-- Day Headers -->
            <div
              v-for="day in displayedDays"
              :key="'hdr-' + day.id"
              class="py-3 px-2 sm:px-3 text-center border-r last:border-r-0 border-slate-200"
              :class="day.classes.length > 0 ? 'bg-emerald-50/40' : ''"
            >
              <div class="flex items-center justify-center gap-1.5">
                <span class="text-xs sm:text-sm font-bold text-slate-800">{{ day.label }}</span>
                <span
                  v-if="day.classes.length > 0"
                  class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold bg-emerald-600 text-white"
                >
                  {{ day.classes.length }}
                </span>
              </div>
              <p v-if="day.classes.length > 0" class="text-[11px] text-emerald-700 font-medium mt-0.5">
                {{ day.totalHoursFormatted }}
              </p>
              <p v-else class="text-[11px] text-slate-400 mt-0.5">
                Aucun cours
              </p>
            </div>
          </div>

          <!-- Grid Body (Hours & Schedule Canvas) -->
          <div class="relative" :style="{ height: `${gridTotalHeight}px` }">
            <!-- Background Hour Rows -->
            <div
              v-for="hour in gridHours"
              :key="'row-' + hour"
              class="absolute left-0 right-0 border-b border-slate-100 flex items-start"
              :style="{ top: `${(hour - minHour) * hourHeight}px`, height: `${hourHeight}px` }"
            >
              <div class="w-16 sm:w-20 pr-2 pt-1 text-right text-[11px] font-semibold text-slate-400 border-r border-slate-200 select-none">
                {{ formatHourLabel(hour) }}
              </div>
              <div class="flex-1 h-full"></div>
            </div>

            <!-- Column Lines & Course Blocks -->
            <div class="absolute inset-0 grid" :style="gridColumnsStyle">
              <!-- Blank for Time Column -->
              <div class="border-r border-slate-200 h-full"></div>

              <!-- Day Columns -->
              <div
                v-for="day in displayedDays"
                :key="'col-' + day.id"
                class="relative border-r last:border-r-0 border-slate-200/80 h-full p-1"
              >
                <!-- Render Each Course Block in Day -->
                <div
                  v-for="item in day.classes"
                  :key="item.id"
                  @click="openDetails(item)"
                  class="absolute inset-x-1 rounded-xl p-2.5 sm:p-3 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 z-10 flex flex-col justify-between overflow-hidden border border-l-4"
                  :class="getColorClass(item.colorIndex)"
                  :style="getBlockPosition(item)"
                  :title="`${item.name} (${item.startTime} - ${item.endTime})`"
                >
                  <div>
                    <!-- Time & Duration pill -->
                    <div class="flex items-center justify-between gap-1 mb-1">
                      <span class="inline-flex items-center gap-1 text-[11px] font-bold tracking-tight">
                        <ClockIcon class="w-3 h-3 flex-shrink-0" />
                        {{ item.cleanStartTime }} - {{ item.cleanEndTime }}
                      </span>
                      <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/70 shadow-2xs">
                        {{ item.durationFormatted }}
                      </span>
                    </div>

                    <!-- Class Name -->
                    <h4 class="font-bold text-xs sm:text-sm leading-snug line-clamp-2">
                      {{ item.name }}
                    </h4>

                    <!-- Child name if requested -->
                    <p v-if="showChildName && item.childName" class="text-[11px] font-semibold text-emerald-800 mt-0.5 truncate">
                      {{ item.childName }}
                    </p>
                  </div>

                  <!-- Details (Salle, Enseignant, Niveau) -->
                  <div class="mt-1 pt-1 border-t border-black/5 text-[10px] sm:text-[11px] space-y-0.5">
                    <div v-if="item.level" class="font-medium truncate">
                      <span class="opacity-75">Niveau:</span> {{ item.level }}
                    </div>
                    <div v-if="item.roomName" class="flex items-center gap-1 truncate">
                      <MapPinIcon class="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                      <span class="truncate">{{ item.roomName }}</span>
                    </div>
                    <div v-if="item.teacherName" class="flex items-center gap-1 truncate">
                      <UserIcon class="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                      <span class="truncate">{{ item.teacherName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODE 2: AGENDA / VUE PAR JOUR -->
    <div v-else class="space-y-6">
      <!-- Quick Day Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
        <button
          type="button"
          @click="selectedAgendaDay = 'all'"
          class="px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap"
          :class="selectedAgendaDay === 'all' 
            ? 'bg-slate-800 text-white font-bold shadow-xs' 
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          Tous les jours ({{ parsedClasses.length }})
        </button>

        <button
          v-for="day in filteredAgendaDays"
          :key="'tab-' + day.id"
          type="button"
          @click="selectedAgendaDay = day.id"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap"
          :class="selectedAgendaDay === day.id 
            ? 'bg-emerald-600 text-white font-bold shadow-xs' 
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>{{ day.label }}</span>
          <span 
            class="px-1.5 py-0.2 rounded-full text-xs"
            :class="selectedAgendaDay === day.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'"
          >
            {{ day.classes.length }}
          </span>
        </button>
      </div>

      <!-- Days List -->
      <div class="space-y-5">
        <div
          v-for="day in activeAgendaDays"
          :key="'agenda-day-' + day.id"
          class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100"
        >
          <!-- Day Header -->
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                {{ day.short }}
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-800">{{ day.label }}</h3>
                <p class="text-xs text-slate-500">{{ day.classes.length }} cours programmé{{ day.classes.length > 1 ? 's' : '' }} • {{ day.totalHoursFormatted }}</p>
              </div>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              Planning hebdomadaire
            </span>
          </div>

          <!-- Day Courses List -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="item in day.classes"
              :key="'ag-card-' + item.id"
              @click="openDetails(item)"
              class="rounded-xl p-4 sm:p-5 border border-l-4 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
              :class="getColorClass(item.colorIndex)"
            >
              <div>
                <div class="flex justify-between items-start gap-2 mb-2">
                  <span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-white/80 shadow-2xs">
                    <ClockIcon class="w-3.5 h-3.5" />
                    {{ item.cleanStartTime }} à {{ item.cleanEndTime }}
                  </span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded bg-black/5">
                    {{ item.durationFormatted }}
                  </span>
                </div>

                <h4 class="font-bold text-base sm:text-lg mb-1 leading-snug">
                  {{ item.name }}
                </h4>

                <p v-if="showChildName && item.childName" class="text-xs font-semibold text-emerald-800 mb-2">
                  Élève : {{ item.childName }}
                </p>
              </div>

              <div class="mt-4 pt-3 border-t border-black/5 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <span class="text-slate-500 font-medium block text-[11px] uppercase tracking-wide">Niveau</span>
                  <span class="font-semibold">{{ item.level || 'Non spécifié' }}</span>
                </div>
                <div>
                  <span class="text-slate-500 font-medium block text-[11px] uppercase tracking-wide">Salle</span>
                  <span class="font-semibold flex items-center gap-1">
                    <MapPinIcon class="w-3 h-3 flex-shrink-0 opacity-70" />
                    {{ item.roomName || 'Salle non assignée' }}
                  </span>
                </div>
                <div class="col-span-2 mt-1">
                  <span class="text-slate-500 font-medium block text-[11px] uppercase tracking-wide">Enseignant</span>
                  <span class="font-semibold flex items-center gap-1">
                    <UserIcon class="w-3 h-3 flex-shrink-0 opacity-70" />
                    {{ item.teacherName || 'Non assigné' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL / DETAIL DIALOG -->
    <div
      v-if="selectedClass"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      @click.self="selectedClass = null"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 mb-2">
              <CalendarIcon class="w-3.5 h-3.5" />
              {{ selectedClass.dayLabel }}
            </span>
            <h3 class="text-xl sm:text-2xl font-bold text-slate-800">
              {{ selectedClass.name }}
            </h3>
            <p v-if="showChildName && selectedClass.childName" class="text-sm font-semibold text-emerald-600 mt-1">
              Enfant : {{ selectedClass.childName }}
            </p>
          </div>
          <button
            type="button"
            @click="selectedClass = null"
            class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <XIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase mb-1">Horaires</p>
            <p class="font-bold text-slate-800 flex items-center gap-1.5">
              <ClockIcon class="w-4 h-4 text-emerald-600" />
              {{ selectedClass.cleanStartTime }} à {{ selectedClass.cleanEndTime }}
            </p>
            <p class="text-xs text-slate-500 mt-0.5 font-medium">Durée : {{ selectedClass.durationFormatted }}</p>
          </div>

          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase mb-1">Niveau</p>
            <p class="font-bold text-slate-800">{{ selectedClass.level || 'Non spécifié' }}</p>
          </div>

          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase mb-1">Salle</p>
            <p class="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPinIcon class="w-4 h-4 text-slate-600" />
              {{ selectedClass.roomName || 'Non assignée' }}
            </p>
          </div>

          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase mb-1">Enseignant</p>
            <p class="font-bold text-slate-800 flex items-center gap-1.5">
              <UserIcon class="w-4 h-4 text-slate-600" />
              {{ selectedClass.teacherName || 'Non assigné' }}
            </p>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            @click="selectedClass = null"
            class="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CalendarIcon,
  CalendarDaysIcon,
  CalendarXIcon,
  ClockIcon,
  BookOpenIcon,
  LayoutGridIcon,
  MapPinIcon,
  UserIcon,
  FilterIcon,
  XIcon
} from 'lucide-vue-next'

const props = defineProps({
  classes: {
    type: Array,
    default: () => []
  },
  showChildName: {
    type: Boolean,
    default: false
  }
})

// View state
const viewMode = ref('grid') // 'grid' | 'agenda'
const hideEmptyDays = ref(true) // default to true so days with courses are emphasized in full width
const selectedAgendaDay = ref('all')
const selectedClass = ref(null)

const hourHeight = 60 // px per hour in grid

// Days of week definition
const DAYS_DEF = [
  { id: 'lundi', label: 'Lundi', short: 'Lun', order: 1 },
  { id: 'mardi', label: 'Mardi', short: 'Mar', order: 2 },
  { id: 'mercredi', label: 'Mercredi', short: 'Mer', order: 3 },
  { id: 'jeudi', label: 'Jeudi', short: 'Jeu', order: 4 },
  { id: 'vendredi', label: 'Vendredi', short: 'Ven', order: 5 },
  { id: 'samedi', label: 'Samedi', short: 'Sam', order: 6 },
  { id: 'dimanche', label: 'Dimanche', short: 'Dim', order: 7 }
]

// Normalization function for days
const normalizeDay = (dayStr) => {
  if (!dayStr) return 'lundi'
  const str = String(dayStr).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (str.startsWith('lun') || str.startsWith('mon')) return 'lundi'
  if (str.startsWith('mar') || str.startsWith('tue')) return 'mardi'
  if (str.startsWith('mer') || str.startsWith('wed')) return 'mercredi'
  if (str.startsWith('jeu') || str.startsWith('thu')) return 'jeudi'
  if (str.startsWith('ven') || str.startsWith('fri')) return 'vendredi'
  if (str.startsWith('sam') || str.startsWith('sat')) return 'samedi'
  if (str.startsWith('dim') || str.startsWith('sun')) return 'dimanche'
  return 'lundi'
}

// Convert "HH:mm" or "HH:mm:ss" or "14h30" to minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const clean = String(timeStr).trim().replace('h', ':')
  const parts = clean.split(':').map(Number)
  const hours = parts[0] || 0
  const minutes = parts[1] || 0
  return hours * 60 + minutes
}

// Format minutes into clean time string "14:00"
const formatMinutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Format duration
const formatDuration = (startMins, endMins) => {
  const diff = Math.max(0, endMins - startMins)
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h > 0 && m > 0) return `${h}h${String(m).padStart(2, '0')}`
  if (h > 0) return `${h}h`
  return `${m}min`
}

// Color palettes for classes
const colorThemes = [
  'bg-emerald-50/90 text-emerald-950 border-emerald-200 border-l-emerald-600 hover:bg-emerald-100/90',
  'bg-sky-50/90 text-sky-950 border-sky-200 border-l-sky-600 hover:bg-sky-100/90',
  'bg-indigo-50/90 text-indigo-950 border-indigo-200 border-l-indigo-600 hover:bg-indigo-100/90',
  'bg-amber-50/90 text-amber-950 border-amber-200 border-l-amber-600 hover:bg-amber-100/90',
  'bg-teal-50/90 text-teal-950 border-teal-200 border-l-teal-600 hover:bg-teal-100/90',
  'bg-rose-50/90 text-rose-950 border-rose-200 border-l-rose-600 hover:bg-rose-100/90',
  'bg-violet-50/90 text-violet-950 border-violet-200 border-l-violet-600 hover:bg-violet-100/90'
]

const getColorClass = (index) => {
  return colorThemes[Math.abs(index) % colorThemes.length]
}

// Parsed and enriched classes list
const parsedClasses = computed(() => {
  const rawList = Array.isArray(props.classes) ? props.classes : []
  
  return rawList.map((item, idx) => {
    const rawDay = item.day || item.class?.day || ''
    const dayKey = normalizeDay(rawDay)
    const dayDef = DAYS_DEF.find(d => d.id === dayKey) || DAYS_DEF[0]

    const rawStart = item.startTime || item.class?.startTime || '08:00'
    const rawEnd = item.endTime || item.class?.endTime || '10:00'

    const startMins = parseTimeToMinutes(rawStart)
    const endMins = parseTimeToMinutes(rawEnd) > startMins ? parseTimeToMinutes(rawEnd) : startMins + 60

    return {
      id: item.id || item.class?.id || item.registrationId || `cls-${idx}`,
      name: item.name || item.class?.name || 'Classe sans nom',
      level: item.level || item.class?.level || '',
      roomName: item.room?.name || item.class?.room?.name || (typeof item.room === 'string' ? item.room : ''),
      teacherName: item.teacher?.fullName || item.class?.teacher?.fullName || (typeof item.teacher === 'string' ? item.teacher : ''),
      dayKey,
      dayLabel: dayDef.label,
      dayOrder: dayDef.order,
      startMins,
      endMins,
      cleanStartTime: formatMinutesToTime(startMins),
      cleanEndTime: formatMinutesToTime(endMins),
      durationMinutes: endMins - startMins,
      durationFormatted: formatDuration(startMins, endMins),
      childName: item.child?.fullName || '',
      colorIndex: idx,
      raw: item
    }
  })
})

// Calculate schedule bounds
const minHour = computed(() => {
  if (parsedClasses.value.length === 0) return 8
  const earliestMins = Math.min(...parsedClasses.value.map(c => c.startMins))
  const floorHour = Math.floor(earliestMins / 60)
  return Math.max(7, Math.min(floorHour, 9))
})

const maxHour = computed(() => {
  if (parsedClasses.value.length === 0) return 18
  const latestMins = Math.max(...parsedClasses.value.map(c => c.endMins))
  const ceilHour = Math.ceil(latestMins / 60)
  return Math.min(22, Math.max(ceilHour, 18))
})

const gridHours = computed(() => {
  const hours = []
  for (let h = minHour.value; h <= maxHour.value; h++) {
    hours.push(h)
  }
  return hours
})

const gridTotalHeight = computed(() => {
  return (maxHour.value - minHour.value) * hourHeight
})

const formatHourLabel = (hour) => {
  return `${String(hour).padStart(2, '0')}:00`
}

// Group classes into days
const daysWithClasses = computed(() => {
  return DAYS_DEF.map(day => {
    const dayCourses = parsedClasses.value
      .filter(c => c.dayKey === day.id)
      .sort((a, b) => a.startMins - b.startMins)

    const totalMinutes = dayCourses.reduce((acc, curr) => acc + curr.durationMinutes, 0)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const totalHoursFormatted = hours > 0 
      ? (mins > 0 ? `${hours}h${String(mins).padStart(2, '0')}` : `${hours}h`) 
      : `${mins}min`

    return {
      ...day,
      classes: dayCourses,
      totalMinutes,
      totalHoursFormatted
    }
  })
})

// Displayed days for grid mode (can hide empty days)
const displayedDays = computed(() => {
  if (hideEmptyDays.value) {
    const active = daysWithClasses.value.filter(d => d.classes.length > 0)
    return active.length > 0 ? active : daysWithClasses.value
  }
  return daysWithClasses.value
})

const gridColumnsStyle = computed(() => {
  const count = displayedDays.value.length
  return {
    gridTemplateColumns: `minmax(4rem, 5rem) repeat(${count}, minmax(0, 1fr))`
  }
})

// Agenda view filters
const filteredAgendaDays = computed(() => {
  return daysWithClasses.value.filter(d => d.classes.length > 0)
})

const activeAgendaDays = computed(() => {
  if (selectedAgendaDay.value === 'all') {
    return filteredAgendaDays.value
  }
  return daysWithClasses.value.filter(d => d.id === selectedAgendaDay.value && d.classes.length > 0)
})

// Stats
const activeDaysCount = computed(() => {
  return daysWithClasses.value.filter(d => d.classes.length > 0).length
})

const totalWeeklyMinutes = computed(() => {
  return parsedClasses.value.reduce((acc, curr) => acc + curr.durationMinutes, 0)
})

const totalWeeklyHoursFormatted = computed(() => {
  const total = totalWeeklyMinutes.value
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h > 0 && m > 0) return `${h}h${String(m).padStart(2, '0')}`
  if (h > 0) return `${h}h`
  return `${m} min`
})

// Position a course block inside the grid
const getBlockPosition = (item) => {
  const top = ((item.startMins - minHour.value * 60) / 60) * hourHeight
  const height = Math.max(38, (item.durationMinutes / 60) * hourHeight - 4)

  return {
    top: `${top}px`,
    height: `${height}px`
  }
}

const openDetails = (cls) => {
  selectedClass.value = cls
}
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
</style>
