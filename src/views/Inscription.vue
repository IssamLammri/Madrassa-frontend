<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/apiClient.js'
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Info,
  Calendar,
  UserCircle,
  AlertCircle,
  Check,
  Send,
  Wrench
} from 'lucide-vue-next'

const router = useRouter()
const isMaintenance = ref(false)
const currentStep = ref(0)
const isSubmitting = ref(false)
const demandSent = ref(false)
const requestToken = ref(null)
const completedRegistrations = ref([])
const isParentBanned = ref(false)
const submitError = ref('')
const allClasses = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/study-classes/api/2026-2027')
    if (response?.data?.studyClasses) {
      allClasses.value = response.data.studyClasses
    }
  } catch (err) {
    console.error('Error fetching classes:', err)
  }
})

const isSearching = ref(false)
const showSelectionDialog = ref(false)
const searchResults = ref([])
const selectedStudentIndex = ref(null)

const childrenQueue = ref([])
const currentIndex = ref(0)

const availableChildren = ref([])
const showInitialSiblingPrompt = ref(false)

const currentChildData = computed(() => {
  const data = childrenQueue.value[currentIndex.value]
  return data?.student || data
})

const stepLabels = [
  "Identité",
  "Détails",
  "Parents",
  "Classe",
  "Autorisations",
  "Validation"
]

const form = reactive({
  childFirstName: '',
  childLastName: '',
  childDob: '',
  childGender: '',
  
  fatherLastName: '',
  fatherFirstName: '',
  motherLastName: '',
  motherFirstName: '',
  contactEmail: '',
  fatherPhone: '',
  motherPhone: '',
  address: '',
  postalCode: '',
  city: '',
  
  selectedClassId: null,
  skipClassSelection: false,
  
  authorized: [],
  authorizedOtherName: '',
  authorizedOtherRelation: '',
  leaveAlone: '',
  imageRights: '',
  medicalInfo: '',
  medicalDetails: '',
  medicalTreatment: '',
  
  commitmentSitu: false,
  legalDeclaration: false,
  paymentTerms: false,
  parentPassword: ''
})

const levels = [
  'GS', 'CP', 'N0', 'N1_1', 'N1_2', 'N2_1', 'N2_2', 'N3_1', 'N3_2', 
  'N4_1', 'N4_2', 'N5_1', 'N5_2', 'Adult/Arabe_Niveau_1', 
  'Adult/Arabe_Niveau_2', 'ADO/Arabe', 'ADO/Coran'
]

const alertMsg = ref('')

// Check date to see if child is too young
watch(() => form.childDob, (newVal) => {
  if (!newVal) {
    alertMsg.value = ''
    return
  }
  const picked = new Date(newVal)
  // For 2026/2027, born after 2020-12-31 is too young (under 6)
  const limit = new Date('2020-12-31')
  if (picked > limit) {
    alertMsg.value = "L’âge de votre enfant ne permet pas d’être inscrit(e) pour l’année 2026/2027 au sein de notre centre. Il doit avoir 6 ans ou plus au 31 décembre 2026."
  } else {
    alertMsg.value = ''
  }
})

// Search child via API
const fillStudentData = (result) => {
  const studentData = result.student || result
  const parentData = result.parent || result.parentEntity || result

  // Mapping the found data
  if (studentData.dob || studentData.birthDate) {
    const dateRaw = new Date(studentData.dob || studentData.birthDate)
    if (!isNaN(dateRaw.getTime())) {
      form.childDob = dateRaw.toISOString().split('T')[0]
    }
  }
  
  if (studentData.gender) form.childGender = studentData.gender === 'male' ? 'Garçon' : studentData.gender === 'female' ? 'Fille' : studentData.gender

  if (parentData) {
    // Extract father details
    if (parentData.father) {
      form.fatherFirstName = parentData.father.firstName || ''
      form.fatherLastName = parentData.father.lastName || ''
      form.contactEmail = parentData.father.email || ''
      form.fatherPhone = parentData.father.phone || ''
    } else {
      if (parentData.fatherFirstName) form.fatherFirstName = parentData.fatherFirstName
      if (parentData.fatherLastName) form.fatherLastName = parentData.fatherLastName
      if (parentData.fatherEmail || parentData.email) form.contactEmail = parentData.fatherEmail || parentData.email
      if (parentData.fatherPhone) form.fatherPhone = parentData.fatherPhone
    }
    
    // Extract mother details
    if (parentData.mother) {
      form.motherFirstName = parentData.mother.firstName || ''
      form.motherLastName = parentData.mother.lastName || ''
      form.motherPhone = parentData.mother.phone || ''
      if (!form.contactEmail && parentData.mother.email) form.contactEmail = parentData.mother.email
    } else {
      if (parentData.motherFirstName) form.motherFirstName = parentData.motherFirstName
      if (parentData.motherLastName) form.motherLastName = parentData.motherLastName
      if (parentData.motherPhone) form.motherPhone = parentData.motherPhone
    }

    // Address info (could be on student or parent)
    if (studentData.address) form.address = studentData.address
    else if (parentData.address && !form.address) form.address = parentData.address
    
    if (studentData.postalCode) form.postalCode = studentData.postalCode
    else if (parentData.postalCode && !form.postalCode) form.postalCode = parentData.postalCode
    
    if (studentData.city) form.city = studentData.city
    else if (parentData.city && !form.city) form.city = parentData.city
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Non renseignée'
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString('fr-FR')
  } catch (e) {
    return dateString
  }
}

const cancelSelection = () => {
  showSelectionDialog.value = false
  currentStep.value = 1
  childrenQueue.value = []
  currentIndex.value = 0
}

const childAge = computed(() => {
  if (!form.childDob) return 0;
  const dobDate = new Date(form.childDob);
  return 2026 - dobDate.getFullYear();
});

