<template>
  <div class="min-h-screen bg-gray-100">

    <!-- HEADER -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Gestion des Produits</h1>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

      <!-- FORMULAIRE PRODUIT -->
      <div class="lg:col-span-1">
        <div class="bg-white p-8 rounded-2xl shadow-lg">

          <h2 class="text-xl font-semibold text-gray-800 mb-6">
            {{ editMode ? 'Modifier le produit' : 'Créer un produit' }}
          </h2>

          <form @submit.prevent="submitProduct" class="space-y-5">

            <input
              v-model="name"
              type="text"
              placeholder="Nom"
              class="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-300"
              required
            />

            <input
              v-model.number="price"
              type="number"
              placeholder="Prix (€)"
              class="w-full p-3 rounded-xl border bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-300"
              required
            />

            <div class="rounded-xl border bg-gray-50 p-3">
              <AiEditor v-model="description" />
            </div>

            <!-- Image upload -->
            <div class="space-y-3">

              <button
                type="button"
                class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition w-full"
                @click="() => fileInput.click()">
                Ajouter une image
              </button>

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onImageSelected"
              />

              <img
                v-if="imagePreview"
                :src="imagePreview"
                class="w-full h-auto rounded-xl shadow"
              />

            </div>

            <button
              type="submit"
              class="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium">
              {{ editMode ? 'Modifier' : 'Créer' }}
            </button>

            <button
              v-if="editMode"
              type="button"
              class="w-full bg-gray-400 text-white py-3 rounded-xl hover:bg-gray-500 transition"
              @click="cancelEdit">
              Annuler
            </button>

          </form>

        </div>
      </div>

      <!-- LISTE DES PRODUITS -->
      <div class="lg:col-span-2">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-800">Produits</h2>

          <button
            v-if="selectedProducts.length"
            class="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition shadow"
            @click="confirmMultipleDelete">
            Supprimer {{ selectedProducts.length }}
          </button>
        </div>

        <div v-if="products.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- CARD PRODUIT -->
          <div
            v-for="p in products"
            :key="p.id"
            class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-4 border border-gray-100">

            <div class="relative">
              <input
                type="checkbox"
                v-model="selectedProducts"
                :value="p.id"
                class="absolute top-2 right-2 scale-125 cursor-pointer"
                @click.stop
              />

              <img
                v-if="p.image"
                :src="p.image"
                class="w-full h-40 object-cover rounded-xl mb-4"
              />
            </div>

            <h3 class="text-lg font-semibold text-gray-800">{{ p.name }}</h3>

            <p
              class="text-gray-600 text-sm mt-1 line-clamp-2"
              v-html="p.description || 'Pas de description'">
            </p>

            <div class="mt-4 flex gap-3">
              <button
                class="flex-1 bg-yellow-400 text-white py-2 rounded-xl hover:bg-yellow-500 transition"
                @click.stop="startEdit(p)">
                Modifier
              </button>

              <button
                class="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition"
                @click.stop="confirmSingleDelete(p)">
                Supprimer
              </button>
            </div>

          </div>

        </div>

        <p v-else class="text-gray-500 text-center py-10 text-lg">Aucun produit.</p>
      </div>

    </div>

    <!-- MODAL PRODUIT -->
    <ProductsDetails
      :product="selectedProduct"
      :formatPrice="formatPrice"
      @close="selectedProduct = null"
    />

    <!-- CONFIRMATION -->
    <div
      v-if="showConfirm"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div class="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">

        <h3 class="text-xl font-bold mb-3 text-gray-800">Confirmation</h3>
        <p class="text-gray-600 mb-6">{{ confirmMessage }}</p>

        <div class="flex justify-center gap-4">
          <button
            @click="confirmAction"
            class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl">
            Confirmer
          </button>
          <button
            @click="cancelAction"
            class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl">
            Annuler
          </button>
        </div>

      </div>
    </div>

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
