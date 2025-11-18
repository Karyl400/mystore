<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Header avec fond sombre -->
    <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 shadow-2xl">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 class="text-4xl font-black text-white tracking-tight">ProductHub</h1>
            <p class="text-indigo-200 text-sm mt-1">Gestion intelligente de votre catalogue</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Toast notification -->
      <div v-if="message" :class="[
        'fixed top-8 right-8 px-6 py-4 rounded-2xl shadow-2xl text-white z-50 backdrop-blur-xl border-2',
        messageType === 'success'
          ? 'bg-emerald-500/90 border-emerald-400'
          : 'bg-rose-500/90 border-rose-400',
        'animate-toast'
      ]">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span class="text-xl">{{ messageType === 'success' ? '✓' : '✗' }}</span>
          </div>
          <span class="font-semibold">{{ message }}</span>
        </div>
      </div>

      <!-- Modale de confirmation -->
      <div v-if="showConfirm"
        class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
        <div
          class="bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4 border-2 border-gray-700 animate-scaleIn">
          <div
            class="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-500 to-orange-600">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-4 text-center text-white">Attention</h3>
          <p class="text-gray-300 mb-8 text-center text-lg leading-relaxed">
            {{ confirmMessage }}
          </p>
          <div class="flex gap-4">
            <button @click="cancelAction"
              class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-2xl transition-all font-semibold text-lg">
              Annuler
            </button>
            <button @click="confirmAction"
              class="flex-1 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white px-6 py-4 rounded-2xl transition-all font-semibold text-lg shadow-lg">
              Confirmer
            </button>
          </div>
        </div>
      </div>

      <!-- Grille responsive -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Formulaire (colonne gauche) -->
        <div class="lg:col-span-1">
          <div class="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-700 sticky top-8">
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ editMode ? 'Modification' : 'Nouveau produit' }}
              </h2>
            </div>

            <div class="p-6 space-y-5">
              <div>
                <label class="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Nom</label>
                <input v-model="name" type="text" placeholder="MacBook Pro 16"
                  class="w-full bg-gray-900 border-2 border-gray-700 text-white p-4 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none placeholder-gray-500"
                  required />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Prix</label>
                <div class="relative">
                  <input v-model.number="price" type="number" step="0.01" placeholder="2499.99"
                    class="w-full bg-gray-900 border-2 border-gray-700 text-white p-4 pr-12 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none placeholder-gray-500"
                    required />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Description</label>
                <AiEditor v-model="description" />
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Image</label>
                <button type="button"
                  class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl transition-all font-bold flex items-center justify-center gap-3 shadow-lg"
                  @click="() => fileInput.click()">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Choisir une image
                </button>
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onImageSelected" />

                <div v-if="imagePreview" class="mt-4 relative group">
                  <img :src="imagePreview" alt="Aperçu"
                    class="w-full h-56 rounded-2xl object-cover border-4 border-gray-700 shadow-lg" />
                  <button type="button" @click="clearImage"
                    class="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white p-2.5 rounded-full transition-all shadow-lg opacity-0 group-hover:opacity-100">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="pt-4 space-y-3">
                <button @click="submitProduct" :disabled="!isFormValid" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 
         hover:from-emerald-700 hover:to-teal-700 text-white 
         py-4 px-6 rounded-xl transition-all font-bold text-lg shadow-lg
         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-emerald-600 disabled:hover:to-teal-600">
                  {{ editMode ? '💾 Enregistrer' : '✨ Créer le produit' }}
                </button>

                <button v-if="editMode" @click="cancelEdit"
                  class="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl transition-all font-semibold">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des produits (colonne droite) -->
        <div class="lg:col-span-2">
          <div class="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-700">
            <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
              <div class="flex justify-between items-center">
                <div>
                  <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Catalogue
                  </h2>
                  <p class="text-indigo-200 text-sm mt-1">{{ products.length }} produit(s)</p>
                </div>
                <div class="flex items-center gap-4">
                  <div class="relative">
                    <input v-model="searchQuery" type="text" placeholder="Rechercher..."
                      class="w-64 bg-gray-900 border-2 border-gray-700 text-white p-3 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none" />
                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                  </div>

                  <button v-if="selectedProducts.length"
                    class="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl transition-all font-bold shadow-lg flex items-center gap-2"
                    @click="confirmMultipleDelete">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {{ selectedProducts.length }}
                  </button>
                </div>
              </div>
            </div>

            <div class="p-6">
              <div v-if="filteredProducts.length" class="space-y-4">
                <div v-for="p in filteredProducts" :key="p.id"
                  class="bg-gray-900 border-2 border-gray-700 hover:border-purple-500 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 group">
                  <div class="flex gap-5">
                    <input type="checkbox" class="w-6 h-6 cursor-pointer accent-purple-600 rounded-lg mt-1"
                      v-model="selectedProducts" :value="p.id" />

                    <div v-if="p.image" class="flex-shrink-0 cursor-pointer" @click="selectProduct(p)">
                      <img :src="p.image" alt="produit"
                        class="w-28 h-28 object-cover rounded-xl border-2 border-gray-700 group-hover:border-purple-500 transition-all shadow-lg" />
                    </div>

                    <div class="flex-1 min-w-0 cursor-pointer" @click="selectProduct(p)">
                      <h3
                        class="font-bold text-xl text-white mb-2 truncate group-hover:text-purple-400 transition-colors">
                        {{ p.name }}
                      </h3>
                      <div class="text-gray-400 text-sm mb-3 line-clamp-2"
                        v-html="p.description || 'Aucune description'"></div>
                      <div
                        class="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ formatPrice(p.price) }}
                      </div>
                    </div>

                    <div class="flex flex-col gap-2">
                      <button
                        class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl transition-all font-semibold shadow-lg flex items-center gap-2"
                        @click.stop="startEdit(p)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </button>
                      <button
                        class="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl transition-all font-semibold shadow-lg flex items-center gap-2"
                        @click.stop="confirmSingleDelete(p)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-20">
                <div
                  class="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-900 flex items-center justify-center border-4 border-gray-700">
                  <svg class="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-400 mb-2">Aucun produit</h3>
                <p class="text-gray-500">Créez votre premier produit pour commencer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProductsDetails :product="selectedProduct" :formatPrice="formatPrice" @close="selectedProduct = null" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore'