const classRecommendationInfo = computed(() => {
  const age = childAge.value;
  const currentLevel = currentChildData.value?.level;
  const isFound = !!currentChildData.value?.id;

  let targetLevel = null;
  let targetAgeRange = null;
  let unknownLevel = false;

  const nextLevels = {
      'GS': 'CP',
      'N0': 'N1_1',
      'N1_1': 'N2_1',
      'N2_1': 'N2_2',
      'N2_2': 'N3_1',
      'N3_1': 'N3_2',
      'N3_2': 'N4_1',
      'N4_1': 'N4_2',
      'N4_2': 'N5_1',
      'N5_1': 'N5_2',
      'N5_2': 'N6_1',
      'N6_1': 'N6_2'
  };

  if (isFound && currentLevel) {
    if (nextLevels[currentLevel]) {
      targetLevel = nextLevels[currentLevel];
    } else if (currentLevel === 'CP' || currentLevel.toLowerCase() === 'cp') {
      if (age < 10) {
        targetLevel = 'N0'; targetAgeRange = 'Petit';
      } else if (age >= 10 && age < 13) {
        targetLevel = 'N0'; targetAgeRange = 'Grand';
      } else if (age > 18) {
        targetLevel = 'Adult';
      } else if (age >= 13) {
        targetLevel = 'Adolescent';
      } else {
        unknownLevel = true;
      }
    }
  }

  if (!targetLevel && !unknownLevel) {
    if (age < 8) {
      targetLevel = 'CP'; 
    } else if (age === 8 || age === 9) {
      targetLevel = 'N0'; targetAgeRange = 'Petit';
    } else if (age >= 10 && age <= 12) {
      targetLevel = 'N0'; targetAgeRange = 'Grand';
    } else if (age > 18) {
      targetLevel = 'Adult';
    } else if (age >= 13) {
      targetLevel = 'Adolescent';
    } else {
      unknownLevel = true;
    }
  }

  return { targetLevel, targetAgeRange, unknownLevel };
});

const recommendedClasses = computed(() => {
  const { targetLevel, targetAgeRange } = classRecommendationInfo.value;
  if (!targetLevel) return [];
  return allClasses.value.filter(c => {
    const cLevel = c.level;
    const isLevelMatch = (targetLevel === 'ADO/Arabe' || targetLevel === 'Adolescent') 
        ? (cLevel === 'ADO/Arabe' || cLevel === 'Adolescent' || cLevel === 'Adolescents') 
        : cLevel === targetLevel;
    if (targetAgeRange && c.ageRange) {
      return isLevelMatch && c.ageRange === targetAgeRange;
    }
    return isLevelMatch;
  });
});


const proceedWithStudent = async (studentRes) => {
  const studentData = studentRes.student || studentRes
  
  let siblings = []
  if (studentData.id) {
     try {
       const sibResp = await api.get(`/students/api/${studentData.id}/siblings`)
       if (sibResp.data && sibResp.data.siblings) {
         siblings = sibResp.data.siblings
       } else if (Array.isArray(sibResp.data)) {
         siblings = sibResp.data
       } else if (sibResp.data && Array.isArray(sibResp.data.students)) {
         siblings = sibResp.data.students
       }
       
       siblings = siblings.filter(s => {
         const sid = s.student?.id || s.id
         return sid && sid !== studentData.id
       })
     } catch (err) {
       console.error("Error fetching siblings:", err)
     }
  }
  
  availableChildren.value = [studentRes, ...siblings].map(c => ({
    ...c,
    _selected: true
  }))
  
  showSelectionDialog.value = false
  
  if (availableChildren.value.length >= 1) {
    showInitialSiblingPrompt.value = true
    currentStep.value = 0
  } else {
    startRegistrationQueue()
  }
}

const addNewEmptyChildToQueue = () => {
  availableChildren.value.push({
    isNew: true,
    firstName: 'Nouvel',
    lastName: 'Enfant',
    _selected: true
  })
}

const startRegistrationQueue = () => {
  childrenQueue.value = availableChildren.value.filter(c => c._selected)
  if (childrenQueue.value.length === 0) {
     childrenQueue.value = [availableChildren.value[0]]
  }
  
  currentIndex.value = 0
  showInitialSiblingPrompt.value = false
  
  fillStudentData(childrenQueue.value[0])
  currentStep.value = 1
  scrollToTop()
}

const confirmSelection = async () => {
  if (selectedStudentIndex.value !== null) {
    await proceedWithStudent(searchResults.value[selectedStudentIndex.value])
  } else {
    showSelectionDialog.value = false
    currentStep.value = 1
  }
}

// Validations
const validateStep0 = () => {
  return !!(form.childLastName && form.childFirstName)
}

const validateStep1 = () => {
  const baseFieldsFilled = !!(form.childLastName && form.childFirstName && form.childDob && form.childGender)
  if (!baseFieldsFilled) return false

  if (form.childDob) {
    const dobDate = new Date(form.childDob)
    const limit = new Date('2020-12-31')
    if (dobDate > limit) return false // Too young filter loosely
  }

  return true
}

const validateStep2 = () => {
  return !!(
    form.fatherLastName &&
    form.fatherFirstName &&
    form.motherLastName &&
    form.motherFirstName &&
    form.contactEmail &&
    (form.fatherPhone || form.motherPhone) &&
    form.address &&
    form.postalCode &&
    form.city &&
    form.parentPassword && 
    form.parentPassword.length >= 6
  )
}

const validateStep3 = () => {
  return !!form.selectedClassId || form.skipClassSelection
}

