<template>
  <div
    class="flex fixed w-full top-0 left-0 z-10 bg-white border-b-1 border-gray-200 h-[60px] items-center justify-between px-4"
  >
    <div class="flex items-center">
      <span class="text-lg font-bold">Ai-Planing</span>
    </div>
    <div class="flex items-center space-x-4">
      <button
        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-700 hover:text-white cursor-pointer"
        @click="decreaseWidth"
      >
        <IconZoomOut />
      </button>
      <button
        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-700 hover:text-white cursor-pointer"
        @click="increaseWidth"
      >
        <IconZoomIn />
      </button>
      <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
        Refresh
      </button>
      <button class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer">
        Settings
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScheduleStore } from '@/stores/scheduleStore'
import { IconZoomIn, IconZoomOut } from '@tabler/icons-vue'
import { ref, watch } from 'vue'

const store = useScheduleStore()
const width = ref(store.minWidthHeader || 300)

function increaseWidth() {
  width.value += 600
}

function decreaseWidth() {
  width.value -= 600
}
watch(width, (newWidth) => {
  if (newWidth) {
    if (newWidth <= 300) {
      newWidth = 300
      width.value = 300
    }
    if (newWidth >= 3000) {
      newWidth = 3000
      width.value = 3000
    }
    store.minWidthHeader = newWidth
    console.log('New width:', store.minWidthHeader)
  }
})
</script>

<style scoped></style>
