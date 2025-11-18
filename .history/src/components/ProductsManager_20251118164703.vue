<template>
  <div class="max-w-4xl mx-auto p-6 space-y-10">

    <!-- MESSAGE -->
    <div
      v-if="message"
      :class="[
        'fixed top-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white z-50 transition transform duration-300',
        messageType === 'success'
          ? 'bg-green-600'
          : 'bg-red-600'
      ]">
      {{ message }}
    </div>

    <!-- MODAL CONFIRMATION -->
    <div
      v-if="showConfirm"
      class="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div class="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
        <h3 class="text-xl font-semibold mb-3">Confirmation</h3>
        <p class="text-gray-600 mb-6">{{ confirmMessage }}</p>

        <div class="flex justify-center gap-4">
          <button
            @click="confirmAction"
            class="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition">
            Confirmer
          </button>
          <button
            @click="cancelAction"
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition">
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- FORMULAIRE PRODUIT -->
    <div class="bg-white p-8 rounded-2xl shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-gray-700">
        {{ editMode ? 'Modifier un produit' : 'Créer un produit' }}
      </h2>

      <form @submit.prevent="submitProduct" class="space-y-5">

        <input
          v-model="name"
          type="text"
          placeholder="Nom du produit"
          class="border border-gray-300 focus:border-blue-500 focus:ring-blue-300 rounded-xl p-3 w-full transition"
          required
        />

        <input
          v-model.number="price"
          type="number"
          placeholder="Prix (€)"
          class="border border-gray-300 focus:border-blue-500 focus:ring-blue-300 rounded-xl p-3 w-full transition"
          required
        />

        <div class="rounded-xl border p-3 bg-gray-50">
          <AiEditor v-model="description" />
        </div>

        <!-- IMAGE -->
        <div class="flex flex-col gap-3">

          <button
            type="button"
            class="bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition w-52"
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
            alt="Aperçu image"
            class="w-52 h-auto rounded-xl shadow"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium">
          {{ editMode ? 'Modifier le produit' : 'Ajouter le produit' }}
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

    <!-- LISTE PRODUITS -->
    <div class="bg-white p-8 rounded-2xl shadow-md">

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-700">Liste des produits</h2>

        <button
          v-if="selectedProducts.length"
          class="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition"
          @click="confirmMultipleDelete">
          Supprimer ({{ selectedProducts.length }})
        </button>
      </div>

      <div v-if="products.length" class="divide-y">

        <div
          v-for="p in products"
          :key="p.id"
          class="py-4 flex justify-between items-center hover:bg-gray-50 transition rounded-lg px-2">

          <div class="flex items-center gap-4 w-full cursor-pointer" @click="selectProduct(p)">

            <input
              type="checkbox"
              class="cursor-pointer"
              v-model="selectedProducts"
              :value="p.id"
              @click.stop />

            <img
              v-if="p.image"
              :src="p.image"
              class="w-20 h-20 rounded-xl object-cover shadow-sm"
            />

            <div class="max-w-sm">
              <h3 class="font-semibold text-lg text-green-700">
                {{ p.name }}
              </h3>
              <p class="text-gray-600 text-sm line-clamp-2" v-html="p.description || 'Contenu vide'"></p>
            </div>

          </div>

          <div class="flex gap-2 shrink-0">
            <button
              class="bg-yellow-400 text-white px-3 py-1.5 rounded-xl hover:bg-yellow-500 transition"
              @click.stop="startEdit(p)">
              Modifier
            </button>

            <button
              class="bg-red-600 text-white px-3 py-1.5 rounded-xl hover:bg-red-700 transition"
              @click.stop="confirmSingleDelete(p)">
              Supprimer
            </button>
          </div>

        </div>

      </div>

      <p v-else class="text-gray-500 text-center py-10 text-lg">Aucun produit disponible</p>
    </div>

    <!-- Détails -->
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
