<template>
    <div v-if="product" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" @click="$emit('close')">
          ✖
        </button>
        <h2 class="text-2xl font-bold mb-2">{{ product.name }}</h2>
        <p class="mb-2 text-gray-700">
          Prix : {{ formatPrice(product.price) }}
        </p>
        <div class="mb-4">
          <img v-if="product.image" :src="product.image" alt="image produit"
               class="w-full h-auto rounded object-cover mb-4" />
          <div v-html="product.description"></div>
        </div>
        <p class="text-sm text-gray-400">
          Ajouté le :
          {{ product.createdAt?.toDate().toLocaleString() || 'Non défini' }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  const props = defineProps({
    product: Object,
    formatPrice: {
      type: Function,
      required: true
    }
  })
  </script>
  