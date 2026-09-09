<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
    <div class="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-md w-full">
      <div class="text-center mb-6 sm:mb-8">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Mot de passe oublié</h1>
        <p class="text-sm text-slate-600">
          Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <div v-if="successMessage" class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="submitEmail">
        <div class="mb-6">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Adresse E-mail</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="parent@example.com"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Envoi en cours...</span>
          <span v-else>Envoyer le lien</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-blue-600 hover:underline font-medium">
          Retour à la connexion
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const submitEmail = async () => {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await axios.post('https://ecole.ccib38.fr/api/parent/forgot-password', {
      email: email.value
    })
    
    successMessage.value = response.data?.message || 'Si un compte correspond à cette adresse, un email de réinitialisation a été envoyé.'
    email.value = ''
  } catch (error) {
    console.error('Forgot password error:', error)
    if (error.response && error.response.status === 404) {
       successMessage.value = 'Si un compte correspond à cette adresse, un email de réinitialisation a été envoyé.'
    } else {
       errorMessage.value = error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
