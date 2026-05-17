<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-800 mb-2">
        Liste de vos demandes
      </h1>
      <p class="text-slate-500">
        Retrouvez ci-dessous l'ensemble de vos demandes d'inscription.
      </p>
    </div>

    <div v-if="isLoading" class="flex justify-center p-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
    
    <div v-else-if="!demands.length" class="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
      <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
      </div>
      <h3 class="text-lg font-bold text-slate-800 mb-2">Aucune demande trouvée</h3>
      <p class="text-slate-500">Vous n'avez pas encore fait de demande d'inscription.</p>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="py-4 px-6 font-bold text-slate-600 text-sm">Enfant</th>
              <th class="py-4 px-6 font-bold text-slate-600 text-sm">Date de naissance</th>
              <th class="py-4 px-6 font-bold text-slate-600 text-sm">Date de demande</th>
              <th class="py-4 px-6 font-bold text-slate-600 text-sm">Statut / Classe</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="demand in demands" :key="demand.id" class="hover:bg-slate-50 transition-colors">
              <td class="py-4 px-6">
                <div class="font-bold text-slate-800">{{ demand.childFirstName }} {{ demand.childLastName }}</div>
              </td>
              <td class="py-4 px-6 text-slate-600">
                {{ formatDate(demand.childDob) }}
              </td>
              <td class="py-4 px-6 text-slate-600">
                {{ formatDate(demand.createdAt || new Date()) }}
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                      :class="demand.status === 'validé' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'">
                  {{ demand.status || 'En cours' }}
                </span>
                <div v-if="demand.className" class="text-xs text-slate-500 mt-1">
                  {{ demand.className }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/services/apiClient.js'

const demands = ref([])
const isLoading = ref(false)

const loadDemands = async () => {
  isLoading.value = true
  try {
    // Modify URL once backend endpoint for getting demands is available.
    const res = await api.get('/registrations/api/me') 
    if (res.data) {
      demands.value = Array.isArray(res.data) ? res.data : (res.data.registrations || [])
    }
  } catch (error) {
    if (error.response?.status !== 401 && error.response?.status !== 404) {
      console.error('Error fetching demands:', error)
    }
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('fr-FR')
  } catch (e) {
    return dateString
  }
}

onMounted(() => {
  loadDemands()
})
</script>