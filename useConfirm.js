import { ref } from 'vue'

const showConfirm = ref(false)
const confirmMessage = ref('')
let confirmCallback = null

export const useConfirm = () => {
  const openConfirm = (message, callback) => {
    confirmMessage.value = message
    confirmCallback = callback
    showConfirm.value = true
  }

  const confirmAction = async () => {
    showConfirm.value = false
    if (confirmCallback) await confirmCallback()
    confirmCallback = null
  }

  const cancelAction = () => {
    showConfirm.value = false
    confirmCallback = null
  }

  return { showConfirm, confirmMessage, openConfirm, confirmAction, cancelAction }
}
