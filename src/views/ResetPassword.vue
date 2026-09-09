<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
    <div class="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-md w-full">
      <div class="text-center mb-6 sm:mb-8">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Nouveau mot de passe</h1>
        <p class="text-sm text-slate-600">
          Veuillez définir votre nouveau mot de passe.
        </p>
      </div>

      <div v-if="successMessage" class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
        {{ errorMessage }}
      </div>

      <form v-if="!successMessage" @submit.prevent="submitReset">
        <div class="mb-4">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Nouveau mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            placeholder="8 caractères minimum"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Confirmer le mot de passe</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            placeholder="Confirmez le mot de passe"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">En cours...</span>
          <span v-else>Réinitialiser mon mot de passe</span>
        </button>
      </form>

      <div v-if="successMessage" class="mt-6 text-center">
        <router-link to="/login" class="inline-block py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-md transition-colors">
          Aller à la connexion
        </router-link>
      </div>

      <div v-if="!successMessage" class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-blue-600 hover:underline font-medium">
          Retour à la connexion
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const token = route.params.token

const isFormValid = computed(() => {
  return password.value.length >= 8 && password.value === confirmPassword.value
})

const submitReset = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas."
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = "Le mot de passe doit contenir au moins 8 caractères."
    return
  }

  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await axios.post(`https://ecole.ccib38.fr/api/parent/reset-password/${token}`, {
      password: password.value,
      confirmPassword: confirmPassword.value
    })
    
    successMessage.value = response.data?.message || 'Votre mot de passe a été réinitialisé avec succès.'
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
  } catch (error) {
    console.error('Reset password error:', error)
    errorMessage.value = error.response?.data?.message || 'Le lien de réinitialisation est invalide ou a expiré.'
  } finally {
    isLoading.value = false
  }
}
</script>
