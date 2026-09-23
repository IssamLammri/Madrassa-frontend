<template>
  <div class="weekly-schedule w-full">
    <!-- Header / Stats / View Controls -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Stats Summary -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-medium border border-emerald-100/80">
            <BookOpenIcon class="w-4 h-4 text-emerald-600" />
            <span><strong>{{ activeClassesCount }}</strong> cours / semaine</span>
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

      <!-- Child Filter Pills within Schedule (if multiple children and showChildName enabled) -->
      <div v-if="showChildName && internalChildren.length > 1" class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
          <UsersIcon class="w-3.5 h-3.5 text-emerald-600" />
          Enfants :
        </span>
        <button
          type="button"
          @click="selectedChildFilter = 'all'"
          class="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
          :class="selectedChildFilter === 'all' 
            ? 'bg-slate-900 text-white shadow-2xs' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        >
          Tous ({{ parsedClasses.length }})
        </button>
        <button
          v-for="child in internalChildren"
          :key="child.id"
          type="button"
          @click="selectedChildFilter = child.id"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all"
          :class="selectedChildFilter === child.id 
            ? 'bg-emerald-600 text-white shadow-2xs' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        >
          <span class="w-2 h-2 rounded-full" :class="child.dotClass"></span>
          <span>{{ child.name }}</span>
          <span class="text-[10px] opacity-80">({{ child.count }})</span>
        </button>
      </div>
    </div>

    <!-- Empty State if no classes -->
    <div v-if="visibleClasses.length === 0" class="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-100">
      <CalendarXIcon class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <h3 class="text-base font-bold text-slate-800 mb-1">Aucun cours dans le planning</h3>
      <p class="text-sm text-slate-500">Aucun créneau d'enseignement n'a été programmé pour cette sélection.</p>
    </div>

    <!-- MODE 1: TIMETABLE GRID (Grille horaire) -->
    <div v-else-if="viewMode === 'grid'" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Desktop & Tablet Horizontally scrollable wrapper -->
      <div class="overflow-x-auto">
        <div class="min-w-[760px]">
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
                <!-- Render Each Course Block in Day (Side-by-side when overlapping) -->
                <div
                  v-for="item in day.classes"
                  :key="item.id"
                  @click="openDetails(item)"
                  class="absolute rounded-xl p-2 sm:p-2.5 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 z-10 flex flex-col justify-between overflow-hidden border border-l-4"
                  :class="getColorClass(item.colorIndex)"
                  :style="getBlockPosition(item)"
                  :title="`${item.name} - ${item.childName} (${item.cleanStartTime} - ${item.cleanEndTime})`"
                >
                  <div class="min-w-0">
                    <!-- Child pill if multiple children -->
                    <div v-if="showChildName && item.childName" class="mb-1">
                      <span class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/90 shadow-2xs text-slate-800 truncate max-w-full">
                        <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="item.dotClass"></span>
                        <span class="truncate">{{ item.childName }}</span>
                      </span>
                    </div>

                    <!-- Time & Duration pill -->
                    <div class="flex items-center justify-between gap-1 mb-1 text-[11px] font-bold tracking-tight">
                      <span class="inline-flex items-center gap-1 truncate">
                        <ClockIcon class="w-3 h-3 flex-shrink-0" />
                        {{ item.cleanStartTime }}-{{ item.cleanEndTime }}
                      </span>
                      <span v-if="item.totalLanes <= 2" class="text-[10px] font-semibold px-1 py-0.2 rounded bg-white/60 shadow-2xs flex-shrink-0">
                        {{ item.durationFormatted }}
                      </span>
                    </div>

                    <!-- Class Name -->
                    <h4 class="font-bold text-xs leading-snug line-clamp-2 text-slate-900">
                      {{ item.name }}
                    </h4>
                  </div>

                  <!-- Details (Salle, Enseignant, WhatsApp indicator) -->
                  <div class="mt-1 pt-1 border-t border-black/5 text-[10px] space-y-0.5">
                    <div v-if="item.roomName" class="flex items-center gap-1 truncate">
                      <MapPinIcon class="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                      <span class="truncate">{{ item.roomName }}</span>
                    </div>
                    <div v-if="item.teacherName && item.totalLanes <= 2" class="flex items-center gap-1 truncate">
                      <UserIcon class="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                      <span class="truncate">{{ item.teacherName }}</span>
                    </div>
                    <div v-if="item.whatsappUrl" class="flex items-center gap-1 text-emerald-700 font-semibold pt-0.5">
                      <svg class="w-3 h-3 fill-current flex-shrink-0 text-emerald-600" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp dispo</span>
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
          Tous les jours ({{ visibleClasses.length }})
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="item in day.classes"
              :key="'ag-card-' + item.id"
              class="rounded-2xl p-4 sm:p-5 border border-l-4 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
              :class="getColorClass(item.colorIndex)"
              @click="openDetails(item)"
            >
              <div>
                <!-- Child Badge -->
                <div v-if="showChildName && item.childName" class="flex items-center justify-between gap-2 mb-2">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 text-slate-900 shadow-2xs">
                    <span class="w-2 h-2 rounded-full" :class="item.dotClass"></span>
                    {{ item.childName }}
                  </span>
                  <span v-if="item.level" class="text-xs font-semibold px-2 py-0.5 rounded bg-black/5">
                    {{ item.level }}
                  </span>
                </div>

                <div class="flex justify-between items-start gap-2 mb-2">
                  <span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-white/80 shadow-2xs">
                    <ClockIcon class="w-3.5 h-3.5" />
                    {{ item.cleanStartTime }} à {{ item.cleanEndTime }}
                  </span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded bg-black/5">
                    {{ item.durationFormatted }}
                  </span>
                </div>

                <h4 class="font-bold text-base sm:text-lg mb-1 leading-snug text-slate-900">
                  {{ item.name }}
                </h4>
                <p v-if="item.speciality" class="text-xs text-slate-600 font-medium">
                  Spécialité : {{ item.speciality }}
                </p>
              </div>

              <div class="mt-4 pt-3 border-t border-black/5 space-y-2 text-xs sm:text-sm">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <span class="text-slate-500 font-medium block text-[11px] uppercase tracking-wide">Salle</span>
                    <span class="font-semibold flex items-center gap-1">
                      <MapPinIcon class="w-3 h-3 flex-shrink-0 opacity-70" />
                      {{ item.roomName || 'Non assignée' }}
                    </span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium block text-[11px] uppercase tracking-wide">Enseignant</span>
                    <span class="font-semibold flex items-center gap-1 truncate">
                      <UserIcon class="w-3 h-3 flex-shrink-0 opacity-70" />
                      <span class="truncate">{{ item.teacherName || 'Non assigné' }}</span>
                    </span>
                  </div>
                </div>

                <!-- WhatsApp Link Button if available -->
                <div v-if="item.whatsappUrl" class="pt-2">
                  <a
                    :href="item.whatsappUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click.stop
                    class="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                  >
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>Rejoindre le groupe WhatsApp</span>
                  </a>
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
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                <CalendarIcon class="w-3.5 h-3.5" />
                {{ selectedClass.dayLabel }}
              </span>
              <span v-if="selectedClass.schoolYear" class="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                {{ selectedClass.schoolYear }}
              </span>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-slate-800">
              {{ selectedClass.name }}
            </h3>
            <p v-if="showChildName && selectedClass.childName" class="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full" :class="selectedClass.dotClass"></span>
              Élève : {{ selectedClass.childName }}
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
            <p class="text-xs font-semibold text-slate-400 uppercase mb-1">Niveau / Spécialité</p>
            <p class="font-bold text-slate-800">{{ selectedClass.level || 'Non spécifié' }} {{ selectedClass.speciality ? `(${selectedClass.speciality})` : '' }}</p>
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

        <!-- WhatsApp Link if exists -->
        <div v-if="selectedClass.whatsappUrl" class="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4">
          <p class="text-xs text-emerald-900 font-medium mb-3">
            Un groupe de discussion WhatsApp est disponible pour cette classe afin d'échanger avec les enseignants et l'administration :
          </p>
          <a
            :href="selectedClass.whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors"
          >
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Rejoindre le groupe WhatsApp</span>
          </a>
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
  UsersIcon,
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
  },
  childFilter: {
    type: [String, Number],
    default: 'all'
  }
})

