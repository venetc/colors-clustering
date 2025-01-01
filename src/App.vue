<script setup lang="ts">
import { mmcqModel } from '@/features/mmc-quantization'
import { imageReaderModel } from '@/features/read-image'
import { ImageUploader } from '@/features/upload-image';

import { chunkRGBSkipAlpha, rgbToHex } from '@/shared/lib/colors';
import { AspectRatio } from '@/shared/ui/aspect-ratio';

import { ref, watch } from 'vue';

const { readImage, resetImage, dataURL, ui8ca } = imageReaderModel.useImageReader()

const colorsA = ref<string[]>([])

watch([ui8ca, dataURL], ([ui8ca]) => {
  if (!ui8ca) {
    colorsA.value = []
    return
  }

  const chunkRGB = chunkRGBSkipAlpha(ui8ca)

  colorsA.value = mmcqModel.applyQuantization(chunkRGB, 10).palette.map(rgbToHex)
})
</script>

<template>
  <div class="grid grid-cols-2 gap-4 px-3 py-4">
    <div class="flex flex-col items-center gap-4">
      <ImageUploader
        @change="readImage"
        @reset="resetImage"
      />

      <div class="w-full border shadow-sm p-2 rounded-md">
        <AspectRatio :ratio="16 / 9">
          <img
            v-if="dataURL"
            class="h-full w-full rounded-sm object-cover"
            :src="dataURL"
          >
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-muted rounded-sm pointer-events-none"
          >
            No image
          </div>
        </AspectRatio>
      </div>
    </div>

    <div class="w-full border shadow-sm p-2 rounded-md flex flex-col justify-around gap-2">
      <div v-if="colorsA.length">
        <div class="flex items-center gap-2">
          <div
            v-for="color in colorsA"
            :key="color"
            class=" rounded-sm w-full aspect-square"
            :style="{ backgroundColor: color }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
