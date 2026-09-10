<template>
  <div class="max-w-5xl mx-auto w-full">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Mes factures</h1>
        <p class="text-slate-600 mt-1">Consultez et téléchargez vos factures.</p>
      </div>
    </div>

    <BaseAlert v-if="error" type="error" class="mb-6">
      {{ error }}
    </BaseAlert>

    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>

    <div v-else-if="invoices.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
      <h3 class="text-lg font-bold text-slate-800 mb-2">Aucune facture</h3>
      <p class="text-slate-600">Vous n'avez pas encore de factures.</p>
    </div>

    <div v-else>
      <!-- Desktop Table -->
      <div class="hidden sm:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">N° Facture</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Montant total</th>
              <th class="px-6 py-4">Restant à payer</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-slate-50 cursor-pointer transition-colors" @click="goToInvoice(invoice.id)">
              <td class="px-6 py-4 font-medium text-slate-800">
                #{{ invoice.id }}
              </td>
              <td class="px-6 py-4">
                {{ formatDate(invoice.date) }}
              </td>
              <td class="px-6 py-4">
                {{ formatCurrency(invoice.totalAmount, invoice.currency) }}
              </td>
              <td class="px-6 py-4">
                <span :class="invoice.amountPayable > 0 ? 'text-red-600 font-semibold' : 'text-slate-700'">
                  {{ formatCurrency(invoice.amountPayable, invoice.currency) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span v-if="invoice.status === 'paid'" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Payée
                </span>
                <span v-else-if="invoice.status === 'partial'" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Partiel
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Non payée
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <span class="text-emerald-600 hover:text-emerald-700 font-medium">Détails</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List -->
      <div class="sm:hidden space-y-4 mb-6">
        <div v-for="invoice in invoices" :key="invoice.id" class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 cursor-pointer" @click="goToInvoice(invoice.id)">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-bold text-slate-800">Facture #{{ invoice.id }}</p>
              <p class="text-xs text-slate-500">{{ formatDate(invoice.date) }}</p>
            </div>
            <span v-if="invoice.status === 'paid'" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Payée
            </span>
            <span v-else-if="invoice.status === 'partial'" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Partiel
            </span>
            <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Non payée
            </span>
          </div>
          <div class="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
            <span class="text-slate-600">Total: {{ formatCurrency(invoice.totalAmount, invoice.currency) }}</span>
            <span :class="invoice.amountPayable > 0 ? 'text-red-600 font-semibold' : 'text-slate-700 font-medium'">
              Reste: {{ formatCurrency(invoice.amountPayable, invoice.currency) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center" v-if="pagination && pagination.pages > 1">
        <button 
          class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          :disabled="pagination.page === 1"
          @click="fetchInvoices(pagination.page - 1)"
        >
          Précédent
        </button>
        <span class="text-sm text-slate-600">
          Page {{ pagination.page }} sur {{ pagination.pages }}
        </span>
        <button 
          class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import { getInvoices } from '@/services/parentApi.js'

const router = useRouter()
const isLoading = ref(true)
const error = ref('')
const invoices = ref([])
const pagination = ref(null)

const fetchInvoices = async (page = 1) => {
  isLoading.value = true
  error.value = ''
  try {
    const data = await getInvoices({ page, limit: 20 })
    invoices.value = data.items || []
    pagination.value = data.pagination
  } catch (e) {
    console.error(e)
    error.value = "Impossible de charger les factures."
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchInvoices(1)
})

const goToInvoice = (id) => {
  router.push(`/home/invoices/${id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(parseFloat(amount) || 0)
}
</script>
