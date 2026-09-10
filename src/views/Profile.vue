<template>
  <div class="profile-view">
    <div class="profile-view__container">
      <section class="profile-view__hero">
        <BaseCard class="profile-view__hero-card">
          <div class="profile-view__hero-content">
            <div class="profile-view__identity">
              <div class="profile-view__avatar-wrap">
                <div class="profile-view__avatar-initials" style="width: 120px; height: 120px; border-radius: 50%; background-color: #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 40px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                  {{ userInitials }}
                </div>
              </div>
              <div class="profile-view__identity-copy">
                <div class="profile-view__badges">
                  <BaseBadge>Parent</BaseBadge>
                </div>
                <h1 class="profile-view__title">
                  {{ profile.displayName || profile.email }}
                </h1>
                <p class="profile-view__email">{{ profile.email }}</p>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <div class="profile-view__grid">
        <!-- Informations principales -->
        <section class="profile-view__section">
          <BaseCard class="profile-view__section-card">
            <h2 class="profile-view__section-title">Informations de connexion</h2>
            <BaseAlert v-if="successMessage" type="success" class="mb-6">
              {{ successMessage }}
            </BaseAlert>
            <BaseAlert v-if="error" type="error" class="mb-6">
              {{ error }}
            </BaseAlert>

            <form @submit.prevent="handleSaveProfile" class="profile-view__form space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="profile-view__field">
                  <label class="profile-view__label">Prénom</label>
                  <input v-model="form.firstName" type="text" class="profile-view__input" />
                  <span v-if="formErrors.firstName" class="text-sm text-red-500 mt-1">{{ formErrors.firstName }}</span>
                </div>
                <div class="profile-view__field">
                  <label class="profile-view__label">Nom</label>
                  <input v-model="form.lastName" type="text" class="profile-view__input" />
                  <span v-if="formErrors.lastName" class="text-sm text-red-500 mt-1">{{ formErrors.lastName }}</span>
                </div>
              </div>

              <div class="profile-view__field">
                <label class="profile-view__label">Adresse E-mail</label>
                <input v-model="form.email" type="email" class="profile-view__input" required />
                <span v-if="formErrors.email" class="text-sm text-red-500 mt-1">{{ formErrors.email }}</span>
              </div>

              <div class="profile-view__field">
                <label class="profile-view__label">Statut familial</label>
                <select v-model="form.familyStatus" class="profile-view__input">
                  <option value="married">Marié(e)</option>
                  <option value="divorced">Divorcé(e)</option>
                </select>
                <span v-if="formErrors.familyStatus" class="text-sm text-red-500 mt-1">{{ formErrors.familyStatus }}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <!-- Père -->
                <div class="space-y-4">
                  <h3 class="font-bold text-slate-700">Informations du père</h3>
                  <div class="profile-view__field">
                    <label class="profile-view__label">Prénom</label>
                    <input v-model="form.fatherFirstName" type="text" class="profile-view__input" />
                    <span v-if="formErrors.fatherFirstName" class="text-sm text-red-500 mt-1">{{ formErrors.fatherFirstName }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label">Nom</label>
                    <input v-model="form.fatherLastName" type="text" class="profile-view__input" />
                    <span v-if="formErrors.fatherLastName" class="text-sm text-red-500 mt-1">{{ formErrors.fatherLastName }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label">Email</label>
                    <input v-model="form.fatherEmail" type="email" class="profile-view__input" />
                    <span v-if="formErrors.fatherEmail" class="text-sm text-red-500 mt-1">{{ formErrors.fatherEmail }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label">Téléphone</label>
                    <input v-model="form.fatherPhone" type="text" class="profile-view__input" />
                    <span v-if="formErrors.fatherPhone" class="text-sm text-red-500 mt-1">{{ formErrors.fatherPhone }}</span>
                  </div>
                </div>

                <!-- Mère -->
                <div class="space-y-4">
                  <h3 class="font-bold text-slate-700">Informations de la mère</h3>
                  <div class="profile-view__field">
                    <label class="profile-view__label">Prénom</label>
                    <input v-model="form.motherFirstName" type="text" class="profile-view__input" />
                    <span v-if="formErrors.motherFirstName" class="text-sm text-red-500 mt-1">{{ formErrors.motherFirstName }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label">Nom</label>
                    <input v-model="form.motherLastName" type="text" class="profile-view__input" />
                    <span v-if="formErrors.motherLastName" class="text-sm text-red-500 mt-1">{{ formErrors.motherLastName }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label">Email</label>
                    <input v-model="form.motherEmail" type="email" class="profile-view__input" />
                    <span v-if="formErrors.motherEmail" class="text-sm text-red-500 mt-1">{{ formErrors.motherEmail }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label">Téléphone</label>
                    <input v-model="form.motherPhone" type="text" class="profile-view__input" />
                    <span v-if="formErrors.motherPhone" class="text-sm text-red-500 mt-1">{{ formErrors.motherPhone }}</span>
                  </div>
                </div>
              </div>

              <div class="pt-6">
                <BaseButton type="submit" variant="primary" :disabled="isSaving" class="w-full sm:w-auto">
                  <template v-if="isSaving">Enregistrement...</template>
                  <template v-else>Enregistrer les modifications</template>
                </BaseButton>
              </div>
            </form>
          </BaseCard>
        </section>

        <!-- Sécurité -->
        <section class="profile-view__section">
          <BaseCard class="profile-view__section-card">
            <h2 class="profile-view__section-title">Sécurité</h2>
            <p class="profile-view__section-subtitle">Modifier votre mot de passe</p>
            
            <BaseAlert v-if="pwdSuccessMessage" type="success" class="mb-6">
              {{ pwdSuccessMessage }}
            </BaseAlert>
            <BaseAlert v-if="pwdError" type="error" class="mb-6">
              {{ pwdError }}
            </BaseAlert>

            <form @submit.prevent="handleSavePassword" class="profile-view__form space-y-6">
              <div class="profile-view__field">
                <label class="profile-view__label">Mot de passe actuel</label>
                <input v-model="pwdForm.currentPassword" type="password" class="profile-view__input" required />
                <span v-if="pwdFormErrors.currentPassword" class="text-sm text-red-500 mt-1">{{ pwdFormErrors.currentPassword }}</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="profile-view__field">
                  <label class="profile-view__label">Nouveau mot de passe</label>
                  <input v-model="pwdForm.password" type="password" class="profile-view__input" required minlength="8" />
                  <span v-if="pwdFormErrors.password" class="text-sm text-red-500 mt-1">{{ pwdFormErrors.password }}</span>
                </div>
                <div class="profile-view__field">
                  <label class="profile-view__label">Confirmer le mot de passe</label>
                  <input v-model="pwdForm.confirmPassword" type="password" class="profile-view__input" required minlength="8" />
                  <span v-if="pwdFormErrors.confirmPassword" class="text-sm text-red-500 mt-1">{{ pwdFormErrors.confirmPassword }}</span>
                </div>
              </div>
              <div class="pt-4">
                <BaseButton type="submit" variant="secondary" :disabled="isSavingPwd">
                  Mettre à jour le mot de passe
                </BaseButton>
              </div>
            </form>
          </BaseCard>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import { logout } from '@/services/authApi.js'
import { getParentProfile, updateParentProfile, updateParentPassword } from '@/services/parentApi.js'

const router = useRouter()

const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')
const formErrors = ref({})

const isSavingPwd = ref(false)
const pwdError = ref('')
const pwdSuccessMessage = ref('')
const pwdFormErrors = ref({})

const profile = ref({
  email: '',
  displayName: '',
})

const userInitials = computed(() => {
  const name = profile.value.displayName || profile.value.email || '';
  if (!name) return 'U';
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return 'U';
})

const originalForm = ref({})

const form = ref({
  email: '',
  firstName: '',
  lastName: '',
  fatherFirstName: '',
  fatherLastName: '',
  fatherEmail: '',
  fatherPhone: '',
  motherFirstName: '',
  motherLastName: '',
  motherEmail: '',
  motherPhone: '',
  familyStatus: 'married'
})

const pwdForm = ref({
  currentPassword: '',
  password: '',
  confirmPassword: ''
})

onMounted(async () => {
  await fetchProfile()
})

const fetchProfile = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const data = await getParentProfile()
    profile.value = data
    
    const parentData = data.parent || {}
    
    form.value = {
      email: data.email || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      fatherFirstName: parentData.father?.firstName || '',
      fatherLastName: parentData.father?.lastName || '',
      fatherEmail: parentData.father?.email || '',
      fatherPhone: parentData.father?.phone || '',
      motherFirstName: parentData.mother?.firstName || '',
      motherLastName: parentData.mother?.lastName || '',
      motherEmail: parentData.mother?.email || '',
      motherPhone: parentData.mother?.phone || '',
      familyStatus: parentData.familyStatus || 'married'
    }
    
    originalForm.value = { ...form.value }
  } catch (e) {
    console.error('Erreur de chargement', e)
    error.value = "Impossible de charger le profil."
  } finally {
    isLoading.value = false
  }
}

const handleSaveProfile = async () => {
  isSaving.value = true
  error.value = ''
  successMessage.value = ''
  formErrors.value = {}
  
  // N'envoyer que les champs modifiés
  const changedData = {}
  for (const key in form.value) {
    if (form.value[key] !== originalForm.value[key]) {
      changedData[key] = form.value[key]
    }
  }

  if (Object.keys(changedData).length === 0) {
    successMessage.value = "Aucune modification n'a été apportée."
    isSaving.value = false
    return
  }

  try {
    const res = await updateParentProfile(changedData)
    successMessage.value = res.message || "Le profil a été mis à jour."
    
    if (res.reauthenticationRequired) {
      setTimeout(() => {
        logout()
        router.push('/login')
      }, 3000)
    } else {
      await fetchProfile()
    }
  } catch (e) {
    console.error('Erreur mise à jour', e)
    if (e.response?.data?.errors) {
      formErrors.value = e.response.data.errors
    }
    error.value = e.response?.data?.message || "Une erreur est survenue lors de la mise à jour."
  } finally {
    isSaving.value = false
  }
}

const handleSavePassword = async () => {
  if (pwdForm.value.password !== pwdForm.value.confirmPassword) {
    pwdError.value = "Les nouveaux mots de passe ne correspondent pas."
    return
  }

  isSavingPwd.value = true
  pwdError.value = ''
  pwdSuccessMessage.value = ''
  pwdFormErrors.value = {}

  try {
    const res = await updateParentPassword(pwdForm.value)
    pwdSuccessMessage.value = res.message || "Le mot de passe a été mis à jour avec succès."
    pwdForm.value = { currentPassword: '', password: '', confirmPassword: '' }
  } catch (e) {
    console.error('Erreur mot de passe', e)
    if (e.response?.data?.errors) {
      pwdFormErrors.value = e.response.data.errors
    }
    pwdError.value = e.response?.data?.message || "Une erreur est survenue lors de la mise à jour du mot de passe."
  } finally {
    isSavingPwd.value = false
  }
}
</script>

<style scoped>
.profile-view {
  max-width: 1024px;
  margin: 0 auto;
}

.profile-view__hero {
  margin-bottom: 2rem;
}

@media (min-width: 1024px) {
  .profile-view__grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    align-items: start;
  }
}

.profile-view__hero-card {
  overflow: hidden;
  position: relative;
  border-radius: 1rem;
}

.profile-view__hero-content {
  padding: 2rem;
}

.profile-view__identity {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.profile-view__identity-copy {
  display: flex;
  flex-direction: column;
}

.profile-view__badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.profile-view__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.profile-view__email {
  color: var(--color-text-light);
}

.profile-view__section {
  margin-bottom: 2rem;
}

.profile-view__section-card {
  padding: 2rem;
  border-radius: 1rem;
}

.profile-view__section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.profile-view__section-subtitle {
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
}

.profile-view__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.profile-view__input {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
}

.profile-view__input:focus {
  border-color: var(--color-primary);
  background-color: white;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

@media (max-width: 768px) {
  .profile-view__identity {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .profile-view__badges {
    justify-content: center;
  }
}
</style>
