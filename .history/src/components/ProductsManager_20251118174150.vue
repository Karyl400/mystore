<template>
  <div class="max-w-3xl mx-auto p-6">

    <!-- ✅ Toast message -->
    <div v-if="message" :class="[
      'fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white z-50 transition',
      messageType === 'success' ? 'bg-green-600' : 'bg-red-600'
    ]">
      {{ message }}
    </div>

    <!-- ✅ Modale de confirmation -->
    <div v-if="showConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        <h3 class="text-lg font-semibold mb-4">Confirmation</h3>
        <p class="text-gray-700 mb-6">
          {{ confirmMessage }}
        </p>
        <div class="flex justify-center gap-4">
          <button @click="confirmAction" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
            Confirmer
          </button>
          <button @click="cancelAction" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition">
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Formulaire ajout/modification -->
    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <h2 class="text-xl font-semibold mb-4">
        {{ editMode ? 'Modifier un produit' : 'Créer un produit' }}
      </h2>
      <form @submit.prevent="submitProduct" class="flex flex-col gap-3">
        <input v-model="name" type="text" placeholder="Nom du produit" class="border p-2 rounded" required />
        <input v-model.number="price" type="number" placeholder="Prix (€)" class="border p-2 rounded" required />
        <AiEditor v-model="description" />

        <!-- Image selector -->
        <div class="flex flex-col">
          <button type="button" class="mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition w-48"
            @click="() => fileInput.click()">
            Ajouter une image
          </button>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onImageSelected" />
          <img v-if="imagePreview" :src="imagePreview" alt="Aperçu image"
            class="mt-2 w-48 h-auto rounded object-cover" />
        </div>

        <button type="submit" class="mt-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          {{ editMode ? 'Modifier le produit' : 'Ajouter le produit' }}
        </button>
        <button v-if="editMode" type="button"
          class="mt-2 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition" @click="cancelEdit">
          Annuler
        </button>
      </form>
    </div>

    <div class="bg-[#1a1a1d] p-6 rounded-xl shadow-xl border border-white/10">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-semibold text-white">Produits</h2>

    <button
      v-if="selectedProducts.length"
      @click="confirmMultipleDelete"
      class="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-lg"
    >
      Supprimer la sélection ({{ selectedProducts.length }})
    </button>
  </div>

  <div v-if="products.length" class="space-y-4">
    <div
      v-for="p in products"
      :key="p.id"
      @click="selectProduct(p)"
      class="group flex justify-between items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer"
    >
      <!-- LEFT SIDE -->
      <div class="flex items-center gap-4">

        <label class="relative flex items-center cursor-pointer">
          <input
            type="checkbox"
            v-model="selectedProducts"
            :value="p.id"
            @click.stop
            class="peer hidden"
          />
          <span
            class="w-5 h-5 rounded-md border border-gray-400 peer-checked:bg-green-500 peer-checked:border-green-500 transition"
          ></span>
        </label>

        <img
          v-if="p.image"
          :src="p.image"
          alt="miniature"
          class="w-20 h-20 object-cover rounded-lg shadow-md"
        />

        <div>
          <h3 class="font-semibold text-green-400 text-lg">
            {{ p.name }}
          </h3>
          <p class="text-gray-300 text-sm mt-1" v-html="p.description || 'Contenu vide'"></p>
        </div>
      </div>

      <div class="flex gap-2 opacity-80 group-hover:opacity-100 transition">
        <button
          @click.stop="startEdit(p)"
          class="bg-yellow-500/70 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-md transition"
        >
          Modifier
        </button>

        <button
          @click.stop="confirmSingleDelete(p)"
          class="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>

  <p v-else class="text-gray-400 text-center py-6">Aucun produit disponible</p>
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
