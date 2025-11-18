<template>
  <div class="min-h-screen text-gray-200 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">

    <!-- Header -->
    <header class="glass-effect">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
              <i class="fas fa-box text-white"></i>
            </div>
            <h1 class="text-2xl font-bold gradient-text">ProductManager</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="relative">
              <i class="fas fa-bell text-gray-400 text-xl"></i>
              <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-full gradient-bg"></div>
              <span class="font-medium">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Notification -->
    <div
      v-if="message"
      :class="[
        'fixed top-20 right-6 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg z-50 transition-all duration-300 flex items-center space-x-3',
        messageType === 'success' ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'
      ]">
      <i :class="messageType === 'success' ? 'fas fa-check-circle text-green-400' : 'fas fa-exclamation-circle text-red-400'"></i>
      <span>{{ message }}</span>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirm"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="glass-effect p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/10">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
          </div>
          <h3 class="text-2xl font-semibold text-red-400">Confirmation</h3>
        </div>
        <p class="text-gray-300 mb-6">
          {{ confirmMessage }}
        </p>
        <div class="flex justify-end gap-4">
          <button @click="cancelAction"
            class="px-5 py-2.5 rounded-xl bg-gray-600 hover:bg-gray-500 transition font-medium">
            Annuler
          </button>

          <button @click="confirmAction"
            class="px-5 py-2.5 rounded-xl btn-danger font-medium">
            Confirmer
          </button>
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-3 gap-8">
        <!-- Sidebar - Form Card -->
        <div class="col-span-1">
          <div class="glass-effect p-6 rounded-2xl shadow-lg mb-8">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <i class="fas fa-plus text-blue-400"></i>
              </div>
              <h2 class="text-2xl font-bold text-blue-400">
                {{ editMode ? 'Modifier un produit' : 'Créer un produit' }}
              </h2>
            </div>

            <form @submit.prevent="submitProduct" class="flex flex-col gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Nom du produit</label>
                <input
                  v-model="name"
                  type="text"
                  placeholder="Entrez le nom du produit"
                  class="w-full bg-[#1f1f22] border border-white/10 p-3.5 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Prix (€)</label>
                <input
                  v-model.number="price"
                  type="number"
                  placeholder="0.00"
                  class="w-full bg-[#1f1f22] border border-white/10 p-3.5 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <AiEditor v-model="description" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Image du produit</label>
                <div class="flex flex-col items-start">
                  <button
                    type="button"
                    @click="() => fileInput.click()"
                    class="btn-primary px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2">
                    <i class="fas fa-image"></i>
                    <span>Choisir une image</span>
                  </button>

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onImageSelected" />

                  <img
                    v-if="imagePreview"
                    :src="imagePreview"
                    class="mt-4 w-full h-48 rounded-xl object-cover border border-white/10 shadow-lg"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-3 mt-2">
                <button
                  type="submit"
                  class="btn-success py-3.5 rounded-xl font-medium text-lg flex items-center justify-center space-x-2">
                  <i :class="editMode ? 'fas fa-edit' : 'fas fa-plus'"></i>
                  <span>{{ editMode ? 'Modifier le produit' : 'Ajouter le produit' }}</span>
                </button>

                <button
                  v-if="editMode"
                  type="button"
                  @click="cancelEdit"
                  class="bg-gray-600 text-white py-3.5 rounded-xl hover:bg-gray-500 transition font-medium flex items-center justify-center space-x-2">
                  <i class="fas fa-times"></i>
                  <span>Annuler</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Stats Card -->
          <div class="glass-effect p-6 rounded-2xl shadow-lg">
            <h3 class="text-xl font-bold text-purple-400 mb-4">Statistiques</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-[#1d1d21] p-4 rounded-xl border border-white/10">
                <p class="text-gray-400 text-sm">Total produits</p>
                <p class="text-2xl font-bold text-white">{{ products.length }}</p>
              </div>
              <div class="bg-[#1d1d21] p-4 rounded-xl border border-white/10">
                <p class="text-gray-400 text-sm">Prix moyen</p>
                <p class="text-2xl font-bold text-white">{{ averagePrice }} €</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content - Product List -->
        <div class="col-span-2">
          <div class="glass-effect p-6 rounded-2xl shadow-lg">
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <i class="fas fa-boxes text-purple-400"></i>
                </div>
                <h2 class="text-2xl font-bold text-purple-400">Liste des produits</h2>
              </div>

              <div class="flex items-center space-x-4">
                <div v-if="selectedProducts.length" class="flex items-center space-x-3">
                  <span class="text-gray-400">{{ selectedProducts.length }} sélectionnés</span>
                  <button
                    @click="confirmMultipleDelete"
                    class="btn-danger px-4 py-2.5 rounded-xl font-medium flex items-center space-x-2">
                    <i class="fas fa-trash"></i>
                    <span>Supprimer</span>
                  </button>
                </div>
                
                <div class="relative">
                  <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Rechercher..."
                    class="bg-[#1f1f22] border border-white/10 p-2.5 rounded-xl text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none pl-10 w-64">
                  <i class="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
                </div>
              </div>
            </div>

            <div v-if="filteredProducts.length" class="grid grid-cols-2 gap-6">
              <div
                v-for="p in filteredProducts"
                :key="p.id"
                class="bg-[#1d1d21] border border-white/10 rounded-2xl p-5 card-hover">

                <div class="flex justify-between items-start mb-4">
                  <input
                    type="checkbox"
                    v-model="selectedProducts"
                    :value="p.id"
                    @click.stop
                    class="checkbox-custom"
                  />
                  <span class="text-lg font-bold text-green-400">{{ formatPrice(p.price) }}</span>
                </div>

                <div class="flex gap-4">
                  <div class="flex-shrink-0">
                    <img
                      v-if="p.image"
                      :src="p.image"
                      class="w-32 h-32 rounded-xl object-cover border border-white/10 shadow-lg" />
                    <div v-else class="w-32 h-32 rounded-xl bg-gray-700 flex items-center justify-center border border-white/10">
                      <i class="fas fa-image text-gray-500 text-2xl"></i>
                    </div>
                  </div>
                  
                  <div class="flex-grow">
                    <h3 @click="selectProduct(p)" class="font-bold text-lg text-white cursor-pointer hover:text-green-400 transition mb-2">
                      {{ p.name }}
                    </h3>
                    
                    <div class="text-gray-400 text-sm mb-4 line-clamp-2">
                      {{ p.description || 'Aucune description' }}
                    </div>
                    
                    <div class="flex justify-between">
                      <button
                        @click.stop="startEdit(p)"
                        class="btn-warning px-4 py-2 rounded-xl font-medium flex items-center space-x-2">
                        <i class="fas fa-edit"></i>
                        <span>Modifier</span>
                      </button>

                      <button
                        @click.stop="confirmSingleDelete(p)"
                        class="btn-danger px-4 py-2 rounded-xl font-medium flex items-center space-x-2">
                        <i class="fas fa-trash"></i>
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <div class="w-24 h-24 rounded-full bg-gray-800 mx-auto flex items-center justify-center mb-4">
                <i class="fas fa-box-open text-gray-600 text-3xl"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-400 mb-2">Aucun produit trouvé</h3>
              <p class="text-gray-500">Commencez par ajouter votre premier produit</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <ProductsDetails
      :product="selectedProduct"
      :formatPrice="formatPrice"
      @close="selectedProduct = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const openConfirm = (message, callback) => {
  confirmMessage.value = message
  confirmCallback = callback
  showConfirm.value = true
}

