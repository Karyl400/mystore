<template>
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium">Description</label>
    <div ref="divRef" style="height: 400px; border: 1px solid #ccc;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue"
import { AiEditor } from "aieditor"
import "aieditor/dist/style.css"

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const divRef = ref(null)
let aiEditor = null

onMounted(() => {
  if (!divRef.value) return

  aiEditor = new AiEditor({
    element: divRef.value,
    lang: "fr",
    content: props.modelValue || "",
    placeholder: "Écrivez votre texte...",
    onChange: (editor) => {
      const content = editor.getHtml()
      emit('update:modelValue', content)
    }
  })
})

watch(() => props.modelValue, (newValue) => {
  if (aiEditor && aiEditor.getHtml() !== newValue) {
    aiEditor.setContent(newValue || "")
  }
})

onUnmounted(() => {
  if (aiEditor) {
    aiEditor.destroy()
    aiEditor = null
  }
})
</script>