// View state
const viewMode = ref('grid') // 'grid' | 'agenda'
const hideEmptyDays = ref(true) // default to true so days with courses are emphasized in full width
const selectedAgendaDay = ref('all')
const selectedClass = ref(null)
const selectedChildFilter = ref('all')

const hourHeight = 62 // px per hour in grid

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

// Color palettes for classes & children
const colorThemes = [
  'bg-emerald-50/95 text-emerald-950 border-emerald-300 border-l-emerald-600 hover:bg-emerald-100',
  'bg-sky-50/95 text-sky-950 border-sky-300 border-l-sky-600 hover:bg-sky-100',
  'bg-indigo-50/95 text-indigo-950 border-indigo-300 border-l-indigo-600 hover:bg-indigo-100',
  'bg-amber-50/95 text-amber-950 border-amber-300 border-l-amber-600 hover:bg-amber-100',
  'bg-rose-50/95 text-rose-950 border-rose-300 border-l-rose-600 hover:bg-rose-100',
  'bg-teal-50/95 text-teal-950 border-teal-300 border-l-teal-600 hover:bg-teal-100',
  'bg-purple-50/95 text-purple-950 border-purple-300 border-l-purple-600 hover:bg-purple-100'
]

const dotColors = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-purple-500'
]

const getColorClass = (index) => {
  return colorThemes[Math.abs(index) % colorThemes.length]
}

