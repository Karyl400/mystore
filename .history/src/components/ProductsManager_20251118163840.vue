<template>
  <div class="min-h-screen bg-[#0f0f0f] text-gray-200">

    <!-- HEADER -->
    <header class="bg-[#111] border-b border-neutral-800 shadow">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold tracking-tight text-white">Gestion des Produits</h1>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

      <!-- FORMULAIRE -->
      <div class="lg:col-span-1">
        <div class="bg-[#151515] p-8 rounded-2xl shadow-xl border border-neutral-800">

          <h2 class="text-xl font-semibold mb-6 text-white">
            {{ editMode ? 'Modifier un produit' : 'Créer un produit' }}
          </h2>

          <form @submit.prevent="submitProduct" class="space-y-5">

            <input
              v-model="name"
              type="text"
              placeholder="Nom du produit"
              class="w-full p-3 rounded-xl bg-[#1b1b1b] border border-neutral-700 focus:ring-2 focus:ring-blue-600 text-white"
            />

            <input
              v-model.number="price"
              type="number"
              placeholder="Prix (€)"
              class="w-full p-3 rounded-xl bg-[#1b1b1b] border border-neutral-700 focus:ring-2 focus:ring-blue-600 text-white"
            />

            <div class="rounded-xl border border-neutral-700 bg-[#1b1b1b] p-3 text-white">
              <AiEditor v-model="description" />
            </div>

            <div class="space-y-3">
              <button
                type="button"
                class="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition shadow">
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
                class="w-full h-auto rounded-xl shadow border border-neutral-700"
              />
            </div>

            <button
              type="submit"
              class="w-full bg-green-600 py-3 rounded-xl hover:bg-green-700 text-white transition font-medium shadow">
              {{ editMode ? 'Modifier le produit' : 'Ajouter le produit' }}
            </button>

            <button
              v-if="editMode"
              type="button"
              @click="cancelEdit"
              class="w-full py-3 bg-neutral-700 text-white rounded-xl hover:bg-neutral-600 transition">
              Annuler
            </button>

          </form>

        </div>
      </div>

      <!-- PRODUITS -->
      <div class="lg:col-span-2">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-white">Produits</h2>

          <button
            v-if="selectedProducts.length"
            @click="confirmMultipleDelete"
            class="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition shadow">
            Supprimer ({{ selectedProducts.length }})
          </button>
        </div>

        <div v-if="products.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- CARD -->
          <div
            v-for="p in products"
            :key="p.id"
            class="bg-[#151515] border border-neutral-800 rounded-2xl shadow-xl p-4 hover:shadow-2xl transition">

            <div class="relative">
              <input
                v-model="selectedProducts"
                :value="p.id"
                type="checkbox"
                @click.stop
                class="absolute top-2 right-2 scale-125 cursor-pointer"
              />

              <img
                v-if="p.image"
                :src="p.image"
                class="w-full h-40 object-cover rounded-xl border border-neutral-700 mb-4"
              />
            </div>

            <h3 class="text-lg font-semibold text-blue-400">{{ p.name }}</h3>

            <p
              class="text-gray-400 text-sm mt-1 line-clamp-2"
              v-html="p.description || 'Pas de description'">
            </p>

            <div class="mt-4 flex gap-3">
              <button
                @click.stop="startEdit(p)"
                class="flex-1 bg-yellow-500 text-black py-2 rounded-xl hover:bg-yellow-400 transition">
                Modifier
              </button>

              <button
                @click.stop="confirmSingleDelete(p)"
                class="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition">
                Supprimer
              </button>
            </div>

          </div>

        </div>

        <p v-else class="text-gray-500 text-center py-10 text-lg">Aucun produit disponible</p>
      </div>

    </div>

    <!-- MODALE DETAILS PRODUIT -->
    <ProductsDetails
      :product="selectedProduct"
      :formatPrice="formatPrice"
      @close="selectedProduct = null"
    />

    <!-- MODALE DE CONFIRMATION -->
    <div
      v-if="showConfirm"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">

      <div class="bg-[#1a1a1a] p-8 rounded-3xl shadow-2xl border border-neutral-700 w-full max-w-md text-center">

        <h3 class="text-2xl font-bold text-white mb-4">Confirmation</h3>
        <p class="text-gray-400 mb-8">{{ confirmMessage }}</p>

        <div class="flex justify-center gap-5">
          <button
            @click="confirmAction"
            class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow">
            Confirmer
          </button>

          <button
            @click="cancelAction"
            class="px-5 py-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-gray-200 transition shadow">
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
