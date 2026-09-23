<template>
  <div class="max-w-6xl mx-auto w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Mes factures & règlements</h1>
        <p class="text-slate-600 mt-1">Consultez l'historique de vos facturations, l'état de vos règlements et téléchargez vos reçus.</p>
      </div>

      <button
        type="button"
        @click="fetchInvoices(1)"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
      >
        <ReceiptIcon class="w-4 h-4 text-slate-500" />
        <span>Actualiser</span>
      </button>
    </div>

    <!-- KPI Summary Cards - Dynamiques selon l'onglet actif -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Total Facturé -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ kpis.labels.invoiced }}</span>
          <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <ReceiptIcon class="w-4 h-4" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-800">{{ formatCurrency(kpis.totalInvoiced) }}</p>
        <p class="text-xs text-slate-500 mt-1 font-medium">{{ kpis.invoicesCountLabel }}</p>
      </div>

      <!-- 2. Total Réglé -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ kpis.labels.paid }}</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2Icon class="w-4 h-4" />
          </div>
        </div>
        <p class="text-2xl font-black text-emerald-600">{{ formatCurrency(kpis.totalPaid) }}</p>
        <p class="text-xs text-emerald-700 font-medium mt-1">
          {{ kpis.totalPaymentsCount }} paiement{{ kpis.totalPaymentsCount > 1 ? 's' : '' }} enregistré{{ kpis.totalPaymentsCount > 1 ? 's' : '' }}
        </p>
      </div>

      <!-- 3. Reste à régler -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ kpis.labels.remaining }}</span>
          <div 
            class="w-8 h-8 rounded-xl flex items-center justify-center"
            :class="kpis.remainingDue > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'"
          >
            <CreditCardIcon class="w-4 h-4" />
          </div>
        </div>
        <p 
          class="text-2xl font-black"
          :class="kpis.remainingDue > 0 ? 'text-amber-600' : 'text-emerald-600'"
        >
          {{ formatCurrency(kpis.remainingDue) }}
        </p>
        <p class="text-xs font-semibold mt-1" :class="kpis.remainingDue > 0 ? 'text-amber-700' : 'text-emerald-600'">
          {{ kpis.remainingDue > 0 ? 'Solde à régulariser' : '✓ Dossier entièrement à jour' }}
        </p>
      </div>

      <!-- 4. Période / Année Active -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ kpis.labels.period }}</span>
          <div class="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <CalendarIcon class="w-4 h-4" />
          </div>
        </div>
        <p class="text-2xl font-black text-sky-800">{{ kpis.periodTitle }}</p>
        <p class="text-xs text-sky-700 font-medium mt-1">
          {{ kpis.periodSubtitle }}
        </p>
      </div>
    </div>

    <!-- Alert / Messages -->
    <BaseAlert v-if="error" type="error">
      {{ error }}
    </BaseAlert>

    <!-- Tabs: Année en cours vs Anciennes années vs Toutes -->
    <div class="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <!-- Tab 1: Année active (Default) -->
        <button
          type="button"
          @click="activeTab = 'current'"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          :class="activeTab === 'current' 
            ? 'bg-emerald-600 text-white shadow-xs' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
        >
          <CalendarIcon class="w-4 h-4" />
          <span>Année scolaire en cours ({{ activeSchoolYear || '2026/2027' }})</span>
          <span 
            class="text-[11px] px-1.5 py-0.2 rounded-full font-bold"
            :class="activeTab === 'current' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'"
          >
            {{ currentYearInvoices.length }}
          </span>
        </button>

        <!-- Tab 2: Anciennes années -->
        <button
          type="button"
          @click="activeTab = 'archive'"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          :class="activeTab === 'archive' 
            ? 'bg-emerald-600 text-white shadow-xs' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
        >
          <HistoryIcon class="w-4 h-4" />
          <span>Années précédentes</span>
          <span 
            class="text-[11px] px-1.5 py-0.2 rounded-full font-bold"
            :class="activeTab === 'archive' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'"
          >
            {{ pastYearInvoices.length }}
          </span>
        </button>

        <!-- Tab 3: Toutes les factures -->
        <button
          type="button"
          @click="activeTab = 'all'"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          :class="activeTab === 'all' 
            ? 'bg-slate-900 text-white shadow-xs' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
        >
          <span>Toutes les factures</span>
          <span 
            class="text-[11px] px-1.5 py-0.2 rounded-full font-bold"
            :class="activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
          >
            {{ invoices.length }}
          </span>
        </button>
      </div>

      <div class="text-xs text-slate-500 font-medium px-2">
        {{ displayedInvoices.length }} facture{{ displayedInvoices.length > 1 ? 's' : '' }} affichée{{ displayedInvoices.length > 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>

    <!-- Encart Spécial Année Active si Reste à Payer connu via le Dashboard mais pas encore de facture émise -->
    <div 
      v-else-if="activeTab === 'current' && currentYearInvoices.length === 0 && activeYearRemainingDue > 0"
      class="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-5"
    >
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <CreditCardIcon class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">Solde d'inscription à régler (Année {{ activeSchoolYear }})</h3>
            <p class="text-xs text-slate-500 mt-0.5">Le reçu de paiement ou la facture sera émis dès validation de votre règlement.</p>
          </div>
        </div>

        <div class="sm:text-right">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Montant en attente</span>
          <span class="text-2xl font-black text-amber-600">{{ formatCurrency(activeYearRemainingDue) }}</span>
        </div>
      </div>

      <!-- Détail par pôle -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 flex items-center justify-between">
          <span class="font-medium text-slate-700">Cours de langue Arabe</span>
          <span class="font-bold text-slate-900 text-sm">
            {{ formatCurrency(dashboardData?.amountDueArabic ?? dashboardData?.amountDue?.amountDueArabic ?? activeYearRemainingDue) }}
          </span>
        </div>
        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex items-center justify-between">
          <span class="font-medium text-slate-700">Soutien Scolaire</span>
          <span class="font-bold text-slate-900 text-sm">
            {{ formatCurrency(dashboardData?.amountDueSoutien ?? dashboardData?.amountDue?.amountDueSoutien ?? 0) }}
          </span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <p class="text-xs text-slate-500">
          Vous pouvez effectuer le règlement en ligne ou transmettre vos justificatifs de paiement au secrétariat.
        </p>

        <button
          type="button"
          @click="goToRequests"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex-shrink-0"
        >
          <CreditCardIcon class="w-4 h-4" />
          <span>Accéder aux demandes / Régler</span>
          <ArrowRightIcon class="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>

    <!-- Empty State Standard -->
    <div v-else-if="displayedInvoices.length === 0" class="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <ReceiptIcon class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-slate-800 mb-1">Aucune facture dans cette catégorie</h3>
      <p class="text-sm text-slate-500 max-w-md mx-auto">
        {{ activeTab === 'current' 
          ? "Aucune facture émise pour le moment pour l'année scolaire en cours." 
          : "Aucune facture archivée n'a été trouvée pour votre compte." }}
      </p>
    </div>

    <!-- Invoices List -->
    <div v-else class="space-y-4">
      <!-- Desktop Table View -->
      <div class="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <th class="px-6 py-4">N° Facture</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Année</th>
              <th class="px-6 py-4">Montant total</th>
              <th class="px-6 py-4">Montant réglé</th>
              <th class="px-6 py-4">Restant à payer</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="invoice in displayedInvoices" 
              :key="invoice.id" 
              class="hover:bg-slate-50/80 cursor-pointer transition-colors group"
              @click="goToInvoice(invoice.id)"
            >
              <!-- N° Facture -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <FileTextIcon class="w-4 h-4" />
                  </div>
                  <div>
                    <span class="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      #{{ invoice.id }}
                    </span>
                    <p v-if="invoice.paymentCount > 0" class="text-[11px] text-slate-500">
                      {{ invoice.paymentCount }} versement{{ invoice.paymentCount > 1 ? 's' : '' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Date -->
              <td class="px-6 py-4 text-slate-700 font-medium">
                {{ formatDate(invoice.date) }}
              </td>

              <!-- Année Scolaire -->
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold"
                  :class="invoice.isActiveSchoolYear 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'"
                >
                  {{ invoice.schoolYear || (invoice.schoolYears && invoice.schoolYears[0]) || '-' }}
                </span>
              </td>

              <!-- Montant Total -->
              <td class="px-6 py-4 font-bold text-slate-900">
                {{ formatCurrency(invoice.totalAmount, invoice.currency) }}
              </td>

              <!-- Montant Réglé -->
              <td class="px-6 py-4 text-emerald-700 font-semibold">
                {{ formatCurrency(invoice.amountPaid || invoice.totalAmount, invoice.currency) }}
              </td>

              <!-- Restant à payer -->
              <td class="px-6 py-4">
                <span 
                  v-if="getRemainingAmount(invoice) > 0"
                  class="text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-md text-xs inline-block"
                >
                  {{ formatCurrency(getRemainingAmount(invoice), invoice.currency) }}
                </span>
                <span 
                  v-else 
                  class="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1"
                >
                  <CheckCircle2Icon class="w-3 h-3" />
                  0,00 € (Soldée)
                </span>
              </td>

              <!-- Statut -->
              <td class="px-6 py-4">
                <span 
                  v-if="invoice.status === 'paid' || getRemainingAmount(invoice) === 0" 
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"
                >
                  <CheckCircle2Icon class="w-3.5 h-3.5" />
                  Payée
                </span>
                <span 
                  v-else-if="invoice.status === 'partial'" 
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800"
                >
                  Partielle
                </span>
                <span 
                  v-else 
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"
                >
                  En attente
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <!-- Bouton Télécharger PDF direct -->
                  <button
                    type="button"
                    @click="downloadPdf(invoice.id)"
                    :disabled="downloadingId === invoice.id"
                    class="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    title="Télécharger la facture en PDF"
                  >
                    <div v-if="downloadingId === invoice.id" class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <DownloadIcon v-else class="w-4 h-4" />
                  </button>

                  <!-- Bouton Détails -->
                  <button
                    type="button"
                    @click="goToInvoice(invoice.id)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Détails</span>
                    <ChevronRightIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards View -->
      <div class="md:hidden space-y-4">
        <div 
          v-for="invoice in displayedInvoices" 
          :key="'mob-' + invoice.id" 
          class="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 cursor-pointer hover:border-emerald-300 transition-all space-y-4"
          @click="goToInvoice(invoice.id)"
        >
          <!-- Header Card -->
          <div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <FileTextIcon class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-bold text-base text-slate-900">Facture #{{ invoice.id }}</h4>
                <p class="text-xs text-slate-500">{{ formatDate(invoice.date) }}</p>
              </div>
            </div>

            <span 
              v-if="invoice.status === 'paid' || getRemainingAmount(invoice) === 0" 
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"
            >
              Payée
            </span>
            <span 
              v-else-if="invoice.status === 'partial'" 
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800"
            >
              Partielle
            </span>
            <span 
              v-else 
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"
            >
              En attente
            </span>
          </div>

          <!-- Montants Grid -->
          <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div>
              <p class="text-slate-400 font-semibold uppercase text-[10px] mb-0.5">Montant total</p>
              <p class="text-slate-900 font-black text-sm">{{ formatCurrency(invoice.totalAmount, invoice.currency) }}</p>
            </div>
            <div>
              <p class="text-slate-400 font-semibold uppercase text-[10px] mb-0.5">Montant réglé</p>
              <p class="text-emerald-700 font-bold text-sm">{{ formatCurrency(invoice.amountPaid || invoice.totalAmount, invoice.currency) }}</p>
            </div>
            <div>
              <p class="text-slate-400 font-semibold uppercase text-[10px] mb-0.5">Reste à payer</p>
              <p 
                class="font-black text-sm"
                :class="getRemainingAmount(invoice) > 0 ? 'text-amber-600' : 'text-emerald-600'"
              >
                {{ formatCurrency(getRemainingAmount(invoice), invoice.currency) }}
              </p>
            </div>
            <div>
              <p class="text-slate-400 font-semibold uppercase text-[10px] mb-0.5">Année scolaire</p>
              <p class="text-slate-800 font-bold">
                {{ invoice.schoolYear || (invoice.schoolYears && invoice.schoolYears[0]) || '-' }}
              </p>
            </div>
          </div>

          <!-- Actions Mobile -->
          <div class="flex items-center justify-between gap-3 pt-2" @click.stop>
            <button
              type="button"
              @click="downloadPdf(invoice.id)"
              :disabled="downloadingId === invoice.id"
              class="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex-1 cursor-pointer"
            >
              <div v-if="downloadingId === invoice.id" class="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
              <DownloadIcon v-else class="w-3.5 h-3.5 text-slate-500" />
              <span>Télécharger PDF</span>
            </button>

            <button
              type="button"
              @click="goToInvoice(invoice.id)"
              class="inline-flex items-center justify-center gap-1 py-2 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex-1 cursor-pointer"
            >
              <span>Consulter</span>
              <ChevronRightIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div 
        v-if="pagination && pagination.pages > 1" 
        class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex justify-between items-center"
      >
        <button 
          class="px-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
          :disabled="pagination.page === 1"
          @click="fetchInvoices(pagination.page - 1)"
        >
          Précédent
        </button>
        <span class="text-xs sm:text-sm text-slate-600 font-medium">
          Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} factures au total)
        </span>
        <button 
          class="px-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
          :disabled="pagination.page === pagination.pages"
          @click="fetchInvoices(pagination.page + 1)"
        >
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileTextIcon,
  ReceiptIcon,
  DownloadIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  CalendarIcon,
  HistoryIcon,
  ChevronRightIcon,
  ArrowRightIcon
} from 'lucide-vue-next'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import { getInvoices, downloadInvoicePdf, getParentDashboard } from '@/services/parentApi.js'

const router = useRouter()
const isLoading = ref(true)
const error = ref('')
const invoices = ref([])
const activeSchoolYear = ref('2026/2027')
const pagination = ref(null)
const activeTab = ref('current') // 'current' | 'archive' | 'all'
const downloadingId = ref(null)
const dashboardData = ref(null)

// Calculate true remaining amount for an invoice
const getRemainingAmount = (invoice) => {
  if (invoice.status === 'paid') return 0
  const payable = parseFloat(invoice.amountPayable || invoice.totalAmount) || 0
  const paid = parseFloat(invoice.amountPaid) || 0
  const diff = payable - paid
  return diff > 0 ? diff : 0
}

// Invoices for active school year
const currentYearInvoices = computed(() => {
  return invoices.value.filter(inv => {
    if (inv.isActiveSchoolYear === true) return true
    if (inv.schoolYear && inv.schoolYear === activeSchoolYear.value) return true
    if (Array.isArray(inv.schoolYears) && inv.schoolYears.includes(activeSchoolYear.value)) return true
    return false
  })
})

// Invoices for past years / archives
const pastYearInvoices = computed(() => {
  return invoices.value.filter(inv => {
    if (inv.isActiveSchoolYear === true) return false
    if (inv.schoolYear && inv.schoolYear === activeSchoolYear.value) return false
    if (Array.isArray(inv.schoolYears) && inv.schoolYears.includes(activeSchoolYear.value)) return false
    return true
  })
})

// Invoices displayed based on active tab
const displayedInvoices = computed(() => {
  if (activeTab.value === 'current') {
    return currentYearInvoices.value
  }
  if (activeTab.value === 'archive') {
    return pastYearInvoices.value
  }
  return invoices.value
})

// Current school year outstanding amount from dashboard or invoices
const activeYearRemainingDue = computed(() => {
  // If invoices exist for current school year, check if there is an invoice remaining
  let invRemaining = 0
  currentYearInvoices.value.forEach(inv => {
    invRemaining += getRemainingAmount(inv)
  })

  // Amount due from dashboard
  const dashDue = Number(dashboardData.value?.amountDue?.total ?? (
    (Number(dashboardData.value?.amountDueArabic) || 0) + (Number(dashboardData.value?.amountDueSoutien) || 0)
  ))
  const dashOutstanding = Number(dashboardData.value?.invoices?.outstandingAmount) || 0

  if (currentYearInvoices.value.length === 0) {
    if (dashDue > 0) return dashDue
    if (dashOutstanding > 0) return dashOutstanding
    return 0
  }

  // If invoices exist, but dashboard has an amount due that exceeds invoice remaining
  return Math.max(invRemaining, dashOutstanding, dashDue)
})

// Financial KPI summaries - DYNAMIQUES SELON L'ONGLET SÉLECTIONNÉ
const kpis = computed(() => {
  // 1. ONGLET ANNÉE EN COURS
  if (activeTab.value === 'current') {
    const invList = currentYearInvoices.value
    let totalInvoiced = 0
    let totalPaid = 0
    let remainingDue = 0
    let totalPaymentsCount = 0

    invList.forEach(inv => {
      totalInvoiced += (parseFloat(inv.totalAmount) || 0)
      totalPaid += (parseFloat(inv.amountPaid) || 0)
      remainingDue += getRemainingAmount(inv)
      totalPaymentsCount += (Number(inv.paymentCount) || 0)
    })

    const dashDue = Number(dashboardData.value?.amountDue?.total ?? (
      (Number(dashboardData.value?.amountDueArabic) || 0) + (Number(dashboardData.value?.amountDueSoutien) || 0)
    ))
    const dashInvoiced = Number(dashboardData.value?.invoices?.invoicedAmount) || 0
    const dashPaid = Number(dashboardData.value?.invoices?.paidAmount) || 0
    const dashOutstanding = Number(dashboardData.value?.invoices?.outstandingAmount) || 0

    if (invList.length === 0) {
      if (dashDue > 0) {
        remainingDue = dashDue
        totalInvoiced = dashInvoiced > 0 ? dashInvoiced : dashDue
        totalPaid = dashPaid
      } else if (dashOutstanding > 0) {
        remainingDue = dashOutstanding
        totalInvoiced = dashInvoiced > 0 ? dashInvoiced : dashOutstanding
        totalPaid = dashPaid
      }
    } else {
      if (dashDue > 0 && dashPaid < dashDue && remainingDue === 0) {
        remainingDue = dashDue - dashPaid
      }
    }

    return {
      labels: {
        invoiced: `Total facturé (${activeSchoolYear.value || '2026/2027'})`,
        paid: `Total réglé (${activeSchoolYear.value || '2026/2027'})`,
        remaining: `Reste à payer (${activeSchoolYear.value || '2026/2027'})`,
        period: 'Année active'
      },
      periodTitle: activeSchoolYear.value || '2026/2027',
      periodSubtitle: `${invList.length} facture${invList.length > 1 ? 's' : ''} en cours`,
      invoicesCountLabel: `${invList.length} facture${invList.length > 1 ? 's' : ''} émise${invList.length > 1 ? 's' : ''}`,
      totalInvoiced,
      totalPaid,
      remainingDue,
      totalPaymentsCount
    }
  }

  // 2. ONGLET ANNÉES PRÉCÉDENTES (ARCHIVES)
  if (activeTab.value === 'archive') {
    const invList = pastYearInvoices.value
    let totalInvoiced = 0
    let totalPaid = 0
    let remainingDue = 0
    let totalPaymentsCount = 0

    invList.forEach(inv => {
      totalInvoiced += (parseFloat(inv.totalAmount) || 0)
      totalPaid += (parseFloat(inv.amountPaid) || 0)
      remainingDue += getRemainingAmount(inv)
      totalPaymentsCount += (Number(inv.paymentCount) || 0)
    })

    return {
      labels: {
        invoiced: 'Total facturé (Archives)',
        paid: 'Total réglé (Archives)',
        remaining: 'Reste à payer (Archives)',
        period: 'Période'
      },
      periodTitle: 'Archives',
      periodSubtitle: `${invList.length} facture${invList.length > 1 ? 's' : ''} antérieure${invList.length > 1 ? 's' : ''}`,
      invoicesCountLabel: `${invList.length} facture${invList.length > 1 ? 's' : ''} archivée${invList.length > 1 ? 's' : ''}`,
      totalInvoiced,
      totalPaid,
      remainingDue,
      totalPaymentsCount
    }
  }

  // 3. ONGLET TOUTES LES FACTURES (GLOBAL)
  let totalInvoiced = 0
  let totalPaid = 0
  let remainingDue = 0
  let totalPaymentsCount = 0

  invoices.value.forEach(inv => {
    totalInvoiced += (parseFloat(inv.totalAmount) || 0)
    totalPaid += (parseFloat(inv.amountPaid) || 0)
    remainingDue += getRemainingAmount(inv)
    totalPaymentsCount += (Number(inv.paymentCount) || 0)
  })

  // Si 0 factures pour l'année en cours mais un reste dû dashboard
  if (currentYearInvoices.value.length === 0 && activeYearRemainingDue.value > 0) {
    remainingDue += activeYearRemainingDue.value
    totalInvoiced += activeYearRemainingDue.value
  }

  return {
    labels: {
      invoiced: 'Total facturé (Global)',
      paid: 'Total réglé (Global)',
      remaining: 'Reste à payer (Global)',
      period: 'Période globale'
    },
    periodTitle: 'Toutes années',
    periodSubtitle: `${invoices.value.length} facture${invoices.value.length > 1 ? 's' : ''} au total`,
    invoicesCountLabel: `${invoices.value.length} facture${invoices.value.length > 1 ? 's' : ''} émise${invoices.value.length > 1 ? 's' : ''}`,
    totalInvoiced,
    totalPaid,
    remainingDue,
    totalPaymentsCount
  }
})

const fetchInvoices = async (page = 1) => {
  isLoading.value = true
  error.value = ''
  try {
    const [invoicesRes, dashRes] = await Promise.allSettled([
      getInvoices({ page, limit: 20 }),
      getParentDashboard()
    ])

    if (dashRes.status === 'fulfilled' && dashRes.value) {
      dashboardData.value = dashRes.value
      if (dashRes.value.schoolYear) {
        activeSchoolYear.value = dashRes.value.schoolYear
      }
    }

    if (invoicesRes.status === 'fulfilled' && invoicesRes.value) {
      const data = invoicesRes.value
      if (data.activeSchoolYear) {
        activeSchoolYear.value = data.activeSchoolYear
      }
      invoices.value = data.items || []
      pagination.value = data.pagination || null
    }
  } catch (e) {
    console.error('Erreur chargement des factures:', e)
    error.value = "Impossible de charger la liste des factures."
  } finally {
    isLoading.value = false
  }
}

const goToInvoice = (id) => {
  router.push(`/home/invoices/${id}`)
}

const goToRequests = () => {
  router.push('/home/requests')
}

const downloadPdf = async (invoiceId) => {
  downloadingId.value = invoiceId
  try {
    const blob = await downloadInvoicePdf(invoiceId)
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `facture-${invoiceId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Erreur téléchargement PDF:', e)
    error.value = `Erreur lors du téléchargement du PDF de la facture #${invoiceId}.`
  } finally {
    downloadingId.value = null
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'EUR'
  }).format(parseFloat(amount) || 0)
}

onMounted(() => {
  fetchInvoices(1)
})
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
</style>