// Child color mapping
const childColorMap = computed(() => {
  const map = new Map()
  let idx = 0
  const rawList = Array.isArray(props.classes) ? props.classes : []
  rawList.forEach(item => {
    const childId = item.child?.id || item.child?.fullName
    if (childId && !map.has(childId)) {
      map.set(childId, idx % colorThemes.length)
      idx++
    }
  })
  return map
})

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

    const childId = item.child?.id || item.child?.fullName || `child-${idx}`
    const colorIndex = childColorMap.value.has(childId) ? childColorMap.value.get(childId) : idx

    return {
      id: item.id || item.class?.id || item.registrationId || `cls-${idx}`,
      name: item.name || item.class?.name || 'Classe sans nom',
      level: item.level || item.class?.level || '',
      speciality: item.speciality || item.class?.speciality || item.class?.type || '',
      schoolYear: item.schoolYear || item.class?.schoolYear || '',
      roomName: item.room?.name || item.class?.room?.name || (typeof item.room === 'string' ? item.room : ''),
      teacherName: item.teacher?.fullName || item.class?.teacher?.fullName || (typeof item.teacher === 'string' ? item.teacher : ''),
      whatsappUrl: item.whatsappUrl || item.class?.whatsappUrl || null,
      dayKey,
      dayLabel: dayDef.label,
      dayOrder: dayDef.order,
      startMins,
      endMins,
      cleanStartTime: formatMinutesToTime(startMins),
      cleanEndTime: formatMinutesToTime(endMins),
      durationMinutes: endMins - startMins,
      durationFormatted: formatDuration(startMins, endMins),
      childId: item.child?.id,
      childName: item.child?.fullName || `${item.child?.firstName || ''} ${item.child?.lastName || ''}`.trim(),
      colorIndex,
      dotClass: dotColors[colorIndex % dotColors.length],
      raw: item
    }
  })
})

