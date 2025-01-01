import { ref, shallowRef } from 'vue'

function readAsDataURL(file: File): Promise<FileReader['result']> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('error', reject, { once: true });
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function getImageData(src: string): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const context = <CanvasRenderingContext2D>canvas.getContext('2d')
    const img = new Image()

    img.crossOrigin = ''
    img.src = src

    img.onerror = reject
    img.onload = () => {
      const { width, height } = img

      canvas.height = height
      canvas.width = width
      context.drawImage(img, 0, 0)

      const iamgeData = context.getImageData(0, 0, width, height)

      resolve(iamgeData.data)
    }
  })
}

export function useImageReader() {
  const ui8ca = shallowRef<Uint8ClampedArray | null>(null)
  const dataURL = ref<string | null>(null)

  const readImage = async (file: File) => {
    const base64 = await readAsDataURL(file)
    const readingFailed = !base64 || typeof base64 !== 'string'

    if (readingFailed) return

    ui8ca.value = await getImageData(base64);
    dataURL.value = readingFailed ? null : base64
  }

  const resetImage = () => {
    ui8ca.value = null
    dataURL.value = null
  }

  return { ui8ca, dataURL, readImage, resetImage }
}
