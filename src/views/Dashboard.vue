<template>
  <div class="dashboard-view max-w-6xl mx-auto w-full space-y-8 pb-12">
    <!-- 1. HEADER & ACTIVE SCHOOL YEAR BANNER -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CalendarDaysIcon class="w-3.5 h-3.5 text-emerald-600" />
            <span>Année scolaire {{ schoolYear }}</span>
          </span>
          <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            En direct
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tableau de bord
        </h1>
        <p class="text-sm text-slate-500 max-w-xl">
          Synthèse globale de la scolarité de vos enfants, de leurs cours, présences et facturation.
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="fetchDashboardData"
          :disabled="isLoading"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 transition-colors disabled:opacity-50 cursor-pointer"
          title="Actualiser les indicateurs"
        >
          <RefreshCwIcon class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          <span>Actualiser</span>
        </button>

        <button
          type="button"
          @click="showRegistrationChoice = true"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
        >
          <PlusCircleIcon class="w-4 h-4" />
          <span>Inscrire un enfant</span>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <BaseAlert v-if="error" type="error" class="shadow-xs">
      <div class="flex items-center justify-between gap-4">
        <span>{{ error }}</span>
        <button @click="fetchDashboardData" class="underline font-bold text-xs">Réessayer</button>
      </div>
    </BaseAlert>

    <!-- Loading Skeleton / Spinner -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
      <div class="animate-spin rounded-full h-12 w-12 border-3 border-emerald-600 border-t-transparent mb-4"></div>
      <p class="text-sm font-semibold text-slate-600">Chargement de votre tableau de bord...</p>
      <p class="text-xs text-slate-400 mt-1">Récupération des indicateurs en cours</p>
    </div>

    <!-- MAIN DASHBOARD CONTENT -->
    <template v-else>
      <!-- 2. FOUR KEY METRIC TILES (CLICKABLE NAVIGATION) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- 2.1 ENFANTS RATTACHÉS -->
        <div
          @click="navigateTo('/home/children')"
          class="group relative bg-white hover:bg-slate-50/50 p-6 rounded-3xl border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Enfants rattachés</span>
              <div class="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UsersIcon class="w-5 h-5" />
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl sm:text-4xl font-black text-slate-900">{{ dashboardData.children?.total ?? 0 }}</span>
              <span class="text-xs font-medium text-slate-500">enfant{{ (dashboardData.children?.total ?? 0) > 1 ? 's' : '' }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Dossiers scolaires actifs
            </p>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
            <span>Gérer les enfants</span>
            <ArrowRightIcon class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <!-- 2.2 CLASSES ACTIVES -->
        <div
          @click="navigateTo('/home/classes')"
          class="group relative bg-white hover:bg-slate-50/50 p-6 rounded-3xl border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Classes inscrites</span>
              <div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCapIcon class="w-5 h-5" />
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl sm:text-4xl font-black text-slate-900">{{ dashboardData.classes?.total ?? 0 }}</span>
              <span class="text-xs font-medium text-slate-500">cours actif{{ (dashboardData.classes?.total ?? 0) > 1 ? 's' : '' }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-600 mt-2">
              <span class="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {{ dashboardData.classes?.arabe ?? 0 }} Arabe
              </span>
              <span class="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {{ dashboardData.classes?.soutienScolaire ?? 0 }} Soutien
              </span>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
            <span>Voir l'emploi du temps</span>
            <ArrowRightIcon class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <!-- 2.3 DEMANDES EN COURS -->
        <div
          @click="navigateTo('/home/requests')"
          class="group relative bg-white hover:bg-slate-50/50 p-6 rounded-3xl border border-slate-200/80 hover:border-amber-300 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Demandes en cours</span>
              <div class="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClipboardListIcon class="w-5 h-5" />
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl sm:text-4xl font-black text-slate-900">{{ dashboardData.pendingRequests?.total ?? 0 }}</span>
              <span class="text-xs font-medium text-slate-500">en attente</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-600 mt-2">
              <span v-if="(dashboardData.pendingRequests?.total ?? 0) === 0" class="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2Icon class="w-3.5 h-3.5" />
                Aucune attente
              </span>
              <template v-else>
                <span v-if="dashboardData.pendingRequests?.arabe > 0" class="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {{ dashboardData.pendingRequests.arabe }} Arabe
                </span>
                <span v-if="dashboardData.pendingRequests?.soutienScolaire > 0" class="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {{ dashboardData.pendingRequests.soutienScolaire }} Soutien
                </span>
              </template>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
            <span>Suivre l'avancement</span>
            <ArrowRightIcon class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <!-- 2.4 FACTURES & RESTE DÛ -->
        <div
          @click="navigateTo('/home/invoices')"
          class="group relative bg-white hover:bg-slate-50/50 p-6 rounded-3xl border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Paiement & Factures</span>
              <div class="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ReceiptIcon class="w-5 h-5" />
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black" :class="actualOutstandingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'">
                {{ formatCurrency(actualOutstandingAmount) }}
              </span>
            </div>
            <p class="text-xs font-medium text-slate-500 mt-1">
              <span v-if="actualOutstandingAmount > 0" class="text-amber-700 font-semibold">
                Reste à régler
              </span>
              <span v-else class="text-emerald-600 font-semibold">
                Tout est à jour
              </span>
              • {{ dashboardData.invoices?.paid ?? 0 }}/{{ dashboardData.invoices?.total ?? 0 }} payée{{ (dashboardData.invoices?.total ?? 0) > 1 ? 's' : '' }}
            </p>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600 group-hover:text-teal-700">
            <span>Accéder aux factures</span>
            <ArrowRightIcon class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <!-- 3. DETAILED ASSIDUITÉ & PRÉSENCES PAR SERVICE -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                Assiduité et présence par service
              </h2>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Taux global : {{ overallAttendanceRate }}%
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Suivi détaillé des présences, absences et séances en attente de pointage.
            </p>
          </div>

          <button
            type="button"
            @click="navigateTo('/home/classes')"
            class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 self-start sm:self-auto"
          >
            <span>Voir l'emploi du temps complet</span>
            <ArrowRightIcon class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Service Cards Grid: Arabe & Soutien Scolaire -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 3.1 SERVICE LANGUE ARABE -->
          <div 
            @click="navigateTo('/home/classes')"
            class="group p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 class="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Langue Arabe
                  </h3>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ dashboardData.attendance?.arabe?.total ?? 0 }} séance{{ (dashboardData.attendance?.arabe?.total ?? 0) > 1 ? 's' : '' }} programmée{{ (dashboardData.attendance?.arabe?.total ?? 0) > 1 ? 's' : '' }}
                </p>
              </div>

              <!-- Rate Pill -->
              <span 
                class="px-2.5 py-1 rounded-xl text-xs font-extrabold"
                :class="arabeRate >= 80 ? 'bg-emerald-100 text-emerald-800' : (arabeRate >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')"
              >
                {{ arabeRate }}% d'assiduité
              </span>
            </div>

            <!-- Segmented Progress Bar -->
            <div class="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden flex gap-0.5 p-0.5 mb-4">
              <div 
                v-if="(dashboardData.attendance?.arabe?.present ?? 0) > 0"
                class="h-full bg-emerald-500 rounded-full transition-all"
                :style="{ width: `${((dashboardData.attendance?.arabe?.present ?? 0) / Math.max(1, (dashboardData.attendance?.arabe?.total ?? 1))) * 100}%` }"
              ></div>
              <div 
                v-if="(dashboardData.attendance?.arabe?.absent ?? 0) > 0"
                class="h-full bg-rose-500 rounded-full transition-all"
                :style="{ width: `${((dashboardData.attendance?.arabe?.absent ?? 0) / Math.max(1, (dashboardData.attendance?.arabe?.total ?? 1))) * 100}%` }"
              ></div>
              <div 
                v-if="(dashboardData.attendance?.arabe?.notMarked ?? 0) > 0"
                class="h-full bg-slate-300 rounded-full transition-all"
                :style="{ width: `${((dashboardData.attendance?.arabe?.notMarked ?? 0) / Math.max(1, (dashboardData.attendance?.arabe?.total ?? 1))) * 100}%` }"
              ></div>
            </div>

            <!-- Detailed counts -->
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                <span class="text-[10px] uppercase font-bold text-emerald-600 block">Présents</span>
                <span class="text-base font-black text-emerald-700">{{ dashboardData.attendance?.arabe?.present ?? 0 }}</span>
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                <span class="text-[10px] uppercase font-bold text-rose-600 block">Absents</span>
                <span class="text-base font-black text-rose-700">{{ dashboardData.attendance?.arabe?.absent ?? 0 }}</span>
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                <span class="text-[10px] uppercase font-bold text-slate-500 block">En attente</span>
                <span class="text-base font-black text-slate-700">{{ dashboardData.attendance?.arabe?.notMarked ?? 0 }}</span>
              </div>
            </div>

            <div class="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-600 font-semibold">
              <span>Consulter les détails des cours d'Arabe</span>
              <ArrowRightIcon class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <!-- 3.2 SERVICE SOUTIEN SCOLAIRE -->
          <div 
            @click="navigateTo('/home/classes')"
            class="group p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <h3 class="font-bold text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
                    Soutien Scolaire
                  </h3>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ dashboardData.attendance?.soutienScolaire?.total ?? 0 }} séance{{ (dashboardData.attendance?.soutienScolaire?.total ?? 0) > 1 ? 's' : '' }} programmée{{ (dashboardData.attendance?.soutienScolaire?.total ?? 0) > 1 ? 's' : '' }}
                </p>
              </div>

              <!-- Rate Pill -->
              <span 
                class="px-2.5 py-1 rounded-xl text-xs font-extrabold"
                :class="soutienRate >= 80 ? 'bg-indigo-100 text-indigo-800' : (soutienRate >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')"
              >
                {{ soutienRate }}% d'assiduité
              </span>
            </div>

            <!-- Segmented Progress Bar -->
            <div class="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden flex gap-0.5 p-0.5 mb-4">
              <div 
                v-if="(dashboardData.attendance?.soutienScolaire?.present ?? 0) > 0"
                class="h-full bg-emerald-500 rounded-full transition-all"
                :style="{ width: `${((dashboardData.attendance?.soutienScolaire?.present ?? 0) / Math.max(1, (dashboardData.attendance?.soutienScolaire?.total ?? 1))) * 100}%` }"
              ></div>
              <div 
                v-if="(dashboardData.attendance?.soutienScolaire?.absent ?? 0) > 0"
                class="h-full bg-rose-500 rounded-full transition-all"
                :style="{ width: `${((dashboardData.attendance?.soutienScolaire?.absent ?? 0) / Math.max(1, (dashboardData.attendance?.soutienScolaire?.total ?? 1))) * 100}%` }"
              ></div>
              <div 
                v-if="(dashboardData.attendance?.soutienScolaire?.notMarked ?? 0) > 0"
                class="h-full bg-slate-300 rounded-full transition-all"
                :style="{ width: `${((dashboardData.attendance?.soutienScolaire?.notMarked ?? 0) / Math.max(1, (dashboardData.attendance?.soutienScolaire?.total ?? 1))) * 100}%` }"
              ></div>
            </div>

            <!-- Detailed counts -->
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                <span class="text-[10px] uppercase font-bold text-emerald-600 block">Présents</span>
                <span class="text-base font-black text-emerald-700">{{ dashboardData.attendance?.soutienScolaire?.present ?? 0 }}</span>
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                <span class="text-[10px] uppercase font-bold text-rose-600 block">Absents</span>
                <span class="text-base font-black text-rose-700">{{ dashboardData.attendance?.soutienScolaire?.absent ?? 0 }}</span>
              </div>
              <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                <span class="text-[10px] uppercase font-bold text-slate-500 block">En attente</span>
                <span class="text-base font-black text-slate-700">{{ dashboardData.attendance?.soutienScolaire?.notMarked ?? 0 }}</span>
              </div>
            </div>

            <div class="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-indigo-600 font-semibold">
              <span>Consulter les détails du Soutien Scolaire</span>
              <ArrowRightIcon class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      <!-- 4. BOTTOM DUAL PANELS: FINANCES & INSCRIPTIONS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 4.1 SYNTHÈSE FINANCIÈRE -->
        <div 
          @click="navigateTo('/home/invoices')"
          class="group bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 hover:border-teal-300 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <WalletIcon class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
                    Synthèse financière
                  </h3>
                  <p class="text-xs text-slate-500">Règlements & état de facturation</p>
                </div>
              </div>

              <span 
                class="px-3 py-1 rounded-full text-xs font-bold"
                :class="actualOutstandingAmount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ actualOutstandingAmount === 0 ? 'Dossier à jour' : 'Solde en attente' }}
              </span>
            </div>

            <!-- Financial KPIs -->
            <div class="grid grid-cols-3 gap-3 mb-5">
              <div class="bg-slate-50 p-3.5 rounded-2xl">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total facturé</span>
                <span class="text-base sm:text-lg font-black text-slate-900">
                  {{ formatCurrency(dashboardData.invoices?.invoicedAmount ?? 0) }}
                </span>
              </div>
              <div class="bg-emerald-50/70 p-3.5 rounded-2xl">
                <span class="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">Montant payé</span>
                <span class="text-base sm:text-lg font-black text-emerald-700">
                  {{ formatCurrency(dashboardData.invoices?.paidAmount ?? 0) }}
                </span>
              </div>
              <div class="bg-amber-50/70 p-3.5 rounded-2xl">
                <span class="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">Reste dû</span>
                <span 
                  class="text-base sm:text-lg font-black"
                  :class="actualOutstandingAmount === 0 ? 'text-emerald-700' : 'text-amber-800'"
                >
                  {{ formatCurrency(actualOutstandingAmount) }}
                </span>
              </div>
            </div>

            <!-- Financial Progress Bar -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs text-slate-500 font-medium">
                <span>Progression du règlement</span>
                <span>{{ paymentProgressRate }}% réglé ({{ dashboardData.invoices?.paid ?? 0 }} / {{ dashboardData.invoices?.total ?? 0 }} factures)</span>
              </div>
              <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-teal-500 rounded-full transition-all"
                  :style="{ width: `${paymentProgressRate}%` }"
                ></div>
              </div>
            </div>

            <!-- Montants à payer prochainement (Arabe & Soutien Scolaire) -->
            <div v-if="hasUpcomingAmounts" class="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-amber-900">
                <span class="flex items-center gap-1.5">
                  <CalendarDaysIcon class="w-3.5 h-3.5 text-amber-600" />
                  Prochains montants à régler
                </span>
                <span class="text-sm font-black text-amber-900">
                  {{ formatCurrency(upcomingTotal) }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-white p-2.5 rounded-xl border border-amber-100 flex items-center justify-between">
                  <span class="text-slate-600 text-[11px] font-medium">Langue Arabe</span>
                  <span class="font-bold text-slate-900">{{ formatCurrency(upcomingArabic) }}</span>
                </div>
                <div class="bg-white p-2.5 rounded-xl border border-amber-100 flex items-center justify-between">
                  <span class="text-slate-600 text-[11px] font-medium">Soutien Scolaire</span>
                  <span class="font-bold text-slate-900">{{ formatCurrency(upcomingSoutien) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600 group-hover:text-teal-700">
            <span>Consulter les factures et reçus de paiement</span>
            <ArrowRightIcon class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <!-- 4.2 INSCRIPTIONS & SERVICES CCIB38 -->
        <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpenIcon class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-lg text-slate-900">
                    Services et inscriptions
                  </h3>
                  <p class="text-xs text-slate-500">Inscrire ou ajouter une discipline</p>
                </div>
              </div>
            </div>

            <!-- Service Quick Links -->
            <div class="space-y-3">
              <!-- Soutien scolaire -->
              <router-link
                to="/inscription-soutien-scolaire"
                class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-200 transition-all group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    SS
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Inscription Soutien Scolaire
                    </h4>
                    <p class="text-xs text-slate-500">
                      Mathématiques, Français, Physique... Du primaire au lycée
                    </p>
                  </div>
                </div>
                <ArrowRightIcon class="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </router-link>

              <!-- Langue Arabe -->
              <router-link
                to="/inscription"
                class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 transition-all group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    AR
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-900 group-hover:text-indigo-800 transition-colors">
                      Inscription Langue Arabe & Éducation
                    </h4>
                    <p class="text-xs text-slate-500">
                      Apprentissage, Coran, Éveil et Niveaux N1 à N6
                    </p>
                  </div>
                </div>
                <ArrowRightIcon class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </router-link>
            </div>
          </div>

          <!-- Footer Link to Children -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500">Besoin de modifier la fiche d'un enfant ?</span>
            <router-link to="/home/children" class="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <span>Voir mes enfants</span>
              <ArrowRightIcon class="w-3.5 h-3.5" />
            </router-link>
          </div>
        </div>
      </div>
    </template>

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
          v-if="showRegistrationChoice"
          class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          @click.self="showRegistrationChoice = false"
        >
          <div
            class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 overflow-hidden transform transition-all"
            role="dialog"
            aria-modal="true"
          >
            <!-- Close Button -->
            <button
              type="button"
              @click="showRegistrationChoice = false"
              class="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Fermer"
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
                @click="showRegistrationChoice = false"
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
  UsersIcon,
  GraduationCapIcon,
  ClipboardListIcon,
  ReceiptIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  WalletIcon,
  BookOpenIcon,
  XIcon,
  SparklesIcon
} from 'lucide-vue-next'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import { getParentDashboard } from '@/services/parentApi.js'

const router = useRouter()

const showRegistrationChoice = ref(false)

const chooseRegistration = (path) => {
  showRegistrationChoice.value = false
  router.push(path)
}

const isLoading = ref(true)
const error = ref('')

const dashboardData = ref({
  schoolYear: '2026/2027',
  children: { total: 0 },
  classes: { total: 0, arabe: 0, soutienScolaire: 0 },
  pendingRequests: { total: 0, arabe: 0, soutienScolaire: 0 },
  attendance: {
    arabe: { total: 0, present: 0, absent: 0, notMarked: 0 },
    soutienScolaire: { total: 0, present: 0, absent: 0, notMarked: 0 }
  },
  invoices: {
    total: 0,
    paid: 0,
    paidAmount: 0,
    invoicedAmount: 0,
    outstandingAmount: 0,
    currency: 'EUR'
  }
})

const schoolYear = computed(() => {
  return dashboardData.value.schoolYear || '2026/2027'
})

// Calculate Arabe Attendance Rate %
const arabeRate = computed(() => {
  const att = dashboardData.value.attendance?.arabe
  if (!att) return 100
  const evaluated = (att.present || 0) + (att.absent || 0)
  if (evaluated > 0) {
    return Math.round(((att.present || 0) / evaluated) * 100)
  }
  if ((att.total || 0) > 0) {
    return Math.round(((att.present || 0) / att.total) * 100)
  }
  return 100
})

// Calculate Soutien Scolaire Attendance Rate %
const soutienRate = computed(() => {
  const att = dashboardData.value.attendance?.soutienScolaire
  if (!att) return 100
  const evaluated = (att.present || 0) + (att.absent || 0)
  if (evaluated > 0) {
    return Math.round(((att.present || 0) / evaluated) * 100)
  }
  if ((att.total || 0) > 0) {
    return Math.round(((att.present || 0) / att.total) * 100)
  }
  return 100
})

// Global Overall Rate
const overallAttendanceRate = computed(() => {
  const arabPresent = dashboardData.value.attendance?.arabe?.present || 0
  const arabAbsent = dashboardData.value.attendance?.arabe?.absent || 0
  const ssPresent = dashboardData.value.attendance?.soutienScolaire?.present || 0
  const ssAbsent = dashboardData.value.attendance?.soutienScolaire?.absent || 0

  const totalPresent = arabPresent + ssPresent
  const totalEvaluated = totalPresent + arabAbsent + ssAbsent

  if (totalEvaluated > 0) {
    return Math.round((totalPresent / totalEvaluated) * 100)
  }
  return 100
})

// Actual outstanding / remaining due amount (safe calculation)
const actualOutstandingAmount = computed(() => {
  const inv = dashboardData.value.invoices
  if (!inv) return 0

  // 1. If all invoices are paid (e.g. 2/2 payées)
  const total = Number(inv.total) || 0
  const paid = Number(inv.paid) || 0
  if (total > 0 && paid >= total) {
    return 0
  }

  // 2. If invoicedAmount and paidAmount are specified and fully settled
  const invoiced = Number(inv.invoicedAmount) || 0
  const paidAmount = Number(inv.paidAmount) || 0
  if (invoiced > 0 && paidAmount >= invoiced) {
    return 0
  }

  // 3. If there is a real unpaid difference
  if (invoiced > 0 && invoiced > paidAmount) {
    return invoiced - paidAmount
  }

  // 4. Fallback to outstandingAmount
  return Number(inv.outstandingAmount) || 0
})

// Financial Payment Progress Rate %
const paymentProgressRate = computed(() => {
  const invoiced = Number(dashboardData.value.invoices?.invoicedAmount) || 0
  const paid = Number(dashboardData.value.invoices?.paidAmount) || 0
  if (invoiced > 0) {
    return Math.min(100, Math.round((paid / invoiced) * 100))
  }
  const total = Number(dashboardData.value.invoices?.total) || 0
  const paidCount = Number(dashboardData.value.invoices?.paid) || 0
  if (total > 0) {
    return Math.min(100, Math.round((paidCount / total) * 100))
  }
  return 100
})

const upcomingArabic = computed(() => {
  return dashboardData.value.amountDue?.amountDueArabic ?? dashboardData.value.amountDueArabic ?? 0
})

const upcomingSoutien = computed(() => {
  return dashboardData.value.amountDue?.amountDueSoutien ?? dashboardData.value.amountDueSoutien ?? 0
})

const upcomingTotal = computed(() => {
  if (dashboardData.value.amountDue?.total !== undefined) {
    return dashboardData.value.amountDue.total
  }
  return upcomingArabic.value + upcomingSoutien.value
})

const hasUpcomingAmounts = computed(() => {
  if (actualOutstandingAmount.value === 0) return false
  return upcomingTotal.value > 0 || upcomingArabic.value > 0 || upcomingSoutien.value > 0
})

const formatCurrency = (val, currency = 'EUR') => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'EUR'
  }).format(num)
}

