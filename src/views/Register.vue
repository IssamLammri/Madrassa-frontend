<template>
  <div class="register-page">
    <div class="register-page__deco" aria-hidden="true">
      <div class="register-page__blob register-page__blob--primary"></div>
      <div class="register-page__blob register-page__blob--accent"></div>
      <div class="register-page__blob register-page__blob--soft"></div>
      <div class="register-page__dot-grid"></div>
      <div class="register-page__line-deco"></div>
    </div>

    <BaseCard class="register-page__card">
      <div class="register-page__logo-wrap">
        <img :src="logoUrl" alt="CCIB38 Logo" class="register-page__logo"/>
      </div>

      <div class="register-page__header">
        <h1 class="register-page__title">
          {{ t('auth.register_title') }}
          <em>{{ t('auth.register_subtitle') }}</em>
        </h1>

        <p class="register-page__subtitle">
          {{ t('auth.register_desc') }}
        </p>
      </div>

      <form class="register-page__form" @submit.prevent="handleRegister">
        <div class="register-page__row">
          <BaseInput
              v-model="form.firstName"
              :label="t('auth.first_name_label')"
              :placeholder="t('auth.first_name_placeholder')"
              type="text"
              name="firstName"
              autocomplete="given-name"
          />

          <BaseInput
              v-model="form.lastName"
              :label="t('auth.last_name_label')"
              :placeholder="t('auth.last_name_placeholder')"
              type="text"
              name="lastName"
              autocomplete="family-name"
          />
        </div>

        <BaseInput
            v-model="form.email"
            :label="t('auth.email_label')"
            :placeholder="t('auth.email_placeholder')"
            type="email"
            name="email"
            autocomplete="email"
        />

        <BaseInput
            v-model="form.password"
            :label="t('auth.password_label')"
            :placeholder="t('auth.password_placeholder')"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="new-password"
        />

        <BaseInput
            v-model="form.company"
            :label="t('auth.company_label')"
            :placeholder="t('auth.company_placeholder')"
            type="text"
            name="company"
        />
<!--====================================================upload picture=======================================-->
        <div class="register-page__upload-block">
          <label class="register-page__upload-label">
            {{ t('auth.picture_url_label') }}
          </label>

          <BaseFileButton
              :label="t('auth.picture_upload_title')"
              @file-selected="handlePictureSelected"
          />

          <div v-if="form.pictureFile" class="register-page__upload-preview">
            <div class="register-page__upload-info">
              <p class="register-page__upload-name">
                {{ selectedPictureName }}
              </p>
            </div>

            <BaseButton
                type="button"
                variant="tertiary"
                @click="removePicture"
            >
              {{ t('auth.picture_remove') }}
            </BaseButton>
          </div>
        </div>
<!--====================================================upload picture=======================================-->

        <BaseSelect
            v-model="form.preferredLanguage"
            :label="t('auth.preferred_language_label')"
            :options="languageOptions"
        />

        <BaseSelect
            v-model="form.role"
            :label="t('auth.role_label')"
            :options="roleOptions"
        />

        <BaseAlert
            v-if="error"
            :title="t('auth.register_error_title')"
            :description="error"
        />

        <BaseAlert
            v-if="success"
            :title="t('common.success')"
            :description="t('auth.register_success')"
        />

        <BaseButton
            type="submit"
            class="register-page__submit"
            :disabled="isLoading"
        >
          <span v-if="!isLoading" class="register-page__submit-content">
            <span>{{ t('auth.register_link') }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
            </svg>
          </span>

          <span v-else class="register-page__submit-content">
            <span class="register-page__spinner"></span>
          </span>
        </BaseButton>
      </form>

      <p class="register-page__footer">
        {{ t('auth.already_account') }}
        <RouterLink to="/login">
          {{ t('auth.login_link') }}
        </RouterLink>
      </p>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { register } from "@/services/authApi.js";
import logoUrl from '@/assets/icons/logoccib38.jpg'

import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'
import BaseFileUpload from '@/shared/ui/base/BaseFileUpload.vue'
import BaseFileButton from '@/shared/ui/base/BaseFileButton.vue'

const router = useRouter()
const { t, locale } = useI18n()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  company: '',
  pictureFile: null,
  preferredLanguage: locale.value || 'fr',
  role: 'ROLE_USER',
})

const error = ref(null)
const success = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)
const selectedPictureName = ref('')

const roleOptions = computed(() => [
  {
    label: t('auth.role_user'),
    value: 'ROLE_USER',
  },
  {
    label: t('auth.role_admin'),
    value: 'ROLE_ADMIN',
  },
])

const languageOptions = computed(() => [
  {
    label: t('language.french'),
    value: 'fr',
  },
  {
    label: t('language.english'),
    value: 'en',
  },
])

function handlePictureSelected(file) {
  error.value = null

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  const maxSize = 5 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    error.value = t('auth.picture_upload_invalid_type')
    return
  }

  if (file.size > maxSize) {
    error.value = t('auth.picture_upload_too_large')
    return
  }

  form.value.pictureFile = file
  selectedPictureName.value = file.name
}

function removePicture() {
  form.value.pictureFile = null
  selectedPictureName.value = ''
}

async function handleRegister() {
  error.value = null
  success.value = false
  isLoading.value = true

  try {
    await register({
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      password: form.value.password,
      company: form.value.company,
      preferredLanguage: form.value.preferredLanguage,
      roles: [form.value.role],
      picture: form.value.pictureFile,
    })

    success.value = true

    setTimeout(() => {
      router.push({ name: 'LoginPage' })
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.message ?? t('common.generic_error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/stylePage/register_style";
</style>