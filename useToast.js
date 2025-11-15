import { ref } from 'vue'

const message = ref('')
const messageType = ref('success')

export const useToast = () => {
  const showMessage = (text, type = 'success') => {
    message.value = text
    messageType.value = type
    setTimeout(() => (message.value = ''), 3000)
  }

  return { message, messageType, showMessage }
}
