<template>
  <div class="max-w-5xl mx-auto w-full">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Mes enfants</h1>
        <p class="text-slate-600 mt-1">Gérez les inscriptions et suivez la scolarité de vos enfants.</p>
      </div>
    </div>

    <BaseAlert v-if="error" type="error" class="mb-6">
      {{ error }}
    </BaseAlert>

    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>

    <div v-else-if="children.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
      <div class="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <UsersIcon class="w-10 h-10 text-slate-400" />
      </div>
      <h3 class="text-lg font-bold text-slate-800 mb-2">Aucun enfant trouvé</h3>
      <p class="text-slate-600">Vous n'avez pas encore d'enfants inscrits ou associés à votre compte.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BaseCard 
        v-for="child in children" 
        :key="child.id" 
        class="hover:shadow-md transition-shadow cursor-pointer"
        @click="goToChild(child.id)"
      >
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl">
              {{ getInitials(child.fullName) }}
            </div>
            <div>
              <h3 class="font-bold text-lg text-slate-800">{{ child.fullName }}</h3>
              <p class="text-sm text-slate-500">{{ formatDate(child.birthDate) }}</p>
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-t border-slate-100">
              <span class="text-sm text-slate-500">Niveau actuel</span>
              <BaseBadge>{{ child.levelLabel || 'Non assigné' }}</BaseBadge>
            </div>
          </div>
          
          <div class="mt-6 pt-4 border-t border-slate-100">
            <div class="text-emerald-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Voir le dossier détaillé
              <ArrowRightIcon class="w-4 h-4" />
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UsersIcon, ArrowRightIcon } from 'lucide-vue-next'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseAlert from '@/shared/ui/base/BaseAlert.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import { getChildren } from '@/services/parentApi.js'

const router = useRouter()
const isLoading = ref(true)
const error = ref('')
const children = ref([])

onMounted(async () => {
  try {
    const data = await getChildren()
    children.value = data.items || []
  } catch (e) {
    console.error(e)
    error.value = "Impossible de charger la liste de vos enfants."
  } finally {
    isLoading.value = false
  }
})

const getInitials = (name) => {
  if (!name) return 'E'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const goToChild = (id) => {
  router.push(`/home/children/${id}`)
}
</script>
