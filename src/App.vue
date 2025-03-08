<script setup lang="ts">
import { mmcqModel } from '@/features/mmc-quantization'
import { imageReaderModel } from '@/features/read-image'

import { useThreeRenderer } from '@/features/three-renderer';
import { ImageUploader } from '@/features/upload-image';
import { chunkRGBSkipAlpha, rgbToHex } from '@/shared/lib/colors';

import { AspectRatio } from '@/shared/ui/aspect-ratio';
import { computed, shallowRef, watch } from 'vue';

const AMOUNT_OF_COLORS = 3;
const PLACEHOLDER_COLORS = Array.from({ length: AMOUNT_OF_COLORS }, () => '#F1F5F9');

const { readImage, resetImage, dataURL, ui8ca } = imageReaderModel.useImageReader()

const imageColors = shallowRef<string[]>([])

const colors = computed({
  get: () => imageColors.value.length ? imageColors.value : PLACEHOLDER_COLORS,
  set: (colors) => {
    imageColors.value = colors
  },
})

const { canvasRef, pointsArray } = useThreeRenderer({ debug: false })

watch(ui8ca, (ui8ca) => {
  if (!ui8ca) {
    imageColors.value = []
    pointsArray.value = null
    return
  }

  const chunkRGB = chunkRGBSkipAlpha(ui8ca)
  const colorMap = mmcqModel.applyQuantization(chunkRGB, AMOUNT_OF_COLORS)
  console.log({ chunkRGB })
  console.log({ palette: colorMap.palette })

  imageColors.value = colorMap.palette.map(rgbToHex)
  pointsArray.value = ui8ca.filter((_, index) => (index + 1) % 4 !== 0)
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

      <div class="w-full border shadow-sm p-2 rounded-md flex flex-col justify-around gap-2">
        <div class="flex items-center gap-2">
          <div
            v-for="(color, index) in colors"
            :key="`${color}-${index}`"
            class=" rounded-sm w-full aspect-square border"
            :style="{ backgroundColor: color, borderColor: color }"
          />
        </div>
      </div>
    </div>

    <div class="w-full border shadow-sm p-2 rounded-md flex flex-col justify-around gap-2">
      <div class="w-full h-full">
        <canvas ref="canvasRef" />
      </div>
    </div>
  </div>
</template>
