<template>
  <div class="home-view" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
    <header class="home-view__topbar">
      <div class="home-view__topbar-glow" aria-hidden="true"></div>

      <div class="home-view__topbar-left">
        <button class="home-view__mobile-menu-btn" @click="toggleMobileMenu">
          <Menu :size="24" />
        </button>
        <img :src="logoUrl" alt="CCIB38 Logo" class="home-view__topbar-logo" />
      </div>

      <div class="home-view__topbar-actions ml-auto">
        <div class="home-view__user">
          <div class="home-view__user-meta">
            <strong>{{ user.name }}</strong>
          </div>
          <div class="home-view__avatar-initials" style="cursor: default; width: 36px; height: 36px; border-radius: 50%; background-color: #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
            {{ userInitials }}
          </div>
        </div>
      </div>
    </header>

    <div class="home-view__overlay" :class="{ 'is-active': isMobileMenuOpen }" @click="closeMobileMenu"></div>

    <aside class="home-view__sidebar" :class="{ 'is-mobile-open': isMobileMenuOpen }">
      <div class="home-view__sidebar-mobile-header">
        <img :src="logoUrl" alt="CCIB38 Logo" class="home-view__sidebar-mobile-logo" />
        <button class="home-view__mobile-close-btn" @click="closeMobileMenu">
          <X :size="24" />
        </button>
      </div>
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
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  BookOpen, LayoutDashboard, LogOut, FileText, UserCircle, Users, Menu, X
} from 'lucide-vue-next'
import logoUrl from '@/assets/icons/logoccib38.jpg'
import { logout } from '@/services/authApi.js'
import { getParentProfile } from '@/services/parentApi.js'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const search = ref('')
const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)
const isLoadingUser = ref(false)

const user = ref({
  name: '',
  role: '',
  avatar: '',
})

const userInitials = computed(() => {
  const name = user.value.name;
  if (!name) return 'U';
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return 'U';
})

const navigationItems = [
  { key: 'children', labelKey: 'Mes enfants', label: 'Mes enfants', icon: Users, to: '/home/children' },
  { key: 'classes', labelKey: 'Classes', label: 'Classes', icon: BookOpen, to: '/home/classes' },
  { key: 'invoices', labelKey: 'Mes factures', label: 'Mes factures', icon: FileText, to: '/home/invoices' },
  { key: 'profile', labelKey: 'Mon profil', label: 'Mon profil', icon: UserCircle, to: '/home/profile' }
]

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const isNavItemActive = (item) => route.path.startsWith(item.to)

const navigateTo = (item) => {
  router.push(item.to)
  closeMobileMenu()
}

const handleLogout = () => {
  logout()
  router.push('/login')
}

const loadCurrentUser = async () => {
  isLoadingUser.value = true

  try {
    const currentUser = await getParentProfile()

    user.value = {
      name: currentUser.displayName || currentUser.email || '',
      role: 'Parent',
      avatar: '',
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil utilisateur :', error)
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