<template>
  <div class="login-page">
    <div class="login-page__deco" aria-hidden="true">
      <div class="login-page__blob login-page__blob--primary"></div>
      <div class="login-page__blob login-page__blob--accent"></div>
      <div class="login-page__blob login-page__blob--soft"></div>
      <div class="login-page__dot-grid"></div>
      <div class="login-page__line-deco"></div>
    </div>

    <BaseCard class="login-page__card" padding="xl">
      <div class="login-page__logo-wrap">
        <img :src="logoUrl" alt="CCIB38 Logo" class="login-page__logo" />
      </div>

      <div class="login-page__header">
        <h1 class="login-page__title">
          {{ $t('auth.login_title') }}<br>
          {{ subtitleFirstWord }}
          <em>{{ subtitleRest }}</em>
        </h1>

        <p class="login-page__subtitle">
          {{ $t('auth.login_desc') }}
        </p>
      </div>

      <form class="login-page__form" @submit.prevent="handleLogin">
        <BaseInput
            v-model="form.email"
            :label="$t('auth.email_label')"
            :placeholder="$t('auth.email_placeholder')"
            type="email"
            name="email"
            autocomplete="email"
        />

        <BaseInput
            v-model="form.password"
            :label="$t('auth.password_label')"
            :placeholder="$t('auth.password_placeholder')"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="current-password"
            data-has-suffix="true"
        >
          <template #suffix>
            <button
                type="button"
                class="login-page__password-toggle"
                :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </template>
        </BaseInput>

        <BaseAlert
            v-if="error"
            variant="warning"
            :title="$t('auth.login_error_title', 'Connexion impossible')"
            :description="error"
            :icon="TriangleAlert"
        />

        <BaseButton
            type="submit"
            variant="primary"
            class="login-page__submit"
            :disabled="isLoading"
            :aria-busy="isLoading"
        >
          <span v-if="!isLoading" class="login-page__submit-content">
            <span>{{ $t('auth.login_btn') }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
            </svg>
          </span>

          <span v-else class="login-page__submit-content">
            <span class="login-page__spinner"></span>
          </span>
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Eye, EyeOff, TriangleAlert } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n'

import {login} from '@/services/authApi.js';

import logoUrl from '@/assets/icons/logoccib38.jpg'

import BaseAlert from '@/shared/ui/base/BaseAlert.vue';
import BaseButton from '@/shared/ui/base/BaseButton.vue';
import BaseCard from '@/shared/ui/base/BaseCard.vue';
import BaseInput from '@/shared/ui/base/BaseInput.vue';

const { t } = useI18n()

const router = useRouter();

const form = ref({
  email: '',
  password: '',
});

const error = ref(null);
const isLoading = ref(false);
const showPassword = ref(false);

const subtitleParts = computed(() => {
  const text = String(t('auth.login_subtitle') || '').trim();
  const parts = text.split(/\s+/);
  return {
    first: parts[0] ?? '',
    rest: parts.slice(1).join(' '),
  };
});

const subtitleFirstWord = computed(() => subtitleParts.value.first);
const subtitleRest = computed(() => subtitleParts.value.rest);

async function handleLogin() {
  error.value = null;
  isLoading.value = true;

  console.log("Login request:", form.value);

  try {
    const { data } = await login(form.value);
    router.push('/home');
  } catch (err) {
    error.value = err.response?.data?.message ?? 'Email ou mot de passe incorrect';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/stylePage/login_style";
</style>