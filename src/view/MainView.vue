<template>
  <div class="flex flex-col">
    <Header @factory="factoryChange" @open-add-job-modal="openAddJobModal" />
    <ChartContent :factory="factory" />
  </div>
</template>

<script setup lang="ts">
import ChartContent from '@/components/ChartContent.vue'
import Header from '@/components/Header.vue'
import Loading from '@/components/LoadingComponent.vue'
import { me } from '@/lib/api/auth'
import { useLoadingStore } from '@/stores/LoadingStore'
import { useMaster } from '@/stores/masterStore'
import { useAuth } from '@/stores/userStore'
import { onMounted, ref } from 'vue'
const { setLoading } = useLoadingStore()
const user = useAuth()
const factory = ref<string>('')
const openModal = ref<boolean>(false)

const STORE_MASTER = useMaster()
onMounted(() => {
  // window.location.reload()
})
function openAddJobModal(val: boolean) {
  openModal.value = val
  console.log('Open Add Job Modal:', val)
}
function factoryChange(val: string) {
  factory.value = val
  STORE_MASTER.currentFactory = val
  console.log('Factory changed to:', STORE_MASTER.currentFactory)
}
</script>

<style scoped>
.box {
  width: 100px;
  height: 100px;
  background-color: #0cdcf7;
  border-radius: 5px;
}
</style>