const navigateTo = (path) => {
  router.push(path)
}

const fetchDashboardData = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const data = await getParentDashboard()
    if (data) {
      // If the API wrapped in status: success
      dashboardData.value = {
        schoolYear: data.schoolYear || '2026/2027',
        children: data.children || { total: 0 },
        classes: data.classes || { total: 0, arabe: 0, soutienScolaire: 0 },
        pendingRequests: data.pendingRequests || { total: 0, arabe: 0, soutienScolaire: 0 },
        amountDueArabic: data.amountDueArabic ?? data.amountDue?.amountDueArabic ?? 0,
        amountDueSoutien: data.amountDueSoutien ?? data.amountDue?.amountDueSoutien ?? 0,
        amountDue: data.amountDue || {
          amountDueArabic: data.amountDueArabic ?? 0,
          amountDueSoutien: data.amountDueSoutien ?? 0,
          total: (data.amountDueArabic ?? 0) + (data.amountDueSoutien ?? 0),
          currency: 'EUR'
        },
        attendance: data.attendance || {
          arabe: { total: 0, present: 0, absent: 0, notMarked: 0 },
          soutienScolaire: { total: 0, present: 0, absent: 0, notMarked: 0 }
        },
        invoices: data.invoices || {
          total: 0,
          paid: 0,
          paidAmount: 0,
          invoicedAmount: 0,
          outstandingAmount: 0,
          currency: 'EUR'
        }
      }
    }
  } catch (err) {
    console.error('Erreur chargement dashboard:', err)
    error.value = "Impossible de récupérer les indicateurs du tableau de bord."
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