const validateStep4 = () => {
  const hasAuthorized = form.authorized.length > 0
  const otherOk = !form.authorized.includes('Autre') || (form.authorizedOtherName && form.authorizedOtherRelation)
  const hasLeave = form.leaveAlone === 'oui' || form.leaveAlone === 'non'
  const hasImage = form.imageRights === 'oui' || form.imageRights === 'non'
  const hasMedInfo = form.medicalInfo === 'oui' || form.medicalInfo === 'non'
  const medDetailsOk = form.medicalInfo === 'non' || !!form.medicalDetails
  const hasTreatment = form.medicalTreatment === 'oui' || form.medicalTreatment === 'non'

  return hasAuthorized && otherOk && hasLeave && hasImage && hasMedInfo && medDetailsOk && hasTreatment
}

const validateStep5 = () => {
  return !!(form.legalDeclaration && form.paymentTerms && form.commitmentSitu)
}

const stepValid = computed(() => {
  if (currentStep.value === 0) return validateStep0()
  if (currentStep.value === 1) return validateStep1()
  if (currentStep.value === 2) return validateStep2()
  if (currentStep.value === 3) return validateStep3()
  if (currentStep.value === 4) return validateStep4()
  if (currentStep.value === 5) return validateStep5()
  return false
})

const nextStep = async () => {
  if (currentStep.value === 0) {
    if (!validateStep0()) return;
    
    isSearching.value = true;
    try {
      const response = await api.get('/students/api/search', {
        params: {
          firstName: form.childFirstName,
          lastName: form.childLastName
        }
      });
      
      let results = [];
      const data = response.data;
      if (data && data.status === 'success' && data.students) {
        results = data.students;
      } else if (Array.isArray(data)) {
        results = data;
      } else if (data['hydra:member']) {
        results = data['hydra:member'];
      } else if (data && (data.student || data.id || data.firstName)) {
        results = [data];
      }

      let bannedParent = false;
      for (const res of results) {
        const p = res.parent || res.parentEntity || res;
        if (p && p.isBanned) {
          bannedParent = true;
          break;
        }
      }

      if (bannedParent) {
        isParentBanned.value = true;
        isSearching.value = false;
        return;
      }

      if (results.length > 1) {
        searchResults.value = results;
        selectedStudentIndex.value = null;
        showSelectionDialog.value = true;
      } else if (results.length === 1) {
        await proceedWithStudent(results[0]);
      } else {
        childrenQueue.value = [];
        currentIndex.value = 0;
        currentStep.value = 1;
        scrollToTop()
      }
    } catch (err) {
      console.error("Search error", err);
      // Fallback: Just proceed
      currentStep.value = 1;
      scrollToTop()
    } finally {
      isSearching.value = false;
    }
    return;
  }

  if (stepValid.value && currentStep.value < stepLabels.length - 1) {
    if (currentStep.value === 1 && currentIndex.value > 0) {
      currentStep.value = 3;
    } else {
      currentStep.value++
    }
    scrollToTop()
  }
}

const prevStep = () => {
  if (currentStep.value === 3 && currentIndex.value > 0) {
    currentStep.value = 1;
  } else if (currentStep.value > 0) {
    currentStep.value--
  }
  scrollToTop()
}

const submitForm = async () => {
  if (!stepValid.value) return
  isSubmitting.value = true
  submitError.value = ''

  try {
    const response = await api.post('/registrations/arabic-cours/api/create', form)
    
    if (response.data && (response.data.token || response.data.id || response.data.status === 'success')) {
      requestToken.value = response.data.token || response.data.id
      
      completedRegistrations.value.push({
        firstName: form.childFirstName,
        lastName: form.childLastName,
        dob: form.childDob,
        gender: form.childGender
      })
      
      moveToNextChild()
    } else {
      throw new Error('Réponse invalide de l\'API')
    }
  } catch (error) {
    console.error(error.response?.data);
    console.error('Erreur lors de l’inscription :', error)
    submitError.value = 'Une erreur s\'est produite lors de l\'inscription. Merci de retenter l\'inscription prochainement.'
    scrollToTop()
  } finally {
    isSubmitting.value = false
  }
}

