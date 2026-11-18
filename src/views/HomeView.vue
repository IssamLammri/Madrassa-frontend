<template>
  <div class="home-view" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
    <a href="#parent-content" class="skip-link">Aller au contenu</a>
    <header class="home-view__topbar">
      <div class="home-view__topbar-left">
        <button ref="mobileMenuButton" type="button" class="home-view__mobile-menu-btn" aria-label="Ouvrir le menu" aria-controls="parent-navigation" :aria-expanded="isMobileMenuOpen" @click="toggleMobileMenu">
          <Menu :size="20" />
        </button>
        <RouterLink to="/home/dashboard" class="home-view__brand">
          <img :src="logoUrl" alt="CCIB38" class="home-view__topbar-logo" />
          <span>Portail parents<small>Centre culturel Ibn Badis · Grenoble</small></span>
        </RouterLink>
      </div>
      <div class="home-view__topbar-actions">
        <ParentComplaintModal />
        <div class="home-view__user">
          <span class="home-view__user-meta">{{ user.name }}<small>Espace famille</small></span>
          <span class="home-view__avatar-initials" aria-hidden="true">{{ userInitials }}</span>
        </div>
      </div>
    </header>
    <div class="home-view__overlay" :class="{ 'is-active': isMobileMenuOpen }" @click="closeMobileMenu"></div>
    <aside id="parent-navigation" ref="sidebar" class="home-view__sidebar" :class="{ 'is-mobile-open': isMobileMenuOpen }" @keydown.esc.stop="closeMobileMenu" @keydown="trapMobileFocus">
      <div class="home-view__sidebar-mobile-header">
        <span>Votre espace</span>
        <button type="button" class="home-view__mobile-close-btn" aria-label="Fermer le menu" @click="closeMobileMenu"><X :size="20" /></button>
      </div>
      <div class="home-view__sidebar-top">
        <div class="home-view__nav-scroll">
          <nav class="home-view__nav" aria-label="Navigation du portail parents">
            <button v-for="item in navigationItems" :key="item.key" type="button" class="home-view__nav-item" :class="{ 'is-active': isNavItemActive(item) }" :aria-current="isNavItemActive(item) ? 'page' : undefined" :aria-label="item.label || t(item.labelKey)" :title="isSidebarCollapsed ? item.label || t(item.labelKey) : undefined" @click="navigateTo(item)">
              <component :is="item.icon" :size="18" class="home-view__nav-icon" aria-hidden="true" />
              <span class="home-view__nav-label">{{ item.label || t(item.labelKey) }}</span>
            </button>
          </nav>
        </div>
      </div>
      <div class="home-view__sidebar-footer">
        <button type="button" class="home-view__sidebar-action home-view__collapse-action" :aria-label="isSidebarCollapsed ? t('layout.expand_sidebar') : t('layout.collapse_sidebar')" @click="toggleSidebar">
          <component :is="isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose" :size="18" />
          <span class="home-view__sidebar-action-label">{{ isSidebarCollapsed ? t('layout.expand_sidebar') : t('layout.collapse_sidebar') }}</span>
        </button>
        <button type="button" class="home-view__sidebar-action home-view__sidebar-action--danger" :aria-label="t('auth.logout')" @click="handleLogout">
          <LogOut :size="18" /><span class="home-view__sidebar-action-label">{{ t('auth.logout') }}</span>
        </button>
      </div>
    </aside>
    <main id="parent-content" class="home-view__main" tabindex="-1"><div class="home-view__content"><router-view /></div></main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  BookOpen, LayoutDashboard, LogOut, FileText, UserCircle, Users, Menu, X, ClipboardList, MessageCircle, PanelLeftOpen, PanelLeftClose
} from 'lucide-vue-next'
import logoUrl from '@/assets/icons/ccib38_logo.png'
import ParentComplaintModal from '@/shared/ui/ParentComplaintModal.vue'
import { logout } from '@/services/authApi.js'
import { getParentProfile } from '@/services/parentApi.js'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const search = ref('')
const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)
const isLoadingUser = ref(false)
const mobileMenuButton = ref(null)
const sidebar = ref(null)
let previousOverflow = ''
watch(isMobileMenuOpen, (open) => {
  if (open) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden' }
  else document.body.style.overflow = previousOverflow
})
onUnmounted(() => { document.body.style.overflow = previousOverflow })

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
  { key: 'dashboard', labelKey: 'Tableau de bord', label: 'Tableau de bord', icon: LayoutDashboard, to: '/home/dashboard' },
  { key: 'children', labelKey: 'Mes enfants', label: 'Mes enfants', icon: Users, to: '/home/children' },
  { key: 'classes', labelKey: 'Classes', label: 'Classes', icon: BookOpen, to: '/home/classes' },
  { key: 'whatsapp', label: 'Groupes WhatsApp', icon: MessageCircle, to: '/home/whatsapp' },
  { key: 'requests', labelKey: 'Mes demandes', label: 'Mes demandes', icon: ClipboardList, to: '/home/requests' },
  { key: 'invoices', labelKey: 'Mes factures', label: 'Mes factures', icon: FileText, to: '/home/invoices' },
  { key: 'profile', labelKey: 'Mon profil', label: 'Mon profil', icon: UserCircle, to: '/home/profile' }
]

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const toggleMobileMenu = async () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    await nextTick()
    const panel = sidebar.value
    await Promise.all(panel.getAnimations().map(animation => animation.finished.catch(() => {})))
    if (isMobileMenuOpen.value) panel.querySelector('button')?.focus({ preventScroll: true })
  }
}

const closeMobileMenu = () => {
  if (!isMobileMenuOpen.value) return
  isMobileMenuOpen.value = false
  mobileMenuButton.value?.focus()
}

const trapMobileFocus = (event) => {
  if (!isMobileMenuOpen.value || event.key !== 'Tab') return
  const buttons = [...sidebar.value.querySelectorAll('button')].filter(el => el.getClientRects().length && !el.disabled)
  const first = buttons[0], last = buttons.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
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