const submitProduct = async () => {
  try {
    if (editMode.value && editId.value) {
      const productRef = doc(db, 'products', editId.value)
      await updateDoc(productRef, {
        name: name.value,
        price: price.value,
        description: description.value,
        image: imagePreview.value || null
      })
      showMessage('Produit modifié avec succès ✅', 'success')
      cancelEdit()
    } else {
      await addDoc(collection(db, 'products'), {
        name: name.value,
        price: price.value,
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

function averagePrice() {
    if (this.products.length === 0) return '0.00';
    const total = this.products.reduce((sum, product) => sum + product.price, 0);
    return (total / this.products.length).toFixed(2);
  }

const confirmSingleDelete = (p) => {
  openConfirm(`Souhaitez-vous vraiment supprimer le produit "${p.name}" ?`, async () => {
    await deleteProduct(p.id)
  })
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

function filteredProducts() {
    if (!this.searchQuery) return this.products;
    
    const query = this.searchQuery.toLowerCase();
    return this.products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
  }

const onImageSelected = (e) => {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  imageFile.value = f
  const reader = new FileReader()
  reader.onload = (ev) => (imagePreview.value = ev.target.result)
  reader.readAsDataURL(f)
}

const selectProduct = (p) => {
  selectedProduct.value = p
}

const formatPrice = (p) =>
  typeof p === 'number' && p >= 0
    ? p.toFixed(2) + ' €'
    : (() => { throw new Error('formatPrice() n’accepte que des nombres positifs') })()


onMounted(() => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
  onSnapshot(q, (snapshot) => {
    products.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})
</script>

<style scoped>
.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.gradient-text {
  background: linear-gradient(90deg, #4f46e5, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-bg {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(90deg, #4338ca, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4);
}

.btn-danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: linear-gradient(90deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
}

.btn-success {
  background: linear-gradient(90deg, #10b981, #059669);
  transition: all 0.3s ease;
}

.btn-success:hover {
  background: linear-gradient(90deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
}

.btn-warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
  transition: all 0.3s ease;
}

.btn-warning:hover {
  background: linear-gradient(90deg, #d97706, #b45309);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
}

.checkbox-custom {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid #4f46e5;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.checkbox-custom:checked {
  background-color: #4f46e5;
}

.checkbox-custom:checked::after {
  content: "✓";
  color: white;
  font-weight: bold;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>