const moveToNextChild = () => {
  if (childrenQueue.value.length > 0 && currentIndex.value < childrenQueue.value.length - 1) {
    currentIndex.value++
    
    const nextChild = childrenQueue.value[currentIndex.value]
    const studentInfo = nextChild.student || nextChild
    
    if (studentInfo.isNew) {
      form.childFirstName = ''
      form.childLastName = form.childLastName // Maybe keep the family name? Or clear it? Let's clear or keep but they can type. I'll clear it just to force them.
      form.childDob = ''
      form.childGender = ''
    } else {
      form.childFirstName = studentInfo.firstName || ''
      form.childLastName = studentInfo.lastName || ''
      if (studentInfo.birthDate || studentInfo.dob) {
        const dateRaw = new Date(studentInfo.birthDate || studentInfo.dob)
        if (!isNaN(dateRaw.getTime())) {
          form.childDob = dateRaw.toISOString().split('T')[0]
        }
      } else {
        form.childDob = ''
      }
      form.childGender = studentInfo.gender === 'male' ? 'Garçon' : studentInfo.gender === 'female' ? 'Fille' : studentInfo.gender || ''
    }
    
    form.selectedClassId = null
    form.skipClassSelection = false
    
    form.commitmentSitu = false
    form.legalDeclaration = false
    form.paymentTerms = false

    currentStep.value = 1
    scrollToTop()
  } else {
    demandSent.value = true
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  setTimeout(() => {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }, 50)
}

const reloadPage = () => {
  window.location.reload()
}
</script>

<template>
  <div v-if="isMaintenance" class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-lg w-full text-center">
       <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
         <Wrench class="w-8 h-8" />
       </div>
       <h1 class="text-2xl font-bold text-slate-800 mb-2">Inscription en maintenance</h1>
       <p class="text-slate-600 mb-8">
         Nous effectuons une courte mise à jour. Les inscriptions seront de retour très rapidement ! Merci de votre patience.
       </p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-slate-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10 w-full h-full font-sans text-slate-800">
    <div class="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      
      <!-- Header -->
      <div class="relative text-center bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-6 sm:mb-8">
        <div v-if="childrenQueue.length > 1 && currentStep > 0 && demandSent === false" class="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-[10px] sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
          Enfant {{ currentIndex + 1 }} sur {{ childrenQueue.length }}
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2 sm:mt-0 mt-4">Inscription Cours d’Arabe</h1>
        <p class="text-slate-500 font-medium text-sm sm:text-base">Année scolaire 2026 / 2027</p>

        <div v-if="currentStep > 0 && demandSent === false && !showInitialSiblingPrompt" class="mt-6 inline-block bg-blue-50 text-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-blue-100 shadow-sm text-left">
          <span class="text-blue-500 text-[10px] sm:text-xs uppercase tracking-wider font-bold block mb-1">Dossier en cours</span>
          <span class="text-lg sm:text-2xl font-bold">{{ form.childFirstName }} {{ form.childLastName }}</span>
        </div>
      </div>

      <div v-if="isParentBanned" class="bg-white rounded-3xl p-10 shadow-xl shadow-red-200/50 border border-red-100 text-center">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
          <AlertCircle class="w-10 h-10" />
        </div>
        
        <h2 class="text-2xl font-bold text-red-700 mb-4">
          Inscription bloquée
        </h2>
        
        <p class="text-slate-700 font-medium mb-6 max-w-lg mx-auto text-lg leading-relaxed text-left">
          Vous n'avez pas complété les paiements pour l'année 2025/2026. <br/><br/>
          Merci de contacter l'administration de CCIB38 afin de régler ce qu'il vous reste à payer avant toute nouvelle inscription.
        </p>

        <div class="mt-8 pt-6 border-t border-red-100 text-sm text-slate-500 font-medium max-w-md mx-auto italic">
          Une procédure de recouvrement pécuniaire à votre encontre a déjà été déclenchée.
        </div>

        <div class="mt-8 flex justify-center">
          <button @click="router.push('/login')" class="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 shadow-md transition-colors w-full sm:w-auto">
            Retour à l'accueil
          </button>
        </div>
      </div>

      <div v-else-if="demandSent" class="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
        <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="text-4xl">🎉</span>
        </div>
        
        <h2 class="text-2xl font-bold text-slate-800 mb-4">
          <template v-if="completedRegistrations.length > 1">
            Demandes d'inscription enregistrées !
          </template>
          <template v-else>
            Demande d'inscription enregistrée !
          </template>
        </h2>
        
        <p class="text-slate-600 mb-8 max-w-lg mx-auto">
          <template v-if="completedRegistrations.length > 1">
            Vos demandes ont bien été enregistrées pour l’année 2026/2027. Vous allez recevoir des emails récapitulatifs.
          </template>
          <template v-else>
            Votre demande a bien été enregistrée pour l’année 2026/2027. Vous allez recevoir un email récapitulatif.
          </template>
        </p>

        <div class="bg-slate-50 text-left rounded-2xl border border-slate-100 p-6 mb-8 max-w-xl mx-auto">
          <h3 class="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Récapitulatif des inscriptions :</h3>
          <ul class="space-y-4">
            <li v-for="(reg, i) in completedRegistrations" :key="i" class="flex items-center gap-4">
              <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 font-bold">
                {{ i + 1 }}
              </div>
              <div>
                <p class="font-bold text-slate-800 text-lg">{{ reg.firstName }} {{ reg.lastName }}</p>
                <p class="text-sm text-slate-500">Né(e) le : {{ formatDate(reg.dob) }} - {{ reg.gender }}</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button @click="reloadPage" class="px-6 py-3 border-2 border-emerald-600 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors w-full sm:w-auto">
            Inscrire un autre enfant
          </button>
          <button @click="router.push('/login')" class="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md transition-colors w-full sm:w-auto">
            Retour à l'accueil
          </button>
        </div>
      </div>

      <form v-else @submit.prevent="submitForm" class="space-y-8">
        
        <!-- API Error Alert -->
        <div v-if="submitError" class="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-4 rounded-2xl flex items-start shadow-sm mb-6">
          <AlertCircle class="w-6 h-6 mr-3 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p class="font-bold text-sm sm:text-base mb-1">Erreur de soumission</p>
            <p class="text-sm font-medium mb-2">{{ submitError }}</p>
            <p class="text-sm">Vous pouvez réessayer ultérieurement, nous contacter au <strong>04 58 00 89 73</strong> ou envoyer un email à <a href="mailto:contact@ccib38.fr" class="font-bold underline">contact@ccib38.fr</a> afin qu'on puisse voir le problème ensemble.</p>
          </div>
        </div>

        <!-- STEPPER -->
        <div v-show="!showInitialSiblingPrompt" class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100">
          
          <!-- Mobile Stepper Title -->
          <div class="sm:hidden mb-4 text-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Etape {{ currentStep + 1 }} sur {{ stepLabels.length }}</span>
            <h3 class="text-base font-bold text-slate-800">{{ stepLabels[currentStep] }}</h3>
          </div>

          <div class="flex items-center justify-between w-full relative">
            <div class="absolute left-0 top-1/2 -mt-[1px] w-full h-[2px] bg-slate-100 z-0"></div>
            
            <template v-for="(label, idx) in stepLabels" :key="idx">
              <div class="relative z-10 flex flex-col items-center">
                <div 
                  class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300"
                  :class="[
                    currentStep > idx ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 sm:ring-4 ring-white' : 
                    currentStep === idx ? 'bg-slate-800 text-white ring-2 sm:ring-4 ring-white shadow-md' : 'bg-slate-200 text-slate-500'
                  ]"
                >
                  <Check v-if="currentStep > idx" class="w-4 h-4 sm:w-5 sm:h-5" />
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <span 
                  class="hidden sm:block absolute top-12 text-[10px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors"
                  :class="currentStep >= idx ? 'text-slate-800' : 'text-slate-400'"
                >
                  {{ label }}
                </span>
              </div>
            </template>
          </div>
          <div class="hidden sm:block h-8"></div> <!-- Spacer for absolute labels -->
        </div>

        <!-- SIBLING PROMPT CONTAINER -->
        <div v-if="showInitialSiblingPrompt" class="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 animate-[fadeIn_0.3s_ease-out]">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircle class="w-8 h-8" />
            </div>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Fratrie trouvée</h2>
            <p class="text-slate-600 max-w-lg mx-auto">
              Nous avons trouvé plusieurs enfants dans votre famille. Cochez ceux que vous souhaitez inscrire pour l'année 2026/2027.
            </p>
          </div>

          <div class="space-y-4 max-w-xl mx-auto mb-8">
            <label v-for="(child, idx) in availableChildren" :key="idx" class="flex items-center gap-4 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" :class="{'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-200': child._selected}">
              <input type="checkbox" v-model="child._selected" class="w-5 h-5 text-emerald-600 rounded shrink-0" />
              <div>
                <template v-if="child.isNew">
                  <p class="font-bold text-slate-800">Ajouter un nouvel enfant</p>
                  <p class="text-sm text-slate-500">Ses informations seront demandées par la suite.</p>
                </template>
                <template v-else>
                  <p class="font-bold text-slate-800">
                    {{ child.student?.firstName || child.firstName }} {{ child.student?.lastName || child.lastName }}
                  </p>
                  <p class="text-sm text-slate-500">Né(e) le : {{ formatDate(child.student?.birthDate || child.student?.dob || child.birthDate || child.dob) }}</p>
                </template>
              </div>
            </label>
          </div>

          <div class="max-w-xl mx-auto mb-8 text-center sm:text-left">
            <button type="button" @click="addNewEmptyChildToQueue" class="text-emerald-600 font-bold hover:underline flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
              <!-- SVG PLUS ICON -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Ajouter un autre enfant
            </button>
          </div>

          <div class="flex items-center justify-center">
            <button type="button" @click="startRegistrationQueue" class="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md transition-colors w-full sm:w-auto">
              Continuer
            </button>
          </div>
        </div>

        <!-- FORM CONTAINER -->
        <div v-else class="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden transition-all duration-500">
          
          <!-- Alert si erreur de date -->
          <div v-if="alertMsg" class="mb-6 bg-red-50 text-red-700 px-4 py-4 rounded-xl flex items-start border border-red-100 shadow-sm">
            <AlertCircle class="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <span class="text-sm font-medium">{{ alertMsg }}</span>
          </div>

          <!-- Selection Dialog -->
          <div v-if="showSelectionDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div class="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full p-6 animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
              <h3 class="text-lg sm:text-xl font-bold text-slate-800 mb-2">Plusieurs dossiers trouvés</h3>
              <p class="text-sm sm:text-base text-slate-600 mb-6">Nous avons trouvé plusieurs enfants correspondant à ce nom. Veuillez sélectionner le vôtre :</p>
              
              <div class="space-y-4">
                <div v-for="(res, idx) in searchResults" :key="idx" 
                     @click="selectedStudentIndex = idx"
                     class="p-4 rounded-xl border-2 cursor-pointer transition-colors"
                     :class="selectedStudentIndex === idx ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'">
                  <div class="flex items-start gap-3 sm:gap-4">
                    <div class="w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0"
                         :class="selectedStudentIndex === idx ? 'border-emerald-500' : 'border-slate-300'">
                      <div v-if="selectedStudentIndex === idx" class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                    </div>
                    <div>
                      <p class="font-bold text-slate-800">
                        {{ res.student?.firstName || res.firstName }} {{ res.student?.lastName || res.lastName }}
                      </p>
                      <p class="text-xs sm:text-sm text-slate-600">Né(e) le : {{ formatDate(res.student?.birthDate || res.student?.dob || res.birthDate || res.dob) }}</p>
                      <div v-if="res.parent || res.parentEntity">
                        <p class="text-xs sm:text-sm text-slate-500 mt-1">
                          Parents : 
                          <span v-if="res.parent?.father">{{ res.parent.father.firstName }} {{ res.parent.father.lastName }}</span>
                          <span v-if="res.parent?.mother"> &amp; {{ res.parent.mother.firstName }} {{ res.parent.mother.lastName }}</span>
                        </p>
                      </div>
                      <div v-if="res.registrations && res.registrations.length > 0" class="mt-2 text-[10px] sm:text-xs text-slate-500 font-medium">
                         Inscriptions: {{ res.registrations.map(r => r.class?.name).join(', ') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button type="button" @click="cancelSelection" class="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm sm:text-base">Ignorer (Nouveau)</button>
                <button type="button" @click="confirmSelection" :disabled="selectedStudentIndex === null" class="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-50 text-sm sm:text-base">Confirmer</button>
              </div>
            </div>
          </div>

          <!-- STEP 0 -->
          <div v-show="currentStep === 0" class="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Search class="w-6 h-6" /></div>
              <h2 class="text-lg sm:text-xl font-bold text-slate-800">Identification de l’enfant</h2>
            </div>
            
            <p class="text-sm sm:text-base text-slate-600">Veuillez saisir le nom et le prénom de l'enfant pour vérifier s'il est déjà inscrit dans notre base de données.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Nom de l’enfant</label>
                <input type="text" v-model.trim="form.childLastName" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-slate-800" required />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Prénom de l’enfant</label>
                <input type="text" v-model.trim="form.childFirstName" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-slate-800" required />
              </div>
            </div>
          </div>

          <!-- STEP 1 -->
          <div v-show="currentStep === 1" class="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><UserCircle class="w-6 h-6" /></div>
              <h2 class="text-lg sm:text-xl font-bold text-slate-800">Détails de l’enfant</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Nom de l’enfant</label>
                <input type="text" v-model.trim="form.childLastName" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-slate-800" required />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Prénom de l’enfant</label>
                <input type="text" v-model.trim="form.childFirstName" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-slate-800" required />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Date de naissance</label>
                <div class="relative">
                  <input type="date" v-model="form.childDob" class="w-full px-4 py-3 pl-12 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-slate-800" required />
                  <Calendar class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Genre</label>
                <select v-model="form.childGender" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow text-slate-800 appearance-none" required>
                  <option value="" disabled>-- choisir --</option>
                  <option value="Garçon">Garçon</option>
                  <option value="Fille">Fille</option>
                </select>
              </div>
            </div>
          </div>

          <!-- STEP 2: Parents -->
          <div v-show="currentStep === 2" class="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-blue-100 text-blue-600 rounded-lg"><UserCircle class="w-6 h-6" /></div>
              <h2 class="text-lg sm:text-xl font-bold text-slate-800">Information des parents</h2>
            </div>

            <!-- Father -->
            <div class="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
              <h3 class="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Le Père</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Nom</label>
                  <input type="text" v-model.trim="form.fatherLastName" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Prénom</label>
                  <input type="text" v-model.trim="form.fatherFirstName" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Téléphone</label>
                  <input type="tel" v-model.trim="form.fatherPhone" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
              </div>
            </div>

            <!-- Mother -->
            <div class="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
              <h3 class="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">La Mère</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Nom</label>
                  <input type="text" v-model.trim="form.motherLastName" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Prénom</label>
                  <input type="text" v-model.trim="form.motherFirstName" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Téléphone</label>
                  <input type="tel" v-model.trim="form.motherPhone" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
              </div>
            </div>

            <!-- Common -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">E-mail de contact (Obligatoire)</label>
              <input type="email" v-model.trim="form.contactEmail" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div class="md:col-span-3">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Adresse postale</label>
                <input type="text" v-model.trim="form.address" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div class="md:col-span-1">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Code postal</label>
                <input type="text" v-model.trim="form.postalCode" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Ville</label>
                <input type="text" v-model.trim="form.city" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>

            <div class="mt-6 p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <h3 class="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wider">Création de compte (Obligatoire)</h3>
              <p class="text-xs text-slate-500 mb-4">Afin de faciliter vos prochaines démarches et de suivre vos demandes d'inscription, vous devez choisir un mot de passe pour accéder à la plateforme prochainement.</p>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Mot de passe pour votre compte parent</label>
                <input type="password" v-model="form.parentPassword" placeholder="Minimum 6 caractères" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>
          </div>

          <!-- STEP 3: Classe -->
          <div v-show="currentStep === 3" class="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Calendar class="w-6 h-6" /></div>
              <h2 class="text-lg sm:text-xl font-bold text-slate-800">Choix de la classe & créneau</h2>
            </div>

            <div v-if="classRecommendationInfo.unknownLevel || (!recommendedClasses.length && !allClasses.length)" class="bg-amber-50 text-amber-800 p-4 sm:p-6 rounded-2xl border border-amber-200">
               <p class="font-bold flex items-center mb-2"><Info class="w-5 h-5 mr-2" /> Niveau non déterminé</p>
               <p class="text-xs sm:text-sm">
                  Le niveau de votre enfant n'est pas connu, ou ne correspond pas aux schémas standards.
                  Merci de continuer à inscrire votre enfant et de vous rapprocher de l'administration après l'inscription afin de définir le bon niveau.
               </p>
            </div>
            
            <div v-else>
               <p class="text-sm sm:text-base text-slate-600 mb-6 font-medium">
                  Voici les classes recommandées pour le niveau de <strong>{{ form.childFirstName }}</strong>. Vous pouvez choisir un créneau ci-dessous.
               </p>
               
               <div v-if="recommendedClasses.length === 0" class="bg-amber-50 text-amber-800 p-4 sm:p-6 rounded-2xl border border-amber-200 mb-6">
                 <p class="font-bold text-sm sm:text-base">Aucune classe trouvée pour ce niveau.</p>
                 <p class="text-xs sm:text-sm">Vous pouvez continuer sans choisir de créneau et contacter l'administration.</p>
               </div>
               
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 <label 
                   v-for="c in recommendedClasses" :key="c.id" 
                   class="flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-colors relative"
                   :class="form.selectedClassId === c.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 bg-white'"
                 >
                   <input type="radio" :value="c.id" v-model="form.selectedClassId" class="sr-only" />
                   
                   <div class="flex justify-between items-start mb-2">
                     <span class="font-bold text-slate-800 text-base sm:text-lg">{{ c.name }}</span>
                     <div class="w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0"
                          :class="form.selectedClassId === c.id ? 'border-indigo-500' : 'border-slate-300'">
                       <div v-if="form.selectedClassId === c.id" class="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                     </div>
                   </div>
                   
                   <div class="text-xs sm:text-sm text-slate-600 space-y-1">
                     <p><strong>Niveau:</strong> {{ c.level }} <span v-if="c.ageRange">({{ c.ageRange }})</span></p>
                     <p class="flex items-center text-slate-500"><Calendar class="w-4 h-4 mr-1 shrink-0"/> {{ c.day }} de {{ c.startHour }} à {{ c.endHour }}</p>
                     <p v-if="c.capacity" class="text-xs mt-2" :class="c.capacity.remainingPlaces > 0 ? 'text-emerald-600' : 'text-red-500 font-bold'">
                       Places restantes: {{ c.capacity.remainingPlaces }}
                     </p>
                   </div>
                 </label>
               </div>

               <div class="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start text-xs sm:text-sm text-amber-800 mb-6">
                 <AlertCircle class="w-5 h-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
                 <div>
                   <span class="font-bold block mb-1 text-amber-900">Attention important</span>
                   <p>Vous êtes en train de faire une pré-demande. Si vous ne validez pas votre inscription auprès de l'administration, les places peuvent être prises entre-temps car les créneaux se remplissent vite. <strong>Ne tardez pas à valider votre inscription physiquement à l'administration !</strong></p>
                 </div>
               </div>

               <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start text-xs sm:text-sm text-indigo-800 mb-6">
                 <Info class="w-5 h-5 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                 <p>
                   Si vous voyez que votre enfant a fait l'étude de l'arabe auparavant dans une autre école, 
                   merci de choisir une classe se rapprochant de son niveau et de vous rapprocher de l'administration afin de faire le test.
                 </p>
               </div>
            </div>

            <label class="flex items-start gap-3 sm:gap-4 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" :class="{'ring-2 ring-indigo-500 bg-indigo-50 border-indigo-200': form.skipClassSelection}">
              <input type="checkbox" v-model="form.skipClassSelection" @change="form.skipClassSelection ? form.selectedClassId = null : null" class="mt-1 w-5 h-5 text-indigo-600 rounded shrink-0 focus:ring-indigo-500" />
              <span class="text-xs sm:text-sm text-slate-700 leading-snug">Je souhaite continuer sans choisir le créneau pour le moment et faire la demande d'inscription compléte.</span>
            </label>

          </div>

          <!-- STEP 4: Autorisations -->
          <div v-show="currentStep === 4" class="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-amber-100 text-amber-600 rounded-lg"><Info class="w-6 h-6" /></div>
              <h2 class="text-lg sm:text-xl font-bold text-slate-800">Autorisations & consentements</h2>
            </div>

            <fieldset class="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
              <legend class="text-sm font-bold text-slate-800 mb-4">Personnes autorisées à récupérer l’enfant après le cours</legend>
              <div class="flex flex-wrap gap-4 sm:gap-6 mb-4">
                <label class="flex items-center cursor-pointer">
                  <input type="checkbox" value="Père" v-model="form.authorized" class="w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500" />
                  <span class="ml-2 font-medium text-sm sm:text-base text-slate-700">Père</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input type="checkbox" value="Mère" v-model="form.authorized" class="w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500" />
                  <span class="ml-2 font-medium text-sm sm:text-base text-slate-700">Mère</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input type="checkbox" value="Autre" v-model="form.authorized" class="w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500" />
                  <span class="ml-2 font-medium text-sm sm:text-base text-slate-700">Autre</span>
                </label>
              </div>
              <div v-if="form.authorized.includes('Autre')" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                <input type="text" placeholder="Nom & prénom" v-model="form.authorizedOtherName" class="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                <input type="text" placeholder="Lien avec l’enfant" v-model="form.authorizedOtherRelation" class="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </fieldset>

            <fieldset class="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <legend class="text-sm font-bold text-slate-800">J’autorise mon enfant à partir seul après l’école ?</legend>
              <div class="flex gap-6">
                <label class="flex items-center cursor-pointer"><input type="radio" value="oui" v-model="form.leaveAlone" class="w-5 h-5 text-amber-600 focus:ring-amber-500" /><span class="ml-2 text-sm sm:text-base">Oui</span></label>
                <label class="flex items-center cursor-pointer"><input type="radio" value="non" v-model="form.leaveAlone" class="w-5 h-5 text-amber-600 focus:ring-amber-500" /><span class="ml-2 text-sm sm:text-base">Non</span></label>
              </div>
            </fieldset>

            <fieldset class="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <legend class="text-sm font-bold text-slate-800">Droit à l’image</legend>
                <p class="text-[11px] text-slate-500 mt-1">J’autorise l’école à utiliser photos/vidéos de mon enfant</p>
              </div>
              <div class="flex gap-6">
                <label class="flex items-center cursor-pointer"><input type="radio" value="oui" v-model="form.imageRights" class="w-5 h-5 text-amber-600 focus:ring-amber-500" /><span class="ml-2 text-sm sm:text-base">Oui</span></label>
                <label class="flex items-center cursor-pointer"><input type="radio" value="non" v-model="form.imageRights" class="w-5 h-5 text-amber-600 focus:ring-amber-500" /><span class="ml-2 text-sm sm:text-base">Non</span></label>
              </div>
            </fieldset>
            
            <fieldset class="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <legend class="text-sm font-bold text-red-600">Informations médicales à nous transmettre</legend>
                <div class="flex gap-6">
                  <label class="flex items-center cursor-pointer"><input type="radio" value="oui" v-model="form.medicalInfo" class="w-5 h-5 text-red-600 focus:ring-red-500" /><span class="ml-2 text-sm sm:text-base">Oui</span></label>
                  <label class="flex items-center cursor-pointer"><input type="radio" value="non" v-model="form.medicalInfo" class="w-5 h-5 text-red-600 focus:ring-red-500" /><span class="ml-2 text-sm sm:text-base">Non</span></label>
                </div>
              </div>
              <div v-if="form.medicalInfo === 'oui'" class="mt-4">
                <textarea rows="3" v-model.trim="form.medicalDetails" placeholder="Précisez traitements, allergies, etc..." class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"></textarea>
              </div>
            </fieldset>

            <fieldset class="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                <legend class="text-sm font-bold text-red-600">L’enfant suit-il un traitement médical ?</legend>
                <p class="text-[11px] text-slate-500 mt-1">(aucun traitement sans ordonnance)</p>
              </div>
              <div class="flex gap-6">
                <label class="flex items-center cursor-pointer"><input type="radio" value="oui" v-model="form.medicalTreatment" class="w-5 h-5 text-red-600 focus:ring-red-500" /><span class="ml-2 text-sm sm:text-base">Oui</span></label>
                <label class="flex items-center cursor-pointer"><input type="radio" value="non" v-model="form.medicalTreatment" class="w-5 h-5 text-red-600 focus:ring-red-500" /><span class="ml-2 text-sm sm:text-base">Non</span></label>
              </div>
            </fieldset>
          </div>

          <!-- STEP 5: Validation -->
          <div v-show="currentStep === 5" class="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-purple-100 text-purple-600 rounded-lg"><CheckCircle2 class="w-6 h-6" /></div>
              <h2 class="text-lg sm:text-xl font-bold text-slate-800">Récapitulatif & Validation</h2>
            </div>
            
            <div class="bg-purple-50 p-4 sm:p-6 rounded-2xl border border-purple-100 shadow-sm mb-6 overflow-hidden">
              <ul class="space-y-3 text-xs sm:text-sm text-slate-700">
                <li class="flex flex-col sm:flex-row sm:items-start"><span class="font-bold sm:w-32 shrink-0 mb-1 sm:mb-0">Enfant :</span> <span>{{ form.childFirstName }} {{ form.childLastName }} ({{ form.childGender }}), Né(e) le {{ form.childDob }}</span></li>
                <li class="flex flex-col sm:flex-row sm:items-start"><span class="font-bold sm:w-32 shrink-0 mb-1 sm:mb-0">Parents :</span> <span class="break-words">{{ form.fatherFirstName }} & {{ form.motherFirstName }} <br class="sm:hidden" />- {{ form.contactEmail }}</span></li>
                <li class="flex flex-col sm:flex-row sm:items-start"><span class="font-bold sm:w-32 shrink-0 mb-1 sm:mb-0">Adresse :</span> <span>{{ form.address }}, {{ form.postalCode }} {{ form.city }}</span></li>
                <li v-if="form.selectedClassId" class="flex flex-col sm:flex-row sm:items-start"><span class="font-bold sm:w-32 shrink-0 mb-1 sm:mb-0">Classe :</span> <span>{{ allClasses.find(c => c.id === form.selectedClassId)?.name || '...' }} ({{ allClasses.find(c => c.id === form.selectedClassId)?.day || '' }} {{ allClasses.find(c => c.id === form.selectedClassId)?.startHour || '' }})</span></li>
                <li v-else-if="form.skipClassSelection" class="flex flex-col sm:flex-row sm:items-start"><span class="font-bold sm:w-32 shrink-0 mb-1 sm:mb-0">Classe :</span> <span class="text-amber-600">Choix reporté</span></li>
                <li class="flex flex-col sm:flex-row sm:items-start"><span class="font-bold sm:w-32 shrink-0 mb-1 sm:mb-0">Autorisés :</span> <span>{{ form.authorized.join(', ') }}</span></li>
              </ul>
            </div>

            <div class="space-y-4">
              <label class="flex items-start gap-3 sm:gap-4 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" :class="{'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-200': form.commitmentSitu}">
                <input type="checkbox" v-model="form.commitmentSitu" class="mt-1 w-5 h-5 text-emerald-600 rounded" required />
                <span class="text-xs sm:text-sm text-slate-700 leading-snug">
                  Je m’engage à informer l’école de tout changement de situation (coordonnées, autorisations, etc.)
                </span>
              </label>

              <label class="flex items-start gap-3 sm:gap-4 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" :class="{'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-200': form.legalDeclaration}">
                <input type="checkbox" v-model="form.legalDeclaration" class="mt-1 w-5 h-5 text-emerald-600 rounded shrink-0" required />
                <span class="text-xs sm:text-sm text-slate-700 leading-snug">
                  Je soussigné(e), responsable légal(e) de l’enfant, déclare exacts les renseignements fournis et autorise le CCIB38 à prendre, si besoin, toutes mesures nécessaires (traitement médical, hospitalisation, intervention chirurgicale).
                </span>
              </label>

              <label class="flex items-start gap-3 sm:gap-4 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors" :class="{'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-200': form.paymentTerms}">
                <input type="checkbox" v-model="form.paymentTerms" class="mt-1 w-5 h-5 text-emerald-600 rounded shrink-0" required />
                <div class="text-xs sm:text-sm text-slate-700 leading-snug">
                  J’accepte que l’inscription ne soit validée qu’à réception du règlement. <br/>
                  <small class="text-slate-500 block mt-2 p-2 bg-white rounded-lg border border-slate-100 text-[10px] sm:text-xs">Grille tarifaire : 1 enfant : 230 € | 2 enfants : 430 € | 3 enfants : 600 € | frais de dossier : 10 € par enfant.<br/>Paiement possible en CB, espèces ou chèques (plusieurs fois).</small>
                </div>
              </label>
            </div>
          </div>

          <!-- NAVIGATION BUTTONS -->
          <div class="mt-8 sm:mt-10 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button 
              type="button" 
              @click="prevStep" 
              class="flex items-center justify-center w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold text-sm rounded-xl transition-colors disabled:opacity-0"
              :disabled="currentStep === 0"
            >
              <ChevronLeft class="w-4 h-4 mr-1" /> Précédent
            </button>
            
            <button 
              v-if="currentStep < stepLabels.length - 1"
              type="button" 
              @click="nextStep" 
              :disabled="!stepValid || isSearching"
              class="flex items-center justify-center w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-slate-800 text-white hover:bg-slate-700 font-bold text-sm rounded-xl transition-colors shadow-md shadow-slate-800/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSearching" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Recherche...
              </span>
              <span v-else class="flex items-center">
                Suivant <ChevronRight class="w-4 h-4 ml-1" />
              </span>
            </button>
            
            <button 
              v-else
              type="submit" 
              :disabled="!stepValid || isSubmitting"
              class="flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-600/30 disabled:bg-emerald-400 disabled:cursor-wait"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Envoi en cours...
              </span>
              <span v-else class="flex items-center gap-2">
                <Send class="w-4 h-4" /> Envoyer l'inscription
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

