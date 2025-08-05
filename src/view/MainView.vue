<template>
  <div class="flex flex-col">
    <Header />
    <ChartContent />
  </div>
</template>

<script setup lang="ts">
import ChartContent from '@/components/ChartContent.vue'
import Header from '@/components/Header.vue'
import Loading from '@/components/LoadingComponent.vue'
import { useLoadingStore } from '@/stores/LoadingStore'
import { onMounted } from 'vue'
const { isLoading } = useLoadingStore()

onMounted(() => {
  console.log(isLoading)
})
</script>

<style scoped>
.box {
  width: 100px;
  height: 100px;
  background-color: #0cdcf7;
  border-radius: 5px;
}
</style>
