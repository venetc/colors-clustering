import { shallowRef } from 'vue'

export function useImageUploader(
  onChangeCallback?: (file: File) => void,
  onResetCallback?: () => void,
) {
  const imageFile = shallowRef<File | null>(null)

  const onChange = (event: Event) => {
    const isInputElement = event.target instanceof HTMLInputElement
    if (!isInputElement) return

    const files = event.target.files

    imageFile.value = !files ? null : files[0]

    if (onChangeCallback && imageFile.value) onChangeCallback(imageFile.value)
    if (onResetCallback && !imageFile.value) onResetCallback()
  }

  return { imageFile, onChange }
}
