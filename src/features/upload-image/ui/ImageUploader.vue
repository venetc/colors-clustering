<script setup lang="ts">
import { Input } from '@/shared/ui/input'
import { useImageUploader } from '../model';

interface Emits {
  change: [file: File];
  reset: [];
}

const emit = defineEmits<Emits>()

const onChangeCallback = (file: File) => emit('change', file)
const onResetCallback = () => emit('reset')

const { onChange } = useImageUploader(onChangeCallback, onResetCallback)
</script>

<template>
  <Input
    placeholder="test"
    class="max-w-sm"
    type="file"
    accept="image/*"
    @change="onChange"
  />
</template>
