<template>
  <div class="max-w-5xl mx-auto p-6 text-gray-200 bg-[#0d0d0f] min-h-screen">

    <!-- Notification -->
    <div
      v-if="message"
      :class="[
        'fixed top-6 right-6 px-4 py-3 rounded-xl shadow-xl backdrop-blur-lg bg-opacity-30 text-white z-50 transition-all duration-300',
        messageType === 'success' ? 'bg-green-500/30 border border-green-400/30' : 'bg-red-500/30 border border-red-400/30'
      ]">
      {{ message }}
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirm"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-[#1a1a1d] p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-white/10">
        <h3 class="text-2xl font-semibold mb-4 text-red-400">Confirmation</h3>
        <p class="text-gray-300 mb-6">
          {{ confirmMessage }}
        </p>
        <div class="flex justify-end gap-4">
          <button @click="cancelAction"
            class="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-500 transition">
            Annuler
          </button>

          <button @click="confirmAction"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-700/30">
            Confirmer
          </button>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-[#151518] p-8 rounded-2xl shadow-lg border border-white/10 mb-10">
      <h2 class="text-3xl font-bold text-blue-400 mb-6">
        {{ editMode ? 'Modifier un produit' : 'Créer un produit' }}
      </h2>

      <form @submit.prevent="submitProduct" class="flex flex-col gap-4">

        <input
          v-model="name"
          type="text"
          placeholder="Nom du produit"
          class="bg-[#1f1f22] border border-white/10 p-3 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          required />

        <input
          v-model.number="price"
          type="number"
          placeholder="Prix (€)"
          class="bg-[#1f1f22] border border-white/10 p-3 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          required />

        <AiEditor v-model="description" />

        <div class="flex flex-col">
          <button
            type="button"
            @click="() => fileInput.click()"
            class="bg-blue-600 w-48 py-2 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
            Ajouter une image
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
            class="mt-4 w-48 h-48 rounded-xl object-cover border border-white/10 shadow-lg"
          />
        </div>

        <button
          type="submit"
          class="bg-green-600 mt-3 text-white py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-700/30">
          {{ editMode ? 'Modifier le produit' : 'Ajouter le produit' }}
        </button>

        <button
          v-if="editMode"
          type="button"
          @click="cancelEdit"
          class="bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-500 transition">
          Annuler
        </button>
      </form>
    </div>

    <!-- Product List -->
    <div class="bg-[#151518] p-8 rounded-2xl shadow-lg border border-white/10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-purple-400">Produits</h2>

        <button
          v-if="selectedProducts.length"
          @click="confirmMultipleDelete"
          class="bg-red-600 px-4 py-3 rounded-xl hover:bg-red-700 shadow-lg shadow-red-700/30 transition">
          Supprimer sélection ({{ selectedProducts.length }})
        </button>
      </div>

      <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="p in products"
          :key="p.id"
          class="bg-[#1d1d21] border border-white/10 rounded-2xl p-4 shadow-md hover:scale-[1.02] transition cursor-pointer">

          <div class="flex justify-between">
            <input
              type="checkbox"
              v-model="selectedProducts"
              :value="p.id"
              @click.stop
              class="w-5 h-5 accent-blue-500"
            />
          </div>

          <img
            v-if="p.image"
            :src="p.image"
            class="w-full h-48 object-cover rounded-xl mt-2 border border-white/10" />

          <h3 @click="selectProduct(p)" class="mt-3 font-bold text-lg text-green-400">
            {{ p.name }}
          </h3>

          <div
            class="text-gray-400 text-sm mt-2"
            v-html="p.description || 'Contenu vide'">
          </div>

          <div class="flex justify-between mt-4">
            <button
              @click.stop="startEdit(p)"
              class="bg-yellow-500 text-black px-3 py-2 rounded-xl hover:bg-yellow-400 transition">
              Modifier
            </button>

            <button
              @click.stop="confirmSingleDelete(p)"
              class="bg-red-600 text-white px-3 py-2 rounded-xl hover:bg-red-700 transition">
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <p v-else class="text-gray-500 text-center mt-4">Aucun produit disponible</p>
    </div>

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
