<template>
  <div class="min-h-screen text-gray-100 bg-gradient-to-br from-[#09090f] via-[#0f0f1a] to-[#111122]">

    <!-- Header -->
    <header class="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl bg-black/20 shadow-lg">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <i class="fas fa-box text-white"></i>
          </div>
          <h1 class="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 text-transparent bg-clip-text">
            ProductManager
          </h1>
        </div>

        <div class="flex items-center space-x-5">
          <div class="relative cursor-pointer group">
            <i class="fas fa-bell text-gray-400 text-xl"></i>
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </div>

          <div class="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600"></div>
            <span class="font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Notification -->
    <transition name="fade">
      <div
        v-if="message"
        :class="[
          'fixed top-20 right-6 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl z-50 flex items-center space-x-3 border',
          messageType === 'success' ? 'bg-green-500/20 border-green-400/30' : 'bg-red-500/20 border-red-400/30'
        ]">
        <i :class="messageType === 'success' ? 'fas fa-check-circle text-green-400' : 'fas fa-exclamation-circle text-red-400'"></i>
        <span class="font-medium">{{ message }}</span>
      </div>
    </transition>

    <!-- Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showConfirm"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-[#14141c] border border-white/10 p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
            </div>
            <h3 class="text-2xl font-semibold text-red-400">Confirmation</h3>
          </div>
          <p class="text-gray-300 mb-6 leading-relaxed">{{ confirmMessage }}</p>
          <div class="flex justify-end gap-4">
            <button @click="cancelAction"
              class="px-5 py-2.5 rounded-xl bg-gray-600 hover:bg-gray-500 transition font-medium">
              Annuler
            </button>
            <button @click="confirmAction"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-medium shadow-lg hover:shadow-red-500/20 transition">
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </transition>

    <main class="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

      <!-- Sidebar Form -->
      <aside class="lg:col-span-1 space-y-8">
        <div class="bg-[#14141c] border border-white/10 p-6 rounded-2xl shadow-xl">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <i class="fas fa-plus text-blue-400"></i>
            </div>
            <h2 class="text-xl font-bold text-blue-400">
              {{ editMode ? 'Modifier un produit' : 'Créer un produit' }}
            </h2>
          </div>

          <form @submit.prevent="submitProduct" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Nom du produit</label>
              <input v-model="name" type="text" class="input-dark" placeholder="Entrez le nom" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Prix (€)</label>
              <input v-model.number="price" type="number" class="input-dark" placeholder="0.00" />
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

                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onImageSelected" />

                <img v-if="imagePreview" :src="imagePreview" class="mt-4 w-full h-48 rounded-xl object-cover border border-white/10 shadow-lg" />
              </div>
            </div>

            <div class="flex flex-col gap-3 mt-4">
              <button type="submit" class="btn-success py-3.5 rounded-xl text-lg font-semibold flex items-center justify-center space-x-2">
                <i :class="editMode ? 'fas fa-edit' : 'fas fa-plus'"></i>
                <span>{{ editMode ? 'Modifier le produit' : 'Ajouter le produit' }}</span>
              </button>

              <button v-if="editMode" type="button" @click="cancelEdit"
                class="bg-gray-700 text-white py-3.5 rounded-xl hover:bg-gray-600 transition font-medium">
                Annuler
              </button>
            </div>
          </form>
        </div>

        <!-- Stats -->
        <div class="bg-[#14141c] border border-white/10 p-6 rounded-2xl shadow-xl">
          <h3 class="text-xl font-bold text-purple-400 mb-4">Statistiques</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="stat-card">
              <p class="text-gray-400 text-sm">Total</p>
              <p class="text-2xl font-bold">{{ products.length }}</p>
            </div>
            <div class="stat-card">
              <p class="text-gray-400 text-sm">Prix moyen</p>
              <p class="text-2xl font-bold">{{ formatPrice }} €</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Product List -->
      <section class="lg:col-span-2 bg-[#14141c] border border-white/10 p-6 rounded-2xl shadow-xl">
        <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <i class="fas fa-boxes text-purple-400"></i>
            </div>
            <h2 class="text-xl font-bold text-purple-400">Produits</h2>
          </div>

          <div class="flex items-center space-x-4">
            <div class="relative">
              <input v-model="searchQuery" type="text" placeholder="Rechercher..." class="input-dark pl-10 w-64" />
              <i class="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
            </div>
          </div>
        </div>

        <div v-if="filteredProducts.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="p in filteredProducts" :key="p.id"
            class="product-card group">

            <div class="flex justify-between mb-3">
              <input type="checkbox" v-model="selectedProducts" :value="p.id" @click.stop class="checkbox-custom" />
              <span class="text-lg font-bold text-green-400">{{ formatPrice(p.price) }}</span>
            </div>

            <div class="flex gap-4">
              <img
                v-if="p.image"
                :src="p.image"
                class="w-32 h-32 rounded-xl object-cover border border-white/10 shadow-md group-hover:shadow-lg transition" />

              <div class="flex-grow">
                <h3 @click="selectProduct(p)" class="font-bold text-lg cursor-pointer hover:text-green-400 transition">
                  {{ p.name }}
                </h3>

                <p class="text-gray-400 text-sm mb-4 line-clamp-2">{{ p.description || 'Aucune description' }}</p>

                <div class="flex justify-between">
                  <button @click.stop="startEdit(p)" class="btn-warning px-4 py-2 rounded-xl">Modifier</button>
                  <button @click.stop="confirmSingleDelete(p)" class="btn-danger px-4 py-2 rounded-xl">Supprimer</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <div class="w-24 h-24 bg-gray-800/50 rounded-full mx-auto mb-4 flex items-center justify-center">
            <i class="fas fa-box-open text-gray-500 text-3xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-400">Aucun produit</h3>
          <p class="text-gray-500">Ajoutez votre premier produit pour commencer.</p>
        </div>
      </section>
    </main>

    <ProductsDetails :product="selectedProduct" :formatPrice="formatPrice" @close="selectedProduct = null" />
  </div>
</template>

<script setup>
// --- Script original non modifié ---
</script>

<style scoped>
.input-dark {
  @apply w-full bg-[#1b1b22] border border-white/10 p-3 rounded-xl text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none transition;
}

.stat-card {
  @apply bg-[#1b1b22] p-4 rounded-xl border border-white/10 text-white;
}

.product-card {
  @apply bg-[#1b1b22] border border-white/10 rounded-2xl p-5 shadow-md hover:shadow-lg transition;
}

.checkbox-custom {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid #7c3aed;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.checkbox-custom:checked {
  background-color: #7c3aed;
}
.checkbox-custom:checked::after {
  content: "✓";
  color: white;
  font-weight: bold;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
