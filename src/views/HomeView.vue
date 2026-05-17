<template>
  <div class="home-view" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
    <header class="home-view__topbar">
      <div class="home-view__topbar-glow" aria-hidden="true"></div>

      <div class="home-view__topbar-left">
        <img :src="logoUrl" alt="CCIB38 Logo" class="home-view__topbar-logo" />
      </div>

      <div class="home-view__topbar-actions ml-auto">
        <div class="home-view__user">
          <div class="home-view__user-meta">
            <strong>{{ user.name || 'Utilisateur' }}</strong>
          </div>
          <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.name"
              class="home-view__avatar-image"
              style="cursor: default;"
          />
        </div>
      </div>
    </header>

    <aside class="home-view__sidebar">
      <div class="home-view__sidebar-top">
        <div class="home-view__nav-scroll">
          <nav class="home-view__nav">
            <button
                v-for="item in navigationItems"
                :key="item.key"
                type="button"
                class="home-view__nav-item"
                :class="{ 'is-active': isNavItemActive(item) }"
                @click="navigateTo(item)"
            >
              <component :is="item.icon" :size="18" class="home-view__nav-icon" />
              <span class="home-view__nav-label">{{ item.label || t(item.labelKey) }}</span>
            </button>
          </nav>
        </div>
      </div>

      <div class="home-view__sidebar-footer">
        <button type="button" class="home-view__sidebar-action" @click="toggleSidebar">
          <component :is="isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose" :size="18" />
          <span class="home-view__sidebar-action-label">
            {{ isSidebarCollapsed ? t('layout.expand_sidebar') : t('layout.collapse_sidebar') }}
          </span>
        </button>

        <button type="button" class="home-view__sidebar-action home-view__sidebar-action--danger" @click="handleLogout">
          <LogOut :size="18" />
          <span class="home-view__sidebar-action-label">{{ t('auth.logout') }}</span>
        </button>
      </div>
    </aside>

    <main class="home-view__main">
      <div class="home-view__content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  BookOpen, LayoutDashboard, LogOut, Palette,
  PanelLeftClose, PanelLeftOpen, Search, Sparkles, Users
} from 'lucide-vue-next'
import logoUrl from '@/assets/icons/logoccib38.jpg'
import { getCurrentUser, logout } from '@/services/authApi.js'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const search = ref('')
const isSidebarCollapsed = ref(false)
const isLoadingUser = ref(false)

const user = ref({
  name: '',
  role: '',
  avatar: '',
})

const navigationItems = [
  { key: 'demandes', labelKey: 'Liste des demandes', label: 'Liste des demandes', icon: LayoutDashboard, to: '/home/dashboard' }
]

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const isNavItemActive = (item) => route.path === item.to

const navigateTo = (item) => router.push(item.to)

const handleLogout = () => {
  logout()
  router.push('/login')
}

const loadCurrentUser = async () => {
  isLoadingUser.value = true

  try {
    const currentUser = await getCurrentUser()

    user.value = {
      name: `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email || 'Utilisateur',
      role: Array.isArray(currentUser.roles)
          ? currentUser.roles.join(', ')
          : currentUser.role || 'User',
      avatar: currentUser.pictureUrl || 'https://i.pravatar.cc/120?img=32',
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil utilisateur :', error)
    // Removed handleLogout() to prevent redirect loop when backend is not ready
  } finally {
    isLoadingUser.value = false
  }
}

onMounted(() => {
  loadCurrentUser()
})
</script>

<style lang="scss" scoped>
@use "@/assets/stylePage/homePage_style";
</style>