// Extract distinct children from parsed classes
const internalChildren = computed(() => {
  const map = new Map()
  parsedClasses.value.forEach(cls => {
    if (cls.childId && !map.has(cls.childId)) {
      map.set(cls.childId, {
        id: cls.childId,
        name: cls.childName,
        count: parsedClasses.value.filter(c => c.childId === cls.childId).length,
        dotClass: cls.dotClass
      })
    }
  })
  return Array.from(map.values())
})

// Classes filtered by child filter
const visibleClasses = computed(() => {
  if (selectedChildFilter.value === 'all') {
    return parsedClasses.value
  }
  return parsedClasses.value.filter(c => c.childId === selectedChildFilter.value)
})

// Calculate schedule bounds
const minHour = computed(() => {
  if (visibleClasses.value.length === 0) return 8
  const earliestMins = Math.min(...visibleClasses.value.map(c => c.startMins))
  const floorHour = Math.floor(earliestMins / 60)
  return Math.max(7, Math.min(floorHour, 9))
})

const maxHour = computed(() => {
  if (visibleClasses.value.length === 0) return 18
  const latestMins = Math.max(...visibleClasses.value.map(c => c.endMins))
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

// Group classes into days and compute column lanes for overlapping events
const daysWithClasses = computed(() => {
  return DAYS_DEF.map(day => {
    const dayCourses = visibleClasses.value
      .filter(c => c.dayKey === day.id)
      .sort((a, b) => {
        if (a.startMins !== b.startMins) return a.startMins - b.startMins
        return b.endMins - a.endMins
      })

    // 1. Assign laneIndex to each event
    const lanes = []
    dayCourses.forEach(ev => {
      let placed = false
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i] <= ev.startMins) {
          ev.laneIndex = i
          lanes[i] = ev.endMins
          placed = true
          break
        }
      }
      if (!placed) {
        ev.laneIndex = lanes.length
        lanes.push(ev.endMins)
      }
    })

    // 2. Cluster overlapping events to calculate totalLanes per group
    const clusters = []
    dayCourses.forEach(ev => {
      const match = clusters.find(cl => 
        cl.some(cEv => ev.startMins < cEv.endMins && cEv.startMins < ev.endMins)
      )
      if (match) {
        match.push(ev)
      } else {
        clusters.push([ev])
      }
    })

    clusters.forEach(cluster => {
      const maxLane = Math.max(...cluster.map(e => e.laneIndex || 0))
      const totalLanes = maxLane + 1
      cluster.forEach(e => {
        e.totalLanes = totalLanes
      })
    })

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
const activeClassesCount = computed(() => {
  return visibleClasses.value.length
})

const activeDaysCount = computed(() => {
  return daysWithClasses.value.filter(d => d.classes.length > 0).length
})

const totalWeeklyMinutes = computed(() => {
  return visibleClasses.value.reduce((acc, curr) => acc + curr.durationMinutes, 0)
})

const totalWeeklyHoursFormatted = computed(() => {
  const total = totalWeeklyMinutes.value
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h > 0 && m > 0) return `${h}h${String(m).padStart(2, '0')}`
  if (h > 0) return `${h}h`
  return `${m} min`
})

// Position a course block inside the grid with side-by-side overlap positioning
const getBlockPosition = (item) => {
  const top = ((item.startMins - minHour.value * 60) / 60) * hourHeight
  const height = Math.max(52, (item.durationMinutes / 60) * hourHeight - 4)

  const totalLanes = item.totalLanes || 1
  const laneIndex = item.laneIndex || 0

  const widthPercent = 100 / totalLanes
  const leftPercent = laneIndex * widthPercent

  return {
    top: `${top}px`,
    height: `${height}px`,
    left: `calc(${leftPercent}% + 2px)`,
    width: `calc(${widthPercent}% - 4px)`
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
