<template>
  <div class="profile-view portal-page">
    <div class="profile-view__container">
      <section class="profile-view__hero">
        <BaseCard class="profile-view__hero-card">
          <div class="profile-view__hero-content">
            <div class="profile-view__identity">
              <div class="profile-view__avatar-wrap">
                <div class="profile-view__avatar-initials">
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
                  <label class="profile-view__label" for="profile-field-1">Prénom</label>
                  <input id="profile-field-1" v-model="form.firstName" type="text" class="profile-view__input" />
                  <span v-if="formErrors.firstName" class="text-sm text-red-500 mt-1">{{ formErrors.firstName }}</span>
                </div>
                <div class="profile-view__field">
                  <label class="profile-view__label" for="profile-field-2">Nom</label>
                  <input id="profile-field-2" v-model="form.lastName" type="text" class="profile-view__input" />
                  <span v-if="formErrors.lastName" class="text-sm text-red-500 mt-1">{{ formErrors.lastName }}</span>
                </div>
              </div>

              <div class="profile-view__field">
                <label class="profile-view__label" for="profile-field-3">Adresse E-mail</label>
                <input id="profile-field-3" v-model="form.email" type="email" class="profile-view__input" required />
                <span v-if="formErrors.email" class="text-sm text-red-500 mt-1">{{ formErrors.email }}</span>
              </div>

              <div class="profile-view__field">
                <label class="profile-view__label" for="profile-field-4">Statut familial</label>
                <select id="profile-field-4" v-model="form.familyStatus" class="profile-view__input">
                  <option value="married">Marié(e)</option>
                  <option value="divorced">Divorcé(e)</option>
                </select>
                <span v-if="formErrors.familyStatus" class="text-sm text-red-500 mt-1">{{ formErrors.familyStatus }}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <!-- Père -->
                <div class="space-y-4">
                  <h3 class="font-medium text-slate-700">Informations du père</h3>
                  <div class="profile-view__field">
                    <label class="profile-view__label" for="profile-field-5">Prénom</label>
                    <input id="profile-field-5" v-model="form.fatherFirstName" type="text" class="profile-view__input" />
                    <span v-if="formErrors.fatherFirstName" class="text-sm text-red-500 mt-1">{{ formErrors.fatherFirstName }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label" for="profile-field-6">Nom</label>
                    <input id="profile-field-6" v-model="form.fatherLastName" type="text" class="profile-view__input" />
                    <span v-if="formErrors.fatherLastName" class="text-sm text-red-500 mt-1">{{ formErrors.fatherLastName }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label" for="profile-field-7">Email</label>
                    <input id="profile-field-7" v-model="form.fatherEmail" type="email" class="profile-view__input" />
                    <span v-if="formErrors.fatherEmail" class="text-sm text-red-500 mt-1">{{ formErrors.fatherEmail }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label" for="profile-field-8">Téléphone</label>
                    <input id="profile-field-8" v-model="form.fatherPhone" type="text" class="profile-view__input" />
                    <span v-if="formErrors.fatherPhone" class="text-sm text-red-500 mt-1">{{ formErrors.fatherPhone }}</span>
                  </div>
                </div>

                <!-- Mère -->
                <div class="space-y-4">
                  <h3 class="font-medium text-slate-700">Informations de la mère</h3>
                  <div class="profile-view__field">
                    <label class="profile-view__label" for="profile-field-9">Prénom</label>
                    <input id="profile-field-9" v-model="form.motherFirstName" type="text" class="profile-view__input" />
                    <span v-if="formErrors.motherFirstName" class="text-sm text-red-500 mt-1">{{ formErrors.motherFirstName }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label" for="profile-field-10">Nom</label>
                    <input id="profile-field-10" v-model="form.motherLastName" type="text" class="profile-view__input" />
                    <span v-if="formErrors.motherLastName" class="text-sm text-red-500 mt-1">{{ formErrors.motherLastName }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label" for="profile-field-11">Email</label>
                    <input id="profile-field-11" v-model="form.motherEmail" type="email" class="profile-view__input" />
                    <span v-if="formErrors.motherEmail" class="text-sm text-red-500 mt-1">{{ formErrors.motherEmail }}</span>
                  </div>
                  <div class="profile-view__field">
                    <label class="profile-view__label" for="profile-field-12">Téléphone</label>
                    <input id="profile-field-12" v-model="form.motherPhone" type="text" class="profile-view__input" />
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
                <label class="profile-view__label" for="profile-field-13">Mot de passe actuel</label>
                <input id="profile-field-13" v-model="pwdForm.currentPassword" type="password" class="profile-view__input" required />
                <span v-if="pwdFormErrors.currentPassword" class="text-sm text-red-500 mt-1">{{ pwdFormErrors.currentPassword }}</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="profile-view__field">
                  <label class="profile-view__label" for="profile-field-14">Nouveau mot de passe</label>
                  <input id="profile-field-14" v-model="pwdForm.password" type="password" class="profile-view__input" required minlength="8" />
                  <span v-if="pwdFormErrors.password" class="text-sm text-red-500 mt-1">{{ pwdFormErrors.password }}</span>
                </div>
                <div class="profile-view__field">
                  <label class="profile-view__label" for="profile-field-15">Confirmer le mot de passe</label>
                  <input id="profile-field-15" v-model="pwdForm.confirmPassword" type="password" class="profile-view__input" required minlength="8" />
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
.profile-view__container { max-width: none; }
.profile-view__hero { margin-bottom: 24px; }
.profile-view__hero-content { padding: 0; }
.profile-view__identity { display: flex; align-items: center; gap: 20px; min-width: 0; }
.profile-view__avatar-initials { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: #f0f7f2; color: #123f35; font-size: 22px; font-weight: 500; }
.profile-view__identity-copy { min-width: 0; }
.profile-view__badges { margin-bottom: 8px; }
.profile-view__title { font-size: 28px; font-weight: 500; overflow-wrap: anywhere; }
.profile-view__email { color: var(--color-body); font-size: 14px; overflow-wrap: anywhere; }
.profile-view__grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr); align-items: start; gap: 24px; }
.profile-view__section-card { padding: 24px; }
.profile-view__section-title { font-size: 20px; font-weight: 500; }
.profile-view__section-subtitle { margin-top: 8px; color: var(--color-body); font-size: 14px; }
.profile-view__form { margin-top: 24px; }
.profile-view__field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.profile-view__label { font-size: 13px; font-weight: 500; color: var(--color-heading); }
.profile-view__input { width: 100%; min-height: 44px; padding: 10px 12px; background: var(--color-input-bg); border: 1px solid var(--color-border); border-radius: 8px; font-size: 15px; color: var(--color-heading); transition: border-color 160ms, background-color 160ms; }
.profile-view__input:focus { border-color: var(--color-primary); background: white; outline: 2px solid #c4ddcd; outline-offset: 1px; }
@media (max-width: 1200px) { .profile-view__grid { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 640px) { .profile-view__section-card { padding: 20px; } .profile-view__identity { gap: 16px; } .profile-view__title { font-size: 24px; } .profile-view__avatar-initials { width: 48px; height: 48px; font-size: 18px; } }
</style>
