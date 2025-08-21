<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/vue'

const props = defineProps<{
  actions: { action: string; label: string }[]
  x: number
  y: number
}>()
const emit = defineEmits(['action-clicked'])

// refs สำหรับ floating-ui
const referenceEl = ref<HTMLElement | null>(null)
const floatingEl = ref<HTMLElement | null>(null)

// state floating-ui
const {
  x: fx,
  y: fy,
  strategy,
  update,
} = useFloating(referenceEl, floatingEl, {
  middleware: [offset(5), flip(), shift()],
  whileElementsMounted: autoUpdate,
})

// fake reference element: ใช้ div โปร่งใสไปวางตรงตำแหน่ง mouse
watch([() => props.x, () => props.y], () => {
  if (referenceEl.value) {
    referenceEl.value.style.left = props.x + 'px'
    referenceEl.value.style.top = props.y + 'px'
  }
})

const emitAction = (action: string) => {
  emit('action-clicked', action)
}
</script>

<template>
  <!-- invisible reference -->
  <div
    ref="referenceEl"
    class="absolute w-[1px] h-[1px] pointer-events-none"
    :style="{ left: x + 250 + 'px', top: y - 60 + 'px' }"
  ></div>

  <!-- floating menu -->
  <div
    ref="floatingEl"
    class="context-menu"
    :style="{ position: strategy, top: fy + 'px', left: fx + 'px' }"
  >
    <div
      v-for="action in actions"
      :key="action.action"
      class="p-1 cursor-pointer hover:bg-gray-200 text-center"
      @click="emitAction(action.action)"
    >
      {{ action.label }}
    </div>
  </div>
</template>

<style scoped>
.context-menu {
  min-width: 150px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  z-index: 9999;
}
</style>
