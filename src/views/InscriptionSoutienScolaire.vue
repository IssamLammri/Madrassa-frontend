<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="@/assets/icons/logoccib38.jpg" alt="Logo" class="h-10 w-auto object-contain" />
          <h1 class="text-slate-800 font-bold text-lg hidden sm:block">Soutien Scolaire</h1>
        </div>
        <button @click="router.push('/login')" class="text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors">
          Espace Parent
        </button>
      </div>
    </header>

    <main class="flex-grow py-8 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto">
        <div v-if="demandSent" class="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-emerald-900/5 border border-emerald-100 animate-[fadeIn_0.5s_ease-out]">
          <div class="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check class="w-12 h-12 text-emerald-500" />
          </div>
          <h2 class="text-3xl font-black text-slate-800 mb-4 tracking-tight">Votre demande d'inscription a bien été enregistrée.</h2>
          <p class="text-slate-600 text-lg mb-8 leading-relaxed">
            Un email de confirmation vous a été envoyé.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="router.push('/home')" class="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 shadow-md transition-colors">
              Aller au portail des parents
            </button>
            <button @click="resetForm" class="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md transition-colors">
              Inscrire un autre enfant
            </button>
          </div>
        </div>

        <form v-else @submit.prevent="submitForm" class="space-y-8">
          
          <div v-if="submitError" class="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-4 rounded-2xl flex items-start shadow-sm mb-6">
            <AlertCircle class="w-6 h-6 mr-3 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <p class="font-bold text-sm sm:text-base mb-1">Erreur de soumission</p>
              <p class="text-sm font-medium mb-2">{{ submitError }}</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <div class="flex items-center justify-between w-full relative">
              <div class="absolute left-0 top-1/2 -mt-[1px] w-full h-[2px] bg-slate-100 z-0"></div>
              <template v-for="(label, idx) in stepLabels" :key="idx">
                <div class="relative z-10 flex flex-col items-center">
                  <div 
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300"
                    :class="[
                      currentStep > idx ? 'bg-emerald-500 text-white shadow-md ring-4 ring-white' : 
                      currentStep === idx ? 'bg-slate-800 text-white ring-4 ring-white shadow-md' : 'bg-slate-200 text-slate-500'
                    ]"
                  >
                    <Check v-if="currentStep > idx" class="w-4 h-4" />
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <span class="hidden sm:block absolute top-12 text-[10px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors"
                    :class="currentStep >= idx ? 'text-slate-800' : 'text-slate-400'">
                    {{ label }}
                  </span>
                </div>
              
              </template>
            </div>
            <div class="hidden sm:block h-8"></div>
          </div>
          <div class="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
            <!-- STEP 0: Identité & Recherche -->
            <div v-show="currentStep === 0" class="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
              <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <h2 class="text-lg sm:text-xl font-bold text-slate-800">Identification de l'enfant</h2>
              </div>
              <p class="text-slate-600 text-sm">Veuillez saisir le nom et prénom de l'enfant pour vérifier s'il est déjà inscrit dans notre base de données.</p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Nom de l'enfant <span class="text-red-500">*</span></label>
                  <input v-model="form.childLastName" type="text" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                  <p v-if="validationErrors.childLastName" class="text-red-500 text-xs mt-1">{{ validationErrors.childLastName[0] }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Prénom de l'enfant <span class="text-red-500">*</span></label>
                  <input v-model="form.childFirstName" type="text" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                  <p v-if="validationErrors.childFirstName" class="text-red-500 text-xs mt-1">{{ validationErrors.childFirstName[0] }}</p>
                </div>
              </div>
            </div>

            <!-- STEP 1: Détails de l'enfant -->
            <div v-show="currentStep === 1" class="space-y-6 sm:space-y-8 animate-[fadeIn_0.3s_ease-out]">
              <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <h2 class="text-lg sm:text-xl font-bold text-slate-800">Détails de l'enfant</h2>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Date de naissance <span class="text-red-500">*</span></label>
                  <input v-model="form.childDob" type="date" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                  <p v-if="validationErrors.childDob" class="text-red-500 text-xs mt-1">{{ validationErrors.childDob[0] }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Sexe <span class="text-red-500">*</span></label>
                  <div class="flex gap-4 h-12">
                    <label class="flex items-center gap-2 cursor-pointer px-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1 transition-colors" :class="{'border-emerald-500 bg-emerald-50': form.childGender === 'M'}">
                      <input type="radio" v-model="form.childGender" value="M" class="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <span class="text-slate-700 font-medium text-sm">Garçon</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer px-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1 transition-colors" :class="{'border-emerald-500 bg-emerald-50': form.childGender === 'F'}">
                      <input type="radio" v-model="form.childGender" value="F" class="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <span class="text-slate-700 font-medium text-sm">Fille</span>
                    </label>
                  </div>
                  <p v-if="validationErrors.childGender" class="text-red-500 text-xs mt-1">{{ validationErrors.childGender[0] }}</p>
                </div>
              </div>


            </div>
            <!-- STEP 2: Parents -->
            <div v-show="currentStep === 2" class="space-y-8">
              <h2 class="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">Informations des parents</h2>
              
              <div class="space-y-6">
                <h3 class="text-lg font-bold text-slate-800">Mère / Tuteur 1</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Nom <span class="text-red-500">*</span></label>
                    <input v-model="form.motherLastName" type="text" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                    <p v-if="validationErrors.motherLastName" class="text-red-500 text-xs mt-1">{{ validationErrors.motherLastName[0] }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Prénom <span class="text-red-500">*</span></label>
                    <input v-model="form.motherFirstName" type="text" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                    <p v-if="validationErrors.motherFirstName" class="text-red-500 text-xs mt-1">{{ validationErrors.motherFirstName[0] }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Téléphone</label>
                    <input v-model="form.motherPhone" type="tel" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                    <p v-if="validationErrors.motherPhone" class="text-red-500 text-xs mt-1">{{ validationErrors.motherPhone[0] }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-6 pt-6 border-t border-slate-100">
                <h3 class="text-lg font-bold text-slate-800">Père / Tuteur 2</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Nom</label>
                    <input v-model="form.fatherLastName" type="text" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Prénom</label>
                    <input v-model="form.fatherFirstName" type="text" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Téléphone</label>
                    <input v-model="form.fatherPhone" type="tel" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

            </div>

            <!-- STEP 3: Address -->
            <div v-show="currentStep === 3" class="space-y-6">
              <h2 class="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">Adresse & Contact</h2>
              
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Email principal <span class="text-red-500">*</span></label>
                <input v-model="form.contactEmail" type="email" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                <p v-if="validationErrors.contactEmail" class="text-red-500 text-xs mt-1">{{ validationErrors.contactEmail[0] }}</p>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Adresse postale <span class="text-red-500">*</span></label>
                <input v-model="form.address" type="text" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                <p v-if="validationErrors.address" class="text-red-500 text-xs mt-1">{{ validationErrors.address[0] }}</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-2">Code Postal <span class="text-red-500">*</span></label>
                  <input v-model="form.postalCode" type="text" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                  <p v-if="validationErrors.postalCode" class="text-red-500 text-xs mt-1">{{ validationErrors.postalCode[0] }}</p>
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-2">Ville <span class="text-red-500">*</span></label>
                  <input v-model="form.city" type="text" class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                  <p v-if="validationErrors.city" class="text-red-500 text-xs mt-1">{{ validationErrors.city[0] }}</p>
                </div>
              </div>
            </div>

            <!-- STEP 4: Level -->
            <div v-show="currentStep === 4" class="space-y-6">
              <h2 class="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">Niveau Scolaire</h2>
              <div v-if="isLoadingLevels" class="flex justify-center py-8">
                 <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  v-for="level in levels" 
                  :key="level.value"
                  type="button"
                  @click="selectLevel(level.value)"
                  class="p-4 border-2 rounded-xl text-left transition-all"
                  :class="form.schoolLevel === level.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
                >
                  <span class="block font-bold text-slate-800">{{ level.label }}</span>
                </button>
              </div>
              <p v-if="validationErrors.schoolLevel" class="text-red-500 text-xs mt-1">{{ validationErrors.schoolLevel[0] }}</p>
            </div>

            <!-- STEP 5: Subject -->
            <div v-show="currentStep === 5" class="space-y-6">
              <h2 class="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">Matière</h2>
              <div v-if="isLoadingSubjects" class="flex justify-center py-8">
                 <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
              <div v-else-if="subjects.length === 0" class="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                <p class="font-medium">Aucune matière disponible pour ce niveau.</p>
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  v-for="sub in subjects" 
                  :key="sub"
                  type="button"
                  @click="selectSubject(sub)"
                  class="p-4 border-2 rounded-xl text-left transition-all"
                  :class="form.subject === sub ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
                >
                  <span class="block font-bold text-slate-800">{{ sub }}</span>
                </button>
              </div>
              <p v-if="validationErrors.subject" class="text-red-500 text-xs mt-1">{{ validationErrors.subject[0] }}</p>
            </div>

            <!-- STEP 6: Class/Creneau -->
            <div v-show="currentStep === 6" class="space-y-6">
              <h2 class="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">Choix du Créneau</h2>
              <div v-if="isLoadingClasses" class="flex justify-center py-8">
                 <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
              <div v-else-if="studyClasses.length === 0" class="text-center py-8 bg-slate-50 rounded-xl text-slate-600 border border-slate-200">
                <p class="font-medium">Aucun créneau disponible pour ce niveau et cette matière.</p>
              </div>
              <div v-else class="grid grid-cols-1 gap-4">
                <button 
                  v-for="cls in studyClasses" 
                  :key="cls.id"
                  type="button"
                  @click="selectClass(cls.id)"
                  class="p-4 border-2 rounded-xl text-left transition-all flex flex-col gap-2 relative overflow-hidden"
                  :class="form.selectedClassId === cls.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
                >
                  <div v-if="form.selectedClassId === cls.id" class="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">
                    Sélectionné
                  </div>
                  <span class="block font-bold text-slate-800 pr-20">{{ cls.name }}</span>
                  <span class="text-sm text-slate-600">{{ cls.day }} — {{ cls.startHour }} à {{ cls.endHour }}</span>
                  <span class="text-xs font-semibold text-emerald-600 mt-1" v-if="cls.availablePlaces > 0">{{ cls.availablePlaces }} places disponibles</span>
                  <span class="text-xs font-semibold text-red-500 mt-1" v-else>Complet</span>
                </button>
              </div>
              <p v-if="validationErrors.selectedClassId" class="text-red-500 text-xs mt-1">{{ validationErrors.selectedClassId[0] }}</p>
            </div>

            <!-- STEP 7: Conditions -->
            <div v-show="currentStep === 7" class="space-y-6">
              <h2 class="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">Conditions d'inscription</h2>
              
              <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
                <p class="text-amber-800 text-sm leading-relaxed mb-4">
                  En validant ce formulaire, vous effectuez une demande d'inscription au soutien scolaire.
                  Cette demande sera examinée par l'administration.
                </p>
                <div class="bg-amber-100/50 rounded-lg p-4 border border-amber-200/50">
                  <p class="text-amber-900 font-bold mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Attention : votre place n'est pas gardée jusqu'à ce que vous validiez l'inscription par le paiement.
                  </p>
                  <p class="text-amber-900 text-sm font-medium mb-3">
                    Le frais est de <strong class="bg-amber-200 px-1 rounded">30 € par enfant et par matière</strong> et le paiement est fait par an.
                  </p>
                  <ul class="text-amber-800 text-sm list-disc pl-5 space-y-1.5 font-medium">
                    <li>Soit complet en espèce ou CB</li>
                    <li>Soit en plusieurs fois par chèque (jusqu'à 10 fois)</li>
                  </ul>
                </div>
              </div>

              <label class="flex items-start gap-3 cursor-pointer group">
                <div class="relative flex items-center pt-1">
                  <input type="checkbox" v-model="form.acceptedPaymentTerms" class="peer sr-only" required />
                  <div class="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                    <Check class="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <span class="text-sm text-slate-700 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                  J'accepte les conditions générales d'inscription et de règlement du centre CCIB38. <span class="text-red-500">*</span>
                </span>
              </label>
              <p v-if="validationErrors.acceptedPaymentTerms" class="text-red-500 text-xs mt-1">{{ validationErrors.acceptedPaymentTerms[0] }}</p>

            </div>

            <!-- BUTTONS -->
            <div class="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
              <button 
                type="button" 
                @click="prevStep" 
                class="px-6 py-3 font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                :class="{ 'invisible': currentStep === 0 }"
              >
                Retour
              </button>
              
              <button 
                v-if="currentStep < 7"
                type="button" 
                @click="nextStep" 
                class="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 shadow-md transition-colors flex items-center disabled:opacity-50"
                :disabled="isSearching"
              >
                <div v-if="isSearching" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Suivant
              </button>
              
              <button 
                v-else
                type="submit" 
                class="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md transition-colors flex items-center disabled:opacity-50"
                :disabled="isSubmitting || !form.acceptedPaymentTerms"
              >
                <div v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <Send v-else class="w-4 h-4 mr-2" />
                Soumettre la demande
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  </div>

    <!-- Dialog pour résultats multiples -->
    <div v-if="showSelectionDialog" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 class="text-xl font-bold text-slate-800">Plusieurs dossiers trouvés</h3>
            <p class="text-slate-600 text-sm mt-1">Veuillez sélectionner votre enfant parmi les résultats suivants.</p>
          </div>
          <button @click="skipSelectionAndProceed" class="text-slate-400 hover:text-slate-600 p-2">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1">
          <div class="space-y-4">
            <div v-for="(res, idx) in searchResults" :key="idx" 
                 @click="selectedStudentIndex = idx"
                 class="p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4"
                 :class="selectedStudentIndex === idx ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'">
              <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
                   :class="selectedStudentIndex === idx ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'">
                {{ res.firstName ? res.firstName.charAt(0) : '' }}
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-800 text-lg">{{ res.firstName }} {{ res.lastName }}</h4>
                <div class="mt-2 space-y-1 text-sm text-slate-600">
                  <div class="flex items-center gap-2">
                    <Calendar class="w-4 h-4 text-slate-400" />
                    <span>Né(e) le : {{ (res.dob || res.birthDate) || 'Non renseignée' }}</span>
                  </div>
                  <div v-if="res.parent" class="flex items-center gap-2">
                    <User class="w-4 h-4 text-slate-400" />
                    <span>Parent : {{ res.parent.fatherFirstName || res.parent.motherFirstName || 'Non renseigné' }} {{ res.parent.fatherLastName || res.parent.motherLastName || '' }}</span>
                  </div>
                </div>
              </div>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-3"
                   :class="selectedStudentIndex === idx ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'">
                <Check v-if="selectedStudentIndex === idx" class="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div @click="selectedStudentIndex = -1"
                 class="p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4"
                 :class="selectedStudentIndex === -1 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'">
              <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                   :class="selectedStudentIndex === -1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'">
                <Plus class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-800">Aucun de ces enfants n'est le mien</h4>
                <p class="text-sm text-slate-600">Poursuivre comme nouvelle inscription</p>
              </div>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                   :class="selectedStudentIndex === -1 ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'">
                <Check v-if="selectedStudentIndex === -1" class="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
          <button @click="skipSelectionAndProceed" class="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            Annuler
          </button>
          <button @click="selectStudentAndProceed" 
                  :disabled="selectedStudentIndex === null"
                  class="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center gap-2">
            Valider la sélection <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Check, AlertCircle, Send, Plus, X, Calendar, User, ArrowRight, Search } from 'lucide-vue-next'

const router = useRouter()

// Use standard axios instead of apiClient since this is a public page (no auth header needed)
const baseURL = 'https://ecole.ccib38.fr'

const currentStep = ref(0)
const stepLabels = [
  "Identité",
  "Détails",
  "Parents",
  "Adresse",
  "Niveau",
  "Matière",
  "Créneau",
  "Validation"
]

const showSelectionDialog = ref(false)
const searchResults = ref([])
const selectedStudentIndex = ref(null)
const demandSent = ref(false)
const isSubmitting = ref(false)
const isSearching = ref(false)
const submitError = ref('')
const validationErrors = ref({})

const isLoadingLevels = ref(false)
const isLoadingSubjects = ref(false)
const isLoadingClasses = ref(false)

const levels = ref([])
const subjects = ref([])
const studyClasses = ref([])

const studentId = ref(null)

const form = reactive({
  childFirstName: '',
  childLastName: '',
  childDob: '',
  contactEmail: '',
  parentPhone: '',
  
  childGender: '',
  schoolLevel: '',
  subject: '',
  
  fatherLastName: '',
  fatherFirstName: '',
  fatherPhone: '',
  motherLastName: '',
  motherFirstName: '',
  motherPhone: '',
  
  address: '',
  postalCode: '',
  city: '',

  selectedClassId: null,
  acceptedPaymentTerms: false
})

onMounted(async () => {
  await fetchLevels()
})

const fetchLevels = async () => {
  isLoadingLevels.value = true
  try {
    const response = await axios.get(`${baseURL}/academic-support/api/levels`)
    if (response.data && response.data.status === 'success') {
      levels.value = response.data.levels
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des niveaux:", error)
  } finally {
    isLoadingLevels.value = false
  }
}

const fetchSubjects = async () => {
  if (!form.schoolLevel) return
  isLoadingSubjects.value = true
  try {
    const params = new URLSearchParams({ level: form.schoolLevel })
    const response = await axios.get(`${baseURL}/academic-support/api/subjects?${params.toString()}`)
    if (response.data && response.data.status === 'success') {
      subjects.value = response.data.subjects
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des matières:", error)
  } finally {
    isLoadingSubjects.value = false
  }
}

const fetchClasses = async () => {
  if (!form.schoolLevel || !form.subject) return
  isLoadingClasses.value = true
  try {
    const params = new URLSearchParams({ level: form.schoolLevel, subject: form.subject })
    const response = await axios.get(`${baseURL}/academic-support/api/study-classes?${params.toString()}`)
    if (response.data && response.data.status === 'success') {
      studyClasses.value = response.data.studyClasses
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux:", error)
  } finally {
    isLoadingClasses.value = false
  }
}

const selectLevel = (levelValue) => {
  form.schoolLevel = levelValue
  form.subject = ''
  form.selectedClassId = null
  fetchSubjects()
}

const selectSubject = (subject) => {
  form.subject = subject
  form.selectedClassId = null
  fetchClasses()
}

const selectClass = (classId) => {
  form.selectedClassId = classId
}

const validateStep = () => {
  validationErrors.value = {}
  let isValid = true
  
  if (currentStep.value === 0) {
    if (!form.childFirstName) { validationErrors.value.childFirstName = ["Prénom requis"]; isValid = false }
    if (!form.childLastName) { validationErrors.value.childLastName = ["Nom requis"]; isValid = false }
  } else if (currentStep.value === 1) {
    if (!form.childDob) { validationErrors.value.childDob = ["Date de naissance requise"]; isValid = false }
    if (!form.childGender) { validationErrors.value.childGender = ["Genre requis"]; isValid = false }

  } else if (currentStep.value === 2) {
    if (!form.motherLastName && !form.fatherLastName) { 
      validationErrors.value.motherLastName = ["Un nom (Mère ou Père) est requis"]
      isValid = false 
    }
    if (!form.motherFirstName && !form.fatherFirstName) { 
      validationErrors.value.motherFirstName = ["Un prénom (Mère ou Père) est requis"]
      isValid = false 
    }
  } else if (currentStep.value === 3) {
    if (!form.contactEmail) { validationErrors.value.contactEmail = ["Email requis"]; isValid = false }
    if (!form.address) { validationErrors.value.address = ["Adresse requise"]; isValid = false }
    if (!form.postalCode) { validationErrors.value.postalCode = ["Code postal requis"]; isValid = false }
    if (!form.city) { validationErrors.value.city = ["Ville requise"]; isValid = false }
  } else if (currentStep.value === 4) {
    if (!form.schoolLevel) { validationErrors.value.schoolLevel = ["Veuillez choisir un niveau"]; isValid = false }
  } else if (currentStep.value === 5) {
    if (!form.subject) { validationErrors.value.subject = ["Veuillez choisir une matière"]; isValid = false }
  } else if (currentStep.value === 6) {
    if (!form.selectedClassId) { validationErrors.value.selectedClassId = ["Veuillez choisir un créneau"]; isValid = false }
  }
  
  return isValid
}

const nextStep = async () => {
  submitError.value = ''
  
  if (!validateStep()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  
  if (currentStep.value === 0) {
    await searchStudent()
  } else {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}


const proceedWithStudent = async (studentData) => {
  studentId.value = studentData.id ?? null

  form.childFirstName =
    studentData.firstName || form.childFirstName

  form.childLastName =
    studentData.lastName || form.childLastName

  if (studentData.birthDate) {
    form.childDob = String(studentData.birthDate).slice(0, 10)
  }

  const gender = String(studentData.gender || '').toLowerCase()

  if (['m', 'male', 'garçon', 'garcon'].includes(gender)) {
    form.childGender = 'M'
  } else if (['f', 'female', 'fille'].includes(gender)) {
    form.childGender = 'F'
  }

  if (studentData.schoolLevel) {
    form.schoolLevel = studentData.schoolLevel
    await fetchSubjects()
  }

  form.address = studentData.address || ''
  form.postalCode = studentData.postalCode || ''
  form.city = studentData.city || ''

  const parent = studentData.parent

  if (parent) {
    form.fatherFirstName = parent.fatherFirstName || ''
    form.fatherLastName = parent.fatherLastName || ''
    form.fatherPhone = parent.fatherPhone || ''

    form.motherFirstName = parent.motherFirstName || ''
    form.motherLastName = parent.motherLastName || ''
    form.motherPhone = parent.motherPhone || ''

    form.contactEmail =
      parent.contactEmail ||
      parent.fatherEmail ||
      parent.motherEmail ||
      ''
  }

  showSelectionDialog.value = false
  currentStep.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const selectStudentAndProceed = () => {
  if (selectedStudentIndex.value === -1) {
    skipSelectionAndProceed()
  } else if (selectedStudentIndex.value !== null && searchResults.value[selectedStudentIndex.value]) {
    proceedWithStudent(searchResults.value[selectedStudentIndex.value])
  }
}

const skipSelectionAndProceed = () => {
  showSelectionDialog.value = false
  studentId.value = null
  currentStep.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const searchStudent = async () => {
  isSearching.value = true
  submitError.value = ''
  searchResults.value = []
  selectedStudentIndex.value = null

  try {
    const { data } = await axios.post(
      `${baseURL}/academic-support/api/students/search`,
      {
        firstName: form.childFirstName.trim(),
        lastName: form.childLastName.trim()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    )

    const results = Array.isArray(data?.students)
      ? data.students
      : []

    if (results.length === 1) {
      await proceedWithStudent(results[0])
      return
    }

    if (results.length > 1) {
      searchResults.value = results
      showSelectionDialog.value = true
      return
    }

    // Aucun enfant trouvé : continuer comme nouvelle inscription
    studentId.value = null
    currentStep.value = 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Erreur de recherche :', error)

    // Rester à l’étape 0 si l’appel échoue réellement
    submitError.value =
      error.response?.data?.message ||
      "Impossible de rechercher l'enfant. Veuillez réessayer."
  } finally {
    isSearching.value = false
  }
}

const reloadPage = () => {
  window.location.reload()
}

const resetForm = () => {
  currentStep.value = 0
  demandSent.value = false
  studentId.value = null
  selectedStudentIndex.value = null
  Object.keys(form).forEach(key => {
    if (key === 'acceptedPaymentTerms') form[key] = false
    else if (key === 'selectedClassId') form[key] = null
    else form[key] = ''
  })
}

const submitForm = async () => {
  if (!validateStep()) return
  
  isSubmitting.value = true
  submitError.value = ''
  
  try {
    const payload = {
      studentId: studentId.value || null,
      childFirstName: (form.childFirstName || '').trim(),
      childLastName: (form.childLastName || '').trim(),
      childDob: form.childDob,
      childGender: form.childGender,
      schoolLevel: form.schoolLevel,
      subject: form.subject,
      selectedClassId: Number(form.selectedClassId),
      fatherLastName: (form.fatherLastName || '').trim(),
      fatherFirstName: (form.fatherFirstName || '').trim(),
      fatherPhone: (form.fatherPhone || '').trim(),
      motherLastName: (form.motherLastName || '').trim(),
      motherFirstName: (form.motherFirstName || '').trim(),
      motherPhone: (form.motherPhone || '').trim(),
      contactEmail: (form.contactEmail || '').trim(),
      address: (form.address || '').trim(),
      postalCode: (form.postalCode || '').trim(),
      city: (form.city || '').trim(),
      acceptedPaymentTerms: true
    }
    
    // Clean up empty fields
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string' && payload[key] === '') {
        delete payload[key]
      }
    })
    
    const response = await axios.post(`${baseURL}/academic-support/registrations/api/create`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    if (response.status === 201 || (response.data && response.data.status === 'success')) {
      demandSent.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      submitError.value = response.data?.message || 'Une erreur est survenue lors de l\'enregistrement.'
    }
  } catch (error) {
    console.error("Erreur d'inscription:", error)
    if (error.response && error.response.data && error.response.data.message) {
      submitError.value = error.response.data.message
    } else {
      submitError.value = 'Impossible de contacter le serveur. Veuillez réessayer plus tard.'
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}
</script>