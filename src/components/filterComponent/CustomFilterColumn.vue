<template>
  <div
    class="w-full mx-auto border rounded-xl shadow bg-white max-h-[200px] overflow-auto"
    @click.stop
  >
    <div class="sticky top-0 bg-base-300 z-20 p-2 border-b flex flex-col justify-start items-start">
      <label>Search</label>
      <input v-model="searchTerm" type="text" class="input input-bordered input-xs w-full" />
    </div>
    <div class="flex flex-col">
      <div v-for="(item, index) in data" :key="index" class="flex items-center">
        <label class="label flex items-center gap-2 hover:bg-gray-50 p-2 cursor-pointer w-full">
          <input
            type="checkbox"
            class="checkbox checkbox-xs"
            :value="item"
            v-model="selectedItems"
          />
          {{ item }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { debounce } from 'lodash'

const props = defineProps<{ data: any[] }>()
const emit = defineEmits(['update:data'])

const data = ref<any[]>([])

const selectedItems = ref<any[]>([])
const searchTerm = ref('')

const doFilter = debounce((term: string) => {
  const search = term.toLowerCase()
  data.value = props.data.filter((item) => item.toLowerCase().includes(search))
}, 250) // รอ 250ms ก่อนทำ filter

onMounted(async () => {
  await nextTick(() => {
    data.value = [...new Set(props.data)]
    console.log('Mounted with data:', data.value)
  })
})
watch(
  () => props.data,
  (newData) => {
    data.value = [...new Set(newData)]
    console.log('Props data changed:', data.value)
  },
  { immediate: true },
)
watch(
  () => searchTerm.value,
  (newVal) => {
    if (!newVal) {
      data.value = [...props.data]
      return
    }
    doFilter(newVal)
  },
)
watch(selectedItems, (newVal) => {
  emit('update:data', newVal)
})
</script>

<style scoped></style>