import AiEditor from './aiEditor.vue'
import ProductsDetails from './ProductsDetails.vue'

const name = ref('')
const price = ref(null)
const description = ref('')
const editMode = ref(false)
const editId = ref(null)
const products = ref([])
const selectedProduct = ref(null)
const imagePreview = ref('')
const imageFile = ref(null)
const fileInput = ref(null)
const selectedProducts = ref([])
const message = ref('')
const messageType = ref('success')
const searchQuery = ref('')

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => (message.value = ''), 3000)
}

const showConfirm = ref(false)
const confirmMessage = ref('')
let confirmCallback = null

const confirmAction = async () => {
  showConfirm.value = false
  if (confirmCallback) await confirmCallback()
  confirmCallback = null
}

const cancelAction = () => {
  showConfirm.value = false
  confirmCallback = null
}

const openConfirm = (messageText, callback) => {
  confirmMessage.value = messageText
  confirmCallback = callback
  showConfirm.value = true
}

const submitProduct = async () => {
  try {
    if (editMode.value && editId.value) {
      const productRef = doc(db, 'products', editId.value)
      await updateDoc(productRef, {
        name: name.value,
        price: Number(price.value),
        description: description.value,
        image: imagePreview.value || null
      })
      showMessage('Produit modifié avec succès ✅', 'success')
      cancelEdit()
    } else {
      await addDoc(collection(db, 'products'), {
        name: name.value,
        price: Number(price.value),
        description: description.value,
        createdAt: serverTimestamp(),
        image: imagePreview.value || null
      })
      showMessage('Produit ajouté avec succès 🎉', 'success')
      name.value = ''
      price.value = null
      description.value = ''
      imagePreview.value = ''
      if (fileInput && fileInput.value) fileInput.value.value = null
    }
  } catch (err) {
    console.error(err)
    showMessage("Erreur lors de l'opération ⚠️", 'error')
  }
}

const confirmSingleDelete = (p) => {
  openConfirm(
    `Souhaitez-vous vraiment supprimer le produit "${p.name}" ?`,
    async () => { await deleteProduct(p.id) }
  )
}

const confirmMultipleDelete = () => {
  openConfirm(
    `Supprimer ${selectedProducts.value.length} produit(s) sélectionné(s) ?`,
    deleteSelectedProducts
  )
}

const deleteProduct = async (id) => {
  try {
    await deleteDoc(doc(db, 'products', id))
    showMessage('Produit supprimé avec succès 🗑️', 'success')
  } catch (err) {
    console.error(err)
    showMessage("Erreur lors de la suppression ⚠️", 'error')
  }
}

const deleteSelectedProducts = async () => {
  try {
    for (const id of selectedProducts.value) {
      await deleteDoc(doc(db, 'products', id))
    }
    showMessage(`${selectedProducts.value.length} produit(s) supprimé(s) ✅`, 'success')
    selectedProducts.value = []
  } catch (err) {
    console.error(err)
    showMessage("Erreur lors de la suppression multiple ⚠️", 'error')
  }
}

const startEdit = (p) => {
  name.value = p.name
  price.value = p.price
  description.value = p.description
  imagePreview.value = p.image || ''
  editMode.value = true
  editId.value = p.id
  // Scroll to top so user sees the form on small screens
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  name.value = ''
  price.value = null
  description.value = ''
  editMode.value = false
  editId.value = null
  imagePreview.value = ''
  if (fileInput && fileInput.value) fileInput.value.value = null
}

const onImageSelected = (e) => {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  imageFile.value = f
  const reader = new FileReader()
  reader.onload = (ev) => (imagePreview.value = ev.target.result)
  reader.readAsDataURL(f)
}

const isFormValid = computed(() => {
  return (
    name.trim().length > 0 &&
    price !== null &&
    price !== '' &&
    !isNaN(Number(price)) &&
    Number(price) > 0 &&
    description &&
    description.trim().length > 0 &&
    imagePreview // si l’image doit être obligatoire
  )
})


const clearImage = () => {
  imagePreview.value = ''
  imageFile.value = null
  if (fileInput && fileInput.value) fileInput.value.value = null
}

const selectProduct = (p) => {
  selectedProduct.value = p
}

const formatPrice = (p) =>
  typeof p === 'number' && p >= 0
    ? p.toFixed(2) + ' €'
    : (typeof p === 'string' && !isNaN(Number(p)) ? (Number(p).toFixed(2) + ' €') : '—')

const filteredProducts = computed(() => {
  const q = searchQuery.value && searchQuery.value.trim().toLowerCase()
  if (!q) return products.value
  return products.value.filter(p => {
    const name = (p.name || '').toLowerCase()
    const desc = (p.description || '').toLowerCase()
    return name.includes(q) || desc.includes(q) || formatPrice(p.price).toLowerCase().includes(q)
  })
})

onMounted(() => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
  onSnapshot(q, (snapshot) => {
    products.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})
</script>

<style scoped>
@keyframes toast {
  from {
    transform: translateX(120%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0
  }

  to {
    opacity: 1
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.85);
    opacity: 0
  }

  to {
    transform: scale(1);
    opacity: 1
  }
}

.animate-toast {
  animation: toast 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
