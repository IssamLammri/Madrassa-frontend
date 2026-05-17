<template>
  <div class="profile-view">
    <div class="profile-view__container">
      <section class="profile-view__hero">
        <BaseCard class="profile-view__hero-card">
          <div class="profile-view__hero-content">
            <div class="profile-view__identity">
              <div class="profile-view__avatar-wrap">
                <input
                    ref="pictureInputRef"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    class="profile-view__avatar-input"
                    @change="handlePictureChange"
                />

                <button
                    type="button"
                    class="profile-view__avatar-button"
                    @click="openPicturePicker"
                >
                  <img
                      :src="avatarPreview || profile.avatar"
                      :alt="profile.fullName"
                      class="profile-view__avatar"
                  />

                  <span class="profile-view__avatar-edit">
                    {{ t('profile.change_photo', 'Changer') }}
                  </span>
                </button>
              </div>

              <div class="profile-view__identity-copy">
                <div class="profile-view__badges">
                  <BaseBadge>{{ profile.role }}</BaseBadge>
                  <BaseBadge>{{ profile.preferredLanguage.toUpperCase() }}</BaseBadge>
                </div>

                <h1 class="profile-view__title">
                  {{ profile.fullName }}
                </h1>

                <p class="profile-view__subtitle">
                  {{ profile.company }}
                </p>

                <div class="profile-view__meta">
                  <span>{{ profile.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <section class="profile-view__grid">
        <BaseCard class="profile-view__panel">
          <div class="profile-view__section-head">
            <div>
              <h2 class="profile-view__section-title">
                {{ t('profile.personal_info', 'Informations personnelles') }}
              </h2>
              <p class="profile-view__section-subtitle">
                {{ t('profile.personal_info_desc', 'Mettez à jour les informations de votre compte.') }}
              </p>
            </div>
          </div>

          <BaseAlert
              v-if="error"
              :title="t('profile.update_error_title', 'Erreur')"
              :description="error"
          />

          <BaseAlert
              v-if="successMessage"
              :title="t('common.success', 'Succès')"
              :description="successMessage"
          />

          <form class="profile-view__form" @submit.prevent="handleUpdateProfile">
            <div class="profile-view__form-grid">
              <div class="profile-view__field">
                <label class="profile-view__label">
                  {{ t('profile.first_name', 'Prénom') }}
                </label>
                <input
                    v-model="form.firstName"
                    type="text"
                    class="profile-view__input"
                />
              </div>

              <div class="profile-view__field">
                <label class="profile-view__label">
                  {{ t('profile.last_name', 'Nom') }}
                </label>
                <input
                    v-model="form.lastName"
                    type="text"
                    class="profile-view__input"
                />
              </div>

              <div class="profile-view__field profile-view__field--full">
                <label class="profile-view__label">
                  {{ t('auth.email_label', 'Email') }}
                </label>
                <input
                    v-model="form.email"
                    type="email"
                    class="profile-view__input"
                />
              </div>

              <div class="profile-view__field profile-view__field--full">
                <label class="profile-view__label">
                  {{ t('profile.company', 'Entreprise') }}
                </label>
                <input
                    v-model="form.company"
                    type="text"
                    class="profile-view__input"
                />
              </div>

              <div class="profile-view__field profile-view__field--full">
                <label class="profile-view__label">
                  {{ t('layout.language', 'Langue') }}
                </label>

                <select v-model="form.preferredLanguage" class="profile-view__select">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div class="profile-view__form-actions">
              <BaseButton type="submit" :disabled="isLoading">
                {{
                  isLoading ? t('common.loading', 'Chargement...') : t('profile.update_profile', 'Mettre à jour le profil')
                }}
              </BaseButton>
            </div>
          </form>
        </BaseCard>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import { getCurrentUser, logout, updateProfile } from '@/services/authApi.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t, locale } = useI18n()

const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

const pictureInputRef = ref(null)
const avatarPreview = ref('')

const profile = ref({
  fullName: '',
  email: '',
  company: '',
  avatar: '',
  preferredLanguage: 'fr',
  role: '',
})

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  picture: null,
  preferredLanguage: 'fr',
  roles: [],
})

function formatRole(roles) {
  const firstRole = Array.isArray(roles) ? roles[0] : roles

  switch (firstRole) {
    case 'ROLE_ADMIN':
      return 'Admin'
    case 'ROLE_USER':
      return 'Utilisateur'
    default:
      return firstRole || 'Utilisateur'
  }
}

function openPicturePicker() {
  pictureInputRef.value?.click()
}

function handlePictureChange(event) {
  const file = event.target.files?.[0]

  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  const maxSize = 5 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    error.value = t('auth.picture_upload_invalid_type', 'Le fichier doit être une image JPG, PNG ou WEBP.')
    return
  }

  if (file.size > maxSize) {
    error.value = t('auth.picture_upload_too_large', "L'image ne doit pas dépasser 5MB.")
    return
  }

  error.value = ''
  form.value.picture = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function loadCurrentUserProfile() {
  isLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const currentUser = await getCurrentUser()

    profile.value = {
      fullName: `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim(),
      email: currentUser.email ?? '',
      company: currentUser.company ?? '',
      avatar: currentUser.pictureUrl || 'https://i.pravatar.cc/120?img=32',
      preferredLanguage: currentUser.preferredLanguage || 'fr',
      role: formatRole(currentUser.roles),
    }

    form.value = {
      firstName: currentUser.firstName ?? '',
      lastName: currentUser.lastName ?? '',
      email: currentUser.email ?? '',
      company: currentUser.company ?? '',
      picture: null,
      preferredLanguage: currentUser.preferredLanguage || 'fr',
      roles: currentUser.roles ?? [],
    }

    avatarPreview.value = ''
    if (pictureInputRef.value) {
      pictureInputRef.value.value = ''
    }

    locale.value = form.value.preferredLanguage
  } catch (err) {
    error.value = err.response?.data?.message || t('common.generic_error', 'Une erreur est survenue.')
    logout()
    router.push('/login')
  } finally {
    isLoading.value = false
  }
}

async function handleUpdateProfile() {
  isLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const payload = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      company: form.value.company,
      preferredLanguage: form.value.preferredLanguage,
      roles: form.value.roles,
    }

    if (form.value.picture) {
      payload.picture = form.value.picture
    }

    const updatedUser = await updateProfile(payload)

    profile.value = {
      fullName: `${updatedUser.firstName ?? ''} ${updatedUser.lastName ?? ''}`.trim(),
      email: updatedUser.email ?? '',
      company: updatedUser.company ?? '',
      avatar: updatedUser.pictureUrl || 'https://i.pravatar.cc/120?img=32',
      preferredLanguage: updatedUser.preferredLanguage || 'fr',
      role: formatRole(updatedUser.roles),
    }

    form.value = {
      firstName: updatedUser.firstName ?? '',
      lastName: updatedUser.lastName ?? '',
      email: updatedUser.email ?? '',
      company: updatedUser.company ?? '',
      picture: null,
      preferredLanguage: updatedUser.preferredLanguage || 'fr',
      roles: updatedUser.roles ?? [],
    }

    avatarPreview.value = ''
    if (pictureInputRef.value) {
      pictureInputRef.value.value = ''
    }

    locale.value = form.value.preferredLanguage
    successMessage.value = t('profile.update_success', 'Le profil a été mis à jour avec succès.')
  } catch (err) {
    error.value = err.response?.data?.message || t('profile.update_error', 'Impossible de mettre à jour le profil.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCurrentUserProfile()
})
</script>

<style lang="scss" scoped>
@use "@/assets/stylePage/profile_style";
</style>