<template>
  <div class="max-w-5xl mx-auto w-full">
    <!-- Breadcrumb -->
    <button @click="router.push('/home/invoices')" class="flex items-center text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
      <ArrowLeftIcon class="w-4 h-4 mr-1" />
      Retour aux factures
    </button>

    <BaseAlert v-if="error" type="error" class="mb-6">
      {{ error }}
    </BaseAlert>
    <BaseAlert v-if="successMessage" type="success" class="mb-6">
      {{ successMessage }}
    </BaseAlert>

    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>

    <div v-else-if="invoice">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- Header -->
        <div class="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">Facture #{{ invoice.id }}</h1>
            <p class="text-slate-500 mt-1">Date : {{ formatDate(invoice.date) }}</p>
          </div>
          
          <div class="flex flex-wrap gap-3">
            <BaseButton @click="downloadPdf" variant="secondary" class="flex items-center gap-2" :disabled="isDownloading">
              <DownloadIcon class="w-4 h-4" />
              <span v-if="isDownloading">Téléchargement...</span>
              <span v-else>Télécharger PDF</span>
            </BaseButton>
            
            <BaseButton @click="showEmailModal = true" variant="primary" class="flex items-center gap-2" :disabled="isSendingEmail">
              <MailIcon class="w-4 h-4" />
              Envoyer par email
            </BaseButton>
          </div>
        </div>

        <!-- Résumé -->
        <div class="p-6 sm:p-8 bg-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p class="text-sm text-slate-500 font-semibold mb-1 uppercase">Statut</p>
            <span v-if="invoice.status === 'paid'" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
              Payée
            </span>
            <span v-else-if="invoice.status === 'partial'" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-800">
              Paiement partiel
            </span>
            <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
              Non payée
            </span>
          </div>
          <div>
            <p class="text-sm text-slate-500 font-semibold mb-1 uppercase">Montant total</p>
            <p class="text-2xl font-bold text-slate-800">{{ formatCurrency(invoice.totalAmount, invoice.currency) }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500 font-semibold mb-1 uppercase">Restant à payer</p>
            <p class="text-2xl font-bold" :class="invoice.amountPayable > 0 ? 'text-red-600' : 'text-slate-800'">
              {{ formatCurrency(invoice.amountPayable, invoice.currency) }}
            </p>
          </div>
        </div>

        <!-- Détail des paiements -->
        <div class="p-6 sm:p-8">
          <h3 class="text-lg font-bold text-slate-800 mb-4">Détail des paiements</h3>
          
          <div v-if="!invoice.payments || invoice.payments.length === 0" class="text-slate-500 italic">
            Aucun paiement enregistré pour cette facture.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3">Date</th>
                  <th class="px-4 py-3">Montant</th>
                  <th class="px-4 py-3">Méthode</th>
                  <th class="px-4 py-3">Service / Enfant</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="payment in invoice.payments" :key="payment.id" class="hover:bg-slate-50">
                  <td class="px-4 py-3">{{ formatDate(payment.date) }}</td>
                  <td class="px-4 py-3 font-semibold">{{ formatCurrency(payment.amountPaid, invoice.currency) }}</td>
                  <td class="px-4 py-3">
                    <BaseBadge variant="neutral">{{ payment.method }}</BaseBadge>
                  </td>
                  <td class="px-4 py-3">
                    {{ payment.serviceType }} 
                    <span v-if="payment.child" class="text-slate-500"> - {{ payment.child.fullName }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Modal -->
    <div v-if="showEmailModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h3 class="text-xl font-bold text-slate-800 mb-4">Envoyer par email</h3>
        <p class="text-slate-600 text-sm mb-4">
          Choisissez l'adresse e-mail à laquelle vous souhaitez envoyer cette facture. (Doit être une adresse enregistrée dans votre profil parent)
        </p>
        
        <input v-model="emailToSend" type="email" placeholder="exemple@email.com" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none mb-6" />
        
        <div class="flex justify-end gap-3">
          <BaseButton @click="showEmailModal = false" variant="secondary">Annuler</BaseButton>
          <BaseButton @click="sendEmail" variant="primary" :disabled="isSendingEmail">
            <span v-if="isSendingEmail">Envoi...</span>
            <span v-else>Envoyer</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, DownloadIcon, MailIcon } from 'lucide-vue-next'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import { getInvoice, downloadInvoicePdf, sendInvoiceEmail } from '@/services/parentApi.js'

const route = useRoute()
const router = useRouter()
const invoiceId = route.params.id

const isLoading = ref(true)
const error = ref('')
const successMessage = ref('')
const invoice = ref(null)

const isDownloading = ref(false)
const showEmailModal = ref(false)
const isSendingEmail = ref(false)
const emailToSend = ref('')

onMounted(async () => {
  try {
    invoice.value = await getInvoice(invoiceId)
  } catch (e) {
    console.error(e)
    error.value = "Impossible de charger les détails de la facture."
  } finally {
    isLoading.value = false
  }
})

const downloadPdf = async () => {
  isDownloading.value = true
  error.value = ''
  try {
    const blob = await downloadInvoicePdf(invoiceId)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `facture-${invoiceId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
    error.value = "Erreur lors du téléchargement du PDF."
  } finally {
    isDownloading.value = false
  }
}

const sendEmail = async () => {
  isSendingEmail.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const payload = emailToSend.value ? { email: emailToSend.value } : {}
    await sendInvoiceEmail(invoiceId, payload)
    successMessage.value = "La facture a été envoyée par email avec succès."
    showEmailModal.value = false
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || "Erreur lors de l'envoi de l'email."
    showEmailModal.value = false
  } finally {
    isSendingEmail.value = false
  }
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
